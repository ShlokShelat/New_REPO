/**
 * training.js — Training hub page controller
 * Reads from HarmoniaDB and populates all UI elements
 */

document.addEventListener('DOMContentLoaded', () => {

  // ── Load snapshot from DB ──────────────────────────────────
  const snap = HarmoniaDB.getSnapshot();

  // ── Hero XP Bar ───────────────────────────────────────────
  (function updateHeroXP() {
    const { levelInfo, stats, streak, progress } = snap;
    const lp = levelInfo;

    document.getElementById('heroXP').textContent       = `${lp.currentXP.toLocaleString()} XP`;
    document.getElementById('heroLevel').textContent    = `Level ${lp.level} — ${lp.title}`;
    document.getElementById('heroXPNext').textContent   = `${lp.earnedInLevel.toLocaleString()} / ${lp.neededInLevel.toLocaleString()} XP to Level ${lp.level + 1}`;

    // Animate bar on load
    setTimeout(() => {
      document.getElementById('heroXPBar').style.width = lp.percent + '%';
    }, 400);

    // Stats row
    document.getElementById('statLessons').textContent  = stats.lessonsCompleted || 0;
    document.getElementById('statStreak').textContent   = (streak.current || 0) + '🔥';
    document.getElementById('statQuizzes').textContent  = stats.quizzesTaken || 0;

    const practiceMin = stats.totalPracticeMinutes || 0;
    document.getElementById('statPractice').textContent = HarmoniaDB.formatMinutes(practiceMin);
  })();

  // ── Module progress bars ──────────────────────────────────
  (function updateModuleProgress() {
    const { progress } = snap;

    // Learning Path
    const lpPct = progress.learningPath?.percent || 0;
    document.getElementById('lpProgress').textContent    = lpPct + '%';
    setTimeout(() => {
      document.getElementById('lpProgressBar').style.width = lpPct + '%';
    }, 600);

    // Theory Quiz – average score
    const quizPct = progress.theoryQuiz?.averageScore || 0;
    document.getElementById('quizProgress').textContent    = quizPct + '%';
    setTimeout(() => {
      document.getElementById('quizProgressBar').style.width = quizPct + '%';
    }, 700);

    // Ear Training – correct rate
    const earPct = progress.earTraining?.correctRate || 0;
    document.getElementById('earProgress').textContent    = earPct + '%';
    setTimeout(() => {
      document.getElementById('earProgressBar').style.width = earPct + '%';
    }, 800);

    // Practice Mode – minutes → progress toward 1200 min (20h) milestone
    const practiceMin = progress.practiceMode?.totalMinutes || 0;
    const practicePct = Math.min(100, Math.round((practiceMin / 1200) * 100));
    document.getElementById('practiceProgress').textContent    = HarmoniaDB.formatMinutes(practiceMin);
    setTimeout(() => {
      document.getElementById('practiceProgressBar').style.width = practicePct + '%';
    }, 900);
  })();

  // ── Activity Feed ──────────────────────────────────────────
  (function populateActivity() {
    const feed = HarmoniaDB.getActivity(8);
    const container = document.getElementById('activityFeed');
    if (!container) return;

    if (!feed.length) return; // Keep empty state

    container.innerHTML = '';
    feed.forEach(item => {
      const el = document.createElement('div');
      el.className = 'ra-item';
      el.innerHTML = `
        <div class="ra-item-icon">${item.icon || '🎵'}</div>
        <div class="ra-item-info">
          <strong>${escapeHTML(item.title)}</strong>
          <span>${item.time}</span>
        </div>
        ${item.xp > 0 ? `<div class="ra-item-xp">+${item.xp} XP</div>` : ''}
      `;
      container.appendChild(el);
    });
  })();

  // ── Achievements ──────────────────────────────────────────
  (function populateAchievements() {
    const unlocked = HarmoniaDB.getUnlockedAchievements();
    const items = document.querySelectorAll('.ach-item');
    items.forEach(item => {
      const icon = item.querySelector('.ach-icon')?.textContent?.trim();
      const def = HarmoniaDB.ACHIEVEMENT_DEFS.find(a => a.icon === icon);
      if (def && unlocked.includes(def.id)) {
        item.dataset.unlocked = 'true';
      }
    });
  })();

  // ── Filter buttons ─────────────────────────────────────────
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      document.querySelectorAll('.module-card').forEach(card => {
        if (filter === 'all' || card.dataset.level === filter) {
          card.style.display = '';
          card.style.animation = 'fadeIn 0.3s ease both';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // ── Daily challenge countdown ──────────────────────────────
  (function startChallengeTimer() {
    const el = document.getElementById('challengeTimer');
    if (!el) return;

    function update() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.floor((midnight - now) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2, '0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2, '0');
      const s = String(diff % 60).padStart(2, '0');
      el.textContent = `${h}:${m}:${s}`;
    }
    update();
    setInterval(update, 1000);
  })();

  // ── Intersection observer for stagger animate ──────────────
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });

  document.querySelectorAll('.module-card, .ra-card, .rec-item, .ach-item').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(28px)';
    el.style.transition = `opacity 0.5s ease ${i * 0.07}s, transform 0.5s ease ${i * 0.07}s`;
    observer.observe(el);
  });

  const visStyle = document.createElement('style');
  visStyle.textContent = `.visible { opacity:1 !important; transform:none !important; }
  @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }`;
  document.head.appendChild(visStyle);

  // ── Greeting based on time ────────────────────────────────
  (function greeting() {
    const h = new Date().getHours();
    const msg = h < 12 ? '🌅 Good morning!' : h < 17 ? '☀️ Good afternoon!' : '🌙 Good evening!';
    const badge = document.querySelector('.th-badge');
    if (badge && !HarmoniaDB.getXP()) {
      // First visit hint
    }
  })();

});

// ── Utility ──────────────────────────────────────────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
