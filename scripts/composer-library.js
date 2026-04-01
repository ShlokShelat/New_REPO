/**
 * composer-library.js — Hall of Fame Redesign
 * Animated cards, influence bars, cinematic modal
 */

/* ══════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════ */
const COMPOSERS = [
  {
    id: 'bach',
    name: 'Johann Sebastian Bach',
    initials: 'JSB',
    life: '1685 – 1750',
    nationality: '🇩🇪 German',
    era: 'baroque',
    eraLabel: 'Baroque',
    color: '#d97706',
    grad: 'linear-gradient(135deg,#b45309,#fbbf24)',
    instruments: ['Organ', 'Harpsichord', 'Violin'],
    genres: ['Baroque', 'Sacred', 'Counterpoint'],
    works_count: 1100,
    influence: 98,
    bio: 'The supreme master of Baroque counterpoint. Bach synthesized all the musical traditions of his era into an incomparable body of work spanning sacred cantatas, keyboard suites, orchestral concertos, and towering fugues. His Well-Tempered Clavier, Brandenburg Concertos, and Mass in B minor are among music\'s greatest achievements. Though little-known during his lifetime outside Germany, he is now universally regarded as one of the greatest composers in history.',
    quote: 'The aim and final end of all music should be none other than the glory of God and the refreshment of the soul.',
    quote_attr: '— J.S. Bach',
    works: [
      { year: '1721', title: 'Brandenburg Concertos', type: 'Orchestral Suite', desc: 'Six concertos written for Margrave Christian Ludwig of Brandenburg — a compendium of Baroque orchestral style at its finest.' },
      { year: '1722', title: 'The Well-Tempered Clavier, Book I', type: 'Keyboard', desc: '24 preludes and fugues in all major and minor keys — the "Old Testament" of keyboard music.' },
      { year: '1727', title: 'St. Matthew Passion', type: 'Sacred Oratorio', desc: "Bach's longest and greatest choral work — a dramatic retelling of Christ's passion. Revived by Mendelssohn a century after Bach's death." },
      { year: '1748', title: 'The Art of Fugue', type: 'Contrapuntal Study', desc: 'Left unfinished at his death, this work explores the fugue to its ultimate limits — perhaps music\'s most profound intellectual monument.' },
    ],
    influenced_by: ['Buxtehude', 'Pachelbel', 'Vivaldi', 'Frescobaldi'],
    influenced: ['Mozart', 'Beethoven', 'Brahms', 'Mendelssohn', 'All Western music'],
    trivia: [
      'Bach fathered 20 children across two marriages — four of his sons became famous composers.',
      'After his death his manuscripts were largely forgotten until Mendelssohn revived the St. Matthew Passion in 1829, triggering a Bach Renaissance.',
      'The BWV (Bach-Werke-Verzeichnis) catalogue of his works runs to over 1,080 entries — and scholars still find new pieces.',
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
    eraLabel: 'Classical',
    color: '#7c3aed',
    grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    instruments: ['Piano', 'Violin', 'Viola'],
    genres: ['Classical', 'Opera', 'Symphony'],
    works_count: 626,
    influence: 99,
    bio: 'A child prodigy who became music\'s most complete genius. Mozart wrote in every genre of his era with supernatural facility — operas, symphonies, concertos, chamber music, sacred works — combining formal perfection with inexhaustible melodic invention. He died at 35, leaving 626 catalogued works. His operas Don Giovanni, The Magic Flute, and Così fan tutte remain benchmarks of the form.',
    quote: "I pay no attention whatever to anybody's praise or blame. I simply follow my own feelings.",
    quote_attr: '— W.A. Mozart',
    works: [
      { year: '1787', title: 'Don Giovanni', type: 'Opera', desc: 'A drama of seduction, revenge and the supernatural — perhaps the greatest opera ever written.' },
      { year: '1788', title: 'Symphony No. 40 in G minor', type: 'Symphony', desc: 'One of only two minor-key symphonies Mozart wrote — emotional depth within perfect classical proportion.' },
      { year: '1791', title: 'The Magic Flute', type: 'Opera', desc: "Mozart's final opera — a Masonic fairy tale blending comedy, philosophy, and extraordinary music." },
      { year: '1791', title: 'Requiem in D minor', type: 'Choral', desc: 'Left incomplete at his death — the circumstances became legend, dramatized in the film "Amadeus."' },
    ],
    influenced_by: ['J.C. Bach', 'Haydn', 'Italian opera masters'],
    influenced: ['Beethoven', 'Schubert', 'Brahms', 'All Classical composers'],
    trivia: [
      'Mozart gave his first public recital at age 5 and was performing for European royalty by age 6.',
      'He composed his first symphony at age 8 and his first opera at age 12.',
      'Mozart could write out a complete orchestral score without revisions — he composed entire works in his head first.',
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
    eraLabel: 'Classical → Romantic',
    color: '#6d28d9',
    grad: 'linear-gradient(135deg,#6d28d9,#8b5cf6)',
    instruments: ['Piano', 'Violin'],
    genres: ['Classical', 'Romantic', 'Symphony'],
    works_count: 138,
    influence: 100,
    bio: 'The towering bridge between Classical and Romantic eras. Beethoven transformed every musical form he touched — expanding the symphony into a philosophical statement, the piano sonata into a confessional, the string quartet into a conversation across centuries. He composed his greatest works — the Ninth Symphony, the late string quartets — after going completely deaf. His influence on all subsequent music is immeasurable.',
    quote: "Music is a higher revelation than all wisdom and philosophy.",
    quote_attr: '— L. van Beethoven',
    works: [
      { year: '1808', title: 'Symphony No. 5 in C minor', type: 'Symphony', desc: "The four-note fate motif — da-da-da-DUM — is the most recognizable opening in all classical music." },
      { year: '1810', title: 'Piano Sonata "Für Elise"', type: 'Keyboard', desc: 'A deceptively simple yet eternally beloved bagatelle — every piano student\'s rite of passage.' },
      { year: '1827', title: 'Symphony No. 9 in D minor', type: 'Symphony', desc: 'The choral finale with Schiller\'s "Ode to Joy" — composed when Beethoven was completely deaf.' },
      { year: '1827', title: 'String Quartet Op. 131', type: 'Chamber Music', desc: 'Beethoven\'s late quartets are considered his greatest achievement — music centuries ahead of their time.' },
    ],
    influenced_by: ['Haydn', 'Mozart', 'C.P.E. Bach'],
    influenced: ['Brahms', 'Wagner', 'Mahler', 'Schoenberg', 'Every composer since 1827'],
    trivia: [
      'Beethoven began losing his hearing in his late 20s and was almost completely deaf by his late 40s — yet wrote his greatest works in this period.',
      'He reportedly cut the legs off his piano and placed it on the floor so he could feel the vibrations through the floorboards.',
      'Beethoven\'s Ninth was premiered when he was completely deaf — he had to be turned around by a soloist to see the audience\'s standing ovation.',
    ],
    legacy: { harmony: 98, melody: 94, rhythm: 96, innovation: 100, influence: 100 },
  },
  {
    id: 'chopin',
    name: 'Frédéric Chopin',
    initials: 'FC',
    life: '1810 – 1849',
    nationality: '🇵🇱 Polish-French',
    era: 'romantic',
    eraLabel: 'Romantic',
    color: '#be185d',
    grad: 'linear-gradient(135deg,#9d174d,#f9a8d4)',
    instruments: ['Piano'],
    genres: ['Romantic', 'Piano', 'Nocturne'],
    works_count: 230,
    influence: 97,
    bio: 'The poet of the piano. Chopin spent virtually his entire mature career writing for a single instrument — and in doing so redefined what it could be. His nocturnes are moonlit meditations; his études are virtuosic poems that redefined technique; his mazurkas and polonaises encode Polish national identity into musical DNA. He lived a short, turbulent life in Paris, dying of tuberculosis at 39.',
    quote: "Bach is an astronomer, discovering the most marvelous stars. Beethoven challenges the universe. I only try to express the soul and the heart of man.",
    quote_attr: '— F. Chopin',
    works: [
      { year: '1831', title: 'Nocturnes Op. 9', type: 'Piano', desc: 'Three intimate night-pieces that defined the nocturne genre and the Romantic piano ideal.' },
      { year: '1833', title: 'Études Op. 10', type: 'Piano Studies', desc: '12 études that are simultaneously technical exercises and poetic masterpieces.' },
      { year: '1842', title: 'Ballade No. 1 in G minor', type: 'Piano', desc: 'A four-minute narrative arc from quiet mystery to devastating final coda — the Romantic piano conceit at its finest.' },
      { year: '1847', title: 'Piano Sonata No. 3 in B minor', type: 'Sonata', desc: "Chopin's most extended and ambitious work — a four-movement architectural triumph." },
    ],
    influenced_by: ['Bach', 'Mozart', 'Hummel', 'Field'],
    influenced: ['Liszt', 'Debussy', 'Ravel', 'Scriabin', 'All pianists'],
    trivia: [
      'Chopin gave very few public concerts — he preferred intimate salon performances for small audiences.',
      'He spent 10 turbulent years in a relationship with the novelist George Sand, a woman who dressed as a man and smoked cigars.',
      'Chopin requested that his heart be removed after his death and returned to Poland, where it remains, preserved in a church in Warsaw.',
    ],
    legacy: { harmony: 97, melody: 99, rhythm: 90, innovation: 96, influence: 97 },
  },
  {
    id: 'vivaldi',
    name: 'Antonio Vivaldi',
    initials: 'AV',
    life: '1678 – 1741',
    nationality: '🇮🇹 Italian',
    era: 'baroque',
    eraLabel: 'Baroque',
    color: '#b45309',
    grad: 'linear-gradient(135deg,#92400e,#fbbf24)',
    instruments: ['Violin', 'Harpsichord'],
    genres: ['Baroque', 'Concerto', 'Opera'],
    works_count: 500,
    influence: 88,
    bio: 'The "Red Priest" of Venice. Vivaldi composed over 500 concertos during his prolific career as director of music at a Venetian orphanage for girls. His breakthrough use of the three-movement concerto form and his vivid programmatic writing — most famously The Four Seasons — shaped the Baroque concerto and directly influenced J.S. Bach, who transcribed many of his works.',
    quote: "Do not play what the audience expects. Play what you hear.",
    quote_attr: '— attributed to A. Vivaldi',
    works: [
      { year: '1725', title: 'The Four Seasons', type: 'Violin Concertos', desc: 'Four concertos with poetic sonnets describing each season — the first great programmatic music.' },
      { year: '1711', title: "L'estro armonico Op. 3", type: 'Concertos', desc: '12 concertos that stunned Europe and were transcribed by Bach himself.' },
      { year: '1720', title: 'Gloria in D major', type: 'Sacred Choral', desc: "Vivaldi's most celebrated choral work — joyful, brilliant, and endlessly performed." },
    ],
    influenced_by: ['Corelli', 'Torelli'],
    influenced: ['J.S. Bach', 'Handel', 'Baroque concerto tradition'],
    trivia: [
      'Vivaldi was an ordained priest but never celebrated Mass, citing ill health — he preferred composing and playing violin.',
      'He was almost completely forgotten after his death; his manuscripts were rediscovered in a Turin monastery in the 1920s.',
      'Bach admired Vivaldi so much he transcribed at least 9 of his concertos for keyboard and orchestra.',
    ],
    legacy: { harmony: 80, melody: 92, rhythm: 88, innovation: 88, influence: 88 },
  },
  {
    id: 'debussy',
    name: 'Claude Debussy',
    initials: 'CD',
    life: '1862 – 1918',
    nationality: '🇫🇷 French',
    era: 'modern',
    eraLabel: 'Impressionist',
    color: '#0ea5e9',
    grad: 'linear-gradient(135deg,#0369a1,#38bdf8)',
    instruments: ['Piano', 'Organ'],
    genres: ['Impressionism', 'Modern', 'Orchestral'],
    works_count: 141,
    influence: 94,
    bio: 'The father of musical Impressionism, though he rejected the label. Debussy dissolved the rigid structures of German Romanticism in favor of shimmering, atmospheric sound-worlds — water, moonlight, wind, the ocean. His harmonic language (whole-tone scales, unresolved chords, modal harmonies) was revolutionary and opened the door to 20th-century music. Without Debussy, jazz, film music, and modernism would be unthinkable.',
    quote: "Music is the space between the notes.",
    quote_attr: '— C. Debussy',
    works: [
      { year: '1905', title: 'La mer', type: 'Orchestral', desc: 'Three symphonic sketches of the sea — perhaps the most beautiful orchestral sound-painting ever written.' },
      { year: '1905', title: "Children's Corner Suite", type: 'Piano', desc: 'Six charming piano pieces written for his daughter — including the famous "Golliwog\'s Cakewalk."' },
      { year: '1910', title: 'Préludes, Book I', type: 'Piano', desc: '12 evocative character pieces — "La cathédrale engloutie," "La fille aux cheveux de lin," and other immortal miniatures.' },
      { year: '1902', title: 'Pelléas et Mélisande', type: 'Opera', desc: 'A revolutionary opera of suggestion and half-spoken text — the antithesis of Wagnerian drama.' },
    ],
    influenced_by: ['Wagner', 'Satie', 'Javanese gamelan music'],
    influenced: ['Ravel', 'Bartók', 'Stravinsky', 'Film composers', 'Jazz harmony'],
    trivia: [
      'Debussy was profoundly changed by hearing Javanese gamelan music at the 1889 Paris World Exhibition — its microtones and textures are reflected throughout his work.',
      'He clashed repeatedly with the Paris Conservatoire examiners for his "forbidden" parallel fifths and unresolved dissonances.',
      'Debussy died during the German bombing of Paris in World War I — bombs were falling as he breathed his last.',
    ],
    legacy: { harmony: 100, melody: 88, rhythm: 82, innovation: 98, influence: 94 },
  },
  {
    id: 'brahms',
    name: 'Johannes Brahms',
    initials: 'JB',
    life: '1833 – 1897',
    nationality: '🇩🇪 German',
    era: 'romantic',
    eraLabel: 'Romantic',
    color: '#9d174d',
    grad: 'linear-gradient(135deg,#831843,#fda4af)',
    instruments: ['Piano'],
    genres: ['Romantic', 'Symphony', 'Chamber'],
    works_count: 122,
    influence: 93,
    bio: 'The great conservative of the Romantic era — the man who looked backward to Bach and Beethoven while all around him looked forward to Wagner. Brahms took Classical forms — the symphony, the sonata, the concerto — and filled them with Romantic feeling and supreme craftsmanship. His four symphonies, two piano concertos, and chamber works are cornerstones of the repertoire.',
    quote: "Without craftsmanship, inspiration is a mere reed shaken in the wind.",
    quote_attr: '— J. Brahms',
    works: [
      { year: '1877', title: 'Symphony No. 2 in D major', type: 'Symphony', desc: "Brahms's most lyrical symphony — the one Schumann's widow Clara called his 'pastoral' work." },
      { year: '1881', title: 'Piano Concerto No. 2 in B-flat major', type: 'Concerto', desc: 'One of the longest and most demanding piano concertos ever written — four vast movements.' },
      { year: '1885', title: 'Symphony No. 4 in E minor', type: 'Symphony', desc: 'Brahms\'s final symphony — ending with a passacaglia in the manner of Bach, looking backward as the future beckoned.' },
      { year: '1891', title: 'Clarinet Quintet in B minor', type: 'Chamber Music', desc: "Written in Brahms's twilight years, imbued with autumnal warmth and melancholy." },
    ],
    influenced_by: ['Bach', 'Beethoven', 'Schumann'],
    influenced: ['Schoenberg', 'Reger', 'Bartók'],
    trivia: [
      'Brahms was the leader of the "conservative" camp in the great 19th-century "War of the Romantics" against the "progressives" led by Wagner and Liszt.',
      'He was a close friend and champion of Clara Schumann — and almost certainly in love with her, though nothing came of it.',
      'Brahms was notoriously self-critical — he destroyed dozens of completed works he felt were not good enough, including 20 string quartets before allowing Op. 51 to be published.',
    ],
    legacy: { harmony: 95, melody: 88, rhythm: 86, innovation: 80, influence: 93 },
  },
  {
    id: 'wagner',
    name: 'Richard Wagner',
    initials: 'RW',
    life: '1813 – 1883',
    nationality: '🇩🇪 German',
    era: 'romantic',
    eraLabel: 'Romantic',
    color: '#831843',
    grad: 'linear-gradient(135deg,#4c0519,#f43f5e)',
    instruments: ['Piano'],
    genres: ['Opera', 'Music Drama', 'Romantic'],
    works_count: 113,
    influence: 96,
    bio: 'The most ambitious and controversial composer in history. Wagner created "music drama" — a total art form fusing music, poetry, drama, and design. His Ring cycle (15 hours across four operas) is still the most monumental work in the operatic canon. His harmonic language pushed tonality to its breaking point, directly paving the way for Schoenberg\'s atonality and the entire 20th century.',
    quote: "Joy is not in things; it is in us.",
    quote_attr: '— R. Wagner',
    works: [
      { year: '1843', title: 'Der fliegende Holländer', type: 'Opera', desc: "Wagner's first mature work — a ghost-ship tale with a redemption through love theme he'd return to throughout his career." },
      { year: '1865', title: 'Tristan und Isolde', type: 'Music Drama', desc: 'The most harmonically radical work of the 19th century — the "Tristan chord" shattered tonal norms and haunted the next 100 years.' },
      { year: '1876', title: 'Der Ring des Nibelungen', type: 'Music Drama Cycle', desc: 'A 15-hour, 4-opera epic of Norse mythology. Wagner spent 26 years writing it and built an entire opera house to stage it.' },
      { year: '1882', title: 'Parsifal', type: 'Music Drama', desc: "Wagner's final work — a deeply mystical 'sacred festival play' about the Holy Grail, written for his own Bayreuth festival." },
    ],
    influenced_by: ['Beethoven', 'Weber', 'Meyerbeer'],
    influenced: ['Bruckner', 'Mahler', 'Strauss', 'Schoenberg', 'Film music'],
    trivia: [
      'Wagner was one of the most controversial and unpleasant personalities in music history — an egomaniac, an anti-Semite, and a man who seduced the wives of his patrons.',
      'He built his own opera house (the Bayreuth Festspielhaus) specifically designed to perform his Ring cycle, opened 1876. It still operates today.',
      "Despite his dark character, Wagner's music was beloved by Hitler — which permanently tainted his reputation in the 20th century.",
    ],
    legacy: { harmony: 98, melody: 90, rhythm: 82, innovation: 99, influence: 96 },
  },
  {
    id: 'handel',
    name: 'George Frideric Handel',
    initials: 'GFH',
    life: '1685 – 1759',
    nationality: '🇩🇪🇬🇧 German-British',
    era: 'baroque',
    eraLabel: 'Baroque',
    color: '#ca8a04',
    grad: 'linear-gradient(135deg,#92400e,#fde68a)',
    instruments: ['Harpsichord', 'Organ'],
    genres: ['Baroque', 'Oratorio', 'Opera'],
    works_count: 600,
    influence: 87,
    bio: 'The great popularizer of Baroque music, a savvy entrepreneur who mastered opera seria in Italy before conquering London with a flood of operas and then, after those failed commercially, reinventing the English oratorio. Messiah is the most performed choral work in history. His Water Music and Fireworks Music were composed for outdoor royal spectacles and remain beloved.',
    quote: "Whether I was in my body or out of my body as I wrote it I know not. God knows.",
    quote_attr: '— G.F. Handel, on composing the "Hallelujah" chorus',
    works: [
      { year: '1717', title: 'Water Music', type: 'Orchestral Suite', desc: 'Three suites composed for a royal procession on the Thames — now a popular concert staple.' },
      { year: '1741', title: 'Messiah', type: 'Oratorio', desc: 'The most performed choral work in history — composed in 24 days. Audiences traditionally stand for the "Hallelujah" chorus.' },
      { year: '1749', title: 'Music for the Royal Fireworks', type: 'Orchestral', desc: "Written for George II's victory celebrations — the original performance used 100 instruments outdoors." },
    ],
    influenced_by: ['Corelli', 'Stradella', 'Purcell'],
    influenced: ['Haydn', 'Beethoven', 'Mendelssohn'],
    trivia: [
      "Handel composed Messiah in 24 days — an almost supernatural feat of sustained inspiration.",
      'He had a violent quarrel with fellow composer Domenico Scarlatti early in his career — they had a keyboard "duel" that was judged a draw.',
      "Handel was the first composer to make a living entirely from public performances rather than aristocratic patronage — essentially the first music entrepreneur.",
    ],
    legacy: { harmony: 84, melody: 92, rhythm: 80, innovation: 82, influence: 87 },
  },
  {
    id: 'schubert',
    name: 'Franz Schubert',
    initials: 'FS',
    life: '1797 – 1828',
    nationality: '🇦🇹 Austrian',
    era: 'romantic',
    eraLabel: 'Early Romantic',
    color: '#c2410c',
    grad: 'linear-gradient(135deg,#9a3412,#fb923c)',
    instruments: ['Piano', 'Violin'],
    genres: ['Romantic', 'Lied', 'Chamber'],
    works_count: 998,
    influence: 90,
    bio: 'The greatest songwriter in history, and far more besides. Schubert died at 31 having composed nearly 1,000 works — including over 600 songs (Lieder) that permanently elevated the genre. He wrote his late masterpieces — the Winterreise song cycle, String Quintet, and Symphony No. 9 — as his health failed from syphilis. He lived in poverty, was virtually unknown outside Vienna, and was buried next to Beethoven at his own request.',
    quote: "I have come into the world for no other purpose than to compose.",
    quote_attr: '— F. Schubert',
    works: [
      { year: '1823', title: 'Die schöne Müllerin', type: 'Song Cycle', desc: '20 songs on poems by Müller — a young man\'s doomed love for a miller\'s daughter, told through water imagery.' },
      { year: '1828', title: 'Winterreise', type: 'Song Cycle', desc: '24 songs of a man walking into the winter — perhaps the most devastating journey in all music.' },
      { year: '1828', title: 'String Quintet in C major', type: 'Chamber Music', desc: "Written in the last weeks of his life — widely considered the most beautiful chamber music ever written." },
      { year: '1828', title: 'Symphony No. 9 "The Great"', type: 'Symphony', desc: 'The symphony Brahms called his model — heavenly in length, Romantic in spirit, Classical in form.' },
    ],
    influenced_by: ['Beethoven', 'Mozart', 'Haydn'],
    influenced: ['Brahms', 'Schumann', 'Wolf', 'Mahler'],
    trivia: [
      'Schubert wrote two complete song cycles and a symphony in his final year — while dying of syphilis.',
      "He idolized Beethoven but was too shy to visit him despite living in the same city. They met only once, very briefly, a week before Beethoven died.",
      'Schubert was so productive that he sometimes forgot having written certain pieces — rediscovering them when friends played them for him.',
    ],
    legacy: { harmony: 92, melody: 98, rhythm: 82, innovation: 88, influence: 90 },
  },
  {
    id: 'liszt',
    name: 'Franz Liszt',
    initials: 'FL',
    life: '1811 – 1886',
    nationality: '🇭🇺 Hungarian',
    era: 'romantic',
    eraLabel: 'Romantic',
    color: '#ea580c',
    grad: 'linear-gradient(135deg,#c2410c,#fb923c)',
    instruments: ['Piano'],
    genres: ['Romantic', 'Piano', 'Symphonic Poem'],
    works_count: 700,
    influence: 91,
    bio: 'The greatest piano virtuoso who ever lived, and arguably the most generous figure in the history of music. Liszt invented the piano recital (the solo concert format), invented the symphonic poem form, championed every contemporary composer from Berlioz to Wagner, and gave away enormous sums to music charities and students. In his youth he was the first modern celebrity — women fainted at his concerts in what newspapers called "Lisztomania."',
    quote: "Mournful and yet grand is the destiny of the artist.",
    quote_attr: '— F. Liszt',
    works: [
      { year: '1849', title: 'Transcendental Études', type: 'Piano', desc: '12 studies of impossible difficulty that defined the limits of piano technique for a century.' },
      { year: '1854', title: 'Les Préludes', type: 'Symphonic Poem', desc: 'One of the first and most famous symphonic poems — music that tells a literary narrative without words.' },
      { year: '1854', title: 'Piano Sonata in B minor', type: 'Piano', desc: 'A single-movement, 30-minute titan — perhaps the most ambitious solo piano work ever written.' },
      { year: '1885', title: 'Nuages Gris', type: 'Piano', desc: "Late pieces of extraordinary harmonic prescience — foreshadowing Debussy and even Schoenberg in Liszt's final years." },
    ],
    influenced_by: ['Paganini', 'Chopin', 'Schubert'],
    influenced: ['Wagner', 'Debussy', 'Bartók', 'Scriabin', 'Every pianist since'],
    trivia: [
      'Liszt suffered from "Lisztomania" — women would rush the stage, tear his gloves off, and fight over his cigarette butts and broken piano strings.',
      'In his 50s he took minor holy orders, became the Abbé Liszt, and lived a life of increasing religious devotion while still composing.',
      'He never charged for teaching — at his master classes in Weimar he taught for free, an almost unprecedented act of generosity in the music world.',
    ],
    legacy: { harmony: 90, melody: 94, rhythm: 88, innovation: 96, influence: 91 },
  },
  {
    id: 'stravinsky',
    name: 'Igor Stravinsky',
    initials: 'IS',
    life: '1882 – 1971',
    nationality: '🇷🇺🇺🇸 Russian-American',
    era: 'modern',
    eraLabel: '20th Century',
    color: '#0284c7',
    grad: 'linear-gradient(135deg,#0369a1,#7dd3fc)',
    instruments: ['Piano'],
    genres: ['Modernism', 'Ballet', 'Neo-Classical'],
    works_count: 128,
    influence: 95,
    bio: 'The most influential composer of the 20th century. Stravinsky reinvented himself three times — as a Romantic Russian nationalist (The Firebird), as a primitivist modernist (The Rite of Spring), as a Neo-Classicist, and finally as a serialist. His rhythmic innovations in The Rite of Spring permanently changed music; its premiere in 1913 caused a riot. He composed for 60 years, never repeating himself.',
    quote: "Lesser artists borrow, great artists steal.",
    quote_attr: '— I. Stravinsky',
    works: [
      { year: '1910', title: 'The Firebird', type: 'Ballet', desc: "Stravinsky's first masterpiece — a brilliant showcase of Russian color and orchestral virtuosity." },
      { year: '1913', title: 'The Rite of Spring', type: 'Ballet', desc: 'Its Paris premiere caused a riot. A century later it remains the most rhythmically radical score ever written.' },
      { year: '1920', title: 'Pulcinella', type: 'Ballet', desc: "Stravinsky's turn to Neo-Classicism — reworking Pergolesi with 20th-century wit and irony." },
      { year: '1951', title: 'The Rake\'s Progress', type: 'Opera', desc: "Stravinsky's only full-length opera — a masterpiece of Neo-Classical style based on Hogarth's engravings." },
    ],
    influenced_by: ['Rimsky-Korsakov', 'Debussy', 'Bach'],
    influenced: ['Bartók', 'Messiaen', 'Adams', 'All 20th-century composers'],
    trivia: [
      'The Rite of Spring premiere (May 29, 1913) caused one of the most famous riots in music history — the audience booed, cheered, and brawled in the aisles.',
      'Stravinsky lived to 88, composing nearly to the end. He was buried in Venice, next to his longtime collaborator Serge Diaghilev.',
      'He was notoriously litigious about copyright and royalties — an irony given his famous quote about stealing.',
    ],
    legacy: { harmony: 90, melody: 85, rhythm: 100, innovation: 98, influence: 95 },
  },
];

const ERA_ORDER = ['baroque', 'classical', 'romantic', 'modern'];
const ERA_NAMES = { baroque: 'Baroque', classical: 'Classical', romantic: 'Romantic', modern: '20th Century' };

/* ══════════════════════════════════════════════════
   STATE
   ══════════════════════════════════════════════════ */
let currentEra     = 'all';
let currentSort    = 'influence';
let currentSearch  = '';
let currentView    = 'grid';
let featuredId     = null;
const awardedSet   = new Set();

/* ══════════════════════════════════════════════════
   INIT
   ══════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  setupFeatured();
  renderComposers();
  setupSearch();
  setupEraFilter();
  setupSort();
  setupObserver();
});

/* ══════════════════════════════════════════════════
   FEATURED COMPOSER
   ══════════════════════════════════════════════════ */
function setupFeatured() {
  const picks = ['beethoven', 'bach', 'mozart', 'chopin', 'debussy'];
  featuredId = picks[Math.floor(Math.random() * picks.length)];
  const c = COMPOSERS.find(x => x.id === featuredId);
  if (!c) return;

  const avatar = document.getElementById('featuredAvatar');
  const name   = document.getElementById('featuredName');
  const sub    = document.getElementById('featuredSub');
  if (avatar) { avatar.textContent = c.initials; avatar.style.background = c.grad; }
  if (name)   name.textContent = c.name;
  if (sub)    sub.textContent  = `${c.eraLabel} · ${c.life} · ${c.nationality}`;
}

window.openFeaturedComposer = function() {
  if (featuredId) openComposerModal(featuredId);
};

/* ══════════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════════ */
function renderComposers() {
  const grid  = document.getElementById('composersGrid');
  const empty = document.getElementById('clEmptyState');
  if (!grid) return;

  let list = [...COMPOSERS];

  // Filter
  if (currentEra !== 'all') list = list.filter(c => c.era === currentEra);

  // Search
  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    list = list.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.nationality.toLowerCase().includes(q) ||
      c.eraLabel.toLowerCase().includes(q) ||
      c.genres.some(g => g.toLowerCase().includes(q)) ||
      c.instruments.some(i => i.toLowerCase().includes(q))
    );
  }

  // Sort
  if (currentSort === 'influence') list.sort((a,b) => b.influence - a.influence);
  else if (currentSort === 'name')  list.sort((a,b) => a.name.localeCompare(b.name));
  else if (currentSort === 'era')   list.sort((a,b) => ERA_ORDER.indexOf(a.era) - ERA_ORDER.indexOf(b.era));
  else if (currentSort === 'works') list.sort((a,b) => b.works_count - a.works_count);

  if (list.length === 0) {
    grid.innerHTML = '';
    if (empty) empty.style.display = 'block';
    return;
  }
  if (empty) empty.style.display = 'none';

  grid.className = `cl-composers-grid${currentView === 'list' ? ' list-view' : ''}`;

  grid.innerHTML = list.map((c, i) => `
    <div class="composer-card" onclick="openComposerModal('${c.id}')"
         style="--comp-grad:${c.grad};--comp-color:${c.color};--inf-w:${c.influence}%;animation-delay:${i * 0.04}s">
      <div class="cc-accent-bar" style="background:${c.grad}"></div>
      <div class="cc-avatar-wrap">
        <div class="cc-avatar">${c.initials}</div>
        <div class="cc-identity">
          <div class="cc-name">${c.name}</div>
          <div class="cc-meta">${c.life} · ${c.nationality}</div>
          <div class="cc-era-tag" style="color:${c.color};background:rgba(${hexToRgbCL(c.color)},0.1);border-color:rgba(${hexToRgbCL(c.color)},0.2)">${c.eraLabel}</div>
        </div>
      </div>
      <div class="cc-influence-wrap">
        <div class="cc-influence-label">
          <span>Influence Score</span>
          <span>${c.influence}/100</span>
        </div>
        <div class="cc-influence-track">
          <div class="cc-influence-fill"></div>
        </div>
      </div>
      <div class="cc-bio-wrap">${c.bio.substring(0, 140)}…</div>
      <div class="cc-tags-wrap">
        ${c.instruments.map(t => `<span class="cc-tag">🎵 ${t}</span>`).join('')}
        ${c.genres.slice(0,2).map(t => `<span class="cc-tag">${t}</span>`).join('')}
        <span class="cc-tag">📖 ${c.works_count}+ works</span>
      </div>
    </div>
  `).join('');
}

/* ══════════════════════════════════════════════════
   INTERSECTION OBSERVER  →  animate influence bars
   ══════════════════════════════════════════════════ */
function setupObserver() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  // Re-observe whenever grid is re-rendered
  const grid = document.getElementById('composersGrid');
  if (grid) {
    const mutObs = new MutationObserver(() => {
      grid.querySelectorAll('.composer-card').forEach(card => obs.observe(card));
    });
    mutObs.observe(grid, { childList: true });
    grid.querySelectorAll('.composer-card').forEach(card => obs.observe(card));
  }
}

/* ══════════════════════════════════════════════════
   CONTROLS
   ══════════════════════════════════════════════════ */
function setupSearch() {
  const input = document.getElementById('composerSearch');
  if (!input) return;
  input.addEventListener('input', () => { currentSearch = input.value; renderComposers(); });
}

function setupEraFilter() {
  document.querySelectorAll('.cl-era-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cl-era-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentEra = btn.dataset.era;
      renderComposers();
    });
  });
}

function setupSort() {
  const sel = document.getElementById('composerSort');
  if (!sel) return;
  sel.addEventListener('change', () => { currentSort = sel.value; renderComposers(); });
}

window.setView = function(v) {
  currentView = v;
  document.querySelectorAll('.cl-view-btn').forEach(b => b.classList.toggle('active', b.dataset.view === v));
  renderComposers();
};

window.clearComposerSearch = function() {
  currentSearch = '';
  const input = document.getElementById('composerSearch');
  if (input) input.value = '';
  renderComposers();
};

/* ══════════════════════════════════════════════════
   MODAL
   ══════════════════════════════════════════════════ */
window.openComposerModal = function(id) {
  const c = COMPOSERS.find(x => x.id === id);
  if (!c) return;
  const overlay = document.getElementById('composerModal');
  const content = document.getElementById('composerModalContent');
  if (!overlay || !content) return;

  const rgb = hexToRgbCL(c.color);
  const legacyKeys = ['harmony','melody','rhythm','innovation','influence'];

  content.innerHTML = `
    <!-- Hero -->
    <div class="cl-modal-hero" style="--hero-rgb:${rgb}">
      <button class="cl-modal-close" onclick="closeComposerModal()">✕</button>
      <div class="cl-modal-hero-top">
        <div class="cl-modal-avatar" style="background:${c.grad}">${c.initials}</div>
        <div class="cl-modal-id">
          <div class="cl-modal-name">${c.name}</div>
          <div class="cl-modal-sub">
            <span>📅 ${c.life}</span>
            <span>${c.nationality}</span>
            <span style="background:rgba(${rgb},0.12);padding:2px 10px;border-radius:8px;color:${c.color};font-weight:700;border:1px solid rgba(${rgb},0.2)">${c.eraLabel}</span>
            <span>📚 ${c.works_count}+ works</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Quote -->
    <div class="cl-quote" style="--comp-modal-color:${c.color}">
      <p>"${c.quote}"</p>
      <cite>${c.quote_attr}</cite>
    </div>

    <!-- Body -->
    <div class="cl-modal-body">

      <!-- Bio -->
      <div>
        <div class="cl-section-label">Biography</div>
        <div class="cl-bio-text">${c.bio}</div>
      </div>

      <!-- Works Timeline -->
      <div>
        <div class="cl-section-label">Essential Works</div>
        <div class="cl-works-timeline" style="--comp-modal-color:${c.color};--comp-modal-grad:${c.grad}">
          ${c.works.map(w => `
            <div class="cl-work-entry">
              <div class="cl-work-year-col">
                <div class="cl-work-year-dot">${w.year.slice(-2)}</div>
                <div class="cl-work-year-num">${w.year}</div>
              </div>
              <div class="cl-work-card">
                <div class="cl-work-title">${w.title}</div>
                <div class="cl-work-type">${w.type}</div>
                <div class="cl-work-desc">${w.desc}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Influence network -->
      <div>
        <div class="cl-section-label">Influence Network</div>
        <div class="cl-influence-grid">
          <div class="cl-influence-card">
            <h5>Influenced by</h5>
            <div class="cl-influence-names">
              ${c.influenced_by.map(n => `<span class="cl-influence-name" style="background:rgba(${rgb},0.08);border-color:rgba(${rgb},0.2);color:${c.color}">${n}</span>`).join('')}
            </div>
          </div>
          <div class="cl-influence-card">
            <h5>Influenced</h5>
            <div class="cl-influence-names">
              ${c.influenced.map(n => `<span class="cl-influence-name">${n}</span>`).join('')}
            </div>
          </div>
        </div>
      </div>

      <!-- Legacy scores -->
      <div>
        <div class="cl-section-label">Legacy Scores</div>
        <div class="cl-legacy-bars">
          ${legacyKeys.map(k => `
            <div class="cl-legacy-bar">
              <div class="cl-legacy-label">${k.charAt(0).toUpperCase()+k.slice(1)}</div>
              <div class="cl-legacy-track">
                <div class="cl-legacy-fill" style="width:${c.legacy[k]}%;background:${c.grad}"></div>
              </div>
              <div class="cl-legacy-val" style="color:${c.color}">${c.legacy[k]}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Trivia -->
      <div>
        <div class="cl-section-label">Did You Know?</div>
        <div class="cl-trivia-list">
          ${c.trivia.map((t, i) => `
            <div class="cl-trivia-item">
              <div class="cl-trivia-num">${i+1}</div>
              <div>${t}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CTAs + XP -->
      <div class="cl-modal-ctas">
        <button class="cl-modal-btn-primary" onclick="awardComposerXP('${c.id}','${c.name}'); this.textContent='✓ XP Earned!'; this.disabled=true">
          ⭐ Earn +30 XP
        </button>
        <button class="cl-modal-btn-secondary" onclick="closeComposerModal()">← Back to Library</button>
        <a href="era-timeline.html#era-${c.era}" class="cl-modal-btn-secondary" style="text-decoration:none;display:inline-flex;align-items:center;gap:6px">
          📅 View ${c.eraLabel} Era
        </a>
      </div>

    </div>
  `;

  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
};

window.closeComposerModal = function() {
  const overlay = document.getElementById('composerModal');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
};

// Close on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('composerModal');
  if (overlay) overlay.addEventListener('click', e => { if (e.target === overlay) closeComposerModal(); });
  // ESC
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeComposerModal(); });
});

/* ══════════════════════════════════════════════════
   XP
   ══════════════════════════════════════════════════ */
function awardComposerXP(composerId, composerName) {
  if (awardedSet.has(composerId)) return;
  awardedSet.add(composerId);
  const xp = 30;
  if (window.HarmoniaDB) HarmoniaDB.addXP(xp, `Studied composer: ${composerName}`);
  showCLToast(composerName, xp);
}

function showCLToast(name, xp) {
  const toast = document.getElementById('mhXPToast');
  if (!toast) return;
  toast.querySelector('.mh-xp-toast-icon').textContent = '🎼';
  toast.querySelector('.mh-xp-toast-text strong').textContent = `+${xp} XP Earned!`;
  toast.querySelector('.mh-xp-toast-text span').textContent = `Studied ${name}`;
  toast.querySelector('.mh-xp-amount').textContent = `+${xp} XP`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

/* ══════════════════════════════════════════════════
   UTILITY
   ══════════════════════════════════════════════════ */
function hexToRgbCL(hex) {
  if (!hex || hex.length < 6) return '167,139,250';
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${r},${g},${b}`;
}
