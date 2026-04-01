/**
 * ai-composer.js — AI Composer page controller
 * Uses Anthropic Claude API to generate musical compositions
 */

/* ===== STATE ===== */
const ComposerState = {
  selectedGenre: 'any',
  selectedMood: 'any',
  history: JSON.parse(localStorage.getItem('harmonia_composer_history') || '[]'),
  stats: JSON.parse(localStorage.getItem('harmonia_composer_stats') || JSON.stringify({
    composed: 0, genres: new Set(), xpEarned: 0, saved: 0
  })),
  currentComposition: null,
  isGenerating: false,
  playbackInterval: null,
  playbackSeconds: 0,
  playbackTotal: 180,
  isPlaying: false,
};

// Fix Set serialization
if (ComposerState.stats.genres && !ComposerState.stats.genres.has) {
  ComposerState.stats.genres = new Set(ComposerState.stats.genres);
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initWaveCanvas();
  initGenreGrid();
  initMoodGrid();
  initPromptCounter();
  renderHistory();
  renderStats();
  initPlaybackProgress();
});

/* ===== WAVE CANVAS (Hero Background) ===== */
function initWaveCanvas() {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;

  function resize() {
    w = canvas.width = canvas.offsetWidth;
    h = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  let offset = 0;
  function draw() {
    ctx.clearRect(0, 0, w, h);
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      const amp = (12 - i * 3);
      const freq = 0.008 + i * 0.003;
      const speed = 0.03 - i * 0.008;
      ctx.strokeStyle = `rgba(${i === 0 ? '167,139,250' : i === 1 ? '236,72,153' : '56,189,248'},${0.6 - i * 0.15})`;
      ctx.lineWidth = 2 - i * 0.4;
      for (let x = 0; x < w; x++) {
        const y = h / 2 + Math.sin(x * freq + offset * speed + i * 1.2) * amp
                        + Math.sin(x * freq * 0.5 + offset * speed * 0.7 + i) * (amp * 0.5);
        x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    offset++;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ===== GENRE / MOOD GRIDS ===== */
function initGenreGrid() {
  document.querySelectorAll('.ac-genre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ac-genre-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ComposerState.selectedGenre = btn.dataset.genre;
    });
  });
}

function initMoodGrid() {
  document.querySelectorAll('.ac-mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ac-mood-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      ComposerState.selectedMood = btn.dataset.mood;
    });
  });
}

/* ===== PROMPT COUNTER ===== */
function initPromptCounter() {
  const ta = document.getElementById('promptTextarea');
  const cc = document.getElementById('charCount');
  if (!ta || !cc) return;
  ta.addEventListener('input', () => {
    cc.textContent = ta.value.length;
    cc.style.color = ta.value.length > 720 ? '#ef4444' : '';
  });
}

/* ===== PROMPT UTILITIES ===== */
function injectPrompt(text) {
  const ta = document.getElementById('promptTextarea');
  if (!ta) return;
  ta.value = text;
  ta.dispatchEvent(new Event('input'));
  ta.focus();
  ta.scrollTop = 0;
}

function clearPrompt() {
  const ta = document.getElementById('promptTextarea');
  if (ta) { ta.value = ''; ta.dispatchEvent(new Event('input')); ta.focus(); }
}

const SHUFFLE_PROMPTS = [
  "A minimalist piano nocturne with deep, resonant left-hand chords and a delicate right-hand melody, reminiscent of Satie",
  "A high-energy punk rock anthem with distorted guitars, pounding drums and shouted vocals about rebellion",
  "A dreamy shoegaze track with washed-out reverb guitars, hushed vocals and a hypnotic drum pattern",
  "A Brazilian bossa nova with fingerpicked guitar, soft brushed drums, and a breezy saxophone melody",
  "An aggressive death metal riff in 7/8 time with down-tuned guitars and blastbeat drums",
  "A tender lullaby in C major with music box melody and soft string pads",
  "A neo-soul groove in F# minor with Rhodes piano, slap bass and trap hi-hats",
  "An Arctic Monkeys-inspired indie rock song with angular guitar riffs and sardonic lyrics",
  "A 1970s funk track with wah-wah guitar, tight horns and a James Brown style breakdown",
  "A haunting Celtic ballad in D dorian with uilleann pipes, fiddle and bodhran",
  "A minimalist techno track at 132 BPM with a driving kick, sweeping filter cutoffs and industrial textures",
  "A peaceful Japanese koto piece with pentatonic scales, gentle shakuhachi and temple bell accents",
];

function shufflePrompt() {
  const prompts = SHUFFLE_PROMPTS;
  const idx = Math.floor(Math.random() * prompts.length);
  injectPrompt(prompts[idx]);
}

/* ===== PRESETS ===== */
const PRESETS = {
  beethoven: {
    genre: 'classical', mood: 'epic', key: 'C minor', time: '4/4', tempo: 132,
    instruments: ['piano', 'strings', 'brass'],
    prompt: 'A dramatic classical piano sonata in C minor in the style of Beethoven, with a powerful opening motif, a lyrical slow movement and a stormy finale'
  },
  miles: {
    genre: 'jazz', mood: 'mysterious', key: 'D minor', time: '4/4', tempo: 88,
    instruments: ['piano', 'bass', 'saxophone', 'drums'],
    prompt: 'A cool modal jazz composition in D dorian, inspired by Miles Davis Kind of Blue, with long, space-filled melodic lines and subtle chord changes'
  },
  lofi: {
    genre: 'lo-fi', mood: 'calm', key: 'G major', time: '4/4', tempo: 80,
    instruments: ['piano', 'bass', 'drums'],
    prompt: 'A chill lo-fi hip hop beat with a dusty vinyl texture, gentle jazz piano chords, muffled kick and snap, and a warm bass line perfect for studying'
  },
  hans: {
    genre: 'cinematic', mood: 'epic', key: 'D minor', time: '4/4', tempo: 90,
    instruments: ['strings', 'brass', 'piano', 'drums'],
    prompt: 'A massive cinematic orchestral score in the style of Hans Zimmer, starting with a single piano motif that slowly builds into a full orchestral climax with pounding percussion and soaring strings'
  },
  debussy: {
    genre: 'classical', mood: 'mysterious', key: 'Eb major', time: '4/4', tempo: 72,
    instruments: ['piano', 'flute', 'strings'],
    prompt: "An impressionist piano piece inspired by Debussy, using whole tone scales, rich pedal tones, shimmering arpeggios and evocative, dreamlike harmonies suggesting water and light",
  },
  edm: {
    genre: 'electronic', mood: 'energetic', key: 'F minor', time: '4/4', tempo: 128,
    instruments: ['synth', 'bass', 'drums'],
    prompt: 'A festival-ready progressive house EDM track at 128 BPM with a punchy kick, massive synth chords, a euphoric melody drop and energy-building riser effects'
  }
};

function loadPreset(id) {
  const p = PRESETS[id];
  if (!p) return;

  // Set genre
  document.querySelectorAll('.ac-genre-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.genre === p.genre);
  });
  ComposerState.selectedGenre = p.genre;

  // Set mood
  document.querySelectorAll('.ac-mood-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.mood === p.mood);
  });
  ComposerState.selectedMood = p.mood;

  // Set key
  const keyEl = document.getElementById('keySelect');
  if (keyEl) keyEl.value = p.key;

  // Set time signature
  const timeEl = document.getElementById('timeSelect');
  if (timeEl) timeEl.value = p.time;

  // Set tempo
  const tempoEl = document.getElementById('tempoSlider');
  const tempoVal = document.getElementById('tempoVal');
  if (tempoEl) { tempoEl.value = p.tempo; }
  if (tempoVal) tempoVal.textContent = p.tempo;

  // Set instruments
  document.querySelectorAll('.ac-instr-check input').forEach(cb => {
    cb.checked = p.instruments.includes(cb.value);
  });

  // Set prompt
  injectPrompt(p.prompt);

  showToast(`✨ Preset loaded: ${id.charAt(0).toUpperCase() + id.slice(1)}`, 'info');
}

/* ===== COLLECT SETTINGS ===== */
function getSettings() {
  const genre = ComposerState.selectedGenre;
  const mood = ComposerState.selectedMood;
  const key = document.getElementById('keySelect')?.value || 'any';
  const time = document.getElementById('timeSelect')?.value || '4/4';
  const tempo = document.getElementById('tempoSlider')?.value || '120';
  const instruments = [...document.querySelectorAll('.ac-instr-check input:checked')].map(cb => cb.value);
  const format = document.querySelector('input[name="format"]:checked')?.value || 'full';
  const prompt = document.getElementById('promptTextarea')?.value?.trim() || '';
  return { genre, mood, key, time, tempo, instruments, format, prompt };
}

/* ===== BUILD SYSTEM PROMPT ===== */
function buildSystemPrompt(settings) {
  return `You are Harmonia's AI Composer — the world's most sophisticated musical composition assistant. 
You have deep expertise in music theory, harmony, counterpoint, orchestration, and all musical genres.

When generating a composition, you ALWAYS respond with a valid JSON object (no markdown, no code fences) in this exact structure:

{
  "title": "Creative title for the composition",
  "subtitle": "Brief evocative subtitle",
  "tags": ["genre", "mood", "key"],
  "composition": {
    "overview": "2-3 sentence description of the piece",
    "structure": [
      {"section": "Intro", "bars": "1-8", "description": "What happens musically"},
      {"section": "Verse", "bars": "9-24", "description": "..."},
      ...more sections...
    ],
    "notation": "ASCII representation of the main theme/motif using note names (e.g., C4 D4 E4 F4 | G4 A4 B4 C5 |...)",
    "fullDescription": "Detailed paragraph describing the full composition with all parts"
  },
  "chords": {
    "progression": [
      {"chord": "Dm7", "type": "minor 7th", "roman": "i7", "beats": 4, "description": "Opening tonic chord"},
      ...6-12 chords...
    ],
    "analysis": "Paragraph analyzing the harmonic structure, modulations, and interesting chord choices",
    "voicings": "Specific voicing suggestions for the main instruments"
  },
  "theory": {
    "keyAndScale": "Detailed explanation of key, scale, and modal considerations",
    "harmony": "Discussion of harmonic language, tension and resolution, borrowed chords",
    "rhythm": "Analysis of rhythmic elements, syncopation, polyrhythm if present",
    "form": "Musical form analysis (sonata, ternary, AABA, etc.) with explanation",
    "influences": "Musical influences and stylistic references",
    "learningPoints": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3", "Key takeaway 4", "Key takeaway 5"]
  },
  "performance": {
    "tempoAndFeel": "Detailed tempo markings, feel, and groove description",
    "instrumentGuides": [
      {"instrument": "Piano", "role": "what it plays", "technique": "specific techniques to use", "tips": "practical advice"},
      ...for each instrument...
    ],
    "dynamicsAndExpression": "Dynamics map, expression markings, phrasing guidance",
    "practiceSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
    "commonMistakes": ["Mistake 1 and how to avoid it", "Mistake 2..."]
  }
}

Be extremely specific, musically accurate, and creatively inspired. Use real music theory terminology correctly.`;
}

function buildUserPrompt(settings) {
  let msg = `Generate a complete musical composition with the following parameters:

DESCRIPTION: ${settings.prompt || 'Create an original composition based on the other settings'}
GENRE: ${settings.genre === 'any' ? 'Open to any genre' : settings.genre}
MOOD: ${settings.mood === 'any' ? 'Open to any mood' : settings.mood}
KEY: ${settings.key === 'any' ? 'Choose an appropriate key' : settings.key}
TIME SIGNATURE: ${settings.time}
TEMPO: ${settings.tempo} BPM
INSTRUMENTS: ${settings.instruments.length > 0 ? settings.instruments.join(', ') : 'Choose appropriate instruments'}
OUTPUT FORMAT: ${settings.format === 'full' ? 'Full composition with all sections' : settings.format === 'chord' ? 'Focus on chord progressions with harmonic analysis' : settings.format === 'melody' ? 'Focus on the melodic line with notation' : 'Lead sheet format with melody, chords, and structure'}

Create something genuinely inspiring and musically sophisticated. Be specific with note names, bar numbers, dynamics, and articulation markings.`;
  return msg;
}

/* ===== LOADING ANIMATION ===== */
let loadStepTimer = null;

function startLoadingAnimation() {
  const steps = ['lstep1', 'lstep2', 'lstep3', 'lstep4'];
  let current = 0;

  steps.forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.classList.remove('active', 'done'); }
  });

  if (steps[0]) document.getElementById(steps[0])?.classList.add('active');

  const headlines = [
    'Composing your masterpiece…',
    'Crafting harmonic structure…',
    'Writing melodic lines…',
    'Finishing the score…'
  ];
  const subtexts = [
    'Analyzing musical intent and style',
    'Building chord progressions and voice leading',
    'Developing motifs and melodic phrases',
    'Adding dynamics, articulation and performance notes'
  ];

  function advance() {
    if (current < steps.length - 1) {
      document.getElementById(steps[current])?.classList.remove('active');
      document.getElementById(steps[current])?.classList.add('done');
      current++;
      document.getElementById(steps[current])?.classList.add('active');
      document.getElementById('loadingHeadline').textContent = headlines[current];
      document.getElementById('loadingSubtext').textContent = subtexts[current];
    }
  }

  loadStepTimer = setInterval(advance, 1800);
}

function stopLoadingAnimation() {
  if (loadStepTimer) { clearInterval(loadStepTimer); loadStepTimer = null; }
  ['lstep1','lstep2','lstep3','lstep4'].forEach(id => {
    document.getElementById(id)?.classList.remove('active');
    document.getElementById(id)?.classList.add('done');
  });
}

/* ===== SHOW STATES ===== */
function showEmpty() {
  document.getElementById('emptyState')?.classList.remove('hidden');
  document.getElementById('loadingState')?.classList.add('hidden');
  document.getElementById('resultState')?.classList.add('hidden');
}
function showLoading() {
  document.getElementById('emptyState')?.classList.add('hidden');
  document.getElementById('loadingState')?.classList.remove('hidden');
  document.getElementById('resultState')?.classList.add('hidden');
}
function showResult() {
  document.getElementById('emptyState')?.classList.add('hidden');
  document.getElementById('loadingState')?.classList.add('hidden');
  document.getElementById('resultState')?.classList.remove('hidden');
}

/* ===== GENERATE ===== */
async function generateComposition() {
  if (ComposerState.isGenerating) return;

  const settings = getSettings();

  if (!settings.prompt && settings.genre === 'any' && settings.mood === 'any') {
    showToast('Please describe your music or select a genre/mood first!', 'error');
    document.getElementById('promptTextarea')?.focus();
    return;
  }

  ComposerState.isGenerating = true;

  // Update button UI
  const btn = document.getElementById('generateBtn');
  const icon = document.getElementById('generateIcon');
  const text = document.getElementById('generateText');
  if (btn) btn.disabled = true;
  if (icon) icon.classList.add('spinning');
  if (text) text.textContent = 'Composing…';

  showLoading();
  startLoadingAnimation();

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        system: buildSystemPrompt(settings),
        messages: [{ role: 'user', content: buildUserPrompt(settings) }]
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    const raw = data.content?.[0]?.text || '';

    // Parse JSON — strip any accidental fences
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    // Find first { and last }
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON found in response');
    cleaned = cleaned.slice(start, end + 1);

    const composition = JSON.parse(cleaned);
    ComposerState.currentComposition = { composition, settings, timestamp: Date.now() };

    stopLoadingAnimation();
    renderResult(composition, settings);
    showResult();

    // Update stats & history
    updateStats(settings);
    addToHistory(composition, settings);

    // Award XP
    if (typeof HarmoniaDB !== 'undefined') {
      HarmoniaDB.addXP(75, `AI Composition: ${composition.title}`);
    }

    showToast(`🎵 "${composition.title}" composed! +75 XP`, 'success');

  } catch (err) {
    console.error('Composition error:', err);
    stopLoadingAnimation();

    // If JSON parse failed or any API error, show a rich fallback
    const fallback = buildFallbackComposition(settings);
    ComposerState.currentComposition = { composition: fallback, settings, timestamp: Date.now() };
    renderResult(fallback, settings);
    showResult();
    updateStats(settings);
    addToHistory(fallback, settings);

    showToast('✨ Composition generated (demo mode)', 'info');
  } finally {
    ComposerState.isGenerating = false;
    if (btn) btn.disabled = false;
    if (icon) icon.classList.remove('spinning');
    if (text) text.textContent = 'Generate Composition';
  }
}

/* ===== FALLBACK (rich offline mode) ===== */
function buildFallbackComposition(settings) {
  const genre = settings.genre === 'any' ? 'Classical' : capitalize(settings.genre);
  const mood = settings.mood === 'any' ? 'Expressive' : capitalize(settings.mood);
  const key = settings.key === 'any' ? 'A minor' : settings.key;
  const tempo = settings.tempo || 120;
  const instrs = settings.instruments.length > 0 ? settings.instruments : ['piano'];

  return {
    title: `${mood} ${genre} Study in ${key}`,
    subtitle: `An original composition at ${tempo} BPM`,
    tags: [genre.toLowerCase(), mood.toLowerCase(), key],
    composition: {
      overview: `A ${mood.toLowerCase()} ${genre.toLowerCase()} composition written in ${key}, performed at ${tempo} BPM with ${instrs.join(', ')}. The piece explores rich harmonic textures and expressive melodic lines.`,
      structure: [
        { section: 'Introduction', bars: '1–8', description: 'Establishes the main theme and tonal centre with a solo instrument entrance' },
        { section: 'A Section', bars: '9–24', description: 'Primary melodic material presented over the foundational harmonic progression' },
        { section: 'B Section', bars: '25–40', description: 'Contrasting theme with increased rhythmic energy and harmonic movement' },
        { section: 'Development', bars: '41–56', description: 'Thematic material fragmented and developed through different keys and registers' },
        { section: 'Recapitulation', bars: '57–72', description: 'Return of the opening theme, now harmonically enriched' },
        { section: 'Coda', bars: '73–80', description: 'Conclusive ending that resolves all harmonic tension to the tonic' }
      ],
      notation: `Main Theme (${key}):\nBar 1: A4 C5 E5 A5 | G5 F5 E5 D5 |\nBar 2: C5 B4 A4 G4 | F4 E4 D4 C4 |\nBar 3: E4 A4 C5 E5 | F5 E5 D5 C5 |\nBar 4: B4 A4 G#4 A4 | (hold) ... |`,
      fullDescription: `This ${mood.toLowerCase()} work in ${key} unfolds over 80 bars, beginning with an intimate introduction before blossoming into a fully realised composition. The ${instrs.join(' and ')} interweave throughout, creating a rich sonic tapestry. The harmonic language draws from the ${genre.toLowerCase()} tradition while incorporating fresh perspectives on voice leading and tonal colour.`
    },
    chords: {
      progression: [
        { chord: key.includes('minor') ? 'Am' : 'C', type: key.includes('minor') ? 'minor' : 'major', roman: 'i', beats: 4, description: 'Tonic — home chord, sense of rest' },
        { chord: key.includes('minor') ? 'Dm' : 'Am', type: 'minor', roman: key.includes('minor') ? 'iv' : 'vi', beats: 4, description: 'Subdominant — moves away from home' },
        { chord: key.includes('minor') ? 'E7' : 'F', type: key.includes('minor') ? 'dominant 7th' : 'major', roman: key.includes('minor') ? 'V7' : 'IV', beats: 4, description: 'Creates tension, pulls back to tonic' },
        { chord: key.includes('minor') ? 'Am' : 'G7', type: key.includes('minor') ? 'minor' : 'dominant 7th', roman: key.includes('minor') ? 'i' : 'V7', beats: 4, description: 'Resolution or further tension' },
        { chord: key.includes('minor') ? 'F' : 'Em', type: key.includes('minor') ? 'major' : 'minor', roman: key.includes('minor') ? 'VI' : 'iii', beats: 2, description: 'Borrowed chord — adds colour' },
        { chord: key.includes('minor') ? 'G' : 'Dm', type: key.includes('minor') ? 'major' : 'minor', roman: key.includes('minor') ? 'VII' : 'ii', beats: 2, description: 'Prepares the dominant' },
        { chord: key.includes('minor') ? 'E7' : 'G', type: key.includes('minor') ? 'dominant 7th' : 'major', roman: key.includes('minor') ? 'V7' : 'V', beats: 4, description: 'Strong dominant pull' },
        { chord: key.includes('minor') ? 'Am' : 'C', type: key.includes('minor') ? 'minor' : 'major', roman: 'i', beats: 4, description: 'Return home — satisfying resolution' }
      ],
      analysis: `The progression leans on functional harmony with a focus on the tension-resolution relationship between the dominant and tonic. The use of ${key.includes('minor') ? 'the borrowed VI chord (major chord on the sixth degree) adds Dorian colour' : 'the secondary dominant adds chromatic interest'}. Voice leading is smooth throughout, with common tones held and other voices moving by step where possible.`,
      voicings: `${instrs.includes('piano') ? 'Piano: left hand plays root-fifth bass patterns; right hand plays close-position chord voicings with the melody on top.' : ''} ${instrs.includes('guitar') ? 'Guitar: use open or barre chord voicings, adding sus2 embellishments for colour.' : ''} Allow chord tones to overlap and create a singing, legato harmonic texture.`
    },
    theory: {
      keyAndScale: `The piece is written in ${key}, using the ${key.includes('minor') ? 'natural minor (Aeolian) scale as its basis, occasionally borrowing the raised 7th (leading tone) for the dominant chord, creating a harmonic minor flavour at cadence points' : 'major scale throughout, with occasional modal mixture from the parallel minor'}.`,
      harmony: `The harmonic language is ${mood === 'Dark' || mood === 'Mysterious' ? 'rich with dissonance, exploiting tritone relationships and secondary dominants to create unease and tension' : 'warm and functional, using the primary triads as anchors with diatonic seventh chords adding sophistication'}. ${key.includes('minor') ? 'The characteristic minor sixth interval (A to F) is highlighted melodically.' : 'The major third is celebrated in the melodic writing.'}`,
      rhythm: `At ${tempo} BPM in ${settings.time}, the rhythmic feel is ${tempo < 80 ? 'expansive and unhurried, allowing each note to breathe' : tempo < 120 ? 'flowing and conversational' : tempo < 160 ? 'energetic and driven' : 'exhilarating and propulsive'}. Key rhythmic features include syncopated melodic entries against steady harmonic accompaniment and the interplay between rhythmic layers.`,
      form: `The composition follows a modified ternary form (A–B–A'), common in ${genre} music. The A section establishes the primary theme, the B section provides contrast and development, and the return of A is varied and enriched, leading to a satisfying coda.`,
      influences: `Stylistically influenced by the ${genre} tradition, with harmonic sensitivity inspired by late Romantic practices. The melodic writing draws from the vocal, singable lines of the Classical period, while the rhythmic drive reflects more contemporary sensibilities.`,
      learningPoints: [
        `The ${key.includes('minor') ? 'natural vs. harmonic minor' : 'major scale with modal mixture'} — understand why certain notes change and what effect this creates`,
        'Voice leading: notice how each chord tone moves to the nearest note in the next chord',
        'The role of the dominant chord (V or V7) in creating and releasing tension',
        `How ${tempo < 100 ? 'slower tempos require longer note values and different phrasing' : 'faster tempos create momentum and require precise articulation'}`,
        'The relationship between melodic shape (contour) and emotional expression'
      ]
    },
    performance: {
      tempoAndFeel: `Perform at ♩ = ${tempo} BPM. ${tempo < 80 ? 'Very slow and expressive — let each note resonate. Use a slight ritenuto (slowing) at phrase endings.' : tempo < 100 ? 'Slow and lyrical — lean into the expressive lines. Small rubato (flexible tempo) is encouraged.' : tempo < 140 ? 'Moderate and flowing — maintain a steady pulse while allowing natural phrase shaping.' : 'Fast and energetic — precision is paramount. Lock in with the rhythm section.'} Overall feel: ${mood.toLowerCase()}.`,
      instrumentGuides: instrs.slice(0, 4).map(instr => ({
        instrument: capitalize(instr),
        role: instr === 'piano' ? 'Carries melody and harmony; left hand provides bass and inner voices' :
              instr === 'guitar' ? 'Provides rhythmic chordal support and occasional melodic fills' :
              instr === 'bass' ? 'Anchors the harmonic rhythm; follow the root movement of the chord progression' :
              instr === 'drums' ? 'Establishes groove and drives energy; support dynamic shaping' :
              instr === 'strings' ? 'Provide lush harmonic pad; bow direction changes should align with phrase boundaries' :
              `Contribute to the ${mood.toLowerCase()} atmosphere of the piece`,
        technique: instr === 'piano' ? 'Use pedal carefully — change on each new harmony. Voicings should project the melody clearly above the accompaniment' :
                   instr === 'guitar' ? 'Mix strumming and fingerpicking techniques; use capo if needed for playability' :
                   instr === 'bass' ? 'Smooth legato playing; connect chord tones with scalar or chromatic passing notes' :
                   instr === 'drums' ? 'Brush or soft stick playing for dynamic sections; ghost notes for texture' :
                   'Focus on tone quality and blend with other instruments',
        tips: `Practice slowly first, focusing on tone quality. Record yourself to identify areas for improvement. Listen to recordings of great ${genre.toLowerCase()} performers for stylistic guidance.`
      })),
      dynamicsAndExpression: `Begin mp (mezzo-piano), building to mf during the B section. The climax arrives in bar ${40 + Math.floor(Math.random() * 10)} at f (forte). Return to mp for the recapitulation, closing ppp (pianissimo). Use a gradual diminuendo in the final bars. Expression markings: dolce (sweetly) for lyrical passages, espressivo (expressively) for the development section.`,
      practiceSteps: [
        'Step 1: Learn hands/parts separately at 60% tempo, focusing on note accuracy and fingering',
        'Step 2: Combine parts at 70% tempo, concentrating on rhythmic alignment and balance',
        'Step 3: Add dynamics and expression at 85% tempo; shape each phrase intentionally',
        'Step 4: Perform at full tempo, recording yourself to evaluate phrasing and ensemble blend'
      ],
      commonMistakes: [
        `Rushing through faster passages — use a metronome and gradually increase tempo from ${Math.round(tempo * 0.6)} BPM`,
        'Neglecting dynamic contrast — the difference between p and f is what brings the music to life',
        'Overusing sustain pedal (piano) — change pedal on each new harmony to avoid muddy sound',
        'Ignoring rests — silence is part of the music; play the rests as expressively as the notes'
      ]
    }
  };
}

/* ===== RENDER RESULT ===== */
function renderResult(comp, settings) {
  // Title & meta
  document.getElementById('resultTitle').textContent = comp.title;
  const metaEl = document.getElementById('resultMeta');
  if (metaEl) {
    metaEl.innerHTML = (comp.tags || []).map(t => `<span class="ac-meta-tag">${t}</span>`).join('') +
      `<span class="ac-meta-tag">🎵 ${settings.tempo} BPM</span>` +
      `<span class="ac-meta-tag">⏱ ${settings.time}</span>`;
  }

  // Playback title
  const pb = document.getElementById('playbackTitle');
  if (pb) pb.textContent = `"${comp.title}" — ${comp.subtitle || ''}`;

  // Set playback duration from structure
  const bars = comp.composition?.structure?.length * 16 || 120;
  const bpm = parseInt(settings.tempo) || 120;
  ComposerState.playbackTotal = Math.round((bars / bpm) * 60);
  document.getElementById('playbackTime').textContent = `0:00 / ${formatTime(ComposerState.playbackTotal)}`;

  // ── Render Composition Tab ──
  renderCompositionTab(comp);
  // ── Render Chords Tab ──
  renderChordsTab(comp);
  // ── Render Theory Tab ──
  renderTheoryTab(comp);
  // ── Render Performance Tab ──
  renderPerformanceTab(comp);
}

function renderCompositionTab(comp) {
  const el = document.getElementById('compositionOutput');
  if (!el || !comp.composition) return;

  let html = '';

  // Overview
  html += `<h2>🎼 Overview</h2>
  <p>${comp.composition.overview || ''}</p>`;

  // Structure
  if (comp.composition.structure?.length) {
    html += `<h2>📐 Structure</h2>`;
    comp.composition.structure.forEach(sec => {
      html += `<h3>${sec.section} <span style="font-weight:400;color:var(--muted);font-size:0.8rem">(Bars ${sec.bars})</span></h3>
      <p>${sec.description}</p>`;
    });
  }

  // Notation
  if (comp.composition.notation) {
    html += `<h2>🎵 Main Theme Notation</h2>
    <div class="ac-notation-block">${escapeHTML(comp.composition.notation)}</div>`;
  }

  // Full description
  if (comp.composition.fullDescription) {
    html += `<h2>📖 Full Description</h2>
    <div class="ac-tip-card">${comp.composition.fullDescription}</div>`;
  }

  el.innerHTML = html;
}

function renderChordsTab(comp) {
  const el = document.getElementById('chordsOutput');
  if (!el || !comp.chords) return;

  let html = '<h2>🎹 Chord Progression</h2>';

  // Chord grid
  if (comp.chords.progression?.length) {
    html += '<div class="ac-chord-grid">';
    comp.chords.progression.forEach(c => {
      html += `<div class="ac-chord-box">
        <span class="ac-chord-name">${c.chord}</span>
        <span class="ac-chord-type">${c.type || ''}</span>
        <span class="ac-chord-roman">${c.roman || ''}</span>
      </div>`;
    });
    html += '</div>';

    // Chord details
    html += '<h2>📋 Chord Details</h2>';
    comp.chords.progression.forEach((c, i) => {
      html += `<div class="ac-tip-card"><strong>${c.chord} (${c.roman})</strong> — ${c.description || ''} ${c.beats ? `<em style="color:var(--muted);font-size:0.8rem">[${c.beats} beat${c.beats !== 1 ? 's' : ''}]</em>` : ''}</div>`;
    });
  }

  // Analysis
  if (comp.chords.analysis) {
    html += `<h2>🔍 Harmonic Analysis</h2><p>${comp.chords.analysis}</p>`;
  }

  // Voicings
  if (comp.chords.voicings) {
    html += `<h2>🤲 Voicing Suggestions</h2>
    <div class="ac-notation-block">${escapeHTML(comp.chords.voicings)}</div>`;
  }

  el.innerHTML = html;
}

function renderTheoryTab(comp) {
  const el = document.getElementById('theoryOutput');
  if (!el || !comp.theory) return;

  const sections = [
    { key: 'keyAndScale', icon: '🎼', label: 'Key & Scale' },
    { key: 'harmony', icon: '🎵', label: 'Harmony' },
    { key: 'rhythm', icon: '🥁', label: 'Rhythm & Time' },
    { key: 'form', icon: '📐', label: 'Musical Form' },
    { key: 'influences', icon: '🎭', label: 'Influences & Style' },
  ];

  let html = '';
  sections.forEach(s => {
    if (comp.theory[s.key]) {
      html += `<h2>${s.icon} ${s.label}</h2><p>${comp.theory[s.key]}</p>`;
    }
  });

  if (comp.theory.learningPoints?.length) {
    html += '<h2>💡 Key Learning Points</h2><ul>';
    comp.theory.learningPoints.forEach(pt => {
      html += `<li>${pt}</li>`;
    });
    html += '</ul>';
  }

  el.innerHTML = html;
}

function renderPerformanceTab(comp) {
  const el = document.getElementById('performanceOutput');
  if (!el || !comp.performance) return;

  let html = '';

  if (comp.performance.tempoAndFeel) {
    html += `<h2>🎛️ Tempo & Feel</h2>
    <div class="ac-tip-card">${comp.performance.tempoAndFeel}</div>`;
  }

  if (comp.performance.instrumentGuides?.length) {
    html += '<h2>🎸 Instrument Guides</h2>';
    comp.performance.instrumentGuides.forEach(guide => {
      html += `<div class="ac-section-divider">${guide.instrument}</div>
      <h3>Role: <span style="font-weight:500;color:var(--muted)">${guide.role}</span></h3>
      <p><strong>Technique:</strong> ${guide.technique}</p>
      <div class="ac-tip-card"><strong>💡 Tip:</strong> ${guide.tips}</div>`;
    });
  }

  if (comp.performance.dynamicsAndExpression) {
    html += `<h2>📊 Dynamics & Expression</h2><p>${comp.performance.dynamicsAndExpression}</p>`;
  }

  if (comp.performance.practiceSteps?.length) {
    html += '<h2>🪜 Practice Plan</h2><ul>';
    comp.performance.practiceSteps.forEach(step => {
      html += `<li>${step}</li>`;
    });
    html += '</ul>';
  }

  if (comp.performance.commonMistakes?.length) {
    html += '<h2>⚠️ Common Mistakes to Avoid</h2><ul>';
    comp.performance.commonMistakes.forEach(m => {
      html += `<li>${m}</li>`;
    });
    html += '</ul>';
  }

  el.innerHTML = html;
}

/* ===== TABS ===== */
function switchTab(btn, tabId) {
  document.querySelectorAll('.ac-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ac-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tabId)?.classList.add('active');
}

/* ===== PLAYBACK SIMULATOR ===== */
function initPlaybackProgress() {
  const wrap = document.querySelector('.ac-playback-progress-wrap');
  if (wrap) {
    wrap.addEventListener('click', e => {
      if (!ComposerState.currentComposition) return;
      const rect = wrap.getBoundingClientRect();
      const pct = (e.clientX - rect.left) / rect.width;
      ComposerState.playbackSeconds = Math.round(pct * ComposerState.playbackTotal);
      updatePlaybackUI();
    });
  }
}

function togglePlayback() {
  if (!ComposerState.currentComposition) {
    showToast('Generate a composition first!', 'error');
    return;
  }

  if (ComposerState.isPlaying) {
    pausePlayback();
  } else {
    startPlayback();
  }
}

function startPlayback() {
  ComposerState.isPlaying = true;
  document.getElementById('playIcon').style.display = 'none';
  document.getElementById('pauseIcon').style.display = 'block';

  // Simulate playback with visual EQ-style animation
  ComposerState.playbackInterval = setInterval(() => {
    if (ComposerState.playbackSeconds >= ComposerState.playbackTotal) {
      stopPlayback();
      return;
    }
    ComposerState.playbackSeconds++;
    updatePlaybackUI();
  }, 1000);

  // Animate the wave canvas more actively
  document.querySelector('.ac-wave-canvas')?.style.setProperty('opacity', '0.3');
}

function pausePlayback() {
  ComposerState.isPlaying = false;
  document.getElementById('playIcon').style.display = 'block';
  document.getElementById('pauseIcon').style.display = 'none';
  if (ComposerState.playbackInterval) {
    clearInterval(ComposerState.playbackInterval);
    ComposerState.playbackInterval = null;
  }
}

function stopPlayback() {
  pausePlayback();
  ComposerState.playbackSeconds = 0;
  updatePlaybackUI();
  document.querySelector('.ac-wave-canvas')?.style.setProperty('opacity', '0.15');
}

function updatePlaybackUI() {
  const pct = (ComposerState.playbackSeconds / ComposerState.playbackTotal) * 100;
  document.getElementById('playbackProgress').style.width = pct + '%';
  document.getElementById('playbackTime').textContent =
    `${formatTime(ComposerState.playbackSeconds)} / ${formatTime(ComposerState.playbackTotal)}`;
}

function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

/* ===== COPY & DOWNLOAD ===== */
function copyComposition() {
  if (!ComposerState.currentComposition) return;
  const { composition } = ComposerState.currentComposition;
  const text = buildTextExport(composition);
  navigator.clipboard.writeText(text).then(() => {
    showToast('📋 Composition copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Copy failed — please try manually', 'error');
  });
}

function downloadComposition() {
  if (!ComposerState.currentComposition) return;
  const { composition, settings } = ComposerState.currentComposition;
  const text = buildTextExport(composition);
  const blob = new Blob([text], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(composition.title || 'composition').replace(/[^a-z0-9]/gi,'_')}.txt`;
  a.click();
  URL.revokeObjectURL(url);

  // Update saved stat
  ComposerState.stats.saved = (ComposerState.stats.saved || 0) + 1;
  saveStats();
  renderStats();
  showToast('💾 Composition saved!', 'success');
}

function buildTextExport(comp) {
  let out = `HARMONIA AI COMPOSER\n${'='.repeat(50)}\n\n`;
  out += `TITLE: ${comp.title}\n`;
  if (comp.subtitle) out += `SUBTITLE: ${comp.subtitle}\n`;
  out += `\n`;

  if (comp.composition) {
    out += `OVERVIEW\n${'-'.repeat(30)}\n${comp.composition.overview}\n\n`;
    if (comp.composition.structure) {
      out += `STRUCTURE\n${'-'.repeat(30)}\n`;
      comp.composition.structure.forEach(s => {
        out += `${s.section} (Bars ${s.bars}): ${s.description}\n`;
      });
      out += '\n';
    }
    if (comp.composition.notation) {
      out += `NOTATION\n${'-'.repeat(30)}\n${comp.composition.notation}\n\n`;
    }
  }

  if (comp.chords?.progression) {
    out += `CHORD PROGRESSION\n${'-'.repeat(30)}\n`;
    out += comp.chords.progression.map(c => `${c.chord} (${c.roman})`).join(' | ');
    out += `\n\n${comp.chords.analysis || ''}\n\n`;
  }

  if (comp.theory) {
    out += `THEORY NOTES\n${'-'.repeat(30)}\n`;
    if (comp.theory.keyAndScale) out += `Key & Scale: ${comp.theory.keyAndScale}\n\n`;
    if (comp.theory.harmony) out += `Harmony: ${comp.theory.harmony}\n\n`;
  }

  if (comp.performance) {
    out += `PERFORMANCE NOTES\n${'-'.repeat(30)}\n`;
    if (comp.performance.tempoAndFeel) out += `${comp.performance.tempoAndFeel}\n\n`;
  }

  out += `\nGenerated by Harmonia AI Composer — harmonia.app\n`;
  return out;
}

/* ===== HISTORY ===== */
function addToHistory(comp, settings) {
  const item = {
    id: Date.now(),
    title: comp.title,
    genre: settings.genre,
    mood: settings.mood,
    tempo: settings.tempo,
    timestamp: Date.now(),
    icon: getGenreIcon(settings.genre),
    xp: 75
  };
  ComposerState.history.unshift(item);
  ComposerState.history = ComposerState.history.slice(0, 20);
  localStorage.setItem('harmonia_composer_history', JSON.stringify(ComposerState.history));
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById('historyList');
  if (!el) return;

  if (!ComposerState.history.length) {
    el.innerHTML = `<div class="ac-history-empty"><span>🎵</span><p>Your compositions will appear here</p></div>`;
    return;
  }

  el.innerHTML = ComposerState.history.map(item => `
    <div class="ac-history-item" onclick="loadFromHistory('${item.id}')">
      <span class="ac-history-icon">${item.icon}</span>
      <div class="ac-history-info">
        <span class="ac-history-name">${escapeHTML(item.title)}</span>
        <span class="ac-history-meta">${capitalize(item.genre)} · ${item.tempo} BPM · ${formatTimeAgo(item.timestamp)}</span>
      </div>
      <span class="ac-history-xp">+${item.xp} XP</span>
    </div>
  `).join('');
}

function loadFromHistory(id) {
  showToast('Loading from history is available in the full version!', 'info');
}

function clearHistory() {
  ComposerState.history = [];
  localStorage.removeItem('harmonia_composer_history');
  renderHistory();
  showToast('History cleared', 'info');
}

/* ===== STATS ===== */
function updateStats(settings) {
  ComposerState.stats.composed = (ComposerState.stats.composed || 0) + 1;
  if (!ComposerState.stats.genres) ComposerState.stats.genres = new Set();
  if (settings.genre !== 'any') ComposerState.stats.genres.add(settings.genre);
  ComposerState.stats.xpEarned = (ComposerState.stats.xpEarned || 0) + 75;
  saveStats();
  renderStats();
}

function saveStats() {
  const toSave = {
    ...ComposerState.stats,
    genres: [...(ComposerState.stats.genres || [])]
  };
  localStorage.setItem('harmonia_composer_stats', JSON.stringify(toSave));
}

function renderStats() {
  const s = ComposerState.stats;
  const setOrArr = s.genres;
  const genreCount = setOrArr?.size ?? (setOrArr?.length ?? 0);

  document.getElementById('statComposed').textContent = s.composed || 0;
  document.getElementById('statGenres').textContent = genreCount;
  document.getElementById('statXP').textContent = s.xpEarned || 0;
  document.getElementById('statSaved').textContent = s.saved || 0;
}

/* ===== UTILITIES ===== */
function getGenreIcon(genre) {
  const icons = {
    classical: '🎻', jazz: '🎷', pop: '🎤', rock: '🎸',
    electronic: '⚡', 'hip-hop': '🎧', ambient: '🌊',
    folk: '🪕', 'r&b': '💜', cinematic: '🎬', 'lo-fi': '☕', any: '🎵'
  };
  return icons[genre] || '🎵';
}

function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHTML(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function formatTimeAgo(ts) {
  const diff = Date.now() - ts;
  if (diff < 60000) return 'just now';
  if (diff < 3600000) return `${Math.floor(diff/60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff/3600000)}h ago`;
  return new Date(ts).toLocaleDateString();
}

function showToast(msg, type = 'info') {
  const t = document.getElementById('acToast');
  if (!t) return;
  t.textContent = msg;
  t.className = `ac-toast ${type} show`;
  clearTimeout(window._acToastTimer);
  window._acToastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}
