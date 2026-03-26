// FILE: client/js/engine/dynasty-engine.js — PART 6

'use strict';

/**
 * DYNASTY ENGINE — Marriage, children, dynasty building, inheritance,
 * lineage tracking, and the political use of family connections.
 */

const DynastyEngine = (() => {

  // ─── MARRIAGE SYSTEM ──────────────────────────────────────────────────────

  /**
   * Evaluate potential marriage matches for Heinrich.
   * @returns {Array} list of match assessments
   */
  function evaluateMarriageMatch(candidateNPC, state) {
    const h = state.heinrich;
    const rel = state.npc_relationships[candidateNPC.id] || { favorability: 0 };

    const assessment = {
      candidate_id: candidateNPC.id,
      candidate_name: candidateNPC.name,
      candidate_class: candidateNPC.class,
      political_benefit: _assessPoliticalBenefit(candidateNPC, h),
      economic_benefit: _assessEconomicBenefit(candidateNPC, h),
      romantic_potential: _assessRomanticPotential(candidateNPC, h, rel),
      family_objections: _checkFamilyObjections(candidateNPC, h),
      church_obstacles: _checkChurchObstacles(candidateNPC, h, state),
      dowry_or_bride_price: _calculateDownry(candidateNPC, h),
      overall_score: 0
    };

    // Calculate overall marriage value
    assessment.overall_score = (
      assessment.political_benefit * 0.3 +
      assessment.economic_benefit * 0.2 +
      assessment.romantic_potential * 0.3 +
      (assessment.family_objections === 'none' ? 20 : -10) +
      (assessment.church_obstacles === 'none' ? 10 : -20)
    );

    return assessment;
  }

  /**
   * Perform a marriage ceremony.
   */
  function conductMarriage(npcId, state, options = {}) {
    const npc = state.npcs.active[npcId];
    if (!npc) return { success: false, reason: 'NPC not found' };

    const marriage = {
      id: `marriage_${Date.now()}`,
      spouse_id: npcId,
      spouse_name: npc.name,
      spouse_class: npc.class,
      date: { ...state.calendar.date },
      turn: state.meta.turn,
      type: options.type || 'church_marriage',
      location: state.map.current_location,
      dowry_received_sous: options.dowry || 0,
      bride_price_paid_sous: options.bride_price || 0,
      political_alliance: options.political_alliance || null,
      witnesses: options.witnesses || [],
      quality: options.ceremony_quality || 'simple', // simple, modest, grand
      children: []
    };

    state.dynasty.marriages.push(marriage);

    // Apply dowry
    if (marriage.dowry_received_sous > 0) {
      EconomyEngine.receiveMoney(state.inventory, marriage.dowry_received_sous);
    }
    if (marriage.bride_price_paid_sous > 0) {
      EconomyEngine.spendMoney(state.inventory, marriage.bride_price_paid_sous);
    }

    // Reputation effects
    ReputationEngine.changeReputation(state, ['normandy_peasants', 'church_normandy'], {
      honor: 5, piety: 3, overall: 8
    }, 'Married properly in the Church');

    if (npc.class >= 'petty_noble') {
      ReputationEngine.changeReputation(state, ['normandy_nobility'], {
        honor: 10, overall: 12
      }, 'Alliance marriage with noble family');
    }

    // Chronicle entry
    state.chronicle.entries.push({
      type: 'marriage',
      turn: state.meta.turn,
      description: `Heinrich married ${npc.name}`,
      significant: true
    });

    return { success: true, marriage };
  }

  // ─── CHILDREN SYSTEM ──────────────────────────────────────────────────────

  /**
   * Attempt to conceive a child (called periodically for married Heinrich).
   */
  function attemptConception(marriageId, state) {
    const marriage = state.dynasty.marriages.find(m => m.id === marriageId);
    if (!marriage) return null;

    // Probability based on age and health
    const h = state.heinrich;
    const age = h.age;
    let conceptionChance = 0.05; // 5% per turn-couple

    if (age > 40) conceptionChance *= 0.7; // fertility declines
    if (h.health.hunger_value < 40) conceptionChance *= 0.5; // malnutrition affects fertility
    if (h.health.disease) conceptionChance *= 0.3; // disease reduces fertility

    if (!DiceEngine.chance(conceptionChance)) return null;

    // Child conceived
    const child = _generateChild(marriage, h, state);
    marriage.children.push(child.id);
    state.dynasty.children.push(child);

    state.chronicle.entries.push({
      type: 'child_born',
      turn: state.meta.turn,
      description: `${child.name} born to Heinrich and ${marriage.spouse_name}`,
      significant: true
    });

    return child;
  }

  function _generateChild(marriage, h, state) {
    const sex = DiceEngine.chance(0.5) ? 'male' : 'female';
    const name = _generateChildName(sex, marriage);

    const child = {
      id: `child_${Date.now()}`,
      name,
      sex,
      birth_date: { ...state.calendar.date },
      birth_turn: state.meta.turn,
      mother_id: marriage.spouse_id,
      legitimate: true,
      alive: true,
      age: 0,
      attributes: _generateChildAttributes(h),
      traits: _generateChildTraits(h, state),
      heir_potential: sex === 'male' ? 'primary' : 'secondary'
    };

    return child;
  }

  function _generateChildName(sex, marriage) {
    const maleNames = ['Jean', 'Pierre', 'Henri', 'Guillaume', 'Robert', 'Michel', 'François', 'Louis'];
    const femaleNames = ['Marie', 'Anne', 'Isabelle', 'Marguerite', 'Catherine', 'Jeanne', 'Élisabeth'];
    const pool = sex === 'male' ? maleNames : femaleNames;
    return pool[DiceEngine.randInt(0, pool.length - 1)];
  }

  function _generateChildAttributes(h) {
    // Children inherit some parental attributes
    return {
      physical_potential: Math.max(1, Math.min(10, Math.round((h.skills.strength?.level || 3) * 0.5 + DiceEngine.randInt(1, 5)))),
      mental_potential: Math.max(1, Math.min(10, DiceEngine.randInt(2, 7))),
      social_potential: Math.max(1, Math.min(10, Math.round((h.skills.speech?.level || 2) * 0.3 + DiceEngine.randInt(2, 6))))
    };
  }

  function _generateChildTraits(h, state) {
    const traits = [];
    if ((h.moral_compass?.loyalty || 50) > 70) {
      if (DiceEngine.chance(0.3)) traits.push('loyal');
    }
    if ((h.skills.strength?.level || 0) >= 6) {
      if (DiceEngine.chance(0.4)) traits.push('strong_constitution');
    }
    if (state.heinrich.corruption > 50) {
      if (DiceEngine.chance(0.2)) traits.push('troubled');
    }
    return traits;
  }

  // ─── HEIR MANAGEMENT ──────────────────────────────────────────────────────

  /**
   * Set or update the designated heir.
   */
  function designateHeir(childId, state) {
    const child = state.dynasty.children.find(c => c.id === childId);
    if (!child || !child.alive) return false;

    state.dynasty.heir_designated = childId;
    state.chronicle.entries.push({
      type: 'heir_designated',
      turn: state.meta.turn,
      description: `${child.name} designated as Heinrich's heir`
    });

    return true;
  }

  /**
   * Process children aging and development (called yearly).
   */
  function processChildAging(state) {
    const events = [];

    for (const child of state.dynasty.children) {
      if (!child.alive) continue;
      child.age++;

      // Milestone ages
      if (child.age === 7) {
        events.push({ type: 'child_milestone', child_id: child.id, milestone: 'age_of_reason', name: child.name });
      }
      if (child.age === 14) {
        events.push({ type: 'child_milestone', child_id: child.id, milestone: 'adolescence_apprenticeship_age', name: child.name });
        // Child can begin training in skills
        child.training_started = true;
      }
      if (child.age === 16) {
        events.push({ type: 'child_milestone', child_id: child.id, milestone: 'marriage_eligible', name: child.name });
      }
      if (child.age === 18) {
        events.push({ type: 'child_milestone', child_id: child.id, milestone: 'adult', name: child.name });
        child.adult = true;
      }

      // Mortality risk (medieval infant and child mortality was high)
      if (child.age < 5 && DiceEngine.chance(0.02)) {
        child.alive = false;
        events.push({ type: 'child_death', child_id: child.id, name: child.name, age: child.age, cause: 'childhood_illness' });
        HealthEngine.applyTrauma(state.heinrich, 8, 'loved_one_died', state.meta.turn);
      }
    }

    return events;
  }

  // ─── DYNASTIC OPPORTUNITY ASSESSMENT ─────────────────────────────────────

  /**
   * Assess what dynastic moves are currently possible.
   */
  function assessDynasticOpportunities(state) {
    const opportunities = [];
    const h = state.heinrich;
    const classTier = h.class_tier || 1;

    // Marriage opportunity
    if (state.dynasty.marriages.length === 0 && h.age < 50) {
      opportunities.push({
        type: 'marriage_opportunity',
        urgency: h.age > 35 ? 'high' : 'medium',
        description: 'Heinrich is unmarried. A strategic marriage could accelerate his rise significantly.'
      });
    }

    // Heir needed
    if (classTier >= 5 && state.dynasty.children.filter(c => c.alive && c.sex === 'male').length === 0) {
      opportunities.push({
        type: 'heir_needed',
        urgency: h.age > 40 ? 'critical' : 'medium',
        description: 'No male heir. Without one, any holdings revert to the lord upon death.'
      });
    }

    // Child training
    const trainingAgeChildren = state.dynasty.children.filter(c => c.alive && c.age >= 8 && c.age <= 16);
    if (trainingAgeChildren.length > 0) {
      opportunities.push({
        type: 'child_education',
        urgency: 'low',
        description: `${trainingAgeChildren.length} child(ren) of training age. Investment now shapes their future capabilities.`
      });
    }

    return opportunities;
  }

  // ─── PRIVATE HELPERS ─────────────────────────────────────────────────────

  function _assessPoliticalBenefit(candidate, h) {
    const candidateClassTierMap = { serf: 1, freeman: 2, yeoman: 3, burgher: 4, petty_noble: 5, knight: 6, minor_lord: 7 };
    const candidateTier = candidateClassTierMap[candidate.class] || 2;
    const h_tier = candidateClassTierMap[h.class] || 1;
    const tierBoost = (candidateTier - h_tier) * 10; // Marrying up = more political benefit
    return Math.max(0, Math.min(100, 30 + tierBoost));
  }

  function _assessEconomicBenefit(candidate, h) {
    const wealthMap = { destitute: 0, poor: 10, struggling: 20, comfortable: 40, wealthy: 60, rich: 80 };
    return wealthMap[candidate.wealth] || 20;
  }

  function _assessRomanticPotential(candidate, h, rel) {
    return Math.max(0, Math.min(100, (rel.favorability || 0) + 25));
  }

  function _checkFamilyObjections(candidate, h) {
    // Serf marrying a noble's daughter = very high family objections
    if (h.class === 'serf' && ['petty_noble', 'knight', 'minor_lord'].includes(candidate.class)) {
      return 'severe';
    }
    return 'none';
  }

  function _checkChurchObstacles(candidate, h, state) {
    // Consanguinity check (simplified)
    return 'none';
  }

  function _calculateDownry(candidate, h) {
    if (candidate.sex === 'female') {
      // Dowry from bride's family to groom
      const wealthMap = { poor: 5, struggling: 15, comfortable: 40, wealthy: 100, rich: 300 };
      return { direction: 'to_heinrich', amount_sous: wealthMap[candidate.wealth] || 15 };
    } else {
      // Bride price from groom to bride's family
      return { direction: 'heinrich_pays', amount_sous: 20 };
    }
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    evaluateMarriageMatch,
    conductMarriage,
    attemptConception,
    designateHeir,
    processChildAging,
    assessDynasticOpportunities
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DynastyEngine };
}

// END FILE: client/js/engine/dynasty-engine.js

// ══════════════════════════════════════════════════
// ✅ PART 6 COMPLETE
// NEXT: PART 7 — Advanced Engine Modules (consequence, crafting, animals, military, naval)
// ══════════════════════════════════════════════════
