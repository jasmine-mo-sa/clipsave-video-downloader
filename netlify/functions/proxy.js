// Proxy function: streams a remote video through Netlify so the browser
// can download it (cross-origin `a.download` is blocked by CORS).
// Called as: /.netlify/functions/proxy?url=<encoded-video-url>&filename=video.mp4

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() }
  }

  const raw = event.queryStringParameters?.url || ''
  const url = decodeURIComponent(raw).trim()
  const filename = event.queryStringParameters?.filename || 'video.mp4'

  if (!url || !url.startsWith('http')) {
    return { statusCode: 400, headers: corsHeaders(), body: 'Missing or invalid url' }
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.tiktok.com/',
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
