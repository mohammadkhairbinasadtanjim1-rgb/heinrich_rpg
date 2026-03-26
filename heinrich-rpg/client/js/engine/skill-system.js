// FILE: client/js/engine/skill-system.js — PART 4

'use strict';

/**
 * SKILL SYSTEM — Skill checks, XP application, branch unlocking,
 * passive milestones, skill caps, situational modifier generation.
 */

const SkillSystem = (() => {

  // ─── SKILL CATEGORY DEFINITIONS ──────────────────────────────────────────
  const SKILL_CATEGORIES = {
    combat: ['brawling', 'sword', 'dagger', 'axe', 'archery', 'polearms', 'shield', 'unarmed'],
    physical: ['strength', 'agility', 'endurance', 'swimming', 'climbing'],
    social: ['speech', 'deception', 'intimidation', 'haggle', 'etiquette', 'command', 'seduction', 'read_people', 'performance'],
    crafts: ['smithing', 'carpentry', 'agriculture', 'hunting', 'medicine', 'cooking', 'engineering'],
    knowledge: ['reading', 'law', 'heraldry', 'theology', 'history', 'tactics', 'stewardship'],
    criminal: ['stealth', 'lockpicking', 'pickpocket', 'forgery_skill', 'espionage'],
    travel: ['horsemanship', 'navigation', 'seamanship', 'survival']
  };

  // ─── PASSIVE MILESTONES (unlocked at levels 3, 6, 10) ────────────────────
  const PASSIVES = {
    brawling: {
      3: { id: 'iron_fists', name: 'Iron Fists', effect: 'Unarmed damage +20%' },
      6: { id: 'brawling_read', name: 'Street Fighter', effect: 'Read opponent next action in brawl — free bonus +5 to dodge/counter' },
      10: { id: 'brawling_master', name: 'Brawling Master', effect: 'Cannot be surprised in close quarters; disaster → near_miss in brawling' }
    },
    sword: {
      3: { id: 'sword_parry', name: 'Trained Parry', effect: 'Parry without action cost once per combat' },
      6: { id: 'sword_flourish', name: 'Flourish', effect: 'Critical successes create opening for follow-up attack' },
      10: { id: 'sword_legend', name: 'Blade Legend', effect: '+20 to all sword rolls; named sword gains unique property' }
    },
    strength: {
      3: { id: 'str_carry', name: 'Beast of Burden', effect: 'Carry capacity +30%' },
      6: { id: 'str_break', name: 'Irresistible Force', effect: 'Smash through light cover and doors without tool' },
      10: { id: 'str_legend', name: 'Legendary Strength', effect: 'All physical strength checks auto-succeed at medium or lower; NPCs visibly intimidated by physique alone' }
    },
    endurance: {
      3: { id: 'end_fatigue', name: 'Iron Lungs', effect: 'Fatigue depletes 20% slower' },
      6: { id: 'end_pain', name: 'Pain Resistance', effect: 'Wound penalties halved' },
      10: { id: 'end_legend', name: 'Indomitable', effect: 'Cannot be taken below 1 HP by a single blow; exhaustion collapse threshold doubled' }
    },
    speech: {
      3: { id: 'speech_crowd', name: 'Crowd Reader', effect: '+10 to speech rolls in public or group settings' },
      6: { id: 'speech_persuade', name: 'Compelling Orator', effect: 'Successful speech checks can shift NPC opinion by 2× normal amount' },
      10: { id: 'speech_legend', name: 'Voice of Ages', effect: 'NPCs who hear Heinrich speak are compelled to listen; crowd sizes double their response' }
    },
    deception: {
      3: { id: 'dec_poker', name: 'Poker Face', effect: 'Lies cannot be detected by read_people skill below level 4' },
      6: { id: 'dec_story', name: 'Consistent Liar', effect: 'Remembers all lies told — automatic consistency; no penalty for complex deceptions' },
      10: { id: 'dec_legend', name: 'Master of Masks', effect: 'Any NPC with relationship <50 cannot detect deception regardless of roll' }
    },
    agriculture: {
      3: { id: 'agr_yield', name: 'Green Thumb', effect: 'Personal plot yields 20% more' },
      6: { id: 'agr_weather', name: 'Weather Sense', effect: '70% accurate weather prediction for farming purposes; know when to plant/harvest' },
      10: { id: 'agr_legend', name: 'Lord of the Land', effect: 'All agricultural projects succeed at minimum "adequate" quality; innovations spread 2× faster' }
    },
    stealth: {
      3: { id: 'sth_shadow', name: 'Shadow Meld', effect: 'In darkness or heavy cover, stealth checks upgraded one tier' },
      6: { id: 'sth_vanish', name: 'Vanish', effect: 'Once per scene, can disappear even if being watched (requires concealment attempt)' },
      10: { id: 'sth_ghost', name: 'The Ghost', effect: 'Cannot be tracked by normal means; always knows when being followed' }
    },
    smithing: {
      3: { id: 'smith_quality', name: 'True Smith', effect: 'Crafted weapons and armor get +1 quality tier' },
      6: { id: 'smith_master', name: 'Master Smith', effect: 'Can craft masterwork items; can identify any metal composition' },
      10: { id: 'smith_legend', name: 'Legendary Artisan', effect: 'Named items created have unique properties; work attracts noble patronage' }
    },
    carpentry: {
      3: { id: 'carp_estimate', name: 'Master Estimator', effect: 'Always know material quantities needed; no waste' },
      6: { id: 'carp_innovations', name: 'Builder', effect: 'Can design and build structures without architectural drawings' },
      10: { id: 'carp_legend', name: 'Grand Builder', effect: 'Any structure built by Heinrich is structurally optimal; design innovations possible' }
    },
    medicine: {
      3: { id: 'med_herbs', name: 'Herbalist', effect: 'Identify and use medicinal plants; +20% to wound treatment' },
      6: { id: 'med_surgery', name: 'Field Surgeon', effect: 'Can perform amputations and major wound treatment in the field; disease diagnosis accurate' },
      10: { id: 'med_legend', name: 'Physician', effect: 'All medical interventions upgraded one tier; can prevent disease spread if granted authority' }
    },
    hunting: {
      3: { id: 'hunt_track', name: 'Tracker', effect: 'Can track any creature or person through wilderness; estimate time since passing' },
      6: { id: 'hunt_stalker', name: 'Predator', effect: 'Always surprise prey; animals do not detect approach' },
      10: { id: 'hunt_legend', name: 'Master of the Wild', effect: 'The forest reveals itself — always find food and shelter; no environmental penalty in wilderness' }
    },
    read_people: {
      3: { id: 'rp_tell', name: 'Lie Detector', effect: 'Automatically sense when NPC is lying about major facts' },
      6: { id: 'rp_predict', name: 'Behavioral Mapper', effect: 'After 1 conversation, predict NPC actions with 80% accuracy' },
      10: { id: 'rp_legend', name: 'Puppetmaster', effect: 'Can construct exact social manipulation strategy for any NPC; see 2 moves ahead in social games' }
    },
    intimidation: {
      3: { id: 'int_reputation', name: 'Fearsome', effect: 'NPCs below equivalent level back down from confrontation' },
      6: { id: 'int_break', name: 'Breaking Point', effect: 'Interrogation always extracts ONE true piece of information on success' },
      10: { id: 'int_legend', name: 'Terror Made Flesh', effect: 'Enter room — all hostile intent in NPCs below level immediately suppressed; armies check morale' }
    },
    horsemanship: {
      3: { id: 'hors_bond', name: 'Horseman', effect: 'Horse bond progresses 50% faster; trained horses obey complex commands' },
      6: { id: 'hors_war', name: 'War Rider', effect: 'Can fight at full effectiveness while mounted; horse is combat partner, not hinderance' },
      10: { id: 'hors_legend', name: 'Born to the Saddle', effect: 'Cannot be unhorsed; horses you breed or train are significantly superior' }
    },
    survival: {
      3: { id: 'surv_find', name: 'Survivalist', effect: 'Always find sufficient food and water in the wild; can find shelter in any terrain' },
      6: { id: 'surv_orient', name: 'Never Lost', effect: 'Cannot get lost; always know cardinal directions and rough position' },
      10: { id: 'surv_legend', name: 'One with the Land', effect: 'Wild animals do not attack unprovoked; environmental hazards have no effect' }
    },
    tactics: {
      3: { id: 'tac_terrain', name: 'Eye for Ground', effect: '+15 to combat checks when you chose the battlefield' },
      6: { id: 'tac_command', name: 'Tactical Mind', effect: 'Can issue commands that give allies +10 on their next roll' },
      10: { id: 'tac_legend', name: 'Brilliant Commander', effect: 'Outnumbered 2:1 has no penalty; always find the enemy weakness in their formation' }
    },
    theology: {
      3: { id: 'theo_preach', name: 'Lay Preacher', effect: 'Can hold sermons that shift NPC piety; +10 to negotiate with clergy' },
      6: { id: 'theo_canon', name: 'Canon Law Expert', effect: 'Can argue any church law matter; identify heresy traps before they close' },
      10: { id: 'theo_legend', name: 'Voice of God', effect: 'Any speech backed by theological argument is treated as potentially divinely inspired; bishops listen' }
    },
    haggle: {
      3: { id: 'hag_value', name: 'True Value', effect: 'Always know actual market value of any item' },
      6: { id: 'hag_pressure', name: 'Closer', effect: 'Once per transaction, force NPC to accept deal or reveal hidden agenda' },
      10: { id: 'hag_legend', name: 'Market Maker', effect: 'Regional prices shift toward Heinrich\'s interests; your mere presence at a fair adjusts pricing' }
    }
  };

  // ─── BRANCH UNLOCK CONDITIONS ─────────────────────────────────────────────
  const BRANCH_REQUIREMENTS = {
    // format: { skill_level: n } — need this level in parent to unlock branch
    'brawling.grappling': { skill_level: 2 },
    'brawling.dirty_fighting': { skill_level: 3 },
    'brawling.pit_fighting': { skill_level: 4 },
    'sword.longsword': { skill_level: 2 },
    'sword.dual_wield': { skill_level: 4 },
    'sword.mounted_swordplay': { skill_level: 5, horsemanship: 4 },
    'dagger.assassination': { skill_level: 3, stealth: 3 },
    'dagger.dagger_parry': { skill_level: 2 },
    'axe.shield_breaker': { skill_level: 3 },
    'axe.throwing_axe': { skill_level: 2 },
    'archery.shortbow': { skill_level: 1 },
    'archery.longbow': { skill_level: 3 },
    'archery.crossbow': { skill_level: 2 },
    'archery.sling': { skill_level: 1 },
    'polearms.spear': { skill_level: 1 },
    'polearms.halberd': { skill_level: 3 },
    'polearms.staff': { skill_level: 2 },
    'shield.shield_wall': { skill_level: 3, command: 2 },
    'shield.shield_bash': { skill_level: 2 },
    'unarmed.wrestling': { skill_level: 2 },
    'unarmed.disarm': { skill_level: 3 },
    'strength.mighty_blow': { skill_level: 4 },
    'strength.beast_of_burden': { skill_level: 3 },
    'agility.acrobatics': { skill_level: 3 },
    'agility.dodge_mastery': { skill_level: 4 },
    'agility.quick_draw': { skill_level: 3 },
    'endurance.iron_constitution': { skill_level: 4 },
    'endurance.pain_tolerance': { skill_level: 3 },
    'endurance.marathon': { skill_level: 5 },
    'swimming.underwater_combat': { skill_level: 5, unarmed: 3 },
    'climbing.urban_scaling': { skill_level: 3, agility: 3 },
    'speech.oratory': { skill_level: 3 },
    'speech.negotiation': { skill_level: 4 },
    'speech.inspire': { skill_level: 5, command: 2 },
    'deception.disguise': { skill_level: 3 },
    'deception.forgery': { skill_level: 4, reading: 2 },
    'deception.double_life': { skill_level: 6 },
    'intimidation.interrogation': { skill_level: 4 },
    'intimidation.warlord_presence': { skill_level: 6, command: 4 },
    'intimidation.silent_threat': { skill_level: 5 },
    'haggle.black_market': { skill_level: 3, deception: 2 },
    'haggle.monopoly': { skill_level: 6, stewardship: 4 },
    'haggle.price_manipulation': { skill_level: 5 },
    'etiquette.court_manners': { skill_level: 3 },
    'etiquette.royal_protocol': { skill_level: 5 },
    'etiquette.cultural_fluency': { skill_level: 6, languages_any: 2 },
    'command.squad_leader': { skill_level: 2 },
    'command.captain': { skill_level: 4 },
    'command.war_commander': { skill_level: 7 },
    'command.siege_craft': { skill_level: 5, engineering: 3 },
    'seduction.courtly_love': { skill_level: 3, etiquette: 2 },
    'seduction.temptation': { skill_level: 4 },
    'seduction.political_marriage': { skill_level: 6, law: 3 },
    'read_people.detect_lies': { skill_level: 3 },
    'read_people.predict_behavior': { skill_level: 5 },
    'read_people.puppet_master': { skill_level: 8 },
    'performance.tavern_singer': { skill_level: 1 },
    'performance.troubadour': { skill_level: 4 },
    'performance.court_musician': { skill_level: 6, etiquette: 3 },
    'performance.legendary_performer': { skill_level: 9 },
    'performance.composer': { skill_level: 7 },
    'stewardship.estate_management': { skill_level: 3 },
    'stewardship.tax_collection': { skill_level: 4 },
    'stewardship.city_administration': { skill_level: 6 },
    'stewardship.kingdom_finance': { skill_level: 8 },
    'smithing.weaponsmith': { skill_level: 3 },
    'smithing.armorsmith': { skill_level: 4 },
    'smithing.masterwork_crafting': { skill_level: 7 },
    'smithing.siege_engineering': { skill_level: 6, engineering: 4 },
    'carpentry.shipbuilding': { skill_level: 5, seamanship: 2 },
    'carpentry.fortification': { skill_level: 5, engineering: 3 },
    'carpentry.architecture': { skill_level: 7 },
    'agriculture.animal_husbandry': { skill_level: 3 },
    'agriculture.viticulture': { skill_level: 4 },
    'agriculture.estate_farming': { skill_level: 5, stewardship: 3 },
    'agriculture.famine_preparation': { skill_level: 6 },
    'hunting.tracking': { skill_level: 2 },
    'hunting.trapping': { skill_level: 3 },
    'hunting.falconry': { skill_level: 4 },
    'hunting.big_game': { skill_level: 5 },
    'medicine.herbalism': { skill_level: 2 },
    'medicine.surgery': { skill_level: 5 },
    'medicine.plague_doctor': { skill_level: 6 },
    'medicine.poison_craft': { skill_level: 4, deception: 3 },
    'cooking.field_cooking': { skill_level: 2 },
    'cooking.feast_preparation': { skill_level: 4 },
    'cooking.poison_detection': { skill_level: 4, medicine: 2 },
    'engineering.siege_weapons': { skill_level: 4 },
    'engineering.fortification_design': { skill_level: 5 },
    'engineering.infrastructure': { skill_level: 5 },
    'reading.latin': { skill_level: 3 },
    'reading.classical_education': { skill_level: 5 },
    'reading.cartography': { skill_level: 4 },
    'reading.codebreaking': { skill_level: 6 },
    'law.local_custom': { skill_level: 2 },
    'law.canon_law': { skill_level: 3, theology: 2 },
    'law.royal_law': { skill_level: 4, reading: 3 },
    'law.trial_advocacy': { skill_level: 5 },
    'law.legislative_power': { skill_level: 8 },
    'heraldry.noble_identification': { skill_level: 2 },
    'heraldry.lineage_tracking': { skill_level: 4 },
    'heraldry.fabricate_claims': { skill_level: 6, deception: 5 },
    'theology.preaching': { skill_level: 3 },
    'theology.inquisition_knowledge': { skill_level: 4 },
    'theology.papal_politics': { skill_level: 6 },
    'theology.excommunication_defense': { skill_level: 5 },
    'history.military_history': { skill_level: 3 },
    'history.dynastic_knowledge': { skill_level: 4 },
    'history.legendary_precedent': { skill_level: 6 },
    'tactics.ambush_planning': { skill_level: 3, stealth: 2 },
    'tactics.formation_command': { skill_level: 5, command: 3 },
    'tactics.siege_strategy': { skill_level: 6, engineering: 3 },
    'tactics.grand_strategy': { skill_level: 8 },
    'stealth.urban_stealth': { skill_level: 3 },
    'stealth.wilderness_camouflage': { skill_level: 3 },
    'stealth.infiltration': { skill_level: 5 },
    'stealth.ghost': { skill_level: 8 },
    'lockpicking.safe_cracking': { skill_level: 5 },
    'lockpicking.trap_disarm': { skill_level: 4 },
    'pickpocket.plant_evidence': { skill_level: 4, deception: 3 },
    'pickpocket.cutpurse_master': { skill_level: 6 },
    'forgery_skill.document_forgery': { skill_level: 3, reading: 3 },
    'forgery_skill.seal_forgery': { skill_level: 5 },
    'forgery_skill.identity_fabrication': { skill_level: 7, deception: 5 },
    'espionage.intelligence_network': { skill_level: 4 },
    'espionage.counter_intelligence': { skill_level: 5 },
    'espionage.shadow_war': { skill_level: 7 },
    'horsemanship.mounted_combat': { skill_level: 4, sword: 3 },
    'horsemanship.horse_archery': { skill_level: 5, archery: 4 },
    'horsemanship.cavalry_charge': { skill_level: 6 },
    'horsemanship.horse_breeding': { skill_level: 5 },
    'navigation.sea_navigation': { skill_level: 3, seamanship: 2 },
    'navigation.star_reading': { skill_level: 4 },
    'navigation.pathfinding': { skill_level: 3 },
    'seamanship.ship_combat': { skill_level: 4, sword: 3 },
    'seamanship.fleet_command': { skill_level: 7, command: 5 },
    'seamanship.piracy': { skill_level: 5, deception: 3 },
    'survival.desert_survival': { skill_level: 4 },
    'survival.mountain_survival': { skill_level: 4 },
    'survival.urban_survival': { skill_level: 3 },
    'survival.war_zone_survival': { skill_level: 5 }
  };

  // ─── SITUATIONAL MODIFIER GENERATORS ─────────────────────────────────────

  /**
   * Generate situational modifiers for a given action context.
   * Each modifier: { label: string, value: number }
   */
  function getSituationalMods(skillName, context = {}, state = null) {
    const mods = [];

    // Weather modifiers
    if (context.weather) {
      const weatherMods = _getWeatherMods(skillName, context.weather);
      mods.push(...weatherMods);
    }

    // Health modifiers
    if (state) {
      const healthMods = _getHealthMods(skillName, state.heinrich);
      mods.push(...healthMods);
    }

    // Equipment modifiers
    if (state && context.includeEquipment) {
      const equipMods = _getEquipmentMods(skillName, state.inventory.equipped);
      mods.push(...equipMods);
    }

    // Environmental modifiers
    if (context.environment) {
      const envMods = _getEnvironmentMods(skillName, context.environment);
      mods.push(...envMods);
    }

    // Relationship modifier (for social skills)
    if (context.npc_favorability !== undefined && _isSocialSkill(skillName)) {
      const relmod = Math.round(context.npc_favorability * 0.1); // -10 to +10 from favorability
      if (relmod !== 0) mods.push({ label: 'Relationship', value: relmod });
    }

    // Attractiveness bonus for social skills
    if (state?.heinrich?.attractiveness_bonus && _isSocialSkill(skillName)) {
      mods.push({ label: 'Attractive', value: 5 });
    }

    // Wound penalties
    if (state) {
      const woundMod = _getWoundMods(skillName, state.heinrich.wounds);
      if (woundMod !== 0) mods.push({ label: 'Wounds', value: woundMod });
    }

    // Class/reputation modifiers
    if (state && context.npc_class_attitude) {
      const classMod = _getClassMod(state.heinrich.class, context.npc_class_attitude);
      if (classMod !== 0) mods.push({ label: 'Social Class', value: classMod });
    }

    // Corruption modifier (for moral choices)
    if (state && context.is_moral_choice && state.heinrich.corruption > 50) {
      mods.push({ label: 'Moral Compromise', value: -5 });
    }

    // Apply any explicit context modifiers passed in
    if (context.explicit_mods) {
      mods.push(...context.explicit_mods);
    }

    return mods;
  }

  function _getWeatherMods(skill, weather) {
    const mods = [];
    const weatherType = weather.type;
    if (['archery', 'navigation', 'hunting'].includes(skill)) {
      if (weatherType === 'heavy_rain') mods.push({ label: 'Heavy Rain', value: -20 });
      else if (weatherType === 'thunderstorm') mods.push({ label: 'Thunderstorm', value: -25 });
      else if (weatherType === 'fog') mods.push({ label: 'Fog', value: -20 });
      else if (weatherType === 'windy') mods.push({ label: 'High Wind', value: -15 });
    }
    if (skill === 'stealth' && weatherType === 'fog') mods.push({ label: 'Fog Cover', value: 15 });
    if (skill === 'stealth' && weatherType === 'heavy_rain') mods.push({ label: 'Rain Cover', value: 10 });
    if (['agriculture', 'carpentry', 'smithing'].includes(skill) && weatherType === 'thunderstorm') {
      mods.push({ label: 'Storm Work', value: -10 });
    }
    return mods;
  }

  function _getHealthMods(skill, heinrich) {
    const mods = [];
    const { fatigue_value, hunger_value, mental_value, disease } = heinrich.health;

    // Fatigue penalties
    if (fatigue_value < 20) mods.push({ label: 'Exhausted', value: -25 });
    else if (fatigue_value < 40) mods.push({ label: 'Very Tired', value: -15 });
    else if (fatigue_value < 60) mods.push({ label: 'Tired', value: -8 });

    // Hunger penalties (physical skills mainly)
    if (hunger_value < 20 && DiceEngine.PHYSICAL_CRAFT_SURVIVAL_SKILLS?.has(skill)) {
      mods.push({ label: 'Starving', value: -20 });
    } else if (hunger_value < 40 && DiceEngine.PHYSICAL_CRAFT_SURVIVAL_SKILLS?.has(skill)) {
      mods.push({ label: 'Hungry', value: -10 });
    }

    // Mental state penalties
    if (mental_value < 30) mods.push({ label: 'Mental Crisis', value: -20 });
    else if (mental_value < 60) mods.push({ label: 'Disturbed', value: -8 });

    // Disease penalties
    if (disease) mods.push({ label: 'Diseased', value: -15 });

    return mods;
  }

  function _getEquipmentMods(skill, equipped) {
    const mods = [];
    // Missing weapon penalties
    if (['sword', 'axe', 'dagger'].includes(skill) && !equipped.weapon_primary) {
      mods.push({ label: 'No Weapon', value: -10 });
    }
    if (skill === 'shield' && !equipped.shield) {
      mods.push({ label: 'No Shield', value: -20 });
    }
    // Good armor in combat (not skill-specific, but confidence)
    return mods;
  }

  function _getEnvironmentMods(skill, environment) {
    const mods = [];
    if (skill === 'stealth' && environment === 'crowded') mods.push({ label: 'Crowd Cover', value: 10 });
    if (skill === 'stealth' && environment === 'well_lit') mods.push({ label: 'Bright Light', value: -15 });
    if (skill === 'speech' && environment === 'hostile_crowd') mods.push({ label: 'Hostile Crowd', value: -15 });
    if (skill === 'speech' && environment === 'sympathetic_crowd') mods.push({ label: 'Friendly Crowd', value: 10 });
    if (skill === 'survival' && environment === 'familiar_region') mods.push({ label: 'Home Territory', value: 15 });
    if (skill === 'survival' && environment === 'foreign') mods.push({ label: 'Unfamiliar Land', value: -10 });
    return mods;
  }

  function _getWoundMods(skill, wounds) {
    let penalty = 0;
    // Right arm wounds affect weapon skills
    if (['sword', 'axe', 'dagger', 'archery', 'brawling', 'unarmed', 'smithing', 'carpentry'].includes(skill)) {
      const rightArmWounds = wounds.right_arm.filter(w => w.severity === 'severe' || w.severity === 'moderate');
      penalty -= rightArmWounds.length * 10;
    }
    // Leg wounds affect physical movement
    if (['agility', 'swimming', 'climbing', 'survival', 'stealth', 'horsemanship'].includes(skill)) {
      const legWounds = [...wounds.left_leg, ...wounds.right_leg].filter(w => w.severity === 'severe');
      penalty -= legWounds.length * 12;
    }
    // Head wounds affect mental skills
    if (['speech', 'deception', 'read_people', 'tactics', 'law'].includes(skill)) {
      const headWounds = wounds.head.filter(w => w.severity === 'severe');
      penalty -= headWounds.length * 15;
    }
    return penalty;
  }

  function _getClassMod(heinrichClass, attitude) {
    // How does the NPC's attitude toward Heinrich's class affect negotiation?
    const classHierarchy = { serf: 1, freeman: 2, burgher: 3, knight: 5, noble: 7, lord: 8 };
    const heinrichTier = classHierarchy[heinrichClass] || 1;
    if (attitude === 'looks_down' && heinrichTier < 4) return -10;
    if (attitude === 'peer') return 5;
    if (attitude === 'respects_up') return 10;
    return 0;
  }

  function _isSocialSkill(skill) {
    return ['speech', 'deception', 'intimidation', 'haggle', 'seduction', 'etiquette', 'read_people', 'performance', 'command'].includes(skill);
  }

  // ─── BRANCH UNLOCK CHECKING ───────────────────────────────────────────────

  /**
   * Check which branches are newly available and unlock them.
   * Returns array of newly unlocked branch keys.
   */
  function checkBranchUnlocks(skills) {
    const newlyUnlocked = [];
    for (const [branchPath, requirements] of Object.entries(BRANCH_REQUIREMENTS)) {
      const [parentSkill, branchName] = branchPath.split('.');
      if (!skills[parentSkill]) continue;
      const branch = skills[parentSkill].branches?.[branchName];
      if (!branch || branch.unlocked) continue;

      // Check all requirements
      let meetsAll = true;
      for (const [reqSkill, reqLevel] of Object.entries(requirements)) {
        if (reqSkill === 'languages_any') {
          // Special: any language at >= reqLevel
          const langs = skills.languages;
          const hasLang = Object.values(langs).some(l => (l.level || 0) >= reqLevel);
          if (!hasLang) { meetsAll = false; break; }
        } else if (reqSkill === 'skill_level') {
          if ((skills[parentSkill]?.level || 0) < reqLevel) { meetsAll = false; break; }
        } else {
          if ((skills[reqSkill]?.level || 0) < reqLevel) { meetsAll = false; break; }
        }
      }

      if (meetsAll) {
        branch.unlocked = true;
        newlyUnlocked.push(branchPath);
      }
    }
    return newlyUnlocked;
  }

  // ─── PASSIVE RETRIEVAL ────────────────────────────────────────────────────

  /**
   * Get all active passives for Heinrich based on current skill levels.
   * Returns flat array of active passive objects.
   */
  function getActivePassives(skills) {
    const active = [];
    for (const [skillName, levelMap] of Object.entries(PASSIVES)) {
      const skillLevel = skills[skillName]?.level || 0;
      for (const [level, passive] of Object.entries(levelMap)) {
        if (skillLevel >= parseInt(level)) {
          active.push({ skill: skillName, ...passive });
        }
      }
    }
    return active;
  }

  /**
   * Check if a specific passive is active.
   */
  function hasPassive(skills, passiveId) {
    return getActivePassives(skills).some(p => p.id === passiveId);
  }

  // ─── SKILL ADVANCEMENT SUMMARY ────────────────────────────────────────────

  /**
   * Get readable progress for a skill (for UI display).
   */
  function getSkillProgress(skillObj) {
    if (!skillObj) return null;
    const level = skillObj.level || 0;
    const xp = skillObj.xp || 0;

    if (level >= 10) {
      return { level, xp, progress: 1.0, xpToNext: 0, atCap: true };
    }

    const thresholds = [0, 30, 90, 190, 340, 540, 800, 870, 940, 1010, 1080];
    const currentThreshold = thresholds[level] || 0;
    const nextThreshold = thresholds[level + 1] || 1080;
    const xpIntoLevel = xp - currentThreshold;
    const xpNeeded = nextThreshold - currentThreshold;
    const progress = Math.max(0, Math.min(1, xpIntoLevel / xpNeeded));

    return {
      level,
      xp,
      progress,
      xpToNext: xpNeeded - xpIntoLevel,
      nextPassive: PASSIVES[Object.keys(PASSIVES)[0]] ? _getNextPassiveMilestone(skillObj, level) : null
    };
  }

  function _getNextPassiveMilestone(skill, currentLevel) {
    const milestones = [3, 6, 10];
    return milestones.find(m => m > currentLevel) || null;
  }

  // ─── SKILL CHECK NARRATIVE HELPER ────────────────────────────────────────

  /**
   * Build the SKILL_CHECK_TO_NARRATE block for the LLM prompt.
   */
  function buildSkillCheckNarrative(rollResult, context = {}) {
    return {
      skill_name: rollResult.skillName,
      skill_level: rollResult.skillLevel,
      difficulty: rollResult.difficulty,
      target_breakdown: {
        base: rollResult.difficultyBase,
        skill_bonus: `+${rollResult.skillBonus} (Lv${rollResult.skillLevel}×2)`,
        situational: rollResult.situationalMods.map(m => `${m.label}: ${m.value >= 0 ? '+' : ''}${m.value}`),
        final_target: rollResult.finalTarget
      },
      roll: rollResult.roll,
      tier: rollResult.tier,
      tier_emoji: rollResult.tierData.emoji,
      xp_gained: rollResult.xpAwarded,
      context: context.description || ''
    };
  }

  // ─── EXPORTS ──────────────────────────────────────────────────────────────

  return {
    SKILL_CATEGORIES,
    PASSIVES,
    BRANCH_REQUIREMENTS,
    getSituationalMods,
    checkBranchUnlocks,
    getActivePassives,
    hasPassive,
    getSkillProgress,
    buildSkillCheckNarrative
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SkillSystem };
}

// END FILE: client/js/engine/skill-system.js
