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
function getSafeReturnUrl() {
  const params = new URLSearchParams(window.location.search);
  const returnTo = params.get('returnTo');
  if (returnTo && /^\.(\/[\w.\-]+)+\.html$/.test(returnTo)) return returnTo;
  return './home.html';
}

// ─── Set loading state on submit button ──────────────────────────────────────
function setLoading(form, loading) {
  const btn = form.querySelector('button[type="submit"]');
  if (!btn) return;
  btn.disabled = loading;
  btn.textContent = loading ? 'Please wait…' : btn.dataset.label;
}

// ─── Sign Up ──────────────────────────────────────────────────────────────────
const signupForm = document.getElementById('signupForm');
signupForm?.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!this.dataset.label) this.querySelector('button[type="submit"]').dataset.label = 'Create Account';

  const name  = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  if (password.length < 8) {
    showToast('Password must be at least 8 characters.', 'error');
    return;
  }

  setLoading(this, true);

  // ── Supabase path ──────────────────────────────────────────────────────────
  if (window.supabaseClient) {
    const { data, error } = await window.supabaseClient.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    setLoading(this, false);

    if (error) {
      showToast(error.message, 'error');
      return;
    }

    // Supabase sends a confirmation email by default.
    showToast('Account created! Check your email to confirm, then log in.');
    setTimeout(() => { window.location.href = './login.html'; }, 2500);
    return;
  }

  // ── localStorage fallback (prototype mode) ─────────────────────────────────
  const users = JSON.parse(localStorage.getItem('users')) || [];
  if (users.some(u => u.email === email)) {
    setLoading(this, false);
    showToast('An account with that email already exists.', 'error');
    return;
  }
  users.push({ name, email, password });
  localStorage.setItem('users', JSON.stringify(users));
  setLoading(this, false);
  showToast('Account created! Redirecting to login…');
  setTimeout(() => { window.location.href = './login.html'; }, 1500);
});

// ─── Log In ───────────────────────────────────────────────────────────────────
const loginForm = document.getElementById('loginForm');
loginForm?.addEventListener('submit', async function (e) {
  e.preventDefault();
  if (!this.querySelector('button[type="submit"]').dataset.label) {
    this.querySelector('button[type="submit"]').dataset.label = 'Log In';
  }

  const email    = document.getElementById('email').value.trim().toLowerCase();
  const password = document.getElementById('password').value;

  setLoading(this, true);

  // ── Supabase path ──────────────────────────────────────────────────────────
  if (window.supabaseClient) {
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password });

    setLoading(this, false);

    if (error) {
      showToast('Invalid email or password.', 'error');
      return;
    }

    const name = data.user.user_metadata?.full_name || email.split('@')[0];
    sessionStorage.setItem('loggedInUser', JSON.stringify({ name, email }));
    showToast(`Welcome back, ${name}!`);
    setTimeout(() => { window.location.href = getSafeReturnUrl(); }, 1000);
    return;
  }

  // ── localStorage fallback (prototype mode) ─────────────────────────────────
  const users = JSON.parse(localStorage.getItem('users')) || [];
  const user = users.find(u => u.email === email && u.password === password);

  setLoading(this, false);

  if (!user) {
    showToast('Invalid email or password.', 'error');
    return;
  }

  sessionStorage.setItem('loggedInUser', JSON.stringify({ name: user.name, email: user.email }));
  showToast(`Welcome back, ${user.name}!`);
  setTimeout(() => { window.location.href = getSafeReturnUrl(); }, 1000);
});

