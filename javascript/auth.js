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

// ─── Safe Return URL ──────────────────────────────────────────────────────────
// Prevents open-redirect attacks by only allowing relative paths
function getSafeReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  if (returnTo && /^\.(\/[\w.\-]+)+\.html$/.test(returnTo)) return returnTo;
  return './home.html';
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
document.getElementById('signupForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (password.length < 8) {
    showToast('Password must be at least 8 characters.', 'error');
    return;
  }

  const users = JSON.parse(localStorage.getItem('users')) || [];

  if (users.some(user => user.email === email)) {
    showToast('An account with that email already exists.', 'error');
    return;
  }

  // NOTE: passwords are stored in plaintext here for prototype purposes only.
  // Phase 2 will replace this entire auth system with Supabase Auth,
  // which handles secure password hashing and email verification.
  users.push({ name, email, password });
  localStorage.setItem('users', JSON.stringify(users));

  showToast('Account created! Redirecting to login…');
  setTimeout(() => { window.location.href = './login.html'; }, 1500);
});

// ─── Log In ───────────────────────────────────────────────────────────────────
document.getElementById('loginForm')?.addEventListener('submit', function (e) {
  e.preventDefault();

  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);

  if (!user) {
    showToast('Invalid email or password.', 'error');
    return;
  }

  // Store only non-sensitive info — never store the password in sessionStorage
  sessionStorage.setItem('loggedInUser', JSON.stringify({ name: user.name, email: user.email }));

  showToast(`Welcome back, ${user.name}!`);
  setTimeout(() => { window.location.href = getSafeReturnUrl(); }, 1000);
});

