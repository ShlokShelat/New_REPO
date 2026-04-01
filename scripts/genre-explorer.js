/**
 * genre-explorer.js — Full Genre Explorer functionality
 * Genres data, filtering, modal, XP integration
 */

const GENRES = [
  {
    id: 'classical',
    name: 'Classical',
    emoji: '🎻',
    origin: 'Europe, 1750–1820',
    era: 'historical',
    bg: 'linear-gradient(135deg,#1a0d2e,#2d1547)',
    grad: 'linear-gradient(135deg,#7c3aed,#a78bfa)',
    color: '#7c3aed',
    tagColor: 'mh-tag-purple',
    popularity: 85,
    instruments: ['Piano', 'Violin', 'Cello', 'Flute', 'Oboe', 'Harpsichord'],
    tags: ['Orchestral', 'Formal', 'Structured', 'European'],
    desc: 'Music of formal European tradition featuring orchestras, complex compositions, and strict structural forms. Dominated by composers like Mozart, Haydn, and early Beethoven.',
    longDesc: 'Classical music in its strict sense refers to the period roughly 1750–1820, bridging the Baroque era and Romanticism. It is characterized by clear melodic lines, balanced phrases, and formal structures like the sonata form, symphony, and concerto. The style favored clarity and proportion over the complexity of Baroque counterpoint.',
    origin_full: 'Emerged in 18th-century European courts and concert halls, particularly in Vienna, Austria, which became the musical capital of the world. Patrons of nobility funded composers who wrote for both public concerts and private salons.',
    artists: [
      { name: 'W.A. Mozart', role: 'Composer', color: '#7c3aed', init: 'WM' },
      { name: 'J. Haydn',    role: 'Composer', color: '#6d28d9', init: 'JH' },
      { name: 'Beethoven',   role: 'Composer', color: '#5b21b6', init: 'LB' },
      { name: 'C.P.E. Bach', role: 'Composer', color: '#8b5cf6', init: 'CB' },
    ],
    subgenres: [
      { name: 'Symphony',       color: '#7c3aed' },
      { name: 'Chamber Music',  color: '#6d28d9' },
      { name: 'Concerto',       color: '#8b5cf6' },
      { name: 'Opera',          color: '#a78bfa' },
      { name: 'Sonata',         color: '#5b21b6' },
    ],
    albums: [
      { emoji: '🎶', title: 'The Magic Flute', artist: 'W.A. Mozart', year: 1791 },
      { emoji: '🎼', title: 'Symphony No. 94', artist: 'J. Haydn', year: 1791 },
      { emoji: '🎵', title: 'Moonlight Sonata', artist: 'Beethoven', year: 1801 },
    ],
    facts: [
      'Mozart composed his first minuet at age 5 and his first symphony at age 8.',
      'Haydn wrote 104 symphonies over his lifetime — more than any other major composer.',
      'The piano largely replaced the harpsichord during this era, revolutionizing keyboard music.',
    ],
    era_start: 1750, era_end: 1820, total_span: 500,
    lessons: 24, quizzes: 8,
  },
  {
    id: 'jazz',
    name: 'Jazz',
    emoji: '🎷',
    origin: 'New Orleans, USA, ~1900',
    era: 'modern',
    bg: 'linear-gradient(135deg,#1a0810,#2d0d1a)',
    grad: 'linear-gradient(135deg,#db2777,#ec4899)',
    color: '#db2777',
    tagColor: 'mh-tag-pink',
    popularity: 90,
    instruments: ['Trumpet', 'Saxophone', 'Double Bass', 'Piano', 'Drums', 'Trombone'],
    tags: ['Improvisation', 'Syncopation', 'Blues-influenced', 'American'],
    desc: 'America\'s greatest musical art form, born from the fusion of African rhythms, blues, and ragtime in the early 20th century. Improvisation is at its heart.',
    longDesc: 'Jazz emerged in New Orleans around 1900, blending African American musical traditions including blues, ragtime, and gospel with European harmonic structures. What set jazz apart was its emphasis on improvisation — musicians creating spontaneous melodic and harmonic variations in real time. The 20th century saw jazz evolve through Swing, Bebop, Cool Jazz, Fusion, and countless other forms.',
    origin_full: 'New Orleans\'s unique cultural mix of African, Caribbean, and European influences in the late 19th century created the perfect conditions for jazz to emerge. The city\'s tradition of public dancing in Congo Square allowed African musical practices to survive and blend with other traditions.',
    artists: [
      { name: 'Miles Davis',    role: 'Trumpet', color: '#db2777', init: 'MD' },
      { name: 'John Coltrane',  role: 'Saxophone', color: '#be185d', init: 'JC' },
      { name: 'Duke Ellington', role: 'Piano/Composer', color: '#9d174d', init: 'DE' },
      { name: 'Louis Armstrong',role: 'Trumpet/Vocals', color: '#ec4899', init: 'LA' },
    ],
    subgenres: [
      { name: 'Bebop',        color: '#db2777' },
      { name: 'Cool Jazz',    color: '#be185d' },
      { name: 'Swing',        color: '#9d174d' },
      { name: 'Fusion',       color: '#ec4899' },
      { name: 'Free Jazz',    color: '#f472b6' },
      { name: 'Latin Jazz',   color: '#a21caf' },
    ],
    albums: [
      { emoji: '🎷', title: 'Kind of Blue', artist: 'Miles Davis', year: 1959 },
      { emoji: '🎺', title: 'A Love Supreme', artist: 'John Coltrane', year: 1965 },
      { emoji: '🥁', title: 'Take Five', artist: 'Dave Brubeck', year: 1959 },
    ],
    facts: [
      'The word "jazz" first appeared in print in 1912 in a Los Angeles sports column.',
      '"Kind of Blue" by Miles Davis is the best-selling jazz album of all time, with over 5 million copies sold in the US alone.',
      'Jazz introduced the concept of the "break" — a brief moment where all musicians stop except one, who improvises.',
    ],
    era_start: 1900, era_end: 2024, total_span: 500,
    lessons: 31, quizzes: 10,
  },
  {
    id: 'rock',
    name: 'Rock',
    emoji: '🎸',
    origin: 'USA, UK, 1950s',
    era: 'modern',
    bg: 'linear-gradient(135deg,#0d1a10,#142014)',
    grad: 'linear-gradient(135deg,#16a34a,#4ade80)',
    color: '#16a34a',
    tagColor: 'mh-tag-green',
    popularity: 95,
    instruments: ['Electric Guitar', 'Bass Guitar', 'Drums', 'Vocals', 'Keyboard'],
    tags: ['Electric', 'Rebellious', 'Blues-derived', 'Band-based'],
    desc: 'A genre born from rock \'n\' roll that evolved into the dominant form of popular music. Electric guitars, powerful vocals, and high energy define its DNA.',
    longDesc: 'Rock music grew from rhythm and blues, country, and gospel traditions in the 1950s United States. It quickly became the dominant cultural force in Western music, with the British Invasion (led by The Beatles and Rolling Stones) cementing its global reach. Rock has continuously reinvented itself through psychedelia, prog, punk, metal, alternative, and indie, making it one of the most diverse genres.',
    origin_full: 'Rock emerged in the American South and Midwest in the early 1950s, with artists like Chuck Berry, Little Richard, and Elvis Presley defining its early sound. The electric guitar became its defining instrument, and amplified volume was central to its rebellious identity.',
    artists: [
      { name: 'The Beatles',    role: 'Rock Band', color: '#16a34a', init: '🎸' },
      { name: 'Led Zeppelin',   role: 'Hard Rock', color: '#15803d', init: 'LZ' },
      { name: 'Jimi Hendrix',   role: 'Guitar', color: '#166534', init: 'JH' },
      { name: 'David Bowie',    role: 'Art Rock', color: '#4ade80', init: 'DB' },
    ],
    subgenres: [
      { name: 'Classic Rock',  color: '#16a34a' },
      { name: 'Punk Rock',     color: '#dc2626' },
      { name: 'Metal',         color: '#374151' },
      { name: 'Alternative',   color: '#0ea5e9' },
      { name: 'Indie Rock',    color: '#8b5cf6' },
      { name: 'Prog Rock',     color: '#d97706' },
    ],
    albums: [
      { emoji: '🎸', title: 'Abbey Road', artist: 'The Beatles', year: 1969 },
      { emoji: '⚡', title: 'Led Zeppelin IV', artist: 'Led Zeppelin', year: 1971 },
      { emoji: '🌀', title: 'Nevermind', artist: 'Nirvana', year: 1991 },
    ],
    facts: [
      'The first rock \'n\' roll record is often cited as "Rocket 88" by Jackie Brenston, released in 1951.',
      '"Dark Side of the Moon" by Pink Floyd spent 937 weeks on the Billboard 200 album chart.',
      'The electric guitar had existed since the 1930s but became the defining rock instrument after the invention of the Fender Telecaster in 1951.',
    ],
    era_start: 1950, era_end: 2024, total_span: 500,
    lessons: 42, quizzes: 14,
  },
  {
    id: 'electronic',
    name: 'Electronic',
    emoji: '🎛️',
    origin: 'Germany, UK, USA, 1970s–80s',
    era: 'modern',
    bg: 'linear-gradient(135deg,#080d1a,#0d1530)',
    grad: 'linear-gradient(135deg,#0ea5e9,#38bdf8)',
    color: '#0ea5e9',
    tagColor: 'mh-tag-blue',
    popularity: 88,
    instruments: ['Synthesizer', 'Drum Machine', 'Sampler', 'Turntables', 'DAW'],
    tags: ['Synthesized', 'Dance', 'Digital', 'Club Culture'],
    desc: 'Music created primarily with electronic instruments and technology. From Kraftwerk\'s machines to modern EDM, electronic music reshapes sound itself.',
    longDesc: 'Electronic music uses electronic instruments and technology as its primary means of sound production. Beginning with experimental composers like Karlheinz Stockhausen and evolving through Kraftwerk\'s mechanical pop, house music, techno, trance, and beyond, it is the fastest-evolving musical genre in history. The synthesizer allowed composers to create entirely new timbres impossible on acoustic instruments.',
    origin_full: 'While electronic instruments existed since the early 20th century (theremins, ondes Martenot), electronic music as a genre crystallized in the 1970s with Kraftwerk in Germany and later disco/house in Chicago and Detroit. The availability of affordable synthesizers in the 1980s democratized the genre.',
    artists: [
      { name: 'Kraftwerk',     role: 'Electronic pioneers', color: '#0ea5e9', init: 'KW' },
      { name: 'Daft Punk',     role: 'French House/EDM', color: '#0284c7', init: 'DP' },
      { name: 'Aphex Twin',    role: 'Ambient/IDM', color: '#0369a1', init: 'AT' },
      { name: 'Deadmau5',      role: 'Progressive House', color: '#38bdf8', init: 'DM' },
    ],
    subgenres: [
      { name: 'House',        color: '#0ea5e9' },
      { name: 'Techno',       color: '#0284c7' },
      { name: 'Ambient',      color: '#6d28d9' },
      { name: 'Drum & Bass',  color: '#dc2626' },
      { name: 'Dubstep',      color: '#7c3aed' },
      { name: 'Trance',       color: '#0891b2' },
    ],
    albums: [
      { emoji: '🤖', title: 'Autobahn', artist: 'Kraftwerk', year: 1974 },
      { emoji: '🎛️', title: 'Homework', artist: 'Daft Punk', year: 1997 },
      { emoji: '🌊', title: 'Selected Ambient Works', artist: 'Aphex Twin', year: 1992 },
    ],
    facts: [
      'The Roland TR-808 drum machine, released in 1980, has appeared on more hit records than any other instrument.',
      'Kraftwerk\'s 1977 album "Trans-Europe Express" directly influenced hip-hop — Afrika Bambaataa sampled it for "Planet Rock."',
      'The first synthesizer patents were filed by Thaddeus Cahill in 1897 — before rock music even existed.',
    ],
    era_start: 1970, era_end: 2024, total_span: 500,
    lessons: 28, quizzes: 9,
  },
  {
    id: 'blues',
    name: 'Blues',
    emoji: '🎺',
    origin: 'American South, ~1870s',
    era: 'historical',
    bg: 'linear-gradient(135deg,#0d1020,#121828)',
    grad: 'linear-gradient(135deg,#1d4ed8,#60a5fa)',
    color: '#1d4ed8',
    tagColor: 'mh-tag-blue',
    popularity: 75,
    instruments: ['Guitar', 'Harmonica', 'Piano', 'Bass', 'Drums', 'Vocals'],
    tags: ['Soulful', 'Pentatonic', 'Call-and-Response', 'African-American'],
    desc: 'The foundation of all modern popular music — a deeply expressive genre rooted in the African American experience, built on the pentatonic scale and the I-IV-V chord progression.',
    longDesc: 'The blues is widely considered the root of modern popular music, directly influencing jazz, rock, soul, R&B, and country. Emerging from the work songs, spirituals, and field hollers of African Americans in the Deep South, the blues developed its characteristic 12-bar form, bent notes, and lyrical themes of struggle, love, and resilience. It migrated north during the Great Migration, electrifying in Chicago to become urban blues.',
    origin_full: 'Blues emerged from African American communities in the Mississippi Delta region in the post-Civil War era. It absorbed work songs, field hollers, spirituals, and African musical traditions to create a uniquely American sound. The Great Migration of the 1910s–40s carried blues from the rural South to northern cities.',
    artists: [
      { name: 'Robert Johnson',  role: 'Delta Blues', color: '#1d4ed8', init: 'RJ' },
      { name: 'B.B. King',       role: 'Guitar Master', color: '#1e40af', init: 'BB' },
      { name: 'Muddy Waters',    role: 'Chicago Blues', color: '#1e3a8a', init: 'MW' },
      { name: 'Howlin\' Wolf',   role: 'Chicago Blues', color: '#60a5fa', init: 'HW' },
    ],
    subgenres: [
      { name: 'Delta Blues',   color: '#1d4ed8' },
      { name: 'Chicago Blues', color: '#1e40af' },
      { name: 'Piedmont Blues',color: '#2563eb' },
      { name: 'Texas Blues',   color: '#60a5fa' },
      { name: 'Boogie Woogie', color: '#3b82f6' },
    ],
    albums: [
      { emoji: '🎸', title: 'King of the Delta Blues', artist: 'Robert Johnson', year: 1961 },
      { emoji: '🎺', title: 'Live at the Regal', artist: 'B.B. King', year: 1965 },
      { emoji: '⚡', title: 'Muddy Waters at Newport', artist: 'Muddy Waters', year: 1960 },
    ],
    facts: [
      'Robert Johnson, the legendary Delta blues guitarist, allegedly sold his soul at the crossroads to play guitar — a myth that defined blues mystique.',
      'The 12-bar blues chord progression is one of the most used progressions in all of popular music.',
      'B.B. King named his guitar "Lucille" after a fight that nearly killed him at a club in Twist, Arkansas.',
    ],
    era_start: 1870, era_end: 2024, total_span: 500,
    lessons: 19, quizzes: 7,
  },
  {
    id: 'hip-hop',
    name: 'Hip-Hop',
    emoji: '🎤',
    origin: 'Bronx, New York, 1970s',
    era: 'modern',
    bg: 'linear-gradient(135deg,#1a0810,#200c08)',
    grad: 'linear-gradient(135deg,#ea580c,#fb923c)',
    color: '#ea580c',
    tagColor: 'mh-tag-orange',
    popularity: 97,
    instruments: ['Turntables', 'Drum Machine', 'Sampler', 'Microphone', 'Bass'],
    tags: ['Sampling', 'Rapping', 'DJing', 'Urban', 'Street Culture'],
    desc: 'Born in the South Bronx from DJing, MCing, breakdancing, and graffiti. Hip-hop became the defining culture of the late 20th century and the most popular genre of the 21st.',
    longDesc: 'Hip-hop is both a musical genre and a cultural movement that emerged in the African American and Latino communities of the South Bronx, New York, in the early 1970s. DJ Kool Herc is credited with its invention, isolating breakbeats for dancers. Grandmaster Flash innovated scratching and backspinning. MCs (rappers) began rhyming over beats, and the genre exploded globally in the 1980s with Run-DMC and Public Enemy. Today hip-hop is the most-streamed genre worldwide.',
    origin_full: 'Hip-hop was born in the parks of the South Bronx during a period of urban decline, poverty, and gang violence in New York City. Block parties, hosted by DJs like Kool Herc, became the social glue for a community without resources — turning cheap turntables and borrowed electricity into an art form.',
    artists: [
      { name: 'DJ Kool Herc',  role: 'Founding DJ', color: '#ea580c', init: 'KH' },
      { name: 'Grandmaster Flash', role: 'DJ Innovator', color: '#c2410c', init: 'GF' },
      { name: 'Tupac Shakur',  role: 'MC/Rapper', color: '#9a3412', init: 'TS' },
      { name: 'Kendrick Lamar',role: 'MC/Composer', color: '#fb923c', init: 'KL' },
    ],
    subgenres: [
      { name: 'Gangsta Rap',   color: '#ea580c' },
      { name: 'Trap',          color: '#c2410c' },
      { name: 'Conscious Rap', color: '#d97706' },
      { name: 'Drill',         color: '#374151' },
      { name: 'Mumble Rap',    color: '#9a3412' },
      { name: 'Cloud Rap',     color: '#7c3aed' },
    ],
    albums: [
      { emoji: '🎤', title: 'Ready to Die', artist: 'The Notorious B.I.G.', year: 1994 },
      { emoji: '🎧', title: 'Illmatic', artist: 'Nas', year: 1994 },
      { emoji: '👑', title: 'To Pimp a Butterfly', artist: 'Kendrick Lamar', year: 2015 },
    ],
    facts: [
      'The first commercially successful rap record was "Rapper\'s Delight" by The Sugarhill Gang (1979), sampling Chic\'s "Good Times."',
      'Kendrick Lamar became the first rapper to win a Pulitzer Prize for Music in 2018 for "DAMN."',
      'The breakbeat — isolating the percussive section of a record — is credited as hip-hop\'s musical foundation.',
    ],
    era_start: 1973, era_end: 2024, total_span: 500,
    lessons: 36, quizzes: 12,
  },
  {
    id: 'baroque',
    name: 'Baroque',
    emoji: '🎼',
    origin: 'Europe, 1600–1750',
    era: 'historical',
    bg: 'linear-gradient(135deg,#1a1408,#241c0c)',
    grad: 'linear-gradient(135deg,#b45309,#fbbf24)',
    color: '#b45309',
    tagColor: 'mh-tag-amber',
    popularity: 70,
    instruments: ['Harpsichord', 'Violin', 'Cello', 'Lute', 'Organ', 'Recorder'],
    tags: ['Counterpoint', 'Ornamental', 'Polyphonic', 'Church Music'],
    desc: 'The era of elaborate counterpoint, complex ornamentation, and the invention of opera. Bach, Handel, and Vivaldi defined music\'s grandest baroque structures.',
    longDesc: 'The Baroque period (1600–1750) was one of music\'s most innovative eras. It saw the birth of opera, the development of the orchestra, and the perfection of counterpoint — the art of weaving multiple independent melodic lines together. J.S. Bach stands as the supreme master of Baroque counterpoint, while Handel brought it to theatrical heights and Vivaldi showed its possibilities in purely instrumental form.',
    origin_full: 'Baroque emerged in Italy, particularly Florence and Venice, as a reaction against the perceived plainness of Renaissance music. Florentine intellectuals (the Camerata) attempted to recreate ancient Greek drama and invented opera. The style spread across Europe, with each country developing distinctive national styles.',
    artists: [
      { name: 'J.S. Bach',    role: 'Supreme contrapuntist', color: '#b45309', init: 'JB' },
      { name: 'G.F. Handel',  role: 'Oratorio master', color: '#92400e', init: 'GH' },
      { name: 'A. Vivaldi',   role: 'Concerto virtuoso', color: '#78350f', init: 'AV' },
      { name: 'H. Purcell',   role: 'English Baroque', color: '#fbbf24', init: 'HP' },
    ],
    subgenres: [
      { name: 'Fugue',         color: '#b45309' },
      { name: 'Concerto Grosso',color: '#d97706' },
      { name: 'Cantata',       color: '#92400e' },
      { name: 'Oratorio',      color: '#fbbf24' },
      { name: 'Toccata',       color: '#78350f' },
    ],
    albums: [
      { emoji: '🎼', title: 'The Well-Tempered Clavier', artist: 'J.S. Bach', year: 1722 },
      { emoji: '🎻', title: 'The Four Seasons', artist: 'A. Vivaldi', year: 1725 },
      { emoji: '🎭', title: 'Messiah', artist: 'G.F. Handel', year: 1741 },
    ],
    facts: [
      'J.S. Bach fathered 20 children and wrote over 1,000 pieces of music — a remarkable output considering he had no recording technology.',
      'Handel\'s "Messiah" premiered in Dublin, Ireland in 1742. King George II allegedly stood during the "Hallelujah" chorus, creating a tradition that continues today.',
      'Vivaldi wrote "The Four Seasons" as a set of four violin concertos — each accompanied by a sonnet.',
    ],
    era_start: 1600, era_end: 1750, total_span: 500,
    lessons: 22, quizzes: 7,
  },
  {
    id: 'folk',
    name: 'Folk',
    emoji: '🪕',
    origin: 'Global, traced to oral traditions',
    era: 'world',
    bg: 'linear-gradient(135deg,#0d1a10,#0d1a08)',
    grad: 'linear-gradient(135deg,#065f46,#34d399)',
    color: '#065f46',
    tagColor: 'mh-tag-teal',
    popularity: 72,
    instruments: ['Acoustic Guitar', 'Banjo', 'Fiddle', 'Mandolin', 'Dulcimer', 'Vocals'],
    tags: ['Oral Tradition', 'Storytelling', 'Acoustic', 'Community', 'Roots'],
    desc: 'Music of the people — passed down through generations, rooted in storytelling and community. Folk has inspired protest movements, Americana, and countless revival scenes.',
    longDesc: 'Folk music refers to music created and transmitted orally within communities, predating the recording era by centuries. It encompasses work songs, ballads, dance tunes, and religious music. The 20th century saw multiple folk revivals — the American folk revival of the 1950s–60s produced Bob Dylan and Joan Baez, while the British folk revival produced Fairport Convention and Nick Drake. Folk remains vital as a vehicle for storytelling and social commentary.',
    origin_full: 'Folk music predates written music history — it exists in every human culture as the music of ordinary people rather than trained musicians or courts. The American folk tradition drew from British Isles traditions, African American music, Native American influences, and immigrant communities.',
    artists: [
      { name: 'Bob Dylan',    role: 'Singer-Songwriter', color: '#065f46', init: 'BD' },
      { name: 'Joan Baez',    role: 'Folk Activist', color: '#047857', init: 'JB' },
      { name: 'Woody Guthrie',role: 'Dust Bowl Ballads', color: '#064e3b', init: 'WG' },
      { name: 'Joni Mitchell',role: 'Folk/Poetry', color: '#34d399', init: 'JM' },
    ],
    subgenres: [
      { name: 'Americana',      color: '#065f46' },
      { name: 'Celtic Folk',    color: '#0369a1' },
      { name: 'Protest Songs',  color: '#dc2626' },
      { name: 'Bluegrass',      color: '#d97706' },
      { name: 'Indie Folk',     color: '#8b5cf6' },
    ],
    albums: [
      { emoji: '🪕', title: 'The Freewheelin\' Bob Dylan', artist: 'Bob Dylan', year: 1963 },
      { emoji: '🌿', title: 'Blue', artist: 'Joni Mitchell', year: 1971 },
      { emoji: '🎸', title: 'Dust Bowl Ballads', artist: 'Woody Guthrie', year: 1940 },
    ],
    facts: [
      'Bob Dylan became the first musician to win the Nobel Prize in Literature in 2016.',
      'The term "folk music" was first used in 1846 by English writer William Thoms.',
      'Irish traditional music (trad) is one of the few surviving oral musical traditions in Europe, with tunes passed down without written notation.',
    ],
    era_start: 1600, era_end: 2024, total_span: 500,
    lessons: 17, quizzes: 6,
  },
  {
    id: 'reggae',
    name: 'Reggae',
    emoji: '🌴',
    origin: 'Kingston, Jamaica, ~1968',
    era: 'world',
    bg: 'linear-gradient(135deg,#0d1a08,#141a08)',
    grad: 'linear-gradient(135deg,#dc2626,#fbbf24)',
    color: '#dc2626',
    tagColor: 'mh-tag-red',
    popularity: 78,
    instruments: ['Guitar', 'Bass', 'Drums', 'Keyboards', 'Brass', 'Vocals'],
    tags: ['Offbeat Rhythm', 'Rastafari', 'Social Justice', 'Caribbean'],
    desc: 'Jamaica\'s gift to the world — a rhythm defined by its offbeat guitar "skanks," deep bass, and lyrics rooted in Rastafari spirituality and social justice.',
    longDesc: 'Reggae developed in Jamaica in the late 1960s, evolving from ska and rocksteady. Its defining characteristic is the "skank" — a rhythm guitar that emphasizes the offbeats (upbeats), giving it its signature loping feel. The bass guitar in reggae plays an unusually prominent melodic role. Bob Marley carried reggae to global prominence, embedding its Rastafari spiritual messages and resistance themes into mainstream consciousness.',
    origin_full: 'Reggae developed in Kingston\'s recording studios and dance halls, building on the ska and rocksteady traditions. Clement "Coxsone" Dodd\'s Studio One and Lee "Scratch" Perry\'s production work were crucial to its development. The Rastafari movement provided the spiritual and cultural framework for many reggae artists.',
    artists: [
      { name: 'Bob Marley',    role: 'Icon', color: '#dc2626', init: 'BM' },
      { name: 'Peter Tosh',    role: 'Wailers / Solo', color: '#b91c1c', init: 'PT' },
      { name: 'Burning Spear', role: 'Roots Reggae', color: '#991b1b', init: 'BS' },
      { name: 'Lee Perry',     role: 'Dub Producer', color: '#fbbf24', init: 'LP' },
    ],
    subgenres: [
      { name: 'Roots Reggae',  color: '#dc2626' },
      { name: 'Dancehall',     color: '#d97706' },
      { name: 'Dub',           color: '#6d28d9' },
      { name: 'Ska',           color: '#0ea5e9' },
      { name: 'Lovers Rock',   color: '#ec4899' },
    ],
    albums: [
      { emoji: '🌴', title: 'Exodus', artist: 'Bob Marley & The Wailers', year: 1977 },
      { emoji: '🌊', title: 'Catch a Fire', artist: 'Bob Marley & The Wailers', year: 1973 },
      { emoji: '🥁', title: 'Super Ape', artist: 'Lee Perry', year: 1976 },
    ],
    facts: [
      '"Exodus" by Bob Marley was named the greatest album of the 20th century by Time magazine.',
      'The bass guitar in reggae often plays syncopated melodic patterns rather than simply keeping time.',
      'Dub music — a reggae subgenre — was one of the earliest forms of electronic remix culture, pioneered by King Tubby in the 1970s.',
    ],
    era_start: 1968, era_end: 2024, total_span: 500,
    lessons: 15, quizzes: 5,
  },
  {
    id: 'romantic',
    name: 'Romantic',
    emoji: '🌹',
    origin: 'Europe, 1820–1900',
    era: 'historical',
    bg: 'linear-gradient(135deg,#1a0820,#20082c)',
    grad: 'linear-gradient(135deg,#9d174d,#f9a8d4)',
    color: '#9d174d',
    tagColor: 'mh-tag-pink',
    popularity: 82,
    instruments: ['Piano', 'Violin', 'Cello', 'Full Orchestra', 'Voice', 'Harp'],
    tags: ['Expressive', 'Nationalistic', 'Programmatic', 'Virtuosic'],
    desc: 'An era of intense emotion, vast orchestras, and music tied to literature, poetry, and national identity. Beethoven\'s late works opened the door; Brahms closed it with a masterful flourish.',
    longDesc: 'The Romantic era expanded music\'s emotional and technical vocabulary beyond what Classical composers had imagined possible. Orchestras grew to enormous sizes, chromatic harmonies became increasingly bold, and the concept of "program music" — instrumental music that tells a story — flourished. Virtuosic solo performers like Liszt and Paganini became the first celebrity musicians in the modern sense, performing to massive concert hall audiences.',
    origin_full: 'Romanticism began as a literary and artistic movement in Germany and England, rebelling against Enlightenment rationalism. In music, it started with Beethoven\'s late works and blossomed in the 1830s with Chopin, Schumann, and Liszt. National identity became a major theme — composers like Chopin (Poland), Dvořák (Bohemia), and Sibelius (Finland) created music that expressed cultural longing.',
    artists: [
      { name: 'F. Chopin',    role: 'Pianist-Composer', color: '#9d174d', init: 'FC' },
      { name: 'R. Schumann',  role: 'Composer', color: '#881337', init: 'RS' },
      { name: 'F. Liszt',     role: 'Virtuoso Pianist', color: '#831843', init: 'FL' },
      { name: 'J. Brahms',    role: 'Symphonist', color: '#f9a8d4', init: 'JB' },
    ],
    subgenres: [
      { name: 'Program Music',   color: '#9d174d' },
      { name: 'Lied (Art Song)', color: '#be185d' },
      { name: 'Nationalism',     color: '#dc2626' },
      { name: 'Virtuoso Pieces', color: '#f472b6' },
      { name: 'Grand Opera',     color: '#7c3aed' },
    ],
    albums: [
      { emoji: '🌹', title: 'Nocturnes', artist: 'F. Chopin', year: 1830 },
      { emoji: '🎹', title: 'Piano Sonata in B minor', artist: 'F. Liszt', year: 1853 },
      { emoji: '🎻', title: 'Violin Concerto', artist: 'J. Brahms', year: 1878 },
    ],
    facts: [
      'Franz Liszt was so popular that fans would collect his piano strings and wear them as bracelets — giving us the term "Lisztomania."',
      'Chopin rarely performed in large concert halls — he preferred intimate salon settings for 20-30 people.',
      'Richard Wagner\'s opera house in Bayreuth, Germany, still holds annual festivals exclusively dedicated to his works.',
    ],
    era_start: 1820, era_end: 1900, total_span: 500,
    lessons: 20, quizzes: 7,
  },
  {
    id: 'world',
    name: 'World Music',
    emoji: '🌍',
    origin: 'Global — Many Traditions',
    era: 'world',
    bg: 'linear-gradient(135deg,#0d1420,#141428)',
    grad: 'linear-gradient(135deg,#0891b2,#2dd4bf)',
    color: '#0891b2',
    tagColor: 'mh-tag-teal',
    popularity: 65,
    instruments: ['Sitar', 'Djembe', 'Koto', 'Didgeridoo', 'Oud', 'Steel Drum'],
    tags: ['Global', 'Traditional', 'Fusion', 'Cultural Heritage'],
    desc: 'A vast category embracing musical traditions from across the globe — from Indian classical ragas to West African polyrhythms, from Flamenco to Afrobeat.',
    longDesc: 'World music is a broad term for music from non-Western or non-dominant cultural traditions. It encompasses India\'s raga system, the polyrhythmic traditions of West Africa, the microtonal scales of Arabic maqam music, the indigenous music of the Americas, Oceania, and countless others. In the 1980s, "world music" became a record store category and marketing term, but the traditions it covers are ancient and incredibly diverse.',
    origin_full: 'World music traditions predate Western music history by thousands of years. India\'s classical music system is documented from around 200 BCE. African musical traditions influenced virtually all Western popular music. The term "world music" as a marketing category was invented in 1987 by British record labels struggling to categorize non-Western music.',
    artists: [
      { name: 'Ravi Shankar',  role: 'Indian Classical', color: '#0891b2', init: 'RS' },
      { name: 'Fela Kuti',     role: 'Afrobeat', color: '#0e7490', init: 'FK' },
      { name: 'Youssou N\'Dour',role: 'Senegalese', color: '#155e75', init: 'YN' },
      { name: 'Cesária Évora', role: 'Cape Verdean', color: '#2dd4bf', init: 'CE' },
    ],
    subgenres: [
      { name: 'Indian Classical', color: '#0891b2' },
      { name: 'Afrobeat',         color: '#ea580c' },
      { name: 'Flamenco',         color: '#dc2626' },
      { name: 'Bossa Nova',       color: '#16a34a' },
      { name: 'Celtic',           color: '#0369a1' },
      { name: 'Samba',            color: '#d97706' },
    ],
    albums: [
      { emoji: '🌍', title: 'Zombie', artist: 'Fela Kuti', year: 1977 },
      { emoji: '🎸', title: 'Saudade', artist: 'Cesária Évora', year: 1987 },
      { emoji: '🎵', title: 'Three Ragas', artist: 'Ravi Shankar', year: 1956 },
    ],
    facts: [
      'The Indian classical system has its own theory of music (raga/tala) entirely independent of Western music, developed over 2,000 years.',
      'Fela Kuti\'s compound "Kalakuta Republic" in Lagos was a self-declared independent republic with its own recording studio and clinic.',
      'The didgeridoo is one of the oldest musical instruments in the world, used by Aboriginal Australians for over 40,000 years.',
    ],
    era_start: 1700, era_end: 2024, total_span: 500,
    lessons: 14, quizzes: 5,
  },
  {
    id: 'soul-rnb',
    name: 'Soul & R&B',
    emoji: '✨',
    origin: 'USA, 1940s–1960s',
    era: 'modern',
    bg: 'linear-gradient(135deg,#1a0410,#200810)',
    grad: 'linear-gradient(135deg,#7c2d12,#fdba74)',
    color: '#ea580c',
    tagColor: 'mh-tag-amber',
    popularity: 91,
    instruments: ['Vocals', 'Piano', 'Bass', 'Drums', 'Horns', 'Guitar'],
    tags: ['Gospel-influenced', 'Emotional', 'Groove', 'American'],
    desc: 'Deeply emotional music born from gospel and blues, centering the power of the human voice. From Aretha Franklin\'s church screams to D\'Angelo\'s neo-soul, it remains among music\'s most powerful genres.',
    longDesc: 'Soul music emerged in the 1950s and 60s from the fusion of gospel music with rhythm and blues. Its defining feature is emotional intensity — particularly vocal performance. Rhythm and blues (R&B) is a broader category that preceded soul and continues today in contemporary pop-influenced forms. Motown Records became the most successful Black-owned music company in history by perfecting a polished, crossover-friendly soul sound. Neo-soul in the 1990s brought jazz and hip-hop influences to the tradition.',
    origin_full: 'Soul emerged primarily from Black churches in the American South, where gospel singing traditions were extraordinarily developed. Artists like Ray Charles and James Brown applied that emotional vocal style and communal energy to secular music. The civil rights movement and soul music developed in parallel — soul became the musical voice of a generation demanding equality.',
    artists: [
      { name: 'Aretha Franklin',role: 'Queen of Soul', color: '#ea580c', init: 'AF' },
      { name: 'Ray Charles',    role: 'Genius', color: '#c2410c', init: 'RC' },
      { name: 'James Brown',    role: 'Godfather of Soul', color: '#9a3412', init: 'JB' },
      { name: 'Stevie Wonder',  role: 'Motown Legend', color: '#fdba74', init: 'SW' },
    ],
    subgenres: [
      { name: 'Motown',      color: '#ea580c' },
      { name: 'Neo-Soul',    color: '#9d174d' },
      { name: 'Funk',        color: '#d97706' },
      { name: 'Contemporary R&B', color: '#7c3aed' },
      { name: 'Gospel',      color: '#16a34a' },
    ],
    albums: [
      { emoji: '✨', title: 'I Never Loved a Man', artist: 'Aretha Franklin', year: 1967 },
      { emoji: '🎹', title: 'Songs in the Key of Life', artist: 'Stevie Wonder', year: 1976 },
      { emoji: '💫', title: 'What\'s Going On', artist: 'Marvin Gaye', year: 1971 },
    ],
    facts: [
      'Aretha Franklin\'s "Respect" (originally written by Otis Redding) became an anthem for both the civil rights and women\'s liberation movements.',
      'Motown Records was founded by Berry Gordy in 1959 with an $800 loan from his family savings club.',
      'James Brown\'s "Say It Loud – I\'m Black and I\'m Proud" (1968) is considered one of the most politically influential songs in American history.',
    ],
    era_start: 1945, era_end: 2024, total_span: 500,
    lessons: 25, quizzes: 8,
  },
];

// ── State ──────────────────────────────────────────
let currentFilter = 'all';
let currentGenre  = null;
let searchQuery   = '';

// ── DOM Ready ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  renderGenres();
  setupSearch();
  setupFilters();
  setupModal();
});

// ── Render Genre Cards ─────────────────────────────
function renderGenres() {
  const grid = document.getElementById('genresGrid');
  const filtered = GENRES.filter(g => {
    const matchEra = currentFilter === 'all' || g.era === currentFilter;
    const matchSearch = !searchQuery ||
      g.name.toLowerCase().includes(searchQuery) ||
      g.desc.toLowerCase().includes(searchQuery) ||
      g.tags.some(t => t.toLowerCase().includes(searchQuery));
    return matchEra && matchSearch;
  });

  // Update count
  document.getElementById('genreCount').textContent = `${filtered.length} genre${filtered.length !== 1 ? 's' : ''}`;

  if (!filtered.length) {
    grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:60px 20px;color:var(--muted);">
      <div style="font-size:2rem;margin-bottom:12px">🎵</div>
      <p>No genres found for "<strong>${searchQuery}</strong>"</p>
    </div>`;
    return;
  }

  grid.innerHTML = filtered.map((g, i) => `
    <div class="genre-card mh-card-hover"
         style="--gc-grad:${g.grad};--gc-color:${g.color};--gc-bg:${g.bg};
                opacity:0;transform:translateY(24px);transition:opacity 0.5s ease ${i*0.06}s,transform 0.5s ease ${i*0.06}s"
         onclick="openGenreModal('${g.id}')"
         role="button" tabindex="0"
         onkeydown="if(event.key==='Enter')openGenreModal('${g.id}')">
      <div class="gc-glow"></div>

      <div class="gc-cover" style="background:${g.bg}">
        <div class="gc-cover-pattern">
          <svg width="100%" height="100%" viewBox="0 0 300 140">
            <circle cx="250" cy="20" r="80" fill="${g.color}" opacity="0.15"/>
            <circle cx="50" cy="120" r="60" fill="${g.color}" opacity="0.1"/>
          </svg>
        </div>
        <div class="gc-cover-overlay"></div>
        <div style="position:relative;z-index:1;font-size:4rem;filter:drop-shadow(0 4px 16px rgba(0,0,0,0.4))">${g.emoji}</div>
      </div>

      <div class="gc-body">
        <div class="gc-top">
          <div>
            <div class="gc-title">${g.name}</div>
            <div class="gc-origin">📍 ${g.origin}</div>
          </div>
          <div class="gc-badge-wrap">
            <span class="mh-tag ${g.tagColor}">${g.era}</span>
            <span class="mh-tag mh-tag-amber">⭐ ${g.popularity}%</span>
          </div>
        </div>

        <div class="gc-desc">${g.desc}</div>

        <div class="gc-instruments">
          ${g.instruments.slice(0,4).map(i => `<span class="gc-instrument">${i}</span>`).join('')}
          ${g.instruments.length > 4 ? `<span class="gc-instrument">+${g.instruments.length-4}</span>` : ''}
        </div>
      </div>

      <div class="gc-footer">
        <div class="gc-meta-row">
          <span class="gc-meta-item">📚 ${g.lessons} lessons</span>
          <span class="gc-meta-item">🧠 ${g.quizzes} quizzes</span>
        </div>
        <div class="gc-cta">
          Explore
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
    </div>
  `).join('');

  // Animate in
  requestAnimationFrame(() => {
    grid.querySelectorAll('.genre-card').forEach(el => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}

// ── Search ─────────────────────────────────────────
function setupSearch() {
  const input = document.getElementById('genreSearch');
  if (!input) return;
  input.addEventListener('input', () => {
    searchQuery = input.value.toLowerCase().trim();
    renderGenres();
  });
}

// ── Filters ────────────────────────────────────────
function setupFilters() {
  document.querySelectorAll('.ge-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ge-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentFilter = btn.dataset.filter;
      renderGenres();
    });
  });
}

// ── Modal ──────────────────────────────────────────
function setupModal() {
  const overlay = document.getElementById('genreModal');
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeGenreModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeGenreModal();
  });
}

function openGenreModal(id) {
  const g = GENRES.find(x => x.id === id);
  if (!g) return;
  currentGenre = g;

  const modal = document.getElementById('genreModal');
  const content = document.getElementById('genreModalContent');

  const barWidth = Math.round(((g.era_end - g.era_start) / g.total_span) * 100);
  const barLeft  = Math.round(((g.era_start - 1500) / g.total_span) * 100);

  content.innerHTML = `
    <div class="ge-modal-banner" style="background:${g.bg}">
      <div style="position:absolute;inset:0;overflow:hidden">
        <svg width="100%" height="100%" viewBox="0 0 760 180">
          <circle cx="600" cy="40" r="120" fill="${g.color}" opacity="0.2"/>
          <circle cx="100" cy="150" r="90" fill="${g.color}" opacity="0.1"/>
        </svg>
      </div>
      <div class="ge-modal-banner-overlay"></div>
      <div class="ge-modal-banner-emoji">${g.emoji}</div>
    </div>

    <div class="mh-modal-header">
      <div class="ge-modal-title-row" style="flex:1">
        <div>
          <div class="ge-modal-title">${g.name}</div>
          <div class="ge-modal-origin">📍 ${g.origin_full || g.origin}</div>
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <span class="mh-tag ${g.tagColor}">${g.era}</span>
          <span class="mh-tag mh-tag-amber">⭐ ${g.popularity}% popularity</span>
        </div>
      </div>
      <button class="mh-modal-close" onclick="closeGenreModal()">✕</button>
    </div>

    <div class="mh-modal-body">
      <div class="ge-modal-tags">
        ${g.tags.map(t => `<span class="mh-tag mh-tag-purple">${t}</span>`).join('')}
      </div>

      <p class="ge-modal-desc">${g.longDesc}</p>

      <!-- Timeline span -->
      <div style="margin-top:24px">
        <div class="ge-timeline-labels">
          <span>1500</span><span>1700</span><span>1900</span><span>2024</span>
        </div>
        <div class="ge-timeline-bar" style="--gc-grad:${g.grad}">
          <div class="ge-timeline-fill"
               style="margin-left:${Math.max(0,barLeft)}%;width:${Math.min(barWidth,100-Math.max(0,barLeft))}%;background:${g.grad}"></div>
        </div>
        <div class="ge-timeline-labels">
          <span style="color:${g.color};font-weight:700">${g.era_start}</span>
          <span></span><span></span>
          <span>${g.era_end >= 2024 ? 'Present' : g.era_end}</span>
        </div>
      </div>

      <!-- Key Artists -->
      <div class="ge-modal-section">
        <h4>Key Artists</h4>
        <div class="ge-artists-grid">
          ${g.artists.map(a => `
            <div class="ge-artist-item">
              <div class="ge-artist-avatar" style="background:${a.color}">${a.init}</div>
              <div class="ge-artist-name">${a.name}</div>
              <div class="ge-artist-role">${a.role}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Subgenres -->
      <div class="ge-modal-section">
        <h4>Subgenres & Styles</h4>
        <div class="ge-subgenres">
          ${g.subgenres.map(s => `
            <div class="ge-subgenre">
              <div class="ge-subgenre-dot" style="background:${s.color}"></div>
              ${s.name}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Notable Instruments -->
      <div class="ge-modal-section">
        <h4>Key Instruments</h4>
        <div class="ge-instruments-list">
          ${g.instruments.map(i => `
            <div class="ge-instrument-item">
              <span class="ge-instrument-emoji">${getInstrumentEmoji(i)}</span>
              ${i}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Notable Albums -->
      <div class="ge-modal-section">
        <h4>Notable Albums & Works</h4>
        <div class="ge-albums-list">
          ${g.albums.map(a => `
            <div class="ge-album-item">
              <div class="ge-album-cover" style="background:${g.bg}">${a.emoji}</div>
              <div class="ge-album-info">
                <strong>${a.title}</strong>
                <span>${a.artist}</span>
              </div>
              <div class="ge-album-year">${a.year}</div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- Fun Facts -->
      <div class="ge-modal-section">
        <h4>Did You Know?</h4>
        <div class="ge-facts-list">
          ${g.facts.map((f, i) => `
            <div class="ge-fact-item">
              <span class="ge-fact-num">#${i+1}</span>
              ${f}
            </div>
          `).join('')}
        </div>
      </div>

      <!-- CTA -->
      <div style="display:flex;gap:12px;margin-top:28px;flex-wrap:wrap">
        <a href="theory-quiz.html?topic=${g.id}" style="
          display:inline-flex;align-items:center;gap:8px;
          background:linear-gradient(135deg,#7c3aed,#db2777);
          color:white;padding:11px 22px;border-radius:12px;
          font-size:0.875rem;font-weight:700;text-decoration:none;
          transition:opacity 0.2s,transform 0.15s;
        " onmouseover="this.style.opacity='0.9'" onmouseout="this.style.opacity='1'">
          📚 Study ${g.name} Theory
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="14" height="14"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </a>
        <button onclick="awardGenreXP('${g.id}')" style="
          background:rgba(251,191,36,0.1);border:1px solid rgba(251,191,36,0.3);
          color:#fbbf24;padding:11px 22px;border-radius:12px;
          font-size:0.875rem;font-weight:700;font-family:inherit;cursor:pointer;
          transition:background 0.2s;
        " onmouseover="this.style.background='rgba(251,191,36,0.18)'" onmouseout="this.style.background='rgba(251,191,36,0.1)'">
          ⭐ Earn XP for Reading
        </button>
      </div>
    </div>
  `;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeGenreModal() {
  document.getElementById('genreModal').classList.remove('open');
  document.body.style.overflow = '';
}

// ── XP Award ──────────────────────────────────────
const awardedGenres = new Set();
function awardGenreXP(genreId) {
  if (awardedGenres.has(genreId)) {
    showMHToast('Already earned XP for this genre!', '📚', 0);
    return;
  }
  awardedGenres.add(genreId);
  const xp = 25;
  if (window.HarmoniaDB) {
    HarmoniaDB.addXP(xp, `Read about ${GENRES.find(g=>g.id===genreId)?.name} genre`);
  }
  showMHToast(`+${xp} XP earned!`, '⭐', xp);
}

function showMHToast(msg, icon, xp) {
  const toast = document.getElementById('mhXPToast');
  if (!toast) return;
  toast.querySelector('.mh-xp-toast-icon').textContent = icon;
  toast.querySelector('.mh-xp-toast-text strong').textContent = xp > 0 ? `+${xp} XP Earned!` : msg;
  toast.querySelector('.mh-xp-toast-text span').textContent = msg;
  toast.querySelector('.mh-xp-amount').textContent = xp > 0 ? `+${xp} XP` : '';
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 3200);
}

function getInstrumentEmoji(name) {
  const map = {
    'Piano': '🎹', 'Guitar': '🎸', 'Electric Guitar': '🎸',
    'Acoustic Guitar': '🎸', 'Bass Guitar': '🎸', 'Violin': '🎻',
    'Cello': '🎻', 'Trumpet': '🎺', 'Trombone': '🎺', 'Saxophone': '🎷',
    'Drums': '🥁', 'Drum Machine': '🎛️', 'Synthesizer': '🎹',
    'Flute': '🪈', 'Harmonica': '🪗', 'Organ': '🎹',
    'Harpsichord': '🎹', 'Double Bass': '🎻', 'Vocals': '🎤',
    'Microphone': '🎤', 'Turntables': '💿', 'Sampler': '🎛️',
    'Banjo': '🪕', 'Fiddle': '🎻', 'Mandolin': '🎸',
    'Lute': '🎸', 'Sitar': '🪕', 'Djembe': '🥁',
    'Koto': '🎵', 'Oud': '🎸', 'Harp': '🎵',
    'DAW': '💻', 'Bass': '🎸', 'Keyboards': '🎹',
    'Horns': '🎺', 'Brass': '🎺', 'Recorder': '🪈',
    'Dulcimer': '🪕', 'Steel Drum': '🥁',
  };
  return map[name] || '🎵';
}
