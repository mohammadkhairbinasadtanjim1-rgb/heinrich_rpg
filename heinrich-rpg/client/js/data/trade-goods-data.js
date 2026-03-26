// FILE: client/js/data/trade-goods-data.js — PART 3

const TRADE_GOODS_DATA = {

  // ─── COMMODITY DEFINITIONS ────────────────────────────────────────────────
  commodities: {

    // GRAINS AND STAPLES
    wheat: {
      id: "wheat",
      name: "Wheat",
      category: "grain",
      unit: "bushel",
      weight_per_unit: 27, // kg
      base_price_sous: 8,
      perishable: true,
      perish_days: 180,
      storage_modifier: 0.8, // keeps longer in good storage
      seasonal_modifiers: {
        spring: 1.4, // scarce before harvest
        summer: 1.1, // right before harvest
        autumn: 0.7, // harvest time — cheap
        winter: 1.2  // stores running low
      },
      regional_production: {
        normandy_fields: "high",
        paris_basin: "high",
        brittany: "medium",
        flanders: "medium",
        provence: "low"
      },
      description: "The foundation of the medieval diet. Bread and survival."
    },

    rye: {
      id: "rye",
      name: "Rye",
      category: "grain",
      unit: "bushel",
      weight_per_unit: 25,
      base_price_sous: 5,
      perishable: true,
      perish_days: 220,
      seasonal_modifiers: { spring: 1.3, summer: 1.0, autumn: 0.6, winter: 1.1 },
      regional_production: { normandy_fields: "medium", brittany: "high", germany: "very_high" },
      description: "Poor man's grain. Hardier than wheat. Makes dense dark bread."
    },

    barley: {
      id: "barley",
      name: "Barley",
      category: "grain",
      unit: "bushel",
      weight_per_unit: 22,
      base_price_sous: 6,
      perishable: true,
      perish_days: 200,
      used_for_brewing: true,
      seasonal_modifiers: { spring: 1.2, summer: 1.0, autumn: 0.65, winter: 1.1 },
      regional_production: { normandy_fields: "high", flanders: "high" },
      description: "Essential for ale and bread. Grows where wheat fails."
    },

    oats: {
      id: "oats",
      name: "Oats",
      category: "grain",
      unit: "bushel",
      weight_per_unit: 14,
      base_price_sous: 4,
      perishable: true,
      perish_days: 150,
      horse_feed: true,
      seasonal_modifiers: { spring: 1.3, summer: 0.9, autumn: 0.6, winter: 1.2 },
      description: "Horse fodder and porridge. Military logistics depends on it."
    },

    // LIVESTOCK AND ANIMAL PRODUCTS
    cattle_draft: {
      id: "cattle_draft",
      name: "Draft Ox",
      category: "livestock",
      unit: "head",
      weight_per_unit: 600,
      base_price_sous: 120,
      perishable: false,
      seasonal_modifiers: { spring: 0.9, summer: 0.95, autumn: 0.8, winter: 1.1 },
      description: "The peasant's tractor. An ox in good condition is half a farm."
    },

    cattle_beef: {
      id: "cattle_beef",
      name: "Beef Cattle",
      category: "livestock",
      unit: "head",
      weight_per_unit: 400,
      base_price_sous: 80,
      perishable: false,
      seasonal_modifiers: { spring: 0.9, summer: 0.9, autumn: 0.7, winter: 1.2 },
      description: "Slaughtered in autumn or sold to markets."
    },

    sheep: {
      id: "sheep",
      name: "Sheep",
      category: "livestock",
      unit: "head",
      weight_per_unit: 60,
      base_price_sous: 20,
      perishable: false,
      produces: ["wool", "mutton", "milk"],
      description: "Wool, mutton, milk. The medieval utility animal."
    },

    pig: {
      id: "pig",
      name: "Pig",
      category: "livestock",
      unit: "head",
      weight_per_unit: 80,
      base_price_sous: 15,
      perishable: false,
      seasonal_modifiers: { autumn: 0.7, winter: 1.3 },
      description: "Fattened on acorns. Slaughtered at Martinmas. Salted for winter."
    },

    wool_raw: {
      id: "wool_raw",
      name: "Raw Wool",
      category: "textile",
      unit: "stone", // 6.35kg
      weight_per_unit: 6.35,
      base_price_sous: 12,
      perishable: false,
      seasonal_modifiers: { spring: 0.85, summer: 1.0, autumn: 1.1, winter: 1.3 },
      regional_production: {
        england: "very_high",
        flanders: "medium_processing",
        normandy: "medium"
      },
      description: "England's greatest export. Flanders' greatest need. Wool drives wars."
    },

    cloth_wool: {
      id: "cloth_wool",
      name: "Woolen Cloth",
      category: "textile",
      unit: "ell", // ~114cm
      weight_per_unit: 0.8,
      base_price_sous: 25,
      quality_tiers: ["coarse", "medium", "fine", "luxury"],
      price_multipliers: { coarse: 0.6, medium: 1.0, fine: 2.0, luxury: 5.0 },
      regional_production: { flanders: "very_high", italy: "high", france: "medium" },
      description: "The currency of the medieval world after coin."
    },

    cloth_linen: {
      id: "cloth_linen",
      name: "Linen",
      category: "textile",
      unit: "ell",
      weight_per_unit: 0.5,
      base_price_sous: 15,
      regional_production: { normandy: "high", flanders: "high", brittany: "medium" },
      description: "Undergarments, bedsheets, sails. Second only to wool in importance."
    },

    // FOOD PRODUCTS
    salt: {
      id: "salt",
      name: "Salt",
      category: "preserved_food",
      unit: "pound",
      weight_per_unit: 0.45,
      base_price_sous: 3,
      preservation_necessity: true,
      taxed_heavily: true,
      regional_production: {
        brittany_coast: "very_high",
        mediterranean: "very_high",
        inland: "none"
      },
      inland_price_multiplier: 3.0,
      description: "Before refrigeration, salt IS preservation. Life itself. Taxed accordingly."
    },

    salted_fish: {
      id: "salted_fish",
      name: "Salted Fish (Herring/Cod)",
      category: "food",
      unit: "barrel",
      weight_per_unit: 60,
      base_price_sous: 18,
      perishable: true,
      perish_days: 365,
      seasonal_modifiers: { lent: 0.6 }, // very high demand during Lent
      regional_production: { coastal: "high", inland: "none" },
      description: "Lenten staple. Coastal wealth. Carried everywhere that salt reaches."
    },

    wine: {
      id: "wine",
      name: "Wine",
      category: "beverage",
      unit: "barrel",
      weight_per_unit: 200,
      base_price_sous: 40,
      quality_tiers: ["vinegar_quality", "table_wine", "good_wine", "fine_wine"],
      price_multipliers: { vinegar_quality: 0.3, table_wine: 1.0, good_wine: 2.5, fine_wine: 8.0 },
      regional_production: {
        bordeaux: "very_high",
        burgundy: "very_high",
        champagne: "high",
        rhine: "high",
        normandy: "low"
      },
      description: "Safer than water. Required for Mass. Status symbol at every level."
    },

    ale: {
      id: "ale",
      name: "Ale",
      category: "beverage",
      unit: "barrel",
      weight_per_unit: 150,
      base_price_sous: 8,
      perishable: true,
      perish_days: 14,
      regional_production: { everywhere: "high" },
      description: "The daily drink of the poor. Safer than water. Low alcohol."
    },

    spices_pepper: {
      id: "spices_pepper",
      name: "Black Pepper",
      category: "luxury",
      unit: "pound",
      weight_per_unit: 0.45,
      base_price_sous: 60,
      trade_route_required: "eastern",
      regional_availability: { major_cities: "available", towns: "rare", villages: "never" },
      description: "Worth its weight in silver. Preserves meat and signals wealth."
    },

    spices_cinnamon: {
      id: "spices_cinnamon",
      name: "Cinnamon",
      category: "luxury",
      unit: "pound",
      weight_per_unit: 0.45,
      base_price_sous: 80,
      trade_route_required: "eastern",
      description: "The perfume of the rich man's kitchen."
    },

    spices_saffron: {
      id: "spices_saffron",
      name: "Saffron",
      category: "luxury",
      unit: "ounce",
      weight_per_unit: 0.028,
      base_price_sous: 40,
      trade_route_required: "eastern",
      description: "More expensive than gold by weight. Colors food yellow — a display of absurd wealth."
    },

    // RAW MATERIALS
    iron_ore: {
      id: "iron_ore",
      name: "Iron Ore",
      category: "raw_material",
      unit: "cartload",
      weight_per_unit: 400,
      base_price_sous: 15,
      regional_production: { lorraine: "very_high", brittany: "medium", spain: "high" },
      description: "The foundation of all metalwork. Heavy, low-value, essential."
    },

    iron_bars: {
      id: "iron_bars",
      name: "Wrought Iron Bars",
      category: "metal",
      unit: "pound",
      weight_per_unit: 0.45,
      base_price_sous: 4,
      refined_from: "iron_ore",
      regional_production: { lorraine: "high", germany: "high" },
      description: "Processed iron, ready for smithing."
    },

    steel: {
      id: "steel",
      name: "Good Steel",
      category: "metal",
      unit: "pound",
      weight_per_unit: 0.45,
      base_price_sous: 15,
      refined_from: "iron_bars",
      quality_variable: true,
      description: "Premium steel for weapons and fine tools. Not all smiths can work it."
    },

    timber: {
      id: "timber",
      name: "Timber",
      category: "raw_material",
      unit: "cartload",
      weight_per_unit: 300,
      base_price_sous: 10,
      regional_production: { normandy_forest: "high", germany: "high" },
      types: ["oak", "pine", "ash", "elm"],
      description: "Building, burning, shipping. A wealthy man's town is made of it."
    },

    charcoal: {
      id: "charcoal",
      name: "Charcoal",
      category: "fuel",
      unit: "sack",
      weight_per_unit: 20,
      base_price_sous: 3,
      seasonal_modifiers: { winter: 1.8 },
      essential_for_smithing: true,
      description: "Hotter than wood. Essential for metalwork and winter survival."
    },

    wax: {
      id: "wax",
      name: "Beeswax",
      category: "material",
      unit: "pound",
      weight_per_unit: 0.45,
      base_price_sous: 8,
      used_for: ["candles", "seals", "waterproofing"],
      church_demand: "very_high",
      description: "Pure beeswax candles burn in every church in Christendom."
    },

    tallow: {
      id: "tallow",
      name: "Tallow",
      category: "material",
      unit: "pound",
      weight_per_unit: 0.45,
      base_price_sous: 2,
      used_for: ["poor_candles", "lubricant", "soap_making"],
      description: "Rendered animal fat. Inferior candles. But cheap and available."
    },

    leather: {
      id: "leather",
      name: "Worked Leather",
      category: "material",
      unit: "hide",
      weight_per_unit: 3,
      base_price_sous: 12,
      quality_tiers: ["rough", "good", "fine"],
      description: "Shoes, armor, saddles, straps. Leather goes into everything."
    },

    // LUXURY GOODS
    silk: {
      id: "silk",
      name: "Silk",
      category: "luxury",
      unit: "ell",
      weight_per_unit: 0.1,
      base_price_sous: 200,
      trade_route_required: "eastern",
      regional_availability: { major_cities: "available", towns: "very_rare", villages: "never" },
      description: "The badge of the very wealthy. Imported from the east at enormous cost."
    },

    glass_window: {
      id: "glass_window",
      name: "Window Glass",
      category: "building_material",
      unit: "pane",
      weight_per_unit: 2,
      base_price_sous: 30,
      production_centers: ["venice", "germany"],
      description: "Expensive and coveted. Real glass windows mark a rich man's hall."
    },

    // MEDICINES AND HERBS
    theriac: {
      id: "theriac",
      name: "Theriac / Venice Treacle",
      category: "medicine",
      unit: "jar",
      weight_per_unit: 0.5,
      base_price_sous: 100,
      uses: ["universal_antidote", "plague_prevention", "poison_treatment"],
      effectiveness: 0.3, // actually not very effective
      availability: "apothecaries_only",
      description: "60+ ingredient universal medicine. Physicians swear by it. Often placebo."
    },

    herbal_medicines: {
      id: "herbal_medicines",
      name: "Herbal Medicines (Mixed)",
      category: "medicine",
      unit: "bundle",
      weight_per_unit: 0.3,
      base_price_sous: 5,
      effectiveness_variable: true,
      description: "Dried herbs, roots, and preparations. Effectiveness varies greatly."
    }
  },

  // ─── TRADE ROUTES ─────────────────────────────────────────────────────────
  trade_routes: {
    normandy_paris: {
      id: "normandy_paris",
      name: "Normandy-Paris Road",
      start: "rouen",
      end: "paris",
      distance_leagues: 25,
      travel_days: 4,
      goods_flowing_to_paris: ["grain", "fish", "wool", "livestock"],
      goods_flowing_to_normandy: ["wine", "luxury_goods", "finished_cloth"],
      toll_points: 3,
      toll_cost_total: 2,
      banditry_risk: 0.08,
      condition: "good"
    },
    english_channel: {
      id: "english_channel",
      name: "Cross-Channel Trade",
      start: "normandy_coast",
      end: "england",
      distance_leagues: 30,
      travel_days: [2, 5],
      goods_flowing_to_england: ["wine", "spices", "silk", "salt"],
      goods_flowing_to_normandy: ["wool_raw", "tin", "lead"],
      route_type: "sea",
      ship_required: true,
      storm_risk: 0.12,
      political_interference: "hundred_years_war_disruption"
    },
    northern_flanders: {
      id: "northern_flanders",
      name: "Flanders Cloth Route",
      start: "normandy",
      end: "bruges",
      distance_leagues: 60,
      travel_days: 10,
      goods_flowing_to_flanders: ["wine", "grain", "raw_wool"],
      goods_flowing_from_flanders: ["finished_cloth", "luxury_cloth", "dyes"],
      toll_points: 6,
      toll_cost_total: 8,
      banditry_risk: 0.06
    },
    pilgrimage_route_south: {
      id: "pilgrimage_route_south",
      name: "Pilgrim Road to Compostela",
      description: "The great pilgrim road south through France to Spain",
      goods: ["food", "souvenirs", "relics", "information"],
      opportunity: "traveler_contacts",
      special: "pilgrim_protection_zones"
    }
  },

  // ─── PRICE MODIFIERS ──────────────────────────────────────────────────────
  price_modifiers: {
    location_type: {
      village: { common_goods: 1.0, luxury_goods: 2.0, availability_luxury: 0.1 },
      town: { common_goods: 0.9, luxury_goods: 1.3, availability_luxury: 0.5 },
      city: { common_goods: 0.85, luxury_goods: 1.0, availability_luxury: 1.0 },
      port: { sea_goods: 0.8, landlocked_goods: 1.2 },
      crossroads: { trade_goods: 0.9 }
    },
    war_effects: {
      active_war_zone: { food: 2.0, weapons: 0.7, horses: 1.5, labor: 2.5 },
      near_war: { food: 1.3, weapons: 0.85, travel_goods: 1.5 },
      war_ended: { labor_cheap: 0.6, weapons_surplus: 0.5 }
    },
    skills_effect: {
      haggle_1: 0.05, // 5% better price per level
      haggle_2: 0.10,
      haggle_3: 0.15,
      haggle_4: 0.18,
      haggle_5: 0.22,
      reputation_merchant: 0.05,
      reputation_noble: -0.05 // nobles often pay more — merchants overcharge them
    }
  },

  // ─── MERCHANT COMPANY PROGRESSION ─────────────────────────────────────────
  company_tiers: {
    peddler: {
      tier: 1,
      name: "Itinerant Peddler",
      capital_min: 0,
      capital_max: 50,
      routes_available: 1,
      goods_carried: 1,
      wagon_required: false,
      employees: 0,
      description: "Walking from village to village with a pack on your back."
    },
    small_trader: {
      tier: 2,
      name: "Small Trader",
      capital_min: 50,
      capital_max: 300,
      routes_available: 2,
      goods_carried: 3,
      wagon_required: true,
      employees: 1,
      description: "A cart, a horse, and a trusted companion. Regular customers building."
    },
    merchant: {
      tier: 3,
      name: "Established Merchant",
      capital_min: 300,
      capital_max: 2000,
      routes_available: 4,
      goods_carried: 6,
      employees: [2, 5],
      warehouse_possible: true,
      guild_membership_possible: true,
      description: "Known in multiple towns. Credit available. Guild membership within reach."
    },
    merchant_company: {
      tier: 4,
      name: "Merchant Company",
      capital_min: 2000,
      capital_max: 20000,
      routes_available: 8,
      employees: [5, 20],
      ships_possible: true,
      factor_system: true,
      description: "Multiple cities, factors managing routes, your name known by lords."
    },
    trading_house: {
      tier: 5,
      name: "Great Trading House",
      capital_min: 20000,
      routes_available: 20,
      employees: [20, 100],
      ships: [2, 10],
      banking_possible: true,
      noble_patronage_likely: true,
      description: "Rumors follow your ships. Princes seek your credit. You are a power."
    }
  }

};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TRADE_GOODS_DATA };
}

// END FILE: client/js/data/trade-goods-data.js
