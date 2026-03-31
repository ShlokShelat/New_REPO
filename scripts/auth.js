/* ===== TAB SWITCH ===== */
function switchTab(tab) {
  const indicator  = document.getElementById('toggleIndicator');
  const signinBtn  = document.getElementById('signinBtn');
  const signupBtn  = document.getElementById('signupBtn');
  const signinForm = document.getElementById('signinForm');
  const signupForm = document.getElementById('signupForm');

  if (tab === 'signin') {
    signinBtn.classList.add('active');
    signupBtn.classList.remove('active');
    indicator.classList.remove('right');
    signinForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
  } else {
    signupBtn.classList.add('active');
    signinBtn.classList.remove('active');
    indicator.classList.add('right');
    signupForm.classList.remove('hidden');
    signinForm.classList.add('hidden');
  }
}

/* ===== PASSWORD VISIBILITY ===== */
function togglePw(id, btn) {
  const input = document.getElementById(id);
  const isText = input.type === 'text';
  input.type = isText ? 'password' : 'text';
  btn.innerHTML = isText
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`;
}

/* ===== PASSWORD STRENGTH ===== */
function checkStrength(pw) {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;

  const levels = [
    { w: '0%',   color: 'transparent', text: '' },
    { w: '25%',  color: '#ef4444',     text: 'Weak' },
    { w: '50%',  color: '#f97316',     text: 'Fair' },
    { w: '75%',  color: '#eab308',     text: 'Good' },
    { w: '100%', color: '#22c55e',     text: 'Strong' },
  ];

  const l = levels[score] || levels[0];
  fill.style.width = l.w;
  fill.style.backgroundColor = l.color;
  label.textContent = l.text;
  label.style.color = l.color;
}

/* ===== FORM SUBMIT ===== */
function handleSubmit(e, type) {
  e.preventDefault();

  if (type === 'signup') {
    const pw  = document.getElementById('signupPassword').value;
    const cpw = document.getElementById('confirmPassword').value;
    if (pw !== cpw) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (pw.length < 8) {
      showToast('Password must be at least 8 characters.', 'error');
      return;
    }
  }

  const form   = e.target;
  const btn    = form.querySelector('.btn-primary');
  const text   = btn.querySelector('.btn-text');
  const arrow  = btn.querySelector('.btn-arrow');
  const loader = btn.querySelector('.btn-loader');

  // Loading state
  btn.disabled = true;
  text.textContent = type === 'signin' ? 'Signing in…' : 'Creating account…';
  arrow.style.display = 'none';
  loader.removeAttribute('hidden');

  // Simulate auth
  setTimeout(() => {
    loader.setAttribute('hidden', '');
    arrow.style.display = '';
    btn.disabled = false;
    text.textContent = type === 'signin' ? 'Sign In' : 'Create Account';

    showToast(
      type === 'signin' ? 'Welcome back! Redirecting…' : 'Account created! Welcome to Harmonia!',
      'success'
    );

    setTimeout(() => { window.location.href = 'home.html'; }, 1200);
  }, 1600);
}

/* ===== GOOGLE AUTH ===== */
function handleGoogle() {
  showToast('Google sign-in coming soon!', 'error');
}

/* ===== FORGOT PASSWORD ===== */
function showForgot(e) {
  e.preventDefault();
  showToast('Password reset link sent to your email.', 'success');
}

/* ===== TOAST ===== */
function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => { t.classList.remove('show'); }, 3200);
}

/* ===== FLOATING MUSIC NOTES ===== */
(function spawnNotes() {
  const container = document.getElementById('musicNotes');
  if (!container) return;

  const notes = ['♩','♪','♫','♬','𝄞','𝄢'];
  setInterval(() => {
    const span = document.createElement('span');
    span.textContent = notes[Math.floor(Math.random() * notes.length)];
    span.style.cssText = `
      position:absolute; font-size:${14+Math.random()*18}px;
      left:${Math.random()*100}%; bottom:-30px;
      color:rgba(167,139,250,${0.1+Math.random()*0.2});
      animation: floatNote ${5+Math.random()*8}s linear forwards;
      pointer-events:none; user-select:none;
    `;
    container.appendChild(span);
    setTimeout(() => span.remove(), 14000);
  }, 900);

  const style = document.createElement('style');
  style.textContent = `
    @keyframes floatNote {
      from { transform: translateY(0) rotate(0deg); opacity:0.7; }
      to   { transform: translateY(-110vh) rotate(${Math.random()>0.5?'':'-'}${20+Math.random()*60}deg); opacity:0; }
    }
  `;
  document.head.appendChild(style);
})();
