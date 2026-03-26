// FILE: client/js/data/punishment-data.js — PART 3

const PUNISHMENT_DATA = {

  // ─── CRIMES AND BASE PUNISHMENTS ──────────────────────────────────────────
  crimes: {

    theft: {
      id: "theft",
      name: "Theft",
      severity_tiers: [
        {
          tier: "petty",
          threshold_value: 5, // sous
          punishments: [
            { type: "fine", amount: "triple_value", probability: 0.5 },
            { type: "stocks", duration_hours: 24, probability: 0.3 },
            { type: "flogging", strokes: 10, probability: 0.2 }
          ]
        },
        {
          tier: "common",
          threshold_value: 30,
          punishments: [
            { type: "fine", amount: "triple_value", probability: 0.3 },
            { type: "flogging", strokes: 20, probability: 0.3 },
            { type: "branding", location: "hand", probability: 0.25 },
            { type: "imprisonment", duration_days: [7, 30], probability: 0.15 }
          ]
        },
        {
          tier: "grand",
          threshold_value: 200,
          punishments: [
            { type: "hand_removal", probability: 0.4 },
            { type: "hanging", probability: 0.35 },
            { type: "imprisonment", duration_days: [60, 365], probability: 0.25 }
          ]
        }
      ],
      heat_generated: 15,
      reporting_likelihood: 0.6,
      noble_victim_multiplier: 2.0,
      church_victim_multiplier: 2.5
    },

    murder: {
      id: "murder",
      name: "Murder / Homicide",
      severity_tiers: [
        {
          tier: "serf_victim",
          punishments: [
            { type: "fine", amount: "weregild_low", probability: 0.5 },
            { type: "imprisonment", duration_days: [30, 90], probability: 0.3 },
            { type: "hanging", probability: 0.2 }
          ]
        },
        {
          tier: "freeman_victim",
          punishments: [
            { type: "hanging", probability: 0.5 },
            { type: "imprisonment", duration_days: [90, 365], probability: 0.3 },
            { type: "mutilation_blinding", probability: 0.2 }
          ]
        },
        {
          tier: "noble_victim",
          punishments: [
            { type: "hanging_drawing_quartering", probability: 0.7 },
            { type: "imprisonment_life", probability: 0.2 },
            { type: "exile", probability: 0.1 }
          ]
        },
        {
          tier: "clergy_victim",
          punishments: [
            { type: "church_trial", probability: 0.5 },
            { type: "hanging", probability: 0.3 },
            { type: "excommunication_plus_secular_punishment", probability: 0.2 }
          ]
        }
      ],
      heat_generated: 50,
      reporting_likelihood: 0.8,
      justifiable_homicide_possible: true,
      trial_by_combat_possible: true
    },

    assault: {
      id: "assault",
      name: "Assault / Affray",
      severity_tiers: [
        {
          tier: "brawl",
          punishments: [
            { type: "fine", amount: 5, probability: 0.5 },
            { type: "stocks", duration_hours: 12, probability: 0.4 },
            { type: "nothing", probability: 0.1 }
          ]
        },
        {
          tier: "serious_injury",
          punishments: [
            { type: "fine", amount: 20, probability: 0.4 },
            { type: "flogging", strokes: 15, probability: 0.35 },
            { type: "imprisonment", duration_days: [7, 30], probability: 0.25 }
          ]
        },
        {
          tier: "noble_victim",
          punishments: [
            { type: "hand_removal", probability: 0.3 },
            { type: "hanging", probability: 0.3 },
            { type: "imprisonment", duration_days: [60, 180], probability: 0.4 }
          ]
        }
      ],
      heat_generated: 10,
      reporting_likelihood: 0.5
    },

    poaching: {
      id: "poaching",
      name: "Poaching",
      severity_tiers: [
        {
          tier: "rabbit",
          punishments: [
            { type: "fine", amount: 10, probability: 0.4 },
            { type: "flogging", strokes: 10, probability: 0.4 },
            { type: "ear_cropping", probability: 0.2 }
          ]
        },
        {
          tier: "deer",
          punishments: [
            { type: "blinding", probability: 0.3 },
            { type: "hand_removal", probability: 0.3 },
            { type: "hanging", probability: 0.2 },
            { type: "imprisonment", duration_days: [30, 90], probability: 0.2 }
          ]
        },
        {
          tier: "royal_forest",
          punishments: [
            { type: "hanging", probability: 0.5 },
            { type: "blinding_castration", probability: 0.3 },
            { type: "life_imprisonment", probability: 0.2 }
          ]
        }
      ],
      heat_generated: 20,
      reporting_likelihood: 0.7
    },

    heresy: {
      id: "heresy",
      name: "Heresy",
      trial_type: "church_inquisition",
      severity_tiers: [
        {
          tier: "suspected",
          punishments: [
            { type: "penance", duration_weeks: [4, 52], probability: 0.5 },
            { type: "pilgrimage_mandated", probability: 0.3 },
            { type: "fine_church", probability: 0.2 }
          ]
        },
        {
          tier: "confirmed",
          punishments: [
            { type: "excommunication", probability: 0.3 },
            { type: "imprisonment_church", probability: 0.4 },
            { type: "burning_at_stake", probability: 0.3 }
          ]
        },
        {
          tier: "relapsed",
          punishments: [
            { type: "burning_at_stake", probability: 0.9 },
            { type: "hanging", probability: 0.1 }
          ]
        }
      ],
      heat_generated: 40,
      reporting_likelihood: 0.8,
      inquisitor_required: true,
      recant_reduces_punishment: true
    },

    treason: {
      id: "treason",
      name: "High Treason",
      severity_tiers: [
        {
          tier: "minor_disloyalty",
          punishments: [
            { type: "fine", amount: "large", probability: 0.4 },
            { type: "exile", probability: 0.4 },
            { type: "imprisonment", duration_days: [90, 365], probability: 0.2 }
          ]
        },
        {
          tier: "rebellion_conspiracy",
          punishments: [
            { type: "hanging_drawing_quartering", probability: 0.6 },
            { type: "life_imprisonment", probability: 0.2 },
            { type: "exile_property_confiscated", probability: 0.2 }
          ]
        }
      ],
      heat_generated: 80,
      reporting_likelihood: 0.9,
      pardoned_by_king_possible: true
    },

    adultery: {
      id: "adultery",
      name: "Adultery",
      severity_tiers: [
        {
          tier: "suspected",
          punishments: [
            { type: "church_penance", probability: 0.6 },
            { type: "social_shame", probability: 0.4 }
          ]
        },
        {
          tier: "proven",
          punishments: [
            { type: "fine_church", probability: 0.4 },
            { type: "public_shaming", probability: 0.3 },
            { type: "exile", probability: 0.2 },
            { type: "flogging", probability: 0.1 }
          ]
        }
      ],
      heat_generated: 15,
      reporting_likelihood: 0.4
    },

    fraud: {
      id: "fraud",
      name: "Fraud / False Measures",
      severity_tiers: [
        {
          tier: "merchant_cheat",
          punishments: [
            { type: "fine_triple", probability: 0.5 },
            { type: "stocks", duration_hours: 24, probability: 0.3 },
            { type: "guild_expulsion", probability: 0.2 }
          ]
        },
        {
          tier: "document_forgery",
          punishments: [
            { type: "hand_removal", probability: 0.4 },
            { type: "imprisonment", duration_days: [30, 180], probability: 0.4 },
            { type: "branding_forehead", probability: 0.2 }
          ]
        }
      ],
      heat_generated: 20,
      reporting_likelihood: 0.5
    },

    witchcraft: {
      id: "witchcraft",
      name: "Witchcraft / Sorcery",
      trial_type: "church_plus_secular",
      severity_tiers: [
        {
          tier: "accused",
          punishments: [
            { type: "ordeal_water", probability: 0.4 },
            { type: "ordeal_fire", probability: 0.2 },
            { type: "imprisonment_pending_trial", duration_days: [30, 90], probability: 0.4 }
          ]
        },
        {
          tier: "convicted",
          punishments: [
            { type: "burning_at_stake", probability: 0.7 },
            { type: "hanging", probability: 0.2 },
            { type: "exile", probability: 0.1 }
          ]
        }
      ],
      heat_generated: 50,
      reporting_likelihood: 0.7,
      community_fear_amplifies: true
    },

    vagrancy: {
      id: "vagrancy",
      name: "Vagrancy / Unlicensed Travel",
      severity_tiers: [
        {
          tier: "first_offense",
          punishments: [
            { type: "return_to_manor", probability: 0.6 },
            { type: "flogging", strokes: 5, probability: 0.3 },
            { type: "fine", amount: 2, probability: 0.1 }
          ]
        },
        {
          tier: "repeat",
          punishments: [
            { type: "branding", location: "shoulder", probability: 0.4 },
            { type: "enserfment_to_captor", probability: 0.3 },
            { type: "ear_cropping", probability: 0.3 }
          ]
        }
      ],
      heat_generated: 8,
      reporting_likelihood: 0.4
    }
  },

  // ─── PUNISHMENT MECHANICAL EFFECTS ────────────────────────────────────────
  punishment_effects: {
    flogging: {
      wound_type: "lash_marks",
      wound_location: "torso",
      pain_duration_days: [3, 14],
      infection_risk: 0.15,
      scar_probability: 0.4,
      reputation_criminal: 5,
      reputation_local: -10
    },
    stocks: {
      location_locked: true,
      social_humiliation: true,
      attack_vulnerable: true,
      reputation_local: -15,
      mental_state_penalty: 10
    },
    branding: {
      permanent_scar: true,
      scar_visible: true,
      reputation_criminal: 20,
      npc_reaction_modifier: -20,
      disguise_harder: true
    },
    hand_removal: {
      permanent_injury: "right_hand",
      skill_penalties: { smithing: -3, carpentry: -3, sword: -5, agriculture: -2 },
      reputation_criminal: 30,
      npc_reaction_modifier: -15,
      never_forgotten: true
    },
    blinding: {
      permanent_injury: "eyes",
      skill_penalties: { archery: -10, hunting: -5, read_people: -3 },
      navigation_impossible: true,
      never_forgotten: true
    },
    ear_cropping: {
      permanent_scar: true,
      scar_visible: true,
      reputation_criminal: 15,
      disguise_harder: true
    },
    hanging: {
      death: true
    },
    hanging_drawing_quartering: {
      death: true,
      remains_displayed: true,
      family_reputation_penalty: 30
    },
    burning_at_stake: {
      death: true,
      crowd_witness: true,
      notoriety_massive: true
    },
    imprisonment: {
      location: "dungeon",
      skill_atrophy_per_month: 1,
      health_penalty_per_month: 5,
      escape_plan_possible: true,
      ransom_possible: true
    },
    life_imprisonment: {
      permanent: true,
      escape_only_resolution: true
    },
    exile: {
      banned_from_region: true,
      property_confiscated: true,
      return_penalty: "death"
    },
    excommunication: {
      church_services_forbidden: true,
      npc_reaction_pious: -30,
      burial_denied: true,
      lifting_possible: "penance_or_deed"
    },
    penance: {
      time_cost: true,
      piety_increase: 10,
      reputation_church: 5
    },
    fine: {
      coin_removed: true,
      default_triggers_secondary_punishment: true
    },
    stocks: {
      time_cost_hours: 24,
      social_humiliation: true,
      vulnerability_to_abuse: true
    },
    ordeal_water: {
      survival_rolls: true,
      divine_judgment_fiction: true,
      outcome_random: true
    },
    ordeal_fire: {
      survival_rolls: true,
      wound_guaranteed: true,
      burn_wounds: true
    }
  },

  // ─── REGIONAL VARIATIONS ──────────────────────────────────────────────────
  regional_modifiers: {
    normandy_rural: {
      strictness: 0.7,
      lord_authority: 0.8,
      church_influence: 0.7,
      common_leniency_for_serfs: true,
      bribe_effectiveness: 0.6
    },
    paris: {
      strictness: 0.9,
      royal_law_prominent: true,
      church_influence: 0.8,
      guild_courts: true,
      bribe_effectiveness: 0.5
    },
    coastal_normandy: {
      strictness: 0.6,
      maritime_law_applies: true,
      smuggling_tolerance: 0.7,
      bribe_effectiveness: 0.7
    },
    english_occupied: {
      strictness: 1.0,
      occupier_bias: true,
      french_defendant_penalty: 0.3,
      bribe_effectiveness: 0.4
    }
  },

  // ─── TRIAL TYPES ──────────────────────────────────────────────────────────
  trial_types: {
    manorial_court: {
      judge: "lord_or_steward",
      appeals_possible: true,
      defendant_speaks: true,
      witnesses_allowed: true,
      bribe_possible: true,
      speech_skill_matters: true,
      law_skill_matters: false,
      typical_duration_days: 1
    },
    royal_court: {
      judge: "royal_magistrate",
      appeals_to_king: true,
      defendant_speaks: true,
      lawyer_possible: true,
      bribe_risky: true,
      law_skill_matters: true,
      speech_skill_matters: true,
      typical_duration_days: [3, 14]
    },
    church_court: {
      judge: "bishop_or_inquisitor",
      canon_law_applies: true,
      torture_possible: true,
      recantation_reduces_sentence: true,
      theology_skill_matters: true,
      typical_duration_days: [7, 60]
    },
    trial_by_combat: {
      conditions: ["accused_noble", "accuser_agrees", "lord_permits"],
      winner_vindicated: true,
      champion_possible: true,
      combat_to_submission_or_death: true,
      skills_relevant: ["sword", "brawling", "unarmed"]
    },
    trial_by_ordeal: {
      types: ["water", "fire", "combat"],
      divine_intervention_fiction: true,
      actual_outcome: "survival_check",
      church_oversees: true
    }
  },

  // ─── ESCAPE FROM PUNISHMENT ───────────────────────────────────────────────
  escape_options: {
    before_capture: {
      flee_to_forest: { success_base: 0.5, skills: ["survival", "stealth"], heat_increase: 20 },
      bribe_witness: { success_base: 0.4, skills: ["haggle", "deception"], cost: 50 },
      destroy_evidence: { success_base: 0.3, skills: ["deception", "stealth"] },
      claim_benefit_of_clergy: {
        success_base: 0.6,
        conditions: ["can_read", "tonsure_present"],
        skills: ["theology", "deception"]
      }
    },
    during_trial: {
      eloquent_defense: { skills: ["speech", "law"], modifies_sentence: true },
      character_witnesses: { conditions: ["has_reputation", "reputation_min_40"] },
      bribe_judge: { cost_base: 200, risk_if_detected: "additional_charge" },
      claim_insanity: { skills: ["deception", "performance"], rarely_works: true }
    },
    from_prison: {
      file_bars: { time_required: "weeks", item_required: "file" },
      bribe_guard: { cost_base: 50, detection_risk: 0.3 },
      tunnel: { time_required: "months", skill: "carpentry" },
      overpowering_guard: { skill: "brawling", minimum_level: 5, injury_risk: true },
      window_rope: { skill: "climbing", item_required: "rope", height_matters: true },
      inside_help: { requires_ally_planted: true },
      official_pardon: { requires_high_reputation_patron: true }
    }
  }

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PUNISHMENT_DATA };
}

// END FILE: client/js/data/punishment-data.js
