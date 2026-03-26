// FILE: client/js/data/weather-data.js — PART 3

const WEATHER_DATA = {

  // ─── WEATHER TYPES ────────────────────────────────────────────────────────
  weather_types: {
    clear: {
      id: "clear",
      name: "Clear",
      temperature_modifier: 5, // degrees (relative)
      visibility: "excellent",
      travel_modifier: 1.2, // speed multiplier
      combat_modifier: 1.0,
      agriculture_modifier: 1.1,
      mood_modifier: 10,
      npc_behavior: "outdoors, working, sociable",
      descriptions: {
        morning: "The sky is washed clean and pale. Dew on grass catches the early light.",
        midday: "Sun hammers down without mercy on the open road.",
        evening: "The sun sets gold and enormous, turning the fields to fire.",
        night: "Stars sharp as needles. The Milky Way a river overhead."
      }
    },
    overcast: {
      id: "overcast",
      name: "Overcast",
      temperature_modifier: 0,
      visibility: "good",
      travel_modifier: 1.0,
      combat_modifier: 1.0,
      agriculture_modifier: 0.95,
      mood_modifier: -5,
      npc_behavior: "working, indoors more than usual",
      descriptions: {
        morning: "Flat grey light. No shadows. The sky a single bruise.",
        midday: "The sun hides behind cloud the color of old iron.",
        evening: "No sunset. Just a gradual darkening of the grey.",
        night: "No stars. The dark is absolute and close."
      }
    },
    light_rain: {
      id: "light_rain",
      name: "Light Rain",
      temperature_modifier: -2,
      visibility: "good",
      travel_modifier: 0.9,
      combat_modifier: 0.95,
      agriculture_modifier: 1.05,
      mood_modifier: -10,
      npc_behavior: "hurrying between destinations, seeking roofs",
      wet_penalty: true,
      descriptions: {
        morning: "A fine mist of rain, barely more than heavy dew, softens everything.",
        midday: "Steady grey rain drums on thatch and barrel-lids.",
        evening: "Rain tapping against shutters. The smell of wet earth.",
        night: "Rain in darkness. The sound of a brook swelling."
      }
    },
    heavy_rain: {
      id: "heavy_rain",
      name: "Heavy Rain",
      temperature_modifier: -5,
      visibility: "poor",
      travel_modifier: 0.6,
      combat_modifier: 0.8,
      agriculture_modifier: 0.7,
      mood_modifier: -20,
      npc_behavior: "sheltering indoors, not traveling",
      wet_penalty: true,
      flood_risk: 0.2,
      mud_penalty: true,
      descriptions: {
        morning: "The rain comes in solid curtains, turning road to stream.",
        midday: "Impossible to see more than thirty paces. The world is water.",
        evening: "Roofs leak. Roads are rivers. Tempers are short.",
        night: "Rain so heavy it drowns other sounds. A drumming on the skull."
      }
    },
    thunderstorm: {
      id: "thunderstorm",
      name: "Thunderstorm",
      temperature_modifier: -8,
      visibility: "very_poor",
      travel_modifier: 0.4,
      combat_modifier: 0.7,
      agriculture_modifier: 0.5,
      mood_modifier: -25,
      npc_behavior: "sheltering intensely, praying, animals restless",
      lightning_strike_risk: 0.03,
      fire_risk: 0.02,
      superstition_trigger: true,
      descriptions: {
        any: "Lightning rips the sky white. Thunder follows like God's own hammer striking an anvil the size of France."
      }
    },
    fog: {
      id: "fog",
      name: "Fog",
      temperature_modifier: -3,
      visibility: "very_poor",
      travel_modifier: 0.7,
      combat_modifier: 0.85,
      agriculture_modifier: 0.9,
      mood_modifier: -15,
      npc_behavior: "cautious, fearful, moving slowly",
      ambush_bonus: 0.2,
      stealth_bonus: 15,
      descriptions: {
        morning: "Fog lies thick as fleece in every low place. Trees appear as ghosts twenty paces away.",
        midday: "The fog hasn't lifted. The world is grey wool.",
        evening: "Fog rises from the ground as dusk falls. The road disappears at your feet.",
        night: "Fog and dark together. Nothing is visible. Sound is muffled. Anything could be close."
      }
    },
    light_snow: {
      id: "light_snow",
      name: "Light Snow",
      temperature_modifier: -10,
      visibility: "good",
      travel_modifier: 0.8,
      combat_modifier: 0.9,
      agriculture_modifier: 0.0,
      mood_modifier: 5,
      npc_behavior: "bundled up, moving quickly, children play",
      tracking_bonus: 15,
      descriptions: {
        morning: "Snow fell overnight. The world white and pristine, unmarked.",
        midday: "Soft flakes drift without urgency. The cold bites but gently.",
        evening: "The snow glows faintly in the last light. Sound is muffled and strange.",
        night: "Snow falls silently in the dark. Footprints lead nowhere."
      }
    },
    blizzard: {
      id: "blizzard",
      name: "Blizzard",
      temperature_modifier: -20,
      visibility: "zero",
      travel_modifier: 0.1,
      combat_modifier: 0.5,
      agriculture_modifier: 0.0,
      mood_modifier: -35,
      stranded_risk: 0.4,
      hypothermia_risk: 0.3,
      death_if_caught_outside: 0.15,
      npc_behavior: "absolute indoors, survive only",
      descriptions: {
        any: "White blindness. The wind is a wall. Every breath costs something. The blizzard does not distinguish between the careful and the foolish."
      }
    },
    frost: {
      id: "frost",
      name: "Hard Frost",
      temperature_modifier: -12,
      visibility: "excellent",
      travel_modifier: 0.9,
      combat_modifier: 0.9,
      agriculture_modifier: 0.0,
      mood_modifier: -10,
      ground_frozen: true,
      road_quality_improved: true, // frozen mud is better than mud
      descriptions: {
        morning: "Frost rimes every surface silver. The air bites the lungs. Breath steams white.",
        midday: "The frost won't thaw today. Every puddle a mirror.",
        evening: "Ice crystals form on whiskers and eyebrows. The cold deepens.",
        night: "The coldest night yet. A clear cold you can hear in the silence."
      }
    },
    heat_wave: {
      id: "heat_wave",
      name: "Heat Wave",
      temperature_modifier: 15,
      visibility: "excellent",
      travel_modifier: 0.8,
      combat_modifier: 0.85,
      agriculture_modifier: 0.7,
      mood_modifier: -15,
      thirst_increase: 2.0,
      fatigue_increase: 1.5,
      drought_risk: 0.3,
      descriptions: {
        morning: "Already hot at dawn. A day of hammered brass and baking roads.",
        midday: "The sun is merciless. Animals shelter. Men slow. The road shimmers.",
        evening: "The heat lingers past sunset, rising from stone and soil.",
        night: "No relief. The night is warm and still and sweating."
      }
    },
    hail: {
      id: "hail",
      name: "Hail",
      temperature_modifier: -5,
      visibility: "poor",
      travel_modifier: 0.5,
      combat_modifier: 0.6,
      agriculture_modifier: 0.2,
      mood_modifier: -20,
      crop_damage_risk: 0.4,
      animal_danger: true,
      descriptions: {
        any: "Ice falls from the sky like God's own catapult. Hailstones the size of chestnuts flatten standing grain and raise welts on unprotected skin."
      }
    },
    windy: {
      id: "windy",
      name: "High Winds",
      temperature_modifier: -5,
      visibility: "good",
      travel_modifier: 0.85,
      combat_modifier: 0.9,
      archery_penalty: -15,
      sailing_bonus: 0.3,
      mill_bonus: true,
      fire_risk: 0.08,
      descriptions: {
        morning: "A hard wind from the northwest strips leaves and lifts cloaks.",
        midday: "The wind doesn't let up. Arrows fly wide. Voices are torn away.",
        evening: "The wind moans in the eaves. Gates bang. Nothing settles.",
        night: "The wind screams through the dark. Trees creak ominously."
      }
    }
  },

  // ─── SEASONAL WEATHER PROBABILITY TABLES ──────────────────────────────────
  seasonal_probabilities: {
    spring: {
      clear: 0.25,
      overcast: 0.20,
      light_rain: 0.25,
      heavy_rain: 0.12,
      thunderstorm: 0.05,
      fog: 0.08,
      light_snow: 0.02,
      windy: 0.03
    },
    summer: {
      clear: 0.40,
      overcast: 0.15,
      light_rain: 0.15,
      heavy_rain: 0.08,
      thunderstorm: 0.08,
      fog: 0.03,
      heat_wave: 0.07,
      hail: 0.02,
      windy: 0.02
    },
    autumn: {
      clear: 0.20,
      overcast: 0.25,
      light_rain: 0.20,
      heavy_rain: 0.15,
      thunderstorm: 0.05,
      fog: 0.08,
      windy: 0.04,
      hail: 0.03
    },
    winter: {
      clear: 0.15,
      overcast: 0.25,
      light_rain: 0.15,
      heavy_rain: 0.08,
      fog: 0.10,
      light_snow: 0.15,
      blizzard: 0.04,
      frost: 0.08
    }
  },

  // ─── WEATHER TRANSITION RULES ─────────────────────────────────────────────
  transitions: {
    // From -> To: probability
    clear: {
      clear: 0.60,
      overcast: 0.25,
      light_rain: 0.10,
      windy: 0.05
    },
    overcast: {
      overcast: 0.40,
      clear: 0.20,
      light_rain: 0.25,
      heavy_rain: 0.10,
      fog: 0.05
    },
    light_rain: {
      light_rain: 0.35,
      overcast: 0.30,
      heavy_rain: 0.20,
      thunderstorm: 0.10,
      clear: 0.05
    },
    heavy_rain: {
      heavy_rain: 0.30,
      light_rain: 0.35,
      thunderstorm: 0.20,
      overcast: 0.15
    },
    thunderstorm: {
      thunderstorm: 0.20,
      heavy_rain: 0.40,
      light_rain: 0.20,
      overcast: 0.20
    },
    fog: {
      fog: 0.30,
      overcast: 0.40,
      clear: 0.30
    },
    light_snow: {
      light_snow: 0.30,
      overcast: 0.30,
      frost: 0.20,
      blizzard: 0.10,
      clear: 0.10
    },
    blizzard: {
      blizzard: 0.25,
      light_snow: 0.45,
      overcast: 0.30
    },
    frost: {
      frost: 0.40,
      clear: 0.30,
      overcast: 0.20,
      light_snow: 0.10
    }
  },

  // ─── TEMPERATURE RANGES BY SEASON AND TIME ──────────────────────────────
  temperature_ranges: {
    spring: { dawn: -2, morning: 5, midday: 12, evening: 8, night: 2 },
    summer: { dawn: 12, morning: 18, midday: 25, evening: 20, night: 14 },
    autumn: { dawn: 5, morning: 10, midday: 14, evening: 8, night: 3 },
    winter: { dawn: -8, morning: -3, midday: 2, evening: -2, night: -6 }
    // Celsius — medieval Normandy averages
  },

  // ─── WEATHER EFFECTS ON GAME SYSTEMS ─────────────────────────────────────
  system_effects: {
    combat: {
      heavy_rain: { range_weapons_penalty: -20, footing_penalty: -10 },
      blizzard: { all_combat_penalty: -30, visibility_penalty: -25 },
      fog: { visibility_penalty: -20, ambush_bonus: 15 },
      thunderstorm: { morale_penalty: -10, range_penalty: -25 },
      heat_wave: { endurance_drain: 2.0, armor_penalty: -10 }
    },
    travel: {
      heavy_rain: { road_becomes_mud: true, speed_multiplier: 0.6 },
      blizzard: { travel_impossible: true },
      frost: { road_quality_improved: true, speed_multiplier: 1.1 },
      flood: { certain_routes_blocked: true }
    },
    economy: {
      harsh_winter: { food_prices: 1.5, fuel_prices: 2.0 },
      drought: { grain_prices: 2.0, cattle_thin: true },
      flood: { trade_disrupted: 0.4 },
      good_harvest_weather: { food_prices: 0.7 }
    },
    health: {
      cold_wet_conditions: { disease_risk: 1.3 },
      extreme_heat: { thirst_multiplier: 2.0, fatigue_multiplier: 1.5 },
      blizzard_exposure: { hypothermia_check_per_hour: true },
      pleasant_weather: { recovery_bonus: 1.2 }
    },
    morale: {
      extended_grey: { minor_depression_risk: true, days_threshold: 14 },
      pleasant_surprise: { mood_bonus: 10 },
      storm: { superstition_trigger_high: true }
    }
  },

  // ─── SPECIAL WEATHER EVENTS ───────────────────────────────────────────────
  special_events: [
    {
      id: "great_storm",
      name: "Great Storm",
      trigger_probability: 0.005,
      duration_days: [2, 5],
      effects: { coastal_flooding: true, ships_damaged: 0.3, all_travel_blocked: true },
      description: "A storm of biblical proportion."
    },
    {
      id: "drought_extended",
      name: "Extended Drought",
      trigger_probability: 0.02,
      conditions: ["summer", "no_rain_14_days"],
      duration_weeks: [4, 12],
      effects: { wells_dry: true, crops_fail: 0.5, cattle_thin: true, food_prices_extreme: true }
    },
    {
      id: "flood_season",
      name: "Exceptional Flooding",
      trigger_probability: 0.03,
      conditions: ["heavy_rain_7_consecutive_days", "spring"],
      duration_days: [3, 21],
      effects: { river_routes_blocked: true, villages_flooded: 0.2, disease_spike: true }
    },
    {
      id: "late_frost",
      name: "Late Spring Frost",
      trigger_probability: 0.1,
      conditions: ["month_4_or_5"],
      effects: { crops_damaged_severely: true, replanting_required: true, food_prices_increase: 0.4 }
    }
  ]

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WEATHER_DATA };
}

// END FILE: client/js/data/weather-data.js
