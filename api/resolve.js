export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const url = decodeURIComponent(req.query.url || '').trim()

  if (!url) return res.status(400).json({ error: 'Missing url parameter.' })

  if (/tiktok\.com|vm\.tiktok\.com|vt\.tiktok\.com/i.test(url)) return resolveTikTok(url, res)
  if (/instagram\.com|instagr\.am/i.test(url)) {
    return res.status(422).json({ error: 'Instagram downloads are coming soon. Please paste a TikTok link instead.' })
  }
  if (/youtube\.com\/shorts|youtu\.be|youtube\.com\/watch/i.test(url)) return resolveYouTube(url, res)

  return res.status(400).json({ error: 'Unsupported URL. Please paste a TikTok link.' })
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

async function resolveYouTube(_url, res) {
  return res.status(422).json({
    error: 'YouTube Shorts are not supported yet. Paste a TikTok link instead.',
  })
}
