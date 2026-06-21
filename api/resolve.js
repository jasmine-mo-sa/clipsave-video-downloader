export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const url = decodeURIComponent(req.query.url || '').trim()

  if (!url) return res.status(400).json({ error: 'Missing url parameter.' })

  if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url)) return resolveTikTok(url, res)
  if (/instagram\.com|instagr\.am/i.test(url)) return resolveInstagram(url, res)
  if (/youtube\.com\/shorts|youtu\.be|youtube\.com\/watch/i.test(url)) return resolveYouTube(url, res)

  return res.status(400).json({ error: 'Unsupported URL. Please paste a TikTok, Instagram, or YouTube Shorts link.' })
}

async function resolveTikTok(url, res) {
  const toAbs = (u) => (u && !u.startsWith('http') ? 'https://www.tikwm.com' + u : u)
  try {
    const r = await fetch('https://www.tikwm.com/api/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ url, count: 12, cursor: 0, web: 1, hd: 1 }).toString(),
    })
    const json = await r.json()
    if (json.code !== 0 || !json.data) {
      return res.status(422).json({ error: json.msg || 'Could not resolve this TikTok video. Make sure the video is public.' })
    }
    const d = json.data
    return res.status(200).json({
      platform: 'tiktok',
      title: d.title || 'TikTok Video',
      thumbnail: toAbs(d.cover) || null,
      videoUrl: toAbs(d.hdplay || d.play) || null,
      videoUrlWm: toAbs(d.wmplay) || null,
      author: d.author?.nickname || d.author?.unique_id || '',
      duration: d.duration || null,
    })
  } catch (err) {
    return res.status(500).json({ error: 'TikTok resolution failed: ' + err.message })
  }
}

async function resolveInstagram(url, res) {
  try {
    const r = await fetch('https://snapsave.app/action.php', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://snapsave.app/',
        'Origin': 'https://snapsave.app',
      },
      body: new URLSearchParams({ url }).toString(),
    })
    const text = await r.text()
    const mp4Match = text.match(/href="(https:\/\/[^"]*\.mp4[^"]*)"/i)
    if (mp4Match) {
      return res.status(200).json({ platform: 'instagram', title: 'Instagram Video', thumbnail: null, videoUrl: mp4Match[1], author: '', duration: null })
    }
    return res.status(422).json({ error: 'Could not extract this Instagram video. The post may be private, or try again in a moment.' })
  } catch {
    return res.status(500).json({ error: 'Instagram resolution failed. Please try again.' })
  }
}

async function resolveYouTube(_url, res) {
  return res.status(422).json({
    error: 'YouTube Shorts are not supported yet. Paste a TikTok or Instagram link instead.',
  })
}
