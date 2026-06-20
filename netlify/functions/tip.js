const Stripe = require('stripe')

exports.handler = async function (event) {
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders() }
  }
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders(), body: 'Method Not Allowed' }
  }

  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return { statusCode: 503, headers: corsHeaders(), body: JSON.stringify({ error: 'Payments not configured yet.' }) }
  }

  try {
    const stripe = Stripe(key)
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Support ClipSave ☕',
            description: 'Buy the developer a coffee — thank you for using ClipSave!',
          },
          unit_amount: 300, // $3.00
        },
        quantity: 1,
      }],
      success_url: 'https://polite-crumble-484b62.netlify.app/?thanks=1',
      cancel_url: 'https://polite-crumble-484b62.netlify.app/',
    })

    return {
      statusCode: 200,
      headers: { ...corsHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    }
  } catch (err) {
    return {
      statusCode: 500,
      headers: corsHeaders(),
      body: JSON.stringify({ error: err.message }),
    }
  }
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}
