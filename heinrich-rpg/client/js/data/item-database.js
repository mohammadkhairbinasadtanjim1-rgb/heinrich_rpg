// FILE: client/js/data/item-database.js — PART 3
// Complete item database for THE FATE OF HEINRICH

// Quality tiers (7 levels)
export const QUALITY_TIERS = {
  ruined: { name: 'Ruined', modifier: -3, value_multiplier: 0.1, description: 'Barely functional. Will fail soon.' },
  poor: { name: 'Poor', modifier: -2, value_multiplier: 0.3, description: 'Below average. Functional but unreliable.' },
  common: { name: 'Common', modifier: 0, value_multiplier: 1.0, description: 'Standard quality. Does the job.' },
  good: { name: 'Good', modifier: 1, value_multiplier: 2.0, description: 'Above average. Well-made.' },
  fine: { name: 'Fine', modifier: 2, value_multiplier: 5.0, description: 'Excellent quality. Craftsman\'s pride.' },
  masterwork: { name: 'Masterwork', modifier: 3, value_multiplier: 15.0, description: 'Exceptional. A master\'s finest work.' },
  legendary: { name: 'Legendary', modifier: 5, value_multiplier: 50.0, description: 'A named item. Has its own history.' }
};

// Material quality tiers
export const MATERIAL_TIERS = {
  scrap: { name: 'Scrap', modifier: -2, description: 'Salvaged, damaged material.' },
  raw: { name: 'Raw', modifier: -1, description: 'Unprocessed, basic material.' },
  common: { name: 'Common', modifier: 0, description: 'Standard material.' },
  good: { name: 'Good', modifier: 1, description: 'Quality material, well-sourced.' },
  fine: { name: 'Fine', modifier: 2, description: 'Excellent material, carefully selected.' },
  exceptional: { name: 'Exceptional', modifier: 3, description: 'Rare, superior material.' },
  legendary: { name: 'Legendary', modifier: 5, description: 'Mythical material. Stories are told of it.' }
};

export const ITEM_DATABASE = {
  // ═══════════════════════════════════════════════════════════════
  // WEAPONS
  // ═══════════════════════════════════════════════════════════════
  weapons: {
    // Daggers
    hunting_knife: {
      id: 'hunting_knife',
      name: 'Hunting Knife',
      type: 'weapon_dagger',
      description: 'A sturdy knife for hunting and utility work. Can serve as a weapon in a pinch.',
      damage: '1d6',
      damage_type: 'piercing',
      weight: 0.5,
      base_value: { sous: 5 },
      skill_required: 'dagger',
      skill_level_required: 0,
      properties: ['concealable', 'utility'],
      crafting: { skill: 'smithing', level: 2, materials: ['iron_bar', 'wood_handle'] }
    },
    rondel_dagger: {
      id: 'rondel_dagger',
      name: 'Rondel Dagger',
      type: 'weapon_dagger',
      description: 'A stiff-bladed dagger designed to pierce armor gaps. The knight\'s last resort.',
      damage: '1d6+2',
      damage_type: 'piercing',
      weight: 0.7,
      base_value: { sous: 20, livres: 1 },
      skill_required: 'dagger',
      skill_level_required: 2,
      properties: ['armor_piercing', 'concealable'],
      crafting: { skill: 'smithing', level: 4, materials: ['steel_bar', 'iron_guard'] }
    },
    
    // Swords
    arming_sword: {
      id: 'arming_sword',
      name: 'Arming Sword',
      type: 'weapon_sword',
      description: 'The standard knight\'s sword. Versatile, balanced, deadly.',
      damage: '1d8+2',
      damage_type: 'slashing',
      weight: 1.5,
      base_value: { livres: 3 },
      skill_required: 'sword',
      skill_level_required: 2,
      properties: ['versatile', 'parrying'],
      crafting: { skill: 'smithing', level: 5, materials: ['steel_bar', 'leather_grip', 'iron_crossguard'] }
    },
    longsword: {
      id: 'longsword',
      name: 'Longsword',
      type: 'weapon_sword',
      description: 'A two-handed sword of exceptional reach and power. The weapon of serious fighters.',
      damage: '2d6+2',
      damage_type: 'slashing',
      weight: 2.5,
      base_value: { livres: 8 },
      skill_required: 'sword',
      skill_level_required: 4,
      properties: ['two_handed', 'reach', 'versatile'],
      crafting: { skill: 'smithing', level: 6, materials: ['steel_bar', 'steel_bar', 'leather_grip', 'iron_crossguard'] }
    },
    
    // Axes
    woodcutters_axe: {
      id: 'woodcutters_axe',
      name: 'Woodcutter\'s Axe',
      type: 'tool_axe',
      description: 'A working axe for cutting wood. Heavy, powerful, and always available.',
      damage: '1d8',
      damage_type: 'slashing',
      weight: 2.0,
      base_value: { sous: 15 },
      skill_required: 'axe',
      skill_level_required: 0,
      properties: ['tool', 'heavy'],
      crafting: { skill: 'smithing', level: 2, materials: ['iron_bar', 'wood_handle'] }
    },
    battle_axe: {
      id: 'battle_axe',
      name: 'Battle Axe',
      type: 'weapon_axe',
      description: 'A purpose-built weapon. Heavier head, shorter handle, designed to kill.',
      damage: '1d10+2',
      damage_type: 'slashing',
      weight: 2.5,
      base_value: { livres: 2 },
      skill_required: 'axe',
      skill_level_required: 3,
      properties: ['heavy', 'armor_crushing'],
      crafting: { skill: 'smithing', level: 4, materials: ['steel_bar', 'wood_handle', 'iron_binding'] }
    },
    
    // Polearms
    spear: {
      id: 'spear',
      name: 'Spear',
      type: 'weapon_polearm',
      description: 'The oldest weapon. Simple, effective, and deadly in the right hands.',
      damage: '1d8+1',
      damage_type: 'piercing',
      weight: 2.0,
      base_value: { sous: 10 },
      skill_required: 'polearms',
      skill_level_required: 1,
      properties: ['reach', 'throwable', 'anti_cavalry'],
      crafting: { skill: 'carpentry', level: 2, materials: ['wood_shaft', 'iron_spearhead'] }
    },
    halberd: {
      id: 'halberd',
      name: 'Halberd',
      type: 'weapon_polearm',
      description: 'Axe, spear, and hook combined. The Swiss weapon that changed warfare.',
      damage: '2d6+3',
      damage_type: 'slashing',
      weight: 3.5,
      base_value: { livres: 4 },
      skill_required: 'polearms',
      skill_level_required: 3,
      properties: ['reach', 'anti_cavalry', 'versatile', 'two_handed'],
      crafting: { skill: 'smithing', level: 5, materials: ['steel_blade', 'wood_shaft', 'iron_binding'] }
    },
    
    // Bows
    shortbow: {
      id: 'shortbow',
      name: 'Shortbow',
      type: 'weapon_bow',
      description: 'A compact bow for hunting and skirmishing. Fast to use, moderate power.',
      damage: '1d6',
      damage_type: 'piercing',
      weight: 1.0,
      base_value: { sous: 20 },
      skill_required: 'archery',
      skill_level_required: 1,
      properties: ['ranged', 'requires_arrows'],
      crafting: { skill: 'carpentry', level: 2, materials: ['yew_wood', 'bowstring'] }
    },
    longbow: {
      id: 'longbow',
      name: 'Longbow',
      type: 'weapon_bow',
      description: 'The English weapon. Six feet of yew that can pierce armor at 200 yards.',
      damage: '1d10+2',
      damage_type: 'piercing',
      weight: 1.5,
      base_value: { livres: 2 },
      skill_required: 'archery',
      skill_level_required: 3,
      properties: ['ranged', 'requires_arrows', 'armor_piercing', 'long_range'],
      crafting: { skill: 'carpentry', level: 4, materials: ['yew_wood', 'bowstring'] }
    },
    crossbow: {
      id: 'crossbow',
      name: 'Crossbow',
      type: 'weapon_crossbow',
      description: 'A mechanical bow. Powerful, slow to reload, requires less training.',
      damage: '1d12+2',
      damage_type: 'piercing',
      weight: 3.0,
      base_value: { livres: 5 },
      skill_required: 'archery',
      skill_level_required: 2,
      properties: ['ranged', 'requires_bolts', 'armor_piercing', 'slow_reload'],
      crafting: { skill: 'carpentry', level: 4, materials: ['wood_frame', 'steel_prod', 'bowstring', 'trigger_mechanism'] }
    },
    
    // Blunt weapons
    club: {
      id: 'club',
      name: 'Club',
      type: 'weapon_blunt',
      description: 'A heavy stick. The weapon of the desperate and the practical.',
      damage: '1d6',
      damage_type: 'bludgeoning',
      weight: 1.5,
      base_value: { sous: 2 },
      skill_required: 'brawling',
      skill_level_required: 0,
      properties: ['improvised', 'non_lethal_option'],
      crafting: { skill: 'carpentry', level: 1, materials: ['hardwood'] }
    },
    mace: {
      id: 'mace',
      name: 'Mace',
      type: 'weapon_blunt',
      description: 'A flanged metal head on a shaft. Effective against armor.',
      damage: '1d8+2',
      damage_type: 'bludgeoning',
      weight: 2.5,
      base_value: { livres: 2 },
      skill_required: 'brawling',
      skill_level_required: 2,
      properties: ['armor_crushing', 'non_lethal_option'],
      crafting: { skill: 'smithing', level: 4, materials: ['steel_head', 'wood_shaft', 'iron_binding'] }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // ARMOR
  // ═══════════════════════════════════════════════════════════════
  armor: {
    linen_tunic: {
      id: 'linen_tunic',
      name: 'Linen Tunic',
      type: 'armor_torso',
      description: 'Basic clothing. Provides no protection but keeps you decent.',
      armor_value: 0,
      weight: 0.5,
      base_value: { sous: 5 },
      properties: ['clothing'],
      crafting: { skill: 'sewing', level: 1, materials: ['linen_cloth'] }
    },
    padded_gambeson: {
      id: 'padded_gambeson',
      name: 'Padded Gambeson',
      type: 'armor_torso',
      description: 'Quilted cloth armor. Surprisingly effective against cuts and blunt trauma.',
      armor_value: 2,
      weight: 3.0,
      base_value: { sous: 30 },
      properties: ['light_armor', 'comfortable'],
      crafting: { skill: 'sewing', level: 3, materials: ['linen_cloth', 'linen_cloth', 'padding'] }
    },
    leather_armor: {
      id: 'leather_armor',
      name: 'Leather Armor',
      type: 'armor_torso',
      description: 'Hardened leather. Light, flexible, and decent protection.',
      armor_value: 3,
      weight: 4.0,
      base_value: { livres: 2 },
      properties: ['light_armor', 'flexible'],
      crafting: { skill: 'leatherworking', level: 3, materials: ['hardened_leather', 'leather_straps'] }
    },
    mail_hauberk: {
      id: 'mail_hauberk',
      name: 'Mail Hauberk',
      type: 'armor_torso',
      description: 'Interlocked iron rings. Excellent against cuts, poor against blunt trauma.',
      armor_value: 5,
      weight: 10.0,
      base_value: { livres: 15 },
      properties: ['medium_armor', 'anti_slash'],
      crafting: { skill: 'smithing', level: 6, materials: ['iron_rings', 'iron_rings', 'iron_rings'] }
    },
    plate_armor: {
      id: 'plate_armor',
      name: 'Plate Armor',
      type: 'armor_torso',
      description: 'Full plate steel. The pinnacle of medieval protection. Expensive and heavy.',
      armor_value: 8,
      weight: 20.0,
      base_value: { livres: 100 },
      properties: ['heavy_armor', 'full_protection', 'requires_squire'],
      crafting: { skill: 'smithing', level: 9, materials: ['steel_plate', 'steel_plate', 'leather_lining', 'iron_rivets'] }
    },
    
    // Helmets
    leather_cap: {
      id: 'leather_cap',
      name: 'Leather Cap',
      type: 'armor_head',
      description: 'A simple leather cap. Better than nothing.',
      armor_value: 1,
      weight: 0.5,
      base_value: { sous: 10 },
      properties: ['light_armor'],
      crafting: { skill: 'leatherworking', level: 2, materials: ['hardened_leather'] }
    },
    iron_helmet: {
      id: 'iron_helmet',
      name: 'Iron Helmet',
      type: 'armor_head',
      description: 'A simple iron helmet. Protects the skull from sword cuts.',
      armor_value: 3,
      weight: 2.0,
      base_value: { livres: 2 },
      properties: ['medium_armor'],
      crafting: { skill: 'smithing', level: 4, materials: ['iron_bar', 'leather_lining'] }
    },
    great_helm: {
      id: 'great_helm',
      name: 'Great Helm',
      type: 'armor_head',
      description: 'Full face protection. Excellent defense, poor visibility.',
      armor_value: 5,
      weight: 4.0,
      base_value: { livres: 10 },
      properties: ['heavy_armor', 'reduced_visibility'],
      crafting: { skill: 'smithing', level: 6, materials: ['steel_plate', 'leather_lining', 'iron_rivets'] }
    },
    
    // Shields
    wooden_shield: {
      id: 'wooden_shield',
      name: 'Wooden Shield',
      type: 'armor_shield',
      description: 'A simple wooden shield. Cheap, effective, and replaceable.',
      armor_value: 2,
      weight: 3.0,
      base_value: { sous: 15 },
      properties: ['shield', 'breakable'],
      crafting: { skill: 'carpentry', level: 2, materials: ['hardwood', 'leather_strap'] }
    },
    kite_shield: {
      id: 'kite_shield',
      name: 'Kite Shield',
      type: 'armor_shield',
      description: 'The Norman knight\'s shield. Protects from shoulder to knee.',
      armor_value: 4,
      weight: 5.0,
      base_value: { livres: 3 },
      properties: ['shield', 'large_shield'],
      crafting: { skill: 'carpentry', level: 4, materials: ['hardwood', 'iron_rim', 'leather_facing'] }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TOOLS
  // ═══════════════════════════════════════════════════════════════
  tools: {
    hammer: {
      id: 'hammer',
      name: 'Hammer',
      type: 'tool',
      description: 'A basic hammer for carpentry and smithing.',
      weight: 1.0,
      base_value: { sous: 8 },
      skill_bonus: { carpentry: 1, smithing: 1 },
      crafting: { skill: 'smithing', level: 1, materials: ['iron_bar', 'wood_handle'] }
    },
    saw: {
      id: 'saw',
      name: 'Saw',
      type: 'tool',
      description: 'A toothed blade for cutting wood.',
      weight: 0.8,
      base_value: { sous: 12 },
      skill_bonus: { carpentry: 2 },
      crafting: { skill: 'smithing', level: 2, materials: ['iron_bar', 'wood_handle'] }
    },
    smithing_tongs: {
      id: 'smithing_tongs',
      name: 'Smithing Tongs',
      type: 'tool',
      description: 'For holding hot metal at the forge.',
      weight: 0.5,
      base_value: { sous: 10 },
      skill_bonus: { smithing: 2 },
      crafting: { skill: 'smithing', level: 2, materials: ['iron_bar', 'iron_bar'] }
    },
    lockpicks: {
      id: 'lockpicks',
      name: 'Lockpicks',
      type: 'tool',
      description: 'A set of thin metal tools for opening locks.',
      weight: 0.1,
      base_value: { sous: 25 },
      skill_bonus: { lockpicking: 3 },
      properties: ['illegal', 'concealable'],
      crafting: { skill: 'smithing', level: 3, materials: ['iron_wire', 'iron_wire'] }
    },
    fishing_rod: {
      id: 'fishing_rod',
      name: 'Fishing Rod',
      type: 'tool',
      description: 'A simple rod and line for catching fish.',
      weight: 0.5,
      base_value: { sous: 5 },
      skill_bonus: { hunting: 1 },
      crafting: { skill: 'carpentry', level: 1, materials: ['wood_shaft', 'fishing_line', 'hook'] }
    },
    hunting_trap: {
      id: 'hunting_trap',
      name: 'Hunting Trap',
      type: 'tool',
      description: 'An iron trap for catching animals.',
      weight: 1.5,
      base_value: { sous: 20 },
      skill_bonus: { hunting: 2 },
      crafting: { skill: 'smithing', level: 3, materials: ['iron_bar', 'iron_bar', 'iron_spring'] }
    },
    medical_kit: {
      id: 'medical_kit',
      name: 'Medical Kit',
      type: 'tool',
      description: 'Bandages, herbs, and basic surgical tools.',
      weight: 1.0,
      base_value: { sous: 30 },
      skill_bonus: { medicine: 2 },
      uses: 10,
      crafting: { skill: 'medicine', level: 2, materials: ['linen_bandages', 'medicinal_herbs', 'needle', 'thread'] }
    },
    writing_kit: {
      id: 'writing_kit',
      name: 'Writing Kit',
      type: 'tool',
      description: 'Quill, ink, and parchment for writing.',
      weight: 0.5,
      base_value: { sous: 20 },
      skill_bonus: { reading: 1, forgery_skill: 1 },
      uses: 20,
      crafting: null
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // CLOTHING
  // ═══════════════════════════════════════════════════════════════
  clothing: {
    worn_work_boots: {
      id: 'worn_work_boots',
      name: 'Worn Work Boots',
      type: 'clothing_feet',
      description: 'Heavy leather boots, well-worn from years of labor.',
      weight: 1.0,
      base_value: { sous: 8 },
      properties: ['worn'],
      social_modifier: { peasants: 0, nobles: -2 }
    },
    leather_belt: {
      id: 'leather_belt',
      name: 'Leather Belt',
      type: 'clothing_belt',
      description: 'A sturdy leather belt for holding tools and weapons.',
      weight: 0.3,
      base_value: { sous: 5 },
      properties: ['utility'],
      social_modifier: {}
    },
    noble_doublet: {
      id: 'noble_doublet',
      name: 'Noble Doublet',
      type: 'clothing_torso',
      description: 'A fitted jacket of fine wool or silk. Marks the wearer as a person of quality.',
      weight: 0.8,
      base_value: { livres: 5 },
      properties: ['noble_clothing'],
      social_modifier: { nobles: 5, merchants: 3 }
    },
    pilgrim_cloak: {
      id: 'pilgrim_cloak',
      name: 'Pilgrim\'s Cloak',
      type: 'clothing_cloak',
      description: 'A heavy wool cloak with pilgrim badges. Provides warmth and a degree of protection.',
      weight: 1.5,
      base_value: { sous: 20 },
      properties: ['warm', 'disguise_option'],
      social_modifier: { clergy: 3 }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // FOOD & DRINK
  // ═══════════════════════════════════════════════════════════════
  food: {
    bread: {
      id: 'bread',
      name: 'Bread',
      type: 'food',
      description: 'A loaf of bread. The foundation of life.',
      weight: 0.5,
      base_value: { deniers: 4 },
      hunger_restore: 2,
      crafting: { skill: 'cooking', level: 1, materials: ['flour', 'water', 'salt'] }
    },
    dried_meat: {
      id: 'dried_meat',
      name: 'Dried Meat',
      type: 'food',
      description: 'Salted and dried meat. Lasts for weeks.',
      weight: 0.3,
      base_value: { sous: 2 },
      hunger_restore: 3,
      crafting: { skill: 'cooking', level: 2, materials: ['raw_meat', 'salt'] }
    },
    wine_flask: {
      id: 'wine_flask',
      name: 'Wine Flask',
      type: 'drink',
      description: 'A leather flask of wine. Better than water in most places.',
      weight: 0.8,
      base_value: { sous: 3 },
      hunger_restore: 1,
      morale_restore: 1,
      uses: 5,
      crafting: null
    },
    ale_jug: {
      id: 'ale_jug',
      name: 'Ale Jug',
      type: 'drink',
      description: 'A clay jug of ale. The common man\'s drink.',
      weight: 1.0,
      base_value: { deniers: 8 },
      hunger_restore: 1,
      morale_restore: 1,
      uses: 4,
      crafting: { skill: 'cooking', level: 2, materials: ['barley', 'water', 'hops'] }
    },
    field_rations: {
      id: 'field_rations',
      name: 'Field Rations',
      type: 'food',
      description: 'Hard bread, dried meat, and cheese. Enough for a day\'s march.',
      weight: 1.0,
      base_value: { sous: 5 },
      hunger_restore: 5,
      crafting: { skill: 'cooking', level: 1, materials: ['bread', 'dried_meat', 'hard_cheese'] }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // MATERIALS (for crafting)
  // ═══════════════════════════════════════════════════════════════
  materials: {
    iron_bar: {
      id: 'iron_bar',
      name: 'Iron Bar',
      type: 'material_metal',
      description: 'A bar of smelted iron. The foundation of metalwork.',
      weight: 2.0,
      base_value: { sous: 8 },
      crafting: { skill: 'smithing', level: 1, materials: ['iron_ore', 'charcoal'] }
    },
    steel_bar: {
      id: 'steel_bar',
      name: 'Steel Bar',
      type: 'material_metal',
      description: 'Refined steel. Harder and more flexible than iron.',
      weight: 2.0,
      base_value: { sous: 25 },
      crafting: { skill: 'smithing', level: 4, materials: ['iron_bar', 'charcoal', 'charcoal'] }
    },
    hardwood: {
      id: 'hardwood',
      name: 'Hardwood',
      type: 'material_wood',
      description: 'Dense, strong wood for construction and weapons.',
      weight: 3.0,
      base_value: { sous: 5 },
      crafting: null
    },
    linen_cloth: {
      id: 'linen_cloth',
      name: 'Linen Cloth',
      type: 'material_textile',
      description: 'Woven linen fabric. Versatile and common.',
      weight: 0.5,
      base_value: { sous: 6 },
      crafting: null
    },
    hardened_leather: {
      id: 'hardened_leather',
      name: 'Hardened Leather',
      type: 'material_leather',
      description: 'Leather treated to be rigid and protective.',
      weight: 1.0,
      base_value: { sous: 12 },
      crafting: { skill: 'leatherworking', level: 2, materials: ['raw_leather', 'tannin'] }
    },
    medicinal_herbs: {
      id: 'medicinal_herbs',
      name: 'Medicinal Herbs',
      type: 'material_herb',
      description: 'A bundle of healing herbs. Valerian, yarrow, and others.',
      weight: 0.2,
      base_value: { sous: 8 },
      crafting: null
    },
    parchment: {
      id: 'parchment',
      name: 'Parchment',
      type: 'material_writing',
      description: 'Prepared animal skin for writing.',
      weight: 0.1,
      base_value: { sous: 5 },
      crafting: null
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // SPECIAL ITEMS
  // ═══════════════════════════════════════════════════════════════
  special: {
    holy_relic: {
      id: 'holy_relic',
      name: 'Holy Relic',
      type: 'special_religious',
      description: 'A fragment of bone or cloth claimed to be from a saint. Powerful in the right hands.',
      weight: 0.1,
      base_value: { livres: 20 },
      properties: ['religious', 'valuable', 'piety_bonus'],
      effects: { piety: 10, church_reputation: 5 }
    },
    forged_document: {
      id: 'forged_document',
      name: 'Forged Document',
      type: 'special_document',
      description: 'A false document. Could be a letter of introduction, a deed, or a writ.',
      weight: 0.1,
      base_value: { livres: 5 },
      properties: ['illegal', 'concealable'],
      effects: {}
    },
    poison_vial: {
      id: 'poison_vial',
      name: 'Poison Vial',
      type: 'special_poison',
      description: 'A small vial of poison. The coward\'s weapon, or the spy\'s tool.',
      weight: 0.1,
      base_value: { livres: 10 },
      properties: ['illegal', 'concealable', 'dangerous'],
      effects: { poison_damage: '2d6', detection_difficulty: 15 }
    },
    map: {
      id: 'map',
      name: 'Map',
      type: 'special_document',
      description: 'A hand-drawn map of a region. Valuable for navigation.',
      weight: 0.2,
      base_value: { livres: 3 },
      properties: ['navigation_aid'],
      effects: { navigation_bonus: 10 }
    },
    signet_ring: {
      id: 'signet_ring',
      name: 'Signet Ring',
      type: 'special_jewelry',
      description: 'A ring with a seal. Used to authenticate documents.',
      weight: 0.05,
      base_value: { livres: 15 },
      properties: ['authentication', 'status_symbol'],
      effects: { document_authority: true }
    }
  }
};

// Crafting recipes (what can be made from what)
export const CRAFTING_RECIPES = {
  // Smithing recipes
  iron_bar: {
    skill: 'smithing',
    level: 1,
    time_turns: 2,
    materials: [
      { item: 'iron_ore', quantity: 2 },
      { item: 'charcoal', quantity: 1 }
    ],
    output: { item: 'iron_bar', quantity: 1 }
  },
  steel_bar: {
    skill: 'smithing',
    level: 4,
    time_turns: 4,
    materials: [
      { item: 'iron_bar', quantity: 2 },
      { item: 'charcoal', quantity: 2 }
    ],
    output: { item: 'steel_bar', quantity: 1 }
  },
  hunting_knife: {
    skill: 'smithing',
    level: 2,
    time_turns: 3,
    materials: [
      { item: 'iron_bar', quantity: 1 },
      { item: 'hardwood', quantity: 0.5 }
    ],
    output: { item: 'hunting_knife', quantity: 1 }
  },
  arming_sword: {
    skill: 'smithing',
    level: 5,
    time_turns: 10,
    materials: [
      { item: 'steel_bar', quantity: 2 },
      { item: 'hardwood', quantity: 0.5 },
      { item: 'hardened_leather', quantity: 0.5 }
    ],
    output: { item: 'arming_sword', quantity: 1 }
  }
};

// Item condition degradation rates
export const DEGRADATION_RATES = {
  weapon: { per_combat: 0.05, per_turn: 0.001 },
  armor: { per_combat: 0.08, per_turn: 0.001 },
  tool: { per_use: 0.02, per_turn: 0.001 },
  clothing: { per_turn: 0.002 },
  food: { per_turn: 0.1 } // Food spoils quickly
};

export default ITEM_DATABASE;
// END FILE: client/js/data/item-database.js
