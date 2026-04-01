/**
 * =============================================================
 *  HARMONIA – PRACTICE MODE (scripts/practice-mode.js)
 *  Full functionality:
 *  - Web Audio API metronome with precise scheduling
 *  - Animated pendulum + beat LED indicators
 *  - Tap tempo
 *  - Session timer (start / pause / stop)
 *  - Instrument, focus, goal-duration selectors
 *  - Key & difficulty settings
 *  - Backing tracks library (simulated audio with Web Audio API)
 *  - Session complete modal with XP + achievements
 *  - HarmoniaDB integration
 *  - Keyboard shortcuts (Space, M, ↑↓, S)
 *  - Level-up overlay + XP toast
 *  - Session history rendering
 *  - Daily goal tracking
 * =============================================================
 */

const PracticeMode = (() => {

  /* ─── STATE ────────────────────────────────────────────── */
  const state = {
    /* Session */
    sessionActive: false,
    sessionPaused: false,
    sessionStartTime: null,
    sessionPausedAt: null,
    sessionPausedTotal: 0,
    sessionInterval: null,
    sessionSeconds: 0,

    /* Settings */
    instrument: 'Guitar',
    focus: 'Free Practice',
    goalMinutes: 15,
    key: 'C',
    difficulty: 'Intermediate',

    /* Metronome */
    metroRunning: false,
    bpm: 120,
    beatsPerMeasure: 4,
    currentBeat: 0,
    accentOn: true,
    volume: 0.8,
    visualFlash: true,

    /* Tap tempo */
    tapTimes: [],

    /* Audio */
    audioCtx: null,
    nextBeatTime: 0,
    metroScheduler: null,
    lookahead: 25.0,       // ms — how frequently to call scheduler
    scheduleAhead: 0.1,    // seconds ahead to schedule

    /* Backing tracks */
    playingTrackId: null,
    trackOscillators: [],
    activeTrackFilter: 'all',

    /* Daily stats */
    todayMinutes: 0,
    dailyGoalMinutes: 30,
  };

  /* ─── BACKING TRACKS DATA ────────────────────────────── */
  const TRACKS = [
    { id: 1, name: 'Blues in A', genre: 'Blues', key: 'A', bpm: 80, emoji: '🎸', color: '#1d4ed8', tags: ['12-bar', 'shuffle'], difficulty: 'Beginner' },
    { id: 2, name: 'Slow Blues Groove', genre: 'Blues', key: 'E', bpm: 60, emoji: '🎸', color: '#1e40af', tags: ['slow', 'minor'], difficulty: 'Intermediate' },
    { id: 3, name: 'Jazz Swing Standard', genre: 'Jazz', key: 'Bb', bpm: 120, emoji: '🎷', color: '#7c2d12', tags: ['swing', 'ii-V-I'], difficulty: 'Intermediate' },
    { id: 4, name: 'Bossa Nova Groove', genre: 'Jazz', key: 'C', bpm: 100, emoji: '🎷', color: '#713f12', tags: ['bossa', 'latin jazz'], difficulty: 'Intermediate' },
    { id: 5, name: 'Rock Power Chord Jam', genre: 'Rock', key: 'E', bpm: 140, emoji: '🎸', color: '#7f1d1d', tags: ['power chords', '4/4'], difficulty: 'Beginner' },
    { id: 6, name: 'Funky Rock Groove', genre: 'Rock', key: 'G', bpm: 110, emoji: '🎸', color: '#831843', tags: ['funk', 'groove'], difficulty: 'Intermediate' },
    { id: 7, name: 'Salsa Rhythm Track', genre: 'Latin', key: 'Am', bpm: 150, emoji: '🎺', color: '#14532d', tags: ['salsa', 'clave'], difficulty: 'Advanced' },
    { id: 8, name: 'Bossa Nova Chill', genre: 'Latin', key: 'F', bpm: 90, emoji: '🎺', color: '#166534', tags: ['bossa', 'relaxed'], difficulty: 'Intermediate' },
    { id: 9, name: 'Bach Prelude Drone', genre: 'Classical', key: 'C', bpm: 72, emoji: '🎻', color: '#3b0764', tags: ['baroque', 'drone'], difficulty: 'Advanced' },
    { id: 10, name: 'Romantic Waltz', genre: 'Classical', key: 'D', bpm: 132, emoji: '🎻', color: '#4a044e', tags: ['waltz', '3/4'], difficulty: 'Intermediate' },
    { id: 11, name: 'Minor Pentatonic Jam', genre: 'Blues', key: 'Am', bpm: 95, emoji: '🎸', color: '#1e3a5f', tags: ['pentatonic', 'minor'], difficulty: 'Beginner' },
    { id: 12, name: 'Modal Jazz — Dorian', genre: 'Jazz', key: 'Dm', bpm: 115, emoji: '🎷', color: '#78350f', tags: ['modal', 'dorian'], difficulty: 'Advanced' },
  ];

  /* ─── INSTRUMENTS ICONS (for session history) ─────────── */
  const INSTRUMENT_ICONS = {
    'Guitar': '🎸', 'Piano': '🎹', 'Drums': '🥁',
    'Violin': '🎻', 'Trumpet': '🎺', 'Bass': '🎵',
    'Saxophone': '🎷', 'Voice': '🎤'
  };

  /* ─── INIT ─────────────────────────────────────────────── */
  function init() {
    _loadHeroStats();
    _updateDailyGoalBar();
    _renderTracks(TRACKS);
    _renderHistory();

    // Keyboard shortcuts
    document.addEventListener('keydown', _handleKeyboard);

    // Intersection observer for animate-in
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.pm-track-card, .pm-session-item, .pm-panel').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = `opacity 0.45s ease ${i * 0.05}s, transform 0.45s ease ${i * 0.05}s`;
      observer.observe(el);
    });
    const style = document.createElement('style');
    style.textContent = `.visible { opacity:1!important; transform:none!important; }`;
    document.head.appendChild(style);

    // Add flash overlay div
    const flashDiv = document.createElement('div');
    flashDiv.id = 'pmFlash';
    flashDiv.className = 'pm-flash-overlay';
    document.body.appendChild(flashDiv);

    // Update BPM ring each frame while metro running
    _animatePendulum();
  }

  /* ─── HERO STATS ────────────────────────────────────────── */
  function _loadHeroStats() {
    const snap = HarmoniaDB.getSnapshot();
    const lp = snap.levelInfo;
    const p = snap.progress;
    const streak = snap.streak;
    const sessions = snap.practiceSessions;

    // XP Widget
    document.getElementById('heroXP').textContent = `${lp.currentXP.toLocaleString()} XP`;
    document.getElementById('heroLevel').textContent = `Level ${lp.level} — ${lp.title}`;
    document.getElementById('heroXPNext').textContent =
      `${lp.earnedInLevel.toLocaleString()} / ${lp.neededInLevel.toLocaleString()} XP to Level ${lp.level + 1}`;
    setTimeout(() => {
      document.getElementById('heroXPBar').style.width = lp.percent + '%';
    }, 400);

    // Stats
    const totalSess = HarmoniaDB.getPracticeSessions(200).length;
    const totalMin = p.practiceMode?.totalMinutes || 0;
    state.todayMinutes = _getTodayMinutes();
    const goalPct = state.dailyGoalMinutes > 0
      ? Math.min(100, Math.round((state.todayMinutes / state.dailyGoalMinutes) * 100)) : 100;

    document.getElementById('statSessions').textContent = totalSess;
    document.getElementById('statTotalTime').textContent = HarmoniaDB.formatMinutes(totalMin);
    document.getElementById('statStreak').textContent = (streak.current || 0) + '🔥';
    document.getElementById('statGoal').textContent = goalPct + '%';

    // Daily goal sub text + progress
    _updateDailyGoalBar();
  }

  function _getTodayMinutes() {
    const today = new Date().toDateString();
    const sessions = HarmoniaDB.getPracticeSessions(200);
    return sessions
      .filter(s => s.timestamp && new Date(s.timestamp).toDateString() === today)
      .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
  }

  function _updateDailyGoalBar() {
    const todayMin = _getTodayMinutes();
    const goal = state.dailyGoalMinutes;
    const pct = goal > 0 ? Math.min(100, Math.round((todayMin / goal) * 100)) : 100;
    const fill = document.getElementById('goalBarFill');
    const pctEl = document.getElementById('goalBarPct');
    const subEl = document.getElementById('goalBarSub');
    const sgFill = document.getElementById('sgFill');
    const sgText = document.getElementById('sgText');

    if (fill) fill.style.width = pct + '%';
    if (pctEl) pctEl.textContent = `${todayMin} / ${goal} min`;
    if (subEl) {
      if (pct >= 100) subEl.textContent = `🎉 Goal reached! You've practiced ${todayMin} min today!`;
      else subEl.textContent = `${goal - todayMin} more minutes to hit your daily goal!`;
    }
    if (sgFill) sgFill.style.width = pct + '%';
    if (sgText) sgText.textContent = `${todayMin} / ${goal} min`;
  }

  /* ─── SESSION TIMER ─────────────────────────────────────── */
  function startSession() {
    if (state.sessionActive && !state.sessionPaused) return;

    if (state.sessionPaused) {
      // Resume
      state.sessionPausedTotal += Date.now() - state.sessionPausedAt;
      state.sessionPaused = false;
      _setTimerLabel('Session running…');
      document.getElementById('pauseBtn').innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
        Pause`;
    } else {
      // Fresh start
      state.sessionActive = true;
      state.sessionPaused = false;
      state.sessionStartTime = Date.now();
      state.sessionPausedTotal = 0;
      state.sessionSeconds = 0;
      _setTimerLabel(`${state.instrument} · ${state.focus}`);
    }

    // UI
    document.getElementById('startBtn').classList.add('pm-hidden');
    document.getElementById('pauseBtn').classList.remove('pm-hidden');
    document.getElementById('stopBtn').classList.remove('pm-hidden');

    // Tick every 100ms for smooth display
    state.sessionInterval = setInterval(_sessionTick, 100);
  }

  function pauseSession() {
    if (!state.sessionActive || state.sessionPaused) return;
    state.sessionPaused = true;
    state.sessionPausedAt = Date.now();
    clearInterval(state.sessionInterval);
    _setTimerLabel('Paused — press Start to resume');
    document.getElementById('pauseBtn').innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="20" height="20"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Resume`;
  }

  function stopSession() {
    if (!state.sessionActive) return;
    clearInterval(state.sessionInterval);

    const elapsed = state.sessionSeconds; // seconds
    const minutes = Math.max(1, Math.floor(elapsed / 60));

    state.sessionActive = false;
    state.sessionPaused = false;

    // Reset UI
    document.getElementById('startBtn').classList.remove('pm-hidden');
    document.getElementById('pauseBtn').classList.add('pm-hidden');
    document.getElementById('stopBtn').classList.add('pm-hidden');
    document.getElementById('timerDisplay').textContent = '00:00:00';
    document.getElementById('sessionXPLive').textContent = '+0 XP this session';
    _setTimerLabel('Ready to start your session');

    // Save to DB
    const notes = document.getElementById('sessionNotes').value.trim();
    const result = HarmoniaDB.savePracticeSession({
      instrument: state.instrument,
      focus: state.focus,
      key: state.key,
      difficulty: state.difficulty,
      bpm: state.bpm,
      durationMinutes: minutes,
      durationSeconds: elapsed,
      notes: notes,
      goalMinutes: state.goalMinutes,
    });

    const xpEarned = result || minutes;

    // Check for level-up
    const prevLevel = HarmoniaDB.getLevelFromXP(HarmoniaDB.getXP() - xpEarned);
    const newLevel = HarmoniaDB.getLevelFromXP(HarmoniaDB.getXP());
    if (newLevel > prevLevel) {
      setTimeout(() => _showLevelUp(newLevel), 600);
    }

    // Achievements earned this run
    const earned = [];
    const progress = HarmoniaDB.getProgress();
    if (progress.practiceMode?.totalMinutes >= 60 &&
        !HarmoniaDB.getUnlockedAchievements().filter(a => a === 'practice_1h').length) {
      earned.push({ icon: '⏱️', title: 'Hour of Power' });
    }
    if (HarmoniaDB.getUnlockedAchievements().includes('practice_1h') && earned.length === 0) {
      // already had it
    }

    // Show modal
    _showSessionModal(minutes, elapsed, xpEarned, earned, notes);

    // Update stats display
    state.todayMinutes = _getTodayMinutes();
    _updateDailyGoalBar();
    _renderHistory();
    _loadHeroStats();
  }

  function _sessionTick() {
    const now = Date.now();
    const elapsed = Math.floor((now - state.sessionStartTime - state.sessionPausedTotal) / 1000);
    state.sessionSeconds = elapsed;

    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    const display = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    document.getElementById('timerDisplay').textContent = display;

    // XP preview (1 XP per minute)
    const xpSoFar = Math.floor(elapsed / 60);
    document.getElementById('sessionXPLive').textContent = `+${xpSoFar} XP this session`;

    // Session goal progress
    const totalToday = _getTodayMinutes() + Math.floor(elapsed / 60);
    const pct = state.dailyGoalMinutes > 0
      ? Math.min(100, Math.round((totalToday / state.dailyGoalMinutes) * 100)) : 100;
    const sgFill = document.getElementById('sgFill');
    if (sgFill) sgFill.style.width = pct + '%';
    const sgText = document.getElementById('sgText');
    if (sgText) sgText.textContent = `${totalToday} / ${state.dailyGoalMinutes} min`;

    // Tick animation
    if (elapsed % 1 === 0) {
      const el = document.getElementById('timerDisplay');
      el.classList.add('pm-tick');
      setTimeout(() => el.classList.remove('pm-tick'), 80);
    }
  }

  function _setTimerLabel(text) {
    const el = document.getElementById('timerLabel');
    if (el) el.textContent = text;
  }

  /* ─── METRONOME (Web Audio API) ──────────────────────────── */
  function _initAudio() {
    if (!state.audioCtx) {
      state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (state.audioCtx.state === 'suspended') {
      state.audioCtx.resume();
    }
  }

  function _scheduleClick(time, isAccent) {
    const ctx = state.audioCtx;
    const gainNode = ctx.createGain();
    gainNode.connect(ctx.destination);
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(state.volume * (isAccent ? 1.0 : 0.65), time + 0.002);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.06);

    const osc = ctx.createOscillator();
    osc.connect(gainNode);
    osc.frequency.setValueAtTime(isAccent ? 1200 : 900, time);
    osc.frequency.exponentialRampToValueAtTime(isAccent ? 800 : 600, time + 0.06);
    osc.type = 'square';
    osc.start(time);
    osc.stop(time + 0.08);

    // Schedule visual LED flash
    const delay = Math.max(0, (time - ctx.currentTime) * 1000);
    const beat = state.currentBeat;
    setTimeout(() => _flashBeat(beat, isAccent), delay);
  }

  function _metro_scheduler() {
    const ctx = state.audioCtx;
    const secondsPerBeat = 60.0 / state.bpm;

    while (state.nextBeatTime < ctx.currentTime + state.scheduleAhead) {
      const isAccent = state.accentOn && (state.currentBeat === 0);
      _scheduleClick(state.nextBeatTime, isAccent);

      state.currentBeat = (state.currentBeat + 1) % state.beatsPerMeasure;
      state.nextBeatTime += secondsPerBeat;
    }
  }

  function _flashBeat(beat, isAccent) {
    // LED flash
    const leds = document.getElementById('beatLeds');
    if (!leds) return;
    const allLeds = leds.querySelectorAll('.pm-led');
    allLeds.forEach(l => { l.classList.remove('pm-led-beat', 'pm-led-accent'); });
    const led = document.getElementById(`led${beat}`);
    if (led) led.classList.add(isAccent ? 'pm-led-accent' : 'pm-led-beat');
    setTimeout(() => { if (led) led.classList.remove('pm-led-beat', 'pm-led-accent'); }, 120);

    // Visual flash
    if (state.visualFlash) {
      const flashEl = document.getElementById('pmFlash');
      if (flashEl) {
        flashEl.style.background = isAccent ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.03)';
        flashEl.classList.add('pm-flashing');
        setTimeout(() => flashEl.classList.remove('pm-flashing'), 60);
      }
    }
  }

  /* Pendulum animation */
  let _pendulumAngle = 0;
  let _pendulumDir = 1;
  let _pendulumLastTime = 0;

  function _animatePendulum() {
    const rod = document.getElementById('pendulumRod');
    if (!rod) { requestAnimationFrame(_animatePendulum); return; }

    if (state.metroRunning) {
      const now = performance.now();
      const dt = now - _pendulumLastTime;
      _pendulumLastTime = now;

      // Speed proportional to BPM
      const speed = (state.bpm / 60) * 0.12 * dt;
      _pendulumAngle += speed * _pendulumDir;
      const maxAngle = 28;
      if (_pendulumAngle > maxAngle) { _pendulumAngle = maxAngle; _pendulumDir = -1; }
      if (_pendulumAngle < -maxAngle) { _pendulumAngle = -maxAngle; _pendulumDir = 1; }

      rod.style.transform = `rotate(${_pendulumAngle}deg)`;
    } else {
      // Rest position
      _pendulumAngle *= 0.85;
      rod.style.transform = `rotate(${_pendulumAngle}deg)`;
    }
    requestAnimationFrame(_animatePendulum);
  }

  /* ─── PUBLIC METRONOME CONTROLS ─────────────────────────── */
  function toggleMetronome() {
    if (state.metroRunning) {
      _stopMetronome();
    } else {
      _startMetronome();
    }
  }

  function _startMetronome() {
    _initAudio();
    state.metroRunning = true;
    state.currentBeat = 0;
    state.nextBeatTime = state.audioCtx.currentTime + 0.05;
    state.metroScheduler = setInterval(_metro_scheduler, state.lookahead);
    _pendulumDir = 1;

    // Update UI
    const btn = document.getElementById('metroPlayBtn');
    if (btn) btn.innerHTML = `
      <svg id="metroPlayIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      Stop Metronome`;
    const panel = document.querySelector('.pm-metro-panel');
    if (panel) panel.classList.add('pm-metro-running');
    const statusEl = document.getElementById('metroStatus');
    if (statusEl) statusEl.innerHTML = `<span class="pm-status-dot"></span> Running — ${state.bpm} BPM`;

    _updateBeatLEDs();
  }

  function _stopMetronome() {
    state.metroRunning = false;
    clearInterval(state.metroScheduler);

    const btn = document.getElementById('metroPlayBtn');
    if (btn) btn.innerHTML = `
      <svg id="metroPlayIcon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="18" height="18"><polygon points="5 3 19 12 5 21 5 3"/></svg>
      Start Metronome`;
    const panel = document.querySelector('.pm-metro-panel');
    if (panel) panel.classList.remove('pm-metro-running');
    const statusEl = document.getElementById('metroStatus');
    if (statusEl) statusEl.innerHTML = `<span class="pm-status-dot"></span> Stopped`;

    // Clear LEDs
    document.querySelectorAll('.pm-led').forEach(l => {
      l.classList.remove('pm-led-beat', 'pm-led-accent');
    });
  }

  function setBPM(val) {
    val = Math.max(20, Math.min(300, val));
    state.bpm = val;
    document.getElementById('bpmValue').textContent = val;
    document.getElementById('bpmSlider').value = val;
    if (state.metroRunning) {
      const statusEl = document.getElementById('metroStatus');
      if (statusEl) statusEl.innerHTML = `<span class="pm-status-dot"></span> Running — ${val} BPM`;
    }
    _updatePresetHighlight();
  }

  function changeBPM(delta) { setBPM(state.bpm + delta); }

  function setTimeSignature(beats, btn) {
    state.beatsPerMeasure = beats;
    state.currentBeat = 0;
    document.querySelectorAll('.pm-ts-btn').forEach(b => b.classList.remove('pm-ts-active'));
    if (btn) btn.classList.add('pm-ts-active');
    _updateBeatLEDs();

    // Restart metronome to apply
    if (state.metroRunning) {
      _stopMetronome();
      setTimeout(_startMetronome, 50);
    }
  }

  function setAccent(val) { state.accentOn = val; }
  function setVolume(val) { state.volume = val / 100; }
  function setVisualFlash(val) { state.visualFlash = val; }

  function _updateBeatLEDs() {
    const container = document.getElementById('beatLeds');
    if (!container) return;
    container.innerHTML = '';
    const count = Math.min(state.beatsPerMeasure, 6);
    for (let i = 0; i < count; i++) {
      const led = document.createElement('div');
      led.className = 'pm-led';
      led.id = `led${i}`;
      container.appendChild(led);
    }
  }

  function _updatePresetHighlight() {
    document.querySelectorAll('.pm-preset').forEach(btn => {
      const val = parseInt(btn.getAttribute('onclick').match(/\d+/)?.[0]);
      btn.classList.toggle('pm-preset-active', val === state.bpm);
    });
  }

  /* ─── TAP TEMPO ─────────────────────────────────────────── */
  function tapTempo() {
    const now = Date.now();
    state.tapTimes.push(now);

    // Keep only last 8 taps within 3 seconds
    const cutoff = now - 3000;
    state.tapTimes = state.tapTimes.filter(t => t >= cutoff);

    // Animate tap button
    const tapBtn = document.getElementById('tapBtn');
    if (tapBtn) {
      tapBtn.style.transform = 'scale(0.9)';
      setTimeout(() => { tapBtn.style.transform = ''; }, 100);
    }

    if (state.tapTimes.length < 2) return;

    // Average interval
    const intervals = [];
    for (let i = 1; i < state.tapTimes.length; i++) {
      intervals.push(state.tapTimes[i] - state.tapTimes[i - 1]);
    }
    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const bpm = Math.round(60000 / avgInterval);
    setBPM(bpm);

    if (state.metroRunning) {
      _stopMetronome();
      setTimeout(_startMetronome, 30);
    }
  }

  /* ─── SESSION SELECTORS ──────────────────────────────────── */
  function selectInstrument(btn) {
    document.querySelectorAll('.pm-instr').forEach(b => b.classList.remove('pm-instr-active'));
    btn.classList.add('pm-instr-active');
    state.instrument = btn.dataset.instrument;
    const label = document.getElementById('instrLabel');
    if (label) label.textContent = state.instrument;
    if (state.sessionActive) _setTimerLabel(`${state.instrument} · ${state.focus}`);
  }

  function selectFocus(btn) {
    document.querySelectorAll('.pm-focus').forEach(b => b.classList.remove('pm-focus-active'));
    btn.classList.add('pm-focus-active');
    state.focus = btn.dataset.focus;
    if (state.sessionActive) _setTimerLabel(`${state.instrument} · ${state.focus}`);
  }

  function setGoalDuration(minutes, btn) {
    state.goalMinutes = minutes;
    document.querySelectorAll('.pm-dur').forEach(b => b.classList.remove('pm-dur-active'));
    if (btn) btn.classList.add('pm-dur-active');
  }

  function setKey(val) { state.key = val; }
  function setDifficulty(val) { state.difficulty = val; }

  /* ─── BACKING TRACKS ─────────────────────────────────────── */
  function _renderTracks(tracks) {
    const grid = document.getElementById('tracksGrid');
    if (!grid) return;
    grid.innerHTML = '';
    tracks.forEach(track => {
      const card = document.createElement('div');
      card.className = 'pm-track-card';
      card.dataset.id = track.id;
      card.dataset.genre = track.genre;
      card.innerHTML = `
        <div class="pm-track-top">
          <div class="pm-track-art" style="background: rgba(255,255,255,0.04); border: 1px solid var(--border);">
            ${track.emoji}
          </div>
          <div class="pm-track-info">
            <div class="pm-track-name">${track.name}</div>
            <div class="pm-track-meta">${track.genre} · Key of ${track.key}</div>
          </div>
        </div>
        <div class="pm-track-tags">
          ${track.tags.map(t => `<span class="pm-track-tag">${t}</span>`).join('')}
          <span class="pm-track-tag ${track.difficulty === 'Beginner' ? 'rd-easy' : track.difficulty === 'Advanced' ? 'rd-hard' : 'rd-medium'}">${track.difficulty}</span>
        </div>
        <div class="pm-track-wave" id="wave-${track.id}">
          ${Array.from({length: 8}, (_, i) => `<span style="--i:${i}"></span>`).join('')}
        </div>
        <div class="pm-track-footer">
          <span class="pm-track-bpm">🎵 ${track.bpm} BPM</span>
          <button class="pm-track-play-btn" id="trackBtn-${track.id}" onclick="PracticeMode.toggleTrack(${track.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Play
          </button>
        </div>
      `;
      grid.appendChild(card);
    });
  }

  function filterTracks(genre, btn) {
    state.activeTrackFilter = genre;
    document.querySelectorAll('.pm-tf-btn').forEach(b => b.classList.remove('pm-tf-active'));
    if (btn) btn.classList.add('pm-tf-active');

    const filtered = genre === 'all' ? TRACKS : TRACKS.filter(t => t.genre === genre);
    _renderTracks(filtered);
  }

  function toggleTrack(id) {
    _initAudio();

    if (state.playingTrackId === id) {
      // Stop
      _stopTrack();
      return;
    }

    // Stop existing
    _stopTrack();

    // Start new
    state.playingTrackId = id;
    const track = TRACKS.find(t => t.id === id);
    if (!track) return;

    // Generate simple rhythmic backing via Web Audio
    _startTrackAudio(track);

    // Update UI
    const card = document.querySelector(`.pm-track-card[data-id="${id}"]`);
    if (card) card.classList.add('pm-track-playing');
    const btn = document.getElementById(`trackBtn-${id}`);
    if (btn) btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
      Stop`;

    // Sync BPM to track
    setBPM(track.bpm);
    _showXpToast(`🎵 Playing: ${track.name}`);
  }

  function _startTrackAudio(track) {
    const ctx = state.audioCtx;
    const bps = 60 / track.bpm;
    const now = ctx.currentTime + 0.05;

    // Create a simple looping rhythmic pattern using oscillators
    // (simulated backing track using synthesis)
    const osc = [];
    const patterns = _getTrackPattern(track);

    function schedulePattern(startTime) {
      const measureDur = bps * 4;
      patterns.forEach(note => {
        const t = startTime + note.time * bps;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(note.vol * 0.3, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.dur * bps);

        const o = ctx.createOscillator();
        o.type = note.type || 'triangle';
        o.frequency.setValueAtTime(note.freq, t);
        o.connect(gain);
        o.start(t);
        o.stop(t + note.dur * bps + 0.05);
        osc.push(o);
      });

      // Schedule next measure
      state._trackLoopId = setTimeout(() => {
        if (state.playingTrackId === track.id) schedulePattern(startTime + measureDur);
      }, (measureDur - 0.1) * 1000);
    }

    schedulePattern(now);
    state.trackOscillators = osc;
  }

  function _getTrackPattern(track) {
    // Returns a list of {time, freq, vol, dur, type} for a simple pattern
    const root = _noteToFreq(track.key);
    const fifth = root * 1.5;
    const octave = root * 2;

    const patterns = {
      'Blues': [
        {time:0, freq:root, vol:0.8, dur:0.8, type:'triangle'},
        {time:1, freq:fifth, vol:0.5, dur:0.4, type:'triangle'},
        {time:2, freq:root, vol:0.7, dur:0.6, type:'triangle'},
        {time:3, freq:fifth, vol:0.5, dur:0.4, type:'triangle'},
      ],
      'Jazz': [
        {time:0, freq:root, vol:0.6, dur:0.4, type:'sine'},
        {time:0.5, freq:fifth, vol:0.4, dur:0.3, type:'sine'},
        {time:1.5, freq:octave*0.75, vol:0.5, dur:0.5, type:'sine'},
        {time:3, freq:root, vol:0.6, dur:0.8, type:'sine'},
      ],
      'Rock': [
        {time:0, freq:root*0.5, vol:0.9, dur:0.5, type:'square'},
        {time:1, freq:root*0.5, vol:0.7, dur:0.5, type:'square'},
        {time:2, freq:root*0.5, vol:0.9, dur:0.5, type:'square'},
        {time:3, freq:root*0.5, vol:0.7, dur:0.5, type:'square'},
      ],
      'Latin': [
        {time:0, freq:root, vol:0.7, dur:0.3, type:'triangle'},
        {time:0.75, freq:fifth*0.5, vol:0.5, dur:0.25, type:'triangle'},
        {time:1.5, freq:root, vol:0.7, dur:0.3, type:'triangle'},
        {time:2.25, freq:fifth*0.5, vol:0.5, dur:0.25, type:'triangle'},
        {time:3, freq:root, vol:0.6, dur:0.5, type:'triangle'},
      ],
      'Classical': [
        {time:0, freq:root, vol:0.5, dur:1, type:'sine'},
        {time:1, freq:fifth, vol:0.4, dur:0.8, type:'sine'},
        {time:2, freq:octave, vol:0.5, dur:0.8, type:'sine'},
        {time:3, freq:fifth, vol:0.4, dur:0.9, type:'sine'},
      ],
    };
    return patterns[track.genre] || patterns['Blues'];
  }

  function _noteToFreq(note) {
    const notes = {
      'C':261.63,'D':293.66,'E':329.63,'F':349.23,'G':392.00,
      'A':440.00,'B':493.88,'Bb':466.16,'Eb':311.13,'Ab':415.30,
      'Am':220.00,'Em':164.81,'Dm':146.83,'Bm':246.94,
    };
    return notes[note] || 261.63;
  }

  function _stopTrack() {
    if (state._trackLoopId) clearTimeout(state._trackLoopId);
    state.trackOscillators.forEach(o => { try { o.stop(); } catch(e){} });
    state.trackOscillators = [];

    if (state.playingTrackId) {
      const id = state.playingTrackId;
      const card = document.querySelector(`.pm-track-card[data-id="${id}"]`);
      if (card) card.classList.remove('pm-track-playing');
      const btn = document.getElementById(`trackBtn-${id}`);
      if (btn) btn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
        Play`;
    }
    state.playingTrackId = null;
  }

  /* ─── SESSION MODAL ─────────────────────────────────────── */
  function _showSessionModal(minutes, seconds, xpEarned, achievements, notes) {
    const modal = document.getElementById('sessionModal');
    if (!modal) return;

    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    let durText = m > 0 ? `${m} min` : `${s} sec`;
    if (h > 0) durText = `${h}h ${m}m`;

    document.getElementById('modalDuration').textContent = durText;
    document.getElementById('modalXP').textContent = `+${xpEarned} XP`;
    document.getElementById('modalBPM').textContent = state.bpm;
    document.getElementById('modalInstrument').textContent = state.instrument;
    document.getElementById('modalFocus').textContent = state.focus;
    document.getElementById('modalKey').textContent = state.key + ' ' + (state.key.length <= 2 ? 'Major' : '');
    document.getElementById('modalDiff').textContent = state.difficulty;

    // Notes
    const notesWrap = document.getElementById('modalNotesWrap');
    const notesEl = document.getElementById('modalNotes');
    if (notes && notesEl) {
      notesEl.textContent = notes;
      notesWrap.classList.remove('pm-hidden');
    } else if (notesWrap) {
      notesWrap.classList.add('pm-hidden');
    }

    // Subtitle
    const msgs = minutes < 5
      ? 'Every minute counts! Keep building the habit.'
      : minutes < 15
      ? 'Nice session! Consistency is key.'
      : minutes < 30
      ? 'Great work! You\'re building serious skills.'
      : 'Amazing dedication! You\'re on the path to mastery.';
    document.getElementById('modalSubtitle').textContent = msgs;

    // Achievements
    const achContainer = document.getElementById('modalAchievements');
    if (achContainer) {
      achContainer.innerHTML = '';
      const allAchs = HarmoniaDB.getAllAchievements();
      const newlyUnlocked = allAchs.filter(a => a.unlocked &&
        ['tuned_in','practice_1h'].includes(a.id));
      newlyUnlocked.forEach(a => {
        const el = document.createElement('div');
        el.className = 'pm-ach-earned';
        el.innerHTML = `${a.icon} ${a.title} unlocked!`;
        achContainer.appendChild(el);
      });
    }

    modal.classList.remove('pm-hidden');

    // Clear notes field
    const notesInput = document.getElementById('sessionNotes');
    if (notesInput) notesInput.value = '';
  }

  function closeModal() {
    const modal = document.getElementById('sessionModal');
    if (modal) modal.classList.add('pm-hidden');
  }

  /* ─── LEVEL UP ───────────────────────────────────────────── */
  function _showLevelUp(level) {
    const overlay = document.getElementById('levelupOverlay');
    if (!overlay) return;
    const titles = HarmoniaDB.LEVEL_TITLES;
    document.getElementById('levelupMsg').textContent = `You reached Level ${level}!`;
    document.getElementById('levelupTitle').textContent = titles[level - 1] || 'Master';
    overlay.classList.remove('pm-hidden');
  }

  function closeLevelUp() {
    const overlay = document.getElementById('levelupOverlay');
    if (overlay) overlay.classList.add('pm-hidden');
  }

  /* ─── XP TOAST ───────────────────────────────────────────── */
  function _showXpToast(msg) {
    const toast = document.getElementById('pmXpToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('pm-toast-show');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('pm-toast-show'), 2800);
  }

  /* ─── HISTORY ────────────────────────────────────────────── */
  function _renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;

    const sessions = HarmoniaDB.getPracticeSessions(30);

    // Update header stats
    const totalSess = HarmoniaDB.getPracticeSessions(200).length;
    const totalMin = HarmoniaDB.getProgress()?.practiceMode?.totalMinutes || 0;
    const avgMin = totalSess > 0 ? Math.round(totalMin / totalSess) : 0;
    const bestSess = sessions.reduce((best, s) => Math.max(best, s.durationMinutes || 0), 0);

    _setText('hsTotalSessions', totalSess);
    _setText('hsTotalTime', HarmoniaDB.formatMinutes(totalMin));
    _setText('hsAvgTime', HarmoniaDB.formatMinutes(avgMin));
    _setText('hsBestSession', HarmoniaDB.formatMinutes(bestSess));

    if (!sessions.length) {
      list.innerHTML = `
        <div class="pm-history-empty">
          <span>🎸</span>
          <p>No sessions yet. Start your first practice session above!</p>
          <a href="#" class="pm-empty-cta" onclick="window.scrollTo({top:0,behavior:'smooth'});return false;">Start Practicing →</a>
        </div>`;
      return;
    }

    list.innerHTML = '';
    sessions.forEach(s => {
      const icon = INSTRUMENT_ICONS[s.instrument] || '🎵';
      const dur = s.durationMinutes || 0;
      const xp = dur; // 1 XP/min
      const date = s.timestamp ? HarmoniaDB.formatRelativeTime ? _formatTime(s.timestamp) : 'Recently' : 'Recently';
      const meta = [s.focus, s.key ? `Key: ${s.key}` : null, s.bpm ? `${s.bpm} BPM` : null]
        .filter(Boolean).join(' · ');

      const el = document.createElement('div');
      el.className = 'pm-session-item';
      el.innerHTML = `
        <div class="pm-session-icon">${icon}</div>
        <div class="pm-session-info">
          <div class="pm-session-title">${s.instrument || 'Practice'} — ${s.focus || 'Free Practice'}</div>
          <div class="pm-session-sub">${meta || 'Session'}</div>
          ${s.notes ? `<div class="pm-session-sub" style="font-style:italic;margin-top:4px;opacity:0.7">"${s.notes.substring(0,60)}${s.notes.length>60?'…':''}"</div>` : ''}
        </div>
        <div class="pm-session-stats">
          <div>
            <div class="pm-session-dur">${HarmoniaDB.formatMinutes(dur)}</div>
            <div class="pm-session-time">${date}</div>
            <div class="pm-session-xp-tag" style="margin-top:4px">+${xp} XP</div>
          </div>
        </div>
      `;
      list.appendChild(el);
    });
  }

  function _formatTime(ts) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)} hr ago`;
    return new Date(ts).toLocaleDateString();
  }

  function _setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  /* ─── KEYBOARD SHORTCUTS ─────────────────────────────────── */
  function _handleKeyboard(e) {
    // Don't fire if typing in inputs
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (!state.sessionActive) startSession();
        else if (state.sessionPaused) startSession();
        else pauseSession();
        break;
      case 'KeyM':
        e.preventDefault();
        toggleMetronome();
        break;
      case 'ArrowUp':
        e.preventDefault();
        changeBPM(1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        changeBPM(-1);
        break;
      case 'KeyS':
        if (state.sessionActive) {
          e.preventDefault();
          stopSession();
        }
        break;
      case 'Escape':
        closeModal();
        closeLevelUp();
        _stopTrack();
        break;
    }
  }

  /* ─── PUBLIC API ─────────────────────────────────────────── */
  return {
    init,
    // Session
    startSession, pauseSession, stopSession, closeModal, closeLevelUp,
    // Metronome
    toggleMetronome, setBPM, changeBPM, setTimeSignature,
    setAccent, setVolume, setVisualFlash, tapTempo,
    // Selectors
    selectInstrument, selectFocus, setGoalDuration, setKey, setDifficulty,
    // Tracks
    filterTracks, toggleTrack,
    // Expose for HarmoniaDB (used internally)
    getLevelFromXP: (xp) => HarmoniaDB.getLevelFromXP(xp),
  };

})();

/* ─── BOOT ───────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  PracticeMode.init();
});
