const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Use the Service Role key server-side so RLS doesn't block inserts
const supabase = process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_KEY
  ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY)
  : null;

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const sig = event.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('STRIPE_WEBHOOK_SECRET not set — cannot verify webhook');
    return { statusCode: 500, body: 'Webhook secret not configured.' };
  }

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(event.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return { statusCode: 400, body: `Webhook error: ${err.message}` };
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    const session = stripeEvent.data.object;

    // Expand line items from the session
    let lineItems = [];
    try {
      const expanded = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ['line_items'],
      });
      lineItems = expanded.line_items.data.map(item => ({
        name: item.description,
        quantity: item.quantity,
        unit_amount: item.amount_total / item.quantity,
        total: item.amount_total,
      }));
    } catch (err) {
      console.error('Failed to expand line items:', err.message);
    }

    const order = {
      stripe_session_id: session.id,
      customer_email: session.customer_details?.email || null,
      amount_total: session.amount_total,
      currency: session.currency,
      payment_status: session.payment_status,
      items: lineItems,
      created_at: new Date().toISOString(),
    };

    if (supabase) {
      const { error } = await supabase.from('orders').insert([order]);
      if (error) console.error('Supabase insert error:', error.message);
      else console.log('Order saved:', session.id);
    } else {
      // Supabase not configured — just log for now
      console.log('Order completed (Supabase not configured):', JSON.stringify(order));
    }
  }

  return { statusCode: 200, body: JSON.stringify({ received: true }) };
};
