// Proxy resolver for TikTok and Instagram video URLs.
// TikTok: uses tikwm.com public API (reliable, no auth needed).
// Instagram: attempts snapsave.app public endpoint (experimental — may fail for some URLs).

exports.handler = async function (event) {
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
  // tikwm.com sometimes returns relative paths like /video/media/play/...
  // Ensure all URLs are absolute before returning them.
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
      videoUrl: toAbs(d.hdplay || d.play) || null,   // no-watermark, prefer HD
      videoUrlWm: toAbs(d.wmplay) || null,            // with watermark (fallback)
      author: d.author?.nickname || d.author?.unique_id || '',
      duration: d.duration || null,
    })
  } catch (err) {
    return jsonRes(500, { error: 'TikTok resolution failed: ' + err.message })
  }
}

async function resolveInstagram(url) {
  // Instagram resolution is experimental. snapsave.app is a public scraping endpoint
  // and may break if the upstream service changes its format.
  try {
    const res = await fetch('https://snapsave.app/action.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://snapsave.app/',
        'Origin': 'https://snapsave.app',
      },
      body: new URLSearchParams({ url }).toString(),
    })

    const text = await res.text()

    // snapsave returns an HTML snippet; extract the first MP4 link
    const mp4Match = text.match(/href="(https:\/\/[^"]*\.mp4[^"]*)"/i)
    if (mp4Match) {
      return jsonRes(200, {
        platform: 'instagram',
        title: 'Instagram Video',
        thumbnail: null,
        videoUrl: mp4Match[1],
        author: '',
        duration: null,
      })
    }

    return jsonRes(422, {
      error: 'Could not extract this Instagram video. The post may be private, or try again in a moment.',
    })
  } catch (err) {
    return jsonRes(500, { error: 'Instagram resolution failed. Please try again.' })
  }
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
