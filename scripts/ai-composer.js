/**
 * ai-composer.js — Harmonia AI Composer
 * xAI Grok API + Real Web Audio Engine
 */

/* ═══════════════════════════════════════
   API KEY
═══════════════════════════════════════ */
const API_KEY_STORAGE = 'harmonia_xai_key';
function getApiKey() { return localStorage.getItem(API_KEY_STORAGE) || ''; }

function saveApiKey() {
  const inp = document.getElementById('apiKeyInput');
  const key = (inp?.value||'').trim();
  if (!key) { showToast('Please enter your API key','error'); return; }
  if (!key.startsWith('xai-')) { showToast('Key should start with xai-','error'); return; }
  localStorage.setItem(API_KEY_STORAGE, key);
  closeEnvPanel(); updateApiStatus();
  showToast('🔑 Key saved — ready to compose with Grok!','success');
}
function removeApiKey() {
  localStorage.removeItem(API_KEY_STORAGE); updateApiStatus();
  const inp = document.getElementById('apiKeyInput'); if(inp) inp.value='';
  showToast('Key removed — demo mode active','info');
}
function openEnvPanel() {
  document.getElementById('envPanel')?.classList.add('open');
  document.getElementById('envOverlay')?.classList.add('open');
  const inp = document.getElementById('apiKeyInput');
  if (inp) { inp.value=getApiKey(); setTimeout(()=>inp.focus(),150); }
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
  const key = getApiKey();
  ['statusDot','statusDotPanel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.className = 'env-dot ' + (key ? 'env-dot-on' : 'env-dot-off'); }
  });
  const lbl = document.getElementById('statusLabel');
  if (lbl) {
    lbl.textContent = key ? 'Grok AI connected — '+key.slice(0,7)+'••••'+key.slice(-4) : 'No API key — demo mode active';
    lbl.style.color = key ? '#34d399' : '';
  }
  const badge = document.getElementById('navKeyBadge');
  if (badge) { badge.textContent=key?'● Grok':'○ Demo'; badge.style.color=key?'#34d399':'#fbbf24'; }
}

/* ═══════════════════════════════════════
   STATE
═══════════════════════════════════════ */
const CS = {
  genre:'any', mood:'any',
  history: JSON.parse(localStorage.getItem('harmonia_comp_hist')||'[]'),
  stats:   JSON.parse(localStorage.getItem('harmonia_comp_stats')||'{"composed":0,"genres":[],"xp":0,"saved":0}'),
  current:null, generating:false,
  audio:null, synth:null, playing:false,
  playTimer:null, playSec:0, playTotal:120,
};

/* ═══════════════════════════════════════
   WEB AUDIO ENGINE
═══════════════════════════════════════ */
function getAudioCtx() {
  if (!CS.audio || CS.audio.state==='closed')
    CS.audio = new (window.AudioContext||window.webkitAudioContext)();
  if (CS.audio.state==='suspended') CS.audio.resume();
  return CS.audio;
}

function buildScale(keyStr) {
  const noteNames = ['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
  const isMinor = /minor/i.test(keyStr), isDorian = /dorian/i.test(keyStr), isPhryg = /phrygian/i.test(keyStr);
  const flatMap = {'Bb':'A#','Eb':'D#','Ab':'G#','Db':'C#','Gb':'F#','Cb':'B'};
  const raw = (keyStr||'C major').replace(/\s*(major|minor|dorian|phrygian)/i,'').trim();
  const rootName = flatMap[raw]||raw;
  let rootIdx = noteNames.indexOf(rootName); if(rootIdx<0) rootIdx=0;
  const STEPS = { major:[0,2,4,5,7,9,11], minor:[0,2,3,5,7,8,10], dorian:[0,2,3,5,7,9,10], phrygian:[0,1,3,5,7,8,10] };
  const steps = isDorian?STEPS.dorian:isPhryg?STEPS.phrygian:isMinor?STEPS.minor:STEPS.major;
  const freqs = [];
  for (let oct=2; oct<=6; oct++) {
    steps.forEach(s => {
      const midi = (oct+1)*12 + ((rootIdx+s)%12);
      freqs.push({ freq:440*Math.pow(2,(midi-69)/12), oct, step:s });
    });
  }
  return freqs;
}

function getMoodParams(mood) {
  const p = {
    dark:       {ob:-1, tm:0.85, ff:500,  fq:3.5, am:1.8, rm:2.0, rv:0.45, det:10},
    mysterious: {ob:-1, tm:0.9,  ff:700,  fq:4.0, am:1.5, rm:1.8, rv:0.50, det:14},
    melancholic:{ob: 0, tm:0.88, ff:1200, fq:1.5, am:1.4, rm:1.5, rv:0.35, det:5 },
    calm:       {ob: 0, tm:0.92, ff:2000, fq:0.8, am:1.5, rm:1.3, rv:0.30, det:3 },
    romantic:   {ob: 0, tm:0.93, ff:3000, fq:0.7, am:1.2, rm:1.1, rv:0.28, det:4 },
    happy:      {ob: 1, tm:1.05, ff:4500, fq:0.5, am:0.7, rm:0.8, rv:0.15, det:2 },
    energetic:  {ob: 1, tm:1.12, ff:6000, fq:0.4, am:0.4, rm:0.6, rv:0.12, det:2 },
    epic:       {ob: 0, tm:1.0,  ff:3500, fq:1.2, am:0.5, rm:0.9, rv:0.45, det:7 },
    any:        {ob: 0, tm:1.0,  ff:3000, fq:1.0, am:1.0, rm:1.0, rv:0.20, det:3 },
  };
  return p[mood]||p.any;
}

function getGenreConfig(genre) {
  const c = {
    classical:  {drums:false, dstyle:'none',  bstyle:'arco',   mstyle:'lyrical',  cstyle:'arpeggio'},
    jazz:       {drums:true,  dstyle:'brush', bstyle:'walking',mstyle:'swing',    cstyle:'comping' },
    pop:        {drums:true,  dstyle:'pop',   bstyle:'root',   mstyle:'hook',     cstyle:'block'   },
    rock:       {drums:true,  dstyle:'rock',  bstyle:'root',   mstyle:'riff',     cstyle:'power'   },
    electronic: {drums:true,  dstyle:'4on4',  bstyle:'synth',  mstyle:'sequence', cstyle:'stab'    },
    'hip-hop':  {drums:true,  dstyle:'trap',  bstyle:'808',    mstyle:'melodic',  cstyle:'chop'    },
    ambient:    {drums:false, dstyle:'none',  bstyle:'drone',  mstyle:'pad',      cstyle:'pad'     },
    folk:       {drums:false, dstyle:'light', bstyle:'root',   mstyle:'folk',     cstyle:'strum'   },
    'r&b':      {drums:true,  dstyle:'rnb',   bstyle:'groove', mstyle:'soul',     cstyle:'jazz'    },
    cinematic:  {drums:true,  dstyle:'epic',  bstyle:'arco',   mstyle:'soaring',  cstyle:'swell'   },
    'lo-fi':    {drums:true,  dstyle:'lofi',  bstyle:'root',   mstyle:'chill',    cstyle:'jazz'    },
    any:        {drums:false, dstyle:'light', bstyle:'root',   mstyle:'lyrical',  cstyle:'arpeggio'},
  };
  return c[genre]||c.any;
}

/* ── Reverb IR ── */
function makeReverb(ctx, secs, decay) {
  const len = ctx.sampleRate*secs, ir = ctx.createBuffer(2,len,ctx.sampleRate);
  for(let ch=0;ch<2;ch++){const d=ir.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,decay);}
  const c=ctx.createConvolver(); c.buffer=ir; return c;
}

/* ── Safe linear ramp to near-zero (avoids exponential-to-zero crash) ── */
function fadeOut(param, startVal, endTime, ctx) {
  param.setValueAtTime(Math.max(startVal,0.0001), ctx.currentTime);
  param.linearRampToValueAtTime(0.0001, endTime);
}

/* ── Per-instrument note player ── */
function playNote(ctx, dest, freq, t0, dur, type, vol, mp) {
  if (!freq||freq<20||freq>18000||!dur||dur<0.005) return;
  const g = ctx.createGain(); g.connect(dest);
  const atk = Math.max(0.005, 0.02*(mp.am||1));
  const end = t0+dur;

  if (type==='piano') {
    const o1=ctx.createOscillator(); o1.type='triangle'; o1.frequency.value=freq;
    const o2=ctx.createOscillator(); o2.type='sine'; o2.frequency.value=freq*2;
    const o3=ctx.createOscillator(); o3.type='sine'; o3.frequency.value=freq*3;
    const g2=ctx.createGain(); g2.gain.value=0.12;
    const g3=ctx.createGain(); g3.gain.value=0.05;
    o2.connect(g2); o3.connect(g3); g2.connect(g); g3.connect(g); o1.connect(g);
    g.gain.setValueAtTime(0,t0);
    g.gain.linearRampToValueAtTime(vol,t0+atk);
    g.gain.linearRampToValueAtTime(vol*0.6,t0+atk+0.1);
    fadeOut(g.gain,vol*0.6,end,ctx);
    o1.start(t0);o2.start(t0);o3.start(t0);
    o1.stop(end+.1);o2.stop(end+.1);o3.stop(end+.1);

  } else if (type==='strings') {
    const o1=ctx.createOscillator(); o1.type='sawtooth'; o1.frequency.value=freq;
    const o2=ctx.createOscillator(); o2.type='sawtooth'; o2.frequency.value=freq*1.008;
    const o3=ctx.createOscillator(); o3.type='sawtooth'; o3.frequency.value=freq*0.993;
    if(mp.det){o1.detune.value=-mp.det;o3.detune.value=mp.det;}
    const flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=Math.min(mp.ff,freq*5); flt.Q.value=mp.fq;
    const g2=ctx.createGain();g2.gain.value=0.4; const g3=ctx.createGain();g3.gain.value=0.3;
    o2.connect(g2);o3.connect(g3);g2.connect(flt);g3.connect(flt);o1.connect(flt);flt.connect(g);
    const atkT=Math.min(atk*5,dur*0.4);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol*0.7,t0+atkT);
    g.gain.setValueAtTime(vol*0.7,Math.max(t0+atkT+0.01,end-0.15));
    g.gain.linearRampToValueAtTime(0,end+0.05);
    o1.start(t0);o2.start(t0);o3.start(t0); o1.stop(end+.15);o2.stop(end+.15);o3.stop(end+.15);

  } else if (type==='brass') {
    const o1=ctx.createOscillator();o1.type='sawtooth';o1.frequency.value=freq;
    const o2=ctx.createOscillator();o2.type='square';o2.frequency.value=freq*1.003;
    const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=freq*2;flt.Q.value=2;
    flt.frequency.linearRampToValueAtTime(freq*6,t0+0.08);
    const g2=ctx.createGain();g2.gain.value=0.3; o2.connect(g2);g2.connect(flt);o1.connect(flt);flt.connect(g);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol*0.9,t0+0.04);
    g.gain.setValueAtTime(vol*0.75,Math.max(t0+0.05,end-0.06));
    fadeOut(g.gain,vol*0.75,end+0.06,ctx);
    o1.start(t0);o2.start(t0); o1.stop(end+.12);o2.stop(end+.12);

  } else if (type==='guitar') {
    const bufLen=Math.max(2,Math.ceil(ctx.sampleRate/freq));
    const buf=ctx.createBuffer(1,bufLen,ctx.sampleRate);
    const d=buf.getChannelData(0); for(let i=0;i<bufLen;i++) d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource(); src.buffer=buf; src.loop=true;
    const flt=ctx.createBiquadFilter(); flt.type='lowpass'; flt.frequency.value=freq*4;
    src.connect(flt); flt.connect(g);
    const dec=Math.min(dur*1.1,2.2);
    g.gain.setValueAtTime(vol,t0); fadeOut(g.gain,vol,t0+dec,ctx);
    src.start(t0); src.stop(t0+dec+0.05);

  } else if (type==='bass') {
    const o1=ctx.createOscillator();o1.type='sine';o1.frequency.value=freq;
    const o2=ctx.createOscillator();o2.type='triangle';o2.frequency.value=freq*2;
    const flt=ctx.createBiquadFilter();flt.type='lowpass';flt.frequency.value=freq*5;flt.Q.value=0.8;
    const g2=ctx.createGain();g2.gain.value=0.2; o2.connect(g2);g2.connect(flt);o1.connect(flt);flt.connect(g);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol*0.9,t0+0.012);
    g.gain.setValueAtTime(vol*0.85,Math.max(t0+0.013,end-0.08));
    fadeOut(g.gain,vol*0.85,end,ctx);
    o1.start(t0);o2.start(t0); o1.stop(end+.08);o2.stop(end+.08);

  } else if (type==='synth') {
    const o1=ctx.createOscillator();o1.type='sawtooth';o1.frequency.value=freq;
    const o2=ctx.createOscillator();o2.type='square';o2.frequency.value=freq*0.5;
    if(mp.det) o1.detune.value=mp.det*0.5;
    const flt=ctx.createBiquadFilter();flt.type='lowpass';flt.Q.value=mp.fq*2;
    flt.frequency.setValueAtTime(150,t0); flt.frequency.linearRampToValueAtTime(Math.min(mp.ff*1.5,9000),t0+0.12);
    const g2=ctx.createGain();g2.gain.value=0.22; o2.connect(g2);g2.connect(flt);o1.connect(flt);flt.connect(g);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+atk);
    fadeOut(g.gain,vol,end,ctx);
    o1.start(t0);o2.start(t0); o1.stop(end+.08);o2.stop(end+.08);

  } else if (type==='flute') {
    const o1=ctx.createOscillator();o1.type='sine';o1.frequency.value=freq;
    const o2=ctx.createOscillator();o2.type='sine';o2.frequency.value=freq*2;
    const bLen=Math.ceil(ctx.sampleRate*0.02);
    const nBuf=ctx.createBuffer(1,bLen,ctx.sampleRate);
    const nd=nBuf.getChannelData(0); for(let i=0;i<bLen;i++) nd[i]=Math.random()*2-1;
    const nSrc=ctx.createBufferSource();nSrc.buffer=nBuf;nSrc.loop=true;
    const nFlt=ctx.createBiquadFilter();nFlt.type='bandpass';nFlt.frequency.value=freq;nFlt.Q.value=50;
    const nG=ctx.createGain();nG.gain.value=0.035;
    nSrc.connect(nFlt);nFlt.connect(nG);nG.connect(g);
    const g2=ctx.createGain();g2.gain.value=0.12; o2.connect(g2);g2.connect(g);o1.connect(g);
    const atkT=Math.min(atk*2,dur*0.3);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol*0.8,t0+atkT);
    g.gain.setValueAtTime(vol*0.75,Math.max(t0+atkT+0.01,end-0.08));
    g.gain.linearRampToValueAtTime(0,end+0.05);
    o1.start(t0);o2.start(t0);nSrc.start(t0); o1.stop(end+.1);o2.stop(end+.1);nSrc.stop(end+.1);

  } else if (type==='saxophone') {
    const o1=ctx.createOscillator();o1.type='sawtooth';o1.frequency.value=freq;
    const o2=ctx.createOscillator();o2.type='sawtooth';o2.frequency.value=freq*1.004;
    const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=freq*1.5;flt.Q.value=1.5;
    const g2=ctx.createGain();g2.gain.value=0.5; o2.connect(g2);g2.connect(flt);o1.connect(flt);flt.connect(g);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol*0.85,t0+0.028);
    g.gain.setValueAtTime(vol*0.7,Math.max(t0+0.03,end-0.08));
    fadeOut(g.gain,vol*0.7,end+0.06,ctx);
    o1.start(t0);o2.start(t0); o1.stop(end+.12);o2.stop(end+.12);

  } else if (type==='pad'||type==='ambient') {
    const fqs=[freq,freq*1.004,freq*0.997,freq*1.5,freq*2];
    fqs.forEach((f,i)=>{
      const o=ctx.createOscillator();o.type='sine';o.frequency.value=f;
      if(mp.det) o.detune.value=(i%2===0?1:-1)*mp.det*0.3;
      const og=ctx.createGain();og.gain.value=vol/fqs.length;
      o.connect(og);og.connect(g); o.start(t0);o.stop(end+1.8);
    });
    const atkT=Math.min(atk*10,dur*0.5), relT=Math.min(0.8,dur*0.4);
    g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol*0.5,t0+atkT);
    g.gain.setValueAtTime(vol*0.5,Math.max(t0+atkT+0.01,end-relT));
    g.gain.linearRampToValueAtTime(0,end+1.2);

  } else {
    const o=ctx.createOscillator();o.type='triangle';o.frequency.value=freq;
    o.connect(g); g.gain.setValueAtTime(vol,t0); fadeOut(g.gain,vol,end,ctx);
    o.start(t0);o.stop(end+.05);
  }
}

/* ── Drum engine ── */
function playDrum(ctx, dest, type, t, style, vol) {
  const g=ctx.createGain(); g.connect(dest);
  if (type==='kick') {
    const o=ctx.createOscillator();o.type='sine';
    const heavy=['rock','4on4','epic','trap'].includes(style);
    o.frequency.setValueAtTime(heavy?190:110,t); o.frequency.exponentialRampToValueAtTime(28,t+(heavy?.14:.09));
    g.gain.setValueAtTime(vol*(heavy?1.3:1.0),t); fadeOut(g.gain,vol,t+0.5,ctx);
    o.connect(g);o.start(t);o.stop(t+0.55);
  } else if (type==='snare') {
    const o=ctx.createOscillator();o.type='triangle';o.frequency.value=210;
    const og=ctx.createGain();og.gain.value=style==='brush'?0.07:0.18;
    o.connect(og);og.connect(g);o.start(t);o.stop(t+0.16);
    const bSz=Math.ceil(ctx.sampleRate*0.22);
    const buf=ctx.createBuffer(1,bSz,ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<bSz;i++)d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource();src.buffer=buf;
    const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=3200;flt.Q.value=0.7;
    src.connect(flt);flt.connect(g);
    g.gain.setValueAtTime(vol*(style==='brush'?0.22:0.52),t); fadeOut(g.gain,vol*0.5,t+0.26,ctx);
    src.start(t);src.stop(t+0.28);
  } else if (type==='hihat') {
    const bSz=Math.ceil(ctx.sampleRate*0.06);
    const buf=ctx.createBuffer(1,bSz,ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<bSz;i++)d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource();src.buffer=buf;
    const flt=ctx.createBiquadFilter();flt.type='highpass';flt.frequency.value=8000;
    src.connect(flt);flt.connect(g);
    g.gain.setValueAtTime(vol*0.26,t); fadeOut(g.gain,vol*0.26,t+0.07,ctx);
    src.start(t);src.stop(t+0.09);
  } else if (type==='openhat') {
    const bSz=Math.ceil(ctx.sampleRate*0.42);
    const buf=ctx.createBuffer(1,bSz,ctx.sampleRate);
    const d=buf.getChannelData(0);for(let i=0;i<bSz;i++)d[i]=Math.random()*2-1;
    const src=ctx.createBufferSource();src.buffer=buf;
    const flt=ctx.createBiquadFilter();flt.type='highpass';flt.frequency.value=7000;
    src.connect(flt);flt.connect(g);
    g.gain.setValueAtTime(vol*0.28,t); fadeOut(g.gain,vol*0.28,t+0.4,ctx);
    src.start(t);src.stop(t+0.44);
  } else if (type==='clap') {
    for(let i=0;i<3;i++){
      const bSz=Math.ceil(ctx.sampleRate*0.018);
      const buf=ctx.createBuffer(1,bSz,ctx.sampleRate);
      const d=buf.getChannelData(0);for(let j=0;j<bSz;j++)d[j]=Math.random()*2-1;
      const src=ctx.createBufferSource();src.buffer=buf;
      const flt=ctx.createBiquadFilter();flt.type='bandpass';flt.frequency.value=1400;flt.Q.value=0.8;
      const cg=ctx.createGain();cg.gain.value=vol*0.38; src.connect(flt);flt.connect(cg);cg.connect(dest);
      src.start(t+i*0.011);src.stop(t+i*0.011+0.022);
    }
  } else if (type==='tom') {
    const o=ctx.createOscillator();o.type='sine';
    o.frequency.setValueAtTime(130,t);o.frequency.exponentialRampToValueAtTime(50,t+0.18);
    g.gain.setValueAtTime(vol*0.7,t);fadeOut(g.gain,vol*0.7,t+0.32,ctx);
    o.connect(g);o.start(t);o.stop(t+0.36);
  }
}

/* ── Drum patterns ── */
function getDrumPattern(style, bl) {
  const P = {
    '4on4': [{t:'kick',s:0},{t:'hihat',s:.5},{t:'kick',s:1},{t:'hihat',s:1.5},{t:'kick',s:2},{t:'hihat',s:2.5},{t:'kick',s:3},{t:'hihat',s:3.5}],
    rock:   [{t:'kick',s:0},{t:'hihat',s:.5},{t:'snare',s:1},{t:'hihat',s:1.5},{t:'kick',s:2},{t:'kick',s:2.5},{t:'snare',s:3},{t:'hihat',s:3.5}],
    pop:    [{t:'kick',s:0},{t:'hihat',s:.5},{t:'snare',s:1},{t:'hihat',s:1.5},{t:'kick',s:2},{t:'hihat',s:2.5},{t:'snare',s:3},{t:'openhat',s:3.5}],
    trap:   [{t:'kick',s:0},{t:'hihat',s:.25},{t:'hihat',s:.5},{t:'hihat',s:.75},{t:'snare',s:1},{t:'hihat',s:1.25},{t:'hihat',s:1.75},{t:'kick',s:2.5},{t:'clap',s:3},{t:'hihat',s:3.25},{t:'hihat',s:3.75}],
    brush:  [{t:'kick',s:0},{t:'hihat',s:.75},{t:'snare',s:1},{t:'hihat',s:1.5},{t:'kick',s:2.25},{t:'hihat',s:2.75},{t:'snare',s:3},{t:'hihat',s:3.5}],
    rnb:    [{t:'kick',s:0},{t:'hihat',s:.5},{t:'snare',s:1},{t:'hihat',s:1.25},{t:'kick',s:1.75},{t:'kick',s:2.25},{t:'snare',s:3},{t:'clap',s:3.5}],
    lofi:   [{t:'kick',s:0},{t:'hihat',s:.5},{t:'snare',s:1.1},{t:'hihat',s:1.5},{t:'kick',s:2.1},{t:'hihat',s:2.5},{t:'snare',s:3},{t:'hihat',s:3.7}],
    epic:   [{t:'kick',s:0},{t:'tom',s:1},{t:'snare',s:1.5},{t:'kick',s:2},{t:'kick',s:2.5},{t:'tom',s:3},{t:'snare',s:3.5},{t:'kick',s:3.75}],
    light:  [{t:'kick',s:0},{t:'hihat',s:1},{t:'snare',s:2},{t:'hihat',s:3}],
  };
  const pat = P[style]||P.light;
  return pat.map(h=>({type:h.t, time:h.s*bl}));
}

/* ── Melody builder ── */
function buildMelody(scale, chords, tempo, mstyle, mp) {
  const bl = (60/tempo)/mp.tm;
  const notes = [];
  const ob = mp.ob||0;
  const targetOcts = ob<0?[2,3,4]:ob>0?[4,5]:[3,4,5];
  const pool = scale.filter(n=>targetOcts.includes(n.oct));
  if (!pool.length) return notes;

  chords.forEach((chord,ci)=>{
    const beats = chord.beats||4;
    const barDur = beats*bl;
    const p = pool;
    const pLen = p.length;

    if (mstyle==='lyrical'||mstyle==='soaring'||mstyle==='folk') {
      const hl = barDur/2;
      notes.push({freq:p[ci%pLen].freq, dur:hl*0.9, gap:hl});
      notes.push({freq:p[(ci+1)%pLen].freq, dur:hl*0.9, gap:hl});
    } else if (mstyle==='arpeggio'||mstyle==='sequence') {
      const sl=barDur/4;
      for(let i=0;i<4;i++) notes.push({freq:p[(ci*4+i)%pLen].freq, dur:sl*0.82, gap:sl});
    } else if (mstyle==='swing') {
      const s1=barDur*.62, s2=barDur*.38;
      notes.push({freq:p[ci%pLen].freq,   dur:s1*.88, gap:s1});
      notes.push({freq:p[(ci+2)%pLen].freq, dur:s2*.88, gap:s2});
    } else if (mstyle==='hook') {
      const sl=barDur/4;
      [0,2,1,3].forEach(o=>notes.push({freq:p[(ci+o)%pLen].freq, dur:sl*.88, gap:sl}));
    } else if (mstyle==='riff') {
      const sl=barDur/8;
      [0,0,2,0,3,2,0,-1].forEach(o=>notes.push({freq:p[Math.abs((ci+o+pLen)%pLen)].freq, dur:sl*.75, gap:sl}));
    } else if (mstyle==='pad'||mstyle==='drone') {
      notes.push({freq:p[ci%pLen].freq, dur:barDur*.95, gap:barDur});
    } else if (mstyle==='chill') {
      const sl=barDur/3;
      for(let i=0;i<3;i++) notes.push({freq:p[(ci*3+i)%pLen].freq, dur:sl*.85, gap:sl});
    } else if (mstyle==='soul'||mstyle==='melodic') {
      const ql=barDur/4;
      notes.push({freq:p[ci%pLen].freq,     dur:ql*.9, gap:ql});
      notes.push({freq:p[(ci+1)%pLen].freq, dur:ql*.9, gap:ql});
      notes.push({freq:0, dur:0, gap:ql}); // rest
      notes.push({freq:p[(ci+2)%pLen].freq, dur:ql*.9, gap:ql});
    } else {
      const sl=barDur/4;
      for(let i=0;i<4;i++) notes.push({freq:p[(ci*4+i)%pLen].freq, dur:sl*.82, gap:sl});
    }
  });
  return notes;
}

/* ── MAIN PLAYBACK ── */
function startAudioPlayback() {
  if (!CS.current) return;
  stopAudioPlayback();

  const ctx     = getAudioCtx();
  const comp    = CS.current.composition;
  const S       = CS.current.settings;
  const mp      = getMoodParams(S.mood);
  const gc      = getGenreConfig(S.genre);
  const tempo   = parseInt(S.tempo)||120;
  const beatLen = (60/tempo)/mp.tm;
  const instrs  = S.instruments.length ? S.instruments : ['piano'];
  const volBase = Math.max(0.1, (document.getElementById('volSlider')?.value||80)/100);

  // Master chain
  const masterGain = ctx.createGain(); masterGain.gain.value = volBase*0.72;
  const comp2 = ctx.createDynamicsCompressor();
  comp2.threshold.value=-16; comp2.knee.value=8; comp2.ratio.value=4;
  comp2.attack.value=0.003; comp2.release.value=0.25;
  const reverb = makeReverb(ctx, 2.5, 3);
  const dryG   = ctx.createGain(); dryG.gain.value=1-mp.rv*0.55;
  const wetG   = ctx.createGain(); wetG.gain.value=mp.rv*0.55;
  masterGain.connect(comp2);
  comp2.connect(dryG); dryG.connect(ctx.destination);
  comp2.connect(reverb); reverb.connect(wetG); wetG.connect(ctx.destination);

  const scale  = buildScale(S.key==='any'?'C major':S.key);
  const chords = comp.chords?.progression||[];
  if (!chords.length) {
    // generate default 8-chord progression if missing
    ['i','iv','V7','i','VI','VII','V7','i'].forEach(r=>chords.push({chord:'Am',type:'minor',roman:r,beats:4,description:''}));
  }
  const now = ctx.currentTime + 0.1;

  /* ── Schedule each selected instrument ── */
  instrs.forEach(instr=>{
    if (instr==='drums') return;

    let itype=instr, vmult=0.55, octShift=0, mstyle=gc.mstyle;

    switch(instr){
      case 'piano':      itype='piano';      vmult=0.55; mstyle=gc.mstyle;    break;
      case 'guitar':     itype='guitar';     vmult=0.50; mstyle=gc.mstyle;    break;
      case 'bass':       itype='bass';       vmult=0.70; octShift=-2; mstyle=gc.bstyle; break;
      case 'strings':    itype='strings';    vmult=0.48; mstyle='lyrical';     break;
      case 'brass':      itype='brass';      vmult=0.44; mstyle=gc.mstyle;    break;
      case 'synth':      itype='synth';      vmult=0.52; mstyle=gc.mstyle;    break;
      case 'flute':      itype='flute';      vmult=0.42; octShift=1; mstyle='lyrical'; break;
      case 'saxophone':  itype='saxophone';  vmult=0.50; mstyle=gc.mstyle;    break;
      case 'vocals':     itype='flute';      vmult=0.32; octShift=1; mstyle='soul';    break;
    }

    const totalOctShift = octShift + (mp.ob||0);
    const shifted = scale.map(n=>({
      ...n,
      freq: n.freq * Math.pow(2, totalOctShift),
      oct:  n.oct  + totalOctShift,
    })).filter(n=>n.freq>=28&&n.freq<=16000);

    const isPad = (gc.cstyle==='pad'||gc.cstyle==='swell') && ['strings','brass','pad','ambient'].includes(itype);

    if (isPad) {
      let cur=now;
      chords.forEach((ch,ci)=>{
        const dur=(ch.beats||4)*beatLen;
        [0,2,4].forEach(offset=>{
          const n=shifted[(ci+offset)%shifted.length];
          if(n) playNote(ctx,masterGain,n.freq,cur,dur*0.94,itype,vmult*0.4,mp);
        });
        cur+=dur;
      });
    } else {
      const melody = buildMelody(shifted, chords, tempo, mstyle, mp);
      let cur=now;
      melody.forEach(note=>{
        if(note.freq>0) playNote(ctx,masterGain,note.freq,cur,note.dur,itype,vmult,mp);
        cur+=note.gap;
      });
    }
  });

  /* ── Drums ── */
  const hasDrums = instrs.includes('drums') || gc.drums;
  if (hasDrums) {
    const totalBeats = chords.reduce((a,c)=>a+(c.beats||4),0)||32;
    const totalDur   = totalBeats*beatLen;
    const barLen     = beatLen*4;
    const pattern    = getDrumPattern(gc.dstyle, beatLen);
    const bars       = Math.ceil(totalDur/barLen)+1;
    for(let bar=0;bar<bars;bar++){
      pattern.forEach(hit=>{
        const t=now+bar*barLen+hit.time;
        if(t<now+totalDur+0.2) playDrum(ctx,masterGain,hit.type,t,gc.dstyle,volBase*0.58);
      });
    }
  }

  /* ── Duration & UI ── */
  const totalBeats = chords.reduce((a,c)=>a+(c.beats||4),0)||32;
  CS.playTotal = Math.max(8, Math.round(totalBeats*beatLen));
  CS.playSec   = 0;
  CS.synth     = {ctx, masterGain};
  CS.playing   = true;

  document.getElementById('playIcon').style.display  ='none';
  document.getElementById('pauseIcon').style.display ='block';
  document.getElementById('playbackTitle').textContent=`Playing "${comp.title}"`;
  updatePlaybackUI();

  CS.playTimer = setInterval(()=>{
    CS.playSec++;
    updatePlaybackUI();
    if(CS.playSec>=CS.playTotal) stopAudioPlayback();
  },1000);
}

function stopAudioPlayback() {
  clearInterval(CS.playTimer); CS.playTimer=null;
  if(CS.synth?.masterGain && CS.audio){
    try{ CS.synth.masterGain.gain.setValueAtTime(0,CS.audio.currentTime+0.05); }catch(e){}
  }
  CS.synth=null; CS.playing=false; CS.playSec=0;
  document.getElementById('playIcon').style.display  ='block';
  document.getElementById('pauseIcon').style.display ='none';
  updatePlaybackUI();
}
function pauseAudioPlayback() {
  clearInterval(CS.playTimer); CS.playTimer=null;
  CS.audio?.suspend(); CS.playing=false;
  document.getElementById('playIcon').style.display  ='block';
  document.getElementById('pauseIcon').style.display ='none';
}
function resumeAudioPlayback() {
  CS.audio?.resume(); CS.playing=true;
  document.getElementById('playIcon').style.display  ='none';
  document.getElementById('pauseIcon').style.display ='block';
  CS.playTimer=setInterval(()=>{ CS.playSec++; updatePlaybackUI(); if(CS.playSec>=CS.playTotal) stopAudioPlayback(); },1000);
}
function togglePlayback() {
  if(!CS.current){ showToast('Generate a composition first!','error'); return; }
  if(CS.playing) pauseAudioPlayback();
  else if(CS.audio?.state==='suspended') resumeAudioPlayback();
  else startAudioPlayback();
}
function updatePlaybackUI() {
  const pct=CS.playTotal>0?Math.min((CS.playSec/CS.playTotal)*100,100):0;
  document.getElementById('playbackProgress').style.width=pct+'%';
  document.getElementById('playbackTime').textContent=formatTime(CS.playSec)+' / '+formatTime(CS.playTotal);
}

/* ═══════════════════════════════════════
   INIT
═══════════════════════════════════════ */
document.addEventListener('DOMContentLoaded',()=>{
  initWaveCanvas(); initGenreGrid(); initMoodGrid(); initPromptCounter();
  renderHistory(); renderStats(); initPlaybackScrub(); updateApiStatus();
  document.getElementById('volSlider')?.addEventListener('input',function(){
    if(CS.synth?.masterGain&&CS.audio) CS.synth.masterGain.gain.setTargetAtTime((this.value/100)*0.72,CS.audio.currentTime,0.05);
  });
  document.getElementById('apiKeyInput')?.addEventListener('keydown',e=>{ if(e.key==='Enter') saveApiKey(); });
  document.getElementById('envOverlay')?.addEventListener('click',closeEnvPanel);
});

/* ═══════════════════════════════════════
   WAVE CANVAS
═══════════════════════════════════════ */
function initWaveCanvas() {
  const canvas=document.getElementById('waveCanvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d'); let w,h;
  function resize(){w=canvas.width=canvas.offsetWidth;h=canvas.height=canvas.offsetHeight;}
  resize(); window.addEventListener('resize',resize);
  let offset=0;
  function draw(){
    ctx.clearRect(0,0,w,h);
    [['167,139,250',.6],['236,72,153',.45],['56,189,248',.3]].forEach(([c,a],i)=>{
      ctx.beginPath();
      const amp=12-i*3,freq=0.008+i*.003,spd=0.03-i*.008;
      ctx.strokeStyle=`rgba(${c},${a})`;ctx.lineWidth=2-i*.4;
      for(let x=0;x<w;x++){
        const y=h/2+Math.sin(x*freq+offset*spd+i*1.2)*amp+Math.sin(x*freq*.5+offset*spd*.7+i)*amp*.5;
        x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
      }
      ctx.stroke();
    });
    offset++; requestAnimationFrame(draw);
  }
  draw();
}

/* ═══════════════════════════════════════
   CONTROLS
═══════════════════════════════════════ */
function initGenreGrid(){
  document.querySelectorAll('.ac-genre-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.ac-genre-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); CS.genre=btn.dataset.genre;
  }));
}
function initMoodGrid(){
  document.querySelectorAll('.ac-mood-btn').forEach(btn=>btn.addEventListener('click',()=>{
    document.querySelectorAll('.ac-mood-btn').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active'); CS.mood=btn.dataset.mood;
  }));
}
function initPromptCounter(){
  const ta=document.getElementById('promptTextarea'),cc=document.getElementById('charCount');
  if(!ta||!cc) return;
  ta.addEventListener('input',()=>{ cc.textContent=ta.value.length; cc.style.color=ta.value.length>720?'#ef4444':''; });
}
function initPlaybackScrub(){
  document.querySelector('.ac-playback-progress-wrap')?.addEventListener('click',e=>{
    if(!CS.current) return;
    const rect=e.currentTarget.getBoundingClientRect();
    CS.playSec=Math.round(((e.clientX-rect.left)/rect.width)*CS.playTotal);
    updatePlaybackUI();
  });
}
function injectPrompt(text){
  const ta=document.getElementById('promptTextarea');
  if(!ta) return; ta.value=text; ta.dispatchEvent(new Event('input')); ta.focus();
}
function clearPrompt(){
  const ta=document.getElementById('promptTextarea');
  if(ta){ta.value='';ta.dispatchEvent(new Event('input'));ta.focus();}
}
const SHUFFLE_PROMPTS=[
  "A minimalist piano nocturne with deep resonant left-hand chords and a delicate right-hand melody, reminiscent of Satie",
  "A high-energy punk rock anthem with distorted guitars, pounding drums and shouted vocals",
  "A dreamy shoegaze track with washed-out reverb guitars, hushed vocals and a hypnotic drum pattern",
  "A Brazilian bossa nova with fingerpicked guitar, soft brushed drums, and a breezy saxophone melody",
  "A tender lullaby in C major with music box melody and soft string pads",
  "A neo-soul groove in F# minor with Rhodes piano, slap bass and trap hi-hats",
  "A haunting Celtic ballad in D dorian with fiddle, tin whistle and bodhran",
  "A 1970s funk track with wah-wah guitar, tight horns and a James Brown style breakdown",
  "A minimalist techno track at 132 BPM with driving kick, sweeping filter cutoffs and industrial textures",
  "A cinematic trailer cue building from solo cello to full orchestra over 90 seconds",
  "A dark tango in D minor with bandoneon and dramatic piano",
  "A peaceful Japanese koto piece with pentatonic scales and temple bell accents",
];
function shufflePrompt(){ injectPrompt(SHUFFLE_PROMPTS[Math.floor(Math.random()*SHUFFLE_PROMPTS.length)]); }

/* ═══════════════════════════════════════
   PRESETS
═══════════════════════════════════════ */
const PRESETS={
  beethoven:{genre:'classical',mood:'epic',      key:'C minor',  time:'4/4',tempo:132,instruments:['piano','strings','brass'],        prompt:'A dramatic classical piano sonata in C minor in the style of Beethoven, with a powerful opening motif and a stormy finale'},
  miles:    {genre:'jazz',     mood:'mysterious', key:'D minor',  time:'4/4',tempo:88, instruments:['piano','bass','saxophone','drums'],prompt:'A cool modal jazz composition in D dorian inspired by Miles Davis Kind of Blue with long space-filled melodic lines'},
  lofi:     {genre:'lo-fi',    mood:'calm',       key:'G major',  time:'4/4',tempo:80, instruments:['piano','bass','drums'],            prompt:'A chill lo-fi hip hop beat with dusty vinyl texture, gentle jazz piano chords and a warm bass line for studying'},
  hans:     {genre:'cinematic',mood:'epic',       key:'D minor',  time:'4/4',tempo:90, instruments:['strings','brass','piano','drums'], prompt:'A massive cinematic orchestral score starting with a single piano motif building to a full orchestral climax with pounding percussion'},
  debussy:  {genre:'classical',mood:'mysterious', key:'Eb major', time:'4/4',tempo:72, instruments:['piano','flute','strings'],          prompt:'An impressionist piano piece inspired by Debussy using whole tone scales, shimmering arpeggios and dreamlike harmonies'},
  edm:      {genre:'electronic',mood:'energetic', key:'F minor',  time:'4/4',tempo:128,instruments:['synth','bass','drums'],            prompt:'A festival-ready progressive house EDM track at 128 BPM with massive synth chords and a euphoric melody drop'},
};
function loadPreset(id){
  const p=PRESETS[id];if(!p) return;
  document.querySelectorAll('.ac-genre-btn').forEach(b=>b.classList.toggle('active',b.dataset.genre===p.genre)); CS.genre=p.genre;
  document.querySelectorAll('.ac-mood-btn').forEach(b=>b.classList.toggle('active',b.dataset.mood===p.mood));   CS.mood=p.mood;
  const ks=document.getElementById('keySelect');    if(ks)  ks.value=p.key;
  const ts=document.getElementById('timeSelect');   if(ts)  ts.value=p.time;
  const te=document.getElementById('tempoSlider');  if(te)  te.value=p.tempo;
  const tv=document.getElementById('tempoVal');     if(tv)  tv.textContent=p.tempo;
  document.querySelectorAll('.ac-instr-check input').forEach(cb=>{cb.checked=p.instruments.includes(cb.value);});
  injectPrompt(p.prompt);
  showToast('✨ Preset: '+id.charAt(0).toUpperCase()+id.slice(1),'info');
}

/* ═══════════════════════════════════════
   SETTINGS
═══════════════════════════════════════ */
function getSettings(){
  return {
    genre:       CS.genre,
    mood:        CS.mood,
    key:         document.getElementById('keySelect')?.value  ||'any',
    time:        document.getElementById('timeSelect')?.value ||'4/4',
    tempo:       document.getElementById('tempoSlider')?.value||'120',
    instruments: [...document.querySelectorAll('.ac-instr-check input:checked')].map(cb=>cb.value),
    format:      document.querySelector('input[name="format"]:checked')?.value||'full',
    prompt:      document.getElementById('promptTextarea')?.value?.trim()||'',
  };
}

/* ═══════════════════════════════════════
   AI PROMPTS
═══════════════════════════════════════ */
function buildSystemPrompt(){
  return `You are Harmonia's AI Composer — expert in music theory, harmony, orchestration and all genres.

CRITICAL: Respond ONLY with a single valid JSON object. No markdown, no code fences, no text before or after.

{
  "title": "Creative title",
  "subtitle": "Brief subtitle",
  "tags": ["genre","mood","key"],
  "composition": {
    "overview": "2-3 sentence description",
    "structure": [
      {"section":"Intro","bars":"1-8","description":"What happens"},
      {"section":"A Section","bars":"9-24","description":"Primary theme"},
      {"section":"B Section","bars":"25-40","description":"Contrast"},
      {"section":"Climax","bars":"41-56","description":"Peak"},
      {"section":"Outro","bars":"57-64","description":"Resolution"}
    ],
    "notation": "Bar 1: A4 C5 E5 A5 | G5 F5 E5 D5 |\\nBar 2: C5 B4 A4 G4 |",
    "fullDescription": "Rich detailed paragraph"
  },
  "chords": {
    "progression": [
      {"chord":"Am","type":"minor","roman":"i","beats":4,"description":"Tonic"},
      {"chord":"Dm","type":"minor","roman":"iv","beats":4,"description":"Subdominant"},
      {"chord":"E7","type":"dominant 7th","roman":"V7","beats":4,"description":"Dominant"},
      {"chord":"Am","type":"minor","roman":"i","beats":4,"description":"Resolution"},
      {"chord":"F","type":"major","roman":"VI","beats":2,"description":"Colour"},
      {"chord":"G","type":"major","roman":"VII","beats":2,"description":"Subtonic"},
      {"chord":"E7","type":"dominant 7th","roman":"V7","beats":4,"description":"Cadence"},
      {"chord":"Am","type":"minor","roman":"i","beats":4,"description":"Final"}
    ],
    "analysis": "Harmonic analysis paragraph",
    "voicings": "Voicing suggestions"
  },
  "theory": {
    "keyAndScale": "Key and scale explanation",
    "harmony": "Harmonic language",
    "rhythm": "Rhythmic analysis",
    "form": "Musical form",
    "influences": "Style and influences",
    "learningPoints": ["Point 1","Point 2","Point 3","Point 4","Point 5"]
  },
  "performance": {
    "tempoAndFeel": "Tempo and feel",
    "instrumentGuides": [{"instrument":"Piano","role":"role","technique":"technique","tips":"tips"}],
    "dynamicsAndExpression": "Dynamics",
    "practiceSteps": ["Step 1","Step 2","Step 3","Step 4"],
    "commonMistakes": ["Mistake 1","Mistake 2"]
  }
}`;
}
function buildUserPrompt(s){
  return `Compose a complete musical piece:
DESCRIPTION: ${s.prompt||'Create an original expressive composition from the settings'}
GENRE: ${s.genre==='any'?'Your choice':s.genre}
MOOD: ${s.mood==='any'?'Your choice':s.mood}
KEY: ${s.key==='any'?'Choose appropriate key':s.key}
TIME: ${s.time}   TEMPO: ${s.tempo} BPM
INSTRUMENTS: ${s.instruments.length?s.instruments.join(', '):'Choose appropriate'}
FORMAT: ${s.format==='full'?'Full composition':s.format==='chord'?'Chord focus':s.format==='melody'?'Melody focus':'Lead sheet'}
Make it musically specific, use real theory terminology, be genuinely inspiring.`;
}

/* ═══════════════════════════════════════
   LOADING
═══════════════════════════════════════ */
let _lt=null;
function startLoadingAnim(){
  ['lstep1','lstep2','lstep3','lstep4'].forEach(id=>document.getElementById(id)?.classList.remove('active','done'));
  document.getElementById('lstep1')?.classList.add('active');
  let cur=0;
  const H=['Composing your masterpiece…','Crafting harmonic structure…','Writing melodic lines…','Finalizing the score…'];
  const S=['Analyzing musical intent','Building chord progressions','Developing motifs','Adding dynamics'];
  _lt=setInterval(()=>{
    if(cur<3){
      document.getElementById(`lstep${cur+1}`)?.classList.replace('active','done');
      cur++;
      document.getElementById(`lstep${cur+1}`)?.classList.add('active');
      const h=document.getElementById('loadingHeadline');if(h)h.textContent=H[cur];
      const s=document.getElementById('loadingSubtext');if(s)s.textContent=S[cur];
    }
  },1800);
}
function stopLoadingAnim(){ clearInterval(_lt);_lt=null; ['lstep1','lstep2','lstep3','lstep4'].forEach(id=>{document.getElementById(id)?.classList.remove('active');document.getElementById(id)?.classList.add('done');}); }
function showEmpty()  {document.getElementById('emptyState')?.classList.remove('hidden');document.getElementById('loadingState')?.classList.add('hidden');document.getElementById('resultState')?.classList.add('hidden');}
function showLoading(){document.getElementById('emptyState')?.classList.add('hidden');document.getElementById('loadingState')?.classList.remove('hidden');document.getElementById('resultState')?.classList.add('hidden');}
function showResult() {document.getElementById('emptyState')?.classList.add('hidden');document.getElementById('loadingState')?.classList.add('hidden');document.getElementById('resultState')?.classList.remove('hidden');}

/* ═══════════════════════════════════════
   GENERATE
═══════════════════════════════════════ */
async function generateComposition(){
  if(CS.generating) return;
  stopAudioPlayback();
  const settings=getSettings();
  if(!settings.prompt&&settings.genre==='any'&&settings.mood==='any'){
    showToast('Describe your music or pick a genre/mood!','error');
    document.getElementById('promptTextarea')?.focus(); return;
  }
  CS.generating=true;
  const btn=document.getElementById('generateBtn');
  const icon=document.getElementById('generateIcon');
  const text=document.getElementById('generateText');
  if(btn)btn.disabled=true; if(icon)icon.classList.add('spinning'); if(text)text.textContent='Composing…';
  showLoading(); startLoadingAnim();

  const apiKey=getApiKey();
  let composition=null, usedAI=false;

  if(apiKey){
    try{
      const resp=await fetch('https://api.x.ai/v1/chat/completions',{
        method:'POST',
        headers:{'Content-Type':'application/json','Authorization':`Bearer ${apiKey}`},
        body:JSON.stringify({model:'grok-3',max_tokens:4000,messages:[
          {role:'system',content:buildSystemPrompt()},
          {role:'user',  content:buildUserPrompt(settings)},
        ]}),
      });
      if(resp.status===401||resp.status===403){
        localStorage.removeItem(API_KEY_STORAGE); updateApiStatus();
        showToast('❌ API key rejected — please re-enter in Settings','error');
      } else if(resp.ok){
        const data=await resp.json();
        const raw=data.choices?.[0]?.message?.content||'';
        const s=raw.indexOf('{'),e=raw.lastIndexOf('}');
        if(s>=0&&e>s){ composition=JSON.parse(raw.slice(s,e+1)); usedAI=true; }
      } else { console.warn('xAI error',resp.status); }
    }catch(err){ console.warn('xAI fetch failed:',err.message); }
  }

  if(!composition) composition=buildFallback(settings);

  stopLoadingAnim();
  CS.current={composition,settings,timestamp:Date.now(),usedAI};
  renderResult(composition,settings,usedAI);
  showResult();
  updateStatsAndHistory(composition,settings,usedAI);
  if(typeof HarmoniaDB!=='undefined') HarmoniaDB.addXP(75,`AI Composition: ${composition.title}`);
  showToast(usedAI?`🎵 "${composition.title}" — Grok AI +75 XP`:`🎭 "${composition.title}" — demo +75 XP`,usedAI?'success':'info');

  CS.generating=false;
  if(btn)btn.disabled=false; if(icon)icon.classList.remove('spinning'); if(text)text.textContent='Generate Composition';
}

/* ═══════════════════════════════════════
   FALLBACK
═══════════════════════════════════════ */
function buildFallback(S){
  const genre=S.genre==='any'?'Classical':cap(S.genre);
  const mood =S.mood==='any'?'Expressive':cap(S.mood);
  const key  =S.key==='any'?'A minor':S.key;
  const tempo=S.tempo||120;
  const inst =S.instruments.length?S.instruments:['piano'];
  const min  =key.toLowerCase().includes('minor');
  return {
    title:`${mood} ${genre} Study in ${key}`, subtitle:`Original composition at ${tempo} BPM`,
    tags:[genre.toLowerCase(),mood.toLowerCase(),key],
    composition:{
      overview:`A ${mood.toLowerCase()} ${genre.toLowerCase()} composition in ${key} at ${tempo} BPM, featuring ${inst.join(', ')}.`,
      structure:[
        {section:'Introduction',   bars:'1–8',   description:'Establishes the tonal centre with a sparse, inviting opening'},
        {section:'A Section',      bars:'9–24',  description:'Primary melodic material over the main harmonic progression'},
        {section:'B Section',      bars:'25–40', description:'Contrasting theme with increased energy and harmonic movement'},
        {section:'Development',    bars:'41–56', description:'Thematic material explored through different registers'},
        {section:'Recapitulation', bars:'57–72', description:'Return of the opening theme, harmonically enriched'},
        {section:'Coda',           bars:'73–80', description:'Final resolution to the tonic with satisfying cadence'},
      ],
      notation:`Main Theme (${key}):\nBar 1: ${min?'A4 C5 E5 A5':'C4 E4 G4 C5'} | ${min?'G5 F5 E5 D5':'B4 A4 G4 F4'} |\nBar 2: ${min?'C5 B4 A4 G4':'E4 D4 C4 B3'} | ${min?'F4 E4 D4 C4':'A3 G3 F3 E3'} |`,
      fullDescription:`This ${mood.toLowerCase()} work in ${key} unfolds over 80 bars. The ${inst.join(' and ')} interweave throughout, creating a rich sonic tapestry drawing from the ${genre.toLowerCase()} tradition.`,
    },
    chords:{
      progression:[
        {chord:min?'Am':'C', type:min?'minor':'major',       roman:'i',            beats:4,description:'Tonic'},
        {chord:min?'Dm':'Am',type:'minor',                   roman:min?'iv':'vi',  beats:4,description:'Subdominant'},
        {chord:min?'E7':'F', type:min?'dominant 7th':'major',roman:min?'V7':'IV',  beats:4,description:'Tension'},
        {chord:min?'Am':'G7',type:min?'minor':'dominant 7th',roman:min?'i':'V7',   beats:4,description:'Resolution'},
        {chord:min?'F':'Em', type:min?'major':'minor',       roman:min?'VI':'iii', beats:2,description:'Colour'},
        {chord:min?'G':'Dm', type:'major',                   roman:min?'VII':'ii', beats:2,description:'Pre-dominant'},
        {chord:min?'E7':'G', type:min?'dominant 7th':'major',roman:min?'V7':'V',   beats:4,description:'Dominant'},
        {chord:min?'Am':'C', type:min?'minor':'major',       roman:'i',            beats:4,description:'Final'},
      ],
      analysis:`Functional harmony centred on ${key}. ${min?'The borrowed VI adds Dorian colour.':'Secondary dominant adds chromatic warmth.'}`,
      voicings:`${inst.includes('piano')?'Piano: root-fifth bass, close-position right hand. ':''}Allow chord tones to ring for a legato texture.`,
    },
    theory:{
      keyAndScale:`Written in ${key} using the ${min?'natural minor (Aeolian) scale, borrowing the raised 7th at cadences':'major scale with occasional modal mixture'}.`,
      harmony:`${min?'Minor-mode colour with VI-VII-i Aeolian cadences.':'Warm functional harmony with diatonic seventh chords.'}`,
      rhythm:`At ${tempo} BPM in ${S.time}, the feel is ${tempo<80?'expansive':tempo<120?'flowing':tempo<160?'energetic':'propulsive'}.`,
      form:`Modified ternary form (A–B–A') with introduction and coda.`,
      influences:`Rooted in the ${genre} tradition with late Romantic harmonic sensibility.`,
      learningPoints:[
        `${min?'Natural vs harmonic minor — the raised 7th creates a stronger dominant cadence':'Major scale with modal mixture deepens emotional expression'}`,
        'Voice leading: each chord tone moves to the nearest note in the next chord',
        'The dominant (V7) is the engine of tonal music — master tension and release',
        `${tempo<100?'Slow tempos require sustained tone and careful dynamic shaping':'Fast tempos demand precision and rhythmic accuracy'}`,
        'Melodic contour shapes emotion — ascending lines create tension, descending lines resolve',
      ],
    },
    performance:{
      tempoAndFeel:`♩=${tempo} BPM. ${tempo<80?'Largo':tempo<100?'Andante':tempo<120?'Moderato':tempo<160?'Allegro':'Presto'}. Feel: ${mood.toLowerCase()}.`,
      instrumentGuides:inst.slice(0,4).map(i=>({
        instrument:cap(i), role:`${i==='piano'?'Melody+harmony':i==='bass'?'Harmonic anchor':i==='drums'?'Groove and energy':'Texture and colour'}`,
        technique:`${i==='piano'?'Change pedal each chord; project melody clearly':i==='bass'?'Smooth legato; connect roots with passing tones':'Focus on tone quality and blend'}`,
        tips:`Start at ${Math.round(tempo*.6)} BPM and build up. Record and listen back.`,
      })),
      dynamicsAndExpression:`Begin mp → mf (B section) → f (climax) → mp → ppp (coda). Dolce for lyrical passages, espressivo for development.`,
      practiceSteps:[
        `Learn each part separately at ${Math.round(tempo*.6)} BPM`,
        `Combine at ${Math.round(tempo*.75)} BPM — focus on balance`,
        `Add dynamics at ${Math.round(tempo*.9)} BPM — shape phrases`,
        `Full tempo ${tempo} BPM — record complete takes`,
      ],
      commonMistakes:[
        `Rushing — use metronome from ${Math.round(tempo*.6)} BPM`,
        'Ignoring dynamic contrast — pp to ff is where music lives',
      ],
    },
  };
}

/* ═══════════════════════════════════════
   RENDER
═══════════════════════════════════════ */
function renderResult(comp,settings,usedAI){
  document.getElementById('resultTitle').textContent=comp.title||'Untitled';
  const metaEl=document.getElementById('resultMeta');
  if(metaEl){
    metaEl.innerHTML=(comp.tags||[]).map(t=>`<span class="ac-meta-tag">${t}</span>`).join('')+
      `<span class="ac-meta-tag">🎵 ${settings.tempo} BPM</span>`+
      `<span class="ac-meta-tag">⏱ ${settings.time}</span>`+
      (usedAI?`<span class="ac-meta-tag" style="color:#34d399;border-color:rgba(52,211,153,.3)">✦ Grok AI</span>`
             :`<span class="ac-meta-tag" style="color:#fbbf24;border-color:rgba(251,191,36,.3)">🎭 Demo</span>`);
  }
  document.getElementById('playbackTitle').textContent=`"${comp.title}" — ${comp.subtitle||''}`;
  const totalBeats=(comp.chords?.progression||[]).reduce((a,c)=>a+(c.beats||4),0)||32;
  CS.playTotal=Math.max(8,Math.round(totalBeats*(60/(parseInt(settings.tempo)||120))));
  CS.playSec=0;
  document.getElementById('playbackTime').textContent='0:00 / '+formatTime(CS.playTotal);
  document.getElementById('playbackProgress').style.width='0%';
  renderCompositionTab(comp); renderChordsTab(comp); renderTheoryTab(comp); renderPerformanceTab(comp);
  document.querySelectorAll('.ac-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ac-tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelector('.ac-tab[data-tab="composition"]')?.classList.add('active');
  document.getElementById('tab-composition')?.classList.add('active');
}
function renderCompositionTab(comp){
  const el=document.getElementById('compositionOutput');if(!el||!comp.composition)return;
  let h=`<h2>🎼 Overview</h2><p>${comp.composition.overview||''}</p>`;
  if(comp.composition.structure?.length){
    h+=`<h2>📐 Structure</h2>`;
    comp.composition.structure.forEach(s=>{h+=`<h3>${s.section} <span style="font-weight:400;color:var(--muted);font-size:.8rem">(Bars ${s.bars})</span></h3><p>${s.description}</p>`;});
  }
  if(comp.composition.notation) h+=`<h2>🎵 Main Theme</h2><div class="ac-notation-block">${esc(comp.composition.notation)}</div>`;
  if(comp.composition.fullDescription) h+=`<h2>📖 Full Description</h2><div class="ac-tip-card">${comp.composition.fullDescription}</div>`;
  el.innerHTML=h;
}
function renderChordsTab(comp){
  const el=document.getElementById('chordsOutput');if(!el||!comp.chords)return;
  let h='<h2>🎹 Chord Progression</h2>';
  if(comp.chords.progression?.length){
    h+='<div class="ac-chord-grid">';
    comp.chords.progression.forEach(c=>{h+=`<div class="ac-chord-box"><span class="ac-chord-name">${c.chord}</span><span class="ac-chord-type">${c.type||''}</span><span class="ac-chord-roman">${c.roman||''}</span></div>`;});
    h+='</div><h2>📋 Chord Details</h2>';
    comp.chords.progression.forEach(c=>{h+=`<div class="ac-tip-card"><strong>${c.chord} (${c.roman})</strong> — ${c.description||''} ${c.beats?`<em style="color:var(--muted);font-size:.8rem">[${c.beats} beat${c.beats!==1?'s':''}]</em>`:''}</div>`;});
  }
  if(comp.chords.analysis) h+=`<h2>🔍 Harmonic Analysis</h2><p>${comp.chords.analysis}</p>`;
  if(comp.chords.voicings) h+=`<h2>🤲 Voicings</h2><div class="ac-notation-block">${esc(comp.chords.voicings)}</div>`;
  el.innerHTML=h;
}
function renderTheoryTab(comp){
  const el=document.getElementById('theoryOutput');if(!el||!comp.theory)return;
  let h='';
  [['keyAndScale','🎼','Key & Scale'],['harmony','🎵','Harmony'],['rhythm','🥁','Rhythm'],['form','📐','Form'],['influences','🎭','Influences']].forEach(([k,ico,lbl])=>{
    if(comp.theory[k]) h+=`<h2>${ico} ${lbl}</h2><p>${comp.theory[k]}</p>`;
  });
  if(comp.theory.learningPoints?.length){h+='<h2>💡 Key Learning Points</h2><ul>';comp.theory.learningPoints.forEach(pt=>{h+=`<li>${pt}</li>`;});h+='</ul>';}
  el.innerHTML=h;
}
function renderPerformanceTab(comp){
  const el=document.getElementById('performanceOutput');if(!el||!comp.performance)return;
  let h='';
  if(comp.performance.tempoAndFeel) h+=`<h2>🎛️ Tempo & Feel</h2><div class="ac-tip-card">${comp.performance.tempoAndFeel}</div>`;
  if(comp.performance.instrumentGuides?.length){
    h+='<h2>🎸 Instrument Guides</h2>';
    comp.performance.instrumentGuides.forEach(g=>{h+=`<div class="ac-section-divider">${g.instrument}</div><h3>Role: <span style="font-weight:500;color:var(--muted)">${g.role}</span></h3><p><strong>Technique:</strong> ${g.technique}</p><div class="ac-tip-card"><strong>💡</strong> ${g.tips}</div>`;});
  }
  if(comp.performance.dynamicsAndExpression) h+=`<h2>📊 Dynamics</h2><p>${comp.performance.dynamicsAndExpression}</p>`;
  if(comp.performance.practiceSteps?.length){h+='<h2>🪜 Practice Plan</h2><ul>';comp.performance.practiceSteps.forEach(s=>{h+=`<li>${s}</li>`;});h+='</ul>';}
  if(comp.performance.commonMistakes?.length){h+='<h2>⚠️ Mistakes to Avoid</h2><ul>';comp.performance.commonMistakes.forEach(m=>{h+=`<li>${m}</li>`;});h+='</ul>';}
  el.innerHTML=h;
}
function switchTab(btn,tabId){
  document.querySelectorAll('.ac-tab').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.ac-tab-content').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active'); document.getElementById('tab-'+tabId)?.classList.add('active');
}

/* ═══════════════════════════════════════
   COPY / DOWNLOAD
═══════════════════════════════════════ */
function copyComposition(){
  if(!CS.current)return;
  navigator.clipboard.writeText(buildExport(CS.current.composition))
    .then(()=>showToast('📋 Copied!','success')).catch(()=>showToast('Copy failed','error'));
}
function downloadComposition(){
  if(!CS.current)return;
  const{composition}=CS.current;
  const blob=new Blob([buildExport(composition)],{type:'text/plain'});
  const url=URL.createObjectURL(blob);
  const a=Object.assign(document.createElement('a'),{href:url,download:`${(composition.title||'composition').replace(/[^a-z0-9]/gi,'_')}.txt`});
  a.click();URL.revokeObjectURL(url);
  CS.stats.saved=(CS.stats.saved||0)+1; saveStats();renderStats();
  showToast('💾 Saved!','success');
}
function buildExport(comp){
  let o=`HARMONIA AI COMPOSER\n${'='.repeat(50)}\nTITLE: ${comp.title}\n\n`;
  if(comp.composition){o+=`OVERVIEW\n${'-'.repeat(30)}\n${comp.composition.overview}\n\n`; if(comp.composition.notation)o+=`NOTATION\n${'-'.repeat(30)}\n${comp.composition.notation}\n\n`;}
  if(comp.chords?.progression)o+=`CHORDS\n${'-'.repeat(30)}\n${comp.chords.progression.map(c=>`${c.chord}(${c.roman})`).join(' - ')}\n\n`;
  if(comp.theory?.keyAndScale)o+=`THEORY\n${'-'.repeat(30)}\n${comp.theory.keyAndScale}\n\n`;
  return o+`Generated by Harmonia AI Composer\n`;
}

/* ═══════════════════════════════════════
   HISTORY & STATS
═══════════════════════════════════════ */
function updateStatsAndHistory(comp,settings,usedAI){
  const item={id:Date.now(),title:comp.title,genre:settings.genre,mood:settings.mood,tempo:settings.tempo,timestamp:Date.now(),icon:genreIcon(settings.genre),xp:75,usedAI};
  CS.history=[item,...CS.history].slice(0,20);
  localStorage.setItem('harmonia_comp_hist',JSON.stringify(CS.history));
  CS.stats.composed=(CS.stats.composed||0)+1;
  if(!Array.isArray(CS.stats.genres))CS.stats.genres=[];
  if(settings.genre!=='any'&&!CS.stats.genres.includes(settings.genre))CS.stats.genres.push(settings.genre);
  CS.stats.xp=(CS.stats.xp||0)+75;
  saveStats();renderHistory();renderStats();
}
function renderHistory(){
  const el=document.getElementById('historyList');if(!el)return;
  if(!CS.history.length){el.innerHTML=`<div class="ac-history-empty"><span>🎵</span><p>Your compositions will appear here</p></div>`;return;}
  el.innerHTML=CS.history.map(item=>`<div class="ac-history-item"><span class="ac-history-icon">${item.icon}</span><div class="ac-history-info"><span class="ac-history-name">${esc(item.title)}</span><span class="ac-history-meta">${cap(item.genre)} · ${item.tempo} BPM · ${timeAgo(item.timestamp)}${item.usedAI?' · <span style="color:#a78bfa">Grok</span>':''}</span></div><span class="ac-history-xp">+${item.xp} XP</span></div>`).join('');
}
function clearHistory(){ CS.history=[];localStorage.removeItem('harmonia_comp_hist');renderHistory();showToast('History cleared','info'); }
function saveStats(){ localStorage.setItem('harmonia_comp_stats',JSON.stringify(CS.stats)); }
function renderStats(){
  document.getElementById('statComposed').textContent=CS.stats.composed||0;
  document.getElementById('statGenres').textContent  =CS.stats.genres?.length||0;
  document.getElementById('statXP').textContent      =CS.stats.xp||0;
  document.getElementById('statSaved').textContent   =CS.stats.saved||0;
}

/* ═══════════════════════════════════════
   UTILS
═══════════════════════════════════════ */
function genreIcon(g){return({classical:'🎻',jazz:'🎷',pop:'🎤',rock:'🎸',electronic:'⚡','hip-hop':'🎧',ambient:'🌊',folk:'🪕','r&b':'💜',cinematic:'🎬','lo-fi':'☕',any:'🎵'})[g]||'🎵';}
function cap(s){return s?s.charAt(0).toUpperCase()+s.slice(1):'';}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
function formatTime(s){return`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;}
function timeAgo(ts){const d=Date.now()-ts;return d<60000?'just now':d<3600000?`${Math.floor(d/60000)}m ago`:d<86400000?`${Math.floor(d/3600000)}h ago`:new Date(ts).toLocaleDateString();}
function showToast(msg,type='info'){
  const t=document.getElementById('acToast');if(!t)return;
  t.textContent=msg;t.className=`ac-toast ${type} show`;
  clearTimeout(window._acToast); window._acToast=setTimeout(()=>t.classList.remove('show'),3400);
}
