// FILE: client/js/engine/world-tick.js — PART 5

'use strict';

/**
 * WORLD TICK — The master turn processor. Called every turn to advance
 * all game systems in the correct order. Calls into every sub-engine.
 * Returns an events array that drives the LLM narrative prompt.
 */

const WorldTick = (() => {

  // ─── TICK SEQUENCE ────────────────────────────────────────────────────────
  // Order matters: calendar first, then weather, health, world state,
  // consequences, reputation decay, property income, historical events.

  /**
   * Process one full game turn.
   * @param {object} state - Full game state (mutated in-place)
   * @param {object} playerAction - What the player did this turn
   * @returns {{ events: Array, state_deltas: Array, narrative_hints: object }}
   */
  function tick(state, playerAction = {}) {
    const events = [];
    const stateDeltas = [];

    // ── 1. CALENDAR ──────────────────────────────────────────────────────
    const calResult = CalendarEngine.advanceTurn(state.calendar);
    state.meta.turn++;
    state.meta.total_turns_played++;
    events.push(...calResult.events);

    // ── 2. WEATHER (once per day) ────────────────────────────────────────
    if (calResult.changedDay) {
      const newWeather = WeatherEngine.generateDailyWeather(state.weather.current, state.calendar.season);
      const oldWeatherType = state.weather.current.type;
      state.weather.current = newWeather;

      if (newWeather.type !== oldWeatherType) {
        events.push({
          type: 'weather_changed',
          from: oldWeatherType,
          to: newWeather.type,
          description: WeatherEngine.getWeatherNarrative(newWeather)
        });
      }
    }

    // ── 3. HEALTH ENGINE ─────────────────────────────────────────────────
    const healthContext = _buildHealthContext(playerAction, state);
    const healthEvents = HealthEngine.processTurn(state, healthContext);
    events.push(...healthEvents);

    // If Heinrich died — game over
    if (state.meta.game_over) {
      return { events, stateDeltas, game_over: true, death_cause: state.meta.death_cause };
    }

    // ── 4. XP APPLICATION ─────────────────────────────────────────────────
    if (playerAction.skill_checks) {
      for (const check of playerAction.skill_checks) {
        const levelUpResult = DiceEngine.applyXP(state.skills, check.skillName, check.xpAwarded);
        if (levelUpResult.leveledUp) {
          events.push({
            type: 'level_up',
            skill: check.skillName,
            new_level: levelUpResult.newLevel,
            passive_unlocked: levelUpResult.passiveUnlocked || null
          });
        }
      }
    }

    // ── 5. SKILL BRANCH UNLOCKS ──────────────────────────────────────────
    const newBranches = SkillSystem.checkBranchUnlocks(state.skills);
    for (const branch of newBranches) {
      events.push({ type: 'branch_unlocked', branch, narrative_key: 'skill_branch_available' });
    }

    // ── 6. REPUTATION DECAY / HEAT DECAY ────────────────────────────────
    if (calResult.changedDay) {
      ReputationEngine.decayHeat(state, 1);
    }

    // ── 7. VICE MANAGEMENT ────────────────────────────────────────────────
    const viceEvents = _processVices(state, playerAction);
    events.push(...viceEvents);

    // ── 8. CONSEQUENCE TRIGGERS ───────────────────────────────────────────
    const consequenceEvents = _processConsequences(state);
    events.push(...consequenceEvents);

    // ── 9. NPC WORLD ACTIONS (autonomous NPCs) ───────────────────────────
    if (calResult.changedDay) {
      const npcEvents = _processAutonomousNPCs(state);
      events.push(...npcEvents);
    }

    // ── 10. PROPERTY INCOME (weekly) ──────────────────────────────────────
    if (state.meta.turn % 56 === 0 && state.properties?.length > 0) { // every 56 turns ≈ 1 week
      const incomeEvents = _processPropertyIncome(state);
      events.push(...incomeEvents);
    }

    // ── 11. GUILD/TAX OBLIGATIONS (quarterly) ────────────────────────────
    if (calResult.changedMonth && state.calendar.date.month % 3 === 0) {
      const taxEvents = _processTaxes(state);
      events.push(...taxEvents);
    }

    // ── 12. HISTORICAL WORLD EVENTS ──────────────────────────────────────
    if (calResult.changedYear) {
      const worldEvents = _checkHistoricalEvents(state);
      events.push(...worldEvents);
    }

    // ── 13. RUMOR DECAY ──────────────────────────────────────────────────
    if (calResult.changedDay) {
      _decayRumors(state);
    }

    // ── 14. ANIMAL/HORSE NEEDS ───────────────────────────────────────────
    if (state.animals.horse) {
      const horseEvents = _processHorse(state, healthContext);
      events.push(...horseEvents);
    }

    // ── 15. OATHS CHECK ──────────────────────────────────────────────────
    if (calResult.changedDay) {
      const oathEvents = _checkOathDeadlines(state);
      events.push(...oathEvents);
    }

    // ── 16. LEGACY SCORE UPDATE ──────────────────────────────────────────
    if (calResult.changedDay) {
      state.chronicle.legacy_score = ReputationEngine.calculateLegacyScore(state);
    }

    // Build narrative hints for LLM
    const narrativeHints = _buildNarrativeHints(events, state, playerAction);

    return { events, stateDeltas, narrative_hints: narrativeHints, game_over: false };
  }

  // ─── CONTEXT BUILDERS ─────────────────────────────────────────────────────

  function _buildHealthContext(playerAction, state) {
    return {
      ate_this_turn: !!playerAction.ate,
      food_quality: playerAction.food_quality || 'adequate',
      drank_this_turn: !!playerAction.drank,
      drink_quality: playerAction.drink_quality || 'water',
      sleeping: playerAction.action_type === 'sleep',
      resting: playerAction.action_type === 'rest',
      heavy_labor: playerAction.action_type === 'labor',
      combat_turn: playerAction.action_type === 'combat',
      in_danger: state.heinrich.combat.in_combat,
      trauma_event: playerAction.trauma_event || null,
      ptsd_trigger: playerAction.ptsd_trigger || null
    };
  }

  // ─── VICE PROCESSING ──────────────────────────────────────────────────────

  function _processVices(state, playerAction) {
    const events = [];
    const vices = state.heinrich.vices;

    for (const [viceName, vice] of Object.entries(vices)) {
      if (vice.level <= 0) continue;

      vice.abstaining_days = (vice.abstaining_days || 0) + (1 / 8); // fraction of day per turn

      // Generate urge if abstaining long enough
      if (vice.level >= 3 && !vice.active_urge) {
        const urgeDays = vice.level <= 3 ? 3 : vice.level <= 6 ? 2 : 1;
        if (vice.abstaining_days >= urgeDays) {
          vice.active_urge = true;
          events.push({
            type: 'vice_urge',
            vice: viceName,
            level: vice.level,
            narrative_key: 'vice_craving'
          });
        }
      }

      // If player indulged this turn
      if (playerAction.indulged_vice === viceName) {
        vice.last_indulged = state.meta.turn;
        vice.abstaining_days = 0;
        vice.active_urge = false;

        // Vice escalation check
        if (vice.level < 10 && DiceEngine.chance(0.05)) {
          vice.level = Math.min(10, vice.level + 1);
          events.push({ type: 'vice_escalated', vice: viceName, new_level: vice.level });
        }

        // Mental relief from indulging
        state.heinrich.health.mental_value = Math.min(100, state.heinrich.health.mental_value + (vice.level * 2));
      }

      // Withdrawal check if high-level vice and long abstinence
      if (vice.level >= 5 && vice.abstaining_days > 2) {
        const withdrawalRisk = (vice.level - 4) * 0.1;
        if (DiceEngine.chance(withdrawalRisk)) {
          const condition = state.heinrich.health.mental_conditions.find(c => c.type === 'addiction_withdrawal' && c.vice === viceName);
          if (!condition) {
            state.heinrich.health.mental_conditions.push({ type: 'addiction_withdrawal', vice: viceName, intensity: vice.level });
            events.push({ type: 'withdrawal_onset', vice: viceName });
          }
        }
      }
    }

    return events;
  }

  // ─── CONSEQUENCE PROCESSING ───────────────────────────────────────────────

  function _processConsequences(state) {
    const events = [];
    const now = state.meta.turn;

    for (const consequence of (state.consequences?.active || [])) {
      // Check if consequence trigger time has arrived
      if (consequence.trigger_turn && now >= consequence.trigger_turn && !consequence.fired) {
        consequence.fired = true;
        events.push({
          type: 'consequence_fires',
          id: consequence.id,
          name: consequence.name,
          description: consequence.description,
          effects: consequence.effects,
          narrative_key: 'consequence_arrives'
        });
        // Move to resolved
        state.consequences.active = state.consequences.active.filter(c => c.id !== consequence.id);
        state.consequences.resolved.push({ ...consequence, resolved_turn: now });
      }
    }

    return events;
  }

  // ─── AUTONOMOUS NPC ACTIONS ───────────────────────────────────────────────

  function _processAutonomousNPCs(state) {
    const events = [];
    // NPCs take actions once per day based on their goals
    for (const [npcId, npc] of Object.entries(state.npcs.active || {})) {
      if (!npc.autonomous) continue;

      // NPC with grudge may escalate
      if (npc.grudge_active && DiceEngine.chance(0.02)) {
        events.push({
          type: 'npc_action',
          npc_id: npcId,
          action: 'grudge_escalation',
          description: `${npc.name} has taken an action against Heinrich`,
          narrative_key: 'npc_grudge_action'
        });
      }

      // NPC ally may offer opportunity
      const relationship = state.npc_relationships?.[npcId];
      if (relationship && relationship.favorability > 70 && DiceEngine.chance(0.05)) {
        events.push({
          type: 'npc_opportunity',
          npc_id: npcId,
          narrative_key: 'npc_offers_something'
        });
      }
    }

    return events;
  }

  // ─── PROPERTY INCOME ─────────────────────────────────────────────────────

  function _processPropertyIncome(state) {
    const events = [];
    for (const property of (state.properties || [])) {
      const income = EconomyEngine.calculatePropertyIncome(property, state);
      if (income.net > 0) {
        const weeklyNet = Math.round(income.net / 52);
        EconomyEngine.receiveMoney(state.inventory, weeklyNet);
        events.push({
          type: 'property_income',
          property_name: property.name,
          amount_sous: weeklyNet,
          narrative_key: 'property_earns'
        });
      }
    }
    return events;
  }

  // ─── TAX PROCESSING ──────────────────────────────────────────────────────

  function _processTaxes(state) {
    const events = [];
    const obligations = EconomyEngine.calculateTaxes(state, 'quarterly');

    for (const tax of obligations) {
      const paid = EconomyEngine.spendMoney(state.inventory, tax.amount_sous);
      if (paid) {
        events.push({ type: 'tax_paid', obligation: tax.type, amount: tax.amount_sous });
      } else {
        events.push({
          type: 'tax_unpaid',
          obligation: tax.type,
          amount_owed: tax.amount_sous,
          consequence: tax.consequence_if_unpaid,
          narrative_key: 'tax_default_warning'
        });
        // Increase heat regionally
        ReputationEngine.increaseHeat(state, 15, state.map.current_location);
      }
    }

    return events;
  }

  // ─── HISTORICAL EVENTS ────────────────────────────────────────────────────

  function _checkHistoricalEvents(state) {
    const events = [];
    const year = state.calendar.date.year;

    // Key historical triggers for the Hundred Years War era
    const historicalTriggers = {
      1403: { event: 'schism_continues', description: 'Three popes still contest the papacy. Christendom remains divided.' },
      1407: { event: 'jean_sans_peur_assassination_building', description: 'Political tension in Paris grows between Armagnacs and Burgundians.' },
      1413: { event: 'cabochien_revolt', description: 'Paris erupts in revolt. Butchers and tanners seize the city briefly.' },
      1415: { event: 'agincourt', description: 'A catastrophic French defeat at Agincourt. England owns northern France.' },
      1417: { event: 'schism_ends', description: 'The Great Schism finally ends at the Council of Constance. One pope again.' },
      1420: { event: 'treaty_troyes', description: 'The Treaty of Troyes: Henry V named heir to France. A humiliation.' }
    };

    if (historicalTriggers[year] && !state.world.historical_events_fired.includes(year)) {
      state.world.historical_events_fired.push(year);
      const trigger = historicalTriggers[year];
      state.world.current_year_events.push(trigger);
      events.push({
        type: 'historical_event',
        ...trigger,
        narrative_key: 'world_event_occurs'
      });
    }

    return events;
  }

  // ─── RUMOR DECAY ──────────────────────────────────────────────────────────

  function _decayRumors(state) {
    const decayRate = 0.05; // 5% decay per day
    state.rumors.active = state.rumors.active.filter(rumor => {
      rumor.strength = (rumor.strength || 100) - (decayRate * 100);
      if (rumor.strength <= 0) {
        state.rumors.decayed.push({ ...rumor, decayed_turn: state.meta.turn });
        return false;
      }
      return true;
    });
  }

  // ─── HORSE PROCESSING ─────────────────────────────────────────────────────

  function _processHorse(state, context) {
    const events = [];
    const horse = state.animals.horse;

    // Horse needs feeding
    horse.hunger = (horse.hunger || 100) - (context.heavy_labor ? 4 : 2);
    if (horse.hunger < 0) horse.hunger = 0;

    if (!context.ate_this_turn && horse.hunger < 30) {
      events.push({ type: 'horse_hungry', horse_name: horse.name || 'your horse', narrative_key: 'horse_needs_feed' });
    }

    // Bond development
    if (context.action_type === 'horse_care' || context.action_type === 'horseback_riding') {
      horse.bond = Math.min(100, (horse.bond || 50) + 1);
    }

    return events;
  }

  // ─── OATH DEADLINES ───────────────────────────────────────────────────────

  function _checkOathDeadlines(state) {
    const events = [];
    for (const oath of (state.oaths?.sworn_by_heinrich || [])) {
      if (oath.deadline_turn && state.meta.turn >= oath.deadline_turn && !oath.fulfilled && !oath.broken) {
        events.push({
          type: 'oath_deadline',
          oath_name: oath.name,
          to_whom: oath.to_whom,
          narrative_key: 'oath_due'
        });
      }
    }
    return events;
  }

  // ─── NARRATIVE HINTS ──────────────────────────────────────────────────────

  /**
   * Build narrative hints object for the LLM prompt.
   * Tells the LLM what happened this turn so it can weave it into prose.
   */
  function _buildNarrativeHints(events, state, playerAction) {
    return {
      turn_number: state.meta.turn,
      date: CalendarEngine.formatDate(state.calendar.date, true),
      medieval_date: CalendarEngine.getMedievalDateDescription(state.calendar.date),
      time_of_day: state.calendar.time_of_day,
      season_description: CalendarEngine.getSeasonDescription(state.calendar),
      weather_description: WeatherEngine.getWeatherNarrative(state.weather.current),
      temperature: state.weather.current.temperature,
      health_summary: HealthEngine.getHealthSummary(state.heinrich),
      reputation_dominant: ReputationEngine.getDominantTrait(state),
      active_events: events.filter(e => e.narrative_key).map(e => ({
        type: e.type,
        key: e.narrative_key,
        detail: e.description || ''
      })),
      pressing_concerns: _identifyPressingConcerns(state),
      player_action_type: playerAction.action_type || 'generic'
    };
  }

  function _identifyPressingConcerns(state) {
    const concerns = [];
    const h = state.heinrich;

    if (h.health.hunger_value < 30) concerns.push({ type: 'starving', urgency: 'critical' });
    if (h.health.thirst_value < 30) concerns.push({ type: 'thirsty', urgency: 'critical' });
    if (h.health.fatigue_value < 20) concerns.push({ type: 'exhausted', urgency: 'high' });
    if (h.health.hp_current < h.health.hp_max * 0.3) concerns.push({ type: 'badly_wounded', urgency: 'critical' });
    if (h.health.disease) concerns.push({ type: 'diseased', urgency: h.health.disease.mortality_rate > 0.3 ? 'critical' : 'high' });
    if (h.heat > 70) concerns.push({ type: 'hunted', urgency: 'high' });
    if (h.combat.in_combat) concerns.push({ type: 'in_combat', urgency: 'critical' });

    const unpaidOaths = (state.oaths?.sworn_by_heinrich || []).filter(o => !o.fulfilled && !o.broken);
    if (unpaidOaths.length > 0) concerns.push({ type: 'oath_outstanding', urgency: 'medium' });

    return concerns;
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return { tick };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { WorldTick };
}

// END FILE: client/js/engine/world-tick.js
