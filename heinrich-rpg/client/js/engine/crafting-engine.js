// FILE: client/js/engine/crafting-engine.js — PART 7

'use strict';

/**
 * CRAFTING ENGINE — Item creation, quality determination, masterwork mechanics,
 * resource consumption, and the economics of craft production.
 */

const CraftingEngine = (() => {

  // ─── CRAFT RECIPES ────────────────────────────────────────────────────────
  const RECIPES = {

    // SMITHING
    iron_knife: {
      id: 'iron_knife',
      name: 'Iron Knife',
      category: 'weapon',
      skill_required: 'smithing',
      skill_minimum: 2,
      materials: [
        { item: 'iron_bars', quantity: 0.5 },
        { item: 'charcoal', quantity: 2 }
      ],
      tool_required: 'forge',
      turns_to_craft: 4,
      base_quality: 50,
      sellable: true,
      base_value_sous: 4,
      xp_granted: 15
    },

    hunting_knife_quality: {
      id: 'hunting_knife_quality',
      name: 'Good Hunting Knife',
      category: 'weapon',
      skill_required: 'smithing',
      skill_minimum: 3,
      materials: [
        { item: 'iron_bars', quantity: 0.75 },
        { item: 'charcoal', quantity: 3 },
        { item: 'leather', quantity: 0.25 }
      ],
      tool_required: 'forge',
      turns_to_craft: 6,
      base_quality: 60,
      base_value_sous: 8,
      xp_granted: 20
    },

    short_sword: {
      id: 'short_sword',
      name: 'Short Sword',
      category: 'weapon',
      skill_required: 'smithing',
      skill_minimum: 4,
      branch_required: 'smithing.weaponsmith',
      materials: [
        { item: 'iron_bars', quantity: 2 },
        { item: 'charcoal', quantity: 8 },
        { item: 'leather', quantity: 0.5 }
      ],
      tool_required: 'forge_with_anvil',
      turns_to_craft: 16,
      base_quality: 55,
      base_value_sous: 20,
      quality_cap: 85,
      xp_granted: 40
    },

    longsword: {
      id: 'longsword',
      name: 'Longsword',
      category: 'weapon',
      skill_required: 'smithing',
      skill_minimum: 6,
      branch_required: 'smithing.weaponsmith',
      materials: [
        { item: 'steel', quantity: 3 },
        { item: 'charcoal', quantity: 15 },
        { item: 'leather', quantity: 1 }
      ],
      tool_required: 'master_forge',
      turns_to_craft: 24,
      base_quality: 60,
      base_value_sous: 50,
      quality_cap: 95,
      masterwork_possible: true,
      xp_granted: 60
    },

    chainmail_shirt: {
      id: 'chainmail_shirt',
      name: 'Chainmail Shirt',
      category: 'armor',
      skill_required: 'smithing',
      skill_minimum: 5,
      branch_required: 'smithing.armorsmith',
      materials: [
        { item: 'iron_bars', quantity: 8 },
        { item: 'charcoal', quantity: 20 }
      ],
      tool_required: 'forge_with_anvil',
      turns_to_craft: 80,
      base_quality: 55,
      base_value_sous: 80,
      xp_granted: 100
    },

    horseshoe_set: {
      id: 'horseshoe_set',
      name: 'Horseshoe Set (4)',
      category: 'tool',
      skill_required: 'smithing',
      skill_minimum: 2,
      materials: [
        { item: 'iron_bars', quantity: 1 },
        { item: 'charcoal', quantity: 4 }
      ],
      tool_required: 'forge',
      turns_to_craft: 6,
      base_value_sous: 5,
      demand: 'steady',
      xp_granted: 12
    },

    // CARPENTRY
    wooden_cart: {
      id: 'wooden_cart',
      name: 'Farm Cart',
      category: 'vehicle',
      skill_required: 'carpentry',
      skill_minimum: 3,
      materials: [
        { item: 'timber', quantity: 3 },
        { item: 'iron_bars', quantity: 1 }
      ],
      tool_required: 'woodworking_tools',
      turns_to_craft: 30,
      base_value_sous: 30,
      xp_granted: 50
    },

    furniture_set: {
      id: 'furniture_set',
      name: 'Simple Furniture (Table + Chair)',
      category: 'furniture',
      skill_required: 'carpentry',
      skill_minimum: 2,
      materials: [{ item: 'timber', quantity: 1.5 }],
      tool_required: 'woodworking_tools',
      turns_to_craft: 12,
      base_value_sous: 8,
      xp_granted: 20
    },

    bow_simple: {
      id: 'bow_simple',
      name: 'Simple Bow',
      category: 'weapon',
      skill_required: 'carpentry',
      skill_minimum: 3,
      materials: [
        { item: 'ash_wood', quantity: 1 },
        { item: 'string_hemp', quantity: 1 }
      ],
      tool_required: 'woodworking_tools',
      turns_to_craft: 8,
      base_value_sous: 6,
      xp_granted: 18
    },

    // COOKING
    simple_meal: {
      id: 'simple_meal',
      name: 'Simple Meal (Pottage)',
      category: 'food',
      skill_required: 'cooking',
      skill_minimum: 1,
      materials: [
        { item: 'grain_any', quantity: 0.5 },
        { item: 'vegetable_any', quantity: 0.25 }
      ],
      tool_required: 'pot_and_fire',
      turns_to_craft: 2,
      base_value_sous: 0.5,
      nutrition_value: 30,
      xp_granted: 5
    },

    feast_meal: {
      id: 'feast_meal',
      name: 'Feast Course',
      category: 'food',
      skill_required: 'cooking',
      skill_minimum: 4,
      materials: [
        { item: 'meat_any', quantity: 1 },
        { item: 'spices_any', quantity: 0.1 },
        { item: 'grain_any', quantity: 0.5 }
      ],
      tool_required: 'kitchen',
      turns_to_craft: 8,
      base_value_sous: 3,
      nutrition_value: 60,
      xp_granted: 25
    },

    // MEDICINE
    wound_dressing: {
      id: 'wound_dressing',
      name: 'Proper Wound Dressing',
      category: 'medicine',
      skill_required: 'medicine',
      skill_minimum: 2,
      materials: [
        { item: 'linen_cloth', quantity: 0.25 },
        { item: 'herbal_medicines', quantity: 1 }
      ],
      tool_required: null,
      turns_to_craft: 2,
      effect: { wound_treatment: true, infection_prevention: true },
      xp_granted: 15
    },

    fever_medicine: {
      id: 'fever_medicine',
      name: 'Willow Bark Fever Remedy',
      category: 'medicine',
      skill_required: 'medicine',
      skill_minimum: 3,
      branch_required: 'medicine.herbalism',
      materials: [{ item: 'willow_bark', quantity: 2 }],
      turns_to_craft: 3,
      effect: { fever_reduction: true, disease_progression_slow: 0.15 },
      xp_granted: 20
    }
  };

  // ─── QUALITY TIERS ────────────────────────────────────────────────────────
  const QUALITY_TIERS = {
    0: { min: 0,  max: 20, label: 'Crude',       modifier: 0.4, description: 'Barely functional' },
    1: { min: 20, max: 40, label: 'Poor',         modifier: 0.65, description: 'Serviceable but ugly' },
    2: { min: 40, max: 60, label: 'Adequate',     modifier: 1.0, description: 'Meets expectations' },
    3: { min: 60, max: 75, label: 'Good',         modifier: 1.4, description: 'Better than average' },
    4: { min: 75, max: 88, label: 'Fine',         modifier: 2.0, description: 'A craftsman is proud of this' },
    5: { min: 88, max: 95, label: 'Masterwork',   modifier: 4.0, description: 'Few can equal this', named_item: true },
    6: { min: 95, max: 101, label: 'Legendary',  modifier: 10.0, description: 'A piece that will outlive its maker', named_item: true }
  };

  // ─── CRAFTING RESOLUTION ─────────────────────────────────────────────────

  /**
   * Attempt to craft an item.
   * @param {string} recipeId - Recipe identifier
   * @param {object} state - Game state
   * @returns {CraftResult}
   */
  function craft(recipeId, state) {
    const recipe = RECIPES[recipeId];
    if (!recipe) return { success: false, reason: 'Unknown recipe' };

    // Check skill requirement
    const skillLevel = state.skills[recipe.skill_required]?.level || 0;
    if (skillLevel < recipe.skill_minimum) {
      return { success: false, reason: `Need ${recipe.skill_required} level ${recipe.skill_minimum} (have ${skillLevel})` };
    }

    // Check branch requirement
    if (recipe.branch_required) {
      const [skill, branch] = recipe.branch_required.split('.');
      if (!state.skills[skill]?.branches?.[branch]?.unlocked) {
        return { success: false, reason: `Requires ${recipe.branch_required} specialty` };
      }
    }

    // Check materials (simplified — real check would need inventory management)
    const materialsAvailable = _checkMaterials(recipe.materials, state.inventory);
    if (!materialsAvailable) {
      return { success: false, reason: 'Missing required materials' };
    }

    // Roll for quality
    const qualityRoll = DiceEngine.roll(recipe.skill_required, skillLevel, 'medium', [], state);
    const qualityScore = _calculateQuality(qualityRoll, recipe, skillLevel);
    const qualityTier = _getQualityTier(qualityScore);

    // Award XP
    const xpResult = DiceEngine.applyXP(state.skills, recipe.skill_required, recipe.xp_granted);

    // Calculate value
    const itemValue = Math.round(recipe.base_value_sous * qualityTier.modifier);

    // Create item
    const item = {
      id: `item_${Date.now()}`,
      recipe_id: recipeId,
      name: qualityTier.label !== 'Adequate' ? `${qualityTier.label} ${recipe.name}` : recipe.name,
      quality: qualityTier.label.toLowerCase(),
      quality_score: qualityScore,
      value_sous: itemValue,
      category: recipe.category,
      crafted_by: 'Heinrich',
      crafted_turn: state.meta.turn,
      condition: 'new'
    };

    // Named item for masterwork+
    if (qualityTier.named_item) {
      item.named = true;
      item.history = [`Crafted by Heinrich in ${state.calendar.date.year}`];
      state.inventory.named_items.push(item);
    } else {
      state.inventory.carried.push(item);
    }

    const leveledUp = xpResult.leveledUp;

    return {
      success: true,
      item,
      quality: qualityTier,
      quality_score: qualityScore,
      value_sous: itemValue,
      xp_granted: recipe.xp_granted,
      leveled_up: leveledUp,
      new_level: xpResult.newLevel,
      roll: qualityRoll,
      narrative_key: qualityTier.named_item ? 'masterwork_created' : 'item_crafted'
    };
  }

  /**
   * Get all craftable recipes at current skill levels.
   */
  function getAvailableRecipes(state) {
    const available = [];

    for (const [id, recipe] of Object.entries(RECIPES)) {
      const skillLevel = state.skills[recipe.skill_required]?.level || 0;
      if (skillLevel < recipe.skill_minimum) continue;

      if (recipe.branch_required) {
        const [skill, branch] = recipe.branch_required.split('.');
        if (!state.skills[skill]?.branches?.[branch]?.unlocked) continue;
      }

      available.push({
        id,
        name: recipe.name,
        skill: recipe.skill_required,
        skill_min: recipe.skill_minimum,
        current_skill: skillLevel,
        turns_to_craft: recipe.turns_to_craft,
        estimated_value: recipe.base_value_sous,
        xp_granted: recipe.xp_granted
      });
    }

    return available;
  }

  // ─── QUALITY CALCULATION ─────────────────────────────────────────────────

  function _calculateQuality(roll, recipe, skillLevel) {
    // Base quality from recipe
    let quality = recipe.base_quality || 50;

    // Skill contribution
    quality += skillLevel * 3;

    // Roll outcome modifies quality
    switch (roll.tier) {
      case 'critical': quality += 30; break;
      case 'strong':   quality += 15; break;
      case 'success':  quality += 5;  break;
      case 'scraped':  quality -= 5;  break;
      case 'near_miss':quality -= 10; break;
      case 'failure':  quality -= 25; break;
      case 'disaster': quality -= 50; break;
    }

    // Quality cap from recipe
    if (recipe.quality_cap) {
      quality = Math.min(recipe.quality_cap, quality);
    }

    return Math.max(0, Math.min(100, quality));
  }

  function _getQualityTier(qualityScore) {
    for (let i = 6; i >= 0; i--) {
      if (qualityScore >= QUALITY_TIERS[i].min) return QUALITY_TIERS[i];
    }
    return QUALITY_TIERS[0];
  }

  function _checkMaterials(required, inventory) {
    // Simplified: always return true in prototype; real implementation checks inventory
    return true;
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    RECIPES,
    QUALITY_TIERS,
    craft,
    getAvailableRecipes
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CraftingEngine };
}

// END FILE: client/js/engine/crafting-engine.js
