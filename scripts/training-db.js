/**
 * =====================================================
 *  HARMONIA – TRAINING DATABASE (training-db.js)
 *  Client-side data layer using localStorage
 *  Manages: XP, levels, progress, streaks, quiz history,
 *           practice sessions, achievements, activity feed
 * =====================================================
 */

const HarmoniaDB = (() => {

  const PREFIX = 'harmonia_';
  const SCHEMA_VERSION = 1;

  // ─── XP & Level thresholds ───────────────────────
  const LEVEL_THRESHOLDS = [
    0,      // Level 1
    500,    // Level 2
    1200,   // Level 3
    2200,   // Level 4
    3800,   // Level 5
    6000,   // Level 6
    9000,   // Level 7
    13000,  // Level 8
    18000,  // Level 9
    25000,  // Level 10
    35000,  // Level 11
    50000,  // Level 12 – Master
  ];

  const LEVEL_TITLES = [
    'Newcomer', 'Student', 'Apprentice', 'Learner',
    'Musician', 'Performer', 'Artist', 'Expert',
    'Virtuoso', 'Maestro', 'Legend', 'Master'
  ];

  // ─── Achievement Definitions ─────────────────────
  const ACHIEVEMENT_DEFS = [
    { id: 'first_note',    icon: '🎸', title: 'First Note',      desc: 'Complete your first lesson',          xp: 50 },
    { id: 'quiz_starter',  icon: '🧠', title: 'Quiz Starter',     desc: 'Take your first quiz',                xp: 30 },
    { id: 'tuned_in',      icon: '👂', title: 'Tuned In',         desc: 'Complete an ear training session',    xp: 40 },
    { id: 'on_fire',       icon: '🔥', title: 'On Fire',          desc: '7-day learning streak',               xp: 150 },
    { id: 'speed_learner', icon: '⚡', title: 'Speed Learner',    desc: 'Finish a quiz in under 3 minutes',    xp: 100 },
    { id: 'top_100',       icon: '🏆', title: 'Top 100',          desc: 'Reach leaderboard top 100',           xp: 200 },
    { id: 'perfect_quiz',  icon: '💯', title: 'Perfect Score',    desc: 'Get 100% on a theory quiz',           xp: 200 },
    { id: 'practice_1h',   icon: '⏱️', title: 'Hour of Power',    desc: 'Practice for 1 hour total',           xp: 100 },
    { id: 'ear_master',    icon: '🎵', title: 'Ear Master',       desc: 'Identify 50 intervals correctly',     xp: 250 },
    { id: 'module_1',      icon: '📖', title: 'Foundation Built', desc: 'Complete Learning Path Module 1',     xp: 300 },
    { id: 'combo_x5',      icon: '🎯', title: 'On a Roll',        desc: 'Answer 5 quiz questions in a row',    xp: 75 },
    { id: 'daily_3',       icon: '📅', title: 'Habit Forming',    desc: 'Complete daily challenge 3 times',    xp: 120 },
  ];

  // ─── Storage helpers ──────────────────────────────
  function _key(name) { return PREFIX + name; }

  function _get(name, fallback = null) {
    try {
      const raw = localStorage.getItem(_key(name));
      return raw !== null ? JSON.parse(raw) : fallback;
    } catch { return fallback; }
  }

  function _set(name, value) {
    try { localStorage.setItem(_key(name), JSON.stringify(value)); return true; }
    catch { return false; }
  }

  // ─── Initialise data if first run ────────────────
  function init() {
    if (_get('initialized')) return;

    _set('schema_version', SCHEMA_VERSION);
    _set('initialized', true);
    _set('user', {
      name: 'Guest',
      email: '',
      avatar: 'G',
      joinedAt: Date.now()
    });
    _set('xp', 0);
    _set('level', 1);
    _set('streak', { current: 0, longest: 0, lastDate: null });
    _set('stats', {
      lessonsCompleted: 0,
      quizzesTaken: 0,
      totalPracticeMinutes: 0,
      earTrainingSessions: 0,
      totalCorrectAnswers: 0,
      totalQuizScore: 0
    });
    _set('progress', {
      learningPath: { moduleIndex: 0, lessonIndex: 0, completedLessons: [], percent: 0 },
      theoryQuiz:   { topicsCompleted: [], averageScore: 0, totalQuestions: 0, correct: 0 },
      earTraining:  { exercisesCompleted: 0, correctRate: 0, totalAttempts: 0 },
      practiceMode: { totalMinutes: 0, sessionsCount: 0, goalMinutesPerDay: 30 }
    });
    _set('achievements', []);
    _set('activity', []);
    _set('quiz_history', []);
    _set('practice_sessions', []);
    _set('ear_history', []);
    _set('daily_challenge', { completedDates: [], currentStreak: 0 });

    console.log('[HarmoniaDB] Initialized fresh database.');
  }

  // ─── XP & Level ──────────────────────────────────
  function getXP() { return _get('xp', 0); }
  function getLevel() { return _get('level', 1); }

  function getLevelFromXP(xp) {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
    }
    return 1;
  }

  function getLevelProgress(xp) {
    const level = getLevelFromXP(xp);
    const idx = level - 1;
    const currentThreshold = LEVEL_THRESHOLDS[idx] || 0;
    const nextThreshold = LEVEL_THRESHOLDS[idx + 1] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    const earned = xp - currentThreshold;
    const needed = nextThreshold - currentThreshold;
    const percent = Math.min(100, Math.round((earned / needed) * 100));
    return {
      level,
      title: LEVEL_TITLES[idx] || 'Master',
      currentXP: xp,
      earnedInLevel: earned,
      neededInLevel: needed,
      nextLevelXP: nextThreshold,
      percent
    };
  }

  function addXP(amount, reason = '') {
    const prev = getXP();
    const newXP = prev + amount;
    _set('xp', newXP);

    const prevLevel = getLevelFromXP(prev);
    const newLevel  = getLevelFromXP(newXP);
    _set('level', newLevel);

    // Log activity
    if (reason) {
      addActivity({
        icon: '⭐',
        title: `+${amount} XP — ${reason}`,
        time: 'Just now',
        xp: amount
      });
    }

    if (newLevel > prevLevel) {
      addActivity({
        icon: '🎉',
        title: `Level Up! You reached Level ${newLevel} — ${LEVEL_TITLES[newLevel - 1]}`,
        time: 'Just now',
        xp: 0
      });
      return { leveled: true, newLevel, xpAdded: amount };
    }

    return { leveled: false, newLevel, xpAdded: amount };
  }

  // ─── Streak ───────────────────────────────────────
  function checkAndUpdateStreak() {
    const streak = _get('streak', { current: 0, longest: 0, lastDate: null });
    const today  = new Date().toDateString();

    if (streak.lastDate === today) return streak; // Already updated today

    const yesterday = new Date(Date.now() - 86400000).toDateString();
    if (streak.lastDate === yesterday) {
      streak.current++;
    } else {
      streak.current = 1; // Reset streak
    }
    streak.longest  = Math.max(streak.longest, streak.current);
    streak.lastDate = today;
    _set('streak', streak);

    // Check streak achievement
    if (streak.current >= 7) checkAchievement('on_fire');

    return streak;
  }

  function getStreak() { return _get('streak', { current: 0, longest: 0, lastDate: null }); }

  // ─── Progress ─────────────────────────────────────
  function getProgress() { return _get('progress', {}); }

  function updateLearningPath(data) {
    const p = getProgress();
    p.learningPath = { ...p.learningPath, ...data };
    _set('progress', p);
    checkAchievement('first_note');
  }

  function updateTheoryQuiz(data) {
    const p = getProgress();
    p.theoryQuiz = { ...p.theoryQuiz, ...data };
    _set('progress', p);
  }

  function updateEarTraining(data) {
    const p = getProgress();
    p.earTraining = { ...p.earTraining, ...data };
    _set('progress', p);
  }

  function updatePracticeMode(data) {
    const p = getProgress();
    p.practiceMode = { ...p.practiceMode, ...data };
    _set('progress', p);
  }

  // ─── Stats ────────────────────────────────────────
  function getStats() {
    return _get('stats', {
      lessonsCompleted: 0,
      quizzesTaken: 0,
      totalPracticeMinutes: 0,
      earTrainingSessions: 0,
      totalCorrectAnswers: 0,
      totalQuizScore: 0
    });
  }

  function incrementStat(key, amount = 1) {
    const stats = getStats();
    stats[key] = (stats[key] || 0) + amount;
    _set('stats', stats);
    return stats;
  }

  // ─── Activity Feed ───────────────────────────────
  function addActivity(item) {
    const feed = _get('activity', []);
    feed.unshift({
      ...item,
      id: Date.now(),
      timestamp: Date.now()
    });
    // Keep max 50 items
    _set('activity', feed.slice(0, 50));
  }

  function getActivity(limit = 10) {
    const feed = _get('activity', []);
    return feed.slice(0, limit).map(item => ({
      ...item,
      time: formatRelativeTime(item.timestamp)
    }));
  }

  // ─── Achievements ─────────────────────────────────
  function checkAchievement(id) {
    const unlocked = _get('achievements', []);
    if (unlocked.includes(id)) return false;

    unlocked.push(id);
    _set('achievements', unlocked);

    const def = ACHIEVEMENT_DEFS.find(a => a.id === id);
    if (def) {
      addXP(def.xp, `Achievement unlocked: ${def.title}`);
      addActivity({
        icon: def.icon,
        title: `Achievement: ${def.title}`,
        time: 'Just now',
        xp: def.xp
      });
    }
    return true;
  }

  function getUnlockedAchievements() { return _get('achievements', []); }

  function getAllAchievements() {
    const unlocked = getUnlockedAchievements();
    return ACHIEVEMENT_DEFS.map(def => ({
      ...def,
      unlocked: unlocked.includes(def.id)
    }));
  }

  // ─── Quiz History ─────────────────────────────────
  function saveQuizResult(result) {
    const history = _get('quiz_history', []);
    history.unshift({
      ...result,
      id: Date.now(),
      timestamp: Date.now()
    });
    _set('quiz_history', history.slice(0, 100));

    // Update stats
    incrementStat('quizzesTaken');
    incrementStat('totalCorrectAnswers', result.correct || 0);

    // Update progress
    const p = getProgress();
    const q = p.theoryQuiz;
    q.totalQuestions = (q.totalQuestions || 0) + (result.total || 0);
    q.correct = (q.correct || 0) + (result.correct || 0);
    q.averageScore = Math.round((q.correct / q.totalQuestions) * 100) || 0;
    updateTheoryQuiz(q);

    // XP
    const xpEarned = Math.round((result.correct / result.total) * result.xpAvailable || 0);
    addXP(xpEarned, `Theory Quiz: ${result.topic || 'General'}`);

    // Achievements
    checkAchievement('quiz_starter');
    if (result.scorePercent === 100) checkAchievement('perfect_quiz');
    if (result.durationSeconds < 180) checkAchievement('speed_learner');
    if (result.combo >= 5) checkAchievement('combo_x5');

    // Streak
    checkAndUpdateStreak();

    return xpEarned;
  }

  function getQuizHistory(limit = 20) {
    return _get('quiz_history', []).slice(0, limit);
  }

  // ─── Practice Sessions ────────────────────────────
  function savePracticeSession(session) {
    const sessions = _get('practice_sessions', []);
    sessions.unshift({
      ...session,
      id: Date.now(),
      timestamp: Date.now()
    });
    _set('practice_sessions', sessions.slice(0, 200));

    // Update stats
    incrementStat('totalPracticeMinutes', session.durationMinutes || 0);

    // Update progress
    const p = getProgress();
    p.practiceMode.totalMinutes = (p.practiceMode.totalMinutes || 0) + (session.durationMinutes || 0);
    p.practiceMode.sessionsCount = (p.practiceMode.sessionsCount || 0) + 1;
    updatePracticeMode(p.practiceMode);

    // XP: 1 XP per minute
    const xpEarned = session.durationMinutes || 0;
    addXP(xpEarned, `Practice session: ${session.instrument || 'General'}`);

    // Achievements
    if (p.practiceMode.totalMinutes >= 60) checkAchievement('practice_1h');
    checkAndUpdateStreak();

    return xpEarned;
  }

  function getPracticeSessions(limit = 20) {
    return _get('practice_sessions', []).slice(0, limit);
  }

  // ─── Ear Training ────────────────────────────────
  function saveEarResult(result) {
    const history = _get('ear_history', []);
    history.unshift({
      ...result,
      id: Date.now(),
      timestamp: Date.now()
    });
    _set('ear_history', history.slice(0, 200));

    incrementStat('earTrainingSessions');

    const p = getProgress();
    p.earTraining.totalAttempts = (p.earTraining.totalAttempts || 0) + (result.total || 0);
    p.earTraining.exercisesCompleted = (p.earTraining.exercisesCompleted || 0) + (result.correct || 0);
    p.earTraining.correctRate = p.earTraining.totalAttempts > 0
      ? Math.round((p.earTraining.exercisesCompleted / p.earTraining.totalAttempts) * 100) : 0;
    updateEarTraining(p.earTraining);

    const xpEarned = Math.round((result.correct / (result.total || 1)) * 50);
    addXP(xpEarned, `Ear Training: ${result.type || 'Exercise'}`);

    checkAchievement('tuned_in');
    if (p.earTraining.exercisesCompleted >= 50) checkAchievement('ear_master');
    checkAndUpdateStreak();

    return xpEarned;
  }

  function getEarHistory(limit = 20) {
    return _get('ear_history', []).slice(0, limit);
  }

  // ─── Lesson completion ───────────────────────────
  function completeLesson(lessonId, moduleName) {
    const p = getProgress();
    if (!p.learningPath.completedLessons.includes(lessonId)) {
      p.learningPath.completedLessons.push(lessonId);
      const totalLessons = 200;
      p.learningPath.percent = Math.round((p.learningPath.completedLessons.length / totalLessons) * 100);
      updateLearningPath(p.learningPath);
      incrementStat('lessonsCompleted');

      const xpEarned = 25;
      addXP(xpEarned, `Completed lesson: ${moduleName || 'Lesson'}`);
      checkAchievement('first_note');
      checkAndUpdateStreak();

      if (p.learningPath.completedLessons.length >= 10) checkAchievement('module_1');

      return xpEarned;
    }
    return 0;
  }

  // ─── Daily Challenge ─────────────────────────────
  function completeDailyChallenge() {
    const dc = _get('daily_challenge', { completedDates: [], currentStreak: 0 });
    const today = new Date().toDateString();
    if (!dc.completedDates.includes(today)) {
      dc.completedDates.push(today);
      dc.currentStreak = (dc.currentStreak || 0) + 1;
      _set('daily_challenge', dc);
      addXP(150, 'Daily challenge completed!');
      if (dc.currentStreak >= 3) checkAchievement('daily_3');
    }
  }

  function isDailyChallengeCompleted() {
    const dc = _get('daily_challenge', { completedDates: [] });
    return dc.completedDates.includes(new Date().toDateString());
  }

  // ─── Utility ─────────────────────────────────────
  function formatRelativeTime(timestamp) {
    const diff = Date.now() - timestamp;
    if (diff < 60000)   return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  function formatMinutes(minutes) {
    if (minutes < 60) return `${minutes} min`;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  }

  // ─── Full snapshot ────────────────────────────────
  function getSnapshot() {
    const xp = getXP();
    const levelInfo = getLevelProgress(xp);
    const stats = getStats();
    const streak = getStreak();
    const progress = getProgress();

    return {
      xp, levelInfo, stats, streak, progress,
      achievements: getAllAchievements(),
      activity: getActivity(10),
      quizHistory: getQuizHistory(5),
      practiceSessions: getPracticeSessions(5)
    };
  }

  // ─── Reset (for dev/testing) ──────────────────────
  function reset() {
    Object.keys(localStorage)
      .filter(k => k.startsWith(PREFIX))
      .forEach(k => localStorage.removeItem(k));
    init();
  }

  // ─── Public API ───────────────────────────────────
  return {
    init,
    getXP, getLevel, getLevelProgress, addXP,
    getStreak, checkAndUpdateStreak,
    getProgress, updateLearningPath, updateTheoryQuiz, updateEarTraining, updatePracticeMode,
    getStats, incrementStat,
    getActivity, addActivity,
    checkAchievement, getUnlockedAchievements, getAllAchievements,
    saveQuizResult, getQuizHistory,
    savePracticeSession, getPracticeSessions,
    saveEarResult, getEarHistory,
    completeLesson,
    completeDailyChallenge, isDailyChallengeCompleted,
    getSnapshot,
    formatMinutes,
    LEVEL_THRESHOLDS, LEVEL_TITLES, ACHIEVEMENT_DEFS,
    reset
  };

})();

// Auto-initialise
HarmoniaDB.init();
