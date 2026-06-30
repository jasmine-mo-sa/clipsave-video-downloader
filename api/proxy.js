export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()

  const url = decodeURIComponent(req.query.url || '').trim()
  const rawFilename = req.query.filename || 'video.mp4'
  const filename = rawFilename.replace(/[^\x20-\x7E]/g, '_')

  if (!url || !url.startsWith('http')) {
    return res.status(400).send('Missing or invalid url')
  }

  try {
    const isTikwm = url.includes('tikwm.com')
    const isInstagram = url.includes('instagram.com') || url.includes('cdninstagram.com') || url.includes('fbcdn.net')
    const isYouTube = url.includes('googlevideo.com')
    const referer = isTikwm ? 'https://www.tikwm.com/' : isInstagram ? 'https://www.instagram.com/' : isYouTube ? 'https://www.youtube.com/' : 'https://www.tiktok.com/'
    const origin  = isTikwm ? 'https://www.tikwm.com'  : isInstagram ? 'https://www.instagram.com'  : isYouTube ? 'https://www.youtube.com'  : 'https://www.tiktok.com'

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        'Referer': referer,
        'Origin': origin,
        'Accept': 'video/mp4,video/*;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
    })

    if (!response.ok) {
      return res.status(response.status).send('Failed to fetch video from source')
    }

    const contentType = response.headers.get('content-type') || 'video/mp4'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    res.setHeader('Content-Type', contentType)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Length', String(buffer.length))
    res.setHeader('Cache-Control', 'no-store')
    return res.status(200).send(buffer)
  } catch (err) {
    return res.status(500).send('Proxy error: ' + err.message)
  }
}
