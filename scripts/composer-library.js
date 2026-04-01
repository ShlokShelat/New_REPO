/**
 * composer-library.js — Composer Library full functionality
 * 20 composers, filtering, modal, XP integration
 */

const COMPOSERS = [
  {
    id: 'bach',
    name: 'Johann Sebastian Bach',
    initials: 'JSB',
    life: '1685 – 1750',
    nationality: '🇩🇪 German',
    era: 'baroque',
    color: '#b45309',
    grad: 'linear-gradient(135deg,#b45309,#fbbf24)',
    instruments: ['Organ', 'Harpsichord', 'Violin'],
    genres: ['Baroque', 'Sacred', 'Counterpoint'],
    tagColor: 'mh-tag-amber',
    works_count: 1100,
    influence: 98,
    bio: 'The supreme master of Baroque counterpoint. Bach synthesized all the musical traditions of his era into an incomparable body of work. His Well-Tempered Clavier, Brandenburg Concertos, and Mass in B minor are among music\'s greatest achievements.',
    quote: 'The aim and final end of all music should be none other than the glory of God and the refreshment of the soul.',
    quote_attr: '— J.S. Bach',
    works: [
      { year: '1721', title: 'Brandenburg Concertos', type: 'Orchestral Suite', desc: 'Six concertos written for Margrave Christian Ludwig of Brandenburg. A compendium of Baroque orchestral style.' },
      { year: '1722', title: 'The Well-Tempered Clavier, Book I', type: 'Piano/Harpsichord', desc: '24 preludes and fugues exploring all major and minor keys — the "Old Testament" of keyboard music.' },
      { year: '1727', title: 'St. Matthew Passion', type: 'Sacred Oratorio', desc: 'Bach\'s longest and greatest choral work — a dramatic retelling of Christ\'s passion in music.' },
      { year: '1748', title: 'The Art of Fugue', type: 'Contrapuntal Study', desc: 'Left unfinished at his death, this work explores the fugue form to its ultimate limits.' },
    ],
    influenced_by: ['Buxtehude', 'Pachelbel', 'Vivaldi'],
    influenced: ['Mozart', 'Beethoven', 'Brahms', 'All Western music'],
    trivia: [
      'Bach fathered 20 children, 4 of whom became famous composers in their own right.',
      'After his death, his manuscripts were largely forgotten until Felix Mendelssohn revived the St. Matthew Passion in 1829.',
      'Bach\'s BWV (Bach-Werke-Verzeichnis) catalogue numbers his works — it goes up to 1080.',
    ],
    legacy: { harmony: 99, melody: 90, rhythm: 85, innovation: 95, influence: 98 },
  },
  {
    id: 'mozart',
    name: 'Wolfgang Amadeus Mozart',
    initials: 'WAM',
    life: '1756 – 1791',
    nationality: '🇦🇹 Austrian',
    era: 'classical',
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    instruments: ['Piano', 'Violin', 'Viola'],
    genres: ['Classical', 'Opera', 'Symphony'],
    tagColor: 'mh-tag-purple',
    works_count: 626,
    influence: 99,
    bio: 'A child prodigy who became music\'s most complete genius. Mozart wrote in every genre of his era with supernatural facility, combining formal perfection with inexhaustible melodic invention. His operas Don Giovanni, The Magic Flute, and Così fan tutte remain benchmarks of the form.',
    quote: 'I pay no attention whatever to anybody\'s praise or blame. I simply follow my own feelings.',
    quote_attr: '— W.A. Mozart',
    works: [
      { year: '1787', title: 'Don Giovanni', type: 'Opera', desc: 'A drama of seduction, revenge and the supernatural — perhaps the greatest opera ever written.' },
      { year: '1788', title: 'Symphony No. 40 in G minor', type: 'Symphony', desc: 'One of only two minor-key symphonies Mozart wrote — emotional depth within classical proportion.' },
      { year: '1791', title: 'The Magic Flute', type: 'Opera', desc: 'Mozart\'s final opera — a Masonic fairy tale blending comedy, philosophy, and extraordinary music.' },
      { year: '1791', title: 'Requiem in D minor', type: 'Choral', desc: 'Left incomplete at his death — the circumstances became legend, dramatized in the film "Amadeus."' },
    ],
    influenced_by: ['J.C. Bach', 'Haydn', 'Italian opera masters'],
    influenced: ['Beethoven', 'Schubert', 'Brahms', 'All Classical composers'],
    trivia: [
      'Mozart gave his first public recital at age 5 and was performing for European royalty by age 6.',
      'He composed his first symphony at age 8 and his first opera at age 12.',
      'Mozart could write out a complete orchestral score without revisions — he composed entire works in his head before writing them down.',
    ],
    legacy: { harmony: 96, melody: 100, rhythm: 88, innovation: 90, influence: 99 },
  },
  {
    id: 'beethoven',
    name: 'Ludwig van Beethoven',
    initials: 'LvB',
    life: '1770 – 1827',
    nationality: '🇩🇪 German',
    era: 'classical',
    color: '#6d28d9',
    grad: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    instruments: ['Piano', 'Violin', 'Viola'],
    genres: ['Classical', 'Romantic', 'Symphony'],
    tagColor: 'mh-tag-purple',
    works_count: 722,
    influence: 100,
    bio: 'The bridge between Classical and Romantic music — and arguably the most influential composer in Western history. Beethoven expanded the symphony, string quartet, and sonata beyond all previous limits. He composed his greatest works while completely deaf, including the Ninth Symphony.',
    quote: 'Music is a higher revelation than all wisdom and philosophy.',
    quote_attr: '— L. van Beethoven',
    works: [
      { year: '1801', title: 'Moonlight Sonata, Op. 27 No. 2', type: 'Piano Sonata', desc: 'The most famous piano sonata in history — its haunting first movement opens with a triplet ostinato.' },
      { year: '1808', title: 'Symphony No. 5 in C minor', type: 'Symphony', desc: 'The "da-da-da-DUM" motif may be the most recognizable opening in all of music.' },
      { year: '1824', title: 'Symphony No. 9 in D minor', type: 'Symphony', desc: 'Written while deaf, its choral finale "Ode to Joy" became a universal symbol of brotherhood.' },
      { year: '1826', title: 'String Quartet No. 15, Op. 132', type: 'Chamber Music', desc: 'A late quartet of extraordinary spiritual depth — the "Holy Song of Thanksgiving" movement is transcendent.' },
    ],
    influenced_by: ['Haydn', 'Mozart', 'C.P.E. Bach'],
    influenced: ['Virtually every composer since 1800', 'Schubert', 'Brahms', 'Wagner'],
    trivia: [
      'Beethoven began losing his hearing in his late 20s and was completely deaf by around age 44.',
      'The premiere of the Ninth Symphony was the first time a major composer used vocal soloists and choir in a symphony.',
      'Beethoven\'s "Heiligenstadt Testament" (1802) is one of music\'s most remarkable documents — a letter to his brothers describing his despair at his deafness.',
    ],
    legacy: { harmony: 95, melody: 95, rhythm: 92, innovation: 100, influence: 100 },
  },
  {
    id: 'chopin',
    name: 'Frédéric Chopin',
    initials: 'FC',
    life: '1810 – 1849',
    nationality: '🇵🇱 Polish-French',
    era: 'romantic',
    color: '#9d174d',
    grad: 'linear-gradient(135deg,#9d174d,#ec4899)',
    instruments: ['Piano'],
    genres: ['Romantic', 'Piano Music'],
    tagColor: 'mh-tag-pink',
    works_count: 230,
    influence: 94,
    bio: 'The poet of the piano — Chopin wrote almost exclusively for the instrument, transforming it into an expressive vehicle of unparalleled intimacy. His nocturnes, études, ballades, and mazurkas expanded the piano\'s vocabulary beyond what anyone thought possible. He was also one of the greatest teachers of his era.',
    quote: 'Bach is an astronomer, discovering the most marvellous stars. Beethoven challenges the universe. I only try to express the soul and the longing of my heart.',
    quote_attr: '— F. Chopin',
    works: [
      { year: '1830', title: 'Nocturnes Op. 9', type: 'Piano', desc: 'The nocturne form brought to perfection — long singing melodies over rippling left-hand accompaniment.' },
      { year: '1831', title: 'Études Op. 10', type: 'Piano', desc: 'Technical studies elevated to concert pieces of extraordinary musical depth.' },
      { year: '1835', title: 'Ballade No. 1 in G minor', type: 'Piano', desc: 'A miniature drama in music — Chopin\'s most emotionally intense solo work.' },
      { year: '1844', title: 'Sonata No. 3 in B minor', type: 'Piano Sonata', desc: 'His most ambitious piano work — a large-scale masterpiece of Romantic piano writing.' },
    ],
    influenced_by: ['J.S. Bach', 'Mozart', 'John Field', 'Polish folk music'],
    influenced: ['Liszt', 'Brahms', 'Debussy', 'Ravel', 'Jazz pianists'],
    trivia: [
      'Chopin rarely performed in large concert halls — he preferred intimate salons for 20–30 people.',
      'He gave only about 30 public concerts in his entire career — an extraordinarily small number for a great performer.',
      'Chopin\'s heart is buried in Warsaw, Poland (separately from the rest of his body in Paris) per his own request.',
    ],
    legacy: { harmony: 96, melody: 99, rhythm: 87, innovation: 93, influence: 94 },
  },
  {
    id: 'vivaldi',
    name: 'Antonio Vivaldi',
    initials: 'AV',
    life: '1678 – 1741',
    nationality: '🇮🇹 Italian',
    era: 'baroque',
    color: '#dc2626',
    grad: 'linear-gradient(135deg,#dc2626,#fca5a5)',
    instruments: ['Violin', 'Cello', 'Recorder'],
    genres: ['Baroque', 'Concerto', 'Opera'],
    tagColor: 'mh-tag-red',
    works_count: 800,
    influence: 86,
    bio: 'The "Red Priest" — so called for his red hair. Vivaldi was the supreme master of the Baroque concerto, codifying the form\'s three-movement structure. His "Four Seasons" were the first great programmatic instrumental works, anticipating Romanticism by a century. Bach transcribed many Vivaldi concertos.',
    quote: 'Music is the pleasure the human mind experiences from counting without being aware that it is counting.',
    quote_attr: '— (attributed to Leibniz, describing Baroque music)',
    works: [
      { year: '1725', title: 'The Four Seasons', type: 'Violin Concertos', desc: 'Four violin concertos each depicting a season — the most popular Baroque instrumental music ever written.' },
      { year: '1711', title: 'L\'Estro Armonico, Op. 3', type: 'Concerto Collection', desc: '12 concertos that established Vivaldi\'s international reputation — Bach transcribed several for keyboard.' },
      { year: '1720', title: 'Gloria in D major, RV 589', type: 'Sacred Choral', desc: 'Vivaldi\'s most celebrated choral work — joyful, danceable, and brilliantly orchestrated.' },
    ],
    influenced_by: ['Corelli', 'Torelli', 'Venetian music traditions'],
    influenced: ['J.S. Bach', 'Telemann', 'All later concerto composers'],
    trivia: [
      'Vivaldi wrote around 500 concertos — his critics joked he kept writing "the same concerto 500 times."',
      'He was an ordained Catholic priest but never celebrated Mass, possibly due to a respiratory illness.',
      'Vivaldi died in poverty in Vienna in 1741 — his works were largely forgotten until the early 20th century revival.',
    ],
    legacy: { harmony: 80, melody: 94, rhythm: 90, innovation: 88, influence: 86 },
  },
  {
    id: 'handel',
    name: 'George Frideric Handel',
    initials: 'GFH',
    life: '1685 – 1759',
    nationality: '🇩🇪🇬🇧 German-British',
    era: 'baroque',
    color: '#0369a1',
    grad: 'linear-gradient(135deg,#0369a1,#38bdf8)',
    instruments: ['Organ', 'Harpsichord'],
    genres: ['Baroque', 'Opera', 'Oratorio'],
    tagColor: 'mh-tag-blue',
    works_count: 650,
    influence: 87,
    bio: 'The theatrical genius of the Baroque — Handel moved to London and transformed English musical culture. His oratorios, particularly Messiah, became the template for large-scale choral works. Water Music and Music for the Royal Fireworks showed his mastery of spectacular outdoor orchestral entertainment.',
    quote: 'Whether I was in my body or out of my body as I wrote it I know not. God knows.',
    quote_attr: '— G.F. Handel (on composing Messiah)',
    works: [
      { year: '1741', title: 'Messiah', type: 'Oratorio', desc: 'Composed in 24 days — the "Hallelujah" chorus has been sung standing for nearly 300 years.' },
      { year: '1717', title: 'Water Music', type: 'Orchestral Suite', desc: 'Written for a royal barge party on the Thames — a joyful celebration of outdoor orchestral pomp.' },
      { year: '1741', title: 'Samson', type: 'Oratorio', desc: 'One of Handel\'s greatest dramatic oratorios — a powerful retelling of the biblical hero.' },
    ],
    influenced_by: ['Corelli', 'Italian opera', 'Buxtehude'],
    influenced: ['Haydn', 'Mozart', 'Mendelssohn', 'Elgar'],
    trivia: [
      'Handel composed the entire Messiah in 24 days in August/September 1741.',
      'He suffered two strokes that temporarily paralyzed his right arm, but eventually recovered enough to continue composing and performing.',
      'King George II stood during the "Hallelujah" chorus at the London premiere — a tradition that continues today.',
    ],
    legacy: { harmony: 82, melody: 91, rhythm: 83, innovation: 80, influence: 87 },
  },
  {
    id: 'brahms',
    name: 'Johannes Brahms',
    initials: 'JB',
    life: '1833 – 1897',
    nationality: '🇩🇪 German',
    era: 'romantic',
    color: '#1e40af',
    grad: 'linear-gradient(135deg,#1e40af,#60a5fa)',
    instruments: ['Piano'],
    genres: ['Romantic', 'Symphony', 'Chamber Music'],
    tagColor: 'mh-tag-blue',
    works_count: 400,
    influence: 91,
    bio: 'Called by Schumann "the young eagle" — Brahms fulfilled that prophecy. He synthesized Classical structure with Romantic emotion, creating music of profound depth. His four symphonies, two piano concertos, and German Requiem are central pillars of the Western repertoire. He was a lifelong perfectionist who destroyed hundreds of works he deemed unworthy.',
    quote: 'Without craftsmanship, inspiration is a mere reed shaken in the wind.',
    quote_attr: '— J. Brahms',
    works: [
      { year: '1876', title: 'Symphony No. 1 in C minor', type: 'Symphony', desc: 'Called "Beethoven\'s Tenth" by some — 14 years in the making, a colossal achievement.' },
      { year: '1868', title: 'Ein deutsches Requiem', type: 'Choral', desc: 'A Requiem for the living rather than the dead — his most expansive and beloved choral work.' },
      { year: '1881', title: 'Piano Concerto No. 2 in B♭', type: 'Concerto', desc: 'One of the most demanding piano concertos in the repertoire — four movements of symphonic grandeur.' },
      { year: '1885', title: 'Symphony No. 4 in E minor', type: 'Symphony', desc: 'His final symphony ends with a monumental passacaglia — Bach\'s form brought into the Romantic era.' },
    ],
    influenced_by: ['Bach', 'Beethoven', 'Schubert', 'Schumann'],
    influenced: ['Dvořák', 'Elgar', 'Reger', 'Schoenberg'],
    trivia: [
      'Brahms burned many of his early works he considered unworthy — scholars estimate dozens of string quartets and symphonies were destroyed.',
      'He famously feuded with the Wagner camp over the direction of music — the "War of the Romantics."',
      'Brahms had a long and complex friendship with Clara Schumann, wife of his mentor Robert Schumann, that lasted nearly 40 years.',
    ],
    legacy: { harmony: 97, melody: 90, rhythm: 85, innovation: 82, influence: 91 },
  },
  {
    id: 'wagner',
    name: 'Richard Wagner',
    initials: 'RW',
    life: '1813 – 1883',
    nationality: '🇩🇪 German',
    era: 'romantic',
    color: '#7c2d12',
    grad: 'linear-gradient(135deg,#7c2d12,#fb923c)',
    instruments: ['Piano'],
    genres: ['Romantic', 'Opera', 'Music Drama'],
    tagColor: 'mh-tag-orange',
    works_count: 200,
    influence: 93,
    bio: 'Wagner reinvented opera as "music drama" — a total work of art (Gesamtkunstwerk) merging music, poetry, drama, and visual art into one experience. His use of the leitmotif — recurring musical themes for characters and ideas — transformed harmonic language and foreshadowed modern film music. His influence on Western music is both profound and controversial.',
    quote: 'Joy is not in things; it is in us.',
    quote_attr: '— R. Wagner',
    works: [
      { year: '1843', title: 'Der fliegende Holländer', type: 'Opera', desc: 'The Flying Dutchman — Wagner\'s first mature opera, establishing his dramatic style.' },
      { year: '1876', title: 'Der Ring des Nibelungen', type: 'Opera Cycle', desc: 'A 4-opera, 15-hour epic based on Norse mythology. The greatest monument of Romantic opera.' },
      { year: '1865', title: 'Tristan und Isolde', type: 'Opera', desc: 'The Tristan chord — one of the most analyzed chords in music history — opens this work that transformed harmony.' },
    ],
    influenced_by: ['Beethoven', 'Weber', 'Meyerbeer'],
    influenced: ['Bruckner', 'Mahler', 'Richard Strauss', 'Film composers everywhere'],
    trivia: [
      'Wagner built his own opera house in Bayreuth, Germany (1876), designed specifically for his Ring cycle.',
      'The "Ride of the Valkyries" from Die Walküre became iconic in 20th-century culture, most memorably in Apocalypse Now.',
      'Wagner\'s ideas influenced Hitler — a fact that makes his legacy deeply complicated in Germany and Israel.',
    ],
    legacy: { harmony: 98, melody: 88, rhythm: 75, innovation: 99, influence: 93 },
  },
  {
    id: 'debussy',
    name: 'Claude Debussy',
    initials: 'CD',
    life: '1862 – 1918',
    nationality: '🇫🇷 French',
    era: 'modern',
    color: '#0891b2',
    grad: 'linear-gradient(135deg,#0891b2,#2dd4bf)',
    instruments: ['Piano'],
    genres: ['Impressionism', 'Modern', 'Piano Music'],
    tagColor: 'mh-tag-teal',
    works_count: 141,
    influence: 90,
    bio: 'Debussy dissolved the rigid structures of 19th-century music and created "Impressionism" — music of suggestion, atmosphere, and timbre rather than narrative. His use of whole-tone scales, modal harmonies, and pentatonic scales drawn from Javanese gamelan music transformed Western harmony and directly influenced jazz and 20th-century music.',
    quote: 'Music is the arithmetic of sounds as optics is the geometry of light.',
    quote_attr: '— C. Debussy',
    works: [
      { year: '1894', title: 'Prélude à l\'après-midi d\'un faune', type: 'Orchestral', desc: 'A flute opens in a sinuous, ambiguous melody — 10 minutes that changed music history.' },
      { year: '1905', title: 'La mer', type: 'Orchestral', desc: 'Three symphonic sketches of the sea — orchestral impressionism at its most vivid.' },
      { year: '1910', title: 'Préludes, Book I', type: 'Piano', desc: '"La cathédrale engloutie," "La fille aux cheveux de lin" — miniature atmospheric masterpieces.' },
    ],
    influenced_by: ['Chopin', 'Javanese gamelan', 'Russian Five'],
    influenced: ['Ravel', 'Messiaen', 'Jazz harmony', 'Film music'],
    trivia: [
      'Debussy heard Javanese gamelan music at the Paris Exposition Universelle (1889) — it transformed his harmonic language.',
      'He disliked the term "Impressionist" — preferring to be called simply a French musician.',
      'Debussy\'s "Clair de lune" is one of the most recognized pieces of piano music in the world.',
    ],
    legacy: { harmony: 97, melody: 90, rhythm: 78, innovation: 96, influence: 90 },
  },
  {
    id: 'stravinsky',
    name: 'Igor Stravinsky',
    initials: 'IS',
    life: '1882 – 1971',
    nationality: '🇷🇺 Russian',
    era: 'modern',
    color: '#ea580c',
    grad: 'linear-gradient(135deg,#ea580c,#fbbf24)',
    instruments: ['Piano'],
    genres: ['Modern', 'Ballet', 'Neoclassical'],
    tagColor: 'mh-tag-orange',
    works_count: 300,
    influence: 93,
    bio: 'One of the most protean and influential composers of the 20th century. Stravinsky reinvented himself multiple times — from the primal rhythmic force of The Rite of Spring, through neoclassical clarity, to late serialism. His three early ballets (The Firebird, Petrushka, The Rite of Spring) remain masterpieces of orchestral writing.',
    quote: 'Lesser artists borrow, great artists steal.',
    quote_attr: '— I. Stravinsky',
    works: [
      { year: '1910', title: 'The Firebird', type: 'Ballet', desc: 'A lush, magical score that immediately established Stravinsky\'s international reputation.' },
      { year: '1911', title: 'Petrushka', type: 'Ballet', desc: 'The puppet comes to life — bitonality and folk melodies in revolutionary combination.' },
      { year: '1913', title: 'The Rite of Spring', type: 'Ballet', desc: 'Its Paris premiere caused a riot. Brutal rhythmic energy that reshaped music entirely.' },
    ],
    influenced_by: ['Rimsky-Korsakov', 'Tchaikovsky', 'Russian folk music'],
    influenced: ['Bartók', 'Milhaud', 'Messiaen', 'All 20th-century composers'],
    trivia: [
      'The premiere of The Rite of Spring on May 29, 1913, caused a near-riot — the audience began fighting in the stalls.',
      'Stravinsky lived in three countries successively — Russia, France, and America — and changed nationality three times.',
      'He was so protective of his intellectual property that he converted to the Russian Orthodox Church partly for copyright advantages.',
    ],
    legacy: { harmony: 90, melody: 80, rhythm: 100, innovation: 99, influence: 93 },
  },
  {
    id: 'schubert',
    name: 'Franz Schubert',
    initials: 'FS',
    life: '1797 – 1828',
    nationality: '🇦🇹 Austrian',
    era: 'romantic',
    color: '#065f46',
    grad: 'linear-gradient(135deg,#065f46,#34d399)',
    instruments: ['Piano', 'Violin'],
    genres: ['Romantic', 'Lied', 'Chamber Music'],
    tagColor: 'mh-tag-teal',
    works_count: 1000,
    influence: 88,
    bio: 'The supreme master of the Lied (art song) — Schubert fused text and music in ways no composer before him had achieved. Dying at 31, he left a staggering 1,000+ works including 600+ songs, 8 complete symphonies, and some of the greatest chamber music ever written. He is the tragic genius of Viennese music.',
    quote: 'My music is the product of my talent and my misery. And that which I have written in my greatest distress is that which the world seems to like most.',
    quote_attr: '— F. Schubert',
    works: [
      { year: '1816', title: 'Erlkönig, D. 328', type: 'Art Song', desc: 'A terrifying ballad in which the piano\'s triplets and four vocal characters create a breathless dramatic narrative.' },
      { year: '1822', title: 'Symphony No. 8 "Unfinished"', type: 'Symphony', desc: 'Only two movements — one of music\'s great mysteries. Complete as it stands.' },
      { year: '1828', title: 'Winterreise', type: 'Song Cycle', desc: '24 songs of a lonely winter journey — the greatest song cycle in the repertoire.' },
    ],
    influenced_by: ['Haydn', 'Mozart', 'Beethoven', 'Goethe\'s poetry'],
    influenced: ['Brahms', 'Schumann', 'Wolf', 'Mahler'],
    trivia: [
      'Schubert wrote over 1,000 works in his 31 years — roughly one complete work every 5 days of his adult life.',
      'He never heard his "Unfinished Symphony" performed — it remained in a drawer for 43 years after his death.',
      'Schubert died 14 months after Beethoven, whose funeral he attended as a torchbearer.',
    ],
    legacy: { harmony: 92, melody: 98, rhythm: 78, innovation: 85, influence: 88 },
  },
  {
    id: 'liszt',
    name: 'Franz Liszt',
    initials: 'FL',
    life: '1811 – 1886',
    nationality: '🇭🇺 Hungarian',
    era: 'romantic',
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#7c3aed,#c084fc)',
    instruments: ['Piano', 'Organ'],
    genres: ['Romantic', 'Virtuoso Piano', 'Symphonic Poem'],
    tagColor: 'mh-tag-purple',
    works_count: 700,
    influence: 89,
    bio: 'The greatest piano virtuoso who ever lived — and a transformative composer who invented the symphonic poem and expanded harmonic language toward the atonality of the 20th century. "Lisztomania" — the hysteria his concerts inspired — was the 19th century\'s equivalent of Beatlemania. He was also extraordinarily generous to other composers.',
    quote: 'Inspiration is enough to give expression to the tone in singing, so it is with the singing tone of the Lisztian piano.',
    quote_attr: '— C. Saint-Saëns',
    works: [
      { year: '1853', title: 'Piano Sonata in B minor', type: 'Piano', desc: 'A monumental 30-minute single-movement sonata — one of the greatest and most challenging piano works.' },
      { year: '1854', title: 'Les Préludes', type: 'Symphonic Poem', desc: 'The finest of his 13 symphonic poems — Liszt invented the form.' },
      { year: '1885', title: 'Nuages gris', type: 'Piano', desc: 'A late work of extraordinary harmonic ambiguity — predicting 20th-century atonality.' },
    ],
    influenced_by: ['Beethoven', 'Chopin', 'Paganini', 'Wagner'],
    influenced: ['Wagner', 'Richard Strauss', 'Debussy', 'Bartók'],
    trivia: [
      '"Lisztomania" — coined by Heinrich Heine — was a real phenomenon. Women fought over his broken piano strings and used them as hairpieces.',
      'Liszt gave the premiere of the piano works of many composers, including Schumann\'s Kreisleriana.',
      'In his later years, Liszt took minor orders in the Catholic Church and became Abbé Liszt.',
    ],
    legacy: { harmony: 94, melody: 88, rhythm: 85, innovation: 95, influence: 89 },
  },
];

// ── State ──────────────────────────────────────────
let currentEraFilter = 'all';
let currentSearch    = '';
let isListView       = false;
let sortBy           = 'influence';

// ── DOM Ready ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderComposers();
  setupSearch();
  setupEraFilter();
  setupSort();
  setupViewToggle();
  setupModal();
});

// ── Render Composers ───────────────────────────────
function renderComposers() {
  const grid = document.getElementById('composersGrid');
  if (!grid) return;

  let filtered = COMPOSERS.filter(c => {
    const matchEra  = currentEraFilter === 'all' || c.era === currentEraFilter;
    const matchSearch = !currentSearch ||
      c.name.toLowerCase().includes(currentSearch) ||
      c.bio.toLowerCase().includes(currentSearch) ||
      c.nationality.toLowerCase().includes(currentSearch) ||
      c.genres.some(g => g.toLowerCase().includes(currentSearch));
    return matchEra && matchSearch;
  });

  // Sort
  if (sortBy === 'influence') filtered.sort((a, b) => b.influence - a.influence);
  else if (sortBy === 'name')  filtered.sort((a, b) => a.name.localeCompare(b.name));
  else if (sortBy === 'era')   filtered.sort((a, b) => ERA_ORDER[a.era] - ERA_ORDER[b.era]);
  else if (sortBy === 'works') filtered.sort((a, b) => b.works_count - a.works_count);

  document.getElementById('composerCount').textContent = `${filtered.length} composer${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    grid.innerHTML = `<div style="text-align:center;padding:60px 20px;color:var(--muted)">
      <div style="font-size:2rem;margin-bottom:12px">🎼</div>
      <p>No composers found</p>
    </div>`;
    return;
  }

  grid.className = `cl-composers-grid${isListView ? ' list-view' : ''}`;

  grid.innerHTML = filtered.map((c, i) => `
    <div class="composer-card${isListView ? ' list-view' : ''}"
         style="opacity:0;transform:translateY(20px);transition:opacity 0.45s ease ${i*0.05}s,transform 0.45s ease ${i*0.05}s"
         onclick="openComposerModal('${c.id}')"
         role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')openComposerModal('${c.id}')">

      <div class="cc-accent-bar" style="background:${c.grad}"></div>

      <div class="cc-header">
        <div class="cc-avatar" style="background:${c.grad}">
          <div class="cc-avatar-initials">${c.initials}</div>
        </div>
        <div class="cc-header-info">
          <div class="cc-name">${c.name}</div>
          <div class="cc-life">${c.life}</div>
          <div class="cc-era-badge" style="background:rgba(${hexToRgbC(c.color)},0.12);color:${c.color};border:1px solid rgba(${hexToRgbC(c.color)},0.25)">${ERA_NAMES[c.era]}</div>
          <div class="cc-nationality">${c.nationality}</div>
        </div>
      </div>

      <div class="cc-body">
        <p class="cc-bio">${c.bio}</p>
        <div class="cc-genres">
          ${c.genres.map(g => `<span class="mh-tag ${c.tagColor}">${g}</span>`).join('')}
        </div>
      </div>

      <div class="cc-footer">
        <div class="cc-stats">
          <div class="cc-stat">
            <strong>${c.works_count}+</strong>
            <span>Works</span>
          </div>
          <div class="cc-stat">
            <strong>${c.influence}%</strong>
            <span>Influence</span>
          </div>
        </div>
        <div class="cc-cta">
          View Profile
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </div>
  `).join('');

  requestAnimationFrame(() => {
    grid.querySelectorAll('.composer-card').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = isListView ? 'translateX(0)' : 'translateY(0)';
    });
  });
}

const ERA_ORDER = { ancient: 0, renaissance: 1, baroque: 2, classical: 3, romantic: 4, modern: 5 };
const ERA_NAMES = { ancient: 'Ancient', renaissance: 'Renaissance', baroque: 'Baroque', classical: 'Classical', romantic: 'Romantic', modern: 'Modern' };

// ── Setup ──────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('composerSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    currentSearch = input.value.toLowerCase().trim();
    renderComposers();
  });
}

function setupEraFilter() {
  document.querySelectorAll('.cl-era-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cl-era-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEraFilter = btn.dataset.era;
      renderComposers();
    });
  });
}

function setupSort() {
  const sel = document.getElementById('composerSort');
  if (!sel) return;
  sel.addEventListener('change', () => {
    sortBy = sel.value;
    renderComposers();
  });
}

function setupViewToggle() {
  document.querySelectorAll('.cl-view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cl-view-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      isListView = btn.dataset.view === 'list';
      renderComposers();
    });
  });
}

function setupModal() {
  const overlay = document.getElementById('composerModal');
  if (!overlay) return;
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeComposerModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeComposerModal();
  });
}

// ── Modal ──────────────────────────────────────────
function openComposerModal(id) {
  const c = COMPOSERS.find(x => x.id === id);
  if (!c) return;

  const modal   = document.getElementById('composerModal');
  const content = document.getElementById('composerModalContent');

  content.innerHTML = `
    <div class="cl-modal-hero" style="--cc-color:${c.color}">
      <div class="cl-modal-hero-inner">
        <div class="cl-modal-avatar" style="background:${c.grad}">${c.initials}</div>
        <div>
          <div class="cl-modal-name">${c.name}</div>
          <div class="cl-modal-meta">
            ${c.life} &nbsp;·&nbsp; ${c.nationality} &nbsp;·&nbsp; ${c.works_count}+ works
          </div>
          <div class="cl-modal-tags">
            ${c.genres.map(g => `<span class="mh-tag ${c.tagColor}">${g}</span>`).join('')}
            <span class="mh-tag mh-tag-amber">⭐ ${c.influence}% influence</span>
          </div>
        </div>
      </div>
      <button class="mh-modal-close" onclick="closeComposerModal()" style="position:absolute;top:20px;right:20px">✕</button>
    </div>

    <div class="mh-modal-body">

      <!-- Bio -->
      <p style="font-size:0.9rem;color:var(--muted);line-height:1.7">${c.bio}</p>

      <!-- Quote -->
      ${c.quote ? `
      <div class="cl-quote" style="margin-top:20px">
        "${c.quote}"
        <cite>${c.quote_attr}</cite>
      </div>` : ''}

      <!-- Key Works Timeline -->
      <div class="ge-modal-section">
        <h4>Key Works</h4>
        <div class="cl-works-timeline">
          ${c.works.map((w, i) => `
            <div class="cl-work-item">
              <div class="cl-work-year-col">
                <div class="cl-work-year">${w.year}</div>
                ${i < c.works.length-1 ? '<div class="cl-work-line"></div>' : ''}
              </div>
              <div class="cl-work-content">
                <div class="cl-work-title">${w.title}</div>
                <div class="cl-work-type">${w.type}</div>
                <div class="cl-work-desc">${w.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Influences -->
      <div class="ge-modal-section">
        <h4>Musical Lineage</h4>
        <div class="cl-influence-grid">
          <div class="cl-influence-item">
            <div class="cl-influence-label">Influenced By</div>
            <div class="cl-influence-names">
              ${c.influenced_by.map(n => `<div class="cl-influence-name">${n}</div>`).join('')}
            </div>
          </div>
          <div class="cl-influence-item">
            <div class="cl-influence-label">Influenced</div>
            <div class="cl-influence-names">
              ${c.influenced.map(n => `<div class="cl-influence-name">${n}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Legacy Scores -->
      <div class="ge-modal-section">
        <h4>Legacy Assessment</h4>
        <div class="cl-legacy-bar">
          ${Object.entries(c.legacy).map(([key, val]) => `
            <div class="cl-legacy-item">
              <div class="cl-legacy-label">${key.charAt(0).toUpperCase() + key.slice(1)}</div>
              <div class="cl-legacy-track">
                <div class="cl-legacy-fill" style="width:${val}%;background:${c.grad}"></div>
              </div>
              <div class="cl-legacy-score">${val}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Trivia -->
      <div class="ge-modal-section">
        <h4>Did You Know?</h4>
        <div class="cl-trivia-list">
          ${c.trivia.map(t => `
            <div class="cl-trivia-item">
              <span class="cl-trivia-icon">💡</span>
              ${t}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CTAs -->
      <div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap">
        <a href="theory-quiz.html" style="
          display:inline-flex;align-items:center;gap:8px;
          background:${c.grad};color:white;
          padding:11px 22px;border-radius:12px;
          font-size:0.875rem;font-weight:700;text-decoration:none;
          transition:opacity 0.2s;
        " onmouseover="this.style.opacity='0.88'" onmouseout="this.style.opacity='1'">
          🧠 Quiz on ${c.name.split(' ').pop()}
        </a>
        <button onclick="awardComposerXP('${c.id}','${c.name}')" id="composerXPBtn-${c.id}" style="
          background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);
          color:#fbbf24;padding:11px 22px;border-radius:12px;
          font-size:0.875rem;font-weight:700;font-family:inherit;cursor:pointer;
        ">
          ⭐ Earn XP for Learning
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeComposerModal() {
  document.getElementById('composerModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── XP ─────────────────────────────────────────────
const awardedComposers = new Set();
function awardComposerXP(composerId, composerName) {
  const btn = document.getElementById(`composerXPBtn-${composerId}`);
  if (awardedComposers.has(composerId)) {
    if (btn) btn.textContent = '✓ XP Already Earned';
    return;
  }
  awardedComposers.add(composerId);
  const xp = 30;
  if (window.HarmoniaDB) HarmoniaDB.addXP(xp, `Studied ${composerName}`);
  if (btn) {
    btn.textContent = `✓ +${xp} XP Earned!`;
    btn.style.background = 'rgba(52,211,153,0.1)';
    btn.style.borderColor = 'rgba(52,211,153,0.3)';
    btn.style.color = '#34d399';
  }
  showCLToast(`+${xp} XP — Studied ${composerName}`, xp);
}

function showCLToast(msg, xp) {
  const toast = document.getElementById('mhXPToast');
  if (!toast) return;
  toast.querySelector('.mh-xp-toast-icon').textContent = '🎼';
  toast.querySelector('.mh-xp-toast-text strong').textContent = `+${xp} XP Earned!`;
  toast.querySelector('.mh-xp-toast-text span').textContent = msg;
  toast.querySelector('.mh-xp-amount').textContent = `+${xp} XP`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

// ── Featured Composer rotation ─────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const featured = COMPOSERS[Math.floor(Math.random() * COMPOSERS.length)];
  const nameEl = document.getElementById('featuredName');
  const subEl  = document.getElementById('featuredSub');
  const btn    = document.getElementById('featuredBtn');
  if (nameEl) nameEl.textContent = featured.name;
  if (subEl)  subEl.textContent  = `${featured.nationality} · ${featured.life} · ${featured.works_count}+ works`;
  if (btn)    btn.onclick = () => openComposerModal(featured.id);
});

// ── Utility ────────────────────────────────────────
function hexToRgbC(hex) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
