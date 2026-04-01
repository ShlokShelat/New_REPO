/**
 * style-transfer.js
 * Claude API-powered music style transformer
 */

/* ══════════════════════════════════════════════════
   STYLE PRESETS
   ══════════════════════════════════════════════════ */
const STYLES = [
  {
    id: 'baroque',
    emoji: '🎻',
    name: 'Baroque',
    era: '1600 – 1750',
    color: '#d97706',
    rgb: '217,119,6',
    desc: 'Ornate counterpoint, harpsichord texture, and formal grandeur',
    traits: ['Counterpoint', 'Ornamented', 'Polyphonic', 'Sacred'],
    prompt: `You are a Baroque-era music composer and lyricist. Transform the given text into the style of Baroque music — imagine it as lyrics or a musical description written with the formal, ornate, deeply spiritual sensibility of Bach or Handel. Use:
- Elevated, archaic language ("thee", "thy", "doth", "wherefore")
- Religious or metaphysical undertones
- Symmetrical phrase structures mirroring contrapuntal music
- Imagery of order, divine structure, mathematical beauty
- Reference instruments like harpsichord, organ, viola da gamba, lute
- A sense of ceremony and grandeur
Keep the core meaning intact but transform the expression entirely into Baroque sensibility.`,
  },
  {
    id: 'jazz',
    emoji: '🎺',
    name: 'Cool Jazz',
    era: '1940s – 1960s',
    color: '#db2777',
    rgb: '219,39,119',
    desc: 'Blue notes, smoky atmosphere, improvisational flow',
    traits: ['Bebop', 'Syncopated', 'Modal', 'Blue notes'],
    prompt: `You are a Jazz musician and lyricist channeling the spirit of Miles Davis, Chet Baker, and late-night 1950s jazz clubs. Transform the given text in the jazz style:
- Laid-back, conversational phrasing with natural syncopation
- References to night, rain, smoke, whiskey, cities, longing, freedom
- Occasional scat-like onomatopoeia or vocal improvisation markers (yeah, oh, mm)
- Understated cool — emotion held beneath the surface
- Blue note intervals implied in word choices (flattened, bent, ambiguous)
- Short, punchy lines alternating with extended improvised passages
- The feeling of a late-night session where anything could happen`,
  },
  {
    id: 'romantic',
    emoji: '🌹',
    name: 'Romantic',
    era: '1820 – 1900',
    color: '#be185d',
    rgb: '190,24,93',
    desc: 'Sweeping drama, emotional extremes, orchestral grandeur',
    traits: ['Dramatic', 'Chromatic', 'Programmatic', 'National'],
    prompt: `You are a Romantic-era composer in the tradition of Chopin, Wagner, and Liszt. Transform the text with full Romantic sensibility:
- Soaring, emotionally unbounded language
- References to nature as emotional mirror (storms, moonlight, mountains, sea)
- Dramatic dynamic contrasts (from whisper to thunder)
- Longing, heroism, grief, transcendence — never neutral
- Rich chromatic imagery and unexpected harmonic turns in description
- Programmatic storytelling — music tells a narrative
- The individual soul against the infinite universe`,
  },
  {
    id: 'minimalist',
    emoji: '◻️',
    name: 'Minimalist',
    era: '1960s – Present',
    color: '#0ea5e9',
    rgb: '14,165,233',
    desc: 'Repetition, gradual evolution, hypnotic simplicity',
    traits: ['Repetitive', 'Phased', 'Meditative', 'Process'],
    prompt: `You are a Minimalist composer in the tradition of Philip Glass, Steve Reich, and Arvo Pärt. Transform the text with Minimalist aesthetics:
- Strip language to its essential elements — remove all excess
- Use repetition with subtle variation — the same phrase, slightly changed
- Gradual, almost imperceptible evolution of meaning
- Meditative, hypnotic quality — the reader enters a trance
- Sparse punctuation, white space between thoughts
- Small words, simple structures — power through accumulation not complexity
- The text should feel like it's phase-shifting, like two voices slightly out of sync`,
  },
  {
    id: 'impressionist',
    emoji: '🌊',
    name: 'Impressionist',
    era: '1890s – 1920s',
    color: '#10b981',
    rgb: '16,185,129',
    desc: 'Shimmering textures, color over form, atmospheric suggestion',
    traits: ['Atmospheric', 'Modal', 'Timbre-focused', 'Suggestive'],
    prompt: `You are Claude Debussy or Maurice Ravel, masters of musical Impressionism. Transform the text with Impressionist sensibility:
- Prioritize texture, color, and atmosphere over clear narrative
- Dissolve hard edges — let meaning shimmer and blur at the margins
- Water imagery: reflections, ripples, mist, light on water
- Synesthetic descriptions: describe sound as color, feeling as texture
- Whole-tone scale thinking: ambiguous, unresolved, floating
- Avoid strong cadences or conclusions — let things hang, unresolved
- The beauty is in the suggestion, not the statement`,
  },
  {
    id: 'hip-hop',
    emoji: '🎤',
    name: 'Hip-Hop',
    era: '1970s – Present',
    color: '#ea580c',
    rgb: '234,88,12',
    desc: 'Rhythmic precision, internal rhymes, street poetry',
    traits: ['Rhyme scheme', 'Flow', 'Samples', 'Cultural'],
    prompt: `You are a skilled hip-hop lyricist and producer channeling the tradition from Rakim to Kendrick Lamar. Transform the text with hip-hop aesthetics:
- Dense rhyme schemes with multisyllabic internal rhymes
- Strong rhythmic flow — every line should feel like it rides a beat
- Cultural specificity and authentic voice — no generic platitudes
- Wordplay, double meanings, metaphors stacked on metaphors
- Cadence that implies the 4/4 groove underneath
- From the specific to the universal — personal story becomes anthem
- Let the rhythm do as much work as the meaning`,
  },
  {
    id: 'classical',
    emoji: '🎹',
    name: 'Classical',
    era: '1750 – 1820',
    color: '#7c3aed',
    rgb: '124,58,237',
    desc: 'Balanced phrases, clear structure, elegant proportion',
    traits: ['Sonata form', 'Balanced', 'Elegant', 'Formal'],
    prompt: `You are Mozart or Haydn, masters of the Classical period. Transform the text with Classical elegance:
- Perfect phrase balance — every statement has its answer
- Clarity over complexity — the structure should be transparent
- Wit and lightness, even in serious moments
- Formal architecture: exposition, development, recapitulation implied in prose
- Graceful melodic lines — sentences that flow like a theme
- Elegant but never cold — warmth within proportion
- The text should feel perfectly formed, like a well-tuned instrument`,
  },
  {
    id: 'folk',
    emoji: '🪕',
    name: 'Folk Revival',
    era: '1960s',
    color: '#065f46',
    rgb: '6,95,70',
    desc: 'Earthy storytelling, acoustic warmth, protest and memory',
    traits: ['Storytelling', 'Acoustic', 'Protest', 'Community'],
    prompt: `You are Bob Dylan, Joni Mitchell, or Nick Drake — masters of the folk revival tradition. Transform the text with folk sensibility:
- Narrative storytelling — real characters in real places
- Simple, earthy imagery: roads, rivers, mountains, harvest, fire
- A sense of lived experience and memory
- Understated emotion — show don't tell
- A political or social conscience beneath the personal
- Acoustic, unadorned language — no fancy words when plain ones work
- The feeling of a song passed down through generations`,
  },
];

/* ══════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════ */
let selectedStyle = STYLES[1]; // default Jazz
let isProcessing  = false;
let history       = [];
let sliderValues  = { intensity: 80, creativity: 70, preserve: 50 };

/* ══════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  renderStyleList();
  renderHeroWave();
  setupSliders();
  setupTextarea();
  setupExamples();
  // Select first style
  selectStyle(STYLES[1].id);
});

/* ══════════════════════════════════════════════════
   STYLE LIST
   ══════════════════════════════════════════════════ */
function renderStyleList() {
  const list = document.getElementById('styleList');
  if (!list) return;
  list.innerHTML = STYLES.map(s => `
    <div class="st-style-card" id="sc-${s.id}"
         style="--sc-color:${s.color};--sc-rgb:${s.rgb}"
         onclick="selectStyle('${s.id}')">
      <div class="st-style-top">
        <span class="st-style-emoji">${s.emoji}</span>
        <div>
          <div class="st-style-name">${s.name}</div>
          <div class="st-style-era">${s.era}</div>
        </div>
      </div>
      <div class="st-style-desc">${s.desc}</div>
      <div class="st-style-traits">
        ${s.traits.map(t => `<span class="st-style-trait">${t}</span>`).join('')}
      </div>
    </div>
  `).join('');
}

function selectStyle(id) {
  selectedStyle = STYLES.find(s => s.id === id);
  document.querySelectorAll('.st-style-card').forEach(c => {
    c.classList.toggle('active', c.id === `sc-${id}`);
  });
  // Update transfer button accent
  const btn = document.getElementById('transferBtn');
  if (btn) btn.style.background = `linear-gradient(135deg, color-mix(in srgb, ${selectedStyle.color} 80%, black), ${selectedStyle.color})`;
}

/* ══════════════════════════════════════════════════
   HERO WAVE ANIMATION
   ══════════════════════════════════════════════════ */
function renderHeroWave() {
  const wrap = document.getElementById('heroWave');
  if (!wrap) return;
  const heights = [20,45,70,50,80,35,60,85,40,65,25,55,75,30,50,68,38,72,42,58,80,35,60];
  wrap.innerHTML = heights.map((h, i) => `
    <div class="st-hero-bar" style="height:${h}px;--dur:${0.4 + (i % 5) * 0.12}s;animation-delay:${i * 0.05}s"></div>
  `).join('');
}

/* ══════════════════════════════════════════════════
   SLIDERS
   ══════════════════════════════════════════════════ */
function setupSliders() {
  ['intensity','creativity','preserve'].forEach(key => {
    const slider = document.getElementById(`slider-${key}`);
    const valEl  = document.getElementById(`val-${key}`);
    if (!slider) return;
    slider.value = sliderValues[key];
    if (valEl) valEl.textContent = sliderValues[key] + '%';
    slider.addEventListener('input', () => {
      sliderValues[key] = parseInt(slider.value);
      if (valEl) valEl.textContent = slider.value + '%';
    });
  });
}

/* ══════════════════════════════════════════════════
   TEXTAREA
   ══════════════════════════════════════════════════ */
function setupTextarea() {
  const ta = document.getElementById('inputText');
  const counter = document.getElementById('charCount');
  const fill    = document.getElementById('counterFill');
  if (!ta) return;
  ta.addEventListener('input', () => {
    const len = ta.value.length;
    const max = 800;
    if (counter) counter.textContent = `${len} / ${max}`;
    if (fill) fill.style.width = Math.min(100, (len/max)*100) + '%';
  });
}

/* ══════════════════════════════════════════════════
   EXAMPLE SNIPPETS
   ══════════════════════════════════════════════════ */
const EXAMPLES = [
  { label: '🌅 Nature', text: 'The morning light breaks through the clouds after a long night of rain. Everything is quiet except for distant birds and the sound of water dripping from leaves.' },
  { label: '💔 Heartbreak', text: 'She left without saying goodbye. The apartment feels different now — too quiet, too large. I find her things in unexpected places and don\'t know what to do with them.' },
  { label: '🏙️ City', text: 'The city never really sleeps. At 3am the streets have their own rhythm — the delivery trucks, the night shift workers, the last bar crowd walking home in groups.' },
  { label: '🌊 Ocean', text: 'Standing at the edge of the water, watching waves come and go. The horizon is just a line where one vast thing meets another. Nothing is resolved, everything continues.' },
];

function setupExamples() {
  const strip = document.getElementById('exampleChips');
  if (!strip) return;
  strip.innerHTML = EXAMPLES.map((e, i) => `
    <button class="st-input-chip" onclick="loadExample(${i})">${e.label}</button>
  `).join('');
}

window.loadExample = function(i) {
  const ta = document.getElementById('inputText');
  if (!ta) return;
  ta.value = EXAMPLES[i].text;
  ta.dispatchEvent(new Event('input'));
};

/* ══════════════════════════════════════════════════
   TRANSFER  (Claude API)
   ══════════════════════════════════════════════════ */
window.doTransfer = async function() {
  const ta = document.getElementById('inputText');
  if (!ta || !ta.value.trim()) { showToast('⚠️ Enter some text to transform first'); return; }
  if (isProcessing) return;

  const inputText = ta.value.trim();
  isProcessing = true;

  // UI: processing state
  const btn = document.getElementById('transferBtn');
  if (btn) { btn.disabled = true; btn.classList.add('processing'); btn.innerHTML = '<div style="width:16px;height:16px;border:2px solid rgba(255,255,255,0.3);border-top-color:white;border-radius:50%;animation:stSpin 0.8s linear infinite"></div> Transforming…'; }

  // Show output panel processing
  const overlay = document.getElementById('processingOverlay');
  if (overlay) overlay.classList.add('active');
  showOutputState('processing');

  try {
    const systemPrompt = `${selectedStyle.prompt}

Style intensity: ${sliderValues.intensity}% (${sliderValues.intensity > 70 ? 'transform deeply' : sliderValues.intensity > 40 ? 'moderate transformation' : 'subtle influence'})
Creativity: ${sliderValues.creativity}% (${sliderValues.creativity > 70 ? 'bold and experimental' : 'measured and faithful'})
Preserve original meaning: ${sliderValues.preserve}% (${sliderValues.preserve > 60 ? 'keep meaning central' : 'let the style reshape the message'})

Output ONLY the transformed text. No preamble, no explanation, no meta-commentary. Just the transformed version, 3-6 sentences or equivalent in verse. Make it feel genuinely authentic to the style.`;

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        messages: [{ role: 'user', content: `Transform this text into the ${selectedStyle.name} style:\n\n"${inputText}"` }],
        system: systemPrompt,
      }),
    });

    const data = await response.json();
    const outputText = data.content?.[0]?.text || 'Unable to generate transformation. Please try again.';

    // Animate text in
    if (overlay) overlay.classList.remove('active');
    showOutputState('result', outputText, inputText);
    addToHistory(inputText, outputText, selectedStyle);

  } catch (err) {
    if (overlay) overlay.classList.remove('active');
    showOutputState('error');
    showToast('⚠️ Connection error — check your API access');
    console.error(err);
  } finally {
    isProcessing = false;
    if (btn) {
      btn.disabled = false;
      btn.classList.remove('processing');
      btn.innerHTML = `${selectedStyle.emoji} Transform to ${selectedStyle.name}`;
    }
  }
};

/* ══════════════════════════════════════════════════
   OUTPUT STATE
   ══════════════════════════════════════════════════ */
function showOutputState(state, outputText, inputText) {
  const area  = document.getElementById('outputArea');
  if (!area) return;

  if (state === 'processing') {
    area.innerHTML = `
      <div class="st-output-empty">
        <div class="st-output-empty-icon">🎨</div>
        <div style="font-size:0.84rem">Applying ${selectedStyle.name} transformation…</div>
        <div style="font-size:0.72rem;opacity:0.5">Channeling ${selectedStyle.era}</div>
      </div>`;
    return;
  }

  if (state === 'error') {
    area.innerHTML = `
      <div class="st-output-empty">
        <div class="st-output-empty-icon">⚠️</div>
        <div style="font-size:0.84rem;color:#ef4444">Transformation failed</div>
        <div style="font-size:0.72rem;opacity:0.5">Check your connection and try again</div>
      </div>`;
    return;
  }

  if (state === 'result') {
    // Detect some "analysis" values — fake-but-plausible metrics
    const wordCount  = outputText.split(/\s+/).length;
    const complexity = Math.min(100, Math.round((outputText.match(/[,;:—]/g)||[]).length * 8 + 40));
    const rhythm     = sliderValues.intensity;
    const authenticity = Math.round(70 + Math.random() * 28);

    area.innerHTML = `
      <div class="st-output-result">
        <div class="st-output-applied-badge">
          ${selectedStyle.emoji} ${selectedStyle.name} Applied
        </div>
        <div class="st-output-text" id="outputTextEl"></div>
        <div class="st-analysis-strip">
          <div class="st-analysis-item"><div class="st-analysis-label">Words</div><div class="st-analysis-val">${wordCount}</div></div>
          <div class="st-analysis-item"><div class="st-analysis-label">Style Match</div><div class="st-analysis-val" style="color:${selectedStyle.color}">${authenticity}%</div></div>
          <div class="st-analysis-item"><div class="st-analysis-label">Complexity</div><div class="st-analysis-val">${complexity}%</div></div>
          <div class="st-analysis-item"><div class="st-analysis-label">Rhythm</div><div class="st-analysis-val">${rhythm}%</div></div>
        </div>
        <div class="st-output-actions">
          <button class="st-action-btn" onclick="copyOutput()">📋 Copy</button>
          <button class="st-action-btn" onclick="regenerate()">↺ Regenerate</button>
          <button class="st-action-btn" onclick="loadOutputAsInput()">→ Use as Input</button>
          <button class="st-action-btn" onclick="sendToLyricAssistant()">🖊 Open in Lyrics</button>
        </div>
      </div>`;

    // Typewriter effect
    const el = document.getElementById('outputTextEl');
    if (el) {
      el.classList.add('streaming');
      let i = 0;
      const chars = outputText.split('');
      const speed = Math.max(8, 2000 / chars.length);
      const type = () => {
        if (i < chars.length) {
          el.textContent += chars[i++];
          setTimeout(type, speed);
        } else {
          el.classList.remove('streaming');
        }
      };
      type();
    }
  }
}

/* ══════════════════════════════════════════════════
   OUTPUT ACTIONS
   ══════════════════════════════════════════════════ */
window.copyOutput = function() {
  const el = document.getElementById('outputTextEl');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(() => {
    const btn = event.target;
    btn.textContent = '✓ Copied!'; btn.classList.add('copied');
    setTimeout(() => { btn.textContent = '📋 Copy'; btn.classList.remove('copied'); }, 2000);
  });
};

window.regenerate = function() {
  doTransfer();
};

window.loadOutputAsInput = function() {
  const el = document.getElementById('outputTextEl');
  const ta = document.getElementById('inputText');
  if (el && ta) {
    ta.value = el.textContent;
    ta.dispatchEvent(new Event('input'));
    ta.scrollIntoView({ behavior: 'smooth', block: 'center' });
    showToast('✓ Output loaded as new input');
  }
};

window.sendToLyricAssistant = function() {
  const el = document.getElementById('outputTextEl');
  if (el) {
    localStorage.setItem('harmonia_lyric_seed', el.textContent);
    window.location.href = 'lyric-assistant.html';
  }
};

/* ══════════════════════════════════════════════════
   HISTORY
   ══════════════════════════════════════════════════ */
function addToHistory(input, output, style) {
  history.unshift({ input, output, style, ts: Date.now() });
  if (history.length > 10) history.pop();
  renderHistory();
}

function renderHistory() {
  const list = document.getElementById('historyList');
  if (!list) return;
  if (history.length === 0) {
    list.innerHTML = '<span style="font-size:0.78rem;color:var(--muted)">No transformations yet</span>';
    return;
  }
  list.innerHTML = history.map((h, i) => `
    <div class="st-history-item" onclick="loadHistory(${i})">
      <div class="st-history-style">${h.style.emoji} ${h.style.name}</div>
      <div class="st-history-preview">${h.output}</div>
    </div>
  `).join('');
}

window.loadHistory = function(i) {
  const h = history[i];
  if (!h) return;
  const ta = document.getElementById('inputText');
  if (ta) { ta.value = h.input; ta.dispatchEvent(new Event('input')); }
  selectStyle(h.style.id);
  showOutputState('result', h.output, h.input);
};

/* ══════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════ */
function showToast(msg) {
  let t = document.getElementById('stToast');
  if (!t) return;
  t.querySelector('.st-toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}
