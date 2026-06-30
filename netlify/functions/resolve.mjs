// Proxy resolver for TikTok, Instagram, and YouTube Shorts video URLs.
// TikTok: tikwm.com public API.
// Instagram: scrapes the public embed page for public reels/posts (no auth needed).
// YouTube: youtubei.js (Innertube) with the ANDROID/MWEB client to get a muxed format.

import { Innertube, Platform } from 'youtubei.js'

Platform.shim.eval = async (data) => new Function(data.output)()

let ytClientPromise = null
function getYtClient() {
  if (!ytClientPromise) ytClientPromise = Innertube.create({ retrieve_player: true })
  return ytClientPromise
}

export const handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() }
  }

  const raw = event.queryStringParameters?.url || ''
  const url = decodeURIComponent(raw).trim()

  if (!url) {
    return jsonRes(400, { error: 'Missing url parameter.' })
  }

  if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url)) {
    return resolveTikTok(url)
  }

  if (/instagram\.com|instagr\.am/i.test(url)) {
    return resolveInstagram(url)
  }

  if (/youtube\.com\/shorts|youtu\.be|youtube\.com\/watch/i.test(url)) {
    return resolveYouTube(url)
  }

  return jsonRes(400, { error: 'Unsupported URL. Please paste a TikTok, Instagram, or YouTube Shorts link.' })
}

async function resolveTikTok(url) {
  const toAbs = (u) => (u && !u.startsWith('http') ? 'https://www.tikwm.com' + u : u)

  try {
    const res = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url, count: 12, cursor: 0, web: 1, hd: 1 }).toString(),
    })
    const json = await res.json()

    if (json.code !== 0 || !json.data) {
      return jsonRes(422, {
        error: json.msg || 'Could not resolve this TikTok video. Make sure the video is public and the link is correct.',
      })
    }

    const d = json.data
    return jsonRes(200, {
      platform: 'tiktok',
      title: d.title || 'TikTok Video',
      thumbnail: toAbs(d.cover) || null,
      videoUrl: toAbs(d.hdplay || d.play) || null,
      videoUrlWm: toAbs(d.wmplay) || null,
      author: d.author?.nickname || d.author?.unique_id || '',
      duration: d.duration || null,
    })
  } catch (err) {
    return jsonRes(500, { error: 'TikTok resolution failed: ' + err.message })
  }
}

async function resolveInstagram(url) {
  try {
    const m = url.match(/instagram\.com\/(p|reel|tv)\/([A-Za-z0-9_-]+)/i)
    if (!m) {
      return jsonRes(400, { error: 'Could not parse this Instagram link. Paste a link to a public reel or post.' })
    }
    const [, type, shortcode] = m

    const res = await fetch(`https://www.instagram.com/${type}/${shortcode}/embed/captioned/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })
    if (!res.ok) {
      return jsonRes(422, { error: 'Could not load this Instagram post. Make sure it is public.' })
    }
    const html = await res.text()

    const typename = extractIgField(html, /__typename\\":\\"(.*?)\\"/)
    if (typename === 'GraphSidecar') {
      return jsonRes(422, { error: 'This is a multi-photo/video carousel post. ClipSave currently supports single reels and videos only.' })
    }
    if (typename !== 'GraphVideo') {
      return jsonRes(422, { error: 'This Instagram post does not contain a video. Photo downloads are not supported yet.' })
    }

    const videoUrl = extractIgField(html, /video_url\\":\\"(.*?)\\"/)
    if (!videoUrl) {
      return jsonRes(422, { error: 'Could not extract this Instagram video. The post may be private or deleted.' })
    }
    const displayUrl = extractIgField(html, /display_url\\":\\"(.*?)\\"/)
    const author = extractIgField(html, /owner\\":\{[\s\S]*?username\\":\\"(.*?)\\"/)
    const caption = extractIgField(html, /edge_media_to_caption\\":\{\\"edges\\":\[\{\\"node\\":\{\\"text\\":\\"(.*?)\\"/)

    return jsonRes(200, {
      platform: 'instagram',
      title: caption ? caption.slice(0, 200) : 'Instagram Video',
      thumbnail: displayUrl || null,
      videoUrl,
      author: author || '',
      duration: null,
    })
  } catch (err) {
    return jsonRes(500, { error: 'Instagram resolution failed: ' + err.message })
  }
}

// Instagram's embed page double-escapes its embedded JSON (once as JSON, once
// to embed that JSON as a JS string literal), so unescape up to twice.
function unescapeIg(raw) {
  if (raw == null) return null
  let s = raw
  for (let i = 0; i < 2; i++) {
    try { s = JSON.parse('"' + s + '"') } catch { break }
  }
  return s
}

function extractIgField(html, pattern) {
  const m = html.match(pattern)
  return m ? unescapeIg(m[1]) : null
}

async function resolveYouTube(url) {
  try {
    const id = extractYouTubeId(url)
    if (!id) {
      return jsonRes(400, { error: 'Could not parse this YouTube link. Paste a YouTube Shorts or video link.' })
    }

    const yt = await getYtClient()
    let info
    try {
      info = await yt.getInfo(id, { client: 'ANDROID' })
    } catch {
      info = await yt.getInfo(id, { client: 'MWEB' })
    }

    const muxed = (info.streaming_data?.formats || []).filter((f) => f.has_audio && f.has_video)
    const best = muxed.sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))[0]
    if (!best) {
      return jsonRes(422, { error: 'Could not find a downloadable version of this YouTube video.' })
    }

    const videoUrl = (best.url || (await best.decipher(yt.session.player))).toString()
    const thumbs = info.basic_info.thumbnail || []

    return jsonRes(200, {
      platform: 'youtube',
      title: info.basic_info.title || 'YouTube Video',
      thumbnail: thumbs[thumbs.length - 1]?.url || null,
      videoUrl,
      author: info.basic_info.author || '',
      duration: info.basic_info.duration || null,
    })
  } catch (err) {
    return jsonRes(500, { error: 'YouTube resolution failed: ' + err.message })
  }
}

function extractYouTubeId(url) {
  const patterns = [
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/,
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
  ]
  for (const p of patterns) {
    const m = url.match(p)
    if (m) return m[1]
  }
  return null
}

function jsonRes(status, body) {
  return {
    statusCode: status,
    headers: corsHeaders(),
    body: JSON.stringify(body),
  }
}

function corsHeaders() {
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  }
}
