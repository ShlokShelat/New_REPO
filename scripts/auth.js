/* ===== TAB SWITCHING ===== */
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
    indicator.style.transform = 'translateX(0)';
  } else {
    signinForm.classList.add('hidden');
    signupForm.classList.remove('hidden');
    signinBtn.classList.remove('active');
    signupBtn.classList.add('active');
    indicator.style.transform = 'translateX(100%)';
  }
}

/* ===== PASSWORD TOGGLE ===== */
function togglePw(inputId, btn) {
  const input = document.getElementById(inputId);
  const isPassword = input.type === 'password';
  input.type = isPassword ? 'text' : 'password';
  btn.style.opacity = isPassword ? '1' : '0.4';
}

/* ===== PASSWORD STRENGTH ===== */
function checkStrength(val) {
  const fill  = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  if (!fill || !label) return;

  let score = 0;
  if (val.length >= 8)  score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  const levels = [
    { pct: '0%',   color: 'transparent', text: '' },
    { pct: '25%',  color: '#ef4444',     text: 'Weak' },
    { pct: '50%',  color: '#f97316',     text: 'Fair' },
    { pct: '75%',  color: '#eab308',     text: 'Good' },
    { pct: '100%', color: '#22c55e',     text: 'Strong' },
  ];
  const lvl = levels[score] || levels[0];
  fill.style.width = lvl.pct;
  fill.style.background = lvl.color;
  label.textContent = lvl.text;
  label.style.color  = lvl.color;
}

/* ===== TOAST ===== */
function showToast(msg, type = 'info') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.className = `toast toast-${type} show`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ===== FORGOT PASSWORD ===== */
function showForgot(e) {
  e.preventDefault();
  const email = document.getElementById('signinEmail').value.trim();
  if (!email) {
    showToast('Enter your email first, then click Forgot password.', 'warn');
    return;
  }
  showToast(`Password reset link sent to ${email}`, 'success');
}

/* ===== SAVE USER TO LOCALSTORAGE ===== */
function saveUser(data) {
  localStorage.setItem('harmonia_user', JSON.stringify(data));
}

/* ===== GOOGLE SIGN IN (simulated) ===== */
function handleGoogle() {
  setLoading(true);
  setTimeout(() => {
    const user = {
      name: 'Google User',
      firstName: 'Google',
      lastName: 'User',
      email: 'googleuser@gmail.com',
      avatar: 'G',
      signedIn: true,
    };
    saveUser(user);
    showToast('Signed in with Google!', 'success');
    setTimeout(() => { window.location.href = 'home.html'; }, 800);
  }, 1200);
}

/* ===== LOADING STATE ===== */
function setLoading(on) {
  document.querySelectorAll('.btn-primary').forEach(btn => {
    const text   = btn.querySelector('.btn-text');
    const arrow  = btn.querySelector('.btn-arrow');
    const loader = btn.querySelector('.btn-loader');
    if (text)  text.style.opacity   = on ? '0' : '1';
    if (arrow) arrow.style.display  = on ? 'none' : '';
    if (loader) loader.hidden       = !on;
    btn.disabled = on;
  });
}

/* ===== FORM SUBMIT ===== */
function handleSubmit(e, type) {
  e.preventDefault();

  if (type === 'signin') {
    const email    = document.getElementById('signinEmail').value.trim();
    const password = document.getElementById('signinPassword').value;

    if (!email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      // Check if user registered before
      const stored = localStorage.getItem('harmonia_user');
      let user = stored ? JSON.parse(stored) : null;

      if (user && user.email === email) {
        // returning user
      } else {
        // guest sign-in — create a basic profile from email
        const namePart = email.split('@')[0];
        const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);
        user = {
          name: firstName,
          firstName: firstName,
          lastName: '',
          email: email,
          avatar: firstName.charAt(0).toUpperCase(),
          signedIn: true,
        };
      }
      user.signedIn = true;
      saveUser(user);
      showToast(`Welcome back, ${user.firstName || user.name}!`, 'success');
      setTimeout(() => { window.location.href = 'home.html'; }, 800);
    }, 1000);

  } else {
    // sign up
    const firstName = document.getElementById('firstName').value.trim();
    const lastName  = document.getElementById('lastName').value.trim();
    const email     = document.getElementById('signupEmail').value.trim();
    const password  = document.getElementById('signupPassword').value;
    const confirm   = document.getElementById('confirmPassword').value;
    const terms     = document.getElementById('termsCheck').checked;

    if (!firstName || !lastName || !email || !password) {
      showToast('Please fill in all fields.', 'error');
      return;
    }
    if (password !== confirm) {
      showToast('Passwords do not match.', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters.', 'error');
      return;
    }
    if (!terms) {
      showToast('Please accept the Terms of Service.', 'error');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const user = {
        name: `${firstName} ${lastName}`.trim(),
        firstName,
        lastName,
        email,
        avatar: firstName.charAt(0).toUpperCase(),
        signedIn: true,
      };
      saveUser(user);
      showToast(`Welcome to Harmonia, ${firstName}!`, 'success');
      setTimeout(() => { window.location.href = 'home.html'; }, 900);
    }, 1000);
  }
}

/* ===== INIT: pre-fill if already signed in ===== */
(function init() {
  const stored = localStorage.getItem('harmonia_user');
  if (stored) {
    try {
      const user = JSON.parse(stored);
      if (user.signedIn) {
        // already signed in — go straight to home
        window.location.href = 'home.html';
      }
    } catch (err) { /* ignore */ }
  }
})();
