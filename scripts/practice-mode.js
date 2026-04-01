/**
 * =============================================================
 *  HARMONIA – PRACTICE MODE (scripts/practice-mode.js) Final v3
 *  Features:
 *  - 8 instrument cards with animated selection
 *  - Per-instrument guided lessons (3-4 lessons each)
 *  - Multi-step lesson flow: Learn → Visual → Exercise → Complete
 *  - Exercise types: Multiple Choice, Note Sequence, Rhythm Tap
 *  - Real-time scoring, pass/fail with XP rewards
 *  - Chord diagrams, piano keys, scale displays
 *  - Animated rhythm playback synced to Web Audio
 *  - Web Audio API metronome with pendulum animation
 *  - Session timer, history, daily goal bar
 *  - Confetti on lesson pass
 *  - HarmoniaDB integration
 *  - Full keyboard shortcuts
 * =============================================================
 */

const PracticeMode = (() => {

  /* ─── STATE ─────────────────────────────────────────────── */
  const state = {
    instrument: null,
    currentLesson: null,
    currentStepIndex: 0,
    lessonScore: { correct: 0, total: 0 },
    lessonStartTime: null,
    lessonPassedIds: _loadPassedIds(),

    sessionActive: false,
    sessionPaused: false,
    sessionStartTime: null,
    sessionPausedAt: null,
    sessionPausedTotal: 0,
    sessionInterval: null,
    sessionSeconds: 0,
    dailyGoalMinutes: 30,

    metroRunning: false,
    bpm: 120,
    beatsPerMeasure: 4,
    currentBeat: 0,
    accentOn: true,
    volume: 0.8,
    tapTimes: [],
    audioCtx: null,
    nextBeatTime: 0,
    metroScheduler: null,

    playingTrackId: null,
    trackOscillators: [],
    _trackLoopId: null,
    activeTrackFilter: 'all',
  };

  function _loadPassedIds() {
    try { return JSON.parse(localStorage.getItem('pm_passed_lessons') || '[]'); } catch(e) { return []; }
  }
  function _savePassedIds() {
    try { localStorage.setItem('pm_passed_lessons', JSON.stringify(state.lessonPassedIds)); } catch(e) {}
  }

  /* ─── INSTRUMENTS ─────────────────────────────────────────── */
  const INSTRUMENTS = [
    { id: 'guitar',    name: 'Guitar',    emoji: '🎸', sub: 'Chords, scales & solos',   color: '#10b981', tags: 'Strings · Beginner-friendly' },
    { id: 'piano',     name: 'Piano',     emoji: '🎹', sub: 'Keys, scales & harmony',   color: '#a78bfa', tags: 'Keys · Theory-rich' },
    { id: 'drums',     name: 'Drums',     emoji: '🥁', sub: 'Rhythm, beats & fills',    color: '#ec4899', tags: 'Rhythm · Physical' },
    { id: 'violin',    name: 'Violin',    emoji: '🎻', sub: 'Bowing & intonation',      color: '#f59e0b', tags: 'Strings · Classical' },
    { id: 'trumpet',   name: 'Trumpet',   emoji: '🎺', sub: 'Breath & tone control',    color: '#38bdf8', tags: 'Brass · Wind' },
    { id: 'bass',      name: 'Bass',      emoji: '🎵', sub: 'Grooves & walking bass',   color: '#34d399', tags: 'Strings · Groove' },
    { id: 'saxophone', name: 'Saxophone', emoji: '🎷', sub: 'Jazz & soulful lines',     color: '#fb923c', tags: 'Wind · Jazz' },
    { id: 'voice',     name: 'Voice',     emoji: '🎤', sub: 'Pitch, breath & range',    color: '#e879f9', tags: 'Vocal · All levels' },
  ];

  const INSTR_ICONS = { guitar:'🎸', piano:'🎹', drums:'🥁', violin:'🎻', trumpet:'🎺', bass:'🎵', saxophone:'🎷', voice:'🎤' };

  /* ─── LESSON DATABASE ─────────────────────────────────────── */
  const LESSONS = {
    guitar: [
      {
        id:'g1', title:'Open G Chord', icon:'🎸', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'Learn the essential open G chord — one of the most used chords in all of music.',
        color:'#10b981',
        steps:[
          { type:'learn', title:'What is the G Major Chord?',
            desc:'The G major chord is one of the first chords every guitarist learns. It creates a bright, full sound used in countless songs. You\'ll use 3 fingers on specific frets while other strings ring open.',
            tip:{ icon:'💡', text:'Press your fingertips close to the fret — not flat — to avoid muting adjacent strings.' }
          },
          { type:'visual', title:'Finger Placement Diagram',
            desc:'Study the chord diagram below. Press the highlighted positions with your fingers.',
            visual:{ type:'chord', name:'G', frets:[
              [false, false, false, false, false, true],
              [false, true,  false, false, false, false],
              [false, false, false, false, false, false],
              [true,  false, false, false, false, false],
            ], open:[false, false, true, true, true, false], muted:[false, false, false, false, false, false],
            labels:['E','A','D','G','B','e'] }
          },
          { type:'exercise', title:'Chord Knowledge Check', exerciseType:'mc',
            question:'How many fingers do you use to fret the standard G major chord?',
            choices:['1 finger','2 fingers','3 fingers','4 fingers'], correct:2,
            explanation:'The standard G major chord uses 3 fingers: ring on low E (6th string, 3rd fret), middle on A (2nd fret), and pinky on high E (3rd fret).'
          },
          { type:'exercise', title:'Open Strings',  exerciseType:'mc',
            question:'Which strings are played OPEN (not fretted) in the G major chord?',
            choices:['Only D string','D, G, and B strings','All 6 strings','Only high e string'], correct:1,
            explanation:'The D (4th), G (3rd) and B (2nd) strings are all open in the standard G chord voicing.'
          },
          { type:'exercise', title:'Scale of G Major — Notes in Order', exerciseType:'sequence',
            desc:'Tap the notes of the G major scale in ascending order:',
            notes:['G','A','B','C','D','E','F#'], correct:['G','A','B','C','D','E','F#']
          },
          { type:'exercise', title:'Strumming Rhythm', exerciseType:'rhythm',
            desc:'Tap steady down-strums: one per beat in 4/4 time.',
            pattern:[true,true,true,true], tempo:80, reps:2
          },
        ]
      },
      {
        id:'g2', title:'C Major Chord', icon:'🎸', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'Master C major and start building your first chord progressions.',
        color:'#10b981',
        steps:[
          { type:'learn', title:'The C Major Chord',
            desc:'C major is bright and uplifting. Together with G, these two chords let you play hundreds of songs! The C chord uses 3 fingers and you must avoid strumming the low E string.',
            tip:{ icon:'⚠️', text:'Don\'t strum the low E (6th) string on C major — it clashes with the chord.' }
          },
          { type:'visual', title:'C Major Finger Positions',
            desc:'Notice the x on the low E string — that means mute or skip it.',
            visual:{ type:'chord', name:'C', frets:[
              [false, false, false, false, false, false],
              [false, false, true,  false, false, false],
              [false, false, false, false, true,  false],
              [false, true,  false, false, false, false],
            ], open:[false, false, false, true, false, true], muted:[true, false, false, false, false, false],
            labels:['E','A','D','G','B','e'] }
          },
          { type:'exercise', title:'Why Avoid the Low E?', exerciseType:'mc',
            question:'Why do we avoid the 6th (low E) string on a C major chord?',
            choices:['It\'s too hard to reach','It makes the chord sound dissonant','The string is broken','It\'s too loud'],
            correct:1, explanation:'The open low E note clashes with C major harmony. The chord sounds best starting from the A string (5th string).'
          },
          { type:'exercise', title:'C Major Notes', exerciseType:'sequence',
            desc:'Tap the three notes that make up the C major triad:',
            notes:['C','E','G'], correct:['C','E','G']
          },
          { type:'exercise', title:'C Chord Rhythm', exerciseType:'rhythm',
            desc:'Tap a down-up strumming pattern on C major: down on 1 and 3, up on 2 and 4.',
            pattern:[true,false,true,false,true,false,true,false], tempo:75, reps:2
          },
        ]
      },
      {
        id:'g3', title:'Minor Pentatonic Scale', icon:'🎸', diff:'Intermediate', xp:80, dur:'~12 min',
        desc:'Learn the A minor pentatonic — the foundation of rock, blues, and improvisation.',
        color:'#10b981',
        steps:[
          { type:'learn', title:'What is the Pentatonic Scale?',
            desc:'The pentatonic uses only 5 notes (penta = 5). It\'s the most widely used scale in rock, blues, and pop. Mastering it unlocks improvisation and soloing.',
            tip:{ icon:'🔥', text:'The A minor pentatonic overlaps with the C major pentatonic — two scales for the price of one!' }
          },
          { type:'visual', title:'A Minor Pentatonic Notes',
            desc:'The 5 notes of A minor pentatonic. The root (A) glows green.',
            visual:{ type:'scale', name:'A Minor Pentatonic', notes:['A','C','D','E','G'], root:'A', intervals:['Root','♭3','4','5','♭7'] }
          },
          { type:'exercise', title:'Scale Note Count', exerciseType:'mc',
            question:'How many unique notes are in the pentatonic scale per octave?',
            choices:['4 notes','5 notes','6 notes','7 notes'], correct:1,
            explanation:'Penta means five — the pentatonic has exactly 5 notes per octave, making it smooth and easy to improvise over.'
          },
          { type:'exercise', title:'Notes in Order', exerciseType:'sequence',
            desc:'Tap the A minor pentatonic scale in ascending order:',
            notes:['A','C','D','E','G'], correct:['A','C','D','E','G']
          },
          { type:'exercise', title:'Pentatonic Genre', exerciseType:'mc',
            question:'The pentatonic scale is most commonly used in which styles?',
            choices:['Classical orchestra','Rock, blues & improvisation','Gregorian chant','Musical theatre'],
            correct:1, explanation:'The pentatonic is the backbone of rock and blues guitar. Its 5 notes avoid clashes, making improvisation natural.'
          },
        ]
      },
    ],

    piano: [
      {
        id:'p1', title:'Middle C & Hand Position', icon:'🎹', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'Find Middle C, set correct hand position, and understand why it\'s every pianist\'s starting point.',
        color:'#a78bfa',
        steps:[
          { type:'learn', title:'Finding Middle C',
            desc:'Middle C (C4) sits at the very center of a standard 88-key piano, just left of a pair of black keys. Your right thumb (finger 1) rests here naturally.',
            tip:{ icon:'🎹', text:'Two black keys together — Middle C is always the white key immediately to their left.' }
          },
          { type:'visual', title:'Middle C on Piano',
            desc:'The highlighted key (glowing green) is Middle C. Place your right thumb here.',
            visual:{ type:'piano', highlight:['C4'], root:'C4', octave:4 }
          },
          { type:'exercise', title:'Middle C Location', exerciseType:'mc',
            question:'Middle C is located at which position on a standard piano?',
            choices:['Far left','Far right','Very center of the keyboard','Near the bass pedals'],
            correct:2, explanation:'Middle C (C4) is at the exact center of the 88-key piano — it\'s the universal reference point for musical notation.'
          },
          { type:'exercise', title:'Finger Numbering', exerciseType:'mc',
            question:'In standard piano fingering, the thumb is finger number:',
            choices:['Finger 2','Finger 1','Finger 3','Finger 5'],
            correct:1, explanation:'The thumb is finger 1 in standard piano notation. The right thumb sits on Middle C in the basic 5-finger position.'
          },
          { type:'exercise', title:'5-Finger C Position', exerciseType:'sequence',
            desc:'Tap the 5-finger C position notes ascending (right hand):',
            notes:['C','D','E','F','G'], correct:['C','D','E','F','G']
          },
        ]
      },
      {
        id:'p2', title:'C Major Scale', icon:'🎹', diff:'Beginner', xp:60, dur:'~10 min',
        desc:'Play your first complete scale — the foundation of all Western music theory.',
        color:'#a78bfa',
        steps:[
          { type:'learn', title:'The C Major Scale',
            desc:'C major uses only white keys: C-D-E-F-G-A-B-C. The pattern is Whole-Whole-Half-Whole-Whole-Whole-Half. It\'s the only major scale with no sharps or flats.',
            tip:{ icon:'💡', text:'C major is the only major scale that uses all white keys — perfect for beginners!' }
          },
          { type:'visual', title:'C Major Scale Keys',
            desc:'All 7 notes of C major highlighted. Root (C) glows brightest.',
            visual:{ type:'piano', highlight:['C4','D4','E4','F4','G4','A4','B4'], root:'C4', octave:4 }
          },
          { type:'visual', title:'C Major Scale Notes',
            desc:'The 7 notes and their scale degrees.',
            visual:{ type:'scale', name:'C Major Scale', notes:['C','D','E','F','G','A','B'], root:'C', intervals:['1','2','3','4','5','6','7'] }
          },
          { type:'exercise', title:'Scale Formula', exerciseType:'mc',
            question:'What is the interval pattern of the major scale (W=Whole, H=Half)?',
            choices:['W-H-W-W-H-W-W','W-W-H-W-W-W-H','H-W-W-H-W-W-W','W-W-W-H-W-W-H'],
            correct:1, explanation:'The major scale formula is W-W-H-W-W-W-H. This creates the familiar do-re-mi sound.'
          },
          { type:'exercise', title:'Black Keys in C Major', exerciseType:'mc',
            question:'How many black keys does the C major scale use?',
            choices:['1 black key','2 black keys','3 black keys','No black keys'],
            correct:3, explanation:'C major is all white keys — no black keys at all. That\'s why it\'s the first scale every pianist learns.'
          },
          { type:'exercise', title:'Scale in Order', exerciseType:'sequence',
            desc:'Tap the C major scale ascending:',
            notes:['C','D','E','F','G','A','B'], correct:['C','D','E','F','G','A','B']
          },
        ]
      },
      {
        id:'p3', title:'Major & Minor Triads', icon:'🎹', diff:'Intermediate', xp:80, dur:'~12 min',
        desc:'Build 3-note chords (triads) and understand the difference between major and minor.',
        color:'#a78bfa',
        steps:[
          { type:'learn', title:'What is a Triad?',
            desc:'A triad is a 3-note chord built from a root, 3rd, and 5th. Major triads sound happy; minor triads sound sad. The only difference is one note — the 3rd!',
            tip:{ icon:'🎵', text:'Major 3rd = 4 semitones above root. Minor 3rd = 3 semitones above root.' }
          },
          { type:'visual', title:'C Major Triad (C-E-G)',
            desc:'Press C, E, and G simultaneously. These three notes form C major.',
            visual:{ type:'piano', highlight:['C4','E4','G4'], root:'C4', octave:4 }
          },
          { type:'exercise', title:'Triad Construction', exerciseType:'mc',
            question:'A major triad is built from:',
            choices:['Root + Major 2nd + Perfect 5th','Root + Major 3rd + Perfect 5th','Root + Minor 3rd + Perfect 5th','Root + Perfect 4th + Augmented 5th'],
            correct:1, explanation:'A major triad stacks Root + Major 3rd (4 semitones) + Perfect 5th (7 semitones from root).'
          },
          { type:'exercise', title:'Major to Minor', exerciseType:'mc',
            question:'To turn C major into C minor, you would:',
            choices:['Raise the 5th by a semitone','Lower the 3rd by a semitone (E→E♭)','Remove the 5th entirely','Raise the root by a semitone'],
            correct:1, explanation:'Lowering the major 3rd (E) by one semitone to E♭ creates a minor triad. One note changes everything!'
          },
          { type:'exercise', title:'C Major Triad Notes', exerciseType:'sequence',
            desc:'Tap the notes of C major triad:',
            notes:['C','E','G'], correct:['C','E','G']
          },
        ]
      },
    ],

    drums: [
      {
        id:'d1', title:'Basic 4/4 Beat', icon:'🥁', diff:'Beginner', xp:50, dur:'~10 min',
        desc:'Learn the standard rock beat — kick on 1 & 3, snare on 2 & 4.',
        color:'#ec4899',
        steps:[
          { type:'learn', title:'The Heartbeat of Music',
            desc:'The basic rock beat uses: kick drum on beats 1 and 3, snare drum on beats 2 and 4. Hi-hat plays all 4 beats. This pattern drives pop, rock, and nearly every popular style.',
            tip:{ icon:'🥁', text:'Count out loud: "1 and 2 and 3 and 4 and" — kick on 1,3 and snare on 2,4.' }
          },
          { type:'visual', title:'4/4 Beat Structure',
            desc:'The four beats and which drum hits each one.',
            visual:{ type:'scale', name:'Basic 4/4 Beat', notes:['1','2','3','4'], root:'1', intervals:['Kick','Snare','Kick','Snare'] }
          },
          { type:'exercise', title:'Snare Placement', exerciseType:'mc',
            question:'In a standard rock beat, the SNARE drum hits on which beats?',
            choices:['Beats 1 and 3','Beats 2 and 4','All 4 beats','Only beat 1'],
            correct:1, explanation:'Snare on 2 and 4 is called the "backbeat" — it\'s the defining characteristic of rock and pop drumming.'
          },
          { type:'exercise', title:'Kick Pattern', exerciseType:'rhythm',
            desc:'Tap the kick drum pattern — beats 1 and 3 only in 4/4.',
            pattern:[true,false,true,false], tempo:80, reps:3
          },
          { type:'exercise', title:'Hi-Hat 8th Notes', exerciseType:'rhythm',
            desc:'Now tap hi-hat eighth notes — all 8 subdivisions evenly.',
            pattern:[true,true,true,true,true,true,true,true], tempo:80, reps:2
          },
        ]
      },
      {
        id:'d2', title:'Hi-Hat Patterns', icon:'🥁', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'Explore hi-hat variations that add groove and feel to your drumming.',
        color:'#ec4899',
        steps:[
          { type:'learn', title:'Hi-Hat: The Timekeeper',
            desc:'Quarter note hi-hats feel steady and march-like. Eighth note hi-hats are the most common in rock. Sixteenth note hi-hats create a fast, funky feel.',
            tip:{ icon:'💡', text:'Most drummers lead with the dominant hand on hi-hat. The foot pedal controls the closed "chick" sound.' }
          },
          { type:'exercise', title:'Note Values', exerciseType:'mc',
            question:'How many eighth notes fit in one bar of 4/4 time?',
            choices:['4 eighth notes','6 eighth notes','8 eighth notes','16 eighth notes'],
            correct:2, explanation:'4 beats × 2 eighth notes per beat = 8 eighth notes per bar of 4/4.'
          },
          { type:'exercise', title:'Quarter Note Hi-Hat', exerciseType:'rhythm',
            desc:'Tap 4 steady quarter notes — even and march-like.',
            pattern:[true,false,true,false,true,false,true,false], tempo:90, reps:2
          },
          { type:'exercise', title:'Sixteenth Note Style', exerciseType:'mc',
            question:'Sixteenth note hi-hats are most associated with:',
            choices:['Slow ballads','Classical music','Funk and R&B','Jazz standards'],
            correct:2, explanation:'Sixteenth note hi-hats create the tight, fast, driving feel central to funk and R&B drumming.'
          },
        ]
      },
      {
        id:'d3', title:'Triplet & Shuffle Feel', icon:'🥁', diff:'Intermediate', xp:75, dur:'~12 min',
        desc:'Unlock the shuffle groove — the swinging triplet feel that defines blues and jazz.',
        color:'#ec4899',
        steps:[
          { type:'learn', title:'What is a Triplet?',
            desc:'A triplet divides one beat into 3 equal parts instead of 2. Playing triplets on hi-hat and accenting the 1st and 3rd note creates the shuffle/swing feel that drives the blues.',
            tip:{ icon:'🎵', text:'Count "1-trip-let, 2-trip-let, 3-trip-let, 4-trip-let" — stress the first and last of each group.' }
          },
          { type:'exercise', title:'Triplet Division', exerciseType:'mc',
            question:'A triplet divides one beat into how many equal parts?',
            choices:['2 parts','3 parts','4 parts','6 parts'],
            correct:1, explanation:'A triplet divides one beat into exactly 3 equal parts, notated with a "3" above three beamed notes.'
          },
          { type:'exercise', title:'Shuffle Genre', exerciseType:'mc',
            question:'The shuffle (swing) feel is the defining rhythm of:',
            choices:['Classical','Blues and Jazz','Electronic dance','Country pop'],
            correct:1, explanation:'The shuffle is the defining rhythm of blues and jazz. Notes "swing" with a long-short triplet feel instead of straight eighth notes.'
          },
          { type:'exercise', title:'Triplet Tap', exerciseType:'rhythm',
            desc:'Tap a triplet pattern — 3 even taps per beat over 2 beats.',
            pattern:[true,true,true,true,true,true], tempo:72, reps:3
          },
        ]
      },
    ],

    violin: [
      {
        id:'v1', title:'Open Strings', icon:'🎻', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'Learn the 4 open strings, their names, and the fundamentals of bow technique.',
        color:'#f59e0b',
        steps:[
          { type:'learn', title:'The Four Open Strings',
            desc:'Violin has 4 strings tuned in perfect 5ths: G-D-A-E (lowest to highest). "Open" means no fingers pressed. G is warm and deep; E is bright and piercing.',
            tip:{ icon:'🎻', text:'Remember "Good Dogs Are Easy" (G-D-A-E) to memorize the string order!' }
          },
          { type:'visual', title:'Open String Notes',
            desc:'The 4 open string pitches from lowest to highest.',
            visual:{ type:'scale', name:'Violin Open Strings', notes:['G','D','A','E'], root:'G', intervals:['4th str','3rd str','2nd str','1st str'] }
          },
          { type:'exercise', title:'Highest String', exerciseType:'mc',
            question:'What is the highest-pitched open string on a violin?',
            choices:['G string','D string','A string','E string'],
            correct:3, explanation:'The E string is the highest-pitched violin string. It produces a bright, piercing tone used extensively in melody.'
          },
          { type:'exercise', title:'String Tuning Interval', exerciseType:'mc',
            question:'Violin strings are tuned in which interval relationship?',
            choices:['Perfect 4ths','Perfect 5ths','Major 3rds','Octaves'],
            correct:1, explanation:'Each violin string is tuned a Perfect 5th above the previous: G-D-P5, D-A-P5, A-E-P5. Same for cello and viola.'
          },
          { type:'exercise', title:'Strings Low to High', exerciseType:'sequence',
            desc:'Tap the violin strings from lowest to highest pitch:',
            notes:['G','D','A','E'], correct:['G','D','A','E']
          },
        ]
      },
      {
        id:'v2', title:'D Major Scale', icon:'🎻', diff:'Beginner', xp:65, dur:'~10 min',
        desc:'Play your first complete violin scale — resonant, natural, and beloved by composers.',
        color:'#f59e0b',
        steps:[
          { type:'learn', title:'Why D Major First?',
            desc:'D major is the most resonant key for violin. Open D and A strings ring sympathetically. Many beloved concertos are in D. It has 2 sharps: F# and C#.',
            tip:{ icon:'💡', text:'D major has 2 sharps: F# and C#. Remember "Father Charles" as a memory aid.' }
          },
          { type:'visual', title:'D Major Scale Notes',
            desc:'The 7 notes of D major. Notice the two sharps.',
            visual:{ type:'scale', name:'D Major Scale', notes:['D','E','F#','G','A','B','C#'], root:'D', intervals:['1','2','3','4','5','6','7'] }
          },
          { type:'exercise', title:'Key Signature', exerciseType:'mc',
            question:'How many sharps are in the D major key signature?',
            choices:['0 sharps','1 sharp','2 sharps','3 sharps'],
            correct:2, explanation:'D major has 2 sharps: F# and C#. The key signature tells you to play these sharp throughout the piece.'
          },
          { type:'exercise', title:'D Major Scale', exerciseType:'sequence',
            desc:'Tap the D major scale ascending:',
            notes:['D','E','F#','G','A','B','C#'], correct:['D','E','F#','G','A','B','C#']
          },
        ]
      },
    ],

    trumpet: [
      {
        id:'t1', title:'Long Tones & Breath', icon:'🎺', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'The foundation of all brass playing: consistent breath support and tone production.',
        color:'#38bdf8',
        steps:[
          { type:'learn', title:'Why Practice Long Tones?',
            desc:'Long tones are sustained notes held for many beats. They reveal the quality of your embouchure, breath support, and tone. A beautiful, steady long tone marks a professional brass player.',
            tip:{ icon:'🎺', text:'Breathe from your diaphragm (belly), not your chest. Your belly should expand on the inhale.' }
          },
          { type:'exercise', title:'Tone Production', exerciseType:'mc',
            question:'Brass tone is primarily controlled by:',
            choices:['Finger speed','Embouchure and breath support','Valve spring tension','Bell size'],
            correct:1, explanation:'Embouchure (lip position) combined with diaphragmatic breath support is the foundation of brass tone.'
          },
          { type:'exercise', title:'Ideal Long Tone Length', exerciseType:'mc',
            question:'When practicing long tones, each note should ideally last:',
            choices:['1-2 seconds','4-8 slow beats','Exactly 30 seconds','As fast as possible'],
            correct:1, explanation:'4-8 slow beats gives you time to focus on tone quality, intonation, and a smooth, controlled decay.'
          },
          { type:'exercise', title:'Long Tone Rhythm', exerciseType:'rhythm',
            desc:'Tap one note per 4 beats — slow, sustained, controlled.',
            pattern:[true,false,false,false,true,false,false,false], tempo:55, reps:2
          },
        ]
      },
      {
        id:'t2', title:'Valve Combinations', icon:'🎺', diff:'Beginner', xp:60, dur:'~10 min',
        desc:'Learn which valves produce each pitch and play your first trumpet scale.',
        color:'#38bdf8',
        steps:[
          { type:'learn', title:'Three Valves, Many Pitches',
            desc:'Trumpet has 3 valves (1,2,3 from left). Pressing them extends the tubing, lowering pitch. Valve 1 = -2 semitones, Valve 2 = -1 semitone, Valve 3 = -3 semitones.',
            tip:{ icon:'💡', text:'No valves pressed = the natural harmonic series. Combinations lower the pitch from there.' }
          },
          { type:'exercise', title:'All Three Valves', exerciseType:'mc',
            question:'Pressing all three valves together (1+2+3) lowers the pitch by:',
            choices:['3 semitones','4 semitones','6 semitones','8 semitones'],
            correct:2, explanation:'Valve 1 (-2) + Valve 2 (-1) + Valve 3 (-3) = -6 semitones total when all three are pressed together.'
          },
          { type:'exercise', title:'Trumpet C Major', exerciseType:'sequence',
            desc:'Tap the notes of C major scale:',
            notes:['C','D','E','F','G','A','B'], correct:['C','D','E','F','G','A','B']
          },
        ]
      },
    ],

    bass: [
      {
        id:'b1', title:'Root Note Grooves', icon:'🎵', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'Lock in with the kick drum, play root notes, and lay the rhythmic foundation.',
        color:'#34d399',
        steps:[
          { type:'learn', title:'The Role of Bass Guitar',
            desc:'Bass bridges the rhythmic world of the drums and the harmonic world of chords. Root note playing — the root of each chord — is the simplest and most effective approach.',
            tip:{ icon:'🎵', text:'Listen to the kick drum and try to match it — great basslines breathe with the drums!' }
          },
          { type:'visual', title:'Bass Open Strings (4-String)',
            desc:'4-string bass open strings from lowest to highest.',
            visual:{ type:'scale', name:'4-String Bass Open Strings', notes:['E','A','D','G'], root:'E', intervals:['4th str','3rd str','2nd str','1st str'] }
          },
          { type:'exercise', title:'Bass Role', exerciseType:'mc',
            question:'The bass guitar\'s primary musical role is to:',
            choices:['Play complex melodies','Bridge rhythm and harmony','Keep time on cymbals','Provide chord structures only'],
            correct:1, explanation:'Bass bridges the rhythmic world of drums and the harmonic world of chords — it\'s the glue of the band.'
          },
          { type:'exercise', title:'Groove Pattern', exerciseType:'rhythm',
            desc:'Tap this root note groove — feel the pocket!',
            pattern:[true,false,true,false,false,true,false,false], tempo:88, reps:3
          },
        ]
      },
      {
        id:'b2', title:'Walking Bass Basics', icon:'🎵', diff:'Intermediate', xp:80, dur:'~12 min',
        desc:'Learn to walk between chord tones — the foundation of jazz and blues bass.',
        color:'#34d399',
        steps:[
          { type:'learn', title:'What is Walking Bass?',
            desc:'A walking bass line moves in quarter notes, usually stepwise or via chord arpeggios. It connects chord changes smoothly and gives music forward momentum. Essential in jazz, blues, and swing.',
            tip:{ icon:'🎵', text:'Target the root of the NEXT chord on beat 1 — then "walk" there using beats 2, 3, and 4.' }
          },
          { type:'exercise', title:'Walking Note Values', exerciseType:'mc',
            question:'Walking bass lines primarily use which note values?',
            choices:['Whole notes','Half notes','Quarter notes','Eighth notes'],
            correct:2, explanation:'Walking bass moves in steady quarter notes — one note per beat. This creates the smooth continuous "walking" motion.'
          },
          { type:'exercise', title:'Approach Notes', exerciseType:'mc',
            question:'A "half-step approach" to a chord target note means playing:',
            choices:['The chord root twice','A note one semitone away that resolves to the target','Random nearby notes','Skipping the chord entirely'],
            correct:1, explanation:'Half-step approach notes (one semitone above or below) create tension that resolves beautifully — the most common walk technique.'
          },
          { type:'exercise', title:'Quarter Note Walk', exerciseType:'rhythm',
            desc:'Tap steady quarter notes — four even beats per bar.',
            pattern:[true,true,true,true], tempo:100, reps:4
          },
        ]
      },
    ],

    saxophone: [
      {
        id:'s1', title:'Embouchure & First Notes', icon:'🎷', diff:'Beginner', xp:55, dur:'~10 min',
        desc:'Set up your embouchure correctly and produce your first clear saxophone tones.',
        color:'#fb923c',
        steps:[
          { type:'learn', title:'Saxophone Embouchure',
            desc:'Embouchure (OM-boo-shure) is how you position your mouth on the mouthpiece. Top teeth rest on the mouthpiece, bottom lip gently curled over bottom teeth, corners slightly firm. About 1/3 of mouthpiece inside the mouth.',
            tip:{ icon:'🎷', text:'Imagine saying "ohh" with a relaxed, open mouth — that\'s close to the ideal saxophone embouchure.' }
          },
          { type:'exercise', title:'Embouchure Basics', exerciseType:'mc',
            question:'For saxophone, correct embouchure involves:',
            choices:['Both lips over teeth (double lip)','Top teeth on mouthpiece, bottom lip cushioned over teeth','Biting hard on the reed','Pursing lips like whistling'],
            correct:1, explanation:'Top teeth rest on the mouthpiece for support; the bottom lip cushions over the teeth, controlling reed vibration.'
          },
          { type:'exercise', title:'Breath Support', exerciseType:'mc',
            question:'When playing saxophone, air should be supported by:',
            choices:['Chest and shoulders','The diaphragm and lower lungs','The throat only','Just the mouth'],
            correct:1, explanation:'Diaphragmatic breathing provides the consistent, supported air column needed for good saxophone tone and control.'
          },
          { type:'exercise', title:'Sustained Tones', exerciseType:'rhythm',
            desc:'Tap long, sustained tones — one per 4 beats, very slow.',
            pattern:[true,false,false,false,true,false,false,false], tempo:55, reps:2
          },
        ]
      },
      {
        id:'s2', title:'Bb Major Scale', icon:'🎷', diff:'Beginner', xp:65, dur:'~10 min',
        desc:'Learn Bb major — and why saxophones are "transposing instruments."',
        color:'#fb923c',
        steps:[
          { type:'learn', title:'Saxophone Transposition',
            desc:'Alto sax is in Eb; tenor sax is in Bb. When you play a written C, the concert pitch differs. Just read your written part — the transposition is built into the notation.',
            tip:{ icon:'💡', text:'Play what you read and you\'ll be in tune with the band. The transposition is automatic.' }
          },
          { type:'exercise', title:'Tenor Sax Transposition', exerciseType:'mc',
            question:'When a Bb tenor sax player plays a written C, the concert pitch heard is:',
            choices:['Concert C','Concert D','Concert Bb','Concert F'],
            correct:2, explanation:'Tenor sax is a Bb instrument. Written C sounds as concert Bb — a major 2nd lower.'
          },
          { type:'visual', title:'Bb Major Scale Notes',
            desc:'Bb major scale — 2 flats (Bb and Eb).',
            visual:{ type:'scale', name:'Bb Major Scale', notes:['Bb','C','D','Eb','F','G','A'], root:'Bb', intervals:['1','2','3','4','5','6','7'] }
          },
          { type:'exercise', title:'Bb Major Scale', exerciseType:'sequence',
            desc:'Tap Bb major scale in ascending order:',
            notes:['Bb','C','D','Eb','F','G','A'], correct:['Bb','C','D','Eb','F','G','A']
          },
        ]
      },
    ],

    voice: [
      {
        id:'vo1', title:'Posture & Breath', icon:'🎤', diff:'Beginner', xp:50, dur:'~8 min',
        desc:'Great singing starts with alignment and breath — the two pillars of vocal technique.',
        color:'#e879f9',
        steps:[
          { type:'learn', title:'Singing Posture',
            desc:'Stand feet shoulder-width, knees soft, spine tall, shoulders relaxed, chin parallel to the floor. Tension is the enemy of singing — check jaw, neck, and shoulders regularly.',
            tip:{ icon:'🎤', text:'Imagine a string pulling the crown of your head upward — that alignment opens your airways fully.' }
          },
          { type:'exercise', title:'Posture Purpose', exerciseType:'mc',
            question:'Why is good posture important for singers?',
            choices:['It looks more professional','It opens airways for full lung capacity','It prevents microphone feedback','It makes high notes visible'],
            correct:1, explanation:'Good alignment allows the lungs to fully expand, giving you maximum breath support and vocal power.'
          },
          { type:'exercise', title:'Breathing Technique', exerciseType:'mc',
            question:'Correct singing breath support uses:',
            choices:['Quick shallow chest breaths','Deep diaphragmatic breaths with belly expansion','Holding breath between phrases','Breathing through the nose only'],
            correct:1, explanation:'Diaphragmatic breathing expands the belly and lower ribs on inhale, providing the consistent air pressure needed for controlled vocal tone.'
          },
          { type:'exercise', title:'Breath Cycles', exerciseType:'rhythm',
            desc:'Tap the inhale (beat 1) and exhale (beat 5) of 4-count breath cycles.',
            pattern:[true,false,false,false,true,false,false,false], tempo:50, reps:3
          },
        ]
      },
      {
        id:'vo2', title:'Pitch & Intervals', icon:'🎤', diff:'Beginner', xp:60, dur:'~10 min',
        desc:'Develop your ear-to-voice connection by understanding intervals and solfege.',
        color:'#e879f9',
        steps:[
          { type:'learn', title:'Pitch is a Trainable Skill',
            desc:'Your brain sends signals to your vocal cords to adjust tension and produce pitch. Ear training (hearing clearly) and voice training (muscle memory) grow together through regular practice.',
            tip:{ icon:'🎵', text:'"Twinkle Twinkle" = Perfect 5th. "Happy Birthday" = Major 2nd. Use songs to remember intervals!' }
          },
          { type:'exercise', title:'C to G Interval', exerciseType:'mc',
            question:'The interval from C to G (5 white keys apart) is called:',
            choices:['Perfect 4th','Perfect 5th','Major 3rd','Minor 7th'],
            correct:1, explanation:'C to G spans 7 semitones — a Perfect 5th. One of the most consonant intervals in music.'
          },
          { type:'visual', title:'Intervals from C',
            desc:'Key intervals starting from C.',
            visual:{ type:'scale', name:'Intervals from C', notes:['C','D','E','F','G','A','B'], root:'C', intervals:['Root','Maj 2','Maj 3','Per 4','Per 5','Maj 6','Maj 7'] }
          },
          { type:'exercise', title:'Solfege in Order', exerciseType:'sequence',
            desc:'Tap the solfege syllables of the major scale in order:',
            notes:['Do','Re','Mi','Fa','Sol','La','Ti'], correct:['Do','Re','Mi','Fa','Sol','La','Ti']
          },
        ]
      },
    ],
  };

  /* ─── BACKING TRACKS ─────────────────────────────────────── */
  const TRACKS = [
    { id:1,  name:'Blues in A',          genre:'Blues',     key:'A',  bpm:80,  emoji:'🎸', tags:['12-bar','shuffle'],   difficulty:'Beginner' },
    { id:2,  name:'Slow Blues Groove',   genre:'Blues',     key:'E',  bpm:60,  emoji:'🎸', tags:['slow','minor'],       difficulty:'Intermediate' },
    { id:3,  name:'Jazz Swing Standard', genre:'Jazz',      key:'Bb', bpm:120, emoji:'🎷', tags:['swing','ii-V-I'],     difficulty:'Intermediate' },
    { id:4,  name:'Bossa Nova Groove',   genre:'Jazz',      key:'C',  bpm:100, emoji:'🎷', tags:['bossa','latin jazz'], difficulty:'Intermediate' },
    { id:5,  name:'Rock Power Jam',      genre:'Rock',      key:'E',  bpm:140, emoji:'🎸', tags:['power','4/4'],        difficulty:'Beginner' },
    { id:6,  name:'Funky Rock Groove',   genre:'Rock',      key:'G',  bpm:110, emoji:'🎸', tags:['funk','groove'],      difficulty:'Intermediate' },
    { id:7,  name:'Salsa Rhythm Track',  genre:'Latin',     key:'Am', bpm:150, emoji:'🎺', tags:['salsa','clave'],      difficulty:'Advanced' },
    { id:8,  name:'Bossa Nova Chill',    genre:'Latin',     key:'F',  bpm:90,  emoji:'🎺', tags:['bossa','relaxed'],    difficulty:'Intermediate' },
    { id:9,  name:'Bach Prelude Drone',  genre:'Classical', key:'C',  bpm:72,  emoji:'🎻', tags:['baroque','drone'],    difficulty:'Advanced' },
    { id:10, name:'Romantic Waltz',      genre:'Classical', key:'D',  bpm:132, emoji:'🎻', tags:['waltz','3/4'],        difficulty:'Intermediate' },
  ];

  /* ─── INIT ──────────────────────────────────────────────── */
  function init() {
    _renderInstruments();
    _renderTracks(TRACKS);
    _loadHeroStats();
    _updateDailyGoalBar();
    _renderHistory();
    document.addEventListener('keydown', _handleKeyboard);
    _animatePendulum();

    // Fade-in observer
    const style = document.createElement('style');
    style.textContent = '.pm-vis{opacity:1!important;transform:none!important}';
    document.head.appendChild(style);
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('pm-vis'); obs.unobserve(e.target); } });
    }, { threshold: 0.06 });
    setTimeout(() => {
      document.querySelectorAll('.pm-instr-card,.pm-lesson-card-item,.pm-track-card,.pm-arena-card,.pm-session-item').forEach((el, i) => {
        el.style.cssText += `opacity:0;transform:translateY(18px);transition:opacity .42s ease ${i*0.04}s,transform .42s ease ${i*0.04}s`;
        obs.observe(el);
      });
    }, 150);
  }

  /* ─── RENDER INSTRUMENTS ───────────────────────────────── */
  function _renderInstruments() {
    const el = document.getElementById('instrumentShowcase');
    if (!el) return;
    el.innerHTML = INSTRUMENTS.map(i => `
      <div class="pm-instr-card" data-id="${i.id}" style="--instr-color:${i.color}" onclick="PracticeMode.selectInstrument('${i.id}')">
        <div class="pm-instr-glow" style="background:${i.color}"></div>
        <div class="pm-instr-emoji">${i.emoji}</div>
        <div class="pm-instr-name">${i.name}</div>
        <div class="pm-instr-sub">${i.sub}</div>
        <div class="pm-instr-tag">${i.tags}</div>
      </div>
    `).join('');
  }

  /* ─── SELECT INSTRUMENT ─────────────────────────────────── */
  function selectInstrument(id) {
    state.instrument = id;
    const inst = INSTRUMENTS.find(i => i.id === id);
    if (!inst) return;

    document.querySelectorAll('.pm-instr-card').forEach(c => c.classList.remove('pm-instr-selected'));
    document.querySelector(`.pm-instr-card[data-id="${id}"]`)?.classList.add('pm-instr-selected');

    _setText('lessonSectionTitle', `${inst.emoji} ${inst.name} Lessons`);
    _setText('lessonSectionSub', `Choose a ${inst.name.toLowerCase()} lesson to practice today`);

    _renderLessons(id);

    const sec = document.getElementById('lessonSection');
    if (sec) {
      sec.classList.add('pm-unlocked');
      setTimeout(() => sec.scrollIntoView({ behavior:'smooth', block:'start' }), 250);
    }
    _showXpToast(`${inst.emoji} ${inst.name} selected!`);
  }

  /* ─── RENDER LESSONS ────────────────────────────────────── */
  function _renderLessons(instrId, diffFilter = 'all') {
    const grid = document.getElementById('lessonsGrid');
    if (!grid) return;
    const lessons = LESSONS[instrId] || [];
    const list = diffFilter === 'all' ? lessons : lessons.filter(l => l.diff === diffFilter);

    grid.innerHTML = list.map(lesson => {
      const passed = state.lessonPassedIds.includes(lesson.id);
      return `
        <div class="pm-lesson-card-item${passed ? ' pm-lesson-completed' : ''}" data-id="${lesson.id}" style="--lesson-color:${lesson.color}" onclick="PracticeMode.selectLesson('${lesson.id}')">
          <div class="pm-lci-header">
            <div class="pm-lci-icon">${lesson.icon}</div>
            <div class="pm-lci-badges">
              <span class="pm-lci-diff diff-${lesson.diff.toLowerCase()}">${lesson.diff}</span>
              <span class="pm-lci-xp">+${lesson.xp} XP</span>
              ${passed ? '<span class="pm-lci-completed-badge">✓ Passed</span>' : ''}
            </div>
          </div>
          <div class="pm-lci-body">
            <div class="pm-lci-title">${lesson.title}</div>
            <div class="pm-lci-desc">${lesson.desc}</div>
          </div>
          <div class="pm-lci-footer">
            <div class="pm-lci-meta">
              <span>⏱ ${lesson.dur}</span>
              <span>📋 ${lesson.steps.length} steps</span>
            </div>
            <div class="pm-lci-cta">
              ${passed ? 'Redo' : 'Start'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M9 18l6-6-6-6"/></svg>
            </div>
          </div>
        </div>`;
    }).join('');
  }

  function filterLessons(diff, btn) {
    document.querySelectorAll('.pm-lf-btn').forEach(b => b.classList.remove('pm-lf-active'));
    if (btn) btn.classList.add('pm-lf-active');
    if (state.instrument) _renderLessons(state.instrument, diff);
  }

  /* ─── SELECT LESSON ─────────────────────────────────────── */
  function selectLesson(lessonId) {
    const inst = INSTRUMENTS.find(i => i.id === state.instrument);
    const lesson = (LESSONS[state.instrument] || []).find(l => l.id === lessonId);
    if (!lesson || !inst) return;

    state.currentLesson = lesson;
    state.currentStepIndex = 0;
    state.lessonScore = { correct: 0, total: 0 };
    state.lessonStartTime = Date.now();

    document.querySelectorAll('.pm-lesson-card-item').forEach(c => c.classList.remove('pm-lesson-selected'));
    document.querySelector(`.pm-lesson-card-item[data-id="${lessonId}"]`)?.classList.add('pm-lesson-selected');

    _setText('arenaInstrTag', `${inst.emoji} ${inst.name}`);
    _setText('arenaLessonTitle', lesson.title);
    const diffBadge = document.getElementById('arenaLessonDiff');
    if (diffBadge) { diffBadge.textContent = lesson.diff; diffBadge.className = `pm-lesson-diff-badge diff-${lesson.diff.toLowerCase()}`; }
    _setText('arenaLessonXP', `+${lesson.xp} XP`);
    _setText('arenaLessonDur', lesson.dur);

    _buildStepTrack();
    _renderStep(0);

    const arena = document.getElementById('arenaSection');
    if (arena) {
      arena.classList.add('pm-unlocked');
      setTimeout(() => arena.scrollIntoView({ behavior:'smooth', block:'start' }), 250);
    }
    _showXpToast(`📖 ${lesson.title} — let\'s go!`);
  }

  /* ─── STEP TRACK ────────────────────────────────────────── */
  function _buildStepTrack() {
    const track = document.getElementById('stepTrack');
    if (!track || !state.currentLesson) return;
    track.innerHTML = '';
    state.currentLesson.steps.forEach((step, i) => {
      if (i > 0) {
        const conn = document.createElement('div');
        conn.className = 'pm-step-connector'; conn.id = `conn${i}`;
        track.appendChild(conn);
      }
      const dot = document.createElement('div');
      dot.className = `pm-step-dot${step.type === 'exercise' ? ' pm-step-exercise' : ''}`;
      dot.id = `stepdot${i}`;
      dot.innerHTML = `<span class="pm-step-num">${i + 1}</span>`;
      dot.title = step.title;
      dot.onclick = () => { if (i <= state.currentStepIndex) _renderStep(i); };
      track.appendChild(dot);
    });
    _updateStepTrack();
  }

  function _updateStepTrack() {
    const steps = state.currentLesson?.steps || [];
    steps.forEach((_, i) => {
      const dot = document.getElementById(`stepdot${i}`);
      const conn = document.getElementById(`conn${i}`);
      if (!dot) return;
      const isExercise = steps[i].type === 'exercise';
      dot.className = `pm-step-dot${isExercise ? ' pm-step-exercise' : ''}`;
      if (i < state.currentStepIndex) dot.classList.add('pm-step-done');
      else if (i === state.currentStepIndex) dot.classList.add('pm-step-active');
      if (conn) conn.classList.toggle('pm-conn-done', i <= state.currentStepIndex);
    });

    const total = steps.length;
    const pct = total > 0 ? Math.round((state.currentStepIndex / total) * 100) : 0;
    const ring = document.getElementById('lessonProgressRing');
    if (ring) ring.style.strokeDashoffset = 150.8 - (150.8 * pct / 100);
    _setText('lessonRingPct', `${pct}%`);
  }

  /* ─── RENDER STEP ───────────────────────────────────────── */
  function _renderStep(index) {
    if (!state.currentLesson) return;
    const steps = state.currentLesson.steps;
    if (index < 0 || index >= steps.length) return;
    state.currentStepIndex = index;

    const step = steps[index];
    _setText('stepNumBadge', `Step ${index + 1} of ${steps.length}`);
    _setText('stepTypeTag', { learn:'📖 Learn', visual:'👁 Visual', exercise:'✏️ Exercise' }[step.type] || step.type);
    _setText('stepTitle', step.title);
    _setText('stepDesc', step.desc || '');

    // Clear dynamic content
    const visualAid = document.getElementById('visualAid');
    const exerciseArea = document.getElementById('exerciseArea');
    if (visualAid) { visualAid.style.display = 'none'; visualAid.innerHTML = ''; }
    if (exerciseArea) { exerciseArea.style.display = 'none'; exerciseArea.innerHTML = ''; }
    document.getElementById('stepTipBox')?.remove();
    document.getElementById('stepFeedback')?.remove();

    // Tip
    if (step.tip) {
      const tip = document.createElement('div');
      tip.id = 'stepTipBox'; tip.className = 'pm-tip-box';
      tip.innerHTML = `<span class="pm-tip-icon">${step.tip.icon}</span><div class="pm-tip-text">${step.tip.text}</div>`;
      document.querySelector('.pm-step-body')?.appendChild(tip);
    }

    // Visual
    if ((step.type === 'visual') && step.visual && visualAid) {
      visualAid.style.display = 'block';
      _renderVisual(step.visual, visualAid);
    }

    // Exercise
    if (step.type === 'exercise' && exerciseArea) {
      exerciseArea.style.display = 'block';
      _renderExercise(step, exerciseArea);
    }

    // Navigation
    const prevBtn = document.getElementById('prevStepBtn');
    const nextBtn = document.getElementById('nextStepBtn');
    if (prevBtn) prevBtn.disabled = index === 0;
    if (nextBtn) {
      const isLast = index === steps.length - 1;
      nextBtn.className = `pm-btn-next${isLast ? ' pm-btn-complete' : ''}`;
      nextBtn.innerHTML = isLast
        ? 'Complete Lesson <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M20 6L9 17l-5-5"/></svg>'
        : 'Next Step <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><path d="M9 18l6-6-6-6"/></svg>';
      nextBtn.disabled = step.type === 'exercise';
    }

    _updateStepTrack();
  }

  /* ─── RENDER VISUAL ─────────────────────────────────────── */
  function _renderVisual(visual, container) {
    if (visual.type === 'chord') {
      const rows = visual.frets || [];
      let html = `<div class="pm-chord-diagram"><div class="pm-chord-name">${visual.name}</div><div>`;
      // String labels
      if (visual.labels) {
        html += `<div class="pm-chord-strings-row">${visual.labels.map(l => `<span class="pm-string-label">${l}</span>`).join('')}</div>`;
      }
      html += '<div class="pm-chord-frets">';
      rows.forEach((row, fretIdx) => {
        html += `<div class="pm-chord-fret-row"><span class="pm-fret-num">${fretIdx + 1}</span><div class="pm-fret-dots">`;
        row.forEach((pressed, strIdx) => {
          const isOpen = visual.open && visual.open[strIdx] && fretIdx === 0;
          const isMuted = visual.muted && visual.muted[strIdx] && fretIdx === 0;
          if (pressed) html += `<div class="pm-fret-dot pm-dot-pressed">●</div>`;
          else if (isOpen) html += `<div class="pm-fret-dot pm-dot-open">○</div>`;
          else if (isMuted) html += `<div class="pm-fret-dot pm-dot-muted">×</div>`;
          else html += `<div class="pm-fret-dot"></div>`;
        });
        html += '</div></div>';
      });
      html += '</div></div></div>';
      container.innerHTML = html;

    } else if (visual.type === 'piano') {
      const whiteKeys = ['C','D','E','F','G','A','B'];
      const blackMap = { C:'C#', D:'D#', F:'F#', G:'G#', A:'A#' };
      const oct = visual.octave || 4;
      const hl = visual.highlight || [];
      const root = visual.root || '';

      let whites = '';
      let blacks = '';
      whiteKeys.forEach((k, i) => {
        const note = `${k}${oct}`;
        const isRoot = note === root;
        const isHL = hl.includes(note);
        whites += `<div class="pm-key-white${isRoot ? ' pm-key-highlight' : isHL ? ' pm-key-active' : ''}" title="${note}"></div>`;
        if (blackMap[k]) {
          const bn = `${blackMap[k]}${oct}`;
          const bHL = hl.includes(bn);
          const left = 20 + i * 32 - 10;
          blacks += `<div class="pm-key-black${bHL ? ' pm-key-highlight' : ''}" style="left:${left}px" title="${bn}"></div>`;
        }
      });
      container.innerHTML = `
        <div class="pm-piano-wrap">
          <div class="pm-piano-keys-wrap" style="width:${7*32}px;position:relative;">
            ${whites}${blacks}
          </div>
          <div class="pm-piano-label">${hl.map(n=>`<strong style="color:#34d399">${n}</strong>`).join(' · ')}</div>
        </div>`;

    } else if (visual.type === 'scale') {
      container.innerHTML = `
        <div class="pm-scale-display">
          <div class="pm-scale-title">${visual.name}</div>
          <div class="pm-scale-notes">
            ${(visual.notes || []).map((note, i) => `
              <div class="pm-scale-note-wrap">
                <div class="pm-scale-note ${note === visual.root ? 'pm-note-root' : 'pm-note-active'}">${note}</div>
                <div class="pm-scale-interval">${(visual.intervals || [])[i] || ''}</div>
              </div>`).join('')}
          </div>
        </div>`;
    }
  }

  /* ─── RENDER EXERCISE ───────────────────────────────────── */
  function _renderExercise(step, container) {
    if (step.exerciseType === 'mc') _renderMC(step, container);
    else if (step.exerciseType === 'sequence') _renderSequence(step, container);
    else if (step.exerciseType === 'rhythm') _renderRhythm(step, container);
  }

  /* Multiple Choice */
  function _renderMC(step, container) {
    const wrap = document.createElement('div');
    wrap.className = 'pm-mc-exercise';
    wrap.innerHTML = `
      <div class="pm-mc-question">${step.question}</div>
      <div class="pm-mc-choices">
        ${step.choices.map((c, i) => `
          <button class="pm-mc-choice" data-idx="${i}">
            <span class="pm-mc-choice-letter">${'ABCD'[i]}</span>${c}
          </button>`).join('')}
      </div>`;
    container.appendChild(wrap);

    wrap.querySelectorAll('.pm-mc-choice').forEach(btn => {
      btn.onclick = () => {
        const chosen = parseInt(btn.dataset.idx);
        wrap.querySelectorAll('.pm-mc-choice').forEach(b => {
          b.classList.add('pm-mc-disabled');
          const idx = parseInt(b.dataset.idx);
          if (idx === step.correct) b.classList.add('pm-mc-correct');
          else if (idx === chosen) b.classList.add('pm-mc-wrong');
        });
        const isCorrect = chosen === step.correct;
        state.lessonScore.total++;
        if (isCorrect) state.lessonScore.correct++;

        const fb = document.createElement('div');
        fb.className = `pm-feedback-box ${isCorrect ? 'pm-feedback-correct' : 'pm-feedback-wrong'}`;
        fb.innerHTML = `${isCorrect ? '✅ Correct!' : '❌ Not quite.'}<br><span style="font-weight:400;font-size:0.82rem">${step.explanation}</span>`;
        wrap.appendChild(fb);
        _enableNext();
        if (isCorrect) _showXpToast('✅ Correct!');
      };
    });
  }

  /* Note Sequence */
  function _renderSequence(step, container) {
    const wrap = document.createElement('div');
    wrap.className = 'pm-seq-exercise';

    // Target row
    const targetHtml = step.notes.map((n, i) =>
      `${i > 0 ? '<span class="pm-seq-arrow">→</span>' : ''}<div class="pm-seq-note" id="seqn${i}">${n}</div>`
    ).join('');
    wrap.innerHTML = `
      <div class="pm-seq-title">${step.desc || 'Tap each note in order'}</div>
      <div class="pm-seq-target">${targetHtml}</div>
      <div class="pm-seq-title" style="margin-top:14px">Tap in order:</div>
      <div class="pm-seq-tap-row" id="seqBtnRow"></div>`;
    container.appendChild(wrap);

    let idx = 0;
    const shuffled = [...step.notes].sort(() => Math.random() - 0.5);
    const btnRow = wrap.querySelector('#seqBtnRow');

    shuffled.forEach(note => {
      const btn = document.createElement('button');
      btn.className = 'pm-seq-tap-btn'; btn.textContent = note;
      btn.onclick = () => {
        if (idx >= step.notes.length) return;
        const noteEl = document.getElementById(`seqn${idx}`);
        if (note === step.notes[idx]) {
          noteEl?.classList.add('pm-seq-correct');
          _showXpToast(`✅ ${note}`);
          idx++;
          if (idx === step.notes.length) {
            state.lessonScore.correct++; state.lessonScore.total++;
            const fb = document.createElement('div');
            fb.className = 'pm-feedback-box pm-feedback-correct';
            fb.textContent = '🎉 Perfect sequence!';
            wrap.appendChild(fb);
            _enableNext();
          }
        } else {
          noteEl?.classList.add('pm-seq-wrong');
          setTimeout(() => noteEl?.classList.remove('pm-seq-wrong'), 500);
          state.lessonScore.total++;
        }
      };
      btnRow.appendChild(btn);
    });

    // Auto-enable next after 8s if student is stuck
    setTimeout(() => _enableNext(), 8000);
  }

  /* Rhythm Exercise */
  function _renderRhythm(step, container) {
    const wrap = document.createElement('div');
    wrap.className = 'pm-rhythm-exercise';
    const beatHtml = (step.pattern || []).map((b, i) =>
      `<div class="pm-rhythm-beat ${b ? (i === 0 ? 'pm-beat-accent' : 'pm-beat-on') : ''}" id="rbeat${i}">${b ? (i === 0 ? '⬛' : '◾') : '·'}</div>`
    ).join('');
    wrap.innerHTML = `
      <div class="pm-rhythm-desc">${step.desc || 'Tap the rhythm pattern'}</div>
      <div class="pm-rhythm-pattern">${beatHtml}</div>
      <div class="pm-rhythm-controls">
        <button class="pm-rhythm-play-btn" id="rhythmPlayBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Play Pattern
        </button>
        <span class="pm-rhythm-count" id="rhythmCount">${step.reps || 2} reps at ${step.tempo || 80} BPM</span>
      </div>`;
    container.appendChild(wrap);

    let running = false, beatIdx = 0, repsDone = 0;
    let interval = null;
    const maxReps = step.reps || 2;
    const pattern = step.pattern || [];
    const ms = (60000 / (step.tempo || 80)) / (pattern.length > 4 ? 2 : 1);
    const countEl = wrap.querySelector('#rhythmCount');
    const playBtn = wrap.querySelector('#rhythmPlayBtn');

    playBtn.onclick = () => {
      _initAudio();
      if (running) {
        clearInterval(interval); running = false; beatIdx = 0; repsDone = 0;
        wrap.querySelectorAll('.pm-rhythm-beat').forEach(b => b.classList.remove('pm-beat-lit'));
        playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play Pattern`;
        return;
      }
      running = true;
      playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Stop`;

      interval = setInterval(() => {
        wrap.querySelectorAll('.pm-rhythm-beat').forEach(b => b.classList.remove('pm-beat-lit'));
        wrap.querySelector(`#rbeat${beatIdx}`)?.classList.add('pm-beat-lit');
        if (pattern[beatIdx] && state.audioCtx) _playClick(state.audioCtx, beatIdx === 0);
        beatIdx = (beatIdx + 1) % pattern.length;
        if (beatIdx === 0) {
          repsDone++;
          countEl.textContent = `Rep ${repsDone}/${maxReps}`;
          if (repsDone >= maxReps) {
            clearInterval(interval); running = false;
            wrap.querySelectorAll('.pm-rhythm-beat').forEach(b => b.classList.remove('pm-beat-lit'));
            playBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play Again`;
            state.lessonScore.correct++; state.lessonScore.total++;
            const fb = document.createElement('div');
            fb.className = 'pm-feedback-box pm-feedback-correct';
            fb.textContent = '🎉 Rhythm complete! Great work!';
            wrap.appendChild(fb);
            _enableNext();
          }
        }
      }, ms);
    };

    // Auto-enable after 12s
    setTimeout(() => _enableNext(), 12000);
  }

  function _playClick(ctx, isAccent) {
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(state.volume * (isAccent ? 0.9 : 0.55), ctx.currentTime + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.07);
    const osc = ctx.createOscillator();
    osc.connect(gain); osc.type = 'square';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 880, ctx.currentTime);
    osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.09);
  }

  function _enableNext() {
    const btn = document.getElementById('nextStepBtn');
    if (btn) btn.disabled = false;
  }

  /* ─── STEP NAVIGATION ───────────────────────────────────── */
  function nextStep() {
    if (!state.currentLesson) return;
    const steps = state.currentLesson.steps;
    if (state.currentStepIndex < steps.length - 1) {
      _renderStep(state.currentStepIndex + 1);
    } else {
      _completeLesson();
    }
  }

  function prevStep() {
    if (state.currentStepIndex > 0) _renderStep(state.currentStepIndex - 1);
  }

  /* ─── COMPLETE LESSON ───────────────────────────────────── */
  function _completeLesson() {
    if (!state.currentLesson) return;
    const lesson = state.currentLesson;
    const elapsed = Date.now() - (state.lessonStartTime || Date.now());
    const minutes = Math.max(1, Math.floor(elapsed / 60000));
    const { correct, total } = state.lessonScore;
    const score = total > 0 ? Math.round((correct / total) * 100) : 100;
    const passed = score >= 60;
    const xpEarned = passed ? lesson.xp : Math.max(10, Math.round(lesson.xp * score / 100));

    // Save
    let dbResult = { leveled: false, newLevel: 1 };
    try {
      dbResult = HarmoniaDB.addXP(xpEarned, `Lesson: ${lesson.title}`) || dbResult;
      HarmoniaDB.checkAndUpdateStreak?.();
      HarmoniaDB.completeLesson?.(lesson.id, lesson.title);
    } catch(e) {}

    if (passed && !state.lessonPassedIds.includes(lesson.id)) {
      state.lessonPassedIds.push(lesson.id);
      _savePassedIds();
    }

    _renderLessons(state.instrument);
    _showLessonModal(lesson, score, passed, minutes, xpEarned, correct, total);
    _loadHeroStats();

    if (dbResult.leveled) setTimeout(() => _showLevelUp(dbResult.newLevel), 2000);
  }

  function _showLessonModal(lesson, score, passed, minutes, xp, correct, total) {
    const modal = document.getElementById('lessonCompleteModal');
    if (!modal) return;

    _setText('lessonModalSub', passed
      ? `You passed "${lesson.title}" with ${score}%! 🎉`
      : `Keep practicing! You scored ${score}% — try again to earn full XP.`);

    setTimeout(() => {
      const ring = document.getElementById('lessonScoreRing');
      if (ring) {
        const pct = score / 100;
        ring.style.strokeDashoffset = 314.16 * (1 - pct);
        ring.setAttribute('stroke', score >= 80 ? '#10b981' : score >= 60 ? '#fbbf24' : '#ef4444');
      }
    }, 150);

    _setText('lessonScoreNum', `${score}%`);
    _setText('lmDuration', `${minutes} min`);
    _setText('lmXP', `+${xp} XP`);
    _setText('lmSteps', `${lesson.steps.length}/${lesson.steps.length}`);
    _setText('lmExercises', `${correct}/${total}`);

    const achContainer = document.getElementById('lessonAchievements');
    if (achContainer) {
      achContainer.innerHTML = passed
        ? `<div class="pm-ach-earned">🎓 ${lesson.title} Passed — +${xp} XP</div>`
        : `<div class="pm-ach-earned" style="color:#fbbf24;border-color:rgba(234,179,8,0.2)">💪 +${xp} XP for your effort!</div>`;
    }

    if (passed) _spawnConfetti(document.getElementById('modalConfetti'));
    modal.classList.remove('pm-hidden');
  }

  function closeLessonModal() {
    document.getElementById('lessonCompleteModal')?.classList.add('pm-hidden');
    if (state.currentLesson && state.instrument) {
      const lessons = LESSONS[state.instrument] || [];
      const idx = lessons.findIndex(l => l.id === state.currentLesson.id);
      if (idx >= 0 && idx + 1 < lessons.length) {
        selectLesson(lessons[idx + 1].id);
        _showXpToast('➡️ On to the next lesson!');
      }
    }
  }

  /* ─── CONFETTI ──────────────────────────────────────────── */
  function _spawnConfetti(container) {
    if (!container) return;
    container.innerHTML = '';
    const colors = ['#10b981','#fbbf24','#a78bfa','#ec4899','#38bdf8','#f97316'];
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('div');
      el.className = 'pm-confetti-piece';
      el.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*60}%;background:${colors[Math.floor(Math.random()*colors.length)]};animation-delay:${Math.random()*0.8}s;animation-duration:${1+Math.random()}s;width:${6+Math.random()*8}px;height:${6+Math.random()*8}px;transform:rotate(${Math.random()*360}deg)`;
      container.appendChild(el);
      setTimeout(() => el.remove(), 2500);
    }
  }

  /* ─── SESSION TIMER ─────────────────────────────────────── */
  function startSession() {
    if (state.sessionActive && !state.sessionPaused) return;
    if (state.sessionPaused) {
      state.sessionPausedTotal += Date.now() - state.sessionPausedAt;
      state.sessionPaused = false;
      _setText('timerLabel', 'Session running…');
      document.getElementById('pauseBtn').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Pause`;
    } else {
      state.sessionActive = true; state.sessionPaused = false;
      state.sessionStartTime = Date.now(); state.sessionPausedTotal = 0; state.sessionSeconds = 0;
      _setText('timerLabel', state.currentLesson ? state.currentLesson.title : 'Session running…');
    }
    document.getElementById('startBtn').classList.add('pm-hidden');
    document.getElementById('pauseBtn').classList.remove('pm-hidden');
    document.getElementById('stopBtn').classList.remove('pm-hidden');
    state.sessionInterval = setInterval(_sessionTick, 200);
    _showXpToast('▶ Session started!');
  }

  function pauseSession() {
    if (!state.sessionActive || state.sessionPaused) return;
    state.sessionPaused = true; state.sessionPausedAt = Date.now();
    clearInterval(state.sessionInterval);
    _setText('timerLabel', 'Paused');
    document.getElementById('pauseBtn').innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg> Resume`;
  }

  function stopSession() {
    if (!state.sessionActive) return;
    clearInterval(state.sessionInterval);
    const elapsed = state.sessionSeconds;
    const minutes = Math.max(1, Math.floor(elapsed / 60));
    state.sessionActive = false; state.sessionPaused = false;

    document.getElementById('startBtn').classList.remove('pm-hidden');
    document.getElementById('pauseBtn').classList.add('pm-hidden');
    document.getElementById('stopBtn').classList.add('pm-hidden');
    _setText('timerDisplay', '00:00:00');
    _setText('sessionXPLive', '+0 XP');
    _setText('timerLabel', 'Ready to start');

    const notes = document.getElementById('sessionNotes')?.value.trim() || '';
    const inst = INSTRUMENTS.find(i => i.id === state.instrument);

    try {
      HarmoniaDB.savePracticeSession({
        instrument: inst?.name || 'Practice',
        focus: state.currentLesson?.title || 'Free Practice',
        key: 'C', difficulty: state.currentLesson?.diff || 'Intermediate',
        bpm: state.bpm, durationMinutes: minutes, durationSeconds: elapsed,
        notes, goalMinutes: state.dailyGoalMinutes,
      });
    } catch(e) {}

    _showSessionModal(minutes, elapsed, minutes, notes, inst);
    _updateDailyGoalBar(); _renderHistory(); _loadHeroStats();
    if (document.getElementById('sessionNotes')) document.getElementById('sessionNotes').value = '';
  }

  function _sessionTick() {
    const elapsed = Math.floor((Date.now() - state.sessionStartTime - state.sessionPausedTotal) / 1000);
    state.sessionSeconds = elapsed;
    const h = Math.floor(elapsed/3600), m = Math.floor((elapsed%3600)/60), s = elapsed%60;
    _setText('timerDisplay', `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
    _setText('sessionXPLive', `+${Math.floor(elapsed/60)} XP`);
    const todayMin = _getTodayMinutes() + Math.floor(elapsed/60);
    const pct = state.dailyGoalMinutes > 0 ? Math.min(100, Math.round((todayMin/state.dailyGoalMinutes)*100)) : 100;
    const sgFill = document.getElementById('sgFill');
    if (sgFill) sgFill.style.width = pct + '%';
    _setText('sgText', `${todayMin} / ${state.dailyGoalMinutes} min`);
  }

  function _showSessionModal(minutes, elapsed, xpEarned, notes, inst) {
    const modal = document.getElementById('sessionModal');
    if (!modal) return;
    const msgs = ['Great start!','Solid session! Keep going.','Great work! Real skills build here.','Outstanding dedication! 🔥'];
    _setText('modalSubtitle', msgs[Math.min(3, Math.floor(minutes/10))]);
    _setText('modalDuration', `${minutes} min`);
    _setText('modalXP', `+${xpEarned} XP`);
    _setText('modalBPM', state.bpm);
    _setText('modalInstrument', inst?.name || 'Practice');
    _setText('modalFocus', state.currentLesson?.title || 'Free Practice');
    _setText('modalLesson', inst?.emoji || '🎸');
    const icon = document.getElementById('sessionModalIcon');
    if (icon) icon.textContent = inst?.emoji || '🎸';
    const notesWrap = document.getElementById('modalNotesWrap');
    if (notes) { _setText('modalNotes', notes); notesWrap?.classList.remove('pm-hidden'); }
    else notesWrap?.classList.add('pm-hidden');
    modal.classList.remove('pm-hidden');
  }

  function closeModal() { document.getElementById('sessionModal')?.classList.add('pm-hidden'); }

  /* ─── METRONOME ─────────────────────────────────────────── */
  function _initAudio() {
    if (!state.audioCtx) state.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (state.audioCtx.state === 'suspended') state.audioCtx.resume();
  }

  function _scheduleMetroClick(time, isAccent) {
    const ctx = state.audioCtx;
    const gain = ctx.createGain();
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(state.volume * (isAccent ? 1 : 0.6), time + 0.002);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.06);
    const osc = ctx.createOscillator();
    osc.connect(gain); osc.type = 'square';
    osc.frequency.setValueAtTime(isAccent ? 1200 : 900, time);
    osc.start(time); osc.stop(time + 0.08);
    const delay = Math.max(0, (time - ctx.currentTime) * 1000);
    const beat = state.currentBeat;
    setTimeout(() => _flashBeat(beat, isAccent), delay);
  }

  function _metroScheduler() {
    const ctx = state.audioCtx;
    const spb = 60 / state.bpm;
    while (state.nextBeatTime < ctx.currentTime + 0.1) {
      const isAccent = state.accentOn && state.currentBeat === 0;
      _scheduleMetroClick(state.nextBeatTime, isAccent);
      state.currentBeat = (state.currentBeat + 1) % state.beatsPerMeasure;
      state.nextBeatTime += spb;
    }
  }

  function _flashBeat(beat, isAccent) {
    const leds = document.getElementById('beatLeds');
    if (!leds) return;
    leds.querySelectorAll('.pm-led').forEach(l => l.classList.remove('pm-led-beat','pm-led-accent'));
    const led = document.getElementById(`led${beat}`);
    if (led) led.classList.add(isAccent ? 'pm-led-accent' : 'pm-led-beat');
    setTimeout(() => led?.classList.remove('pm-led-beat','pm-led-accent'), 120);
    const flash = document.getElementById('pmFlash');
    if (flash) {
      flash.style.background = isAccent ? 'rgba(16,185,129,0.06)' : 'rgba(16,185,129,0.03)';
      flash.classList.add('pm-flashing');
      setTimeout(() => flash.classList.remove('pm-flashing'), 60);
    }
  }

  let _pendAngle = 0, _pendDir = 1, _pendLast = 0;
  function _animatePendulum() {
    const rod = document.getElementById('pendulumRod');
    if (rod) {
      if (state.metroRunning) {
        const now = performance.now();
        const dt = now - _pendLast; _pendLast = now;
        _pendAngle += (state.bpm / 60) * 0.12 * dt * _pendDir;
        if (_pendAngle > 28) { _pendAngle = 28; _pendDir = -1; }
        if (_pendAngle < -28) { _pendAngle = -28; _pendDir = 1; }
        rod.style.transform = `rotate(${_pendAngle}deg)`;
      } else {
        _pendAngle *= 0.85;
        rod.style.transform = `rotate(${_pendAngle}deg)`;
      }
    }
    requestAnimationFrame(_animatePendulum);
  }

  function toggleMetronome() { state.metroRunning ? _stopMetronome() : _startMetronome(); }

  function _startMetronome() {
    _initAudio();
    state.metroRunning = true; state.currentBeat = 0;
    state.nextBeatTime = state.audioCtx.currentTime + 0.05;
    state.metroScheduler = setInterval(_metroScheduler, 25);
    _pendDir = 1;
    _updateMetroUI(true); _updateBeatLEDs();
  }

  function _stopMetronome() {
    state.metroRunning = false;
    clearInterval(state.metroScheduler);
    _updateMetroUI(false);
    document.querySelectorAll('.pm-led').forEach(l => l.classList.remove('pm-led-beat','pm-led-accent'));
  }

  function _updateMetroUI(on) {
    const btn = document.getElementById('metroPlayBtn');
    const card = document.querySelector('.pm-metro-card');
    const status = document.getElementById('metroStatus');
    if (btn) btn.innerHTML = on
      ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Stop Metronome`
      : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16"><polygon points="5 3 19 12 5 21 5 3"/></svg> Start Metronome`;
    if (card) card.classList.toggle('pm-metro-running', on);
    if (status) status.innerHTML = on
      ? `<span class="pm-status-dot"></span> Running — ${state.bpm} BPM`
      : `<span class="pm-status-dot"></span> Off`;
  }

  function setBPM(val) {
    val = Math.max(20, Math.min(300, val));
    state.bpm = val;
    _setText('bpmValue', val);
    const slider = document.getElementById('bpmSlider');
    if (slider) slider.value = val;
    if (state.metroRunning) {
      const s = document.getElementById('metroStatus');
      if (s) s.innerHTML = `<span class="pm-status-dot"></span> Running — ${val} BPM`;
    }
  }

  function changeBPM(delta) { setBPM(state.bpm + delta); }

  function setTimeSignature(beats, btn) {
    state.beatsPerMeasure = beats; state.currentBeat = 0;
    document.querySelectorAll('.pm-ts-btn').forEach(b => b.classList.remove('pm-ts-active'));
    if (btn) btn.classList.add('pm-ts-active');
    _updateBeatLEDs();
    if (state.metroRunning) { _stopMetronome(); setTimeout(_startMetronome, 50); }
  }

  function setVolume(val) { state.volume = val / 100; }

  function tapTempo() {
    const now = Date.now();
    state.tapTimes.push(now);
    state.tapTimes = state.tapTimes.filter(t => t >= now - 3000);
    if (state.tapTimes.length < 2) return;
    const intervals = [];
    for (let i = 1; i < state.tapTimes.length; i++) intervals.push(state.tapTimes[i] - state.tapTimes[i-1]);
    setBPM(Math.round(60000 / (intervals.reduce((a,b) => a+b,0) / intervals.length)));
    if (state.metroRunning) { _stopMetronome(); setTimeout(_startMetronome, 30); }
  }

  function _updateBeatLEDs() {
    const container = document.getElementById('beatLeds');
    if (!container) return;
    container.innerHTML = '';
    for (let i = 0; i < Math.min(state.beatsPerMeasure, 6); i++) {
      const led = document.createElement('div');
      led.className = 'pm-led'; led.id = `led${i}`;
      container.appendChild(led);
    }
  }

  /* ─── BACKING TRACKS ────────────────────────────────────── */
  function _renderTracks(tracks) {
    const grid = document.getElementById('tracksGrid');
    if (!grid) return;
    grid.innerHTML = tracks.map(t => `
      <div class="pm-track-card" data-id="${t.id}" data-genre="${t.genre}">
        <div class="pm-track-top">
          <div class="pm-track-art">${t.emoji}</div>
          <div>
            <div class="pm-track-name">${t.name}</div>
            <div class="pm-track-meta">${t.genre} · Key of ${t.key}</div>
          </div>
        </div>
        <div class="pm-track-tags">
          ${t.tags.map(tag => `<span class="pm-track-tag">${tag}</span>`).join('')}
          <span class="pm-track-tag">${t.difficulty}</span>
        </div>
        <div class="pm-track-wave" id="wave-${t.id}">
          ${Array.from({length:8},(_,i) => `<span style="--i:${i}"></span>`).join('')}
        </div>
        <div class="pm-track-footer">
          <span class="pm-track-bpm">🎵 ${t.bpm} BPM</span>
          <button class="pm-track-play-btn" onclick="PracticeMode.toggleTrack(${t.id})">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            Play
          </button>
        </div>
      </div>`).join('');
  }

  function filterTracks(genre, btn) {
    state.activeTrackFilter = genre;
    document.querySelectorAll('.pm-tf-btn').forEach(b => b.classList.remove('pm-tf-active'));
    if (btn) btn.classList.add('pm-tf-active');
    _renderTracks(genre === 'all' ? TRACKS : TRACKS.filter(t => t.genre === genre));
  }

  function toggleTrack(id) {
    _initAudio();
    if (state.playingTrackId === id) { _stopTrack(); return; }
    _stopTrack();
    state.playingTrackId = id;
    const track = TRACKS.find(t => t.id === id);
    if (!track) return;
    _startTrackAudio(track);
    document.querySelector(`.pm-track-card[data-id="${id}"]`)?.classList.add('pm-track-playing');
    const btn = document.querySelector(`.pm-track-card[data-id="${id}"] .pm-track-play-btn`);
    if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg> Stop`;
    setBPM(track.bpm);
    _showXpToast(`🎵 Playing: ${track.name}`);
  }

  function _startTrackAudio(track) {
    const ctx = state.audioCtx;
    const noteFreqs = { 'C':261.63,'D':293.66,'E':329.63,'F':349.23,'G':392.00,'A':440.00,'B':493.88,'Bb':466.16,'Eb':311.13,'Am':220,'Em':164.81,'Dm':146.83 };
    const root = noteFreqs[track.key] || 261.63;
    const bps = 60 / track.bpm;
    const patterns = {
      Blues:[{t:0,f:root,d:0.8,v:0.5},{t:1,f:root*1.5,d:0.4,v:0.35},{t:2,f:root,d:0.6,v:0.45},{t:3,f:root*1.25,d:0.4,v:0.35}],
      Jazz:[{t:0,f:root,d:0.4,v:0.4},{t:0.5,f:root*1.5,d:0.3,v:0.3},{t:1.5,f:root*1.33,d:0.5,v:0.35},{t:3,f:root,d:0.8,v:0.4}],
      Rock:[{t:0,f:root*0.5,d:0.45,v:0.7},{t:1,f:root*0.5,d:0.45,v:0.55},{t:2,f:root*0.5,d:0.45,v:0.7},{t:3,f:root*0.5,d:0.45,v:0.55}],
      Latin:[{t:0,f:root,d:0.3,v:0.6},{t:0.75,f:root*0.67,d:0.25,v:0.45},{t:1.5,f:root,d:0.3,v:0.55},{t:3,f:root,d:0.5,v:0.55}],
      Classical:[{t:0,f:root,d:1,v:0.35},{t:1,f:root*1.5,d:0.8,v:0.3},{t:2,f:root*2,d:0.8,v:0.35},{t:3,f:root*1.5,d:0.9,v:0.3}],
    };
    const pattern = patterns[track.genre] || patterns.Blues;
    const measureDur = bps * 4;

    function schedule(startTime) {
      pattern.forEach(note => {
        const t = startTime + note.t * bps;
        const gain = ctx.createGain();
        gain.connect(ctx.destination);
        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(note.v * 0.22, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + note.d * bps);
        const osc = ctx.createOscillator();
        osc.type = 'triangle'; osc.frequency.setValueAtTime(note.f, t);
        osc.connect(gain); osc.start(t); osc.stop(t + note.d * bps + 0.05);
        state.trackOscillators.push(osc);
      });
      state._trackLoopId = setTimeout(() => {
        if (state.playingTrackId === track.id) schedule(startTime + measureDur);
      }, (measureDur - 0.1) * 1000);
    }
    schedule(ctx.currentTime + 0.05);
  }

  function _stopTrack() {
    if (state._trackLoopId) clearTimeout(state._trackLoopId);
    state.trackOscillators.forEach(o => { try { o.stop(); } catch(e){} });
    state.trackOscillators = [];
    if (state.playingTrackId) {
      document.querySelector(`.pm-track-card[data-id="${state.playingTrackId}"]`)?.classList.remove('pm-track-playing');
      const btn = document.querySelector(`.pm-track-card[data-id="${state.playingTrackId}"] .pm-track-play-btn`);
      if (btn) btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="13" height="13"><polygon points="5 3 19 12 5 21 5 3"/></svg> Play`;
    }
    state.playingTrackId = null;
  }

  /* ─── STATS & HISTORY ───────────────────────────────────── */
  function _loadHeroStats() {
    let snap, lp, p, streak, totalSess, totalMin;
    try {
      snap = HarmoniaDB.getSnapshot();
      lp = snap.levelInfo; p = snap.progress; streak = snap.streak;
      totalMin = p.practiceMode?.totalMinutes || 0;
      totalSess = HarmoniaDB.getPracticeSessions(200).length;
    } catch(e) {
      lp = { currentXP:0, level:1, title:'Beginner', earnedInLevel:0, neededInLevel:500, percent:0 };
      p = {}; streak = { current:0 }; totalSess = 0; totalMin = 0;
    }

    _setText('heroXP', `${(lp.currentXP || 0).toLocaleString()} XP`);
    _setText('heroLevel', `Level ${lp.level} — ${lp.title}`);
    _setText('heroXPNext', `${(lp.earnedInLevel || 0).toLocaleString()} / ${(lp.neededInLevel || 500).toLocaleString()} XP to Level ${lp.level + 1}`);
    setTimeout(() => { const b = document.getElementById('heroXPBar'); if (b) b.style.width = (lp.percent || 0) + '%'; }, 400);
    _setText('statSessions', totalSess);
    _setText('statLessons', state.lessonPassedIds.length);
    _setText('statStreak', (streak.current || 0) + '🔥');
    _setText('statTotalTime', _fmtMin(totalMin));
    _updateDailyGoalBar();
  }

  function _getTodayMinutes() {
    try {
      const today = new Date().toDateString();
      return HarmoniaDB.getPracticeSessions(200)
        .filter(s => s.timestamp && new Date(s.timestamp).toDateString() === today)
        .reduce((sum, s) => sum + (s.durationMinutes || 0), 0);
    } catch(e) { return 0; }
  }

  function _updateDailyGoalBar() {
    const todayMin = _getTodayMinutes();
    const goal = state.dailyGoalMinutes;
    const pct = goal > 0 ? Math.min(100, Math.round((todayMin/goal)*100)) : 100;
    const fill = document.getElementById('goalBarFill');
    if (fill) fill.style.width = pct + '%';
    _setText('goalBarPct', `${todayMin} / ${goal} min`);
    _setText('goalBarSub', pct >= 100 ? `🎉 Goal reached! ${todayMin} min today!` : `${goal - todayMin} more minutes to hit your daily goal!`);
    const sgFill = document.getElementById('sgFill');
    if (sgFill) sgFill.style.width = pct + '%';
    _setText('sgText', `${todayMin} / ${goal} min`);
  }

  function _renderHistory() {
    const list = document.getElementById('historyList');
    if (!list) return;
    let sessions = [], totalMin = 0, totalSess = 0;
    try {
      sessions = HarmoniaDB.getPracticeSessions(30);
      totalSess = HarmoniaDB.getPracticeSessions(200).length;
      totalMin = HarmoniaDB.getProgress()?.practiceMode?.totalMinutes || 0;
    } catch(e) {}

    const best = sessions.reduce((b, s) => Math.max(b, s.durationMinutes || 0), 0);
    _setText('hsTotalSessions', totalSess);
    _setText('hsTotalTime', _fmtMin(totalMin));
    _setText('hsLessonsPassed', state.lessonPassedIds.length);
    _setText('hsBestSession', _fmtMin(best));

    if (!sessions.length) {
      list.innerHTML = `<div class="pm-history-empty"><span>🎸</span><p>No sessions yet — pick an instrument above to get started!</p></div>`;
      return;
    }
    list.innerHTML = '';
    sessions.forEach(s => {
      const icon = INSTR_ICONS[(s.instrument || '').toLowerCase()] || '🎵';
      const dur = s.durationMinutes || 0;
      const el = document.createElement('div');
      el.className = 'pm-session-item';
      el.innerHTML = `
        <div class="pm-session-icon">${icon}</div>
        <div class="pm-session-info">
          <div class="pm-session-title">${s.instrument || 'Practice'} — ${s.focus || 'Session'}</div>
          <div class="pm-session-sub">${[s.key ? `Key ${s.key}` : null, s.bpm ? `${s.bpm} BPM` : null, s.difficulty].filter(Boolean).join(' · ')}</div>
          ${s.notes ? `<div class="pm-session-sub" style="font-style:italic;opacity:0.65;margin-top:3px">"${s.notes.substring(0,60)}${s.notes.length>60?'…':''}"</div>` : ''}
        </div>
        <div class="pm-session-stats">
          <div class="pm-session-dur">${_fmtMin(dur)}</div>
          <div class="pm-session-time">${_fmtTime(s.timestamp)}</div>
          <div class="pm-session-xp-tag">+${dur} XP</div>
        </div>`;
      list.appendChild(el);
    });
  }

  /* ─── LEVEL UP ──────────────────────────────────────────── */
  function _showLevelUp(level) {
    const overlay = document.getElementById('levelupOverlay');
    if (!overlay) return;
    _setText('levelupMsg', `You reached Level ${level}!`);
    try { _setText('levelupTitle', HarmoniaDB.LEVEL_TITLES[level - 1] || 'Master'); } catch(e) {}
    overlay.classList.remove('pm-hidden');
  }
  function closeLevelUp() { document.getElementById('levelupOverlay')?.classList.add('pm-hidden'); }

  /* ─── XP TOAST ──────────────────────────────────────────── */
  function _showXpToast(msg) {
    const toast = document.getElementById('pmXpToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('pm-toast-show');
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('pm-toast-show'), 2800);
  }

  /* ─── HELPERS ───────────────────────────────────────────── */
  function _setText(id, val) { const el = document.getElementById(id); if (el) el.textContent = val; }
  function _fmtMin(min) { if (min >= 60) return `${Math.floor(min/60)}h ${min%60}m`; return `${min} min`; }
  function _fmtTime(ts) {
    if (!ts) return '';
    const diff = Date.now() - ts;
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff/60000)} min ago`;
    if (diff < 86400000) return `${Math.floor(diff/3600000)} hr ago`;
    return new Date(ts).toLocaleDateString();
  }

  /* ─── KEYBOARD ──────────────────────────────────────────── */
  function _handleKeyboard(e) {
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
    switch (e.code) {
      case 'Space':
        e.preventDefault();
        if (!state.sessionActive) startSession();
        else if (state.sessionPaused) startSession();
        else pauseSession();
        break;
      case 'KeyM': e.preventDefault(); toggleMetronome(); break;
      case 'ArrowUp': e.preventDefault(); changeBPM(1); break;
      case 'ArrowDown': e.preventDefault(); changeBPM(-1); break;
      case 'ArrowRight': e.preventDefault(); if (state.currentLesson) { const btn = document.getElementById('nextStepBtn'); if (btn && !btn.disabled) nextStep(); } break;
      case 'KeyS': if (state.sessionActive) { e.preventDefault(); stopSession(); } break;
      case 'Escape': closeModal(); closeLevelUp(); closeLessonModal(); _stopTrack(); break;
    }
  }

  /* ─── PUBLIC API ────────────────────────────────────────── */
  return {
    init,
    selectInstrument, selectLesson, filterLessons,
    nextStep, prevStep,
    startSession, pauseSession, stopSession, closeModal,
    closeLessonModal, closeLevelUp,
    toggleMetronome, setBPM, changeBPM, setTimeSignature, setVolume, tapTempo,
    filterTracks, toggleTrack,
  };
})();

document.addEventListener('DOMContentLoaded', () => PracticeMode.init());
