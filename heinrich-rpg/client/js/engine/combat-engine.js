// FILE: client/js/engine/combat-engine.js — PART 4

'use strict';

/**
 * COMBAT ENGINE — Turn-by-turn combat resolution with stances, momentum, 
 * wound specificity, weapon damage, duel system, and combat state management.
 */

const CombatEngine = (() => {

  // ─── COMBAT STANCES ───────────────────────────────────────────────────────
  const STANCES = {
    aggressive: {
      id: 'aggressive',
      name: 'Aggressive',
      attack_bonus: 15,
      defense_penalty: -20,
      momentum_gain_on_hit: 3,
      description: 'All out attack. Hit harder, get hit harder.'
    },
    reckless: {
      id: 'reckless',
      name: 'Reckless',
      attack_bonus: 25,
      defense_penalty: -35,
      momentum_gain_on_hit: 5,
      cannot_dodge: true,
      description: 'Suicidal attack. For desperados and berserkers.'
    },
    balanced: {
      id: 'balanced',
      name: 'Balanced',
      attack_bonus: 0,
      defense_penalty: 0,
      momentum_gain_on_hit: 1,
      description: 'Standard fighting form. No special bonuses or penalties.'
    },
    defensive: {
      id: 'defensive',
      name: 'Defensive',
      attack_bonus: -15,
      defense_penalty: 20,
      can_counterattack: true,
      description: 'Prioritize survival. Try to find an opening.'
    },
    evasive: {
      id: 'evasive',
      name: 'Evasive',
      attack_bonus: -25,
      defense_penalty: 30,
      can_disengage_easier: true,
      flee_bonus: 20,
      description: 'Avoid all engagement. Survive and escape.'
    }
  };

  // ─── WEAPON DAMAGE PROFILES ─────────────────────────────────────────────
  const WEAPON_DAMAGE = {
    // Base damage range, damage type, wound effects
    unarmed:        { min: 1, max: 4, type: 'blunt', bleed: 0, stun: 0.3, location_spread: 'general' },
    hunting_knife:  { min: 2, max: 6, type: 'slash_pierce', bleed: 0.4, stun: 0.0 },
    dagger:         { min: 3, max: 8, type: 'pierce', bleed: 0.5, stun: 0.0 },
    hand_axe:       { min: 5, max: 12, type: 'slash', bleed: 0.6, stun: 0.1 },
    great_axe:      { min: 8, max: 18, type: 'slash', bleed: 0.7, stun: 0.2 },
    short_sword:    { min: 4, max: 10, type: 'slash_pierce', bleed: 0.5, stun: 0.0 },
    longsword:      { min: 6, max: 14, type: 'slash_pierce', bleed: 0.5, stun: 0.1 },
    spear:          { min: 5, max: 12, type: 'pierce', bleed: 0.6, stun: 0.0, reach_bonus: 10 },
    halberd:        { min: 8, max: 16, type: 'slash_pierce', bleed: 0.6, stun: 0.2, reach_bonus: 10 },
    staff:          { min: 3, max: 9, type: 'blunt', bleed: 0.0, stun: 0.4 },
    shortbow:       { min: 3, max: 9, type: 'pierce', bleed: 0.5, stun: 0.0, ranged: true },
    longbow:        { min: 5, max: 14, type: 'pierce', bleed: 0.6, stun: 0.0, ranged: true },
    crossbow:       { min: 8, max: 18, type: 'pierce', bleed: 0.6, stun: 0.2, ranged: true },
    improvised:     { min: 1, max: 5, type: 'blunt', bleed: 0.1, stun: 0.2 }
  };

  // ─── HIT LOCATION TABLE ─────────────────────────────────────────────────
  const HIT_LOCATIONS = [
    { location: 'head',      probability: 0.10, severity_multiplier: 2.0, special: 'stun_risk' },
    { location: 'torso',     probability: 0.40, severity_multiplier: 1.5, special: 'vital_hit_risk' },
    { location: 'right_arm', probability: 0.15, severity_multiplier: 1.0, special: 'weapon_drop_risk' },
    { location: 'left_arm',  probability: 0.15, severity_multiplier: 1.0, special: 'shield_arm' },
    { location: 'right_leg', probability: 0.10, severity_multiplier: 1.0, special: 'slow_risk' },
    { location: 'left_leg',  probability: 0.10, severity_multiplier: 1.0, special: 'slow_risk' }
  ];

  // ─── WOUND SEVERITY THRESHOLDS ───────────────────────────────────────────
  const WOUND_SEVERITY = {
    scratch:  { max_damage: 3,  label: 'Scratch',       hp_cost: 2,  healing_days: 2,  infection_risk: 0.02 },
    light:    { max_damage: 8,  label: 'Light Wound',   hp_cost: 8,  healing_days: 7,  infection_risk: 0.05 },
    moderate: { max_damage: 15, label: 'Moderate Wound',hp_cost: 18, healing_days: 21, infection_risk: 0.15 },
    severe:   { max_damage: 25, label: 'Severe Wound',  hp_cost: 30, healing_days: 42, infection_risk: 0.30 },
    critical: { max_damage: Infinity, label: 'Critical Wound', hp_cost: 50, healing_days: 90, infection_risk: 0.50, death_risk: 0.3 }
  };

  // ─── ARMOR PROTECTION ───────────────────────────────────────────────────
  const ARMOR_PROTECTION = {
    none:               { value: 0, encumbrance: 0 },
    padded:             { value: 3, encumbrance: 2 },
    leather:            { value: 5, encumbrance: 4 },
    chainmail:          { value: 10, encumbrance: 8 },
    chainmail_plate:    { value: 14, encumbrance: 12 },
    full_plate:         { value: 18, encumbrance: 20 },
    shield_wooden:      { value: 5, encumbrance: 5, only_one_side: true },
    shield_iron:        { value: 8, encumbrance: 7, only_one_side: true }
  };

  // ─── COMBAT STATE MANAGEMENT ─────────────────────────────────────────────

  /**
   * Initialize a combat encounter.
   * @returns {CombatState} object that persists across turns
   */
  function initCombat(state, opponents) {
    const heinrichSkill = _getPrimaryWeaponSkillLevel(state);
    state.heinrich.combat.in_combat = true;
    state.heinrich.combat.momentum = 0;
    state.heinrich.combat.confidence = _calculateInitialConfidence(state, opponents);
    state.heinrich.combat.stance = 'balanced';

    const combatState = {
      id: `combat_${Date.now()}`,
      turn: 0,
      heinrich: {
        hp: state.heinrich.health.hp_current,
        hp_max: state.heinrich.health.hp_max,
        stance: 'balanced',
        momentum: 0,
        weapon: _getEquippedWeapon(state.inventory.equipped),
        weapon_skill: heinrichSkill,
        armor: _getArmorValue(state.inventory.equipped),
        is_mounted: !!state.animals.horse
      },
      opponents: opponents.map((opp, i) => ({
        id: opp.id || `opp_${i}`,
        name: opp.name || 'Opponent',
        hp: opp.hp || 40,
        hp_max: opp.hp || 40,
        weapon_skill: opp.weapon_skill || 3,
        weapon: opp.weapon || 'unarmed',
        armor: opp.armor || 0,
        stance: opp.stance || 'balanced',
        momentum: 0,
        morale: opp.morale || 70,
        is_flanking: false
      })),
      log: [], // { turn, attacker, defender, action, result, narrative_key }
      finished: false,
      victor: null,
      fled: false
    };

    return combatState;
  }

  /**
   * Resolve a single combat action.
   * @param {object} combatState - Current combat state
   * @param {string} action - 'attack'|'defend'|'flee'|'special'|'change_stance'
   * @param {object} options - { target_id, stance, special_type }
   * @param {object} heinrichSkills - Full skills object
   * @param {object} globalState - Full game state
   * @returns {ActionResult}
   */
  function resolveCombatAction(combatState, action, options = {}, heinrichSkills, globalState) {
    const h = combatState.heinrich;
    const results = [];

    if (action === 'change_stance') {
      const oldStance = h.stance;
      h.stance = options.stance || 'balanced';
      return [{
        type: 'stance_change',
        from: oldStance,
        to: h.stance,
        narrative_key: 'stance_shift'
      }];
    }

    if (action === 'flee') {
      return _attemptFlee(combatState, heinrichSkills, globalState);
    }

    // Default: attack the specified target (or first opponent)
    const targetId = options.target_id || combatState.opponents[0]?.id;
    const target = combatState.opponents.find(o => o.id === targetId);
    if (!target || target.hp <= 0) {
      return [{ type: 'no_target' }];
    }

    // Heinrich attacks the target
    const heinrichAttack = _resolveAttack(h, target, action, heinrichSkills, globalState);
    results.push({ attacker: 'heinrich', ...heinrichAttack });

    // Target counterattacks (if alive and not stunned)
    if (target.hp > 0 && !heinrichAttack.target_stunned) {
      for (const opp of combatState.opponents.filter(o => o.hp > 0)) {
        const oppAttack = _resolveOpponentAttack(opp, h, heinrichSkills, globalState);
        results.push({ attacker: opp.id, ...oppAttack });
        // Apply damage to Heinrich
        if (oppAttack.hit) {
          const hpLost = Math.max(0, oppAttack.damage - h.armor);
          h.hp -= hpLost;
          // Apply wound to game state
          if (hpLost > 0 && globalState) {
            _applyWoundToState(globalState, oppAttack.location, hpLost);
          }
        }
        if (h.hp <= 0) break; // Heinrich is down
      }
    }

    // Update momentum
    if (heinrichAttack.hit) h.momentum = Math.min(10, h.momentum + STANCES[h.stance].momentum_gain_on_hit);
    else h.momentum = Math.max(-10, h.momentum - 1);

    // Check morale of opponents
    combatState.opponents.forEach(opp => {
      if (opp.hp < opp.hp_max * 0.3) opp.morale -= 15;
      if (opp.morale <= 0) opp.routing = true;
    });

    // Check combat end conditions
    const aliveOpponents = combatState.opponents.filter(o => o.hp > 0 && !o.routing);
    if (aliveOpponents.length === 0) {
      combatState.finished = true;
      combatState.victor = 'heinrich';
    }
    if (h.hp <= 0) {
      combatState.finished = true;
      combatState.victor = 'opponents';
    }

    combatState.turn++;
    combatState.log.push({ turn: combatState.turn, results });

    return results;
  }

  function _resolveAttack(attacker, target, action, heinrichSkills, globalState) {
    const stance = STANCES[attacker.stance] || STANCES.balanced;
    const weaponSkill = attacker.weapon_skill;
    const weaponData = WEAPON_DAMAGE[attacker.weapon] || WEAPON_DAMAGE.unarmed;

    // Determine attack skill name for dice roll
    const attackSkillName = _weaponToSkill(attacker.weapon);

    // Build situational mods
    const mods = [
      { label: 'Stance', value: stance.attack_bonus },
      { label: 'Momentum', value: attacker.momentum * 2 }
    ];

    if (action === 'special') mods.push({ label: 'Special Attack', value: -10 });

    // Roll attack
    const attackRoll = DiceEngine.roll(attackSkillName, weaponSkill, 'medium', mods, globalState);

    if (!attackRoll.isSuccess) {
      return { hit: false, roll: attackRoll, narrative_key: attackRoll.tier };
    }

    // Determine hit location
    const location = _rollHitLocation();

    // Calculate raw damage
    const momentumBonus = Math.max(0, attacker.momentum) * 0.5;
    const rawDamage = DiceEngine.randInt(weaponData.min, weaponData.max);
    const critMultiplier = attackRoll.isCritical ? 1.5 : 1.0;
    const totalDamage = Math.round((rawDamage + momentumBonus) * critMultiplier);

    // Apply target armor
    const armorProtection = target.armor || 0;
    const finalDamage = Math.max(0, totalDamage - armorProtection);

    // Determine wound severity
    const severity = _damageToSeverity(finalDamage);

    // Determine special effects
    const stunned = DiceEngine.chance(weaponData.stun) && location === 'head';
    const bleeding = DiceEngine.chance(weaponData.bleed) && finalDamage > 3;
    const weaponDropped = location === 'right_arm' && severity === 'severe';

    // Apply damage
    target.hp -= finalDamage;

    return {
      hit: true,
      roll: attackRoll,
      location,
      raw_damage: rawDamage,
      final_damage: finalDamage,
      armor_absorbed: armorProtection,
      severity,
      bleeding,
      target_stunned: stunned,
      weapon_dropped: weaponDropped,
      is_critical: attackRoll.isCritical,
      narrative_key: attackRoll.isCritical ? 'critical_hit' : 'hit'
    };
  }

  function _resolveOpponentAttack(opp, heinrichData, heinrichSkills, globalState) {
    const weaponData = WEAPON_DAMAGE[opp.weapon] || WEAPON_DAMAGE.unarmed;
    const mods = [
      { label: 'Stance', value: STANCES[opp.stance]?.attack_bonus || 0 },
      { label: 'Opponent Momentum', value: opp.momentum * 2 }
    ];

    // Heinrich's defense
    const heinrichDefenseSkill = _getDefenseSkillLevel(heinrichSkills, heinrichData);
    const defenseRoll = DiceEngine.roll('agility', heinrichDefenseSkill.dodge, 'medium', [
      { label: 'Stance Defense', value: STANCES[heinrichData.stance]?.defense_penalty || 0 }
    ], globalState);

    // Simple: if defense succeeds, attack misses
    if (defenseRoll.isSuccess) {
      return { hit: false, roll: defenseRoll, narrative_key: 'dodge' };
    }

    // Attack hits
    const location = _rollHitLocation();
    const rawDamage = DiceEngine.randInt(weaponData.min, weaponData.max);
    const finalDamage = Math.max(0, rawDamage - (heinrichData.armor || 0));
    const severity = _damageToSeverity(finalDamage);
    const bleeding = DiceEngine.chance(weaponData.bleed) && finalDamage > 3;

    return {
      hit: true,
      roll: defenseRoll,
      location,
      damage: finalDamage,
      severity,
      bleeding,
      narrative_key: 'hit_heinrich'
    };
  }

  function _attemptFlee(combatState, heinrichSkills, globalState) {
    const agilityLevel = heinrichSkills.agility?.level || 0;
    const stanceBonus = STANCES[combatState.heinrich.stance]?.flee_bonus || 0;
    const mods = [{ label: 'Stance', value: stanceBonus }];

    // More opponents = harder to flee
    const aliveOpponents = combatState.opponents.filter(o => o.hp > 0);
    if (aliveOpponents.length > 2) mods.push({ label: 'Surrounded', value: -20 });

    const fleeRoll = DiceEngine.roll('agility', agilityLevel, 'medium', mods, globalState);

    if (fleeRoll.isSuccess) {
      combatState.finished = true;
      combatState.fled = true;
      return [{
        type: 'flee_success',
        roll: fleeRoll,
        narrative_key: 'fled'
      }];
    } else {
      // Failed to flee — take an attack of opportunity
      const oppAttack = _resolveOpponentAttack(
        combatState.opponents[0],
        combatState.heinrich,
        heinrichSkills,
        globalState
      );
      return [{
        type: 'flee_failed',
        roll: fleeRoll,
        opportunity_attack: oppAttack,
        narrative_key: 'flee_failed'
      }];
    }
  }

  // ─── DUEL SYSTEM ─────────────────────────────────────────────────────────

  /**
   * Initialize a formal duel.
   * @param {object} state - game state
   * @param {object} opponent - NPC object
   * @param {object} options - { weapon_type, terms, has_seconds, location }
   */
  function initDuel(state, opponent, options = {}) {
    return {
      type: 'duel',
      weapon_type: options.weapon_type || 'sword',
      terms: options.terms || 'first_blood', // 'first_blood' | 'submission' | 'death'
      heinrich_second: options.heinrich_second || null,
      opponent_second: options.opponent_second || null,
      location: options.location || 'open_field',
      witnesses: options.witnesses || [],
      status: 'pending', // pending | in_progress | resolved
      honor_at_stake: options.honor_at_stake !== undefined ? options.honor_at_stake : true,
      result: null
    };
  }

  /**
   * Resolve a duel (summary resolution for simple duels).
   * Full turn-by-turn uses the standard combat resolution.
   */
  function resolveDuel(duelState, heinrichSkills, opponent) {
    const heinrichLevel = _getWeaponSkillForType(heinrichSkills, duelState.weapon_type);
    const opponentLevel = opponent.weapon_skill || 3;

    // Best of 3 advantage system
    let heinrichAdvantage = 0;
    const rounds = [];

    for (let i = 0; i < 3; i++) {
      const hRoll = DiceEngine.roll(duelState.weapon_type, heinrichLevel, 'medium', []);
      const oRoll = DiceEngine.roll(duelState.weapon_type, opponentLevel, 'medium', []);

      const hSuccess = hRoll.isSuccess;
      const oSuccess = oRoll.isSuccess;
      const hMargin = hRoll.finalTarget - hRoll.roll;
      const oMargin = oRoll.finalTarget - oRoll.roll;

      let roundWinner;
      if (hSuccess && !oSuccess) { roundWinner = 'heinrich'; heinrichAdvantage++; }
      else if (!hSuccess && oSuccess) { roundWinner = 'opponent'; heinrichAdvantage--; }
      else if (hMargin > oMargin) { roundWinner = 'heinrich'; heinrichAdvantage++; }
      else if (oMargin > hMargin) { roundWinner = 'opponent'; heinrichAdvantage--; }
      else roundWinner = 'draw';

      rounds.push({ round: i + 1, heinrich_roll: hRoll, opponent_roll: oRoll, winner: roundWinner });
    }

    const victor = heinrichAdvantage > 0 ? 'heinrich' : heinrichAdvantage < 0 ? 'opponent' : 'draw';
    duelState.result = {
      victor,
      rounds,
      honor_result: _getDuelHonorResult(victor, duelState, opponent)
    };
    duelState.status = 'resolved';

    return duelState;
  }

  // ─── TOURNAMENT SYSTEM ───────────────────────────────────────────────────

  /**
   * Resolve a tournament event.
   * @param {string} type - 'melee' | 'archery' | 'joust' | 'wrestling'
   */
  function resolveTournamentEvent(type, heinrichSkills, competitors) {
    const skill = _tournamentTypeToSkill(type);
    const heinrichLevel = heinrichSkills[skill]?.level || 0;
    const results = [];

    for (const competitor of competitors) {
      const opposedResult = DiceEngine.opposedRoll(skill, heinrichLevel, skill, competitor.skill_level || 3);
      results.push({
        competitor: competitor.name,
        heinrich_won: opposedResult.winner === 'heinrich',
        result: opposedResult
      });
    }

    const wins = results.filter(r => r.heinrich_won).length;
    const rank = wins === competitors.length ? 'champion'
      : wins >= competitors.length * 0.7 ? 'finalist'
      : wins >= competitors.length * 0.4 ? 'participant'
      : 'eliminated';

    const prizes = {
      champion: { coin_sous: 200, reputation_boost: 20, prestige: 'tournament_champion' },
      finalist: { coin_sous: 50, reputation_boost: 10 },
      participant: { coin_sous: 10, reputation_boost: 2 },
      eliminated: { coin_sous: 0, reputation_boost: 0 }
    };

    return { type, rank, wins, total: competitors.length, prize: prizes[rank], results };
  }

  // ─── UTILITY HELPERS ─────────────────────────────────────────────────────

  function _getPrimaryWeaponSkillLevel(state) {
    const weapon = state.inventory.equipped.weapon_primary;
    if (!weapon) return state.skills.brawling?.level || 1;
    const skill = _weaponToSkill(weapon);
    return state.skills[skill]?.level || 1;
  }

  function _weaponToSkill(weapon) {
    const map = {
      sword: 'sword', longsword: 'sword', short_sword: 'sword',
      dagger: 'dagger', hunting_knife: 'dagger',
      hand_axe: 'axe', great_axe: 'axe', woodcutters_axe: 'axe',
      spear: 'polearms', halberd: 'polearms', staff: 'polearms',
      shortbow: 'archery', longbow: 'archery', crossbow: 'archery',
      unarmed: 'unarmed'
    };
    return map[weapon] || 'brawling';
  }

  function _getWeaponSkillForType(skills, type) {
    const map = { sword: 'sword', axe: 'axe', wrestling: 'unarmed', archery: 'archery', joust: 'horsemanship' };
    const skillName = map[type] || type;
    return skills[skillName]?.level || 0;
  }

  function _tournamentTypeToSkill(type) {
    const map = { melee: 'sword', archery: 'archery', joust: 'horsemanship', wrestling: 'unarmed' };
    return map[type] || 'brawling';
  }

  function _rollHitLocation() {
    let rand = Math.random();
    for (const loc of HIT_LOCATIONS) {
      rand -= loc.probability;
      if (rand <= 0) return loc.location;
    }
    return 'torso';
  }

  function _damageToSeverity(damage) {
    if (damage <= WOUND_SEVERITY.scratch.max_damage) return 'scratch';
    if (damage <= WOUND_SEVERITY.light.max_damage) return 'light';
    if (damage <= WOUND_SEVERITY.moderate.max_damage) return 'moderate';
    if (damage <= WOUND_SEVERITY.severe.max_damage) return 'severe';
    return 'critical';
  }

  function _applyWoundToState(gameState, location, damage) {
    const severity = _damageToSeverity(damage);
    const wound = {
      id: `wound_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type: 'combat',
      severity,
      damage,
      turn_received: gameState.meta.turn,
      healing_progress: 0,
      infected: false,
      infection_checked: false,
      bleeding: DiceEngine.chance(0.3)
    };
    gameState.heinrich.wounds[location]?.push(wound);
    gameState.heinrich.health.hp_current = Math.max(0, (gameState.heinrich.health.hp_current || 100) - WOUND_SEVERITY[severity].hp_cost);
  }

  function _getArmorValue(equipped) {
    let armor = 0;
    if (equipped.torso) armor += (ARMOR_PROTECTION[equipped.torso]?.value ?? 0);
    if (equipped.head) armor += (ARMOR_PROTECTION[equipped.head]?.value ?? 0);
    if (equipped.shield) armor += (ARMOR_PROTECTION[equipped.shield]?.value ?? 0);
    return armor;
  }

  function _getEquippedWeapon(equipped) {
    return equipped.weapon_primary || 'unarmed';
  }

  function _getDefenseSkillLevel(skills, heinrichCombat) {
    return {
      dodge: skills.agility?.level || 1,
      parry: Math.max(skills.sword?.level || 0, skills.axe?.level || 0, skills.brawling?.level || 0)
    };
  }

  function _calculateInitialConfidence(state, opponents) {
    const heinrichLevel = state.skills.brawling?.level || 1;
    const avgOppLevel = opponents.reduce((s, o) => s + (o.weapon_skill || 3), 0) / opponents.length;
    return Math.max(-5, Math.min(5, Math.round((heinrichLevel - avgOppLevel) + (opponents.length > 1 ? -2 : 0))));
  }

  function _getDuelHonorResult(victor, duelState, opponent) {
    if (victor === 'heinrich') {
      return { honor_change: 10, reputation_change: 15, opponent_defeated: true };
    } else if (victor === 'opponent') {
      return { honor_change: -10, reputation_change: -10, opponent_defeated: false };
    } else {
      return { honor_change: 2, reputation_change: 0, drawn: true };
    }
  }

  /**
   * Get combat action options for current combat state.
   */
  function getCombatOptions(combatState, heinrichSkills) {
    const stance = combatState.heinrich.stance;
    const options = [
      { key: 'attack', label: '⚔️ Attack', description: 'Strike the primary opponent' },
      { key: 'defend', label: '🛡️ Focus Defense', description: 'Concentrate on not getting hit' },
      { key: 'flee', label: '🏃 Flee', description: 'Attempt to escape combat' }
    ];

    // Stance change options
    const stanceOptions = Object.entries(STANCES)
      .filter(([id]) => id !== stance)
      .map(([id, s]) => ({
        key: `stance_${id}`,
        label: `🔄 ${s.name} Stance`,
        description: s.description,
        action: 'change_stance',
        stance: id
      }));
    options.push(...stanceOptions.slice(0, 2)); // Show max 2 stance changes

    // Special attacks if skilled enough
    if (heinrichSkills.brawling?.level >= 4 && heinrichSkills.brawling?.branches?.grappling?.unlocked) {
      options.push({ key: 'grapple', label: '🤼 Grapple', description: 'Attempt to wrestle opponent' });
    }

    return options;
  }

  // ─── EXPORTS ──────────────────────────────────────────────────────────────

  return {
    STANCES,
    WEAPON_DAMAGE,
    HIT_LOCATIONS,
    WOUND_SEVERITY,
    ARMOR_PROTECTION,
    initCombat,
    resolveCombatAction,
    initDuel,
    resolveDuel,
    resolveTournamentEvent,
    getCombatOptions
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CombatEngine };
}

// END FILE: client/js/engine/combat-engine.js
