/**
 * ai-composer.js — Harmonia AI Composer
 * Real Web Audio synthesis + xAI Grok API
 */

/* ══════════════════════════════════════════════
   API KEY
══════════════════════════════════════════════ */
const API_KEY_STORAGE = 'harmonia_xai_key';

function getApiKey()  { return localStorage.getItem(API_KEY_STORAGE) || ''; }

function saveApiKey() {
  const input = document.getElementById('apiKeyInput');
  const key   = (input?.value || '').trim();
  if (!key) { showToast('Please enter your API key', 'error'); return; }
  if (!key.startsWith('xai-')) { showToast('Key should start with xai-', 'error'); return; }
  localStorage.setItem(API_KEY_STORAGE, key);
  closeEnvPanel();
  updateApiStatus();
  showToast('🔑 API key saved — ready to compose with Grok!', 'success');
}

function removeApiKey() {
  localStorage.removeItem(API_KEY_STORAGE);
  updateApiStatus();
  const inp = document.getElementById('apiKeyInput');
  if (inp) inp.value = '';
  showToast('Key removed — running demo mode', 'info');
}

function openEnvPanel() {
  const panel = document.getElementById('envPanel');
  if (!panel) return;
  panel.classList.add('open');
  document.getElementById('envOverlay')?.classList.add('open');
  const inp = document.getElementById('apiKeyInput');
  if (inp) { inp.value = getApiKey(); setTimeout(() => inp.focus(), 150); }
}

function closeEnvPanel() {
  document.getElementById('envPanel')?.classList.remove('open');
  document.getElementById('envOverlay')?.classList.remove('open');
}

function toggleKeyVisibility() {
  const inp = document.getElementById('apiKeyInput');
  const btn = document.getElementById('keyEyeBtn');
  if (!inp) return;
  const show = inp.type === 'password';
  inp.type = show ? 'text' : 'password';
  btn.innerHTML = show
    ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>`
    : `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" width="16" height="16"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`;
}

function updateApiStatus() {
  const key    = getApiKey();
  const dot    = document.getElementById('statusDot');
  const label  = document.getElementById('statusLabel');
  const badge  = document.getElementById('navKeyBadge');
  if (dot) {
    dot.className = 'env-dot ' + (key ? 'env-dot-on' : 'env-dot-off');
  }
  if (label) {
    if (key) {
      label.textContent = 'Grok AI connected — ' + key.slice(0,7) + '••••' + key.slice(-4);
      label.style.color = '#34d399';
    } else {
      label.textContent = 'No API key — demo mode active';
      label.style.color = '';
    }
  }
  if (badge) {
    badge.textContent  = key ? '● Grok' : '○ Demo';
    badge.style.color  = key ? '#34d399' : '#fbbf24';
  }
}

/* ══════════════════════════════════════════════
   STATE
══════════════════════════════════════════════ */
const CS = {
  genre: 'any', mood: 'any',
  history: JSON.parse(localStorage.getItem('harmonia_comp_hist') || '[]'),
  stats:   JSON.parse(localStorage.getItem('harmonia_comp_stats') || '{"composed":0,"genres":[],"xp":0,"saved":0}'),
  current: null,
  generating: false,
  audio: null,   // AudioContext
  synth: null,   // active synth nodes
  playing: false,
  playTimer: null,
  playSec: 0,
  playTotal: 120,
};

/* ══════════════════════════════════════════════
   WEB AUDIO ENGINE
══════════════════════════════════════════════ */
function getAudioCtx() {
  if (!CS.audio || CS.audio.state === 'closed') {
    CS.audio = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (CS.audio.state === 'suspended') CS.audio.resume();
  return CS.audio;
}

// Map note names like "C4", "D#5" to frequencies
const NOTE_FREQ = (() => {
  const notes = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const map = {};
  for (let oct = 0; oct <= 8; oct++) {
    notes.forEach((n, i) => {
      const midi = (oct + 1) * 12 + i;
      map[n + oct] = 440 * Math.pow(2, (midi - 69) / 12);
    });
  }
  return map;
})();

// Build a scale of frequencies from key string e.g. "A minor", "C major"
function buildScale(keyStr) {
  const minorSteps  = [0,2,3,5,7,8,10];
  const majorSteps  = [0,2,4,5,7,9,11];
  const noteNames   = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const isMinor     = /minor/i.test(keyStr);
  const rootName    = keyStr.replace(/\s*(major|minor)/i,'').trim().replace('b','#');
  const rootIdx     = noteNames.indexOf(rootName) >= 0 ? noteNames.indexOf(rootName)
                    : noteNames.findIndex(n => n.toLowerCase().startsWith(rootName.toLowerCase()));
  const root        = Math.max(0, rootIdx);
  const steps       = isMinor ? minorSteps : majorSteps;
  const freqs       = [];
  for (let oct = 3; oct <= 5; oct++) {
    steps.forEach(s => {
      const midiNote = (oct + 1) * 12 + ((root + s) % 12);
      const freq     = 440 * Math.pow(2, (midiNote - 69) / 12);
      freqs.push(freq);
    });
  }
  return freqs;
}

// Determine what kind of sound to make from genre/instruments
function getSynthType(settings) {
  const genre = settings.genre;
  const instr = settings.instruments || [];
  if (genre === 'electronic' || genre === 'lo-fi' || instr.includes('synth')) return 'synth';
  if (genre === 'classical' || instr.includes('strings')) return 'strings';
  if (genre === 'jazz' || instr.includes('saxophone')) return 'jazz';
  if (genre === 'ambient') return 'ambient';
  if (instr.includes('guitar') || instr.includes('bass')) return 'guitar';
  return 'piano';
}

// Generate a melody sequence from chord data + scale
function buildSequence(comp, settings) {
  const scale    = buildScale(settings.key === 'any' ? 'C major' : settings.key);
  const tempo    = parseInt(settings.tempo) || 120;
  const beatLen  = 60 / tempo;   // seconds per beat
  const notes    = [];

  // Extract chord names to drive the melody
  const chords   = comp.chords?.progression || [];

  chords.forEach((chord, ci) => {
    const beats    = chord.beats || 4;
    const duration = beats * beatLen;
    // Pick notes from scale that "fit" this chord beat
    const root     = scale[ci % scale.length];
    const third    = scale[(ci + 2) % scale.length];
    const fifth    = scale[(ci + 4) % scale.length];
    const passing  = scale[(ci + 1) % scale.length];

    // Arpeggiate: root → third → fifth → passing on sub-beats
    const subBeats = Math.min(beats, 4);
    const subLen   = duration / subBeats;
    const pattern  = [root, third, fifth, passing];
    for (let i = 0; i < subBeats; i++) {
      notes.push({ freq: pattern[i % pattern.length], duration: subLen * 0.8, gap: subLen });
    }
  });

  // Pad to at least 8 seconds if very short
  if (notes.length < 4) {
    scale.slice(0, 8).forEach((freq, i) => {
      notes.push({ freq, duration: beatLen * 0.8, gap: beatLen });
    });
  }

  return notes;
}

function buildDrumPattern(tempo) {
  const beatLen = 60 / tempo;
  // kick on 1,3 — snare on 2,4 — hihat on every beat
  return [
    { type:'kick',   time: 0 },
    { type:'hihat',  time: beatLen * 0.5 },
    { type:'snare',  time: beatLen },
    { type:'hihat',  time: beatLen * 1.5 },
    { type:'kick',   time: beatLen * 2 },
    { type:'hihat',  time: beatLen * 2.5 },
    { type:'snare',  time: beatLen * 3 },
    { type:'hihat',  time: beatLen * 3.5 },
  ];
}

function playDrumHit(ctx, masterGain, type, time) {
  const gainNode = ctx.createGain();
  gainNode.connect(masterGain);

  if (type === 'kick') {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.08);
    gainNode.gain.setValueAtTime(1.0, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.3);
    osc.connect(gainNode);
    osc.start(time); osc.stop(time + 0.35);
  } else if (type === 'snare') {
    // noise burst
    const bufSize = ctx.sampleRate * 0.15;
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type  = 'highpass'; filt.frequency.value = 1000;
    gainNode.gain.setValueAtTime(0.5, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.18);
    src.connect(filt); filt.connect(gainNode);
    src.start(time); src.stop(time + 0.2);
  } else if (type === 'hihat') {
    const bufSize = ctx.sampleRate * 0.05;
    const buf     = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data    = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
    const src  = ctx.createBufferSource();
    src.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type  = 'highpass'; filt.frequency.value = 8000;
    gainNode.gain.setValueAtTime(0.2, time);
    gainNode.gain.exponentialRampToValueAtTime(0.001, time + 0.05);
    src.connect(filt); filt.connect(gainNode);
    src.start(time); src.stop(time + 0.06);
  }
}

function playSynthNote(ctx, masterGain, freq, startTime, duration, synthType, volume) {
  const gainNode = ctx.createGain();
  gainNode.connect(masterGain);

  let osc, osc2, filter;

  if (synthType === 'strings') {
    // String-like: sawtooth + heavy lowpass + slow attack
    osc  = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq;
    osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = freq * 1.005;
    filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = freq * 4; filter.Q.value = 1;
    const g2 = ctx.createGain(); g2.gain.value = 0.4;
    osc2.connect(g2); g2.connect(filter);
    osc.connect(filter); filter.connect(gainNode);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.6, startTime + Math.min(0.3, duration * 0.4));
    gainNode.gain.setValueAtTime(volume * 0.6, startTime + duration * 0.7);
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime); osc2.start(startTime);
    osc.stop(startTime + duration + 0.05); osc2.stop(startTime + duration + 0.05);

  } else if (synthType === 'jazz') {
    // Mellow jazz: triangle + slight detune
    osc  = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
    filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = freq * 6; filter.Q.value = 0.5;
    osc.connect(filter); filter.connect(gainNode);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.5, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime); osc.stop(startTime + duration + 0.05);

  } else if (synthType === 'synth') {
    // Punchy synth: square + portamento
    osc  = ctx.createOscillator(); osc.type = 'square'; osc.frequency.value = freq;
    osc2 = ctx.createOscillator(); osc2.type = 'sawtooth'; osc2.frequency.value = freq * 0.5;
    filter = ctx.createBiquadFilter(); filter.type = 'lowpass'; filter.frequency.value = 800;
    filter.frequency.linearRampToValueAtTime(freq * 8, startTime + 0.05);
    filter.Q.value = 6;
    const g2 = ctx.createGain(); g2.gain.value = 0.3;
    osc2.connect(g2); g2.connect(filter);
    osc.connect(filter); filter.connect(gainNode);
    gainNode.gain.setValueAtTime(volume, startTime);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, startTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime); osc2.start(startTime);
    osc.stop(startTime + duration + 0.05); osc2.stop(startTime + duration + 0.05);

  } else if (synthType === 'ambient') {
    // Pad: sine + chorus
    osc  = ctx.createOscillator(); osc.type = 'sine'; osc.frequency.value = freq;
    osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 1.003;
    const g2 = ctx.createGain(); g2.gain.value = 0.5;
    osc2.connect(g2); g2.connect(gainNode);
    osc.connect(gainNode);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume * 0.5, startTime + Math.min(0.8, duration * 0.5));
    gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
    osc.start(startTime); osc2.start(startTime);
    osc.stop(startTime + duration + 0.1); osc2.stop(startTime + duration + 0.1);

  } else if (synthType === 'guitar') {
    // Plucked: karplus-strong approximation via filtered noise + osc
    osc  = ctx.createOscillator(); osc.type = 'sawtooth'; osc.frequency.value = freq;
    filter = ctx.createBiquadFilter(); filter.type = 'bandpass'; filter.frequency.value = freq; filter.Q.value = 20;
    osc.connect(filter); filter.connect(gainNode);
    gainNode.gain.setValueAtTime(volume * 1.2, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + Math.min(duration, 0.8));
    osc.start(startTime); osc.stop(startTime + Math.min(duration, 0.85));

  } else {
    // Piano: triangle + decay envelope
    osc  = ctx.createOscillator(); osc.type = 'triangle'; osc.frequency.value = freq;
    osc2 = ctx.createOscillator(); osc2.type = 'sine'; osc2.frequency.value = freq * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.15;
    osc2.connect(g2); g2.connect(gainNode);
    osc.connect(gainNode);
    gainNode.gain.setValueAtTime(0, startTime);
    gainNode.gain.linearRampToValueAtTime(volume, startTime + 0.008);
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.6, startTime + 0.1);
    gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime); osc2.start(startTime);
    osc.stop(startTime + duration + 0.05); osc2.stop(startTime + duration + 0.05);
  }
}

function startAudioPlayback() {
  if (!CS.current) return;
  stopAudioPlayback();

  const ctx       = getAudioCtx();
  const comp      = CS.current.composition;
  const settings  = CS.current.settings;
  const synthType = getSynthType(settings);
  const tempo     = parseInt(settings.tempo) || 120;
  const volume    = (document.getElementById('volSlider')?.value || 80) / 100 * 0.7;
  const hasRhythm = settings.instruments.includes('drums') || ['hip-hop','electronic','lo-fi','rock','pop'].includes(settings.genre);

  // Master gain + reverb-like convolver
  const masterGain = ctx.createGain();
  masterGain.gain.value = volume;

  // Simple reverb via delay feedback
  const convGain = ctx.createGain();
  convGain.gain.value = 0.18;
  const delay = ctx.createDelay(2);
  delay.delayTime.value = 0.25;
  const fbGain = ctx.createGain();
  fbGain.gain.value = 0.35;
  masterGain.connect(delay);
  delay.connect(fbGain);
  fbGain.connect(delay);
  delay.connect(convGain);
  convGain.connect(ctx.destination);
  masterGain.connect(ctx.destination);

  const sequence = buildSequence(comp, settings);
  const now      = ctx.currentTime + 0.05;
  let   cursor   = now;

  // Schedule all melody notes
  sequence.forEach(note => {
    playSynthNote(ctx, masterGain, note.freq, cursor, note.duration, synthType, 0.5);
    cursor += note.gap;
  });

  CS.playTotal = Math.round(cursor - now);

  // Schedule drum layer if appropriate
  if (hasRhythm) {
    const pattern  = buildDrumPattern(tempo);
    const barLen   = (60 / tempo) * 4;
    const bars     = Math.ceil(CS.playTotal / barLen);
    for (let bar = 0; bar < bars; bar++) {
      pattern.forEach(hit => {
        const t = now + bar * barLen + hit.time;
        if (t < now + CS.playTotal) {
          playDrumHit(ctx, masterGain, hit.type, t);
        }
      });
    }
  }

  // Bass line
  if (settings.instruments.includes('bass') || ['jazz','rock','electronic','hip-hop','lo-fi','r&b'].includes(settings.genre)) {
    const chords   = comp.chords?.progression || [];
    const beatLen  = 60 / tempo;
    let   bassTime = now;
    chords.forEach((chord, ci) => {
      const scale = buildScale(settings.key === 'any' ? 'C major' : settings.key);
      const freq  = scale[ci % scale.length] * 0.5; // octave down
      const dur   = (chord.beats || 4) * beatLen;
      playSynthNote(ctx, masterGain, freq, bassTime, dur * 0.9, 'guitar', 0.4);
      bassTime += dur;
    });
  }

  CS.synth   = { ctx, masterGain };
  CS.playing = true;
  CS.playSec = 0;

  document.getElementById('playIcon').style.display  = 'none';
  document.getElementById('pauseIcon').style.display = 'block';

  CS.playTimer = setInterval(() => {
    CS.playSec++;
    updatePlaybackUI();
    if (CS.playSec >= CS.playTotal) {
      stopAudioPlayback();
    }
  }, 1000);

  document.getElementById('playbackTitle').textContent = `Playing "${comp.title}"`;
}

function stopAudioPlayback() {
  clearInterval(CS.playTimer);
  CS.playTimer = null;

  if (CS.synth?.ctx) {
    try {
      CS.synth.masterGain?.disconnect();
      // Don't close context — just let scheduled nodes finish
    } catch(e) {}
    CS.synth = null;
  }

  CS.playing = false;
  CS.playSec = 0;

  document.getElementById('playIcon').style.display  = 'block';
  document.getElementById('pauseIcon').style.display = 'none';
  updatePlaybackUI();
}

function pauseAudioPlayback() {
  clearInterval(CS.playTimer);
  CS.playTimer = null;
  if (CS.audio) CS.audio.suspend();
  CS.playing = false;
  document.getElementById('playIcon').style.display  = 'block';
  document.getElementById('pauseIcon').style.display = 'none';
}

function resumeAudioPlayback() {
  if (CS.audio) CS.audio.resume();
  CS.playing = true;
  document.getElementById('playIcon').style.display  = 'none';
  document.getElementById('pauseIcon').style.display = 'block';
  CS.playTimer = setInterval(() => {
    CS.playSec++;
    updatePlaybackUI();
    if (CS.playSec >= CS.playTotal) stopAudioPlayback();
  }, 1000);
}

function togglePlayback() {
  if (!CS.current) { showToast('Generate a composition first!', 'error'); return; }
  if (CS.playing) {
    pauseAudioPlayback();
  } else if (CS.audio?.state === 'suspended') {
    resumeAudioPlayback();
  } else {
    startAudioPlayback();
  }
}

function updatePlaybackUI() {
  const pct = CS.playTotal > 0 ? (CS.playSec / CS.playTotal) * 100 : 0;
  document.getElementById('playbackProgress').style.width = Math.min(pct, 100) + '%';
  document.getElementById('playbackTime').textContent =
    formatTime(CS.playSec) + ' / ' + formatTime(CS.playTotal);
}

/* Volume slider live */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('volSlider')?.addEventListener('input', function() {
    if (CS.synth?.masterGain) {
      CS.synth.masterGain.gain.value = (this.value / 100) * 0.7;
    }
  });
  document.getElementById('apiKeyInput')?.addEventListener('keydown', e => {
    if (e.key === 'Enter') saveApiKey();
  });
  document.getElementById('envOverlay')?.addEventListener('click', closeEnvPanel);
});

/* ══════════════════════════════════════════════
   INIT
══════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initWaveCanvas();
  initGenreGrid();
  initMoodGrid();
  initPromptCounter();
  renderHistory();
  renderStats();
  initPlaybackScrub();
  updateApiStatus();
});

/* ══════════════════════════════════════════════
   WAVE CANVAS
══════════════════════════════════════════════ */
function initWaveCanvas() {
  const canvas = document.getElementById('waveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let w, h;
  function resize() { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; }
  resize(); window.addEventListener('resize', resize);
  let offset = 0;
  function draw() {
    ctx.clearRect(0,0,w,h);
    [['167,139,250',.6],['236,72,153',.45],['56,189,248',.3]].forEach(([c,a],i)=>{
      ctx.beginPath();
      const amp=12-i*3, freq=0.008+i*.003, spd=0.03-i*.008;
      ctx.strokeStyle=`rgba(${c},${a})`; ctx.lineWidth=2-i*.4;
      for(let x=0;x<w;x++){
        const y=h/2+Math.sin(x*freq+offset*spd+i*1.2)*amp+Math.sin(x*freq*.5+offset*spd*.7+i)*amp*.5;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
    });
    offset++;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ══════════════════════════════════════════════
   CONTROLS
══════════════════════════════════════════════ */
function initGenreGrid() {
  document.querySelectorAll('.ac-genre-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ac-genre-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      CS.genre = btn.dataset.genre;
    });
  });
}

function initMoodGrid() {
  document.querySelectorAll('.ac-mood-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ac-mood-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      CS.mood = btn.dataset.mood;
    });
  });
}

function initPromptCounter() {
  const ta = document.getElementById('promptTextarea');
  const cc = document.getElementById('charCount');
  if (!ta||!cc) return;
  ta.addEventListener('input', () => {
    cc.textContent = ta.value.length;
    cc.style.color = ta.value.length > 720 ? '#ef4444' : '';
  });
}

function initPlaybackScrub() {
  document.querySelector('.ac-playback-progress-wrap')?.addEventListener('click', e => {
    if (!CS.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    CS.playSec = Math.round(((e.clientX-rect.left)/rect.width)*CS.playTotal);
    updatePlaybackUI();
  });
}

function injectPrompt(text) {
  const ta = document.getElementById('promptTextarea');
  if (!ta) return;
  ta.value = text; ta.dispatchEvent(new Event('input')); ta.focus();
}

function clearPrompt() {
  const ta = document.getElementById('promptTextarea');
  if (ta) { ta.value=''; ta.dispatchEvent(new Event('input')); ta.focus(); }
}

const SHUFFLE_PROMPTS = [
  "A minimalist piano nocturne with deep resonant left-hand chords and a delicate right-hand melody, reminiscent of Satie",
  "A high-energy punk rock anthem with distorted guitars, pounding drums and shouted vocals about rebellion",
  "A dreamy shoegaze track with washed-out reverb guitars, hushed vocals and a hypnotic drum pattern",
  "A Brazilian bossa nova with fingerpicked guitar, soft brushed drums, and a breezy saxophone melody",
  "A tender lullaby in C major with music box melody and soft string pads",
  "A neo-soul groove in F# minor with Rhodes piano, slap bass and trap hi-hats",
  "A haunting Celtic ballad in D dorian with uilleann pipes, fiddle and bodhran",
  "A 1970s funk track with wah-wah guitar, tight horns and a James Brown style breakdown",
  "A minimalist techno track at 132 BPM with a driving kick, sweeping filter cutoffs and industrial textures",
  "A peaceful Japanese koto piece with pentatonic scales and temple bell accents",
  "A cinematic trailer cue building from solo cello to full orchestra over 90 seconds",
  "A dark tango in D minor with accordion, bandoneon and dramatic piano",
];
function shufflePrompt() { injectPrompt(SHUFFLE_PROMPTS[Math.floor(Math.random()*SHUFFLE_PROMPTS.length)]); }

/* ══════════════════════════════════════════════
   PRESETS
══════════════════════════════════════════════ */
const PRESETS = {
  beethoven:{ genre:'classical', mood:'epic',       key:'C minor',  time:'4/4', tempo:132, instruments:['piano','strings','brass'],        prompt:'A dramatic classical piano sonata in C minor in the style of Beethoven, with a powerful opening motif and a stormy finale' },
  miles:    { genre:'jazz',      mood:'mysterious',  key:'D minor',  time:'4/4', tempo:88,  instruments:['piano','bass','saxophone','drums'], prompt:'A cool modal jazz composition in D dorian inspired by Miles Davis Kind of Blue with long space-filled melodic lines' },
  lofi:     { genre:'lo-fi',     mood:'calm',        key:'G major',  time:'4/4', tempo:80,  instruments:['piano','bass','drums'],             prompt:'A chill lo-fi hip hop beat with dusty vinyl texture, gentle jazz piano chords and a warm bass line for studying' },
  hans:     { genre:'cinematic', mood:'epic',        key:'D minor',  time:'4/4', tempo:90,  instruments:['strings','brass','piano','drums'],  prompt:'A massive cinematic orchestral score starting with a single piano motif building to a full orchestral climax with pounding percussion' },
  debussy:  { genre:'classical', mood:'mysterious',  key:'Eb major', time:'4/4', tempo:72,  instruments:['piano','flute','strings'],           prompt:'An impressionist piano piece inspired by Debussy using whole tone scales, shimmering arpeggios and dreamlike harmonies' },
  edm:      { genre:'electronic',mood:'energetic',   key:'F minor',  time:'4/4', tempo:128, instruments:['synth','bass','drums'],             prompt:'A festival-ready progressive house EDM track at 128 BPM with massive synth chords and a euphoric melody drop' },
};

function loadPreset(id) {
  const p = PRESETS[id]; if (!p) return;
  document.querySelectorAll('.ac-genre-btn').forEach(b=>b.classList.toggle('active',b.dataset.genre===p.genre));
  CS.genre = p.genre;
  document.querySelectorAll('.ac-mood-btn').forEach(b=>b.classList.toggle('active',b.dataset.mood===p.mood));
  CS.mood = p.mood;
  const ks=document.getElementById('keySelect'); if(ks) ks.value=p.key;
  const ts=document.getElementById('timeSelect'); if(ts) ts.value=p.time;
  const te=document.getElementById('tempoSlider'); if(te) te.value=p.tempo;
  const tv=document.getElementById('tempoVal'); if(tv) tv.textContent=p.tempo;
  document.querySelectorAll('.ac-instr-check input').forEach(cb=>{cb.checked=p.instruments.includes(cb.value);});
  injectPrompt(p.prompt);
  showToast('✨ Preset loaded: '+id.charAt(0).toUpperCase()+id.slice(1),'info');
}

/* ══════════════════════════════════════════════
   SETTINGS COLLECTOR
══════════════════════════════════════════════ */
function getSettings() {
  return {
    genre:       CS.genre,
    mood:        CS.mood,
    key:         document.getElementById('keySelect')?.value   || 'any',
    time:        document.getElementById('timeSelect')?.value  || '4/4',
    tempo:       document.getElementById('tempoSlider')?.value || '120',
    instruments: [...document.querySelectorAll('.ac-instr-check input:checked')].map(cb=>cb.value),
    format:      document.querySelector('input[name="format"]:checked')?.value || 'full',
    prompt:      document.getElementById('promptTextarea')?.value?.trim() || '',
  };
}

/* ══════════════════════════════════════════════
   AI PROMPTS
══════════════════════════════════════════════ */
function buildSystemPrompt() {
  return `You are Harmonia's AI Composer — an expert in music theory, harmony, counterpoint, and all genres.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no code fences, no text before or after the JSON.

Use this exact structure:
{
  "title": "Creative evocative title",
  "subtitle": "Brief subtitle",
  "tags": ["genre","mood","key"],
  "composition": {
    "overview": "2-3 sentence description of the piece",
    "structure": [
      {"section":"Intro","bars":"1-8","description":"What happens musically"},
      {"section":"A Section","bars":"9-24","description":"Primary theme"},
      {"section":"B Section","bars":"25-40","description":"Contrast and development"},
      {"section":"Climax","bars":"41-56","description":"Peak moment"},
      {"section":"Outro","bars":"57-64","description":"Resolution and close"}
    ],
    "notation": "Bar 1: A4 C5 E5 A5 | G5 F5 E5 D5 |\\nBar 2: C5 B4 A4 G4 | F4 E4 D4 C4 |",
    "fullDescription": "Rich detailed paragraph about the full composition"
  },
  "chords": {
    "progression": [
      {"chord":"Am","type":"minor","roman":"i","beats":4,"description":"Tonic home chord"},
      {"chord":"Dm","type":"minor","roman":"iv","beats":4,"description":"Subdominant"},
      {"chord":"E7","type":"dominant 7th","roman":"V7","beats":4,"description":"Dominant tension"},
      {"chord":"Am","type":"minor","roman":"i","beats":4,"description":"Resolution"},
      {"chord":"F","type":"major","roman":"VI","beats":2,"description":"Borrowed colour"},
      {"chord":"G","type":"major","roman":"VII","beats":2,"description":"Subtonic"},
      {"chord":"E7","type":"dominant 7th","roman":"V7","beats":4,"description":"Cadential dominant"},
      {"chord":"Am","type":"minor","roman":"i","beats":4,"description":"Final resolution"}
    ],
    "analysis": "Paragraph analyzing harmonic structure and voice leading",
    "voicings": "Specific voicing suggestions for the instruments"
  },
  "theory": {
    "keyAndScale": "Key, scale, modal explanation",
    "harmony": "Harmonic language discussion",
    "rhythm": "Rhythmic analysis",
    "form": "Musical form analysis",
    "influences": "Style and influences",
    "learningPoints": ["Point 1","Point 2","Point 3","Point 4","Point 5"]
  },
  "performance": {
    "tempoAndFeel": "Tempo markings and feel description",
    "instrumentGuides": [
      {"instrument":"Piano","role":"harmonic and melodic role","technique":"specific techniques","tips":"practical performance advice"}
    ],
    "dynamicsAndExpression": "Dynamics map and expression markings",
    "practiceSteps": ["Step 1","Step 2","Step 3","Step 4"],
    "commonMistakes": ["Mistake 1 and fix","Mistake 2 and fix"]
  }
}`;
}

function buildUserPrompt(s) {
  return `Compose a complete musical piece:

DESCRIPTION: ${s.prompt || 'Create an original expressive composition from the settings'}
GENRE: ${s.genre==='any'?'Your choice':s.genre}
MOOD: ${s.mood==='any'?'Your choice':s.mood}
KEY: ${s.key==='any'?'Choose an appropriate key':s.key}
TIME SIGNATURE: ${s.time}
TEMPO: ${s.tempo} BPM
INSTRUMENTS: ${s.instruments.length?s.instruments.join(', '):'Choose appropriate instruments'}
FORMAT: ${s.format==='full'?'Full composition':s.format==='chord'?'Focus on chord progressions':s.format==='melody'?'Focus on melody':'Lead sheet'}

Be musically specific, use real theory terminology, make it genuinely inspiring.`;
}

/* ══════════════════════════════════════════════
   LOADING ANIMATION
══════════════════════════════════════════════ */
let _loadTimer = null;
function startLoadingAnim() {
  ['lstep1','lstep2','lstep3','lstep4'].forEach(id=>document.getElementById(id)?.classList.remove('active','done'));
  document.getElementById('lstep1')?.classList.add('active');
  let cur=0;
  const H=['Composing your masterpiece…','Crafting harmonic structure…','Writing melodic lines…','Finalizing the score…'];
  const S=['Analyzing musical intent and style','Building chord progressions and voice leading','Developing motifs and phrases','Adding dynamics and performance notes'];
  _loadTimer=setInterval(()=>{
    if(cur<3){
      document.getElementById(`lstep${cur+1}`)?.classList.replace('active','done');
      cur++;
      document.getElementById(`lstep${cur+1}`)?.classList.add('active');
      const h=document.getElementById('loadingHeadline'); if(h) h.textContent=H[cur];
      const s=document.getElementById('loadingSubtext');  if(s) s.textContent=S[cur];
    }
  },1800);
}
function stopLoadingAnim() {
  clearInterval(_loadTimer); _loadTimer=null;
  ['lstep1','lstep2','lstep3','lstep4'].forEach(id=>{
    document.getElementById(id)?.classList.remove('active');
    document.getElementById(id)?.classList.add('done');
  });
}
function showEmpty()   { setStates('remove','add','add'); }
function showLoading() { setStates('add','remove','add'); }
function showResult()  { setStates('add','add','remove'); }
function setStates(e,l,r) {
  document.getElementById('emptyState')  ?.classList[e]('hidden');
  document.getElementById('loadingState')?.classList[l]('hidden');
  document.getElementById('resultState') ?.classList[r]('hidden');
}

/* ══════════════════════════════════════════════
   GENERATE
══════════════════════════════════════════════ */
async function generateComposition() {
  if (CS.generating) return;
  stopAudioPlayback();

  const settings = getSettings();
  if (!settings.prompt && settings.genre==='any' && settings.mood==='any') {
    showToast('Please describe your music or pick a genre/mood!','error');
    document.getElementById('promptTextarea')?.focus();
    return;
  }

  CS.generating = true;
  const btn  = document.getElementById('generateBtn');
  const icon = document.getElementById('generateIcon');
  const text = document.getElementById('generateText');
  if(btn) btn.disabled=true;
  if(icon) icon.classList.add('spinning');
  if(text) text.textContent='Composing…';

  showLoading(); startLoadingAnim();

  const apiKey = getApiKey();
  let composition = null;
  let usedAI = false;

  if (apiKey) {
    try {
      const resp = await fetch('https://api.x.ai/v1/chat/completions', {
        method:'POST',
        headers:{ 'Content-Type':'application/json', 'Authorization':`Bearer ${apiKey}` },
        body: JSON.stringify({
          model:'grok-3',
          max_tokens:4000,
          messages:[
            { role:'system', content:buildSystemPrompt() },
            { role:'user',   content:buildUserPrompt(settings) },
          ],
        }),
      });

      if (resp.status===401||resp.status===403) {
        localStorage.removeItem(API_KEY_STORAGE);
        updateApiStatus();
        showToast('❌ API key rejected — removed. Enter a new key in Settings.','error');
      } else if (resp.ok) {
        const data = await resp.json();
        const raw  = data.choices?.[0]?.message?.content || '';
        const s    = raw.indexOf('{'), e = raw.lastIndexOf('}');
        if (s>=0&&e>s) {
          composition = JSON.parse(raw.slice(s,e+1));
          usedAI = true;
        }
      } else {
        console.warn('xAI error:', resp.status, await resp.text());
      }
    } catch(err) {
      console.warn('xAI fetch failed:', err.message);
    }
  }

  // Fallback if AI failed or no key
  if (!composition) {
    composition = buildFallback(settings);
  }

  stopLoadingAnim();
  CS.current = { composition, settings, timestamp:Date.now(), usedAI };
  renderResult(composition, settings, usedAI);
  showResult();
  updateStatsAndHistory(composition, settings, usedAI);

  if (typeof HarmoniaDB !== 'undefined') HarmoniaDB.addXP(75,`AI Composition: ${composition.title}`);
  showToast(usedAI ? `🎵 "${composition.title}" — Grok AI +75 XP` : `🎭 "${composition.title}" — demo mode +75 XP`, usedAI?'success':'info');

  CS.generating=false;
  if(btn) btn.disabled=false;
  if(icon) icon.classList.remove('spinning');
  if(text) text.textContent='Generate Composition';
}

/* ══════════════════════════════════════════════
   FALLBACK COMPOSITION
══════════════════════════════════════════════ */
function buildFallback(settings) {
  const genre  = settings.genre==='any'?'Classical':cap(settings.genre);
  const mood   = settings.mood==='any'?'Expressive':cap(settings.mood);
  const key    = settings.key==='any'?'A minor':settings.key;
  const tempo  = settings.tempo||120;
  const instrs = settings.instruments.length?settings.instruments:['piano'];
  const minor  = key.toLowerCase().includes('minor');

  return {
    title:`${mood} ${genre} Study in ${key}`,
    subtitle:`An original composition at ${tempo} BPM`,
    tags:[genre.toLowerCase(),mood.toLowerCase(),key],
    composition:{
      overview:`A ${mood.toLowerCase()} ${genre.toLowerCase()} composition in ${key} at ${tempo} BPM, featuring ${instrs.join(', ')}. The piece explores rich harmonic textures and expressive melodic lines across five sections.`,
      structure:[
        {section:'Introduction',   bars:'1–8',   description:'Establishes the tonal centre; sparse texture invites the listener in'},
        {section:'A Section',      bars:'9–24',  description:'Primary melodic material over the main harmonic progression'},
        {section:'B Section',      bars:'25–40', description:'Contrasting theme with increased energy and harmonic movement'},
        {section:'Development',    bars:'41–56', description:'Thematic material explored through different registers and keys'},
        {section:'Recapitulation', bars:'57–72', description:'Return of the opening theme, harmonically enriched'},
        {section:'Coda',           bars:'73–80', description:'Final resolution to the tonic with a satisfying cadence'},
      ],
      notation:`Main Theme (${key}):\nBar 1: ${minor?'A4 C5 E5 A5':'C4 E4 G4 C5'} | ${minor?'G5 F5 E5 D5':'B4 A4 G4 F4'} |\nBar 2: ${minor?'C5 B4 A4 G4':'E4 D4 C4 B3'} | ${minor?'F4 E4 D4 C4':'A3 G3 F3 E3'} |\nBar 3: ${minor?'E4 A4 C5 E5':'G3 C4 E4 G4'} | ${minor?'F5 E5 D5 C5':'F4 E4 D4 C4'} |\nBar 4: ${minor?'B4 A4 G#4 A4':'D4 C4 B3 C4'} | (sustain) ... |`,
      fullDescription:`This ${mood.toLowerCase()} work in ${key} unfolds over 80 bars. The ${instrs.join(' and ')} interweave throughout, creating a rich sonic tapestry drawing from the ${genre.toLowerCase()} tradition.`,
    },
    chords:{
      progression:[
        {chord:minor?'Am':'C',  type:minor?'minor':'major',       roman:'i',           beats:4,description:'Tonic — home chord'},
        {chord:minor?'Dm':'Am', type:'minor',                     roman:minor?'iv':'vi',beats:4,description:'Subdominant area'},
        {chord:minor?'E7':'F',  type:minor?'dominant 7th':'major',roman:minor?'V7':'IV',beats:4,description:'Creates tension'},
        {chord:minor?'Am':'G7', type:minor?'minor':'dominant 7th',roman:minor?'i':'V7', beats:4,description:'Resolution'},
        {chord:minor?'F':'Em',  type:minor?'major':'minor',       roman:minor?'VI':'iii',beats:2,description:'Colour chord'},
        {chord:minor?'G':'Dm',  type:'major',                     roman:minor?'VII':'ii',beats:2,description:'Pre-dominant'},
        {chord:minor?'E7':'G',  type:minor?'dominant 7th':'major',roman:minor?'V7':'V', beats:4,description:'Strong dominant'},
        {chord:minor?'Am':'C',  type:minor?'minor':'major',       roman:'i',           beats:4,description:'Final resolution'},
      ],
      analysis:`The progression uses functional harmony centred on the ${key} tonal area. The ${minor?'borrowed VI (major submediant) adds Dorian colour':'secondary dominant adds chromatic warmth'}. Voice leading is smooth throughout.`,
      voicings:`${instrs.includes('piano')?'Piano: root-fifth bass pattern in the left hand; close-position chord voicings in the right. ':''} ${instrs.includes('guitar')?'Guitar: open or barre chord shapes with sus2 embellishments. ':''}Allow chord tones to ring for a legato harmonic texture.`,
    },
    theory:{
      keyAndScale:`Written in ${key} using the ${minor?'natural minor (Aeolian) scale, borrowing the raised 7th for the dominant chord to create harmonic minor colour at cadences':'major scale with occasional modal mixture from the parallel minor'}.`,
      harmony:`${minor?'Rich with minor-mode colour; the VI-VII-i progression creates a distinctive Aeolian cadence.':'Warm functional harmony using all three primary triads with diatonic seventh chords for sophistication.'}`,
      rhythm:`At ${tempo} BPM in ${settings.time}, the feel is ${tempo<80?'expansive and unhurried':tempo<120?'flowing and conversational':tempo<160?'energetic and driven':'exhilarating and propulsive'}.`,
      form:`Modified ternary form (A–B–A') with introduction and coda. The A section establishes the primary theme, B provides contrast, and A returns enriched.`,
      influences:`Rooted in the ${genre} tradition with harmonic sensibility from late Romantic practice.`,
      learningPoints:[
        `${minor?'Natural vs harmonic minor — the raised 7th creates a leading tone for stronger cadences':'Major scale with modal mixture — borrowing from the parallel minor deepens emotional expression'}`,
        'Voice leading: each chord tone moves to the nearest note in the following chord',
        'The dominant chord (V/V7) is the engine of tonal music — tension and release',
        `${tempo<100?'Slow tempos require sustained tone production and careful dynamic shaping':'Fast tempos demand precise articulation and rhythmic accuracy'}`,
        'Melodic contour shapes emotional expression — ascending lines create tension, descending lines resolve it',
      ],
    },
    performance:{
      tempoAndFeel:`♩ = ${tempo} BPM. ${tempo<80?'Largo — very slow and expressive':tempo<100?'Andante — flowing, with tasteful rubato':tempo<120?'Moderato — balanced and natural':tempo<160?'Allegro — energetic and precise':'Presto — exhilarating, prioritise clarity'}. Feel: ${mood.toLowerCase()}.`,
      instrumentGuides:instrs.slice(0,4).map(instr=>({
        instrument:cap(instr),
        role:instr==='piano'?'Carries melody and harmony simultaneously':instr==='guitar'?'Chordal support with melodic fills':instr==='bass'?'Anchors harmonic rhythm':instr==='drums'?'Drives energy and groove':instr==='strings'?'Provides lush harmonic pad':'Contributes texture and atmosphere',
        technique:instr==='piano'?'Change sustain pedal on each harmony; project the melody above accompaniment':instr==='guitar'?'Mix strumming and fingerpicking; use vibrato on sustained notes':instr==='bass'?'Smooth legato; connect roots with scalar passing tones':instr==='drums'?'Ghost notes for texture; support all dynamic shaping':'Focus on tone quality and blend',
        tips:`Start at ${Math.round(tempo*.6)} BPM and build up gradually. Record yourself and listen back critically.`,
      })),
      dynamicsAndExpression:`Begin mp, build to mf in the B section, climax at f, return to mp then close ppp. Use dolce for lyrical passages, espressivo for the development.`,
      practiceSteps:[
        `Learn each part separately at ${Math.round(tempo*.6)} BPM — accuracy first`,
        `Combine at ${Math.round(tempo*.75)} BPM — focus on balance and alignment`,
        `Add dynamics at ${Math.round(tempo*.9)} BPM — shape each phrase intentionally`,
        `Full tempo ${tempo} BPM — record complete takes and evaluate`,
      ],
      commonMistakes:[
        `Rushing — use a metronome from ${Math.round(tempo*.6)} BPM`,
        'Ignoring dynamic contrast — the range from pp to ff is where music lives',
        `${instrs.includes('piano')?'Over-pedalling muddies the harmony — change pedal on every chord change':'Playing too rigidly — music needs expressive flexibility'}`,
        'Not listening to the ensemble — react to what others play',
      ],
    },
  };
}

/* ══════════════════════════════════════════════
   RENDER
══════════════════════════════════════════════ */
function renderResult(comp, settings, usedAI) {
  document.getElementById('resultTitle').textContent = comp.title || 'Untitled Composition';

  const metaEl = document.getElementById('resultMeta');
  if (metaEl) {
    metaEl.innerHTML =
      (comp.tags||[]).map(t=>`<span class="ac-meta-tag">${t}</span>`).join('')+
      `<span class="ac-meta-tag">🎵 ${settings.tempo} BPM</span>`+
      `<span class="ac-meta-tag">⏱ ${settings.time}</span>`+
      (usedAI
        ? `<span class="ac-meta-tag" style="color:#34d399;border-color:rgba(52,211,153,.3)">✦ Grok AI</span>`
        : `<span class="ac-meta-tag" style="color:#fbbf24;border-color:rgba(251,191,36,.3)">🎭 Demo</span>`);
  }

  document.getElementById('playbackTitle').textContent = `"${comp.title}" — ${comp.subtitle||''}`;

  // Estimate duration from chord count × beats per chord × seconds per beat
  const totalBeats = (comp.chords?.progression||[]).reduce((a,c)=>a+(c.beats||4),0) || 32;
  CS.playTotal = Math.max(20, Math.round(totalBeats * (60/parseInt(settings.tempo||120))));
  CS.playSec   = 0;
  document.getElementById('playbackTime').textContent = `0:00 / ${formatTime(CS.playTotal)}`;
  document.getElementById('playbackProgress').style.width = '0%';

  renderCompositionTab(comp);
  renderChordsTab(comp);
  renderTheoryTab(comp);
  renderPerformanceTab(comp);

  // Reset to first tab
  document.querySelectorAll('.ac-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ac-tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelector('.ac-tab[data-tab="composition"]')?.classList.add('active');
  document.getElementById('tab-composition')?.classList.add('active');
}

function renderCompositionTab(comp) {
  const el = document.getElementById('compositionOutput');
  if (!el||!comp.composition) return;
  let h = `<h2>🎼 Overview</h2><p>${comp.composition.overview||''}</p>`;
  if (comp.composition.structure?.length) {
    h += `<h2>📐 Structure</h2>`;
    comp.composition.structure.forEach(s=>{
      h += `<h3>${s.section} <span style="font-weight:400;color:var(--muted);font-size:.8rem">(Bars ${s.bars})</span></h3><p>${s.description}</p>`;
    });
  }
  if (comp.composition.notation) h += `<h2>🎵 Main Theme Notation</h2><div class="ac-notation-block">${esc(comp.composition.notation)}</div>`;
  if (comp.composition.fullDescription) h += `<h2>📖 Full Description</h2><div class="ac-tip-card">${comp.composition.fullDescription}</div>`;
  el.innerHTML = h;
}

function renderChordsTab(comp) {
  const el = document.getElementById('chordsOutput');
  if (!el||!comp.chords) return;
  let h = '<h2>🎹 Chord Progression</h2>';
  if (comp.chords.progression?.length) {
    h += '<div class="ac-chord-grid">';
    comp.chords.progression.forEach(c=>{
      h += `<div class="ac-chord-box"><span class="ac-chord-name">${c.chord}</span><span class="ac-chord-type">${c.type||''}</span><span class="ac-chord-roman">${c.roman||''}</span></div>`;
    });
    h += '</div><h2>📋 Chord Details</h2>';
    comp.chords.progression.forEach(c=>{
      h += `<div class="ac-tip-card"><strong>${c.chord} (${c.roman})</strong> — ${c.description||''} ${c.beats?`<em style="color:var(--muted);font-size:.8rem">[${c.beats} beat${c.beats!==1?'s':''}]</em>`:''}</div>`;
    });
  }
  if (comp.chords.analysis) h += `<h2>🔍 Harmonic Analysis</h2><p>${comp.chords.analysis}</p>`;
  if (comp.chords.voicings) h += `<h2>🤲 Voicing Suggestions</h2><div class="ac-notation-block">${esc(comp.chords.voicings)}</div>`;
  el.innerHTML = h;
}

function renderTheoryTab(comp) {
  const el = document.getElementById('theoryOutput');
  if (!el||!comp.theory) return;
  let h='';
  [['keyAndScale','🎼','Key & Scale'],['harmony','🎵','Harmony'],['rhythm','🥁','Rhythm & Time'],['form','📐','Musical Form'],['influences','🎭','Influences']].forEach(([k,icon,lbl])=>{
    if(comp.theory[k]) h+=`<h2>${icon} ${lbl}</h2><p>${comp.theory[k]}</p>`;
  });
  if(comp.theory.learningPoints?.length){
    h+='<h2>💡 Key Learning Points</h2><ul>';
    comp.theory.learningPoints.forEach(pt=>{h+=`<li>${pt}</li>`;});
    h+='</ul>';
  }
  el.innerHTML=h;
}

function renderPerformanceTab(comp) {
  const el = document.getElementById('performanceOutput');
  if (!el||!comp.performance) return;
  let h='';
  if(comp.performance.tempoAndFeel) h+=`<h2>🎛️ Tempo & Feel</h2><div class="ac-tip-card">${comp.performance.tempoAndFeel}</div>`;
  if(comp.performance.instrumentGuides?.length){
    h+='<h2>🎸 Instrument Guides</h2>';
    comp.performance.instrumentGuides.forEach(g=>{
      h+=`<div class="ac-section-divider">${g.instrument}</div><h3>Role: <span style="font-weight:500;color:var(--muted)">${g.role}</span></h3><p><strong>Technique:</strong> ${g.technique}</p><div class="ac-tip-card"><strong>💡 Tip:</strong> ${g.tips}</div>`;
    });
  }
  if(comp.performance.dynamicsAndExpression) h+=`<h2>📊 Dynamics</h2><p>${comp.performance.dynamicsAndExpression}</p>`;
  if(comp.performance.practiceSteps?.length){h+='<h2>🪜 Practice Plan</h2><ul>';comp.performance.practiceSteps.forEach(s=>{h+=`<li>${s}</li>`;});h+='</ul>';}
  if(comp.performance.commonMistakes?.length){h+='<h2>⚠️ Common Mistakes</h2><ul>';comp.performance.commonMistakes.forEach(m=>{h+=`<li>${m}</li>`;});h+='</ul>';}
  el.innerHTML=h;
}

/* ══════════════════════════════════════════════
   TABS
══════════════════════════════════════════════ */
function switchTab(btn, tabId) {
  document.querySelectorAll('.ac-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ac-tab-content').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('tab-'+tabId)?.classList.add('active');
}

/* ══════════════════════════════════════════════
   COPY / DOWNLOAD
══════════════════════════════════════════════ */
function copyComposition() {
  if (!CS.current) return;
  navigator.clipboard.writeText(buildExport(CS.current.composition))
    .then(()=>showToast('📋 Copied!','success'))
    .catch(()=>showToast('Copy failed','error'));
}

function downloadComposition() {
  if (!CS.current) return;
  const {composition} = CS.current;
  const blob = new Blob([buildExport(composition)],{type:'text/plain'});
  const url  = URL.createObjectURL(blob);
  const a    = Object.assign(document.createElement('a'),{href:url,download:`${(composition.title||'composition').replace(/[^a-z0-9]/gi,'_')}.txt`});
  a.click(); URL.revokeObjectURL(url);
  CS.stats.saved=(CS.stats.saved||0)+1;
  saveStats(); renderStats();
  showToast('💾 Saved!','success');
}

function buildExport(comp) {
  let o=`HARMONIA AI COMPOSER\n${'='.repeat(50)}\n\nTITLE: ${comp.title}\n`;
  if(comp.subtitle) o+=`SUBTITLE: ${comp.subtitle}\n`;
  o+='\n';
  if(comp.composition){
    o+=`OVERVIEW\n${'-'.repeat(30)}\n${comp.composition.overview}\n\n`;
    if(comp.composition.structure){o+=`STRUCTURE\n${'-'.repeat(30)}\n`;comp.composition.structure.forEach(s=>{o+=`${s.section} (${s.bars}): ${s.description}\n`;});o+='\n';}
    if(comp.composition.notation) o+=`NOTATION\n${'-'.repeat(30)}\n${comp.composition.notation}\n\n`;
  }
  if(comp.chords?.progression){o+=`CHORD PROGRESSION\n${'-'.repeat(30)}\n${comp.chords.progression.map(c=>`${c.chord}(${c.roman})`).join(' - ')}\n\n${comp.chords.analysis||''}\n\n`;}
  if(comp.theory?.keyAndScale) o+=`THEORY\n${'-'.repeat(30)}\n${comp.theory.keyAndScale}\n\n${comp.theory.harmony||''}\n\n`;
  if(comp.performance?.tempoAndFeel) o+=`PERFORMANCE\n${'-'.repeat(30)}\n${comp.performance.tempoAndFeel}\n\n`;
  o+=`\nGenerated by Harmonia AI Composer\n`;
  return o;
}

/* ══════════════════════════════════════════════
   HISTORY & STATS
══════════════════════════════════════════════ */
function updateStatsAndHistory(comp, settings, usedAI) {
  const item={id:Date.now(),title:comp.title,genre:settings.genre,mood:settings.mood,tempo:settings.tempo,timestamp:Date.now(),icon:genreIcon(settings.genre),xp:75,usedAI};
  CS.history=[item,...CS.history].slice(0,20);
  localStorage.setItem('harmonia_comp_hist',JSON.stringify(CS.history));
  CS.stats.composed=(CS.stats.composed||0)+1;
  if(!Array.isArray(CS.stats.genres)) CS.stats.genres=[];
  if(settings.genre!=='any'&&!CS.stats.genres.includes(settings.genre)) CS.stats.genres.push(settings.genre);
  CS.stats.xp=(CS.stats.xp||0)+75;
  saveStats(); renderHistory(); renderStats();
}

function renderHistory() {
  const el=document.getElementById('historyList');
  if(!el) return;
  if(!CS.history.length){el.innerHTML=`<div class="ac-history-empty"><span>🎵</span><p>Your compositions will appear here</p></div>`;return;}
  el.innerHTML=CS.history.map(item=>`
    <div class="ac-history-item">
      <span class="ac-history-icon">${item.icon}</span>
      <div class="ac-history-info">
        <span class="ac-history-name">${esc(item.title)}</span>
        <span class="ac-history-meta">${cap(item.genre)} · ${item.tempo} BPM · ${timeAgo(item.timestamp)} ${item.usedAI?'· <span style="color:#a78bfa">Grok</span>':''}</span>
      </div>
      <span class="ac-history-xp">+${item.xp} XP</span>
    </div>`).join('');
}

function clearHistory() {
  CS.history=[];
  localStorage.removeItem('harmonia_comp_hist');
  renderHistory();
  showToast('History cleared','info');
}

function saveStats() { localStorage.setItem('harmonia_comp_stats',JSON.stringify(CS.stats)); }
function renderStats() {
  document.getElementById('statComposed').textContent = CS.stats.composed||0;
  document.getElementById('statGenres').textContent   = CS.stats.genres?.length||0;
  document.getElementById('statXP').textContent       = CS.stats.xp||0;
  document.getElementById('statSaved').textContent    = CS.stats.saved||0;
}

/* ══════════════════════════════════════════════
   UTILS
══════════════════════════════════════════════ */
function genreIcon(g){return({classical:'🎻',jazz:'🎷',pop:'🎤',rock:'🎸',electronic:'⚡','hip-hop':'🎧',ambient:'🌊',folk:'🪕','r&b':'💜',cinematic:'🎬','lo-fi':'☕',any:'🎵'})[g]||'🎵';}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):'';}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function formatTime(s){return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function timeAgo(ts){const d=Date.now()-ts;return d<60000?'just now':d<3600000?`${Math.floor(d/60000)}m ago`:d<86400000?`${Math.floor(d/3600000)}h ago`:new Date(ts).toLocaleDateString();}

function showToast(msg,type='info'){
  const t=document.getElementById('acToast');
  if(!t) return;
  t.textContent=msg; t.className=`ac-toast ${type} show`;
  clearTimeout(window._acToast);
  window._acToast=setTimeout(()=>t.classList.remove('show'),3400);
}
