import Stripe from 'stripe'

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')

  if (req.method === 'OPTIONS') return res.status(200).end()
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' })

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) return res.status(503).json({ error: 'Payments not configured yet.' })

  try {
    const stripe = Stripe(key)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Support ClipSave ☕', description: 'Buy the developer a coffee — thank you for using ClipSave!' },
          unit_amount: 300,
        },
        quantity: 1,
      }],
      success_url: `${req.headers.origin || 'https://clipsave.vercel.app'}/?thanks=1`,
      cancel_url: req.headers.origin || 'https://clipsave.vercel.app/',
    })
    return res.status(200).json({ url: session.url })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
