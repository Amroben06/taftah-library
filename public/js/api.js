const API = 'http://localhost:3000/api';

// ── Auth helpers ──────────────────────────────
function getToken() { return localStorage.getItem('token'); }
function getUser()  { return JSON.parse(localStorage.getItem('user') || 'null'); }
function isLoggedIn() { return !!getToken(); }
function isAdmin() { const u = getUser(); return u && u.role === 'admin'; }

function saveSession(data) {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}
function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/index.html';
}

// ── Fetch wrapper ─────────────────────────────
async function apiFetch(path, options = {}) {
  const token = getToken();
  const res = await fetch(API + path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: 'Bearer ' + token } : {}),
      ...(options.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'حدث خطأ');
  return data;
}

// ── API calls ─────────────────────────────────
const Auth = {
  register: (name, email, password) =>
    apiFetch('/auth/register', { method: 'POST', body: JSON.stringify({ name, email, password }) }),
  login: (email, password) =>
    apiFetch('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
};

const Books = {
  getAll:    (params = {}) => apiFetch('/books?' + new URLSearchParams(params)),
  getOne:    (id)          => apiFetch('/books/' + id),
  add:       (data)        => apiFetch('/books',      { method: 'POST',   body: JSON.stringify(data) }),
  update:    (id, data)    => apiFetch('/books/' + id, { method: 'PUT',    body: JSON.stringify(data) }),
  delete:    (id)          => apiFetch('/books/' + id, { method: 'DELETE' }),
  download:  (id)          => apiFetch('/books/' + id + '/download', { method: 'POST' }),
  review:    (id, r, c)    => apiFetch('/books/' + id + '/review', { method: 'POST', body: JSON.stringify({ rating: r, comment: c }) }),
  getReviews:(id)          => apiFetch('/books/' + id + '/reviews'),
};

const Users = {
  me:              ()       => apiFetch('/users/me'),
  update:          (name)   => apiFetch('/users/me',              { method: 'PUT',    body: JSON.stringify({ name }) }),
  getFavorites:    ()       => apiFetch('/users/me/favorites'),
  addFavorite:     (id)     => apiFetch('/users/me/favorites/' + id, { method: 'POST' }),
  removeFavorite:  (id)     => apiFetch('/users/me/favorites/' + id, { method: 'DELETE' }),
  getAll:          ()       => apiFetch('/users'),
  deleteUser:      (id)     => apiFetch('/users/' + id,           { method: 'DELETE' }),
};

// ── Toast ─────────────────────────────────────
function showToast(msg, type = 'info') {
  let t = document.getElementById('toast');
  if (!t) { t = document.createElement('div'); t.id = 'toast'; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = 'toast show ' + type;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

// ── Navbar injection ──────────────────────────
function renderNavbar() {
  const user = getUser();
  const nav = document.getElementById('nav-actions');
  if (!nav) return;
  if (user) {
    nav.innerHTML = `
      <span style="color:var(--gold-light);font-size:13px;">👤 ${user.name}</span>
      ${user.role === 'admin' ? '<a href="/admin.html" class="btn-ghost">لوحة التحكم</a>' : ''}
      <a href="/profile.html" class="btn-ghost">ملفي</a>
      <button class="btn-primary" onclick="logout()">خروج</button>`;
  } else {
    nav.innerHTML = `
      <button class="btn-ghost" onclick="openAuth('login')">تسجيل الدخول</button>
      <button class="btn-primary" onclick="openAuth('register')">إنشاء حساب</button>`;
  }
}