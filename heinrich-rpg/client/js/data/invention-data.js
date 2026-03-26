// FILE: client/js/data/invention-data.js — PART 3

const INVENTION_DATA = {

  // ─── PLAYER-INVENTABLE TECHNOLOGIES ──────────────────────────────────────
  // Each entry defines what Heinrich can attempt to invent/innovate.
  // The invention-engine.js reads this data and manages progression.

  inventions: {

    printing_press: {
      id: "printing_press",
      name: "Movable Type Printing Press",
      category: "information",
      inspiration_keywords: ["printing", "press", "movable type", "books", "reproduce text"],
      description: "A machine with individual, reusable cast-metal type letters that can be arranged to print any text, then rearranged for the next job.",
      historical_note: "Gutenberg completed his Bible c.1455. Block printing existed in Europe by 1400. Heinrich would be 35-50 years early — extraordinary genius required.",
      feasibility_1403: "feasible_but_revolutionary",

      required_skills: {
        carpentry: { level: 7, reason: "The screw press mechanism, wooden frames, type cases" },
        smithing: { level: 6, reason: "Casting individual metal type letters from lead alloy" },
        reading: { level: 5, reason: "Must understand letterforms, Latin, layout" },
        engineering: { level: 4, reason: "The press mechanism, pressure distribution" }
      },

      required_materials: [
        { item: "lead_tin_alloy", quantity: "large", source: "metal_merchant", cost_approximate: 50 },
        { item: "hardwood_timber", quantity: "significant", source: "carpenter", cost_approximate: 20 },
        { item: "linen_cloth", quantity: "moderate", source: "textile_merchant", cost_approximate: 5 },
        { item: "special_ink", quantity: "ongoing", source: "must_develop", notes: "Oil-based ink must be invented — standard water-ink won't adhere to metal type" },
        { item: "workshop_space", quantity: "permanent", source: "buy_or_rent" }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Concept and Letterform Design",
          turns_required: 8,
          skill_checks: [{ skill: "reading", difficulty: "medium" }, { skill: "smithing", difficulty: "medium" }],
          description: "Designing individual letter matrices. Understanding how each letter must be mirror-reversed to print correctly.",
          failure_consequence: "Letters print backwards or misaligned — must redesign"
        },
        {
          phase: 2,
          name: "Type Casting Experiments",
          turns_required: 12,
          skill_checks: [{ skill: "smithing", difficulty: "high" }, { skill: "engineering", difficulty: "medium" }],
          description: "Casting individual letters from lead-tin alloy. Getting consistent height. Ensuring they print evenly.",
          materials_consumed: ["lead_tin_alloy_small"],
          failure_consequence: "Type casts unevenly. Back to the furnace"
        },
        {
          phase: 3,
          name: "Press Mechanism Construction",
          turns_required: 10,
          skill_checks: [{ skill: "carpentry", difficulty: "high" }, { skill: "engineering", difficulty: "high" }],
          description: "Building the screw press. The platen must apply even pressure across all type. The frame must hold rigid.",
          failure_consequence: "Uneven pressure — some letters print, others don't"
        },
        {
          phase: 4,
          name: "Ink Development",
          turns_required: 8,
          skill_checks: [{ skill: "medicine", difficulty: "medium" }, { skill: "agriculture", difficulty: "easy" }],
          description: "Standard ink slides off metal. An oil-based ink — linseed or walnut oil with lamp-black — must be formulated.",
          materials_consumed: ["linseed_oil", "lamp_black"],
          failure_consequence: "Ink smears, doesn't dry, or doesn't adhere"
        },
        {
          phase: 5,
          name: "Integration and First Print",
          turns_required: 6,
          skill_checks: [{ skill: "engineering", difficulty: "extreme" }, { skill: "reading", difficulty: "medium" }],
          description: "Setting type, applying ink, running the press, correcting position — all must work together for a legible page.",
          success_output: "crude_printed_page"
        }
      ],

      prototype_quality_effects: {
        poor: "Blurry, misaligned, but recognizable text. Prints 10 pages before needing re-inking and type-resetting. Slow.",
        adequate: "Legible text. 30 pages/day. Still crude but functional.",
        good: "Clean text. 100 pages/day. Multiple type settings possible.",
        excellent: "Near professional output. 200+ pages/day."
      },

      world_reactions: {
        church: {
          initial: "Theological concern — uncontrolled text reproduction undermines Church authority over scripture",
          reaction_range: ["demand for exclusive rights", "burning of press", "embrace if Church can control it", "inquisition investigation"],
          intensity: "extreme"
        },
        scholars: {
          initial: "Amazement and hunger — finally books could spread",
          reaction_range: ["desperate patronage offers", "want to be near the invention", "try to steal knowledge"],
          intensity: "very_high"
        },
        scribes_guild: {
          initial: "Existential threat to their livelihood",
          reaction_range: ["violence", "legal challenge", "attempt to buy him out", "try to join and control"],
          intensity: "high"
        },
        nobles: {
          initial: "Mix of fascination and fear — uncontrolled information is dangerous to their power",
          reaction_range: ["try to monopolize", "try to destroy", "commission first books", "want control"],
          intensity: "very_high"
        },
        common_people: {
          initial: "Incomprehension — few can read. But they sense something enormous.",
          reaction_range: ["wonder", "fear of witchcraft", "indifference", "awe at books becoming affordable"],
          intensity: "medium"
        }
      },

      legacy_points: 500,
      historical_impact: "civilization_altering"
    },

    four_field_rotation: {
      id: "four_field_rotation",
      name: "Four-Field Crop Rotation",
      category: "agriculture",
      inspiration_keywords: ["rotation", "legumes", "four fields", "no fallow", "nitrogen"],
      description: "Adding a fourth field with legumes (peas, beans, clover) eliminates the fallow year. Legumes restore nitrogen to soil. Yields increase dramatically.",
      historical_note: "Four-field rotation appeared in parts of Flanders by 1400. Heinrich introducing it to Normandy is realistic and brilliant.",
      feasibility_1403: "highly_feasible_genius_insight",

      required_skills: {
        agriculture: { level: 6, reason: "Deep understanding of soil and crop interaction" },
        stewardship: { level: 3, reason: "Managing the rotation system across multiple tenants" }
      },

      required_materials: [
        { item: "land_access", quantity: "four_fields_minimum", source: "own_land_or_lord_permission" },
        { item: "legume_seed", quantity: "one_field_worth", source: "markets_or_traders" },
        { item: "farmer_cooperation", quantity: "persuasion_skill_needed" }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Observation and Theory",
          turns_required: 4,
          skill_checks: [{ skill: "agriculture", difficulty: "medium" }],
          description: "Noting that fields after peas or beans grow stronger crops. Theorizing about soil fertility.",
          failure_consequence: "Misidentifies the mechanism but pursues anyway"
        },
        {
          phase: 2,
          name: "Test Plot",
          turns_required: 8,
          skill_checks: [{ skill: "agriculture", difficulty: "medium" }],
          description: "Running a small test plot through a full growing season with four-field system.",
          real_time_season: true,
          failure_consequence: "Poor harvest suggests abandonment"
        },
        {
          phase: 3,
          name: "Convincing Farmers",
          turns_required: 6,
          skill_checks: [{ skill: "speech", difficulty: "high" }, { skill: "agriculture", difficulty: "easy" }],
          description: "Traditional farmers deeply distrust change. Showing results is not enough.",
          failure_consequence: "Farmers sabotage or ignore the system"
        }
      ],

      world_reactions: {
        farmers: { range: ["skepticism", "hostility", "gradual_adoption_after_proof", "copying_without_credit"] },
        lord: { range: ["interest_if_yields_increase_his_tax", "suspicion_of_change", "tries_to_take_credit"] },
        church: { reaction: "neutral_mildly_positive", reason: "better_food_for_all_is_good_works" }
      },

      legacy_points: 80,
      historical_impact: "regional_significant"
    },

    advanced_mill: {
      id: "advanced_mill",
      name: "Tower Windmill",
      category: "engineering",
      inspiration_keywords: ["windmill", "tower mill", "rotating cap", "wind power"],
      description: "A stationary stone tower with only the cap and sails rotating to catch wind from any direction — far more efficient than the existing post mill.",
      historical_note: "Tower mills emerged in Europe c.1390-1400. Building one in Normandy in 1403 is on the cutting edge of the period.",
      feasibility_1403: "highly_feasible",

      required_skills: {
        carpentry: { level: 6 },
        engineering: { level: 3 }
      },

      required_materials: [
        { item: "stone_or_heavy_timber", quantity: "large", cost_approximate: 150 },
        { item: "millstone_pair", quantity: 1, cost_approximate: 40 },
        { item: "iron_fittings", quantity: "significant", cost_approximate: 30 },
        { item: "skilled_carpenters", quantity: [2, 4], cost_per_worker_per_day: 2 }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Design and Planning",
          turns_required: 6,
          skill_checks: [{ skill: "carpentry", difficulty: "medium" }, { skill: "engineering", difficulty: "medium" }],
          description: "Designing the rotating cap mechanism. Calculating sail dimensions."
        },
        {
          phase: 2,
          name: "Construction",
          turns_required: 20,
          skill_checks: [{ skill: "carpentry", difficulty: "high" }],
          description: "Building the tower, installing the cap mechanism, raising the sails.",
          requires_workers: true
        }
      ],

      economic_return: {
        income_per_month: [20, 60],
        payback_period_months: [8, 15],
        monopoly_possible: true
      },

      legacy_points: 40
    },

    printing_press_ink: {
      id: "oil_based_ink",
      name: "Oil-Based Printing Ink",
      category: "chemistry",
      inspiration_keywords: ["printing ink", "oil ink", "linseed ink"],
      description: "An oil-based ink (linseed or walnut oil with lamp-black pigment) that adheres to metal type — prerequisite for the printing press.",
      feasibility_1403: "feasible",

      required_skills: {
        medicine: { level: 2, reason: "Knowledge of oils and their properties" }
      },

      required_materials: [
        { item: "linseed_oil", quantity: "small", cost_approximate: 2 },
        { item: "lamp_black", quantity: "small", cost_approximate: 1 }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Oil and Pigment Experiments",
          turns_required: 4,
          skill_checks: [{ skill: "medicine", difficulty: "medium" }],
          description: "Experimenting with ratios of oil to pigment. Testing adhesion and drying time."
        }
      ],

      prerequisite_for: ["printing_press"],
      legacy_points: 20
    },

    water_hammer: {
      id: "water_hammer",
      name: "Water-Powered Trip Hammer",
      category: "metallurgy",
      inspiration_keywords: ["hammer", "water power", "forge", "mechanical hammer", "trip hammer"],
      description: "A water wheel driving a large hammer through a cam mechanism. Automates the heaviest smithing work — forge work that previously required two men.",
      historical_note: "Water-powered hammers existed in Europe since 1200. Installing one well is an engineering challenge requiring good water access.",
      feasibility_1403: "certain",

      required_skills: {
        smithing: { level: 4 },
        carpentry: { level: 5 },
        engineering: { level: 3 }
      },

      required_materials: [
        { item: "fast_water_source", quantity: 1 },
        { item: "heavy_timber", quantity: "large", cost_approximate: 50 },
        { item: "iron_fittings", quantity: "significant", cost_approximate: 40 }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Water Wheel Construction",
          turns_required: 8,
          skill_checks: [{ skill: "carpentry", difficulty: "medium" }, { skill: "engineering", difficulty: "medium" }]
        },
        {
          phase: 2,
          name: "Cam and Hammer Mechanism",
          turns_required: 10,
          skill_checks: [{ skill: "engineering", difficulty: "high" }, { skill: "smithing", difficulty: "medium" }]
        }
      ],

      economic_return: {
        smithing_output_multiplier: 3.0,
        labor_cost_reduction: 0.6
      },
      legacy_points: 50
    },

    improved_sanitation: {
      id: "improved_sanitation",
      name: "Sanitation Reform",
      category: "medicine",
      inspiration_keywords: ["sanitation", "clean water", "sewage", "hygiene", "disease prevention", "washing hands"],
      description: "Systematic rules: covered latrines away from water sources, hand washing, food preparation standards, waste disposal. No germ theory needed — just observation that these practices reduce deaths.",
      historical_note: "This is NOT impossible in 1403 — it's observationally possible. Heinrich just needs to notice correlation between filthy water and dysentery, implement rules, and track results.",
      feasibility_1403: "feasible_with_authority",

      required_skills: {
        medicine: { level: 3 },
        stewardship: { level: 3 },
        speech: { level: 3, reason: "Convincing people to change habits" }
      },

      required_materials: [
        { item: "authority_over_settlement", quantity: 1 },
        { item: "labor_for_construction", quantity: "some" }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Observation Study",
          turns_required: 6,
          description: "Noticing correlation between filthy water/waste and illness."
        },
        {
          phase: 2,
          name: "Implementing Rules",
          turns_required: 8,
          skill_checks: [{ skill: "speech", difficulty: "high" }, { skill: "stewardship", difficulty: "medium" }],
          description: "People resist. Why should they wash their hands? It's always been this way."
        },
        {
          phase: 3,
          name: "Demonstrating Results",
          turns_required: 12,
          description: "Over time, the settlement has measurably lower illness. Proof.",
          real_time_season: true
        }
      ],

      world_reactions: {
        common_people: { range: ["violent_refusal", "mockery", "grudging_compliance", "gratitude_after_seeing_results"] },
        physician_npcs: { range: ["dismissal", "the_old_ways_work_fine", "cautious_interest"] },
        church: { reaction: "mildly_positive", reason: "healthy_people_can_serve_God" }
      },

      mechanical_benefit: {
        settlement_disease_rate: -0.3,
        infant_mortality: -0.25
      },
      legacy_points: 120,
      historical_impact: "massive_if_spread"
    },

    double_entry_bookkeeping: {
      id: "double_entry_bookkeeping",
      name: "Double-Entry Bookkeeping",
      category: "commerce",
      inspiration_keywords: ["bookkeeping", "accounting", "double entry", "ledger", "balance sheet"],
      description: "Recording every transaction as both a debit and credit. Reveals true profit/loss, detects fraud, enables credit. Used by Italian merchants — revolutionary for northern France.",
      historical_note: "Italian merchants used this by 1300. Pacioli formalized it in 1494. Heinrich could introduce it to Normandy decades early.",
      feasibility_1403: "certain_if_literate",

      required_skills: {
        stewardship: { level: 4 },
        reading: { level: 3 }
      },

      required_materials: [
        { item: "parchment_or_paper", quantity: "ongoing" },
        { item: "ink_and_quill", quantity: "ongoing" }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Developing the System",
          turns_required: 6,
          skill_checks: [{ skill: "stewardship", difficulty: "medium" }],
          description: "Working out the logic of parallel debit-credit columns on paper."
        }
      ],

      economic_benefit: {
        fraud_detection: true,
        profit_visibility: true,
        credit_worthiness_increase: 0.3
      },

      world_reactions: {
        merchants: { range: ["confused", "resistant_to_learning", "amazed_at_clarity", "try_to_hire_him"] },
        nobles: { reaction: "uninterested_unless_their_steward_adopts_it" }
      },
      legacy_points: 30
    },

    advanced_crossbow: {
      id: "advanced_crossbow",
      name: "Improved Steel Crossbow with Cranequin",
      category: "weapons",
      inspiration_keywords: ["crossbow", "cranequin", "better crossbow"],
      description: "A steel prod crossbow with a geared cranequin (winding mechanism), allowing much higher draw weight than existing windlass designs — greater range and penetration.",
      historical_note: "Steel crossbows existed but cranequin mechanism was still advancing in 1403. Improving it is realistic.",
      feasibility_1403: "very_feasible",

      required_skills: {
        smithing: { level: 5 },
        carpentry: { level: 3 },
        engineering: { level: 2 }
      },

      research_phases: [
        {
          phase: 1,
          name: "Steel Prod Forging",
          turns_required: 6,
          skill_checks: [{ skill: "smithing", difficulty: "high" }]
        },
        {
          phase: 2,
          name: "Cranequin Mechanism",
          turns_required: 8,
          skill_checks: [{ skill: "engineering", difficulty: "high" }, { skill: "smithing", difficulty: "medium" }]
        }
      ],

      weapon_stats: {
        damage_multiplier: 1.4,
        range_multiplier: 1.5,
        armor_penetration_bonus: 0.3,
        reload_time: "longer_than_standard"
      },

      military_interest: true,
      sellable: true,
      sell_price_range: [40, 200],
      legacy_points: 25
    },

    efficient_furnace: {
      id: "efficient_furnace",
      name: "Improved Iron Smelting Furnace",
      category: "metallurgy",
      inspiration_keywords: ["furnace", "smelting", "iron", "blast furnace", "better iron"],
      description: "A taller, double-bellows furnace achieving higher temperatures — producing cast iron and better steel than the standard bloomery.",
      historical_note: "True blast furnaces appeared in Europe around 1380-1400 in Germany and Sweden. Heinrich could build one in France.",
      feasibility_1403: "feasible_cutting_edge",

      required_skills: {
        smithing: { level: 7 },
        engineering: { level: 4 },
        carpentry: { level: 3 }
      },

      required_materials: [
        { item: "firebrick_or_special_stone", quantity: "large" },
        { item: "large_bellows_mechanism", quantity: 1 },
        { item: "iron_ore", quantity: "significant" }
      ],

      research_phases: [
        {
          phase: 1,
          name: "Furnace Design",
          turns_required: 8,
          skill_checks: [{ skill: "smithing", difficulty: "high" }, { skill: "engineering", difficulty: "medium" }]
        },
        {
          phase: 2,
          name: "First Smelting Runs",
          turns_required: 10,
          skill_checks: [{ skill: "smithing", difficulty: "extreme" }],
          description: "Multiple failed runs common before the furnace reaches optimal temperature profile."
        }
      ],

      metallurgy_benefit: {
        iron_quality_multiplier: 1.5,
        output_multiplier: 2.0,
        enables_cast_iron: true
      },
      legacy_points: 60
    }
  },

  // ─── FEASIBILITY ASSESSMENT ───────────────────────────────────────────────
  feasibility_categories: {
    certain: {
      label: "Certainly Achievable",
      description: "This is something that exists in 1403 or is conceptually straightforward. Heinrich needs skills and materials, not miraculous insight.",
      time_modifier: 0.8,
      skill_check_modifier: -5
    },
    highly_feasible: {
      label: "Highly Feasible",
      description: "The technology exists in concept and is achievable with 1403 materials. Heinrich is ahead of his region, not ahead of history.",
      time_modifier: 1.0,
      skill_check_modifier: 0
    },
    feasible_but_revolutionary: {
      label: "Feasible But Revolutionary",
      description: "Possible with 1403 materials and methods, but requires extraordinary insight. Heinrich is ahead of the general historical curve.",
      time_modifier: 1.5,
      skill_check_modifier: 10
    },
    requires_outside_knowledge: {
      label: "Requires External Knowledge",
      description: "Heinrich needs knowledge that exists but he doesn't have — must find a teacher, book, or traveling expert first.",
      prerequisite: "must_find_knowledge_source"
    },
    impossible_1403: {
      label: "Not Achievable in 1403",
      description: "Requires materials, science, or industrial processes that do not exist. The game will explain specifically what is missing and what prerequisites are needed.",
      response: "not_possible_but_game_engages_realistically"
    }
  },

  // ─── WHAT TO DO WITH IMPOSSIBLE REQUESTS ──────────────────────────────────
  // When player suggests truly impossible inventions
  impossible_responses: [
    {
      keywords: ["electricity", "electric", "battery", "motor"],
      response: "Heinrich has a flash of intuition about moving copper and magnets creating force — but lacks the means to generate, store, or control it. The observation goes into his notes as a mystery. Perhaps in 50 years...",
      partial_credit: "notes_on_electromagnetic_phenomenon",
      precursor_possible: true,
      precursor: "lodestone_experiments"
    },
    {
      keywords: ["steam engine", "steam power"],
      response: "Heinrich can observe that boiling water produces powerful expanding vapor. He can build a rudimentary reaction device (a spinning ball-jet toy, like Hero of Alexandria's aeolipile). But harnessing it for work requires metal precision he cannot achieve.",
      partial_credit: "pressure_vessel_concept",
      toy_version_possible: true
    },
    {
      keywords: ["plastic", "polymer"],
      response: "No organic chemistry exists to understand polymers. Heinrich cannot even conceptualize what would be needed.",
      partial_credit: null
    },
    {
      keywords: ["gunpowder cannon", "artillery", "gun"],
      response: "Early cannon EXIST in 1403. They are dangerous, unreliable, and used in sieges. Heinrich can work with what exists, improve it, or encounter it. Reliable firearms are generations away.",
      partial_credit: "gunpowder_cannon_improvement_possible"
    },
    {
      keywords: ["refrigeration", "freezing", "icebox"],
      response: "Ice from winter stored in packed sawdust in underground rooms is used by the wealthy. Heinrich can build an improved ice-house with better insulation — practical and achievable.",
      partial_credit: "improved_ice_house_possible"
    }
  ]

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { INVENTION_DATA };
}

// END FILE: client/js/data/invention-data.js

// ══════════════════════════════════════════════════
// ✅ PART 3 COMPLETE
// NEXT: PART 4 — Core Engine Modules (dice, skills, combat, health)
// ══════════════════════════════════════════════════
