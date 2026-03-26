// FILE: client/js/data/historical-events.js — PART 3
// Historical timeline 1403-1453+ for THE FATE OF HEINRICH
// These events fire automatically based on calendar date and affect the game world

export const HISTORICAL_EVENTS = [
  // ═══════════════════════════════════════════════════════════════
  // 1403
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'henry_iv_illness_1403',
    year: 1403,
    month: null,
    title: 'King Henry IV of England Falls Ill',
    description: 'The English king suffers a mysterious illness. His court is in turmoil.',
    region_effects: { england: { stability: -5, political_tension: 10 } },
    world_effects: { english_aggression: -10 },
    rumor_seeds: ['The English king is dying', 'Prince Henry grows impatient for the throne'],
    player_opportunities: ['Spy for French interests', 'Trade with destabilized English merchants']
  },
  {
    id: 'owain_glyndwr_1403',
    year: 1403,
    month: 6,
    title: 'Owain Glyndŵr\'s Welsh Rebellion Peaks',
    description: 'The Welsh prince Owain Glyndŵr controls most of Wales. England is stretched thin.',
    region_effects: { wales: { stability: -20, rebellion: 80 }, england: { military_strength: -15 } },
    world_effects: { french_opportunity: 15 },
    rumor_seeds: ['Wales burns with rebellion', 'The Welsh prince seeks French alliance'],
    player_opportunities: ['Join Welsh cause', 'Spy for French', 'Trade weapons to rebels']
  },
  {
    id: 'battle_of_shrewsbury_1403',
    year: 1403,
    month: 7,
    day: 21,
    title: 'Battle of Shrewsbury',
    description: 'Henry IV defeats the Percy rebellion at Shrewsbury. Hotspur is killed.',
    region_effects: { england: { stability: 10, political_tension: -5 } },
    world_effects: { english_stability: 10 },
    rumor_seeds: ['Hotspur is dead', 'The English king has crushed the northern lords'],
    player_opportunities: []
  },

  // ═══════════════════════════════════════════════════════════════
  // 1404
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'charles_vi_madness_1404',
    year: 1404,
    month: null,
    title: 'King Charles VI of France Suffers Madness',
    description: 'The French king\'s mental illness worsens. The Burgundian and Armagnac factions fight for control.',
    region_effects: { france: { stability: -15, political_tension: 20 } },
    world_effects: { french_civil_war_risk: 20 },
    rumor_seeds: ['The king is mad again', 'Burgundy and Armagnac fight like dogs over a bone'],
    player_opportunities: ['Serve either faction', 'Profit from instability', 'Spy work']
  },
  {
    id: 'burgundy_armagnac_begins_1404',
    year: 1404,
    month: null,
    title: 'Burgundian-Armagnac Civil War Begins',
    description: 'France tears itself apart. Duke of Burgundy vs. Duke of Orleans. Every lord must choose a side.',
    region_effects: { france: { stability: -25, civil_war: true } },
    world_effects: { french_civil_war: true, english_opportunity: 20 },
    rumor_seeds: ['France is at war with itself', 'Choose your side or be crushed between them'],
    player_opportunities: ['Join either faction', 'Profit as mercenary', 'Spy for England', 'Stay neutral and profit from chaos']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1405
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'archbishop_scrope_1405',
    year: 1405,
    month: 6,
    title: 'Archbishop Scrope Executed in England',
    description: 'Henry IV executes Archbishop Scrope for rebellion. The Church is outraged.',
    region_effects: { england: { church_tension: 20, stability: -5 } },
    world_effects: { papal_anger_england: 15 },
    rumor_seeds: ['The English king murders archbishops', 'God will punish England for this sacrilege'],
    player_opportunities: ['Church career advancement', 'Exploit English-papal tensions']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1407
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'assassination_orleans_1407',
    year: 1407,
    month: 11,
    day: 23,
    title: 'Assassination of the Duke of Orleans',
    description: 'Louis of Orleans is murdered on the streets of Paris by agents of John the Fearless of Burgundy. France erupts.',
    region_effects: { france: { stability: -30, civil_war_intensity: 30 }, paris: { danger: 20 } },
    world_effects: { french_civil_war_intensity: 30 },
    rumor_seeds: ['The Duke of Orleans is dead', 'Burgundy killed him in the street like a dog', 'Paris runs with blood'],
    player_opportunities: ['Witness the assassination', 'Flee Paris', 'Profit from chaos', 'Join Armagnac revenge']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1408
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'john_fearless_justifies_1408',
    year: 1408,
    month: 3,
    title: 'John the Fearless Justifies the Murder',
    description: 'The Duke of Burgundy publicly justifies the assassination of Orleans. France is shocked.',
    region_effects: { france: { political_tension: 20 } },
    world_effects: {},
    rumor_seeds: ['Burgundy admits the murder and calls it justice', 'The Armagnacs swear revenge'],
    player_opportunities: ['Political intrigue', 'Spy work']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1410
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'armagnac_league_1410',
    year: 1410,
    month: null,
    title: 'Formation of the Armagnac League',
    description: 'The enemies of Burgundy form the Armagnac League. Civil war intensifies.',
    region_effects: { france: { civil_war_intensity: 20 } },
    world_effects: { french_civil_war_intensity: 20 },
    rumor_seeds: ['The Armagnacs have united against Burgundy', 'War comes to every corner of France'],
    player_opportunities: ['Join Armagnac', 'Mercenary work', 'Spy for Burgundy']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1413
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'henry_v_crowned_1413',
    year: 1413,
    month: 3,
    day: 21,
    title: 'Henry V Crowned King of England',
    description: 'The young, ambitious Henry V takes the English throne. He has his eyes on France.',
    region_effects: { england: { stability: 15, military_buildup: 20 } },
    world_effects: { english_aggression: 30, french_threat: 20 },
    rumor_seeds: ['The new English king is a warrior', 'Henry V will come for France', 'England prepares for war'],
    player_opportunities: ['Spy on English preparations', 'Warn French lords', 'Profit from military buildup']
  },
  {
    id: 'cabochien_revolt_1413',
    year: 1413,
    month: 4,
    title: 'Cabochien Revolt in Paris',
    description: 'Butchers and tanners revolt in Paris, demanding reform. The city is in chaos.',
    region_effects: { paris: { stability: -30, danger: 30 } },
    world_effects: {},
    rumor_seeds: ['The butchers have taken Paris', 'The common people rise against the nobles'],
    player_opportunities: ['Join revolt', 'Profit from chaos', 'Protect nobles for reward', 'Flee Paris']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1415
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'agincourt_1415',
    year: 1415,
    month: 10,
    day: 25,
    title: 'Battle of Agincourt',
    description: 'Henry V\'s English army destroys the French nobility at Agincourt. Thousands of French knights are killed or captured. France is shattered.',
    region_effects: { 
      france: { stability: -40, military_strength: -50, noble_deaths: 50 },
      normandy: { english_presence: 30 }
    },
    world_effects: { english_dominance: 40, french_collapse: 30 },
    rumor_seeds: [
      'The flower of French chivalry is dead',
      'Agincourt — God has abandoned France',
      'The English longbow has destroyed our knights',
      'Half the nobility of France lies dead in a muddy field'
    ],
    player_opportunities: [
      'Fight at Agincourt (high risk, high reward)',
      'Flee before the battle',
      'Profit from ransoming prisoners',
      'Spy for English',
      'Help French survivors'
    ],
    is_major: true
  },

  // ═══════════════════════════════════════════════════════════════
  // 1416
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'english_conquest_normandy_1416',
    year: 1416,
    month: null,
    title: 'English Begin Conquest of Normandy',
    description: 'Henry V begins systematically conquering Normandy. Town by town, castle by castle.',
    region_effects: { normandy: { english_occupation: 20, stability: -20 } },
    world_effects: { english_expansion: 20 },
    rumor_seeds: ['The English are coming', 'Normandy falls to the English', 'Flee or submit'],
    player_opportunities: ['Resist English', 'Submit and profit', 'Spy for French resistance', 'Flee south']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1418
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'burgundy_takes_paris_1418',
    year: 1418,
    month: 5,
    title: 'Burgundy Takes Paris',
    description: 'John the Fearless and his Burgundian forces take control of Paris. The Armagnac leaders are massacred.',
    region_effects: { paris: { burgundian_control: true, stability: -20 } },
    world_effects: { burgundian_power: 30 },
    rumor_seeds: ['Burgundy controls Paris', 'The Armagnacs are being slaughtered in the streets', 'The Dauphin has fled'],
    player_opportunities: ['Flee Paris', 'Serve Burgundy', 'Help Armagnac survivors escape']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1419
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'assassination_john_fearless_1419',
    year: 1419,
    month: 9,
    day: 10,
    title: 'Assassination of John the Fearless',
    description: 'The Duke of Burgundy is assassinated at Montereau by agents of the Dauphin. Burgundy allies with England.',
    region_effects: { france: { civil_war_intensity: 30 } },
    world_effects: { burgundy_england_alliance: true, french_collapse: 20 },
    rumor_seeds: ['John the Fearless is dead', 'Burgundy will ally with England now', 'France is finished'],
    player_opportunities: ['Spy work', 'Flee France', 'Serve new Duke of Burgundy']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1420
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'treaty_troyes_1420',
    year: 1420,
    month: 5,
    day: 21,
    title: 'Treaty of Troyes',
    description: 'Henry V is recognized as heir to France. The Dauphin is disinherited. France is effectively conquered.',
    region_effects: { france: { english_control: 50, stability: -30 } },
    world_effects: { english_france_union: true },
    rumor_seeds: ['France has surrendered to England', 'The Dauphin is disinherited', 'We are all English now'],
    player_opportunities: ['Serve English administration', 'Join French resistance', 'Profit from new order'],
    is_major: true
  },

  // ═══════════════════════════════════════════════════════════════
  // 1422
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'henry_v_dies_1422',
    year: 1422,
    month: 8,
    day: 31,
    title: 'Death of Henry V',
    description: 'Henry V dies of dysentery at 35. His infant son Henry VI inherits England and (theoretically) France.',
    region_effects: { england: { stability: -10 }, france: { hope: 20 } },
    world_effects: { english_weakness: 20, french_hope: 20 },
    rumor_seeds: ['Henry V is dead', 'An infant king rules England', 'France has a chance'],
    player_opportunities: ['Join French resistance', 'Serve English regency', 'Spy work']
  },
  {
    id: 'charles_vi_dies_1422',
    year: 1422,
    month: 10,
    day: 21,
    title: 'Death of Charles VI of France',
    description: 'The mad king of France dies. The Dauphin claims the throne as Charles VII, but controls little.',
    region_effects: { france: { political_tension: 20 } },
    world_effects: { french_succession_crisis: true },
    rumor_seeds: ['The mad king is dead', 'Two kings claim France', 'Who is the true king?'],
    player_opportunities: ['Serve Charles VII', 'Serve English Henry VI', 'Stay neutral']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1424
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'battle_verneuil_1424',
    year: 1424,
    month: 8,
    day: 17,
    title: 'Battle of Verneuil',
    description: 'English forces crush a Franco-Scottish army. The English call it a second Agincourt.',
    region_effects: { france: { military_strength: -20 }, scotland: { military_strength: -15 } },
    world_effects: { english_dominance: 10 },
    rumor_seeds: ['Another Agincourt', 'The Scots are destroyed', 'France cannot win in open battle'],
    player_opportunities: ['Fight for France', 'Profit from aftermath', 'Spy work']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1428
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'siege_orleans_1428',
    year: 1428,
    month: 10,
    title: 'Siege of Orleans Begins',
    description: 'English forces besiege Orleans. If it falls, France is finished.',
    region_effects: { orleans: { siege: true, danger: 50 }, france: { hope: -20 } },
    world_effects: { french_crisis: true },
    rumor_seeds: ['Orleans is besieged', 'If Orleans falls, France falls', 'The English will take everything'],
    player_opportunities: ['Defend Orleans', 'Spy for English', 'Profit from siege economy'],
    is_major: true
  },

  // ═══════════════════════════════════════════════════════════════
  // 1429
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'joan_of_arc_1429',
    year: 1429,
    month: 2,
    title: 'Joan of Arc Arrives at Chinon',
    description: 'A peasant girl from Lorraine claims God has sent her to save France. The Dauphin receives her.',
    region_effects: { france: { hope: 30, morale: 20 } },
    world_effects: { french_morale: 30 },
    rumor_seeds: [
      'A girl from Lorraine says God sent her to save France',
      'The Maid of Orleans — is she a saint or a witch?',
      'The Dauphin believes her'
    ],
    player_opportunities: ['Meet Joan', 'Join her army', 'Spy on her', 'Investigate her claims'],
    is_major: true
  },
  {
    id: 'relief_orleans_1429',
    year: 1429,
    month: 5,
    day: 8,
    title: 'Relief of Orleans',
    description: 'Joan of Arc leads French forces to break the siege of Orleans. France erupts in joy.',
    region_effects: { orleans: { siege: false, liberation: true }, france: { hope: 50, morale: 40 } },
    world_effects: { french_resurgence: true, english_shock: 20 },
    rumor_seeds: [
      'Orleans is free!',
      'The Maid has done the impossible',
      'God fights for France',
      'The English are retreating'
    ],
    player_opportunities: ['Celebrate', 'Join French army', 'Profit from English retreat'],
    is_major: true
  },
  {
    id: 'coronation_charles_vii_1429',
    year: 1429,
    month: 7,
    day: 17,
    title: 'Coronation of Charles VII at Reims',
    description: 'Joan of Arc leads Charles VII to Reims for his coronation. France has a legitimate king.',
    region_effects: { france: { legitimacy: 50, morale: 40 } },
    world_effects: { french_legitimacy: true },
    rumor_seeds: ['Charles VII is crowned', 'France has a true king', 'The Maid has fulfilled her mission'],
    player_opportunities: ['Attend coronation', 'Serve Charles VII', 'Profit from celebrations'],
    is_major: true
  },

  // ═══════════════════════════════════════════════════════════════
  // 1430
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'joan_captured_1430',
    year: 1430,
    month: 5,
    day: 23,
    title: 'Joan of Arc Captured by Burgundians',
    description: 'Joan is captured at Compiègne by Burgundian forces and sold to the English.',
    region_effects: { france: { morale: -30, hope: -20 } },
    world_effects: { french_morale: -30 },
    rumor_seeds: ['The Maid is captured', 'Burgundy sold her to the English', 'What will they do to her?'],
    player_opportunities: ['Attempt rescue', 'Spy on her captors', 'Profit from chaos']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1431
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'joan_burned_1431',
    year: 1431,
    month: 5,
    day: 30,
    title: 'Joan of Arc Burned at the Stake',
    description: 'Joan of Arc is burned as a heretic in Rouen. France mourns. The English think they have won.',
    region_effects: { france: { morale: -20 }, rouen: { english_control: true } },
    world_effects: { joan_martyrdom: true },
    rumor_seeds: [
      'They burned the Maid',
      'She died calling on God',
      'The English have made a martyr',
      'France will never forget'
    ],
    player_opportunities: ['Witness execution', 'Collect relics', 'Spread her story'],
    is_major: true
  },
  {
    id: 'henry_vi_crowned_paris_1431',
    year: 1431,
    month: 12,
    day: 16,
    title: 'Henry VI Crowned King of France in Paris',
    description: 'The English crown their infant king as King of France in Paris. Few French accept it.',
    region_effects: { paris: { english_control: true }, france: { resistance: 20 } },
    world_effects: { english_france_claim: true },
    rumor_seeds: ['An English child is crowned in Paris', 'The French will never accept this', 'Resistance grows'],
    player_opportunities: ['Serve English administration', 'Join resistance', 'Spy work']
  },

  // ═══════════════════════════════════════════════════════════════
  // 1435
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'treaty_arras_1435',
    year: 1435,
    month: 9,
    title: 'Treaty of Arras — Burgundy Abandons England',
    description: 'Philip the Good of Burgundy makes peace with Charles VII. England loses its most powerful ally.',
    region_effects: { france: { hope: 40, unity: 30 }, england: { french_position: -30 } },
    world_effects: { burgundy_france_peace: true, english_isolation: true },
    rumor_seeds: ['Burgundy has abandoned England', 'France will be reunited', 'The English are finished'],
    player_opportunities: ['Serve Charles VII', 'Profit from new alliances', 'Spy work'],
    is_major: true
  },

  // ═══════════════════════════════════════════════════════════════
  // 1436
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'paris_liberated_1436',
    year: 1436,
    month: 4,
    title: 'Paris Liberated from English',
    description: 'French forces retake Paris. The English are driven from the capital.',
    region_effects: { paris: { french_control: true, liberation: true }, france: { morale: 40 } },
    world_effects: { french_resurgence: true },
    rumor_seeds: ['Paris is free!', 'The English are driven from our capital', 'France rises again'],
    player_opportunities: ['Celebrate', 'Profit from liberation', 'Serve new French administration'],
    is_major: true
  },

  // ═══════════════════════════════════════════════════════════════
  // 1440s
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'praguerie_1440',
    year: 1440,
    month: null,
    title: 'The Praguerie — Noble Revolt Against Charles VII',
    description: 'French nobles revolt against Charles VII\'s attempts to centralize power.',
    region_effects: { france: { stability: -20, noble_revolt: true } },
    world_effects: {},
    rumor_seeds: ['The nobles revolt against the king', 'France tears itself apart again'],
    player_opportunities: ['Join revolt', 'Serve king', 'Profit from chaos']
  },
  {
    id: 'black_death_returns_1440s',
    year: 1440,
    month: null,
    title: 'Plague Returns to France',
    description: 'The Black Death returns in waves throughout the 1440s, killing thousands.',
    region_effects: { france: { population: -10, stability: -10 } },
    world_effects: { plague_active: true },
    rumor_seeds: ['The plague is back', 'God punishes us again', 'Flee the cities'],
    player_opportunities: ['Medicine skill opportunities', 'Profit from scarcity', 'Flee affected areas'],
    is_recurring: true
  },
  {
    id: 'gutenberg_printing_1440',
    year: 1440,
    month: null,
    title: 'Gutenberg Develops Movable Type Printing',
    description: 'In Mainz, Johannes Gutenberg is experimenting with movable type printing. The world will never be the same.',
    region_effects: { germany: { innovation: 30 } },
    world_effects: { printing_press_development: true },
    rumor_seeds: ['A German craftsman makes books without scribes', 'Books may become cheap as bread'],
    player_opportunities: ['If Heinrich has been working on printing press invention, this validates his work'],
    invention_trigger: 'printing_press'
  },

  // ═══════════════════════════════════════════════════════════════
  // 1449-1453: FINAL EXPULSION OF ENGLISH
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'normandy_reconquest_1449',
    year: 1449,
    month: null,
    title: 'France Reconquers Normandy',
    description: 'Charles VII\'s reformed army sweeps through Normandy, expelling the English.',
    region_effects: { normandy: { french_control: true, liberation: true }, england: { french_territory: -50 } },
    world_effects: { french_victory: true },
    rumor_seeds: ['Normandy is French again', 'The English are driven out', 'France is whole again'],
    player_opportunities: ['Fight for France', 'Profit from liberation', 'Serve new administration'],
    is_major: true
  },
  {
    id: 'battle_castillon_1453',
    year: 1453,
    month: 7,
    day: 17,
    title: 'Battle of Castillon — End of Hundred Years War',
    description: 'French artillery destroys the last English army in France. The Hundred Years War ends. Only Calais remains English.',
    region_effects: { france: { english_presence: 0, liberation: true }, england: { french_territory: 5 } },
    world_effects: { hundred_years_war_end: true, french_victory: true },
    rumor_seeds: [
      'The war is over',
      'France is free',
      'The English are gone',
      'A hundred years of war — finally ended'
    ],
    player_opportunities: ['Celebrate', 'Serve in new France', 'Write history'],
    is_major: true
  },

  // ═══════════════════════════════════════════════════════════════
  // ONGOING EVENTS (can fire any year)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'famine_recurring',
    year: null,
    month: null,
    title: 'Famine Strikes',
    description: 'Crop failure leads to famine in the region.',
    region_effects: { affected_region: { food_price: 200, stability: -15 } },
    world_effects: {},
    rumor_seeds: ['The harvest has failed', 'People are starving', 'Grain prices have tripled'],
    player_opportunities: ['Hoard grain', 'Distribute food for reputation', 'Profit from scarcity'],
    is_recurring: true,
    trigger_conditions: { bad_harvest: true }
  },
  {
    id: 'plague_outbreak_recurring',
    year: null,
    month: null,
    title: 'Plague Outbreak',
    description: 'The Black Death or another plague strikes the region.',
    region_effects: { affected_region: { population: -5, stability: -10, danger: 20 } },
    world_effects: {},
    rumor_seeds: ['The plague has come', 'Flee the city', 'The doctors are helpless'],
    player_opportunities: ['Medicine skill opportunities', 'Flee', 'Profit from scarcity'],
    is_recurring: true,
    trigger_conditions: { random_chance: 0.05 }
  },
  {
    id: 'tournament_announced',
    year: null,
    month: null,
    title: 'Tournament Announced',
    description: 'A local lord announces a tournament. Knights and fighters come from across the region.',
    region_effects: { host_region: { economy: 10, prestige: 10 } },
    world_effects: {},
    rumor_seeds: ['A tournament is announced', 'Knights gather for glory and prizes'],
    player_opportunities: ['Compete in tournament', 'Bet on outcomes', 'Pickpocket crowds', 'Sell goods'],
    is_recurring: true,
    trigger_conditions: { noble_present: true }
  },
  {
    id: 'pilgrimage_season',
    year: null,
    month: 4,
    title: 'Pilgrimage Season',
    description: 'Spring brings pilgrims traveling to holy sites. Roads are busy with travelers.',
    region_effects: { all: { travel_activity: 20 } },
    world_effects: {},
    rumor_seeds: ['The pilgrims are on the road', 'Holy season brings travelers from everywhere'],
    player_opportunities: ['Join pilgrimage', 'Rob pilgrims', 'Sell goods to travelers', 'Gather information'],
    is_recurring: true,
    trigger_conditions: { season: 'spring' }
  }
];

// Helper function to get events for a specific year/month
export function getEventsForDate(year, month) {
  return HISTORICAL_EVENTS.filter(event => {
    if (event.is_recurring) return false; // Handled separately
    if (event.year === null) return false;
    if (event.year !== year) return false;
    if (event.month !== null && event.month !== month) return false;
    return true;
  });
}

// Helper function to get recurring events that might trigger
export function getRecurringEvents() {
  return HISTORICAL_EVENTS.filter(event => event.is_recurring);
}

// Helper function to get major events (for chronicle)
export function getMajorEvents() {
  return HISTORICAL_EVENTS.filter(event => event.is_major);
}

export default HISTORICAL_EVENTS;
// END FILE: client/js/data/historical-events.js
