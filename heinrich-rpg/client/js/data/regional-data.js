// FILE: client/js/data/regional-data.js — PART 3
// Regional profiles for THE FATE OF HEINRICH
// Each region has unique culture, economy, politics, and mechanical effects

export const REGIONAL_DATA = {
  // ═══════════════════════════════════════════════════════════════
  // NORMANDY (Starting Region)
  // ═══════════════════════════════════════════════════════════════
  normandy: {
    id: 'normandy',
    name: 'Normandy',
    french_name: 'Normandie',
    description: 'The ancestral homeland of the Normans. Rich farmland, strong castles, contested between France and England.',
    capital: 'Rouen',
    major_cities: ['Rouen', 'Caen', 'Bayeux', 'Cherbourg', 'Falaise'],
    
    culture: {
      primary: 'Norman',
      language: 'norman_french',
      religion: 'Catholic',
      traits: ['proud', 'independent', 'seafaring', 'martial', 'practical'],
      values: ['honor', 'land', 'family', 'strength'],
      speech_style: 'Direct, clipped, proud. Normans don\'t waste words. They say what they mean and mean what they say.',
      notable_customs: [
        'Strong tradition of primogeniture (eldest son inherits all)',
        'Respect for martial prowess above all',
        'Deep suspicion of Parisians and their "fancy ways"',
        'Strong local identity — Norman first, French second'
      ]
    },
    
    economy: {
      primary_industries: ['agriculture', 'fishing', 'wool_trade', 'horse_breeding'],
      secondary_industries: ['shipbuilding', 'salt_production', 'cider_making'],
      trade_partners: ['england', 'flanders', 'paris'],
      wealth_level: 'moderate',
      base_prices: {
        grain: 1.0,
        wool: 1.2,
        fish: 0.8,
        horses: 1.3,
        wine: 1.1,
        salt: 0.9
      },
      economic_modifiers: {
        coastal_trade: 1.2,
        english_trade: 1.3,
        agricultural_output: 1.1
      }
    },
    
    politics: {
      nominal_ruler: 'King of France',
      actual_power: 'Local Norman lords',
      political_stability: 'unstable',
      english_influence: 'high',
      french_influence: 'moderate',
      key_factions: ['Norman_lords', 'French_crown', 'English_crown', 'Church'],
      political_tensions: [
        'English vs French claims to Normandy',
        'Local lords vs central authority',
        'Church vs secular power'
      ]
    },
    
    geography: {
      terrain: ['rolling_hills', 'river_valleys', 'coastal_cliffs', 'forests'],
      climate: 'temperate_maritime',
      rivers: ['Seine', 'Orne', 'Vire'],
      ports: ['Cherbourg', 'Honfleur', 'Dieppe'],
      strategic_value: 'very_high'
    },
    
    mechanical_effects: {
      starting_region: true,
      english_presence_modifier: 20,
      travel_to_england: 'possible',
      horse_breeding_bonus: 10,
      fishing_bonus: 10,
      political_instability_modifier: 15
    },
    
    locations: {
      villages: ['Renard_village', 'Saint_Pierre', 'La_Haye', 'Tilly'],
      manors: ['Beaumont_Manor', 'Valois_Estate'],
      monasteries: ['Abbey_of_Jumieges', 'Mont_Saint_Michel'],
      markets: ['Rouen_market', 'Caen_market'],
      taverns: ['The_Crossed_Swords', 'The_Norman_Arms', 'The_Fisherman\'s_Rest']
    },
    
    npc_archetypes: [
      'Norman_lord', 'English_soldier', 'French_tax_collector', 'Norman_farmer',
      'Fisherman', 'Merchant', 'Monk', 'Blacksmith', 'Miller'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PARIS (Île-de-France)
  // ═══════════════════════════════════════════════════════════════
  paris: {
    id: 'paris',
    name: 'Paris',
    french_name: 'Paris',
    description: 'The heart of France. A city of 200,000 souls, the largest in northern Europe. Center of power, culture, and danger.',
    capital: 'Paris',
    major_cities: ['Paris', 'Saint-Denis', 'Vincennes'],
    
    culture: {
      primary: 'Parisian',
      language: 'parisian_french',
      religion: 'Catholic',
      traits: ['sophisticated', 'political', 'fashion_conscious', 'intellectual', 'dangerous'],
      values: ['status', 'wit', 'connections', 'appearance'],
      speech_style: 'Elaborate, layered, full of implication. Parisians say one thing and mean three others. Every word is a move in a game.',
      notable_customs: [
        'Elaborate court etiquette',
        'Fashion as social signaling',
        'University culture (Sorbonne)',
        'Guild power in city politics',
        'Factional violence between Burgundians and Armagnacs'
      ]
    },
    
    economy: {
      primary_industries: ['luxury_goods', 'finance', 'administration', 'crafts'],
      secondary_industries: ['food_trade', 'publishing', 'legal_services'],
      trade_partners: ['all_france', 'flanders', 'italy'],
      wealth_level: 'very_high',
      base_prices: {
        grain: 1.3,
        luxury_goods: 0.8,
        books: 0.7,
        legal_services: 0.8,
        wine: 0.9,
        horses: 1.5
      },
      economic_modifiers: {
        luxury_trade: 1.4,
        financial_services: 1.5,
        information_value: 1.5
      }
    },
    
    politics: {
      nominal_ruler: 'King of France',
      actual_power: 'Whoever controls the king',
      political_stability: 'very_unstable',
      english_influence: 'variable',
      french_influence: 'high',
      key_factions: ['Burgundians', 'Armagnacs', 'University', 'Guilds', 'Church', 'Royal_court'],
      political_tensions: [
        'Burgundian vs Armagnac civil war',
        'English occupation (1418-1436)',
        'University vs Church authority',
        'Guild power vs noble privilege'
      ]
    },
    
    geography: {
      terrain: ['river_city', 'urban', 'surrounding_farmland'],
      climate: 'temperate_continental',
      rivers: ['Seine'],
      ports: [],
      strategic_value: 'supreme'
    },
    
    mechanical_effects: {
      social_advancement_bonus: 20,
      information_availability: 30,
      danger_level: 20,
      etiquette_requirement: 3,
      language_requirement: 'parisian_french',
      cultural_shock_if_peasant: 30
    },
    
    locations: {
      districts: ['Île_de_la_Cité', 'Right_Bank', 'Left_Bank', 'University_Quarter'],
      landmarks: ['Notre_Dame', 'Louvre', 'Sorbonne', 'Les_Halles'],
      taverns: ['The_Golden_Fleur', 'The_Scholar\'s_Rest', 'The_Burgundian_Arms'],
      markets: ['Les_Halles', 'Place_de_Grève'],
      guildhalls: ['Butchers_Guild', 'Drapers_Guild', 'Goldsmiths_Guild']
    },
    
    npc_archetypes: [
      'Noble_courtier', 'University_scholar', 'Guild_master', 'Burgundian_soldier',
      'Armagnac_spy', 'Merchant', 'Lawyer', 'Priest', 'Beggar', 'Prostitute'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // BURGUNDY
  // ═══════════════════════════════════════════════════════════════
  burgundy: {
    id: 'burgundy',
    name: 'Burgundy',
    french_name: 'Bourgogne',
    description: 'The most powerful duchy in France. Rich wine country, sophisticated court, and a duke who rivals the king.',
    capital: 'Dijon',
    major_cities: ['Dijon', 'Beaune', 'Auxerre', 'Mâcon'],
    
    culture: {
      primary: 'Burgundian',
      language: 'parisian_french',
      religion: 'Catholic',
      traits: ['proud', 'wealthy', 'sophisticated', 'ambitious', 'chivalric'],
      values: ['honor', 'wealth', 'power', 'art', 'wine'],
      speech_style: 'Formal, proud, with an edge of condescension. Burgundians know they are the best and expect you to know it too.',
      notable_customs: [
        'Elaborate court ceremonies',
        'Order of the Golden Fleece (chivalric order)',
        'Wine culture — wine is identity',
        'Flemish artistic patronage',
        'Political independence from French crown'
      ]
    },
    
    economy: {
      primary_industries: ['wine', 'wool', 'luxury_goods', 'finance'],
      secondary_industries: ['agriculture', 'crafts', 'trade'],
      trade_partners: ['flanders', 'paris', 'italy', 'germany'],
      wealth_level: 'very_high',
      base_prices: {
        wine: 0.6,
        wool: 1.0,
        luxury_goods: 0.9,
        grain: 1.0
      },
      economic_modifiers: {
        wine_production: 1.5,
        luxury_trade: 1.3,
        flemish_connection: 1.2
      }
    },
    
    politics: {
      nominal_ruler: 'Duke of Burgundy (vassal of France)',
      actual_power: 'Duke of Burgundy',
      political_stability: 'stable',
      english_influence: 'variable',
      french_influence: 'low',
      key_factions: ['Ducal_court', 'Church', 'Nobility', 'Merchants'],
      political_tensions: [
        'Independence from French crown',
        'Alliance with England (1419-1435)',
        'Flemish integration'
      ]
    },
    
    geography: {
      terrain: ['rolling_hills', 'river_valleys', 'vineyards', 'forests'],
      climate: 'temperate_continental',
      rivers: ['Saône', 'Yonne'],
      ports: [],
      strategic_value: 'high'
    },
    
    mechanical_effects: {
      wine_trade_bonus: 30,
      court_access_bonus: 20,
      chivalric_culture_modifier: 15,
      political_intrigue_level: 20
    },
    
    locations: {
      cities: ['Dijon', 'Beaune'],
      vineyards: ['Côte_de_Nuits', 'Côte_de_Beaune'],
      monasteries: ['Cluny', 'Cîteaux'],
      taverns: ['The_Golden_Fleece', 'The_Vintner\'s_Rest']
    },
    
    npc_archetypes: [
      'Burgundian_noble', 'Vintner', 'Merchant', 'Knight', 'Monk', 'Court_official'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // FLANDERS
  // ═══════════════════════════════════════════════════════════════
  flanders: {
    id: 'flanders',
    name: 'Flanders',
    french_name: 'Flandre',
    description: 'The richest region in northern Europe. Cloth towns, merchant wealth, and fierce civic pride.',
    capital: 'Bruges',
    major_cities: ['Bruges', 'Ghent', 'Ypres', 'Brussels'],
    
    culture: {
      primary: 'Flemish',
      language: 'flemish',
      religion: 'Catholic',
      traits: ['mercantile', 'proud', 'civic', 'artistic', 'independent'],
      values: ['wealth', 'civic_freedom', 'craft_excellence', 'trade'],
      speech_style: 'Practical, direct, focused on business. Flemish merchants don\'t waste time on pleasantries when there\'s money to be made.',
      notable_customs: [
        'Strong guild culture',
        'Civic pride over noble authority',
        'Flemish painting tradition',
        'International trade networks',
        'Cloth as currency of power'
      ]
    },
    
    economy: {
      primary_industries: ['cloth_weaving', 'trade', 'banking', 'luxury_goods'],
      secondary_industries: ['fishing', 'brewing', 'crafts'],
      trade_partners: ['england', 'italy', 'germany', 'france', 'hanseatic_league'],
      wealth_level: 'extremely_high',
      base_prices: {
        cloth: 0.7,
        wool: 0.9,
        luxury_goods: 0.8,
        banking_services: 0.7,
        grain: 1.2
      },
      economic_modifiers: {
        cloth_trade: 1.5,
        banking: 1.4,
        international_trade: 1.4
      }
    },
    
    politics: {
      nominal_ruler: 'Duke of Burgundy',
      actual_power: 'Merchant guilds and city councils',
      political_stability: 'moderate',
      english_influence: 'high',
      french_influence: 'low',
      key_factions: ['Merchant_guilds', 'Weavers_guild', 'Burgundian_court', 'English_wool_merchants'],
      political_tensions: [
        'Guild power vs noble authority',
        'English wool supply dependency',
        'Burgundian vs French influence'
      ]
    },
    
    geography: {
      terrain: ['flat', 'coastal', 'river_delta', 'urban'],
      climate: 'maritime',
      rivers: ['Scheldt', 'Lys'],
      ports: ['Bruges', 'Sluys'],
      strategic_value: 'very_high'
    },
    
    mechanical_effects: {
      trade_bonus: 30,
      banking_access: true,
      cloth_trade_bonus: 30,
      language_barrier: 'flemish',
      cultural_shock_if_french: 15
    },
    
    locations: {
      cities: ['Bruges', 'Ghent'],
      markets: ['Bruges_market', 'Ghent_cloth_hall'],
      banks: ['Medici_branch', 'Local_money_changers'],
      taverns: ['The_Cloth_Hall', 'The_Merchant\'s_Rest', 'The_English_Wool']
    },
    
    npc_archetypes: [
      'Flemish_merchant', 'Cloth_weaver', 'Banker', 'English_wool_merchant',
      'Guild_master', 'Painter', 'Brewer'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ENGLAND
  // ═══════════════════════════════════════════════════════════════
  england: {
    id: 'england',
    name: 'England',
    french_name: 'Angleterre',
    description: 'The island kingdom. Powerful, aggressive, and claiming half of France.',
    capital: 'London',
    major_cities: ['London', 'Bristol', 'York', 'Canterbury'],
    
    culture: {
      primary: 'English',
      language: 'english',
      religion: 'Catholic',
      traits: ['pragmatic', 'aggressive', 'insular', 'mercantile', 'proud'],
      values: ['conquest', 'trade', 'common_law', 'parliament'],
      speech_style: 'Blunt, practical, with an undercurrent of aggression. The English say what they want and take what they can.',
      notable_customs: [
        'Common law tradition',
        'Parliament (unusual power for nobles and commons)',
        'Longbow culture',
        'Wool trade dominance',
        'Anti-French sentiment'
      ]
    },
    
    economy: {
      primary_industries: ['wool', 'cloth', 'trade', 'fishing'],
      secondary_industries: ['agriculture', 'mining', 'crafts'],
      trade_partners: ['flanders', 'france', 'hanseatic_league'],
      wealth_level: 'high',
      base_prices: {
        wool: 0.8,
        cloth: 0.9,
        fish: 0.7,
        grain: 1.0
      },
      economic_modifiers: {
        wool_export: 1.4,
        naval_trade: 1.3
      }
    },
    
    politics: {
      nominal_ruler: 'King of England (and France)',
      actual_power: 'King and Parliament',
      political_stability: 'moderate',
      english_influence: 'supreme',
      french_influence: 'none',
      key_factions: ['Royal_court', 'Parliament', 'Church', 'Nobility', 'Merchants'],
      political_tensions: [
        'War with France costs',
        'Parliamentary power growing',
        'Welsh and Scottish unrest'
      ]
    },
    
    geography: {
      terrain: ['rolling_hills', 'forests', 'coastal', 'moors'],
      climate: 'maritime',
      rivers: ['Thames', 'Severn'],
      ports: ['London', 'Bristol', 'Southampton'],
      strategic_value: 'high'
    },
    
    mechanical_effects: {
      language_barrier: 'english',
      cultural_shock_if_french: 25,
      danger_if_french: 20,
      wool_trade_bonus: 20,
      naval_access: true
    },
    
    locations: {
      cities: ['London', 'Bristol'],
      landmarks: ['Tower_of_London', 'Westminster', 'Canterbury_Cathedral'],
      taverns: ['The_King\'s_Head', 'The_Wool_Merchant', 'The_Longbow']
    },
    
    npc_archetypes: [
      'English_knight', 'Merchant', 'Longbowman', 'Priest', 'Noble', 'Wool_trader'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // BRITTANY
  // ═══════════════════════════════════════════════════════════════
  brittany: {
    id: 'brittany',
    name: 'Brittany',
    french_name: 'Bretagne',
    description: 'The Celtic peninsula. Fiercely independent, seafaring, and mysterious.',
    capital: 'Rennes',
    major_cities: ['Rennes', 'Nantes', 'Brest', 'Saint-Malo'],
    
    culture: {
      primary: 'Breton',
      language: 'breton',
      religion: 'Catholic',
      traits: ['independent', 'seafaring', 'mystical', 'stubborn', 'proud'],
      values: ['independence', 'sea', 'tradition', 'family'],
      speech_style: 'Slow, deliberate, with a musical lilt. Bretons take their time. They\'ve been here longer than France and they know it.',
      notable_customs: [
        'Celtic traditions mixed with Christianity',
        'Strong seafaring culture',
        'Fierce independence from France',
        'Arthurian legend tradition',
        'Distinctive music and dance'
      ]
    },
    
    economy: {
      primary_industries: ['fishing', 'salt', 'trade', 'agriculture'],
      secondary_industries: ['shipbuilding', 'linen', 'crafts'],
      trade_partners: ['england', 'spain', 'france'],
      wealth_level: 'moderate',
      base_prices: {
        fish: 0.7,
        salt: 0.8,
        linen: 0.9,
        grain: 1.0
      },
      economic_modifiers: {
        fishing_bonus: 1.3,
        salt_trade: 1.2,
        naval_access: 1.2
      }
    },
    
    politics: {
      nominal_ruler: 'Duke of Brittany',
      actual_power: 'Duke of Brittany',
      political_stability: 'stable',
      english_influence: 'moderate',
      french_influence: 'low',
      key_factions: ['Ducal_court', 'Church', 'Nobility', 'Seafarers'],
      political_tensions: [
        'Independence from France',
        'English alliance vs French pressure'
      ]
    },
    
    geography: {
      terrain: ['coastal', 'moorland', 'forests', 'rocky'],
      climate: 'maritime',
      rivers: ['Vilaine', 'Aulne'],
      ports: ['Brest', 'Saint-Malo', 'Nantes'],
      strategic_value: 'moderate'
    },
    
    mechanical_effects: {
      seafaring_bonus: 20,
      fishing_bonus: 20,
      language_barrier: 'breton',
      mystical_events_modifier: 10,
      independence_culture: true
    },
    
    locations: {
      cities: ['Rennes', 'Nantes'],
      ports: ['Brest', 'Saint-Malo'],
      monasteries: ['Mont_Saint_Michel_nearby'],
      taverns: ['The_Sailor\'s_Rest', 'The_Celtic_Cross', 'The_Salt_Merchant']
    },
    
    npc_archetypes: [
      'Breton_sailor', 'Fisherman', 'Salt_merchant', 'Breton_noble', 'Monk', 'Smuggler'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // GASCONY / AQUITAINE
  // ═══════════════════════════════════════════════════════════════
  gascony: {
    id: 'gascony',
    name: 'Gascony',
    french_name: 'Gascogne',
    description: 'The wine country of the south. Long under English rule, now contested. Hot, proud, and dangerous.',
    capital: 'Bordeaux',
    major_cities: ['Bordeaux', 'Bayonne', 'Dax', 'Agen'],
    
    culture: {
      primary: 'Gascon',
      language: 'occitan',
      religion: 'Catholic',
      traits: ['proud', 'hot_tempered', 'independent', 'martial', 'wine_loving'],
      values: ['honor', 'wine', 'independence', 'martial_prowess'],
      speech_style: 'Passionate, loud, with dramatic gestures. Gascons feel everything deeply and say it louder. Honor is everything.',
      notable_customs: [
        'Dueling culture',
        'Wine as identity',
        'English loyalty (long English rule)',
        'Troubadour tradition',
        'Hot-blooded honor culture'
      ]
    },
    
    economy: {
      primary_industries: ['wine', 'trade', 'agriculture'],
      secondary_industries: ['fishing', 'crafts', 'salt'],
      trade_partners: ['england', 'spain', 'france'],
      wealth_level: 'high',
      base_prices: {
        wine: 0.7,
        grain: 1.0,
        fish: 0.8,
        salt: 0.9
      },
      economic_modifiers: {
        wine_export: 1.4,
        english_trade: 1.3,
        port_trade: 1.2
      }
    },
    
    politics: {
      nominal_ruler: 'King of England (historically)',
      actual_power: 'Local lords and English crown',
      political_stability: 'unstable',
      english_influence: 'high',
      french_influence: 'growing',
      key_factions: ['English_crown', 'Local_lords', 'French_crown', 'Church'],
      political_tensions: [
        'English vs French control',
        'Local independence',
        'Wine trade politics'
      ]
    },
    
    geography: {
      terrain: ['river_valleys', 'vineyards', 'forests', 'coastal'],
      climate: 'warm_temperate',
      rivers: ['Garonne', 'Dordogne'],
      ports: ['Bordeaux', 'Bayonne'],
      strategic_value: 'high'
    },
    
    mechanical_effects: {
      wine_trade_bonus: 25,
      english_connection: true,
      dueling_culture: true,
      language_barrier: 'occitan',
      cultural_shock_if_northern: 15
    },
    
    locations: {
      cities: ['Bordeaux', 'Bayonne'],
      vineyards: ['Médoc', 'Saint-Émilion'],
      taverns: ['The_Gascon_Arms', 'The_Wine_Merchant', 'The_English_Rose']
    },
    
    npc_archetypes: [
      'Gascon_noble', 'Wine_merchant', 'English_soldier', 'Troubadour', 'Duelist', 'Merchant'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // PROVENCE
  // ═══════════════════════════════════════════════════════════════
  provence: {
    id: 'provence',
    name: 'Provence',
    french_name: 'Provence',
    description: 'The Mediterranean south. Ancient Roman heritage, troubadour culture, and Mediterranean trade.',
    capital: 'Aix-en-Provence',
    major_cities: ['Aix-en-Provence', 'Marseille', 'Arles', 'Avignon'],
    
    culture: {
      primary: 'Provençal',
      language: 'occitan',
      religion: 'Catholic',
      traits: ['artistic', 'sophisticated', 'Mediterranean', 'independent', 'learned'],
      values: ['art', 'learning', 'trade', 'pleasure', 'beauty'],
      speech_style: 'Lyrical, poetic, with Mediterranean warmth. Provençals speak as if every sentence is a song.',
      notable_customs: [
        'Troubadour tradition (birthplace)',
        'Roman heritage pride',
        'Mediterranean trade culture',
        'Papal presence (Avignon)',
        'Jewish community (relatively tolerant)'
      ]
    },
    
    economy: {
      primary_industries: ['trade', 'olive_oil', 'wine', 'fishing'],
      secondary_industries: ['crafts', 'spices', 'luxury_goods'],
      trade_partners: ['italy', 'spain', 'north_africa', 'france'],
      wealth_level: 'high',
      base_prices: {
        olive_oil: 0.8,
        wine: 0.8,
        spices: 0.7,
        fish: 0.7,
        luxury_goods: 0.9
      },
      economic_modifiers: {
        mediterranean_trade: 1.4,
        spice_trade: 1.3,
        papal_economy: 1.2
      }
    },
    
    politics: {
      nominal_ruler: 'Count of Provence',
      actual_power: 'Count of Provence and Pope (in Avignon)',
      political_stability: 'moderate',
      english_influence: 'none',
      french_influence: 'moderate',
      key_factions: ['Papal_court', 'Local_nobility', 'Merchants', 'Church'],
      political_tensions: [
        'Papal vs secular authority',
        'Italian influence',
        'French crown pressure'
      ]
    },
    
    geography: {
      terrain: ['mediterranean_coast', 'mountains', 'river_valleys', 'plains'],
      climate: 'mediterranean',
      rivers: ['Rhône', 'Durance'],
      ports: ['Marseille', 'Toulon'],
      strategic_value: 'moderate'
    },
    
    mechanical_effects: {
      mediterranean_trade_access: true,
      papal_access: true,
      language_barrier: 'occitan',
      cultural_shock_if_northern: 20,
      spice_trade_bonus: 20
    },
    
    locations: {
      cities: ['Aix', 'Marseille', 'Avignon'],
      landmarks: ['Papal_Palace_Avignon', 'Roman_Arena_Arles'],
      taverns: ['The_Troubadour', 'The_Mediterranean', 'The_Papal_Arms']
    },
    
    npc_archetypes: [
      'Provençal_noble', 'Merchant', 'Troubadour', 'Papal_official', 'Spice_trader', 'Fisherman'
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // ITALY (General)
  // ═══════════════════════════════════════════════════════════════
  italy: {
    id: 'italy',
    name: 'Italy',
    french_name: 'Italie',
    description: 'The cradle of civilization reborn. City-states, banking, art, and endless political intrigue.',
    capital: null,
    major_cities: ['Venice', 'Florence', 'Milan', 'Rome', 'Naples', 'Genoa'],
    
    culture: {
      primary: 'Italian',
      language: 'italian',
      religion: 'Catholic',
      traits: ['sophisticated', 'artistic', 'mercantile', 'political', 'Renaissance'],
      values: ['beauty', 'wealth', 'power', 'art', 'learning'],
      speech_style: 'Elegant, layered, with hidden meanings. Italians communicate on multiple levels simultaneously. What they say is never all they mean.',
      notable_customs: [
        'Renaissance humanism',
        'Banking and finance innovation',
        'City-state politics',
        'Patronage of arts',
        'Condottiere mercenary culture'
      ]
    },
    
    economy: {
      primary_industries: ['banking', 'trade', 'luxury_goods', 'crafts'],
      secondary_industries: ['agriculture', 'shipping', 'publishing'],
      trade_partners: ['all_europe', 'middle_east', 'north_africa'],
      wealth_level: 'extremely_high',
      base_prices: {
        luxury_goods: 0.7,
        banking_services: 0.6,
        art: 0.8,
        spices: 0.8,
        silk: 0.7
      },
      economic_modifiers: {
        banking: 1.5,
        luxury_trade: 1.5,
        mediterranean_trade: 1.4
      }
    },
    
    politics: {
      nominal_ruler: 'Various city-state rulers',
      actual_power: 'City-state governments',
      political_stability: 'variable',
      english_influence: 'none',
      french_influence: 'moderate',
      key_factions: ['Medici', 'Visconti', 'Doge_of_Venice', 'Pope', 'Condottieri'],
      political_tensions: [
        'City-state rivalries',
        'French and German interference',
        'Papal politics'
      ]
    },
    
    geography: {
      terrain: ['mountains', 'plains', 'coastal', 'river_valleys'],
      climate: 'mediterranean',
      rivers: ['Po', 'Arno', 'Tiber'],
      ports: ['Venice', 'Genoa', 'Naples'],
      strategic_value: 'very_high'
    },
    
    mechanical_effects: {
      banking_access: true,
      renaissance_knowledge_bonus: 20,
      language_barrier: 'italian',
      cultural_shock_if_northern: 15,
      art_and_learning_bonus: 25
    },
    
    locations: {
      cities: ['Venice', 'Florence', 'Rome', 'Milan'],
      landmarks: ['Vatican', 'Medici_Bank', 'Doge\'s_Palace'],
      taverns: ['The_Florentine', 'The_Venetian', 'The_Roman_Arms']
    },
    
    npc_archetypes: [
      'Banker', 'Merchant', 'Condottiere', 'Artist', 'Scholar', 'Papal_official', 'Noble'
    ]
  }
};

// Cultural shock stages when entering a foreign culture
export const CULTURAL_SHOCK_STAGES = {
  0: {
    name: 'Honeymoon',
    description: 'Everything is new and exciting. You notice the differences but find them charming.',
    mechanical_effects: { social_checks: 0, observation_bonus: 10 }
  },
  1: {
    name: 'Frustration',
    description: 'The differences are annoying. You keep making mistakes. People look at you strangely.',
    mechanical_effects: { social_checks: -10, misunderstanding_chance: 20 }
  },
  2: {
    name: 'Adjustment',
    description: 'You\'re learning the rules. Still making mistakes but recovering faster.',
    mechanical_effects: { social_checks: -5, learning_bonus: 10 }
  },
  3: {
    name: 'Adaptation',
    description: 'You understand the culture. You can navigate it effectively.',
    mechanical_effects: { social_checks: 0, cultural_insight_bonus: 10 }
  }
};

// Language stages for Heinrich's speech evolution
export const LANGUAGE_STAGES = {
  peasant_norman_french: {
    name: 'Peasant Norman French',
    description: 'Rough, direct, full of agricultural metaphors. Clearly a man of the soil.',
    social_penalty: { nobles: -10, clergy: -5 },
    social_bonus: { peasants: 10, soldiers: 5 }
  },
  educated_french: {
    name: 'Educated French',
    description: 'Correct grammar, broader vocabulary. Clearly self-educated.',
    social_penalty: { nobles: -5 },
    social_bonus: { merchants: 5, clergy: 5 }
  },
  courtly_french: {
    name: 'Courtly French',
    description: 'Elegant, layered, appropriate for noble company.',
    social_penalty: {},
    social_bonus: { nobles: 10, clergy: 10 }
  },
  diplomatic_french: {
    name: 'Diplomatic French',
    description: 'The language of power. Every word chosen for effect.',
    social_penalty: {},
    social_bonus: { nobles: 15, clergy: 15, merchants: 10 }
  },
  legendary_orator: {
    name: 'Legendary Orator',
    description: 'Words that move mountains. People remember every sentence.',
    social_penalty: {},
    social_bonus: { all: 20 }
  }
};

export default REGIONAL_DATA;
// END FILE: client/js/data/regional-data.js
