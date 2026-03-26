// FILE: client/js/engine/reputation-engine.js — PART 4

'use strict';

/**
 * REPUTATION ENGINE — Multi-dimensional reputation tracking per faction,
 * moral compass, corruption, honor, social effects, and reputation events.
 * 
 * Reputation has 5 axes: honor, ferocity, cunning, piety, generosity
 * Each axis is 0-100, tracked PER FACTION/REGION.
 */

const ReputationEngine = (() => {

  // ─── REPUTATION DIMENSIONS ───────────────────────────────────────────────
  const REPUTATION_AXES = ['honor', 'ferocity', 'cunning', 'piety', 'generosity'];

  // ─── FACTION DEFINITIONS ──────────────────────────────────────────────────
  const FACTIONS = {
    normandy_peasants:   { label: 'Norman Peasants',     cares_about: ['honor', 'generosity', 'piety'], starting_opinion: 35 },
    normandy_nobility:   { label: 'Norman Nobility',     cares_about: ['honor', 'ferocity', 'piety'],   starting_opinion: 20 },
    local_lord:          { label: 'Local Lord',          cares_about: ['honor', 'ferocity'],            starting_opinion: 20 },
    church_normandy:     { label: 'Norman Church',       cares_about: ['piety', 'honor', 'generosity'], starting_opinion: 30 },
    church_rome:         { label: 'Rome / Holy See',     cares_about: ['piety', 'honor'],               starting_opinion: 25 },
    french_crown:        { label: 'French Crown',        cares_about: ['honor', 'ferocity'],            starting_opinion: 10 },
    english_crown:       { label: 'English Crown',       cares_about: ['honor', 'ferocity'],            starting_opinion: 10 },
    merchants_guild:     { label: 'Merchants',           cares_about: ['cunning', 'honor'],             starting_opinion: 25 },
    blacksmiths_guild:   { label: 'Smiths Guild',        cares_about: ['honor', 'cunning'],             starting_opinion: 25 },
    criminal_underworld: { label: 'Criminal Underworld', cares_about: ['cunning', 'ferocity'],          starting_opinion: 20 },
    military:            { label: 'Military / Soldiers', cares_about: ['ferocity', 'honor'],            starting_opinion: 25 },
    scholars:            { label: 'Scholars / Clergy',   cares_about: ['piety', 'cunning'],             starting_opinion: 20 },
    common_people:       { label: 'Common People',       cares_about: ['generosity', 'honor'],          starting_opinion: 30 }
  };

  // ─── REPUTATION TIER LABELS ───────────────────────────────────────────────
  const REPUTATION_TIERS = [
    { min: 90,  label: 'Legendary',   color: '#ffd700' },
    { min: 75,  label: 'Renowned',    color: '#c4a35a' },
    { min: 60,  label: 'Well Known',  color: '#8fbc8f' },
    { min: 45,  label: 'Known',       color: '#a0a0a0' },
    { min: 30,  label: 'Obscure',     color: '#808080' },
    { min: 15,  label: 'Disliked',    color: '#cd853f' },
    { min: 0,   label: 'Despised',    color: '#8b2500' }
  ];

  // ─── MORAL COMPASS THRESHOLDS ─────────────────────────────────────────────
  const MORAL_COMPASS_LABELS = {
    mercy:      { low: 'Merciless', high: 'Merciful' },
    honesty:    { low: 'Deceitful', high: 'Forthright' },
    ambition:   { low: 'Content',   high: 'Relentlessly Ambitious' },
    violence:   { low: 'Peaceful',  high: 'Prone to Violence' },
    loyalty:    { low: 'Treacherous', high: 'Steadfastly Loyal' },
    compassion: { low: 'Callous',   high: 'Deeply Compassionate' }
  };

  // ─── INITIALIZE FACTION REPUTATION ───────────────────────────────────────

  /**
   * Initialize reputation object for a new game.
   * Called by GameState.initNew().
   */
  function initReputation() {
    const rep = {};
    for (const [factionId, faction] of Object.entries(FACTIONS)) {
      rep[factionId] = {
        honor: 40,
        ferocity: 20,
        cunning: 15,
        piety: 30,
        generosity: 25,
        overall: faction.starting_opinion,
        known: factionId === 'normandy_peasants' || factionId === 'local_lord' || factionId === 'church_normandy',
        events: [] // reputation-changing events history
      };
    }
    return rep;
  }

  // ─── REPUTATION CHANGE ───────────────────────────────────────────────────

  /**
   * Apply a reputation change to one or more factions.
   * @param {object} state - Game state
   * @param {string|string[]} factionIds - Faction(s) to change
   * @param {object} changes - { honor: +10, generosity: -5, overall: +8 }
   * @param {string} reason - Why (for logging)
   */
  function changeReputation(state, factionIds, changes, reason) {
    const factions = Array.isArray(factionIds) ? factionIds : [factionIds];
    const results = [];

    for (const factionId of factions) {
      if (!state.heinrich.reputation[factionId]) {
        state.heinrich.reputation[factionId] = _createFactionRep(factionId);
      }

      const rep = state.heinrich.reputation[factionId];
      const oldOverall = rep.overall;

      // Apply axis changes
      for (const [axis, delta] of Object.entries(changes)) {
        if (REPUTATION_AXES.includes(axis)) {
          rep[axis] = Math.max(0, Math.min(100, (rep[axis] || 30) + delta));
        }
      }

      // Apply direct overall change
      if (changes.overall !== undefined) {
        rep.overall = Math.max(0, Math.min(100, rep.overall + changes.overall));
      } else {
        // Recalculate overall from axes weighted by faction preferences
        rep.overall = _calculateOverall(factionId, rep);
      }

      // Reputation now known if it's significant
      if (Math.abs(rep.overall - 35) > 15) rep.known = true;

      // Log the event
      rep.events.push({
        turn: state.meta.turn,
        changes,
        reason,
        old_overall: oldOverall,
        new_overall: rep.overall
      });

      results.push({
        faction: factionId,
        old_overall: oldOverall,
        new_overall: rep.overall,
        delta: rep.overall - oldOverall
      });

      // Cross-faction effects (reputation spills)
      _propagateReputation(state, factionId, changes, reason);
    }

    // Update legacy score
    state.chronicle.legacy_score = calculateLegacyScore(state);

    return results;
  }

  /**
   * Positive reputation events and their typical effects.
   */
  const REPUTATION_EVENTS = {
    saved_life: {
      id: 'saved_life',
      changes: { honor: 10, generosity: 8, overall: 12 },
      factions_affected: ['normandy_peasants', 'church_normandy', 'common_people'],
      description: 'Saved someone\'s life at personal risk'
    },
    won_tournament: {
      id: 'won_tournament',
      changes: { ferocity: 15, honor: 10, overall: 18 },
      factions_affected: ['military', 'normandy_nobility'],
      description: 'Won a tournament or public contest'
    },
    donated_to_church: {
      id: 'donated_to_church',
      changes: { piety: 12, generosity: 8, overall: 10 },
      factions_affected: ['church_normandy', 'church_rome', 'common_people'],
      description: 'Made a significant donation to the Church'
    },
    defeated_bandit: {
      id: 'defeated_bandit',
      changes: { ferocity: 8, honor: 8, overall: 12 },
      factions_affected: ['normandy_peasants', 'military', 'normandy_nobility'],
      description: 'Defeated bandits threatening the community'
    },
    broke_oath: {
      id: 'broke_oath',
      changes: { honor: -20, overall: -18 },
      factions_affected: ['normandy_peasants', 'normandy_nobility', 'military'],
      description: 'Broke a sworn oath'
    },
    murdered: {
      id: 'murdered',
      changes: { honor: -15, ferocity: 15, overall: -12 },
      factions_affected: ['church_normandy', 'normandy_peasants'],
      description: 'Killed someone — reaction depends on victim'
    },
    committed_treachery: {
      id: 'committed_treachery',
      changes: { honor: -25, cunning: 15, overall: -20 },
      factions_affected: ['normandy_peasants', 'normandy_nobility', 'military'],
      description: 'Betrayed someone who trusted you'
    },
    public_generosity: {
      id: 'public_generosity',
      changes: { generosity: 15, overall: 12 },
      factions_affected: ['normandy_peasants', 'common_people', 'church_normandy'],
      description: 'Publicly distributed food, coin, or aid'
    },
    strategic_marriage: {
      id: 'strategic_marriage',
      changes: { cunning: 8, honor: 5, overall: 10 },
      factions_affected: ['normandy_nobility'],
      description: 'Contracted a politically advantageous marriage'
    },
    exceptional_craftsmanship: {
      id: 'exceptional_craftsmanship',
      changes: { honor: 8, cunning: 5, overall: 8 },
      factions_affected: ['blacksmiths_guild', 'merchants_guild'],
      description: 'Created a masterwork piece that drew attention'
    },
    heresy_accusation: {
      id: 'heresy_accusation',
      changes: { piety: -30, honor: -15, overall: -20 },
      factions_affected: ['church_normandy', 'church_rome', 'normandy_peasants'],
      description: 'Accused of heresy — even accusations cause damage'
    },
    military_victory: {
      id: 'military_victory',
      changes: { ferocity: 20, honor: 15, overall: 18 },
      factions_affected: ['military', 'normandy_nobility', 'french_crown'],
      description: 'Led forces to a significant military victory'
    },
    cured_plague_village: {
      id: 'cured_plague_village',
      changes: { piety: 15, generosity: 20, honor: 12, overall: 25 },
      factions_affected: ['normandy_peasants', 'church_normandy', 'common_people'],
      description: 'Halted a disease outbreak through skill or sacrifice'
    }
  };

  /**
   * Apply a named reputation event.
   */
  function applyReputationEvent(state, eventId, modifiers = {}) {
    const event = REPUTATION_EVENTS[eventId];
    if (!event) return null;

    const changes = { ...event.changes };
    // Apply modifiers (e.g., +50% if witnessed by many people)
    if (modifiers.witness_multiplier) {
      for (const key of Object.keys(changes)) {
        changes[key] = Math.round(changes[key] * modifiers.witness_multiplier);
      }
    }

    return changeReputation(state, event.factions_affected, changes, event.description);
  }

  // ─── OVERALL REPUTATION CALCULATION ──────────────────────────────────────

  function _calculateOverall(factionId, rep) {
    const faction = FACTIONS[factionId];
    if (!faction) return rep.overall;

    const weights = { honor: 0.15, ferocity: 0.15, cunning: 0.15, piety: 0.2, generosity: 0.2 };
    // Boost weight for axes this faction cares about
    for (const axis of (faction.cares_about || [])) {
      if (weights[axis] !== undefined) weights[axis] += 0.1;
    }

    let total = 0;
    let weightTotal = 0;
    for (const axis of REPUTATION_AXES) {
      total += (rep[axis] || 30) * (weights[axis] || 0.1);
      weightTotal += weights[axis] || 0.1;
    }
    return Math.round(total / weightTotal);
  }

  function _createFactionRep(factionId) {
    const faction = FACTIONS[factionId];
    return {
      honor: 30, ferocity: 20, cunning: 20, piety: 25, generosity: 20,
      overall: faction?.starting_opinion || 25,
      known: false,
      events: []
    };
  }

  /**
   * Propagate reputation changes to nearby factions via word-of-mouth.
   */
  function _propagateReputation(state, sourceFaction, changes, reason) {
    // Define propagation chains
    const chains = {
      normandy_peasants: ['common_people', 'church_normandy'],
      normandy_nobility: ['french_crown', 'military'],
      church_normandy: ['church_rome', 'normandy_peasants'],
      military: ['normandy_nobility', 'french_crown'],
      merchants_guild: ['common_people'],
      criminal_underworld: [] // they don't gossip to respectable people
    };

    const propagateTo = chains[sourceFaction] || [];
    for (const targetFaction of propagateTo) {
      if (!state.heinrich.reputation[targetFaction]) {
        state.heinrich.reputation[targetFaction] = _createFactionRep(targetFaction);
      }
      // Propagate at 30% strength — word of mouth is diluted
      const dilutedChanges = {};
      for (const [key, val] of Object.entries(changes)) {
        dilutedChanges[key] = Math.round(val * 0.3);
      }
      const rep = state.heinrich.reputation[targetFaction];
      for (const [axis, delta] of Object.entries(dilutedChanges)) {
        if (REPUTATION_AXES.includes(axis)) {
          rep[axis] = Math.max(0, Math.min(100, (rep[axis] || 30) + delta));
        }
      }
    }
  }

  // ─── MORAL COMPASS ───────────────────────────────────────────────────────

  /**
   * Shift the moral compass based on a player action.
   * @param {object} morals - state.heinrich.moral_compass
   * @param {object} shifts - { mercy: -5, violence: +10 }
   */
  function shiftMoralCompass(morals, shifts) {
    for (const [axis, delta] of Object.entries(shifts)) {
      if (morals[axis] !== undefined) {
        morals[axis] = Math.max(0, Math.min(100, morals[axis] + delta));
      }
    }
    return morals;
  }

  /**
   * Get a narrative description of Heinrich's moral compass state.
   */
  function getMoralProfile(morals) {
    const traits = [];
    for (const [axis, bounds] of Object.entries(MORAL_COMPASS_LABELS)) {
      const val = morals[axis] || 50;
      if (val >= 70) traits.push(bounds.high);
      else if (val <= 30) traits.push(bounds.low);
    }
    return traits.length > 0 ? traits : ['Unremarkable — a man of middling virtues and sins'];
  }

  /**
   * Get what the moral compass predicts about future behavior (for LLM context).
   */
  function getMoralTendencies(morals) {
    return {
      likely_to_show_mercy: (morals.mercy || 50) > 60,
      likely_to_lie: (morals.honesty || 50) < 40,
      likely_to_push_limits: (morals.ambition || 50) > 65,
      likely_to_resort_to_violence: (morals.violence || 50) > 65,
      likely_to_betray: (morals.loyalty || 50) < 35,
      likely_to_help_strangers: (morals.compassion || 50) > 65
    };
  }

  // ─── CORRUPTION SYSTEM ───────────────────────────────────────────────────

  /**
   * Increase corruption score.
   * Corruption (0-100) represents moral decay, the accumulation of dark deeds.
   * At high corruption, certain NPCs gravitate toward Heinrich and others flee.
   */
  function increaseCorruption(state, amount, reason) {
    const prev = state.heinrich.corruption;
    state.heinrich.corruption = Math.min(100, state.heinrich.corruption + amount);

    const events = [];

    // Corruption milestone effects
    if (prev < 25 && state.heinrich.corruption >= 25) {
      events.push({ type: 'corruption_milestone', level: 25,
        description: 'Something has shifted in Heinrich. Those with dark pasts recognize it.' });
    }
    if (prev < 50 && state.heinrich.corruption >= 50) {
      events.push({ type: 'corruption_milestone', level: 50,
        description: 'The darkness is visible now. Pious people are uncomfortable. Criminals are comfortable.' });
      // Piety reputation penalty
      changeReputation(state, ['church_normandy', 'church_rome'], { piety: -10, overall: -8 }, 'Corruption visible to Church');
    }
    if (prev < 75 && state.heinrich.corruption >= 75) {
      events.push({ type: 'corruption_milestone', level: 75,
        description: 'Heinrich\'s reputation for ruthlessness has become his calling card. Saints shun him. Predators flock.' });
    }

    return events;
  }

  function decreaseCorruption(state, amount, reason) {
    state.heinrich.corruption = Math.max(0, state.heinrich.corruption - amount);
    if (reason) {
      // Acts of genuine redemption noted in chronicle
      state.chronicle.entries.push({
        type: 'redemption_act',
        turn: state.meta.turn,
        description: reason
      });
    }
  }

  /**
   * Get which NPCs are attracted or repelled by Heinrich's corruption level.
   */
  function getCorruptionNPCEffect(corruptionLevel) {
    if (corruptionLevel >= 75) {
      return {
        attracted: ['assassins', 'thieves', 'corrupt_officials', 'desperate_criminals'],
        repelled: ['priests', 'honest_merchants', 'virtuous_nobles'],
        descriptor: 'aura_of_menace'
      };
    }
    if (corruptionLevel >= 50) {
      return {
        attracted: ['ambitious_criminals', 'morally_flexible_merchants'],
        repelled: ['devout_clergy', 'righteous_knights'],
        descriptor: 'air_of_ruthlessness'
      };
    }
    if (corruptionLevel >= 25) {
      return {
        attracted: [],
        repelled: [],
        descriptor: 'subtle_edge'
      };
    }
    return { attracted: [], repelled: [], descriptor: 'clean' };
  }

  // ─── HEAT SYSTEM (Criminal Exposure) ─────────────────────────────────────

  /**
   * Increase criminal heat (exposure) in current or specified region.
   */
  function increaseHeat(state, amount, region = null) {
    const targetRegion = region || state.map.current_location;

    // Global heat
    state.heinrich.heat = Math.min(100, state.heinrich.heat + amount);

    // Regional heat
    if (!state.heinrich.heat_regions) state.heinrich.heat_regions = {};
    state.heinrich.heat_regions[targetRegion] = Math.min(100,
      (state.heinrich.heat_regions[targetRegion] || 0) + amount);

    const events = [];
    const totalHeat = state.heinrich.heat;

    if (totalHeat >= 80) {
      events.push({ type: 'heat_extreme', description: 'Multiple witnesses. Officials are actively hunting.' });
    } else if (totalHeat >= 60) {
      events.push({ type: 'heat_high', description: 'Your face is known to investigators. Checkpoints ask questions.' });
    } else if (totalHeat >= 40) {
      events.push({ type: 'heat_moderate', description: 'Rumors circulate. Merchants gossip. The church hears things.' });
    }

    return events;
  }

  /**
   * Natural heat decay over time (called from world-tick).
   * Heat fades as witnesses forget, die, or move on.
   */
  function decayHeat(state, turnsElapsed = 1) {
    const decayRate = 0.3; // sous per turn naturally
    state.heinrich.heat = Math.max(0, state.heinrich.heat - (decayRate * turnsElapsed));

    // Regional heat decays faster if Heinrich is not there
    if (state.heinrich.heat_regions) {
      for (const region of Object.keys(state.heinrich.heat_regions)) {
        const isCurrentRegion = region === state.map.current_location;
        const regionDecay = isCurrentRegion ? decayRate * 0.5 : decayRate * 1.5;
        state.heinrich.heat_regions[region] = Math.max(0, state.heinrich.heat_regions[region] - (regionDecay * turnsElapsed));
      }
    }
  }

  // ─── LEGACY SCORE CALCULATION ─────────────────────────────────────────────

  /**
   * Calculate the legacy score — composite measure of Heinrich's impact on history.
   * Updated every turn; displayed in Chronicle view.
   */
  function calculateLegacyScore(state) {
    let score = 0;

    // Class tier contribution
    const classTier = state.heinrich.class_tier || 1;
    score += classTier * 20;

    // Reputation contributions (sum of overall across all known factions)
    const rep = state.heinrich.reputation || {};
    for (const [faction, data] of Object.entries(rep)) {
      if (data.known) score += Math.max(0, (data.overall - 30)) * 0.5;
    }

    // Achievements
    score += (state.chronicle.achievements?.length || 0) * 25;

    // Properties and holdings
    score += (state.properties?.length || 0) * 15;

    // Skills contribution (master-level skills count)
    for (const [skill, data] of Object.entries(state.skills || {})) {
      if (typeof data === 'object' && data.level >= 8) score += 10;
      if (typeof data === 'object' && data.level >= 10) score += 20;
    }

    // Inventions
    score += (state.heinrich.inventions?.introduced?.length || 0) * 50;
    score += (state.heinrich.inventions?.perfected?.length || 0) * 20;

    // Corruption penalty
    score -= state.heinrich.corruption * 0.5;

    // Chronicle entries (each significant event adds to legend)
    score += (state.chronicle.entries?.filter(e => e.significant)?.length || 0) * 5;

    return Math.max(0, Math.round(score));
  }

  /**
   * Get reputation summary for UI display.
   */
  function getReputationSummary(state) {
    const rep = state.heinrich.reputation || {};
    const summary = {};

    for (const [factionId, data] of Object.entries(rep)) {
      if (!data.known) continue;
      const tier = REPUTATION_TIERS.find(t => data.overall >= t.min) || REPUTATION_TIERS[REPUTATION_TIERS.length - 1];
      summary[factionId] = {
        label: FACTIONS[factionId]?.label || factionId,
        overall: data.overall,
        tier: tier.label,
        color: tier.color,
        axes: {
          honor: data.honor,
          ferocity: data.ferocity,
          cunning: data.cunning,
          piety: data.piety,
          generosity: data.generosity
        }
      };
    }

    return summary;
  }

  /**
   * Get the dominant reputation trait across all factions.
   * Used for NPC introduction descriptions.
   */
  function getDominantTrait(state) {
    const rep = state.heinrich.reputation || {};
    const totals = { honor: 0, ferocity: 0, cunning: 0, piety: 0, generosity: 0 };
    let count = 0;

    for (const data of Object.values(rep)) {
      if (!data.known) continue;
      for (const axis of REPUTATION_AXES) {
        totals[axis] += data[axis] || 30;
      }
      count++;
    }

    if (count === 0) return 'unknown';

    let highestAxis = 'honor';
    let highestVal = 0;
    for (const [axis, total] of Object.entries(totals)) {
      if (total / count > highestVal) {
        highestVal = total / count;
        highestAxis = axis;
      }
    }

    const traitLabels = {
      honor: 'honorable', ferocity: 'fearsome', cunning: 'cunning',
      piety: 'pious', generosity: 'generous'
    };

    return traitLabels[highestAxis] || 'known';
  }

  // ─── EXPORTS ──────────────────────────────────────────────────────────────

  return {
    FACTIONS,
    REPUTATION_AXES,
    REPUTATION_TIERS,
    REPUTATION_EVENTS,
    MORAL_COMPASS_LABELS,
    initReputation,
    changeReputation,
    applyReputationEvent,
    shiftMoralCompass,
    getMoralProfile,
    getMoralTendencies,
    increaseCorruption,
    decreaseCorruption,
    getCorruptionNPCEffect,
    increaseHeat,
    decayHeat,
    calculateLegacyScore,
    getReputationSummary,
    getDominantTrait
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ReputationEngine };
}

// END FILE: client/js/engine/reputation-engine.js

// ══════════════════════════════════════════════════
// ✅ PART 4 COMPLETE
// NEXT: PART 5 — World Engine (calendar, weather, economy, rumors, property, migration, cultural, world-tick)
// ══════════════════════════════════════════════════
