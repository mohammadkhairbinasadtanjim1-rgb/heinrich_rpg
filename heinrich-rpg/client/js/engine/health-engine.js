// FILE: client/js/engine/health-engine.js — PART 4

'use strict';

/**
 * HEALTH ENGINE — Hunger, fatigue, thirst, wound healing, disease progression,
 * aging, mental health, exhaustion spiral, death detection.
 * Runs every turn as part of world-tick.
 */

const HealthEngine = (() => {

  // ─── HUNGER STAGES ───────────────────────────────────────────────────────
  const HUNGER_STAGES = [
    { min: 0,  max: 15,  label: 'Starving',         status: 'starving',        physical_penalty: -30, mental_penalty: -20, endurance_drain: 3 },
    { min: 15, max: 30,  label: 'Very Hungry',      status: 'very_hungry',     physical_penalty: -15, mental_penalty: -10, endurance_drain: 2 },
    { min: 30, max: 50,  label: 'Hungry',           status: 'hungry',          physical_penalty: -8,  mental_penalty: -5,  endurance_drain: 1 },
    { min: 50, max: 70,  label: 'Peckish',          status: 'peckish',         physical_penalty: -3,  mental_penalty: 0,   endurance_drain: 0 },
    { min: 70, max: 90,  label: 'Sated',            status: 'sated',           physical_penalty: 0,   mental_penalty: 0,   endurance_drain: 0 },
    { min: 90, max: 101, label: 'Well Fed',         status: 'well_fed',        physical_penalty: 0,   mental_penalty: 0,   endurance_drain: 0, bonus: 5 }
  ];

  // ─── FATIGUE STAGES (Exhaustion Spiral) ─────────────────────────────────
  const FATIGUE_STAGES = [
    { min: 0,  max: 10,  label: 'Collapsed',     status: 'collapsed',    all_penalty: -50, cannot_act: true },
    { min: 10, max: 20,  label: 'Severely Worn', status: 'worn_out',     all_penalty: -35, half_speed: true },
    { min: 20, max: 35,  label: 'Exhausted',     status: 'exhausted',    all_penalty: -25 },
    { min: 35, max: 55,  label: 'Tired',         status: 'tired',        all_penalty: -12 },
    { min: 55, max: 75,  label: 'Weary',         status: 'weary',        all_penalty: -5 },
    { min: 75, max: 90,  label: 'Fresh',         status: 'fresh',        all_penalty: 0 },
    { min: 90, max: 101, label: 'Fully Rested',  status: 'rested',       all_penalty: 0, bonus: 5 }
  ];

  // ─── THIRST STAGES ──────────────────────────────────────────────────────
  const THIRST_STAGES = [
    { min: 0,  max: 15,  label: 'Severely Dehydrated', status: 'dehydrated_severe', mental_penalty: -30, physical_penalty: -25, death_risk_per_turn: 0.02 },
    { min: 15, max: 35,  label: 'Very Thirsty',        status: 'very_thirsty',       mental_penalty: -15, physical_penalty: -12 },
    { min: 35, max: 60,  label: 'Thirsty',             status: 'thirsty',            mental_penalty: -5,  physical_penalty: -5 },
    { min: 60, max: 80,  label: 'Dry',                 status: 'dry',                mental_penalty: 0,   physical_penalty: 0 },
    { min: 80, max: 101, label: 'Quenched',            status: 'quenched',           mental_penalty: 0,   physical_penalty: 0 }
  ];

  // ─── MENTAL STATE STAGES ─────────────────────────────────────────────────
  const MENTAL_STAGES = [
    { min: 0,  max: 10,  label: 'Breakdown',        status: 'breakdown',        all_penalty: -40, trauma_permanent: true },
    { min: 10, max: 25,  label: 'Severely Disturbed', status: 'disturbed_severe', all_penalty: -25, irrational: true },
    { min: 25, max: 45,  label: 'Disturbed',         status: 'disturbed',        all_penalty: -15 },
    { min: 45, max: 65,  label: 'Unsettled',         status: 'unsettled',        all_penalty: -5 },
    { min: 65, max: 80,  label: 'Steady',            status: 'steady',           all_penalty: 0 },
    { min: 80, max: 101, label: 'Composed',          status: 'composed',         all_penalty: 0, bonus: 5 }
  ];

  // ─── DEPLETION RATES PER TURN ─────────────────────────────────────────────
  const DEPLETION = {
    hunger_per_turn: 3,        // -3 per turn without food
    thirst_per_turn: 5,        // -5 per turn without drink
    fatigue_resting: 15,       // +15 per turn of full rest (sleep)
    fatigue_light_rest: 8,     // +8 per turn of light rest (sitting, light travel)
    fatigue_active: -2,        // -2 per turn of normal activity
    fatigue_heavy: -6,         // -6 per turn of hard labor/combat
    fatigue_combat: -10,       // -10 per combat turn
    // Weather modifiers
    heat_wave_thirst_multiplier: 2.0,
    heat_wave_fatigue_multiplier: 1.5,
    freezing_hunger_multiplier: 1.5  // Cold makes you hungrier
  };

  // ─── WOUND HEALING RATES ─────────────────────────────────────────────────
  const HEALING_RATES = {
    scratch: { base_days: 2, with_medicine: 1 },
    light: { base_days: 7, with_medicine: 5 },
    moderate: { base_days: 21, with_medicine: 14 },
    severe: { base_days: 42, with_medicine: 28 },
    critical: { base_days: 90, with_medicine: 60 }
  };

  // ─── SCAR FORMATION ──────────────────────────────────────────────────────
  const SCAR_PROBABILITY = {
    scratch: 0.1,
    light: 0.25,
    moderate: 0.5,
    severe: 0.85,
    critical: 1.0
  };

  // ─── MAIN HEALTH TICK ─────────────────────────────────────────────────────

  /**
   * Process all health changes for one turn.
   * Called by world-tick every turn.
   * @returns {Array} events - things that happened (for LLM narrative)
   */
  function processTurn(state, turnContext = {}) {
    const h = state.heinrich;
    const events = [];

    // 1. Hunger depletion
    const hungerResult = _processHunger(h, state.weather.current, turnContext);
    events.push(...hungerResult.events);

    // 2. Thirst depletion
    const thirstResult = _processThirst(h, state.weather.current, turnContext);
    events.push(...thirstResult.events);

    // 3. Fatigue management
    const fatigueResult = _processFatigue(h, state.weather.current, turnContext);
    events.push(...fatigueResult.events);

    // 4. Wound healing
    const woundResult = _processWounds(h, state.meta.turn);
    events.push(...woundResult.events);

    // 5. Disease progression
    if (h.health.disease) {
      const diseaseResult = _processDisease(h, state.skills, state.meta.turn);
      events.push(...diseaseResult.events);
    }

    // 6. Mental health processing
    const mentalResult = _processMentalHealth(h, state.meta.turn, turnContext);
    events.push(...mentalResult.events);

    // 7. Aging (once per game year)
    if (_isYearlyAgingTurn(state)) {
      const agingResult = _processAging(h);
      events.push(...agingResult.events);
    }

    // 8. Death check
    const deathCheck = _checkDeath(h);
    if (deathCheck.isDead) {
      events.push({ type: 'death', cause: deathCheck.cause, narrative_key: 'heinrich_death' });
      state.meta.game_over = true;
      state.meta.death_cause = deathCheck.cause;
    }

    return events;
  }

  // ─── HUNGER PROCESSING ───────────────────────────────────────────────────

  function _processHunger(h, weather, context) {
    const events = [];
    if (context.ate_this_turn) {
      // How much does food restore?
      const foodValue = context.food_quality === 'feast' ? 60 :
                        context.food_quality === 'good_meal' ? 40 :
                        context.food_quality === 'adequate' ? 25 :
                        context.food_quality === 'poor' ? 15 : 10;
      const prevHunger = h.health.hunger_value;
      h.health.hunger_value = Math.min(100, h.health.hunger_value + foodValue);
      if (prevHunger < 30 && h.health.hunger_value >= 50) {
        events.push({ type: 'hunger_relieved', narrative_key: 'hunger_relief' });
      }
    } else {
      // Depletion
      let deplete = DEPLETION.hunger_per_turn;
      if (weather.type === 'blizzard' || weather.temperature === 'freezing') {
        deplete *= DEPLETION.freezing_hunger_multiplier;
      }
      if (context.heavy_labor) deplete *= 1.5;
      h.health.hunger_value = Math.max(0, h.health.hunger_value - deplete);
    }

    // Update status label
    const stage = HUNGER_STAGES.find(s => h.health.hunger_value >= s.min && h.health.hunger_value < s.max);
    const prevStatus = h.health.hunger;
    h.health.hunger = stage?.status || 'sated';

    // Alert on stage changes
    if (h.health.hunger !== prevStatus && ['hungry', 'very_hungry', 'starving'].includes(h.health.hunger)) {
      events.push({ type: 'hunger_worsening', stage: h.health.hunger, value: h.health.hunger_value });
    }

    // Starving causes HP loss
    if (h.health.hunger_value < 15) {
      h.health.hp_current = Math.max(1, h.health.hp_current - 2);
      events.push({ type: 'starvation_damage' });
    }

    return { events };
  }

  // ─── THIRST PROCESSING ───────────────────────────────────────────────────

  function _processThirst(h, weather, context) {
    const events = [];
    if (context.drank_this_turn) {
      const drinkValue = context.drink_quality === 'wine_water' ? 40 : 30;
      h.health.thirst_value = Math.min(100, h.health.thirst_value + drinkValue);
    } else {
      let deplete = DEPLETION.thirst_per_turn;
      if (['heat_wave'].includes(weather.type)) deplete *= DEPLETION.heat_wave_thirst_multiplier;
      if (context.heavy_labor || context.combat_turn) deplete *= 1.5;
      h.health.thirst_value = Math.max(0, h.health.thirst_value - deplete);
    }

    const stage = THIRST_STAGES.find(s => h.health.thirst_value >= s.min && h.health.thirst_value < s.max);
    const prevStatus = h.health.thirst;
    h.health.thirst = stage?.status || 'quenched';

    if (h.health.thirst !== prevStatus && ['thirsty', 'very_thirsty', 'dehydrated_severe'].includes(h.health.thirst)) {
      events.push({ type: 'thirst_worsening', stage: h.health.thirst });
    }

    // Severe dehydration causes death risk
    if (h.health.thirst_value < 15 && DiceEngine.chance(0.02)) {
      events.push({ type: 'dehydration_critical', narrative_key: 'thirst_crisis' });
    }

    return { events };
  }

  // ─── FATIGUE PROCESSING ──────────────────────────────────────────────────

  function _processFatigue(h, weather, context) {
    const events = [];

    if (context.sleeping) {
      h.health.fatigue_value = Math.min(100, h.health.fatigue_value + DEPLETION.fatigue_resting);
      h.health.hours_awake = 0;
    } else if (context.resting) {
      h.health.fatigue_value = Math.min(100, h.health.fatigue_value + DEPLETION.fatigue_light_rest);
      h.health.hours_awake += 1;
    } else if (context.combat_turn || context.heavy_labor) {
      const drain = context.combat_turn ? DEPLETION.fatigue_combat : DEPLETION.fatigue_heavy;
      h.health.fatigue_value = Math.max(0, h.health.fatigue_value + drain);
      h.health.hours_awake += 1;
    } else {
      h.health.fatigue_value = Math.max(0, h.health.fatigue_value + DEPLETION.fatigue_active);
      h.health.hours_awake += 1;
    }

    // Heat makes you more tired
    if (weather.type === 'heat_wave') {
      h.health.fatigue_value = Math.max(0, h.health.fatigue_value - 1);
    }

    // Hours awake penalty (after 18+ hours)
    if (h.health.hours_awake > 18) {
      const overHours = h.health.hours_awake - 18;
      h.health.fatigue_value = Math.max(0, h.health.fatigue_value - overHours);
    }

    const stage = FATIGUE_STAGES.find(s => h.health.fatigue_value >= s.min && h.health.fatigue_value < s.max);
    const prevFatigue = h.health.fatigue;
    h.health.fatigue = stage?.status || 'fresh';

    if (h.health.fatigue !== prevFatigue) {
      if (h.health.fatigue === 'collapsed') {
        events.push({ type: 'collapsed_from_exhaustion', narrative_key: 'exhaustion_collapse' });
      } else if (['exhausted', 'worn_out'].includes(h.health.fatigue) && !['exhausted', 'worn_out', 'collapsed'].includes(prevFatigue)) {
        events.push({ type: 'fatigue_warning', stage: h.health.fatigue });
      }
    }

    return { events };
  }

  // ─── WOUND HEALING ───────────────────────────────────────────────────────

  function _processWounds(h, currentTurn) {
    const events = [];
    const woundLocations = ['head', 'torso', 'left_arm', 'right_arm', 'left_leg', 'right_leg'];

    for (const location of woundLocations) {
      const wounds = h.wounds[location];
      const toRemove = [];

      for (let i = 0; i < wounds.length; i++) {
        const wound = wounds[i];

        // Skip already healed wounds
        if (wound.healed) { toRemove.push(i); continue; }

        // Infection check (first 3 turns after wound)
        if (!wound.infection_checked && currentTurn - wound.turn_received <= 3) {
          const infectionRisk = CombatEngine.WOUND_SEVERITY[wound.severity]?.infection_risk || 0.1;
          if (DiceEngine.chance(infectionRisk) && !wound.treated) {
            wound.infected = true;
            wound.infection_checked = true;
            events.push({ type: 'wound_infected', location, severity: wound.severity });
          } else {
            wound.infection_checked = true;
          }
        }

        // Healing progress
        const healingRate = wound.treated ? HEALING_RATES[wound.severity]?.with_medicine : HEALING_RATES[wound.severity]?.base_days;
        const totalHealingTurns = (healingRate || 7) * 4; // 4 turns per day
        wound.healing_progress += 1 / totalHealingTurns;

        // Infection slows healing dramatically
        if (wound.infected) wound.healing_progress -= 0.5 / totalHealingTurns;

        // Wound healed
        if (wound.healing_progress >= 1.0) {
          wound.healed = true;
          toRemove.push(i);

          // Scar formation
          const scarChance = SCAR_PROBABILITY[wound.severity] || 0.1;
          if (DiceEngine.chance(scarChance)) {
            const scar = {
              id: `scar_${Date.now()}`,
              location,
              severity: wound.severity,
              description: _generateScarDescription(location, wound.severity),
              turn_formed: currentTurn,
              npc_reaction: wound.severity === 'severe' || wound.severity === 'critical'
            };
            h.scars.push(scar);
            events.push({ type: 'scar_formed', scar, narrative_key: 'scar_forms' });
          }

          events.push({ type: 'wound_healed', location, severity: wound.severity });
          // Restore HP
          h.health.hp_current = Math.min(h.health.hp_max, h.health.hp_current + Math.round(CombatEngine.WOUND_SEVERITY[wound.severity].hp_cost * 0.5));
        }
      }

      // Remove healed wounds in reverse order
      toRemove.reverse().forEach(i => wounds.splice(i, 1));
    }

    return { events };
  }

  // ─── DISEASE PROCESSING ──────────────────────────────────────────────────

  function _processDisease(h, skills, currentTurn) {
    const events = [];
    const disease = h.health.disease;
    if (!disease) return { events };

    disease.turns_active = (disease.turns_active || 0) + 1;

    // Advance disease stage
    const stagesInDays = disease.stages || [];
    const daysActive = Math.floor(disease.turns_active / 4);

    // Apply disease penalties
    const penalties = disease.mechanical_effects || {};
    if (penalties.fatigue_penalty) {
      h.health.fatigue_value = Math.max(0, h.health.fatigue_value - (penalties.fatigue_penalty / 20));
    }
    if (penalties.strength_penalty) {
      // Temporary skill debuff tracked separately
      disease.strength_debuff = penalties.strength_penalty;
    }

    // Mortality check (per day)
    if (disease.turns_active % 4 === 0) {
      const mortalityRate = disease.mortality_rate?.healthy_adult || disease.mortality_rate || 0.05;
      const medicineMitigates = (skills.medicine?.level || 0) >= 3 ? 0.5 : 1.0;
      const effectiveMortality = mortalityRate * medicineMitigates;

      if (DiceEngine.chance(effectiveMortality / (disease.duration_days || 14))) {
        events.push({ type: 'disease_critical', disease: disease.id, narrative_key: 'disease_worsens' });
        h.health.hp_current = Math.max(1, h.health.hp_current - 10);
      }

      // Recovery check
      const recoveryChance = disease.treatment_received ? 0.1 : 0.03;
      if (disease.turns_active > (disease.duration_days || 14) * 4 || DiceEngine.chance(recoveryChance)) {
        events.push({ type: 'disease_recovering', disease: disease.id, narrative_key: 'disease_recovery' });
        disease.recovering = true;
        if (disease.turns_active > (disease.duration_days || 14) * 4 * 1.5) {
          h.health.disease = null;
          events.push({ type: 'disease_cured', narrative_key: 'disease_cured' });
        }
      }
    }

    return { events };
  }

  // ─── MENTAL HEALTH ───────────────────────────────────────────────────────

  function _processMentalHealth(h, currentTurn, context) {
    const events = [];

    // Natural recovery when healthy and safe
    if (!context.in_danger && !context.trauma_event && h.health.fatigue_value > 60) {
      if (h.health.mental_value < 100) {
        h.health.mental_value = Math.min(100, h.health.mental_value + 0.5);
      }
    }

    // Process mental conditions
    for (const condition of h.health.mental_conditions) {
      if (condition.type === 'ptsd') {
        // PTSD: certain triggers cause mental value drop
        if (context.ptsd_trigger) {
          h.health.mental_value = Math.max(0, h.health.mental_value - 15);
          events.push({ type: 'ptsd_triggered', trigger: context.ptsd_trigger });
        }
      } else if (condition.type === 'grief') {
        // Grief fades slowly
        condition.intensity = Math.max(0, (condition.intensity || 10) - 0.1);
        if (condition.intensity <= 0) {
          events.push({ type: 'grief_resolved', narrative_key: 'grief_passes' });
          // Will be removed on next cleanup pass
        }
      } else if (condition.type === 'addiction_withdrawal') {
        // Withdrawal causes mental penalty
        h.health.mental_value = Math.max(0, h.health.mental_value - 5);
        events.push({ type: 'withdrawal', vice: condition.vice });
      }
    }

    // Remove resolved conditions
    h.health.mental_conditions = h.health.mental_conditions.filter(c => {
      if (c.type === 'grief' && (c.intensity || 0) <= 0) return false;
      return true;
    });

    // Update mental status label
    const stage = MENTAL_STAGES.find(s => h.health.mental_value >= s.min && h.health.mental_value < s.max);
    const prevMental = h.health.mental_state;
    h.health.mental_state = stage?.status || 'steady';

    if (h.health.mental_state !== prevMental) {
      if (h.health.mental_state === 'breakdown') {
        events.push({ type: 'mental_breakdown', narrative_key: 'mental_breakdown' });
        // Add permanent trauma condition
        h.health.mental_conditions.push({ type: 'ptsd', started: currentTurn, intensity: 20 });
      }
    }

    return { events };
  }

  // ─── TRAUMA EVENTS (called from consequence engine etc.) ─────────────────

  /**
   * Apply a traumatic event to mental health.
   * @param {number} severity - 1 (minor) to 10 (devastating)
   * @param {string} type - 'violence_witnessed' | 'loved_one_died' | 'torture' | 'near_death'
   */
  function applyTrauma(h, severity, type, currentTurn) {
    const mentalDamage = severity * 8;
    h.health.mental_value = Math.max(0, h.health.mental_value - mentalDamage);

    // Serious trauma creates conditions
    if (severity >= 6) {
      h.health.mental_conditions.push({
        type: 'ptsd',
        trauma_type: type,
        started: currentTurn,
        intensity: severity,
        triggers: _getTraumaTriggers(type)
      });
    } else if (severity >= 3) {
      h.health.mental_conditions.push({
        type: 'grief',
        trauma_type: type,
        started: currentTurn,
        intensity: severity * 3
      });
    }
  }

  function _getTraumaTriggers(traumaType) {
    const triggers = {
      violence_witnessed: ['combat', 'blood', 'screaming'],
      loved_one_died: ['reminder_of_person', 'anniversary'],
      torture: ['captivity', 'helplessness', 'pain'],
      near_death: ['combat', 'falling', 'choking']
    };
    return triggers[traumaType] || [];
  }

  // ─── AGING SYSTEM ────────────────────────────────────────────────────────

  function _processAging(h) {
    const events = [];
    h.age++;

    // Effects by age bracket
    if (h.age >= 40 && h.age < 50) {
      // Middle age: slight physical decline, wisdom increase
      events.push({
        type: 'aging',
        age: h.age,
        effects: {
          description: 'Grey hairs appear. The body is less forgiving. But the mind knows more.',
          attribute_changes: { endurance_cap: -0.5, strength_cap: -0.5 }
        }
      });
    } else if (h.age >= 50 && h.age < 60) {
      events.push({
        type: 'aging',
        age: h.age,
        effects: {
          description: 'The years show in your face. Joints remember every old wound.',
          attribute_changes: { endurance_cap: -1, strength_cap: -1, agility_cap: -1 }
        }
      });
    } else if (h.age >= 60) {
      events.push({
        type: 'aging',
        age: h.age,
        effects: {
          description: 'Old age is not gentle. But the name you\'ve built endures.',
          attribute_changes: { endurance_cap: -2, strength_cap: -2, agility_cap: -2 },
          health_complications_possible: true
        }
      });
    }

    // Chronic conditions develop with age
    if (h.age >= 45 && DiceEngine.chance(0.1)) {
      const areaConditions = ['joint_pain', 'failing_eyesight', 'old_wound_aches'];
      const condition = areaConditions[DiceEngine.randInt(0, areaConditions.length - 1)];
      h.health.chronic_conditions.push({
        type: condition,
        started_age: h.age,
        severity: 'mild'
      });
      events.push({ type: 'chronic_condition_onset', condition });
    }

    return { events };
  }

  function _isYearlyAgingTurn(state) {
    // Has a year elapsed? Check if birthday has passed this calendar year
    const cal = state.calendar;
    const birth = state.heinrich.birth_date;
    return cal.date.month === birth.month && cal.date.day === birth.day;
  }

  // ─── DEATH DETECTION ─────────────────────────────────────────────────────

  function _checkDeath(h) {
    if (h.health.hp_current <= 0) return { isDead: true, cause: 'wounds' };
    if (h.health.hunger_value <= 0) return { isDead: true, cause: 'starvation' };
    if (h.health.thirst_value <= 0) return { isDead: true, cause: 'dehydration' };

    // Disease death check
    if (h.health.disease) {
      const mortality = h.health.disease.mortality_rate?.healthy_adult || 0;
      if (mortality > 0.8 && h.health.hp_current < 15 && DiceEngine.chance(0.05)) {
        return { isDead: true, cause: `disease_${h.health.disease.id}` };
      }
    }

    // Mental breakdown death (very rare — more like breakdown leading to bad decisions)
    // Not directly killing Heinrich here but flagging it

    return { isDead: false };
  }

  // ─── FOOD AND DRINK APPLICATION ──────────────────────────────────────────

  /**
   * Apply eating a food item.
   */
  function eat(h, foodItem) {
    const nutritionValue = foodItem.nutrition_value || 25;
    const quality = foodItem.quality || 'adequate';
    const qualityBonus = quality === 'feast' ? 20 : quality === 'good' ? 10 : quality === 'poor' ? -5 : 0;
    h.health.hunger_value = Math.min(100, h.health.hunger_value + nutritionValue + qualityBonus);
    h.health.hours_since_meal = 0;

    return {
      hunger_restored: nutritionValue + qualityBonus,
      new_hunger_value: h.health.hunger_value
    };
  }

  /**
   * Apply drinking water/ale/wine.
   */
  function drink(h, drinkItem = { type: 'water', quality: 'clean' }) {
    const thirstValue = drinkItem.type === 'wine' ? 20 : drinkItem.type === 'ale' ? 25 : 35;
    h.health.thirst_value = Math.min(100, h.health.thirst_value + thirstValue);

    // Contaminated water risk
    if (drinkItem.quality === 'contaminated') {
      const diseaseRisk = 0.25;
      return { thirst_restored: thirstValue, disease_risk: diseaseRisk };
    }

    return { thirst_restored: thirstValue };
  }

  // ─── DISEASE APPLICATION ─────────────────────────────────────────────────

  /**
   * Infect Heinrich with a disease.
   */
  function infectWith(h, diseaseData) {
    if (h.health.disease) return false; // Already diseased (most diseases can't stack)

    h.health.disease = {
      id: diseaseData.id,
      name: diseaseData.name,
      started_turn: null, // Set by caller passing current turn
      turns_active: 0,
      incubating: true,
      incubation_days: DiceEngine.randInt(diseaseData.incubation_days[0], diseaseData.incubation_days[1]),
      duration_days: diseaseData.duration_days ? DiceEngine.randInt(diseaseData.duration_days[0], diseaseData.duration_days[1]) : null,
      mortality_rate: diseaseData.mortality_rate,
      mechanical_effects: diseaseData.mechanical_effects,
      treatment_received: false,
      recovery_started: false,
      stages: diseaseData.stages || []
    };

    return true;
  }

  // ─── TREATMENT ───────────────────────────────────────────────────────────

  /**
   * Apply medical treatment to wounds or disease.
   */
  function applyTreatment(h, targetType, targetId, skillLevel) {
    if (targetType === 'wound') {
      // Find wound by id or location
      for (const loc of ['head', 'torso', 'left_arm', 'right_arm', 'left_leg', 'right_leg']) {
        const wound = h.wounds[loc].find(w => w.id === targetId);
        if (wound) {
          wound.treated = true;
          if (wound.infected && skillLevel >= 3) wound.infected = false; // Medicine can clear infection
          return { success: true, location: loc };
        }
      }
    } else if (targetType === 'disease') {
      if (h.health.disease) {
        h.health.disease.treatment_received = true;
        return { success: true };
      }
    }
    return { success: false };
  }

  // ─── STATUS GETTERS ──────────────────────────────────────────────────────

  function getHungerStage(h) {
    return HUNGER_STAGES.find(s => h.health.hunger_value >= s.min && h.health.hunger_value < s.max) || HUNGER_STAGES[4];
  }

  function getFatigueStage(h) {
    return FATIGUE_STAGES.find(s => h.health.fatigue_value >= s.min && h.health.fatigue_value < s.max) || FATIGUE_STAGES[5];
  }

  function getThirstStage(h) {
    return THIRST_STAGES.find(s => h.health.thirst_value >= s.min && h.health.thirst_value < s.max) || THIRST_STAGES[3];
  }

  function getMentalStage(h) {
    return MENTAL_STAGES.find(s => h.health.mental_value >= s.min && h.health.mental_value < s.max) || MENTAL_STAGES[4];
  }

  /**
   * Get comprehensive health summary for UI and LLM.
   */
  function getHealthSummary(h) {
    const activeWounds = [];
    for (const loc of ['head', 'torso', 'left_arm', 'right_arm', 'left_leg', 'right_leg']) {
      h.wounds[loc].filter(w => !w.healed).forEach(w => activeWounds.push({ ...w, location: loc }));
    }

    return {
      hp: { current: h.health.hp_current, max: h.health.hp_max },
      hunger: getHungerStage(h).label,
      fatigue: getFatigueStage(h).label,
      thirst: getThirstStage(h).label,
      mental: getMentalStage(h).label,
      disease: h.health.disease?.name || null,
      active_wounds: activeWounds,
      scars: h.scars.length,
      chronic_conditions: h.health.chronic_conditions.map(c => c.type),
      overall_status: _getOverallStatus(h)
    };
  }

  function _getOverallStatus(h) {
    if (h.health.hp_current < h.health.hp_max * 0.2) return 'critically_wounded';
    if (h.health.disease?.mortality_rate?.healthy_adult > 0.3) return 'gravely_ill';
    if (h.health.hunger_value < 20) return 'starving';
    if (h.health.fatigue_value < 15) return 'collapsed';
    if (h.health.mental_value < 25) return 'mentally_unwell';
    if (h.health.hp_current < h.health.hp_max * 0.5) return 'wounded';
    return 'functional';
  }

  function _generateScarDescription(location, severity) {
    const descriptions = {
      head: {
        scratch: 'A faint line across the brow',
        light: 'A shallow cut that missed the eye',
        moderate: 'A scar that parts the eyebrow',
        severe: 'A livid scar running from temple to jaw',
        critical: 'A disfiguring mark that tells its story at a glance'
      },
      torso: {
        scratch: 'A thin white line on the ribs',
        light: 'An old blade wound, well healed',
        moderate: 'A curved scar across the flank',
        severe: 'A broad scar that tightens in cold weather',
        critical: 'A wound that should have been fatal — and everyone can see it'
      },
      right_arm: { light: 'A blade scar on the forearm', moderate: 'A deep scar on the sword arm', severe: 'Muscle damage visible in the arm\'s lean' },
      left_arm: { light: 'An old burn scar', moderate: 'A defensive wound scar', severe: 'A scar from a wound that cost the use of the arm for months' },
      left_leg: { light: 'A blade mark on the calf', moderate: 'A scar that made him limp for months', severe: 'A wound that still aches in rain' },
      right_leg: { light: 'A small scar on the shin', moderate: 'An arrow scar on the thigh', severe: 'A scar the length of a hand on the upper leg' }
    };
    return descriptions[location]?.[severity] || `A scar on the ${location}`;
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    HUNGER_STAGES,
    FATIGUE_STAGES,
    THIRST_STAGES,
    MENTAL_STAGES,
    HEALING_RATES,
    SCAR_PROBABILITY,
    processTurn,
    applyTrauma,
    eat,
    drink,
    infectWith,
    applyTreatment,
    getHungerStage,
    getFatigueStage,
    getThirstStage,
    getMentalStage,
    getHealthSummary
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { HealthEngine };
}

// END FILE: client/js/engine/health-engine.js
