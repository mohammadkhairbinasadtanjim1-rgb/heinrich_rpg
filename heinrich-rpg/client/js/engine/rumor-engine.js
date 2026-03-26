// FILE: client/js/engine/rumor-engine.js — PART 5

'use strict';

/**
 * RUMOR ENGINE — Rumor creation, spread, decay, manipulation,
 * and the information-as-weapon system.
 */

const RumorEngine = (() => {

  // ─── RUMOR CATEGORIES ─────────────────────────────────────────────────────
  const RUMOR_TYPES = {
    reputation:   { spread_rate: 1.4, decay_rate: 0.03, credibility_factor: 0.8 },
    military:     { spread_rate: 1.8, decay_rate: 0.02, credibility_factor: 0.9 },
    scandal:      { spread_rate: 2.0, decay_rate: 0.05, credibility_factor: 0.7 },
    economic:     { spread_rate: 1.2, decay_rate: 0.04, credibility_factor: 0.85 },
    supernatural: { spread_rate: 1.5, decay_rate: 0.02, credibility_factor: 0.3 },
    death:        { spread_rate: 2.0, decay_rate: 0.01, credibility_factor: 0.95 },
    romance:      { spread_rate: 1.8, decay_rate: 0.06, credibility_factor: 0.5 }
  };

  // ─── CREATE RUMOR ─────────────────────────────────────────────────────────

  /**
   * Create a new rumor and add it to the world state.
   * @param {object} rumorDef - { subject, content, type, origin, truth_level: 0-100 }
   * @param {object} state - Game state
   */
  function createRumor(rumorDef, state) {
    const typeData = RUMOR_TYPES[rumorDef.type] || RUMOR_TYPES.reputation;

    const rumor = {
      id: `rumor_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      subject: rumorDef.subject || 'Heinrich',
      content: rumorDef.content,
      type: rumorDef.type || 'reputation',
      origin: rumorDef.origin || state.map.current_location,
      origin_turn: state.meta.turn,
      truth_level: rumorDef.truth_level !== undefined ? rumorDef.truth_level : 80,
      strength: 100,
      spread_count: 0,
      regions_reached: [rumorDef.origin || state.map.current_location],
      planted_by_heinrich: !!rumorDef.planted_by_heinrich,
      believed_by: [],
      effects: rumorDef.effects || {}
    };

    state.rumors.active.push(rumor);

    // If the subject is Heinrich, apply immediate reputation effect
    if (rumor.subject === 'Heinrich' || rumor.subject === 'heinrich') {
      _applyRumorReputationEffect(rumor, state);
    }

    return rumor;
  }

  /**
   * Plant a deliberate rumor (espionage/deception action).
   */
  function plantRumor(content, target, rumorType, state, agentNPC = null) {
    const deceptionLevel = state.skills.deception?.level || 0;
    const espionageLevel = state.skills.espionage?.level || 0;

    // Check if rumor seems plausible
    const plausibility = _calculatePlausibility(content, target, state);

    // Roll to see if plant is convincing
    const plantRoll = DiceEngine.roll(
      'deception',
      Math.max(deceptionLevel, espionageLevel),
      plausibility > 70 ? 'medium' : plausibility > 40 ? 'high' : 'extreme',
      [],
      state
    );

    DiceEngine.applyXP(state.skills, 'deception', plantRoll.xpAwarded);

    if (plantRoll.isSuccess) {
      const rumor = createRumor({
        subject: target,
        content,
        type: rumorType,
        origin: state.map.current_location,
        truth_level: 0, // It's false
        planted_by_heinrich: true,
        effects: { reputation_change: -15, target }
      }, state);

      state.rumors.planted_by_heinrich.push(rumor.id);

      return { success: true, rumor, roll: plantRoll };
    }

    return { success: false, roll: plantRoll, reason: 'Rumor not convincing enough to spread' };
  }

  /**
   * Spread rumors to new regions on world tick.
   */
  function spreadRumors(state) {
    const events = [];

    for (const rumor of state.rumors.active) {
      const typeData = RUMOR_TYPES[rumor.type] || RUMOR_TYPES.reputation;

      // Chance to spread to adjacent region each day
      if (DiceEngine.chance(0.1 * typeData.spread_rate)) {
        const newRegion = _getAdjacentRegion(rumor.regions_reached, state);
        if (newRegion && !rumor.regions_reached.includes(newRegion)) {
          rumor.regions_reached.push(newRegion);
          rumor.spread_count++;

          if (rumor.subject === 'Heinrich' || rumor.subject === 'heinrich') {
            events.push({
              type: 'rumor_spread',
              rumor_id: rumor.id,
              content: rumor.content,
              reached: newRegion,
              narrative_key: 'rumor_reaches_new_area'
            });
          }
        }
      }

      // Distortion: rumors become less accurate over time
      if (rumor.spread_count > 3 && rumor.truth_level > 0) {
        rumor.truth_level = Math.max(0, rumor.truth_level - 5);
      }
    }

    return events;
  }

  /**
   * Check if NPC has heard a specific rumor.
   */
  function npcHasHeardRumor(npcRegion, rumorId, state) {
    const rumor = state.rumors.active.find(r => r.id === rumorId);
    if (!rumor) return false;
    return rumor.regions_reached.includes(npcRegion) && DiceEngine.chance(rumor.strength / 100);
  }

  /**
   * Get all rumors currently circulating about Heinrich.
   */
  function getActiveRumorsAboutHeinrich(state) {
    return state.rumors.active.filter(r =>
      r.subject === 'Heinrich' || r.subject === 'heinrich'
    );
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

  function _applyRumorReputationEffect(rumor, state) {
    if (!rumor.effects?.reputation_change) return;

    const change = rumor.effects.reputation_change;
    const affectedFactions = rumor.effects.factions || ['normandy_peasants', 'common_people'];

    for (const faction of affectedFactions) {
      if (!state.heinrich.reputation[faction]) continue;
      const impact = Math.round(change * (rumor.truth_level / 100));
      state.heinrich.reputation[faction].overall = Math.max(0, Math.min(100,
        state.heinrich.reputation[faction].overall + impact
      ));
    }
  }

  function _calculatePlausibility(content, target, state) {
    // Simple heuristic: if the rumor is consistent with known facts = more plausible
    let plausibility = 50;
    plausibility += (state.skills.read_people?.level || 0) * 3; // Understanding target helps
    return Math.min(100, plausibility);
  }

  function _getAdjacentRegion(currentRegions, state) {
    const regionAdjacency = {
      normandy: ['brittany', 'paris_basin', 'maine'],
      paris_basin: ['normandy', 'champagne', 'ile_de_france'],
      brittany: ['normandy', 'maine'],
      flanders: ['normandy', 'champagne'],
      champagne: ['paris_basin', 'burgundy', 'flanders']
    };

    for (const region of currentRegions) {
      const adjacent = regionAdjacency[region] || [];
      const unvisited = adjacent.filter(r => !currentRegions.includes(r));
      if (unvisited.length > 0) {
        return unvisited[DiceEngine.randInt(0, unvisited.length - 1)];
      }
    }
    return null;
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    RUMOR_TYPES,
    createRumor,
    plantRumor,
    spreadRumors,
    npcHasHeardRumor,
    getActiveRumorsAboutHeinrich
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { RumorEngine };
}

// END FILE: client/js/engine/rumor-engine.js

// ══════════════════════════════════════════════════
// ✅ PART 5 COMPLETE
// NEXT: PART 6 — NPC & Relationship Engines
// ══════════════════════════════════════════════════
