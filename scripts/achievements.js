/**
 * achievements.js — Achievements page controller
 * Full HarmoniaDB integration, extended achievement set, modal, filters, confetti
 */

document.addEventListener('DOMContentLoaded', () => {

  const snap    = HarmoniaDB.getSnapshot();
  const stats   = snap.stats;
  const prog    = snap.progress;
  const unlocked = HarmoniaDB.getUnlockedAchievements();

  /* ── Extended achievement definitions ─────────────────
     (superset of what's in DB — some are display-only here)  */
  const ACHIEVEMENTS = [
    // Training
    { id:'first_note',    icon:'🎸', title:'First Note',       desc:'Complete your first lesson',               xp:50,  cat:'training', rarity:'common',   ctaHref:'learning-path.html', ctaLabel:'Go to Learning Path', hint:'Complete 1 lesson', hintPct: () => Math.min(100, (stats.lessonsCompleted || 0) * 100) },
    { id:'module_1',      icon:'📖', title:'Foundation Built',  desc:'Complete Learning Path Module 1 (10 lessons)',xp:300, cat:'training', rarity:'uncommon', ctaHref:'learning-path.html', ctaLabel:'Continue Path', hint:'Complete 10 lessons', hintPct: () => Math.min(100, ((prog.learningPath?.completedLessons?.length || 0) / 10) * 100) },
    { id:'practice_1h',   icon:'⏱️', title:'Hour of Power',     desc:'Practice for 1 hour total',               xp:100, cat:'training', rarity:'uncommon', ctaHref:'practice-mode.html', ctaLabel:'Start Practice', hint:'Practice 60 min total', hintPct: () => Math.min(100, ((prog.practiceMode?.totalMinutes || 0) / 60) * 100) },
    { id:'daily_3',       icon:'📅', title:'Habit Forming',     desc:'Complete daily challenge 3 times',         xp:120, cat:'training', rarity:'uncommon', ctaHref:'ear-training.html', ctaLabel:'Daily Challenge', hint:'3 daily challenges', hintPct: () => 0 },
    // Quiz
    { id:'quiz_starter',  icon:'🧠', title:'Quiz Starter',      desc:'Take your very first quiz',                xp:30,  cat:'quiz',     rarity:'common',   ctaHref:'theory-quiz.html', ctaLabel:'Take a Quiz', hint:'Take 1 quiz', hintPct: () => Math.min(100, (stats.quizzesTaken || 0) * 100) },
    { id:'perfect_quiz',  icon:'💯', title:'Perfect Score',     desc:'Get 100% on any theory quiz',              xp:200, cat:'quiz',     rarity:'rare',     ctaHref:'theory-quiz.html', ctaLabel:'Try for Perfect', hint:'Score 100% on a quiz', hintPct: () => Math.min(100, ((prog.theoryQuiz?.averageScore || 0) / 100) * 100) },
    { id:'speed_learner', icon:'⚡', title:'Speed Learner',     desc:'Finish a quiz in under 3 minutes',         xp:100, cat:'quiz',     rarity:'rare',     ctaHref:'theory-quiz.html', ctaLabel:'Speed Challenge', hint:'Beat the 3-minute clock', hintPct: () => Math.min(100, (stats.quizzesTaken || 0) * 20) },
    { id:'combo_x5',      icon:'🎯', title:'On a Roll',         desc:'Answer 5 quiz questions correctly in a row',xp:75, cat:'quiz',     rarity:'uncommon', ctaHref:'theory-quiz.html', ctaLabel:'Take a Quiz', hint:'5 consecutive correct answers', hintPct: () => Math.min(100, (stats.totalCorrectAnswers || 0) * 10) },
    // Ear
    { id:'tuned_in',      icon:'👂', title:'Tuned In',          desc:'Complete your first ear training session',  xp:40,  cat:'ear',      rarity:'common',   ctaHref:'ear-training.html', ctaLabel:'Start Ear Training', hint:'1 ear session', hintPct: () => Math.min(100, (stats.earTrainingSessions || 0) * 100) },
    { id:'ear_master',    icon:'🎵', title:'Ear Master',        desc:'Identify 50 intervals correctly',           xp:250, cat:'ear',      rarity:'epic',     ctaHref:'ear-training.html', ctaLabel:'Train Your Ear', hint:`${prog.earTraining?.exercisesCompleted || 0} / 50 correct`, hintPct: () => Math.min(100, ((prog.earTraining?.exercisesCompleted || 0) / 50) * 100) },
    // Streak
    { id:'on_fire',       icon:'🔥', title:'On Fire',           desc:'Maintain a 7-day learning streak',          xp:150, cat:'streak',   rarity:'rare',     ctaHref:'training.html', ctaLabel:'Keep Streak', hint:`${snap.streak?.current || 0} / 7 days`, hintPct: () => Math.min(100, ((snap.streak?.current || 0) / 7) * 100) },
    // Social
    { id:'top_100',       icon:'🏆', title:'Top 100',           desc:'Reach leaderboard top 100',                 xp:200, cat:'social',   rarity:'legendary',ctaHref:'leaderboard.html', ctaLabel:'See Leaderboard', hint:'Earn more XP to climb', hintPct: () => Math.min(100, ((snap.xp || 0) / 500) * 100) },
  ];

  const RARITIES = {
    common:    { color: '#9ca3af', dot: '#9ca3af' },
    uncommon:  { color: '#34d399', dot: '#34d399' },
    rare:      { color: '#60a5fa', dot: '#60a5fa' },
    epic:      { color: '#a78bfa', dot: '#a78bfa' },
    legendary: { color: '#fbbf24', dot: '#fbbf24' },
  };

  /* ── Stars background ────────────────────────────────── */
  const starsEl = document.getElementById('achStars');
  for (let i = 0; i < 60; i++) {
    const star = document.createElement('div');
    const size = Math.random() * 3 + 1;
    star.className = 'ach-star';
    star.style.cssText = `
      left:${Math.random()*100}%; top:${Math.random()*100}%;
      width:${size}px; height:${size}px;
      --dur:${2 + Math.random()*4}s; --del:${Math.random()*5}s;
    `;
    starsEl.appendChild(star);
  }

  /* ── Overall progress ────────────────────────────────── */
  const totalAch = ACHIEVEMENTS.length;
  const unlockedCount = ACHIEVEMENTS.filter(a => unlocked.includes(a.id)).length;
  const pct = Math.round((unlockedCount / totalAch) * 100);

  document.getElementById('aobCount').textContent = `${unlockedCount} / ${totalAch} Unlocked`;
  document.getElementById('aobPct').textContent   = `${pct}%`;
  setTimeout(() => { document.getElementById('aobFill').style.width = pct + '%'; }, 400);

  /* ── Filter counts ───────────────────────────────────── */
  document.getElementById('countAll').textContent      = totalAch;
  document.getElementById('countUnlocked').textContent = unlockedCount;
  document.getElementById('countLocked').textContent   = totalAch - unlockedCount;

  /* ── Trophy row ──────────────────────────────────────── */
  const recentUnlocked = ACHIEVEMENTS.filter(a => unlocked.includes(a.id));
  const trophyRow = document.getElementById('achTrophyRow');
  if (recentUnlocked.length > 0) {
    trophyRow.innerHTML = `
      <span class="atr-label">Recently Earned</span>
      <div class="atr-badges">
        ${recentUnlocked.slice(-5).map((a, i) =>
          `<div class="atr-badge" style="--bd:${i}" onclick="openAchModal('${a.id}')" title="${a.title}">${a.icon}</div>`
        ).join('')}
      </div>`;
  } else {
    trophyRow.innerHTML = `<p class="atr-empty">Complete modules to earn your first badge!</p>`;
  }

  /* ── Sidebar: XP breakdown ───────────────────────────── */
  const achXPEarned   = ACHIEVEMENTS.filter(a => unlocked.includes(a.id)).reduce((s, a) => s + a.xp, 0);
  const achXPPossible = ACHIEVEMENTS.reduce((s, a) => s + a.xp, 0);
  const xpPct = achXPPossible > 0 ? Math.round((achXPEarned / achXPPossible) * 100) : 0;

  document.getElementById('achXPEarned').textContent   = achXPEarned.toLocaleString();
  document.getElementById('achXPPossible').textContent = achXPPossible.toLocaleString();
  setTimeout(() => { document.getElementById('achXPFill').style.width = xpPct + '%'; }, 500);

  /* ── Sidebar: Rarity ─────────────────────────────────── */
  const RARITY_ORDER = ['common','uncommon','rare','epic','legendary'];
  const rarityCounts = {};
  ACHIEVEMENTS.forEach(a => { rarityCounts[a.rarity] = (rarityCounts[a.rarity] || 0) + 1; });

  document.getElementById('achRarity').innerHTML = RARITY_ORDER.map(r => {
    const count = rarityCounts[r] || 0;
    const earned = ACHIEVEMENTS.filter(a => a.rarity === r && unlocked.includes(a.id)).length;
    const col = RARITIES[r]?.color || '#fff';
    return `
      <div class="ach-rarity-row">
        <div class="arr-dot" style="background:${col}"></div>
        <span class="arr-label">${r.charAt(0).toUpperCase() + r.slice(1)}</span>
        <div class="arr-bar"><div class="arr-fill" style="width:${count > 0 ? (earned/count)*100 : 0}%; background:${col}"></div></div>
        <span class="arr-count">${earned}/${count}</span>
      </div>`;
  }).join('');

  /* ── Sidebar: Next to unlock ─────────────────────────── */
  const lockedWithProgress = ACHIEVEMENTS
    .filter(a => !unlocked.includes(a.id))
    .map(a => ({ ...a, pct: a.hintPct() }))
    .sort((a, b) => b.pct - a.pct)
    .slice(0, 3);

  document.getElementById('achNext').innerHTML = lockedWithProgress.map(a => `
    <div class="an-item" onclick="openAchModal('${a.id}')">
      <span class="an-icon">${a.icon}</span>
      <div class="an-info">
        <strong>${a.title}</strong>
        <span>${a.hint}</span>
      </div>
      <span class="an-pct">${Math.round(a.pct)}%</span>
    </div>`).join('');

  /* ── Render cards ────────────────────────────────────── */
  let currentFilter = 'all';
  let currentSort   = 'default';

  function renderCards(filter, sort) {
    let list = [...ACHIEVEMENTS];

    // Filter
    if (filter === 'unlocked') list = list.filter(a => unlocked.includes(a.id));
    else if (filter === 'locked') list = list.filter(a => !unlocked.includes(a.id));
    else if (['training','quiz','ear','streak','social'].includes(filter)) list = list.filter(a => a.cat === filter);

    // Sort
    if (sort === 'unlocked-first') list.sort((a, b) => (unlocked.includes(b.id) ? 1 : 0) - (unlocked.includes(a.id) ? 1 : 0));
    else if (sort === 'locked-first') list.sort((a, b) => (unlocked.includes(a.id) ? 1 : 0) - (unlocked.includes(b.id) ? 1 : 0));
    else if (sort === 'xp-high') list.sort((a, b) => b.xp - a.xp);
    else if (sort === 'xp-low')  list.sort((a, b) => a.xp - b.xp);

    const container = document.getElementById('achCards');
    container.innerHTML = list.map((a, i) => {
      const isUnlocked = unlocked.includes(a.id);
      const hint = a.hintPct();
      return `
        <div class="ach-card ${isUnlocked ? 'unlocked' : 'locked'}" style="--ci:${i}" onclick="openAchModal('${a.id}')">
          <div class="ach-card-glow"></div>
          <div class="ach-unlocked-check">✓</div>
          ${!isUnlocked ? '<div class="ach-lock-icon">🔒</div>' : ''}
          <div class="ach-card-icon">${a.icon}</div>
          <div class="ach-card-name">${a.title}</div>
          <div class="ach-card-desc">${a.desc}</div>
          <div class="ach-card-footer">
            <span class="ach-xp-badge">+${a.xp} XP</span>
            <span class="ach-rarity-badge rarity-${a.rarity}">${a.rarity}</span>
          </div>
          ${!isUnlocked && hint > 0 ? `
            <div class="ach-progress-hint">
              <div class="ach-progress-fill" style="width:${hint}%"></div>
            </div>` : ''}
        </div>`;
    }).join('');
  }

  renderCards('all', 'default');

  /* ── Filter buttons ──────────────────────────────────── */
  document.querySelectorAll('.ach-filter').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ach-filter').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.f;
      renderCards(currentFilter, currentSort);
    });
  });

  /* ── Sort ────────────────────────────────────────────── */
  window.sortAchievements = function(val) {
    currentSort = val;
    renderCards(currentFilter, currentSort);
  };

  /* ── Modal ───────────────────────────────────────────── */
  window.openAchModal = function(id) {
    const a = ACHIEVEMENTS.find(x => x.id === id);
    if (!a) return;

    const isUnlocked = unlocked.includes(id);
    const hint = a.hintPct();

    document.getElementById('modalIcon').textContent  = a.icon;
    document.getElementById('modalTitle').textContent = a.title;
    document.getElementById('modalDesc').textContent  = a.desc;
    document.getElementById('modalXP').textContent    = `+${a.xp} XP`;
    document.getElementById('modalRarity').textContent = a.rarity.charAt(0).toUpperCase() + a.rarity.slice(1);
    document.getElementById('modalCategory').textContent = a.cat.charAt(0).toUpperCase() + a.cat.slice(1);

    const statusEl = document.getElementById('modalStatus');
    const ctaEl    = document.getElementById('modalCTA');

    if (isUnlocked) {
      statusEl.innerHTML = `<div class="ams-unlocked">✅ Achievement Unlocked!</div>`;
      ctaEl.classList.add('hidden');
    } else {
      statusEl.innerHTML = `
        <div class="ams-locked">
          <div class="ams-locked-label"><span>Progress</span><span>${Math.round(hint)}%</span></div>
          <div class="ams-locked-bar">
            <div class="ams-locked-fill" style="width:${hint}%"></div>
          </div>
        </div>`;
      ctaEl.classList.remove('hidden');
      ctaEl.href = a.ctaHref;
      ctaEl.textContent = a.ctaLabel + ' →';
    }

    document.getElementById('achModalOverlay').classList.add('open');

    // Confetti on unlocked achievements
    if (isUnlocked) setTimeout(triggerConfetti, 200);
  };

  window.closeAchModal = function() {
    document.getElementById('achModalOverlay').classList.remove('open');
  };

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAchModal();
  });

  /* ── Confetti ────────────────────────────────────────── */
  function triggerConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const COLORS = ['#fbbf24','#f97316','#ec4899','#a78bfa','#34d399','#60a5fa'];
    const particles = Array.from({ length: 90 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      r: Math.random() * 6 + 2,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      vx: (Math.random() - 0.5) * 5,
      vy: Math.random() * 3.5 + 1.5,
      rot: Math.random() * 360, rotV: (Math.random() - 0.5) * 7,
      alpha: 1,
    }));

    let frame = 0;
    (function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.rotV; p.alpha -= 0.014;
        if (p.alpha <= 0) return;
        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        ctx.restore();
      });
      if (++frame < 140) requestAnimationFrame(animate);
      else ctx.clearRect(0, 0, canvas.width, canvas.height);
    })();
  }

  /* ── Intersection observer ───────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.06 });

  document.querySelectorAll('.ach-widget, .ach-overall-bar').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(18px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
    io.observe(el);
  });

  const vs = document.createElement('style');
  vs.textContent = '.visible{opacity:1!important;transform:none!important}';
  document.head.appendChild(vs);

});
