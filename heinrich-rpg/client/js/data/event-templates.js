// FILE: client/js/data/event-templates.js — PART 3

const EVENT_TEMPLATES = {

  // ─── SEASONAL EVENTS ───────────────────────────────────────────────────────
  seasonal: {
    spring: [
      {
        id: "spring_planting",
        name: "Planting Season",
        trigger: { month: 3, probability: 1.0 },
        effects: { agriculture_xp_bonus: 0.25, corvee_labor_demand: true },
        description: "The fields must be planted. Lords demand corvee labor.",
        options: ["Work own plot first", "Fulfill lord's demand", "Hire out as laborer"]
      },
      {
        id: "spring_fair",
        name: "Spring Market Fair",
        trigger: { month: 4, probability: 0.7 },
        effects: { trade_opportunity: true, social_opportunity: true, price_fluctuation: "spring_goods" },
        description: "Traders arrive for the spring fair. Goods and gossip flow freely.",
        options: ["Browse stalls", "Sell goods", "Gather rumors", "Seek work"]
      },
      {
        id: "spring_flood",
        name: "Spring Flooding",
        trigger: { month: 3, condition: "heavy_rain", probability: 0.3 },
        effects: { travel_restricted: true, agriculture_damage: 0.2, disease_risk_increase: 0.15 },
        description: "Spring rains swell the rivers. Low roads are impassable.",
        options: ["Wait it out", "Find alternate route", "Help villagers with flood damage", "Fish the flooded fields"]
      },
      {
        id: "lambing_season",
        name: "Lambing Season",
        trigger: { month: 3, probability: 0.5 },
        effects: { animal_husbandry_opportunity: true, lords_attention_reduced: true },
        description: "Everyone is tending to newborn lambs. The village is unusually quiet.",
        options: ["Help with lambing", "Use distraction for other activities", "Purchase a lamb cheap"]
      }
    ],

    summer: [
      {
        id: "summer_tournament",
        name: "Summer Tournament",
        trigger: { month: 6, probability: 0.4 },
        effects: { combat_opportunity: true, social_mobility_chance: true, noble_presence: true },
        description: "A lord announces a summer tournament. Knights, merchants and common folk converge.",
        options: ["Compete in melee", "Compete in archery", "Work as laborer", "Observe and gather intelligence"]
      },
      {
        id: "hay_harvest",
        name: "Hay Harvest",
        trigger: { month: 7, probability: 1.0 },
        effects: { corvee_labor_demand: true, agriculture_xp_bonus: 0.2 },
        description: "The hay must be cut before rain. Every able body is expected in the fields.",
        options: ["Cut hay for lord", "Hire out as reaper", "Oversee others if capable"]
      },
      {
        id: "summer_drought",
        name: "Drought",
        trigger: { month: 7, condition: "extended_dry", probability: 0.2 },
        effects: { food_prices_increase: 0.4, water_scarcity: true, cattle_deaths: 0.1 },
        description: "Wells run low. Streams narrow. The harvest will be poor.",
        options: ["Stockpile water", "Trade for food while cheap", "Help dig a deeper well"]
      },
      {
        id: "pilgrimage_season",
        name: "Pilgrimage Season",
        trigger: { month: 7, probability: 0.3 },
        effects: { travel_companions_available: true, road_travel_safer: true, piety_opportunity: true },
        description: "Pilgrims pass through heading to shrines. Safety in numbers.",
        options: ["Join pilgrimage", "Trade with pilgrims", "Seek information from travelers"]
      }
    ],

    autumn: [
      {
        id: "grain_harvest",
        name: "Great Harvest",
        trigger: { month: 9, probability: 1.0 },
        effects: { corvee_labor_demand: true, agricultural_income: true, food_prices_drop: 0.3 },
        description: "The most important event of the peasant year. Every hand in the fields.",
        options: ["Harvest lord's fields", "Hire out for harvest wages", "Negotiate harvest deal"]
      },
      {
        id: "autumn_fair",
        name: "Autumn Livestock Fair",
        trigger: { month: 10, probability: 0.75 },
        effects: { animal_trade_opportunity: true, social_opportunity: true, cash_opportunity: true },
        description: "Animals sold before winter feed becomes scarce. Good time to buy or sell.",
        options: ["Buy livestock", "Sell livestock", "Observe prices", "Find work at the fair"]
      },
      {
        id: "martinmas_slaughter",
        name: "Martinmas Slaughter",
        trigger: { month: 11, probability: 0.8 },
        effects: { meat_abundance: true, preservation_opportunity: true, winter_preparation: true },
        description: "Animals too costly to winter are slaughtered. Meat is salted and smoked.",
        options: ["Purchase meat cheap", "Help with slaughtering (earn food)", "Learn preservation techniques"]
      },
      {
        id: "autumn_storm",
        name: "Autumn Tempest",
        trigger: { month: 10, condition: "storm", probability: 0.25 },
        effects: { travel_impossible: true, shelter_premium: true, shipwreck_possible: true },
        description: "A great storm rolls in from the sea. God's wrath or nature's fury.",
        options: ["Seek shelter immediately", "Help rescue storm victims", "Salvage opportunities"]
      }
    ],

    winter: [
      {
        id: "christmas_feast",
        name: "Christmas Celebrations",
        trigger: { month: 12, day: 25, probability: 1.0 },
        effects: { lord_generosity_increased: true, work_suspended: true, social_opportunity: true },
        description: "Even serfs rest at Christmas. The lord may distribute gifts of food.",
        options: ["Attend lord's feast", "Celebrate with village", "Use holiday travel freedom"]
      },
      {
        id: "winter_hunger",
        name: "Winter Hunger",
        trigger: { month: 1, condition: "food_scarce", probability: 0.35 },
        effects: { food_prices_extreme: true, desperation_npc_behavior: true, crime_increase: true },
        description: "The winter stores run thin. Folk begin to look at each other differently.",
        options: ["Share food", "Guard stores", "Seek emergency food sources"]
      },
      {
        id: "wolf_attacks",
        name: "Wolf Pack Attacks",
        trigger: { month: 1, probability: 0.2 },
        effects: { outdoor_travel_dangerous: true, livestock_losses: true, hunting_opportunity: true },
        description: "A wolf pack, starved by winter, attacks livestock and travelers.",
        options: ["Join hunting party", "Guard livestock", "Track and trap alone"]
      },
      {
        id: "winter_sickness",
        name: "Winter Fever",
        trigger: { month: 12, probability: 0.3 },
        effects: { disease_outbreak: "winter_fever", village_weakened: true, medicine_demand: true },
        description: "The cold breeds sickness. The old and young suffer most.",
        options: ["Help the sick", "Avoid exposure", "Seek medical knowledge"]
      },
      {
        id: "candlemas",
        name: "Candlemas",
        trigger: { month: 2, day: 2, probability: 1.0 },
        effects: { piety_opportunity: true, weather_omen: true, spring_anticipation: true },
        description: "Candles blessed at church. Folk watch the bear for spring signs.",
        options: ["Attend church blessing", "Make offerings", "Mark the occasion privately"]
      }
    ]
  },

  // ─── PROPERTY EVENTS ────────────────────────────────────────────────────────
  property: {
    positive: [
      {
        id: "prop_bumper_crop",
        name: "Exceptional Harvest",
        probability: 0.15,
        conditions: { property_type: ["farm", "estate"], season: "autumn" },
        effects: { income_multiplier: 1.5, food_stores_bonus: 0.3, reputation_local: 5 },
        description: "An exceptionally good harvest brings surplus income and local goodwill."
      },
      {
        id: "prop_craftsman_tenant",
        name: "Skilled Tenant Arrives",
        probability: 0.08,
        conditions: { property_type: ["estate", "village"] },
        effects: { new_tenant_skilled: true, income_increase: 15 },
        description: "A craftsman seeks to rent space on your property."
      },
      {
        id: "prop_mineral_discovery",
        name: "Mineral Vein Found",
        probability: 0.03,
        conditions: { property_type: ["land", "estate"] },
        effects: { new_income_stream: "mining", value_increase: 200 },
        description: "Workers discover a vein of iron ore or clay deposits."
      },
      {
        id: "prop_trade_route_opens",
        name: "New Trade Route",
        probability: 0.06,
        conditions: { property_type: ["inn", "town_house", "estate"] },
        effects: { income_increase: 25, social_opportunity: true },
        description: "A new trade route passes by your property. Opportunity knocks."
      }
    ],
    negative: [
      {
        id: "prop_fire",
        name: "Property Fire",
        probability: 0.05,
        conditions: {},
        effects: { structure_damage: 0.4, stored_goods_lost: 0.6, urgent_repair_needed: true },
        description: "Fire breaks out. Swift action may limit damage."
      },
      {
        id: "prop_bandit_raid",
        name: "Bandit Raid",
        probability: 0.08,
        conditions: { regions: ["road", "border", "forest_fringe"] },
        effects: { goods_stolen: 0.3, tenants_fled: 0.1, security_needed: true },
        description: "Bandits raid the property. Tenants are shaken."
      },
      {
        id: "prop_crop_blight",
        name: "Crop Blight",
        probability: 0.1,
        conditions: { property_type: ["farm", "estate"], seasons: ["summer", "autumn"] },
        effects: { harvest_reduced: 0.5, income_reduced: 0.4, food_scarce: true },
        description: "A fungal blight destroys much of the crop."
      },
      {
        id: "prop_tenant_dispute",
        name: "Tenant Dispute",
        probability: 0.12,
        conditions: { has_tenants: true },
        effects: { income_disrupted: true, reputation_local: -5, arbitration_needed: true },
        description: "Two tenants come to blows over water rights or field boundaries."
      },
      {
        id: "prop_tax_demand",
        name: "Extraordinary Tax",
        probability: 0.07,
        conditions: {},
        effects: { immediate_payment_demanded: true, relationship_lord: -5 },
        description: "Your overlord demands an extraordinary payment for his wars."
      },
      {
        id: "prop_mill_breakdown",
        name: "Mill Breakdown",
        probability: 0.09,
        conditions: { property_type: ["mill"] },
        effects: { income_stopped: true, repair_cost: "high", community_impact: true },
        description: "The mill wheel breaks. The village cannot grind grain."
      }
    ],
    neutral: [
      {
        id: "prop_boundary_dispute",
        name: "Boundary Dispute",
        probability: 0.06,
        conditions: { has_neighbors: true },
        effects: { relationship_neighbor: -10, legal_challenge: true, resolution_needed: true },
        description: "A neighbor claims part of your land. Requires resolution."
      },
      {
        id: "prop_travelers_arrive",
        name: "Travelers Seek Lodging",
        probability: 0.15,
        conditions: { property_type: ["inn", "manor", "estate"] },
        effects: { income_small: true, information_opportunity: true, social_interaction: true },
        description: "Travelers arrive seeking shelter. Who are they?"
      },
      {
        id: "prop_inheritance_claim",
        name: "Inheritance Claim",
        probability: 0.03,
        conditions: {},
        effects: { legal_challenge: true, relationship_claimant: "variable" },
        description: "Someone claims a prior right to your property."
      }
    ]
  },

  // ─── WORLD EVENTS ────────────────────────────────────────────────────────────
  world: [
    {
      id: "world_plague_arrival",
      name: "Plague Arrives in Region",
      conditions: { min_year: 1403, max_year: 1450, probability_per_year: 0.08 },
      effects: {
        npc_mortality_rate: 0.3,
        travel_restricted: true,
        economy_collapse: 0.4,
        religious_fervor: true
      },
      description: "Word comes of plague in neighboring regions. It moves closer each week.",
      chains: ["plague_peak", "plague_recession"]
    },
    {
      id: "world_war_declared",
      name: "War Declared",
      conditions: { min_year: 1403, max_year: 1453, probability_per_year: 0.2 },
      effects: {
        conscription_pressure: true,
        army_recruiters_present: true,
        taxes_increase: 0.3,
        banditry_increase: 0.5
      },
      description: "Lords summon their vassals. France and England are at it again.",
      chains: ["war_escalation", "battle_nearby", "war_resolution"]
    },
    {
      id: "world_famine",
      name: "Regional Famine",
      conditions: { triggered_by: ["drought", "blight", "war"], probability: 0.15 },
      effects: {
        food_prices_triple: true,
        crime_rate_triple: true,
        migration_surge: true,
        npc_desperation: true
      },
      description: "Three lean years in a row. The granaries are empty.",
      chains: ["famine_peak", "famine_recovery"]
    },
    {
      id: "world_noble_dies",
      name: "Lord Dies Without Clear Heir",
      conditions: { probability_per_year: 0.1 },
      effects: {
        power_vacuum: true,
        factional_conflict: true,
        opportunity_for_ambitious: true,
        law_enforcement_weakened: true
      },
      description: "The old lord is dead. His sons squabble. The clever find their moment.",
      chains: ["succession_crisis", "political_resolution"]
    },
    {
      id: "world_religious_schism",
      name: "Church Council Controversy",
      conditions: { min_year: 1403, max_year: 1420, probability_per_year: 0.4 },
      effects: {
        church_authority_questioned: true,
        heresy_accusations_increase: true,
        piety_system_modified: true
      },
      description: "The Council of Constance debates papal authority. Old certainties waver.",
      chains: ["church_resolution"]
    },
    {
      id: "world_economic_boom",
      name: "Trade Boom",
      conditions: { probability_per_year: 0.15 },
      effects: {
        all_prices_increase: 0.2,
        merchant_npcs_increase: true,
        opportunity_for_traders: true,
        coin_in_circulation_increases: true
      },
      description: "Trade from the east floods in. Spices, silk, ideas — and opportunities."
    },
    {
      id: "world_great_storm",
      name: "Great Storm",
      conditions: { probability_per_year: 0.1, coastal_regions_only: true },
      effects: {
        ships_destroyed: 0.3,
        coastal_flooding: true,
        fishing_disrupted: true,
        salvage_opportunity: true
      },
      description: "A storm of biblical proportions batters the coast. Faith is tested.",
      chains: ["storm_recovery"]
    }
  ],

  // ─── RANDOM ENCOUNTER EVENTS ─────────────────────────────────────────────────
  encounters: {
    road: [
      {
        id: "enc_merchant_ambush",
        name: "Merchant Under Attack",
        probability: 0.08,
        effects: { combat_optional: true, reward_if_helped: "merchant_gratitude", information_available: true },
        description: "A merchant's cart has been stopped by armed men. Screaming. Swords drawn."
      },
      {
        id: "enc_lost_traveler",
        name: "Lost Traveler",
        probability: 0.1,
        effects: { information_opportunity: true, companion_potential: true },
        description: "A confused figure stands at a fork in the road, turning in circles."
      },
      {
        id: "enc_fugitive",
        name: "Desperate Fugitive",
        probability: 0.06,
        effects: { choice_moral: true, information_value: "high", pursuit_follows: true },
        description: "A man runs toward you, wild-eyed, begging for help hiding."
      },
      {
        id: "enc_soldiers_checkpoint",
        name: "Military Checkpoint",
        probability: 0.12,
        conditions: { active_conflict: true },
        effects: { identity_check: true, contraband_search: true, conscription_risk: true },
        description: "Soldiers have set up a barrier across the road. They check everyone."
      },
      {
        id: "enc_dead_body",
        name: "Body on the Road",
        probability: 0.05,
        effects: { investigation_opportunity: true, loot_possible: true, witnesses_variable: true },
        description: "A body lies in the road. Recently dead. Marks of violence."
      },
      {
        id: "enc_pilgrim_group",
        name: "Pilgrim Company",
        probability: 0.15,
        effects: { travel_safety_if_joined: true, information_diverse: true, piety_opportunity: true },
        description: "A group of pilgrims — merchants, peasants, even a minor noble — welcome company."
      },
      {
        id: "enc_broken_axle",
        name: "Broken Cart",
        probability: 0.08,
        effects: { carpentry_opportunity: true, reward_small: true, social_connection: true },
        description: "A cart has shed a wheel. The driver curses and prays in equal measure."
      }
    ],

    village: [
      {
        id: "enc_village_dispute",
        name: "Village Dispute",
        probability: 0.1,
        effects: { speech_opportunity: true, reputation_village: "variable" },
        description: "Two families are shouting in the square over a pig. Half the village watches."
      },
      {
        id: "enc_suspicious_stranger",
        name: "Suspicious Stranger",
        probability: 0.08,
        effects: { spy_possible: true, information_value: "high", investigation_opportunity: true },
        description: "A stranger who asks too many questions and answers none."
      },
      {
        id: "enc_illness_in_family",
        name: "Child Is Sick",
        probability: 0.06,
        effects: { medicine_opportunity: true, reputation_village: 10, faith_interaction: true },
        description: "A family's child lies burning with fever. The local healer has given up."
      },
      {
        id: "enc_feast_invitation",
        name: "Feast Invitation",
        probability: 0.07,
        effects: { social_opportunity: true, information_relaxed: true, romance_possible: true },
        description: "A farmer invites you to his daughter's betrothal feast."
      },
      {
        id: "enc_accused_witch",
        name: "Witch Accusation",
        probability: 0.05,
        effects: { moral_choice: true, reputation_church: "variable", community_tension: true },
        description: "The village is turning on an old woman. She is not a witch — but she is strange."
      }
    ],

    wilderness: [
      {
        id: "enc_wounded_animal",
        name: "Wounded Animal",
        probability: 0.08,
        effects: { animal_companion_possible: true, hunting_xp: true, medicine_xp: true },
        description: "A young dog (or fox, or falcon) lies in a trap, leg broken."
      },
      {
        id: "enc_hermit",
        name: "Hermit's Cave",
        probability: 0.04,
        effects: { knowledge_opportunity: true, unusual_information: true, philosophy_interaction: true },
        description: "A man who left the world lives here. He knows things that are not written."
      },
      {
        id: "enc_poaching_catch",
        name: "Caught Poaching",
        probability: 0.06,
        conditions: { hunting_in_lords_forest: true },
        effects: { crime_exposure: true, combat_possible: true, fine_or_punishment: true },
        description: "A forester emerges from the trees with a crossbow and a hard expression."
      },
      {
        id: "enc_ruins",
        name: "Ancient Ruins",
        probability: 0.05,
        effects: { history_xp: true, artifact_possible: true, danger_possible: true },
        description: "Roman stonework emerges from the undergrowth. Old things sometimes have old treasure."
      },
      {
        id: "enc_outlaw_camp",
        name: "Outlaw Camp",
        probability: 0.07,
        effects: { combat_possible: true, alliance_possible: true, criminal_connection_possible: true },
        description: "You smell smoke before you see the fire. At least six men. Maybe more."
      }
    ]
  },

  // ─── PERSONAL/BIOGRAPHICAL EVENTS ─────────────────────────────────────────
  personal: [
    {
      id: "pers_dream_vision",
      name: "Powerful Dream",
      trigger: "sleeping",
      probability: 0.1,
      effects: { memory_palace_update: "clue", mental_state_shift: "variable", piety_effect: "variable" },
      description: "A dream vivid enough to remember in daylight."
    },
    {
      id: "pers_past_secret",
      name: "Past Comes Back",
      trigger: "consequence_chain",
      probability: 0.05,
      effects: { old_npc_returns: true, consequence_trigger: true },
      description: "Someone from Heinrich's past appears — with a memory he'd rather forget."
    },
    {
      id: "pers_reputation_wave",
      name: "Famous Locally",
      trigger: { reputation_threshold: 60, scope: "local" },
      effects: { npc_generation_quality_increase: true, lord_attention: true, invitations_increase: true },
      description: "Word of Heinrich's deeds has spread. People recognize him now."
    },
    {
      id: "pers_corruption_temptation",
      name: "Temptation",
      trigger: { corruption_min: 30, probability: 0.1 },
      effects: { moral_compass_test: true, vice_opportunity: true },
      description: "An offer arrives that would be very easy to accept and very wrong to take."
    },
    {
      id: "pers_old_wound",
      name: "Old Wound Reopens",
      trigger: { has_scars: true, condition: "physical_exertion", probability: 0.05 },
      effects: { wound_reopens: true, health_penalty: true, memory_surfaced: true },
      description: "An old injury makes itself known at the worst possible moment."
    }
  ]

};

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EVENT_TEMPLATES };
}

// END FILE: client/js/data/event-templates.js
