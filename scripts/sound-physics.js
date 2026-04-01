/**
 * sound-physics.js — Full interactive physics lab
 * Covers: wave sandbox, piano keyboard, harmonics builder,
 *         string & pipe resonance, Doppler sim, interference visualizer,
 *         2D interference pattern, and a knowledge quiz.
 */

// ─── Global state ──────────────────────────────────────────────
const SP = {
  wave:      { amp: 50, freq: 2, speed: 1, phase: 0, playing: true },
  harmonic:  { fundamentalHz: 220, amplitudes: [80,40,25,15,8,4] },
  string:    { mode: 1, length: 1.0, tension: 50 },
  pipe:      { type: 'open', length: 1.0, harmonic: 1 },
  doppler:   { speed: 80, srcFreq: 440, playing: true, srcX: 100, direction: 1 },
  interf:    { freqA: 440, freqB: 443, phase: 0, playing: true, t: 0 },
  piano:     { selectedHz: null, audioCtx: null, oscillator: null },
  heroFreq:  440,
  oscT:      0,
  longT:     0,
  transT:    0,
  harm2DT:   0,
};

// ─── Utility ────────────────────────────────────────────────────
const π = Math.PI;
const TWO_PI = 2 * π;
const SOUND_SPEED = 343; // m/s

function lerp(a, b, t) { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function noteFromHz(hz) {
  const NOTES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const n = Math.round(12 * Math.log2(hz / 440)) + 69;
  const octave = Math.floor(n / 12) - 1;
  return NOTES[((n % 12) + 12) % 12] + octave;
}

// ─── Web Audio (for piano key tones) ────────────────────────────
function getAudioCtx() {
  if (!SP.piano.audioCtx) {
    SP.piano.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return SP.piano.audioCtx;
}

function playTone(hz, duration = 1.5) {
  try {
    const ctx = getAudioCtx();
    if (SP.piano.oscillator) {
      SP.piano.oscillator.stop();
      SP.piano.oscillator.disconnect();
    }

    const osc  = ctx.createOscillator();
    const gain = ctx.createGain();
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.value = hz;
    osc2.type = 'sine';
    osc2.frequency.value = hz * 2;

    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(0.06, ctx.currentTime + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration * 0.6);

    osc.connect(gain); gain.connect(ctx.destination);
    osc2.connect(gain2); gain2.connect(ctx.destination);
    osc.start(); osc2.start();
    osc.stop(ctx.currentTime + duration);
    osc2.stop(ctx.currentTime + duration);

    SP.piano.oscillator = osc;
  } catch(e) { /* audio not available */ }
}

// ─── Hero Canvas (floating sound-wave particles) ─────────────────
(function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const particles = Array.from({length: 80}, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: Math.random() * 2 + 0.5,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    opacity: Math.random() * 0.5 + 0.1,
  }));

  let heroT = 0;

  function drawHero() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    heroT += 0.015;
    const W = canvas.width, H = canvas.height;

    // Draw expanding sound circles
    for (let i = 0; i < 5; i++) {
      const r = ((heroT * 80 + i * 80) % (Math.max(W, H) * 0.9));
      const alpha = clamp(1 - r / (Math.max(W, H) * 0.7), 0, 1) * 0.06;
      ctx.beginPath();
      ctx.arc(W * 0.72, H * 0.45, r, 0, TWO_PI);
      ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    // Wave lines
    for (let row = 0; row < 6; row++) {
      const y0 = (row + 1) * H / 7;
      ctx.beginPath();
      for (let x = 0; x <= W; x += 2) {
        const freq = 0.012 + row * 0.003;
        const amp  = 14 + row * 4;
        const phase = heroT * (0.8 + row * 0.25);
        const y = y0 + Math.sin(x * freq + phase) * amp;
        if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(167,139,250,${0.04 + row * 0.008})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Particles
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, TWO_PI);
      ctx.fillStyle = `rgba(167,139,250,${p.opacity})`;
      ctx.fill();
    });

    requestAnimationFrame(drawHero);
  }
  drawHero();
})();

// ─── Hero Oscilloscope ───────────────────────────────────────────
(function initOscilloscope() {
  const canvas = document.getElementById('oscCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let t = 0;

  function draw() {
    const W = canvas.width, H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    // Grid
    ctx.strokeStyle = 'rgba(167,139,250,0.06)';
    ctx.lineWidth = 1;
    for (let gx = 0; gx <= W; gx += W/8) {
      ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
    }
    for (let gy = 0; gy <= H; gy += H/4) {
      ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
    }

    // Center line
    ctx.strokeStyle = 'rgba(167,139,250,0.12)';
    ctx.beginPath(); ctx.moveTo(0, H/2); ctx.lineTo(W, H/2); ctx.stroke();

    // Waveform
    const f = SP.heroFreq;
    const normalizedF = (f - 20) / (2000 - 20);
    const displayFreq = 1.5 + normalizedF * 5;

    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0,   'rgba(124,58,237,0)');
    grad.addColorStop(0.1, '#a78bfa');
    grad.addColorStop(0.9, '#ec4899');
    grad.addColorStop(1,   'rgba(236,72,153,0)');

    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const px = x / W;
      const val = Math.sin(px * TWO_PI * displayFreq + t)
                + 0.3 * Math.sin(px * TWO_PI * displayFreq * 2 + t * 1.3)
                + 0.1 * Math.sin(px * TWO_PI * displayFreq * 3 + t * 0.9);
      const y = H/2 - val * H * 0.28;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Glow
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#a78bfa';
    ctx.stroke();
    ctx.shadowBlur = 0;

    t += 0.08;
    requestAnimationFrame(draw);
  }
  draw();
})();

function updateHeroFreq(val) {
  SP.heroFreq = +val;
  document.getElementById('freqDisplay').textContent = val;
  const noteNames = ['A0','A#0','B0','C1','C#1','D1','D#1','E1','F1','F#1','G1','G#1',
    'A1','A#1','B1','C2','C#2','D2','D#2','E2','F2','F#2','G2','G#2',
    'A2','A#2','B2','C3','C#3','D3','D#3','E3','F3','F#3','G3','G#3',
    'A3','A#3','B3','C4','C#4','D4','D#4','E4','F4','F#4','G4','G#4',
    'A4','A#4','B4','C5','C#5','D5','D#5','E5','F5','F#5','G5','G#5',
    'A5','A#5','B5','C6'];
  document.getElementById('freqDisplay').textContent = val;
  try {
    const note = noteFromHz(+val);
    document.querySelector('.sp-freq-note').textContent = note;
  } catch(e) {}
}

function scrollToLab() {
  document.getElementById('lab').scrollIntoView({ behavior: 'smooth', block: 'start' });
}
function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ─── Chapter Navigation ─────────────────────────────────────────
function setChapter(name) {
  document.querySelectorAll('.sp-chapter').forEach(b => b.classList.toggle('active', b.dataset.chapter === name));
  const target = document.getElementById('mod-' + name);
  if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Highlight active chapter on scroll
const moduleEls = document.querySelectorAll('.sp-module[data-chapter]');
const navObserver = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const ch = e.target.dataset.chapter;
      document.querySelectorAll('.sp-chapter').forEach(b => b.classList.toggle('active', b.dataset.chapter === ch));
    }
  });
}, { threshold: 0.35 });
moduleEls.forEach(m => navObserver.observe(m));

// ─── ══════════════════════════════════════ ─────────────────────
// MODULE 1: WAVE SANDBOX
// ─── ══════════════════════════════════════ ─────────────────────
const waveCanvas  = document.getElementById('waveCanvas');
const waveCtx     = waveCanvas ? waveCanvas.getContext('2d') : null;
let waveT = 0, waveRAF;

function updateWave() {
  SP.wave.amp   = +document.getElementById('ampSlider').value;
  SP.wave.freq  = +document.getElementById('freqSlider').value;
  SP.wave.speed = +document.getElementById('speedSlider').value;

  document.getElementById('ampVal').textContent   = SP.wave.amp;
  document.getElementById('freqVal').textContent  = SP.wave.freq;
  document.getElementById('speedVal').textContent = SP.wave.speed.toFixed(1);

  const lambda = (SOUND_SPEED / (SP.wave.freq * 100)).toFixed(2);
  document.getElementById('wlVal').textContent = lambda;
}

function drawWave() {
  if (!waveCtx) return;
  const W = waveCanvas.width, H = waveCanvas.height;
  waveCtx.clearRect(0, 0, W, H);

  // Grid lines
  waveCtx.strokeStyle = 'rgba(255,255,255,0.03)';
  waveCtx.lineWidth = 1;
  for (let gx = 0; gx <= W; gx += 60) {
    waveCtx.beginPath(); waveCtx.moveTo(gx,0); waveCtx.lineTo(gx,H); waveCtx.stroke();
  }
  for (let gy = 0; gy <= H; gy += H/4) {
    waveCtx.beginPath(); waveCtx.moveTo(0,gy); waveCtx.lineTo(W,gy); waveCtx.stroke();
  }

  // Center baseline
  waveCtx.strokeStyle = 'rgba(255,255,255,0.08)';
  waveCtx.lineWidth = 1;
  waveCtx.beginPath(); waveCtx.moveTo(0,H/2); waveCtx.lineTo(W,H/2); waveCtx.stroke();

  // Amplitude indicators
  waveCtx.strokeStyle = 'rgba(167,139,250,0.1)';
  waveCtx.setLineDash([4,4]);
  waveCtx.beginPath(); waveCtx.moveTo(0, H/2 - SP.wave.amp); waveCtx.lineTo(W, H/2 - SP.wave.amp); waveCtx.stroke();
  waveCtx.beginPath(); waveCtx.moveTo(0, H/2 + SP.wave.amp); waveCtx.lineTo(W, H/2 + SP.wave.amp); waveCtx.stroke();
  waveCtx.setLineDash([]);

  // Main wave
  const k  = TWO_PI / (W / SP.wave.freq);
  const ω  = TWO_PI * SP.wave.freq * 0.01 * SP.wave.speed;

  const grad = waveCtx.createLinearGradient(0, 0, W, 0);
  grad.addColorStop(0,   '#7c3aed');
  grad.addColorStop(0.5, '#a78bfa');
  grad.addColorStop(1,   '#ec4899');

  waveCtx.beginPath();
  for (let x = 0; x <= W; x += 1.5) {
    const y = H/2 - SP.wave.amp * Math.sin(k * x - ω * waveT);
    if (x === 0) waveCtx.moveTo(x, y); else waveCtx.lineTo(x, y);
  }
  waveCtx.strokeStyle = grad;
  waveCtx.lineWidth = 3;
  waveCtx.stroke();

  // Glow effect
  waveCtx.shadowBlur = 16;
  waveCtx.shadowColor = 'rgba(167,139,250,0.4)';
  waveCtx.stroke();
  waveCtx.shadowBlur = 0;

  // Moving dot on wave
  const dotX = (waveT * SP.wave.speed * 60) % W;
  const dotY = H/2 - SP.wave.amp * Math.sin(k * dotX - ω * waveT);
  waveCtx.beginPath();
  waveCtx.arc(dotX, dotY, 6, 0, TWO_PI);
  waveCtx.fillStyle = '#fff';
  waveCtx.fill();
  waveCtx.beginPath();
  waveCtx.arc(dotX, dotY, 10, 0, TWO_PI);
  waveCtx.fillStyle = 'rgba(167,139,250,0.3)';
  waveCtx.fill();

  if (SP.wave.playing) waveT++;
  waveRAF = requestAnimationFrame(drawWave);
}

function toggleWave() {
  SP.wave.playing = !SP.wave.playing;
  const btn = document.getElementById('playWaveBtn');
  if (btn) btn.textContent = SP.wave.playing ? '⏸ Pause' : '▶ Play';
  btn?.classList.toggle('active', SP.wave.playing);
}

function resetWave() {
  waveT = 0;
  document.getElementById('ampSlider').value = 50;
  document.getElementById('freqSlider').value = 2;
  document.getElementById('speedSlider').value = 1;
  updateWave();
}

// Longitudinal particle motion
(function drawLongitudinal() {
  const canvas = document.getElementById('longCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const N = 30;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const spacing = W / N;

    for (let i = 0; i < N; i++) {
      const baseX = (i + 0.5) * spacing;
      const displacement = 14 * Math.sin(i * 0.6 - t);
      const x = baseX + displacement;
      const density = Math.abs(Math.sin(i * 0.6 - t));

      const r = Math.round(lerp(80, 167, density));
      const g = Math.round(lerp(50, 139, density * 0.5));
      const b = Math.round(lerp(200, 250, density));

      ctx.beginPath();
      ctx.arc(x, H/2, 4 + density * 3, 0, TWO_PI);
      ctx.fillStyle = `rgb(${r},${g},${b})`;
      ctx.globalAlpha = 0.6 + density * 0.4;
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Labels
    ctx.fillStyle = 'rgba(100,116,139,0.7)';
    ctx.font = '10px Space Mono, monospace';
    ctx.fillText('COMPRESSION', 22, H - 8);
    ctx.fillText('RAREFACTION', W * 0.55, H - 8);

    t += 0.04;
    requestAnimationFrame(draw);
  }
  draw();
})();

// Transverse particle motion
(function drawTransverse() {
  const canvas = document.getElementById('transCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const N = 30;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    const spacing = W / N;

    // Draw connecting lines
    ctx.beginPath();
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * spacing;
      const y = H/2 + 20 * Math.sin(i * 0.6 - t);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = 'rgba(56,189,248,0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) * spacing;
      const vy = Math.sin(i * 0.6 - t);
      const y = H/2 + 20 * vy;
      const intensity = Math.abs(vy);

      ctx.beginPath();
      ctx.arc(x, y, 4.5, 0, TWO_PI);
      ctx.fillStyle = `rgba(56,${Math.round(189 + intensity * 40)},248,${0.6 + intensity * 0.4})`;
      ctx.fill();

      // Velocity arrow
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, H/2);
      ctx.strokeStyle = 'rgba(56,189,248,0.15)';
      ctx.lineWidth = 1;
      ctx.stroke();
    }
    t += 0.04;
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── MODULE 2: PIANO KEYBOARD ───────────────────────────────────
(function buildPiano() {
  const piano = document.getElementById('pianoKeyboard');
  if (!piano) return;

  // Notes for 2 octaves starting at C3
  const C3 = 130.81;
  const semitones = [];
  for (let oct = 0; oct < 3; oct++) {
    for (let s = 0; s < 12; s++) semitones.push({ s: s + oct * 12, oct });
  }

  const NOTE_NAMES = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const BLACK_POSITIONS = [1,3,6,8,10]; // semitone indices that are black keys
  const whiteNotes = semitones.filter(n => !BLACK_POSITIONS.includes(n.s % 12));
  const blackNotes = semitones.filter(n => BLACK_POSITIONS.includes(n.s % 12));

  piano.style.position = 'relative';

  const WHITE_W = 48, BLACK_W = 30, BLACK_H = 100;
  let whiteCount = 0;

  // White keys first
  whiteNotes.forEach(note => {
    const freq = C3 * Math.pow(2, note.s / 12);
    const name = NOTE_NAMES[note.s % 12] + (Math.floor(note.s / 12) + 3);
    const key = document.createElement('div');
    key.className = 'piano-key-white';
    key.innerHTML = `<span class="piano-key-note">${name}</span>`;
    key.dataset.freq = freq.toFixed(2);
    key.dataset.note = name;
    key.addEventListener('mousedown', () => handlePianoKey(key));
    key.addEventListener('touchstart', e => { e.preventDefault(); handlePianoKey(key); });
    piano.appendChild(key);
    whiteCount++;
  });

  // Black keys overlay
  let wIdx = 0;
  semitones.forEach(note => {
    const isBlack = BLACK_POSITIONS.includes(note.s % 12);
    if (!isBlack) {
      wIdx++;
    } else {
      const freq = C3 * Math.pow(2, note.s / 12);
      const name = NOTE_NAMES[note.s % 12] + (Math.floor(note.s / 12) + 3);
      const key = document.createElement('div');
      key.className = 'piano-key-black';
      key.dataset.freq = freq.toFixed(2);
      key.dataset.note = name;
      key.style.left = (wIdx * WHITE_W - BLACK_W / 2) + 'px';
      key.addEventListener('mousedown', () => handlePianoKey(key));
      key.addEventListener('touchstart', e => { e.preventDefault(); handlePianoKey(key); });
      piano.appendChild(key);
    }
  });

  piano.style.width = (whiteCount * WHITE_W) + 'px';
})();

function handlePianoKey(key) {
  // Remove previous active
  document.querySelectorAll('.piano-key-white.active, .piano-key-black.active')
    .forEach(k => k.classList.remove('active'));
  key.classList.add('active');

  const hz  = +key.dataset.freq;
  const note = key.dataset.note;
  SP.piano.selectedHz = hz;

  playTone(hz, 1.2);
  updatePianoInfo(hz, note);
  drawPianoWave(hz);

  setTimeout(() => key.classList.remove('active'), 800);
}

function updatePianoInfo(hz, note) {
  document.getElementById('pianoNote').textContent = note;
  document.getElementById('pianoFreq').textContent = hz.toFixed(2) + ' Hz';
  document.getElementById('pianoWL').textContent   = (SOUND_SPEED / hz).toFixed(3) + ' m';
  document.getElementById('pianoPeriod').textContent = (1000 / hz).toFixed(3) + ' ms';
  document.getElementById('pianoOmega').textContent  = (TWO_PI * hz).toFixed(1) + ' rad/s';
}

function drawPianoWave(hz) {
  const canvas = document.getElementById('pianoWaveCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  let t = 0;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.beginPath();
    for (let x = 0; x < W; x++) {
      const freq = hz / 100;
      const y = H/2 + H * 0.35 * Math.sin((x / W) * TWO_PI * 3 + t);
      if (x === 0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
    }
    const grad = ctx.createLinearGradient(0, 0, W, 0);
    grad.addColorStop(0,'#7c3aed'); grad.addColorStop(1,'#ec4899');
    ctx.strokeStyle = grad;
    ctx.lineWidth = 2;
    ctx.stroke();
    t += 0.15;
    if (t < TWO_PI * 6) requestAnimationFrame(draw);
  }
  draw();
}

// ─── MODULE 3: HARMONICS BUILDER ────────────────────────────────
function getHarmAmplitudes() {
  return Array.from(document.querySelectorAll('.sp-harm-slider')).map(s => +s.value / 100);
}

function rebuildHarmonic() {
  const amps = getHarmAmplitudes();
  amps.forEach((a, i) => {
    const el = document.getElementById('hv' + (i+1));
    if (el) el.textContent = Math.round(a * 100) + '%';
    const hfEl = document.getElementById('h' + (i+1) + 'freq');
    if (hfEl) hfEl.textContent = (SP.harmonic.fundamentalHz * (i+1)).toFixed(0) + 'Hz';
  });
  drawHarmonicCanvas(amps);
  drawSpectrumCanvas(amps);
  updateTimbreMeters(amps);
}

function drawHarmonicCanvas(amps) {
  const canvas = document.getElementById('harmonicCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  // Background grid
  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= W; gx += W/10) {
    ctx.beginPath(); ctx.moveTo(gx,0); ctx.lineTo(gx,H); ctx.stroke();
  }
  ctx.beginPath(); ctx.moveTo(0,H/2); ctx.lineTo(W,H/2); ctx.stroke();

  // Draw composite
  const grad = ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0,'#7c3aed'); grad.addColorStop(0.5,'#a78bfa'); grad.addColorStop(1,'#ec4899');

  ctx.beginPath();
  for (let x = 0; x <= W; x++) {
    let y = 0;
    amps.forEach((a, n) => {
      y += a * Math.sin(((x / W) * TWO_PI * (n + 1)) + (SP.harm2DT || 0));
    });
    const total = amps.reduce((s,a) => s+a, 0) || 1;
    const yPx = H/2 - (y / total) * H * 0.38;
    if (x === 0) ctx.moveTo(x, yPx); else ctx.lineTo(x, yPx);
  }
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.shadowBlur = 10; ctx.shadowColor = '#a78bfa';
  ctx.stroke(); ctx.shadowBlur = 0;
}

function drawSpectrumCanvas(amps) {
  const canvas = document.getElementById('spectrumCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.strokeStyle = 'rgba(255,255,255,0.04)';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(0, H-1); ctx.lineTo(W, H-1); ctx.stroke();

  const barW = W / 10;
  const colors = ['#7c3aed','#ec4899','#38bdf8','#2dd4bf','#fb923c','#f87171'];

  amps.forEach((a, i) => {
    const x = (i + 1) * barW + barW * 0.5;
    const barH = a * (H - 20);
    const grad = ctx.createLinearGradient(x, H - barH, x, H);
    const col = colors[i] || '#a78bfa';
    grad.addColorStop(0, col + 'ff');
    grad.addColorStop(1, col + '33');
    ctx.fillStyle = grad;
    ctx.fillRect(x - barW * 0.3, H - barH, barW * 0.6, barH);

    ctx.fillStyle = col;
    ctx.font = '11px Space Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`n=${i+1}`, x, H - barH - 6);
    ctx.fillText((SP.harmonic.fundamentalHz * (i+1)).toFixed(0), x, H - barH - 18);
  });
}

function updateTimbreMeters(amps) {
  const highFreqEnergy = amps.slice(2).reduce((s,a) => s+a, 0) / (amps.length - 2 || 1);
  const lowFreqEnergy  = amps.slice(0,2).reduce((s,a) => s+a, 0) / 2;
  const totalEnergy    = amps.reduce((s,a) => s+a, 0);

  const bright = Math.round(highFreqEnergy * 100 * 1.5);
  const warm   = Math.round(lowFreqEnergy * 100 * 0.85);
  const rich   = Math.round(totalEnergy / amps.length * 100);

  document.getElementById('brightMeter').style.width = clamp(bright,0,100) + '%';
  document.getElementById('warmMeter').style.width   = clamp(warm,0,100) + '%';
  document.getElementById('richMeter').style.width   = clamp(rich,0,100) + '%';
  document.getElementById('brightVal').textContent   = clamp(bright,0,100) + '%';
  document.getElementById('warmVal').textContent     = clamp(warm,0,100) + '%';
  document.getElementById('richVal').textContent     = clamp(rich,0,100) + '%';
}

function loadPreset(name) {
  const PRESETS = {
    sine:     [100, 0, 0, 0, 0, 0],
    square:   [80, 0, 27, 0, 16, 0],
    sawtooth: [80, 40, 27, 20, 16, 13],
    clarinet: [80, 5, 60, 5, 30, 5],
    violin:   [80, 45, 35, 20, 12, 8],
  };
  const vals = PRESETS[name] || PRESETS.sine;
  document.querySelectorAll('.sp-harm-slider').forEach((s, i) => { s.value = vals[i] || 0; });
  rebuildHarmonic();
}

// Animate harmonics continuously
(function animateHarmonics() {
  let ht = 0;
  function loop() {
    SP.harm2DT = ht;
    const amps = getHarmAmplitudes();
    drawHarmonicCanvas(amps);
    ht += 0.025;
    requestAnimationFrame(loop);
  }
  loop();
})();

// ─── MODULE 4: RESONANCE ────────────────────────────────────────
let stringMode = 1, stringT = 0;

function setStringMode(n) {
  stringMode = n;
  document.querySelectorAll('.sp-harmonic-mode-btns .sp-mode-btn').forEach((b, i) => {
    b.classList.toggle('active', i + 1 === n);
  });

  const harmNames = ['1st (Fundamental)','2nd (Octave)','3rd','4th','5th'];
  document.getElementById('stringHarmonic').textContent  = harmNames[n-1];
  document.getElementById('stringNodes').textContent     = n + 1;
  document.getElementById('stringAntinodes').textContent = n;
  updateString();
}

function updateString() {
  const L   = +document.getElementById('strLenSlider').value;
  const T   = +document.getElementById('strTensionSlider').value;
  document.getElementById('strLenVal').textContent     = L.toFixed(1);
  document.getElementById('strTensionVal').textContent = T;
  SP.string.length  = L;
  SP.string.tension = T;
}

(function drawString() {
  const canvas = document.getElementById('stringCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.roundRect?.(0,0,W,H,8) ?? ctx.rect(0,0,W,H); ctx.fill();

    const n   = stringMode;
    const amp = 55;
    const y0  = H / 2;
    const x0  = 50, x1 = W - 50;
    const strW = x1 - x0;

    // Draw nodes (fixed points)
    for (let i = 0; i <= n; i++) {
      const nx = x0 + i * strW / n;
      ctx.beginPath();
      ctx.arc(nx, y0, 5, 0, TWO_PI);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
    }

    // Envelope
    const grad = ctx.createLinearGradient(x0, 0, x1, 0);
    grad.addColorStop(0, 'rgba(124,58,237,0.15)');
    grad.addColorStop(0.5, 'rgba(167,139,250,0.25)');
    grad.addColorStop(1, 'rgba(124,58,237,0.15)');

    ctx.beginPath();
    for (let x = x0; x <= x1; x++) {
      const p = (x - x0) / strW;
      const envelope = Math.abs(Math.sin(n * Math.PI * p));
      const yTop = y0 - envelope * amp;
      if (x === x0) ctx.moveTo(x, yTop); else ctx.lineTo(x, yTop);
    }
    for (let x = x1; x >= x0; x--) {
      const p = (x - x0) / strW;
      const envelope = Math.abs(Math.sin(n * Math.PI * p));
      const yBot = y0 + envelope * amp;
      ctx.lineTo(x, yBot);
    }
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();

    // Animated standing wave
    const color1 = '#a78bfa', color2 = '#ec4899';
    [1, -1].forEach((sign, si) => {
      ctx.beginPath();
      for (let x = x0; x <= x1; x++) {
        const p = (x - x0) / strW;
        const wave = Math.sin(n * Math.PI * p) * Math.cos(stringT * 0.06);
        const y = y0 + sign * wave * amp;
        if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = si === 0 ? color1 : color2;
      ctx.lineWidth = 2.5;
      ctx.globalAlpha = 0.7;
      ctx.stroke();
      ctx.globalAlpha = 1;
    });

    // Label
    const L = SP.string.length;
    const v = 200 * Math.sqrt(SP.string.tension / 50);
    const freq = (n * v) / (2 * L);
    ctx.fillStyle = 'rgba(100,116,139,0.8)';
    ctx.font = '11px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`f = ${freq.toFixed(1)} Hz  |  n=${n}  |  L=${L}m`, x0, H - 14);

    // String endpoints
    [x0, x1].forEach(ex => {
      ctx.beginPath();
      ctx.moveTo(ex, y0 - 70); ctx.lineTo(ex, y0 + 70);
      ctx.strokeStyle = 'rgba(100,116,139,0.5)'; ctx.lineWidth = 3; ctx.stroke();
    });

    stringT++;
    requestAnimationFrame(draw);
  }
  draw();
})();

// Pipe resonance
let pipeType = 'open', pipeHarmonic = 1, pipeT = 0;

function setPipeType(type) {
  pipeType = type;
  document.getElementById('openPipeBtn').classList.toggle('active', type === 'open');
  document.getElementById('closedPipeBtn').classList.toggle('active', type === 'closed');
  document.getElementById('pipeTypeLabel').textContent = type === 'open' ? 'Open (Both Ends)' : 'Closed (One End)';
  document.getElementById('pipeFormula').textContent   = type === 'open' ? 'f = nv/2L' : 'f = nv/4L (odd n)';
  updatePipe();
}

function updatePipe() {
  const L = +document.getElementById('pipeLenSlider').value;
  const n = +document.getElementById('pipeHarmSlider').value;
  pipeHarmonic = pipeType === 'closed' ? (2 * n - 1) : n;
  document.getElementById('pipeLenVal').textContent  = L.toFixed(1);
  document.getElementById('pipeHarmVal').textContent = pipeHarmonic;
  SP.pipe.length   = L;
  SP.pipe.harmonic = pipeHarmonic;

  const f = pipeType === 'open'
    ? (pipeHarmonic * SOUND_SPEED) / (2 * L)
    : (pipeHarmonic * SOUND_SPEED) / (4 * L);
  document.getElementById('pipeFreq').textContent = f.toFixed(1) + ' Hz';
}

(function drawPipe() {
  const canvas = document.getElementById('pipeCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath(); ctx.roundRect?.(0,0,W,H,8) ?? ctx.rect(0,0,W,H); ctx.fill();

    const n  = SP.pipe.harmonic;
    const x0 = 60, x1 = W - 60;
    const y0 = H / 2;
    const pipeH = 60;

    // Pipe walls
    ctx.fillStyle = 'rgba(100,116,139,0.15)';
    ctx.fillRect(x0, y0 - pipeH/2, x1 - x0, pipeH);
    ctx.strokeStyle = 'rgba(100,116,139,0.4)';
    ctx.lineWidth = 2;
    // Top wall
    ctx.beginPath(); ctx.moveTo(x0, y0 - pipeH/2); ctx.lineTo(x1, y0 - pipeH/2); ctx.stroke();
    // Bottom wall
    ctx.beginPath(); ctx.moveTo(x0, y0 + pipeH/2); ctx.lineTo(x1, y0 + pipeH/2); ctx.stroke();

    // Left cap (closed = wall, open = gap)
    if (pipeType === 'closed') {
      ctx.fillStyle = 'rgba(100,116,139,0.5)';
      ctx.fillRect(x0 - 8, y0 - pipeH/2 - 4, 8, pipeH + 8);
    } else {
      ctx.strokeStyle = 'rgba(56,189,248,0.5)';
      ctx.setLineDash([4,4]);
      ctx.beginPath(); ctx.moveTo(x0, y0 - pipeH/2 - 6); ctx.lineTo(x0, y0 + pipeH/2 + 6); ctx.stroke();
      ctx.setLineDash([]);
    }
    // Right cap (always open in our sim)
    ctx.strokeStyle = 'rgba(56,189,248,0.5)';
    ctx.setLineDash([4,4]);
    ctx.beginPath(); ctx.moveTo(x1, y0 - pipeH/2 - 6); ctx.lineTo(x1, y0 + pipeH/2 + 6); ctx.stroke();
    ctx.setLineDash([]);

    // Pressure wave inside pipe
    const cols = 50;
    for (let i = 0; i < cols; i++) {
      const p = i / cols;
      const px = x0 + p * (x1 - x0);
      let pressure;
      if (pipeType === 'open') {
        pressure = Math.cos(n * Math.PI * p) * Math.cos(pipeT * 0.05);
      } else {
        pressure = Math.cos((2*n-1) * Math.PI * p * 0.5) * Math.cos(pipeT * 0.05);
      }
      const intensity = Math.abs(pressure);
      const red   = Math.round(255 * intensity);
      const blue  = Math.round(255 * (1 - intensity));
      ctx.fillStyle = `rgba(${red},${Math.round(100*intensity)},${blue},${0.4 + intensity * 0.4})`;
      ctx.fillRect(px, y0 - pipeH/2 + 2, (x1 - x0) / cols - 1, pipeH - 4);
    }

    // Displacement wave
    ctx.beginPath();
    for (let x = x0; x <= x1; x++) {
      const p = (x - x0) / (x1 - x0);
      let disp;
      if (pipeType === 'open') {
        disp = Math.sin(n * Math.PI * p) * Math.sin(pipeT * 0.05);
      } else {
        disp = Math.sin((2*n-1) * Math.PI * p * 0.5) * Math.sin(pipeT * 0.05);
      }
      const y = y0 - disp * 22;
      if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Info label
    ctx.fillStyle = 'rgba(100,116,139,0.8)';
    ctx.font = '11px Space Mono, monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`n=${n}  ${pipeType === 'open' ? 'Open Pipe' : 'Closed Pipe'}`, x0, H - 14);

    pipeT++;
    requestAnimationFrame(draw);
  }
  draw();
})();

function highlightResonance(el, type) {
  document.querySelectorAll('.sp-resonance-ex').forEach(e => e.classList.remove('highlighted'));
  el.classList.add('highlighted');
}

// ─── MODULE 5: DOPPLER EFFECT ────────────────────────────────────
let dopplerT = 0;
const wavefronts = [];

function updateDoppler() {
  SP.doppler.speed   = +document.getElementById('dopplerSpeedSlider').value;
  SP.doppler.srcFreq = +document.getElementById('dopplerSrcFreqSlider').value;
  document.getElementById('dopplerSpeedVal').textContent   = SP.doppler.speed;
  document.getElementById('dopplerSrcFreqVal').textContent = SP.doppler.srcFreq;
  updateDopplerReadings();
}

function updateDopplerReadings() {
  const vs = SP.doppler.speed, f0 = SP.doppler.srcFreq;
  const fApproach = Math.round(f0 * SOUND_SPEED / (SOUND_SPEED - vs));
  const fRecede   = Math.round(f0 * SOUND_SPEED / (SOUND_SPEED + vs));
  document.getElementById('dopplerApproach').textContent = fApproach + ' Hz';
  document.getElementById('dopplerSource').textContent   = f0 + ' Hz';
  document.getElementById('dopplerRecede').textContent   = fRecede + ' Hz';
}

(function drawDoppler() {
  const canvas = document.getElementById('dopplerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  function draw() {
    ctx.fillStyle = 'rgba(5,5,16,0.18)';
    ctx.fillRect(0, 0, W, H);

    if (SP.doppler.playing) {
      dopplerT++;
      SP.doppler.srcX += SP.doppler.direction * (SP.doppler.speed / 60);
      if (SP.doppler.srcX > W + 40) {
        SP.doppler.srcX = -40;
        wavefronts.length = 0;
      }

      // Emit wavefront every N frames
      if (dopplerT % 8 === 0) {
        wavefronts.push({
          cx: SP.doppler.srcX, cy: H/2, r: 4,
          age: 0, maxR: Math.min(W, H) * 0.9
        });
      }
    }

    // Draw wavefronts
    wavefronts.forEach((wf, i) => {
      wf.r += SOUND_SPEED / 120;
      wf.age++;
      if (wf.r > wf.maxR) { wavefronts.splice(i, 1); return; }

      const alpha = Math.max(0, 1 - wf.r / wf.maxR) * 0.6;
      ctx.beginPath();
      ctx.arc(wf.cx, wf.cy, wf.r, 0, TWO_PI);
      ctx.strokeStyle = `rgba(167,139,250,${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

    // Source (moving object)
    const sx = SP.doppler.srcX, sy = H/2;
    ctx.beginPath();
    ctx.arc(sx, sy, 14, 0, TWO_PI);
    const srcGrad = ctx.createRadialGradient(sx, sy, 2, sx, sy, 14);
    srcGrad.addColorStop(0, '#fff'); srcGrad.addColorStop(1, '#7c3aed');
    ctx.fillStyle = srcGrad;
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sx, sy, 20, 0, TWO_PI);
    ctx.fillStyle = 'rgba(124,58,237,0.15)';
    ctx.fill();

    // Speed direction arrow
    ctx.fillStyle = 'rgba(255,255,255,0.7)';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`v = ${SP.doppler.speed} m/s →`, sx, sy - 28);

    // Listener ear
    const lx = W - 30, ly = H/2;
    ctx.font = '22px serif';
    ctx.textAlign = 'center';
    ctx.fillText('👂', lx, ly + 8);

    // Frequency shift indicator
    const shift = (SP.doppler.speed / SOUND_SPEED) * 100;
    ctx.fillStyle = 'rgba(74,222,128,0.8)';
    ctx.font = '12px Space Mono, monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`+${shift.toFixed(1)}% approaching`, lx - 40, ly - 20);
    ctx.fillStyle = 'rgba(248,113,113,0.8)';
    ctx.textAlign = 'left';
    ctx.fillText(`−${shift.toFixed(1)}% receding`, 20, ly + 30);

    requestAnimationFrame(draw);
  }
  draw();
  updateDopplerReadings();
})();

function toggleDoppler() {
  SP.doppler.playing = !SP.doppler.playing;
  const btn = document.getElementById('dopplerPlayBtn');
  if (btn) { btn.textContent = SP.doppler.playing ? '⏸ Pause' : '▶ Play'; btn.classList.toggle('active', SP.doppler.playing); }
}

function setDopplerPreset(type) {
  const presets = {
    ambulance:  { speed: 60,  srcFreq: 700  },
    train:      { speed: 160, srcFreq: 200  },
    plane:      { speed: 250, srcFreq: 1000 },
    supersonic: { speed: 340, srcFreq: 440  },
  };
  const p = presets[type];
  if (!p) return;
  SP.doppler.speed   = p.speed;
  SP.doppler.srcFreq = p.srcFreq;
  document.getElementById('dopplerSpeedSlider').value   = p.speed;
  document.getElementById('dopplerSrcFreqSlider').value = p.srcFreq;
  updateDoppler();
}

// ─── MODULE 6: INTERFERENCE ─────────────────────────────────────
let intT = 0;

function updateInterference() {
  SP.interf.freqA = +document.getElementById('freqASlider').value;
  SP.interf.freqB = +document.getElementById('freqBSlider').value;
  SP.interf.phase = +document.getElementById('phaseSlider').value;

  document.getElementById('freqAVal').textContent  = SP.interf.freqA;
  document.getElementById('freqBVal').textContent  = SP.interf.freqB;
  document.getElementById('phaseVal').textContent  = SP.interf.phase;
  const beatFreq = Math.abs(SP.interf.freqA - SP.interf.freqB);
  document.getElementById('beatFreqDisplay').textContent = beatFreq.toFixed(1) + ' Hz';
}

function drawInterferenceWave(canvasId, freq, phase, color, t) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const p = x / W;
    const phaseRad = (phase || 0) * Math.PI / 180;
    const y = H/2 - (H * 0.36) * Math.sin(p * TWO_PI * 3 + t * 0.03 * (freq / 440) + phaseRad);
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawResultWave(t) {
  const canvas = document.getElementById('waveResultCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  const phaseRad = SP.interf.phase * Math.PI / 180;
  ctx.beginPath();
  for (let x = 0; x < W; x++) {
    const p = x / W;
    const tScale = 0.03;
    const yA = Math.sin(p * TWO_PI * 3 + t * tScale * (SP.interf.freqA / 440));
    const yB = Math.sin(p * TWO_PI * 3 + t * tScale * (SP.interf.freqB / 440) + phaseRad);
    const sum = (yA + yB) / 2;
    const y = H/2 - sum * H * 0.38;
    if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  const grad = ctx.createLinearGradient(0,0,W,0);
  grad.addColorStop(0, '#2dd4bf'); grad.addColorStop(1, '#38bdf8');
  ctx.strokeStyle = grad;
  ctx.lineWidth = 2.5;
  ctx.shadowBlur = 8; ctx.shadowColor = '#2dd4bf';
  ctx.stroke(); ctx.shadowBlur = 0;
}

(function animateInterference() {
  function loop() {
    if (SP.interf.playing) intT++;
    drawInterferenceWave('waveACanvas', SP.interf.freqA, 0, '#a78bfa', intT);
    drawInterferenceWave('waveBCanvas', SP.interf.freqB, SP.interf.phase, '#ec4899', intT);
    drawResultWave(intT);
    draw2DInterference();
    requestAnimationFrame(loop);
  }
  loop();
})();

function toggleInterference() {
  SP.interf.playing = !SP.interf.playing;
  const btn = document.getElementById('intPlayBtn');
  if (btn) { btn.textContent = SP.interf.playing ? '⏸ Pause' : '▶ Play'; btn.classList.toggle('active', SP.interf.playing); }
}

function resetInterference() {
  intT = 0;
  document.getElementById('freqASlider').value = 440;
  document.getElementById('freqBSlider').value = 443;
  document.getElementById('phaseSlider').value = 0;
  updateInterference();
}

// 2D Interference Pattern
function draw2DInterference() {
  const canvas = document.getElementById('interference2DCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const imageData = ctx.createImageData(W, H);

  const phase = SP.interf.phase * Math.PI / 180;
  const t = intT * 0.02;

  for (let py = 0; py < H; py++) {
    for (let px = 0; px < W; px++) {
      const dx1 = px - W * 0.3, dy1 = py - H * 0.5;
      const dx2 = px - W * 0.7, dy2 = py - H * 0.5;
      const r1 = Math.sqrt(dx1*dx1 + dy1*dy1);
      const r2 = Math.sqrt(dx2*dx2 + dy2*dy2);
      const k = 0.18;
      const w1 = Math.sin(k * r1 - t * SP.interf.freqA / 100);
      const w2 = Math.sin(k * r2 - t * SP.interf.freqB / 100 + phase);
      const sum = (w1 + w2) / 2;
      const v = (sum + 1) / 2;

      const idx = (py * W + px) * 4;
      // Purple-to-pink gradient based on interference
      imageData.data[idx]   = Math.round(v * 167 + (1-v) * 236);
      imageData.data[idx+1] = Math.round(v * 139 + (1-v) * 72);
      imageData.data[idx+2] = Math.round(v * 250 + (1-v) * 153);
      imageData.data[idx+3] = 220;
    }
  }
  ctx.putImageData(imageData, 0, 0);
}

// ─── KNOWLEDGE QUIZ ─────────────────────────────────────────────
const QUIZ_QUESTIONS = [
  {
    q: "What property of a sound wave determines its PITCH?",
    opts: ["Amplitude","Frequency","Wavelength","Phase"],
    answer: 1,
    explanation: "Frequency determines pitch. Higher frequency = higher pitch. The relationship is direct: a note at 440 Hz (A4) sounds higher than 220 Hz (A3)."
  },
  {
    q: "What property of a sound wave determines its LOUDNESS?",
    opts: ["Frequency","Phase","Amplitude","Wavelength"],
    answer: 2,
    explanation: "Amplitude determines loudness. Greater amplitude = louder sound. In decibels (dB), loudness scales logarithmically with amplitude."
  },
  {
    q: "Sound travels fastest through which medium?",
    opts: ["Air at 20°C","Water","Steel","Vacuum"],
    answer: 2,
    explanation: "Sound travels fastest through steel (~5,100 m/s) because the particles are tightly packed and can transmit vibration very quickly. It cannot travel through a vacuum at all."
  },
  {
    q: "The Doppler Effect occurs because of relative ______ between source and observer.",
    opts: ["Temperature","Motion","Pressure","Density"],
    answer: 1,
    explanation: "The Doppler Effect is caused by relative motion. When a source approaches, wavefronts are compressed (higher frequency). When it recedes, they are stretched (lower frequency)."
  },
  {
    q: "Destructive interference occurs when two waves are exactly _____ out of phase.",
    opts: ["90°","180°","270°","360°"],
    answer: 1,
    explanation: "At 180° phase difference, the crest of one wave aligns with the trough of another, and they cancel out. This is the principle behind noise-cancelling headphones."
  },
  {
    q: "What is a 'harmonic' of a fundamental frequency of 110 Hz?",
    opts: ["55 Hz","165 Hz","100 Hz","111 Hz"],
    answer: 1,
    explanation: "Harmonics are whole-number multiples of the fundamental frequency. So 110 Hz harmonics are 220 Hz (2nd), 330 Hz (3rd), etc. 165 Hz = 110 × 1.5 is actually a 3rd harmonic partial."
  },
  {
    q: "Standing waves form in a guitar string because of ____ at the fixed endpoints.",
    opts: ["Refraction","Reflection","Diffraction","Absorption"],
    answer: 1,
    explanation: "Standing waves form when waves reflect from fixed boundaries and interfere with incoming waves. The fixed ends create nodes (zero displacement), and the resulting pattern appears stationary."
  },
  {
    q: "Human hearing typically spans which frequency range?",
    opts: ["20–20,000 Hz","0–10,000 Hz","100–100,000 Hz","10–10,000 Hz"],
    answer: 0,
    explanation: "Humans typically hear from about 20 Hz (very low bass) to 20,000 Hz (very high treble). This range decreases with age. Below 20 Hz is infrasound; above 20 kHz is ultrasound."
  },
  {
    q: "The relationship between frequency (f) and wavelength (λ) when wave speed (v) is constant is:",
    opts: ["f × λ = constant","f / λ = constant","f + λ = constant","f − λ = constant"],
    answer: 0,
    explanation: "v = f × λ. Since v is constant in a given medium, frequency and wavelength are inversely proportional — f × λ = v = constant. Double the frequency → half the wavelength."
  },
  {
    q: "Which waveform shape contains ALL even AND odd harmonics, producing a bright buzzy sound?",
    opts: ["Sine wave","Square wave","Sawtooth wave","Triangle wave"],
    answer: 2,
    explanation: "A sawtooth wave contains all harmonics (both even and odd), which gives it its characteristic bright, buzzy timbre — commonly used in synthesizers to imitate brass instruments."
  },
];

let quizIdx = 0, quizScore = 0, quizAnswered = false;

function renderQuiz() {
  const body = document.getElementById('quizBody');
  if (!body) return;

  if (quizIdx >= QUIZ_QUESTIONS.length) {
    showQuizComplete();
    return;
  }

  const q = QUIZ_QUESTIONS[quizIdx];
  const letters = ['A','B','C','D'];

  document.getElementById('quizProgFill').style.width = (quizIdx / QUIZ_QUESTIONS.length * 100) + '%';

  body.innerHTML = `
    <div class="sp-q-number">Question ${quizIdx + 1} / ${QUIZ_QUESTIONS.length}</div>
    <div class="sp-q-text">${q.q}</div>
    <div class="sp-q-options">
      ${q.opts.map((opt, i) => `
        <div class="sp-q-option" onclick="selectAnswer(${i})" id="opt${i}">
          <div class="sp-q-letter">${letters[i]}</div>
          ${opt}
        </div>
      `).join('')}
    </div>
    <div class="sp-q-explanation" id="qExplanation">
      <strong>💡 Explanation:</strong> ${q.explanation}
    </div>
    <div class="sp-q-actions">
      <div class="sp-q-score">Score: ${quizScore}/${quizIdx}</div>
      <button class="sp-btn-primary" id="nextBtn" onclick="nextQuestion()" style="display:none; padding:10px 22px; font-size:0.875rem;">
        ${quizIdx + 1 < QUIZ_QUESTIONS.length ? 'Next Question →' : 'See Results'}
      </button>
    </div>
  `;
  quizAnswered = false;
}

function selectAnswer(i) {
  if (quizAnswered) return;
  quizAnswered = true;

  const q = QUIZ_QUESTIONS[quizIdx];
  const opts = document.querySelectorAll('.sp-q-option');

  opts.forEach((el, idx) => {
    if (idx === q.answer) el.classList.add('correct');
    else if (idx === i && i !== q.answer) el.classList.add('wrong');
    el.style.pointerEvents = 'none';
  });

  if (i === q.answer) quizScore++;

  document.getElementById('qExplanation').classList.add('show');
  document.getElementById('nextBtn').style.display = 'inline-flex';
  document.querySelector('.sp-q-score').textContent = `Score: ${quizScore}/${quizIdx + 1}`;
}

function nextQuestion() {
  quizIdx++;
  renderQuiz();
}

function showQuizComplete() {
  const pct = Math.round((quizScore / QUIZ_QUESTIONS.length) * 100);
  const msgs = [
    { min: 90, icon: '🌟', msg: "Outstanding! You're a sound physics expert!" },
    { min: 70, icon: '🎓', msg: "Great job! You've got a solid grasp of acoustics." },
    { min: 50, icon: '📚', msg: "Good effort! Review the modules and try again." },
    { min: 0,  icon: '🎵', msg: "Keep exploring! Physics takes practice." },
  ];
  const m = msgs.find(x => pct >= x.min);

  document.getElementById('quizProgFill').style.width = '100%';
  document.getElementById('quizBody').innerHTML = `
    <div class="sp-quiz-complete">
      <div class="sp-qc-icon">${m.icon}</div>
      <div class="sp-qc-title">Quiz Complete!</div>
      <div class="sp-qc-score">${pct}%</div>
      <div class="sp-qc-msg">${quizScore} / ${QUIZ_QUESTIONS.length} correct — ${m.msg}</div>
      <div class="sp-qc-btns">
        <button class="sp-btn-primary" onclick="restartQuiz()">Try Again</button>
        <button class="sp-btn-secondary" onclick="scrollToLab()">Review Lab</button>
      </div>
    </div>
  `;

  // Award XP via HarmoniaDB if available
  try {
    if (typeof HarmoniaDB !== 'undefined') {
      const xp = Math.round((quizScore / QUIZ_QUESTIONS.length) * 120);
      HarmoniaDB.addXP(xp, 'Sound Physics Quiz');
    }
  } catch(e) {}
}

function restartQuiz() {
  quizIdx = 0; quizScore = 0;
  renderQuiz();
}

// ─── INIT ────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateWave();
  updateDopplerReadings();
  updateInterference();
  rebuildHarmonic();
  updateString();
  updatePipe();
  setPipeType('open');
  setStringMode(1);
  renderQuiz();
  drawWave();
});
