// ─── Cart Utilities ───────────────────────────────────────────────────────────
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

function getCartCount() {
  return getCart().reduce((sum, item) => sum + item.quantity, 0);
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

// ─── Plant Data ───────────────────────────────────────────────────────────────
const plants = [
  {
    id: 1,
    name: "Chinese Evergreen",
    price: 2999,
    image: "./assets/chinesevergreen.webp",
    category: "indoor",
    region: "tropical",
    difficulty: "medium",
    care: "Bright indirect light, moderate watering",
    light: "Medium to bright indirect light. Avoid direct sun.",
    water: "Water every 1–2 weeks, allowing soil to dry halfway between waterings.",
    humidity: "Prefers moderate to high humidity. Mist occasionally.",
    toxicity: "Toxic to cats and dogs if ingested.",
    size: "Grows up to 3 ft indoors.",
    origin: "Southeast Asia & New Guinea"
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    price: 3999,
    image: "./assets/FiddleLeafFig.jpg",
    category: "rare",
    region: "tropical",
    difficulty: "hard",
    care: "Bright filtered light, consistent watering",
    light: "Bright, filtered indirect light. Needs stable placement — hates being moved.",
    water: "Water every 7–10 days. Allow the top inch of soil to dry out first.",
    humidity: "Thrives in 30–65% humidity. Keep away from drafts and vents.",
    toxicity: "Mildly toxic to pets if ingested.",
    size: "Can grow 6–10 ft tall indoors with proper care.",
    origin: "Western Africa (rainforests)"
  },
  {
    id: 3,
    name: "Money Tree",
    price: 5999,
    image: "./assets/MoneyTree.jpg",
    category: "indoor",
    region: "tropical",
    difficulty: "easy",
    care: "Bright indirect sunlight, light watering",
    light: "Bright indirect light. Tolerates medium light but grows slower.",
    water: "Water thoroughly every 1–2 weeks. Let soil dry out between waterings.",
    humidity: "Tolerates average household humidity. No misting needed.",
    toxicity: "Non-toxic to cats, dogs, and humans. Pet-friendly! 🐾",
    size: "Typically 3–6 ft indoors.",
    origin: "Central and South America"
  },
  {
    id: 4,
    name: "Dieffenbachia",
    price: 1999,
    image: "./assets/Dieffenbachia.jpg",
    category: "indoor",
    region: "tropical",
    difficulty: "easy",
    care: "Low light tolerant, light watering",
    light: "Low to medium indirect light. One of the best plants for dim corners.",
    water: "Water every 1–2 weeks. Reduce watering in winter.",
    humidity: "Enjoys humidity but adapts well to average home conditions.",
    toxicity: "Toxic to pets and humans. Keep away from children and animals.",
    size: "Reaches 3–5 ft indoors.",
    origin: "Tropical Americas"
  }
];

// ─── Render Plants ────────────────────────────────────────────────────────────
function renderPlants(filteredPlants = plants) {
  const container = document.getElementById('plantsContainer');

  if (filteredPlants.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No plants match your filters.</p>
        <button class="buy-button secondary" onclick="clearFilters()">Clear Filters</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredPlants.map(plant => `
    <div class="plant-card glass-effect">
      <button class="plant-image-btn" onclick="openModal(${plant.id})" aria-label="View details for ${plant.name}">
        <div class="plant-image" style="background-image: url('${plant.image}')"></div>
      </button>
      <div class="plant-content">
        <h3 class="plant-title">${plant.name}</h3>
        <p class="plant-details">${plant.care}</p>
        <div class="plant-meta">
          <span class="difficulty ${plant.difficulty}">${plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}</span>
          <span class="region-badge">${plant.region.charAt(0).toUpperCase() + plant.region.slice(1)}</span>
        </div>
        <p class="plant-price">$${(plant.price / 100).toFixed(2)}</p>
        <div class="card-actions">
          <button class="buy-button secondary outline" onclick="openModal(${plant.id})">View Details</button>
          <button class="buy-button" onclick="addToCart(${plant.id})">Add to Cart</button>
        </div>
      </div>
    </div>
  `).join('');
}

// ─── Plant Detail Modal ───────────────────────────────────────────────────────
function openModal(plantId) {
  const plant = plants.find(p => p.id === plantId);
  if (!plant) return;

  const modal = document.getElementById('plantModal');
  const body = document.getElementById('modalBody');

  body.innerHTML = `
    <div class="modal-image" style="background-image: url('${plant.image}')"></div>
    <div class="modal-info">
      <div class="modal-header">
        <div>
          <h2 class="modal-title">${plant.name}</h2>
          <p class="modal-origin">Native to ${plant.origin}</p>
        </div>
        <p class="modal-price">$${(plant.price / 100).toFixed(2)}</p>
      </div>

      <div class="modal-badges">
        <span class="difficulty ${plant.difficulty}">${plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}</span>
        <span class="region-badge">${plant.region.charAt(0).toUpperCase() + plant.region.slice(1)}</span>
        <span class="size-badge">↕ ${plant.size}</span>
      </div>

      <div class="care-grid">
        <div class="care-card">
          <span class="care-icon">☀️</span>
          <h4>Light</h4>
          <p>${plant.light}</p>
        </div>
        <div class="care-card">
          <span class="care-icon">💧</span>
          <h4>Water</h4>
          <p>${plant.water}</p>
        </div>
        <div class="care-card">
          <span class="care-icon">🌫️</span>
          <h4>Humidity</h4>
          <p>${plant.humidity}</p>
        </div>
        <div class="care-card toxicity">
          <span class="care-icon">⚠️</span>
          <h4>Toxicity</h4>
          <p>${plant.toxicity}</p>
        </div>
      </div>

      <button class="buy-button modal-add-btn" onclick="addToCart(${plant.id}); closeModal();">
        Add to Cart — $${(plant.price / 100).toFixed(2)}
      </button>
    </div>
  `;

  modal.classList.add('open');
  document.body.classList.add('modal-open');
}

function closeModal() {
  const modal = document.getElementById('plantModal');
  modal.classList.remove('open');
  document.body.classList.remove('modal-open');
}

// ─── Cart Drawer ──────────────────────────────────────────────────────────────
function openCartDrawer() {
  renderCartDrawer();
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartDrawerOverlay').classList.add('open');
  document.body.classList.add('modal-open');
}

function closeCartDrawer() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartDrawerOverlay').classList.remove('open');
  document.body.classList.remove('modal-open');
}

function renderCartDrawer() {
  const cart = getCart();
  const itemsEl = document.getElementById('drawerItems');
  const footerEl = document.getElementById('drawerFooter');

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="drawer-empty">
        <p>Your cart is empty.</p>
        <p>Add some plants to get started!</p>
      </div>
    `;
    footerEl.innerHTML = '';
    return;
  }

  let subtotal = 0;
  itemsEl.innerHTML = cart.map(item => {
    subtotal += item.price * item.quantity;
    return `
      <div class="drawer-item">
        <img src="${item.image}" alt="${item.name}">
        <div class="drawer-item-details">
          <p class="drawer-item-name">${item.name}</p>
          <p class="drawer-item-price">$${(item.price / 100).toFixed(2)}</p>
          <div class="quantity-controls">
            <button class="qty-btn" onclick="drawerChangeQty(${item.id}, -1)" aria-label="Decrease">−</button>
            <span class="qty-value">${item.quantity}</span>
            <button class="qty-btn" onclick="drawerChangeQty(${item.id}, 1)" aria-label="Increase">+</button>
          </div>
        </div>
        <button class="remove-btn" onclick="drawerRemove(${item.id})" aria-label="Remove">Remove</button>
      </div>
    `;
  }).join('');

  footerEl.innerHTML = `
    <div class="drawer-subtotal">
      <span>Subtotal</span>
      <span>$${(subtotal / 100).toFixed(2)}</span>
    </div>
    <a href="./cart.html" class="buy-button">View Cart &amp; Checkout</a>
  `;
}

function drawerChangeQty(plantId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === plantId);
  if (!item) return;
  item.quantity += delta;
  if (item.quantity <= 0) {
    drawerRemove(plantId);
    return;
  }
  saveCart(cart);
  updateCartCount();
  renderCartDrawer();
}

function drawerRemove(plantId) {
  saveCart(getCart().filter(i => i.id !== plantId));
  updateCartCount();
  renderCartDrawer();
  showToast('Item removed.', 'info');
}

// ─── Filters ──────────────────────────────────────────────────────────────────
function filterPlants() {
  const name = document.getElementById('nameFilter').value.toLowerCase().trim();
  const region = document.getElementById('regionFilter').value;
  const category = document.getElementById('categoryFilter').value;
  const difficulty = document.getElementById('difficultyFilter').value;

  const filtered = plants.filter(plant =>
    plant.name.toLowerCase().includes(name) &&
    (!region || plant.region === region) &&
    (!category || plant.category === category) &&
    (!difficulty || plant.difficulty === difficulty)
  );

  renderPlants(filtered);
}

function clearFilters() {
  document.getElementById('nameFilter').value = '';
  document.getElementById('regionFilter').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('difficultyFilter').value = '';
  renderPlants();
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
function addToCart(plantId) {
  const plant = plants.find(p => p.id === plantId);
  if (!plant) return;

  const cart = getCart();
  const existing = cart.find(item => item.id === plant.id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id: plant.id, name: plant.name, price: plant.price, image: plant.image, quantity: 1 });
  }

  saveCart(cart);
  updateCartCount();
  showToast(`${plant.name} added to cart!`);
  openCartDrawer();
}

function updateCartCount() {
  const count = getCartCount();
  const cartBtn = document.getElementById('cartNavBtn');
  if (cartBtn) cartBtn.textContent = `Cart (${count})`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderPlants();

  document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('change', filterPlants);
    input.addEventListener('keyup', filterPlants);
  });

  updateCartCount();

  // Cart drawer nav button
  const cartNavBtn = document.getElementById('cartNavBtn');
  if (cartNavBtn) {
    cartNavBtn.addEventListener('click', e => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  // Modal close on overlay click
  document.getElementById('plantModal')?.addEventListener('click', e => {
    if (e.target === e.currentTarget) closeModal();
  });

  // Cart drawer overlay click
  document.getElementById('cartDrawerOverlay')?.addEventListener('click', closeCartDrawer);

  // Keyboard: Escape closes whatever is open
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      closeCartDrawer();
    }
  });

  // Auth nav
  const navLinks = document.querySelector('.nav-links');
  const loggedInUser = JSON.parse(sessionStorage.getItem('loggedInUser'));

  if (loggedInUser) {
    const welcomeSpan = document.createElement('span');
    welcomeSpan.className = 'nav-user';
    welcomeSpan.textContent = `Welcome, ${loggedInUser.name}`;
    navLinks.appendChild(welcomeSpan);

    const logoutLink = document.createElement('a');
    logoutLink.href = '#';
    logoutLink.textContent = 'Log Out';
    logoutLink.addEventListener('click', e => {
      e.preventDefault();
      sessionStorage.removeItem('loggedInUser');
      showToast('Logged out successfully.', 'info');
      setTimeout(() => location.reload(), 1200);
    });
    navLinks.appendChild(logoutLink);
  } else {
    const loginLink = document.createElement('a');
    loginLink.href = './login.html';
    loginLink.textContent = 'Log In';
    navLinks.appendChild(loginLink);
  }
});