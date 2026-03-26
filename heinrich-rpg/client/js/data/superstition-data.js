// FILE: client/js/data/superstition-data.js — PART 3

const SUPERSTITION_DATA = {

  // ─── OMENS ────────────────────────────────────────────────────────────────
  omens: {
    bad_omens: [
      {
        id: "omen_crow_roof",
        name: "Crow Lands on Roof",
        description: "A crow—black as sin—settles on the thatch above and will not be driven off.",
        superstition_cost: 3,
        mechanical_effect: { type: "morale_penalty", value: -5, duration_days: 3 },
        npc_reaction: "NPCs in the area cross themselves and speak in low voices.",
        counters: ["ring_church_bell", "burn_rosemary", "make_sign_of_cross"],
        counter_restores: 6,
        probability_trigger: 0.04
      },
      {
        id: "omen_black_cat",
        name: "Black Cat Crosses Path",
        description: "A black cat darts across the road from left to right.",
        superstition_cost: 2,
        mechanical_effect: { type: "luck_penalty", value: -5, duration_hours: 24 },
        npc_reaction: "Travel companions spit over their left shoulder.",
        counters: ["turn_around_thrice", "walk_alternate_path"],
        counter_restores: 4,
        probability_trigger: 0.06
      },
      {
        id: "omen_broken_mirror",
        name: "Broken Reflection",
        description: "A polished surface shatters, fracturing your reflection into a dozen pieces.",
        superstition_cost: 5,
        mechanical_effect: { type: "luck_penalty", value: -10, duration_days: 7 },
        npc_reaction: "Strong NPCs are visibly disturbed.",
        counters: ["seven_days_prayers", "church_blessing"],
        counter_restores: 8,
        probability_trigger: 0.02
      },
      {
        id: "omen_owl_daylight",
        name: "Owl in Daylight",
        description: "An owl hoots and blinks in broad daylight—utterly unnatural.",
        superstition_cost: 4,
        mechanical_effect: { type: "death_nearby_warning", value: true, duration_days: 7 },
        npc_reaction: "Old women weep. Children are kept indoors.",
        counters: ["church_prayer", "protective_charm"],
        counter_restores: 5,
        probability_trigger: 0.03
      },
      {
        id: "omen_salt_spill",
        name: "Salt Spilled",
        description: "Salt—precious as silver—spills across the table.",
        superstition_cost: 2,
        mechanical_effect: { type: "luck_penalty", value: -5, duration_hours: 12 },
        npc_reaction: "Tavern goes quiet briefly.",
        counters: ["throw_pinch_over_left_shoulder"],
        counter_restores: 4,
        probability_trigger: 0.07
      },
      {
        id: "omen_dog_howl",
        name: "Dogs Howl All Night",
        description: "The dogs howl from sunset to sunrise. They can smell what men cannot.",
        superstition_cost: 4,
        mechanical_effect: { type: "sleep_penalty", value: -3, duration_days: 1 },
        npc_reaction: "No one leaves their home until dawn.",
        counters: ["hang_garlic", "place_iron_at_threshold"],
        counter_restores: 5,
        probability_trigger: 0.05
      },
      {
        id: "omen_moon_blood",
        name: "Moon Turns Red",
        description: "The moon rises the color of old blood. The sky is ominously clear.",
        superstition_cost: 6,
        mechanical_effect: { type: "violence_increased", value: 0.2, duration_days: 3 },
        npc_reaction: "People bar their doors. Grudges surface.",
        counters: ["mass_prayer", "procession_with_candles"],
        counter_restores: 8,
        probability_trigger: 0.02
      },
      {
        id: "omen_double_birth",
        name: "Twins Born (ill omen reading)",
        description: "A woman in the village delivers twins. Some see double good fortune; others see the devil's work.",
        superstition_cost: 3,
        mechanical_effect: { type: "npc_tension", value: 15, duration_days: 14 },
        npc_reaction: "Divided reaction — joy from some, fear from others.",
        counters: ["church_blessing_of_infants"],
        counter_restores: 4,
        probability_trigger: 0.03
      },
      {
        id: "omen_eclipse",
        name: "Eclipse of the Sun",
        description: "Darkness falls in midday. Birds roost. Men kneel in the road.",
        superstition_cost: 10,
        mechanical_effect: { type: "universal_fear", value: true, duration_days: 7 },
        npc_reaction: "Mass prayer. Some flagellate. Others flee. Markets close.",
        counters: ["major_church_ceremony", "pilgrimage"],
        counter_restores: 10,
        probability_trigger: 0.005
      }
    ],

    good_omens: [
      {
        id: "omen_white_dove",
        name: "White Dove Lands On You",
        description: "A white dove descends and rests on your extended arm as if tame.",
        superstition_bonus: 5,
        mechanical_effect: { type: "piety_bonus", value: 10, duration_days: 3 },
        npc_reaction: "Onlookers whisper of divine favor.",
        probability_trigger: 0.02
      },
      {
        id: "omen_rainbow_sunrise",
        name: "Rainbow at Sunrise",
        description: "A full arch of color spans the east as the sun rises. Promise.",
        superstition_bonus: 3,
        mechanical_effect: { type: "luck_bonus", value: 5, duration_days: 1 },
        npc_reaction: "Farmers take it as rain and sun both blessed.",
        probability_trigger: 0.05
      },
      {
        id: "omen_church_bells_untouched",
        name: "Bells Ring Without Wind",
        description: "Church bells toll gently though no one pulls the rope and the air is still.",
        superstition_bonus: 7,
        mechanical_effect: { type: "piety_bonus", value: 15, duration_days: 7 },
        npc_reaction: "Priest declares it divine sign. Confession lines triple.",
        probability_trigger: 0.01
      },
      {
        id: "omen_horseshoe_found",
        name: "Horseshoe Found in Road",
        description: "An iron horseshoe lies in the dust, still gleaming.",
        superstition_bonus: 3,
        mechanical_effect: { type: "luck_bonus", value: 8, duration_days: 30 },
        npc_reaction: "Minor — some smile, others are indifferent.",
        probability_trigger: 0.06,
        item_gained: "lucky_horseshoe"
      },
      {
        id: "omen_four_leaf_clover",
        name: "Four-Leaf Clover",
        description: "You bend down and there it is — four leaves where three should be.",
        superstition_bonus: 4,
        mechanical_effect: { type: "luck_bonus", value: 12, duration_days: 14 },
        npc_reaction: "None if kept secret; wonder if shown.",
        probability_trigger: 0.04,
        item_gained: "four_leaf_clover"
      }
    ]
  },

  // ─── FOLK BELIEFS AND THEIR EFFECTS ──────────────────────────────────────
  folk_beliefs: [
    {
      id: "folk_iron_repels_evil",
      name: "Iron Repels Evil Spirits",
      description: "Iron — cold-forged and honest — wards away the unclean.",
      mechanical_effect: { type: "innate_protection", value: true, condition: "wearing_iron" },
      npc_behavior: "NPCs with high superstition carry iron nails or wear iron rings.",
      exploitation_possible: true,
      exploitation_methods: ["display_iron_to_terrify_superstitious_npcs", "claim_iron_blessed"]
    },
    {
      id: "folk_salt_preserves_soul",
      name: "Salt Preserves More Than Meat",
      description: "Salt on a threshold prevents evil entry. Salt on a body preserves more than flesh.",
      mechanical_effect: { type: "death_ritual_required", value: true, condition: "npc_death" },
      npc_behavior: "Salt placed on chests of the dead. New mother given salt before anyone else.",
      exploitation_possible: false
    },
    {
      id: "folk_full_moon_madness",
      name: "Full Moon Brings Madness",
      description: "Men become dangerous under the full moon. Pregnant women must stay indoors.",
      mechanical_effect: { type: "violence_chance_increase", value: 0.1, condition: "full_moon" },
      npc_behavior: "NPCs more aggressive. Grudges more likely to surface.",
      exploitation_possible: true,
      exploitation_methods: ["plan_violent_actions_for_full_moon_to_seem_uncontrolled"]
    },
    {
      id: "folk_red_sky_warning",
      name: "Red Sky at Morning",
      description: "Red sky at morning, sailor take warning.",
      mechanical_effect: { type: "weather_prediction", accuracy: 0.7 },
      npc_behavior: "Sailors won't set out. Farmers cover haystacks.",
      exploitation_possible: false
    },
    {
      id: "folk_crossing_running_water",
      name: "Evil Cannot Cross Running Water",
      description: "Demons, witches, and unquiet dead cannot cross a fast-moving stream.",
      mechanical_effect: { type: "psychological_protection", condition: "at_river_crossing" },
      npc_behavior: "Frightened NPCs flee toward rivers. Witch suspects tried to cross streams.",
      exploitation_possible: true,
      exploitation_methods: ["claim_innocence_by_crossing_water_before_accusers", "use_to_evade_superstitious_pursuers"]
    },
    {
      id: "folk_seventh_son",
      name: "Seventh Son of a Seventh Son",
      description: "A man born seventh of a seventh has the sight — and may heal by touch.",
      mechanical_effect: { type: "rumor_potential", value: true, condition: "if_claimed" },
      npc_behavior: "Brings desperate sick people. Brings accusations of witchcraft.",
      exploitation_possible: true,
      exploitation_methods: ["claim_status_for_authority", "claim_status_to_charge_for_healing"]
    },
    {
      id: "folk_magpie_count",
      name: "Counting Magpies",
      description: "One for sorrow, two for joy, three for a girl, four for a boy...",
      mechanical_effect: {
        type: "mood_modifier",
        outcomes: { 1: -5, 2: 5, 3: 3, 4: 3, 5: 8, 6: 10 }
      },
      npc_behavior: "Many NPCs mutter the rhyme when they see magpies.",
      exploitation_possible: false
    },
    {
      id: "folk_witch_mark",
      name: "The Witch's Mark",
      description: "Unusual birthmarks, moles, or insensate spots are the devil's brand.",
      mechanical_effect: { type: "accused_witch_vulnerability", value: true, condition: "has_unusual_scar" },
      npc_behavior: "Superstitious NPCs watch for such marks. Inquisitors prick them.",
      exploitation_possible: false,
      danger_to_heinrich: true
    },
    {
      id: "folk_horse_whispering",
      name: "The Horse-Whispering Word",
      description: "Certain old men know a word — whispered in a horse's ear — that makes the animal utterly docile.",
      mechanical_effect: { type: "hidden_skill", value: "horse_calming", unlocks: ["horsemanship_passive"] },
      npc_behavior: "Old horse-dealers guard this jealously.",
      exploitation_possible: true,
      exploitation_methods: ["learn_the_word", "charge_for_the_service"]
    },
    {
      id: "folk_green_fairy_rings",
      name: "Fairy Rings",
      description: "Dark circles of grass in meadows mark where fairies danced. Step inside and risk being taken.",
      mechanical_effect: { type: "caution_effect", value: true, location: "fairy_ring_clearing" },
      npc_behavior: "Children warned away. Few adults will enter willingly after dark.",
      exploitation_possible: true,
      exploitation_methods: ["use_as_meeting_place_for_those_afraid_to_follow"]
    },
    {
      id: "folk_winding_sheet",
      name: "Winding Sheet Dream",
      description: "To dream of a white sheet wrapped around a living person foretells their death within a fortnight.",
      mechanical_effect: { type: "prophetic_dream_possible", chance: 0.15 },
      npc_behavior: "Anyone who has such a dream refuses to speak of it — but their behavior changes.",
      exploitation_possible: true,
      exploitation_methods: ["claim_prophetic_dream_to_manipulate_or_warn"]
    }
  ],

  // ─── PROTECTIVE CHARMS AND THEIR MECHANICS ──────────────────────────────
  protective_charms: [
    {
      id: "charm_rowan_cross",
      name: "Rowan Cross",
      description: "Two rowan twigs bound with red thread into a cross.",
      crafting_materials: ["rowan_branch", "red_thread"],
      effect: { type: "evil_eye_resistance", value: 0.3 },
      duration: "permanent_until_lost",
      belief_required: false,
      cost_coin: 1
    },
    {
      id: "charm_saints_relic",
      name: "Fragment of Saint's Relic",
      description: "A splinter of bone, thread of cloth, or chip of stone from a saint's possession.",
      crafting_materials: [],
      purchase_locations: ["church", "relic_sellers", "pilgrimage_sites"],
      effect: { type: "piety_bonus", value: 10, disease_resistance: 0.15 },
      duration: "permanent",
      belief_required: true,
      cost_coin: [5, 500],
      authenticity_variable: true,
      deception_possible: true
    },
    {
      id: "charm_horseshoe_door",
      name: "Horseshoe Above Door",
      description: "Iron horseshoe hung above a doorway — points up to hold the luck in.",
      crafting_materials: ["iron_horseshoe"],
      effect: { type: "property_luck_bonus", value: 5 },
      duration: "as_long_as_hung",
      belief_required: false,
      cost_coin: 0
    },
    {
      id: "charm_hagstone",
      name: "Hagstone",
      description: "A stone with a natural hole, found by flowing water. Hung on string.",
      crafting_materials: [],
      effect: { type: "nightmare_resistance", value: 0.4, witchcraft_resistance: 0.2 },
      duration: "permanent",
      belief_required: false,
      find_location: "riverbank",
      cost_coin: 0
    },
    {
      id: "charm_garlic_braid",
      name: "Garlic Braid",
      description: "Braided garlic hung at threshold and worn in travel.",
      crafting_materials: ["garlic"],
      effect: { type: "disease_resistance_minor", value: 0.1 },
      duration_days: 30,
      belief_required: false,
      cost_coin: 0,
      note: "The protective effect is partly real — garlic has antimicrobial properties"
    },
    {
      id: "charm_evil_eye_amulet",
      name: "Evil Eye Amulet",
      description: "A glass bead of vivid blue — eye-shaped — worn around the neck.",
      crafting_materials: [],
      purchase_locations: ["travelling_merchants", "jewish_quarters", "oriental_traders"],
      effect: { type: "envy_resistance", value: 0.3 },
      duration: "permanent",
      belief_required: true,
      cost_coin: 8,
      foreign_origin: true
    }
  ],

  // ─── SUPERSTITION EXPLOITATION MECHANICS ─────────────────────────────────
  exploitation: {
    // How Heinrich can use others' superstitions

    fear_of_darkness: {
      id: "exploit_darkness",
      description: "Appear and disappear in shadows to create supernatural impression",
      skill_requirements: { stealth: 3, deception: 2 },
      effect_if_successful: { npc_fear: 20, supernatural_reputation: true },
      failure_exposes_deception: true
    },

    prophecy_delivery: {
      id: "exploit_prophecy",
      description: "Deliver 'prophecies' — actually informed predictions from intelligence",
      skill_requirements: { speech: 4, deception: 3, read_people: 4, information_quality: "good" },
      effect_if_successful: { reputation_mystic: true, influence_boost: true, payment_possible: true },
      risk: "if_prophecy_fails_dramatically_npc_reaction_hostile"
    },

    fake_relic_selling: {
      id: "exploit_relics",
      description: "Sell 'holy relics' — bones, cloth fragments, stones — as saints' remains",
      skill_requirements: { deception: 5, speech: 3, forgery_skill: 2 },
      effect_if_successful: { coin_gain: [20, 200], reputation_church: -10 },
      crime_type: "fraud",
      risk_if_caught: "punishment_severe"
    },

    witch_accusation_manufacturing: {
      id: "exploit_witch_accusation",
      description: "Manufacture evidence or suspicion of witchcraft against an enemy",
      skill_requirements: { deception: 6, stealth: 4, read_people: 3 },
      effect_if_successful: { target_arrested: true, revenge_achieved: true },
      heat_generated: 30,
      corruption_cost: 10,
      backfire_possible: true
    },

    protective_blessing_selling: {
      id: "exploit_blessing",
      description: "Offer 'blessings' and 'protection charms' to superstitious folk",
      skill_requirements: { speech: 3, theology: 1 },
      effect_if_successful: { coin_gain: [2, 20], reputation_mystic: true },
      risk: "church_disapproval_if_not_clergy"
    }
  },

  // ─── MECHANICAL INTEGRATION WITH HEINRICH'S SUPERSTITION STAT ─────────
  superstition_thresholds: {
    0: {
      label: "Rationalist",
      description: "Heinrich dismisses all superstition as peasant nonsense. Omens have no effect.",
      mechanical_effects: { omens_affect_stats: false, charm_benefits: false, harder_to_exploit_superstitious_npcs: true }
    },
    3: {
      label: "Skeptic",
      description: "A sensible man who doesn't tempt fate unnecessarily.",
      mechanical_effects: { omens_affect_stats: false, charm_benefits: false }
    },
    5: {
      label: "Ordinary Folk",
      description: "Like most people, Heinrich crosses fingers and avoids black cats.",
      mechanical_effects: { omens_affect_stats: true, penalized: 0.5, charm_benefits: true, penalized_charm: 0.5 }
    },
    7: {
      label: "Superstitious",
      description: "Heinrich truly believes. Omens affect his choices. Charms comfort him.",
      mechanical_effects: { omens_affect_stats: true, charm_benefits: true }
    },
    10: {
      label: "Deeply Superstitious",
      description: "The world is alive with signs. Every event carries meaning. Full mechanical weight of all omens.",
      mechanical_effects: { omens_affect_stats: true, multiplier: 1.5, charm_benefits: true, charm_multiplier: 1.5, vulnerable_to_exploitation: true }
    }
  }

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { SUPERSTITION_DATA };
}

// END FILE: client/js/data/superstition-data.js
