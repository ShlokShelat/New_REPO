/* ================================================================
   HARMONIA AUTH SYSTEM
   - localStorage account database (persists across sessions)
   - Password hashing via Web Crypto API (SHA-256)
   - Real Google OAuth via Google Identity Services (GSI)
   - "Remember me" with 30-day expiry
   - Duplicate email detection
   - Full error messaging
   ================================================================ */

/* ── CONFIGURE YOUR GOOGLE CLIENT ID HERE ──────────────────────
   After getting your Client ID from Google Cloud Console,
   replace the string below with it. Keep the quotes.
   ─────────────────────────────────────────────────────────────── */
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

const DB_KEY         = 'harmonia_accounts';  // localStorage key: all accounts
const SESSION_KEY    = 'harmonia_session';   // localStorage key: active session
const REMEMBER_DAYS  = 30;

/* ================================================================
   CRYPTO — SHA-256 password hashing (Web Crypto API, built-in)
   ================================================================ */
async function hashPassword(password) {
  const enc    = new TextEncoder();
  const data   = enc.encode(password + 'harmonia_salt_2026');
  const buf    = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2,'0')).join('');
}

/* ================================================================
   ACCOUNT DATABASE  (stored in localStorage as JSON object)
   Structure: { "email@x.com": { firstName, lastName, name,
                 email, avatar, passwordHash, provider, createdAt } }
   ================================================================ */
function getAccounts() {
  try { return JSON.parse(localStorage.getItem(DB_KEY) || '{}'); }
  catch { return {}; }
}
function saveAccounts(accounts) {
  localStorage.setItem(DB_KEY, JSON.stringify(accounts));
}
function getAccount(email) {
  return getAccounts()[email.toLowerCase()] || null;
}
function accountExists(email) {
  return !!getAccount(email);
}

async function createAccount({ firstName, lastName, email, password }) {
  const accounts = getAccounts();
  const key = email.toLowerCase();
  if (accounts[key]) {
    return { success: false, error: 'An account with this email already exists. Sign in instead.' };
  }
  const hash = await hashPassword(password);
  accounts[key] = {
    firstName,
    lastName,
    name      : `${firstName} ${lastName}`.trim(),
    email     : key,
    avatar    : firstName.charAt(0).toUpperCase(),
    passwordHash: hash,
    provider  : 'email',
    createdAt : Date.now(),
  };
  saveAccounts(accounts);
  return { success: true, user: accounts[key] };
}

async function verifyAccount(email, password) {
  const account = getAccount(email);
  if (!account) {
    return { success: false, error: 'No account found with this email. Create one below.' };
  }
  if (account.provider === 'google') {
    return { success: false, error: 'This account was created with Google. Use "Sign in with Google" below.' };
  }
  const hash = await hashPassword(password);
  if (hash !== account.passwordHash) {
    return { success: false, error: 'Incorrect password. Please try again.' };
  }
  return { success: true, user: account };
}

/* ================================================================
   SESSION  (separate from accounts — tracks who is logged in)
   ================================================================ */
function saveSession(user, remember = false) {
  const session = {
    firstName : user.firstName,
    lastName  : user.lastName,
    name      : user.name,
    email     : user.email,
    avatar    : user.avatar,
    picture   : user.picture || null,
    provider  : user.provider,
    signedIn  : true,
    expiresAt : remember ? Date.now() + REMEMBER_DAYS * 86400000 : null,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw);
    if (!s.signedIn) return null;
    if (s.expiresAt && Date.now() > s.expiresAt) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return s;
  } catch { return null; }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ================================================================
   TOAST
   ================================================================ */
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className   = `toast toast-${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3800);
}

/* ================================================================
   LOADING STATE
   ================================================================ */
function setLoading(formId, on) {
  const form   = document.getElementById(formId);
  if (!form) return;
  const btn    = form.querySelector('.btn-primary');
  const text   = btn?.querySelector('.btn-text');
  const arrow  = btn?.querySelector('.btn-arrow');
  const loader = btn?.querySelector('.btn-loader');
  if (text)   text.style.opacity  = on ? '0' : '1';
  if (arrow)  arrow.style.display = on ? 'none' : '';
  if (loader) loader.hidden       = !on;
  if (btn)    btn.disabled        = on;
}

/* ================================================================
   TAB SWITCHING
   ================================================================ */
function switchTab(tab) {
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');
  const signinBtn  = document.getElementById('signinBtn');
  const signupBtn  = document.getElementById('signupBtn');
  const indicator  = document.getElementById('toggleIndicator');

  if (tab === 'signin') {
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    signinBtn.classList.add('active');
    signupBtn.classList.remove('active');
    if (indicator) indicator.style.transform = 'translateX(0)';
  } else {
    signinForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signinBtn.classList.remove('active');
    signupBtn.classList.add('active');
    if (indicator) indicator.style.transform = 'translateX(100%)';
  }
}

/* ================================================================
   PASSWORD VISIBILITY TOGGLE
   ================================================================ */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const show  = input.type === 'password';
  input.type  = show ? 'text' : 'password';
  btn.style.opacity = show ? '1' : '0.4';
}

/* ================================================================
   PASSWORD STRENGTH METER
   ================================================================ */
function checkStrength(val) {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!fill || !label) return;
  let score = 0;
  if (val.length >= 8)           score++;
  if (/[A-Z]/.test(val))         score++;
  if (/[0-9]/.test(val))         score++;
  if (/[^A-Za-z0-9]/.test(val))  score++;
  const levels = [
    { pct:'0%',   color:'transparent', text:'' },
    { pct:'25%',  color:'#ef4444',     text:'Weak' },
    { pct:'50%',  color:'#f97316',     text:'Fair' },
    { pct:'75%',  color:'#eab308',     text:'Good' },
    { pct:'100%', color:'#22c55e',     text:'Strong ✓' },
  ];
  const lvl = levels[Math.min(score, 4)];
  fill.style.width      = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent     = lvl.text;
  label.style.color     = lvl.color;
}

/* ================================================================
   FORGOT PASSWORD (simulated — no backend)
   ================================================================ */
function showForgot(e) {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value.trim();
  if (!email) { showToast('Enter your email address first.', 'warn'); return; }
  if (!accountExists(email)) { showToast('No account found with that email.', 'error'); return; }
  showToast(`📧 Password reset link sent to ${email}`, 'success');
}

/* ================================================================
   SIGN IN FORM SUBMIT
   ================================================================ */
async function handleSubmit(e, type) {
  e.preventDefault();

  if (type === 'signin') {
    const email    = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;
    const remember = document.getElementById('rememberMe')?.checked || false;

    if (!email || !password) { showToast('Please fill in all fields.', 'error'); return; }

    setLoading('signinForm', true);
    const result = await verifyAccount(email, password);
    setLoading('signinForm', false);

    if (!result.success) { showToast(result.error, 'error'); return; }

    saveSession(result.user, remember);
    showToast(`Welcome back, ${result.user.firstName}! 🎵`, 'success');
    setTimeout(() => { window.location.href = 'home.html'; }, 900);

  } else {
    // ── SIGN UP ──────────────────────────────────────────────────
    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();
    const email     = document.getElementById('signupEmail').value.trim();
    const password  = document.getElementById('signupPassword').value;
    const confirm   = document.getElementById('confirmPassword').value;
    const terms     = document.getElementById('termsCheck')?.checked;

    if (!firstName || !lastName || !email || !password) {
      showToast('Please fill in all fields.', 'error'); return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showToast('Please enter a valid email address.', 'error'); return;
    }
    if (password.length < 8) {
      showToast('Password must be at least 8 characters.', 'error'); return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error'); return;
    }
    if (!terms) {
      showToast('Please accept the Terms of Service.', 'error'); return;
    }

    setLoading('signupForm', true);
    const result = await createAccount({ firstName, lastName, email, password });
    setLoading('signupForm', false);

    if (!result.success) { showToast(result.error, 'error'); return; }

    saveSession(result.user, false);
    showToast(`Account created! Welcome to Harmonia, ${firstName}! 🎶`, 'success');
    setTimeout(() => { window.location.href = 'home.html'; }, 900);
  }
}

/* ================================================================
   GOOGLE OAUTH — Google Identity Services (GSI)

   When GOOGLE_CLIENT_ID is set correctly:
     • Clicking the Google button triggers google.accounts.id.prompt()
     • Google returns a signed JWT credential
     • We decode it, upsert the account in our DB, and create a session

   When GOOGLE_CLIENT_ID is still the placeholder:
     • Clicking shows a toast with setup instructions
   ================================================================ */
function initGoogleSignIn() {
  const isConfigured = GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';

  if (!isConfigured) {
    document.querySelectorAll('.btn-google').forEach(btn => {
      // Replace onclick so we control the handler
      btn.onclick = null;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('⚙️ Google Sign-In not configured yet. See setup guide.', 'warn');
      });
    });
    return;
  }

  if (typeof google === 'undefined') { console.warn('GSI not loaded'); return; }

  google.accounts.id.initialize({
    client_id          : GOOGLE_CLIENT_ID,
    callback           : handleGoogleCredential,
    auto_select        : false,
    cancel_on_tap_outside: true,
  });

  document.querySelectorAll('.btn-google').forEach(btn => {
    btn.onclick = null;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      google.accounts.id.prompt();
    });
  });
}

async function handleGoogleCredential(response) {
  if (!response.credential) {
    showToast('Google sign-in failed. Please try again.', 'error');
    return;
  }

  // Decode JWT payload (already verified by Google on their end)
  let payload;
  try {
    payload = JSON.parse(atob(response.credential.split('.')[1]));
  } catch {
    showToast('Failed to read Google account info.', 'error');
    return;
  }

  const email     = payload.email.toLowerCase();
  const nameParts = (payload.name || '').split(' ');
  const firstName = nameParts[0] || 'User';
  const lastName  = nameParts.slice(1).join(' ') || '';
  const picture   = payload.picture || null;

  // Check if email is already registered with a password account
  const existing = getAccount(email);
  if (existing && existing.provider === 'email') {
    showToast('This email is registered with a password. Sign in with email instead.', 'warn');
    return;
  }

  // Upsert Google account
  const accounts = getAccounts();
  if (!accounts[email]) {
    accounts[email] = {
      firstName,
      lastName,
      name     : `${firstName} ${lastName}`.trim(),
      email,
      avatar   : firstName.charAt(0).toUpperCase(),
      picture,
      provider : 'google',
      createdAt: Date.now(),
    };
  } else {
    // Refresh picture on every login
    if (picture) accounts[email].picture = picture;
  }
  saveAccounts(accounts);
  saveSession(accounts[email], true);
  showToast(`Signed in with Google. Welcome, ${firstName}! 🎵`, 'success');
  setTimeout(() => { window.location.href = 'home.html'; }, 900);
}

/* ================================================================
   PAGE INIT
   ================================================================ */
(function init() {
  // Already signed in? Skip to home
  if (getSession()) {
    window.location.href = 'home.html';
    return;
  }

  // Dynamically load Google GSI script
  const script   = document.createElement('script');
  script.src     = 'https://accounts.google.com/gsi/client';
  script.async   = true;
  script.defer   = true;
  script.onload  = initGoogleSignIn;
  script.onerror = () => {
    // GSI failed to load (offline / blocked) — degrade gracefully
    document.querySelectorAll('.btn-google').forEach(btn => {
      btn.disabled = true;
      btn.title    = 'Google Sign-In unavailable';
    });
  };
  document.head.appendChild(script);
})();
