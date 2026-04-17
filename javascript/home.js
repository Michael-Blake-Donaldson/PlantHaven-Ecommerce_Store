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
    care: "Bright indirect light, moderate watering"
  },
  {
    id: 2,
    name: "Fiddle Leaf Fig",
    price: 3999,
    image: "./assets/FiddleLeafFig.jpg",
    category: "rare",
    region: "tropical",
    difficulty: "hard",
    care: "Bright filtered light, consistent watering"
  },
  {
    id: 3,
    name: "Money Tree",
    price: 5999,
    image: "./assets/MoneyTree.jpg",
    category: "indoor",
    region: "tropical",
    difficulty: "easy",
    care: "Bright indirect sunlight, light watering"
  },
  {
    id: 4,
    name: "Dieffenbachia",
    price: 1999,
    image: "./assets/Dieffenbachia.jpg",
    category: "indoor",
    region: "tropical",
    difficulty: "easy",
    care: "Low light tolerant, light watering"
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
      <div class="plant-image" style="background-image: url('${plant.image}')"></div>
      <div class="plant-content">
        <h3 class="plant-title">${plant.name}</h3>
        <p class="plant-details">${plant.care}</p>
        <div class="plant-meta">
          <span class="difficulty ${plant.difficulty}">${plant.difficulty.charAt(0).toUpperCase() + plant.difficulty.slice(1)}</span>
          <span class="region-badge">${plant.region.charAt(0).toUpperCase() + plant.region.slice(1)}</span>
        </div>
        <p class="plant-price">$${(plant.price / 100).toFixed(2)}</p>
        <button class="buy-button" onclick="addToCart(${plant.id})">Add to Cart</button>
      </div>
    </div>
  `).join('');
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
}

function updateCartCount() {
  const count = getCartCount();
  const cartLink = document.getElementById('cartNavLink');
  if (cartLink) cartLink.textContent = `Cart (${count})`;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderPlants();

  document.querySelectorAll('.filter-input').forEach(input => {
    input.addEventListener('change', filterPlants);
    input.addEventListener('keyup', filterPlants);
  });

  updateCartCount();

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