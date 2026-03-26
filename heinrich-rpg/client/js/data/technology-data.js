// FILE: client/js/data/technology-data.js — PART 3

const TECHNOLOGY_DATA = {

  // ─── EXISTING TECHNOLOGIES IN 1403 ────────────────────────────────────────
  // Technologies that existed and are spreading/being adopted in 1403
  known_technologies: {

    agriculture: {
      three_field_rotation: {
        id: "three_field_rotation",
        name: "Three-Field Crop Rotation",
        status: "widespread",
        description: "Two fields cultivated, one fallow per year. Standard in France by 1403.",
        year_introduced: 900,
        regions_adopted: ["france", "england", "germany"],
        mechanical_benefit: { yield_bonus: 0.15, soil_maintenance: true },
        prerequisite: null
      },
      heavy_plow: {
        id: "heavy_plow",
        name: "Heavy Iron Plow",
        status: "widespread",
        year_introduced: 1000,
        description: "Turns heavy northern soils. Horse-drawn when affordable.",
        mechanical_benefit: { agriculture_efficiency: 0.25 }
      },
      horse_collar: {
        id: "horse_collar",
        name: "Padded Horse Collar",
        status: "common",
        year_introduced: 900,
        description: "Allows horses to pull without choking. Replaced oxen on better farms.",
        mechanical_benefit: { plow_speed: 0.4, field_coverage: 0.3 }
      },
      windmill_post: {
        id: "windmill_post",
        name: "Post Windmill",
        status: "spreading",
        year_introduced: 1100,
        description: "Turns wind to grinding. Common in flat regions.",
        mechanical_benefit: { grain_processing: 3.0 },
        construction_skill: "carpentry",
        construction_skill_min: 5
      },
      water_mill: {
        id: "water_mill",
        name: "Undershot Water Mill",
        status: "widespread",
        year_introduced: 500,
        description: "Running water turns millstones. Lords control most of them — serfs must pay.",
        mechanical_benefit: { grain_processing: 2.0 }
      }
    },

    metallurgy: {
      blast_furnace_proto: {
        id: "blast_furnace_proto",
        name: "Advanced Bloomery Furnace",
        status: "rare",
        year_introduced_europe: 1380,
        description: "Larger, hotter furnaces producing better iron. Earliest blast furnaces appearing.",
        mechanical_benefit: { iron_quality: 0.3, output_increase: 0.5 },
        regions_leading: ["germany", "sweden"]
      },
      tempering: {
        id: "tempering",
        name: "Steel Tempering",
        status: "known_among_masters",
        description: "Heating and cooling steel to improve hardness and flexibility.",
        skill_required: { smithing: 6 },
        mechanical_benefit: { weapon_quality: 0.4, armor_quality: 0.3 }
      },
      full_plate_armor: {
        id: "full_plate_armor",
        name: "Full Plate Armor",
        status: "emerging_high_end",
        year_introduced_concept: 1350,
        description: "Full articulated plate replacing chainmail. Enormously expensive.",
        availability: "only_major_armorsmiths",
        cost_multiplier: 20
      }
    },

    navigation: {
      magnetic_compass: {
        id: "magnetic_compass",
        name: "Magnetic Compass",
        status: "widespread_sailors",
        year_introduced_europe: 1100,
        description: "Needle points north. Safe night sailing. Longer open-water voyages.",
        mechanical_benefit: { sea_navigation: 0.5, night_sailing_possible: true }
      },
      portolan_charts: {
        id: "portolan_charts",
        name: "Portolan Sea Charts",
        status: "available_ports",
        description: "Detailed coastal charts with compass bearings.",
        cost: 50,
        mechanical_benefit: { sea_navigation: 0.3, safety_margin: 0.2 }
      },
      caravel_proto: {
        id: "caravel_proto",
        name: "Lateen-Rigged Vessel",
        status: "emerging_portugal",
        year_introduced: 1420,
        description: "Can sail closer to wind. Will transform ocean exploration.",
        regions_leading: ["portugal", "spain"]
      }
    },

    construction: {
      flying_buttress: {
        id: "flying_buttress",
        name: "Gothic Flying Buttress",
        status: "established",
        year_introduced: 1150,
        description: "Transfers wall weight outward. Allows soaring windows. Cathedrals possible.",
        skill_required: { engineering: 5, architecture: true }
      },
      pointed_arch: {
        id: "pointed_arch",
        name: "Pointed Arch",
        status: "standard",
        description: "Distributes weight better than round arch. Foundation of Gothic.",
        mechanical_benefit: { structure_strength: 0.3 }
      },
      hoisting_crane: {
        id: "hoisting_crane",
        name: "Great Wheel Crane",
        status: "used_at_major_sites",
        description: "Human-powered hoist for heavy stone. Essential for cathedral building.",
        mechanical_benefit: { construction_speed: 0.4 }
      }
    },

    printing_proto: {
      block_printing: {
        id: "block_printing",
        name: "Wood Block Printing",
        status: "rare_in_europe",
        year_introduced_europe: 1300,
        regions_leading: ["germany", "netherlands"],
        description: "Carving entire pages in wood to print multiples. Slow, single-purpose.",
        mechanical_benefit: { document_reproduction: true }
      }
    },

    chemistry: {
      gunpowder: {
        id: "gunpowder",
        name: "Gunpowder",
        status: "known_emerging",
        year_introduced_europe: 1300,
        description: "Saltpeter, charcoal, sulfur. Early cannon exist but are unreliable.",
        availability: "military_only",
        regions_leading: ["germany", "england"],
        cannon_status: "primitive_dangerous"
      },
      distillation: {
        id: "distillation",
        name: "Alembic Distillation",
        status: "known_alchemists",
        description: "Producing aqua vitae and medicinal spirits.",
        skill_required: { medicine: 4, engineering: 2 }
      }
    }
  },

  // ─── TECHNOLOGIES THAT CAN BE DISCOVERED/IMPROVED ─────────────────────────
  improvable_technologies: [
    {
      id: "four_field_rotation",
      name: "Four-Field Crop Rotation System",
      base_technology: "three_field_rotation",
      description: "Adding a fourth field allows for nitrogen-fixing crops (legumes), eliminating the fallow year entirely and increasing yields dramatically.",
      historical_note: "Four-field rotation was practiced in parts of Flanders by 1400 but not in Normandy. Heinrich could introduce it genuinely.",
      required_skills: { agriculture: 6, stewardship: 3 },
      required_resources: ["land_access", "seed_legumes", "patient_farmers"],
      development_turns: 12,
      development_location: ["farm", "estate"],
      yield_bonus: 0.35,
      adoption_difficulty: "medium",
      opposition: ["traditional_farmers", "lord_who_benefits_from_fallow_herding_rights"]
    },
    {
      id: "improved_windmill",
      name: "Rotating-Cap Windmill (Tower Mill)",
      base_technology: "windmill_post",
      description: "A fixed tower with only the cap and sails rotating to catch wind from any direction. Far more efficient than the post mill which must be repositioned.",
      historical_note: "Tower mills appeared in Europe around 1390-1400. Heinrich could build one early.",
      required_skills: { carpentry: 6, engineering: 3 },
      required_resources: ["stone_or_strong_timber", "skilled_carpenters", "millstone", "capital_100_livres"],
      development_turns: 20,
      efficiency_multiplier: 1.6,
      income_potential: "high"
    },
    {
      id: "sanitation_basics",
      name: "Improved Sanitation System",
      description: "Covered latrines, clean water sourcing separate from waste disposal, hand washing protocols — simple measures that save countless lives.",
      historical_note: "Germ theory is centuries away, but association of filth with disease is observable. Heinrich can develop rules based on outcomes without understanding the mechanism.",
      required_skills: { medicine: 3, engineering: 2, stewardship: 3 },
      required_resources: ["authority_to_impose_rules", "labor_for_construction"],
      development_turns: 8,
      mortality_reduction: 0.3,
      disease_resistance_bonus: 0.25,
      adoption_difficulty: "hard",
      opposition: ["townspeople_who_find_it_strange", "religious_who_see_body_as_unimportant"]
    },
    {
      id: "double_entry_bookkeeping",
      name: "Double-Entry Bookkeeping",
      description: "Recording debits and credits in parallel columns — a system used by Italian merchants for financial clarity and fraud prevention.",
      historical_note: "Luca Pacioli formalized it in 1494, but proto-systems existed in Italian trading houses by 1300. Heinrich could introduce it to northern France.",
      required_skills: { stewardship: 4, reading: 3 },
      required_resources: ["literacy", "ink_and_parchment"],
      development_turns: 6,
      economic_clarity_bonus: 0.4,
      fraud_detection: true,
      adoption_difficulty: "easy_for_literate"
    },
    {
      id: "water_powered_hammer",
      name: "Water-Powered Trip Hammer",
      description: "A water wheel driving a large hammer through a cam mechanism — mechanizing the heaviest smithing work.",
      historical_note: "Water-powered hammers existed in Europe by 1200. Installing one requires significant capital and a good water source.",
      required_skills: { smithing: 4, carpentry: 5, engineering: 3 },
      required_resources: ["fast_running_water", "timber_heavy", "iron_fittings", "capital_200_livres"],
      development_turns: 15,
      smithing_output_multiplier: 3.0,
      skill_requirement_reduction: 1 // skilled labor required decreases
    }
  ],

  // ─── TECHNOLOGY ADOPTION MECHANICS ───────────────────────────────────────
  adoption_mechanics: {
    stages: [
      { stage: "awareness", description: "Local community learns of the innovation." },
      { stage: "trial", description: "A few early adopters try it, watched skeptically." },
      { stage: "proof", description: "Results are visible. Others begin to consider." },
      { stage: "growth", description: "Adoption spreads. Resistors are in minority." },
      { stage: "mainstream", description: "Standard practice." },
      { stage: "ubiquitous", description: "The old way is forgotten." }
    ],
    speed_modifiers: {
      visible_benefit: 2.0,
      lord_endorsement: 1.5,
      church_endorsement: 1.3,
      fear_of_change: 0.5,
      cost_prohibitive: 0.3,
      requires_literacy: 0.4
    },
    resistor_types: [
      "fearful_traditionalists",
      "guilds_protecting_monopoly",
      "church_suspicious_of_change",
      "lords_protecting_existing_revenue",
      "competitors_threatened"
    ]
  },

  // ─── HISTORICAL INNOVATION TIMELINE ──────────────────────────────────────
  future_innovations: {
    // Things that will happen historically — Heinrich might witness or influence
    printing_press: {
      historical_year: 1440,
      inventor: "Johannes Gutenberg",
      precursors_exist_in_1403: true,
      heinrich_can_attempt: true, // See invention-data.js
      world_impact: "transforms_civilization"
    },
    age_of_exploration: {
      historical_year: 1487,
      precursors: "portuguese_exploration_already_underway"
    },
    renaissance_art: {
      historical_year: "ongoing",
      note: "Italian Renaissance in full flower in 1403 — Heinrich could encounter it if traveling south"
    }
  }

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TECHNOLOGY_DATA };
}

// END FILE: client/js/data/technology-data.js
