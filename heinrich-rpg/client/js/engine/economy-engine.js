// FILE: client/js/engine/economy-engine.js — PART 5

'use strict';

/**
 * ECONOMY ENGINE — Price calculation, wages, property income,
 * trade route profits, inflation, guild fees, and the complete
 * medieval money system (livres/sous/deniers).
 */

const EconomyEngine = (() => {

  // ─── MONEY SYSTEM ────────────────────────────────────────────────────────
  // 1 livre = 20 sous = 240 deniers
  const MONEY = {
    livres_to_sous: 20,
    sous_to_deniers: 12,
    livres_to_deniers: 240,
    coin_weights: {
      denier: 1.0,  // copper
      sou: 1.0,     // silver
      livre: 5.0    // silver coin or account unit
    }
  };

  // ─── WAGE TABLES ─────────────────────────────────────────────────────────
  const DAILY_WAGES_SOUS = {
    unskilled_laborer:   1.5,
    skilled_laborer:     3,
    craftsman_apprentice: 2,
    craftsman_journeyman: 5,
    craftsman_master:    10,
    soldier_footman:     4,
    soldier_crossbowman: 8,
    soldier_mounted:     20,
    clerk:               8,
    physician:           20,
    lawyer:              15,
    scribe:              6,
    teacher:             8,
    cook:                4,
    steward:             12,
    merchant_factor:     15,
    spy:                 25,
    knight:              40,
    captain:             60
  };

  // ─── PROPERTY INCOME ─────────────────────────────────────────────────────
  const PROPERTY_INCOME = {
    farm_small: {
      annual_gross_sous: 120,
      costs: { upkeep: 40, labor: 20, taxes: 15 },
      net_per_year: 45,
      risks: ['bad_harvest', 'disease', 'theft']
    },
    farm_large: {
      annual_gross_sous: 400,
      costs: { upkeep: 100, labor: 80, taxes: 60 },
      net_per_year: 160,
      requires_steward: true
    },
    tavern_small: {
      annual_gross_sous: 800,
      costs: { rent: 120, supplies: 300, labor: 100 },
      net_per_year: 280,
      location_multiplier_key: 'foot_traffic'
    },
    smithy: {
      annual_gross_sous: 600,
      costs: { materials: 200, upkeep: 50 },
      net_per_year: 350,
      requires_skill_level: { smithing: 5 }
    },
    mill: {
      annual_gross_sous: 500,
      costs: { upkeep: 80, labor_occasional: 30 },
      net_per_year: 390,
      monopoly_possible: true,
      monopoly_multiplier: 1.8
    },
    manor: {
      annual_gross_sous: 2000,
      costs: { upkeep: 400, garrison: 300, taxes_up: 200 },
      net_per_year: 1100,
      requires_class: 'petty_noble'
    },
    ship_small: {
      per_voyage_gross: [100, 400],
      costs_per_voyage: { crew: 40, supplies: 30, port_fees: 10 },
      voyages_per_year: [4, 8]
    }
  };

  // ─── PRICE CALCULATION ───────────────────────────────────────────────────

  /**
   * Calculate the actual price of an item given all modifiers.
   * @param {string} itemId - Item ID from item-database.js
   * @param {number} basePrice - Base price in sous
   * @param {object} context - { location_type, season, skill_haggle, npc_disposition, war_state, scarcity }
   */
  function calculatePrice(itemId, basePrice, context = {}) {
    let price = basePrice;
    const appliedMods = [];

    // Location type modifier
    if (context.location_type) {
      const locMods = {
        village: { common: 1.0, luxury: 2.0 },
        town: { common: 0.9, luxury: 1.3 },
        city: { common: 0.85, luxury: 1.0 },
        fair: { common: 0.8, luxury: 0.9 },
        port: { sea_goods: 0.75, inland_goods: 1.2 },
        remote: { common: 1.3, luxury: 3.0 }
      };
      const locMod = locMods[context.location_type];
      if (locMod) {
        const cat = context.item_category || 'common';
        const mult = locMod[cat] || locMod.common || 1.0;
        if (mult !== 1.0) {
          price *= mult;
          appliedMods.push({ source: 'Location', multiplier: mult });
        }
      }
    }

    // Seasonal modifier (from trade-goods-data.js)
    if (context.season && context.seasonal_modifier) {
      const mult = context.seasonal_modifier;
      if (mult !== 1.0) {
        price *= mult;
        appliedMods.push({ source: 'Season', multiplier: mult });
      }
    }

    // Haggling reduction — each haggle level = ~5% better
    if (context.skill_haggle) {
      const haggleDiscount = Math.min(0.25, context.skill_haggle * 0.05);
      price *= (1 - haggleDiscount);
      if (haggleDiscount > 0) appliedMods.push({ source: 'Haggling', multiplier: 1 - haggleDiscount });
    }

    // NPC disposition
    if (context.npc_disposition !== undefined) {
      const dispMult = 1 - (context.npc_disposition / 200); // -50% at 100 favor, +50% at -100
      price *= Math.max(0.5, Math.min(1.5, dispMult));
      if (dispMult !== 1) appliedMods.push({ source: 'NPC Disposition', multiplier: dispMult });
    }

    // War effects
    if (context.war_state === 'active_war_zone') {
      price *= 1.8;
      appliedMods.push({ source: 'War', multiplier: 1.8 });
    }

    // Scarcity
    if (context.scarcity) {
      price *= context.scarcity;
      appliedMods.push({ source: 'Scarcity', multiplier: context.scarcity });
    }

    return {
      final_price: Math.round(price),
      base_price: basePrice,
      modifiers: appliedMods
    };
  }

  /**
   * Determine if Heinrich can afford something.
   */
  function canAfford(inventory, priceSous) {
    const totalSous = (inventory.coin.livres * 20) + inventory.coin.sous + (inventory.coin.deniers / 12);
    return totalSous >= priceSous;
  }

  /**
   * Spend money (deducting from inventory).
   * Returns false if insufficient funds.
   */
  function spendMoney(inventory, amountSous) {
    const totalSous = (inventory.coin.livres * 20) + inventory.coin.sous + (inventory.coin.deniers / 12);
    if (totalSous < amountSous) return false;

    // Work from sous first
    let remaining = amountSous;
    let { livres, sous, deniers } = inventory.coin;

    // Convert to deniers for easy arithmetic
    let totalDeniers = (livres * 240) + (sous * 12) + deniers;
    totalDeniers -= Math.round(amountSous * 12);
    if (totalDeniers < 0) return false;

    inventory.coin.livres = Math.floor(totalDeniers / 240);
    totalDeniers %= 240;
    inventory.coin.sous = Math.floor(totalDeniers / 12);
    inventory.coin.deniers = totalDeniers % 12;

    // Update wealth tier
    inventory.wealth_tier = _calculateWealthTier(inventory.coin);

    return true;
  }

  /**
   * Receive money (adding to inventory).
   */
  function receiveMoney(inventory, amountSous) {
    let totalDeniers = (inventory.coin.livres * 240) + (inventory.coin.sous * 12) + inventory.coin.deniers;
    totalDeniers += Math.round(amountSous * 12);

    inventory.coin.livres = Math.floor(totalDeniers / 240);
    totalDeniers %= 240;
    inventory.coin.sous = Math.floor(totalDeniers / 12);
    inventory.coin.deniers = totalDeniers % 12;

    inventory.wealth_tier = _calculateWealthTier(inventory.coin);
  }

  function _calculateWealthTier(coin) {
    const totalSous = (coin.livres * 20) + coin.sous + (coin.deniers / 12);
    if (totalSous < 5) return 'destitute';
    if (totalSous < 30) return 'poor';
    if (totalSous < 120) return 'struggling';
    if (totalSous < 500) return 'comfortable';
    if (totalSous < 2000) return 'wealthy';
    if (totalSous < 10000) return 'rich';
    return 'very_rich';
  }

  /**
   * Format coin amounts for display.
   */
  function formatCoin(coin) {
    const parts = [];
    if (coin.livres > 0) parts.push(`${coin.livres}₤`);
    if (coin.sous > 0) parts.push(`${coin.sous}s`);
    if (coin.deniers > 0) parts.push(`${coin.deniers}d`);
    return parts.join(' ') || '0d';
  }

  function formatSous(sous) {
    if (sous < 12) return `${sous}s`;
    const livres = Math.floor(sous / 20);
    const remSous = Math.round(sous % 20);
    if (livres > 0) return `${livres}₤ ${remSous}s`;
    return `${remSous}s`;
  }

  // ─── PROPERTY INCOME CALCULATION ─────────────────────────────────────────

  /**
   * Calculate income from a property for a given period.
   * Called by world-tick when rent is due.
   */
  function calculatePropertyIncome(property, state) {
    const template = PROPERTY_INCOME[property.type];
    if (!template) return { income: 0, costs: 0, net: 0 };

    let grossMultiplier = 1.0;

    // Location quality bonus
    if (property.location_quality === 'excellent') grossMultiplier *= 1.4;
    else if (property.location_quality === 'good') grossMultiplier *= 1.2;
    else if (property.location_quality === 'poor') grossMultiplier *= 0.7;

    // Stewardship skill bonus (for managed properties)
    if (property.has_steward) {
      const stewardshipLevel = state.skills.stewardship?.level || 0;
      grossMultiplier *= (1 + stewardshipLevel * 0.02);
    }

    // Season effect on farming properties
    if (['farm_small', 'farm_large'].includes(property.type)) {
      const season = state.calendar.season;
      if (season === 'autumn') grossMultiplier *= 1.3; // Harvest
      if (season === 'winter') grossMultiplier *= 0.5; // No farming
    }

    // Damage or poor condition
    if (property.condition === 'damaged') grossMultiplier *= 0.5;
    if (property.condition === 'neglected') grossMultiplier *= 0.7;

    const grossAnnual = (template.annual_gross_sous || 0) * grossMultiplier;
    const netAnnual = template.net_per_year * grossMultiplier;

    // Convert to per-turn (360 days/year, 8 turns/day = 2880 turns/year)
    const netPerTurn = netAnnual / 2880;

    return {
      income: Math.round(grossAnnual),
      costs: Math.round(grossAnnual - netAnnual),
      net: Math.round(netAnnual),
      net_per_turn: netPerTurn
    };
  }

  // ─── TRADE ROUTE PROFITS ─────────────────────────────────────────────────

  /**
   * Calculate potential profit from a trade route.
   */
  function calculateTradeProfit(route, goods, quantity, state) {
    const buyPrice = goods.base_price_sous * (goods.seasonal_modifiers?.[state.calendar.season] || 1.0);
    const sellPriceModifier = 1.3 + (Math.random() * 0.3); // 30-60% markup at destination
    const sellPrice = buyPrice * sellPriceModifier;

    const totalCost = (buyPrice * quantity) + (route.toll_cost_total || 0);
    const totalRevenue = sellPrice * quantity;
    const profit = totalRevenue - totalCost;

    // Risk-adjust for banditry
    const banditryRisk = route.banditry_risk || 0;
    const expectedProfit = profit * (1 - banditryRisk);

    return {
      buy_price: Math.round(buyPrice),
      sell_price: Math.round(sellPrice),
      quantity,
      total_cost: Math.round(totalCost),
      total_revenue: Math.round(totalRevenue),
      gross_profit: Math.round(profit),
      banditry_risk: banditryRisk,
      expected_profit: Math.round(expectedProfit),
      profit_margin: Math.round((profit / totalCost) * 100)
    };
  }

  // ─── WAGES AND HIRING ─────────────────────────────────────────────────────

  /**
   * Get daily wage for a role type.
   */
  function getDailyWage(roleType, qualityModifier = 1.0) {
    const base = DAILY_WAGES_SOUS[roleType] || 3;
    return Math.round(base * qualityModifier);
  }

  /**
   * Process weekly payroll for Heinrich's employees.
   * @param {Array} employees - [{ role, daily_wage, days_hired }]
   */
  function processPayroll(employees, inventory, turnsElapsed) {
    const daysElapsed = turnsElapsed / 8;
    let totalOwed = 0;

    for (const emp of employees) {
      const owed = emp.daily_wage * daysElapsed;
      totalOwed += owed;
    }

    const canPay = canAfford(inventory, totalOwed);
    if (canPay) {
      spendMoney(inventory, totalOwed);
      return { paid: true, amount: totalOwed, morale_effect: 0 };
    } else {
      return { paid: false, amount_owed: totalOwed, morale_effect: -20, risk: 'employees_may_desert' };
    }
  }

  // ─── GUILD SYSTEM ─────────────────────────────────────────────────────────

  const GUILD_FEES = {
    smiths: { annual_dues: 12, entry_fee: 30, protection_bonus: 10, price_floor: 0.85 },
    merchants: { annual_dues: 20, entry_fee: 50, route_access: true, credit_available: true },
    bakers: { annual_dues: 6, entry_fee: 15 },
    butchers: { annual_dues: 8, entry_fee: 20 },
    carpenters: { annual_dues: 10, entry_fee: 25 },
    masons: { annual_dues: 12, entry_fee: 30 }
  };

  function getGuildJoinCost(guildId) {
    return GUILD_FEES[guildId]?.entry_fee || 20;
  }

  function processGuildDues(state, guildId) {
    const fees = GUILD_FEES[guildId];
    if (!fees) return { success: false };

    const quarterlyDues = Math.round(fees.annual_dues / 4);
    if (spendMoney(state.inventory, quarterlyDues)) {
      return { success: true, paid: quarterlyDues };
    }
    return { success: false, amount_owed: quarterlyDues, risk: 'guild_expulsion' };
  }

  // ─── TAX SYSTEM ──────────────────────────────────────────────────────────

  const TAX_RATES = {
    serf: {
      grain_rent: { rate: 0.30, basis: 'harvest_value' },
      hearth_tax: { flat_sous: 0.5, frequency: 'annual' },
      corvee: { days_owed: 3, frequency: 'weekly' },
      heriot: { rate: 1.0, basis: 'best_animal_value', on: 'death' }
    },
    freeman: {
      market_toll: { rate: 0.02, basis: 'goods_sold' },
      hearth_tax: { flat_sous: 1, frequency: 'annual' },
      royal_tax: { rate: 0.05, basis: 'income', frequency: 'annual' }
    },
    knight: {
      scutage: { flat_livres: 2, frequency: 'annual', notes: 'paid in lieu of military service' },
      feudal_aid: { rate: 0.1, basis: 'land_value', frequency: 'irregular' }
    }
  };

  /**
   * Calculate taxes owed for the current period.
   */
  function calculateTaxes(state, period = 'quarterly') {
    const heinrichClass = state.heinrich.class;
    const taxProfile = TAX_RATES[heinrichClass] || TAX_RATES.freeman;
    const obligations = [];

    if (period === 'quarterly') {
      // Hearth tax (quarterly portion)
      if (taxProfile.hearth_tax) {
        obligations.push({
          type: 'hearth_tax',
          amount_sous: taxProfile.hearth_tax.flat_sous / 4,
          collector: 'local_lord',
          consequence_if_unpaid: 'fine_then_seizure'
        });
      }
      // Market toll (estimate quarterly)
      if (taxProfile.market_toll && state.trade.active_routes?.length > 0) {
        const estimatedSales = 40; // proxy — real calc needs trade history
        obligations.push({
          type: 'market_toll',
          amount_sous: estimatedSales * taxProfile.market_toll.rate,
          collector: 'market_master'
        });
      }
    }

    return obligations;
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    MONEY,
    DAILY_WAGES_SOUS,
    PROPERTY_INCOME,
    GUILD_FEES,
    TAX_RATES,
    calculatePrice,
    canAfford,
    spendMoney,
    receiveMoney,
    formatCoin,
    formatSous,
    calculatePropertyIncome,
    calculateTradeProfit,
    getDailyWage,
    processPayroll,
    getGuildJoinCost,
    processGuildDues,
    calculateTaxes
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EconomyEngine };
}

// END FILE: client/js/engine/economy-engine.js
