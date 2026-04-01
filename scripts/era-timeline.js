/**
 * era-timeline.js — Era Timeline full functionality
 * All musical eras, data, navigation, XP integration
 */

const ERAS = [
  {
    id: 'ancient',
    name: 'Ancient & Medieval',
    years: 'Antiquity – 1400',
    color: '#b45309',
    grad: 'linear-gradient(135deg,#b45309,#fbbf24)',
    badge: 'Foundation',
    intro: 'The oldest musical traditions of humanity — from Greek modes to Gregorian chant. Music was inseparable from religion, mathematics, and philosophy. No recording survives; our knowledge comes from written treatises, notation fragments, and instrument remains.',
    span_start: 0, span_end: 1400,
    context: [
      'Greek philosopher Pythagoras defined musical intervals mathematically (c. 500 BCE)',
      'Pope Gregory I codified Gregorian chant, standardizing Catholic liturgy (590–604 CE)',
      'The first European musical notation system invented by Guido of Arezzo (c. 1025)',
      'Hildegard of Bingen composed elaborate sacred music, remarkable for a medieval woman (1098–1179)',
    ],
    characteristics: [
      { icon: '📜', title: 'Monophony', desc: '<strong>Single melodic lines</strong> — most music consisted of one voice or instrument without harmony' },
      { icon: '⛪', title: 'Sacred Focus', desc: '<strong>Religious context dominated</strong> — most surviving music was written for church services' },
      { icon: '🔢', title: 'Mathematical Basis', desc: '<strong>Pythagorean tuning</strong> — intervals derived from mathematical ratios' },
      { icon: '📖', title: 'Oral & Written', desc: '<strong>Notation evolving</strong> — music was transmitted orally until neume notation developed' },
    ],
    composers: [
      { name: 'Hildegard of Bingen', dates: '1098–1179', role: 'Visionary composer & mystic', color: '#b45309', init: 'HB' },
      { name: 'Guillaume de Machaut', dates: '1300–1377', role: 'Ars nova master', color: '#92400e', init: 'GM' },
      { name: 'Léonin', dates: 'c. 1135–1201', role: 'Notre Dame polyphony', color: '#d97706', init: 'LN' },
    ],
    works: [
      { icon: '📜', title: 'O Euchari in Leta Via', composer: 'Hildegard of Bingen', year: '~1151', desc: 'A soaring plainchant hymn of remarkable melodic breadth' },
      { icon: '🎵', title: 'Messe de Nostre Dame', composer: 'Guillaume de Machaut', year: '1365', desc: 'First complete polyphonic Mass setting by a single composer' },
    ],
  },
  {
    id: 'renaissance',
    name: 'Renaissance',
    years: '1400 – 1600',
    color: '#16a34a',
    grad: 'linear-gradient(135deg,#16a34a,#4ade80)',
    badge: 'Polyphony Blooms',
    intro: 'Music becomes increasingly complex and human-centered. The printing press (1501, Petrucci) revolutionizes music distribution. Polyphony — multiple independent voices weaving together — reaches extraordinary refinement. Secular music flourishes alongside sacred.',
    span_start: 1400, span_end: 1600,
    context: [
      'Ottaviano Petrucci publishes first printed music book "Harmonice Musices Odhecaton" (1501)',
      'The Protestant Reformation transforms church music — Martin Luther advocates vernacular hymnody (1517)',
      'Italian madrigal flourishes as a sophisticated secular vocal form (1530s–1600s)',
      'Thomas Tallis writes "Spem in Alium" for 40 independent voice parts (c. 1570)',
    ],
    characteristics: [
      { icon: '🎵', title: 'Polyphony', desc: '<strong>Multiple independent voices</strong> — weaving melodic lines of equal importance' },
      { icon: '📚', title: 'Text Painting', desc: '<strong>Word-music relationship</strong> — music expressively illustrates the meaning of lyrics' },
      { icon: '🏛️', title: 'Modal Harmony', desc: '<strong>Church modes</strong> — pre-tonal harmonic system derived from ancient Greek scales' },
      { icon: '🖨️', title: 'Print Revolution', desc: '<strong>Music printing</strong> — Petrucci\'s press democratized music distribution' },
    ],
    composers: [
      { name: 'Josquin des Prez', dates: 'c. 1450–1521', role: 'Master of polyphony', color: '#16a34a', init: 'JD' },
      { name: 'Giovanni Palestrina', dates: '1525–1594', role: 'Sacred polyphony', color: '#15803d', init: 'GP' },
      { name: 'Thomas Tallis', dates: 'c. 1505–1585', role: 'English sacred music', color: '#166534', init: 'TT' },
      { name: 'Orlando di Lasso', dates: '1532–1594', role: 'Madrigal master', color: '#4ade80', init: 'OL' },
    ],
    works: [
      { icon: '🎼', title: 'Spem in Alium', composer: 'Thomas Tallis', year: 'c. 1570', desc: 'A 40-voice motet of extraordinary complexity — one of the greatest choral works ever written' },
      { icon: '📜', title: 'Missa Papae Marcelli', composer: 'Palestrina', year: '1567', desc: 'Supposedly saved polyphony from papal ban; a model of sacred vocal writing' },
    ],
  },
  {
    id: 'baroque',
    name: 'Baroque',
    years: '1600 – 1750',
    color: '#b45309',
    grad: 'linear-gradient(135deg,#b45309,#fbbf24)',
    badge: 'Drama & Grandeur',
    intro: 'A period of extraordinary invention: opera is born in Florence, the orchestra takes shape, and counterpoint reaches its ultimate expression in the fugues of J.S. Bach. Emotional drama, ornamental complexity, and the contrast of loud and soft (terraced dynamics) define the era.',
    span_start: 1600, span_end: 1750,
    context: [
      'Opera invented by the Florentine Camerata — "Euridice" by Jacopo Peri first performed (1600)',
      'Antonio Stradivari crafts violins in Cremona, Italy — instruments still considered unequaled today (1680–1720)',
      'J.S. Bach appointed Cantor at St. Thomas Church, Leipzig — writes cantatas weekly (1723)',
      'Handel\'s "Messiah" premieres in Dublin to instant acclaim (1742)',
    ],
    characteristics: [
      { icon: '🎭', title: 'Opera Born', desc: '<strong>Vocal drama emerges</strong> — music and theater merge in a revolutionary new art form' },
      { icon: '🎻', title: 'Basso Continuo', desc: '<strong>Harmonic foundation</strong> — bass line + chords support all upper voices' },
      { icon: '🔀', title: 'Counterpoint', desc: '<strong>Independent melodic lines</strong> — Bach\'s fugues represent the pinnacle' },
      { icon: '🌟', title: 'Affections Doctrine', desc: '<strong>Music expresses emotions</strong> — the Doctrine of the Affections guides composition' },
    ],
    composers: [
      { name: 'Johann Sebastian Bach', dates: '1685–1750', role: 'Contrapuntal genius', color: '#b45309', init: 'JSB' },
      { name: 'George Frideric Handel', dates: '1685–1759', role: 'Oratorio master', color: '#92400e', init: 'GFH' },
      { name: 'Antonio Vivaldi', dates: '1678–1741', role: 'Concerto virtuoso', color: '#d97706', init: 'AV' },
      { name: 'Henry Purcell', dates: '1659–1695', role: 'English Baroque', color: '#fbbf24', init: 'HP' },
    ],
    works: [
      { icon: '🎼', title: 'The Well-Tempered Clavier', composer: 'J.S. Bach', year: '1722/1742', desc: 'Two books of 24 preludes and fugues in all major and minor keys — the Old Testament of piano music' },
      { icon: '🎻', title: 'The Four Seasons', composer: 'A. Vivaldi', year: '1725', desc: 'Four violin concertos with poetic programs describing seasonal landscapes — programmatic music\'s first masterwork' },
      { icon: '🎭', title: 'Messiah', composer: 'G.F. Handel', year: '1741', desc: 'A sacred oratorio whose "Hallelujah" chorus has been sung standing for nearly 300 years' },
    ],
  },
  {
    id: 'classical',
    name: 'Classical Period',
    years: '1750 – 1820',
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    badge: 'Order & Clarity',
    intro: 'Music seeks balance, clarity, and formal elegance. The sonata form, symphony, string quartet, and concerto crystallize as dominant forms. Vienna becomes the world\'s musical capital, and the piano replaces the harpsichord. Mozart\'s perfection and Haydn\'s wit define the era\'s ideals.',
    span_start: 1750, span_end: 1820,
    context: [
      'The Mannheim orchestra establishes crescendo and decrescendo as expressive devices (1740s)',
      'Joseph Haydn "invents" the symphony — writes 104 by his death (1732–1809)',
      'Mozart\'s "Don Giovanni" premieres in Prague to wild acclaim (1787)',
      'Beethoven\'s Third Symphony ("Eroica") shatters Classical conventions (1804)',
    ],
    characteristics: [
      { icon: '⚖️', title: 'Balance & Proportion', desc: '<strong>Phrase symmetry</strong> — 4-bar phrases balance each other; form is architecture' },
      { icon: '🎹', title: 'Piano Dominates', desc: '<strong>The fortepiano</strong> replaces the harpsichord — dynamic expression becomes possible' },
      { icon: '🏗️', title: 'Sonata Form', desc: '<strong>Exposition–Development–Recapitulation</strong> — the architectural blueprint for centuries of music' },
      { icon: '🎻', title: 'String Quartet', desc: '<strong>Four voices, one mind</strong> — the string quartet becomes the pinnacle of chamber music' },
    ],
    composers: [
      { name: 'Wolfgang Amadeus Mozart', dates: '1756–1791', role: 'Universal genius', color: '#7c3aed', init: 'WAM' },
      { name: 'Franz Joseph Haydn', dates: '1732–1809', role: 'Father of the Symphony', color: '#6d28d9', init: 'FJH' },
      { name: 'Ludwig van Beethoven', dates: '1770–1827', role: 'Bridge to Romanticism', color: '#5b21b6', init: 'LvB' },
      { name: 'Carl Philipp Emanuel Bach', dates: '1714–1788', role: 'Empfindsamer Stil', color: '#8b5cf6', init: 'CPE' },
    ],
    works: [
      { icon: '🎵', title: 'Symphony No. 40 in G minor', composer: 'W.A. Mozart', year: '1788', desc: 'One of only two symphonies Mozart wrote in a minor key — emotional intensity beneath formal perfection' },
      { icon: '🎼', title: 'String Quartet "The Lark"', composer: 'F.J. Haydn', year: '1790', desc: 'A soaring first violin melody above pizzicato strings — wit and warmth in perfect balance' },
      { icon: '🔊', title: 'Pathétique Sonata', composer: 'L. van Beethoven', year: '1799', desc: 'Beethoven\'s emotional intensity begins to fracture Classical conventions' },
    ],
  },
  {
    id: 'romantic',
    name: 'Romantic Era',
    years: '1820 – 1900',
    color: '#9d174d',
    grad: 'linear-gradient(135deg,#9d174d,#f9a8d4)',
    badge: 'Emotion Unleashed',
    intro: 'The orchestra swells to 100 players, harmony grows chromatic and daring, and individual expression becomes paramount. Composers set literature to music, write for virtuoso performers, and express national identity through folk melodies. Beethoven\'s Ninth opened the floodgates.',
    span_start: 1820, span_end: 1900,
    context: [
      'Beethoven\'s Ninth Symphony premieres — Beethoven is deaf, turned to witness the audience\'s ovation (1824)',
      'Frédéric Chopin arrives in Paris — his nocturnes and études revolutionize piano music (1831)',
      'Richard Wagner opens his own opera house in Bayreuth, Germany (1876)',
      'Brahms completes his Fourth Symphony — the last great work of the high Romantic style (1885)',
    ],
    characteristics: [
      { icon: '💔', title: 'Emotional Intensity', desc: '<strong>Unbounded feeling</strong> — music expresses extremes of joy, grief, longing, and heroism' },
      { icon: '📖', title: 'Program Music', desc: '<strong>Narrative content</strong> — symphonic poems tell literary stories without words' },
      { icon: '🎭', title: 'Virtuosity', desc: '<strong>Superhuman technique</strong> — Liszt and Paganini became the first celebrity soloists' },
      { icon: '🌍', title: 'Nationalism', desc: '<strong>Cultural identity</strong> — Chopin, Dvořák, Sibelius embed national folk music into concert halls' },
    ],
    composers: [
      { name: 'Frédéric Chopin', dates: '1810–1849', role: 'Poet of the piano', color: '#9d174d', init: 'FC' },
      { name: 'Franz Liszt', dates: '1811–1886', role: 'Keyboard revolutionary', color: '#be185d', init: 'FL' },
      { name: 'Richard Wagner', dates: '1813–1883', role: 'Music drama titan', color: '#831843', init: 'RW' },
      { name: 'Johannes Brahms', dates: '1833–1897', role: 'Classical Romantic', color: '#f9a8d4', init: 'JB' },
    ],
    works: [
      { icon: '🌙', title: 'Nocturnes Op. 9', composer: 'F. Chopin', year: '1831', desc: 'Intimate night-music for solo piano — the Romantic soul in miniature' },
      { icon: '🎪', title: 'Symphonic Poem "Les Préludes"', composer: 'F. Liszt', year: '1854', desc: 'One of the first and finest examples of the symphonic poem form' },
      { icon: '💍', title: 'Der Ring des Nibelungen', composer: 'R. Wagner', year: '1876', desc: 'A 15-hour, 4-opera epic based on Norse mythology — music drama\'s greatest monument' },
    ],
  },
  {
    id: 'modern',
    name: '20th Century & Modern',
    years: '1900 – Present',
    color: '#0ea5e9',
    grad: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    badge: 'Revolution & Diversity',
    intro: 'Music fractures into countless styles and movements. Tonality is abandoned, rhythm becomes the primary driver, electronic instruments reshape sound itself, and popular music — jazz, blues, rock, hip-hop — becomes the dominant cultural force. The recording industry transforms how music is heard.',
    span_start: 1900, span_end: 2024,
    context: [
      'Stravinsky\'s "The Rite of Spring" causes a riot at its Paris premiere (1913)',
      'The first commercial radio station (KDKA Pittsburgh) begins broadcasting (1920)',
      'Elvis Presley\'s "Heartbreak Hotel" sells a million copies — rock \'n\' roll arrives (1956)',
      'The Beatles appear on The Ed Sullivan Show — 73 million viewers (1964)',
      'Kendrick Lamar wins the Pulitzer Prize for Music (2018)',
    ],
    characteristics: [
      { icon: '💥', title: 'Atonality', desc: '<strong>Abandoning tonality</strong> — Schoenberg and the Second Viennese School reject traditional harmony' },
      { icon: '🔊', title: 'Recording Era', desc: '<strong>Recorded music</strong> transforms from live-only art form to globally distributable product' },
      { icon: '🎛️', title: 'Electronics', desc: '<strong>Synthesizers, samplers, computers</strong> — entirely new instruments reshape what sound is' },
      { icon: '🌐', title: 'Globalization', desc: '<strong>World fusion</strong> — musical traditions from all cultures blend and influence each other' },
    ],
    composers: [
      { name: 'Igor Stravinsky', dates: '1882–1971', role: 'Modernist revolutionary', color: '#0ea5e9', init: 'IS' },
      { name: 'Arnold Schoenberg', dates: '1874–1951', role: 'Twelve-tone inventor', color: '#0284c7', init: 'AS' },
      { name: 'Philip Glass', dates: '1937–', role: 'Minimalist master', color: '#38bdf8', init: 'PG' },
      { name: 'Arvo Pärt', dates: '1935–', role: 'Tintinnabuli style', color: '#0369a1', init: 'AP' },
    ],
    works: [
      { icon: '💃', title: 'The Rite of Spring', composer: 'I. Stravinsky', year: '1913', desc: 'Revolutionary use of rhythm and dissonance — caused a riot at its premiere, now considered a masterwork' },
      { icon: '🎵', title: 'Kind of Blue', composer: 'Miles Davis', year: '1959', desc: 'The best-selling jazz album ever — introduced modal jazz to millions' },
      { icon: '🎸', title: 'Sgt. Pepper\'s Lonely Hearts Club Band', composer: 'The Beatles', year: '1967', desc: 'The album that proved popular music could be a serious art form' },
    ],
    modernGenres: [
      { name: 'Jazz', color: '#db2777' },
      { name: 'Rock', color: '#16a34a' },
      { name: 'Electronic', color: '#0ea5e9' },
      { name: 'Hip-Hop', color: '#ea580c' },
      { name: 'Soul & R&B', color: '#d97706' },
      { name: 'Reggae', color: '#dc2626' },
      { name: 'Folk Revival', color: '#065f46' },
      { name: 'Minimalism', color: '#7c3aed' },
      { name: 'Post-Rock', color: '#374151' },
    ],
  },
];

// ── DOM Ready ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderTimeline();
  setupEraNav();
  setupScrollSpy();
});

// ── Render Timeline ────────────────────────────────
function renderTimeline() {
  const container = document.getElementById('timelineContainer');
  if (!container) return;

  container.innerHTML = ERAS.map((era, idx) => `
    <div class="et-era-block" id="era-${era.id}"
         style="--era-color:${era.color};--era-grad:${era.grad}">

      <div class="et-era-header">
        <div class="et-era-date-col">
          <div class="et-era-years">${era.years}</div>
          <div class="et-era-name">${era.name}</div>
          <div class="et-era-name-sub">${era.intro.substring(0,80)}…</div>
          <div class="et-era-badge" style="color:${era.color};background:rgba(${hexToRgb(era.color)},0.1);border-color:rgba(${hexToRgb(era.color)},0.2)">${era.badge}</div>
        </div>
        <div class="et-era-intro">${era.intro}</div>
      </div>

      <div class="et-era-content">

        <!-- Composers -->
        <div class="et-feature-card" style="--era-grad:${era.grad}">
          <h4>Key Figures</h4>
          <div class="et-composers">
            ${era.composers.map(c => `
              <div class="et-composer-item">
                <div class="et-composer-avatar" style="background:${c.color}">${c.init}</div>
                <div class="et-composer-info">
                  <strong>${c.name}</strong>
                  <span>${c.role}</span>
                </div>
                <div class="et-composer-dates">${c.dates}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Characteristics -->
        <div class="et-feature-card" style="--era-grad:${era.grad}">
          <h4>Musical Characteristics</h4>
          <div class="et-chars">
            ${era.characteristics.map(c => `
              <div class="et-char-item">
                <div class="et-char-icon">${c.icon}</div>
                <div class="et-char-text">${c.desc}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Key Works -->
        <div class="et-feature-card" style="--era-grad:${era.grad}">
          <h4>Essential Works</h4>
          <div class="et-works">
            ${era.works.map(w => `
              <div class="et-work-item">
                <div class="et-work-icon">${w.icon}</div>
                <div class="et-work-info">
                  <strong>${w.title}</strong>
                  <span>${w.composer}</span>
                </div>
                <div class="et-work-year">${w.year}</div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Historical Context -->
        <div class="et-context-card">
          <h4>Historical Context</h4>
          <div class="et-context-list">
            ${era.context.map(c => `<div class="et-context-item">${c}</div>`).join('')}
          </div>
        </div>

        <!-- Era Span -->
        <div class="et-feature-card et-era-content-wide" style="--era-grad:${era.grad}">
          <h4>Era Timeline Span</h4>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;align-items:center">
            <div>
              <div class="et-span-bar">
                <div class="et-span-title">Duration in Music History</div>
                <div class="et-span-track">
                  <div class="et-span-fill"
                       style="left:${((era.span_start / 2024)*100).toFixed(1)}%;width:${(((era.span_end - era.span_start) / 2024)*100).toFixed(1)}%;background:${era.grad}">
                  </div>
                </div>
                <div class="et-span-labels">
                  <span>${era.span_start || 'Antiquity'}</span>
                  <span style="color:${era.color};font-weight:700">${era.span_end >= 2024 ? 'Present' : era.span_end}</span>
                </div>
              </div>
              <div style="margin-top:16px;font-size:0.84rem;color:var(--muted)">
                Approximate duration: <strong style="color:var(--text)">${era.span_end >= 2024 ? '124+' : era.span_end - era.span_start} years</strong>
              </div>
            </div>
            ${era.modernGenres ? `
            <div>
              <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">Major Genres Emerged</div>
              <div class="et-modern-genres">
                ${era.modernGenres.map(g => `
                  <a href="genre-explorer.html" class="et-modern-genre" style="text-decoration:none;color:var(--text)">
                    <div class="et-modern-genre-dot" style="background:${g.color}"></div>
                    ${g.name}
                  </a>
                `).join('')}
              </div>
            </div>
            ` : `
            <div>
              <div style="font-size:0.78rem;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;color:var(--muted);margin-bottom:12px">Explore More</div>
              <a href="genre-explorer.html" style="
                display:inline-flex;align-items:center;gap:8px;
                background:rgba(${hexToRgb(era.color)},0.1);
                border:1px solid rgba(${hexToRgb(era.color)},0.3);
                color:${era.color};padding:11px 20px;border-radius:12px;
                font-size:0.84rem;font-weight:700;text-decoration:none;
                transition:background 0.2s;
              ">
                🎵 Explore Genres from this Era →
              </a>
            </div>
            `}
          </div>
        </div>

      </div>

      <!-- XP button -->
      <div style="margin-top:24px;display:flex;align-items:center;gap:12px;flex-wrap:wrap">
        <button onclick="awardEraXP('${era.id}','${era.name}')" style="
          background:rgba(167,139,250,0.08);border:1px solid rgba(167,139,250,0.2);
          color:var(--accent1);padding:9px 20px;border-radius:10px;
          font-size:0.82rem;font-weight:700;font-family:inherit;cursor:pointer;
          display:inline-flex;align-items:center;gap:8px;
          transition:background 0.2s;
        " id="xpBtn-${era.id}"
        onmouseover="this.style.background='rgba(167,139,250,0.14)'"
        onmouseout="this.style.background='rgba(167,139,250,0.08)'">
          ⭐ Earn XP for studying this era
        </button>
        <span style="font-size:0.72rem;color:var(--muted)" id="xpStatus-${era.id}"></span>
      </div>

    </div>

    ${idx < ERAS.length - 1 ? `
    <div class="et-era-divider">
      <div class="et-era-divider-text">↓ ${ERAS[idx+1].years} →</div>
    </div>
    ` : ''}
  `).join('');
}

// ── Era Nav ────────────────────────────────────────
function setupEraNav() {
  const navInner = document.getElementById('eraNavInner');
  if (!navInner) return;

  navInner.innerHTML = ERAS.map(era => `
    <button class="et-era-nav-btn" data-era="${era.id}" onclick="scrollToEra('${era.id}')">
      <span class="et-era-nav-dot" style="background:${era.color}"></span>
      ${era.name}
    </button>
  `).join('');

  // Activate first
  const first = navInner.querySelector('.et-era-nav-btn');
  if (first) first.classList.add('active');
}

function scrollToEra(id) {
  const el = document.getElementById(`era-${id}`);
  if (!el) return;
  const navH = 64 + 56; // main nav + era nav
  const y = el.getBoundingClientRect().top + window.scrollY - navH - 20;
  window.scrollTo({ top: y, behavior: 'smooth' });
}

// ── Scroll Spy ─────────────────────────────────────
function setupScrollSpy() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('era-', '');
        document.querySelectorAll('.et-era-nav-btn').forEach(btn => {
          btn.classList.toggle('active', btn.dataset.era === id);
        });
        // Scroll nav btn into view
        const activeBtn = document.querySelector(`.et-era-nav-btn[data-era="${id}"]`);
        if (activeBtn) activeBtn.scrollIntoView({ inline: 'center', behavior: 'smooth' });
      }
    });
  }, { threshold: 0.15, rootMargin: '-80px 0px -60% 0px' });

  ERAS.forEach(era => {
    const el = document.getElementById(`era-${era.id}`);
    if (el) obs.observe(el);
  });
}

// ── XP ─────────────────────────────────────────────
const awardedEras = new Set();
function awardEraXP(eraId, eraName) {
  const btn = document.getElementById(`xpBtn-${eraId}`);
  const status = document.getElementById(`xpStatus-${eraId}`);
  if (awardedEras.has(eraId)) {
    if (status) status.textContent = '✓ XP already earned for this era';
    return;
  }
  awardedEras.add(eraId);
  const xp = 40;
  if (window.HarmoniaDB) {
    HarmoniaDB.addXP(xp, `Studied ${eraName} era`);
  }
  if (btn) {
    btn.textContent = '✓ XP Earned!';
    btn.style.background = 'rgba(52,211,153,0.1)';
    btn.style.borderColor = 'rgba(52,211,153,0.3)';
    btn.style.color = '#34d399';
  }
  if (status) status.textContent = `+${xp} XP added to your profile`;
  showEraToast(`+${xp} XP — ${eraName}`, xp);
}

function showEraToast(msg, xp) {
  const toast = document.getElementById('mhXPToast');
  if (!toast) return;
  toast.querySelector('.mh-xp-toast-icon').textContent = '🏛️';
  toast.querySelector('.mh-xp-toast-text strong').textContent = `+${xp} XP Earned!`;
  toast.querySelector('.mh-xp-toast-text span').textContent = msg;
  toast.querySelector('.mh-xp-amount').textContent = `+${xp} XP`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Utility ────────────────────────────────────────
function hexToRgb(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
