/**
 * ai-composer.js — AI Composer page controller
 * Uses xAI Grok API to generate musical compositions
 */

/* ===== API KEY MANAGEMENT ===== */
const API_KEY_STORAGE = 'harmonia_xai_key';

function getApiKey() {
  return localStorage.getItem(API_KEY_STORAGE) || '';
}

function saveApiKey() {
  const input = document.getElementById('apiKeyInput');
  const key = input?.value?.trim() || '';

  if (!key) {
    showToast('Please enter your API key first', 'error');
    input?.focus();
    return;
  }
  if (!key.startsWith('xai-')) {
    showToast('Invalid key format — should start with xai-', 'error');
    input?.focus();
    return;
  }

  localStorage.setItem(API_KEY_STORAGE, key);
  closeApiModal(false);
  updateApiStatusBar();
  showToast('🔑 API key saved — ready to compose!', 'success');
}

function removeApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
  updateApiStatusBar();
  showToast('API key removed. Running in demo mode.', 'info');
}

function openApiModal() {
  const modal = document.getElementById('apiKeyModal');
  if (!modal) return;
  modal.classList.remove('hidden');
  // Pre-fill if key exists
  const existing = getApiKey();
  const input = document.getElementById('apiKeyInput');
  if (input && existing) input.value = existing;
  setTimeout(() => input?.focus(), 100);
}

function closeApiModal(demoMode = false) {
  const modal = document.getElementById('apiKeyModal');
  if (modal) modal.classList.add('hidden');
  if (demoMode) showToast('Running in demo mode — results are AI-simulated', 'info');
}

function toggleApiKeyVisibility() {
  const input = document.getElementById('apiKeyInput');
  const btn = document.getElementById('apiKeyEye');
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="17" height="17"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function updateApiStatusBar() {
  const bar = document.getElementById('apiStatusBar');
  const dot = document.getElementById('apiStatusDot');
  const text = document.getElementById('apiStatusText');
  if (!bar) return;

  bar.style.display = 'block';
  const key = getApiKey();

  if (key) {
    dot.className = 'ac-api-dot connected';
    // Show masked key
    const masked = key.slice(0, 7) + '••••••••' + key.slice(-4);
    text.textContent = `Connected — ${masked}`;
  } else {
    dot.className = 'ac-api-dot demo';
    text.textContent = 'Demo mode — add your API key for real AI compositions';
  }
}

/* ===== STATE ===== */
const ComposerState = {
  selectedGenre: 'any',
  selectedMood: 'any',
  history: JSON.parse(localStorage.getItem('harmonia_composer_history') || '[]'),
  stats: (() => {
    const raw = JSON.parse(localStorage.getItem('harmonia_composer_stats') || '{}');
    return { composed: 0, genres: [], xpEarned: 0, saved: 0, ...raw };
  })(),
  currentComposition: null,
  isGenerating: false,
  playbackInterval: null,
  playbackSeconds: 0,
  playbackTotal: 180,
  isPlaying: false,
};

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initWaveCanvas();
  initGenreGrid();
  initMoodGrid();
  initPromptCounter();
  renderHistory();
  renderStats();
  initPlaybackProgress();
  updateApiStatusBar();

  // Show API key modal on first visit if no key set
  if (!getApiKey()) {
    setTimeout(openApiModal, 600);
  }

  // Allow Enter to save API key
  document.getElementById('apiKeyInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKey();
  });
});

/* ===== WAVE CANVAS ===== */
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
      const amp = 12 - i * 3;
      const freq = 0.008 + i * 0.003;
      const speed = 0.03 - i * 0.008;
      const colors = ['167,139,250', '236,72,153', '56,189,248'];
      ctx.strokeStyle = `rgba(${colors[i]},${0.6 - i * 0.15})`;
      ctx.lineWidth = 2 - i * 0.4;
      for (let x = 0; x < w; x++) {
        const y = h / 2
          + Math.sin(x * freq + offset * speed + i * 1.2) * amp
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

/* ===== GENRE / MOOD ===== */
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

/* ===== PROMPT ===== */
function initPromptCounter() {
  const ta = document.getElementById('promptTextarea');
  const cc = document.getElementById('charCount');
  if (!ta || !cc) return;
  ta.addEventListener('input', () => {
    cc.textContent = ta.value.length;
    cc.style.color = ta.value.length > 720 ? '#ef4444' : '';
  });
}

function injectPrompt(text) {
  const ta = document.getElementById('promptTextarea');
  if (!ta) return;
  ta.value = text;
  ta.dispatchEvent(new Event('input'));
  ta.focus();
}

function clearPrompt() {
  const ta = document.getElementById('promptTextarea');
  if (ta) { ta.value = ''; ta.dispatchEvent(new Event('input')); ta.focus(); }
}

const SHUFFLE_PROMPTS = [
  "A minimalist piano nocturne with deep resonant left-hand chords and a delicate right-hand melody, reminiscent of Satie",
  "A high-energy punk rock anthem with distorted guitars, pounding drums and shouted vocals about rebellion",
  "A dreamy shoegaze track with washed-out reverb guitars, hushed vocals and a hypnotic drum pattern",
  "A Brazilian bossa nova with fingerpicked guitar, soft brushed drums, and a breezy saxophone melody",
  "An aggressive death metal riff in 7/8 time with down-tuned guitars and blastbeat drums",
  "A tender lullaby in C major with music box melody and soft string pads",
  "A neo-soul groove in F# minor with Rhodes piano, slap bass and trap hi-hats",
  "A haunting Celtic ballad in D dorian with uilleann pipes, fiddle and bodhran",
  "A 1970s funk track with wah-wah guitar, tight horns and a James Brown style breakdown",
  "A minimalist techno track at 132 BPM with a driving kick, sweeping filter cutoffs and industrial textures",
  "A peaceful Japanese koto piece with pentatonic scales, gentle shakuhachi and temple bell accents",
  "A cinematic trailer cue that builds from solo cello to full orchestra over 90 seconds",
];

function shufflePrompt() {
  injectPrompt(SHUFFLE_PROMPTS[Math.floor(Math.random() * SHUFFLE_PROMPTS.length)]);
}

/* ===== PRESETS ===== */
const PRESETS = {
  beethoven: { genre:'classical', mood:'epic', key:'C minor', time:'4/4', tempo:132, instruments:['piano','strings','brass'], prompt:'A dramatic classical piano sonata in C minor in the style of Beethoven, with a powerful opening motif, a lyrical slow movement and a stormy finale' },
  miles:     { genre:'jazz', mood:'mysterious', key:'D minor', time:'4/4', tempo:88,  instruments:['piano','bass','saxophone','drums'], prompt:'A cool modal jazz composition in D dorian, inspired by Miles Davis Kind of Blue, with long space-filled melodic lines and subtle chord changes' },
  lofi:      { genre:'lo-fi', mood:'calm', key:'G major', time:'4/4', tempo:80,  instruments:['piano','bass','drums'], prompt:'A chill lo-fi hip hop beat with a dusty vinyl texture, gentle jazz piano chords, muffled kick and snap, and a warm bass line perfect for studying' },
  hans:      { genre:'cinematic', mood:'epic', key:'D minor', time:'4/4', tempo:90,  instruments:['strings','brass','piano','drums'], prompt:'A massive cinematic orchestral score in the style of Hans Zimmer, starting with a single piano motif that slowly builds into a full orchestral climax with pounding percussion and soaring strings' },
  debussy:   { genre:'classical', mood:'mysterious', key:'Eb major', time:'4/4', tempo:72,  instruments:['piano','flute','strings'], prompt:'An impressionist piano piece inspired by Debussy, using whole tone scales, rich pedal tones, shimmering arpeggios and evocative dreamlike harmonies suggesting water and light' },
  edm:       { genre:'electronic', mood:'energetic', key:'F minor', time:'4/4', tempo:128, instruments:['synth','bass','drums'], prompt:'A festival-ready progressive house EDM track at 128 BPM with a punchy kick, massive synth chords, a euphoric melody drop and energy-building riser effects' },
};

function loadPreset(id) {
  const p = PRESETS[id];
  if (!p) return;
  document.querySelectorAll('.ac-genre-btn').forEach(b => b.classList.toggle('active', b.dataset.genre === p.genre));
  ComposerState.selectedGenre = p.genre;
  document.querySelectorAll('.ac-mood-btn').forEach(b => b.classList.toggle('active', b.dataset.mood === p.mood));
  ComposerState.selectedMood = p.mood;
  const keyEl = document.getElementById('keySelect');       if (keyEl)   keyEl.value   = p.key;
  const timeEl = document.getElementById('timeSelect');     if (timeEl)  timeEl.value  = p.time;
  const tempoEl = document.getElementById('tempoSlider');   if (tempoEl) tempoEl.value = p.tempo;
  const tempoVal = document.getElementById('tempoVal');     if (tempoVal) tempoVal.textContent = p.tempo;
  document.querySelectorAll('.ac-instr-check input').forEach(cb => { cb.checked = p.instruments.includes(cb.value); });
  injectPrompt(p.prompt);
  showToast(`✨ Preset loaded: ${id.charAt(0).toUpperCase() + id.slice(1)}`, 'info');
}

/* ===== SETTINGS ===== */
function getSettings() {
  return {
    genre:       ComposerState.selectedGenre,
    mood:        ComposerState.selectedMood,
    key:         document.getElementById('keySelect')?.value    || 'any',
    time:        document.getElementById('timeSelect')?.value   || '4/4',
    tempo:       document.getElementById('tempoSlider')?.value  || '120',
    instruments: [...document.querySelectorAll('.ac-instr-check input:checked')].map(cb => cb.value),
    format:      document.querySelector('input[name="format"]:checked')?.value || 'full',
    prompt:      document.getElementById('promptTextarea')?.value?.trim() || '',
  };
}

/* ===== PROMPTS FOR API ===== */
function buildSystemPrompt() {
  return `You are Harmonia's AI Composer — the world's most sophisticated musical composition assistant with deep expertise in music theory, harmony, counterpoint, orchestration, and all musical genres.

Respond ONLY with a single valid JSON object. No markdown, no code fences, no extra text before or after. Use this exact structure:

{
  "title": "Creative title",
  "subtitle": "Brief evocative subtitle",
  "tags": ["genre", "mood", "key"],
  "composition": {
    "overview": "2-3 sentence description",
    "structure": [
      {"section": "Intro", "bars": "1-8", "description": "What happens musically"},
      {"section": "A Section", "bars": "9-24", "description": "..."},
      {"section": "B Section", "bars": "25-40", "description": "..."},
      {"section": "Climax", "bars": "41-56", "description": "..."},
      {"section": "Outro", "bars": "57-64", "description": "..."}
    ],
    "notation": "ASCII note-name representation of the main theme, e.g.: Bar 1: A4 C5 E5 A5 | G5 F5 E5 D5 |\\nBar 2: ...",
    "fullDescription": "Rich detailed paragraph describing the full composition"
  },
  "chords": {
    "progression": [
      {"chord": "Am", "type": "minor", "roman": "i", "beats": 4, "description": "Tonic — home chord"},
      {"chord": "Dm", "type": "minor", "roman": "iv", "beats": 4, "description": "Subdominant"},
      {"chord": "E7", "type": "dominant 7th", "roman": "V7", "beats": 4, "description": "Dominant tension"},
      {"chord": "Am", "type": "minor", "roman": "i", "beats": 4, "description": "Resolution"},
      {"chord": "F", "type": "major", "roman": "VI", "beats": 2, "description": "Borrowed chord"},
      {"chord": "G", "type": "major", "roman": "VII", "beats": 2, "description": "Subtonic"},
      {"chord": "E7", "type": "dominant 7th", "roman": "V7", "beats": 4, "description": "Strong cadence"},
      {"chord": "Am", "type": "minor", "roman": "i", "beats": 4, "description": "Final resolution"}
    ],
    "analysis": "Paragraph analyzing the harmonic structure, voice leading, and interesting chord choices",
    "voicings": "Specific voicing suggestions for the instruments involved"
  },
  "theory": {
    "keyAndScale": "Detailed explanation of key, scale, and modal considerations",
    "harmony": "Discussion of harmonic language, tension, resolution, borrowed chords",
    "rhythm": "Analysis of rhythmic elements, syncopation, groove",
    "form": "Musical form analysis (ternary, sonata, AABA, etc.)",
    "influences": "Musical influences and stylistic references",
    "learningPoints": ["Key takeaway 1", "Key takeaway 2", "Key takeaway 3", "Key takeaway 4", "Key takeaway 5"]
  },
  "performance": {
    "tempoAndFeel": "Detailed tempo markings, feel, groove description",
    "instrumentGuides": [
      {"instrument": "Piano", "role": "what it plays", "technique": "specific techniques", "tips": "practical advice"}
    ],
    "dynamicsAndExpression": "Dynamics map, expression markings, phrasing guidance",
    "practiceSteps": ["Step 1: ...", "Step 2: ...", "Step 3: ...", "Step 4: ..."],
    "commonMistakes": ["Mistake 1 and how to avoid it", "Mistake 2..."]
  }
}

Be extremely specific, musically accurate, and creatively inspired. Use correct music theory terminology.`;
}

function buildUserPrompt(s) {
  return `Generate a complete musical composition:

DESCRIPTION: ${s.prompt || 'Create an original, expressive composition based on the settings below'}
GENRE: ${s.genre === 'any' ? 'Your choice' : s.genre}
MOOD: ${s.mood === 'any' ? 'Your choice' : s.mood}
KEY: ${s.key === 'any' ? 'Choose an appropriate key' : s.key}
TIME SIGNATURE: ${s.time}
TEMPO: ${s.tempo} BPM
INSTRUMENTS: ${s.instruments.length > 0 ? s.instruments.join(', ') : 'Choose appropriate instruments'}
OUTPUT FORMAT: ${s.format === 'full' ? 'Full composition' : s.format === 'chord' ? 'Focus on chord progressions' : s.format === 'melody' ? 'Focus on melody' : 'Lead sheet'}

Make it genuinely inspiring and musically sophisticated.`;
}

/* ===== LOADING ===== */
let loadStepTimer = null;

function startLoadingAnimation() {
  const steps = ['lstep1','lstep2','lstep3','lstep4'];
  steps.forEach(id => document.getElementById(id)?.classList.remove('active','done'));
  document.getElementById(steps[0])?.classList.add('active');
  let current = 0;

  const headlines = ['Composing your masterpiece…','Crafting harmonic structure…','Writing melodic lines…','Finishing the score…'];
  const subtexts  = ['Analyzing musical intent and style','Building chord progressions and voice leading','Developing motifs and melodic phrases','Adding dynamics, articulation and performance notes'];

  loadStepTimer = setInterval(() => {
    if (current < steps.length - 1) {
      document.getElementById(steps[current])?.classList.replace('active','done');
      current++;
      document.getElementById(steps[current])?.classList.add('active');
      document.getElementById('loadingHeadline').textContent = headlines[current];
      document.getElementById('loadingSubtext').textContent  = subtexts[current];
    }
  }, 1800);
}

function stopLoadingAnimation() {
  clearInterval(loadStepTimer); loadStepTimer = null;
  ['lstep1','lstep2','lstep3','lstep4'].forEach(id => {
    const el = document.getElementById(id);
    el?.classList.remove('active');
    el?.classList.add('done');
  });
}

function showEmpty()   { document.getElementById('emptyState')?.classList.remove('hidden');  document.getElementById('loadingState')?.classList.add('hidden');    document.getElementById('resultState')?.classList.add('hidden'); }
function showLoading() { document.getElementById('emptyState')?.classList.add('hidden');     document.getElementById('loadingState')?.classList.remove('hidden'); document.getElementById('resultState')?.classList.add('hidden'); }
function showResult()  { document.getElementById('emptyState')?.classList.add('hidden');     document.getElementById('loadingState')?.classList.add('hidden');    document.getElementById('resultState')?.classList.remove('hidden'); }

/* ===== GENERATE ===== */
async function generateComposition() {
  if (ComposerState.isGenerating) return;

  const settings = getSettings();
  if (!settings.prompt && settings.genre === 'any' && settings.mood === 'any') {
    showToast('Please describe your music or pick a genre/mood!', 'error');
    document.getElementById('promptTextarea')?.focus();
    return;
  }

  ComposerState.isGenerating = true;
  const btn  = document.getElementById('generateBtn');
  const icon = document.getElementById('generateIcon');
  const text = document.getElementById('generateText');
  if (btn)  btn.disabled = true;
  if (icon) icon.classList.add('spinning');
  if (text) text.textContent = 'Composing…';

  showLoading();
  startLoadingAnimation();

  const apiKey = getApiKey();

  try {
    if (!apiKey) throw new Error('No API key — using demo mode');

    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'grok-3',
        max_tokens: 4000,
        messages: [
          { role: 'system', content: buildSystemPrompt() },
          { role: 'user',   content: buildUserPrompt(settings) },
        ],
      }),
    });

    if (response.status === 401 || response.status === 403) {
      localStorage.removeItem(API_KEY_STORAGE);
      updateApiStatusBar();
      throw new Error('Invalid API key — removed. Please re-enter.');
    }
    if (!response.ok) throw new Error(`API error ${response.status}`);

    const data = await response.json();
    const raw  = data.choices?.[0]?.message?.content || '';

    // Robust JSON extraction
    let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
    const start = cleaned.indexOf('{');
    const end   = cleaned.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON in response');
    const composition = JSON.parse(cleaned.slice(start, end + 1));

    stopLoadingAnimation();
    ComposerState.currentComposition = { composition, settings, timestamp: Date.now() };
    renderResult(composition, settings);
    showResult();
    updateStats(settings);
    addToHistory(composition, settings);
    if (typeof HarmoniaDB !== 'undefined') HarmoniaDB.addXP(75, `AI Composition: ${composition.title}`);
    showToast(`🎵 "${composition.title}" composed! +75 XP`, 'success');

  } catch (err) {
    console.warn('Composition fallback triggered:', err.message);
    stopLoadingAnimation();

    // Show error toast if it was an API key issue
    if (err.message.includes('Invalid API key')) {
      showToast('❌ ' + err.message, 'error');
    }

    const fallback = buildFallbackComposition(settings);
    ComposerState.currentComposition = { composition: fallback, settings, timestamp: Date.now() };
    renderResult(fallback, settings);
    showResult();
    updateStats(settings);
    addToHistory(fallback, settings);

    if (!err.message.includes('Invalid API key')) {
      showToast(apiKey ? '⚠️ API error — showing demo composition' : '🎭 Demo mode — add API key for real AI', 'info');
    }
  } finally {
    ComposerState.isGenerating = false;
    if (btn)  btn.disabled = false;
    if (icon) icon.classList.remove('spinning');
    if (text) text.textContent = 'Generate Composition';
  }
}

/* ===== FALLBACK ===== */
function buildFallbackComposition(settings) {
  const genre  = settings.genre === 'any' ? 'Classical' : capitalize(settings.genre);
  const mood   = settings.mood  === 'any' ? 'Expressive' : capitalize(settings.mood);
  const key    = settings.key   === 'any' ? 'A minor' : settings.key;
  const tempo  = settings.tempo || 120;
  const instrs = settings.instruments.length > 0 ? settings.instruments : ['piano'];
  const isMinor = key.toLowerCase().includes('minor');

  return {
    title: `${mood} ${genre} Study in ${key}`,
    subtitle: `An original composition at ${tempo} BPM`,
    tags: [genre.toLowerCase(), mood.toLowerCase(), key],
    composition: {
      overview: `A ${mood.toLowerCase()} ${genre.toLowerCase()} composition in ${key} at ${tempo} BPM, performed by ${instrs.join(', ')}. The piece explores rich harmonic textures and expressive melodic lines across five distinct sections.`,
      structure: [
        { section:'Introduction',    bars:'1–8',   description:'Establishes the tonal centre with a solo entrance; sparse texture invites the listener in' },
        { section:'A Section',       bars:'9–24',  description:'Primary melodic material over the foundational harmonic progression; full texture emerges' },
        { section:'B Section',       bars:'25–40', description:'Contrasting theme with increased rhythmic energy and harmonic movement toward the relative key' },
        { section:'Development',     bars:'41–56', description:'Thematic material fragmented and explored through different registers and harmonic colours' },
        { section:'Recapitulation',  bars:'57–72', description:'Return of opening theme, now harmonically enriched with added inner voices' },
        { section:'Coda',            bars:'73–80', description:'Conclusive ending resolving all harmonic tension to the tonic with a final plagal cadence' },
      ],
      notation: `Main Theme (${key}):\nBar 1: ${isMinor?'A4 C5 E5 A5':'C4 E4 G4 C5'} | ${isMinor?'G5 F5 E5 D5':'B4 A4 G4 F4'} |\nBar 2: ${isMinor?'C5 B4 A4 G4':'E4 D4 C4 B3'} | ${isMinor?'F4 E4 D4 C4':'A3 G3 F3 E3'} |\nBar 3: ${isMinor?'E4 A4 C5 E5':'G3 C4 E4 G4'} | ${isMinor?'F5 E5 D5 C5':'F4 E4 D4 C4'} |\nBar 4: ${isMinor?'B4 A4 G#4 A4':'D4 C4 B3 C4'} | (sustain) ... |`,
      fullDescription: `This ${mood.toLowerCase()} work in ${key} unfolds over 80 bars, beginning with an intimate introduction before blossoming into a fully realised composition. The ${instrs.join(' and ')} interweave throughout, creating a rich sonic tapestry. Harmonic language draws from the ${genre.toLowerCase()} tradition while incorporating fresh voice-leading perspectives.`,
    },
    chords: {
      progression: [
        { chord: isMinor?'Am':'C',   type: isMinor?'minor':'major',        roman:'i',   beats:4, description:'Tonic — home chord, sense of rest and arrival' },
        { chord: isMinor?'Dm':'Am',  type:'minor',                          roman:isMinor?'iv':'vi', beats:4, description:'Subdominant area — moves away from home' },
        { chord: isMinor?'E7':'F',   type: isMinor?'dominant 7th':'major',  roman:isMinor?'V7':'IV', beats:4, description:'Creates tension that pulls back to tonic' },
        { chord: isMinor?'Am':'G7',  type: isMinor?'minor':'dominant 7th',  roman:isMinor?'i':'V7',  beats:4, description:'Resolution or continued tension' },
        { chord: isMinor?'F':'Em',   type: isMinor?'major':'minor',         roman:isMinor?'VI':'iii',beats:2, description:'Borrowed chord — adds modal colour' },
        { chord: isMinor?'G':'Dm',   type:'major',                          roman:isMinor?'VII':'ii',beats:2, description:'Subtonic / pre-dominant function' },
        { chord: isMinor?'E7':'G',   type: isMinor?'dominant 7th':'major',  roman:isMinor?'V7':'V',  beats:4, description:'Strong dominant pull toward resolution' },
        { chord: isMinor?'Am':'C',   type: isMinor?'minor':'major',         roman:'i',   beats:4, description:'Final resolution — satisfying homecoming' },
      ],
      analysis:`The progression leans on classical functional harmony, spotlighting the tension-resolution relationship between dominant and tonic. The ${isMinor?'borrowed VI (major chord on the sixth degree) introduces Dorian colour':'secondary dominant V/V adds chromatic warmth'}. Voice leading is smooth throughout, with common tones held and other voices moving by step.`,
      voicings:`${instrs.includes('piano')?'Piano: left hand plays root-fifth bass patterns; right hand plays close-position voicings with melody on top. ':''}${instrs.includes('guitar')?'Guitar: use open or barre chord voicings, adding sus2 embellishments. ':''}Allow chord tones to overlap for a legato harmonic texture.`,
    },
    theory: {
      keyAndScale:`The piece is in ${key}, using the ${isMinor?'natural minor (Aeolian) scale as its primary mode, borrowing the raised 7th for the dominant chord to create harmonic minor colour at cadences':'major scale throughout, with occasional modal mixture from the parallel minor adding emotional depth'}.`,
      harmony:`The harmonic language is ${mood==='Dark'||mood==='Mysterious'?'rich with dissonance, exploiting tritone relationships and secondary dominants':'warm and functional, using primary triads as anchors with diatonic seventh chords adding sophistication'}. ${isMinor?'The characteristic minor sixth (tonic to submediant) is highlighted melodically.':'The major third is celebrated throughout the melodic writing.'}`,
      rhythm:`At ${tempo} BPM in ${settings.time}, the feel is ${tempo<80?'expansive and unhurried — let each note breathe':tempo<120?'flowing and conversational':tempo<160?'energetic and driven':'exhilarating and propulsive'}. Key rhythmic features include syncopated melodic entries against steady harmonic pulse and textural interplay between layers.`,
      form:`Modified ternary form (A–B–A') with introduction and coda — common in ${genre} music. The A section presents the primary theme, B provides contrast and development, and A's return is varied and harmonically enriched.`,
      influences:`Stylistically rooted in the ${genre} tradition with harmonic sensitivity from late Romantic practice. The melodic writing draws from singable, vocal lines of the Classical period while the rhythmic drive reflects contemporary sensibilities.`,
      learningPoints:[
        `${isMinor?'Natural vs. harmonic minor — notice why the 7th degree changes before the dominant chord':'Major scale with modal mixture — observe how borrowing from the parallel minor creates emotional depth'}`,
        'Voice leading: track how each chord tone moves to the nearest note in the next chord',
        `The dominant chord (V or V7) — how it creates and releases tension, the engine of tonal music`,
        `${tempo<100?'Slow tempos require longer note values, different phrasing, and sustained tone production':'Fast tempos demand precise articulation, rhythmic lockdown, and efficient technique'}`,
        'Melodic contour (shape) and its relationship to emotional expression in the phrase',
      ],
    },
    performance: {
      tempoAndFeel:`♩ = ${tempo} BPM. ${tempo<80?'Largo — very slow, expressive; small ritenuto at phrase endings encouraged':tempo<100?'Andante — walking pace; lean into expressive lines with tasteful rubato':tempo<120?'Moderato — flowing and balanced; maintain pulse while shaping phrases naturally':tempo<160?'Allegro — energetic; precision is paramount, lock in with the pulse':'Presto — exhilarating; clarity and articulation are everything'}. Feel: ${mood.toLowerCase()}.`,
      instrumentGuides: instrs.slice(0,4).map(instr => ({
        instrument: capitalize(instr),
        role: instr==='piano'?'Carries melody and harmony; left hand provides bass and inner voices, right hand projects the melodic line':instr==='guitar'?'Provides rhythmic chordal support and occasional melodic fills between vocal/lead phrases':instr==='bass'?'Anchors the harmonic rhythm; follow the root movement of each chord cleanly':instr==='drums'?'Establishes groove and drives energy forward; support all dynamic shaping':instr==='strings'?'Provide lush harmonic pad; bow direction changes should align with phrase boundaries':'Contribute to the overall texture and emotional atmosphere',
        technique: instr==='piano'?'Change sustain pedal on each new harmony. Voice the chord so melody is loudest. Use half-pedalling for transparency':instr==='guitar'?'Mix strumming and fingerpicking; mute unwanted strings; use vibrato on sustained melody notes':instr==='bass'?'Smooth legato; connect chord roots with scalar or chromatic passing tones on the beat':instr==='drums'?'Ghost notes on snare for texture; rimshot for accents; brush technique for soft sections':'Focus on tonal quality, intonation, and blending with the ensemble',
        tips:`Record yourself and listen back critically. Start at ${Math.round(tempo*0.6)} BPM and build up. Listen to great ${genre.toLowerCase()} recordings for stylistic reference.`,
      })),
      dynamicsAndExpression:`Begin mp (mezzo-piano). Build to mf during the B section. Climax at f (forte) around bar 48. Return to mp for the recapitulation, closing ppp (pianissimo). Gradual diminuendo in the final 4 bars. Expression: dolce (sweetly) for lyrical passages, espressivo for the development, risoluto for climactic moments.`,
      practiceSteps:[
        `Step 1: Learn each part separately at ${Math.round(tempo*0.6)} BPM — focus on note accuracy and fingering, not speed`,
        `Step 2: Combine parts at ${Math.round(tempo*0.75)} BPM — concentrate on rhythmic alignment and dynamic balance between instruments`,
        `Step 3: Add dynamics and expression at ${Math.round(tempo*0.9)} BPM — shape each phrase with intention; record and review`,
        `Step 4: Perform at full ${tempo} BPM — run complete takes without stopping; evaluate flow, blend, and musical communication`,
      ],
      commonMistakes:[
        `Rushing through difficult passages — use a metronome religiously, starting at ${Math.round(tempo*0.6)} BPM`,
        'Ignoring dynamic contrast — the difference between p and f is what breathes life into the music',
        `${instrs.includes('piano')?'Over-pedalling — muddy harmony destroys clarity; change pedal on every chord change':'Playing too rigidly — music needs both rhythmic accuracy and expressive flexibility'}`,
        'Not listening to the other parts — chamber music is conversation; react to what others play',
      ],
    },
  };
}

/* ===== RENDER ===== */
function renderResult(comp, settings) {
  document.getElementById('resultTitle').textContent = comp.title || 'Untitled Composition';

  const metaEl = document.getElementById('resultMeta');
  if (metaEl) {
    metaEl.innerHTML =
      (comp.tags||[]).map(t=>`<span class="ac-meta-tag">${t}</span>`).join('') +
      `<span class="ac-meta-tag">🎵 ${settings.tempo} BPM</span>` +
      `<span class="ac-meta-tag">⏱ ${settings.time}</span>` +
      (getApiKey() ? '<span class="ac-meta-tag" style="color:#34d399;border-color:rgba(52,211,153,0.3)">✦ Grok AI</span>' : '<span class="ac-meta-tag" style="color:#fbbf24;border-color:rgba(251,191,36,0.3)">🎭 Demo</span>');
  }

  const pb = document.getElementById('playbackTitle');
  if (pb) pb.textContent = `"${comp.title}" — ${comp.subtitle || ''}`;

  const bars = (comp.composition?.structure?.length || 5) * 16;
  ComposerState.playbackTotal = Math.round((bars / (parseInt(settings.tempo)||120)) * 60);
  document.getElementById('playbackTime').textContent = `0:00 / ${formatTime(ComposerState.playbackTotal)}`;

  renderCompositionTab(comp);
  renderChordsTab(comp);
  renderTheoryTab(comp);
  renderPerformanceTab(comp);
}

function renderCompositionTab(comp) {
  const el = document.getElementById('compositionOutput');
  if (!el || !comp.composition) return;
  let html = `<h2>🎼 Overview</h2><p>${comp.composition.overview||''}</p>`;
  if (comp.composition.structure?.length) {
    html += `<h2>📐 Structure</h2>`;
    comp.composition.structure.forEach(s => {
      html += `<h3>${s.section} <span style="font-weight:400;color:var(--muted);font-size:0.8rem">(Bars ${s.bars})</span></h3><p>${s.description}</p>`;
    });
  }
  if (comp.composition.notation) html += `<h2>🎵 Main Theme Notation</h2><div class="ac-notation-block">${escapeHTML(comp.composition.notation)}</div>`;
  if (comp.composition.fullDescription) html += `<h2>📖 Full Description</h2><div class="ac-tip-card">${comp.composition.fullDescription}</div>`;
  el.innerHTML = html;
}

function renderChordsTab(comp) {
  const el = document.getElementById('chordsOutput');
  if (!el || !comp.chords) return;
  let html = '<h2>🎹 Chord Progression</h2>';
  if (comp.chords.progression?.length) {
    html += '<div class="ac-chord-grid">';
    comp.chords.progression.forEach(c => {
      html += `<div class="ac-chord-box"><span class="ac-chord-name">${c.chord}</span><span class="ac-chord-type">${c.type||''}</span><span class="ac-chord-roman">${c.roman||''}</span></div>`;
    });
    html += '</div><h2>📋 Chord Details</h2>';
    comp.chords.progression.forEach(c => {
      html += `<div class="ac-tip-card"><strong>${c.chord} (${c.roman})</strong> — ${c.description||''} ${c.beats?`<em style="color:var(--muted);font-size:0.8rem">[${c.beats} beat${c.beats!==1?'s':''}]</em>`:''}</div>`;
    });
  }
  if (comp.chords.analysis) html += `<h2>🔍 Harmonic Analysis</h2><p>${comp.chords.analysis}</p>`;
  if (comp.chords.voicings) html += `<h2>🤲 Voicing Suggestions</h2><div class="ac-notation-block">${escapeHTML(comp.chords.voicings)}</div>`;
  el.innerHTML = html;
}

function renderTheoryTab(comp) {
  const el = document.getElementById('theoryOutput');
  if (!el || !comp.theory) return;
  const sections = [
    { key:'keyAndScale', icon:'🎼', label:'Key & Scale' },
    { key:'harmony',     icon:'🎵', label:'Harmony' },
    { key:'rhythm',      icon:'🥁', label:'Rhythm & Time' },
    { key:'form',        icon:'📐', label:'Musical Form' },
    { key:'influences',  icon:'🎭', label:'Influences & Style' },
  ];
  let html = '';
  sections.forEach(s => { if (comp.theory[s.key]) html += `<h2>${s.icon} ${s.label}</h2><p>${comp.theory[s.key]}</p>`; });
  if (comp.theory.learningPoints?.length) {
    html += '<h2>💡 Key Learning Points</h2><ul>';
    comp.theory.learningPoints.forEach(pt => { html += `<li>${pt}</li>`; });
    html += '</ul>';
  }
  el.innerHTML = html;
}

function renderPerformanceTab(comp) {
  const el = document.getElementById('performanceOutput');
  if (!el || !comp.performance) return;
  let html = '';
  if (comp.performance.tempoAndFeel) html += `<h2>🎛️ Tempo & Feel</h2><div class="ac-tip-card">${comp.performance.tempoAndFeel}</div>`;
  if (comp.performance.instrumentGuides?.length) {
    html += '<h2>🎸 Instrument Guides</h2>';
    comp.performance.instrumentGuides.forEach(g => {
      html += `<div class="ac-section-divider">${g.instrument}</div><h3>Role: <span style="font-weight:500;color:var(--muted)">${g.role}</span></h3><p><strong>Technique:</strong> ${g.technique}</p><div class="ac-tip-card"><strong>💡 Tip:</strong> ${g.tips}</div>`;
    });
  }
  if (comp.performance.dynamicsAndExpression) html += `<h2>📊 Dynamics & Expression</h2><p>${comp.performance.dynamicsAndExpression}</p>`;
  if (comp.performance.practiceSteps?.length) { html += '<h2>🪜 Practice Plan</h2><ul>'; comp.performance.practiceSteps.forEach(s=>{ html+=`<li>${s}</li>`; }); html+='</ul>'; }
  if (comp.performance.commonMistakes?.length) { html += '<h2>⚠️ Common Mistakes to Avoid</h2><ul>'; comp.performance.commonMistakes.forEach(m=>{ html+=`<li>${m}</li>`; }); html+='</ul>'; }
  el.innerHTML = html;
}

/* ===== TABS ===== */
function switchTab(btn, tabId) {
  document.querySelectorAll('.ac-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.ac-tab-content').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-' + tabId)?.classList.add('active');
}

/* ===== PLAYBACK ===== */
function initPlaybackProgress() {
  document.querySelector('.ac-playback-progress-wrap')?.addEventListener('click', e => {
    if (!ComposerState.currentComposition) return;
    const rect = e.currentTarget.getBoundingClientRect();
    ComposerState.playbackSeconds = Math.round(((e.clientX - rect.left) / rect.width) * ComposerState.playbackTotal);
    updatePlaybackUI();
  });
}

function togglePlayback() {
  if (!ComposerState.currentComposition) { showToast('Generate a composition first!', 'error'); return; }
  ComposerState.isPlaying ? pausePlayback() : startPlayback();
}

function startPlayback() {
  ComposerState.isPlaying = true;
  document.getElementById('playIcon').style.display  = 'none';
  document.getElementById('pauseIcon').style.display = 'block';
  ComposerState.playbackInterval = setInterval(() => {
    if (ComposerState.playbackSeconds >= ComposerState.playbackTotal) { stopPlayback(); return; }
    ComposerState.playbackSeconds++;
    updatePlaybackUI();
  }, 1000);
}

function pausePlayback() {
  ComposerState.isPlaying = false;
  document.getElementById('playIcon').style.display  = 'block';
  document.getElementById('pauseIcon').style.display = 'none';
  clearInterval(ComposerState.playbackInterval);
  ComposerState.playbackInterval = null;
}

function stopPlayback() {
  pausePlayback();
  ComposerState.playbackSeconds = 0;
  updatePlaybackUI();
}

function updatePlaybackUI() {
  const pct = (ComposerState.playbackSeconds / ComposerState.playbackTotal) * 100;
  document.getElementById('playbackProgress').style.width = pct + '%';
  document.getElementById('playbackTime').textContent = `${formatTime(ComposerState.playbackSeconds)} / ${formatTime(ComposerState.playbackTotal)}`;
}

function formatTime(s) { return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`; }

/* ===== COPY / DOWNLOAD ===== */
function copyComposition() {
  if (!ComposerState.currentComposition) return;
  navigator.clipboard.writeText(buildTextExport(ComposerState.currentComposition.composition))
    .then(()  => showToast('📋 Copied to clipboard!', 'success'))
    .catch(()  => showToast('Copy failed — try manually', 'error'));
}

function downloadComposition() {
  if (!ComposerState.currentComposition) return;
  const { composition } = ComposerState.currentComposition;
  const blob = new Blob([buildTextExport(composition)], { type:'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'), { href:url, download:`${(composition.title||'composition').replace(/[^a-z0-9]/gi,'_')}.txt` });
  a.click(); URL.revokeObjectURL(url);
  ComposerState.stats.saved = (ComposerState.stats.saved||0) + 1;
  saveStats(); renderStats();
  showToast('💾 Saved!', 'success');
}

function buildTextExport(comp) {
  let out = `HARMONIA AI COMPOSER\n${'='.repeat(50)}\n\nTITLE: ${comp.title}\n`;
  if (comp.subtitle) out += `SUBTITLE: ${comp.subtitle}\n`;
  out += `\n`;
  if (comp.composition) {
    out += `OVERVIEW\n${'-'.repeat(30)}\n${comp.composition.overview}\n\n`;
    if (comp.composition.structure) { out += `STRUCTURE\n${'-'.repeat(30)}\n`; comp.composition.structure.forEach(s => { out += `${s.section} (${s.bars}): ${s.description}\n`; }); out+='\n'; }
    if (comp.composition.notation)  out += `NOTATION\n${'-'.repeat(30)}\n${comp.composition.notation}\n\n`;
  }
  if (comp.chords?.progression) { out += `CHORD PROGRESSION\n${'-'.repeat(30)}\n${comp.chords.progression.map(c=>`${c.chord}(${c.roman})`).join(' - ')}\n\n${comp.chords.analysis||''}\n\n`; }
  if (comp.theory?.keyAndScale)  out += `THEORY\n${'-'.repeat(30)}\n${comp.theory.keyAndScale}\n\n${comp.theory.harmony||''}\n\n`;
  if (comp.performance?.tempoAndFeel) out += `PERFORMANCE\n${'-'.repeat(30)}\n${comp.performance.tempoAndFeel}\n\n`;
  out += `\nGenerated by Harmonia AI Composer\n`;
  return out;
}

/* ===== HISTORY ===== */
function addToHistory(comp, settings) {
  const item = { id:Date.now(), title:comp.title, genre:settings.genre, mood:settings.mood, tempo:settings.tempo, timestamp:Date.now(), icon:getGenreIcon(settings.genre), xp:75, wasAI: !!getApiKey() };
  ComposerState.history = [item, ...ComposerState.history].slice(0, 20);
  localStorage.setItem('harmonia_composer_history', JSON.stringify(ComposerState.history));
  renderHistory();
}

function renderHistory() {
  const el = document.getElementById('historyList');
  if (!el) return;
  if (!ComposerState.history.length) { el.innerHTML=`<div class="ac-history-empty"><span>🎵</span><p>Your compositions will appear here</p></div>`; return; }
  el.innerHTML = ComposerState.history.map(item => `
    <div class="ac-history-item">
      <span class="ac-history-icon">${item.icon}</span>
      <div class="ac-history-info">
        <span class="ac-history-name">${escapeHTML(item.title)}</span>
        <span class="ac-history-meta">${capitalize(item.genre)} · ${item.tempo} BPM · ${formatTimeAgo(item.timestamp)}${item.wasAI?' · <span style="color:#a78bfa">AI</span>':''}</span>
      </div>
      <span class="ac-history-xp">+${item.xp} XP</span>
    </div>`).join('');
}

function clearHistory() {
  ComposerState.history = [];
  localStorage.removeItem('harmonia_composer_history');
  renderHistory();
  showToast('History cleared', 'info');
}

/* ===== STATS ===== */
function updateStats(settings) {
  ComposerState.stats.composed = (ComposerState.stats.composed||0) + 1;
  if (!Array.isArray(ComposerState.stats.genres)) ComposerState.stats.genres = [];
  if (settings.genre !== 'any' && !ComposerState.stats.genres.includes(settings.genre)) ComposerState.stats.genres.push(settings.genre);
  ComposerState.stats.xpEarned = (ComposerState.stats.xpEarned||0) + 75;
  saveStats(); renderStats();
}

function saveStats() { localStorage.setItem('harmonia_composer_stats', JSON.stringify(ComposerState.stats)); }

function renderStats() {
  document.getElementById('statComposed').textContent = ComposerState.stats.composed || 0;
  document.getElementById('statGenres').textContent   = ComposerState.stats.genres?.length || 0;
  document.getElementById('statXP').textContent       = ComposerState.stats.xpEarned || 0;
  document.getElementById('statSaved').textContent    = ComposerState.stats.saved || 0;
}

/* ===== UTILS ===== */
function getGenreIcon(g) { return ({classical:'🎻',jazz:'🎷',pop:'🎤',rock:'🎸',electronic:'⚡','hip-hop':'🎧',ambient:'🌊',folk:'🪕','r&b':'💜',cinematic:'🎬','lo-fi':'☕',any:'🎵'})[g] || '🎵'; }
function capitalize(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : ''; }
function escapeHTML(s) { return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
function formatTimeAgo(ts) { const d=Date.now()-ts; return d<60000?'just now':d<3600000?`${Math.floor(d/60000)}m ago`:d<86400000?`${Math.floor(d/3600000)}h ago`:new Date(ts).toLocaleDateString(); }

function showToast(msg, type='info') {
  const t = document.getElementById('acToast');
  if (!t) return;
  t.textContent = msg;
  t.className = `ac-toast ${type} show`;
  clearTimeout(window._acToastTimer);
  window._acToastTimer = setTimeout(() => t.classList.remove('show'), 3400);
}
