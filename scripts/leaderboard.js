/**
 * leaderboard.js — Leaderboard page controller
 * Generates realistic mock leaderboard data + integrates real user data from HarmoniaDB
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Pull real user data ──────────────────────────────────
  const snap = HarmoniaDB.getSnapshot();
  const userXP    = snap.xp;
  const userLevel = snap.levelInfo.level;
  const userTitle = snap.levelInfo.title;
  const userStats = snap.stats;
  const userStreak = snap.streak.current;

  // ── Update nav profile ───────────────────────────────────
  const initial = 'G';
  document.getElementById('navAvatar').textContent  = initial;
  document.getElementById('pdAvatar').textContent   = initial;

  // ── Generate mock players ────────────────────────────────
  const FIRST_NAMES = ['Aria','Kai','Lyric','Zara','Felix','Nova','Ethan','Mila','Oscar','Jade',
    'Finn','Cleo','Ravi','Sana','Leo','Ivy','Cruz','Nadia','Eli','Rosa',
    'Atlas','Vera','Silas','Noel','Demi','Jace','Kira','Ash','Talia','Marco',
    'Priya','Dylan','Zoe','Nico','Elan','Faye','Orion','Isla','Dean','Luna'];
  const LAST_NAMES  = ['Chen','Silva','Park','Okafor','Fischer','Rao','Martínez','Nakamura','Patel','Dubois',
    'Kim','Torres','Ahmed','Nguyen','Müller','Costa','Andersen','Reyes','Wong','Bianchi'];
  const TITLES = HarmoniaDB.LEVEL_TITLES;
  const BADGES_POOL = [
    { key:'fire', label:'🔥 Hot Streak', css:'pb-fire' },
    { key:'new',  label:'⚡ Rising',     css:'pb-new' },
    { key:'pro',  label:'🎵 Pro',         css:'pb-pro' },
    { key:'streak', label:'📅 Consistent', css:'pb-streak' },
  ];
  const AVATAR_GRADIENTS = [
    'linear-gradient(135deg,#7c3aed,#db2777)',
    'linear-gradient(135deg,#0ea5e9,#7c3aed)',
    'linear-gradient(135deg,#f59e0b,#ef4444)',
    'linear-gradient(135deg,#10b981,#0ea5e9)',
    'linear-gradient(135deg,#ec4899,#f97316)',
    'linear-gradient(135deg,#6366f1,#8b5cf6)',
    'linear-gradient(135deg,#14b8a6,#3b82f6)',
    'linear-gradient(135deg,#f97316,#eab308)',
  ];

  function seededRand(seed) {
    let s = seed;
    return () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
  }

  function generatePlayers(count, timeFilter, catFilter) {
    const players = [];
    for (let i = 0; i < count; i++) {
      const rng = seededRand(i * 317 + 11 + (timeFilter.charCodeAt(0) || 0) + (catFilter.charCodeAt(0) || 0));
      const r = rng;

      // Determine XP based on rank position — top players have much more
      let baseXP;
      if (i === 0) baseXP = 48200 + Math.floor(r() * 5000);
      else if (i === 1) baseXP = 38100 + Math.floor(r() * 4000);
      else if (i === 2) baseXP = 29800 + Math.floor(r() * 3000);
      else if (i < 10) baseXP = 15000 - i * 1200 + Math.floor(r() * 2000);
      else if (i < 25) baseXP = 8000 - (i - 10) * 300 + Math.floor(r() * 1500);
      else baseXP = 3500 - (i - 25) * 100 + Math.floor(r() * 800);

      if (timeFilter === 'month') baseXP = Math.floor(baseXP * 0.35);
      if (timeFilter === 'week')  baseXP = Math.floor(baseXP * 0.12);

      if (catFilter === 'theory')   baseXP = Math.floor(baseXP * (0.5 + r() * 0.5));
      if (catFilter === 'ear')      baseXP = Math.floor(baseXP * (0.4 + r() * 0.5));
      if (catFilter === 'practice') baseXP = Math.floor(baseXP * (0.3 + r() * 0.6));

      baseXP = Math.max(100, baseXP);

      const level = HarmoniaDB.LEVEL_THRESHOLDS.findIndex((t, idx) =>
        baseXP >= t && (HarmoniaDB.LEVEL_THRESHOLDS[idx+1] === undefined || baseXP < HarmoniaDB.LEVEL_THRESHOLDS[idx+1])
      ) + 1 || 12;

      const fn = FIRST_NAMES[Math.floor(r() * FIRST_NAMES.length)];
      const ln = LAST_NAMES[Math.floor(r() * LAST_NAMES.length)];

      const numBadges = r() < 0.3 ? 1 : r() < 0.15 ? 2 : 0;
      const badges = [];
      if (numBadges > 0) badges.push(BADGES_POOL[Math.floor(r() * BADGES_POOL.length)]);
      if (numBadges > 1) badges.push(BADGES_POOL[Math.floor(r() * BADGES_POOL.length)]);

      const rankChange = Math.floor(r() * 10) - 5; // -5 to +5
      const quizzes = Math.floor(r() * 120) + 2;
      const streak  = Math.floor(r() * 60) + 1;

      players.push({
        id: i,
        name: `${fn} ${ln[0]}.`,
        avatar: fn[0].toUpperCase(),
        gradient: AVATAR_GRADIENTS[Math.floor(r() * AVATAR_GRADIENTS.length)],
        xp: baseXP,
        level: Math.min(12, level),
        title: TITLES[Math.min(11, level - 1)] || 'Master',
        badges,
        rankChange,
        quizzes,
        streak,
        isMe: false,
      });
    }
    return players;
  }

  // ── State ────────────────────────────────────────────────
  let currentTime = 'alltime';
  let currentCat  = 'overall';
  let allPlayers  = [];
  let filteredPlayers = [];
  let myRank = null;

  // ── Build players with real user inserted ────────────────
  function buildPlayerList(time, cat) {
    let players = generatePlayers(50, time, cat);

    // Insert real user into the list at correct rank position
    let myXP = userXP;
    if (time === 'month') myXP = Math.floor(myXP * 0.35);
    if (time === 'week')  myXP = Math.floor(myXP * 0.12);

    const mePlayer = {
      id: 'me',
      name: 'You',
      avatar: initial,
      gradient: 'linear-gradient(135deg,#7c3aed,#db2777)',
      xp: myXP,
      level: userLevel,
      title: userTitle,
      badges: userStreak >= 7 ? [{ key:'streak', label:'🔥 Hot Streak', css:'pb-fire' }] : [],
      rankChange: 0,
      quizzes: userStats.quizzesTaken || 0,
      streak: userStreak || 0,
      isMe: true,
    };

    players.push(mePlayer);
    players.sort((a, b) => b.xp - a.xp);

    myRank = players.findIndex(p => p.isMe) + 1;
    return players;
  }

  // ── Render Podium ────────────────────────────────────────
  function renderPodium(players) {
    const podiumEl = document.getElementById('lbPodium');
    const top3 = [players[1], players[0], players[2]]; // 2nd, 1st, 3rd visual order
    const medals = ['🥈','👑','🥉'];
    const positions = ['2nd', '1st', '3rd'];

    podiumEl.innerHTML = top3.map((p, vi) => {
      const rank = vi === 1 ? 1 : vi === 0 ? 2 : 3;
      return `
        <div class="podium-item" onclick="triggerConfetti()" title="${p.name} — #${rank}">
          <div class="podium-avatar-wrap">
            ${rank === 1 ? '<div class="podium-crown">👑</div>' : ''}
            <div class="podium-avatar" style="background:${p.gradient}">${p.avatar}</div>
          </div>
          <div class="podium-name">${p.name}</div>
          <div class="podium-xp">${p.xp.toLocaleString()} XP</div>
          <div class="podium-stand">${positions[vi]}</div>
        </div>`;
    }).join('');
  }

  // ── Render Table ─────────────────────────────────────────
  function renderTable(players) {
    const tbody = document.getElementById('lbTableBody');
    const maxXP = players[0]?.xp || 1;

    tbody.innerHTML = players.map((p, i) => {
      const rank = i + 1;
      const rankClass = rank <= 3 ? `rank-${rank}` : '';
      const meClass = p.isMe ? 'is-me' : '';

      let medalHtml = '';
      if (rank === 1) medalHtml = '<span class="lb-rank-medal">🥇</span>';
      else if (rank === 2) medalHtml = '<span class="lb-rank-medal">🥈</span>';
      else if (rank === 3) medalHtml = '<span class="lb-rank-medal">🥉</span>';

      let changeHtml = '';
      if (p.rankChange > 0) changeHtml = `<span class="lb-rank-change rc-up">↑${p.rankChange}</span>`;
      else if (p.rankChange < 0) changeHtml = `<span class="lb-rank-change rc-down">↓${Math.abs(p.rankChange)}</span>`;
      else changeHtml = `<span class="lb-rank-change rc-same">—</span>`;

      const badgesHtml = p.badges.length
        ? `<div class="lb-player-badges">${p.badges.map(b => `<span class="lb-pbadge ${b.css}">${b.label}</span>`).join('')}</div>`
        : '';

      const xpPct = Math.round((p.xp / maxXP) * 100);

      return `
        <div class="lb-row ${rankClass} ${meClass}" style="--row-i:${i}">
          <div class="lb-cell-rank">
            <span class="lb-rank-num">${rank}</span>
            ${medalHtml}
            ${changeHtml}
          </div>
          <div class="lb-cell-player">
            <div class="lb-player-avatar" style="background:${p.gradient}">${p.avatar}</div>
            <div class="lb-player-info">
              <span class="lb-player-name">${p.name}</span>
              <span class="lb-player-title">${p.title}</span>
              ${badgesHtml}
            </div>
          </div>
          <div class="lb-cell-level">
            <div class="lb-level-badge">⬆ Lv.${p.level}</div>
          </div>
          <div class="lb-cell-quizzes">${p.quizzes}</div>
          <div class="lb-cell-streak">${p.streak}🔥</div>
          <div class="lb-cell-xp">
            <span class="lb-xp-value">${p.xp.toLocaleString()}</span>
            <div class="lb-xp-bar-wrap">
              <div class="lb-xp-bar-fill" style="width:${xpPct}%"></div>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  // ── Render My Rank Cards ──────────────────────────────────
  function updateMyRank() {
    document.getElementById('myRankDisplay').textContent  = `#${myRank}`;
    document.getElementById('myRankName').textContent     = 'You';
    document.getElementById('myRankLevel').textContent    = `Level ${userLevel} · ${userTitle}`;
    document.getElementById('myRankXP').textContent       = `${userXP.toLocaleString()} XP`;

    document.getElementById('pinnedRank').textContent  = `#${myRank}`;
    document.getElementById('pinnedXP').textContent    = `${userXP.toLocaleString()} XP`;
    document.getElementById('pinnedName').textContent  = 'You';
    document.getElementById('pinnedAvatar').textContent = initial;
  }

  // ── Render XP Breakdown ───────────────────────────────────
  function renderXPBreakdown() {
    const progress = snap.progress;
    const totalXP = Math.max(userXP, 1);

    const breakdown = [
      {
        icon: '🧠', label: 'Theory Quizzes', color: '#ec4899',
        xp: Math.round(totalXP * 0.4 * (snap.stats.quizzesTaken > 0 ? Math.min(1, snap.stats.quizzesTaken / 20) : 0.05)),
      },
      {
        icon: '👂', label: 'Ear Training', color: '#38bdf8',
        xp: Math.round(totalXP * 0.3 * (snap.stats.earTrainingSessions > 0 ? Math.min(1, snap.stats.earTrainingSessions / 20) : 0.03)),
      },
      {
        icon: '🛤️', label: 'Learning Path', color: '#a78bfa',
        xp: Math.round(totalXP * 0.2 * (progress.learningPath.percent / 100 || 0.02)),
      },
      {
        icon: '🎸', label: 'Practice Mode', color: '#34d399',
        xp: Math.min(totalXP, snap.stats.totalPracticeMinutes || 0),
      },
    ];

    // Ensure all add up to no more than total
    const sum = breakdown.reduce((a, b) => a + b.xp, 0);
    const remaining = Math.max(0, userXP - sum);
    if (remaining > 0) breakdown[0].xp += remaining;

    const maxXP = Math.max(...breakdown.map(b => b.xp), 1);

    const container = document.getElementById('xpBreakdown');
    container.innerHTML = breakdown.map(item => {
      const pct = Math.round((item.xp / maxXP) * 100);
      return `
        <div class="xpb-item">
          <div class="xpb-icon" style="background:rgba(255,255,255,0.05)">${item.icon}</div>
          <div class="xpb-info">
            <div class="xpb-label">
              <span>${item.label}</span>
              <span>${item.xp.toLocaleString()} XP</span>
            </div>
            <div class="xpb-bar">
              <div class="xpb-fill" style="width:${pct}%; background:${item.color}"></div>
            </div>
          </div>
        </div>`;
    }).join('');

    // Animate after paint
    setTimeout(() => {
      container.querySelectorAll('.xpb-fill').forEach(el => {
        const w = el.style.width;
        el.style.width = '0%';
        requestAnimationFrame(() => { el.style.transition = 'width 1s cubic-bezier(0.34,1.56,0.64,1)'; el.style.width = w; });
      });
    }, 300);
  }

  // ── Render Top Movers ─────────────────────────────────────
  function renderMovers() {
    const NAMES = ['Nova C.', 'Kai P.', 'Zara M.', 'Felix R.', 'Aria N.'];
    const GRADS = [
      'linear-gradient(135deg,#10b981,#0ea5e9)',
      'linear-gradient(135deg,#f59e0b,#ef4444)',
      'linear-gradient(135deg,#6366f1,#8b5cf6)',
      'linear-gradient(135deg,#ec4899,#f97316)',
      'linear-gradient(135deg,#14b8a6,#3b82f6)',
    ];
    const GAINS = ['+2,840 XP', '+2,110 XP', '+1,950 XP', '+1,680 XP', '+1,440 XP'];
    const CHANGES = ['+12', '+9', '+7', '+6', '+5'];

    const container = document.getElementById('lbMovers');
    container.innerHTML = NAMES.map((name, i) => `
      <div class="lb-mover-item">
        <div class="lm-avatar" style="background:${GRADS[i]}">${name[0]}</div>
        <div class="lm-info">
          <span class="lm-name">${name}</span>
          <span class="lm-gain">${GAINS[i]} today</span>
        </div>
        <span class="lm-change">↑${CHANGES[i]}</span>
      </div>`).join('');
  }

  // ── Season Countdown ──────────────────────────────────────
  function startSeasonCountdown() {
    // Season ends in 14 days from now
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 14);

    function update() {
      const diff = endDate - new Date();
      if (diff <= 0) return;
      const days  = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins  = Math.floor((diff % 3600000) / 60000);

      document.getElementById('scdDays').textContent  = String(days).padStart(2,'0');
      document.getElementById('scdHours').textContent = String(hours).padStart(2,'0');
      document.getElementById('scdMins').textContent  = String(mins).padStart(2,'0');
    }
    update();
    setInterval(update, 60000);
  }

  // ── Filter players by search ──────────────────────────────
  window.filterPlayers = function(query) {
    const q = query.toLowerCase().trim();
    filteredPlayers = q
      ? allPlayers.filter(p => p.name.toLowerCase().includes(q))
      : allPlayers;

    if (filteredPlayers.length === 0) {
      document.getElementById('lbTableBody').innerHTML = `
        <div class="lb-empty">
          <div class="lb-empty-icon">🔍</div>
          <h4>No players found</h4>
          <p>Try a different search term</p>
        </div>`;
    } else {
      renderTable(filteredPlayers);
    }
  };

  // ── Full refresh ──────────────────────────────────────────
  function refresh(showLoader = true) {
    if (showLoader) {
      document.getElementById('lbLoading').classList.remove('hidden');
      document.getElementById('lbTableBody').innerHTML = '';
    }

    setTimeout(() => {
      allPlayers = buildPlayerList(currentTime, currentCat);
      filteredPlayers = allPlayers;

      document.getElementById('lbLoading').classList.add('hidden');
      renderPodium(allPlayers);
      renderTable(allPlayers);
      updateMyRank();

      // Show pinned bar after scroll
    }, showLoader ? 800 : 0);
  }

  // ── Time filter buttons ───────────────────────────────────
  document.querySelectorAll('.lb-tf').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lb-tf').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentTime = btn.dataset.time;
      refresh(true);
    });
  });

  // ── Category filter buttons ───────────────────────────────
  document.querySelectorAll('.lb-cf').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.lb-cf').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCat = btn.dataset.cat;
      refresh(true);
    });
  });

  // ── Pinned bar on scroll ──────────────────────────────────
  const pinnedBar = document.getElementById('lbPinnedBar');
  let pinnedVisible = false;

  window.addEventListener('scroll', () => {
    const heroBot = document.querySelector('.lb-hero').getBoundingClientRect().bottom;
    if (heroBot < 0 && !pinnedVisible) {
      pinnedBar.classList.add('visible');
      pinnedVisible = true;
    } else if (heroBot >= 0 && pinnedVisible) {
      pinnedBar.classList.remove('visible');
      pinnedVisible = false;
    }
  }, { passive: true });

  // ── Confetti ──────────────────────────────────────────────
  window.triggerConfetti = function() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#fbbf24','#ec4899','#a78bfa','#38bdf8','#34d399','#f97316'];
    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 3,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 6,
      vy: Math.random() * 4 + 2,
      rot: Math.random() * 360,
      rotV: (Math.random() - 0.5) * 8,
      alpha: 1,
    }));

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x  += p.vx; p.y += p.vy;
        p.rot += p.rotV; p.alpha -= 0.012;
        if (p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r/2, p.r * 2, p.r);
        ctx.restore();
      });
      if (++frame < 160) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    animate();
  };

  // ── Intersection observer for cards ──────────────────────
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.lb-widget, .lb-table-wrap').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    io.observe(el);
  });

  const visStyle = document.createElement('style');
  visStyle.textContent = `.visible{opacity:1!important;transform:none!important}`;
  document.head.appendChild(visStyle);

  // ── Achievement: top 100 check ────────────────────────────
  if (myRank !== null && myRank <= 100) {
    HarmoniaDB.checkAchievement('top_100');
  }

  // ── Init ─────────────────────────────────────────────────
  refresh(true);
  renderXPBreakdown();
  renderMovers();
  startSeasonCountdown();

});
