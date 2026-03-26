// FILE: client/js/engine/dice.js — PART 4

'use strict';

/**
 * DICE ENGINE — d100 roll resolution, outcome tiers, XP awarding.
 * 
 * Core rule: Roll a d100. Roll EQUAL TO OR LOWER than the target = success.
 * Target = Base Difficulty + (Skill Level × 2) + Situational Modifiers
 * Clamped to range [3, 97] so there is always some chance of failure or success.
 */

const DiceEngine = (() => {

  // ─── DIFFICULTY BASES ─────────────────────────────────────────────────────
  const DIFFICULTY_BASES = {
    trivial: 90,
    routine: 75,
    medium: 55,
    high: 35,
    extreme: 20,
    legendary: 10
  };

  // ─── OUTCOME TIERS ────────────────────────────────────────────────────────
  const OUTCOME_TIERS = {
    CRITICAL:  { id: 'critical',   emoji: '⚡', label: 'Critical Success',   xp_multiplier: 1.5 },
    STRONG:    { id: 'strong',     emoji: '✨', label: 'Strong Success',      xp_multiplier: 1.2 },
    SUCCESS:   { id: 'success',    emoji: '✅', label: 'Success',             xp_multiplier: 1.0 },
    SCRAPED:   { id: 'scraped',    emoji: '🔶', label: 'Scraped Through',     xp_multiplier: 0.8 },
    NEAR_MISS: { id: 'near_miss',  emoji: '⚠️', label: 'Near Miss',          xp_multiplier: 1.0 },
    FAILURE:   { id: 'failure',    emoji: '❌', label: 'Failure',             xp_multiplier: 1.2 },
    DISASTER:  { id: 'disaster',   emoji: '💀', label: 'Disaster',            xp_multiplier: 1.5 }
  };

  // ─── BASE XP PER TIER ─────────────────────────────────────────────────────
  const BASE_XP = {
    critical:  15,
    strong:    12,
    success:   10,
    scraped:   8,
    near_miss: 10,
    failure:   12,
    disaster:  15
  };

  // ─── SKILL LEVEL THRESHOLDS (total XP to reach level) ────────────────────
  const LEVEL_THRESHOLDS = [
    0,   // Level 0 (start)
    30,  // Level 1
    90,  // Level 2
    190, // Level 3
    340, // Level 4
    540, // Level 5
    800, // Level 6
    870, // Level 7 (+70 from previous)
    940, // Level 8
    1010,// Level 9
    1080 // Level 10 (cap)
  ];
  // Level 10 is absolute cap — excess XP goes to reputation/title gain

  // ─── SKILL CATEGORIES FOR LABORER'S INSTINCT ──────────────────────────────
  const PHYSICAL_CRAFT_SURVIVAL_SKILLS = new Set([
    'strength', 'endurance', 'agility', 'brawling', 'unarmed', 'swimming',
    'climbing', 'smithing', 'carpentry', 'agriculture', 'hunting', 'cooking',
    'survival', 'medicine', 'axe', 'polearms', 'archery', 'horsemanship'
  ]);

  // ─── CORE ROLL FUNCTION ───────────────────────────────────────────────────

  /**
   * Roll the dice for a skill check.
   * @param {string} skillName - The skill being checked
   * @param {number} skillLevel - Current level of the skill (0-10)
   * @param {string} difficulty - 'trivial'|'routine'|'medium'|'high'|'extreme'|'legendary'
   * @param {Array<{label:string, value:number}>} situationalMods - Array of modifiers
   * @param {object} state - Current game state (for passive checks)
   * @returns {RollResult}
   */
  function roll(skillName, skillLevel, difficulty, situationalMods = [], state = null) {
    // 1. Calculate base target
    const difficultyBase = DIFFICULTY_BASES[difficulty] || DIFFICULTY_BASES.medium;

    // 2. Add skill contribution (each level = +2 to target)
    const skillBonus = skillLevel * 2;

    // 3. Sum situational modifiers
    const situationalTotal = situationalMods.reduce((sum, mod) => sum + mod.value, 0);

    // 4. Calculate raw target
    const rawTarget = difficultyBase + skillBonus + situationalTotal;

    // 5. Clamp target to [3, 97] — always some chance either way
    const finalTarget = Math.max(3, Math.min(97, rawTarget));

    // 6. Roll the die
    const roll = _d100();

    // 7. Determine outcome tier
    const tier = _determineTier(roll, finalTarget, skillLevel);

    // 8. Award XP
    const xpResult = _calculateXP(skillName, tier, state);

    // 9. Build roll result object
    return {
      skillName,
      skillLevel,
      difficulty,
      difficultyBase,
      skillBonus,
      situationalMods,
      situationalTotal,
      finalTarget,
      roll,
      tier,
      tierData: OUTCOME_TIERS[tier.toUpperCase()],
      xpAwarded: xpResult.xp,
      xpBonusReason: xpResult.reason,
      isSuccess: ['critical', 'strong', 'success', 'scraped'].includes(tier),
      isCritical: tier === 'critical',
      isDisaster: tier === 'disaster'
    };
  }

  /**
   * Roll with a pre-known roll value (for replay/testing).
   */
  function rollWithValue(skillName, skillLevel, difficulty, situationalMods, forcedRoll, state = null) {
    const difficultyBase = DIFFICULTY_BASES[difficulty] || DIFFICULTY_BASES.medium;
    const skillBonus = skillLevel * 2;
    const situationalTotal = situationalMods.reduce((sum, mod) => sum + mod.value, 0);
    const rawTarget = difficultyBase + skillBonus + situationalTotal;
    const finalTarget = Math.max(3, Math.min(97, rawTarget));
    const tier = _determineTier(forcedRoll, finalTarget, skillLevel);
    const xpResult = _calculateXP(skillName, tier, state);

    return {
      skillName, skillLevel, difficulty, difficultyBase,
      skillBonus, situationalMods, situationalTotal,
      finalTarget, roll: forcedRoll, tier,
      tierData: OUTCOME_TIERS[tier.toUpperCase()],
      xpAwarded: xpResult.xp, xpBonusReason: xpResult.reason,
      isSuccess: ['critical', 'strong', 'success', 'scraped'].includes(tier),
      isCritical: tier === 'critical',
      isDisaster: tier === 'disaster'
    };
  }

  /**
   * Simple opposed roll — two parties roll against each other.
   * Returns { winner: 'heinrich'|'opponent', heinrich_result, opponent_result }
   */
  function opposedRoll(heinrichSkill, heinrichLevel, opponentSkill, opponentLevel) {
    // Both roll medium difficulty, then compare margins
    const h = roll(heinrichSkill, heinrichLevel, 'medium', []);
    const o = roll(opponentSkill, opponentLevel, 'medium', []);

    // Success wins over failure; among equalities, compare margin to target
    const hMargin = h.finalTarget - h.roll;
    const oMargin = o.finalTarget - o.roll;

    let winner;
    if (h.isSuccess && !o.isSuccess) winner = 'heinrich';
    else if (!h.isSuccess && o.isSuccess) winner = 'opponent';
    else winner = hMargin >= oMargin ? 'heinrich' : 'opponent';

    return { winner, heinrich_result: h, opponent_result: o, h_margin: hMargin, o_margin: oMargin };
  }

  /**
   * Stealth check — used frequently enough to warrant its own helper.
   */
  function stealthCheck(stealthLevel, situationalMods = [], state = null) {
    return roll('stealth', stealthLevel, 'medium', situationalMods, state);
  }

  /**
   * Social check helper — selects difficulty based on NPC disposition.
   */
  function socialCheck(skillName, skillLevel, npcFavorability, situationalMods = [], state = null) {
    // NPC favorability (-100 to +100) adjusts difficulty
    let difficulty;
    if (npcFavorability >= 60) difficulty = 'routine';
    else if (npcFavorability >= 20) difficulty = 'medium';
    else if (npcFavorability >= -20) difficulty = 'high';
    else difficulty = 'extreme';
    return roll(skillName, skillLevel, difficulty, situationalMods, state);
  }

  // ─── OUTCOME TIER DETERMINATION ───────────────────────────────────────────

  /**
   * Map roll + target to an outcome tier.
   * 
   * Tier ranges (relative to finalTarget T):
   *   disaster:  96-100 (always, UNLESS mastery level 10)
   *   failure:   T+11 to 95 (rolled over target by more than 10)    
   *   near_miss: T+1 to T+10 (rolled just over target)
   *   scraped:   T-4 to T (rolled at or just under target — barely made it)
   *   success:   T-24 to T-5 (comfortable success)
   *   strong:    T-39 to T-25 (clearly succeeded)
   *   critical:  1-5 OR ≤T-40 (near-perfect roll, or far exceeded target)
   */
  function _determineTier(rolled, target, skillLevel) {
    // Level 10 mastery: disaster range becomes near_miss
    if (rolled >= 96) {
      return skillLevel >= 10 ? 'near_miss' : 'disaster';
    }
    if (rolled > target + 10) return 'failure';
    if (rolled > target) return 'near_miss';        // T+1 to T+10
    if (rolled >= target - 4) return 'scraped';     // T-4 to T
    if (rolled >= target - 24) return 'success';    // T-24 to T-5
    if (rolled >= target - 39) return 'strong';     // T-39 to T-25
    return 'critical';                              // ≤T-40 or ≤5
  }

  // ─── XP CALCULATION ───────────────────────────────────────────────────────

  function _calculateXP(skillName, tier, state) {
    let baseXP = BASE_XP[tier] || 10;
    let reason = '';

    // Laborer's Instinct: +10% XP on physical/craft/survival
    if (state?.heinrich?.laborers_instinct && PHYSICAL_CRAFT_SURVIVAL_SKILLS.has(skillName)) {
      baseXP = Math.round(baseXP * 1.1);
      reason = "Laborer's Instinct";
    }

    // Mentor bonus: +15% if actively being mentored in this skill
    if (state?.mentors?.active?.some(m => m.teaches_skill === skillName && m.active)) {
      baseXP = Math.round(baseXP * 1.15);
      reason += (reason ? ', ' : '') + 'Mentored';
    }

    return { xp: baseXP, reason };
  }

  // ─── SKILL PROGRESSION ────────────────────────────────────────────────────

  /**
   * Apply XP to a skill and return level-up information.
   * Modifies the skills object in-place.
   * @returns { leveledUp: bool, newLevel: number, excessXP: number }
   */
  function applyXP(skillsObj, skillName, xpAmount) {
    // Handle branch skills: "brawling.grappling"
    const parts = skillName.split('.');
    let skillRef;
    if (parts.length === 2) {
      skillRef = skillsObj[parts[0]]?.branches?.[parts[1]];
    } else {
      skillRef = skillsObj[skillName];
    }

    if (!skillRef) return { leveledUp: false, newLevel: 0, excessXP: 0 };
    if (skillRef.level >= 10) {
      // At cap — return XP as excess (for reputation/legacy conversion)
      return { leveledUp: false, newLevel: 10, excessXP: xpAmount, atCap: true };
    }

    skillRef.xp += xpAmount;

    const nextLevelThreshold = _xpToReach(skillRef.level + 1);
    const currentLevelXP = _xpToReach(skillRef.level);
    const xpIntoCurrentLevel = skillRef.xp - currentLevelXP;
    const xpNeeded = nextLevelThreshold - currentLevelXP;

    if (xpIntoCurrentLevel >= xpNeeded) {
      skillRef.level++;
      const leveledUpResult = { leveledUp: true, newLevel: skillRef.level };
      // Check for passive unlock at levels 3, 6, 10
      if ([3, 6, 10].includes(skillRef.level)) {
        leveledUpResult.passiveUnlocked = `${skillName}_passive_level_${skillRef.level}`;
        if (!skillRef.passives_unlocked) skillRef.passives_unlocked = [];
        skillRef.passives_unlocked.push(leveledUpResult.passiveUnlocked);
      }
      return leveledUpResult;
    }

    return { leveledUp: false, newLevel: skillRef.level };
  }

  /**
   * Get the cumulative XP needed to REACH a given level.
   */
  function _xpToReach(level) {
    if (level <= 0) return 0;
    if (level >= LEVEL_THRESHOLDS.length) return LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
    return LEVEL_THRESHOLDS[level];
  }

  /**
   * Get XP needed for next level from current XP total.
   */
  function getXPToNextLevel(skillObj) {
    if (skillObj.level >= 10) return null; // At cap
    const nextThreshold = _xpToReach(skillObj.level + 1);
    return nextThreshold - skillObj.xp;
  }

  /**
   * Get XP progress within current level (0.0 to 1.0).
   */
  function getLevelProgress(skillObj) {
    if (skillObj.level >= 10) return 1.0;
    const currentThreshold = _xpToReach(skillObj.level);
    const nextThreshold = _xpToReach(skillObj.level + 1);
    const xpIntoLevel = skillObj.xp - currentThreshold;
    const xpNeeded = nextThreshold - currentThreshold;
    return Math.max(0, Math.min(1, xpIntoLevel / xpNeeded));
  }

  // ─── UTILITY ROLLS ────────────────────────────────────────────────────────

  /** Pure d100 roll */
  function _d100() {
    return Math.floor(Math.random() * 100) + 1;
  }

  /** d6 */
  function d6() { return Math.floor(Math.random() * 6) + 1; }

  /** dN */
  function dN(n) { return Math.floor(Math.random() * n) + 1; }

  /** Roll multiple dice */
  function rollNd(count, sides) {
    let total = 0;
    for (let i = 0; i < count; i++) total += dN(sides);
    return total;
  }

  /** Random integer between min and max inclusive */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /** Weighted random choice from items array where each has a .probability */
  function weightedChoice(items) {
    if (!items || items.length === 0) return null;
    const total = items.reduce((sum, item) => sum + (item.probability || 1), 0);
    let rand = Math.random() * total;
    for (const item of items) {
      rand -= (item.probability || 1);
      if (rand <= 0) return item;
    }
    return items[items.length - 1];
  }

  /** Probability check — returns true if random() < probability */
  function chance(probability) {
    return Math.random() < probability;
  }

  /**
   * Format roll result for display in the prose window.
   */
  function formatRollResult(result) {
    const mods = result.situationalMods.map(m => `${m.label}: ${m.value >= 0 ? '+' : ''}${m.value}`).join(', ');
    return {
      headline: `${result.tierData.emoji} ${result.skillName.toUpperCase()} — ${result.tierData.label}`,
      detail: `Roll: ${result.roll} vs Target: ${result.finalTarget} | Skill Lv${result.skillLevel} (${result.difficulty})`,
      mods: mods || 'No situational modifiers',
      xp: `+${result.xpAwarded} XP${result.xpBonusReason ? ` (${result.xpBonusReason})` : ''}`
    };
  }

  // ─── EXPORTS ──────────────────────────────────────────────────────────────

  return {
    roll,
    rollWithValue,
    opposedRoll,
    stealthCheck,
    socialCheck,
    applyXP,
    getXPToNextLevel,
    getLevelProgress,
    formatRollResult,
    chance,
    weightedChoice,
    randInt,
    d6,
    dN,
    rollNd,
    DIFFICULTY_BASES,
    OUTCOME_TIERS,
    BASE_XP,
    LEVEL_THRESHOLDS,
    PHYSICAL_CRAFT_SURVIVAL_SKILLS
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DiceEngine };
}

// END FILE: client/js/engine/dice.js
