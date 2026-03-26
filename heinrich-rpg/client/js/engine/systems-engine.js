// FILE: client/js/engine/systems-engine.js — PART 8
// Covers: crime, espionage, identity, rebellion, vice, oaths, council, 
//         prison, legacy, cultural, information, religion, dreams

'use strict';

/**
 * SYSTEMS ENGINE — Unified module for all social/systemic game engines 
 * that don't require dedicated files. Each sub-system is a clearly labeled section.
 */

const SystemsEngine = (() => {

  // ════════════════════════════════════════════════════════
  //  CRIME SYSTEM
  // ════════════════════════════════════════════════════════

  const CRIME_TYPES = {
    theft_minor:    { heat: 10, fine_sous: 5,  imprisonment_risk: 0.1, penalty_death: false },
    theft_major:    { heat: 25, fine_sous: 30, imprisonment_risk: 0.3, penalty_death: false },
    assault:        { heat: 20, fine_sous: 20, imprisonment_risk: 0.2, penalty_death: false },
    murder_commoner:{ heat: 45, fine_sous: 100, imprisonment_risk: 0.5, penalty_death: true },
    murder_noble:   { heat: 80, fine_sous: 0,   imprisonment_risk: 0.9, penalty_death: true, royal_pursuit: true },
    heresy:         { heat: 60, fine_sous: 0,   imprisonment_risk: 0.8, penalty_death: true, church_trial: true },
    treason:        { heat: 100, fine_sous: 0,  imprisonment_risk: 1.0, penalty_death: true, royal_pursuit: true },
    forgery:        { heat: 15, fine_sous: 15,  imprisonment_risk: 0.15 },
    smuggling:      { heat: 12, fine_sous: 20,  imprisonment_risk: 0.1 },
    poaching:       { heat: 8,  fine_sous: 3,   imprisonment_risk: 0.05, penalty_flogging: true }
  };

  function commitCrime(crimeType, state, witnessed = false) {
    const crime = CRIME_TYPES[crimeType];
    if (!crime) return null;

    const events = [];
    state.heinrich.criminal_record.push({ type: crimeType, turn: state.meta.turn, witnessed });

    if (witnessed) {
      ReputationEngine.increaseHeat(state, crime.heat);
      ReputationEngine.changeReputation(state, ['church_normandy', 'normandy_peasants'], {
        honor: -12, overall: -10
      }, `Committed ${crimeType}`);
      events.push({ type: 'crime_witnessed', crime_type: crimeType, heat_added: crime.heat });
    } else {
      ReputationEngine.increaseHeat(state, Math.round(crime.heat * 0.3));
    }

    // Schedule consequence
    if (witnessed && crime.heat > 20) {
      ConsequenceEngine.scheduleConsequence('killed_someone', {
        name: `Consequences of ${crimeType}`,
        effects: { crime_type: crimeType }
      }, state);
    }

    return { crime, events };
  }

  /**
   * Calculate risk of being caught for a current action.
   */
  function calculateDetectionRisk(action, state) {
    const stealthLevel = state.skills.stealth?.level || 0;
    const heatLevel = state.heinrich.heat || 0;

    let baseRisk = 0.2;
    if (action === 'theft') baseRisk = 0.25;
    if (action === 'murder') baseRisk = 0.4;
    if (action === 'espionage') baseRisk = 0.3;

    const stealthReduction = stealthLevel * 0.04;
    const heatIncrease = heatLevel * 0.003;

    return Math.max(0.05, Math.min(0.95, baseRisk - stealthReduction + heatIncrease));
  }

  // ════════════════════════════════════════════════════════
  //  ESPIONAGE SYSTEM
  // ════════════════════════════════════════════════════════

  /**
   * Gather intelligence on a target.
   */
  function gatherIntelligence(target, method, state) {
    const espionageLevel = state.skills.espionage?.level || 0;
    const deceptionLevel = state.skills.deception?.level || 0;

    const skillForMethod = method === 'social_engineering' ? deceptionLevel : espionageLevel;
    const roll = DiceEngine.roll('espionage', skillForMethod, 'high', [], state);
    DiceEngine.applyXP(state.skills, 'espionage', roll.xpAwarded);

    if (roll.isSuccess) {
      const intel = _generateIntelligenceResult(target, roll.tier, state);
      state.intelligence.push({ target, intel, turn: state.meta.turn, reliability: _rollReliability(roll.tier) });
      return { success: true, intel, roll };
    }

    // Failure risks exposure
    if (roll.isDisaster) {
      ReputationEngine.increaseHeat(state, 20);
      return { success: false, exposed: true, roll };
    }

    return { success: false, roll };
  }

  function _generateIntelligenceResult(target, tier, state) {
    const intelTypes = ['troop_strength', 'financial_state', 'alliances', 'secrets', 'movements'];
    const count = tier === 'critical' ? 3 : tier === 'strong' ? 2 : 1;
    return intelTypes.slice(0, count).map(t => ({ type: t, subject: target, known: true }));
  }

  function _rollReliability(tier) {
    return tier === 'critical' ? 'very_high' : tier === 'strong' ? 'high' : 'medium';
  }

  // ════════════════════════════════════════════════════════
  //  IDENTITY / DISGUISE SYSTEM
  // ════════════════════════════════════════════════════════

  const IDENTITY_PRESETS = {
    traveling_merchant: { class_appears: 'burgher',  skill_checks: ['deception', 'etiquette'], cover_blows_on: 30 },
    wandering_pilgrim:  { class_appears: 'freeman',  skill_checks: ['theology', 'deception'],  cover_blows_on: 25 },
    minor_nobleman:     { class_appears: 'petty_noble', skill_checks: ['etiquette', 'deception', 'heraldry'], cover_blows_on: 45 },
    peasant_worker:     { class_appears: 'serf',     skill_checks: ['deception'],              cover_blows_on: 15 },
    itinerant_scholar:  { class_appears: 'scholar',  skill_checks: ['reading', 'latin', 'deception'], cover_blows_on: 30 }
  };

  function adoptDisguise(identityId, state) {
    const preset = IDENTITY_PRESETS[identityId];
    if (!preset) return false;

    // Check if Heinrich can plausibly maintain it
    const requiredSkills = preset.skill_checks;
    const avgLevel = requiredSkills.reduce((sum, sk) => sum + (state.skills[sk]?.level || 0), 0) / requiredSkills.length;

    if (avgLevel < 3) {
      return { success: false, reason: 'Insufficient skills to maintain this disguise convincingly.' };
    }

    state.heinrich.current_identity = {
      id: identityId,
      preset,
      adopted_turn: state.meta.turn,
      cover_strength: Math.min(100, avgLevel * 10 + 30),
      suspected: false
    };

    return { success: true, identity: identityId, cover_strength: state.heinrich.current_identity.cover_strength };
  }

  function checkDisguiseExposure(npcId, state) {
    if (!state.heinrich.current_identity) return false;

    const cover = state.heinrich.current_identity.cover_strength;
    const npc = state.npcs.active[npcId];
    const npcPerceptiveness = npc?.skills?.social_level || 2;

    const exposureChance = Math.max(0, (npcPerceptiveness * 8) - cover) / 100;
    const exposed = DiceEngine.chance(exposureChance);

    if (exposed) {
      state.heinrich.current_identity.suspected = true;
      ReputationEngine.increaseHeat(state, 15);
      return true;
    }
    return false;
  }

  // ════════════════════════════════════════════════════════
  //  OATHS SYSTEM
  // ════════════════════════════════════════════════════════

  function swearOath(oathText, targetNpcId, witnesses, deadlineTurns, state) {
    const oath = {
      id: `oath_${Date.now()}`,
      text: oathText,
      sworn_to: targetNpcId,
      witnesses,
      sworn_on: state.calendar.date,
      sworn_turn: state.meta.turn,
      deadline_turn: deadlineTurns ? state.meta.turn + deadlineTurns : null,
      fulfilled: false,
      broken: false,
      sworn_on_relic: witnesses.includes('church')
    };

    state.oaths.sworn_by_heinrich.push(oath);

    // Piety and honor boost for swearing a serious oath
    ReputationEngine.changeReputation(state, ['church_normandy'], { piety: 5, honor: 3, overall: 4 }, 'Swore solemn oath');

    return oath;
  }

  function fulfillOath(oathId, state) {
    const oath = state.oaths.sworn_by_heinrich.find(o => o.id === oathId);
    if (!oath || oath.fulfilled) return false;

    oath.fulfilled = true;
    oath.fulfilled_turn = state.meta.turn;

    ReputationEngine.changeReputation(state, ['normandy_peasants', 'normandy_nobility', 'church_normandy'], {
      honor: 15, overall: 10
    }, 'Kept a sworn oath');

    return true;
  }

  function breakOath(oathId, state) {
    const oath = state.oaths.sworn_by_heinrich.find(o => o.id === oathId);
    if (!oath) return false;

    oath.broken = true;
    oath.broken_turn = state.meta.turn;

    ReputationEngine.changeReputation(state, ['normandy_peasants', 'normandy_nobility', 'church_normandy', 'military'], {
      honor: -25, piety: -10, overall: -20
    }, 'Broke a sworn oath');

    if (oath.sworn_on_relic) {
      ConsequenceEngine.scheduleConsequence('broke_oath_sworn_on_relic', {}, state);
    }

    return true;
  }

  // ════════════════════════════════════════════════════════
  //  PRISON SYSTEM
  // ════════════════════════════════════════════════════════

  function imprisonHeinrich(prisonType, chargeType, state) {
    state.heinrich.imprisoned = {
      prison_type: prisonType, // 'lord_dungeon', 'church_custody', 'royal_prison'
      charge: chargeType,
      imprisoned_turn: state.meta.turn,
      sentence_turns: _calculateSentence(chargeType),
      can_bribe: prisonType !== 'royal_prison',
      can_escape: prisonType === 'lord_dungeon',
      daily_hp_loss: prisonType === 'royal_prison' ? 1 : 0
    };

    return state.heinrich.imprisoned;
  }

  function attemptPrisonEscape(state) {
    if (!state.heinrich.imprisoned) return { success: false, reason: 'Not imprisoned' };

    const stealth = state.skills.stealth?.level || 0;
    const roll = DiceEngine.roll('stealth', stealth, state.heinrich.imprisoned.prison_type === 'lord_dungeon' ? 'high' : 'extreme', [], state);
    DiceEngine.applyXP(state.skills, 'stealth', roll.xpAwarded);

    if (roll.isSuccess) {
      const escaped = { ...state.heinrich.imprisoned };
      state.heinrich.imprisoned = null;
      ReputationEngine.increaseHeat(state, 40);
      return { success: true, roll };
    }

    return { success: false, roll, punishment: 'extended_sentence' };
  }

  function bribePrisonWarden(amountSous, state) {
    if (!state.heinrich.imprisoned?.can_bribe) return false;
    const baseRequired = 50 + DiceEngine.randInt(0, 50);
    if (amountSous >= baseRequired) {
      const paid = EconomyEngine.spendMoney(state.inventory, amountSous);
      if (paid) {
        state.heinrich.imprisoned = null;
        return { success: true };
      }
    }
    return { success: false, needs_more: baseRequired };
  }

  function _calculateSentence(chargeType) {
    const sentences = {
      theft_minor: 16, theft_major: 40, assault: 32, poaching: 24, smuggling: 32
    };
    return sentences[chargeType] || 40;
  }

  // ════════════════════════════════════════════════════════
  //  RELIGION SYSTEM
  // ════════════════════════════════════════════════════════

  const PIETY_ACTS = {
    sunday_mass: { piety_gain: 3, frequency: 'weekly', faction: 'church_normandy' },
    confession: { piety_gain: 8, corruption_reduce: 5, frequency: 'monthly', faction: 'church_normandy' },
    pilgrimage_local: { piety_gain: 25, turncount: 40, faction: 'church_normandy' },
    church_donation_medium: { piety_gain: 12, cost_sous: 10, faction: 'church_normandy' },
    church_donation_large: { piety_gain: 25, cost_sous: 50, faction: ['church_normandy', 'church_rome'] },
    fast_on_holy_day: { piety_gain: 5, faction: 'church_normandy' },
    crusade_vow: { piety_gain: 50, faction: ['church_normandy', 'church_rome'], obligation: 'must_crusade' }
  };

  function performPiousAct(actId, state) {
    const act = PIETY_ACTS[actId];
    if (!act) return false;

    if (act.cost_sous) {
      const paid = EconomyEngine.spendMoney(state.inventory, act.cost_sous);
      if (!paid) return { success: false, reason: 'Cannot afford' };
    }

    state.heinrich.piety = Math.min(100, (state.heinrich.piety || 50) + act.piety_gain);

    if (act.corruption_reduce) {
      ReputationEngine.decreaseCorruption(state, act.corruption_reduce, actId);
    }

    const factions = Array.isArray(act.faction) ? act.faction : [act.faction];
    ReputationEngine.changeReputation(state, factions, { piety: act.piety_gain, overall: Math.round(act.piety_gain * 0.5) }, actId);

    return { success: true, piety_gained: act.piety_gain };
  }

  // ════════════════════════════════════════════════════════
  //  CULTURAL IDENTITY SYSTEM
  // ════════════════════════════════════════════════════════

  /**
   * Track cultural adoption (languages, customs, regional identity).
   */
  function adoptCulturalCustom(customId, culture, state) {
    if (!state.heinrich.cultural_adaptations) state.heinrich.cultural_adaptations = [];

    const alreadyAdopted = state.heinrich.cultural_adaptations.some(c => c.id === customId);
    if (alreadyAdopted) return false;

    state.heinrich.cultural_adaptations.push({ id: customId, culture, adopted_turn: state.meta.turn });

    // Social bonus in that culture's territory
    const culturalNpcs = {
      english: ['english_crown'],
      flemish: ['merchants_guild'],
      italian: ['merchants_guild', 'scholars'],
      arabic: ['scholars']
    };

    const affectedFactions = culturalNpcs[culture] || [];
    if (affectedFactions.length > 0) {
      ReputationEngine.changeReputation(state, affectedFactions, { cunning: 5, overall: 5 }, `Adopted ${culture} customs`);
    }

    return true;
  }

  function knowsLanguage(language, state) {
    return (state.heinrich.languages || []).includes(language);
  }

  function learnLanguage(language, state) {
    if (!state.heinrich.languages) state.heinrich.languages = ['french', 'latin_liturgical'];
    if (!state.heinrich.languages.includes(language)) {
      state.heinrich.languages.push(language);
      ReputationEngine.changeReputation(state, ['scholars', 'merchants_guild'], { cunning: 5 }, `Learned ${language}`);
    }
  }

  // ════════════════════════════════════════════════════════
  //  DREAM / OMEN SYSTEM (flavour + mental health)
  // ════════════════════════════════════════════════════════

  const DREAM_ARCHETYPES = [
    { type: 'prophetic', mental_drain: -2, narrative_key: 'prophetic_dream', trigger: 'high_piety' },
    { type: 'nightmare', mental_drain: -8, narrative_key: 'nightmare', trigger: 'trauma_or_wound' },
    { type: 'dead_speaking', mental_drain: -5, narrative_key: 'dream_of_dead', trigger: 'grief_condition' },
    { type: 'triumph', mental_boost: 5, narrative_key: 'dream_of_glory', trigger: 'high_morale' },
    { type: 'mundane', mental_drain: 0, narrative_key: 'plain_dream', trigger: 'default' }
  ];

  function processDream(state) {
    // Dreams happen during sleep
    const h = state.heinrich;

    // Select dream type based on state
    let dreamType = 'mundane';
    if (h.health.mental_conditions.some(c => c.type === 'ptsd')) dreamType = 'nightmare';
    else if (h.health.mental_conditions.some(c => c.type === 'grief')) dreamType = 'dead_speaking';
    else if (h.piety > 70 && DiceEngine.chance(0.05)) dreamType = 'prophetic';
    else if (h.health.mental_value > 75 && DiceEngine.chance(0.1)) dreamType = 'triumph';

    const dream = DREAM_ARCHETYPES.find(d => d.type === dreamType) || DREAM_ARCHETYPES[4];

    if (dream.mental_drain) h.health.mental_value = Math.max(0, h.health.mental_value + dream.mental_drain);
    if (dream.mental_boost) h.health.mental_value = Math.min(100, h.health.mental_value + dream.mental_boost);

    return { type: dreamType, narrative_key: dream.narrative_key };
  }

  // ════════════════════════════════════════════════════════
  //  REBELLION / UPRISING SYSTEM
  // ════════════════════════════════════════════════════════

  /**
   * Check if conditions for uprising exist in a region.
   */
  function checkUprising(region, state) {
    const regionData = state.world.regions?.[region] || {};
    const peasantGrievance = regionData.peasant_grievance || 0;

    if (peasantGrievance >= 80) {
      return {
        uprising_imminent: true,
        probability: Math.min(0.95, (peasantGrievance - 60) / 50),
        causes: regionData.grievance_causes || ['heavy_taxation'],
        potential_size: peasantGrievance > 90 ? 'large' : 'medium'
      };
    }

    return { uprising_imminent: false };
  }

  function joinUprising(role, state) {
    // role: 'leader', 'organizer', 'participant'
    const uprising = { turn: state.meta.turn, role, region: state.map.current_location };
    state.chronicle.entries.push({ type: 'uprising_involvement', ...uprising, significant: true });

    if (role === 'leader') {
      ReputationEngine.changeReputation(state, ['normandy_peasants', 'common_people'], { honor: 15, ferocity: 10, generosity: 10, overall: 15 }, 'Led peasant uprising');
      ReputationEngine.changeReputation(state, ['normandy_nobility', 'french_crown', 'local_lord'], { honor: -20, overall: -25 }, 'Led peasant uprising against lords');
      ConsequenceEngine.scheduleConsequence('made_powerful_enemy', { name: 'Noble Vengeance', npc_id: 'local_lord' }, state);
    }

    return uprising;
  }

  // ════════════════════════════════════════════════════════
  //  COUNCIL SYSTEM (political advisory body)
  // ════════════════════════════════════════════════════════

  /**
   * Convene a council of Heinrich's trusted associates.
   * Returns their advice based on the situation.
   */
  function conveneCouncil(topic, state) {
    const councilMembers = Object.values(state.npcs.active).filter(npc => {
      const rel = state.npc_relationships[npc.id];
      return rel && rel.favorability > 65 && npc.knows_heinrich;
    });

    if (councilMembers.length === 0) {
      return { advice: 'You have no trusted advisors to consult.', members: 0 };
    }

    const perspectives = councilMembers.map(npc => ({
      name: npc.name,
      occupation: npc.occupation,
      advice_angle: _getAdviceAngle(npc, topic)
    }));

    return {
      members: councilMembers.length,
      perspectives,
      consensus: _getCouncilConsensus(perspectives, topic),
      narrative_key: 'council_meeting'
    };
  }

  function _getAdviceAngle(npc, topic) {
    if (npc.occupation === 'soldier' || npc.occupation === 'knight') return 'military_perspective';
    if (npc.occupation === 'merchant') return 'economic_perspective';
    if (npc.occupation === 'priest' || npc.occupation === 'monk') return 'religious_perspective';
    return 'practical_perspective';
  }

  function _getCouncilConsensus(perspectives, topic) {
    const majority = {};
    perspectives.forEach(p => {
      majority[p.advice_angle] = (majority[p.advice_angle] || 0) + 1;
    });
    return Object.keys(majority).sort((a, b) => majority[b] - majority[a])[0];
  }

  // ════════════════════════════════════════════════════════
  //  LEGACY SYSTEM (life chronicle)
  // ════════════════════════════════════════════════════════

  function addChronicleEntry(entry, state) {
    state.chronicle.entries.push({
      ...entry,
      turn: entry.turn || state.meta.turn,
      date: CalendarEngine.formatDate(state.calendar.date, true)
    });
  }

  function getLegacySummary(state) {
    return {
      score: state.chronicle.legacy_score,
      tier: _getLegacyTier(state.chronicle.legacy_score),
      major_events: state.chronicle.entries.filter(e => e.significant).length,
      achievements: state.chronicle.achievements.length,
      years_lived: state.heinrich.age - 20, // Started at 20
      class_peak: state.heinrich.class,
      class_tier_peak: state.heinrich.class_tier
    };
  }

  function _getLegacyTier(score) {
    if (score >= 1000) return 'Emperor';
    if (score >= 700)  return 'King';
    if (score >= 500)  return 'Great Lord';
    if (score >= 300)  return 'Baron';
    if (score >= 150)  return 'Knight';
    if (score >= 80)   return 'Burgher';
    if (score >= 30)   return 'Freeman';
    return 'Serf';
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    // Crime
    CRIME_TYPES, commitCrime, calculateDetectionRisk,
    // Espionage
    gatherIntelligence,
    // Identity
    IDENTITY_PRESETS, adoptDisguise, checkDisguiseExposure,
    // Oaths
    swearOath, fulfillOath, breakOath,
    // Prison
    imprisonHeinrich, attemptPrisonEscape, bribePrisonWarden,
    // Religion
    PIETY_ACTS, performPiousAct,
    // Cultural
    adoptCulturalCustom, knowsLanguage, learnLanguage,
    // Dreams
    processDream,
    // Rebellion
    checkUprising, joinUprising,
    // Council
    conveneCouncil,
    // Legacy
    addChronicleEntry, getLegacySummary
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SystemsEngine };
}

// END FILE: client/js/engine/systems-engine.js

// ══════════════════════════════════════════════════
// ✅ PART 8 COMPLETE  
// NEXT: PART 9 — LLM Integration (prompt-builder, response-parser)
// ══════════════════════════════════════════════════
