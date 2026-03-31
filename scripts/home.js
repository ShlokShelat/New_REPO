/* ===== NAVBAR SCROLL ===== */
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ===== MOBILE NAV ===== */
function toggleMobileNav() {
  const nav     = document.getElementById('mobileNav');
  const overlay = document.getElementById('mobileOverlay');
  const burger  = document.getElementById('hamburger');
  const open    = nav.classList.toggle('open');
  overlay.classList.toggle('open', open);
  burger.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

/* ===== PROFILE DROPDOWN ===== */
function toggleProfile() {
  const menu = document.getElementById('profileMenu');
  menu.classList.toggle('open');
}

// Close profile dropdown when clicking outside
document.addEventListener('click', (e) => {
  const menu = document.getElementById('profileMenu');
  if (!menu.contains(e.target)) {
    menu.classList.remove('open');
  }
});

/* ===== SEARCH EXPAND ===== */
function toggleSearch() {
  const wrap = document.getElementById('searchWrap');
  const open = wrap.classList.toggle('open');
  if (open) {
    setTimeout(() => document.getElementById('searchInput').focus(), 320);
  }
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.getElementById('searchWrap').classList.remove('open');
  }
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleSearch();
  }
});

/* ===== THEME TOGGLE ===== */
let isDark = true;

function toggleTheme() {
  isDark = !isDark;
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

  const sunIcon  = document.querySelector('.navbar .sun');
  const moonIcon = document.querySelector('.navbar .moon');
  if (sunIcon && moonIcon) {
    sunIcon.style.display  = isDark ? 'block' : 'none';
    moonIcon.style.display = isDark ? 'none'  : 'block';
  }

  const footerBtn = document.getElementById('footerThemeBtn');
  if (footerBtn) footerBtn.textContent = isDark ? '🌙 Dark Mode' : '☀️ Light Mode';
}

/* ===== FONT SIZE ACCESSIBILITY ===== */
let fontScale = 1;
function adjustFont(delta) {
  fontScale = Math.max(0.85, Math.min(1.25, fontScale + delta * 0.05));
  document.documentElement.style.setProperty('--font-base', fontScale + 'rem');
}

/* ===== INTERSECTION OBSERVER – fade in sections ===== */
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.feat-card, .step-card, .testi-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(24px)';
  el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
  observer.observe(el);
});

// Add visible class styles via JS
const fadeStyle = document.createElement('style');
fadeStyle.textContent = `.visible { opacity: 1 !important; transform: none !important; }`;
document.head.appendChild(fadeStyle);

// Stagger children
document.querySelectorAll('.features-grid, .testimonials-grid').forEach(grid => {
  Array.from(grid.children).forEach((child, i) => {
    child.style.transitionDelay = (i * 0.1) + 's';
  });
});

document.querySelectorAll('.steps-grid .step-card').forEach((child, i) => {
  child.style.transitionDelay = (i * 0.1) + 's';
});

/* ===== SMOOTH ANCHOR SCROLL ===== */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});
