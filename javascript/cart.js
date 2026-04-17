// ─── Cart Utilities ───────────────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function showToast(message, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  requestAnimationFrame(() => toast.classList.add('toast-visible'));
  setTimeout(() => {
    toast.classList.remove('toast-visible');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ─── Render Cart ──────────────────────────────────────────────────────────────
function renderCart() {
  const cart = getCart();
  const cartItemsContainer = document.getElementById('cartItems');
  const cartTotalContainer = document.getElementById('cartTotal');
  const checkoutButton = document.getElementById('checkoutButton');

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-msg">
        <p>Your cart is empty.</p>
        <a href="./home.html" class="buy-button">Start Shopping</a>
      </div>
    `;
    cartTotalContainer.innerHTML = '';
    checkoutButton.style.display = 'none';
    return;
  }

  let subtotal = 0;
  cartItemsContainer.innerHTML = cart.map(item => {
    subtotal += item.price * item.quantity;
    return `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.name}">
        <div class="cart-item-details">
          <h3 class="cart-item-title">${item.name}</h3>
          <p class="cart-item-price">$${(item.price / 100).toFixed(2)} each</p>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="changeQuantity(${item.id}, -1)" aria-label="Decrease quantity">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="changeQuantity(${item.id}, 1)" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="removeItem(${item.id})" aria-label="Remove from cart">Remove</button>
      </div>
    `;
  }).join('');

  cartTotalContainer.innerHTML = `
    <div class="summary-row"><span>Subtotal</span><span>$${(subtotal / 100).toFixed(2)}</span></div>
    <div class="summary-row"><span>Shipping</span><span>Calculated at checkout</span></div>
    <div class="summary-total"><span>Total</span><span>$${(subtotal / 100).toFixed(2)}</span></div>
  `;

  checkoutButton.style.display = 'block';
}

// ─── Quantity & Remove ────────────────────────────────────────────────────────
function changeQuantity(plantId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === plantId);
  if (!item) return;

  item.quantity += delta;
  if (item.quantity <= 0) {
    removeItem(plantId);
    return;
  }

  saveCart(cart);
  renderCart();
}

function removeItem(plantId) {
  const cart = getCart().filter(i => i.id !== plantId);
  saveCart(cart);
  renderCart();
  showToast('Item removed from cart.', 'info');
}

// ─── Checkout ─────────────────────────────────────────────────────────────────
async function initiateCheckout() {
  const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));
  if (!loggedInUser) {
    showToast('Please log in to proceed to checkout.', 'error');
    setTimeout(() => { window.location.href = './login.html?returnTo=./cart.html'; }, 1500);
    return;
  }

  const cart = getCart();
  if (cart.length === 0) return;

  const btn = document.getElementById('checkoutButton');
  btn.disabled = true;
  btn.textContent = 'Redirecting…';

  try {
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cart.map(item => ({ id: item.id, quantity: item.quantity }))),
    });

    if (!response.ok) {
      throw new Error(await response.text());
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (err) {
    console.error('Checkout error:', err);
    showToast('Checkout failed. Please try again.', 'error');
    btn.disabled = false;
    btn.textContent = 'Proceed to Checkout';
  }
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  document.getElementById('checkoutButton').addEventListener('click', initiateCheckout);
});
