// FILE: client/js/engine/military-engine.js — PART 7

'use strict';

/**
 * MILITARY ENGINE — Raising armies, siege warfare, battle resolution,
 * mercenaries, military logistics, and the economics of war.
 */

const MilitaryEngine = (() => {

  // ─── UNIT TYPES ───────────────────────────────────────────────────────────
  const UNIT_TYPES = {
    peasant_levy: {
      id: 'peasant_levy',
      name: 'Peasant Levy',
      cost_to_recruit_sous: 0,
      daily_wage_sous: 1,
      combat_rating: 2,
      morale: 30,
      equipment: ['spear_or_staff', 'no_armor'],
      strengths: ['numbers'],
      weaknesses: ['cavalry', 'trained_infantry', 'prolonged_siege'],
      availability: 'feudal_levy_from_serfs',
      max_turns_available: 40 // Summer levy — returns for harvest
    },
    foot_soldier: {
      id: 'foot_soldier',
      name: 'Foot Soldier',
      cost_to_recruit_sous: 5,
      daily_wage_sous: 4,
      combat_rating: 4,
      morale: 50,
      equipment: ['spear_or_sword', 'padded_armor'],
      availability: 'hire_or_levy_freemen'
    },
    crossbowman: {
      id: 'crossbowman',
      name: 'Crossbowman',
      cost_to_recruit_sous: 10,
      daily_wage_sous: 8,
      combat_rating: 5,
      morale: 55,
      equipment: ['crossbow', 'light_armor'],
      strengths: ['ranged_fire', 'siege_support'],
      weaknesses: ['cavalry_charge', 'reload_time'],
      availability: 'hire_professionals'
    },
    longbowman: {
      id: 'longbowman',
      name: 'English Longbowman',
      cost_to_recruit_sous: 15,
      daily_wage_sous: 8,
      combat_rating: 6,
      morale: 65,
      equipment: ['longbow', 'light_armor'],
      strengths: ['devastating_volleys', 'range'],
      weaknesses: ['very_close_combat'],
      availability: 'rare_specialists',
      nationality_required: 'english_or_welsh'
    },
    mounted_sergeant: {
      id: 'mounted_sergeant',
      name: 'Mounted Sergeant',
      cost_to_recruit_sous: 30,
      daily_wage_sous: 15,
      combat_rating: 7,
      morale: 65,
      equipment: ['sword', 'chainmail', 'horse'],
      availability: 'professional_hire'
    },
    knight_contract: {
      id: 'knight_contract',
      name: 'Knight (Contract)',
      cost_to_recruit_sous: 100,
      daily_wage_sous: 40,
      combat_rating: 10,
      morale: 80,
      equipment: ['full_equipment'],
      availability: 'noble_negotiation_or_hire',
      requires_relationship: 50
    },
    mercenary_company: {
      id: 'mercenary_company',
      name: 'Mercenary Company',
      unit_size: [20, 100],
      cost_per_soldier_sous: 6,
      daily_wage_per_soldier: 6,
      loyalty: 'coin_only',
      combat_rating: 6,
      availability: 'major_towns_and_cities',
      note: 'Experienced but loyal only to pay. Will sell to highest bidder.'
    },
    siege_engineer: {
      id: 'siege_engineer',
      name: 'Siege Engineer',
      cost_to_recruit_sous: 50,
      daily_wage_sous: 12,
      combat_rating: 2,
      specialist: true,
      specialty: 'siege_construction',
      availability: 'rare_specialists'
    }
  };

  // ─── SIEGE MECHANICS ─────────────────────────────────────────────────────
  const SIEGE_TYPES = {
    blockade: {
      name: 'Blockade',
      description: 'Surround and starve. Slow but safe for attackers.',
      attrition_modifier: 0.2,
      risk_to_attackers: 'low',
      garrison_suffers_hunger: true,
      estimated_turns_to_fall: [80, 200]
    },
    assault: {
      name: 'Direct Assault',
      description: 'Storm the walls. Fast but bloody.',
      attrition_modifier: 0.8,
      risk_to_attackers: 'extreme',
      breach_required: false,
      estimated_turns_to_fall: [1, 8]
    },
    mining: {
      name: 'Undermining',
      description: 'Dig under the wall, collapse it.',
      requires_engineer: true,
      attrition_modifier: 0.1,
      risk_to_attackers: 'low_during_mining',
      estimated_turns_to_fall: [30, 80]
    },
    treachery: {
      name: 'Treachery',
      description: 'Find someone inside to open the gate.',
      requires_espionage: true,
      success_chance_base: 0.15,
      no_attrition: true,
      skill_used: 'espionage'
    },
    bombardment: {
      name: 'Cannon Bombardment',
      description: 'Early cannon. Demoralizing but often inaccurate.',
      requires_cannon: true,
      availability: '1403_very_rare',
      morale_damage: 'high',
      wall_damage: 'slow_but_real'
    }
  };

  // ─── ARMY MANAGEMENT ─────────────────────────────────────────────────────

  /**
   * Raise an army for Heinrich.
   * @param {object} units - { unit_type_id: count }
   * @param {object} state - Game state
   */
  function raiseArmy(units, state) {
    const commandLevel = state.skills.command?.level || 0;
    const maxRecruitableWithoutTitle = commandLevel * 5 + 10;

    const armyRecord = {
      id: `army_${Date.now()}`,
      name: `Heinrich\'s Force`,
      units: {},
      total_men: 0,
      daily_cost_sous: 0,
      overall_morale: 0,
      combat_rating: 0,
      created_turn: state.meta.turn,
      location: state.map.current_location,
      commander: 'Heinrich',
      supply_days: 14, // Days of food carried
      status: 'assembled'
    };

    let totalRecruitCost = 0;

    for (const [unitType, count] of Object.entries(units)) {
      const unitDef = UNIT_TYPES[unitType];
      if (!unitDef) continue;

      const recruitCost = (unitDef.cost_to_recruit_sous || 0) * count;
      totalRecruitCost += recruitCost;

      armyRecord.units[unitType] = {
        type: unitType,
        count,
        morale: unitDef.morale,
        daily_cost: unitDef.daily_wage_sous * count
      };

      armyRecord.total_men += count;
      armyRecord.daily_cost_sous += unitDef.daily_wage_sous * count;
      armyRecord.overall_morale = (armyRecord.overall_morale + unitDef.morale) / 2;
    }

    // Leadership bonus
    armyRecord.combat_rating = _calculateArmyCombatRating(armyRecord, commandLevel);

    // Check if Heinrich can lead this many men
    if (armyRecord.total_men > maxRecruitableWithoutTitle) {
      return {
        success: false,
        reason: `Cannot lead ${armyRecord.total_men} men. Command level ${commandLevel} allows ~${maxRecruitableWithoutTitle}. Need Command level ${Math.ceil(armyRecord.total_men / 5)}.`
      };
    }

    // Calculate total cost
    const canAfford = EconomyEngine.canAfford(state.inventory, totalRecruitCost);
    if (!canAfford) {
      return { success: false, reason: `Cannot afford recruitment cost of ${totalRecruitCost} sous.` };
    }

    EconomyEngine.spendMoney(state.inventory, totalRecruitCost);
    state.armies.push(armyRecord);

    return { success: true, army: armyRecord, recruit_cost: totalRecruitCost };
  }

  /**
   * Resolve a battle between two forces.
   * Returns { victor, attacker_losses, defender_losses, duration_turns }
   */
  function resolveBattle(attackingArmy, defendingArmy, state, options = {}) {
    const commandLevel = state.skills.command?.level || 0;
    const tacticsLevel = state.skills.tactics?.level || 0;

    // Heinrich's leadership bonus
    const leadershipBonus = (commandLevel * 3) + (tacticsLevel * 2);

    // Combat rating comparison
    const attackerPower = attackingArmy.combat_rating + leadershipBonus + (options.terrain_bonus || 0);
    const defenderPower = defendingArmy.combat_rating * (options.defender_terrain_bonus || 1.2);

    // Roll outcome
    const attackRoll = DiceEngine.roll('tactics', tacticsLevel, 'medium', [
      { label: 'Leadership', value: leadershipBonus },
      { label: 'Terrain', value: options.terrain_bonus || 0 }
    ], state);

    DiceEngine.applyXP(state.skills, 'tactics', attackRoll.xpAwarded);
    DiceEngine.applyXP(state.skills, 'command', Math.round(attackRoll.xpAwarded * 0.5));

    const powerRatio = attackerPower / Math.max(1, defenderPower);
    const baseVictoryChance = Math.min(0.85, Math.max(0.15, 0.5 * powerRatio));

    const victory = attackRoll.isSuccess ? DiceEngine.chance(baseVictoryChance + 0.1) : DiceEngine.chance(baseVictoryChance - 0.1);

    // Calculate losses
    const baseLoss = victory ? 0.1 : 0.3;
    const attackerLosses = Math.round(attackingArmy.total_men * (baseLoss + (attackRoll.isDisaster ? 0.3 : 0)));
    const defenderLosses = Math.round(defendingArmy.total_men * (victory ? 0.3 : 0.1));

    // Morale impact
    if (victory) {
      attackingArmy.overall_morale = Math.min(100, attackingArmy.overall_morale + 15);
      ReputationEngine.changeReputation(state, ['military', 'normandy_nobility'], {
        ferocity: 12, honor: 8, overall: 15
      }, 'Military victory');
    } else {
      attackingArmy.overall_morale = Math.max(0, attackingArmy.overall_morale - 25);
      attackingArmy.total_men -= attackerLosses;
    }

    defendingArmy.total_men = Math.max(0, defendingArmy.total_men - defenderLosses);

    return {
      victor: victory ? 'Heinrich' : 'Defender',
      heinrich_won: victory,
      attacker_losses: attackerLosses,
      defender_losses: defenderLosses,
      roll: attackRoll,
      narrative_key: victory ? 'battle_victory' : 'battle_defeat'
    };
  }

  /**
   * Process daily army upkeep (called from world-tick).
   */
  function processArmyUpkeep(state) {
    const events = [];

    for (const army of state.armies) {
      const dailyCost = army.daily_cost_sous;
      const paid = EconomyEngine.spendMoney(state.inventory, dailyCost);

      if (!paid) {
        army.overall_morale = Math.max(0, army.overall_morale - 10);
        events.push({
          type: 'army_unpaid',
          army_id: army.id,
          cost_owed: dailyCost,
          morale_loss: 10,
          narrative_key: 'soldiers_unpaid'
        });

        // Risk of desertion
        if (army.overall_morale < 20) {
          const desertion = Math.round(army.total_men * 0.1);
          army.total_men -= desertion;
          events.push({ type: 'desertion', army_id: army.id, deserted: desertion });
        }
      } else {
        army.supply_days--;
        if (army.supply_days <= 3) {
          events.push({ type: 'supply_low', army_id: army.id, days_left: army.supply_days });
        }
      }
    }

    return events;
  }

  /**
   * Disband an army, releasing soldiers.
   */
  function disbandArmy(armyId, state) {
    const idx = state.armies.findIndex(a => a.id === armyId);
    if (idx === -1) return false;
    state.armies.splice(idx, 1);
    return true;
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  function _calculateArmyCombatRating(army, commandLevel) {
    let totalRating = 0;
    let totalMen = 0;

    for (const [unitType, unitData] of Object.entries(army.units)) {
      const def = UNIT_TYPES[unitType];
      if (!def) continue;
      totalRating += (def.combat_rating || 3) * unitData.count;
      totalMen += unitData.count;
    }

    const avgRating = totalMen > 0 ? totalRating / totalMen : 0;
    const commandBonus = commandLevel * 0.1; // +10% per command level
    return Math.round(avgRating * (1 + commandBonus) * totalMen);
  }

  /**
   * Get available unit types for current location.
   */
  function getAvailableUnits(state) {
    const available = [];
    const locationType = state.map.current_location_type;

    for (const [id, unit] of Object.entries(UNIT_TYPES)) {
      if (id === 'longbowman') continue; // Too rare for generic availability
      if (id === 'siege_engineer' && !['city', 'town'].includes(locationType)) continue;

      available.push({ id, ...unit, can_recruit: true });
    }

    return available;
  }

  // ─── EXPORTS ──────────────────────────────────────────────────────────────

  return {
    UNIT_TYPES,
    SIEGE_TYPES,
    raiseArmy,
    resolveBattle,
    processArmyUpkeep,
    disbandArmy,
    getAvailableUnits
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MilitaryEngine };
}

// END FILE: client/js/engine/military-engine.js
