const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Server-side product catalog — prices are defined here, NOT sent by the client.
// This prevents price tampering: a buyer can never change what they pay.
const PRODUCTS = {
  1: { name: 'Chinese Evergreen', price: 2999 },
  2: { name: 'Fiddle Leaf Fig',   price: 3999 },
  3: { name: 'Money Tree',        price: 5999 },
  4: { name: 'Dieffenbachia',     price: 1999 },
};

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  let cart;
  try {
    cart = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: 'Invalid request body.' };
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return { statusCode: 400, body: 'Cart is empty.' };
  }

  const lineItems = [];

  for (const item of cart) {
    const product = PRODUCTS[item.id];
    if (!product) {
      return { statusCode: 400, body: `Unknown product id: ${item.id}` };
    }
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 99) {
      return { statusCode: 400, body: 'Invalid item quantity.' };
    }
    lineItems.push({
      price_data: {
        currency: 'usd',
        product_data: { name: product.name },
        unit_amount: product.price, // Always use server-side price
      },
      quantity: item.quantity,
    });
  }

  // Determine site origin for redirect URLs
  const origin =
    event.headers.origin ||
    (event.headers.referer ? new URL(event.headers.referer).origin : null) ||
    process.env.URL || // Netlify sets this automatically
    'http://localhost:8888';

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart.html`,
    });

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: session.url }),
    };
  } catch (err) {
    console.error('Stripe error:', err.message);
    return { statusCode: 500, body: 'Payment setup failed. Please try again.' };
  }
};
