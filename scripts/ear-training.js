/**
 * ear-training.js — Full Ear Training module for Harmonia
 * Features:
 *  - 6 exercise types: Intervals, Chords, Scales, Melody, Rhythm, Pitch Memory
 *  - Web Audio API for real sound synthesis (no external files needed)
 *  - 20-second countdown timer per question
 *  - Combo system (consecutive correct answers)
 *  - Unlimited replays (3 visual dots, then unlimited grey)
 *  - Results screen with animated SVG score ring
 *  - XP toast + level-up overlay
 *  - Confetti on great scores
 *  - HarmoniaDB integration (XP, history, achievements, streaks)
 *  - Keyboard shortcuts: 1–4 answer, Space replay, Enter next, Esc close
 *  - Daily Challenge mode (5 intervals, +150 XP bonus)
 *  - Blitz Mix (2 questions × 6 types = 12 questions)
 *  - Per-type session counters and progress bars
 *  - Filter buttons (all / beginner / intermediate / advanced)
 */

const EarTraining = (() => {

  // ─── Audio Context (lazy init) ────────────────────────────
  let _audioCtx = null;
  function getAudio() {
    if (!_audioCtx) _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return _audioCtx;
  }

  // ─── Note frequencies (A4 = 440 Hz) ────────────────────────
  const NOTE_FREQ = {
    'C3':130.81,'C#3':138.59,'D3':146.83,'D#3':155.56,'E3':164.81,'F3':174.61,
    'F#3':185.00,'G3':196.00,'G#3':207.65,'A3':220.00,'A#3':233.08,'B3':246.94,
    'C4':261.63,'C#4':277.18,'D4':293.66,'D#4':311.13,'E4':329.63,'F4':349.23,
    'F#4':369.99,'G4':392.00,'G#4':415.30,'A4':440.00,'A#4':466.16,'B4':493.88,
    'C5':523.25,'C#5':554.37,'D5':587.33,'D#5':622.25,'E5':659.25,'F5':698.46,
    'F#5':739.99,'G5':783.99,'G#5':830.61,'A5':880.00,'A#5':932.33,'B5':987.77,
    'C6':1046.50
  };

  const CHROMATIC = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];

  // Get frequency of note (name + octave, e.g. "C4")
  function freq(note) { return NOTE_FREQ[note] || 440; }

  // Semitones above root
  function noteFromRoot(root, semitones) {
    const notes = Object.keys(NOTE_FREQ);
    const rootIdx = notes.indexOf(root);
    return notes[rootIdx + semitones] || root;
  }

  // ─── Synth helpers ────────────────────────────────────────
  function playTone(frequency, startTime, duration, volume = 0.18, type = 'triangle') {
    const ctx = getAudio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  // Play a single note
  function playNote(note, startOffset = 0, duration = 1.2, volume = 0.18) {
    playTone(freq(note), getAudio().currentTime + startOffset, duration, volume);
  }

  // Play two notes melodically (ascending)
  function playMelodic(note1, note2) {
    playNote(note1, 0, 1.0);
    playNote(note2, 0.8, 1.0);
  }

  // Play two notes harmonically (simultaneously)
  function playHarmonic(note1, note2) {
    playNote(note1, 0, 1.4, 0.12);
    playNote(note2, 0, 1.4, 0.12);
  }

  // Play a chord (array of notes, all at once)
  function playChord(notes) {
    const vol = 0.1;
    notes.forEach(n => playNote(n, 0, 1.6, vol));
  }

  // Play a scale (array of notes ascending)
  function playScale(notes) {
    notes.forEach((n, i) => playNote(n, i * 0.22, 0.6, 0.16));
  }

  // Play a melody (array of [note, duration] pairs)
  function playMelody(sequence) {
    let t = 0;
    sequence.forEach(([n, dur]) => {
      playNote(n, t, dur * 0.9, 0.16);
      t += dur;
    });
  }

  // Play a rhythm pattern (clicks)
  function playRhythm(pattern, bpm = 100) {
    const ctx = getAudio();
    const beatLen = 60 / bpm;
    pattern.forEach((hit, i) => {
      if (hit) {
        const osc = ctx.createOscillator();
        const g   = ctx.createGain();
        osc.connect(g); g.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(hit === 2 ? 800 : 400, ctx.currentTime + i * beatLen);
        g.gain.setValueAtTime(0.3, ctx.currentTime + i * beatLen);
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * beatLen + 0.08);
        osc.start(ctx.currentTime + i * beatLen);
        osc.stop(ctx.currentTime + i * beatLen + 0.1);
      }
    });
  }

  // ─── Question Banks ───────────────────────────────────────

  const INTERVAL_DATA = [
    { name: 'Unison',       semitones: 0,  abbr: 'P1',  description: 'Same note played twice. The starting point of all intervals.' },
    { name: 'Minor 2nd',    semitones: 1,  abbr: 'm2',  description: 'Very dissonant — think the Jaws theme or "Joy to the World" descending.' },
    { name: 'Major 2nd',    semitones: 2,  abbr: 'M2',  description: 'A whole step. Sounds like the first two notes of "Happy Birthday".' },
    { name: 'Minor 3rd',    semitones: 3,  abbr: 'm3',  description: 'Slightly sad — the first two notes of "Greensleeves".' },
    { name: 'Major 3rd',    semitones: 4,  abbr: 'M3',  description: 'Bright and happy — think "When the Saints Go Marching In".' },
    { name: 'Perfect 4th',  semitones: 5,  abbr: 'P4',  description: 'Strong and stable — the first two notes of "Here Comes the Bride".' },
    { name: 'Tritone',      semitones: 6,  abbr: 'TT',  description: 'Very tense — the "devil in music". Think Simpsons theme.' },
    { name: 'Perfect 5th',  semitones: 7,  abbr: 'P5',  description: 'Open and powerful — the first two notes of "Twinkle Twinkle".' },
    { name: 'Minor 6th',    semitones: 8,  abbr: 'm6',  description: 'Slightly melancholic — "The Entertainer" second phrase.' },
    { name: 'Major 6th',    semitones: 9,  abbr: 'M6',  description: 'Warm and uplifting — "My Bonnie Lies Over the Ocean".' },
    { name: 'Minor 7th',    semitones: 10, abbr: 'm7',  description: 'Bluesy tension — the first two notes of "Somewhere" (West Side Story).' },
    { name: 'Major 7th',    semitones: 11, abbr: 'M7',  description: 'Almost resolving — very tense. "Take On Me" intro.' },
    { name: 'Octave',       semitones: 12, abbr: 'P8',  description: 'Same note, double the frequency. "Somewhere Over the Rainbow" start.' },
  ];

  const CHORD_DATA = [
    { name: 'Major',       intervals: [0,4,7],     description: 'Bright and happy — the most common chord in western music.' },
    { name: 'Minor',       intervals: [0,3,7],     description: 'Darker and more melancholic than major.' },
    { name: 'Diminished',  intervals: [0,3,6],     description: 'Very tense and unstable — often used for dramatic effect.' },
    { name: 'Augmented',   intervals: [0,4,8],     description: 'Eerie and unsettled — symmetrical structure.' },
    { name: 'Sus2',        intervals: [0,2,7],     description: 'Open and airy — the 3rd is replaced by a 2nd.' },
    { name: 'Sus4',        intervals: [0,5,7],     description: 'Slightly tense — resolves naturally to major.' },
    { name: 'Dominant 7th',intervals: [0,4,7,10],  description: 'Bluesy tension demanding resolution — the V7 chord.' },
    { name: 'Major 7th',   intervals: [0,4,7,11],  description: 'Lush and jazzy — common in smooth jazz and pop.' },
    { name: 'Minor 7th',   intervals: [0,3,7,10],  description: 'Soft and melancholic — very common in jazz and R&B.' },
  ];

  const SCALE_DATA = [
    { name: 'Major',           intervals: [0,2,4,5,7,9,11,12], description: 'Bright, happy, and the most commonly used scale in western music.' },
    { name: 'Natural Minor',   intervals: [0,2,3,5,7,8,10,12], description: 'Darker and more melancholic than major.' },
    { name: 'Harmonic Minor',  intervals: [0,2,3,5,7,8,11,12], description: 'Minor scale with a raised 7th — creates an exotic, tense sound.' },
    { name: 'Major Pentatonic',intervals: [0,2,4,7,9,12],       description: 'Five-note major scale — very singable and used in folk and pop.' },
    { name: 'Minor Pentatonic',intervals: [0,3,5,7,10,12],      description: 'The blues/rock staple — used in virtually every guitar solo.' },
    { name: 'Blues Scale',     intervals: [0,3,5,6,7,10,12],    description: 'Minor pentatonic + tritone "blue note" = pure blues sound.' },
    { name: 'Dorian',          intervals: [0,2,3,5,7,9,10,12],  description: 'Minor-ish mode with a raised 6th — think "Scarborough Fair".' },
    { name: 'Mixolydian',      intervals: [0,2,4,5,7,9,10,12],  description: 'Major scale with a flatted 7th — common in rock and folk.' },
    { name: 'Phrygian',        intervals: [0,1,3,5,7,8,10,12],  description: 'Very dark, Spanish/flamenco feel with characteristic b2.' },
    { name: 'Lydian',          intervals: [0,2,4,6,7,9,11,12],  description: 'Bright and dreamy — major with a raised 4th. Film music staple.' },
  ];

  const RHYTHM_DATA = [
    { name: '4/4 — Basic',   pattern: [2,1,1,1,2,1,1,1], bpm: 90, description: '4/4 is the most common time signature — four beats per bar.' },
    { name: '3/4 — Waltz',   pattern: [2,1,1,2,1,1],      bpm: 90, description: '3/4 gives a waltz feel — one strong beat, two weaker.' },
    { name: '6/8 — Compound',pattern: [2,1,1,1,1,1,2,1,1,1,1,1], bpm:90, description: '6/8 has two strong beats each with three sub-beats — compound duple.' },
    { name: '2/4 — March',   pattern: [2,1,2,1],           bpm: 110, description: '2/4 march time — two strong beats per bar.' },
    { name: '5/4 — Odd',     pattern: [2,1,1,1,1,2,1,1,1,1], bpm:80, description: 'Five beats per bar — an "odd" meter. Think "Take Five" by Dave Brubeck.' },
    { name: '7/8 — Complex', pattern: [2,1,1,2,1,1,1,2,1,1,2,1,1,1], bpm:95, description: 'Seven eighth-notes per bar — feel the 3+2+2 or 2+2+3 groupings.' },
  ];

  // Short memorable melodies (note, beat-duration pairs)
  const MELODY_DATA = [
    {
      name: 'C – E – G – C',
      notes: [['C4',0.4],['E4',0.4],['G4',0.4],['C5',0.6]],
      options: ['C – E – G – C','C – D – E – F','C – F – G – C','D – F – A – D'],
      description: 'A rising C major arpeggio — the tonic triad ascending.'
    },
    {
      name: 'C – B – A – G',
      notes: [['C5',0.4],['B4',0.4],['A4',0.4],['G4',0.6]],
      options: ['C – B – A – G','C – B – G – A','D – C – B – A','C – A – G – E'],
      description: 'A descending stepwise motion — very natural and common.'
    },
    {
      name: 'E – F – G – A',
      notes: [['E4',0.4],['F4',0.4],['G4',0.4],['A4',0.6]],
      options: ['E – F – G – A','E – G – A – B','D – E – F – G','E – F – A – G'],
      description: 'Ascending steps from the 3rd of C major.'
    },
    {
      name: 'G – E – C – D',
      notes: [['G4',0.4],['E4',0.4],['C4',0.4],['D4',0.6]],
      options: ['G – E – C – D','G – F – E – D','G – A – C – D','A – E – C – D'],
      description: 'A skipping melody — combine leaps and steps.'
    },
    {
      name: 'C – D – E – C',
      notes: [['C4',0.4],['D4',0.4],['E4',0.4],['C4',0.6]],
      options: ['C – D – E – C','C – E – D – C','C – D – F – C','D – E – F – D'],
      description: 'A short motif — stepwise up then leap back to root.'
    },
    {
      name: 'A – G – F – E',
      notes: [['A4',0.4],['G4',0.4],['F4',0.4],['E4',0.6]],
      options: ['A – G – F – E','A – B – C – D','G – F – E – D','A – G – E – F'],
      description: 'Descending through the upper part of C major.'
    },
    {
      name: 'C – E – A – G',
      notes: [['C4',0.35],['E4',0.35],['A4',0.35],['G4',0.7]],
      options: ['C – E – A – G','C – F – A – G','D – E – A – G','C – E – G – A'],
      description: 'A leaping pattern — outlines the vi chord.'
    },
    {
      name: 'D – F – A – D',
      notes: [['D4',0.4],['F4',0.4],['A4',0.4],['D5',0.6]],
      options: ['D – F – A – D','D – E – F – G','C – E – G – C','D – G – A – D'],
      description: 'D minor arpeggio — the 6th degree in C major.'
    },
  ];

  // Pitch memory — just single notes
  const PITCH_NOTES = ['C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4','A4','A#4','B4','C5'];

  // ─── State ────────────────────────────────────────────────
  let state = {
    mode: null,        // 'intervals' | 'chords' | 'scales' | 'melody' | 'rhythm' | 'pitch' | 'blitz' | 'daily'
    questions: [],
    currentIdx: 0,
    score: { correct: 0, total: 0, details: [] },
    combo: 0,
    maxCombo: 0,
    timerInterval: null,
    timerSecs: 20,
    replaysLeft: 3,
    answered: false,
    sessionCounts: {},  // type → count
    blitzStats: { runs: 0, best: 0, xp: 0 },
    startTime: 0,
  };

  // ─── Local persistence for per-type session counts ─────────
  function loadSessionCounts() {
    try { return JSON.parse(localStorage.getItem('harmonia_et_sessions') || '{}'); }
    catch { return {}; }
  }
  function saveSessionCounts(obj) {
    try { localStorage.setItem('harmonia_et_sessions', JSON.stringify(obj)); } catch {}
  }
  function loadBlitzStats() {
    try { return JSON.parse(localStorage.getItem('harmonia_et_blitz') || '{"runs":0,"best":0,"xp":0}'); }
    catch { return { runs: 0, best: 0, xp: 0 }; }
  }
  function saveBlitzStats(obj) {
    try { localStorage.setItem('harmonia_et_blitz', JSON.stringify(obj)); } catch {}
  }

  // ─── Question generation ──────────────────────────────────
  function generateIntervalQuestions(count = 10) {
    const qs = [];
    const rootNotes = ['C4','D4','E4','F4','G4','A4'];
    for (let i = 0; i < count; i++) {
      const root = rootNotes[Math.floor(Math.random() * rootNotes.length)];
      const interval = INTERVAL_DATA[Math.floor(Math.random() * INTERVAL_DATA.length)];
      const upper = noteFromRoot(root, interval.semitones);
      const ascending = Math.random() > 0.4;

      // Generate 4 options (correct + 3 wrong)
      const wrongPool = INTERVAL_DATA.filter(x => x.name !== interval.name);
      shuffle(wrongPool);
      const options = shuffle([interval, ...wrongPool.slice(0, 3)]).map(o => o.name);

      qs.push({
        type: 'intervals',
        prompt: `What ${ascending ? 'ascending' : 'harmonic'} interval is this?`,
        answer: interval.name,
        options,
        explanation: `✅ That's a <strong>${interval.name}</strong> (${interval.abbr}). ${interval.description}`,
        play: () => ascending ? playMelodic(root, upper) : playHarmonic(root, upper),
      });
    }
    return qs;
  }

  function generateChordQuestions(count = 10) {
    const qs = [];
    const roots = ['C4','D4','E4','F4','G4','A4'];
    for (let i = 0; i < count; i++) {
      const root = roots[Math.floor(Math.random() * roots.length)];
      const chord = CHORD_DATA[Math.floor(Math.random() * CHORD_DATA.length)];
      const noteList = chord.intervals.map(s => noteFromRoot(root, s));

      const wrongPool = CHORD_DATA.filter(x => x.name !== chord.name);
      shuffle(wrongPool);
      const options = shuffle([chord, ...wrongPool.slice(0, 3)]).map(o => o.name);

      qs.push({
        type: 'chords',
        prompt: `What type of chord is this?`,
        answer: chord.name,
        options,
        explanation: `✅ That's a <strong>${chord.name}</strong> chord. ${chord.description}`,
        play: () => playChord(noteList),
      });
    }
    return qs;
  }

  function generateScaleQuestions(count = 10) {
    const qs = [];
    const roots = ['C4','D4','G4','A4','E4'];
    for (let i = 0; i < count; i++) {
      const root = roots[Math.floor(Math.random() * roots.length)];
      const scale = SCALE_DATA[Math.floor(Math.random() * SCALE_DATA.length)];
      const noteList = scale.intervals.map(s => noteFromRoot(root, s));

      const wrongPool = SCALE_DATA.filter(x => x.name !== scale.name);
      shuffle(wrongPool);
      const options = shuffle([scale, ...wrongPool.slice(0, 3)]).map(o => o.name);

      qs.push({
        type: 'scales',
        prompt: `What scale is being played?`,
        answer: scale.name,
        options,
        explanation: `✅ That's the <strong>${scale.name}</strong> scale. ${scale.description}`,
        play: () => playScale(noteList),
      });
    }
    return qs;
  }

  function generateMelodyQuestions(count = 10) {
    const pool = [...MELODY_DATA];
    shuffle(pool);
    return pool.slice(0, Math.min(count, pool.length)).map(m => ({
      type: 'melody',
      prompt: 'Which sequence of notes did you hear?',
      answer: m.name,
      options: shuffle([...m.options]),
      explanation: `✅ The melody was <strong>${m.name}</strong>. ${m.description}`,
      play: () => playMelody(m.notes),
    }));
  }

  function generateRhythmQuestions(count = 6) {
    const pool = [...RHYTHM_DATA];
    shuffle(pool);
    return pool.slice(0, Math.min(count, pool.length)).map(r => {
      const wrongPool = RHYTHM_DATA.filter(x => x.name !== r.name);
      shuffle(wrongPool);
      const options = shuffle([r, ...wrongPool.slice(0, 3)]).map(o => o.name);
      return {
        type: 'rhythm',
        prompt: 'What time signature / meter is this?',
        answer: r.name,
        options,
        explanation: `✅ That was <strong>${r.name}</strong>. ${r.description}`,
        play: () => playRhythm(r.pattern, r.bpm),
      };
    });
  }

  function generatePitchQuestions(count = 10) {
    const qs = [];
    for (let i = 0; i < count; i++) {
      const noteKey = PITCH_NOTES[Math.floor(Math.random() * PITCH_NOTES.length)];
      const noteName = noteKey.replace(/\d/, '');

      // 4 options — correct + 3 others
      const otherNotes = CHROMATIC.filter(n => n !== noteName);
      shuffle(otherNotes);
      const options = shuffle([noteName, ...otherNotes.slice(0, 3)]);

      qs.push({
        type: 'pitch',
        prompt: 'What note is being played?',
        answer: noteName,
        options,
        explanation: `✅ That was the note <strong>${noteName}</strong>. Keep training to develop a stronger sense of relative pitch!`,
        play: () => playNote(noteKey, 0, 1.5, 0.2, 'sine'),
      });
    }
    return qs;
  }

  function generateBlitzQuestions() {
    return shuffle([
      ...generateIntervalQuestions(2),
      ...generateChordQuestions(2),
      ...generateScaleQuestions(2),
      ...generateMelodyQuestions(2),
      ...generateRhythmQuestions(2),
      ...generatePitchQuestions(2),
    ]);
  }

  function generateDailyChallengeQuestions() {
    return generateIntervalQuestions(5);
  }

  // ─── Shuffle utility ─────────────────────────────────────
  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  // ─── Exercise config ──────────────────────────────────────
  const EXERCISE_CONFIG = {
    intervals: { icon: '🎵', title: 'Interval Recognition', sub: 'Listen and identify the interval', xpAvailable: 50,  generate: generateIntervalQuestions },
    chords:    { icon: '🎹', title: 'Chord Identification',  sub: 'Listen and name the chord',     xpAvailable: 80,  generate: generateChordQuestions   },
    scales:    { icon: '🎼', title: 'Scale Recognition',     sub: 'Identify the scale being played', xpAvailable: 70, generate: generateScaleQuestions   },
    melody:    { icon: '🎶', title: 'Melody Dictation',      sub: 'Identify the melodic sequence',  xpAvailable: 120, generate: generateMelodyQuestions  },
    rhythm:    { icon: '🥁', title: 'Rhythm Recognition',    sub: 'Identify the time signature',    xpAvailable: 60,  generate: generateRhythmQuestions  },
    pitch:     { icon: '🎯', title: 'Pitch Memory',          sub: 'Name the note you hear',         xpAvailable: 100, generate: generatePitchQuestions   },
    blitz:     { icon: '⚡', title: 'Ear Blitz Mix',         sub: 'Mixed ear training challenge',   xpAvailable: 200, generate: generateBlitzQuestions   },
    daily:     { icon: '⚡', title: 'Daily Ear Challenge',   sub: 'Identify 5 intervals — +150 XP', xpAvailable: 150, generate: generateDailyChallengeQuestions },
  };

  // ─── Open exercise ────────────────────────────────────────
  function openExercise(type) {
    const config = EXERCISE_CONFIG[type];
    if (!config) return;

    state.mode      = type;
    state.questions = config.generate(type === 'blitz' ? 12 : type === 'daily' ? 5 : 10);
    state.currentIdx = 0;
    state.score     = { correct: 0, total: 0, details: [] };
    state.combo     = 0;
    state.maxCombo  = 0;
    state.answered  = false;
    state.startTime = Date.now();

    // Update modal header
    document.getElementById('modalIcon').textContent   = config.icon;
    document.getElementById('modalTitle').textContent  = config.title;
    document.getElementById('modalSub').textContent    = config.sub;

    // Reset score display
    document.getElementById('modalCorrect').textContent = '0';
    document.getElementById('modalTotal').textContent   = state.questions.length;
    document.getElementById('comboDisplay').style.display = 'none';
    document.getElementById('comboVal').textContent = '0';

    // Show question screen, hide results
    document.getElementById('questionScreen').style.display = '';
    document.getElementById('resultsScreen').style.display  = 'none';

    openModal();
    renderQuestion();
  }

  function startBlitz()          { openExercise('blitz'); }
  function startDailyChallenge() { openExercise('daily'); }

  // ─── Modal open/close ─────────────────────────────────────
  function openModal() {
    document.getElementById('exerciseModal').classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    stopTimer();
    document.getElementById('exerciseModal').classList.remove('open');
    document.body.style.overflow = '';
  }

  // ─── Render question ──────────────────────────────────────
  function renderQuestion() {
    const q = state.questions[state.currentIdx];
    if (!q) { showResults(); return; }

    state.answered  = false;
    state.replaysLeft = 3;

    const total = state.questions.length;
    document.getElementById('questionNumber').textContent =
      `Question ${state.currentIdx + 1} of ${total}`;
    document.getElementById('modalTotal').textContent   = total;
    document.getElementById('questionPrompt').textContent = q.prompt;

    // Reset play zone
    document.getElementById('playLabel').textContent = 'Click to play';
    document.getElementById('playBtn').classList.remove('playing');
    updateReplayDots();

    // Build options
    const grid = document.getElementById('optionsGrid');
    grid.innerHTML = '';
    q.options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.className = 'et-option';
      btn.innerHTML = `<span class="et-opt-key">${i+1}</span>${escapeHTML(opt)}`;
      btn.addEventListener('click', () => selectAnswer(opt, btn));
      grid.appendChild(btn);
    });

    // Hide explanation
    const expBlock = document.getElementById('explanationBlock');
    expBlock.style.display = 'none';

    // Start timer
    startTimer();

    // Auto-play on question render
    setTimeout(() => playCurrentSound(), 400);
  }

  // ─── Play current sound ───────────────────────────────────
  function playCurrentSound() {
    const q = state.questions[state.currentIdx];
    if (!q || state.answered) return;

    const btn = document.getElementById('playBtn');
    btn.classList.add('playing');
    document.getElementById('playLabel').textContent = 'Playing…';

    if (state.replaysLeft > 0) {
      state.replaysLeft--;
      updateReplayDots();
    }

    q.play();

    setTimeout(() => {
      btn.classList.remove('playing');
      document.getElementById('playLabel').textContent =
        state.replaysLeft > 0 ? 'Click to replay' : 'Replay (no limit)';
    }, 2200);
  }

  function updateReplayDots() {
    const dots = document.querySelectorAll('.et-rd');
    dots.forEach((d, i) => {
      d.classList.toggle('active', i < state.replaysLeft);
    });
    document.getElementById('playHint').textContent =
      state.replaysLeft > 0
        ? `${state.replaysLeft} replay${state.replaysLeft !== 1 ? 's' : ''} remaining`
        : 'You can still replay — no limit';
  }

  // ─── Timer ────────────────────────────────────────────────
  function startTimer() {
    stopTimer();
    state.timerSecs = 20;
    const bar = document.getElementById('timerBar');
    bar.style.width = '100%';
    bar.classList.remove('warning');

    state.timerInterval = setInterval(() => {
      state.timerSecs--;
      const pct = Math.max(0, (state.timerSecs / 20) * 100);
      bar.style.width = pct + '%';
      if (state.timerSecs <= 6) bar.classList.add('warning');
      if (state.timerSecs <= 0) {
        stopTimer();
        if (!state.answered) timeOut();
      }
    }, 1000);
  }

  function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }

  function timeOut() {
    const q = state.questions[state.currentIdx];
    state.combo = 0;
    updateComboDisplay();
    state.answered = true;
    state.score.total++;
    state.score.details.push({ question: q.prompt.slice(0, 40), correct: false, yourAnswer: '—', correctAnswer: q.answer });
    document.getElementById('modalCorrect').textContent = state.score.correct;

    // Mark correct option
    document.querySelectorAll('.et-option').forEach(btn => {
      btn.disabled = true;
      if (btn.textContent.includes(q.answer)) btn.classList.add('correct');
    });

    showExplanation(false, q);
  }

  // ─── Select answer ────────────────────────────────────────
  function selectAnswer(choice, btn) {
    if (state.answered) return;
    state.answered = true;
    stopTimer();

    const q = state.questions[state.currentIdx];
    const isCorrect = choice === q.answer;

    // Disable all options
    document.querySelectorAll('.et-option').forEach(b => {
      b.disabled = true;
      if (b.textContent.includes(q.answer)) b.classList.add('correct');
    });

    if (isCorrect) {
      btn.classList.add('correct');
      state.score.correct++;
      state.combo++;
      state.maxCombo = Math.max(state.maxCombo, state.combo);
    } else {
      btn.classList.add('wrong');
      state.combo = 0;
    }

    state.score.total++;
    state.score.details.push({
      question: q.prompt.slice(0, 40),
      correct: isCorrect,
      yourAnswer: choice,
      correctAnswer: q.answer,
    });

    document.getElementById('modalCorrect').textContent = state.score.correct;
    updateComboDisplay();
    showExplanation(isCorrect, q);
  }

  function updateComboDisplay() {
    const cd = document.getElementById('comboDisplay');
    const cv = document.getElementById('comboVal');
    cv.textContent = state.combo;
    if (state.combo >= 2) {
      cd.style.display = 'flex';
    } else {
      cd.style.display = 'none';
    }
  }

  function showExplanation(correct, q) {
    const block = document.getElementById('explanationBlock');
    document.getElementById('explanationIcon').textContent = correct ? '✅' : '❌';
    document.getElementById('explanationText').innerHTML = correct
      ? q.explanation
      : `❌ The correct answer was <strong>${q.answer}</strong>. ${q.explanation.replace('✅ ','').replace(/^That's a?n? /, 'It was a ')}`;
    block.style.display = 'flex';
  }

  function nextQuestion() {
    state.currentIdx++;
    if (state.currentIdx >= state.questions.length) {
      showResults();
    } else {
      renderQuestion();
    }
  }

  function retryExercise() {
    openExercise(state.mode);
  }

  // ─── Results ──────────────────────────────────────────────
  function showResults() {
    stopTimer();

    document.getElementById('questionScreen').style.display = 'none';
    document.getElementById('resultsScreen').style.display  = '';

    const { correct, total } = state.score;
    const pct   = total > 0 ? Math.round((correct / total) * 100) : 0;
    const config = EXERCISE_CONFIG[state.mode] || EXERCISE_CONFIG.intervals;
    const xpEarned = Math.round((correct / Math.max(total,1)) * config.xpAvailable);

    // Animate score ring
    document.getElementById('resultsPct').textContent = pct + '%';
    const circumference = 2 * Math.PI * 50; // r=50
    const offset = circumference - (pct / 100) * circumference;
    setTimeout(() => {
      const ring = document.getElementById('scoreRingFill');
      ring.style.strokeDashoffset = offset;
    }, 200);

    // Title + desc
    document.getElementById('resultsTitle').textContent =
      pct === 100 ? '🎉 Perfect Score!' :
      pct >= 80   ? '🔥 Excellent!' :
      pct >= 60   ? '👍 Good Work!' :
      pct >= 40   ? '📚 Keep Practicing' :
                    '💪 Don\'t Give Up!';

    document.getElementById('resultsCorrect').textContent = correct;
    document.getElementById('resultsTotal').textContent   = total;
    document.getElementById('resultsXP').textContent      = xpEarned;

    // Breakdown
    const bk = document.getElementById('resultsBreakdown');
    const durationSecs = Math.round((Date.now() - state.startTime) / 1000);
    bk.innerHTML = `
      <div class="et-rb-item"><span>Correct answers</span><strong>${correct} / ${total}</strong></div>
      <div class="et-rb-item"><span>Score</span><strong>${pct}%</strong></div>
      <div class="et-rb-item"><span>Best combo</span><strong>${state.maxCombo}x</strong></div>
      <div class="et-rb-item"><span>Time taken</span><strong>${formatTime(durationSecs)}</strong></div>
      <div class="et-rb-item"><span>XP earned</span><strong style="color:#fbbf24">+${xpEarned} XP</strong></div>
    `;

    // Save to HarmoniaDB
    const unlockedBefore = HarmoniaDB.getUnlockedAchievements();
    const earResult = {
      type: config.title,
      correct, total,
      scorePercent: pct,
      durationSeconds: durationSecs,
    };
    const xpResult = HarmoniaDB.saveEarResult(earResult);

    // Daily challenge bonus
    if (state.mode === 'daily' && pct >= 100) {
      HarmoniaDB.completeDailyChallenge();
      updateDailyChallengeBadge();
    }

    // Blitz stats
    if (state.mode === 'blitz') {
      const bs = loadBlitzStats();
      bs.runs++;
      bs.xp += xpEarned;
      if (pct > bs.best) bs.best = pct;
      saveBlitzStats(bs);
      updateBlitzStats(bs);
    }

    // Update session counts
    const counts = loadSessionCounts();
    counts[state.mode] = (counts[state.mode] || 0) + 1;
    saveSessionCounts(counts);
    updateSessionCountUI(state.mode, counts[state.mode]);

    // Show achievements
    const unlockedAfter = HarmoniaDB.getUnlockedAchievements();
    const newAch = unlockedAfter.filter(id => !unlockedBefore.includes(id));
    if (newAch.length) {
      const achContainer = document.getElementById('achievementsList');
      achContainer.innerHTML = '';
      newAch.forEach(id => {
        const def = HarmoniaDB.ACHIEVEMENT_DEFS.find(a => a.id === id);
        if (def) {
          const row = document.createElement('div');
          row.className = 'et-ach-row';
          row.innerHTML = `<span>${def.icon}</span><span><strong>${def.title}</strong> — ${def.desc} (+${def.xp} XP)</span>`;
          achContainer.appendChild(row);
        }
      });
      document.getElementById('resultsAchievements').style.display = 'flex';
    } else {
      document.getElementById('resultsAchievements').style.display = 'none';
    }

    // XP toast
    showXPToast(xpEarned);

    // Level up check
    const snap = HarmoniaDB.getSnapshot();
    checkLevelUp(snap);

    // Update hero XP
    updateHeroXP(snap);

    // Update history
    addToHistory(config.icon, config.title, correct, total, pct);

    // Confetti on good scores
    if (pct >= 80) spawnConfetti();
  }

  // ─── History panel ────────────────────────────────────────
  function addToHistory(icon, title, correct, total, pct) {
    const list  = document.getElementById('historyList');
    const empty = list.querySelector('.et-history-empty');
    if (empty) empty.remove();

    const scoreClass = pct >= 80 ? 'good' : pct >= 50 ? 'medium' : 'bad';
    const item = document.createElement('div');
    item.className = 'et-history-item';
    item.innerHTML = `
      <div class="et-hi-icon">${icon}</div>
      <div class="et-hi-info">
        <strong>${escapeHTML(title)}</strong>
        <span>Just now</span>
      </div>
      <span class="et-hi-score ${scoreClass}">${correct}/${total} · ${pct}%</span>
    `;
    list.insertBefore(item, list.firstChild);

    // Cap at 8 items
    while (list.children.length > 8) list.removeChild(list.lastChild);
  }

  // ─── XP Toast ─────────────────────────────────────────────
  function showXPToast(amount) {
    if (amount <= 0) return;
    const toast = document.getElementById('xpToast');
    document.getElementById('xpToastText').textContent = `+${amount} XP earned!`;
    toast.style.display = 'flex';
    clearTimeout(EarTraining._toastTimer);
    EarTraining._toastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
  }

  // ─── Level-up overlay ─────────────────────────────────────
  let _lastLevel = 1;
  function checkLevelUp(snap) {
    const newLevel = snap.levelInfo.level;
    if (newLevel > _lastLevel) {
      _lastLevel = newLevel;
      document.getElementById('levelUpText').textContent =
        `You reached Level ${newLevel} — ${snap.levelInfo.title}!`;
      document.getElementById('levelUpOverlay').style.display = 'flex';
    }
  }

  // ─── Confetti ─────────────────────────────────────────────
  function spawnConfetti() {
    const container = document.getElementById('confettiContainer');
    const colors = ['#a78bfa','#ec4899','#38bdf8','#fbbf24','#34d399','#f97316'];
    for (let i = 0; i < 80; i++) {
      const el = document.createElement('div');
      el.className = 'et-confetti-piece';
      el.style.cssText = `
        left: ${Math.random()*100}%;
        background: ${colors[Math.floor(Math.random()*colors.length)]};
        width: ${6+Math.random()*8}px;
        height: ${6+Math.random()*8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation: confettiFall ${1.8+Math.random()*2}s ${Math.random()*0.8}s linear forwards;
      `;
      container.appendChild(el);
    }
    setTimeout(() => container.innerHTML = '', 4000);
  }

  // ─── Update hero XP bar ───────────────────────────────────
  function updateHeroXP(snap) {
    const lp = snap.levelInfo;
    document.getElementById('heroXP').textContent      = `${lp.currentXP.toLocaleString()} XP`;
    document.getElementById('heroLevel').textContent   = `Level ${lp.level} — ${lp.title}`;
    document.getElementById('heroXPNext').textContent  = `${lp.earnedInLevel.toLocaleString()} / ${lp.neededInLevel.toLocaleString()} XP to Level ${lp.level + 1}`;
    setTimeout(() => {
      document.getElementById('heroXPBar').style.width = lp.percent + '%';
    }, 300);

    const { stats, streak, progress } = snap;
    const ear = progress.earTraining || {};
    document.getElementById('statSessions').textContent  = stats.earTrainingSessions || 0;
    document.getElementById('statCorrect').textContent   = (ear.correctRate || 0) + '%';
    document.getElementById('statStreak').textContent    = (streak.current || 0) + '🔥';
    document.getElementById('statExercises').textContent = ear.exercisesCompleted || 0;
  }

  // ─── Update per-type session count UI ─────────────────────
  function updateSessionCountUI(type, count) {
    const el = document.getElementById(`prog-${type}`);
    const bar = document.getElementById(`progbar-${type}`);
    if (el) el.textContent = count;

    // Progress bar: show % toward 20 sessions milestone
    const pct = Math.min(100, Math.round((count / 20) * 100));
    if (bar) bar.style.width = pct + '%';

    // Also update the overview panel
    const ovBar = document.getElementById(`po-${type}`);
    const ovPct = document.getElementById(`popct-${type}`);
    if (ovBar) ovBar.style.width = pct + '%';
    if (ovPct) ovPct.textContent = pct + '%';
  }

  function updateBlitzStats(bs) {
    const el1 = document.getElementById('blitzTotal');
    const el2 = document.getElementById('blitzBest');
    const el3 = document.getElementById('blitzXP');
    if (el1) el1.textContent = bs.runs;
    if (el2) el2.textContent = bs.best > 0 ? bs.best + '%' : '—';
    if (el3) el3.textContent = bs.xp;
  }

  function updateDailyChallengeBadge() {
    const btn = document.getElementById('dailyChallengeBtn');
    if (btn) {
      btn.textContent = '✅ Completed!';
      btn.classList.add('completed');
      btn.disabled = true;
    }
  }

  // ─── Daily countdown timer ────────────────────────────────
  function startDailyTimer() {
    const el = document.getElementById('challengeTimer');
    if (!el) return;
    function update() {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24,0,0,0);
      const diff = Math.floor((midnight - now) / 1000);
      const h = String(Math.floor(diff / 3600)).padStart(2,'0');
      const m = String(Math.floor((diff % 3600) / 60)).padStart(2,'0');
      const s = String(diff % 60).padStart(2,'0');
      el.textContent = `${h}:${m}:${s}`;
    }
    update();
    setInterval(update, 1000);
  }

  // ─── Filter buttons ───────────────────────────────────────
  function initFilters() {
    document.querySelectorAll('.et-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.et-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.dataset.filter;
        document.querySelectorAll('.et-card').forEach(card => {
          const show = filter === 'all' || card.dataset.level === filter;
          card.style.display = show ? '' : 'none';
          if (show) card.style.animation = 'fadeIn 0.3s ease both';
        });
      });
    });
  }

  // ─── Keyboard shortcuts ───────────────────────────────────
  function initKeyboard() {
    document.addEventListener('keydown', e => {
      const modal = document.getElementById('exerciseModal');
      if (!modal.classList.contains('open')) return;

      const resultsShown = document.getElementById('resultsScreen').style.display !== 'none';

      if (e.key === 'Escape') { closeModal(); return; }

      if (resultsShown) {
        if (e.key === 'r' || e.key === 'R') retryExercise();
        return;
      }

      // Answer keys
      if (['1','2','3','4'].includes(e.key)) {
        const idx = parseInt(e.key) - 1;
        const opts = document.querySelectorAll('.et-option');
        if (opts[idx] && !opts[idx].disabled) opts[idx].click();
        return;
      }

      // Replay
      if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        playCurrentSound();
        return;
      }

      // Next
      if ((e.key === 'Enter' || e.key === 'ArrowRight') && state.answered) {
        nextQuestion();
        return;
      }
    });
  }

  // ─── Intersection observer ────────────────────────────────
  function initAnimations() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });

    document.querySelectorAll('.et-card, .et-blitz-card, .et-history-card, .et-po-item').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity 0.5s ease ${i * 0.06}s, transform 0.5s ease ${i * 0.06}s`;
      observer.observe(el);
    });

    const visStyle = document.createElement('style');
    visStyle.textContent = `
      .visible { opacity:1 !important; transform:none !important; }
      @keyframes fadeIn { from{opacity:0;transform:translateY(14px)} to{opacity:1;transform:none} }
    `;
    document.head.appendChild(visStyle);
  }

  // ─── Init from HarmoniaDB ─────────────────────────────────
  function initFromDB() {
    const snap    = HarmoniaDB.getSnapshot();
    const counts  = loadSessionCounts();
    const blitz   = loadBlitzStats();

    updateHeroXP(snap);
    updateBlitzStats(blitz);

    // Session counts
    ['intervals','chords','scales','melody','rhythm','pitch'].forEach(type => {
      const count = counts[type] || 0;
      updateSessionCountUI(type, count);
    });

    // Check daily challenge
    if (HarmoniaDB.isDailyChallengeCompleted()) {
      updateDailyChallengeBadge();
    }

    // Store initial level for level-up detection
    _lastLevel = snap.levelInfo.level;

    // Populate history from DB ear history
    const earHist = HarmoniaDB.getEarHistory(6);
    if (earHist.length) {
      const typeMap = {
        'Interval Recognition': '🎵', 'Chord Identification': '🎹',
        'Scale Recognition': '🎼',    'Melody Dictation': '🎶',
        'Rhythm Recognition': '🥁',   'Pitch Memory': '🎯',
        'Ear Blitz Mix': '⚡',        'Daily Ear Challenge': '⚡',
      };
      earHist.forEach(h => {
        const icon = typeMap[h.type] || '👂';
        const pct  = h.total > 0 ? Math.round((h.correct / h.total) * 100) : 0;
        addToHistory(icon, h.type, h.correct, h.total, pct);
      });
    }
  }

  // ─── Utility ─────────────────────────────────────────────
  function formatTime(secs) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  }

  // ─── Bootstrap ───────────────────────────────────────────
  function init() {
    initFilters();
    initKeyboard();
    initAnimations();
    initFromDB();
    startDailyTimer();
  }

  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ─── Public API ──────────────────────────────────────────
  return {
    openExercise,
    startBlitz,
    startDailyChallenge,
    closeModal,
    playCurrentSound,
    selectAnswer,
    nextQuestion,
    retryExercise,
    _toastTimer: null,
  };

})();

// ─── escapeHTML (global, also used by training.js) ────────
function escapeHTML(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}
