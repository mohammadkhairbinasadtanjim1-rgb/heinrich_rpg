// FILE: client/js/data/npc-templates.js — PART 3
// NPC generation templates for THE FATE OF HEINRICH

// Personality trait ranges (1-10 each)
export const PERSONALITY_TRAITS = [
  'courage',      // 1=coward, 10=reckless
  'honesty',      // 1=pathological liar, 10=cannot lie
  'ambition',     // 1=content, 10=ruthlessly ambitious
  'cruelty',      // 1=gentle, 10=sadistic
  'loyalty',      // 1=treacherous, 10=fanatically loyal
  'intelligence', // 1=dim, 10=brilliant
  'greed',        // 1=generous, 10=miserly
  'piety',        // 1=atheist, 10=fanatic
  'pride',        // 1=humble, 10=arrogant
  'lust'          // 1=celibate, 10=insatiable
];

// Speech patterns by archetype
export const SPEECH_PATTERNS = {
  norman_peasant: {
    style: 'Direct, rough, agricultural metaphors. Short sentences. Suspicious of strangers.',
    examples: [
      'What d\'you want?',
      'That\'s not how we do things here.',
      'The lord\'ll hear about this.',
      'I\'ve got work to do.',
      'Aye, I know him. Trouble, that one.'
    ],
    vocabulary: 'simple',
    formality: 'low'
  },
  
  norman_lord: {
    style: 'Commanding, expects deference, uses "we" for self. Impatient with inferiors.',
    examples: [
      'You will address us properly.',
      'We have little time for this.',
      'What is your business here, peasant?',
      'See to it. That is all.',
      'We are not accustomed to being kept waiting.'
    ],
    vocabulary: 'elevated',
    formality: 'high'
  },
  
  merchant: {
    style: 'Calculating, always assessing value, speaks in terms of profit and loss.',
    examples: [
      'What\'s in it for me?',
      'I can get you a better price than that.',
      'Everything has a price.',
      'Let\'s talk numbers.',
      'I\'ve done business with worse men than you.'
    ],
    vocabulary: 'practical',
    formality: 'medium'
  },
  
  priest: {
    style: 'Formal Latin phrases mixed in, speaks of God\'s will, gentle but firm.',
    examples: [
      'God\'s will be done.',
      'Have you made your confession recently?',
      'The Church teaches us...',
      'In nomine Patris...',
      'Pray for guidance, my son.'
    ],
    vocabulary: 'religious',
    formality: 'high'
  },
  
  soldier: {
    style: 'Blunt, military jargon, assesses threats automatically, dark humor.',
    examples: [
      'State your business.',
      'I\'ve seen worse.',
      'Keep your hands where I can see them.',
      'Move along.',
      'You don\'t want trouble. Neither do I.'
    ],
    vocabulary: 'military',
    formality: 'low'
  },
  
  scholar: {
    style: 'Precise, uses Latin terms, qualifies everything, excited by ideas.',
    examples: [
      'That is a fascinating question.',
      'Per se, the argument holds...',
      'Have you considered the philosophical implications?',
      'The texts are quite clear on this matter.',
      'Ah, but you\'re missing the nuance.'
    ],
    vocabulary: 'academic',
    formality: 'high'
  },
  
  criminal: {
    style: 'Evasive, speaks in euphemisms, always watching exits, tests you.',
    examples: [
      'I don\'t know what you\'re talking about.',
      'Who sent you?',
      'That\'s a dangerous question.',
      'I might know someone who knows someone.',
      'Everything\'s negotiable.'
    ],
    vocabulary: 'street',
    formality: 'low'
  },
  
  noble_lady: {
    style: 'Elegant, indirect, uses social pressure rather than direct confrontation.',
    examples: [
      'How... interesting.',
      'I\'m sure you meant no offense.',
      'One does wonder about your intentions.',
      'My husband will hear of this.',
      'You are quite bold for a man of your station.'
    ],
    vocabulary: 'courtly',
    formality: 'very_high'
  },
  
  innkeeper: {
    style: 'Jovial, practical, knows everyone\'s business, neutral in conflicts.',
    examples: [
      'What\'ll it be?',
      'I run a clean house here.',
      'I don\'t want trouble in my establishment.',
      'Heard some interesting things lately...',
      'Pay first, questions later.'
    ],
    vocabulary: 'common',
    formality: 'low'
  },
  
  blacksmith: {
    style: 'Evaluates everything by craft quality, proud of work, few words.',
    examples: [
      'That\'s poor work.',
      'I could fix that.',
      'Good steel. Where\'d you get it?',
      'Takes time to do it right.',
      'I don\'t rush my work.'
    ],
    vocabulary: 'craft',
    formality: 'low'
  },
  
  spy: {
    style: 'Friendly surface, probing questions, never reveals true purpose.',
    examples: [
      'What brings you to these parts?',
      'I\'ve heard interesting things about you.',
      'You seem like a man who knows things.',
      'Purely out of curiosity...',
      'I\'m just a traveler, like yourself.'
    ],
    vocabulary: 'adaptable',
    formality: 'medium'
  },
  
  monk: {
    style: 'Peaceful, philosophical, sees God in everything, patient.',
    examples: [
      'God\'s peace be with you.',
      'All things pass.',
      'Have you considered the state of your soul?',
      'We are all pilgrims on this earth.',
      'The Lord provides.'
    ],
    vocabulary: 'religious',
    formality: 'medium'
  }
};

// Physical appearance templates
export const APPEARANCE_TEMPLATES = {
  notable_features: [
    'A scar running from ear to jaw',
    'Eyes of two different colors',
    'Missing two fingers on the left hand',
    'A birthmark covering half the face',
    'Unusually pale skin',
    'Hair prematurely white',
    'A pronounced limp',
    'Extraordinarily large hands',
    'A broken nose, badly set',
    'Teeth filed to points (criminal mark)',
    'A brand on the cheek (former criminal)',
    'Ears that stick out prominently',
    'A glass eye',
    'Fingers stained permanently with ink',
    'Hands rough as bark from years of labor',
    'A neck tattoo (sailor)',
    'A missing ear',
    'Unusually short stature',
    'Unusually tall stature',
    'A tremor in the hands'
  ],
  
  body_types: [
    'lean and wiry',
    'broad-shouldered and powerful',
    'soft and well-fed',
    'gaunt from hunger',
    'compact and muscular',
    'tall and angular',
    'short and stocky',
    'average in every way'
  ],
  
  age_descriptors: {
    young: ['fresh-faced', 'smooth-skinned', 'bright-eyed', 'unlined'],
    middle: ['weathered', 'lined', 'experienced-looking', 'grey at the temples'],
    old: ['deeply lined', 'white-haired', 'stooped', 'sharp-eyed despite age']
  }
};

// NPC archetype templates
export const NPC_ARCHETYPES = {
  // ─────────────────────────────────────────────────────────────
  // PEASANTS & COMMONERS
  // ─────────────────────────────────────────────────────────────
  serf: {
    name: 'Serf',
    class: 'serf',
    culture: 'norman_french',
    speech_pattern: 'norman_peasant',
    personality_ranges: {
      courage: [2, 5],
      honesty: [4, 8],
      ambition: [1, 4],
      cruelty: [1, 4],
      loyalty: [5, 9],
      intelligence: [2, 6],
      greed: [2, 6],
      piety: [5, 9],
      pride: [2, 6],
      lust: [3, 7]
    },
    typical_wants: [
      'Enough food for the winter',
      'For the lord to leave them alone',
      'A good harvest',
      'Their children to survive',
      'To pay off their debt'
    ],
    typical_secrets: [
      'Hiding grain from the lord',
      'An affair with a neighbor',
      'A son who fled to the city',
      'Knows where something valuable is buried',
      'Witnessed something they shouldn\'t have'
    ],
    typical_skills: { agriculture: [2, 5], brawling: [1, 3], survival: [2, 4] },
    wealth: { sous: [0, 5] }
  },
  
  free_peasant: {
    name: 'Free Peasant',
    class: 'free_peasant',
    culture: 'norman_french',
    speech_pattern: 'norman_peasant',
    personality_ranges: {
      courage: [3, 6],
      honesty: [4, 8],
      ambition: [2, 6],
      cruelty: [1, 4],
      loyalty: [4, 8],
      intelligence: [3, 7],
      greed: [3, 7],
      piety: [4, 8],
      pride: [3, 7],
      lust: [3, 7]
    },
    typical_wants: [
      'To expand their land',
      'A good marriage for their children',
      'To avoid the lord\'s attention',
      'To save enough to buy a horse',
      'To learn a trade'
    ],
    typical_secrets: [
      'Owes money to a moneylender',
      'Has a bastard child',
      'Knows about a local crime',
      'Has been cheating on taxes',
      'Has a hidden cache of silver'
    ],
    typical_skills: { agriculture: [3, 6], brawling: [2, 4], haggle: [1, 3] },
    wealth: { sous: [5, 30] }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CRAFTSMEN
  // ─────────────────────────────────────────────────────────────
  blacksmith: {
    name: 'Blacksmith',
    class: 'craftsman',
    culture: 'norman_french',
    speech_pattern: 'blacksmith',
    personality_ranges: {
      courage: [4, 7],
      honesty: [5, 9],
      ambition: [3, 7],
      cruelty: [1, 4],
      loyalty: [5, 8],
      intelligence: [4, 7],
      greed: [3, 6],
      piety: [4, 7],
      pride: [5, 9],
      lust: [3, 6]
    },
    typical_wants: [
      'Better quality iron',
      'An apprentice who isn\'t useless',
      'To make a masterwork blade',
      'To expand the forge',
      'Recognition for their craft'
    ],
    typical_secrets: [
      'Makes weapons for criminals on the side',
      'Knows how to make a specific poison',
      'Has a gambling debt',
      'Stole a technique from another smith',
      'Has a secret formula for better steel'
    ],
    typical_skills: { smithing: [4, 8], strength: [5, 8], brawling: [3, 6] },
    wealth: { sous: [20, 100] }
  },
  
  carpenter: {
    name: 'Carpenter',
    class: 'craftsman',
    culture: 'norman_french',
    speech_pattern: 'blacksmith',
    personality_ranges: {
      courage: [3, 6],
      honesty: [5, 8],
      ambition: [3, 6],
      cruelty: [1, 3],
      loyalty: [5, 8],
      intelligence: [4, 7],
      greed: [3, 6],
      piety: [4, 7],
      pride: [4, 8],
      lust: [3, 6]
    },
    typical_wants: [
      'A commission from a noble',
      'Better wood',
      'To build something that lasts',
      'An apprentice',
      'To pay off the guild dues'
    ],
    typical_secrets: [
      'Built a hidden room in a noble\'s house',
      'Knows about structural weaknesses in the castle',
      'Has been skimming materials',
      'Made a secret passage for someone'
    ],
    typical_skills: { carpentry: [4, 8], strength: [4, 7], engineering: [1, 4] },
    wealth: { sous: [15, 80] }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MERCHANTS
  // ─────────────────────────────────────────────────────────────
  traveling_merchant: {
    name: 'Traveling Merchant',
    class: 'merchant',
    culture: 'variable',
    speech_pattern: 'merchant',
    personality_ranges: {
      courage: [3, 7],
      honesty: [3, 7],
      ambition: [5, 9],
      cruelty: [2, 5],
      loyalty: [3, 7],
      intelligence: [5, 9],
      greed: [6, 10],
      piety: [3, 7],
      pride: [4, 8],
      lust: [4, 8]
    },
    typical_wants: [
      'A profitable trade route',
      'Protection from bandits',
      'Information about market prices',
      'A reliable supplier',
      'To expand their business'
    ],
    typical_secrets: [
      'Smuggles contraband',
      'Works as an informant',
      'Has a second family in another city',
      'Owes a dangerous debt',
      'Knows about a valuable shipment'
    ],
    typical_skills: { haggle: [4, 8], speech: [3, 7], navigation: [2, 5] },
    wealth: { livres: [1, 20] }
  },
  
  // ─────────────────────────────────────────────────────────────
  // MILITARY
  // ─────────────────────────────────────────────────────────────
  man_at_arms: {
    name: 'Man-at-Arms',
    class: 'soldier',
    culture: 'variable',
    speech_pattern: 'soldier',
    personality_ranges: {
      courage: [5, 9],
      honesty: [3, 7],
      ambition: [3, 7],
      cruelty: [3, 7],
      loyalty: [4, 8],
      intelligence: [3, 6],
      greed: [4, 7],
      piety: [3, 7],
      pride: [4, 8],
      lust: [4, 8]
    },
    typical_wants: [
      'Better pay',
      'A chance for glory',
      'To survive the next battle',
      'Promotion',
      'Loot'
    ],
    typical_secrets: [
      'Deserted from a previous lord',
      'Killed a comrade for his money',
      'Has a family he abandoned',
      'Knows about a planned attack',
      'Is secretly a coward'
    ],
    typical_skills: { sword: [3, 7], brawling: [4, 7], endurance: [4, 7] },
    wealth: { sous: [10, 50] }
  },
  
  knight: {
    name: 'Knight',
    class: 'knight',
    culture: 'variable',
    speech_pattern: 'norman_lord',
    personality_ranges: {
      courage: [6, 10],
      honesty: [4, 8],
      ambition: [4, 8],
      cruelty: [2, 7],
      loyalty: [5, 9],
      intelligence: [4, 8],
      greed: [3, 7],
      piety: [4, 8],
      pride: [6, 10],
      lust: [4, 8]
    },
    typical_wants: [
      'Honor and glory',
      'A worthy opponent',
      'To serve their lord faithfully',
      'A good marriage',
      'Land and title'
    ],
    typical_secrets: [
      'Committed a dishonorable act in battle',
      'Has a bastard child',
      'Is in debt',
      'Secretly doubts their faith',
      'Loves someone they shouldn\'t'
    ],
    typical_skills: { sword: [5, 9], horsemanship: [5, 9], etiquette: [3, 7] },
    wealth: { livres: [5, 50] }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CLERGY
  // ─────────────────────────────────────────────────────────────
  parish_priest: {
    name: 'Parish Priest',
    class: 'parish_priest',
    culture: 'variable',
    speech_pattern: 'priest',
    personality_ranges: {
      courage: [3, 7],
      honesty: [4, 9],
      ambition: [2, 7],
      cruelty: [1, 5],
      loyalty: [5, 9],
      intelligence: [4, 8],
      greed: [2, 7],
      piety: [6, 10],
      pride: [3, 7],
      lust: [2, 8]
    },
    typical_wants: [
      'To save souls',
      'A better church building',
      'To advance in the Church',
      'To help the poor',
      'To be left alone to do God\'s work'
    ],
    typical_secrets: [
      'Has broken their vow of celibacy',
      'Doubts their faith',
      'Has been taking from the collection',
      'Knows a parishioner\'s terrible secret',
      'Has a past they\'ve hidden from the Church'
    ],
    typical_skills: { theology: [4, 8], speech: [3, 7], reading: [3, 7] },
    wealth: { sous: [10, 40] }
  },
  
  monk: {
    name: 'Monk',
    class: 'monk',
    culture: 'variable',
    speech_pattern: 'monk',
    personality_ranges: {
      courage: [3, 7],
      honesty: [5, 9],
      ambition: [2, 6],
      cruelty: [1, 4],
      loyalty: [6, 10],
      intelligence: [5, 9],
      greed: [1, 5],
      piety: [7, 10],
      pride: [2, 6],
      lust: [1, 6]
    },
    typical_wants: [
      'To complete their scholarly work',
      'Access to rare texts',
      'Peace for contemplation',
      'To help the sick',
      'To understand God\'s creation'
    ],
    typical_secrets: [
      'Has hidden a heretical text',
      'Knows about Church corruption',
      'Has a past life they\'ve fled',
      'Is secretly in contact with someone outside',
      'Has discovered something dangerous in the archives'
    ],
    typical_skills: { theology: [5, 9], reading: [5, 9], medicine: [2, 6] },
    wealth: { sous: [0, 10] }
  },
  
  // ─────────────────────────────────────────────────────────────
  // NOBLES
  // ─────────────────────────────────────────────────────────────
  minor_lord: {
    name: 'Minor Lord',
    class: 'baron',
    culture: 'variable',
    speech_pattern: 'norman_lord',
    personality_ranges: {
      courage: [4, 8],
      honesty: [3, 8],
      ambition: [5, 9],
      cruelty: [2, 7],
      loyalty: [4, 8],
      intelligence: [4, 8],
      greed: [4, 8],
      piety: [3, 7],
      pride: [6, 10],
      lust: [4, 8]
    },
    typical_wants: [
      'More land',
      'A profitable marriage alliance',
      'To outmaneuver their rivals',
      'Royal favor',
      'To secure their inheritance'
    ],
    typical_secrets: [
      'Has been cheating on taxes to the king',
      'Has a secret alliance with an enemy',
      'Has committed a crime they\'ve covered up',
      'Is in debt to a moneylender',
      'Has an illegitimate heir'
    ],
    typical_skills: { command: [3, 7], etiquette: [4, 8], sword: [3, 7] },
    wealth: { livres: [20, 200] }
  },
  
  noble_lady: {
    name: 'Noble Lady',
    class: 'knight',
    culture: 'variable',
    speech_pattern: 'noble_lady',
    personality_ranges: {
      courage: [3, 7],
      honesty: [3, 8],
      ambition: [4, 9],
      cruelty: [2, 7],
      loyalty: [4, 8],
      intelligence: [5, 9],
      greed: [3, 7],
      piety: [4, 8],
      pride: [5, 9],
      lust: [3, 8]
    },
    typical_wants: [
      'A good marriage',
      'To protect her children',
      'Political influence',
      'To escape an arranged marriage',
      'To manage her estate well'
    ],
    typical_secrets: [
      'Has a lover',
      'Is planning to leave her husband',
      'Knows about her husband\'s crimes',
      'Has been corresponding with an enemy',
      'Has a child that isn\'t her husband\'s'
    ],
    typical_skills: { etiquette: [5, 9], read_people: [4, 8], speech: [4, 8] },
    wealth: { livres: [10, 100] }
  },
  
  // ─────────────────────────────────────────────────────────────
  // CRIMINALS
  // ─────────────────────────────────────────────────────────────
  bandit: {
    name: 'Bandit',
    class: 'free_peasant',
    culture: 'variable',
    speech_pattern: 'criminal',
    personality_ranges: {
      courage: [4, 8],
      honesty: [1, 5],
      ambition: [3, 7],
      cruelty: [4, 8],
      loyalty: [2, 6],
      intelligence: [2, 6],
      greed: [6, 10],
      piety: [1, 5],
      pride: [3, 7],
      lust: [4, 8]
    },
    typical_wants: [
      'Easy money',
      'To avoid the gallows',
      'A safe hideout',
      'Loyal companions',
      'One big score'
    ],
    typical_secrets: [
      'Was once a soldier',
      'Has a family they\'re supporting',
      'Is working for someone powerful',
      'Has a code they won\'t break',
      'Is planning to betray their gang'
    ],
    typical_skills: { brawling: [4, 7], stealth: [3, 6], intimidation: [3, 7] },
    wealth: { sous: [5, 30] }
  },
  
  fence: {
    name: 'Fence',
    class: 'merchant',
    culture: 'variable',
    speech_pattern: 'criminal',
    personality_ranges: {
      courage: [2, 5],
      honesty: [1, 4],
      ambition: [4, 8],
      cruelty: [2, 6],
      loyalty: [2, 5],
      intelligence: [5, 9],
      greed: [7, 10],
      piety: [1, 5],
      pride: [3, 7],
      lust: [3, 7]
    },
    typical_wants: [
      'Profitable stolen goods',
      'Reliable thieves',
      'To avoid the law',
      'To expand their network',
      'Information'
    ],
    typical_secrets: [
      'Works for a powerful criminal organization',
      'Is an informant for the authorities',
      'Has evidence against powerful people',
      'Has a legitimate business as cover',
      'Is planning to disappear with the money'
    ],
    typical_skills: { haggle: [5, 9], deception: [4, 8], read_people: [4, 8] },
    wealth: { livres: [2, 20] }
  },
  
  // ─────────────────────────────────────────────────────────────
  // SPECIAL ARCHETYPES
  // ─────────────────────────────────────────────────────────────
  innkeeper: {
    name: 'Innkeeper',
    class: 'craftsman',
    culture: 'variable',
    speech_pattern: 'innkeeper',
    personality_ranges: {
      courage: [3, 6],
      honesty: [4, 8],
      ambition: [3, 6],
      cruelty: [1, 4],
      loyalty: [4, 7],
      intelligence: [4, 8],
      greed: [4, 7],
      piety: [3, 7],
      pride: [3, 7],
      lust: [3, 7]
    },
    typical_wants: [
      'Paying customers',
      'No trouble in the establishment',
      'Good suppliers',
      'To expand the inn',
      'Information about travelers'
    ],
    typical_secrets: [
      'Sells information to multiple parties',
      'Runs a gambling operation in the back',
      'Harbors fugitives for money',
      'Has been watering down the wine',
      'Knows about a crime committed in the inn'
    ],
    typical_skills: { haggle: [3, 7], speech: [3, 7], cooking: [3, 7] },
    wealth: { livres: [1, 10] }
  },
  
  scholar: {
    name: 'Scholar',
    class: 'monk',
    culture: 'variable',
    speech_pattern: 'scholar',
    personality_ranges: {
      courage: [2, 6],
      honesty: [5, 9],
      ambition: [4, 8],
      cruelty: [1, 4],
      loyalty: [4, 7],
      intelligence: [7, 10],
      greed: [2, 6],
      piety: [3, 8],
      pride: [5, 9],
      lust: [2, 6]
    },
    typical_wants: [
      'Access to rare texts',
      'A patron to fund their research',
      'To solve a particular problem',
      'Recognition for their work',
      'To find a specific piece of knowledge'
    ],
    typical_secrets: [
      'Has discovered something heretical',
      'Is working on forbidden knowledge',
      'Has a patron with dangerous interests',
      'Has plagiarized another scholar\'s work',
      'Knows something that powerful people want suppressed'
    ],
    typical_skills: { reading: [6, 10], history: [4, 8], theology: [3, 7] },
    wealth: { sous: [5, 30] }
  },
  
  spy: {
    name: 'Spy',
    class: 'free_peasant',
    culture: 'variable',
    speech_pattern: 'spy',
    personality_ranges: {
      courage: [5, 8],
      honesty: [1, 4],
      ambition: [5, 9],
      cruelty: [3, 7],
      loyalty: [3, 7],
      intelligence: [6, 10],
      greed: [4, 8],
      piety: [2, 6],
      pride: [3, 7],
      lust: [3, 7]
    },
    typical_wants: [
      'Information',
      'To complete their mission',
      'To avoid exposure',
      'A way out if things go wrong',
      'To know who they can trust'
    ],
    typical_secrets: [
      'Works for multiple masters',
      'Has been compromised',
      'Is planning to defect',
      'Has fallen in love with a target',
      'Knows something that would destroy their employer'
    ],
    typical_skills: { deception: [5, 9], read_people: [5, 9], stealth: [4, 8] },
    wealth: { livres: [1, 10] }
  }
};

// Mentor archetypes (10 types)
export const MENTOR_ARCHETYPES = {
  the_warrior: {
    name: 'The Warrior',
    description: 'A veteran fighter who sees potential in Heinrich.',
    teaches: ['sword', 'brawling', 'tactics', 'endurance'],
    personality: 'Gruff, demanding, secretly proud of students',
    demands: ['Loyalty', 'Hard work', 'Never backing down'],
    mortality_risk: 'high',
    legacy: 'Their fighting style lives on in Heinrich'
  },
  the_merchant: {
    name: 'The Merchant',
    description: 'A wealthy trader who sees a business partner.',
    teaches: ['haggle', 'stewardship', 'read_people', 'languages'],
    personality: 'Calculating, generous with knowledge, expects profit',
    demands: ['Profitable ventures', 'Discretion', 'Loyalty to business'],
    mortality_risk: 'low',
    legacy: 'Their trade network becomes Heinrich\'s'
  },
  the_scholar: {
    name: 'The Scholar',
    description: 'A learned man who recognizes Heinrich\'s unusual mind.',
    teaches: ['reading', 'history', 'theology', 'law'],
    personality: 'Excited by ideas, impatient with ignorance, generous',
    demands: ['Intellectual curiosity', 'Respect for knowledge', 'Honesty'],
    mortality_risk: 'low',
    legacy: 'Their library and connections'
  },
  the_spy: {
    name: 'The Spy',
    description: 'A master of shadows who sees a useful tool.',
    teaches: ['deception', 'stealth', 'espionage', 'read_people'],
    personality: 'Paranoid, tests constantly, never fully trusts',
    demands: ['Absolute discretion', 'Obedience', 'Results'],
    mortality_risk: 'very_high',
    legacy: 'Their network of contacts'
  },
  the_priest: {
    name: 'The Priest',
    description: 'A man of God who sees a soul worth saving.',
    teaches: ['theology', 'speech', 'etiquette', 'law'],
    personality: 'Compassionate, firm in faith, politically savvy',
    demands: ['Piety', 'Confession', 'Service to the Church'],
    mortality_risk: 'low',
    legacy: 'Church connections and blessing'
  },
  the_criminal: {
    name: 'The Criminal',
    description: 'A master of the underworld who sees potential.',
    teaches: ['stealth', 'lockpicking', 'deception', 'intimidation'],
    personality: 'Pragmatic, tests loyalty brutally, generous to proven allies',
    demands: ['Loyalty above all', 'Silence', 'Willingness to do what\'s necessary'],
    mortality_risk: 'very_high',
    legacy: 'Criminal network and reputation'
  },
  the_knight: {
    name: 'The Knight',
    description: 'A noble warrior who sees a worthy squire.',
    teaches: ['sword', 'horsemanship', 'etiquette', 'command'],
    personality: 'Honorable, demanding, believes in chivalry',
    demands: ['Honor', 'Courage', 'Service'],
    mortality_risk: 'high',
    legacy: 'Knighthood and noble connections'
  },
  the_healer: {
    name: 'The Healer',
    description: 'A physician or herbalist who sees a gifted student.',
    teaches: ['medicine', 'herbalism', 'cooking', 'survival'],
    personality: 'Compassionate, methodical, sees suffering everywhere',
    demands: ['Dedication to healing', 'Patience', 'Ethical practice'],
    mortality_risk: 'moderate',
    legacy: 'Medical knowledge and reputation'
  },
  the_craftsman: {
    name: 'The Craftsman',
    description: 'A master artisan who sees exceptional talent.',
    teaches: ['smithing', 'carpentry', 'engineering', 'invention'],
    personality: 'Perfectionist, proud, generous with craft knowledge',
    demands: ['Excellence', 'Respect for the craft', 'Hard work'],
    mortality_risk: 'low',
    legacy: 'Masterwork techniques and guild connections'
  },
  the_noble: {
    name: 'The Noble',
    description: 'A lord who sees a useful and interesting commoner.',
    teaches: ['etiquette', 'command', 'law', 'heraldry'],
    personality: 'Condescending but genuinely helpful, politically motivated',
    demands: ['Deference', 'Usefulness', 'Discretion'],
    mortality_risk: 'moderate',
    legacy: 'Noble connections and patronage'
  }
};

export default NPC_ARCHETYPES;
// END FILE: client/js/data/npc-templates.js
