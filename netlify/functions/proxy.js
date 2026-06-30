// Proxy function: streams a remote video through Netlify so the browser
// can download it (cross-origin `a.download` is blocked by CORS).
// Called as: /.netlify/functions/proxy?url=<encoded-video-url>&filename=video.mp4

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() }
  }

  const raw = event.queryStringParameters?.url || ''
  const url = decodeURIComponent(raw).trim()
  // Strip non-ASCII so Content-Disposition header is always valid
  const rawFilename = event.queryStringParameters?.filename || 'video.mp4'
  const filename = rawFilename.replace(/[^\x20-\x7E]/g, '_')

  if (!url || !url.startsWith('http')) {
    return { statusCode: 400, headers: corsHeaders(), body: 'Missing or invalid url' }
  }

  try {
    const isTikwm = url.includes('tikwm.com')
    const isInstagram = url.includes('instagram.com') || url.includes('cdninstagram.com') || url.includes('fbcdn.net')
    const isYouTube = url.includes('googlevideo.com')
    const referer = isTikwm ? 'https://www.tikwm.com/' : isInstagram ? 'https://www.instagram.com/' : isYouTube ? 'https://www.youtube.com/' : 'https://www.tiktok.com/'
    const origin  = isTikwm ? 'https://www.tikwm.com'  : isInstagram ? 'https://www.instagram.com' : isYouTube ? 'https://www.youtube.com'  : 'https://www.tiktok.com'

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
      return {
        statusCode: response.status,
        headers: corsHeaders(),
        body: 'Failed to fetch video from source',
      }
    }

    const contentType = response.headers.get('content-type') || 'video/mp4'
    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    return {
      statusCode: 200,
      headers: {
        ...corsHeaders(),
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': String(buffer.length),
        'Cache-Control': 'no-store',
      },
      body: buffer.toString('base64'),
      isBase64Encoded: true,
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: 'Proxy error: ' + err.message,
    }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  }
}
