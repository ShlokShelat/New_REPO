/**
 * progress.js — My Progress page controller
 * Full HarmoniaDB integration + synthetic history generation
 */

document.addEventListener('DOMContentLoaded', () => {

  const snap    = HarmoniaDB.getSnapshot();
  const li      = snap.levelInfo;
  const stats   = snap.stats;
  const streak  = snap.streak;
  const prog    = snap.progress;

  /* ── Level Ring ─────────────────────────────────────── */
  document.getElementById('ringLevel').textContent = li.level;
  document.getElementById('ringTitle').textContent = li.title;
  document.getElementById('ringsXP').textContent   = li.currentXP.toLocaleString();
  document.getElementById('ringsNext').textContent = Math.max(0, li.neededInLevel - li.earnedInLevel).toLocaleString();

  const circumference = 2 * Math.PI * 78; // r=78
  const arc = document.getElementById('ringArc');
  setTimeout(() => {
    const offset = circumference - (li.percent / 100) * circumference;
    arc.style.strokeDashoffset = offset;
  }, 400);

  /* ── Stat Cards ─────────────────────────────────────── */
  const statDefs = [
    {
      icon: '📚', label: 'Lessons Done',
      val: stats.lessonsCompleted || 0,
      sub: `${prog.learningPath.percent || 0}% of curriculum`,
      trend: stats.lessonsCompleted > 0 ? `+${stats.lessonsCompleted}` : null,
      grad: 'linear-gradient(90deg,#7c3aed,#a78bfa)', glow: '#7c3aed',
    },
    {
      icon: '🧠', label: 'Quizzes Taken',
      val: stats.quizzesTaken || 0,
      sub: `Avg score ${prog.theoryQuiz.averageScore || 0}%`,
      trend: stats.quizzesTaken > 0 ? `${prog.theoryQuiz.averageScore || 0}% avg` : null,
      grad: 'linear-gradient(90deg,#db2777,#ec4899)', glow: '#db2777',
    },
    {
      icon: '👂', label: 'Ear Sessions',
      val: stats.earTrainingSessions || 0,
      sub: `${prog.earTraining.correctRate || 0}% accuracy`,
      trend: stats.earTrainingSessions > 0 ? `↑${prog.earTraining.correctRate || 0}%` : null,
      grad: 'linear-gradient(90deg,#0ea5e9,#38bdf8)', glow: '#0ea5e9',
    },
    {
      icon: '🎸', label: 'Practice Time',
      val: HarmoniaDB.formatMinutes(stats.totalPracticeMinutes || 0),
      sub: `${prog.practiceMode.sessionsCount || 0} sessions`,
      trend: stats.totalPracticeMinutes > 0 ? `${prog.practiceMode.sessionsCount || 0} sessions` : null,
      grad: 'linear-gradient(90deg,#10b981,#34d399)', glow: '#10b981',
    },
  ];

  const statGrid = document.getElementById('prStatGrid');
  statGrid.innerHTML = statDefs.map((s, i) => `
    <div class="pr-stat-card" style="--ci:${i};--card-grad:${s.grad}">
      <div class="psc-glow" style="background:${s.glow}"></div>
      <span class="psc-icon">${s.icon}</span>
      <span class="psc-val">${s.val}</span>
      <span class="psc-label">${s.label}</span>
      <span class="psc-sub">${s.sub}</span>
      ${s.trend ? `<span class="psc-trend">${s.trend}</span>` : ''}
    </div>`).join('');

  /* ── Module Progress ────────────────────────────────── */
  const modules = [
    {
      href: 'training.html', icon: '🛤️',
      iconBg: 'rgba(124,58,237,0.15)',
      name: 'Learning Path', pct: prog.learningPath.percent || 0,
      fillColor: 'linear-gradient(90deg,#7c3aed,#a78bfa)',
      meta: `${prog.learningPath.completedLessons?.length || 0} / 200 lessons`,
      cta: prog.learningPath.percent > 0 ? 'Continue' : 'Start',
    },
    {
      href: 'theory-quiz.html', icon: '🧠',
      iconBg: 'rgba(219,39,119,0.15)',
      name: 'Theory Quiz', pct: prog.theoryQuiz.averageScore || 0,
      fillColor: 'linear-gradient(90deg,#db2777,#ec4899)',
      meta: `${stats.quizzesTaken || 0} quizzes · ${stats.totalCorrectAnswers || 0} correct answers`,
      cta: 'Take Quiz',
    },
    {
      href: 'ear-training.html', icon: '👂',
      iconBg: 'rgba(14,165,233,0.15)',
      name: 'Ear Training', pct: prog.earTraining.correctRate || 0,
      fillColor: 'linear-gradient(90deg,#0ea5e9,#38bdf8)',
      meta: `${prog.earTraining.exercisesCompleted || 0} correct · ${prog.earTraining.totalAttempts || 0} attempts`,
      cta: 'Train Ear',
    },
    {
      href: 'practice-mode.html', icon: '🎸',
      iconBg: 'rgba(16,185,129,0.15)',
      name: 'Practice Mode',
      pct: Math.min(100, Math.round(((prog.practiceMode.totalMinutes || 0) / 1200) * 100)),
      fillColor: 'linear-gradient(90deg,#10b981,#34d399)',
      meta: `${HarmoniaDB.formatMinutes(prog.practiceMode.totalMinutes || 0)} of 20h goal`,
      cta: 'Practice',
    },
  ];

  document.getElementById('prModules').innerHTML = modules.map(m => `
    <a href="${m.href}" class="pr-module">
      <div class="prm-icon" style="background:${m.iconBg}">${m.icon}</div>
      <div class="prm-info">
        <div class="prm-top">
          <strong>${m.name}</strong>
          <span class="prm-pct" style="color:${m.pct > 60 ? '#34d399' : m.pct > 30 ? '#fbbf24' : 'var(--muted)'}">${m.pct}%</span>
        </div>
        <div class="prm-bar">
          <div class="prm-fill" style="width:0%; background:${m.fillColor}" data-w="${m.pct}%"></div>
        </div>
        <span class="prm-meta">${m.meta}</span>
      </div>
      <span class="prm-cta">${m.cta} →</span>
    </a>`).join('');

  setTimeout(() => {
    document.querySelectorAll('.prm-fill').forEach(el => {
      el.style.transition = 'width 1.2s cubic-bezier(0.34,1.56,0.64,1)';
      el.style.width = el.dataset.w;
    });
  }, 300);

  /* ── Activity Heatmap ───────────────────────────────── */
  function buildHeatmap() {
    const heatmap = document.getElementById('prHeatmap');
    const today = new Date();
    const cells = 52 * 7; // one year
    const activityMap = {};

    // Use quiz/ear/practice history timestamps
    const allHistory = [
      ...HarmoniaDB.getQuizHistory(100).map(h => h.timestamp),
      ...HarmoniaDB.getEarHistory(100).map(h => h.timestamp),
      ...HarmoniaDB.getPracticeSessions(100).map(h => h.timestamp),
    ];

    allHistory.forEach(ts => {
      const d = new Date(ts).toDateString();
      activityMap[d] = (activityMap[d] || 0) + 1;
    });

    // Seed some demo activity so it looks populated
    const seed = 42;
    let s = seed;
    function sr() { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }

    const fragment = document.createDocumentFragment();
    let activeDays = 0;

    for (let i = cells - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toDateString();

      // Real + simulated activity
      let activity = activityMap[key] || 0;
      // Add simulated past data
      if (i > 7) {
        const r = sr();
        if (r > 0.65) activity = Math.max(activity, Math.floor(sr() * 4) + 1);
        if (r > 0.85) activity = Math.max(activity, 3);
      }

      const level = activity === 0 ? 0 : activity === 1 ? 1 : activity <= 2 ? 2 : activity <= 4 ? 3 : 4;
      if (level > 0) activeDays++;

      const cell = document.createElement('div');
      cell.className = `hm-cell hm-${level}`;
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      cell.title = `${dateStr}: ${activity} ${activity === 1 ? 'session' : 'sessions'}`;
      fragment.appendChild(cell);
    }

    heatmap.appendChild(fragment);
    document.getElementById('heatmapTotal').textContent = `${activeDays} days active this year`;
  }
  buildHeatmap();

  /* ── Sessions ───────────────────────────────────────── */
  const SESSION_TYPES = {
    quiz:     { icon: '🧠', bg: 'rgba(219,39,119,0.15)', label: 'Theory Quiz' },
    ear:      { icon: '👂', bg: 'rgba(14,165,233,0.15)',  label: 'Ear Training' },
    practice: { icon: '🎸', bg: 'rgba(16,185,129,0.15)',  label: 'Practice Mode' },
    lesson:   { icon: '🛤️', bg: 'rgba(124,58,237,0.15)', label: 'Lesson' },
  };

  // Build unified session list from DB history + generated data
  const realSessions = [];

  HarmoniaDB.getQuizHistory(10).forEach(q => {
    realSessions.push({
      type: 'quiz', timestamp: q.timestamp,
      title: `Theory Quiz${q.topic ? ` — ${q.topic}` : ''}`,
      sub: `${q.correct || 0}/${q.total || 0} correct · ${q.durationSeconds ? Math.round(q.durationSeconds/60) + ' min' : ''}`,
      score: `${q.scorePercent || 0}%`, xp: q.xpEarned || 0,
    });
  });
  HarmoniaDB.getEarHistory(10).forEach(e => {
    realSessions.push({
      type: 'ear', timestamp: e.timestamp,
      title: `Ear Training${e.type ? ` — ${e.type}` : ''}`,
      sub: `${e.correct || 0}/${e.total || 0} correct`,
      score: `${e.total > 0 ? Math.round((e.correct/e.total)*100) : 0}%`, xp: 0,
    });
  });
  HarmoniaDB.getPracticeSessions(10).forEach(p => {
    realSessions.push({
      type: 'practice', timestamp: p.timestamp,
      title: `Practice Session${p.instrument ? ` — ${p.instrument}` : ''}`,
      sub: HarmoniaDB.formatMinutes(p.durationMinutes || 0),
      score: `${p.durationMinutes || 0} min`, xp: p.durationMinutes || 0,
    });
  });

  // Fill with generated data if sparse
  const GEN_SESSIONS = [
    { type:'quiz', title:'Intervals Quiz', sub:'8/10 correct · 6 min', score:'80%', xp:80 },
    { type:'ear', title:'Ear Training — Chords', sub:'12/15 correct', score:'80%', xp:40 },
    { type:'practice', title:'Practice Session — Guitar', sub:'25 min', score:'25 min', xp:25 },
    { type:'quiz', title:'Scales & Keys Quiz', sub:'9/10 correct · 8 min', score:'90%', xp:90 },
    { type:'ear', title:'Ear Training — Intervals', sub:'18/20 correct', score:'90%', xp:45 },
    { type:'lesson', title:'Lesson: Music Fundamentals', sub:'Module 1 · Lesson 3', score:'Done', xp:25 },
    { type:'quiz', title:'Chords & Harmony Quiz', sub:'7/10 correct · 9 min', score:'70%', xp:70 },
    { type:'practice', title:'Practice Session — Piano', sub:'30 min', score:'30 min', xp:30 },
  ];

  let allSessions = [...realSessions];
  let base = Date.now() - 86400000 * 2;
  if (allSessions.length < 5) {
    GEN_SESSIONS.forEach((gs, i) => {
      allSessions.push({ ...gs, timestamp: base - i * 3600000 * 8 });
    });
  }
  allSessions.sort((a, b) => b.timestamp - a.timestamp);

  let activeTab = 'all';

  function renderSessions(tab) {
    const filtered = tab === 'all' ? allSessions : allSessions.filter(s => s.type === tab);
    const container = document.getElementById('prSessions');

    if (!filtered.length) {
      container.innerHTML = `
        <div class="pr-empty">
          <div class="pr-empty-icon">🎵</div>
          <p>No ${tab === 'all' ? '' : tab + ' '}sessions yet.</p>
          <a href="training.html">Start Training →</a>
        </div>`;
      return;
    }

    container.innerHTML = filtered.slice(0, 10).map((s, i) => {
      const t = SESSION_TYPES[s.type] || SESSION_TYPES.lesson;
      const timeAgo = HarmoniaDB.formatMinutes ? relativeTime(s.timestamp) : '';
      return `
        <div class="pr-session-item" style="--si:${i}">
          <div class="prs-type-icon" style="background:${t.bg}">${t.icon}</div>
          <div class="prs-info">
            <strong>${s.title}</strong>
            <span>${s.sub} · ${timeAgo}</span>
          </div>
          <div class="prs-score">
            <span class="prs-score-val">${s.score}</span>
            ${s.xp > 0 ? `<span class="prs-score-xp">+${s.xp} XP</span>` : ''}
          </div>
        </div>`;
    }).join('');
  }

  function relativeTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000)    return 'just now';
    if (diff < 3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
    return `${Math.floor(diff/86400000)}d ago`;
  }

  renderSessions('all');

  document.querySelectorAll('.pr-stab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pr-stab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeTab = btn.dataset.tab;
      renderSessions(activeTab);
    });
  });

  /* ── Streak Calendar ─────────────────────────────────── */
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const weekCal = document.getElementById('prWeekCalendar');

  weekCal.innerHTML = days.map((day, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (today.getDay() - i));
    const isToday = d.toDateString() === today.toDateString();
    // Mark active if we have history near that day
    const wasActive = streak.lastDate && Math.abs(new Date(streak.lastDate) - d) < 86400000 * 2;
    const active = wasActive || (streak.current > 0 && i <= today.getDay());
    return `
      <div class="pwc-day">
        <span class="pwc-label">${day}</span>
        <div class="pwc-dot ${active ? 'active' : ''} ${isToday ? 'today' : ''}">${active ? '✓' : ''}</div>
      </div>`;
  }).join('');

  document.getElementById('streakNum').textContent     = `${streak.current || 0}🔥`;
  document.getElementById('streakCurrent').textContent = streak.current || 0;
  document.getElementById('streakLongest').textContent = streak.longest || 0;
  document.getElementById('streakLastDate').textContent = streak.lastDate
    ? new Date(streak.lastDate).toLocaleDateString('en-US', { month:'short', day:'numeric' }) : '—';

  const streakCTA = document.getElementById('streakCTA');
  if (streak.lastDate === today.toDateString()) {
    streakCTA.textContent = '✅ Streak maintained today!';
    streakCTA.style.color = '#34d399';
  }

  /* ── Daily Goals ─────────────────────────────────────── */
  const goals = [
    {
      icon: '🧠', label: 'Complete a Quiz',
      done: stats.quizzesTaken > 0,
      current: stats.quizzesTaken > 0 ? 1 : 0, target: 1,
    },
    {
      icon: '🎸', label: 'Practice 15 min',
      done: (prog.practiceMode.totalMinutes || 0) >= 15,
      current: Math.min(15, prog.practiceMode.totalMinutes || 0), target: 15,
    },
    {
      icon: '👂', label: 'Ear Training session',
      done: stats.earTrainingSessions > 0,
      current: stats.earTrainingSessions > 0 ? 1 : 0, target: 1,
    },
    {
      icon: '📚', label: 'Complete a Lesson',
      done: stats.lessonsCompleted > 0,
      current: stats.lessonsCompleted > 0 ? 1 : 0, target: 1,
    },
  ];

  document.getElementById('goalsDate').textContent = today.toLocaleDateString('en-US', { weekday:'long', month:'short', day:'numeric' });
  document.getElementById('prGoals').innerHTML = goals.map(g => {
    const pct = Math.round((g.current / g.target) * 100);
    return `
      <div class="pr-goal-item ${g.done ? 'done' : ''}">
        <div class="pr-goal-check">${g.done ? '✓' : g.icon}</div>
        <div class="pr-goal-info">
          <strong>${g.label}</strong>
          <span>${g.current} / ${g.target}</span>
        </div>
        <div class="pr-goal-progress">
          <span class="pr-goal-pct">${pct}%</span>
          <div class="pr-goal-bar">
            <div class="pr-goal-fill" style="width:${pct}%"></div>
          </div>
        </div>
      </div>`;
  }).join('');

  /* ── Skill Radar Chart ───────────────────────────────── */
  function drawRadar() {
    const canvas = document.getElementById('skillRadar');
    const ctx = canvas.getContext('2d');
    const cx = 130, cy = 130, R = 95;
    const labels  = ['Theory','Ear','Rhythm','Harmony','Sight\nRead','Practice'];
    const N = labels.length;

    // Compute scores
    const scores = [
      Math.min(1, (prog.theoryQuiz.averageScore || 0) / 100),
      Math.min(1, (prog.earTraining.correctRate  || 0) / 100),
      Math.min(1, (stats.quizzesTaken || 0) / 20),
      Math.min(1, (prog.theoryQuiz.correct || 0) / 50),
      Math.min(1, (stats.lessonsCompleted || 0) / 30),
      Math.min(1, (prog.practiceMode.totalMinutes || 0) / 600),
    ];

    // If all zero, show demo shape
    const total = scores.reduce((a,b)=>a+b,0);
    const displayScores = total < 0.1
      ? [0.45, 0.30, 0.55, 0.35, 0.25, 0.40]
      : scores;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Grid circles
    for (let lvl = 1; lvl <= 4; lvl++) {
      const r = R * (lvl / 4);
      ctx.beginPath();
      for (let i = 0; i < N; i++) {
        const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = 'rgba(255,255,255,0.06)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Axis lines
    for (let i = 0; i < N; i++) {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(cx + Math.cos(angle) * R, cy + Math.sin(angle) * R);
      ctx.strokeStyle = 'rgba(255,255,255,0.08)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Filled polygon
    ctx.beginPath();
    displayScores.forEach((score, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R * score;
      const y = cy + Math.sin(angle) * R * score;
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.closePath();

    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, 'rgba(167,139,250,0.4)');
    grad.addColorStop(1, 'rgba(236,72,153,0.15)');
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.strokeStyle = '#a78bfa';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dots
    displayScores.forEach((score, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * R * score;
      const y = cy + Math.sin(angle) * R * score;
      ctx.beginPath();
      ctx.arc(x, y, 4, 0, Math.PI * 2);
      ctx.fillStyle = '#ec4899';
      ctx.fill();
    });

    // Labels
    labels.forEach((label, i) => {
      const angle = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x = cx + Math.cos(angle) * (R + 18);
      const y = cy + Math.sin(angle) * (R + 18);
      ctx.font = '600 11px Inter, sans-serif';
      ctx.fillStyle = 'rgba(226,232,240,0.7)';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = label.split('\n');
      lines.forEach((line, li) => {
        ctx.fillText(line, x, y + (li - (lines.length-1)/2) * 14);
      });
    });
  }

  setTimeout(drawRadar, 200);

  /* ── Intersection observer ───────────────────────────── */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.pr-card, .pr-stat-card, .pr-module').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(20px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
    io.observe(el);
  });

  const vs = document.createElement('style');
  vs.textContent = '.visible{opacity:1!important;transform:none!important}';
  document.head.appendChild(vs);

});
