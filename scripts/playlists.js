/**
 * playlists.js — Full playlists page controller
 * Features: data layer, music player (simulated), create/edit modal,
 * filtering/sorting/search, featured cards, trending tracks, mini player
 */

'use strict';

/* ===================================================
   DATA — Seed Playlists
=================================================== */
const SEED_PLAYLISTS = [
  {
    id: 'pl_001', title: 'Music Theory Essentials', emoji: '🎼', color: 'linear-gradient(135deg,#7c3aed,#ec4899)',
    desc: 'Everything you need to master music theory from intervals to chord progressions. Perfect for beginners.',
    genre: 'theory', visibility: 'public', featured: true, featuredWide: true,
    author: 'Harmonia Team', authorInitial: 'H', authorColor: 'linear-gradient(135deg,#7c3aed,#db2777)',
    tracks: ['tr_01','tr_02','tr_03','tr_04','tr_05'],
    tags: ['theory','beginner','chords','intervals'],
    likes: 1248, saves: 892, listens: 15420, createdAt: Date.now() - 7 * 86400000
  },
  {
    id: 'pl_002', title: 'Jazz Standards Practice', emoji: '🎷', color: 'linear-gradient(135deg,#f97316,#fbbf24)',
    desc: 'The ultimate collection of jazz standards to practice improvisation and chord substitutions.',
    genre: 'practice', visibility: 'public', featured: true,
    author: 'JazzMaster88', authorInitial: 'J', authorColor: 'linear-gradient(135deg,#f97316,#fbbf24)',
    tracks: ['tr_06','tr_07','tr_08','tr_09'],
    tags: ['jazz','improvisation','standards'],
    likes: 876, saves: 543, listens: 9870, createdAt: Date.now() - 14 * 86400000
  },
  {
    id: 'pl_003', title: 'Deep Focus: Classical', emoji: '🎹', color: 'linear-gradient(135deg,#0ea5e9,#7c3aed)',
    desc: 'Calm and focused classical pieces perfect for studying, reading, or working.',
    genre: 'focus', visibility: 'public', featured: true,
    author: 'ClassicVibes', authorInitial: 'C', authorColor: 'linear-gradient(135deg,#0ea5e9,#7c3aed)',
    tracks: ['tr_10','tr_11','tr_12','tr_13','tr_14','tr_15'],
    tags: ['classical','focus','study','piano'],
    likes: 2103, saves: 1567, listens: 28900, createdAt: Date.now() - 3 * 86400000
  },
  {
    id: 'pl_004', title: 'Guitar Workout Vol.1', emoji: '🎸', color: 'linear-gradient(135deg,#10b981,#34d399)',
    desc: 'Warm-up exercises, scales, and riff workouts to build speed and technique on guitar.',
    genre: 'workout', visibility: 'public', featured: false,
    author: 'RiffKing', authorInitial: 'R', authorColor: 'linear-gradient(135deg,#10b981,#34d399)',
    tracks: ['tr_16','tr_17','tr_18','tr_19','tr_20'],
    tags: ['guitar','technique','scales','workout'],
    likes: 654, saves: 432, listens: 7240, createdAt: Date.now() - 5 * 86400000
  },
  {
    id: 'pl_005', title: 'Chill Lo-fi Beats', emoji: '🎧', color: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    desc: 'Mellow lo-fi instrumentals for background listening while you practice or unwind.',
    genre: 'chill', visibility: 'public', featured: false,
    author: 'LofiGuru', authorInitial: 'L', authorColor: 'linear-gradient(135deg,#8b5cf6,#ec4899)',
    tracks: ['tr_21','tr_22','tr_23','tr_24'],
    tags: ['lofi','chill','ambient','relax'],
    likes: 3401, saves: 2890, listens: 45200, createdAt: Date.now() - 1 * 86400000
  },
  {
    id: 'pl_006', title: 'Beginner Piano Journey', emoji: '🎹', color: 'linear-gradient(135deg,#db2777,#f97316)',
    desc: 'Step-by-step piano pieces from simple melodies to full arrangements for beginners.',
    genre: 'learning', visibility: 'public', featured: false,
    author: 'PianoPath', authorInitial: 'P', authorColor: 'linear-gradient(135deg,#db2777,#f97316)',
    tracks: ['tr_25','tr_26','tr_27','tr_28','tr_29'],
    tags: ['piano','beginner','learning','classical'],
    likes: 987, saves: 765, listens: 12100, createdAt: Date.now() - 10 * 86400000
  },
  {
    id: 'pl_007', title: 'EDM Production Gems', emoji: '🎛️', color: 'linear-gradient(135deg,#06b6d4,#6366f1)',
    desc: 'Curated tracks for studying modern EDM production techniques and sound design.',
    genre: 'learning', visibility: 'public', featured: false,
    author: 'BeatLab', authorInitial: 'B', authorColor: 'linear-gradient(135deg,#06b6d4,#6366f1)',
    tracks: ['tr_30','tr_31','tr_32','tr_33'],
    tags: ['edm','production','electronic','synthesis'],
    likes: 456, saves: 321, listens: 5670, createdAt: Date.now() - 20 * 86400000
  },
  {
    id: 'pl_008', title: 'Morning Warm-Up Routines', emoji: '🌅', color: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    desc: 'Short, energizing practice routines to start your musical day with focus and intention.',
    genre: 'practice', visibility: 'public', featured: false,
    author: 'MorningMusician', authorInitial: 'M', authorColor: 'linear-gradient(135deg,#f59e0b,#ef4444)',
    tracks: ['tr_34','tr_35','tr_36'],
    tags: ['warmup','practice','routine','morning'],
    likes: 321, saves: 234, listens: 4320, createdAt: Date.now() - 4 * 86400000
  },
  {
    id: 'pl_009', title: 'Interval Recognition Training', emoji: '👂', color: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
    desc: 'Audio exercises for ear training — from perfect unisons to compound intervals.',
    genre: 'theory', visibility: 'public', featured: false,
    author: 'EarPro', authorInitial: 'E', authorColor: 'linear-gradient(135deg,#14b8a6,#0ea5e9)',
    tracks: ['tr_37','tr_38','tr_39','tr_40','tr_41'],
    tags: ['ear-training','intervals','theory','advanced'],
    likes: 789, saves: 567, listens: 9800, createdAt: Date.now() - 8 * 86400000
  },
  {
    id: 'pl_010', title: 'Rock Classics Transcriptions', emoji: '🎸', color: 'linear-gradient(135deg,#ef4444,#f97316)',
    desc: 'Classic rock guitar and bass transcriptions for your daily practice sessions.',
    genre: 'practice', visibility: 'public', featured: false,
    author: 'RockTabs', authorInitial: 'R', authorColor: 'linear-gradient(135deg,#ef4444,#f97316)',
    tracks: ['tr_42','tr_43','tr_44','tr_45'],
    tags: ['rock','guitar','bass','classic'],
    likes: 1102, saves: 876, listens: 14500, createdAt: Date.now() - 12 * 86400000
  },
  {
    id: 'pl_011', title: 'Rainy Day Strings', emoji: '🎻', color: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    desc: 'Soothing string ensembles and chamber music for introspective listening.',
    genre: 'chill', visibility: 'public', featured: false,
    author: 'StringQuartet', authorInitial: 'S', authorColor: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
    tracks: ['tr_46','tr_47','tr_48'],
    tags: ['strings','classical','chill','chamber'],
    likes: 567, saves: 445, listens: 7100, createdAt: Date.now() - 6 * 86400000
  },
  {
    id: 'pl_012', title: 'Drummer\'s Power Hour', emoji: '🥁', color: 'linear-gradient(135deg,#dc2626,#7c3aed)',
    desc: 'High-intensity drumming exercises, fills, and grooves for intermediate to advanced players.',
    genre: 'workout', visibility: 'public', featured: false,
    author: 'GrooveStation', authorInitial: 'G', authorColor: 'linear-gradient(135deg,#dc2626,#7c3aed)',
    tracks: ['tr_49','tr_50','tr_51','tr_52','tr_53'],
    tags: ['drums','groove','fills','advanced','workout'],
    likes: 432, saves: 298, listens: 5900, createdAt: Date.now() - 9 * 86400000
  },
];

/* ===================================================
   DATA — Seed Tracks
=================================================== */
const SEED_TRACKS = {
  tr_01: { id:'tr_01', title:'Understanding Major Scales', artist:'Prof. Harmonia', cover:'🎼', duration:'4:23', bpm: 120 },
  tr_02: { id:'tr_02', title:'Circle of Fifths Explained', artist:'Prof. Harmonia', cover:'🎵', duration:'6:12', bpm: 80 },
  tr_03: { id:'tr_03', title:'Building Triads & Chords', artist:'Prof. Harmonia', cover:'🎹', duration:'5:45', bpm: 100 },
  tr_04: { id:'tr_04', title:'Modes & Their Colors', artist:'Prof. Harmonia', cover:'🎼', duration:'7:30', bpm: 90 },
  tr_05: { id:'tr_05', title:'Rhythm & Time Signatures', artist:'Prof. Harmonia', cover:'🥁', duration:'4:55', bpm: 110 },
  tr_06: { id:'tr_06', title:'Autumn Leaves (Bb Jazz)', artist:'JazzMaster88', cover:'🎷', duration:'5:10', bpm: 95 },
  tr_07: { id:'tr_07', title:'All The Things You Are', artist:'JazzMaster88', cover:'🎹', duration:'6:40', bpm: 88 },
  tr_08: { id:'tr_08', title:'Fly Me To The Moon', artist:'JazzMaster88', cover:'🎺', duration:'4:02', bpm: 120 },
  tr_09: { id:'tr_09', title:'Blue In Green (Miles Davis)', artist:'JazzMaster88', cover:'🎷', duration:'5:37', bpm: 60 },
  tr_10: { id:'tr_10', title:'Debussy — Clair de Lune', artist:'ClassicVibes', cover:'🌙', duration:'5:09', bpm: 55 },
  tr_11: { id:'tr_11', title:'Bach — Goldberg Variations', artist:'ClassicVibes', cover:'🎹', duration:'8:21', bpm: 72 },
  tr_12: { id:'tr_12', title:'Chopin — Nocturne Op.9', artist:'ClassicVibes', cover:'🎼', duration:'4:44', bpm: 58 },
  tr_13: { id:'tr_13', title:'Satie — Gymnopédie No.1', artist:'ClassicVibes', cover:'🌿', duration:'3:22', bpm: 52 },
  tr_14: { id:'tr_14', title:'Beethoven — Moonlight Sonata', artist:'ClassicVibes', cover:'🌕', duration:'6:12', bpm: 50 },
  tr_15: { id:'tr_15', title:'Mozart — Piano Sonata K331', artist:'ClassicVibes', cover:'🎵', duration:'7:05', bpm: 78 },
  tr_16: { id:'tr_16', title:'Pentatonic Scale Drills', artist:'RiffKing', cover:'🎸', duration:'3:15', bpm: 140 },
  tr_17: { id:'tr_17', title:'Sweep Picking Intro', artist:'RiffKing', cover:'⚡', duration:'4:50', bpm: 160 },
  tr_18: { id:'tr_18', title:'Legato Runs in A Minor', artist:'RiffKing', cover:'🎸', duration:'3:40', bpm: 150 },
  tr_19: { id:'tr_19', title:'Blues Shuffle in E', artist:'RiffKing', cover:'🎵', duration:'4:10', bpm: 130 },
  tr_20: { id:'tr_20', title:'Finger Strength Exercise', artist:'RiffKing', cover:'💪', duration:'2:55', bpm: 90 },
  tr_21: { id:'tr_21', title:'lo-fi study beats vol.1', artist:'LofiGuru', cover:'☁️', duration:'3:42', bpm: 75 },
  tr_22: { id:'tr_22', title:'rainy window chill', artist:'LofiGuru', cover:'🌧️', duration:'4:18', bpm: 70 },
  tr_23: { id:'tr_23', title:'late night practice', artist:'LofiGuru', cover:'🌙', duration:'3:55', bpm: 80 },
  tr_24: { id:'tr_24', title:'café jazz vibes', artist:'LofiGuru', cover:'☕', duration:'4:30', bpm: 85 },
  tr_25: { id:'tr_25', title:'Middle C & The Hand Position', artist:'PianoPath', cover:'🎹', duration:'3:20', bpm: 60 },
  tr_26: { id:'tr_26', title:'Simple Melodies in C Major', artist:'PianoPath', cover:'🎵', duration:'4:05', bpm: 70 },
  tr_27: { id:'tr_27', title:'Both Hands Together', artist:'PianoPath', cover:'🙌', duration:'5:10', bpm: 65 },
  tr_28: { id:'tr_28', title:'Twinkle Variations', artist:'PianoPath', cover:'⭐', duration:'4:40', bpm: 80 },
  tr_29: { id:'tr_29', title:'Ode To Joy Full Arrangement', artist:'PianoPath', cover:'🎼', duration:'3:55', bpm: 88 },
  tr_30: { id:'tr_30', title:'Sound Design 101 — Synth Basics', artist:'BeatLab', cover:'🎛️', duration:'6:22', bpm: 128 },
  tr_31: { id:'tr_31', title:'4-on-the-Floor Kick Patterns', artist:'BeatLab', cover:'🥁', duration:'3:48', bpm: 128 },
  tr_32: { id:'tr_32', title:'Sidechain Compression Demo', artist:'BeatLab', cover:'🔊', duration:'4:55', bpm: 140 },
  tr_33: { id:'tr_33', title:'Arpeggiator Magic', artist:'BeatLab', cover:'✨', duration:'5:12', bpm: 130 },
  tr_34: { id:'tr_34', title:'5-Minute Finger Stretch', artist:'MorningMusician', cover:'🌅', duration:'5:00', bpm: 70 },
  tr_35: { id:'tr_35', title:'Long Tones for Wind Players', artist:'MorningMusician', cover:'🎺', duration:'4:30', bpm: 60 },
  tr_36: { id:'tr_36', title:'Bowing Warm-Up for Strings', artist:'MorningMusician', cover:'🎻', duration:'4:00', bpm: 65 },
  tr_37: { id:'tr_37', title:'Unison & Octave Recognition', artist:'EarPro', cover:'👂', duration:'3:30', bpm: 80 },
  tr_38: { id:'tr_38', title:'Major vs Minor 3rd', artist:'EarPro', cover:'🎵', duration:'4:15', bpm: 75 },
  tr_39: { id:'tr_39', title:'Perfect 4th & 5th', artist:'EarPro', cover:'🎼', duration:'3:55', bpm: 78 },
  tr_40: { id:'tr_40', title:'Tritone — The Devil\'s Interval', artist:'EarPro', cover:'😈', duration:'5:10', bpm: 85 },
  tr_41: { id:'tr_41', title:'All 12 Intervals Rapid Fire', artist:'EarPro', cover:'⚡', duration:'8:22', bpm: 90 },
  tr_42: { id:'tr_42', title:'Stairway to Heaven — Full Tab', artist:'RockTabs', cover:'🎸', duration:'7:59', bpm: 72 },
  tr_43: { id:'tr_43', title:'Whole Lotta Love — Bass Line', artist:'RockTabs', cover:'🎵', duration:'5:33', bpm: 89 },
  tr_44: { id:'tr_44', title:'Smoke on the Water Breakdown', artist:'RockTabs', cover:'🔥', duration:'4:20', bpm: 112 },
  tr_45: { id:'tr_45', title:'Bohemian Rhapsody Piano', artist:'RockTabs', cover:'👑', duration:'5:55', bpm: 76 },
  tr_46: { id:'tr_46', title:'Barber — Adagio for Strings', artist:'StringQuartet', cover:'🎻', duration:'8:30', bpm: 44 },
  tr_47: { id:'tr_47', title:'Vivaldi — Winter (Largo)', artist:'StringQuartet', cover:'❄️', duration:'3:48', bpm: 52 },
  tr_48: { id:'tr_48', title:'Piazzolla — Libertango', artist:'StringQuartet', cover:'🌹', duration:'4:14', bpm: 110 },
  tr_49: { id:'tr_49', title:'Paradiddle Power Set', artist:'GrooveStation', cover:'🥁', duration:'4:00', bpm: 160 },
  tr_50: { id:'tr_50', title:'Ghost Note Grooves', artist:'GrooveStation', cover:'👻', duration:'3:45', bpm: 140 },
  tr_51: { id:'tr_51', title:'Jazz Brush Patterns', artist:'GrooveStation', cover:'🎵', duration:'5:10', bpm: 120 },
  tr_52: { id:'tr_52', title:'Blast Beat Training', artist:'GrooveStation', cover:'💣', duration:'2:30', bpm: 220 },
  tr_53: { id:'tr_53', title:'Linear Drumming Vol.2', artist:'GrooveStation', cover:'📐', duration:'6:20', bpm: 100 },
};

/* ===================================================
   STATE
=================================================== */
const PL_KEY = 'harmonia_playlists';
const LIKED_KEY  = 'harmonia_pl_liked';
const SAVED_KEY  = 'harmonia_pl_saved';

let state = {
  playlists: [],
  myPlaylists: [],
  filter: 'all',
  sort: 'popular',
  search: '',
  view: 'grid',
  visibleCount: 8,
  editingId: null,
  detailId: null,
  liked: new Set(),
  saved: new Set(),
  // Player
  queue: [],
  queuePlaylistId: null,
  currentTrackIndex: 0,
  isPlaying: false,
  isShuffle: false,
  isRepeat: false,
  volume: 0.7,
  progress: 0,
  playerTimer: null,
  // Create modal temp state
  createEmoji: '🎵',
  createColor: 'linear-gradient(135deg,#7c3aed,#ec4899)',
  createTags: [],
  createSelectedTracks: [],
};

/* ===================================================
   LOCAL STORAGE
=================================================== */
function loadData() {
  try {
    const raw = localStorage.getItem(PL_KEY);
    state.playlists = raw ? JSON.parse(raw) : [...SEED_PLAYLISTS];
    const likedRaw = localStorage.getItem(LIKED_KEY);
    if (likedRaw) state.liked = new Set(JSON.parse(likedRaw));
    const savedRaw = localStorage.getItem(SAVED_KEY);
    if (savedRaw) state.saved = new Set(JSON.parse(savedRaw));
    state.myPlaylists = (JSON.parse(localStorage.getItem('harmonia_my_playlists') || '[]'));
  } catch(e) {
    state.playlists = [...SEED_PLAYLISTS];
  }
}

function saveData() {
  try {
    localStorage.setItem(PL_KEY, JSON.stringify(state.playlists));
    localStorage.setItem(LIKED_KEY, JSON.stringify([...state.liked]));
    localStorage.setItem(SAVED_KEY, JSON.stringify([...state.saved]));
    localStorage.setItem('harmonia_my_playlists', JSON.stringify(state.myPlaylists));
  } catch(e) {}
}

/* ===================================================
   INIT
=================================================== */
document.addEventListener('DOMContentLoaded', () => {
  loadData();
  updateHeroStats();
  renderFeatured();
  renderMyPlaylists();
  renderBrowse();
  renderTrendingTracks();
  initPlayer();
  // Animate elements in
  observeAnimations();
});

/* ===================================================
   HERO STATS
=================================================== */
function updateHeroStats() {
  const all = state.playlists;
  const myCount = state.myPlaylists.length;
  const totalPl = all.length + myCount;
  const totalTracks = all.reduce((s,p) => s + p.tracks.length, 0);
  const totalListens = all.reduce((s,p) => s + p.listens, 0);
  const uniqueAuthors = new Set(all.map(p => p.author)).size;

  animateCount('totalPlaylists', totalPl);
  animateCount('totalTracks', totalTracks);
  animateCount('totalListens', totalListens, true);
  animateCount('totalCreators', uniqueAuthors);
}

function animateCount(id, target, compact = false) {
  const el = document.getElementById(id);
  if (!el) return;
  let start = 0;
  const step = Math.ceil(target / 40);
  const timer = setInterval(() => {
    start = Math.min(start + step, target);
    el.textContent = compact ? formatCompact(start) : start.toLocaleString();
    if (start >= target) clearInterval(timer);
  }, 30);
}

function formatCompact(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toString();
}

/* ===================================================
   FEATURED SECTION
=================================================== */
function renderFeatured() {
  const grid = document.getElementById('featuredGrid');
  if (!grid) return;
  const featured = state.playlists.filter(p => p.featured);
  grid.innerHTML = '';

  featured.forEach((pl, i) => {
    const div = document.createElement('div');
    div.className = 'featured-card' + (pl.featuredWide ? ' featured-card-wide' : '');
    div.innerHTML = `
      <div class="fc-bg" style="background:${pl.color}">${pl.emoji}</div>
      <div class="fc-overlay"></div>
      <button class="fc-play-btn" onclick="playPlaylistById('${pl.id}',event)">
        <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      </button>
      <div class="fc-content">
        <div class="fc-badge">${genreLabel(pl.genre)}</div>
        <div class="fc-title">${esc(pl.title)}</div>
        <div class="fc-meta">${pl.tracks.length} tracks · ${formatListens(pl.listens)} listens</div>
      </div>
    `;
    div.addEventListener('click', (e) => {
      if (!e.target.closest('.fc-play-btn')) openDetailModal(pl.id);
    });
    grid.appendChild(div);
  });
}

/* ===================================================
   MY PLAYLISTS
=================================================== */
function renderMyPlaylists() {
  const grid = document.getElementById('myPlaylistsGrid');
  const empty = document.getElementById('emptyMyPlaylists');
  if (!grid) return;

  if (!state.myPlaylists.length) {
    grid.style.display = 'none';
    empty.style.display = 'flex';
    return;
  }
  grid.style.display = 'grid';
  empty.style.display = 'none';
  grid.innerHTML = '';

  state.myPlaylists.forEach((pl) => {
    const card = document.createElement('div');
    card.className = 'my-pl-card';
    card.innerHTML = `
      <div class="my-pl-cover" style="background:${pl.color}">
        <span>${pl.emoji}</span>
        <div class="my-pl-cover-play">▶</div>
      </div>
      <div class="my-pl-name" title="${esc(pl.title)}">${esc(pl.title)}</div>
      <div class="my-pl-meta">${pl.tracks.length} track${pl.tracks.length !== 1 ? 's' : ''} · ${pl.visibility}</div>
      <div class="my-pl-actions">
        <button class="my-pl-action" onclick="editMyPlaylist('${pl.id}',event)" title="Edit">✏️</button>
        <button class="my-pl-action" onclick="deleteMyPlaylist('${pl.id}',event)" title="Delete">🗑️</button>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.my-pl-action')) openDetailModal(pl.id);
    });
    grid.appendChild(card);
  });
}

function editMyPlaylist(id, e) {
  e.stopPropagation();
  const pl = state.myPlaylists.find(p => p.id === id);
  if (!pl) return;
  state.editingId = id;
  openCreateModal(pl);
}

function deleteMyPlaylist(id, e) {
  e.stopPropagation();
  if (!confirm('Delete this playlist?')) return;
  state.myPlaylists = state.myPlaylists.filter(p => p.id !== id);
  saveData();
  renderMyPlaylists();
  showToast('Playlist deleted.', 'info');
}

/* ===================================================
   BROWSE
=================================================== */
function getFilteredPlaylists() {
  const all = [...state.playlists, ...state.myPlaylists];
  let result = all.filter(pl => {
    const matchGenre = state.filter === 'all' || pl.genre === state.filter;
    const q = state.search.toLowerCase();
    const matchSearch = !q ||
      pl.title.toLowerCase().includes(q) ||
      pl.desc.toLowerCase().includes(q) ||
      (pl.tags || []).some(t => t.includes(q)) ||
      pl.author.toLowerCase().includes(q);
    return matchGenre && matchSearch;
  });

  // Sort
  if (state.sort === 'popular') result.sort((a,b) => b.likes - a.likes);
  else if (state.sort === 'newest') result.sort((a,b) => b.createdAt - a.createdAt);
  else if (state.sort === 'tracks') result.sort((a,b) => b.tracks.length - a.tracks.length);
  else if (state.sort === 'alpha') result.sort((a,b) => a.title.localeCompare(b.title));

  return result;
}

function renderBrowse() {
  const grid = document.getElementById('playlistsGrid');
  const empty = document.getElementById('browseEmpty');
  const countEl = document.getElementById('browseCount');
  const loadMoreWrap = document.getElementById('loadMoreWrap');
  if (!grid) return;

  const all = getFilteredPlaylists();
  const visible = all.slice(0, state.visibleCount);

  countEl.textContent = `${all.length} playlist${all.length !== 1 ? 's' : ''}`;

  if (!all.length) {
    grid.innerHTML = '';
    empty.style.display = 'flex';
    loadMoreWrap.style.display = 'none';
    return;
  }
  empty.style.display = 'none';
  loadMoreWrap.style.display = all.length > state.visibleCount ? 'flex' : 'none';

  grid.innerHTML = '';
  grid.className = 'playlists-grid' + (state.view === 'list' ? ' list-view' : '');

  visible.forEach(pl => {
    const isLiked = state.liked.has(pl.id);
    const isSaved = state.saved.has(pl.id);
    const dur = playlistDuration(pl);

    const card = document.createElement('div');
    card.className = 'pl-card';
    card.innerHTML = `
      <div class="pl-card-cover" style="background:${pl.color}">
        <span>${pl.emoji}</span>
        <div class="pl-card-cover-overlay">
          <button class="pl-cover-btn" onclick="playPlaylistById('${pl.id}',event)" title="Play">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          </button>
          <button class="pl-cover-btn" onclick="openDetailModal('${pl.id}');event.stopPropagation()" title="View">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
        </div>
      </div>
      <div class="pl-card-body">
        <div class="pl-card-title">${esc(pl.title)}</div>
        <div class="pl-card-desc">${esc(pl.desc)}</div>
        <div class="pl-card-meta">
          <div class="pl-card-stats">
            <span class="pl-card-stat">
              <svg viewBox="0 0 24 24" fill="${isLiked?'#ec4899':'none'}" stroke="${isLiked?'#ec4899':'currentColor'}" stroke-width="2" width="12" height="12"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              ${formatCompact(pl.likes)}
            </span>
            <span class="pl-card-stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
              ${pl.tracks.length}
            </span>
          </div>
          <div class="pl-card-actions">
            <button class="pl-action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike('${pl.id}',event)" title="Like">
              <svg viewBox="0 0 24 24" fill="${isLiked?'currentColor':'none'}" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            </button>
            <button class="pl-action-btn ${isSaved ? 'saved' : ''}" onclick="toggleSave('${pl.id}',event)" title="Save">
              <svg viewBox="0 0 24 24" fill="${isSaved?'currentColor':'none'}" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
            </button>
          </div>
        </div>
      </div>
      <div class="pl-card-author">
        <div class="pl-author-avatar" style="background:${pl.authorColor||'#7c3aed'}">${pl.authorInitial||'?'}</div>
        <span>${esc(pl.author)}</span>
        <span class="pl-card-tag pt-${pl.genre||'learning'}">${genreLabel(pl.genre)}</span>
      </div>
    `;
    card.addEventListener('click', (e) => {
      if (!e.target.closest('.pl-action-btn') && !e.target.closest('.pl-cover-btn')) {
        openDetailModal(pl.id);
      }
    });
    grid.appendChild(card);
  });
}

function setFilter(f, btn) {
  state.filter = f;
  state.visibleCount = 8;
  document.querySelectorAll('.browse-filter').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  else {
    const b = document.querySelector(`.browse-filter[data-filter="${f}"]`);
    if (b) b.classList.add('active');
  }
  renderBrowse();
}

function sortPlaylists() {
  state.sort = document.getElementById('sortSelect').value;
  state.visibleCount = 8;
  renderBrowse();
}

function filterPlaylists() {
  state.search = document.getElementById('browseSearch').value;
  state.visibleCount = 8;
  const clearBtn = document.getElementById('clearSearch');
  if (clearBtn) clearBtn.style.display = state.search ? 'block' : 'none';
  renderBrowse();
}

function clearBrowseSearch() {
  document.getElementById('browseSearch').value = '';
  state.search = '';
  document.getElementById('clearSearch').style.display = 'none';
  renderBrowse();
}

function setView(v) {
  state.view = v;
  document.getElementById('gridViewBtn').classList.toggle('active', v === 'grid');
  document.getElementById('listViewBtn').classList.toggle('active', v === 'list');
  renderBrowse();
}

function loadMore() {
  state.visibleCount += 8;
  renderBrowse();
}

/* ===================================================
   LIKE / SAVE
=================================================== */
function toggleLike(id, e) {
  if (e) e.stopPropagation();
  const pl = findPlaylist(id);
  if (!pl) return;
  if (state.liked.has(id)) {
    state.liked.delete(id);
    pl.likes = Math.max(0, pl.likes - 1);
    showToast('Removed like.', 'info');
  } else {
    state.liked.add(id);
    pl.likes++;
    showToast('❤️ Liked!', 'success');
    if (typeof HarmoniaDB !== 'undefined') HarmoniaDB.addXP(5, 'Liked a playlist');
  }
  saveData();
  renderBrowse();
  // update detail if open
  if (state.detailId === id) {
    document.getElementById('detailLikeCount').textContent = pl.likes;
    document.getElementById('detailLikeBtn').classList.toggle('liked', state.liked.has(id));
  }
}

function toggleSave(id, e) {
  if (e) e.stopPropagation();
  const pl = findPlaylist(id);
  if (!pl) return;
  if (state.saved.has(id)) {
    state.saved.delete(id);
    pl.saves = Math.max(0, pl.saves - 1);
    showToast('Removed from saved.', 'info');
  } else {
    state.saved.add(id);
    pl.saves++;
    showToast('🔖 Saved to library!', 'success');
    if (typeof HarmoniaDB !== 'undefined') HarmoniaDB.addXP(3, 'Saved a playlist');
  }
  saveData();
  renderBrowse();
}

/* ===================================================
   DETAIL MODAL
=================================================== */
function openDetailModal(id) {
  const pl = findPlaylist(id);
  if (!pl) return;
  state.detailId = id;

  // Fill hero
  document.getElementById('detailCover').style.background = pl.color;
  document.getElementById('detailCoverEmoji').textContent = pl.emoji;
  document.getElementById('detailTag').textContent = genreLabel(pl.genre).toUpperCase() + ' PLAYLIST';
  document.getElementById('detailTitle').textContent = pl.title;
  document.getElementById('detailDesc').textContent = pl.desc;
  document.getElementById('detailAvatar').textContent = pl.authorInitial || '?';
  document.getElementById('detailAvatar').style.background = pl.authorColor || '#7c3aed';
  document.getElementById('detailAuthor').textContent = pl.author;
  document.getElementById('detailTrackCount').textContent = `${pl.tracks.length} track${pl.tracks.length!==1?'s':''}`;
  document.getElementById('detailDuration').textContent = playlistDuration(pl);
  document.getElementById('detailListens').textContent = `${formatListens(pl.listens)} listens`;
  document.getElementById('detailLikeCount').textContent = pl.likes;
  document.getElementById('detailLikeBtn').classList.toggle('liked', state.liked.has(id));
  document.getElementById('detailSaveText').textContent = state.saved.has(id) ? 'Saved' : 'Save';
  document.getElementById('detailSaveBtn').classList.toggle('saved', state.saved.has(id));

  // Edit button for own playlists
  const isOwn = state.myPlaylists.some(p => p.id === id);
  document.getElementById('detailEditBtn').style.display = isOwn ? 'flex' : 'none';

  // Tracklist
  const list = document.getElementById('detailTracklist');
  list.innerHTML = '';
  pl.tracks.forEach((tid, i) => {
    const tr = SEED_TRACKS[tid] || { id: tid, title: 'Unknown Track', artist: 'Unknown', cover: '🎵', duration: '0:00' };
    const row = document.createElement('div');
    row.className = 'detail-track' + (state.queue[state.currentTrackIndex] === tid && state.queuePlaylistId === id ? ' playing' : '');
    row.innerHTML = `
      <div class="dt-num">${i+1}</div>
      <div class="dt-cover" style="background:${pl.color}">${tr.cover}</div>
      <div class="dt-info">
        <div class="dt-title">${esc(tr.title)}</div>
        <div class="dt-artist">${esc(tr.artist)}</div>
      </div>
      <div class="dt-dur">${tr.duration}</div>
    `;
    row.addEventListener('click', () => {
      loadPlaylist(id, i);
      closeDetailModal(null, true);
    });
    list.appendChild(row);
  });

  document.getElementById('detailModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeDetailModal(e, force = false) {
  if (!force && e && e.target !== document.getElementById('detailModalOverlay')) return;
  document.getElementById('detailModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
  state.detailId = null;
}

function togglePlaylistLike() {
  if (state.detailId) toggleLike(state.detailId, null);
}

function toggleSavePlaylist() {
  if (state.detailId) toggleSave(state.detailId, null);
}

function sharePlaylist() {
  const pl = findPlaylist(state.detailId);
  if (!pl) return;
  if (navigator.clipboard) {
    navigator.clipboard.writeText(window.location.href + '#' + state.detailId).then(() => {
      showToast('🔗 Link copied to clipboard!', 'success');
    });
  } else {
    showToast('🔗 Link ready to share!', 'info');
  }
}

function editPlaylist() {
  if (!state.detailId) return;
  const pl = state.myPlaylists.find(p => p.id === state.detailId);
  if (!pl) return;
  closeDetailModal(null, true);
  state.editingId = state.detailId;
  openCreateModal(pl);
}

/* ===================================================
   CREATE / EDIT MODAL
=================================================== */
function openCreateModal(existing = null) {
  state.editingId = existing ? existing.id : null;
  state.createEmoji = existing ? existing.emoji : '🎵';
  state.createColor = existing ? existing.color : 'linear-gradient(135deg,#7c3aed,#ec4899)';
  state.createTags = existing ? [...(existing.tags || [])] : [];
  state.createSelectedTracks = existing ? [...existing.tracks] : [];

  // Reset form
  document.getElementById('createModalTitle').textContent = existing ? 'Edit Playlist' : 'Create New Playlist';
  document.getElementById('savePlaylistText').textContent = existing ? 'Save Changes' : 'Create Playlist';
  document.getElementById('plName').value = existing ? existing.title : '';
  document.getElementById('plDesc').value = existing ? existing.desc : '';
  document.getElementById('plGenre').value = existing ? (existing.genre || '') : '';
  document.getElementById('plVisibility').value = existing ? (existing.visibility || 'public') : 'public';
  updateCharCount(document.getElementById('plName'), 'nameCount', 60);
  updateCharCount(document.getElementById('plDesc'), 'descCount', 200);

  // Cover
  document.getElementById('coverPreview').style.background = state.createColor;
  document.getElementById('coverEmoji').textContent = state.createEmoji;
  document.querySelectorAll('.emoji-opt').forEach(el => {
    el.classList.toggle('active', el.textContent === state.createEmoji);
  });
  document.querySelectorAll('.color-opt').forEach(el => {
    el.classList.toggle('active', el.style.background === state.createColor || el.getAttribute('onclick')?.includes(state.createColor));
  });

  // Tags
  renderTagPills();

  // Selected tracks
  renderSelectedTracks();

  // Clear search
  document.getElementById('trackSearch').value = '';
  document.getElementById('trackResults').innerHTML = '';

  document.getElementById('createModalOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => document.getElementById('plName').focus(), 100);
}

function closeCreateModal(e, force = false) {
  if (!force && e && e.target !== document.getElementById('createModalOverlay')) return;
  document.getElementById('createModalOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

function setCoverEmoji(btn, emoji) {
  state.createEmoji = emoji;
  document.querySelectorAll('.emoji-opt').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('coverEmoji').textContent = emoji;
}

function setCoverColor(btn, color) {
  state.createColor = color;
  document.querySelectorAll('.color-opt').forEach(el => el.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('coverPreview').style.background = color;
}

function updateCharCount(input, countId, max) {
  const el = document.getElementById(countId);
  if (el) el.textContent = input.value.length;
}

/* Tags */
function handleTagInput(e) {
  if (e.key === 'Enter' || e.key === ',') {
    e.preventDefault();
    const val = e.target.value.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (val && !state.createTags.includes(val) && state.createTags.length < 8) {
      state.createTags.push(val);
      renderTagPills();
    }
    e.target.value = '';
  }
}

function renderTagPills() {
  const container = document.getElementById('tagPills');
  container.innerHTML = '';
  state.createTags.forEach(tag => {
    const pill = document.createElement('span');
    pill.className = 'tag-pill';
    pill.innerHTML = `${esc(tag)}<button class="tag-pill-remove" onclick="removeTag('${esc(tag)}')">×</button>`;
    container.appendChild(pill);
  });
}

function removeTag(tag) {
  state.createTags = state.createTags.filter(t => t !== tag);
  renderTagPills();
}

/* Track search */
function searchTracks(q) {
  const container = document.getElementById('trackResults');
  if (!q.trim()) { container.innerHTML = ''; return; }
  const results = Object.values(SEED_TRACKS).filter(tr =>
    tr.title.toLowerCase().includes(q.toLowerCase()) ||
    tr.artist.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 8);

  container.innerHTML = '';
  results.forEach(tr => {
    const isAdded = state.createSelectedTracks.includes(tr.id);
    const div = document.createElement('div');
    div.className = 'track-result-item' + (isAdded ? ' added' : '');
    div.innerHTML = `
      <div class="tri-cover">${tr.cover}</div>
      <div class="tri-info">
        <div class="tri-title">${esc(tr.title)}</div>
        <div class="tri-artist">${esc(tr.artist)}</div>
      </div>
      <span class="tri-dur" style="font-size:0.72rem;color:var(--muted);margin-right:4px">${tr.duration}</span>
      <button class="tri-add" onclick="addTrackToPlaylist('${tr.id}')" ${isAdded ? 'disabled' : ''}>
        ${isAdded ? '✓' : '+'}
      </button>
    `;
    container.appendChild(div);
  });

  if (!results.length) {
    container.innerHTML = '<p style="font-size:0.8rem;color:var(--muted);padding:8px 12px">No tracks found</p>';
  }
}

function addTrackToPlaylist(id) {
  if (!state.createSelectedTracks.includes(id)) {
    state.createSelectedTracks.push(id);
    renderSelectedTracks();
    searchTracks(document.getElementById('trackSearch').value);
    showToast('✓ Track added!', 'success');
  }
}

function removeTrackFromPlaylist(id) {
  state.createSelectedTracks = state.createSelectedTracks.filter(t => t !== id);
  renderSelectedTracks();
  searchTracks(document.getElementById('trackSearch').value);
}

function renderSelectedTracks() {
  const container = document.getElementById('selectedTracks');
  if (!state.createSelectedTracks.length) {
    container.innerHTML = '<p class="no-tracks-msg">No tracks added yet</p>';
    return;
  }
  container.innerHTML = '';
  state.createSelectedTracks.forEach((tid, i) => {
    const tr = SEED_TRACKS[tid] || { title: 'Unknown', artist: '—', cover: '🎵', duration: '0:00' };
    const div = document.createElement('div');
    div.className = 'selected-track';
    div.innerHTML = `
      <span class="st-num">${i+1}</span>
      <div class="st-cover">${tr.cover}</div>
      <div class="st-info">
        <div class="st-title">${esc(tr.title)}</div>
        <div class="st-artist">${esc(tr.artist)}</div>
      </div>
      <span class="st-dur">${tr.duration}</span>
      <button class="st-remove" onclick="removeTrackFromPlaylist('${tid}')">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    `;
    container.appendChild(div);
  });
}

function savePlaylist() {
  const name = document.getElementById('plName').value.trim();
  if (!name) { showToast('Please enter a playlist name.', 'error'); return; }

  const pl = {
    id: state.editingId || ('my_' + Date.now()),
    title: name,
    emoji: state.createEmoji,
    color: state.createColor,
    desc: document.getElementById('plDesc').value.trim(),
    genre: document.getElementById('plGenre').value || 'learning',
    visibility: document.getElementById('plVisibility').value,
    author: 'You',
    authorInitial: 'Y',
    authorColor: 'linear-gradient(135deg,#a78bfa,#ec4899)',
    tracks: [...state.createSelectedTracks],
    tags: [...state.createTags],
    likes: state.editingId ? (state.myPlaylists.find(p => p.id === state.editingId)?.likes || 0) : 0,
    saves: 0,
    listens: state.editingId ? (state.myPlaylists.find(p => p.id === state.editingId)?.listens || 0) : 0,
    createdAt: state.editingId ? (state.myPlaylists.find(p => p.id === state.editingId)?.createdAt || Date.now()) : Date.now(),
    featured: false,
  };

  if (state.editingId) {
    const idx = state.myPlaylists.findIndex(p => p.id === state.editingId);
    if (idx !== -1) state.myPlaylists[idx] = pl;
    showToast('✅ Playlist updated!', 'success');
  } else {
    state.myPlaylists.unshift(pl);
    showToast('🎵 Playlist created!', 'success');
    if (typeof HarmoniaDB !== 'undefined') HarmoniaDB.addXP(10, 'Created a playlist');
  }

  saveData();
  closeCreateModal(null, true);
  renderMyPlaylists();
  renderBrowse();
  updateHeroStats();
}

/* ===================================================
   TRENDING TRACKS
=================================================== */
function renderTrendingTracks() {
  const container = document.getElementById('trendingTracks');
  if (!container) return;

  // Pick 10 diverse tracks
  const picks = ['tr_05','tr_10','tr_21','tr_06','tr_16','tr_42','tr_03','tr_24','tr_48','tr_41'];
  container.innerHTML = '';

  picks.forEach((tid, i) => {
    const tr = SEED_TRACKS[tid];
    if (!tr) return;
    // Find what playlist it belongs to
    const pl = state.playlists.find(p => p.tracks.includes(tid));
    const isPlaying = state.queue[state.currentTrackIndex] === tid && state.isPlaying;
    const isLiked = state.liked.has(tid);

    const row = document.createElement('div');
    row.className = 'track-row' + (isPlaying ? ' playing' : '');
    row.innerHTML = `
      <div class="track-num">${isPlaying ? '<div class="eq-mini"><span></span><span></span><span></span></div>' : (i+1)}</div>
      <div class="track-cover" style="background:${pl ? pl.color : 'linear-gradient(135deg,#7c3aed,#ec4899)'}">
        ${tr.cover}
        <div class="track-cover-play">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        </div>
      </div>
      <div class="track-info">
        <div class="track-title">${esc(tr.title)}</div>
        <div class="track-artist">${esc(tr.artist)}</div>
      </div>
      ${pl ? `<div class="track-playlist">📂 ${esc(pl.title)}</div>` : ''}
      <div class="track-duration">${tr.duration}</div>
      <div class="track-actions">
        <button class="track-action ${isLiked ? 'liked' : ''}" onclick="toggleTrackLike('${tid}',this)" title="Like">
          <svg viewBox="0 0 24 24" fill="${isLiked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" width="15" height="15"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        </button>
        <button class="track-action" onclick="addTrackToQueue('${tid}')" title="Add to queue">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="15" height="15"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        </button>
      </div>
    `;
    row.addEventListener('click', (e) => {
      if (!e.target.closest('.track-action')) {
        playTrack(tid, pl ? pl.id : null);
      }
    });
    container.appendChild(row);
  });
}

function toggleTrackLike(tid, btn) {
  btn.classList.toggle('liked');
  const svg = btn.querySelector('svg');
  const isNowLiked = btn.classList.contains('liked');
  svg.setAttribute('fill', isNowLiked ? 'currentColor' : 'none');
  showToast(isNowLiked ? '❤️ Liked!' : 'Removed like.', isNowLiked ? 'success' : 'info');
}

function addTrackToQueue(tid) {
  if (!state.queue.includes(tid)) {
    state.queue.push(tid);
    showToast('✚ Added to queue!', 'success');
  } else {
    showToast('Already in queue.', 'info');
  }
}

/* ===================================================
   MUSIC PLAYER (simulated)
=================================================== */
function initPlayer() {
  // Set initial widget state
  updateWidgetState();
}

function loadPlaylist(plId, startIndex = 0) {
  const pl = findPlaylist(plId);
  if (!pl || !pl.tracks.length) return;
  state.queue = [...pl.tracks];
  state.queuePlaylistId = plId;
  state.currentTrackIndex = startIndex;
  state.isPlaying = false;
  state.progress = 0;
  loadTrackIntoWidget(state.queue[state.currentTrackIndex]);
  togglePlay();
  pl.listens++;
  saveData();
}

function playPlaylistById(plId, e) {
  if (e) e.stopPropagation();
  loadPlaylist(plId, 0);
}

function playPlaylist() {
  if (state.detailId) loadPlaylist(state.detailId, 0);
}

function playTrack(tid, plId) {
  if (plId) {
    const pl = findPlaylist(plId);
    if (pl) {
      state.queue = [...pl.tracks];
      state.queuePlaylistId = plId;
      state.currentTrackIndex = pl.tracks.indexOf(tid);
      if (state.currentTrackIndex < 0) state.currentTrackIndex = 0;
    }
  } else {
    state.queue = [tid];
    state.queuePlaylistId = null;
    state.currentTrackIndex = 0;
  }
  state.isPlaying = false;
  state.progress = 0;
  loadTrackIntoWidget(tid);
  togglePlay();
}

function loadTrackIntoWidget(tid) {
  const tr = SEED_TRACKS[tid] || { title: 'Unknown', artist: '—', cover: '🎵', duration: '0:00' };
  // Widget
  document.getElementById('npwTrack').textContent = tr.title;
  document.getElementById('npwArtist').textContent = tr.artist;
  document.getElementById('npwDuration').textContent = tr.duration;
  document.getElementById('npwCurrentTime').textContent = '0:00';
  document.getElementById('npwFill').style.width = '0%';
  document.getElementById('npwThumb').style.left = '0%';
  document.getElementById('npwLabelText').textContent = tr.cover.slice(0,2);

  // Mini player
  document.getElementById('mpTitle').textContent = tr.title;
  document.getElementById('mpArtist').textContent = tr.artist;
  document.getElementById('mpCover').textContent = tr.cover;
  document.getElementById('mpFill').style.width = '0%';
  document.getElementById('miniPlayer').style.display = 'flex';
}

function togglePlay() {
  if (!state.queue.length) return;
  state.isPlaying = !state.isPlaying;
  updatePlayButtons();
  updateVinyl();
  if (state.isPlaying) {
    startProgressTimer();
    document.getElementById('npwDot').classList.remove('inactive');
    document.getElementById('npwStatus').textContent = 'Now Playing';
  } else {
    clearInterval(state.playerTimer);
    document.getElementById('npwDot').classList.add('inactive');
    document.getElementById('npwStatus').textContent = 'Paused';
  }
}

function updatePlayButtons() {
  const playIcons  = document.querySelectorAll('.play-icon');
  const pauseIcons = document.querySelectorAll('.pause-icon');
  playIcons.forEach(el  => el.style.display = state.isPlaying ? 'none' : 'block');
  pauseIcons.forEach(el => el.style.display = state.isPlaying ? 'block' : 'none');
}

function updateVinyl() {
  const vinyl = document.getElementById('npwVinyl');
  if (state.isPlaying) vinyl.classList.add('spinning');
  else vinyl.classList.remove('spinning');
}

function startProgressTimer() {
  clearInterval(state.playerTimer);
  const tr = SEED_TRACKS[state.queue[state.currentTrackIndex]];
  const totalSecs = tr ? parseDuration(tr.duration) : 180;

  state.playerTimer = setInterval(() => {
    state.progress += 0.5;
    if (state.progress >= totalSecs) {
      if (state.isRepeat) {
        state.progress = 0;
      } else {
        playNext();
        return;
      }
    }
    const pct = Math.min(100, (state.progress / totalSecs) * 100);
    document.getElementById('npwFill').style.width = pct + '%';
    document.getElementById('npwThumb').style.left  = pct + '%';
    document.getElementById('mpFill').style.width  = pct + '%';
    document.getElementById('npwCurrentTime').textContent = formatTime(state.progress);
  }, 500);
}

function playNext() {
  if (!state.queue.length) return;
  if (state.isShuffle) {
    state.currentTrackIndex = Math.floor(Math.random() * state.queue.length);
  } else {
    state.currentTrackIndex = (state.currentTrackIndex + 1) % state.queue.length;
  }
  state.progress = 0;
  loadTrackIntoWidget(state.queue[state.currentTrackIndex]);
  if (state.isPlaying) startProgressTimer();
  renderTrendingTracks();
}

function playPrev() {
  if (!state.queue.length) return;
  if (state.progress > 5) {
    state.progress = 0;
    document.getElementById('npwFill').style.width = '0%';
    document.getElementById('npwCurrentTime').textContent = '0:00';
    return;
  }
  state.currentTrackIndex = (state.currentTrackIndex - 1 + state.queue.length) % state.queue.length;
  state.progress = 0;
  loadTrackIntoWidget(state.queue[state.currentTrackIndex]);
  if (state.isPlaying) startProgressTimer();
}

function toggleShuffle() {
  state.isShuffle = !state.isShuffle;
  document.getElementById('npwShuffle').classList.toggle('active', state.isShuffle);
  showToast(state.isShuffle ? '🔀 Shuffle on' : 'Shuffle off', 'info');
}

function toggleRepeat() {
  state.isRepeat = !state.isRepeat;
  document.getElementById('npwRepeat').classList.toggle('active', state.isRepeat);
  showToast(state.isRepeat ? '🔁 Repeat on' : 'Repeat off', 'info');
}

function setVolume(v) {
  state.volume = v / 100;
  document.getElementById('npwVolume').value = v;
}

function seekTrack(e, source = 'widget') {
  let bar, totalSecs;
  if (source === 'mini') {
    bar = document.querySelector('.mp-progress');
  } else {
    bar = document.getElementById('npwProgressBar');
  }
  if (!bar || !state.queue.length) return;
  const rect = bar.getBoundingClientRect();
  const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  const tr = SEED_TRACKS[state.queue[state.currentTrackIndex]];
  totalSecs = tr ? parseDuration(tr.duration) : 180;
  state.progress = pct * totalSecs;
  document.getElementById('npwFill').style.width  = (pct*100) + '%';
  document.getElementById('npwThumb').style.left  = (pct*100) + '%';
  document.getElementById('mpFill').style.width   = (pct*100) + '%';
  document.getElementById('npwCurrentTime').textContent = formatTime(state.progress);
}

function updateWidgetState() {
  updatePlayButtons();
}

function closeMiniPlayer() {
  state.isPlaying = false;
  clearInterval(state.playerTimer);
  updatePlayButtons();
  updateVinyl();
  document.getElementById('miniPlayer').style.display = 'none';
}

/* ===================================================
   HELPERS
=================================================== */
function findPlaylist(id) {
  return state.playlists.find(p => p.id === id) ||
         state.myPlaylists.find(p => p.id === id);
}

function playlistDuration(pl) {
  let total = 0;
  pl.tracks.forEach(tid => {
    const tr = SEED_TRACKS[tid];
    if (tr) total += parseDuration(tr.duration);
  });
  const m = Math.floor(total / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m/60)}h ${m%60}m`;
}

function parseDuration(str) {
  const parts = str.split(':').map(Number);
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m}:${s.toString().padStart(2,'0')}`;
}

function formatListens(n) {
  if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
  if (n >= 1000) return (n/1000).toFixed(1) + 'K';
  return n.toString();
}

function genreLabel(g) {
  const map = { learning:'📚 Learning', practice:'🎸 Practice', focus:'🎯 Focus', chill:'☁️ Chill', workout:'⚡ Workout', theory:'🎼 Theory' };
  return map[g] || g || 'General';
}

function esc(str) {
  return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function showToast(msg, type = 'success') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className = `toast ${type} show`;
  clearTimeout(window._plToastTimer);
  window._plToastTimer = setTimeout(() => t.classList.remove('show'), 3000);
}

/* ===================================================
   INTERSECTION OBSERVER
=================================================== */
function observeAnimations() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.style.opacity = '1';
        e.target.style.transform = 'none';
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.06 });

  const style = document.createElement('style');
  style.textContent = '.anim-init { opacity:0; transform:translateY(24px); transition:opacity 0.5s ease, transform 0.5s ease; }';
  document.head.appendChild(style);

  document.querySelectorAll('.featured-card, .pl-card, .track-row, .my-pl-card').forEach((el, i) => {
    el.classList.add('anim-init');
    el.style.transitionDelay = (i * 0.05) + 's';
    obs.observe(el);
  });
}
