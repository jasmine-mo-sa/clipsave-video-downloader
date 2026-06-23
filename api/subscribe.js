export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const email = req.body?.email
  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return res.status(400).json({ error: 'Valid email required' })
  }

  const resendKey = process.env.RESEND_API_KEY
  const audienceId = process.env.RESEND_AUDIENCE_ID

  if (!resendKey || !audienceId) {
    console.log('NEW_LEAD_EMAIL:', email)
    return res.status(200).json({ ok: true })
  }

  try {
    const response = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.trim().toLowerCase(), unsubscribed: false }),
    })

    if (!response.ok) {
      console.error('Resend error:', await response.text())
      return res.status(500).json({ error: 'Failed to subscribe' })
    }

    console.log('NEW_LEAD_EMAIL:', email)
    return res.status(200).json({ ok: true })
  } catch (err) {
    console.error('Subscribe error:', err)
    return res.status(500).json({ error: 'Server error' })
  }
}
