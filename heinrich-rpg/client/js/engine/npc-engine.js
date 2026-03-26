// FILE: client/js/engine/npc-engine.js — PART 6

'use strict';

/**
 * NPC ENGINE — NPC instantiation from templates, disposition calculation,
 * memory system, NPC-driven actions, relationship tracking with Heinrich.
 */

const NPCEngine = (() => {

  // ─── NPC ARCHETYPES (relationship dynamics) ───────────────────────────────
  const ARCHETYPES = {
    loyalist:     { trust_gain: 1.5,  trust_loss: 0.5,   forgiveness: 'high',   ideal_bond: 'mentor_or_patron' },
    suspicious:   { trust_gain: 0.5,  trust_loss: 1.5,   forgiveness: 'low',    ideal_bond: 'rival_who_earns_respect' },
    opportunist:  { trust_gain: 1.0,  trust_loss: 1.0,   forgiveness: 'medium', ideal_bond: 'partner_of_mutual_benefit' },
    idealist:     { trust_gain: 1.2,  trust_loss: 2.0,   forgiveness: 'medium', ideal_bond: 'companion_sharing_values' },
    pragmatist:   { trust_gain: 0.8,  trust_loss: 0.8,   forgiveness: 'high',   ideal_bond: 'professional_relationship' },
    passionate:   { trust_gain: 2.0,  trust_loss: 2.0,   forgiveness: 'variable', ideal_bond: 'deep_emotional_connection' },
    proud:        { trust_gain: 0.8,  trust_loss: 2.5,   forgiveness: 'very_low', ideal_bond: 'rivalry_or_peer_respect' }
  };

  // ─── RELATIONSHIP TYPES ───────────────────────────────────────────────────
  const RELATIONSHIP_TYPES = [
    'stranger', 'acquaintance', 'contact', 'ally', 'friend', 'close_friend',
    'mentor', 'student', 'patron', 'employee', 'employer',
    'rival', 'enemy', 'nemesis',
    'love_interest', 'lover', 'former_lover',
    'family_peer', 'family_elder', 'family_dependent'
  ];

  // ─── FAVORABILITY THRESHOLDS ──────────────────────────────────────────────
  const FAVORABILITY_THRESHOLDS = [
    { min: 85,   type: 'devoted',      label: 'Devoted',       social_bonus: 20 },
    { min: 65,   type: 'friendly',     label: 'Friendly',      social_bonus: 10 },
    { min: 45,   type: 'warm',         label: 'Warm',          social_bonus: 5  },
    { min: 30,   type: 'neutral',      label: 'Neutral',       social_bonus: 0  },
    { min: 15,   type: 'cool',         label: 'Cool',          social_bonus: -5 },
    { min: -10,  type: 'hostile',      label: 'Hostile',       social_bonus: -15 },
    { min: -100, type: 'enemy',        label: 'Enemy',         social_bonus: -30 }
  ];

  // ─── NPC INSTANTIATION ───────────────────────────────────────────────────

  /**
   * Create a fresh NPC instance from a template.
   * Templates come from npc-templates.js
   */
  function instantiateNPC(templateId, overrides = {}, state) {
    const templates = typeof NPC_TEMPLATES !== 'undefined' ? NPC_TEMPLATES : {};
    const template = templates[templateId];

    if (!template) {
      return _generateGenericNPC(templateId, overrides, state);
    }

    const npc = {
      id: overrides.id || `npc_${templateId}_${Date.now()}`,
      template_id: templateId,
      name: overrides.name || template.name || _generateName(template.nationality || 'french'),
      age: overrides.age || _generateAge(template.age_range || [25, 55]),
      sex: overrides.sex || template.sex || (DiceEngine.chance(0.5) ? 'male' : 'female'),
      class: overrides.class_tier ? overrides.class_tier : (template.class || 'freeman'),
      occupation: template.occupation || 'peasant',
      nationality: template.nationality || 'french',

      // Personality
      archetype: template.archetype || 'pragmatist',
      desires: [...(template.desires || ['security', 'respect'])],
      fears: [...(template.fears || ['poverty', 'shame'])],
      values: [...(template.values || ['loyalty'])],
      secrets: template.secrets ? [...template.secrets] : [],

      // Stats
      skills: _generateNPCSkills(template),
      wealth: template.wealth || 'modest',
      health: { hp: 40, hp_max: 40, wounded: false },

      // Appearance
      appearance: template.appearance || 'Unremarkable.',
      physical_notable: template.physical_notable || null,

      // Current state
      current_location: overrides.location || state.map.current_location,
      current_mood: 'neutral',
      current_activity: template.typical_activity || 'working',
      knows_heinrich: false,
      has_met_heinrich: false,

      // Memory system
      memory: {
        heinrich_impressions: [],    // { turn, event, emotional_impact }
        known_facts_about_heinrich: [],
        witnessed_events: [],
        grievances: [],
        gratitudes: []
      },

      // Dialogue
      speaking_style: template.speaking_style || 'plain',
      typical_greeting: template.typical_greeting || null,
      topics_triggers: template.topics_triggers || [],

      // Tracking
      turn_created: state.meta.turn,
      autonomous: template.autonomous !== undefined ? template.autonomous : false,
      alive: true,

      ...overrides
    };

    // Initialize relationship in state
    if (!state.npc_relationships[npc.id]) {
      state.npc_relationships[npc.id] = {
        favorability: overrides.initial_favorability !== undefined ? overrides.initial_favorability : template.initial_favorability || 25,
        relationship_type: overrides.relationship_type || 'stranger',
        emotional_memory: [],
        grudges: [],
        active_gossip: []
      };
    }

    // Add to active NPCs
    state.npcs.active[npc.id] = npc;

    return npc;
  }

  // ─── GENERIC NPC GENERATION ───────────────────────────────────────────────

  function _generateGenericNPC(hint, overrides, state) {
    const isUrban = state.map.current_location_type === 'city' || state.map.current_location_type === 'town';
    const classes = isUrban ? ['freeman', 'burgher', 'merchant'] : ['serf', 'freeman', 'yeoman'];
    const randomClass = classes[DiceEngine.randInt(0, classes.length - 1)];

    return {
      id: overrides.id || `npc_generic_${Date.now()}`,
      template_id: 'generic',
      name: _generateName('french'),
      age: DiceEngine.randInt(20, 60),
      sex: DiceEngine.chance(0.5) ? 'male' : 'female',
      class: randomClass,
      occupation: _randomOccupation(randomClass, isUrban),
      nationality: 'french',
      archetype: _randomArchetype(),
      desires: ['security'],
      fears: ['poverty'],
      values: ['family'],
      secrets: [],
      skills: { base_social: DiceEngine.randInt(1, 4), base_physical: DiceEngine.randInt(1, 4) },
      wealth: 'modest',
      health: { hp: 40, hp_max: 40, wounded: false },
      appearance: 'A typical face from the region.',
      physical_notable: null,
      current_location: state.map.current_location,
      current_mood: 'neutral',
      current_activity: 'working',
      knows_heinrich: false,
      has_met_heinrich: false,
      memory: { heinrich_impressions: [], known_facts_about_heinrich: [], witnessed_events: [], grievances: [], gratitudes: [] },
      speaking_style: 'plain',
      typical_greeting: null,
      topics_triggers: [],
      turn_created: state.meta.turn,
      autonomous: false,
      alive: true,
      ...overrides
    };
  }

  // ─── NPC REACTION CALCULATION ─────────────────────────────────────────────

  /**
   * Calculate NPC reaction to a given action/event.
   * Returns { favorability_delta, emotional_response, will_remember, memory_valence }
   */
  function calculateNPCReaction(npc, event, state) {
    const archetype = ARCHETYPES[npc.archetype] || ARCHETYPES.pragmatist;
    const relationship = state.npc_relationships[npc.id] || { favorability: 25 };

    let delta = 0;
    let emotionalResponse = 'neutral';

    switch (event.type) {
      case 'violence_toward_npc':
        delta = -40 * archetype.trust_loss;
        emotionalResponse = 'fear_and_hatred';
        break;

      case 'help_offered':
      case 'aid_given':
        delta = 15 * archetype.trust_gain;
        emotionalResponse = 'grateful';
        break;

      case 'promise_kept':
        delta = 20 * archetype.trust_gain;
        emotionalResponse = 'trusting';
        break;

      case 'promise_broken':
        delta = -30 * archetype.trust_loss;
        emotionalResponse = 'betrayed';
        // Add grudge
        if (!state.npc_relationships[npc.id].grudges) state.npc_relationships[npc.id].grudges = [];
        state.npc_relationships[npc.id].grudges.push({
          type: 'broken_promise',
          severity: 'medium',
          turn: state.meta.turn,
          still_active: true
        });
        break;

      case 'witnessed_dishonorable':
        delta = -15 * archetype.trust_loss;
        emotionalResponse = 'disturbed';
        break;

      case 'witnessed_heroic':
        delta = 20 * archetype.trust_gain;
        emotionalResponse = 'admiring';
        break;

      case 'gift_received':
        delta = event.gift_value * 0.3 * archetype.trust_gain;
        emotionalResponse = 'pleased';
        break;

      case 'insulted':
        delta = -25 * archetype.trust_loss;
        emotionalResponse = 'offended';
        if (npc.archetype === 'proud') delta *= 1.5;
        break;

      case 'complimented':
        delta = 8 * archetype.trust_gain;
        emotionalResponse = 'flattered';
        break;

      case 'threat_made':
        const ferocity = (state.heinrich.reputation[npc.class === 'serf' ? 'normandy_peasants' : 'common_people']?.ferocity || 20);
        if (ferocity > 60) { delta = -20; emotionalResponse = 'cowed'; }
        else { delta = -30; emotionalResponse = 'angry_and_afraid'; }
        break;

      case 'seduction_attempt':
        const seductionLevel = state.skills.seduction?.level || 0;
        delta = seductionLevel > 4 ? 20 : seductionLevel > 2 ? 5 : -5;
        emotionalResponse = seductionLevel > 4 ? 'attracted' : 'uncertain';
        break;

      default:
        delta = event.favorability_delta || 0;
        emotionalResponse = event.emotional_response || 'neutral';
    }

    // Attractiveness bonus for social interactions
    if (state.heinrich.attractiveness_bonus && ['help_offered', 'complimented', 'gift_received'].includes(event.type)) {
      delta *= 1.1;
    }

    return {
      favorability_delta: Math.round(delta),
      emotional_response: emotionalResponse,
      will_remember: Math.abs(delta) > 10 || event.memorable,
      memory_valence: delta > 0 ? 'positive' : delta < 0 ? 'negative' : 'neutral'
    };
  }

  /**
   * Apply NPC reaction to the relationship object.
   */
  function applyNPCReaction(npcId, event, state) {
    const npc = state.npcs.active[npcId];
    if (!npc) return null;

    const reaction = calculateNPCReaction(npc, event, state);

    if (!state.npc_relationships[npcId]) {
      state.npc_relationships[npcId] = { favorability: 25, relationship_type: 'stranger', emotional_memory: [], grudges: [] };
    }

    const rel = state.npc_relationships[npcId];
    rel.favorability = Math.max(-100, Math.min(100, (rel.favorability || 25) + reaction.favorability_delta));

    // Update relationship type based on new favorability
    rel.relationship_type = _favorabilityToRelType(rel.favorability, rel.relationship_type);

    // Store memory
    if (reaction.will_remember) {
      const impression = {
        turn: state.meta.turn,
        event: event.type,
        emotional_impact: reaction.emotional_response,
        valence: reaction.memory_valence,
        description: event.description || event.type
      };
      npc.memory.heinrich_impressions.push(impression);
      rel.emotional_memory.push(impression);
    }

    npc.has_met_heinrich = true;
    npc.knows_heinrich = true;

    return reaction;
  }

  // ─── NPC KNOWLEDGE MANAGEMENT ────────────────────────────────────────────

  /**
   * Share information with an NPC (they now know this fact).
   */
  function shareInfoWithNPC(npcId, fact, state) {
    const npc = state.npcs.active[npcId];
    if (!npc) return false;
    if (!npc.memory.known_facts_about_heinrich.includes(fact)) {
      npc.memory.known_facts_about_heinrich.push(fact);
    }
    return true;
  }

  /**
   * Check if an NPC knows a particular secret.
   */
  function npcKnowsSecret(npcId, secretId, state) {
    const npc = state.npcs.active[npcId];
    return npc?.secrets?.includes(secretId) || false;
  }

  /**
   * Get what a NPC would likely gossip about regarding Heinrich.
   */
  function whatWouldNPCGossip(npcId, state) {
    const npc = state.npcs.active[npcId];
    if (!npc?.knows_heinrich) return null;

    const rel = state.npc_relationships[npcId];
    const impressions = npc.memory.heinrich_impressions || [];

    // NPC gossips about the most impactful thing they remember
    const strongestImpression = impressions.sort((a, b) =>
      Math.abs(b.emotional_impact === 'fear_and_hatred' ? 100 : 50) -
      Math.abs(a.emotional_impact === 'fear_and_hatred' ? 100 : 50)
    )[0];

    return strongestImpression
      ? {
          content: strongestImpression.description,
          valence: strongestImpression.valence,
          exaggerated: rel.favorability < -20 // hostile NPCs embellish negatively
        }
      : null;
  }

  // ─── NPC DEATH ────────────────────────────────────────────────────────────

  function killNPC(npcId, cause, state) {
    const npc = state.npcs.active[npcId];
    if (!npc) return false;

    npc.alive = false;
    npc.death_cause = cause;
    npc.death_turn = state.meta.turn;

    state.npcs.dead[npcId] = { ...npc };
    delete state.npcs.active[npcId];

    // Chronicle entry if significant relationship
    const rel = state.npc_relationships[npcId];
    if (rel && rel.favorability > 60) {
      state.chronicle.entries.push({
        type: 'npc_death',
        npc_name: npc.name,
        relationship: rel.relationship_type,
        cause,
        turn: state.meta.turn,
        significant: true
      });
    }

    return true;
  }

  // ─── UTILITY FUNCTIONS ────────────────────────────────────────────────────

  function _generateName(nationality) {
    const names = typeof NAME_GENERATOR !== 'undefined' ? NAME_GENERATOR : null;
    if (names) {
      const pool = names.first_names?.[nationality === 'french' ? 'male_french' : 'male_english'] || ['Jean', 'Pierre', 'Thomas'];
      return pool[DiceEngine.randInt(0, pool.length - 1)];
    }
    const fallback = ['Jean', 'Pierre', 'Thomas', 'Henri', 'Guillaume', 'Robert', 'Michel', 'Anne', 'Marie', 'Isabelle'];
    return fallback[DiceEngine.randInt(0, fallback.length - 1)];
  }

  function _generateAge(range) {
    return DiceEngine.randInt(range[0], range[1]);
  }

  function _generateNPCSkills(template) {
    return {
      primary_skill: template.primary_skill || 'unknown',
      primary_level: template.primary_skill_level || DiceEngine.randInt(2, 5),
      combat_level: template.combat_level || DiceEngine.randInt(1, 3),
      social_level: template.social_level || DiceEngine.randInt(1, 4)
    };
  }

  function _randomOccupation(classId, urban) {
    const rural = ['farmer', 'peasant', 'woodcutter', 'shepherd', 'miller'];
    const urbanList = ['merchant', 'craftsman', 'innkeeper', 'baker', 'tailor'];
    const list = urban ? urbanList : rural;
    return list[DiceEngine.randInt(0, list.length - 1)];
  }

  function _randomArchetype() {
    const keys = Object.keys(ARCHETYPES);
    return keys[DiceEngine.randInt(0, keys.length - 1)];
  }

  function _favorabilityToRelType(favorability, current) {
    if (favorability >= 85) return current === 'rival' ? 'rival_turned_ally' : 'close_friend';
    if (favorability >= 65) return 'friend';
    if (favorability >= 45) return 'ally';
    if (favorability >= 30) return current === 'stranger' ? 'acquaintance' : current;
    if (favorability >= 15) return 'contact';
    if (favorability >= -10) return 'hostile_contact';
    if (favorability >= -50) return 'enemy';
    return 'nemesis';
  }

  /**
   * Get favorability tier data for an NPC.
   */
  function getFavorabilityTier(npcId, state) {
    const fav = state.npc_relationships[npcId]?.favorability || 0;
    return FAVORABILITY_THRESHOLDS.find(t => fav >= t.min) || FAVORABILITY_THRESHOLDS[FAVORABILITY_THRESHOLDS.length - 1];
  }

  /**
   * Get all NPCs at a given location.
   */
  function getNPCsAtLocation(location, state) {
    return Object.values(state.npcs.active).filter(npc => npc.current_location === location && npc.alive);
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    ARCHETYPES,
    RELATIONSHIP_TYPES,
    FAVORABILITY_THRESHOLDS,
    instantiateNPC,
    calculateNPCReaction,
    applyNPCReaction,
    shareInfoWithNPC,
    npcKnowsSecret,
    whatWouldNPCGossip,
    killNPC,
    getFavorabilityTier,
    getNPCsAtLocation
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NPCEngine };
}

// END FILE: client/js/engine/npc-engine.js
