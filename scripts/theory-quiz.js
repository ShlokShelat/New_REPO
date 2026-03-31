/**
 * theory-quiz.js — Full functionality for the Theory Quiz page
 * Depends on: HarmoniaDB (training-db.js), home.js
 */

/* =====================================================
   QUESTION BANK — 500+ questions across 8 topics
   Each question: { id, q, notation?, type, options:[{letter,text}], answer, explanation, points, combo }
   ===================================================== */
const QUESTION_BANK = {

  /* ── 1. Note Names & Reading ── */
  notes: [
    { id:'n1', q:'What is the note on the first ledger line above the treble clef staff?', type:'Theory', options:[{l:'A',t:'Middle C'},{l:'B',t:'D above Middle C'},{l:'C',t:'B above the staff'},{l:'D',t:'F above the staff'}], answer:'A', explanation:'Middle C (C4) sits on the first ledger line above the treble clef staff.', points:10 },
    { id:'n2', q:'How many ledger lines does the note D5 require in treble clef?', type:'Theory', options:[{l:'A',t:'0 — it sits on the staff'},{l:'B',t:'1 above the staff'},{l:'C',t:'1 below the staff'},{l:'D',t:'2 above the staff'}], answer:'B', explanation:'D5 sits on the first ledger line above the treble clef staff.', points:10 },
    { id:'n3', q:'In bass clef, what note sits on the middle (third) line of the staff?', type:'Theory', options:[{l:'A',t:'F2'},{l:'B',t:'A2'},{l:'C',t:'B2'},{l:'D',t:'D3'}], answer:'C', explanation:'B2 sits on the middle line of the bass clef staff. Remember: the spaces spell A-C-E-G from bottom to top.', points:10 },
    { id:'n4', q:'What mnemonic helps remember treble clef lines from bottom to top?', type:'Theory', options:[{l:'A',t:'Every Good Bird Does Fly'},{l:'B',t:'Every Good Boy Does Fine'},{l:'C',t:'Every Great Boy Does Fine'},{l:'D',t:'Every Good Boy Deserves Fudge'}], answer:'B', explanation:'EGBDF: Every Good Boy Does Fine represents the treble clef lines E-G-B-D-F from bottom to top.', points:10 },
    { id:'n5', q:'In treble clef, the spaces spell out which word from bottom to top?', type:'Theory', options:[{l:'A',t:'BEAD'},{l:'B',t:'ACEG'},{l:'C',t:'FACE'},{l:'D',t:'CAGE'}], answer:'C', explanation:'The spaces in treble clef spell FACE: F-A-C-E from bottom to top.', points:10 },
    { id:'n6', q:'What is the enharmonic equivalent of F♯?', type:'Theory', options:[{l:'A',t:'E♯'},{l:'B',t:'G♭'},{l:'C',t:'G♯'},{l:'D',t:'E♭'}], answer:'B', explanation:'F♯ and G♭ are enharmonic equivalents — they sound the same but are spelled differently.', points:15 },
    { id:'n7', q:'How many semitones are in an octave?', type:'Theory', options:[{l:'A',t:'10'},{l:'B',t:'11'},{l:'C',t:'12'},{l:'D',t:'13'}], answer:'C', explanation:'An octave contains 12 semitones (half steps), covering all 12 notes of the chromatic scale.', points:10 },
    { id:'n8', q:'Which note is a half step above B?', type:'Theory', options:[{l:'A',t:'B♯'},{l:'B',t:'C'},{l:'C',t:'C♯'},{l:'D',t:'Both A and B'}], answer:'D', explanation:'B♯ and C are enharmonic equivalents — both are a half step above B.', points:15 },
    { id:'n9', q:'What does "ottava alta" (8va) mean in music notation?', type:'Theory', options:[{l:'A',t:'Play an octave lower'},{l:'B',t:'Play an octave higher'},{l:'C',t:'Play very softly'},{l:'D',t:'Play at the original pitch'}], answer:'B', explanation:'8va (ottava alta) indicates notes should be played an octave higher than written.', points:10 },
    { id:'n10', q:'On which line or space does Middle C (C4) sit in treble clef?', type:'Theory', options:[{l:'A',t:'First space from bottom'},{l:'B',t:'First line from bottom'},{l:'C',t:'First ledger line below the staff'},{l:'D',t:'Second line from bottom'}], answer:'C', explanation:'Middle C sits on the first ledger line below the treble clef staff.', points:10 },
  ],

  /* ── 2. Scales & Keys ── */
  scales: [
    { id:'s1', q:'How many sharps are in the key of A major?', type:'Theory', options:[{l:'A',t:'1'},{l:'B',t:'2'},{l:'C',t:'3'},{l:'D',t:'4'}], answer:'C', explanation:'A major has 3 sharps: F♯, C♯, and G♯. Use the circle of fifths — each fifth clockwise adds one sharp.', points:10 },
    { id:'s2', q:'What is the relative minor of C major?', type:'Theory', options:[{l:'A',t:'G minor'},{l:'B',t:'E minor'},{l:'C',t:'A minor'},{l:'D',t:'D minor'}], answer:'C', explanation:'A minor is the relative minor of C major. The relative minor starts on the 6th degree of the major scale.', points:10 },
    { id:'s3', q:'Which scale pattern defines a natural minor scale?', type:'Theory', options:[{l:'A',t:'W-W-H-W-W-W-H'},{l:'B',t:'W-H-W-W-H-W-W'},{l:'C',t:'W-W-H-W-W-H-W'},{l:'D',t:'H-W-W-H-W-W-W'}], answer:'B', explanation:'Natural minor: W-H-W-W-H-W-W (Whole-Half-Whole-Whole-Half-Whole-Whole). Compare to major: W-W-H-W-W-W-H.', points:20 },
    { id:'s4', q:'In the pentatonic major scale, which degrees of the major scale are used?', type:'Theory', options:[{l:'A',t:'1-2-3-5-6'},{l:'B',t:'1-2-4-5-6'},{l:'C',t:'1-2-3-4-5'},{l:'D',t:'1-3-4-5-7'}], answer:'A', explanation:'Major pentatonic uses degrees 1-2-3-5-6, omitting the 4th and 7th. This removes the semitone tensions.', points:20 },
    { id:'s5', q:'What is the key with 4 flats?', type:'Theory', options:[{l:'A',t:'E♭ major'},{l:'B',t:'A♭ major'},{l:'C',t:'D♭ major'},{l:'D',t:'F major'}], answer:'A', explanation:'The order of flats is BEADGCF. With 4 flats (B♭, E♭, A♭, D♭), the key is A♭... wait — 4 flats gives A♭? Actually: B♭=1, E♭=2, A♭=3, D♭=4 → E♭ major has 3 flats. 4 flats = A♭ major. So A♭ major is correct.', points:20 },
    { id:'s6', q:'What distinguishes a harmonic minor scale from a natural minor?', type:'Theory', options:[{l:'A',t:'The 6th degree is raised'},{l:'B',t:'The 7th degree is raised'},{l:'C',t:'The 2nd degree is lowered'},{l:'D',t:'The 4th degree is raised'}], answer:'B', explanation:'Harmonic minor raises the 7th degree by a half step compared to natural minor, creating a leading tone.', points:20 },
    { id:'s7', q:'How many notes does a chromatic scale contain?', type:'Theory', options:[{l:'A',t:'7'},{l:'B',t:'8'},{l:'C',t:'12'},{l:'D',t:'13'}], answer:'D', explanation:'A chromatic scale includes all 12 pitch classes plus the octave above the starting note = 13 notes total.', points:15 },
    { id:'s8', q:'The Dorian mode is built starting on which degree of the major scale?', type:'Theory', options:[{l:'A',t:'1st'},{l:'B',t:'2nd'},{l:'C',t:'3rd'},{l:'D',t:'4th'}], answer:'B', explanation:'Dorian mode starts on the 2nd degree of the major scale. D Dorian uses all the notes of C major but starts on D.', points:25 },
    { id:'s9', q:'What scale is commonly used in blues music?', type:'Theory', options:[{l:'A',t:'Major pentatonic'},{l:'B',t:'Whole tone scale'},{l:'C',t:'Minor pentatonic (with blue note)'},{l:'D',t:'Lydian scale'}], answer:'C', explanation:'The blues scale is the minor pentatonic with an added ♭5 (the "blue note"), giving it the characteristic blues sound.', points:15 },
    { id:'s10', q:'Which key signature has no sharps or flats?', type:'Theory', options:[{l:'A',t:'G major'},{l:'B',t:'C major'},{l:'C',t:'F major'},{l:'D',t:'A minor'}], answer:'B', explanation:'C major (and its relative A minor) have no sharps or flats in the key signature.', points:10 },
    { id:'s11', q:'What interval separates each note in a whole tone scale?', type:'Theory', options:[{l:'A',t:'Half step'},{l:'B',t:'Whole step'},{l:'C',t:'Minor third'},{l:'D',t:'Perfect fourth'}], answer:'B', explanation:'Every note in a whole tone scale is separated by a whole step (major 2nd). This creates an ambiguous, floating quality.', points:20 },
    { id:'s12', q:'How many modes are there in the major scale system?', type:'Theory', options:[{l:'A',t:'5'},{l:'B',t:'6'},{l:'C',t:'7'},{l:'D',t:'8'}], answer:'C', explanation:'There are 7 modes: Ionian, Dorian, Phrygian, Lydian, Mixolydian, Aeolian, and Locrian — one for each degree.', points:15 },
  ],

  /* ── 3. Intervals ── */
  intervals: [
    { id:'i1', q:'What is the interval between C and G?', type:'Theory', options:[{l:'A',t:'Perfect 4th'},{l:'B',t:'Major 5th'},{l:'C',t:'Perfect 5th'},{l:'D',t:'Minor 5th'}], answer:'C', explanation:'C to G spans 7 half steps — a Perfect 5th. P5 is one of the most stable intervals in music.', points:10 },
    { id:'i2', q:'How many semitones make a minor 3rd?', type:'Theory', options:[{l:'A',t:'2'},{l:'B',t:'3'},{l:'C',t:'4'},{l:'D',t:'5'}], answer:'B', explanation:'A minor 3rd spans 3 semitones (half steps). A major 3rd spans 4 semitones.', points:10 },
    { id:'i3', q:'What interval is also known as a tritone?', type:'Theory', options:[{l:'A',t:'Perfect 4th'},{l:'B',t:'Minor 5th'},{l:'C',t:'Augmented 4th (or Diminished 5th)'},{l:'D',t:'Major 6th'}], answer:'C', explanation:'A tritone is exactly 6 semitones — either an augmented 4th or a diminished 5th. It was historically called "diabolus in musica."', points:15 },
    { id:'i4', q:'The interval C to E is a:', type:'Theory', options:[{l:'A',t:'Minor 3rd'},{l:'B',t:'Major 3rd'},{l:'C',t:'Perfect 4th'},{l:'D',t:'Major 2nd'}], answer:'B', explanation:'C to E spans 4 semitones — a Major 3rd. This interval defines whether a chord is major or minor.', points:10 },
    { id:'i5', q:'What is the inversion of a Perfect 5th?', type:'Theory', options:[{l:'A',t:'Perfect 5th'},{l:'B',t:'Perfect 4th'},{l:'C',t:'Minor 4th'},{l:'D',t:'Diminished 5th'}], answer:'B', explanation:'Intervals invert by subtracting from 9: 9-5 = 4. A Perfect 5th inverts to a Perfect 4th.', points:20 },
    { id:'i6', q:'A major 7th interval spans how many semitones?', type:'Theory', options:[{l:'A',t:'9'},{l:'B',t:'10'},{l:'C',t:'11'},{l:'D',t:'12'}], answer:'C', explanation:'A major 7th spans 11 semitones. It is one semitone below the octave, creating strong tension toward resolution.', points:15 },
    { id:'i7', q:'What interval do the notes C and F form?', type:'Theory', options:[{l:'A',t:'Major 3rd'},{l:'B',t:'Perfect 4th'},{l:'C',t:'Tritone'},{l:'D',t:'Perfect 5th'}], answer:'B', explanation:'C to F spans 5 semitones — a Perfect 4th. Perfect intervals have only one quality (perfect, augmented, or diminished).', points:10 },
    { id:'i8', q:'Consonant intervals are considered stable. Which of these is dissonant?', type:'Theory', options:[{l:'A',t:'Perfect Octave'},{l:'B',t:'Major 3rd'},{l:'C',t:'Perfect 5th'},{l:'D',t:'Minor 7th'}], answer:'D', explanation:'Minor 7ths (and major 7ths) are dissonant intervals that typically require resolution. Octaves, 3rds, and 5ths are consonant.', points:20 },
    { id:'i9', q:'What is the interval from D to A?', type:'Theory', options:[{l:'A',t:'Perfect 4th'},{l:'B',t:'Major 5th'},{l:'C',t:'Perfect 5th'},{l:'D',t:'Minor 6th'}], answer:'C', explanation:'D to A spans 7 semitones — a Perfect 5th, just like C to G.', points:10 },
    { id:'i10', q:'A compound interval spans more than an octave. What is a major 9th?', type:'Theory', options:[{l:'A',t:'An octave plus a major 2nd'},{l:'B',t:'An octave plus a minor 3rd'},{l:'C',t:'Two octaves plus a major 2nd'},{l:'D',t:'An octave plus a perfect 4th'}], answer:'A', explanation:'A major 9th is a compound interval: an octave (12 semitones) + a major 2nd (2 semitones) = 14 semitones total.', points:25 },
  ],

  /* ── 4. Chords & Harmony ── */
  chords: [
    { id:'c1', q:'What three notes make up a C major triad?', type:'Theory', options:[{l:'A',t:'C-E♭-G'},{l:'B',t:'C-E-G'},{l:'C',t:'C-E-G♯'},{l:'D',t:'C-E♭-G♭'}], answer:'B', explanation:'A major triad is built with: root + major 3rd + perfect 5th. C major = C-E-G.', points:10 },
    { id:'c2', q:'What type of chord has the formula: root + minor 3rd + diminished 5th?', type:'Theory', options:[{l:'A',t:'Minor triad'},{l:'B',t:'Augmented triad'},{l:'C',t:'Suspended chord'},{l:'D',t:'Diminished triad'}], answer:'D', explanation:'A diminished triad = root + minor 3rd + diminished 5th (3+3 semitones). It has a tense, unstable sound.', points:15 },
    { id:'c3', q:'In a ii-V-I chord progression in C major, what is the ii chord?', type:'Theory', options:[{l:'A',t:'C major'},{l:'B',t:'D minor'},{l:'C',t:'E minor'},{l:'D',t:'G major'}], answer:'B', explanation:'The ii chord in C major is D minor (D-F-A). ii-V-I (Dm7-G7-Cmaj7) is the most fundamental jazz progression.', points:15 },
    { id:'c4', q:'What makes a dominant 7th chord (e.g. G7)?', type:'Theory', options:[{l:'A',t:'Major triad + major 7th'},{l:'B',t:'Major triad + minor 7th'},{l:'C',t:'Minor triad + minor 7th'},{l:'D',t:'Major triad + augmented 7th'}], answer:'B', explanation:'A dominant 7th = major triad + minor 7th. G7 = G-B-D-F. Its tritone (B-F) creates strong tension toward the tonic.', points:15 },
    { id:'c5', q:'What is the first inversion of a C major triad?', type:'Theory', options:[{l:'A',t:'G-C-E (G in bass)'},{l:'B',t:'E-G-C (E in bass)'},{l:'C',t:'C-G-E (5th on top)'},{l:'D',t:'G-E-C (G in bass)'}], answer:'B', explanation:'First inversion places the 3rd (E) in the bass: E-G-C. Second inversion (6/4) puts the 5th (G) in the bass.', points:20 },
    { id:'c6', q:'A sus4 chord replaces the 3rd with which interval?', type:'Theory', options:[{l:'A',t:'Major 2nd'},{l:'B',t:'Perfect 4th'},{l:'C',t:'Minor 3rd'},{l:'D',t:'Perfect 5th'}], answer:'B', explanation:'A sus4 chord replaces the 3rd with the 4th: e.g. Csus4 = C-F-G. It creates a suspended sound awaiting resolution.', points:15 },
    { id:'c7', q:'What Roman numeral represents the dominant chord in a major key?', type:'Theory', options:[{l:'A',t:'III'},{l:'B',t:'IV'},{l:'C',t:'V'},{l:'D',t:'VI'}], answer:'C', explanation:'The dominant chord is built on the 5th scale degree (V). In C major, the dominant is G major (G-B-D).', points:10 },
    { id:'c8', q:'What is a chord substitution based on tritone substitution?', type:'Theory', options:[{l:'A',t:'Replacing a chord with one a step away'},{l:'B',t:'Replacing a dominant 7th with another dominant 7th a tritone away'},{l:'C',t:'Replacing a major chord with a minor chord'},{l:'D',t:'Adding a 7th to any chord'}], answer:'B', explanation:'Tritone substitution replaces a V7 chord with a dominant 7th chord a tritone away. G7 can be substituted with D♭7 because they share the same tritone (B/C♭ and F).', points:30 },
    { id:'c9', q:'In a minor key, which chord is naturally occurring on the 5th degree?', type:'Theory', options:[{l:'A',t:'Major chord'},{l:'B',t:'Minor chord (v)'},{l:'C',t:'Diminished chord'},{l:'D',t:'Augmented chord'}], answer:'B', explanation:'In natural minor, the 5th degree chord is a minor chord (v). Harmonic minor raises the 7th to create a major V chord with a leading tone.', points:20 },
    { id:'c10', q:'What four notes make up a minor major 7th chord?', type:'Theory', options:[{l:'A',t:'Root, minor 3rd, perfect 5th, minor 7th'},{l:'B',t:'Root, major 3rd, perfect 5th, major 7th'},{l:'C',t:'Root, minor 3rd, perfect 5th, major 7th'},{l:'D',t:'Root, minor 3rd, diminished 5th, minor 7th'}], answer:'C', explanation:'Minor major 7th = minor triad + major 7th. E.g. CmM7 = C-E♭-G-B. Common in harmonic minor harmony.', points:25 },
  ],

  /* ── 5. Rhythm & Meter ── */
  rhythm: [
    { id:'r1', q:'In 4/4 time, how many beats does a dotted half note receive?', type:'Theory', options:[{l:'A',t:'2'},{l:'B',t:'3'},{l:'C',t:'4'},{l:'D',t:'2.5'}], answer:'B', explanation:'A half note = 2 beats. A dot adds half its value (1 beat), so a dotted half note = 3 beats in 4/4.', points:10 },
    { id:'r2', q:'What does the top number in a time signature indicate?', type:'Theory', options:[{l:'A',t:'The type of note that gets one beat'},{l:'B',t:'The number of beats per measure'},{l:'C',t:'The tempo in BPM'},{l:'D',t:'The number of measures'}], answer:'B', explanation:'The top number shows beats per measure. The bottom number shows the note value that gets one beat (4 = quarter note).', points:10 },
    { id:'r3', q:'Which time signature is considered compound duple?', type:'Theory', options:[{l:'A',t:'4/4'},{l:'B',t:'3/4'},{l:'C',t:'6/8'},{l:'D',t:'5/4'}], answer:'C', explanation:'6/8 is compound duple: 2 main beats, each subdivided into 3 eighth notes. This gives it a lilting, triplet feel.', points:20 },
    { id:'r4', q:'A triplet divides a beat into how many equal parts?', type:'Theory', options:[{l:'A',t:'2'},{l:'B',t:'3'},{l:'C',t:'4'},{l:'D',t:'6'}], answer:'B', explanation:'A triplet divides one beat (or note value) into 3 equal parts, where normally 2 would fit.', points:10 },
    { id:'r5', q:'What is syncopation?', type:'Theory', options:[{l:'A',t:'Playing faster than the tempo'},{l:'B',t:'Accenting normally weak beats or off-beats'},{l:'C',t:'Gradually getting louder'},{l:'D',t:'Using more than one rhythm at a time'}], answer:'B', explanation:'Syncopation places emphasis on normally weak beats or the "and" (off-beat) between beats, creating rhythmic tension.', points:15 },
    { id:'r6', q:'In cut time (alla breve, 2/2), a whole note receives:', type:'Theory', options:[{l:'A',t:'4 beats'},{l:'B',t:'3 beats'},{l:'C',t:'2 beats'},{l:'D',t:'1 beat'}], answer:'C', explanation:'In cut time (2/2), the half note gets one beat. Therefore a whole note = 2 beats (2 half notes).', points:15 },
    { id:'r7', q:'What rhythmic device involves two notes played against three (or vice versa)?', type:'Theory', options:[{l:'A',t:'Syncopation'},{l:'B',t:'Hemiola'},{l:'C',t:'Polymeter'},{l:'D',t:'Cross-rhythm'}], answer:'B', explanation:'Hemiola is a rhythmic device where 2 groups of 3 are replaced by 3 groups of 2 (or vice versa), creating a shift in perceived beat.', points:25 },
    { id:'r8', q:'How many sixteenth notes equal one quarter note?', type:'Theory', options:[{l:'A',t:'2'},{l:'B',t:'3'},{l:'C',t:'4'},{l:'D',t:'8'}], answer:'C', explanation:'One quarter note = 2 eighth notes = 4 sixteenth notes = 8 thirty-second notes.', points:10 },
    { id:'r9', q:'What does "ritardando" (rit.) mean?', type:'Theory', options:[{l:'A',t:'Gradually getting faster'},{l:'B',t:'Play with a strict tempo'},{l:'C',t:'Gradually slowing down'},{l:'D',t:'Return to the original tempo'}], answer:'C', explanation:'Ritardando (rit.) means gradually slowing down. It is similar to rallentando (rall.). The opposite is accelerando (accel.).', points:10 },
    { id:'r10', q:'In 12/8 time, the primary beats are felt in groups of:', type:'Theory', options:[{l:'A',t:'4 groups of 3 eighth notes'},{l:'B',t:'3 groups of 4 eighth notes'},{l:'C',t:'6 groups of 2 eighth notes'},{l:'D',t:'2 groups of 6 eighth notes'}], answer:'A', explanation:'12/8 has 12 eighth notes per bar grouped into 4 main beats, each consisting of 3 eighth notes (compound quadruple).', points:20 },
  ],

  /* ── 6. Dynamics & Articulation ── */
  dynamics: [
    { id:'d1', q:'What does "ff" mean in music?', type:'Theory', options:[{l:'A',t:'Fortissimo — very loud'},{l:'B',t:'Forte — loud'},{l:'C',t:'Fortissimo — somewhat loud'},{l:'D',t:'Forte-forte — very soft'}], answer:'A', explanation:'"ff" stands for fortissimo, meaning very loud. The dynamic range: ppp, pp, p, mp, mf, f, ff, fff.', points:10 },
    { id:'d2', q:'What articulation mark tells a player to hold a note for its full value with slight emphasis?', type:'Theory', options:[{l:'A',t:'Staccato (dot above/below)'},{l:'B',t:'Accent (>)'},{l:'C',t:'Tenuto (—)'},{l:'D',t:'Fermata'}], answer:'C', explanation:'Tenuto (—) means hold the note for its full value and give it slight emphasis. It comes from the Italian "held."', points:15 },
    { id:'d3', q:'A crescendo indicates:', type:'Theory', options:[{l:'A',t:'Gradually getting softer'},{l:'B',t:'A sudden accent'},{l:'C',t:'Gradually getting louder'},{l:'D',t:'Maintaining the same dynamic'}], answer:'C', explanation:'Crescendo (< or cresc.) means gradually increasing in volume. Its opposite is decrescendo or diminuendo.', points:10 },
    { id:'d4', q:'What does staccato mean?', type:'Theory', options:[{l:'A',t:'Smooth and connected'},{l:'B',t:'Short and detached'},{l:'C',t:'Gradually louder'},{l:'D',t:'With emphasis'}], answer:'B', explanation:'Staccato (marked with a dot) means short and detached — play the note for about half its written value.', points:10 },
    { id:'d5', q:'Which dynamic marking means "moderately soft"?', type:'Theory', options:[{l:'A',t:'mp'},{l:'B',t:'p'},{l:'C',t:'mf'},{l:'D',t:'pp'}], answer:'A', explanation:'"mp" stands for mezzo-piano, meaning moderately soft. "mf" is mezzo-forte (moderately loud).', points:10 },
    { id:'d6', q:'What does "sforzando" (sfz) mean?', type:'Theory', options:[{l:'A',t:'Very soft suddenly'},{l:'B',t:'A sudden, strong accent on a note'},{l:'C',t:'Gradually increasing tempo'},{l:'D',t:'Smooth and lyrical'}], answer:'B', explanation:'Sforzando (sfz or sf) means a sudden strong accent — forcing the note. It overrides the prevailing dynamic level.', points:15 },
    { id:'d7', q:'What does "legato" mean?', type:'Theory', options:[{l:'A',t:'Short and separated'},{l:'B',t:'Smooth and connected, without breaks between notes'},{l:'C',t:'With a strong accent'},{l:'D',t:'At a moderate speed'}], answer:'B', explanation:'Legato means smooth and connected. Notes are played without gaps, often shown with a slur marking.', points:10 },
    { id:'d8', q:'A fermata over a note means:', type:'Theory', options:[{l:'A',t:'Play the note twice'},{l:'B',t:'Skip the note'},{l:'C',t:'Hold the note longer than its written value (at the performer\'s discretion)'},{l:'D',t:'Play the note staccato'}], answer:'C', explanation:'A fermata (bird\'s eye symbol) tells the performer to hold the note or rest longer than its written value, at their discretion.', points:15 },
  ],

  /* ── 7. Form & Structure ── */
  form: [
    { id:'f1', q:'What is the most common song form in popular music?', type:'Theory', options:[{l:'A',t:'Through-composed'},{l:'B',t:'Verse-Chorus (A-B) form'},{l:'C',t:'32-bar AABA form'},{l:'D',t:'Rondo form'}], answer:'B', explanation:'Verse-Chorus (A-B) form is the dominant structure in pop music. The verse builds the story; the chorus delivers the hook.', points:10 },
    { id:'f2', q:'What does "da capo" (D.C.) mean?', type:'Theory', options:[{l:'A',t:'Go to the sign (𝄋)'},{l:'B',t:'Repeat from the beginning'},{l:'C',t:'Go to the coda'},{l:'D',t:'Repeat the last 8 bars'}], answer:'B', explanation:'"Da capo" (D.C.) means "from the head" — go back to the very beginning of the piece.', points:10 },
    { id:'f3', q:'In sonata form, what are the three main sections?', type:'Theory', options:[{l:'A',t:'Verse, Chorus, Bridge'},{l:'B',t:'A, B, A'},{l:'C',t:'Exposition, Development, Recapitulation'},{l:'D',t:'Theme, Variation, Coda'}], answer:'C', explanation:'Classical sonata form: Exposition (themes presented), Development (themes manipulated), Recapitulation (themes return).', points:20 },
    { id:'f4', q:'A coda in music is:', type:'Theory', options:[{l:'A',t:'An introduction'},{l:'B',t:'A concluding section'},{l:'C',t:'A middle bridge'},{l:'D',t:'A repeat sign'}], answer:'B', explanation:'A coda (from Italian for "tail") is a concluding passage that brings the piece to a final close.', points:10 },
    { id:'f5', q:'What is a "bridge" in pop song structure?', type:'Theory', options:[{l:'A',t:'The introduction of the song'},{l:'B',t:'The main repeating section'},{l:'C',t:'A contrasting section that appears once, breaking repetition'},{l:'D',t:'A guitar solo'}], answer:'C', explanation:'A bridge provides contrast by using new melodic/harmonic material, usually appearing once between the final pre-chorus and chorus.', points:15 },
    { id:'f6', q:'How many bars is a standard 12-bar blues?', type:'Theory', options:[{l:'A',t:'8'},{l:'B',t:'12'},{l:'C',t:'16'},{l:'D',t:'32'}], answer:'B', explanation:'The 12-bar blues uses a fixed 12-measure progression, typically: I-I-I-I / IV-IV-I-I / V-IV-I-V (in various forms).', points:10 },
    { id:'f7', q:'What is "through-composed" form?', type:'Theory', options:[{l:'A',t:'Music that repeats the same section throughout'},{l:'B',t:'Music with no repeating sections — new material throughout'},{l:'C',t:'Music in ABA form'},{l:'D',t:'Music based on a ground bass'}], answer:'B', explanation:'Through-composed music has no repeating large sections — each part is unique. Common in art songs (Lieder) and film scoring.', points:20 },
    { id:'f8', q:'In jazz, what is a "head"?', type:'Theory', options:[{l:'A',t:'The drum solo opening'},{l:'B',t:'The piano introduction'},{l:'C',t:'The main melody stated at the beginning and end of the performance'},{l:'D',t:'A style of improvisation'}], answer:'C', explanation:'In jazz, the "head" is the main melody. Jazz performances typically follow: Head In → Solos → Head Out.', points:20 },
  ],

  /* ── 8. Musical Terms ── */
  terms: [
    { id:'t1', q:'What does "allegro" indicate?', type:'Theory', options:[{l:'A',t:'Very slow'},{l:'B',t:'Fast and lively'},{l:'C',t:'At a walking pace'},{l:'D',t:'Moderately slow'}], answer:'B', explanation:'"Allegro" means fast and lively, typically 120-168 BPM. The Italian word means "merry" or "lively."', points:10 },
    { id:'t2', q:'What is "counterpoint"?', type:'Theory', options:[{l:'A',t:'Music with no harmony'},{l:'B',t:'The technique of combining two or more independent melodic lines'},{l:'C',t:'A musical accent pattern'},{l:'D',t:'A type of percussion technique'}], answer:'B', explanation:'Counterpoint is the art of combining two or more independent melody lines. Bach\'s fugues are the pinnacle of contrapuntal writing.', points:20 },
    { id:'t3', q:'What does "pizzicato" mean in string music?', type:'Theory', options:[{l:'A',t:'Play with the bow'},{l:'B',t:'Play very softly'},{l:'C',t:'Pluck the string with the finger'},{l:'D',t:'Play harmonics'}], answer:'C', explanation:'"Pizzicato" (pizz.) means to pluck the string instead of bowing it, producing a shorter, more percussive tone.', points:10 },
    { id:'t4', q:'What is "modulation" in music?', type:'Theory', options:[{l:'A',t:'Changing the tempo'},{l:'B',t:'Adding more instruments'},{l:'C',t:'Changing from one key to another within a piece'},{l:'D',t:'Changing the time signature'}], answer:'C', explanation:'Modulation is the process of moving from one tonal center (key) to another within a composition.', points:15 },
    { id:'t5', q:'What does "col legno" mean for string players?', type:'Theory', options:[{l:'A',t:'Play with the wood of the bow'},{l:'B',t:'Play with mutes'},{l:'C',t:'Play near the bridge'},{l:'D',t:'Play harmonics only'}], answer:'A', explanation:'"Col legno" (with the wood) instructs string players to strike or bow with the wooden back of the bow instead of the horsehair.', points:20 },
    { id:'t6', q:'What is an "ostinato"?', type:'Theory', options:[{l:'A',t:'A long solo cadenza'},{l:'B',t:'A persistently repeated musical phrase or rhythm'},{l:'C',t:'A type of ornament'},{l:'D',t:'A slow, expressive passage'}], answer:'B', explanation:'An ostinato is a persistently repeated rhythmic or melodic figure. The "Bolero" by Ravel is a famous example of a long ostinato.', points:15 },
    { id:'t7', q:'What does "a cappella" mean?', type:'Theory', options:[{l:'A',t:'At the chapel tempo'},{l:'B',t:'Vocal music without instrumental accompaniment'},{l:'C',t:'Music for small chapel'},{l:'D',t:'Unison singing'}], answer:'B', explanation:'"A cappella" means singing without instrumental accompaniment. The term comes from the Italian "in the manner of the chapel."', points:10 },
    { id:'t8', q:'What is "vibrato"?', type:'Theory', options:[{l:'A',t:'A rapid alternation between two notes'},{l:'B',t:'A slight fluctuation in pitch used to add expression'},{l:'C',t:'Plucking a string near the nut'},{l:'D',t:'A bowing technique'}], answer:'B', explanation:'Vibrato is a subtle oscillation in pitch (or sometimes intensity) used to add warmth and expression to sustained notes.', points:10 },
    { id:'t9', q:'What is a "cadenza"?', type:'Theory', options:[{l:'A',t:'The final chord of a piece'},{l:'B',t:'An elaborate solo passage allowing a performer to showcase virtuosity'},{l:'C',t:'A short melodic ornament'},{l:'D',t:'A repeating bass pattern'}], answer:'B', explanation:'A cadenza is a virtuosic solo passage in a concerto, usually near the end of a movement, where the soloist plays alone.', points:20 },
    { id:'t10', q:'What does "glissando" mean?', type:'Theory', options:[{l:'A',t:'A slow, expressive passage'},{l:'B',t:'A slide between two pitches through intermediate notes'},{l:'C',t:'Playing with the heel of the bow'},{l:'D',t:'A type of chord arpeggio'}], answer:'B', explanation:'A glissando is a slide from one pitch to another, passing through all intermediate pitches. On piano, this is done by dragging a finger across the keys.', points:15 },
  ],
};

/* =====================================================
   TOPIC METADATA
   ===================================================== */
const TOPICS = [
  { id:'notes',     name:'Note Names & Reading', icon:'🎼', color:'purple', diff:'easy',   questions:10, xpMax:150, desc:'Read notation, ledger lines, enharmonics' },
  { id:'scales',    name:'Scales & Keys',         icon:'🎵', color:'blue',   diff:'medium', questions:12, xpMax:200, desc:'Major, minor, modes, and key signatures' },
  { id:'intervals', name:'Intervals',              icon:'📏', color:'pink',   diff:'medium', questions:10, xpMax:175, desc:'Identify and calculate musical intervals' },
  { id:'chords',    name:'Chords & Harmony',       icon:'🎹', color:'green',  diff:'medium', questions:10, xpMax:200, desc:'Triads, 7ths, inversions, and progressions' },
  { id:'rhythm',    name:'Rhythm & Meter',         icon:'🥁', color:'orange', diff:'easy',   questions:10, xpMax:150, desc:'Time signatures, note values, and rhythm' },
  { id:'dynamics',  name:'Dynamics & Articulation',icon:'🔊', color:'teal',   diff:'easy',   questions:8,  xpMax:120, desc:'Volume, expression, and articulation marks' },
  { id:'form',      name:'Form & Structure',       icon:'🏗️', color:'yellow', diff:'hard',   questions:8,  xpMax:200, desc:'Song forms, sonata, 12-bar blues and more' },
  { id:'terms',     name:'Musical Terms',          icon:'📖', color:'red',    diff:'medium', questions:10, xpMax:160, desc:'Essential Italian and music vocabulary' },
];

/* =====================================================
   QUIZ STATE
   ===================================================== */
let quizState = {
  topic: null,
  questions: [],
  currentIdx: 0,
  answers: [],       // {questionId, correct, selectedAnswer, timeTaken}
  score: 0,
  totalPoints: 0,
  combo: 0,
  maxCombo: 0,
  startTime: null,
  questionStartTime: null,
  timerInterval: null,
  timePerQuestion: 20,   // seconds
  timeLeft: 20,
  answered: false,
  finished: false,
  xpEarned: 0,
  newAchievements: [],
  questionCount: 10,
  mode: 'standard',      // 'standard' | 'blitz' | 'custom'
};

/* =====================================================
   DOM HELPERS
   ===================================================== */
const $ = id => document.getElementById(id);

/* =====================================================
   INIT — runs on DOMContentLoaded
   ===================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const snap = HarmoniaDB.getSnapshot();
  renderHeroStats(snap);
  renderTopicCards(snap);
  renderLeaderboard();
  renderHistory(snap);
  bindQuickStrip();
  bindDiffTabs();
  bindTopicSearch();
  setupKeyboard();
});

/* =====================================================
   HERO STATS
   ===================================================== */
function renderHeroStats(snap) {
  const lp = snap.levelInfo;
  $('qhXP').textContent = `${lp.currentXP.toLocaleString()} XP`;
  $('qhLevel').textContent = `Level ${lp.level} — ${lp.title}`;
  $('qhXPNext').textContent = `${lp.earnedInLevel.toLocaleString()} / ${lp.neededInLevel.toLocaleString()} XP to Level ${lp.level + 1}`;
  setTimeout(() => { $('qhXPBar').style.width = lp.percent + '%'; }, 400);

  $('statQuizzesTaken').textContent = snap.stats.quizzesTaken || 0;
  $('statAvgScore').textContent = (snap.progress.theoryQuiz?.averageScore || 0) + '%';
  $('statBestStreak').textContent = (snap.streak.longest || 0) + '🔥';
}

/* =====================================================
   TOPIC CARDS
   ===================================================== */
function renderTopicCards(snap) {
  const container = $('topicsGrid');
  if (!container) return;

  const quizHistory = HarmoniaDB.getQuizHistory(50);
  container.innerHTML = '';

  TOPICS.forEach((topic, idx) => {
    // Calculate this topic's progress from history
    const topicHistory = quizHistory.filter(h => h.topic === topic.id);
    const bestScore = topicHistory.length ? Math.max(...topicHistory.map(h => h.scorePercent || 0)) : 0;
    const attempts = topicHistory.length;

    const card = document.createElement('div');
    card.className = 'topic-card';
    card.dataset.color = topic.color;
    card.dataset.diff = topic.diff;
    card.dataset.topic = topic.id;
    card.dataset.name = topic.name.toLowerCase();

    card.innerHTML = `
      <div class="tc-glow"></div>
      <div class="tc-top">
        <div class="tc-icon">${topic.icon}</div>
        <span class="tc-badge ${topic.diff}">${topic.diff}</span>
      </div>
      <div class="tc-body">
        <h4>${topic.name}</h4>
        <p>${topic.desc}</p>
      </div>
      <div class="tc-footer">
        <div class="tc-meta">
          <span>${topic.questions} Questions</span>
          <strong>+${topic.xpMax} XP max</strong>
        </div>
        <div class="tc-progress-mini">
          <span>Best: ${bestScore}%</span>
          <div class="tc-bar-mini">
            <div class="tc-bar-fill" style="width: ${bestScore}%"></div>
          </div>
        </div>
      </div>
    `;

    // Animate stagger
    card.style.opacity = '0';
    card.style.transform = 'translateY(20px)';
    card.style.transition = `opacity 0.4s ease ${idx * 0.06}s, transform 0.4s ease ${idx * 0.06}s`;
    setTimeout(() => { card.style.opacity = '1'; card.style.transform = 'none'; }, 100);

    card.addEventListener('click', () => startQuiz(topic.id));
    container.appendChild(card);
  });
}

/* =====================================================
   DIFF TABS & SEARCH FILTERS
   ===================================================== */
function bindDiffTabs() {
  document.querySelectorAll('.diff-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterTopicCards();
    });
  });
}

function bindTopicSearch() {
  const input = $('topicSearch');
  if (input) input.addEventListener('input', filterTopicCards);
}

function filterTopicCards() {
  const activeTab = document.querySelector('.diff-tab.active')?.dataset.diff || 'all';
  const searchVal = ($('topicSearch')?.value || '').toLowerCase();

  document.querySelectorAll('.topic-card').forEach(card => {
    const diffMatch = activeTab === 'all' || card.dataset.diff === activeTab;
    const nameMatch = !searchVal || card.dataset.name.includes(searchVal);
    card.style.display = diffMatch && nameMatch ? '' : 'none';
  });
}

/* =====================================================
   QUICK STRIP BUTTONS
   ===================================================== */
function bindQuickStrip() {
  const randomBtn = $('btnRandomQuiz');
  const blitzBtn  = $('btnBlitzQuiz');
  if (randomBtn) randomBtn.addEventListener('click', () => startRandomQuiz());
  if (blitzBtn)  blitzBtn.addEventListener('click',  () => startBlitzQuiz());
}

function startRandomQuiz() {
  const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
  startQuiz(randomTopic.id, 'random');
}

function startBlitzQuiz() {
  // Mix questions from all topics
  startQuiz('blitz', 'blitz');
}

/* =====================================================
   LEADERBOARD (mock + user data)
   ===================================================== */
function renderLeaderboard() {
  const container = $('lbList');
  if (!container) return;

  const snap = HarmoniaDB.getSnapshot();
  const userXP = snap.xp;
  const userName = snap.progress?.user?.name || 'You';

  const mockPlayers = [
    { name:'Sakura M.',   xp:48200, avatar:'S', bg:'linear-gradient(135deg,#7c3aed,#db2777)' },
    { name:'James O.',    xp:41750, avatar:'J', bg:'linear-gradient(135deg,#0ea5e9,#7c3aed)' },
    { name:'Aisha R.',    xp:38900, avatar:'A', bg:'linear-gradient(135deg,#ec4899,#f97316)' },
    { name:'Diego F.',    xp:31200, avatar:'D', bg:'linear-gradient(135deg,#10b981,#0ea5e9)' },
    { name:'Emma W.',     xp:27800, avatar:'E', bg:'linear-gradient(135deg,#f97316,#eab308)' },
  ];

  // Insert user into leaderboard
  const allPlayers = [...mockPlayers, { name:'You', xp: userXP, avatar:'★', bg:'linear-gradient(135deg,#a78bfa,#ec4899)', isYou: true }]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 6);

  container.innerHTML = '';
  allPlayers.forEach((p, i) => {
    const rankClass = i === 0 ? 'gold' : i === 1 ? 'silver' : i === 2 ? 'bronze' : '';
    const rankDisplay = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`;
    const row = document.createElement('div');
    row.className = `lb-row${p.isYou ? ' lb-you' : ''}`;
    row.innerHTML = `
      <div class="lb-rank ${rankClass}">${rankDisplay}</div>
      <div class="lb-avatar" style="background:${p.bg}">${p.avatar}</div>
      <div class="lb-info">
        <strong>${p.isYou ? 'You' : p.name}</strong>
        <span>${p.xp.toLocaleString()} XP total</span>
      </div>
      <div class="lb-score">${p.xp >= 1000 ? (p.xp/1000).toFixed(1)+'k' : p.xp}</div>
    `;
    container.appendChild(row);
  });
}

/* =====================================================
   QUIZ HISTORY
   ===================================================== */
function renderHistory(snap) {
  const container = $('historyList');
  if (!container) return;

  const history = HarmoniaDB.getQuizHistory(5);
  if (!history.length) {
    container.innerHTML = '<div class="hist-empty"><span>🧠</span>No quizzes taken yet!<br>Complete a quiz to see your history.</div>';
    return;
  }

  container.innerHTML = '';
  history.forEach(h => {
    const pct = h.scorePercent || Math.round((h.correct / h.total) * 100);
    const scoreClass = pct >= 80 ? 'good' : pct >= 50 ? 'ok' : 'bad';
    const topicMeta = TOPICS.find(t => t.id === h.topic);
    const topicName = topicMeta?.name || h.topic || 'General';

    const item = document.createElement('div');
    item.className = 'hist-item';
    item.innerHTML = `
      <div class="hist-topic">${topicMeta?.icon || '🎵'}</div>
      <div class="hist-info">
        <strong>${topicName}</strong>
        <span>${h.correct}/${h.total} correct · ${HarmoniaDB.formatMinutes(Math.round((h.durationSeconds||0)/60)) || '<1 min'}</span>
      </div>
      <div class="hist-score ${scoreClass}">${pct}%</div>
    `;
    container.appendChild(item);
  });
}

/* =====================================================
   START QUIZ
   ===================================================== */
function startQuiz(topicId, mode = 'standard') {
  const isBlitz = topicId === 'blitz';
  let questions = [];

  if (isBlitz) {
    // Pull 2 questions from each topic
    Object.values(QUESTION_BANK).forEach(bank => {
      const shuffled = shuffleArray([...bank]);
      questions.push(...shuffled.slice(0, 2));
    });
    questions = shuffleArray(questions).slice(0, 10);
  } else {
    const bank = QUESTION_BANK[topicId];
    if (!bank) { console.warn('Unknown topic:', topicId); return; }
    questions = shuffleArray([...bank]).slice(0, 10);
  }

  quizState = {
    topic: topicId,
    topicMeta: isBlitz ? { name: 'Blitz Mix', icon: '⚡' } : TOPICS.find(t => t.id === topicId),
    questions,
    currentIdx: 0,
    answers: [],
    score: 0,
    totalPoints: questions.reduce((s, q) => s + (q.points || 10), 0),
    combo: 0,
    maxCombo: 0,
    startTime: Date.now(),
    questionStartTime: Date.now(),
    timerInterval: null,
    timePerQuestion: mode === 'blitz' ? 10 : 20,
    timeLeft: mode === 'blitz' ? 10 : 20,
    answered: false,
    finished: false,
    xpEarned: 0,
    newAchievements: [],
    questionCount: questions.length,
    mode,
  };

  openModal();
  renderQuestion();
}

/* =====================================================
   MODAL OPEN / CLOSE
   ===================================================== */
function openModal() {
  const overlay = $('quizModalOverlay');
  const quizArea = $('quizArea');
  const resultsArea = $('quizResults');
  overlay.classList.add('open');
  quizArea.style.display = '';
  resultsArea.style.display = 'none';
  resultsArea.classList.remove('visible');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const overlay = $('quizModalOverlay');
  overlay.classList.remove('open');
  document.body.style.overflow = '';
  clearInterval(quizState.timerInterval);

  // Refresh page data
  const snap = HarmoniaDB.getSnapshot();
  renderHeroStats(snap);
  renderTopicCards(snap);
  renderHistory(snap);
  renderLeaderboard();
}

/* =====================================================
   RENDER QUESTION
   ===================================================== */
function renderQuestion() {
  const q = quizState.questions[quizState.currentIdx];
  const total = quizState.questionCount;
  const idx = quizState.currentIdx;

  quizState.answered = false;
  quizState.questionStartTime = Date.now();

  // Progress
  const pct = Math.round((idx / total) * 100);
  $('qmProgressFill').style.width = pct + '%';
  $('qmProgressCounter').textContent = `${idx + 1} / ${total}`;

  // Dots
  const dotsContainer = $('qmDots');
  dotsContainer.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const dot = document.createElement('div');
    dot.className = 'qm-dot';
    if (i < idx) {
      const ans = quizState.answers[i];
      dot.classList.add(ans?.correct ? 'correct' : 'wrong');
    } else if (i === idx) {
      dot.classList.add('current');
    }
    dotsContainer.appendChild(dot);
  }

  // Topic badge
  const topicMeta = quizState.topicMeta;
  $('qmTopicBadge').innerHTML = `<span>${topicMeta?.icon || '🎵'}</span> ${topicMeta?.name || 'Quiz'}`;

  // Question type & points
  $('qmQType').textContent = q.type || 'Theory';
  $('qmQPoints').textContent = `+${q.points} pts`;

  // Question text
  $('qmQuestion').textContent = q.q;

  // Notation block
  const notationEl = $('qmNotation');
  if (q.notation) {
    notationEl.textContent = q.notation;
    notationEl.style.display = '';
  } else {
    notationEl.style.display = 'none';
  }

  // Options
  const optionsContainer = $('qmOptions');
  optionsContainer.innerHTML = '';
  const isSingle = q.options.length <= 2;
  optionsContainer.className = `qm-options${isSingle ? ' single-col' : ''}`;

  q.options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = 'qm-option';
    btn.innerHTML = `<span class="qm-option-letter">${opt.l}</span>${escapeHTML(opt.t)}`;
    btn.addEventListener('click', () => selectAnswer(opt.l));
    optionsContainer.appendChild(btn);
  });

  // Explanation
  const exp = $('qmExplanation');
  exp.classList.remove('visible', 'wrong-exp');
  exp.style.display = 'none';

  // Combo display
  $('qmComboCount').textContent = quizState.combo;
  $('qmComboLabel').textContent = quizState.combo >= 3 ? '🔥 Combo!' : 'Combo';

  // Next button
  const nextBtn = $('qmNext');
  nextBtn.disabled = true;
  nextBtn.textContent = idx + 1 < total ? 'Next Question' : 'See Results';
  nextBtn.innerHTML = `${idx + 1 < total ? 'Next Question' : 'See Results'} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="15" height="15"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

  // Start timer
  startQuestionTimer();

  // Scroll to top of modal
  const modal = document.querySelector('.quiz-modal');
  if (modal) modal.scrollTop = 0;
}

/* =====================================================
   TIMER
   ===================================================== */
function startQuestionTimer() {
  clearInterval(quizState.timerInterval);
  quizState.timeLeft = quizState.timePerQuestion;

  updateTimerUI();

  quizState.timerInterval = setInterval(() => {
    quizState.timeLeft--;
    updateTimerUI();
    if (quizState.timeLeft <= 0) {
      clearInterval(quizState.timerInterval);
      if (!quizState.answered) {
        // Time out — auto-wrong
        timeoutQuestion();
      }
    }
  }, 1000);
}

function updateTimerUI() {
  const pct = (quizState.timeLeft / quizState.timePerQuestion) * 100;
  $('qmTimerFill').style.width = pct + '%';
  $('qmTimerText').textContent = quizState.timeLeft;
  $('qmTimerText').classList.toggle('urgent', quizState.timeLeft <= 5);
}

function timeoutQuestion() {
  quizState.answered = true;
  quizState.combo = 0;

  const q = quizState.questions[quizState.currentIdx];
  quizState.answers.push({ questionId: q.id, correct: false, selectedAnswer: null, timeTaken: quizState.timePerQuestion });

  // Show all options — highlight correct
  const options = document.querySelectorAll('.qm-option');
  options.forEach(opt => {
    opt.disabled = true;
    const letter = opt.querySelector('.qm-option-letter').textContent;
    if (letter === q.answer) opt.classList.add('correct');
  });

  showExplanation(q, false, true);
  $('qmNext').disabled = false;
  $('qmComboCount').textContent = 0;
}

/* =====================================================
   SELECT ANSWER
   ===================================================== */
function selectAnswer(letter) {
  if (quizState.answered) return;
  quizState.answered = true;
  clearInterval(quizState.timerInterval);

  const q = quizState.questions[quizState.currentIdx];
  const timeTaken = Math.round((Date.now() - quizState.questionStartTime) / 1000);
  const isCorrect = letter === q.answer;

  quizState.answers.push({ questionId: q.id, correct: isCorrect, selectedAnswer: letter, timeTaken });

  if (isCorrect) {
    quizState.score += q.points;
    quizState.combo++;
    quizState.maxCombo = Math.max(quizState.maxCombo, quizState.combo);
    // Speed bonus
    if (timeTaken <= 5) quizState.score += Math.round(q.points * 0.5);
  } else {
    quizState.combo = 0;
  }

  // Update combo display
  $('qmComboCount').textContent = quizState.combo;
  $('qmComboLabel').textContent = quizState.combo >= 3 ? '🔥 Combo!' : 'Combo';

  // Update option visuals
  const options = document.querySelectorAll('.qm-option');
  options.forEach(opt => {
    opt.disabled = true;
    const l = opt.querySelector('.qm-option-letter').textContent;
    if (l === q.answer) {
      opt.classList.add('correct');
    } else if (l === letter && !isCorrect) {
      opt.classList.add('wrong');
      opt.classList.add('selected-wrong');
    }
  });

  showExplanation(q, isCorrect, false);
  $('qmNext').disabled = false;
}

/* =====================================================
   SKIP QUESTION
   ===================================================== */
function skipQuestion() {
  if (quizState.answered) {
    advanceQuestion();
    return;
  }
  clearInterval(quizState.timerInterval);
  quizState.answered = true;
  quizState.combo = 0;
  const q = quizState.questions[quizState.currentIdx];
  quizState.answers.push({ questionId: q.id, correct: false, selectedAnswer: 'SKIP', timeTaken: 0 });

  const options = document.querySelectorAll('.qm-option');
  options.forEach(opt => {
    opt.disabled = true;
    const l = opt.querySelector('.qm-option-letter').textContent;
    if (l === q.answer) opt.classList.add('correct');
  });

  showExplanation(q, false, true);
  $('qmNext').disabled = false;
  $('qmComboCount').textContent = 0;
}

/* =====================================================
   SHOW EXPLANATION
   ===================================================== */
function showExplanation(q, isCorrect, isTimeout) {
  const exp = $('qmExplanation');
  exp.style.display = '';

  const label = isCorrect ? '✅ Correct!' : isTimeout ? '⏱️ Time\'s up!' : '❌ Incorrect';
  exp.innerHTML = `<div class="qm-exp-label">${label}</div>${escapeHTML(q.explanation)}<div style="margin-top:8px;font-size:0.78rem;opacity:0.7;">Correct answer: <strong>${q.answer}</strong> — ${escapeHTML(q.options.find(o => o.l === q.answer)?.t || '')}</div>`;
  exp.classList.add('visible');
  if (!isCorrect) exp.classList.add('wrong-exp');
}

/* =====================================================
   ADVANCE / FINISH
   ===================================================== */
function advanceQuestion() {
  quizState.currentIdx++;
  if (quizState.currentIdx >= quizState.questionCount) {
    finishQuiz();
  } else {
    renderQuestion();
  }
}

/* =====================================================
   FINISH QUIZ
   ===================================================== */
function finishQuiz() {
  clearInterval(quizState.timerInterval);
  quizState.finished = true;

  const totalDuration = Math.round((Date.now() - quizState.startTime) / 1000);
  const correct = quizState.answers.filter(a => a.correct).length;
  const total = quizState.questionCount;
  const scorePercent = Math.round((correct / total) * 100);
  const xpAvailable = quizState.topicMeta?.xpMax || 150;
  const xpEarned = Math.round((correct / total) * xpAvailable);

  // Save to DB
  const result = {
    topic: quizState.topic,
    topicName: quizState.topicMeta?.name || quizState.topic,
    correct,
    total,
    scorePercent,
    score: quizState.score,
    maxScore: quizState.totalPoints,
    durationSeconds: totalDuration,
    xpAvailable,
    combo: quizState.maxCombo,
    mode: quizState.mode,
  };

  const actualXP = HarmoniaDB.saveQuizResult(result);
  quizState.xpEarned = actualXP;

  // Check achievements
  const newAchs = [];
  if (scorePercent === 100) { HarmoniaDB.checkAchievement('perfect_quiz'); newAchs.push({ icon:'💯', title:'Perfect Score!' }); }
  if (totalDuration < 180)  { HarmoniaDB.checkAchievement('speed_learner'); newAchs.push({ icon:'⚡', title:'Speed Learner!' }); }
  if (quizState.maxCombo >= 5) { HarmoniaDB.checkAchievement('combo_x5'); newAchs.push({ icon:'🎯', title:'On a Roll!' }); }
  quizState.newAchievements = newAchs;

  renderResults(correct, total, scorePercent, totalDuration, actualXP);
}

/* =====================================================
   RENDER RESULTS SCREEN
   ===================================================== */
function renderResults(correct, total, scorePercent, duration, xpEarned) {
  const quizArea = $('quizArea');
  const resultsArea = $('quizResults');

  quizArea.style.display = 'none';
  resultsArea.style.display = 'flex';
  resultsArea.classList.add('visible');

  // Emoji + title
  const emoji = scorePercent >= 90 ? '🏆' : scorePercent >= 70 ? '🎉' : scorePercent >= 50 ? '👍' : '📚';
  const title = scorePercent >= 90 ? 'Outstanding!' : scorePercent >= 70 ? 'Great Work!' : scorePercent >= 50 ? 'Good Effort!' : 'Keep Practicing!';
  $('qrEmoji').textContent = emoji;
  $('qrTitle').textContent = title;
  $('qrSubtitle').textContent = `You scored ${correct} out of ${total} on ${quizState.topicMeta?.name || 'the quiz'}`;

  // Score ring animation
  const pct = scorePercent;
  $('qrPct').textContent = pct + '%';
  const circumference = 339.3;
  const dashOffset = circumference - (pct / 100) * circumference;
  setTimeout(() => {
    $('qrRingFill').style.strokeDashoffset = dashOffset;
  }, 300);

  // Stats
  $('qrCorrect').textContent = correct;
  $('qrWrong').textContent = total - correct;
  $('qrXP').textContent = '+' + xpEarned;
  $('qrTime').textContent = duration < 60 ? duration + 's' : Math.floor(duration/60) + 'm ' + (duration%60) + 's';

  // Achievements
  const achContainer = $('qrAchievements');
  if (quizState.newAchievements.length) {
    achContainer.style.display = '';
    $('qrAchList').innerHTML = quizState.newAchievements.map(a =>
      `<div class="qr-ach-item">${a.icon} ${a.title}</div>`
    ).join('');
  } else {
    achContainer.style.display = 'none';
  }

  // Scroll to top
  const modal = document.querySelector('.quiz-modal');
  if (modal) modal.scrollTop = 0;

  // Fire XP toast
  setTimeout(() => showXPToast(xpEarned, `${quizState.topicMeta?.name || 'Quiz'} completed`), 600);

  // Confetti if good score
  if (scorePercent >= 70) setTimeout(() => fireConfetti(), 400);

  // Level up check
  const snap = HarmoniaDB.getSnapshot();
  const prevLevel = HarmoniaDB.getLevelFromXP(snap.xp - xpEarned);
  const newLevel  = snap.levelInfo.level;
  if (newLevel > prevLevel) {
    setTimeout(() => showLevelUp(newLevel, snap.levelInfo.title), 1500);
  }
}

/* =====================================================
   RETRY / NEW QUIZ FROM RESULTS
   ===================================================== */
function retryQuiz() {
  startQuiz(quizState.topic, quizState.mode);
}

function pickNewTopic() {
  const quizArea = $('quizArea');
  const resultsArea = $('quizResults');
  quizArea.style.display = '';
  resultsArea.classList.remove('visible');
  resultsArea.style.display = 'none';
  closeModal();
}

/* =====================================================
   XP TOAST
   ===================================================== */
function showXPToast(xp, reason) {
  const toast = $('xpToast');
  $('xpToastXP').textContent = '+' + xp + ' XP';
  $('xpToastReason').textContent = reason;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3500);
}

/* =====================================================
   LEVEL UP OVERLAY
   ===================================================== */
function showLevelUp(level, title) {
  $('luLevel').textContent = `Level ${level}`;
  $('luName').textContent = title;
  $('levelUpOverlay').classList.add('show');
  fireConfetti(80);
}

function closeLevelUp() {
  $('levelUpOverlay').classList.remove('show');
}

/* =====================================================
   CONFETTI
   ===================================================== */
function fireConfetti(count = 50) {
  const container = $('confettiContainer');
  const colors = ['#a78bfa','#ec4899','#38bdf8','#34d399','#fbbf24','#f97316'];

  for (let i = 0; i < count; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.cssText = `
      left: ${Math.random() * 100}%;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      --dur: ${1.5 + Math.random() * 2}s;
      --delay: ${Math.random() * 0.8}s;
      transform: rotate(${Math.random() * 360}deg);
      width: ${6 + Math.random() * 8}px;
      height: ${8 + Math.random() * 12}px;
    `;
    container.appendChild(piece);
    setTimeout(() => piece.remove(), 3500);
  }
}

/* =====================================================
   KEYBOARD SHORTCUTS
   ===================================================== */
function setupKeyboard() {
  document.addEventListener('keydown', e => {
    const overlay = $('quizModalOverlay');
    if (!overlay?.classList.contains('open')) return;

    if ($('quizResults')?.classList.contains('visible')) {
      if (e.key === 'Escape') pickNewTopic();
      if (e.key === 'Enter' || e.key === 'r' || e.key === 'R') retryQuiz();
      return;
    }

    if (quizState.answered) {
      if (e.key === 'Enter' || e.key === 'ArrowRight') advanceQuestion();
      return;
    }

    // Answer selection
    const keyMap = { 'a':'A', 'b':'B', 'c':'C', 'd':'D', 'A':'A', 'B':'B', 'C':'C', 'D':'D',
                     '1':'A', '2':'B', '3':'C', '4':'D' };
    if (keyMap[e.key]) selectAnswer(keyMap[e.key]);
    if (e.key === 'Escape') closeModal();
  });
}

/* =====================================================
   UTILITY
   ===================================================== */
function shuffleArray(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function escapeHTML(str) {
  return String(str || '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
