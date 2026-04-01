/**
 * lyric-assistant.js
 * Full AI-powered songwriting workspace
 */

/* ══════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════ */
let sections = [
  { id: 'v1', type: 'verse',   num: 1, label: 'Verse 1',   content: '', placeholder: 'Write your first verse here…\nTell your story. Set the scene. Introduce the world of the song.' },
  { id: 'ch1', type: 'chorus', num: 1, label: 'Chorus',    content: '', placeholder: 'Your chorus — the emotional peak.\nThe hook that sticks. The line they remember.' },
  { id: 'v2', type: 'verse',   num: 2, label: 'Verse 2',   content: '', placeholder: 'Deepen the story. New details, same world.\nPush the narrative forward…' },
  { id: 'br1', type: 'bridge', num: 1, label: 'Bridge',    content: '', placeholder: 'The bridge — a shift in perspective.\nContrast. Revelation. The emotional turn.' },
];
let activeSection = 'v1';
let activeTab     = 'suggest';
let selectedThemes    = new Set(['longing','night']);
let selectedRewriteMode = 'elevate';

const SECTION_COLORS = { verse: '#7c3aed', chorus: '#ec4899', bridge: '#0ea5e9', outro: '#10b981', intro: '#d97706', prechorus: '#f97316' };
const THEME_OPTIONS  = ['longing','night','freedom','heartbreak','hope','city','nature','nostalgia','rebellion','love','loss','journey'];
const REWRITE_MODES  = [
  { id: 'elevate',  icon: '✨', name: 'Elevate', desc: 'Upgrade word choice and imagery' },
  { id: 'simplify', icon: '◽', name: 'Simplify', desc: 'Strip to essential truth' },
  { id: 'rhyme',    icon: '🔤', name: 'Add Rhyme', desc: 'Introduce rhyme scheme' },
  { id: 'rhythm',   icon: '🥁', name: 'Fix Rhythm', desc: 'Balance syllable stress' },
  { id: 'darker',   icon: '🌑', name: 'Darker', desc: 'Shift the emotional tone' },
  { id: 'hopeful',  icon: '🌅', name: 'Hopeful', desc: 'Lift to something brighter' },
];

// RHYME database (expanded)
const RHYME_DB = {
  night: { perfect: ['light','might','right','sight','white','bright','fight','flight','height','write','tight','quite','slight','blight','cite','delight','ignite','invite','knight','kite'], near: ['wine','mine','time','vine','fine','line','pine','shine','kind','mind','blind','find','behind','remind','wind'], family: ['moonlight','midnight','starlight','daylight','twilight','firelight','candlelight'] },
  love: { perfect: ['above','dove','shove','glove','of'], near: ['move','groove','prove','you\'ve','enough','tough','rough','stuff','bluff','hug','drug','bug','mug','rug','snug'], family: ['loved','loving','loveless','beloved','lovely','heartfelt','devoted'] },
  heart: { perfect: ['art','part','start','apart','smart','dark','spark','park','mark','lark','bark','card','guard','hard','yard','starred'], near: ['hurt','burn','turn','learn','return','yearn','concern','earn','churn','fern','discern'], family: ['heartache','heartbreak','heartfelt','sweetheart','heartbeat','wholehearted'] },
  rain: { perfect: ['pain','gain','plain','train','brain','main','vain','chain','remain','again','contain','insane','refrain','explain','complain','obtain','sustain','abstain','domain'], near: ['name','same','fame','game','blame','flame','frame','shame','claim','aim','came','came','flame'], family: ['rainfall','raindrops','rainstorm','rainbow','reign','rein'] },
  fire: { perfect: ['desire','higher','liar','wire','choir','tire','hire','admire','expire','inspire','require','entire','retire','sire','spire','transpire'], near: ['feel','real','steal','deal','heal','reveal','appeal','conceal','ideal','kneel','peel','seal','teal','zeal'], family: ['firelight','wildfire','campfire','gunfire','hellfire','crossfire'] },
  time: { perfect: ['rhyme','climb','lime','mime','prime','chime','crime','dime','grime','slime','sublime','paradigm','paradigm'], near: ['mind','find','kind','blind','wind','behind','remind','defined','confined','aligned','designed'], family: ['lifetime','sometime','overtime','bedtime','daytime','nighttime','pastime'] },
};

/* ══════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  // Check for seed from style transfer
  const seed = localStorage.getItem('harmonia_lyric_seed');
  if (seed) {
    sections[0].content = seed;
    localStorage.removeItem('harmonia_lyric_seed');
  }

  renderSections();
  renderSectionTabs();
  setupThemeChips();
  setupRewriteModes();
  setActiveTab('suggest');
  updateStatusBar();

  // Analyze on activity
  document.addEventListener('input', debounce(updateStatusBar, 600));
});

/* ══════════════════════════════════════════════════
   SECTION TABS
   ══════════════════════════════════════════════════ */
function renderSectionTabs() {
  const tabsEl = document.getElementById('sectionTabs');
  if (!tabsEl) return;
  tabsEl.innerHTML = sections.map(s => `
    <button class="la-section-tab${s.id === activeSection ? ' active' : ''}"
            onclick="setActiveSection('${s.id}')">
      <span>${s.label}</span>
      <span class="la-tab-type" style="background:rgba(${hexToRgbShort(SECTION_COLORS[s.type])},0.15);color:${SECTION_COLORS[s.type]}">${s.type}</span>
    </button>
  `).join('') + `
    <button class="la-add-section-btn" onclick="showAddSection()">+ Add Section</button>
  `;
}

function setActiveSection(id) {
  // Save current content first
  const currentTA = document.querySelector(`#section-${activeSection} .la-lyric-area`);
  if (currentTA) {
    const sec = sections.find(s => s.id === activeSection);
    if (sec) sec.content = currentTA.value;
  }
  activeSection = id;
  renderSectionTabs();
  renderSections();
}

window.showAddSection = function() {
  const types = ['verse','chorus','bridge','outro','intro','prechorus'];
  const counts = {};
  sections.forEach(s => { counts[s.type] = (counts[s.type]||0)+1; });

  const menu = document.getElementById('addSectionMenu');
  if (menu && menu.style.display !== 'none') { menu.style.display = 'none'; return; }

  // Create inline picker
  const tabsEl = document.getElementById('sectionTabs');
  let existing = document.getElementById('addSectionMenu');
  if (existing) existing.remove();

  const picker = document.createElement('div');
  picker.id = 'addSectionMenu';
  picker.style.cssText = 'position:fixed;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:12px;z-index:200;box-shadow:0 20px 50px rgba(0,0,0,0.5);display:flex;flex-direction:column;gap:4px;min-width:160px;';

  types.forEach(type => {
    const btn = document.createElement('button');
    btn.style.cssText = `background:none;border:none;color:var(--text);font-family:inherit;font-size:0.82rem;padding:8px 12px;border-radius:8px;cursor:pointer;text-align:left;display:flex;align-items:center;gap:8px;`;
    const num = (counts[type]||0)+1;
    const label = type === 'verse' || type === 'chorus' || type === 'bridge' ? `${type.charAt(0).toUpperCase()+type.slice(1)} ${num}` : type.charAt(0).toUpperCase()+type.slice(1);
    btn.innerHTML = `<span style="width:10px;height:10px;border-radius:3px;background:${SECTION_COLORS[type]};display:inline-block;flex-shrink:0"></span>${label}`;
    btn.onmouseenter = () => btn.style.background = 'rgba(255,255,255,0.06)';
    btn.onmouseleave = () => btn.style.background = 'none';
    btn.onclick = () => { addSection(type); picker.remove(); };
    picker.appendChild(btn);
  });

  // Position near button
  const addBtn = tabsEl.querySelector('.la-add-section-btn');
  const rect = addBtn.getBoundingClientRect();
  picker.style.top = (rect.bottom + 6) + 'px';
  picker.style.left = rect.left + 'px';
  document.body.appendChild(picker);
  setTimeout(() => document.addEventListener('click', () => picker.remove(), { once: true }), 0);
};

function addSection(type) {
  const count = sections.filter(s => s.type === type).length + 1;
  const id = `${type.slice(0,2)}${count}_${Date.now()}`;
  const label = `${type.charAt(0).toUpperCase()+type.slice(1)} ${count}`;
  const placeholders = {
    verse: 'New verse — continue the story…',
    chorus: 'Chorus — the hook that rings…',
    bridge: 'The bridge — a shift, a revelation…',
    outro: 'Fade out — resolution or mystery…',
    intro: 'Set the scene before the first word…',
    prechorus: 'Build the tension before the chorus…',
  };
  sections.push({ id, type, num: count, label, content: '', placeholder: placeholders[type] || 'Write here…' });
  setActiveSection(id);
}

/* ══════════════════════════════════════════════════
   SECTION RENDER
   ══════════════════════════════════════════════════ */
function renderSections() {
  const area = document.getElementById('editorArea');
  if (!area) return;
  area.innerHTML = sections.map(s => `
    <div class="la-section-block" id="section-${s.id}" style="${s.id !== activeSection ? 'display:none' : ''}">
      <div class="la-section-header">
        <div class="la-section-type-badge" style="background:rgba(${hexToRgbShort(SECTION_COLORS[s.type])},0.1);border-color:rgba(${hexToRgbShort(SECTION_COLORS[s.type])},0.2);color:${SECTION_COLORS[s.type]}">${s.type.toUpperCase()}</div>
        <div class="la-section-num">${s.label}</div>
        <div class="la-section-actions">
          <button class="la-section-action" onclick="duplicateSection('${s.id}')" title="Duplicate">⧉</button>
          ${sections.length > 1 ? `<button class="la-section-action" onclick="deleteSection('${s.id}')" title="Delete" style="color:#ef4444">✕</button>` : ''}
        </div>
      </div>
      <textarea class="la-lyric-area" id="ta-${s.id}"
        placeholder="${s.placeholder}"
        oninput="onSectionInput('${s.id}', this.value)"
        onfocus="onSectionFocus('${s.id}')">${s.content}</textarea>
      <div class="la-line-tools">
        <button class="la-line-tool" onclick="getQuickRhymes('${s.id}')">🔤 Rhyme last word</button>
        <button class="la-line-tool" onclick="analyzeSection('${s.id}')">📊 Analyze</button>
        <button class="la-line-tool" onclick="suggestNextLine('${s.id}')">✨ Continue line</button>
      </div>
      <div class="la-rhyme-chips" id="rhymes-${s.id}"></div>
    </div>
  `).join('');

  // Auto-resize textareas
  document.querySelectorAll('.la-lyric-area').forEach(ta => autoResize(ta));
}

function onSectionInput(id, val) {
  const sec = sections.find(s => s.id === id);
  if (sec) sec.content = val;
  autoResize(document.getElementById(`ta-${id}`));
  updateStatusBar();
}

function onSectionFocus() {
  updateAnalysisTab();
}

function autoResize(ta) {
  if (!ta) return;
  ta.style.height = 'auto';
  ta.style.height = Math.max(100, ta.scrollHeight) + 'px';
}

window.duplicateSection = function(id) {
  const sec = sections.find(s => s.id === id);
  if (!sec) return;
  const content = document.getElementById(`ta-${id}`)?.value || sec.content;
  const newId = `${sec.type.slice(0,2)}_dup_${Date.now()}`;
  const insertIdx = sections.findIndex(s => s.id === id) + 1;
  sections.splice(insertIdx, 0, { ...sec, id: newId, content });
  setActiveSection(newId);
};

window.deleteSection = function(id) {
  const idx = sections.findIndex(s => s.id === id);
  sections.splice(idx, 1);
  setActiveSection(sections[Math.max(0, idx-1)].id);
};

/* ══════════════════════════════════════════════════
   STATUS BAR
   ══════════════════════════════════════════════════ */
function updateStatusBar() {
  const allText = sections.map(s => {
    const ta = document.getElementById(`ta-${s.id}`);
    return ta ? ta.value : s.content;
  }).join(' ');

  const words = allText.trim() ? allText.trim().split(/\s+/).length : 0;
  const lines  = allText.split('\n').filter(l => l.trim()).length;
  const chars  = allText.length;

  const el = document.getElementById('statusWords');
  if (el) el.textContent = words;
  const el2 = document.getElementById('statusLines');
  if (el2) el2.textContent = lines;
  const el3 = document.getElementById('statusSections');
  if (el3) el3.textContent = sections.length;
  const el4 = document.getElementById('statusChars');
  if (el4) el4.textContent = chars;
}

/* ══════════════════════════════════════════════════
   AI TABS
   ══════════════════════════════════════════════════ */
window.setActiveTab = function(tab) {
  activeTab = tab;
  document.querySelectorAll('.la-ai-tab').forEach(t => t.classList.toggle('active', t.dataset.tab === tab));
  document.querySelectorAll('.la-tab-panel').forEach(p => p.classList.toggle('active', p.id === `panel-${tab}`));
  if (tab === 'analyze') updateAnalysisTab();
};

/* ══════════════════════════════════════════════════
   THEME CHIPS
   ══════════════════════════════════════════════════ */
function setupThemeChips() {
  const wrap = document.getElementById('themeChips');
  if (!wrap) return;
  wrap.innerHTML = THEME_OPTIONS.map(t => `
    <button class="la-theme-chip${selectedThemes.has(t) ? ' active' : ''}"
            onclick="toggleTheme('${t}')">${t}</button>
  `).join('');
}

window.toggleTheme = function(t) {
  if (selectedThemes.has(t)) selectedThemes.delete(t); else selectedThemes.add(t);
  setupThemeChips();
};

/* ══════════════════════════════════════════════════
   REWRITE MODES
   ══════════════════════════════════════════════════ */
function setupRewriteModes() {
  const grid = document.getElementById('rewriteModes');
  if (!grid) return;
  grid.innerHTML = REWRITE_MODES.map(m => `
    <button class="la-rewrite-mode${m.id === selectedRewriteMode ? ' active' : ''}"
            onclick="selectRewriteMode('${m.id}')">
      <div class="la-rewrite-mode-icon">${m.icon}</div>
      <div class="la-rewrite-mode-name">${m.name}</div>
      <div class="la-rewrite-mode-desc">${m.desc}</div>
    </button>
  `).join('');
}

window.selectRewriteMode = function(id) {
  selectedRewriteMode = id;
  setupRewriteModes();
};

/* ══════════════════════════════════════════════════
   SUGGEST (Claude API)
   ══════════════════════════════════════════════════ */
window.getSuggestions = async function() {
  const btn  = document.getElementById('suggestBtn');
  const list = document.getElementById('suggestionsList');
  const ctx  = document.getElementById('suggestContext');
  if (!list || !btn) return;

  const currentSec = sections.find(s => s.id === activeSection);
  const currentText = document.getElementById(`ta-${activeSection}`)?.value || '';
  const contextText = ctx?.value || '';
  const themes = [...selectedThemes].join(', ');

  btn.disabled = true;
  btn.innerHTML = '<div class="la-spinner"></div> Writing…';
  list.innerHTML = '<div style="color:var(--muted);font-size:0.82rem;padding:8px">Generating ideas…</div>';

  try {
    const allLyrics = sections.map(s => {
      const ta = document.getElementById(`ta-${s.id}`);
      const content = ta ? ta.value : s.content;
      return content ? `[${s.label}]\n${content}` : null;
    }).filter(Boolean).join('\n\n');

    const system = `You are a skilled, empathetic lyricist and songwriting collaborator. Your job is to suggest 3 distinct lyric alternatives or next lines for a ${currentSec?.type || 'verse'} section.

Rules:
- Each suggestion should be 1-4 lines max
- They should feel authentic, not generic — avoid clichés
- Themes to weave in: ${themes || 'any relevant themes'}
- The suggestions should vary: try different approaches (emotional, concrete imagery, abstract, narrative, etc.)
- ${contextText ? `Additional context from the writer: "${contextText}"` : ''}
- IMPORTANT: Respond ONLY with valid JSON array, no markdown, no explanation:
[{"text":"lyric lines here","note":"brief stylistic note"},{"text":"...","note":"..."},{"text":"...","note":"..."}]`;

    const userMsg = `Current song sections:\n${allLyrics || '(blank canvas)'}\n\nSection to continue: [${currentSec?.label || 'Verse'}]\n${currentText || '(empty — suggest opening lines)'}`;

    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: userMsg }],
      }),
    });

    const data = await resp.json();
    let raw = data.content?.[0]?.text || '[]';
    // Strip any accidental markdown fences
    raw = raw.replace(/```json|```/g, '').trim();
    const suggestions = JSON.parse(raw);

    list.innerHTML = suggestions.map((s, i) => `
      <div class="la-suggestion-item" onclick="insertSuggestion('${escapeSugg(s.text)}')">
        <div class="la-suggestion-text">${s.text.replace(/\n/g,'<br>')}</div>
        <div class="la-suggestion-meta">
          <span class="la-suggestion-tag">${s.note || ''}</span>
          <button class="la-suggestion-insert" onclick="event.stopPropagation();insertSuggestion('${escapeSugg(s.text)}')">Insert →</button>
        </div>
      </div>
    `).join('');

  } catch(e) {
    list.innerHTML = '<div style="color:#ef4444;font-size:0.8rem;padding:8px">⚠️ Could not generate suggestions</div>';
    console.error(e);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '✨ Generate Suggestions';
  }
};

function escapeSugg(text) {
  return text.replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/"/g, '\\"');
}

window.insertSuggestion = function(text) {
  const ta = document.getElementById(`ta-${activeSection}`);
  if (!ta) return;
  const decoded = text.replace(/\\n/g, '\n').replace(/\\'/g, "'");
  const cur = ta.value;
  ta.value = cur ? cur + '\n' + decoded : decoded;
  ta.dispatchEvent(new Event('input'));
  onSectionInput(activeSection, ta.value);
  showToastLA('✓ Lines inserted');
};

/* ══════════════════════════════════════════════════
   QUICK LINE TOOLS
   ══════════════════════════════════════════════════ */
window.getQuickRhymes = function(sectionId) {
  const ta = document.getElementById(`ta-${sectionId}`);
  if (!ta) return;
  const lines = ta.value.split('\n').filter(l => l.trim());
  if (!lines.length) return;
  const lastLine = lines[lines.length - 1];
  const words = lastLine.trim().split(/\s+/);
  const lastWord = words[words.length - 1].toLowerCase().replace(/[^a-z]/g,'');

  const rhymes = RHYME_DB[lastWord];
  const chipEl = document.getElementById(`rhymes-${sectionId}`);
  if (!chipEl) return;

  if (rhymes) {
    const all = [...(rhymes.perfect||[]).slice(0,6), ...(rhymes.near||[]).slice(0,4)];
    chipEl.innerHTML = `<span style="font-size:0.68rem;color:var(--muted);align-self:center">"${lastWord}" rhymes with:</span>` +
      all.map(w => `<span class="la-rhyme-chip" onclick="insertRhymeWord('${sectionId}','${w}')">${w}</span>`).join('');
  } else {
    chipEl.innerHTML = `<span style="font-size:0.72rem;color:var(--muted)">No rhymes found for "${lastWord}" — try the Rhyme tab</span>`;
  }
};

window.insertRhymeWord = function(sectionId, word) {
  const ta = document.getElementById(`ta-${sectionId}`);
  if (!ta) return;
  const pos = ta.selectionStart;
  const val = ta.value;
  ta.value = val.slice(0,pos) + word + val.slice(pos);
  ta.selectionStart = ta.selectionEnd = pos + word.length;
  ta.focus();
  onSectionInput(sectionId, ta.value);
};

window.suggestNextLine = async function(sectionId) {
  const ta = document.getElementById(`ta-${sectionId}`);
  if (!ta || !ta.value.trim()) { showToastLA('⚠️ Write something first'); return; }

  const chipEl = document.getElementById(`rhymes-${sectionId}`);
  if (chipEl) chipEl.innerHTML = '<span style="font-size:0.72rem;color:var(--muted)">✨ Getting ideas…</span>';

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 200,
        system: 'You are a lyricist. Given some existing lyrics, suggest exactly 2 possible next lines that flow naturally. Return ONLY valid JSON: [{"line":"..."},{"line":"..."}]. No markdown, no explanation.',
        messages: [{ role: 'user', content: `Continue these lyrics with a natural next line:\n\n${ta.value}` }],
      }),
    });
    const data = await resp.json();
    let raw = (data.content?.[0]?.text || '[]').replace(/```json|```/g,'').trim();
    const lines = JSON.parse(raw);
    if (chipEl) chipEl.innerHTML = `<span style="font-size:0.68rem;color:var(--muted);align-self:center">Next line ideas:</span>` +
      lines.map(l => `<span class="la-rhyme-chip" onclick="insertSuggestion('${escapeSugg(l.line)}')" style="background:rgba(167,139,250,0.08);border-color:rgba(167,139,250,0.2);color:var(--accent1)">${l.line}</span>`).join('');
  } catch(e) {
    if (chipEl) chipEl.innerHTML = '<span style="font-size:0.72rem;color:#ef4444">⚠️ Error</span>';
  }
};

/* ══════════════════════════════════════════════════
   RHYME FINDER TAB
   ══════════════════════════════════════════════════ */
window.findRhymes = async function() {
  const input = document.getElementById('rhymeInput');
  const results = document.getElementById('rhymeResults');
  if (!input || !results) return;
  const word = input.value.trim().toLowerCase().replace(/[^a-z]/g,'');
  if (!word) return;

  results.innerHTML = '<div style="color:var(--muted);font-size:0.8rem">Finding rhymes…</div>';

  // Check local DB first
  const local = RHYME_DB[word];
  if (local) {
    renderRhymeResults(word, local, results);
    return;
  }

  // Fall back to Claude for unknown words
  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 400,
        system: 'You are a rhyme dictionary. Return ONLY valid JSON, no markdown: {"perfect":["word1","word2"...],"near":["word1","word2"...],"family":["compound1","compound2"...]}. Each array should have 6-10 words. Perfect = identical ending sound. Near = slant rhymes. Family = compound words containing the original.',
        messages: [{ role: 'user', content: `Find rhymes for: "${word}"` }],
      }),
    });
    const data = await resp.json();
    let raw = (data.content?.[0]?.text||'{}').replace(/```json|```/g,'').trim();
    const rhymes = JSON.parse(raw);
    renderRhymeResults(word, rhymes, results);
  } catch(e) {
    results.innerHTML = '<div style="color:#ef4444;font-size:0.8rem">⚠️ Could not find rhymes</div>';
  }
};

function renderRhymeResults(word, rhymes, container) {
  container.innerHTML = `
    ${rhymes.perfect?.length ? `
      <div>
        <div class="la-rhyme-section-title">Perfect Rhymes</div>
        <div class="la-rhyme-words">${rhymes.perfect.map(w => `<div class="la-rhyme-word perfect" onclick="useRhymeWord('${w}')">${w}</div>`).join('')}</div>
      </div>` : ''}
    ${rhymes.near?.length ? `
      <div>
        <div class="la-rhyme-section-title">Near Rhymes (slant)</div>
        <div class="la-rhyme-words">${rhymes.near.map(w => `<div class="la-rhyme-word" onclick="useRhymeWord('${w}')">${w}</div>`).join('')}</div>
      </div>` : ''}
    ${rhymes.family?.length ? `
      <div>
        <div class="la-rhyme-section-title">Word Family</div>
        <div class="la-rhyme-words">${rhymes.family.map(w => `<div class="la-rhyme-word" onclick="useRhymeWord('${w}')" style="font-size:0.74rem">${w}</div>`).join('')}</div>
      </div>` : ''}
  `;
}

window.useRhymeWord = function(word) {
  const ta = document.getElementById(`ta-${activeSection}`);
  if (!ta) return;
  const pos = ta.selectionStart;
  const val = ta.value;
  ta.value = val.slice(0,pos) + word + val.slice(pos);
  ta.selectionStart = ta.selectionEnd = pos + word.length;
  ta.focus();
  onSectionInput(activeSection, ta.value);
  showToastLA(`✓ "${word}" inserted`);
};

/* ══════════════════════════════════════════════════
   ANALYZE TAB
   ══════════════════════════════════════════════════ */
function updateAnalysisTab() {
  const ta = document.getElementById(`ta-${activeSection}`);
  const text = ta ? ta.value : '';
  const lines = text.split('\n').filter(l => l.trim());

  // Meter visualization (simple syllable count)
  const meterEl = document.getElementById('meterGrid');
  if (meterEl && lines.length) {
    meterEl.innerHTML = lines.slice(0,4).map(line => {
      const words = line.trim().split(/\s+/);
      const syls = countSyllables(line);
      const dots = Array.from({length: Math.min(syls,16)}, (_,i) => `<div class="la-syl-dot${i%2===0?' stressed':''}"></div>`).join('');
      return `<div class="la-meter-row"><div class="la-meter-label" title="${line.slice(0,20)}">${syls} syl</div><div class="la-syllable-dots">${dots}</div></div>`;
    }).join('');
  }

  // Rhyme scheme
  const schemeEl = document.getElementById('rhymeScheme');
  if (schemeEl && lines.length) {
    const scheme = detectRhymeScheme(lines);
    const colors = ['#7c3aed','#ec4899','#0ea5e9','#10b981','#d97706','#dc2626'];
    const letterMap = {};
    let idx = 0;
    schemeEl.innerHTML = scheme.map(letter => {
      if (!letterMap[letter]) { letterMap[letter] = {color: colors[idx%colors.length], idx: idx}; idx++; }
      const {color} = letterMap[letter];
      return `<div class="la-scheme-letter" style="background:rgba(${hexToRgbShort(color)},0.15);color:${color};border-color:rgba(${hexToRgbShort(color)},0.25)">${letter}</div>`;
    }).join('');
  }

  // Mood analysis (basic sentiment via word matching)
  const moodEl = document.getElementById('moodBars');
  if (moodEl) {
    const moods = analyzeMood(text);
    const moodColors = { dark: '#6d28d9', uplifting: '#10b981', romantic: '#ec4899', melancholy: '#0ea5e9', energetic: '#ea580c' };
    moodEl.innerHTML = Object.entries(moods).map(([mood, pct]) => `
      <div class="la-mood-row">
        <div class="la-mood-label">${mood}</div>
        <div class="la-mood-track"><div class="la-mood-fill" style="width:${pct}%;background:${moodColors[mood]||'#a78bfa'}"></div></div>
        <div class="la-mood-val">${pct}%</div>
      </div>
    `).join('');
  }
}

function countSyllables(word) {
  const w = word.toLowerCase().replace(/[^a-z]/g,'');
  if (!w.length) return 0;
  let count = (w.match(/[aeiouy]+/g)||[]).length;
  if (w.match(/e$/)) count--;
  return Math.max(1, count);
}

function detectRhymeScheme(lines) {
  const endings = lines.map(l => {
    const words = l.trim().split(/\s+/);
    return words[words.length-1].toLowerCase().replace(/[^a-z]/g,'').slice(-3);
  });
  const schemeMap = {};
  let nextLetter = 'A'.charCodeAt(0);
  return endings.map(end => {
    if (!end) return 'X';
    // Check for rhyme match
    for (const [pattern, letter] of Object.entries(schemeMap)) {
      if (pattern.slice(-2) === end.slice(-2)) return letter;
    }
    const letter = String.fromCharCode(nextLetter++);
    schemeMap[end] = letter;
    return letter;
  });
}

function analyzeMood(text) {
  const t = text.toLowerCase();
  const dark     = (t.match(/dark|night|shadow|alone|cold|empty|lost|dead|pain|cry|tear|bleed/g)||[]).length;
  const uplift   = (t.match(/light|sun|hope|rise|free|dream|bright|love|joy|dance|smile|fly/g)||[]).length;
  const romantic = (t.match(/love|heart|kiss|hold|touch|warm|close|tender|beautiful|you|arms/g)||[]).length;
  const melancholy = (t.match(/gone|miss|remember|past|fade|away|leave|lost|never|rain|grey/g)||[]).length;
  const energetic  = (t.match(/run|fire|burn|fight|move|shake|power|strong|now|alive|rage/g)||[]).length;

  const total = Math.max(dark+uplift+romantic+melancholy+energetic, 1);
  const norm = v => Math.round(Math.min(100,(v/total)*100 * 2.5 + (v>0?20:5)));
  return { dark: norm(dark), uplifting: norm(uplift), romantic: norm(romantic), melancholy: norm(melancholy), energetic: norm(energetic) };
}

window.analyzeSection = function(id) {
  setActiveTab('analyze');
  setTimeout(updateAnalysisTab, 50);
};

/* ══════════════════════════════════════════════════
   REWRITE (Claude API)
   ══════════════════════════════════════════════════ */
window.doRewrite = async function() {
  const ta = document.getElementById(`ta-${activeSection}`);
  if (!ta || !ta.value.trim()) { showToastLA('⚠️ Write some lyrics first'); return; }

  const btn = document.getElementById('rewriteBtn');
  const result = document.getElementById('rewriteResult');
  const mode = REWRITE_MODES.find(m => m.id === selectedRewriteMode);
  if (!btn || !result) return;

  btn.disabled = true;
  btn.innerHTML = '<div class="la-spinner"></div> Rewriting…';

  const modePrompts = {
    elevate:  'Improve the word choice, imagery, and metaphors. Make every word earn its place. Elevate the poetic quality without losing the meaning.',
    simplify: 'Strip these lyrics down to their essential truth. Remove excess words. What\'s the bare, honest core?',
    rhyme:    'Introduce a clear rhyme scheme (ABAB or AABB or ABCB) while preserving the meaning. Keep it natural, not forced.',
    rhythm:   'Fix the rhythmic flow. Each line should have a natural stress pattern suitable for singing. Aim for consistent syllable counts.',
    darker:   'Shift the emotional tone darker — more shadow, more weight, more complexity. Same story, more difficult truth.',
    hopeful:  'Find the hope or light in these words. Shift the emotional register toward something more open, more healing, more forward-looking.',
  };

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 600,
        system: `You are a collaborative lyricist and editor. Rewrite the given lyrics with this approach: ${modePrompts[selectedRewriteMode]}\n\nReturn ONLY the rewritten lyrics — no preamble, no explanation, no quotation marks around the whole thing. Just the lines.`,
        messages: [{ role: 'user', content: `Rewrite these lyrics:\n\n${ta.value}` }],
      }),
    });
    const data = await resp.json();
    const rewritten = data.content?.[0]?.text || '';

    result.className = 'la-rewrite-result visible la-streaming';
    result.textContent = '';
    const chars = rewritten.split('');
    let i = 0;
    const speed = Math.max(8, 1500 / chars.length);
    const type = () => {
      if (i < chars.length) { result.textContent += chars[i++]; setTimeout(type, speed); }
      else result.classList.remove('la-streaming');
    };
    type();

    // Show action buttons
    document.getElementById('rewriteActions').innerHTML = `
      <button class="la-rewrite-act-btn" onclick="acceptRewrite()">✓ Use this version</button>
      <button class="la-rewrite-act-btn" onclick="doRewrite()">↺ Try again</button>
    `;
    window._rewrittenText = rewritten;

  } catch(e) {
    result.className = 'la-rewrite-result visible';
    result.style.color = '#ef4444';
    result.textContent = '⚠️ Rewrite failed — check connection';
  } finally {
    btn.disabled = false;
    btn.innerHTML = `${mode.icon} ${mode.name}`;
  }
};

window.acceptRewrite = function() {
  const ta = document.getElementById(`ta-${activeSection}`);
  if (ta && window._rewrittenText) {
    ta.value = window._rewrittenText;
    onSectionInput(activeSection, ta.value);
    showToastLA('✓ Rewrite applied');
    const result = document.getElementById('rewriteResult');
    if (result) result.className = 'la-rewrite-result';
    document.getElementById('rewriteActions').innerHTML = '';
  }
};

/* ══════════════════════════════════════════════════
   EXPORT
   ══════════════════════════════════════════════════ */
window.exportLyrics = function() {
  const title = document.getElementById('songTitle')?.value || 'Untitled Song';
  let output = `${title}\n${'─'.repeat(title.length)}\n\n`;
  sections.forEach(s => {
    const ta = document.getElementById(`ta-${s.id}`);
    const content = ta ? ta.value : s.content;
    if (content.trim()) output += `[${s.label}]\n${content}\n\n`;
  });
  const blob = new Blob([output], {type:'text/plain'});
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${title.replace(/\s+/g,'-').toLowerCase()}.txt`;
  a.click();
  showToastLA('✓ Lyrics exported');
};

window.copyAllLyrics = function() {
  const title = document.getElementById('songTitle')?.value || 'Untitled Song';
  let output = `${title}\n\n`;
  sections.forEach(s => {
    const ta = document.getElementById(`ta-${s.id}`);
    const content = ta ? ta.value : s.content;
    if (content.trim()) output += `[${s.label}]\n${content}\n\n`;
  });
  navigator.clipboard.writeText(output.trim()).then(() => showToastLA('✓ All lyrics copied'));
};

/* ══════════════════════════════════════════════════
   TOAST
   ══════════════════════════════════════════════════ */
function showToastLA(msg) {
  let t = document.getElementById('laToast');
  if (!t) return;
  t.querySelector('.la-toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2400);
}

/* ══════════════════════════════════════════════════
   UTILITY
   ══════════════════════════════════════════════════ */
function hexToRgbShort(hex) {
  if (!hex) return '167,139,250';
  const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}

function debounce(fn, delay) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), delay); };
}
