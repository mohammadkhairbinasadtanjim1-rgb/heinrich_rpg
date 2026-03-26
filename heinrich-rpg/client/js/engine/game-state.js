// FILE: client/js/engine/game-state.js — PART 4

'use strict';

/**
 * GAME STATE — Master state object initialization and management.
 * This is the single source of truth. All engines read/write to this.
 * The LLM never modifies it directly.
 */

const GameState = (() => {

  // ─── DEFAULT STATE FACTORY ────────────────────────────────────────────────
  function createDefaultState() {
    return {
      meta: {
        version: "1.0.0",
        session_key: "",
        created: null,
        last_saved: null,
        turn: 0,
        total_turns_played: 0,
        llm_provider: "",
        llm_model: "",
        game_started: false
      },

      calendar: {
        date: { day: 1, month: 3, year: 1403 },
        time_of_day: "dawn",
        season: "spring",
        day_of_week: "monday",
        moon_phase: "waxing_crescent",
        hours_awake: 0,
        hours_since_meal: 0,
        hours_since_drink: 0,
        days_elapsed_total: 0
      },

      weather: {
        current: {
          type: "overcast",
          temperature: "cool",
          temperature_celsius: 8,
          wind: "light",
          precipitation: "none",
          visibility: "good",
          special: null
        },
        forecast_next: null,
        active_effects: [],
        consecutive_days_same_type: 1
      },

      heinrich: {
        given_name: "Heinrich",
        family_name: "Renard",
        deepest_want: "",
        deepest_fear: "",
        age: 18,
        birth_date: { day: 15, month: 9, year: 1384 },
        class: "serf",
        class_tier: 1,
        class_privileges: [],
        class_obligations: ["corvee_labor", "grain_rent", "cannot_leave_without_permission"],

        health: {
          status: "healthy",
          hp_current: 100,
          hp_max: 100,
          hunger: "sated",
          hunger_value: 100, // 0=starving, 100=fully sated
          fatigue: "fresh",
          fatigue_value: 100, // 0=collapsed, 100=fully rested
          mental_state: "steady",
          mental_value: 100, // 0=breakdown, 100=perfectly stable
          mental_conditions: [],
          chronic_conditions: [],
          disease: null,
          body_temperature: "normal",
          thirst: "quenched",
          thirst_value: 100
        },

        wounds: {
          head: [],
          torso: [],
          left_arm: [],
          right_arm: [],
          left_leg: [],
          right_leg: []
        },

        scars: [],

        appearance: {
          base: "Tall, broad-shouldered, extremely attractive face and physique. Dark hair. Strong jaw. Hands that have known hard labor since childhood.",
          current_modifications: [],
          language_stage: "peasant_norman_french",
          notable_features: []
        },

        reputation: {
          // Each key is a faction/region, value is object
          // { honor: 0-100, ferocity: 0-100, cunning: 0-100, piety: 0-100, generosity: 0-100, overall: 0-100 }
          normandy_peasants: { honor: 40, ferocity: 35, cunning: 20, piety: 35, generosity: 30, overall: 32 },
          local_lord: { honor: 30, ferocity: 20, cunning: 10, piety: 25, generosity: 15, overall: 20 },
          church_normandy: { honor: 35, ferocity: 15, cunning: 10, piety: 40, generosity: 20, overall: 24 }
        },

        moral_compass: {
          mercy: 50,      // high = merciful, low = merciless
          honesty: 50,    // high = honest, low = deceptive
          ambition: 50,   // high = driven, low = content
          violence: 50,   // high = prone to violence, low = peaceful
          loyalty: 50,    // high = loyal, low = treacherous
          compassion: 50  // high = caring, low = callous
        },

        corruption: 0,        // 0-100
        superstition: 7,      // 0-10
        heat: 0,              // Criminal exposure 0-100
        heat_regions: {},     // Per-region heat values

        combat: {
          momentum: 0,       // -10 to +10
          stance: "balanced",
          confidence: 0,     // -5 to +5
          in_combat: false,
          current_opponent: null
        },

        vices: {
          // Each vice: { level: 0-10, active_urge: false, last_indulged: null, abstaining_days: 0 }
          alcohol: { level: 0, active_urge: false, last_indulged: null, abstaining_days: 0 },
          gambling: { level: 0, active_urge: false, last_indulged: null, abstaining_days: 0 },
          lust: { level: 0, active_urge: false, last_indulged: null, abstaining_days: 0 },
          wrath: { level: 0, active_urge: false, last_indulged: null, abstaining_days: 0 },
          pride: { level: 0, active_urge: false, last_indulged: null, abstaining_days: 0 }
        },

        laborers_instinct: true,     // +10% XP on physical/craft/survival skills
        attractiveness_bonus: true,  // Social modifier active

        memory_palace: {
          facts: [],       // { id, content, source, date_learned, connections: [] }
          secrets: [],     // { id, content, about_whom, known_by: [], danger_level: 0-10 }
          clues: [],       // { id, content, related_to, status: "unsolved|solved|irrelevant" }
          lies_detected: [] // { id, who, what_lie, when }
        },

        inventions: {
          conceived: [],   // Ideas suggested by player
          researching: [], // { id, name, phase_current, turns_invested, phase_progress }
          prototyped: [],  // Built crude version
          perfected: [],   // Working reliably
          introduced: []   // Released to world — with consequences documented
        }
      },

      // ─── SKILLS ─────────────────────────────────────────────────────────────
      skills: {
        // Combat Skills
        brawling: { level: 4, xp: 0, passives_unlocked: [], branches: { grappling: { unlocked: false, level: 0, xp: 0 }, dirty_fighting: { unlocked: false, level: 0, xp: 0 }, pit_fighting: { unlocked: false, level: 0, xp: 0 } } },
        sword: { level: 0, xp: 0, passives_unlocked: [], branches: { longsword: { unlocked: false, level: 0, xp: 0 }, dual_wield: { unlocked: false, level: 0, xp: 0 }, mounted_swordplay: { unlocked: false, level: 0, xp: 0 } } },
        dagger: { level: 0, xp: 0, passives_unlocked: [], branches: { assassination: { unlocked: false, level: 0, xp: 0 }, dagger_parry: { unlocked: false, level: 0, xp: 0 } } },
        axe: { level: 2, xp: 0, passives_unlocked: [], branches: { shield_breaker: { unlocked: false, level: 0, xp: 0 }, throwing_axe: { unlocked: false, level: 0, xp: 0 } } },
        archery: { level: 2, xp: 0, passives_unlocked: [], branches: { shortbow: { unlocked: false, level: 0, xp: 0 }, longbow: { unlocked: false, level: 0, xp: 0 }, crossbow: { unlocked: false, level: 0, xp: 0 }, sling: { unlocked: false, level: 0, xp: 0 } } },
        polearms: { level: 1, xp: 0, passives_unlocked: [], branches: { spear: { unlocked: false, level: 0, xp: 0 }, halberd: { unlocked: false, level: 0, xp: 0 }, staff: { unlocked: false, level: 0, xp: 0 } } },
        shield: { level: 0, xp: 0, passives_unlocked: [], branches: { shield_wall: { unlocked: false, level: 0, xp: 0 }, shield_bash: { unlocked: false, level: 0, xp: 0 } } },
        unarmed: { level: 3, xp: 0, passives_unlocked: [], branches: { wrestling: { unlocked: false, level: 0, xp: 0 }, disarm: { unlocked: false, level: 0, xp: 0 } } },
        // Physical
        strength: { level: 5, xp: 0, passives_unlocked: [], branches: { mighty_blow: { unlocked: false, level: 0, xp: 0 }, beast_of_burden: { unlocked: false, level: 0, xp: 0 } } },
        agility: { level: 3, xp: 0, passives_unlocked: [], branches: { acrobatics: { unlocked: false, level: 0, xp: 0 }, dodge_mastery: { unlocked: false, level: 0, xp: 0 }, quick_draw: { unlocked: false, level: 0, xp: 0 } } },
        endurance: { level: 5, xp: 0, passives_unlocked: [], branches: { iron_constitution: { unlocked: false, level: 0, xp: 0 }, pain_tolerance: { unlocked: false, level: 0, xp: 0 }, marathon: { unlocked: false, level: 0, xp: 0 } } },
        swimming: { level: 1, xp: 0, passives_unlocked: [], branches: { underwater_combat: { unlocked: false, level: 0, xp: 0 } } },
        climbing: { level: 1, xp: 0, passives_unlocked: [], branches: { urban_scaling: { unlocked: false, level: 0, xp: 0 } } },
        // Social
        speech: { level: 3, xp: 0, passives_unlocked: [], branches: { oratory: { unlocked: false, level: 0, xp: 0 }, negotiation: { unlocked: false, level: 0, xp: 0 }, inspire: { unlocked: false, level: 0, xp: 0 } } },
        deception: { level: 2, xp: 0, passives_unlocked: [], branches: { disguise: { unlocked: false, level: 0, xp: 0 }, forgery: { unlocked: false, level: 0, xp: 0 }, double_life: { unlocked: false, level: 0, xp: 0 } } },
        intimidation: { level: 3, xp: 0, passives_unlocked: [], branches: { interrogation: { unlocked: false, level: 0, xp: 0 }, warlord_presence: { unlocked: false, level: 0, xp: 0 }, silent_threat: { unlocked: false, level: 0, xp: 0 } } },
        haggle: { level: 2, xp: 0, passives_unlocked: [], branches: { black_market: { unlocked: false, level: 0, xp: 0 }, monopoly: { unlocked: false, level: 0, xp: 0 }, price_manipulation: { unlocked: false, level: 0, xp: 0 } } },
        etiquette: { level: 0, xp: 0, passives_unlocked: [], branches: { court_manners: { unlocked: false, level: 0, xp: 0 }, royal_protocol: { unlocked: false, level: 0, xp: 0 }, cultural_fluency: { unlocked: false, level: 0, xp: 0 } } },
        command: { level: 1, xp: 0, passives_unlocked: [], branches: { squad_leader: { unlocked: false, level: 0, xp: 0 }, captain: { unlocked: false, level: 0, xp: 0 }, war_commander: { unlocked: false, level: 0, xp: 0 }, siege_craft: { unlocked: false, level: 0, xp: 0 } } },
        seduction: { level: 1, xp: 0, passives_unlocked: [], branches: { courtly_love: { unlocked: false, level: 0, xp: 0 }, temptation: { unlocked: false, level: 0, xp: 0 }, political_marriage: { unlocked: false, level: 0, xp: 0 } } },
        read_people: { level: 3, xp: 0, passives_unlocked: [], branches: { detect_lies: { unlocked: false, level: 0, xp: 0 }, predict_behavior: { unlocked: false, level: 0, xp: 0 }, puppet_master: { unlocked: false, level: 0, xp: 0 } } },
        performance: { level: 0, xp: 0, passives_unlocked: [], branches: { tavern_singer: { unlocked: false, level: 0, xp: 0 }, troubadour: { unlocked: false, level: 0, xp: 0 }, court_musician: { unlocked: false, level: 0, xp: 0 }, legendary_performer: { unlocked: false, level: 0, xp: 0 }, composer: { unlocked: false, level: 0, xp: 0 } } },
        // Management
        stewardship: { level: 1, xp: 0, passives_unlocked: [], branches: { estate_management: { unlocked: false, level: 0, xp: 0 }, tax_collection: { unlocked: false, level: 0, xp: 0 }, city_administration: { unlocked: false, level: 0, xp: 0 }, kingdom_finance: { unlocked: false, level: 0, xp: 0 } } },
        // Crafts
        smithing: { level: 2, xp: 0, passives_unlocked: [], branches: { weaponsmith: { unlocked: false, level: 0, xp: 0 }, armorsmith: { unlocked: false, level: 0, xp: 0 }, masterwork_crafting: { unlocked: false, level: 0, xp: 0 }, siege_engineering: { unlocked: false, level: 0, xp: 0 } } },
        carpentry: { level: 3, xp: 0, passives_unlocked: [], branches: { shipbuilding: { unlocked: false, level: 0, xp: 0 }, fortification: { unlocked: false, level: 0, xp: 0 }, architecture: { unlocked: false, level: 0, xp: 0 } } },
        agriculture: { level: 4, xp: 0, passives_unlocked: [], branches: { animal_husbandry: { unlocked: false, level: 0, xp: 0 }, viticulture: { unlocked: false, level: 0, xp: 0 }, estate_farming: { unlocked: false, level: 0, xp: 0 }, famine_preparation: { unlocked: false, level: 0, xp: 0 } } },
        hunting: { level: 3, xp: 0, passives_unlocked: [], branches: { tracking: { unlocked: false, level: 0, xp: 0 }, trapping: { unlocked: false, level: 0, xp: 0 }, falconry: { unlocked: false, level: 0, xp: 0 }, big_game: { unlocked: false, level: 0, xp: 0 } } },
        medicine: { level: 0, xp: 0, passives_unlocked: [], branches: { herbalism: { unlocked: false, level: 0, xp: 0 }, surgery: { unlocked: false, level: 0, xp: 0 }, plague_doctor: { unlocked: false, level: 0, xp: 0 }, poison_craft: { unlocked: false, level: 0, xp: 0 } } },
        cooking: { level: 1, xp: 0, passives_unlocked: [], branches: { field_cooking: { unlocked: false, level: 0, xp: 0 }, feast_preparation: { unlocked: false, level: 0, xp: 0 }, poison_detection: { unlocked: false, level: 0, xp: 0 } } },
        engineering: { level: 0, xp: 0, passives_unlocked: [], branches: { siege_weapons: { unlocked: false, level: 0, xp: 0 }, fortification_design: { unlocked: false, level: 0, xp: 0 }, infrastructure: { unlocked: false, level: 0, xp: 0 } } },
        // Knowledge
        reading: { level: 0, xp: 0, passives_unlocked: [], branches: { latin: { unlocked: false, level: 0, xp: 0 }, classical_education: { unlocked: false, level: 0, xp: 0 }, cartography: { unlocked: false, level: 0, xp: 0 }, codebreaking: { unlocked: false, level: 0, xp: 0 } } },
        law: { level: 0, xp: 0, passives_unlocked: [], branches: { local_custom: { unlocked: false, level: 0, xp: 0 }, canon_law: { unlocked: false, level: 0, xp: 0 }, royal_law: { unlocked: false, level: 0, xp: 0 }, trial_advocacy: { unlocked: false, level: 0, xp: 0 }, legislative_power: { unlocked: false, level: 0, xp: 0 } } },
        heraldry: { level: 0, xp: 0, passives_unlocked: [], branches: { noble_identification: { unlocked: false, level: 0, xp: 0 }, lineage_tracking: { unlocked: false, level: 0, xp: 0 }, fabricate_claims: { unlocked: false, level: 0, xp: 0 } } },
        theology: { level: 1, xp: 0, passives_unlocked: [], branches: { preaching: { unlocked: false, level: 0, xp: 0 }, inquisition_knowledge: { unlocked: false, level: 0, xp: 0 }, papal_politics: { unlocked: false, level: 0, xp: 0 }, excommunication_defense: { unlocked: false, level: 0, xp: 0 } } },
        history: { level: 0, xp: 0, passives_unlocked: [], branches: { military_history: { unlocked: false, level: 0, xp: 0 }, dynastic_knowledge: { unlocked: false, level: 0, xp: 0 }, legendary_precedent: { unlocked: false, level: 0, xp: 0 } } },
        tactics: { level: 0, xp: 0, passives_unlocked: [], branches: { ambush_planning: { unlocked: false, level: 0, xp: 0 }, formation_command: { unlocked: false, level: 0, xp: 0 }, siege_strategy: { unlocked: false, level: 0, xp: 0 }, grand_strategy: { unlocked: false, level: 0, xp: 0 } } },
        // Languages
        languages: {
          norman_french: { level: 10, xp: 0 },
          parisian_french: { level: 0, xp: 0, unlocked: false },
          latin: { level: 0, xp: 0, unlocked: false },
          english: { level: 0, xp: 0, unlocked: false },
          italian: { level: 0, xp: 0, unlocked: false },
          german: { level: 0, xp: 0, unlocked: false },
          occitan: { level: 0, xp: 0, unlocked: false },
          flemish: { level: 0, xp: 0, unlocked: false },
          arabic: { level: 0, xp: 0, unlocked: false }
        },
        // Stealth and Criminal
        stealth: { level: 2, xp: 0, passives_unlocked: [], branches: { urban_stealth: { unlocked: false, level: 0, xp: 0 }, wilderness_camouflage: { unlocked: false, level: 0, xp: 0 }, infiltration: { unlocked: false, level: 0, xp: 0 }, ghost: { unlocked: false, level: 0, xp: 0 } } },
        lockpicking: { level: 0, xp: 0, passives_unlocked: [], branches: { safe_cracking: { unlocked: false, level: 0, xp: 0 }, trap_disarm: { unlocked: false, level: 0, xp: 0 } } },
        pickpocket: { level: 0, xp: 0, passives_unlocked: [], branches: { plant_evidence: { unlocked: false, level: 0, xp: 0 }, cutpurse_master: { unlocked: false, level: 0, xp: 0 } } },
        forgery_skill: { level: 0, xp: 0, unlocked: false, passives_unlocked: [], branches: { document_forgery: { unlocked: false, level: 0, xp: 0 }, seal_forgery: { unlocked: false, level: 0, xp: 0 }, identity_fabrication: { unlocked: false, level: 0, xp: 0 } } },
        espionage: { level: 0, xp: 0, unlocked: false, passives_unlocked: [], branches: { intelligence_network: { unlocked: false, level: 0, xp: 0 }, counter_intelligence: { unlocked: false, level: 0, xp: 0 }, shadow_war: { unlocked: false, level: 0, xp: 0 } } },
        // Travel and Outdoors
        horsemanship: { level: 1, xp: 0, passives_unlocked: [], branches: { mounted_combat: { unlocked: false, level: 0, xp: 0 }, horse_archery: { unlocked: false, level: 0, xp: 0 }, cavalry_charge: { unlocked: false, level: 0, xp: 0 }, horse_breeding: { unlocked: false, level: 0, xp: 0 } } },
        navigation: { level: 1, xp: 0, passives_unlocked: [], branches: { sea_navigation: { unlocked: false, level: 0, xp: 0 }, star_reading: { unlocked: false, level: 0, xp: 0 }, pathfinding: { unlocked: false, level: 0, xp: 0 } } },
        seamanship: { level: 0, xp: 0, passives_unlocked: [], branches: { ship_combat: { unlocked: false, level: 0, xp: 0 }, fleet_command: { unlocked: false, level: 0, xp: 0 }, piracy: { unlocked: false, level: 0, xp: 0 } } },
        survival: { level: 2, xp: 0, passives_unlocked: [], branches: { desert_survival: { unlocked: false, level: 0, xp: 0 }, mountain_survival: { unlocked: false, level: 0, xp: 0 }, urban_survival: { unlocked: false, level: 0, xp: 0 }, war_zone_survival: { unlocked: false, level: 0, xp: 0 } } }
      },

      // ─── INVENTORY ──────────────────────────────────────────────────────────
      inventory: {
        equipped: {
          head: null,
          torso: "worn_linen_tunic",
          legs: null,
          feet: "worn_work_boots",
          hands: null,
          belt: "leather_belt",
          weapon_primary: null,
          weapon_secondary: null,
          shield: null
        },
        carried: [
          { id: "item_001", name: "Hunting Knife", type: "weapon_dagger", quality: "good", condition: "good", weight: 0.5, value_sous: 3 },
          { id: "item_002", name: "Woodcutter's Axe", type: "tool_axe", quality: "sturdy", condition: "worn", weight: 2.0, value_sous: 5 }
        ],
        stored: {}, // location_key: [items]
        named_items: [], // Masterwork+ items with histories
        coin: { sous: 3, livres: 0, deniers: 8 },
        wealth_tier: "destitute",
        encumbrance: {
          current: 3.5,
          max: 50, // Based on strength
          penalty_threshold: 35
        }
      },

      // ─── NPCs ────────────────────────────────────────────────────────────────
      npcs: {
        active: {},   // npcs in play { npc_id: npc_object }
        dormant: {},  // npcs not currently active but remembered
        dead: {}      // deceased npcs with death circumstances
      },
      npc_relationships: {}, // npc_id: { favorability: -100 to 100, relationship_type, emotional_memory: [], grudges: [] }

      // ─── ANIMALS ────────────────────────────────────────────────────────────
      animals: { companions: [], horse: null, past_companions: [] },
      mentors: { active: [], past: [], available: [] },
      oaths: { sworn_by_heinrich: [], sworn_to_heinrich: [], broken: [], fulfilled: [] },
      factions: {},
      consequences: { active: [], pending: [], resolved: [], permanent_ledger: [] },
      rumors: { active: [], decayed: [], planted_by_heinrich: [] },
      properties: [],
      armies: [],
      trade: { company: null, active_routes: [], pending_shipments: [], trade_history: [] },
      ships: [],
      spy_network: { agents: [], intelligence: [], active_operations: [], known_enemies: [] },
      council: { steward: null, marshal: null, chancellor: null, spymaster: null, chaplain: null, master_builder: null, physician: null },
      dynasty: { children: [], marriages: [], heir_designated: null, family_tree: [] },
      identities: {
        true_identity: { name: "Heinrich Renard", class: "serf", known_by: [] },
        false_identities: []
      },
      letters: { sent: [], received: [], in_transit: [], intercepted: [] },
      information: { known_facts: [], known_secrets: [], known_rumors: [], disinformation_planted: [] },
      songs: { composed: [], about_heinrich: [], known_songs: [] },
      debts: { owed_by_heinrich: [], owed_to_heinrich: [] },

      world: {
        regions: {},
        historical_events_fired: [],
        current_year_events: [],
        global_modifiers: [],
        technology_adopted: [],
        active_conflicts: [],
        plague_status: { active: false, region: null, severity: 0 }
      },

      chronicle: { entries: [], achievements: [], legacy_score: 0 },

      map: {
        discovered_locations: ["village_renard_birthplace"],
        current_location: "village_renard_birthplace",
        current_location_type: "village",
        known_routes: [],
        location_details: {}
      },

      // ─── UI STATE (not persisted, but tracked client-side) ─────────────────
      ui: {
        active_panel: "npcs",
        prose_history: [], // Last N prose entries
        last_roll_result: null,
        pending_choices: []
      }
    };
  }

  // ─── LIVE STATE (in-memory, modified by engines) ───────────────────────────
  let _state = null;

  // ─── PUBLIC API ────────────────────────────────────────────────────────────

  /**
   * Initialize state for a new game with player choices.
   */
  function initNew(options = {}) {
    _state = createDefaultState();
    _state.meta.created = new Date().toISOString();
    _state.meta.game_started = true;

    // Apply player character choices
    if (options.family_name) _state.heinrich.family_name = options.family_name;
    if (options.deepest_want) _state.heinrich.deepest_want = options.deepest_want;
    if (options.deepest_fear) _state.heinrich.deepest_fear = options.deepest_fear;

    // Set identity name
    _state.identities.true_identity.name = `Heinrich ${_state.heinrich.family_name}`;

    return _state;
  }

  /**
   * Load state from a saved object (e.g., from server).
   */
  function load(savedState) {
    _state = Object.assign(createDefaultState(), savedState);
    // Deep-merge to ensure new fields from updates don't disappear
    _deepMerge(_state, savedState);
    return _state;
  }

  /**
   * Get the current state (read-only reference).
   */
  function get() {
    if (!_state) throw new Error('GameState not initialized. Call initNew() or load() first.');
    return _state;
  }

  /**
   * Get a specific path from state using dot-notation.
   * e.g., getPath('heinrich.health.hunger_value')
   */
  function getPath(path) {
    const keys = path.split('.');
    let obj = _state;
    for (const key of keys) {
      if (obj == null) return undefined;
      obj = obj[key];
    }
    return obj;
  }

  /**
   * Set a value at a specific path in state.
   */
  function setPath(path, value) {
    const keys = path.split('.');
    let obj = _state;
    for (let i = 0; i < keys.length - 1; i++) {
      if (obj[keys[i]] == null) obj[keys[i]] = {};
      obj = obj[keys[i]];
    }
    obj[keys[keys.length - 1]] = value;
  }

  /**
   * Get a serializable snapshot for saving.
   */
  function snapshot() {
    // Exclude non-persisted ui state
    const snap = JSON.parse(JSON.stringify(_state));
    delete snap.ui;
    snap.meta.last_saved = new Date().toISOString();
    return snap;
  }

  /**
   * Validate state integrity — returns { valid: bool, errors: [] }
   */
  function validate() {
    const errors = [];
    if (!_state) { return { valid: false, errors: ['State not initialized'] }; }
    if (!_state.meta.session_key) errors.push('Missing session key');
    if (!_state.heinrich.family_name) errors.push('Missing Heinrich family name');
    if (_state.skills.brawling === undefined) errors.push('Skills object corrupted');
    return { valid: errors.length === 0, errors };
  }

  /**
   * Convenience: get Heinrich's total coin in sous
   */
  function getTotalCoinInSous() {
    const { livres, sous, deniers } = _state.inventory.coin;
    return (livres * 240) + sous + (deniers / 12);
  }

  /**
   * Convenience: get skill level (handles branch skills too)
   * skillPath: "brawling" or "brawling.grappling"
   */
  function getSkillLevel(skillPath) {
    const parts = skillPath.split('.');
    const skills = _state.skills;
    if (parts.length === 1) {
      return skills[parts[0]]?.level ?? 0;
    } else {
      return skills[parts[0]]?.branches?.[parts[1]]?.level ?? 0;
    }
  }

  /**
   * Deep merge helper — merges source into target recursively.
   */
  function _deepMerge(target, source) {
    for (const key of Object.keys(source)) {
      if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (target[key] === undefined) target[key] = {};
        _deepMerge(target[key], source[key]);
      } else {
        target[key] = source[key];
      }
    }
    return target;
  }

  return {
    initNew,
    load,
    get,
    getPath,
    setPath,
    snapshot,
    validate,
    getTotalCoinInSous,
    getSkillLevel,
    createDefaultState
  };

})();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { GameState };
}

// END FILE: client/js/engine/game-state.js
