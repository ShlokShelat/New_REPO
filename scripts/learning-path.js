/**
 * learning-path.js
 * Full controller for the Learning Path page.
 * Handles: module switching, lesson modal, exercises,
 * XP / level-up, confetti, progress bars, completion,
 * search, keyboard navigation, and HarmoniaDB sync.
 *
 * CHANGES (Module 1 only):
 *  l1-1  — real YouTube embed (Ted-Ed "What is Music?")
 *  l1-2  — real YouTube embed (How to Read Sheet Music)
 *  l1-3  — exercise-only layout, no video area
 */

/* ═══════════════════════════════════════════════════════
   DATA — 12 modules, each with lessons
   ═══════════════════════════════════════════════════════ */
const LP_DATA = [
  {
    id: 'mod-1',
    title: 'Music Fundamentals',
    description: 'The essential building blocks every musician must know.',
    icon: '🎵',
    level: 'Beginner',
    xp: 300,
    duration: '3.5 hrs',
    lessons: [
      {
        id: 'l1-1',
        title: 'What is Music? — An Introduction',
        subtitle: 'Sound, rhythm, and the art of organised noise',
        type: 'video',
        duration: '8 min',
        xp: 25,
        content: {
          /* ── REAL YOUTUBE EMBED ─────────────────────────────
             TED-Ed: "Music as a language" by Victor Wooten
             https://www.youtube.com/watch?v=3yRMbH36HRE
             A beautiful, accessible intro to what music really is.
          ─────────────────────────────────────────────────── */
          videoUrl: 'https://www.youtube.com/embed/3yRMbH36HRE?rel=0&modestbranding=1&color=white',
          videoLabel: 'TED-Ed: Music as a Language — Victor Wooten',
          desc: 'Music is the art of arranging sounds in time to produce a composition that expresses ideas or emotions. In this lesson we explore the four fundamental properties of musical sound: pitch, duration, dynamics, and timbre.',
          concepts: [
            { title: 'Pitch', body: 'How high or low a sound is, determined by its frequency in Hz.' },
            { title: 'Duration', body: 'How long a sound lasts, forming the basis of rhythm.' },
            { title: 'Dynamics', body: 'The volume of a sound — from pianissimo (very soft) to fortissimo (very loud).' },
            { title: 'Timbre', body: 'The tone colour that distinguishes one instrument from another at the same pitch.' },
          ],
          takeaways: [
            'Music has four core properties: pitch, duration, dynamics, timbre.',
            'Every sound you hear can be described by these properties.',
            'Understanding these unlocks the language of music.',
          ],
          exercise: {
            prompt: 'Which property of sound determines whether a note sounds "high" or "low"?',
            options: ['Duration', 'Pitch', 'Timbre', 'Dynamics'],
            correct: 1,
            explanation: 'Pitch describes how high or low a sound is and is determined by the frequency of the sound wave.',
          },
        },
      },
      {
        id: 'l1-2',
        title: 'Reading Music — The Staff & Clefs',
        subtitle: 'Navigate the grand staff, treble and bass clefs',
        type: 'video',
        duration: '12 min',
        xp: 25,
        content: {
          /* ── REAL YOUTUBE EMBED ─────────────────────────────
             musictheory.net — "The Staff, Clefs, and Ledger Lines"
             https://www.youtube.com/watch?v=OvXCYQhHs1Y
             The most-watched beginner sheet music reading lesson.
          ─────────────────────────────────────────────────── */
          videoUrl: 'https://www.youtube.com/embed/OvXCYQhHs1Y?rel=0&modestbranding=1&color=white',
          videoLabel: 'The Staff, Clefs & Ledger Lines — musictheory.net',
          desc: 'Western music is written on a staff — five horizontal lines. The clef placed at the beginning of the staff determines which pitches each line and space represents. The treble clef is used for higher-pitched instruments; the bass clef for lower ones.',
          notation: '𝄞 E G B D F  (Every Good Boy Does Fine)\n𝄢 G B D F A  (Good Boys Do Fine Always)',
          concepts: [
            { title: 'The Staff', body: 'Five lines and four spaces. Notes sit on lines or in spaces.' },
            { title: 'Treble Clef 𝄞', body: 'Also called the G clef — the curl wraps around the G line (second from bottom).' },
            { title: 'Bass Clef 𝄢', body: 'Also called the F clef — the two dots surround the F line (fourth from bottom).' },
            { title: 'Middle C', body: 'Written on a ledger line between the treble and bass staves.' },
          ],
          takeaways: [
            'The staff has 5 lines and 4 spaces.',
            'Treble clef = high notes; Bass clef = low notes.',
            'Mnemonics like "Every Good Boy Does Fine" help you memorise note positions.',
          ],
          exercise: {
            prompt: 'What does the treble clef indicate about the second line from the bottom of the staff?',
            options: ['It is the note C', 'It is the note G', 'It is the note F', 'It is the note B'],
            correct: 1,
            explanation: 'The treble clef (G clef) curls around the second line from the bottom, marking it as the note G.',
          },
        },
      },
      {
        id: 'l1-3',
        title: 'Note Values & Rhythm',
        subtitle: 'Whole, half, quarter, eighth notes and rests',
        /* ── EXERCISE-ONLY — no video for this lesson ──
           type: 'exercise' tells buildLessonBody to skip
           the video area and go straight to the content.
        ─────────────────────────────────────────────── */
        type: 'exercise',
        duration: '15 min',
        xp: 30,
        content: {
          /* No videoUrl — exercise layout renders instead */
          desc: 'Rhythm is the pattern of durations in music. Note values tell you how long to hold each note relative to the beat. Understanding these relationships is the foundation of reading and playing any piece of music.',
          notation: '𝅝  Whole Note   = 4 beats\n𝅗𝅥  Half Note    = 2 beats\n♩  Quarter Note = 1 beat\n♪  Eighth Note  = ½ beat',
          concepts: [
            { title: 'Whole Note', body: 'Held for 4 beats. Looks like an open oval.' },
            { title: 'Half Note', body: 'Held for 2 beats. Open oval with a stem.' },
            { title: 'Quarter Note', body: 'Held for 1 beat. Filled oval with a stem.' },
            { title: 'Eighth Note', body: 'Held for half a beat. Filled oval with a stem and a flag.' },
          ],
          takeaways: [
            'Each note value is half the duration of the one above it.',
            'Rests have the same values as notes — they indicate silence.',
            'Time signatures tell you how many beats are in each bar.',
          ],
          exercise: {
            prompt: 'How many quarter notes fit inside one whole note?',
            options: ['2', '8', '4', '6'],
            correct: 2,
            explanation: 'A whole note lasts 4 beats; a quarter note lasts 1 beat — so 4 quarter notes fill one whole note.',
          },
          /* Extra multi-round exercises shown in the exercise layout */
          extraExercises: [
            {
              prompt: 'A half note is worth how many beats?',
              options: ['1 beat', '2 beats', '3 beats', '4 beats'],
              correct: 1,
              explanation: 'A half note (𝅗𝅥) lasts 2 beats — half the duration of a whole note (4 beats).',
            },
            {
              prompt: 'Which note has a filled oval with a stem AND a flag?',
              options: ['Whole Note', 'Half Note', 'Quarter Note', 'Eighth Note'],
              correct: 3,
              explanation: 'The eighth note (♪) is the only standard note with a flag attached to its stem, making it easy to identify.',
            },
          ],
        },
      },
      {
        id: 'l1-4',
        title: 'Time Signatures Explained',
        subtitle: '4/4, 3/4, 6/8 and how to count them',
        type: 'video',
        duration: '10 min',
        xp: 25,
        content: {
          videoLabel: 'Time Signatures',
          desc: 'A time signature appears at the beginning of a piece and tells you two things: how many beats are in each bar, and which note value represents one beat. 4/4 (common time) is the most widely used time signature in popular music.',
          notation: '4/4 → 4 beats per bar, quarter note = 1 beat\n3/4 → 3 beats per bar  (waltz feel)\n6/8 → 6 beats per bar  (compound duple)',
          concepts: [
            { title: 'Top Number', body: 'How many beats are in each measure (bar).' },
            { title: 'Bottom Number', body: 'Which note value receives one beat (4 = quarter note).' },
            { title: '4/4 — Common Time', body: 'The most common time signature in pop, rock, and classical.' },
            { title: '3/4 — Waltz Time', body: 'Three beats per bar — gives a swaying, dance-like feel.' },
          ],
          takeaways: [
            'Time signatures control the rhythmic feel of music.',
            '4/4 = "1-2-3-4", 3/4 = "1-2-3", 6/8 = "1-2-3-4-5-6".',
            'Learning to count aloud is essential for rhythmic accuracy.',
          ],
          exercise: {
            prompt: 'In 3/4 time, how many quarter note beats are in each bar?',
            options: ['4', '2', '3', '6'],
            correct: 2,
            explanation: 'The top number in 3/4 tells us there are 3 beats per bar, each lasting one quarter note.',
          },
        },
      },
      {
        id: 'l1-5',
        title: 'The Major Scale',
        subtitle: 'The foundation of Western tonal music',
        type: 'video',
        duration: '14 min',
        xp: 30,
        content: {
          videoLabel: 'The Major Scale',
          desc: 'The major scale is the most fundamental scale in Western music. It consists of 7 distinct notes following the interval pattern: Whole-Whole-Half-Whole-Whole-Whole-Half. This pattern creates the characteristic bright, happy sound associated with major tonality.',
          notation: 'C Major: C D E F G A B C\nPattern:   W W H W W W H\n(W=Whole tone, H=Half tone)',
          concepts: [
            { title: 'Whole Step (W)', body: 'A distance of 2 semitones on a keyboard or fretboard.' },
            { title: 'Half Step (H)', body: 'A distance of 1 semitone — the smallest interval in Western music.' },
            { title: 'Scale Degrees', body: 'Each note has a number: 1 (tonic), 2, 3, 4, 5 (dominant), 6, 7, 8 (octave).' },
            { title: 'Key Signatures', body: 'Sharps or flats at the start of each staff line that define the key.' },
          ],
          takeaways: [
            'Major scale pattern: W-W-H-W-W-W-H.',
            'C major uses only white keys on a piano.',
            'Every key follows the same pattern starting from a different root.',
          ],
          exercise: {
            prompt: 'What is the interval pattern for a major scale?',
            options: ['W-H-W-W-H-W-W', 'W-W-H-W-W-W-H', 'H-W-W-H-W-W-W', 'W-W-W-H-W-W-H'],
            correct: 1,
            explanation: 'The major scale pattern is Whole-Whole-Half-Whole-Whole-Whole-Half. This pattern creates the characteristic major sound.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-2',
    title: 'Intervals & Ear Training Basics',
    description: 'Learn to identify and sing the 12 intervals of the chromatic scale.',
    icon: '👂',
    level: 'Beginner',
    xp: 350,
    duration: '4 hrs',
    lessons: [
      {
        id: 'l2-1',
        title: 'What is an Interval?',
        subtitle: 'The distance between two notes',
        type: 'video',
        duration: '9 min',
        xp: 25,
        content: {
          videoLabel: 'Musical Intervals',
          desc: 'An interval is the distance in pitch between two notes. Intervals are measured in semitones and have both a number (second, third, etc.) and a quality (major, minor, perfect, augmented, diminished). Recognising intervals by ear is the cornerstone of musicianship.',
          concepts: [
            { title: 'Unison (P1)', body: 'Two notes at exactly the same pitch — 0 semitones apart.' },
            { title: 'Octave (P8)', body: 'The same note at double the frequency — 12 semitones apart.' },
            { title: 'Perfect Intervals', body: 'Unison, 4th, 5th, and Octave. Stable and resonant-sounding.' },
            { title: 'Major / Minor', body: 'Seconds, thirds, sixths, and sevenths can be major or minor.' },
          ],
          notation: 'C → D  =  Major 2nd  (2 semitones)\nC → E  =  Major 3rd  (4 semitones)\nC → G  =  Perfect 5th (7 semitones)\nC → C\' =  Perfect Octave (12 semitones)',
          takeaways: [
            'Intervals are the distance between two notes in semitones.',
            'Perfect intervals: Unison, 4th, 5th, Octave.',
            'Major/minor intervals: 2nds, 3rds, 6ths, 7ths.',
          ],
          exercise: {
            prompt: 'How many semitones make up a Perfect 5th?',
            options: ['5', '6', '7', '8'],
            correct: 2,
            explanation: 'A Perfect 5th spans 7 semitones (e.g., C to G). It is one of the most consonant intervals in music.',
          },
        },
      },
      {
        id: 'l2-2',
        title: 'Recognising Intervals by Ear',
        subtitle: 'Reference songs for every interval',
        type: 'exercise',
        duration: '18 min',
        xp: 35,
        content: {
          videoLabel: 'Interval Ear Training',
          desc: 'The best way to learn intervals by ear is to associate each one with a familiar melody. For example, a Perfect 4th sounds like the opening of "Here Comes the Bride." By anchoring intervals to songs you already know, you build instant recognition.',
          concepts: [
            { title: 'Minor 2nd ♭2', body: '"Jaws" theme — tense, dissonant, half-step creep.' },
            { title: 'Major 2nd', body: '"Happy Birthday" (first two notes) — bright and stepwise.' },
            { title: 'Perfect 4th', body: '"Here Comes the Bride" — strong and stable.' },
            { title: 'Perfect 5th', body: '"Star Wars" theme — heroic and powerful.' },
          ],
          takeaways: [
            'Associate each interval with a memorable song for instant recognition.',
            'Practice singing intervals away from an instrument.',
            'Ascending vs descending intervals sound different — practise both.',
          ],
          exercise: {
            prompt: 'Which famous melody is commonly used to remember the sound of a Perfect 5th?',
            options: ['Jaws Theme', 'Happy Birthday', 'Star Wars Theme', 'Here Comes the Bride'],
            correct: 2,
            explanation: 'The opening two notes of the Star Wars theme ("Star… Wars") form a Perfect 5th, making it an easy reference for this interval.',
          },
        },
      },
      {
        id: 'l2-3',
        title: 'Semitones & the Chromatic Scale',
        subtitle: 'All 12 notes and sharps / flats',
        type: 'reading',
        duration: '11 min',
        xp: 25,
        content: {
          videoLabel: 'The Chromatic Scale',
          desc: 'The chromatic scale contains all 12 pitch classes within an octave, each a semitone (half step) apart. Every note on a piano keyboard — white and black — is one semitone from its neighbour. Understanding enharmonic equivalents (e.g., C# = Db) is essential for reading music in different keys.',
          notation: 'C  C#/Db  D  D#/Eb  E  F  F#/Gb  G  G#/Ab  A  A#/Bb  B  C\n   ↑ enharmonic pairs ↑',
          concepts: [
            { title: 'Semitone', body: 'The smallest interval in Western music; one fret on a guitar, adjacent key on piano.' },
            { title: 'Whole Tone', body: 'Two semitones. The distance between adjacent white keys (except E-F and B-C).' },
            { title: 'Sharp (#)', body: 'Raises a note by one semitone.' },
            { title: 'Flat (b)', body: 'Lowers a note by one semitone.' },
          ],
          takeaways: [
            'The chromatic scale has 12 notes, each a semitone apart.',
            'Sharps raise and flats lower a pitch by one semitone.',
            'Enharmonic equivalents are the same pitch written differently (C# = Db).',
          ],
          exercise: {
            prompt: 'How many semitones are in an octave?',
            options: ['7', '8', '10', '12'],
            correct: 3,
            explanation: 'An octave contains 12 semitones (all the keys — white and black — from one C to the next C on a piano).',
          },
        },
      },
    ],
  },
  {
    id: 'mod-3',
    title: 'Chords & Harmony',
    description: 'Build triads, seventh chords, and understand chord progressions.',
    icon: '🎹',
    level: 'Beginner',
    xp: 400,
    duration: '4.5 hrs',
    lessons: [
      {
        id: 'l3-1',
        title: 'Building Triads',
        subtitle: 'Major, minor, diminished, and augmented',
        type: 'video',
        duration: '13 min',
        xp: 30,
        content: {
          videoLabel: 'Triads — Building Chords',
          desc: 'A triad is a three-note chord built by stacking intervals of thirds. The four basic triad types are defined by the quality of their third and fifth intervals. Major triads sound bright and happy; minor triads sound darker and more introspective.',
          notation: 'Major  Triad: Root + Major 3rd + Perfect 5th  (e.g. C-E-G)\nMinor  Triad: Root + Minor 3rd + Perfect 5th  (e.g. C-Eb-G)\nDim    Triad: Root + Minor 3rd + Dim 5th       (e.g. C-Eb-Gb)\nAug    Triad: Root + Major 3rd + Aug 5th       (e.g. C-E-G#)',
          concepts: [
            { title: 'Root', body: 'The note the chord is named after and built upon.' },
            { title: 'Third', body: 'The middle note — determines major (bright) vs minor (dark) quality.' },
            { title: 'Fifth', body: 'The top note — determines perfect, diminished, or augmented quality.' },
            { title: 'Inversions', body: 'Rearranging chord notes: root position, 1st inversion, 2nd inversion.' },
          ],
          takeaways: [
            'Major triad = Root + Major 3rd + Perfect 5th.',
            'Minor triad = Root + Minor 3rd + Perfect 5th.',
            'The third of a chord defines its major/minor quality.',
          ],
          exercise: {
            prompt: 'Which notes form a C major triad?',
            options: ['C - Eb - G', 'C - E - G', 'C - E - G#', 'C - Eb - Gb'],
            correct: 1,
            explanation: 'C major triad = C (root) + E (major 3rd) + G (perfect 5th). It uses only white keys on a piano.',
          },
        },
      },
      {
        id: 'l3-2',
        title: 'Diatonic Chords & the Harmonised Scale',
        subtitle: 'Building chords from every scale degree',
        type: 'video',
        duration: '16 min',
        xp: 35,
        content: {
          videoLabel: 'Diatonic Harmony',
          desc: 'When you build a triad on each degree of the major scale using only notes from that scale, you get the seven diatonic chords. In the key of C major these are: I=Cmaj, ii=Dmin, iii=Emin, IV=Fmaj, V=Gmaj, vi=Amin, vii°=Bdim.',
          notation: 'Key of C Major — Diatonic Triads:\nI    Cmaj   (C-E-G)\nii   Dmin   (D-F-A)\niii  Emin   (E-G-B)\nIV   Fmaj   (F-A-C)\nV    Gmaj   (G-B-D)\nvi   Amin   (A-C-E)\nvii° Bdim   (B-D-F)',
          concepts: [
            { title: 'Tonic (I)', body: 'Home base. The chord of rest and resolution.' },
            { title: 'Dominant (V)', body: 'Tension chord — strongly wants to resolve back to I.' },
            { title: 'Subdominant (IV)', body: 'Pre-dominant — often moves to V or back to I.' },
            { title: 'Roman Numerals', body: 'Upper case = major, lower case = minor. vii° = diminished.' },
          ],
          takeaways: [
            'The harmonised major scale gives you I ii iii IV V vi vii°.',
            'I, IV, V are major; ii, iii, vi are minor; vii° is diminished.',
            'Roman numeral analysis works in any key.',
          ],
          exercise: {
            prompt: 'In a major key, which scale degree produces a diminished triad?',
            options: ['II (ii)', 'IV (IV)', 'V (V)', 'VII (vii°)'],
            correct: 3,
            explanation: 'The 7th degree of the major scale (vii°) produces a diminished triad because stacking thirds from that note gives a minor 3rd and a diminished 5th.',
          },
        },
      },
      {
        id: 'l3-3',
        title: 'Common Chord Progressions',
        subtitle: 'I-IV-V-I, I-V-vi-IV and more',
        type: 'exercise',
        duration: '20 min',
        xp: 40,
        content: {
          videoLabel: 'Chord Progressions',
          desc: 'A chord progression is a sequence of chords that creates a musical phrase. A small number of progressions underpin thousands of songs.',
          notation: 'I – IV – V – I   (the blues backbone)\nI – V – vi – IV  ("the 4-chord song" — 100s of hits)\nii – V – I       (jazz standard resolution)\nI – vi – IV – V  (the "50s progression")',
          concepts: [
            { title: 'Cadence', body: 'A harmonic ending — V-I is a "perfect" cadence; IV-I is a "plagal" cadence.' },
            { title: 'Voice Leading', body: 'Moving chord notes smoothly to minimise jumps between chords.' },
            { title: 'Modulation', body: 'Moving from one key to another within a piece.' },
            { title: 'Borrowed Chords', body: 'Chords borrowed from the parallel minor key for colour.' },
          ],
          takeaways: [
            'I-IV-V-I is the foundation of blues, rock, and folk.',
            'I-V-vi-IV powers countless pop songs in many keys.',
            'ii-V-I is the most important progression in jazz.',
          ],
          exercise: {
            prompt: 'In C major, which chords make up the I-V-vi-IV progression?',
            options: ['C - G - Am - F', 'C - F - G - Am', 'Am - F - C - G', 'C - Em - Am - F'],
            correct: 0,
            explanation: 'I=C, V=G, vi=Am, IV=F. This is one of the most commonly used progressions in contemporary popular music.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-4',
    title: 'Rhythm & Meter',
    description: 'Master time signatures, syncopation, polyrhythm, and groove.',
    icon: '🥁',
    level: 'Intermediate',
    xp: 420,
    duration: '4 hrs',
    lessons: [
      {
        id: 'l4-1',
        title: 'Pulse, Beat & Tempo',
        subtitle: 'Understanding the heartbeat of music',
        type: 'video',
        duration: '10 min',
        xp: 30,
        content: {
          videoLabel: 'Pulse and Tempo',
          desc: 'The pulse is the steady, underlying beat of music — what you tap your foot to. Tempo describes how fast or slow that pulse moves, measured in Beats Per Minute (BPM).',
          notation: 'Tempo markings:\nLargo      ≈ 40–60 BPM    (very slow)\nAndante    ≈ 76–108 BPM   (walking pace)\nAllegro    ≈ 120–156 BPM  (fast)\nPresto     ≈ 168–200 BPM  (very fast)',
          concepts: [
            { title: 'Pulse', body: 'The constant, underlying beat you feel in music.' },
            { title: 'Tempo', body: 'The speed of the pulse, measured in BPM.' },
            { title: 'Metronome', body: 'A device that keeps a steady pulse. Essential for practice.' },
            { title: 'Rubato', body: 'Flexible tempo — speeding up or slowing down for expression.' },
          ],
          takeaways: [
            'Tempo = speed of the beat, measured in BPM.',
            'Always practise with a metronome to build timing accuracy.',
            'Internalising pulse is more important than any technique.',
          ],
          exercise: {
            prompt: 'What does BPM stand for in music?',
            options: ['Bars Per Minute', 'Beats Per Melody', 'Beats Per Minute', 'Bass Per Measure'],
            correct: 2,
            explanation: 'BPM stands for Beats Per Minute — a universal measure of tempo. 120 BPM means 2 beats per second.',
          },
        },
      },
      {
        id: 'l4-2',
        title: 'Syncopation & Off-Beat Rhythms',
        subtitle: 'The rhythmic spice of jazz, funk, and reggae',
        type: 'exercise',
        duration: '18 min',
        xp: 40,
        content: {
          videoLabel: 'Syncopation',
          desc: 'Syncopation is the deliberate displacement of rhythmic emphasis to weak beats or the "and" counts between main beats.',
          notation: 'Regular:    1  2  3  4\nSyncopated: 1  &  3  &   (emphasis on "and" counts)',
          concepts: [
            { title: 'Strong Beats', body: 'In 4/4 time: beats 1 and 3 are naturally strong.' },
            { title: 'Weak Beats', body: 'Beats 2 and 4 (the "backbeat"), and all the "and" counts.' },
            { title: 'Syncopation', body: 'Accenting weak beats or the spaces between main beats.' },
            { title: 'Groove', body: 'The feel created by the relationship between syncopation and the pulse.' },
          ],
          takeaways: [
            'Syncopation = emphasis on weak or off beats.',
            'The backbeat (2 and 4) is the foundation of pop and rock groove.',
            'Counting "1-and-2-and-3-and-4-and" reveals all off-beat positions.',
          ],
          exercise: {
            prompt: 'Which best describes syncopation?',
            options: [
              'Emphasising every strong beat',
              'Playing only on the beat',
              'Placing emphasis on weak beats or between main beats',
              'Removing all rhythm from music',
            ],
            correct: 2,
            explanation: 'Syncopation involves accenting rhythmically weak positions — the "ands," beats 2 and 4, or unexpected places — creating rhythmic tension and groove.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-5',
    title: 'Scales & Modes',
    description: 'Major, minor, pentatonic, blues, and all 7 church modes.',
    icon: '🎼',
    level: 'Intermediate',
    xp: 500,
    duration: '5 hrs',
    lessons: [
      {
        id: 'l5-1',
        title: 'Natural Minor Scale',
        subtitle: 'The Aeolian mode and its darker sound',
        type: 'video',
        duration: '12 min',
        xp: 30,
        content: {
          videoLabel: 'The Natural Minor Scale',
          desc: 'The natural minor scale (Aeolian mode) has a darker, more melancholic sound than the major scale.',
          notation: 'A Natural Minor: A B C D E F G A\nPattern:        W H W W H W W\n\nRelative minor = start on 6th degree of major',
          concepts: [
            { title: 'Natural Minor', body: 'Uses the same notes as its relative major, starting from the 6th degree.' },
            { title: 'Relative Minor', body: 'Every major key has a relative minor that shares its key signature.' },
            { title: 'Parallel Minor', body: 'Same root note as major but different notes (e.g., C major vs C minor).' },
            { title: 'Minor Scale Formula', body: 'W-H-W-W-H-W-W — note the half-steps at 2-3 and 5-6.' },
          ],
          takeaways: [
            'Natural minor pattern: W-H-W-W-H-W-W.',
            'Every major key has a relative minor (same key signature, starts on 6th degree).',
            'Minor scales create a darker, sadder sound than major.',
          ],
          exercise: {
            prompt: 'What is the relative minor of C major?',
            options: ['G minor', 'D minor', 'A minor', 'E minor'],
            correct: 2,
            explanation: 'A minor is the relative minor of C major — both share the same notes (no sharps or flats).',
          },
        },
      },
      {
        id: 'l5-2',
        title: 'The Pentatonic Scale',
        subtitle: 'The universal scale of folk, blues, and rock',
        type: 'exercise',
        duration: '16 min',
        xp: 35,
        content: {
          videoLabel: 'Pentatonic Scale',
          desc: 'The pentatonic scale contains only 5 notes and is found in virtually every musical culture worldwide.',
          notation: 'C Major Pentatonic: C D E G A\nA Minor Pentatonic: A C D E G\n(Remove 4th and 7th from major scale)',
          concepts: [
            { title: 'Major Pentatonic', body: 'Degrees 1, 2, 3, 5, 6 of the major scale. Bright and folky.' },
            { title: 'Minor Pentatonic', body: 'Degrees 1, b3, 4, 5, b7. The basis of blues and rock soloing.' },
            { title: 'Why 5 Notes?', body: 'Removing the 4th and 7th eliminates the most tension-causing intervals.' },
            { title: 'Box Patterns', body: 'On guitar, pentatonic scales have 5 repeating "box" patterns across the fretboard.' },
          ],
          takeaways: [
            'Pentatonic = 5 notes: major removes 4th and 7th from major scale.',
            'Minor pentatonic is the foundation of blues and rock improvisation.',
            'It is the easiest scale to start improvising with immediately.',
          ],
          exercise: {
            prompt: 'Which two scale degrees are removed from the major scale to create the major pentatonic?',
            options: ['1st and 5th', '4th and 7th', '3rd and 6th', '2nd and 4th'],
            correct: 1,
            explanation: 'The major pentatonic removes the 4th and 7th degrees, eliminating the most dissonant intervals.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-6',
    title: 'Song Structure & Form',
    description: 'Verse, chorus, bridge, intros — how songs are built.',
    icon: '📝',
    level: 'Intermediate',
    xp: 380,
    duration: '3.5 hrs',
    lessons: [
      {
        id: 'l6-1',
        title: 'Anatomy of a Song',
        subtitle: 'Intro, verse, chorus, bridge, and outro',
        type: 'reading',
        duration: '12 min',
        xp: 30,
        content: {
          videoLabel: 'Song Structure',
          desc: 'Understanding song structure helps you learn songs faster, communicate with other musicians, and build your own compositions.',
          notation: 'Common Pop Structure:\nIntro → Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus (×2) → Outro',
          concepts: [
            { title: 'Verse', body: 'Narrative section — lyrics change each time but melody stays similar.' },
            { title: 'Chorus', body: 'The emotional peak — usually the most memorable and repetitive part.' },
            { title: 'Bridge', body: 'Contrasting section providing relief from verse/chorus repetition.' },
            { title: 'Pre-Chorus', body: 'A build-up section between verse and chorus that raises tension.' },
          ],
          takeaways: [
            'Verse = story; Chorus = hook; Bridge = contrast.',
            'The AABA form dominated jazz standards from the 1930s–50s.',
            'Understanding form lets you anticipate what comes next in any song.',
          ],
          exercise: {
            prompt: 'What is the primary purpose of the bridge in a song?',
            options: [
              'To repeat the chorus more times',
              'To introduce new instruments',
              'To provide contrast and relief from the verse/chorus pattern',
              'To end the song abruptly',
            ],
            correct: 2,
            explanation: 'The bridge provides musical and lyrical contrast, giving the listener a break from the verse/chorus pattern.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-7',
    title: 'Dynamics & Articulation',
    description: 'Expression marks, phrasing, staccato, legato, and more.',
    icon: '🎭',
    level: 'Intermediate',
    xp: 320,
    duration: '3 hrs',
    lessons: [
      {
        id: 'l7-1',
        title: 'Dynamic Markings',
        subtitle: 'From pianissimo to fortissimo',
        type: 'reading',
        duration: '10 min',
        xp: 25,
        content: {
          videoLabel: 'Dynamics in Music',
          desc: 'Dynamics are the volume levels in music. Italian terms are universally used across all styles.',
          notation: 'ppp = pianississimo  (softest)\npp  = pianissimo     (very soft)\np   = piano          (soft)\nmp  = mezzo-piano    (medium soft)\nmf  = mezzo-forte    (medium loud)\nf   = forte          (loud)\nff  = fortissimo     (very loud)\nfff = fortississimo  (loudest)',
          concepts: [
            { title: 'Crescendo (<)', body: 'Gradually getting louder.' },
            { title: 'Decrescendo (>)', body: 'Gradually getting softer (also: diminuendo).' },
            { title: 'sforzando (sfz)', body: 'A sudden, forced accent on a single note.' },
            { title: 'Dynamic Range', body: 'The span from softest to loudest in a piece.' },
          ],
          takeaways: [
            'Dynamic markings range from ppp (softest) to fff (loudest).',
            'Crescendo = getting louder; decrescendo = getting softer.',
            'Dynamics are the primary vehicle of musical expression.',
          ],
          exercise: {
            prompt: 'What does the Italian term "fortissimo" mean?',
            options: ['Soft', 'Medium loud', 'Very loud', 'Gradually louder'],
            correct: 2,
            explanation: '"Fortissimo" (ff) means very loud — from the Italian "forte" (strong/loud) with the superlative suffix "-issimo."',
          },
        },
      },
    ],
  },
  {
    id: 'mod-8',
    title: 'Music Technology & Production',
    description: 'DAWs, MIDI, audio engineering fundamentals, and home recording.',
    icon: '🎛️',
    level: 'Intermediate',
    xp: 480,
    duration: '5 hrs',
    lessons: [
      {
        id: 'l8-1',
        title: 'Introduction to DAWs',
        subtitle: 'Your digital recording studio',
        type: 'video',
        duration: '15 min',
        xp: 35,
        content: {
          videoLabel: 'Digital Audio Workstations',
          desc: 'A Digital Audio Workstation (DAW) is software that lets you record, edit, and produce music.',
          concepts: [
            { title: 'Tracks', body: 'Individual layers of audio or MIDI.' },
            { title: 'Timeline', body: 'The horizontal view of your project showing all audio over time.' },
            { title: 'Mixer', body: 'Controls the volume, panning, and effects of each track.' },
            { title: 'Plugins', body: 'Software instruments (VSTs) and effects (EQ, reverb, compression).' },
          ],
          takeaways: [
            'A DAW is your complete recording, editing, and mixing studio.',
            'GarageBand (Mac/iOS) is free and a great starting point.',
            'All professional music is produced in a DAW.',
          ],
          exercise: {
            prompt: 'What does DAW stand for?',
            options: ['Digital Array Workspace', 'Digital Audio Workstation', 'Dynamic Audio Wave', 'Disc Audio Writer'],
            correct: 1,
            explanation: 'DAW stands for Digital Audio Workstation.',
          },
        },
      },
      {
        id: 'l8-2',
        title: 'Understanding MIDI',
        subtitle: 'The language of electronic music',
        type: 'video',
        duration: '14 min',
        xp: 35,
        content: {
          videoLabel: 'MIDI Explained',
          desc: 'MIDI (Musical Instrument Digital Interface) is a protocol that transmits musical performance data — not audio.',
          notation: 'MIDI Note Message:\nNote On  → pitch=60 (C4), velocity=100\nNote Off → pitch=60, velocity=0\n\n128 pitches (0-127), Middle C = 60',
          concepts: [
            { title: 'MIDI vs Audio', body: 'MIDI is data (instructions), audio is sound.' },
            { title: 'Velocity', body: 'How hard a note was struck — controls volume and timbre.' },
            { title: 'Quantise', body: 'Snapping MIDI notes to a rhythmic grid to correct timing.' },
            { title: 'Controller', body: 'A MIDI keyboard, drum pad, or any device that sends MIDI data.' },
          ],
          takeaways: [
            'MIDI is data, not sound — it tells instruments what notes to play.',
            'MIDI can be edited and quantised after recording.',
            'A MIDI controller is any device that sends MIDI.',
          ],
          exercise: {
            prompt: 'What is the key difference between MIDI and audio?',
            options: [
              'MIDI is only for drums; audio is for everything else',
              'MIDI is performance data; audio is the actual sound',
              'Audio can be edited; MIDI cannot',
              'MIDI sounds better than audio',
            ],
            correct: 1,
            explanation: 'MIDI contains performance instructions (pitch, velocity, timing) but no sound.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-9',
    title: 'Composition Techniques',
    description: 'Melody writing, motifs, development, and structure.',
    icon: '✍️',
    level: 'Advanced',
    xp: 550,
    duration: '5.5 hrs',
    lessons: [
      {
        id: 'l9-1',
        title: 'Writing a Melody',
        subtitle: 'Contour, range, rhythm, and memorable hooks',
        type: 'video',
        duration: '18 min',
        xp: 40,
        content: {
          videoLabel: 'Melody Writing',
          desc: 'A great melody combines singability, rhythmic interest, and a satisfying shape (contour).',
          concepts: [
            { title: 'Contour', body: 'The shape of a melody — rising, falling, arch, or wave-like.' },
            { title: 'Range', body: 'The distance between the lowest and highest notes.' },
            { title: 'Motif', body: 'A short, distinctive musical idea that can be developed and varied.' },
            { title: 'Sequence', body: 'Repeating a melodic pattern starting on a different pitch.' },
          ],
          takeaways: [
            'Great melodies mix stepwise motion with occasional meaningful leaps.',
            'Establish a clear climax point for maximum emotional impact.',
            'Short motifs can be developed into entire movements.',
          ],
          exercise: {
            prompt: 'What is a "motif" in music composition?',
            options: [
              'A full melody lasting 16 bars',
              'A chord progression',
              'A short, distinctive musical idea used as a building block',
              'A type of time signature',
            ],
            correct: 2,
            explanation: 'A motif is a short, distinctive musical fragment that serves as the seed for longer musical development.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-10',
    title: 'Jazz Theory & Improvisation',
    description: 'Modes, ii-V-I, bebop, and the art of improvising.',
    icon: '🎷',
    level: 'Advanced',
    xp: 600,
    duration: '6 hrs',
    lessons: [
      {
        id: 'l10-1',
        title: 'Introduction to Jazz Harmony',
        subtitle: 'Extended chords, tensions, and colour tones',
        type: 'video',
        duration: '20 min',
        xp: 45,
        content: {
          videoLabel: 'Jazz Harmony Basics',
          desc: 'Jazz harmony extends basic triads to 7th, 9th, 11th, and 13th chords. The ii-V-I progression is the cornerstone of jazz.',
          notation: 'Cmaj7   = C E G B\nDm7     = D F A C\nG7      = G B D F\nii-V-I in C: Dm7 → G7 → Cmaj7',
          concepts: [
            { title: '7th Chords', body: 'Four-note chords adding a 7th above the root to the basic triad.' },
            { title: 'ii-V-I', body: 'The most important progression in jazz.' },
            { title: 'Altered Dominants', body: 'Dominant chords with raised/lowered 5ths and 9ths for tension.' },
            { title: 'Chord-Scale Theory', body: 'Matching specific scales (modes) to each chord in a progression.' },
          ],
          takeaways: [
            'Jazz uses extended chords: 7ths, 9ths, 11ths, 13ths.',
            'ii-V-I is the backbone progression of jazz harmony.',
            'Chord-scale theory tells you which notes to play over each chord.',
          ],
          exercise: {
            prompt: 'In the key of C, what are the chords in a ii-V-I progression?',
            options: ['Cmaj7 - Fmaj7 - Gmaj7', 'Am7 - Dm7 - Gmaj7', 'Dm7 - G7 - Cmaj7', 'Em7 - Am7 - Dmaj7'],
            correct: 2,
            explanation: 'In C major: ii = Dm7, V = G7, I = Cmaj7.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-11',
    title: 'World Music & Global Traditions',
    description: 'Explore rhythms, scales, and forms from around the world.',
    icon: '🌍',
    level: 'Advanced',
    xp: 480,
    duration: '4.5 hrs',
    lessons: [
      {
        id: 'l11-1',
        title: 'African Rhythmic Traditions',
        subtitle: 'Polyrhythm, call-and-response, and the role of rhythm',
        type: 'reading',
        duration: '14 min',
        xp: 35,
        content: {
          videoLabel: 'African Rhythmic Traditions',
          desc: 'African music is rhythmically sophisticated in ways that profoundly influenced virtually all Western popular music.',
          notation: 'Polyrhythm example — 3 against 2:\nPart A: 1 . . 2 . . 3 . .\nPart B: 1 . . . . 2 . . . .',
          concepts: [
            { title: 'Polyrhythm', body: 'Multiple contrasting rhythms played simultaneously, each in a different meter.' },
            { title: 'Cross-Rhythm', body: 'A rhythm that contradicts the main meter, creating tension.' },
            { title: 'Call & Response', body: 'Musical conversation between a leader and a group.' },
            { title: 'Timeline', body: 'A repeating, rhythmically distinctive pattern that anchors the ensemble.' },
          ],
          takeaways: [
            'African polyrhythm is the rhythmic foundation of most Western popular music.',
            'Call-and-response is a universal musical form from Africa to gospel to blues.',
            'Understanding these roots deepens your appreciation of nearly all music.',
          ],
          exercise: {
            prompt: 'What is polyrhythm?',
            options: [
              'Playing only one rhythmic pattern repeatedly',
              'The use of many different instruments',
              'Multiple contrasting rhythmic patterns played simultaneously',
              'A type of time signature with many beats',
            ],
            correct: 2,
            explanation: 'Polyrhythm involves playing two or more contrasting rhythmic patterns at the same time.',
          },
        },
      },
    ],
  },
  {
    id: 'mod-12',
    title: 'Capstone: Your Musical Journey',
    description: 'Reflect, consolidate, and plan your continued growth.',
    icon: '🏆',
    level: 'Advanced',
    xp: 700,
    duration: '3 hrs',
    lessons: [
      {
        id: 'l12-1',
        title: 'Bringing It All Together',
        subtitle: 'Integration, reflection, and what comes next',
        type: 'video',
        duration: '20 min',
        xp: 50,
        content: {
          videoLabel: 'Your Musical Journey',
          desc: 'Congratulations on reaching the final module! In this capstone lesson, we bring together everything you have learned and chart a course for your continued musical growth.',
          concepts: [
            { title: 'Theory → Practice', body: 'All theory must connect to your instrument and to your ears.' },
            { title: 'Deliberate Practice', body: 'Focus on what is difficult, not just what you enjoy playing.' },
            { title: 'Active Listening', body: 'Analyse music you love — identify chords, scales, structure.' },
            { title: 'Create Regularly', body: 'Write and record your own music, even if imperfect.' },
          ],
          takeaways: [
            'Theory without application is empty — always connect to real music.',
            'Deliberate practice beats passive repetition every time.',
            'Your musical voice is unique — cultivate it.',
          ],
          exercise: {
            prompt: 'What is the most important habit for continued musical growth?',
            options: [
              'Only practising scales for 3 hours daily',
              'Avoiding difficult pieces',
              'Regular, deliberate practice combined with active listening',
              'Memorising every music theory rule',
            ],
            correct: 2,
            explanation: 'Regular, deliberate practice — focusing on weaknesses — combined with active listening is the proven path to musical mastery.',
          },
        },
      },
    ],
  },
];


/* ═══════════════════════════════════════════════════════
   STATE
   ═══════════════════════════════════════════════════════ */
let currentModuleIndex  = 0;
let currentLessonIndex  = 0;
let modalOpen           = false;
let exerciseAnswered    = false;
let currentExerciseIdx  = 0;   // tracks which extra exercise we're on (l1-3 style)

function getCompleted() {
  return HarmoniaDB.getProgress()?.learningPath?.completedLessons || [];
}


/* ═══════════════════════════════════════════════════════
   DOM READY
   ═══════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  HarmoniaDB.init();
  renderSidebar();
  renderModuleContent(currentModuleIndex);
  updateHeroStats();
  setupSearch();
  setupKeyboard();
});


/* ═══════════════════════════════════════════════════════
   HERO STATS
   ═══════════════════════════════════════════════════════ */
function updateHeroStats() {
  const snap = HarmoniaDB.getSnapshot();
  const completed = getCompleted();
  const totalLessons = LP_DATA.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedCount = completed.length;
  const overallPct = Math.round((completedCount / totalLessons) * 100);

  setTextSafe('lp-overall-pct', overallPct + '%');
  animateBar('lp-overall-fill', overallPct, 600);
  setTextSafe('lp-stat-lessons', completedCount + ' / ' + totalLessons);
  setTextSafe('lp-stat-streak', (snap.streak.current || 0) + '🔥');
  setTextSafe('lp-stat-xp', snap.levelInfo.currentXP.toLocaleString());
}

function setTextSafe(id, txt) {
  const el = document.getElementById(id);
  if (el) el.textContent = txt;
}

function animateBar(id, pct, delay = 0) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.style.width = pct + '%';
  }, delay);
}


/* ═══════════════════════════════════════════════════════
   SIDEBAR
   ═══════════════════════════════════════════════════════ */
function renderSidebar() {
  const list = document.getElementById('lpModuleList');
  if (!list) return;
  const completed = getCompleted();

  list.innerHTML = LP_DATA.map((mod, i) => {
    const modCompleted = mod.lessons.every(l => completed.includes(l.id));
    const isActive = i === currentModuleIndex;
    return `
      <div class="lp-mod-item ${isActive ? 'active' : ''} ${modCompleted ? 'completed' : ''}"
           onclick="switchModule(${i})" role="button" tabindex="0"
           onkeydown="if(event.key==='Enter')switchModule(${i})">
        <div class="lp-mod-num">${modCompleted ? '✓' : i + 1}</div>
        <div class="lp-mod-info">
          <strong>${mod.icon} ${mod.title}</strong>
          <span>${mod.lessons.length} lessons · ${mod.duration}</span>
        </div>
        ${isActive ? '<span class="lp-mod-check">▶</span>' : ''}
      </div>
    `;
  }).join('');

  updateQuickStats();
}

function updateQuickStats() {
  const completed = getCompleted();
  const totalLessons = LP_DATA.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedModules = LP_DATA.filter(m => m.lessons.every(l => completed.includes(l.id))).length;
  const totalXP = LP_DATA.flatMap(m => m.lessons)
    .filter(l => completed.includes(l.id))
    .reduce((sum, l) => sum + l.xp, 0);

  setTextSafe('qs-completed', completedModules + ' / ' + LP_DATA.length);
  setTextSafe('qs-lessons', completed.length + ' / ' + totalLessons);
  setTextSafe('qs-xp-earned', totalXP + ' XP');
  setTextSafe('qs-streak', (HarmoniaDB.getStreak().current || 0) + ' days');

  const pct = Math.round((completed.length / totalLessons) * 100);
  setTextSafe('cert-progress', `${pct}% complete — ${totalLessons - completed.length} lessons remaining`);
}


/* ═══════════════════════════════════════════════════════
   MODULE SWITCHING
   ═══════════════════════════════════════════════════════ */
function switchModule(idx) {
  currentModuleIndex = idx;
  renderSidebar();
  renderModuleContent(idx);
  const content = document.getElementById('lpContent');
  if (content && window.innerWidth < 800) {
    content.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}


/* ═══════════════════════════════════════════════════════
   MODULE CONTENT RENDER
   ═══════════════════════════════════════════════════════ */
function renderModuleContent(idx) {
  const mod = LP_DATA[idx];
  const completed = getCompleted();
  const completedInMod = mod.lessons.filter(l => completed.includes(l.id)).length;
  const modPct = mod.lessons.length > 0 ? Math.round((completedInMod / mod.lessons.length) * 100) : 0;
  const allDone = completedInMod === mod.lessons.length;

  const headerEl = document.getElementById('lpModuleHeader');
  if (headerEl) {
    headerEl.innerHTML = `
      <div class="lp-mh-top">
        <div class="lp-mh-left">
          <div class="lp-mh-icon">${mod.icon}</div>
          <div class="lp-mh-info">
            <h2>Module ${idx + 1}: ${mod.title}</h2>
            <p>${mod.description}</p>
          </div>
        </div>
        <div class="lp-mh-badges">
          <span class="lp-mh-badge lp-badge-level">${mod.level}</span>
          <span class="lp-mh-badge lp-badge-xp">+${mod.xp} XP</span>
          <span class="lp-mh-badge lp-badge-lessons">${mod.lessons.length} lessons</span>
        </div>
      </div>
      <div class="lp-mh-progress">
        <div class="lp-mh-progress-label">
          <span>Module Progress</span>
          <span class="lp-mh-progress-pct">${modPct}%</span>
        </div>
        <div class="lp-mh-progress-bar">
          <div class="lp-mh-progress-fill" id="modProgressFill" style="width:0%"></div>
        </div>
      </div>
      <div class="lp-mh-meta">
        <span>⏱ ${mod.duration}</span>
        <span>📚 ${mod.lessons.length} lessons</span>
        <span>🏆 +${mod.xp} XP on completion</span>
        <span>📊 ${mod.level}</span>
      </div>
    `;
    setTimeout(() => animateBar('modProgressFill', modPct, 0), 100);
  }

  const banner = document.getElementById('lpModuleCompleteBanner');
  if (banner) {
    if (allDone) {
      banner.classList.add('show');
      banner.querySelector('.lp-mc-text h3').textContent = `Module ${idx + 1} Complete! 🎉`;
      banner.querySelector('.lp-mc-text p').textContent = `You've finished all lessons in "${mod.title}". Move to the next module!`;
    } else {
      banner.classList.remove('show');
    }
  }

  const lessonList = document.getElementById('lpLessonList');
  if (!lessonList) return;

  lessonList.innerHTML = mod.lessons.map((lesson, li) => {
    const isDone = completed.includes(lesson.id);
    const isActive = li === 0 && !isDone;
    return buildLessonItem(lesson, li, isDone, isActive);
  }).join('');
}

function buildLessonItem(lesson, li, isDone, isActive) {
  const typeTag = `<span class="lp-lesson-tag lt-${lesson.type}">${typeLabel(lesson.type)}</span>`;
  const lockTag = lesson.locked ? `<span class="lp-lesson-tag lt-locked">🔒 Locked</span>` : '';

  return `
    <div class="lp-lesson-item ${isDone ? 'completed-lesson' : ''} ${isActive ? 'active-lesson' : ''} ${lesson.locked ? 'locked' : ''}"
         onclick="openLesson(${currentModuleIndex}, ${li})"
         role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')openLesson(${currentModuleIndex},${li})">
      <div class="lp-lesson-num">${isDone ? '✓' : li + 1}</div>
      <div class="lp-lesson-info">
        <h4>${lesson.title}</h4>
        <p>${lesson.subtitle}</p>
      </div>
      <div class="lp-lesson-tags">${typeTag}${lockTag}</div>
      <div class="lp-lesson-dur">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="12" height="12">
          <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
        </svg>
        ${lesson.duration}
      </div>
      <div class="lp-lesson-xp">+${lesson.xp} XP</div>
    </div>
  `;
}

function typeLabel(type) {
  const map = { video: '🎬 Video', exercise: '✏️ Exercise', quiz: '🧠 Quiz', reading: '📖 Reading', practice: '🎸 Practice' };
  return map[type] || type;
}


/* ═══════════════════════════════════════════════════════
   LESSON MODAL
   ═══════════════════════════════════════════════════════ */
function openLesson(modIdx, lessonIdx) {
  currentModuleIndex = modIdx;
  currentLessonIndex = lessonIdx;
  exerciseAnswered   = false;
  currentExerciseIdx = 0;

  const mod    = LP_DATA[modIdx];
  const lesson = mod.lessons[lessonIdx];
  const completed = getCompleted();
  const isDone = completed.includes(lesson.id);

  buildModalContent(mod, lesson, lessonIdx, isDone);

  const overlay = document.getElementById('lpModalOverlay');
  overlay.classList.add('open');
  modalOpen = true;
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('lpModalOverlay').classList.remove('open');
  modalOpen = false;
  document.body.style.overflow = '';
}

function buildModalContent(mod, lesson, lessonIdx, isDone) {
  const c = lesson.content;
  const totalLessons = mod.lessons.length;

  document.getElementById('lp-modal-icon-el').textContent = mod.icon;
  document.getElementById('lp-modal-title-el').textContent = lesson.title;
  document.getElementById('lp-modal-sub-el').textContent   = `${mod.title} · Lesson ${lessonIdx + 1} of ${totalLessons}`;
  document.getElementById('lp-modal-nav-info').textContent = `${lessonIdx + 1} / ${totalLessons}`;

  const prevBtn = document.getElementById('lp-modal-prev');
  const nextBtn = document.getElementById('lp-modal-next');
  prevBtn.disabled = lessonIdx === 0;
  nextBtn.disabled = lessonIdx === totalLessons - 1;
  prevBtn.onclick = () => navigateLesson(-1);
  nextBtn.onclick = () => navigateLesson(1);

  const completeBtn = document.getElementById('lp-complete-btn');
  if (isDone) {
    completeBtn.innerHTML = '✓ Completed';
    completeBtn.classList.add('done');
    completeBtn.disabled = true;
  } else {
    completeBtn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
      Mark as Complete (+${lesson.xp} XP)
    `;
    completeBtn.classList.remove('done');
    completeBtn.disabled = false;
    completeBtn.onclick = () => completeLesson(mod, lesson);
  }

  document.getElementById('lp-footer-lesson').textContent = `${mod.title} — Lesson ${lessonIdx + 1}`;
  document.getElementById('lp-footer-xp').textContent     = `+${lesson.xp} XP on completion`;

  const bodyEl = document.getElementById('lpLessonBody');
  bodyEl.innerHTML = buildLessonBody(lesson, c);
  document.getElementById('lpModal').scrollTop = 0;
}

/* ─────────────────────────────────────────────────────────────
   buildLessonBody
   KEY LOGIC:
   • lesson.type === 'exercise'  → skip video area, show
     exercise-focused layout with a coloured header banner
   • lesson.content.videoUrl     → show real <iframe> embed
   • otherwise                   → show the placeholder play button
───────────────────────────────────────────────────────────── */
function buildLessonBody(lesson, c) {
  const isExerciseOnly = lesson.type === 'exercise';
  let html = '';

  /* ── VIDEO AREA ─────────────────────────────────────────── */
  if (!isExerciseOnly) {
    if (c.videoUrl) {
      /* Real YouTube embed */
      html += `
        <div class="lp-video-area lp-video-embed">
          <iframe
            src="${c.videoUrl}"
            title="${c.videoLabel || lesson.title}"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            loading="lazy"
          ></iframe>
          <div class="lp-video-caption">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            ${c.videoLabel}
          </div>
        </div>
      `;
    } else {
      /* Placeholder play button */
      html += `
        <div class="lp-video-area">
          <div class="lp-video-placeholder">
            <button class="lp-play-btn" aria-label="Play video"
              onclick="this.closest('.lp-video-area').innerHTML='<div style=\\'padding:20px;color:var(--muted);font-size:0.85rem;text-align:center\\'>▶ Video player loads here in the full app</div>'">
              <svg viewBox="0 0 24 24" fill="white" width="28" height="28"><polygon points="5 3 19 12 5 21 5 3"/></svg>
            </button>
            <span class="lp-video-label">${c.videoLabel || lesson.title}</span>
            <span class="lp-video-dur">${lesson.duration}</span>
          </div>
        </div>
      `;
    }
  } else {
    /* Exercise-only banner — replaces the video area visually */
    html += `
      <div class="lp-exercise-hero-banner">
        <div class="lp-exhb-icon">✏️</div>
        <div class="lp-exhb-text">
          <h3>${lesson.title}</h3>
          <p>${lesson.subtitle} — work through the exercises below to complete this lesson</p>
        </div>
        <div class="lp-exhb-badge">Exercise Lesson</div>
      </div>
    `;
  }

  /* ── BODY CONTENT ───────────────────────────────────────── */
  html += `<div class="lp-lesson-body">`;

  if (c.desc) {
    html += `<p class="lp-lesson-desc">${c.desc}</p>`;
  }

  if (c.notation) {
    html += `<div class="lp-notation">${c.notation.replace(/\n/g, '<br>')}</div>`;
  }

  if (c.concepts && c.concepts.length) {
    html += `
      <div class="lp-concepts">
        <h3>Key Concepts</h3>
        <div class="lp-concept-grid">
          ${c.concepts.map(cn => `
            <div class="lp-concept-card">
              <h4>${cn.title}</h4>
              <p>${cn.body}</p>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /* Main exercise */
  if (c.exercise) {
    html += buildExerciseHTML(c.exercise, 'lessonExercise', 0);
  }

  /* Extra exercises (for exercise-only lessons like l1-3) */
  if (isExerciseOnly && c.extraExercises && c.extraExercises.length) {
    c.extraExercises.forEach((ex, i) => {
      html += buildExerciseHTML(ex, `extraExercise_${i}`, i + 1);
    });
  }

  if (c.takeaways && c.takeaways.length) {
    html += `
      <div class="lp-takeaways">
        <h3>✅ Key Takeaways</h3>
        <ul>
          ${c.takeaways.map(t => `<li>${t}</li>`).join('')}
        </ul>
      </div>
    `;
  }

  html += `</div>`;
  return html;
}

function buildExerciseHTML(ex, containerId, exerciseNum) {
  const opts = ex.options.map((opt, i) => `
    <button class="lp-ex-option"
      onclick="answerExercise(this, ${i}, ${ex.correct}, '${ex.explanation.replace(/'/g, "\\'")}', '${containerId}')">
      ${opt}
    </button>
  `).join('');

  const label = exerciseNum === 0 ? '✏️ Quick Check' : `✏️ Exercise ${exerciseNum + 1}`;

  return `
    <div class="lp-exercise" id="${containerId}">
      <h3>
        ${label}
        <span class="lp-exercise-badge">Exercise</span>
      </h3>
      <p class="lp-exercise-prompt">${ex.prompt}</p>
      <div class="lp-exercise-options" id="${containerId}_opts">
        ${opts}
      </div>
      <div class="lp-exercise-feedback" id="${containerId}_feedback"></div>
    </div>
  `;
}

function answerExercise(btn, chosen, correct, explanation, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const options  = container.querySelectorAll('.lp-ex-option');
  const feedback = document.getElementById(`${containerId}_feedback`);

  // Prevent double-answering this specific exercise block
  if (container.dataset.answered) return;
  container.dataset.answered = 'true';

  const isRight = chosen === correct;

  options.forEach((opt, i) => {
    opt.disabled = true;
    if (i === correct) opt.classList.add('correct');
    if (i === chosen && !isRight) opt.classList.add('wrong');
  });

  feedback.classList.add('show', isRight ? 'correct' : 'wrong');
  feedback.textContent = isRight
    ? `✓ Correct! ${explanation}`
    : `✗ Not quite. ${explanation}`;

  // For exercise-only lessons: mark all exercises answered when last one is answered
  if (containerId === 'lessonExercise') exerciseAnswered = true;
}

function navigateLesson(direction) {
  const mod = LP_DATA[currentModuleIndex];
  const newIdx = currentLessonIndex + direction;
  if (newIdx < 0 || newIdx >= mod.lessons.length) return;
  currentLessonIndex = newIdx;
  exerciseAnswered   = false;
  currentExerciseIdx = 0;

  const completed = getCompleted();
  const lesson    = mod.lessons[newIdx];
  const isDone    = completed.includes(lesson.id);
  buildModalContent(mod, lesson, newIdx, isDone);
}


/* ═══════════════════════════════════════════════════════
   COMPLETE LESSON
   ═══════════════════════════════════════════════════════ */
function completeLesson(mod, lesson) {
  const xpResult = HarmoniaDB.completeLesson(lesson.id, mod.title);
  HarmoniaDB.checkAndUpdateStreak();

  const btn = document.getElementById('lp-complete-btn');
  btn.innerHTML = '✓ Completed';
  btn.classList.add('done');
  btn.disabled = true;

  showXPToast(`+${lesson.xp} XP`, `Lesson complete: ${lesson.title}`);

  const snap = HarmoniaDB.getSnapshot();
  if (xpResult > 0 && snap.levelInfo.level > 1) {
    const prevXP   = snap.levelInfo.currentXP - xpResult;
    const prevLevel = HarmoniaDB.getLevelProgress(prevXP).level;
    if (snap.levelInfo.level > prevLevel) {
      setTimeout(() => showLevelUp(snap.levelInfo.level, snap.levelInfo.title), 1200);
    }
  }

  launchConfetti();
  renderSidebar();
  renderModuleContent(currentModuleIndex);
  updateHeroStats();
}


/* ═══════════════════════════════════════════════════════
   XP TOAST
   ═══════════════════════════════════════════════════════ */
function showXPToast(xpText, label) {
  const toast = document.getElementById('lpXPToast');
  if (!toast) return;
  document.getElementById('lp-toast-xp').textContent    = xpText;
  document.getElementById('lp-toast-label').textContent = label;
  toast.classList.add('show');
  clearTimeout(window._lpToastTimer);
  window._lpToastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}


/* ═══════════════════════════════════════════════════════
   LEVEL UP
   ═══════════════════════════════════════════════════════ */
function showLevelUp(level, title) {
  const overlay = document.getElementById('lpLevelUpOverlay');
  if (!overlay) return;
  document.getElementById('lp-levelup-num').textContent   = `Level ${level}!`;
  document.getElementById('lp-levelup-title').textContent = `You are now a ${title}`;
  overlay.classList.add('show');
  launchConfetti(60);
}

function dismissLevelUp() {
  document.getElementById('lpLevelUpOverlay').classList.remove('show');
}


/* ═══════════════════════════════════════════════════════
   CONFETTI
   ═══════════════════════════════════════════════════════ */
function launchConfetti(count = 30) {
  const colors = ['#a78bfa', '#ec4899', '#38bdf8', '#fbbf24', '#34d399', '#f97316'];
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'lp-confetti-particle';
      el.style.cssText = `
        left: ${Math.random() * 100}vw;
        top: -10px;
        background: ${colors[Math.floor(Math.random() * colors.length)]};
        width: ${6 + Math.random() * 8}px;
        height: ${6 + Math.random() * 8}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '2px'};
        animation-duration: ${1.5 + Math.random() * 2}s;
        animation-delay: ${Math.random() * 0.5}s;
      `;
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 4000);
    }, i * 40);
  }
}


/* ═══════════════════════════════════════════════════════
   SEARCH
   ═══════════════════════════════════════════════════════ */
function setupSearch() {
  const input = document.getElementById('lpSearchInput');
  if (!input) return;

  input.addEventListener('input', () => {
    const q = input.value.trim().toLowerCase();
    if (!q) { renderModuleContent(currentModuleIndex); return; }

    const lessonList = document.getElementById('lpLessonList');
    const completed  = getCompleted();
    const mod = LP_DATA[currentModuleIndex];
    const filtered = mod.lessons.filter(l =>
      l.title.toLowerCase().includes(q) ||
      l.subtitle.toLowerCase().includes(q) ||
      l.type.toLowerCase().includes(q)
    );

    if (filtered.length === 0) {
      lessonList.innerHTML = `<p style="color:var(--muted);font-size:0.85rem;padding:16px 0;">No lessons match "<strong>${q}</strong>"</p>`;
      return;
    }

    lessonList.innerHTML = filtered.map((lesson) => {
      const isDone = completed.includes(lesson.id);
      return buildLessonItem(lesson, mod.lessons.indexOf(lesson), isDone, false);
    }).join('');
  });
}


/* ═══════════════════════════════════════════════════════
   KEYBOARD NAV
   ═══════════════════════════════════════════════════════ */
function setupKeyboard() {
  document.addEventListener('keydown', (e) => {
    if (!modalOpen) return;
    if (e.key === 'Escape')     closeModal();
    if (e.key === 'ArrowRight') navigateLesson(1);
    if (e.key === 'ArrowLeft')  navigateLesson(-1);
  });
}


/* ═══════════════════════════════════════════════════════
   NEXT MODULE
   ═══════════════════════════════════════════════════════ */
function goToNextModule() {
  const next = currentModuleIndex + 1;
  if (next < LP_DATA.length) {
    switchModule(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
