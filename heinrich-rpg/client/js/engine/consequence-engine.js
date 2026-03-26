// FILE: client/js/engine/consequence-engine.js — PART 7

'use strict';

/**
 * CONSEQUENCE ENGINE — Deferred consequence creation, tracking, and resolution.
 * 
 * Actions have consequences that arrive later — days, months, or years later.
 * The engine schedules them and fires them at the right moment.
 * "Your past comes for you. Always."
 */

const ConsequenceEngine = (() => {

  // ─── CONSEQUENCE TEMPLATES ─────────────────────────────────────────────────
  const CONSEQUENCE_TEMPLATES = {

    // VIOLENCE CONSEQUENCES
    killed_someone: {
      id: 'killed_someone',
      variants: {
        witnessed: {
          delay_turns_min: 1,
          delay_turns_max: 20,
          event: 'murder_charge_or_wergild_demand',
          severity: 'high',
          can_mitigate: true,
          mitigation: ['flee_region', 'bribe_witness', 'deny_convincingly']
        },
        unwitnessed: {
          delay_turns_min: 20,
          delay_turns_max: 200,
          event: 'body_found_investigation',
          severity: 'medium',
          can_mitigate: true,
          mitigation: ['dispose_of_body', 'plant_false_evidence']
        },
        victim_had_family: {
          delay_turns_min: 5,
          delay_turns_max: 40,
          event: 'family_seeks_revenge',
          severity: 'very_high',
          repeat_capable: true,
          description: 'The dead man\'s sons do not forget.'
        }
      }
    },

    seduced_noblemans_wife: {
      delay_turns_min: 10,
      delay_turns_max: 80,
      event: 'husband_discovers_seeks_vengeance',
      severity: 'extreme',
      description: 'Cuckoldry of a noble is among the most dangerous of sins.',
      possible_outcomes: ['duel_demand', 'assassination_attempt', 'legal_action', 'discovered_scandal_ruins_reputation']
    },

    broke_oath_sworn_on_relic: {
      delay_turns_min: 0,
      delay_turns_max: 5,
      event: 'church_hears_of_broken_oath',
      severity: 'very_high',
      reputation_faction: 'church_normandy',
      description: 'Oath-breaking before God is not forgiven easily.'
    },

    cheated_merchant: {
      delay_turns_min: 5,
      delay_turns_max: 30,
      event: 'merchant_exposes_fraud',
      severity: 'medium',
      description: 'Merchants have long memories and wide networks.'
    },

    made_powerful_enemy: {
      delay_turns_min: 20,
      delay_turns_max: 300,
      event: 'enemy_strikes_when_advantageous',
      severity_variable: true,
      description: 'A powerful enemy waits for weakness.'
    },

    debt_unpaid: {
      delay_turns_min: 40,
      delay_turns_max: 80,
      event: 'debt_collectors_arrive',
      severity: 'medium',
      escalation: 'legal_action_then_prison',
      description: 'Interest accumulates. Patience does not.'
    },

    abandoned_someone: {
      delay_turns_min: 30,
      delay_turns_max: 200,
      event: 'abandoned_person_resurfaces_transformed',
      severity: 'variable',
      description: 'The person you left behind had time to think about it.'
    },

    heroic_act_witnessed: {
      delay_turns_min: 5,
      delay_turns_max: 40,
      event: 'reputation_spreads_opportunities_open',
      positive: true,
      severity: 'positive',
      description: 'Word of a great deed travels faster than a man.'
    },

    helped_lord_in_crisis: {
      delay_turns_min: 10,
      delay_turns_max: 100,
      event: 'lord_rewards_when_able',
      positive: true,
      severity: 'positive',
      description: 'Lords have long memories for useful men — and useless ones.'
    },

    invented_something: {
      delay_turns_min: 20,
      delay_turns_max: 200,
      event: 'invention_attracts_interest_or_opposition',
      severity: 'variable',
      description: 'New things disturb the old order.',
      outcomes: {
        positive: ['noble_patronage', 'scholars_seek_Heinrich', 'commercial_opportunity'],
        negative: ['guild_hostility', 'church_investigation', 'competitor_theft']
      }
    },

    plague_introduced: {
      delay_turns_min: 3,
      delay_turns_max: 8,
      event: 'disease_spreads_in_settlement',
      severity: 'catastrophic',
      description: 'Disease needs only one carrier.'
    },

    let_prisoner_go: {
      delay_turns_min: 20,
      delay_turns_max: 150,
      event: 'released_prisoner_acts',
      severity: 'variable',
      description: 'The man you freed — did he remember it as mercy or weakness?',
      outcomes_based_on: 'npc_archetype'
    }
  };

  // ─── CREATE CONSEQUENCE ───────────────────────────────────────────────────

  /**
   * Schedule a consequence to fire in the future.
   * @param {string} templateId - ID from CONSEQUENCE_TEMPLATES
   * @param {object} context - { npc_id, location, variant, custom_description }
   * @param {object} state - Game state
   */
  function scheduleConsequence(templateId, context, state) {
    const template = CONSEQUENCE_TEMPLATES[templateId];
    if (!template) return null;

    // Calculate when this consequence fires
    const minDelay = template.delay_turns_min || 5;
    const maxDelay = template.delay_turns_max || 50;
    const delayTurns = DiceEngine.randInt(minDelay, maxDelay);
    const triggerTurn = state.meta.turn + delayTurns;

    const consequence = {
      id: `consequence_${templateId}_${Date.now()}`,
      template_id: templateId,
      trigger_turn: triggerTurn,
      fired: false,
      positive: template.positive || false,
      severity: template.severity || 'medium',
      name: context.name || templateId,
      description: context.custom_description || template.description || '',
      npc_id: context.npc_id || null,
      location: context.location || state.map.current_location,
      effects: context.effects || {},
      can_mitigate: template.can_mitigate || false,
      mitigation_options: template.mitigation || [],
      context: { ...context },
      created_turn: state.meta.turn
    };

    state.consequences.active.push(consequence);
    state.consequences.permanent_ledger.push({
      consequence_id: consequence.id,
      template_id: templateId,
      created_turn: state.meta.turn,
      trigger_turn: triggerTurn
    });

    return consequence;
  }

  /**
   * Create a custom consequence (not from template).
   */
  function scheduleCustomConsequence(name, description, delayTurns, effects, state) {
    const consequence = {
      id: `consequence_custom_${Date.now()}`,
      template_id: 'custom',
      trigger_turn: state.meta.turn + delayTurns,
      fired: false,
      positive: effects.positive || false,
      severity: effects.severity || 'medium',
      name,
      description,
      npc_id: effects.npc_id || null,
      location: effects.location || state.map.current_location,
      effects,
      can_mitigate: effects.can_mitigate || false,
      mitigation_options: effects.mitigation || [],
      created_turn: state.meta.turn
    };

    state.consequences.active.push(consequence);
    return consequence;
  }

  /**
   * Attempt to mitigate (reduce or eliminate) an active consequence.
   */
  function attemptMitigation(consequenceId, mitigationMethod, state) {
    const consequence = state.consequences.active.find(c => c.id === consequenceId);
    if (!consequence || !consequence.can_mitigate) {
      return { success: false, reason: 'Cannot be mitigated' };
    }

    if (!consequence.mitigation_options.includes(mitigationMethod)) {
      return { success: false, reason: 'That approach won\'t work for this consequence' };
    }

    const mitigationSkill = _getMitigationSkill(mitigationMethod);
    const skillLevel = state.skills[mitigationSkill]?.level || 0;

    const roll = DiceEngine.roll(mitigationSkill, skillLevel, 'high', [], state);
    DiceEngine.applyXP(state.skills, mitigationSkill, roll.xpAwarded);

    if (roll.isSuccess) {
      if (roll.isCritical) {
        // Fully eliminated
        state.consequences.active = state.consequences.active.filter(c => c.id !== consequenceId);
        state.consequences.resolved.push({ ...consequence, resolved_by: mitigationMethod, fully_resolved: true });
        return { success: true, fully_resolved: true, roll };
      } else {
        // Delayed or reduced
        consequence.trigger_turn += DiceEngine.randInt(20, 60);
        consequence.severity = _reduceSeverity(consequence.severity);
        return { success: true, fully_resolved: false, delayed: true, roll };
      }
    }

    return { success: false, roll, reason: 'Mitigation attempt failed — may have made things worse' };
  }

  /**
   * Get all active consequences sorted by urgency.
   */
  function getActiveConsequencesByUrgency(state) {
    const now = state.meta.turn;
    return (state.consequences.active || [])
      .map(c => ({
        ...c,
        turns_until_trigger: c.trigger_turn - now,
        urgency: _calculateUrgency(c, now)
      }))
      .sort((a, b) => a.turns_until_trigger - b.turns_until_trigger);
  }

  /**
   * Build a permanent consequence ledger for the "What have you done?" view.
   */
  function getPermanentLedger(state) {
    const ledger = state.consequences.permanent_ledger || [];
    return ledger.map(entry => {
      const active = state.consequences.active.find(c => c.id === entry.consequence_id);
      const resolved = state.consequences.resolved.find(c => c.id === entry.consequence_id);
      return {
        ...entry,
        status: active ? 'pending' : resolved ? 'resolved' : 'fired',
        description: (active || resolved || {}).description || ''
      };
    });
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

  function _getMitigationSkill(method) {
    const map = {
      flee_region: 'survival',
      bribe_witness: 'haggle',
      deny_convincingly: 'deception',
      dispose_of_body: 'stealth',
      plant_false_evidence: 'deception',
      legal_defense: 'law'
    };
    return map[method] || 'speech';
  }

  function _reduceSeverity(current) {
    const order = ['catastrophic', 'extreme', 'very_high', 'high', 'medium', 'low', 'minimal'];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : current;
  }

  function _calculateUrgency(consequence, now) {
    const turns = consequence.trigger_turn - now;
    if (turns <= 0) return 'imminent';
    if (turns <= 8) return 'urgent_today';
    if (turns <= 40) return 'urgent_soon';
    if (turns <= 200) return 'medium_term';
    return 'distant';
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    CONSEQUENCE_TEMPLATES,
    scheduleConsequence,
    scheduleCustomConsequence,
    attemptMitigation,
    getActiveConsequencesByUrgency,
    getPermanentLedger
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConsequenceEngine };
}

// END FILE: client/js/engine/consequence-engine.js
