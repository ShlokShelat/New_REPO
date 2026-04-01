/**
 * concerts.js — Concerts page controller
 * Full concert listing, ticketing, filtering, calendar, artist follow
 */

// ─── Data ────────────────────────────────────────────────────────────────────

const CONCERTS_DATA = [
  {
    id: 'c001',
    artist: 'Aurora Waves',
    tourName: 'The Luminous Tour 2026',
    genre: 'Indie Electronic',
    genreTag: 'indie',
    emoji: '🌊',
    gradFrom: '#0ea5e9',
    gradTo: '#7c3aed',
    venue: 'Skyline Arena, Mumbai',
    city: 'Mumbai',
    date: '2026-04-12',
    dateDisplay: 'Apr 12, 2026',
    timeDisplay: '8:00 PM',
    duration: '2h 30min',
    description: 'Experience Aurora Waves live as they debut tracks from their acclaimed new album. An immersive audiovisual spectacle with custom lighting rigs and a 12-piece orchestra.',
    tiers: [
      { id: 't1', name: 'General Admission', price: 799, desc: 'Standing floor access', available: true },
      { id: 't2', name: 'Premium Seating', price: 1499, desc: 'Reserved numbered seats', available: true },
      { id: 't3', name: 'VIP Experience', price: 3999, desc: 'Front row + soundcheck + meet & greet', available: false, soldOut: true },
    ],
    lineup: [
      { name: 'Aurora Waves', role: 'Headliner', emoji: '🌊', time: '9:30 PM – 11:30 PM' },
      { name: 'The Velvet Keys', role: 'Support Act', emoji: '🎹', time: '8:00 PM – 8:45 PM' },
    ],
    tags: ['Electronic', 'Ambient', 'Live Orchestra', 'Visual Arts'],
    status: 'available',
    availability: 62,
    isFeatured: true,
    isStreaming: false,
    xpReward: 75,
    calDate: 12,
    calMonth: 3,
  },
  {
    id: 'c002',
    artist: 'The Midnight Accord',
    tourName: 'Neon Serenade',
    genre: 'Neo Soul',
    genreTag: 'neo-soul',
    emoji: '🎷',
    gradFrom: '#db2777',
    gradTo: '#f97316',
    venue: 'Blue Note Club, Pune',
    city: 'Pune',
    date: '2026-04-15',
    dateDisplay: 'Apr 15, 2026',
    timeDisplay: '7:30 PM',
    duration: '3h',
    description: 'An intimate neo-soul evening with The Midnight Accord. Jazz improvisation meets modern R&B in one of Pune\'s most celebrated venues.',
    tiers: [
      { id: 't1', name: 'Table Seat', price: 1299, desc: 'Seated table experience', available: true },
      { id: 't2', name: 'Premium Table', price: 2499, desc: 'Front-of-stage table + dinner', available: true },
    ],
    lineup: [
      { name: 'The Midnight Accord', role: 'Headliner', emoji: '🎷', time: '8:30 PM – 11:00 PM' },
      { name: 'Priya Sharma Quartet', role: 'Opening Act', emoji: '🎻', time: '7:30 PM – 8:15 PM' },
    ],
    tags: ['Neo Soul', 'Jazz', 'R&B', 'Intimate'],
    status: 'few',
    availability: 18,
    isFeatured: false,
    isStreaming: false,
    xpReward: 60,
    calDate: 15,
    calMonth: 3,
  },
  {
    id: 'c003',
    artist: 'Synthwave City',
    tourName: 'Retrowave Sessions LIVE',
    genre: 'Synthwave',
    genreTag: 'electronic',
    emoji: '🌆',
    gradFrom: '#7c3aed',
    gradTo: '#ec4899',
    venue: 'Stream Anywhere',
    city: 'Online',
    date: '2026-04-18',
    dateDisplay: 'Apr 18, 2026',
    timeDisplay: '9:00 PM',
    duration: '2h',
    description: 'Watch the full Retrowave Sessions concert live from anywhere in the world. HD stream with multi-camera angles and interactive chat.',
    tiers: [
      { id: 't1', name: 'Stream Pass', price: 299, desc: 'Full HD 1080p stream + replay', available: true },
      { id: 't2', name: 'Stream + Merch', price: 899, desc: 'HD stream + exclusive digital merch pack', available: true },
    ],
    lineup: [
      { name: 'Synthwave City', role: 'Headliner', emoji: '🌆', time: '9:00 PM – 11:00 PM' },
    ],
    tags: ['Synthwave', 'Electronic', 'Online', '80s Vibes'],
    status: 'stream',
    availability: 95,
    isFeatured: false,
    isStreaming: true,
    xpReward: 40,
    calDate: 18,
    calMonth: 3,
  },
  {
    id: 'c004',
    artist: 'Raga Collective',
    tourName: 'Classical Fusion Night',
    genre: 'Indian Classical',
    genreTag: 'classical',
    emoji: '🪘',
    gradFrom: '#f97316',
    gradTo: '#fbbf24',
    venue: 'NCPA Tata Theatre, Mumbai',
    city: 'Mumbai',
    date: '2026-04-20',
    dateDisplay: 'Apr 20, 2026',
    timeDisplay: '6:00 PM',
    duration: '2h 45min',
    description: 'A rare fusion of Indian classical ragas with contemporary jazz and electronic elements. Featuring maestro performers and young innovators.',
    tiers: [
      { id: 't1', name: 'Gallery', price: 599, desc: 'Upper gallery seating', available: true },
      { id: 't2', name: 'Stalls', price: 999, desc: 'Main stalls seating', available: true },
      { id: 't3', name: 'Royal Circle', price: 2499, desc: 'Best acoustics in the house', available: true },
    ],
    lineup: [
      { name: 'Raga Collective', role: 'Ensemble', emoji: '🪘', time: '7:00 PM – 9:30 PM' },
      { name: 'Amit Sharma', role: 'Sitar Maestro', emoji: '🎸', time: '6:30 PM – 7:00 PM' },
    ],
    tags: ['Classical', 'Fusion', 'Indian', 'Jazz'],
    status: 'available',
    availability: 78,
    isFeatured: false,
    isStreaming: false,
    xpReward: 65,
    calDate: 20,
    calMonth: 3,
  },
  {
    id: 'c005',
    artist: 'Neon Pulse',
    tourName: 'Ultraviolet',
    genre: 'EDM',
    genreTag: 'electronic',
    emoji: '⚡',
    gradFrom: '#10b981',
    gradTo: '#0ea5e9',
    venue: 'NH7 Ground, Bengaluru',
    city: 'Bengaluru',
    date: '2026-04-25',
    dateDisplay: 'Apr 25, 2026',
    timeDisplay: '6:00 PM',
    duration: '8h (Festival)',
    description: 'The biggest electronic music festival of the year. 3 stages, 15 artists, UV-reactive costumes encouraged. An all-night euphoric experience.',
    tiers: [
      { id: 't1', name: 'Day Pass', price: 1299, desc: 'Full festival access', available: true },
      { id: 't2', name: 'VIP Lounge', price: 3999, desc: 'VIP area + unlimited drinks + backstage', available: false, soldOut: true },
    ],
    lineup: [
      { name: 'Neon Pulse', role: 'Headliner Stage A', emoji: '⚡', time: '11:00 PM – 1:00 AM' },
      { name: 'Kira Sound', role: 'Stage B', emoji: '🎧', time: '9:00 PM – 10:30 PM' },
      { name: 'Bass Theory', role: 'Opening', emoji: '🔊', time: '6:00 PM – 7:30 PM' },
    ],
    tags: ['EDM', 'Festival', 'Multi-Stage', 'UV Party'],
    status: 'available',
    availability: 85,
    isFeatured: false,
    isStreaming: false,
    xpReward: 100,
    calDate: 25,
    calMonth: 3,
  },
  {
    id: 'c006',
    artist: 'Kiran Folk Band',
    tourName: 'Roots & Routes Tour',
    genre: 'Folk / World',
    genreTag: 'folk',
    emoji: '🌾',
    gradFrom: '#84cc16',
    gradTo: '#10b981',
    venue: 'Prithvi Theatre, Mumbai',
    city: 'Mumbai',
    date: '2026-04-28',
    dateDisplay: 'Apr 28, 2026',
    timeDisplay: '7:00 PM',
    duration: '2h',
    description: 'Journey through folk traditions from across India and the world. Kiran Folk Band weaves storytelling with music in an intimate theatre setting.',
    tiers: [
      { id: 't1', name: 'General', price: 0, desc: 'Free community event — donations welcome', available: true },
    ],
    lineup: [
      { name: 'Kiran Folk Band', role: 'Performers', emoji: '🌾', time: '7:30 PM – 9:30 PM' },
      { name: 'Storyteller Meera', role: 'Spoken Word', emoji: '📖', time: '7:00 PM – 7:30 PM' },
    ],
    tags: ['Folk', 'World Music', 'Free', 'Community'],
    status: 'free',
    availability: 45,
    isFeatured: false,
    isStreaming: false,
    xpReward: 30,
    calDate: 28,
    calMonth: 3,
  },
  {
    id: 'c007',
    artist: 'Ghost Frequencies',
    tourName: 'Paranormal Sessions',
    genre: 'Dark Ambient',
    genreTag: 'electronic',
    emoji: '👻',
    gradFrom: '#1e1b4b',
    gradTo: '#7c3aed',
    venue: 'Antihaus Underground, Delhi',
    city: 'Delhi',
    date: '2026-05-02',
    dateDisplay: 'May 2, 2026',
    timeDisplay: '10:00 PM',
    duration: '3h',
    description: 'An immersive dark ambient experience that blurs the line between sound and reality. Ghost Frequencies perform in complete darkness with surround sound and haptic seats.',
    tiers: [
      { id: 't1', name: 'Immersion Pass', price: 999, desc: 'Standing + haptic wristband', available: true },
      { id: 't2', name: 'Sensory VIP', price: 2499, desc: 'Haptic seat + premium wristband + merch', available: true },
    ],
    lineup: [
      { name: 'Ghost Frequencies', role: 'Headliner', emoji: '👻', time: '11:00 PM – 2:00 AM' },
      { name: 'Void Architecture', role: 'Ambient Support', emoji: '🌑', time: '10:00 PM – 10:45 PM' },
    ],
    tags: ['Dark Ambient', 'Immersive', 'Experimental', 'Underground'],
    status: 'available',
    availability: 55,
    isFeatured: false,
    isStreaming: false,
    xpReward: 80,
    calDate: 2,
    calMonth: 4,
  },
  {
    id: 'c008',
    artist: 'The Jazz Explorers',
    tourName: 'Uncharted Harmonies',
    genre: 'Jazz',
    genreTag: 'jazz',
    emoji: '🎺',
    gradFrom: '#fbbf24',
    gradTo: '#f97316',
    venue: 'Jazz Yatra Stage, Kolkata',
    city: 'Kolkata',
    date: '2026-05-05',
    dateDisplay: 'May 5, 2026',
    timeDisplay: '8:00 PM',
    duration: '2h 30min',
    description: 'India\'s premier jazz festival returns. The Jazz Explorers bring their critically acclaimed new quintet format for a night of unscripted improvisation.',
    tiers: [
      { id: 't1', name: 'Festival Pass', price: 899, desc: 'Access to all stages', available: true },
      { id: 't2', name: 'Platinum Pass', price: 2999, desc: 'All stages + VIP tent + limited merch', available: true },
    ],
    lineup: [
      { name: 'The Jazz Explorers', role: 'Feature Set', emoji: '🎺', time: '9:00 PM – 11:00 PM' },
      { name: 'Ravi Shankar Trio', role: 'Opening', emoji: '🥁', time: '8:00 PM – 8:45 PM' },
    ],
    tags: ['Jazz', 'Improvisation', 'Festival', 'Live'],
    status: 'sold',
    availability: 0,
    isFeatured: false,
    isStreaming: false,
    xpReward: 70,
    calDate: 5,
    calMonth: 4,
  },
  {
    id: 'c009',
    artist: 'Lo-Fi Dreams',
    tourName: 'Chill Sessions Vol. 3',
    genre: 'Lo-Fi Hip Hop',
    genreTag: 'hiphop',
    emoji: '☕',
    gradFrom: '#92400e',
    gradTo: '#a78bfa',
    venue: 'Stream Anywhere',
    city: 'Online',
    date: '2026-04-22',
    dateDisplay: 'Apr 22, 2026',
    timeDisplay: '6:00 PM',
    duration: '4h',
    description: 'A 4-hour lo-fi study & chill session featuring live beat production, visualizers, and a community vibe you can join from anywhere in the world.',
    tiers: [
      { id: 't1', name: 'Free Stream', price: 0, desc: 'Free to watch + interactive chat', available: true },
      { id: 't2', name: 'Supporter Pass', price: 199, desc: 'HD stream + exclusive Discord + producer Q&A', available: true },
    ],
    lineup: [
      { name: 'Lo-Fi Dreams', role: 'Live Producer', emoji: '☕', time: '6:00 PM – 10:00 PM' },
    ],
    tags: ['Lo-Fi', 'Hip Hop', 'Chill', 'Online', 'Study'],
    status: 'stream',
    availability: 99,
    isFeatured: false,
    isStreaming: true,
    xpReward: 35,
    calDate: 22,
    calMonth: 3,
  },
];

const LIVE_STREAMS = [
  {
    id: 'ls001',
    artist: 'DJ Arjun',
    show: 'Sunday Warm-Up Set',
    emoji: '🎧',
    gradFrom: '#7c3aed',
    gradTo: '#0ea5e9',
    viewers: '2.4K',
    genre: 'House',
  },
  {
    id: 'ls002',
    artist: 'Meera Krishnan',
    show: 'Carnatic Practice Session',
    emoji: '🎵',
    gradFrom: '#db2777',
    gradTo: '#fbbf24',
    viewers: '1.1K',
    genre: 'Classical',
  },
  {
    id: 'ls003',
    artist: 'The Vinyl Collective',
    show: 'Record Spinning Night',
    emoji: '💿',
    gradFrom: '#10b981',
    gradTo: '#7c3aed',
    viewers: '867',
    genre: 'Eclectic',
  },
];

const ARTISTS_SPOTLIGHT = [
  { id: 'a001', name: 'Aurora Waves', genre: 'Indie Electronic', emoji: '🌊', gradFrom: '#0ea5e9', gradTo: '#7c3aed', followers: '48.2K', upcoming: 3, rating: '4.9' },
  { id: 'a002', name: 'Raga Collective', genre: 'Classical Fusion', emoji: '🪘', gradFrom: '#f97316', gradTo: '#fbbf24', followers: '22.1K', upcoming: 2, rating: '5.0' },
  { id: 'a003', name: 'Neon Pulse', genre: 'EDM', emoji: '⚡', gradFrom: '#10b981', gradTo: '#0ea5e9', followers: '91.4K', upcoming: 5, rating: '4.8' },
  { id: 'a004', name: 'The Midnight Accord', genre: 'Neo Soul', emoji: '🎷', gradFrom: '#db2777', gradTo: '#f97316', followers: '15.7K', upcoming: 1, rating: '4.9' },
];

// ─── State ───────────────────────────────────────────────────────────────────
let state = {
  activeTab: 'all',
  viewMode: 'grid',
  sortBy: 'date',
  genre: 'all',
  city: 'all',
  searchQuery: '',
  selectedConcert: null,
  selectedTier: null,
  qty: 1,
  featuredTier: null,
  featuredQty: 1,
  myTickets: JSON.parse(localStorage.getItem('harmonia_tickets') || '[]'),
  bookmarks: JSON.parse(localStorage.getItem('harmonia_bookmarks') || '[]'),
  following: JSON.parse(localStorage.getItem('harmonia_artist_follows') || '[]'),
  calMonthOffset: 0,
};

// ─── Init ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initHero();
  renderLiveStreams();
  renderFeaturedConcert();
  renderConcertsGrid();
  renderCalendar();
  renderArtistSpotlight();
  renderMyTickets();
  initFilterListeners();
  initFeaturedTicketPanel();
  spawnParticles();
  updateMyTicketsCount();
});

// ─── Hero particles ──────────────────────────────────────────────────────────
function spawnParticles() {
  const container = document.getElementById('concertParticles');
  if (!container) return;
  for (let i = 0; i < 20; i++) {
    const span = document.createElement('span');
    span.style.cssText = `
      left: ${Math.random() * 100}%;
      bottom: ${10 + Math.random() * 80}%;
      --dur: ${6 + Math.random() * 8}s;
      --delay: -${Math.random() * 10}s;
      --x1: ${(Math.random() - 0.5) * 60}px;
      --y1: ${-20 - Math.random() * 40}px;
      --x2: ${(Math.random() - 0.5) * 40}px;
      --y2: ${-60 - Math.random() * 40}px;
      width: ${1 + Math.random() * 3}px;
      height: ${1 + Math.random() * 3}px;
      background: ${Math.random() > 0.5 ? 'rgba(167,139,250,0.6)' : 'rgba(236,72,153,0.5)'};
    `;
    container.appendChild(span);
  }
}

// ─── Hero ────────────────────────────────────────────────────────────────────
function initHero() {
  const snap = typeof HarmoniaDB !== 'undefined' ? HarmoniaDB.getSnapshot() : null;
  if (snap) {
    document.getElementById('heroXP').textContent = `${snap.xp.toLocaleString()} XP`;
  }
  document.getElementById('totalConcertsCount').textContent = CONCERTS_DATA.length + '+';
  document.getElementById('citiesCount').textContent = [...new Set(CONCERTS_DATA.map(c => c.city).filter(c => c !== 'Online'))].length;
  // Only update the first liveNowCount element (hero has a duplicate id)
  const liveCountEls = document.querySelectorAll('#liveNowCount');
  liveCountEls.forEach(el => { el.textContent = LIVE_STREAMS.length; });
}

// ─── Featured Concert ────────────────────────────────────────────────────────
function renderFeaturedConcert() {
  const fc = CONCERTS_DATA.find(c => c.isFeatured);
  if (!fc) return;
  const el = document.getElementById('featuredCard');
  if (!el) return;

  state.featuredTier = fc.tiers.find(t => t.available) || fc.tiers[0];

  document.getElementById('fcArtist').textContent = fc.artist;
  document.getElementById('fcTour').textContent = fc.tourName;
  document.getElementById('fcDate').textContent = `${fc.dateDisplay} · ${fc.timeDisplay}`;
  document.getElementById('fcVenue').textContent = fc.venue;
  document.getElementById('fcDuration').textContent = fc.duration;
  document.getElementById('fcGenre').textContent = fc.genre;
  document.getElementById('fcAvailability').style.width = fc.availability + '%';
  document.getElementById('fcAvailText').textContent = `Only ${100 - fc.availability}% seats remaining`;

  const firstAvailable = fc.tiers.find(t => t.available);
  if (firstAvailable) {
    document.getElementById('fcPriceFrom').textContent = firstAvailable.price === 0 ? 'FREE' : `\u20B9${firstAvailable.price.toLocaleString()}`;
  }

  // Render ticket options
  const optContainer = document.getElementById('fcTicketOptions');
  optContainer.innerHTML = '';
  fc.tiers.forEach((tier, i) => {
    const div = document.createElement('div');
    div.className = 'ticket-option' + (i === 0 && tier.available ? ' selected' : '') + (tier.soldOut ? ' disabled' : '');
    div.style.opacity = tier.soldOut ? '0.5' : '1';
    div.innerHTML = `
      <div class="to-left">
        <strong class="to-name">${tier.name}</strong>
        <span class="to-desc">${tier.desc}</span>
      </div>
      <span class="to-price">${tier.soldOut ? 'Sold Out' : (tier.price === 0 ? 'Free' : '\u20B9' + tier.price.toLocaleString())}</span>
      <div class="to-radio"></div>
    `;
    if (!tier.soldOut) {
      div.addEventListener('click', () => {
        document.querySelectorAll('#fcTicketOptions .ticket-option').forEach(o => o.classList.remove('selected'));
        div.classList.add('selected');
        state.featuredTier = tier;
        updateFeaturedTotal();
      });
    }
    optContainer.appendChild(div);
  });

  el.addEventListener('click', (e) => {
    if (!e.target.closest('.fc-ticket-panel') && !e.target.closest('.btn-get-tickets')) {
      openModal(fc.id);
    }
  });

  updateFeaturedTotal();
}

function initFeaturedTicketPanel() {
  const qtyMinus = document.getElementById('fcQtyMinus');
  const qtyPlus  = document.getElementById('fcQtyPlus');
  if (qtyMinus) {
    qtyMinus.addEventListener('click', () => {
      if (state.featuredQty > 1) {
        state.featuredQty--;
        document.getElementById('fcQtyValue').textContent = state.featuredQty;
        updateFeaturedTotal();
      }
    });
  }
  if (qtyPlus) {
    qtyPlus.addEventListener('click', () => {
      if (state.featuredQty < 8) {
        state.featuredQty++;
        document.getElementById('fcQtyValue').textContent = state.featuredQty;
        updateFeaturedTotal();
      }
    });
  }
}

// FIX: Removed the broken duplicate line with the invalid `·` operator
function updateFeaturedTotal() {
  const btn = document.getElementById('fcGetTicketsBtn');
  if (!state.featuredTier || !btn) return;
  const total = state.featuredTier.price * state.featuredQty;
  if (total === 0) {
    btn.textContent = `\uD83C\uDFAB Reserve${state.featuredQty > 1 ? ' ' + state.featuredQty + ' ' : ' '}Free Ticket${state.featuredQty > 1 ? 's' : ''}`;
  } else {
    btn.textContent = `\uD83C\uDFAB ${state.featuredQty} Ticket${state.featuredQty > 1 ? 's' : ''} \u00B7 \u20B9${total.toLocaleString()}`;
  }
}

document.addEventListener('click', (e) => {
  if (e.target.id === 'fcGetTicketsBtn' || e.target.closest('#fcGetTicketsBtn')) {
    const fc = CONCERTS_DATA.find(c => c.isFeatured);
    if (fc && state.featuredTier) purchaseTicket(fc, state.featuredTier, state.featuredQty);
  }
});

// ─── Live Streams ────────────────────────────────────────────────────────────
function renderLiveStreams() {
  const container = document.getElementById('liveStreamCards');
  if (!container) return;
  container.innerHTML = '';
  LIVE_STREAMS.forEach(ls => {
    const div = document.createElement('div');
    div.className = 'ls-card';
    div.innerHTML = `
      <div class="ls-thumb">
        <div class="ls-thumb-bg" style="background: linear-gradient(135deg, ${ls.gradFrom}, ${ls.gradTo})"></div>
        <div class="ls-live-pill"><span class="live-dot"></span>LIVE</div>
        <div class="ls-viewers">\uD83D\uDC41 ${ls.viewers}</div>
        <span style="position:relative;z-index:1;font-size:3rem">${ls.emoji}</span>
      </div>
      <div class="ls-body">
        <div class="ls-artist">${ls.artist}</div>
        <div class="ls-info">
          <span>${ls.show}</span>
          <span>&middot;</span>
          <span style="color:var(--accent1)">${ls.genre}</span>
        </div>
      </div>
    `;
    div.addEventListener('click', () => showToast('🎬', 'Stream Opening', 'Live streams require a premium account. Upgrade to watch!', 'error'));
    container.appendChild(div);
  });
}

// ─── Concerts Grid ───────────────────────────────────────────────────────────
function getFilteredConcerts() {
  let list = [...CONCERTS_DATA];

  // Tab
  if (state.activeTab === 'upcoming') list = list.filter(c => new Date(c.date) >= new Date());
  else if (state.activeTab === 'streaming') list = list.filter(c => c.isStreaming);
  else if (state.activeTab === 'free') list = list.filter(c => c.tiers.some(t => t.price === 0));
  else if (state.activeTab === 'saved') list = list.filter(c => state.bookmarks.includes(c.id));

  // Genre
  if (state.genre !== 'all') list = list.filter(c => c.genreTag === state.genre);

  // FIX: Added .toLowerCase() to state.city for case-insensitive matching
  if (state.city !== 'all') list = list.filter(c => c.city.toLowerCase().includes(state.city.toLowerCase()));

  // Search
  if (state.searchQuery.trim()) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(c =>
      c.artist.toLowerCase().includes(q) ||
      c.venue.toLowerCase().includes(q) ||
      c.genre.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  }

  // Sort
  if (state.sortBy === 'date') list.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (state.sortBy === 'price') list.sort((a, b) => Math.min(...a.tiers.map(t => t.price)) - Math.min(...b.tiers.map(t => t.price)));
  else if (state.sortBy === 'availability') list.sort((a, b) => b.availability - a.availability);

  return list;
}

function renderConcertsGrid() {
  const grid = document.getElementById('concertsGrid');
  const countEl = document.getElementById('gridCount');
  if (!grid) return;

  const list = getFilteredConcerts();
  if (countEl) countEl.textContent = `${list.length} event${list.length !== 1 ? 's' : ''}`;

  grid.innerHTML = '';
  grid.className = `concerts-grid ${state.viewMode === 'list' ? 'view-list' : ''}`;

  if (!list.length) {
    grid.innerHTML = `
      <div class="concerts-empty">
        <span>🎵</span>
        <h3>No concerts found</h3>
        <p>Try adjusting your filters or search query.</p>
      </div>
    `;
    return;
  }

  list.forEach((concert, i) => {
    const card = createConcertCard(concert);
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.4s ease ${i * 0.06}s, transform 0.4s ease ${i * 0.06}s`;
    grid.appendChild(card);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      card.style.opacity = '1';
      card.style.transform = 'none';
    }));
  });
}

function createConcertCard(concert) {
  const saved = state.bookmarks.includes(concert.id);
  const minPrice = Math.min(...concert.tiers.map(t => t.price));
  const available = concert.tiers.some(t => t.available && !t.soldOut);

  const statusBadge = {
    sold:      `<span class="cc-badge cc-badge-sold">Sold Out</span>`,
    few:       `<span class="cc-badge cc-badge-few">Few Left</span>`,
    available: `<span class="cc-badge cc-badge-avail">Available</span>`,
    stream:    `<span class="cc-badge cc-badge-stream">\uD83C\uDFA6 Stream</span>`,
    free:      `<span class="cc-badge cc-badge-free">Free</span>`,
  }[concert.status] || '';

  const div = document.createElement('div');
  div.className = `concert-card ${concert.isStreaming ? 'cc-streaming' : ''}`;
  div.dataset.id = concert.id;

  div.innerHTML = `
    <div class="cc-art">
      <div class="cc-art-bg" style="background: linear-gradient(135deg, ${concert.gradFrom}55, ${concert.gradTo}55, #0f0f1a)"></div>
      <div class="cc-art-gradient" style="background: linear-gradient(135deg, ${concert.gradFrom}, ${concert.gradTo})"></div>
      <div class="cc-art-pattern"></div>
      <div class="cc-art-emoji">${concert.emoji}</div>
      <div class="cc-overlay"></div>
      <div class="cc-top-badges">
        ${statusBadge}
        <button class="cc-bookmark-btn ${saved ? 'saved' : ''}" data-id="${concert.id}" onclick="toggleBookmark(event,'${concert.id}')">
          <svg viewBox="0 0 24 24" fill="${saved ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="14" height="14"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
        </button>
      </div>
      ${concert.status === 'sold' ? '<div class="cc-sold-overlay"><span>Sold Out</span></div>' : ''}
    </div>
    <div class="cc-body">
      <div class="cc-body-main">
        <span class="cc-genre">${concert.genre}</span>
        <div class="cc-artist">${concert.artist}</div>
        <div class="cc-venue-row">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          ${concert.venue}
        </div>
        <div class="cc-meta-row">
          <div class="cc-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            ${concert.dateDisplay}
          </div>
          <div class="cc-meta-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            ${concert.timeDisplay}
          </div>
        </div>
      </div>
    </div>
    <div class="cc-footer">
      <div class="cc-price-block">
        ${concert.status === 'free' || minPrice === 0
          ? '<div class="cc-price-free">FREE</div>'
          : `<span class="cc-from">From</span><div class="cc-price">\u20B9${minPrice.toLocaleString()}</div>`
        }
      </div>
      <button class="btn-card-tickets" ${concert.status === 'sold' ? 'disabled' : ''} onclick="openModal('${concert.id}')">
        ${concert.status === 'sold' ? 'Sold Out' : concert.isStreaming ? '\u25B6 Watch' : '\uD83C\uDFAB Tickets'}
      </button>
    </div>
  `;

  div.querySelector('.cc-body').addEventListener('click', (e) => {
    if (!e.target.closest('.cc-bookmark-btn') && !e.target.closest('.btn-card-tickets')) {
      openModal(concert.id);
    }
  });
  div.querySelector('.cc-art').addEventListener('click', (e) => {
    if (!e.target.closest('.cc-bookmark-btn')) openModal(concert.id);
  });

  return div;
}

// ─── Bookmark ────────────────────────────────────────────────────────────────
function toggleBookmark(e, id) {
  e.stopPropagation();
  const idx = state.bookmarks.indexOf(id);
  if (idx >= 0) {
    state.bookmarks.splice(idx, 1);
    showToast('🔖', 'Bookmark Removed', 'Concert removed from your saved list.', 'error');
  } else {
    state.bookmarks.push(id);
    showToast('🔖', 'Saved!', 'Concert added to your saved list.', 'success');
  }
  localStorage.setItem('harmonia_bookmarks', JSON.stringify(state.bookmarks));
  renderConcertsGrid();
}

// ─── Concert Modal ───────────────────────────────────────────────────────────
function openModal(id) {
  const concert = CONCERTS_DATA.find(c => c.id === id);
  if (!concert) return;
  state.selectedConcert = concert;
  state.selectedTier = concert.tiers.find(t => t.available && !t.soldOut) || null;
  state.qty = 1;

  // Header
  document.getElementById('cmHeaderBg').style.background = `linear-gradient(135deg, ${concert.gradFrom}55, ${concert.gradTo}55, #0f0f1a)`;
  document.getElementById('cmHeaderEmoji').textContent = concert.emoji;
  document.getElementById('cmArtistName').textContent = concert.artist;
  document.getElementById('cmTourSub').textContent = concert.tourName;

  // Badges
  document.getElementById('cmGenreBadge').textContent = concert.genre;

  // Details
  document.getElementById('cmDate').innerHTML = `<strong>${concert.dateDisplay} \u00B7 ${concert.timeDisplay}</strong><span>${concert.duration}</span>`;
  document.getElementById('cmVenue').innerHTML = `<strong>${concert.venue}</strong><span>${concert.city}</span>`;
  document.getElementById('cmStatus').innerHTML = `<strong>${getStatusText(concert.status)}</strong><span>${getAvailabilityText(concert)}</span>`;
  document.getElementById('cmXP').innerHTML = `<strong>+${concert.xpReward} XP</strong><span>Earned when you attend</span>`;

  // Description
  document.getElementById('cmDescription').textContent = concert.description;

  // Lineup
  const lineupEl = document.getElementById('cmLineup');
  lineupEl.innerHTML = '';
  concert.lineup.forEach(act => {
    lineupEl.innerHTML += `
      <div class="cm-lineup-act">
        <div class="cm-act-avatar" style="background:rgba(167,139,250,0.1)">${act.emoji}</div>
        <div class="cm-act-info">
          <span class="cm-act-name">${act.name}</span>
          <span class="cm-act-role">${act.role}</span>
        </div>
        <span class="cm-act-time">${act.time}</span>
      </div>
    `;
  });

  // Tags
  const tagsEl = document.getElementById('cmTags');
  tagsEl.innerHTML = concert.tags.map(t => `<span class="cm-tag">${t}</span>`).join('');

  // Ticket tiers
  renderModalTiers(concert);

  // XP note
  document.getElementById('cmXpNote').textContent = `\uD83C\uDF1F Attending earns you +${concert.xpReward} XP on Harmonia!`;

  updateModalTotal();

  document.getElementById('concertModal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderModalTiers(concert) {
  const container = document.getElementById('cmTierOptions');
  container.innerHTML = '';
  concert.tiers.forEach((tier, i) => {
    const div = document.createElement('div');
    div.className = 'cm-tier' + (i === 0 && tier.available && !tier.soldOut ? ' selected' : '');
    div.innerHTML = `
      <div class="cm-tier-header">
        <span class="cm-tier-name">${tier.name}</span>
        <span class="cm-tier-price">${tier.price === 0 ? 'FREE' : '\u20B9' + tier.price.toLocaleString()}</span>
      </div>
      <div class="cm-tier-desc">${tier.desc}</div>
      ${tier.soldOut ? '<div class="cm-tier-sold">SOLD OUT</div>' : ''}
    `;
    if (!tier.soldOut && tier.available) {
      div.addEventListener('click', () => {
        document.querySelectorAll('.cm-tier').forEach(t => t.classList.remove('selected'));
        div.classList.add('selected');
        state.selectedTier = tier;
        updateModalTotal();
      });
    } else {
      div.style.opacity = '0.5';
      div.style.cursor = 'not-allowed';
    }
    container.appendChild(div);
  });
}

function closeModal() {
  document.getElementById('concertModal').classList.remove('open');
  document.body.style.overflow = '';
  state.selectedConcert = null;
  state.selectedTier = null;
}

document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
document.addEventListener('click', e => {
  if (e.target.id === 'concertModal') closeModal();
});

// Modal qty
document.addEventListener('click', e => {
  if (e.target.id === 'cmQtyMinus') {
    if (state.qty > 1) {
      state.qty--;
      document.getElementById('cmQtyValue').textContent = state.qty;
      updateModalTotal();
    }
  }
  if (e.target.id === 'cmQtyPlus') {
    if (state.qty < 8) {
      state.qty++;
      document.getElementById('cmQtyValue').textContent = state.qty;
      updateModalTotal();
    }
  }
});

function updateModalTotal() {
  const totalEl = document.getElementById('cmTotalVal');
  const btn = document.getElementById('cmBuyBtn');
  if (!totalEl) return;
  if (!state.selectedTier) {
    totalEl.textContent = '\u2014';
    return;
  }
  const total = state.selectedTier.price * state.qty;
  totalEl.textContent = total === 0 ? 'FREE' : `\u20B9${total.toLocaleString()}`;
  if (btn) {
    if (total === 0) {
      btn.textContent = `\uD83C\uDFAB Reserve ${state.qty > 1 ? state.qty + ' ' : ''}Free Ticket${state.qty > 1 ? 's' : ''}`;
    } else {
      btn.textContent = `\uD83C\uDFAB Buy ${state.qty} Ticket${state.qty > 1 ? 's' : ''} \u00B7 \u20B9${total.toLocaleString()}`;
    }
  }
}

// Purchase
document.addEventListener('click', e => {
  if (e.target.id === 'cmBuyBtn') {
    if (state.selectedConcert && state.selectedTier) {
      purchaseTicket(state.selectedConcert, state.selectedTier, state.qty);
    }
  }
});

function purchaseTicket(concert, tier, qty) {
  const ticket = {
    id: 'tk_' + Date.now(),
    concertId: concert.id,
    artist: concert.artist,
    venue: concert.venue,
    dateDisplay: concert.dateDisplay,
    timeDisplay: concert.timeDisplay,
    city: concert.city,
    emoji: concert.emoji,
    gradFrom: concert.gradFrom,
    gradTo: concert.gradTo,
    tier: tier.name,
    price: tier.price * qty,
    qty,
    purchasedAt: Date.now(),
    upcoming: new Date(concert.date) >= new Date(),
  };
  state.myTickets.push(ticket);
  localStorage.setItem('harmonia_tickets', JSON.stringify(state.myTickets));

  // XP
  if (typeof HarmoniaDB !== 'undefined') {
    HarmoniaDB.addXP(concert.xpReward, `Concert ticket: ${concert.artist}`);
  }

  closeModal();
  renderMyTickets();
  updateMyTicketsCount();

  const totalStr = tier.price === 0 ? 'Free' : `\u20B9${(tier.price * qty).toLocaleString()}`;
  showToast('🎟️', 'Ticket Booked!', `${concert.artist} \u00B7 ${tier.name} \u00B7 ${totalStr}`, 'success');
  setTimeout(() => showToast('\u2B50', `+${concert.xpReward} XP Earned!`, 'Concert ticket added to your profile.', 'xp'), 1200);
}

// ─── Calendar ────────────────────────────────────────────────────────────────
function renderCalendar() {
  const now = new Date();
  const targetDate = new Date(now.getFullYear(), now.getMonth() + state.calMonthOffset, 1);
  const year = targetDate.getFullYear();
  const month = targetDate.getMonth();

  const monthNames = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  document.getElementById('calMonthDisplay').textContent = `${monthNames[month]} ${year}`;

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();

  const calGrid = document.getElementById('calGrid');
  // Keep day headers, replace from index 7 onwards
  const dayHeaders = Array.from(calGrid.querySelectorAll('.cal-day-header'));
  calGrid.innerHTML = '';
  dayHeaders.forEach(h => calGrid.appendChild(h));

  // Empty cells before first
  for (let i = 0; i < firstDayOfWeek; i++) {
    const empty = document.createElement('div');
    empty.className = 'cal-day empty';
    calGrid.appendChild(empty);
  }

  const today = new Date();
  const concertsThisMonth = CONCERTS_DATA.filter(c => {
    const d = new Date(c.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });

  const eventColors = {
    'indie': '#0ea5e9',
    'neo-soul': '#db2777',
    'electronic': '#a78bfa',
    'classical': '#f97316',
    'folk': '#84cc16',
    'jazz': '#fbbf24',
    'hiphop': '#ec4899'
  };

  for (let d = 1; d <= daysInMonth; d++) {
    const dayEl = document.createElement('div');
    const isToday = today.getDate() === d && today.getMonth() === month && today.getFullYear() === year;
    dayEl.className = 'cal-day' + (isToday ? ' today' : '');

    const numEl = document.createElement('div');
    numEl.className = 'cal-day-num';
    numEl.textContent = d;
    dayEl.appendChild(numEl);

    const dayConcerts = concertsThisMonth.filter(c => new Date(c.date).getDate() === d);
    dayConcerts.slice(0, 2).forEach(c => {
      const dot = document.createElement('div');
      dot.className = 'cal-event-dot';
      dot.style.background = (eventColors[c.genreTag] || '#a78bfa') + '22';
      dot.style.color = eventColors[c.genreTag] || '#a78bfa';
      dot.textContent = c.artist.split(' ')[0];
      dot.style.borderLeft = `2px solid ${eventColors[c.genreTag] || '#a78bfa'}`;
      dayEl.appendChild(dot);
    });
    if (dayConcerts.length > 2) {
      const more = document.createElement('div');
      more.className = 'cal-event-dot';
      more.style.background = 'rgba(167,139,250,0.1)';
      more.style.color = '#64748b';
      more.textContent = `+${dayConcerts.length - 2} more`;
      dayEl.appendChild(more);
    }

    if (dayConcerts.length > 0) {
      dayEl.style.cursor = 'pointer';
      dayEl.addEventListener('click', () => {
        if (dayConcerts.length === 1) {
          openModal(dayConcerts[0].id);
        } else {
          showToast('📅', `${dayConcerts.length} Events`, `Multiple concerts on ${monthNames[month]} ${d}. Browse below.`, 'success');
        }
      });
    }

    calGrid.appendChild(dayEl);
  }
}

document.addEventListener('click', e => {
  if (e.target.id === 'calPrev') { state.calMonthOffset--; renderCalendar(); }
  if (e.target.id === 'calNext') { state.calMonthOffset++; renderCalendar(); }
});

// ─── Artist Spotlight ────────────────────────────────────────────────────────
function renderArtistSpotlight() {
  const container = document.getElementById('artistSpotlightGrid');
  if (!container) return;
  container.innerHTML = '';
  ARTISTS_SPOTLIGHT.forEach(artist => {
    const following = state.following.includes(artist.id);
    const div = document.createElement('div');
    div.className = 'as-card';
    div.innerHTML = `
      <div class="as-card-art">
        <div class="as-card-art-bg" style="background: linear-gradient(135deg, ${artist.gradFrom}, ${artist.gradTo})"></div>
        <span style="position:relative;z-index:1">${artist.emoji}</span>
      </div>
      <div class="as-card-body">
        <div class="as-card-name">${artist.name}</div>
        <div class="as-card-genre">${artist.genre}</div>
        <div class="as-card-stats">
          <div class="as-stat"><strong>${artist.followers}</strong><span>Followers</span></div>
          <div class="as-stat"><strong>${artist.upcoming}</strong><span>Upcoming</span></div>
          <div class="as-stat"><strong>${artist.rating}\u2605</strong><span>Rating</span></div>
        </div>
        <button class="btn-follow ${following ? 'following' : 'not-following'}" data-id="${artist.id}">
          ${following ? '\u2713 Following' : '+ Follow'}
        </button>
      </div>
    `;
    div.querySelector('.btn-follow').addEventListener('click', e => { e.stopPropagation(); toggleFollow(artist.id); });
    div.addEventListener('click', e => {
      if (!e.target.closest('.btn-follow')) {
        showToast('🎤', artist.name, `View artist page \u2014 coming soon!`, 'success');
      }
    });
    container.appendChild(div);
  });
}

function toggleFollow(id) {
  const idx = state.following.indexOf(id);
  const artist = ARTISTS_SPOTLIGHT.find(a => a.id === id);
  if (idx >= 0) {
    state.following.splice(idx, 1);
    showToast('👤', 'Unfollowed', `You unfollowed ${artist ? artist.name : ''}.`, 'error');
  } else {
    state.following.push(id);
    showToast('🔔', 'Following!', `You'll get notified when ${artist ? artist.name : ''} has new events.`, 'success');
    if (typeof HarmoniaDB !== 'undefined') HarmoniaDB.addXP(10, `Followed artist: ${artist ? artist.name : ''}`);
  }
  localStorage.setItem('harmonia_artist_follows', JSON.stringify(state.following));
  renderArtistSpotlight();
}

// ─── My Tickets ──────────────────────────────────────────────────────────────
function renderMyTickets() {
  const section = document.getElementById('myTicketsSection');
  const list = document.getElementById('ticketsList');
  const emptyEl = document.getElementById('ticketsEmpty');
  if (!list) return;

  if (!state.myTickets.length) {
    if (section) section.style.display = 'none';
    return;
  }
  if (section) section.style.display = 'block';
  if (emptyEl) emptyEl.style.display = 'none';

  list.innerHTML = '';
  [...state.myTickets].reverse().forEach(ticket => {
    const div = document.createElement('div');
    div.className = 'ticket-stub';
    div.innerHTML = `
      <div class="ts-color-bar" style="background: linear-gradient(to bottom, ${ticket.gradFrom}, ${ticket.gradTo})"></div>
      <div class="ts-main">
        <span class="ts-emoji">${ticket.emoji}</span>
        <div class="ts-info">
          <div class="ts-artist">${ticket.artist}</div>
          <div class="ts-details">
            <span>\uD83D\uDCCD ${ticket.venue}</span>
            <span>\uD83D\uDCC5 ${ticket.dateDisplay}</span>
            <span>\uD83D\uDD50 ${ticket.timeDisplay}</span>
          </div>
          <span class="ts-tier">${ticket.tier} \u00B7 ${ticket.qty > 1 ? ticket.qty + 'x' : ''}</span>
        </div>
      </div>
      <div class="ts-right">
        <div class="ts-price">${ticket.price === 0 ? 'FREE' : '\u20B9' + ticket.price.toLocaleString()}</div>
        <div class="ts-qr">\u25A3</div>
        <div class="ts-status ${ticket.upcoming ? 'upcoming' : 'past'}">${ticket.upcoming ? '\u2713 Upcoming' : '\u2713 Past'}</div>
      </div>
    `;
    list.appendChild(div);
  });
}

function updateMyTicketsCount() {
  const countEl = document.getElementById('myTicketsCount');
  if (countEl) countEl.textContent = state.myTickets.length;
  const tabSaved = document.querySelector('.cf-tab[data-tab="saved"] .cf-tab-count');
  if (tabSaved) tabSaved.textContent = state.bookmarks.length;
}

// ─── Filters ─────────────────────────────────────────────────────────────────
function initFilterListeners() {
  // Tabs
  document.querySelectorAll('.cf-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cf-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.activeTab = btn.dataset.tab;
      renderConcertsGrid();
    });
  });

  // Genre & City & Sort selects
  const genreSelect = document.getElementById('cfGenre');
  const citySelect  = document.getElementById('cfCity');
  const sortSelect  = document.getElementById('cfSort');
  if (genreSelect) genreSelect.addEventListener('change', () => { state.genre = genreSelect.value; renderConcertsGrid(); });
  if (citySelect)  citySelect.addEventListener('change',  () => { state.city  = citySelect.value;  renderConcertsGrid(); });
  if (sortSelect)  sortSelect.addEventListener('change',  () => { state.sortBy = sortSelect.value; renderConcertsGrid(); });

  // Search
  const searchInput = document.getElementById('cfSearch');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => { state.searchQuery = searchInput.value; renderConcertsGrid(); }, 280);
    });
  }

  // View toggle
  document.querySelectorAll('.cf-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cf-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.viewMode = btn.dataset.view;
      renderConcertsGrid();
    });
  });

  // Sticky filter bar
  const filterBar = document.getElementById('concertsFilters');
  if (filterBar) {
    window.addEventListener('scroll', () => {
      filterBar.classList.toggle('pinned', window.scrollY > 200);
    }, { passive: true });
  }
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getStatusText(status) {
  return {
    available: 'Tickets Available',
    few:       'Few Seats Left',
    sold:      'Sold Out',
    stream:    'Streaming Event',
    free:      'Free Entry'
  }[status] || 'Available';
}

function getAvailabilityText(c) {
  if (c.status === 'sold')   return 'No seats remaining';
  if (c.status === 'stream') return 'Online event \u2014 unlimited access';
  if (c.status === 'free')   return 'Free entry \u2014 registration required';
  return `~${c.availability}% seats available`;
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer;
function showToast(icon, title, msg, type = 'success') {
  const toast = document.getElementById('concertToast');
  if (!toast) return;
  toast.querySelector('.ct-icon').textContent = icon;
  toast.querySelector('.ct-title').textContent = title;
  toast.querySelector('.ct-msg').textContent = msg;
  toast.className = `concert-toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

document.addEventListener('click', e => {
  if (e.target.closest('.ct-close')) {
    const toast = document.getElementById('concertToast');
    if (toast) toast.classList.remove('show');
  }
});
