// FILE: client/js/data/disease-data.js — PART 3

const DISEASE_DATA = {

  diseases: {

    // ─── COMMON AILMENTS ─────────────────────────────────────────────────────
    winter_fever: {
      id: "winter_fever",
      name: "Winter Fever",
      category: "common",
      cause: ["cold_exposure", "wet_conditions", "poor_nutrition"],
      infection_method: "airborne",
      incubation_days: [2, 5],
      duration_days: [7, 21],
      symptoms: ["high_fever", "sweating", "weakness", "coughing"],
      mechanical_effects: {
        fatigue_penalty: 20,
        strength_penalty: 3,
        endurance_penalty: 2,
        rest_required: true
      },
      mortality_rate: {
        healthy_adult: 0.02,
        malnourished: 0.08,
        elderly: 0.15,
        child: 0.12
      },
      treatment: {
        bed_rest: { effectiveness: 0.6, time_days: 5 },
        willow_bark_tea: { effectiveness: 0.4, reduces_fever: true },
        sweating_cure: { effectiveness: 0.3, old_folk_remedy: true },
        physician_medicine: { effectiveness: 0.7, cost: 5 }
      },
      contagion_radius: "household",
      spread_per_turn: 0.1
    },

    wound_infection: {
      id: "wound_infection",
      name: "Wound Fever / Corruption",
      category: "wound_complication",
      cause: ["untreated_wound", "dirty_water_exposure", "surgery_complications"],
      infection_method: "direct_contact",
      incubation_days: [1, 3],
      duration_days: [3, 30],
      symptoms: ["red_hot_swelling", "pus", "fever", "delirium"],
      mechanical_effects: {
        wound_location: "affected_wound_site",
        pain_constant: true,
        fatigue_extreme: true,
        delirium_at_severe: true,
        limb_loss_possible: true
      },
      severity_stages: [
        { stage: "early", day_range: [1, 3], description: "Wound reddens and swells. Foul smell of corruption.", mortality: 0.05 },
        { stage: "moderate", day_range: [4, 7], description: "Fever climbs. Streaks of red spread from wound.", mortality: 0.2 },
        { stage: "severe", day_range: [8, 14], description: "Full corruption. Amputation the only cure.", mortality: 0.5 },
        { stage: "terminal", day_range: [15, 30], description: "Blood poisoning. The end approaches.", mortality: 0.9 }
      ],
      treatment: {
        clean_wound: { effectiveness: 0.7, time_days: 1, skill: "medicine" },
        maggot_debridement: { effectiveness: 0.8, time_days: 3, skill: "medicine", level: 3 },
        cauterization: { effectiveness: 0.6, additional_wound: true, pain_extreme: true },
        amputation: { effectiveness: 0.9, permanent_injury: true, skill: "medicine", level: 5 },
        honey_pack: { effectiveness: 0.4, antimicrobial: true },
        prayer: { effectiveness: 0.0, perceived_effectiveness: 0.5 }
      },
      contagion_radius: null
    },

    dysentery: {
      id: "dysentery",
      name: "Bloody Flux / Dysentery",
      category: "gastrointestinal",
      cause: ["contaminated_water", "contaminated_food", "camp_conditions", "crowded_populations"],
      infection_method: "fecal_oral",
      incubation_days: [1, 7],
      duration_days: [7, 30],
      symptoms: ["bloody_stool", "severe_cramps", "dehydration", "weakness"],
      mechanical_effects: {
        fatigue_penalty: 25,
        strength_penalty: 4,
        cannot_travel_at_full_speed: true,
        hunger_neutral: true,
        thirst_extreme: true
      },
      mortality_rate: {
        healthy_adult: 0.05,
        malnourished: 0.2,
        army_camp: 0.15,
        child: 0.25
      },
      treatment: {
        clean_water: { effectiveness: 0.6, prevents_spreading: true },
        blackberry_remedy: { effectiveness: 0.4, folk_medicine: true },
        rice_water: { effectiveness: 0.3, hydration: true },
        physician_tincture: { effectiveness: 0.65, cost: 8 }
      },
      contagion_radius: "camp_or_household",
      spread_per_turn: 0.2,
      army_impact: "devastating"
    },

    plague_bubonic: {
      id: "plague_bubonic",
      name: "The Black Death / Bubonic Plague",
      category: "epidemic",
      cause: ["rats_fleas"],
      infection_method: ["flea_bite", "direct_contact_with_infected"],
      incubation_days: [2, 7],
      duration_days: [3, 7],
      symptoms: ["fever_extreme", "black_buboes", "vomiting_blood", "skin_blackening", "madness"],
      mechanical_effects: {
        fatigue_extreme: true,
        strength_penalty: 8,
        pain_extreme: true,
        mental_breakdown_possible: true,
        immediate_quarantine_npc_reaction: true
      },
      stages: [
        { stage: "onset", days: [1, 2], description: "Sudden fever. Chills. A bubo swells in groin or armpit." },
        { stage: "crisis", days: [3, 5], description: "Buboes blacken. Delirium. The skin begins to die." },
        { stage: "resolution", days: [6, 7], description: "Either death or — rarely — the fever breaks." }
      ],
      mortality_rate: 0.6,
      survivor_effects: ["immunity_partial", "scar_tissue_bubo_sites", "mental_trauma"],
      treatment: {
        lancing_buboes: { effectiveness: 0.3, skill: "medicine", level: 4, pain_extreme: true },
        isolation: { effectiveness: "slows_spread", individual_survival: 0.0 },
        theriac: { effectiveness: 0.1, expensive: true, cost: 100 },
        prayer: { effectiveness: 0.0, perceived_effectiveness: 0.9 }
      },
      contagion_radius: "city",
      spread_per_turn: 0.4,
      city_shutdown: true,
      npc_mortality_wave: true
    },

    plague_pneumonic: {
      id: "plague_pneumonic",
      name: "Pneumonic Plague",
      category: "epidemic",
      cause: ["inhaling_infected_cough"],
      infection_method: "airborne",
      incubation_days: [1, 3],
      duration_days: [2, 4],
      symptoms: ["coughing_blood", "fever_extreme", "burning_chest", "rapid_deterioration"],
      mechanical_effects: {
        rapid_death: true,
        cannot_speak: true,
        fatigue_complete: true
      },
      mortality_rate: 0.95,
      treatment: {
        isolation: { effectiveness: "only_option" },
        prayer: { effectiveness: 0.0 }
      },
      contagion_radius: "city_fast",
      spread_per_turn: 0.6
    },

    leprosy: {
      id: "leprosy",
      name: "Leprosy / St. Lazarus's Disease",
      category: "chronic",
      cause: ["prolonged_contact_with_infected"],
      infection_method: "prolonged_skin_contact",
      incubation_days: [365, 1825], // 1-5 years
      duration: "lifelong",
      symptoms: ["skin_lesions", "numbness", "facial_disfigurement", "finger_loss"],
      progression_years: [5, 30],
      mechanical_effects_early: {
        skin_discoloration: true,
        numbness_fingers: true,
        npc_reaction_slight_suspicion: true
      },
      mechanical_effects_advanced: {
        disfigurement: true,
        npc_reaction_horror: true,
        excluded_from_society: true,
        bell_required: true,
        cannot_enter_town: true,
        skill_penalties: { all_physical: -3 }
      },
      treatment: {
        none_effective: true,
        lazar_house_care: { slows_progression: 0.2, social_removal: true }
      },
      social_effects: {
        leper_colony_mandatory: true,
        property_confiscated: true,
        marriage_dissolved: true,
        church_ceremony_performed: "mock_funeral"
      }
    },

    typhus: {
      id: "typhus",
      name: "Typhus / Camp Fever / Jail Fever",
      category: "epidemic",
      cause: ["lice", "crowded_filthy_conditions"],
      infection_method: "louse_bite",
      incubation_days: [8, 14],
      duration_days: [14, 30],
      symptoms: ["fever_high", "rash_spreading", "headache_severe", "delirium", "muscle_pain"],
      mechanical_effects: {
        fatigue_extreme: true,
        strength_penalty: 6,
        delirium_possible: true,
        incapacitated_days_possible: [3, 14]
      },
      mortality_rate: {
        healthy_adult: 0.15,
        prison: 0.4,
        army_camp: 0.3,
        malnourished: 0.35
      },
      treatment: {
        rest: { effectiveness: 0.4 },
        clean_clothes_delousing: { effectiveness: 0.5, prevents_spread: true },
        physician_wine_tincture: { effectiveness: 0.5, cost: 10 }
      },
      contagion_radius: "close_quarters",
      spread_per_turn: 0.3
    },

    smallpox: {
      id: "smallpox",
      name: "Smallpox / Great Pox",
      category: "epidemic",
      cause: ["airborne", "direct_contact"],
      infection_method: ["airborne", "contact"],
      incubation_days: [7, 17],
      duration_days: [14, 28],
      symptoms: ["fever", "pus_filled_pocks_all_body", "blindness_possible", "intense_pain"],
      mechanical_effects: {
        fatigue_extreme: true,
        pain_constant: true,
        blindness_risk: 0.1,
        disfigurement_risk: 0.5
      },
      mortality_rate: {
        healthy_adult: 0.3,
        child: 0.5,
        elderly: 0.6
      },
      survivor_effects: ["pock_scars_permanent", "immunity_lifetime"],
      treatment: {
        cool_baths: { effectiveness: 0.3, comfort_only: true },
        isolation: { prevents_spread: true },
        physician: { effectiveness: 0.4, cost: 20 }
      },
      contagion_radius: "village",
      spread_per_turn: 0.35
    },

    venereal_disease: {
      id: "venereal_disease",
      name: "The French Disease / Sweating Sickness",
      category: "chronic",
      cause: ["sexual_contact"],
      infection_method: "sexual",
      incubation_days: [10, 90],
      duration: "lifelong_untreated",
      symptoms_primary: ["sores_genitalia", "rash"],
      symptoms_secondary: ["rash_body", "hair_loss", "ulcers"],
      symptoms_tertiary: ["madness", "organ_failure", "death"],
      mechanical_effects_primary: {
        seduction_penalty: -5,
        npc_reaction_if_discovered: "horror"
      },
      mechanical_effects_tertiary: {
        mental_state_deterioration: true,
        intelligence_penalty: 3,
        death_possible: true
      },
      treatment: {
        mercury_treatment: { effectiveness: 0.5, toxicity_side_effects: true, skill: "medicine", level: 3, cost: 30 },
        guaiacum_wood: { effectiveness: 0.3, expensive: true, cost: 50 }
      },
      social_effects: {
        shame_if_discovered: true,
        marriage_impact: true,
        npc_shunning: true
      },
      contagion_method: "sexual"
    },

    ergotism: {
      id: "ergotism",
      name: "St. Anthony's Fire / Ergotism",
      category: "poisoning",
      cause: ["eating_infected_rye_or_grain"],
      infection_method: "ingestion",
      incubation_days: [1, 7],
      duration_days: [7, 60],
      types: ["gangrenous", "convulsive"],
      symptoms_gangrenous: ["burning_limbs", "dry_gangrene", "blackening_extremities"],
      symptoms_convulsive: ["spasms", "hallucinations", "crawling_skin_sensation", "mania"],
      mechanical_effects: {
        hallucination_type: "visions",
        limb_loss_possible: true,
        mental_breakdown_possible: true,
        npc_interpretation: "witchcraft_or_divine_punishment"
      },
      mortality_rate: {
        gangrenous_severe: 0.3,
        convulsive: 0.1
      },
      treatment: {
        stop_eating_infected_grain: { effectiveness: 0.8, obvious_in_hindsight: true },
        hospital_saint_anthony: { effectiveness: 0.5, geographically_distant: true }
      },
      contagion_radius: null,
      village_wide_possible: true
    },

    consumption: {
      id: "consumption",
      name: "Consumption / Lung Rot",
      category: "chronic",
      cause: ["prolonged_exposure_to_infected", "cold_damp_conditions"],
      infection_method: "airborne",
      incubation_days: [30, 730],
      duration: "months_to_years",
      symptoms: ["persistent_cough", "blood_in_sputum", "weight_loss", "night_sweats", "pallor"],
      progression_stages: [
        { stage: "early", months: [1, 6], description: "A persistent cough the healers dismiss.", mortality: 0.05 },
        { stage: "moderate", months: [7, 18], description: "Blood in the cloth. Breath shortens. Weight falls away.", mortality: 0.3 },
        { stage: "advanced", months: [19, 36], description: "The pale wasting. The beautiful death men whisper of.", mortality: 0.8 }
      ],
      mechanical_effects: {
        endurance_penalty_progressive: true,
        stamina_reduced: true,
        attractive_pallor_effect: "paradoxically_attractive_in_early_stages",
        npc_sympathy: true
      },
      treatment: {
        mountain_air: { effectiveness: 0.4, slows_progression: true },
        rest_and_good_food: { effectiveness: 0.3 },
        theriac: { effectiveness: 0.1, cost: 80 }
      },
      npc_death_common: true
    }
  },

  // ─── TREATMENT MECHANICS ─────────────────────────────────────────────────
  treatment_mechanics: {
    medicine_skill_levels: {
      0: "Knows nothing. Can offer water and prayer.",
      1: "Knows folk remedies. Can set simple bones. Reduce duration by 10%.",
      2: "Herbalist level. Can treat wounds competently. Reduce duration by 20%.",
      3: "Trained healer. Can identify diseases confidently. Reduce mortality by 20%.",
      4: "Advanced practitioner. Can amputate. Can treat plague-adjacent conditions. Reduce mortality by 35%.",
      5: "Master physician. Can treat almost anything available in 1403. Reduce mortality by 50%.",
      6: "Legendary healer. Approaches understanding of germ theory (unnamed). Reduce mortality by 65%."
    },
    herbalism_branch: {
      willow_bark: { effect: "fever_reduction", availability: "common_forest" },
      garlic: { effect: "antiseptic_minor", availability: "common" },
      honey: { effect: "wound_sealing_antimicrobial", availability: "common" },
      comfrey: { effect: "bone_healing", availability: "common_meadow" },
      elderflower: { effect: "fever_sweat", availability: "spring_summer" },
      yarrow: { effect: "wound_bleeding_stop", availability: "meadow" },
      valerian: { effect: "sleep_induction_pain_reduction", availability: "uncommon" },
      poppy: { effect: "pain_elimination", availability: "uncommon_expensive" },
      mandrake: { effect: "surgery_anaesthesia_crude", availability: "rare_expensive", toxicity_risk: true }
    }
  },

  // ─── DISEASE SPREAD MECHANICS ─────────────────────────────────────────────
  spread_mechanics: {
    factors_that_increase_spread: [
      "crowded_conditions",
      "poor_sanitation",
      "unclean_water",
      "rats_present",
      "malnourished_population",
      "cold_wet_weather",
      "market_days",
      "pilgrimages"
    ],
    factors_that_reduce_spread: [
      "isolation",
      "clean_water",
      "good_nutrition",
      "medicine_skill_in_population",
      "quarantine_enforced",
      "cold_dry_weather"
    ],
    heinrich_exposure_risks: {
      city: 0.15,
      crowded_tavern: 0.1,
      hospital_visit: 0.2,
      attending_sick: 0.25,
      battlefield: 0.3,
      prison: 0.35,
      village: 0.05,
      wilderness: 0.02
    }
  }

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DISEASE_DATA };
}

// END FILE: client/js/data/disease-data.js
