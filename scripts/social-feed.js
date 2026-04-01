/**
 * social-feed.js — Harmonia Social Feed Page Controller
 * Full functionality: post creation, likes, comments, follows,
 * real-time activity, filtering, sorting, challenges, tags
 */

// ── DATA ─────────────────────────────────────────────────────────────────────

const AVATARS = ['sf-avatar-a','sf-avatar-b','sf-avatar-c','sf-avatar-d','sf-avatar-e','sf-avatar-f'];

const USERS = [
  { id: 1, name: 'Sofia Martinez',   initials: 'SM', avatar: 'sf-avatar-a', level: 'Level 8 · Virtuoso',    verified: true,  instrument: 'Guitar & Composition',   followers: 1243 },
  { id: 2, name: 'James Okonkwo',    initials: 'JO', avatar: 'sf-avatar-b', level: 'Level 11 · Legend',     verified: true,  instrument: 'Piano & Theory',          followers: 2876 },
  { id: 3, name: 'Aisha Rahman',     initials: 'AR', avatar: 'sf-avatar-c', level: 'Level 6 · Performer',   verified: false, instrument: 'Violin & History',        followers: 567  },
  { id: 4, name: 'Luca Bianchi',     initials: 'LB', avatar: 'sf-avatar-d', level: 'Level 5 · Musician',    verified: false, instrument: 'Drums & Rhythm',          followers: 345  },
  { id: 5, name: 'Mei Lin',          initials: 'ML', avatar: 'sf-avatar-e', level: 'Level 9 · Maestro',     verified: true,  instrument: 'Cello & Composition',     followers: 1892 },
  { id: 6, name: 'Carlos Ruiz',      initials: 'CR', avatar: 'sf-avatar-f', level: 'Level 3 · Learner',     verified: false, instrument: 'Bass Guitar',             followers: 123  },
  { id: 7, name: 'Priya Sharma',     initials: 'PS', avatar: 'sf-avatar-a', level: 'Level 7 · Expert',      verified: false, instrument: 'Sitar & Folk',            followers: 789  },
  { id: 8, name: 'Noah Williams',    initials: 'NW', avatar: 'sf-avatar-b', level: 'Level 2 · Student',     verified: false, instrument: 'Piano Beginner',          followers: 56   },
  { id: 9, name: 'Elena Vasquez',    initials: 'EV', avatar: 'sf-avatar-c', level: 'Level 10 · Maestro',    verified: true,  instrument: 'Flute & Jazz',            followers: 3241 },
  { id: 10,name: 'Kenji Nakamura',   initials: 'KN', avatar: 'sf-avatar-d', level: 'Level 4 · Musician',    verified: false, instrument: 'Electric Guitar',         followers: 234  },
];

const SEED_POSTS = [
  {
    id: 1, userId: 2, type: 'milestone',
    content: "Just reached <span class='sf-hashtag'>#Level11</span> — Legend status! 🎉 Never thought I'd make it this far when I started learning piano 8 months ago. The structured learning path on Harmonia has been a game-changer. To everyone still grinding: <span class='sf-mention'>@beginners</span> keep going, it's worth it!",
    milestone: { icon: '🏆', title: 'Reached Legend Status!', detail: '25,000 XP milestone — 8 months of daily practice' },
    tags: ['#Milestone', '#PianoLife', '#LevelUp'],
    likes: 247, comments: 38, shares: 14,
    time: '2 hours ago', timestamp: Date.now() - 7200000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 1, text: 'Absolutely incredible! You deserve it so much 🎹', time: '1h ago' },
      { userId: 5, text: 'From Level 1 to Legend in 8 months?! That\'s insane dedication!', time: '45m ago' },
      { userId: 3, text: 'Goals! Congrats James!! 🎉', time: '20m ago' },
    ]
  },
  {
    id: 2, userId: 1, type: 'audio',
    content: "Finally recorded my fingerpicking arrangement of a Bach piece I've been working on for 3 weeks! Still rough around the edges but really proud of how far I've come. Feedback welcome! 🎸 <span class='sf-hashtag'>#ClassicalGuitar</span> <span class='sf-hashtag'>#Bach</span> <span class='sf-hashtag'>#Fingerpicking</span>",
    audio: { title: 'Bach BWV 1007 Prelude - Acoustic Guitar', duration: '3:42', waveform: [18,28,22,35,42,38,50,45,55,48,60,52,58,46,40,35,50,55,60,48,42,38,30,25,20,32,40,48,52,58,55,50,45,40,35,48,55,60,50,42,38,30] },
    tags: ['#GuitarLife', '#ClassicalGuitar', '#Bach'],
    likes: 183, comments: 27, shares: 9,
    time: '4 hours ago', timestamp: Date.now() - 14400000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 5, text: 'This is beautiful! Your tone is incredible 😍', time: '3h ago' },
      { userId: 7, text: 'The dynamics in the second half really come through!', time: '2h ago' },
    ]
  },
  {
    id: 3, userId: 4, type: 'question',
    content: "Hey everyone! Quick question for the theory nerds here 🤓 When improvising over a ii-V-I in C major, should I be thinking chord tones first and then approach notes? Or is it better to just think of the key and let my ear guide me? Feel like both approaches give different results... <span class='sf-hashtag'>#MusicTheory</span> <span class='sf-hashtag'>#Jazz</span>",
    question: "What's your approach to improv over ii-V-I progressions?",
    tags: ['#MusicTheory', '#Jazz', '#Improvisation'],
    likes: 94, comments: 52, shares: 5,
    time: '6 hours ago', timestamp: Date.now() - 21600000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 2, text: 'Definitely chord tones first to build vocabulary, then let your ear expand!', time: '5h ago' },
      { userId: 9, text: 'I think of guide tones (3rds and 7ths) and voice lead between chords. Changes everything!', time: '4h ago' },
      { userId: 1, text: 'The bebop scale approach is also really helpful here — adds that chromatic flavor', time: '3h ago' },
    ]
  },
  {
    id: 4, userId: 5, type: 'milestone',
    content: "50 ear training sessions completed! 👂✨ My interval recognition has gone from 40% accuracy to 94% in two months. The daily challenge streaks really make a difference — consistency is everything. <span class='sf-hashtag'>#EarTraining</span> <span class='sf-hashtag'>#PracticeLog</span>",
    milestone: { icon: '👂', title: 'Ear Training Master', detail: '50 sessions completed · 94% accuracy rate' },
    tags: ['#EarTraining', '#Milestone', '#PracticeLog'],
    likes: 312, comments: 41, shares: 22,
    time: '8 hours ago', timestamp: Date.now() - 28800000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 2, text: 'From 40 to 94%! That\'s the power of deliberate practice right there 🔥', time: '7h ago' },
      { userId: 3, text: 'Can you share your practice routine? This is goals!', time: '6h ago' },
    ]
  },
  {
    id: 5, userId: 6, type: 'text',
    content: "Day 12 of the <span class='sf-hashtag'>#30DayGuitar</span> challenge 🎸 Today I finally got the F chord to ring out cleanly without buzzing! Only took 12 days of finger calluses haha. Small win but it genuinely feels HUGE right now. To anyone else learning guitar — the F chord DOES get easier, I promise! <span class='sf-hashtag'>#BeginnerTips</span>",
    tags: ['#30DayGuitar', '#BeginnerTips', '#GuitarLife'],
    likes: 156, comments: 29, shares: 7,
    time: '10 hours ago', timestamp: Date.now() - 36000000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 1, text: 'The F chord gateway! Once you crack it everything opens up 🙌', time: '9h ago' },
      { userId: 4, text: 'Congrats!! The first clean F chord hit different lol', time: '8h ago' },
    ]
  },
  {
    id: 6, userId: 9, type: 'challenge',
    content: "Starting my 7-day theory deep dive challenge! Tackling one complex concept per day: modes, secondary dominants, borrowed chords, modal interchange, tritone substitutions, polytonality, and spectral harmony. Who wants to join? Let's all post our notes each day! <span class='sf-hashtag'>#MusicTheory</span> <span class='sf-hashtag'>#Challenge</span>",
    challenge: { title: '7-Day Theory Deep Dive', progress: 43, participants: 87 },
    tags: ['#MusicTheory', '#Challenge', '#JazzVibes'],
    likes: 198, comments: 63, shares: 31,
    time: '12 hours ago', timestamp: Date.now() - 43200000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 2, text: 'I\'m in! Secondary dominants day is gonna be 🤯', time: '11h ago' },
      { userId: 7, text: 'Joining this! Modal interchange is the one I need most', time: '10h ago' },
      { userId: 5, text: 'Great initiative Elena! Tagged in!', time: '9h ago' },
    ]
  },
  {
    id: 7, userId: 3, type: 'audio',
    content: "First attempt at composing an original piece for violin and piano! The idea came from watching rain hit a window late at night. Still needs a lot of work but sharing it as part of my creative journey 🎻🎹 <span class='sf-hashtag'>#OriginalComposition</span> <span class='sf-hashtag'>#ClassicalPiano</span>",
    audio: { title: 'Rainlight — Original Composition (Draft 1)', duration: '2:18', waveform: [10,15,12,20,25,18,30,28,35,32,40,38,45,50,48,55,58,52,60,56,50,46,40,36,30,28,35,40,45,50,48,42] },
    tags: ['#OriginalComposition', '#Violin', '#ClassicalPiano'],
    likes: 227, comments: 44, shares: 16,
    time: '1 day ago', timestamp: Date.now() - 86400000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 1, text: 'This is hauntingly beautiful! The piano comping is perfect', time: '23h ago' },
      { userId: 2, text: 'The development in the middle section is really sophisticated for a first attempt!', time: '22h ago' },
    ]
  },
  {
    id: 8, userId: 7, type: 'text',
    content: "Interesting thing I noticed today while learning Carnatic ragas — the concept of 'gamaka' (ornamentation) is actually very similar to jazz vibrato techniques! Music really is a universal language. Has anyone else noticed cross-genre similarities like this? <span class='sf-hashtag'>#MusicTheory</span> <span class='sf-hashtag'>#WorldMusic</span> <span class='sf-hashtag'>#JazzVibes</span>",
    tags: ['#MusicTheory', '#WorldMusic', '#JazzVibes'],
    likes: 142, comments: 35, shares: 12,
    time: '1 day ago', timestamp: Date.now() - 90000000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 9, text: 'Yes! Also the rhythmic cycles (tala) in Indian classical music parallel polyrhythm in African drumming!', time: '22h ago' },
      { userId: 2, text: 'The blue note in blues is also found in some flamenco traditions. Connection everywhere!', time: '20h ago' },
    ]
  },
  {
    id: 9, userId: 10, type: 'milestone',
    content: "First 7-day streak achieved! 🔥 I know it seems small compared to some of you legends here but for someone who struggled to practice even once a week this is actually a big deal for me. Tiny steps! <span class='sf-hashtag'>#Streak</span> <span class='sf-hashtag'>#BeginnerTips</span>",
    milestone: { icon: '🔥', title: '7-Day Streak!', detail: 'First weekly consistency goal achieved' },
    tags: ['#Streak', '#Milestone', '#BeginnerTips'],
    likes: 289, comments: 56, shares: 8,
    time: '2 days ago', timestamp: Date.now() - 172800000,
    liked: false, bookmarked: false,
    comments_data: [
      { userId: 1, text: 'This is NOT small! This is literally how all legends started. Keep going!! 🙌', time: '2d ago' },
      { userId: 5, text: 'Biggest milestone is the first one. Congrats!', time: '1d ago' },
    ]
  },
];

// ── STATE ──────────────────────────────────────────────────────────────────
let posts = JSON.parse(localStorage.getItem('harmonia_social_posts') || 'null') || SEED_POSTS;
let currentFilter = 'all';
let currentSort = 'recent';
let currentActiveTag = null;
let activeCommentPostId = null;
let composerPostType = 'text';
let selectedMilestone = 'Level Up';
let postTags = [];
let page = 1;
const PAGE_SIZE = 6;
let followingSet = new Set(JSON.parse(localStorage.getItem('harmonia_following') || '[]'));

function savePosts() {
  try { localStorage.setItem('harmonia_social_posts', JSON.stringify(posts)); } catch(e) {}
}
function saveFollowing() {
  try { localStorage.setItem('harmonia_following', JSON.stringify([...followingSet])); } catch(e) {}
}

// ── RENDER FEED ─────────────────────────────────────────────────────────────
function getFilteredPosts() {
  let filtered = [...posts];

  if (currentFilter === 'following') {
    filtered = filtered.filter(p => followingSet.has(p.userId));
    if (!filtered.length) filtered = posts.slice(0, 3); // fallback for guests
  } else if (currentFilter === 'trending') {
    filtered = filtered.sort((a, b) => (b.likes + b.comments * 2) - (a.likes + a.comments * 2));
  } else if (currentFilter === 'milestones') {
    filtered = filtered.filter(p => p.type === 'milestone');
  } else if (currentFilter === 'questions') {
    filtered = filtered.filter(p => p.type === 'question');
  } else if (currentFilter === 'tracks') {
    filtered = filtered.filter(p => p.type === 'audio');
  }

  if (currentActiveTag) {
    filtered = filtered.filter(p => p.tags && p.tags.includes(currentActiveTag));
  }

  if (currentSort === 'popular') {
    filtered = filtered.sort((a, b) => b.likes - a.likes);
  } else if (currentSort === 'discussed') {
    filtered = filtered.sort((a, b) => b.comments - a.comments);
  } else {
    filtered = filtered.sort((a, b) => b.timestamp - a.timestamp);
  }

  return filtered;
}

function renderFeed(reset = true) {
  const container = document.getElementById('postsContainer');
  if (!container) return;

  const filtered = getFilteredPosts();
  const paginated = filtered.slice(0, page * PAGE_SIZE);

  if (reset) {
    container.innerHTML = '';
    page = 1;
  }

  if (paginated.length === 0) {
    container.innerHTML = `<div style="text-align:center;padding:60px 0;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">🎵</div>
      <p>No posts found. Try a different filter!</p>
    </div>`;
    return;
  }

  paginated.forEach((post, i) => {
    if (document.getElementById(`post-${post.id}`)) return;
    const el = buildPostEl(post, i);
    container.appendChild(el);
  });

  const loadBtn = document.getElementById('loadMoreBtn');
  if (loadBtn) {
    loadBtn.style.display = paginated.length < filtered.length ? 'flex' : 'none';
  }
}

function buildPostEl(post, animIndex = 0) {
  const user = USERS.find(u => u.id === post.userId) || USERS[0];
  const el = document.createElement('div');
  el.className = `sf-post type-${post.type}`;
  el.id = `post-${post.id}`;
  el.style.animationDelay = `${animIndex * 0.07}s`;

  // Type badge
  const typeBadges = {
    milestone: '<span class="sf-post-type-badge badge-milestone">🏆 Milestone</span>',
    audio:     '<span class="sf-post-type-badge badge-audio">🎵 Track</span>',
    question:  '<span class="sf-post-type-badge badge-question">❓ Question</span>',
    challenge: '<span class="sf-post-type-badge badge-challenge">⚡ Challenge</span>',
    text:      ''
  };

  // Extra blocks
  let extraBlock = '';
  if (post.type === 'milestone' && post.milestone) {
    extraBlock = `<div class="sf-milestone-block">
      <div class="sf-milestone-icon">${post.milestone.icon}</div>
      <div class="sf-milestone-details">
        <strong>${post.milestone.title}</strong>
        <span>${post.milestone.detail}</span>
      </div>
    </div>`;
  } else if (post.type === 'audio' && post.audio) {
    const bars = post.audio.waveform.slice(0, 40).map(h => `<div class="sf-wave-bar" style="--h:${h}px"></div>`).join('');
    extraBlock = `<div class="sf-audio-block">
      <div class="sf-audio-title">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
        ${post.audio.title}
      </div>
      <div class="sf-audio-player">
        <button class="sf-play-btn" onclick="playAudio(${post.id}, this)">▶</button>
        <div class="sf-waveform" onclick="seekAudio(${post.id}, this)">${bars}</div>
        <span class="sf-audio-duration">${post.audio.duration}</span>
      </div>
    </div>`;
  } else if (post.type === 'question' && post.question) {
    extraBlock = `<div class="sf-question-block">
      <span class="sf-question-label">Question</span>
      ${post.question}
    </div>`;
  } else if (post.type === 'challenge' && post.challenge) {
    extraBlock = `<div class="sf-challenge-block">
      <span class="sf-challenge-label">⚡ Challenge</span>
      <strong style="font-size:0.875rem">${post.challenge.title}</strong>
      <div class="sf-challenge-progress">${post.challenge.participants} participants joined</div>
      <div class="sf-challenge-bar"><div class="sf-challenge-bar-fill" style="width:${post.challenge.progress}%"></div></div>
    </div>`;
  }

  // Tags
  const tagsHtml = post.tags ? post.tags.map(t => `<span class="sf-post-tag" onclick="filterByTag(null,'${t}')">${t}</span>`).join('') : '';

  // First comment preview
  const previewComments = (post.comments_data || []).slice(0, 2).map(c => {
    const cu = USERS.find(u => u.id === c.userId) || USERS[0];
    return `<div class="sf-comment-item">
      <div class="sf-comment-avatar ${cu.avatar}" style="width:28px;height:28px;border-radius:7px;font-size:0.7rem">${cu.initials}</div>
      <div class="sf-comment-bubble">
        <strong>${cu.name}</strong>
        <p>${c.text}</p>
      </div>
    </div>`;
  }).join('');

  const allCommentCount = post.comments_data ? post.comments_data.length : 0;
  const moreComments = post.comments > allCommentCount ? `<button class="sf-view-all-comments" onclick="openComments(${post.id})">View all ${post.comments} comments</button>` : '';

  el.innerHTML = `
    <div class="sf-post-inner">
      <div class="sf-post-header">
        <div class="sf-post-user">
          <div class="sf-post-avatar ${user.avatar}">${user.initials}</div>
          <div class="sf-post-meta">
            <div class="sf-post-name">
              <a href="#">${user.name}</a>
              ${user.verified ? '<span class="sf-verified" title="Verified">✅</span>' : ''}
              <span class="sf-post-level">${user.level.split('·')[0].trim()}</span>
            </div>
            <div class="sf-post-time">${post.time}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px">
          ${typeBadges[post.type] || ''}
          <button class="sf-post-menu" onclick="postMenu(${post.id}, event)" title="More options">⋯</button>
        </div>
      </div>

      <div class="sf-post-content">${post.content}</div>
      ${extraBlock}
      ${tagsHtml ? `<div class="sf-post-tags">${tagsHtml}</div>` : ''}

      <div class="sf-post-actions">
        <button class="sf-action-btn ${post.liked ? 'liked' : ''}" id="like-btn-${post.id}" onclick="toggleLike(${post.id})">
          <svg viewBox="0 0 24 24" fill="${post.liked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          <span id="like-count-${post.id}">${formatNum(post.likes)}</span>
        </button>
        <div class="sf-action-sep"></div>
        <button class="sf-action-btn" onclick="openComments(${post.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span id="comment-count-${post.id}">${formatNum(post.comments)}</span>
        </button>
        <div class="sf-action-sep"></div>
        <button class="sf-action-btn" onclick="sharePost(${post.id})">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
          ${formatNum(post.shares)}
        </button>
        <div class="sf-action-sep"></div>
        <button class="sf-action-btn ${post.bookmarked ? 'liked' : ''}" onclick="toggleBookmark(${post.id})" title="Bookmark">
          <svg viewBox="0 0 24 24" fill="${post.bookmarked ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><path d="m19 21-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
        </button>
      </div>
    </div>
    ${previewComments ? `<div class="sf-comments-preview">${previewComments}${moreComments}</div>` : ''}
  `;
  return el;
}

// ── INTERACTIONS ─────────────────────────────────────────────────────────────

function toggleLike(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.liked = !post.liked;
  post.likes += post.liked ? 1 : -1;
  savePosts();

  const btn = document.getElementById(`like-btn-${postId}`);
  const count = document.getElementById(`like-count-${postId}`);
  if (btn) {
    btn.classList.toggle('liked', post.liked);
    btn.querySelector('path').setAttribute('fill', post.liked ? 'currentColor' : 'none');
  }
  if (count) count.textContent = formatNum(post.likes);

  if (post.liked) showToastSF('❤️ Post liked!', 'success');
}

function toggleBookmark(postId) {
  const post = posts.find(p => p.id === postId);
  if (!post) return;
  post.bookmarked = !post.bookmarked;
  savePosts();
  renderFeed();
  showToastSF(post.bookmarked ? '🔖 Post saved!' : 'Bookmark removed', 'info');
}

function sharePost(postId) {
  const post = posts.find(p => p.id === postId);
  if (post) post.shares++;
  savePosts();
  showToastSF('🔗 Link copied to clipboard!', 'success');
  const countEl = document.querySelector(`#post-${postId} .sf-action-btn:nth-child(5)`);
  if (countEl) countEl.innerHTML = countEl.innerHTML.replace(/\d[\d,]*$/, formatNum(post.shares));
}

function postMenu(postId, e) {
  e.stopPropagation();
  showToastSF('Post options coming soon!', 'info');
}

// ── FILTERS & SORT ──────────────────────────────────────────────────────────

function filterFeed(filter, btn) {
  currentFilter = filter;
  currentActiveTag = null;
  document.querySelectorAll('.sf-filter-tab').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  document.querySelectorAll('.sf-tag').forEach(t => t.classList.remove('active'));
  page = 1;
  renderFeed(true);
}

function sortFeed(sort, btn) {
  currentSort = sort;
  document.querySelectorAll('.sf-sort-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');
  page = 1;
  renderFeed(true);
}

function filterByTag(btn, tag) {
  if (currentActiveTag === tag) {
    currentActiveTag = null;
    document.querySelectorAll('.sf-tag').forEach(t => t.classList.remove('active'));
  } else {
    currentActiveTag = tag;
    document.querySelectorAll('.sf-tag').forEach(t => t.classList.remove('active'));
    if (btn) btn.classList.add('active');
  }
  currentFilter = 'all';
  document.querySelectorAll('.sf-filter-tab').forEach(b => b.classList.remove('active'));
  const allBtn = document.querySelector('[data-filter="all"]');
  if (allBtn) allBtn.classList.add('active');
  page = 1;
  renderFeed(true);
  if (currentActiveTag) showToastSF(`Showing posts tagged ${tag}`, 'info');
}

function loadMorePosts() {
  page++;
  const spinner = document.getElementById('loadSpinner');
  const text = document.querySelector('.sf-load-text');
  if (spinner) spinner.style.display = 'block';
  if (text) text.style.display = 'none';

  setTimeout(() => {
    if (spinner) spinner.style.display = 'none';
    if (text) text.style.display = 'block';
    const filtered = getFilteredPosts();
    const start = (page - 1) * PAGE_SIZE;
    const slice = filtered.slice(start, start + PAGE_SIZE);

    const container = document.getElementById('postsContainer');
    slice.forEach((post, i) => {
      if (!document.getElementById(`post-${post.id}`)) {
        const el = buildPostEl(post, i);
        container.appendChild(el);
      }
    });

    const loadBtn = document.getElementById('loadMoreBtn');
    if (loadBtn) loadBtn.style.display = (page * PAGE_SIZE) >= filtered.length ? 'none' : 'flex';
  }, 800);
}

// ── POST COMPOSER ────────────────────────────────────────────────────────────

function openComposer() {
  document.getElementById('composerModal').classList.add('open');
  setTimeout(() => document.getElementById('postContent').focus(), 300);
}

function openComposerWithType(type) {
  openComposer();
  setTimeout(() => selectPostType(type, document.querySelector(`[data-type="${type}"]`)), 200);
}

function closeComposer() {
  document.getElementById('composerModal').classList.remove('open');
  resetComposer();
}

function closeComposerIfOutside(e) {
  if (e.target === document.getElementById('composerModal')) closeComposer();
}

function resetComposer() {
  document.getElementById('postContent').value = '';
  document.getElementById('charCount').textContent = '0';
  document.getElementById('tagPills').innerHTML = '';
  document.getElementById('tagInput').value = '';
  postTags = [];
  selectPostType('text', document.querySelector('[data-type="text"]'));
}

function selectPostType(type, btn) {
  composerPostType = type;
  document.querySelectorAll('.sf-type-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  document.getElementById('milestoneExtras').style.display = type === 'milestone' ? 'block' : 'none';
  document.getElementById('audioExtras').style.display = type === 'audio' ? 'block' : 'none';

  const placeholders = {
    text:      'Share something with the community…',
    milestone: 'Tell us about your achievement! What did you accomplish?',
    audio:     'Describe your track — what inspired it?',
    question:  'Ask the community something music-related…',
    challenge: 'Start a challenge! Describe what you want people to do…'
  };
  document.getElementById('postContent').placeholder = placeholders[type] || placeholders.text;
}

function updateCharCount(textarea) {
  const count = textarea.value.length;
  document.getElementById('charCount').textContent = count;
  if (count > 480) document.getElementById('charCount').style.color = '#ef4444';
  else document.getElementById('charCount').style.color = '';
}

function handleTagInput(e) {
  if ((e.key === 'Enter' || e.key === ',') && e.target.value.trim()) {
    e.preventDefault();
    addTag(e.target.value.trim().replace(/^#?/, '#'));
    e.target.value = '';
  }
}

function addTag(tag) {
  if (postTags.includes(tag) || postTags.length >= 5) return;
  postTags.push(tag);
  const pill = document.createElement('span');
  pill.className = 'sf-tag-pill';
  pill.innerHTML = `${tag} <button onclick="removeTag('${tag}', this.parentElement)">✕</button>`;
  document.getElementById('tagPills').appendChild(pill);
}

function removeTag(tag, el) {
  postTags = postTags.filter(t => t !== tag);
  el.remove();
}

function selectMilestone(btn) {
  document.querySelectorAll('.sf-ms-opt').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  selectedMilestone = btn.textContent;
}

function simulateAudioUpload() {
  document.getElementById('uploadZone').style.display = 'none';
  document.getElementById('audioPreview').style.display = 'block';
  document.getElementById('audioFileName').textContent = 'my_recording.mp3';
  showToastSF('🎵 Audio attached!', 'success');
}

function removeAudio() {
  document.getElementById('uploadZone').style.display = 'flex';
  document.getElementById('audioPreview').style.display = 'none';
}

function addEmoji() {
  const emojis = ['🎵', '🎸', '🎹', '🎺', '🎻', '🥁', '🎤', '🎶', '🔥', '⭐', '❤️', '🙌'];
  const textarea = document.getElementById('postContent');
  textarea.value += emojis[Math.floor(Math.random() * emojis.length)];
  updateCharCount(textarea);
}

function addMention() {
  const textarea = document.getElementById('postContent');
  textarea.value += '@';
  textarea.focus();
}

function submitPost() {
  const content = document.getElementById('postContent').value.trim();
  if (!content) {
    showToastSF('Please write something first!', 'error');
    return;
  }
  if (content.length > 500) {
    showToastSF('Post is too long! Max 500 characters.', 'error');
    return;
  }

  const btn = document.getElementById('submitPostBtn');
  btn.disabled = true;
  btn.querySelector('span').textContent = 'Posting…';

  setTimeout(() => {
    const newPost = {
      id: Date.now(),
      userId: 0, // "You"
      type: composerPostType,
      content: content.replace(/#(\w+)/g, `<span class='sf-hashtag'>#$1</span>`).replace(/@(\w+)/g, `<span class='sf-mention'>@$1</span>`),
      tags: [...postTags],
      likes: 0, comments: 0, shares: 0,
      time: 'Just now',
      timestamp: Date.now(),
      liked: false, bookmarked: false,
      comments_data: []
    };

    // Add type extras
    if (composerPostType === 'milestone') {
      newPost.milestone = { icon: '🏆', title: selectedMilestone, detail: 'Just achieved this milestone!' };
    } else if (composerPostType === 'audio') {
      const trackTitle = document.getElementById('trackTitle').value || 'My Track';
      newPost.audio = { title: trackTitle, duration: '0:00', waveform: Array.from({length: 30}, () => Math.floor(Math.random() * 50 + 10)) };
    } else if (composerPostType === 'question') {
      newPost.question = content.replace(/<[^>]+>/g, '').slice(0, 100) + '?';
    } else if (composerPostType === 'challenge') {
      newPost.challenge = { title: content.replace(/<[^>]+>/g, '').slice(0, 50), progress: 0, participants: 1 };
    }

    // Guest user placeholder
    if (!USERS.find(u => u.id === 0)) {
      USERS.push({ id: 0, name: 'You (Guest)', initials: 'G', avatar: 'sf-avatar-g', level: 'Level 1', verified: false, instrument: 'Music Learner', followers: 0 });
    }

    posts.unshift(newPost);
    savePosts();
    HarmoniaDB.addXP(10, 'Posted in Community Feed');
    HarmoniaDB.addActivity({ icon: '💬', title: 'You posted in the community!', time: 'Just now', xp: 10 });

    closeComposer();
    renderFeed(true);
    showToastSF('✅ Post shared with the community! +10 XP', 'success');

    btn.disabled = false;
    btn.querySelector('span').textContent = 'Post';
  }, 800);
}

// ── COMMENTS ─────────────────────────────────────────────────────────────────

function openComments(postId) {
  activeCommentPostId = postId;
  const post = posts.find(p => p.id === postId);
  if (!post) return;

  document.getElementById('commentsModalTitle').textContent = `${post.comments} Comments`;
  const body = document.getElementById('commentsBody');
  body.innerHTML = '';

  if (!post.comments_data || !post.comments_data.length) {
    body.innerHTML = `<div style="text-align:center;padding:32px;color:var(--muted)"><p>No comments yet. Be the first!</p></div>`;
  } else {
    post.comments_data.forEach(c => {
      const cu = USERS.find(u => u.id === c.userId) || USERS[0];
      const div = document.createElement('div');
      div.className = 'sf-comment-full';
      div.innerHTML = `
        <div class="sf-comment-avatar ${cu.avatar}">${cu.initials}</div>
        <div class="sf-comment-content">
          <strong>${cu.name}</strong>
          <p>${c.text}</p>
          <div style="display:flex;align-items:center;gap:8px">
            <span class="sf-comment-time">${c.time}</span>
            <button class="sf-comment-like" onclick="likeComment(this)">❤️ ${c.likes || 0}</button>
          </div>
        </div>`;
      body.appendChild(div);
    });
  }

  document.getElementById('commentsModal').classList.add('open');
  setTimeout(() => document.getElementById('commentInput').focus(), 300);
}

function closeComments() {
  document.getElementById('commentsModal').classList.remove('open');
  activeCommentPostId = null;
}

function closeCommentsIfOutside(e) {
  if (e.target === document.getElementById('commentsModal')) closeComments();
}

function handleCommentSubmit(e) {
  if (e.key === 'Enter') sendComment();
}

function sendComment() {
  const input = document.getElementById('commentInput');
  const text = input.value.trim();
  if (!text || !activeCommentPostId) return;

  const post = posts.find(p => p.id === activeCommentPostId);
  if (!post) return;

  if (!post.comments_data) post.comments_data = [];
  const newComment = { userId: 0, text, time: 'Just now', likes: 0 };
  post.comments_data.push(newComment);
  post.comments++;
  savePosts();

  // Add to modal
  const body = document.getElementById('commentsBody');
  const emptyMsg = body.querySelector('div[style]');
  if (emptyMsg) emptyMsg.remove();

  const div = document.createElement('div');
  div.className = 'sf-comment-full';
  div.style.animation = 'fadeSlideIn 0.3s ease both';
  div.innerHTML = `
    <div class="sf-comment-avatar sf-avatar-g">G</div>
    <div class="sf-comment-content">
      <strong>You (Guest)</strong>
      <p>${text}</p>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="sf-comment-time">Just now</span>
        <button class="sf-comment-like" onclick="likeComment(this)">❤️ 0</button>
      </div>
    </div>`;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;

  // Update count in feed
  const countEl = document.getElementById(`comment-count-${activeCommentPostId}`);
  if (countEl) countEl.textContent = formatNum(post.comments);

  input.value = '';
  showToastSF('💬 Comment posted! +5 XP', 'success');
  HarmoniaDB.addXP(5, 'Commented in Community');
}

function likeComment(btn) {
  const current = parseInt(btn.textContent.replace(/[^0-9]/g, '')) || 0;
  btn.textContent = `❤️ ${current + 1}`;
  btn.style.color = '#ec4899';
}

// ── CHALLENGES ───────────────────────────────────────────────────────────────

function joinChallenge(btn, tag) {
  const joined = btn.classList.toggle('joined');
  btn.textContent = joined ? '✓ Joined' : 'Join';
  if (joined) {
    showToastSF(`⚡ You joined ${tag}! +20 XP`, 'success');
    HarmoniaDB.addXP(20, `Joined challenge: ${tag}`);
    filterByTag(null, tag);
  }
}

// ── SUGGESTED MEMBERS ────────────────────────────────────────────────────────

function renderSuggestedMembers() {
  const container = document.getElementById('suggestedMembers');
  if (!container) return;
  container.innerHTML = '';

  const suggested = USERS.filter(u => u.id !== 0).slice(0, 5);
  suggested.forEach(user => {
    const isFollowing = followingSet.has(user.id);
    const div = document.createElement('div');
    div.className = 'sf-member-item';
    div.innerHTML = `
      <div class="sf-member-avatar ${user.avatar}">${user.initials}</div>
      <div class="sf-member-info">
        <strong>${user.name}</strong>
        <span>${user.instrument}</span>
      </div>
      <button class="sf-follow-btn ${isFollowing ? 'following' : ''}" onclick="toggleFollow(${user.id}, this)">
        ${isFollowing ? 'Following' : '+ Follow'}
      </button>`;
    container.appendChild(div);
  });
}

function toggleFollow(userId, btn) {
  if (followingSet.has(userId)) {
    followingSet.delete(userId);
    btn.textContent = '+ Follow';
    btn.classList.remove('following');
    showToastSF('Unfollowed', 'info');
  } else {
    followingSet.add(userId);
    btn.textContent = 'Following';
    btn.classList.add('following');
    const user = USERS.find(u => u.id === userId);
    showToastSF(`✅ Following ${user ? user.name : 'user'}!`, 'success');
  }
  saveFollowing();
}

// ── LEADERBOARD ───────────────────────────────────────────────────────────────

function renderLeaderboard() {
  const container = document.getElementById('leadersList');
  if (!container) return;

  const leaders = [
    { name: 'James Okonkwo',  avatar: 'sf-avatar-b', initials: 'JO', xp: '12,450 XP', rank: 1 },
    { name: 'Mei Lin',        avatar: 'sf-avatar-e', initials: 'ML', xp: '9,820 XP',  rank: 2 },
    { name: 'Elena Vasquez',  avatar: 'sf-avatar-c', initials: 'EV', xp: '8,310 XP',  rank: 3 },
    { name: 'Sofia Martinez', avatar: 'sf-avatar-a', initials: 'SM', xp: '7,240 XP',  rank: 4 },
    { name: 'Priya Sharma',   avatar: 'sf-avatar-a', initials: 'PS', xp: '6,150 XP',  rank: 5 },
  ];

  const rankClasses = ['gold', 'silver', 'bronze', '', ''];
  const rankSymbols = ['🥇', '🥈', '🥉', '4', '5'];

  leaders.forEach((l, i) => {
    const div = document.createElement('div');
    div.className = 'sf-leader-item';
    div.innerHTML = `
      <div class="sf-leader-rank ${rankClasses[i]}">${rankSymbols[i]}</div>
      <div class="sf-leader-avatar ${l.avatar}">${l.initials}</div>
      <div class="sf-leader-info"><strong>${l.name}</strong></div>
      <div class="sf-leader-xp">${l.xp}</div>`;
    container.appendChild(div);
  });
}

// ── LIVE ACTIVITY ─────────────────────────────────────────────────────────────

const liveActivities = [
  { icon: '🎸', text: 'Carlos completed Day 12 of #30DayGuitar' },
  { icon: '🏆', text: 'Noah just reached Level 3!' },
  { icon: '❤️', text: 'Sofia liked James\'s milestone post' },
  { icon: '💬', text: 'Elena started a 7-day theory challenge' },
  { icon: '👂', text: 'Aisha completed an Ear Training session' },
  { icon: '⭐', text: 'Kenji earned the Speed Learner badge' },
  { icon: '🎵', text: 'Priya shared a new violin recording' },
  { icon: '🔥', text: 'Mei Lin hit a 30-day streak!' },
  { icon: '📖', text: 'Luca completed Module 1 of Learning Path' },
  { icon: '🧠', text: 'James scored 100% on Theory Quiz' },
];
let liveIndex = 0;

function startLiveFeed() {
  const container = document.getElementById('liveFeed');
  if (!container) return;

  function addItem() {
    const item = liveActivities[liveIndex % liveActivities.length];
    liveIndex++;

    const div = document.createElement('div');
    div.className = 'sf-live-item';
    div.innerHTML = `<span class="sf-live-item-icon">${item.icon}</span><span>${item.text}</span>`;

    container.insertBefore(div, container.firstChild);
    if (container.children.length > 6) container.removeChild(container.lastChild);
  }

  // Initial items
  for (let i = 0; i < 5; i++) addItem();
  setInterval(addItem, 4000);
}

// Update online count animation
function animateOnlineCount() {
  const el = document.getElementById('onlineCount');
  if (!el) return;
  let count = 2847;
  setInterval(() => {
    count += Math.floor(Math.random() * 5 - 2);
    count = Math.max(2800, Math.min(3000, count));
    el.textContent = count.toLocaleString();
  }, 5000);
}

// ── AUDIO PLAYER ─────────────────────────────────────────────────────────────

let playingPostId = null;
function playAudio(postId, btn) {
  if (playingPostId === postId) {
    btn.textContent = '▶';
    playingPostId = null;
    return;
  }
  if (playingPostId) {
    const prevBtn = document.querySelector(`#post-${playingPostId} .sf-play-btn`);
    if (prevBtn) prevBtn.textContent = '▶';
  }
  playingPostId = postId;
  btn.textContent = '⏸';
  showToastSF('🎵 Playing track (audio simulation)', 'info');
  setTimeout(() => {
    btn.textContent = '▶';
    playingPostId = null;
  }, 5000);
}

function seekAudio(postId, waveform) {
  const bars = waveform.querySelectorAll('.sf-wave-bar');
  bars.forEach((b, i) => {
    b.classList.toggle('played', i < bars.length * 0.4);
  });
}

// ── UTILS ────────────────────────────────────────────────────────────────────

function formatNum(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return n.toString();
}

let toastTimer;
function showToastSF(msg, type = 'success') {
  const toast = document.getElementById('sfToast');
  toast.textContent = msg;
  toast.className = `sf-toast ${type} show`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── INIT ─────────────────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  renderFeed(true);
  renderSuggestedMembers();
  renderLeaderboard();
  startLiveFeed();
  animateOnlineCount();
});
