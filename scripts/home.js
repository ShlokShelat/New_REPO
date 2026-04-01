/* ================================================================
   HARMONIA HOME.JS
   - Reads active session from localStorage on every page load
   - Updates navbar: avatar initial, name, email
   - Handles sign-out: clears session + redirects to index.html
   - All original navbar/scroll/theme/search functionality intact
   ================================================================ */

const SESSION_KEY = 'harmonia_session';

/* ================================================================
   GET SESSION
   ================================================================ */
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

/* ================================================================
   SIGN OUT
   ================================================================ */
function signOut() {
  localStorage.removeItem(SESSION_KEY);
  window.location.href = 'index.html';
}

/* ================================================================
   UPDATE NAVBAR WITH USER DATA
   ================================================================ */
(function applySession() {
  const user = getSession();

  if (!user) {
    // Not signed in — navbar stays as "Guest"
    return;
  }

  const initial     = (user.avatar || user.firstName || 'G').charAt(0).toUpperCase();
  const displayName = user.firstName || user.name || 'User';
  const fullName    = user.name || displayName;
  const email       = user.email || '';

  // ── Avatar letters ──
  document.querySelectorAll('.avatar, .pd-avatar').forEach(el => {
    // If user has a Google profile picture, show it as an img
    if (user.picture && el.classList.contains('avatar')) {
      el.innerHTML = '';
      el.style.backgroundImage  = `url(${user.picture})`;
      el.style.backgroundSize   = 'cover';
      el.style.backgroundPosition = 'center';
      el.textContent = '';
    } else {
      el.textContent = initial;
    }
  });

  // ── Profile button name ──
  document.querySelectorAll('.profile-name').forEach(el => {
    el.textContent = displayName;
  });

  // ── Dropdown header ──
  const pdName = document.querySelector('.pd-name');
  if (pdName) pdName.textContent = fullName;

  const pdEmail = document.querySelector('.pd-email');
  if (pdEmail) pdEmail.textContent = email;

  // ── Sign-out links: clear session on click ──
  document.querySelectorAll('.btn-signout, .pd-signout').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      signOut();
    });
  });

  // ── Mobile sign-out ──
  document.querySelectorAll('.mobile-signout').forEach(el => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      signOut();
    });
  });
})();

/* ================================================================
   NAVBAR SCROLL
   ================================================================ */
const navbar = document.getElementById('navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
}

/* ================================================================
   MOBILE NAV
   ================================================================ */
function toggleMobileNav() {
  const nav     = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileOverlay');
  const burger  = document.getElementById('hamburger');
  if (!nav) return;
  const open = nav.classList.toggle('open');
  overlay?.classList.toggle('open', open);
  burger?.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

/* ================================================================
   PROFILE DROPDOWN
   ================================================================ */
function toggleProfile() {
  document.getElementById('profileMenu')?.classList.toggle('open');
}
document.addEventListener('click', (e) => {
  const menu = document.getElementById('profileMenu');
  if (menu && !menu.contains(e.target)) menu.classList.remove('open');
});

/* ================================================================
   SEARCH EXPAND
   ================================================================ */
function toggleSearch() {
  const wrap = document.getElementById('searchWrap');
  if (!wrap) return;
  const open = wrap.classList.toggle('open');
  if (open) setTimeout(() => document.getElementById('searchInput')?.focus(), 320);
}
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') document.getElementById('searchWrap')?.classList.remove('open');
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); toggleSearch(); }
});

/* ================================================================
   THEME TOGGLE
   ================================================================ */
let isDark = true;
function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  const sun  = document.querySelector('.navbar .sun');
  const moon = document.querySelector('.navbar .moon');
  if (sun)  sun.style.display  = isDark ? 'block' : 'none';
  if (moon) moon.style.display = isDark ? 'none'  : 'block';
  const footerBtn = document.getElementById('footerThemeBtn');
  if (footerBtn) footerBtn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
}

/* ================================================================
   FONT SIZE ACCESSIBILITY
   ================================================================ */
let fontScale = 1;
function adjustFont(delta) {
  fontScale = Math.max(0.85, Math.min(1.25, fontScale + delta * 0.05));
  document.documentElement.style.setProperty('--font-base', fontScale + 'rem');
}

/* ================================================================
   INTERSECTION OBSERVER — fade in sections
   ================================================================ */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => { if (entry.isIntersecting) entry.target.classList.add('visible'); });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-card, .step-card, .testi-card').forEach(el => {
  el.style.opacity   = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

const fadeStyle = document.createElement('style');
fadeStyle.textContent = `.visible { opacity: 1 !important; transform: none !important; }`;
document.head.appendChild(fadeStyle);

document.querySelectorAll('.features-grid, .testimonials-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => { child.style.transitionDelay = (i * 0.1) + 's'; });
});
document.querySelectorAll('.steps-grid .step-card').forEach((child, i) => {
  child.style.transitionDelay = (i * 0.1) + 's';
});

/* ================================================================
   SMOOTH ANCHOR SCROLL
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});
