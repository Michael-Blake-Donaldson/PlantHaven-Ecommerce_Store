const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sessionId = event.queryStringParameters?.session_id;

  // Validate session ID format to prevent probing other resources
  if (!sessionId || !sessionId.startsWith('cs_')) {
    return { statusCode: 400, body: 'Invalid session ID.' };
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return { statusCode: 503, body: 'Payment service not configured.' };
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items'],
    });

    const order = {
      orderId: session.id.slice(-8).toUpperCase(),
      total: session.amount_total,
      currency: session.currency,
      customerEmail: session.customer_details?.email || null,
      customerName: session.customer_details?.name || null,
      items: (session.line_items?.data || []).map(item => ({
        name: item.description,
        quantity: item.quantity,
        amount: item.amount_total,
      })),
    };

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order),
    };
  } catch (err) {
    console.error('Stripe get-order error:', err.message);
    return { statusCode: 500, body: 'Could not retrieve order details.' };
  }
};
