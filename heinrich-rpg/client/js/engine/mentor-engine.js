// FILE: client/js/engine/mentor-engine.js — PART 6

'use strict';

/**
 * MENTOR ENGINE — Finding, activating, and maintaining mentor relationships.
 * Mentors accelerate XP gain in specific skills and can unlock branch skills early.
 */

const MentorEngine = (() => {

  // ─── MENTOR ARCHETYPES ────────────────────────────────────────────────────
  const MENTOR_TYPES = {
    combat_veteran: {
      id: 'combat_veteran',
      teaches: ['sword', 'brawling', 'axe', 'polearms', 'shield', 'tactics', 'command'],
      xp_bonus_multiplier: 1.2,
      sessions_per_week: 5,
      cost_per_session_sous: 5,
      personality: 'demanding',
      unlock_condition: 'demonstrate_basic_competence',
      teaches_style: 'Drill and sparring. Bruises are the lesson.',
      max_skill_can_teach: 7,
      typical_npc_class: ['knight', 'minor_lord', 'sergeant', 'veteran_soldier']
    },
    master_smith: {
      id: 'master_smith',
      teaches: ['smithing', 'engineering'],
      xp_bonus_multiplier: 1.25,
      sessions_per_week: [3, 6],
      cost_per_session_sous: 8,
      teaches_style: 'Apprentice work. Watch, then do. Learn by making.',
      max_skill_can_teach: 8,
      typical_npc_class: ['burgher', 'master_craftsman']
    },
    scholar_monk: {
      id: 'scholar_monk',
      teaches: ['reading', 'theology', 'history', 'law', 'medicine', 'latin'],
      xp_bonus_multiplier: 1.3,
      sessions_per_week: 4,
      cost_per_session_sous: 3,
      teaches_style: 'Rote memorization, Socratic questioning, copying texts.',
      max_skill_can_teach: 9,
      typical_npc_class: ['scholar', 'priest', 'bishop', 'monk']
    },
    merchant_trader: {
      id: 'merchant_trader',
      teaches: ['haggle', 'stewardship', 'deception', 'etiquette', 'navigation'],
      xp_bonus_multiplier: 1.15,
      sessions_per_week: 3,
      cost_per_session_sous: 10,
      teaches_style: 'On the job. You handle the deal; I correct you afterward.',
      max_skill_can_teach: 7,
      typical_npc_class: ['merchant', 'merchant_wealthy', 'factor']
    },
    hunter_tracker: {
      id: 'hunter_tracker',
      teaches: ['hunting', 'survival', 'archery', 'navigation', 'stealth'],
      xp_bonus_multiplier: 1.2,
      sessions_per_week: [4, 7],
      cost_per_session_sous: 2,
      teaches_style: 'In the field. No classroom. Learn or freeze or starve.',
      max_skill_can_teach: 8,
      typical_npc_class: ['hunter', 'freeman', 'yeoman']
    },
    court_performer: {
      id: 'court_performer',
      teaches: ['performance', 'etiquette', 'speech', 'seduction'],
      xp_bonus_multiplier: 1.2,
      sessions_per_week: 4,
      cost_per_session_sous: 6,
      teaches_style: 'Imitation and critique. You perform; I destroy your weaknesses.',
      max_skill_can_teach: 8,
      typical_npc_class: ['troubadour', 'court_musician', 'burgher']
    },
    thief_master: {
      id: 'thief_master',
      teaches: ['stealth', 'pickpocket', 'lockpicking', 'deception', 'forgery_skill'],
      xp_bonus_multiplier: 1.3,
      sessions_per_week: 3,
      cost_per_session_sous: 0,
      cost_alternative: 'cut_of_take_percent_20',
      teaches_style: 'Trial by doing. Get caught and I disown you.',
      max_skill_can_teach: 9,
      typical_npc_class: ['criminal']
    },
    physician: {
      id: 'physician',
      teaches: ['medicine', 'reading', 'theology'],
      xp_bonus_multiplier: 1.25,
      sessions_per_week: 3,
      cost_per_session_sous: 12,
      teaches_style: 'Theory from Galen, practice on the sick.',
      max_skill_can_teach: 8,
      typical_npc_class: ['physician', 'scholar', 'monk']
    },
    carpenter_engineer: {
      id: 'carpenter_engineer',
      teaches: ['carpentry', 'engineering', 'architecture'],
      xp_bonus_multiplier: 1.2,
      sessions_per_week: [4, 6],
      cost_per_session_sous: 4,
      teaches_style: 'Building sites are the school. See, measure, cut, assemble.',
      max_skill_can_teach: 8,
      typical_npc_class: ['master_craftsman', 'burgher']
    },
    nobleman_etiquette: {
      id: 'nobleman_etiquette',
      teaches: ['etiquette', 'heraldry', 'law', 'speech', 'tactics'],
      xp_bonus_multiplier: 1.2,
      sessions_per_week: 2,
      cost_per_session_sous: 0,
      cost_alternative: 'service_and_loyalty',
      teaches_style: 'Observation and correction at court. You watch and do and are corrected, often harshly.',
      max_skill_can_teach: 7,
      typical_npc_class: ['knight', 'petty_noble', 'minor_lord'],
      requires_relationship: 50
    }
  };

  // ─── FIND AVAILABLE MENTORS ────────────────────────────────────────────────

  /**
   * Find potential mentors at a given location.
   * Filters based on NPC population and skill needs.
   */
  function findAvailableMentors(location, skillWanted, state) {
    const available = [];
    const locationNPCs = Object.values(state.npcs.active).filter(
      npc => npc.current_location === location && npc.alive
    );

    for (const npc of locationNPCs) {
      // Check each mentor type to see if this NPC could teach it
      for (const [typeId, mentorType] of Object.entries(MENTOR_TYPES)) {
        if (!mentorType.teaches.includes(skillWanted)) continue;
        if (!mentorType.typical_npc_class.includes(npc.class) && !mentorType.typical_npc_class.includes(npc.occupation)) continue;

        const relationship = state.npc_relationships[npc.id] || { favorability: 25 };
        const meetsRequirements = !mentorType.requires_relationship ||
          relationship.favorability >= mentorType.requires_relationship;

        if (meetsRequirements) {
          available.push({
            npc,
            mentor_type: typeId,
            mentor_data: mentorType,
            relationship: relationship.favorability,
            can_approach: true
          });
        }
      }
    }

    // Also generate a generic available mentor if none found (representing unnamed people)
    if (available.length === 0 && _isSkillAvailableAtLocation(skillWanted, location, state)) {
      available.push({
        npc: null,
        mentor_type: _skillToMentorType(skillWanted),
        mentor_data: MENTOR_TYPES[_skillToMentorType(skillWanted)],
        generic: true,
        can_approach: true,
        description: `An experienced ${skillWanted} practitioner at ${location} who might take an interested student`
      });
    }

    return available;
  }

  /**
   * Attempt to recruit a mentor.
   * @returns {{ success: bool, mentor_record, roll }}
   */
  function recruitMentor(npcIdOrNull, mentorTypeId, skillToTeach, state) {
    const mentorType = MENTOR_TYPES[mentorTypeId];
    if (!mentorType) return { success: false, reason: 'Unknown mentor type' };

    // Determine what to roll — mostly speech or related social skill
    const socialSkillLevel = state.skills.speech?.level || 0;
    const relationship = npcIdOrNull ? (state.npc_relationships[npcIdOrNull]?.favorability || 0) : 0;
    const relBonus = Math.round(relationship * 0.1); // -10 to +10

    const result = DiceEngine.roll('speech', socialSkillLevel, 'medium', [
      { label: 'Relationship', value: relBonus }
    ], state);

    DiceEngine.applyXP(state.skills, 'speech', result.xpAwarded);

    if (!result.isSuccess) {
      return { success: false, roll: result, reason: 'They declined. Perhaps try again, build the relationship first, or find someone else.' };
    }

    // Create mentor record
    const mentor = {
      id: `mentor_${Date.now()}`,
      npc_id: npcIdOrNull,
      mentor_type: mentorTypeId,
      teaches_skill: skillToTeach,
      xp_bonus: mentorType.xp_bonus_multiplier,
      sessions_per_week: Array.isArray(mentorType.sessions_per_week)
        ? DiceEngine.randInt(...mentorType.sessions_per_week)
        : mentorType.sessions_per_week,
      cost_per_session: mentorType.cost_per_session_sous || 0,
      cost_alternative: mentorType.cost_alternative || null,
      max_skill: mentorType.max_skill_can_teach,
      started_turn: state.meta.turn,
      active: true,
      sessions_completed: 0,
      total_xp_granted: 0
    };

    state.mentors.active.push(mentor);

    return { success: true, mentor, roll: result };
  }

  /**
   * Process a mentoring session (called from world-tick or player action).
   * @returns {{ xp_granted, cost, max_reached, relationship_change }}
   */
  function conductSession(mentorId, state) {
    const mentor = state.mentors.active.find(m => m.id === mentorId);
    if (!mentor || !mentor.active) return null;

    const currentSkillLevel = state.skills[mentor.teaches_skill]?.level || 0;

    // Check if mentor can still teach at this level
    if (currentSkillLevel >= mentor.max_skill) {
      mentor.active = false;
      state.mentors.past.push({ ...mentor, ended_reason: 'skill_cap_reached', ended_turn: state.meta.turn });
      state.mentors.active = state.mentors.active.filter(m => m.id !== mentorId);
      return { max_reached: true, mentor_type: mentor.mentor_type };
    }

    // Pay cost
    if (mentor.cost_per_session > 0) {
      const paid = EconomyEngine.spendMoney(state.inventory, mentor.cost_per_session);
      if (!paid) {
        return { failed: true, reason: 'Cannot afford session cost', cost: mentor.cost_per_session };
      }
    }

    // Grant XP (on top of normal activity XP)
    const baseXP = 8;
    const xpGranted = Math.round(baseXP * mentor.xp_bonus);
    DiceEngine.applyXP(state.skills, mentor.teaches_skill, xpGranted);

    mentor.sessions_completed++;
    mentor.total_xp_granted += xpGranted;

    // Relationship improvement with mentor NPC
    let relationshipImprovement = 0;
    if (mentor.npc_id) {
      relationshipImprovement = 2;
      if (state.npc_relationships[mentor.npc_id]) {
        state.npc_relationships[mentor.npc_id].favorability = Math.min(100,
          state.npc_relationships[mentor.npc_id].favorability + relationshipImprovement
        );
      }
    }

    return {
      xp_granted: xpGranted,
      cost: mentor.cost_per_session,
      skill: mentor.teaches_skill,
      relationship_change: relationshipImprovement,
      max_reached: false
    };
  }

  /**
   * Get what a player needs to attract a specific mentor type.
   */
  function getMentorRequirements(mentorTypeId, state) {
    const mentorType = MENTOR_TYPES[mentorTypeId];
    if (!mentorType) return null;

    const requirements = [];

    if (mentorType.cost_per_session_sous > 0) {
      requirements.push(`Afford ${mentorType.cost_per_session_sous} sous per session`);
    }
    if (mentorType.cost_alternative) {
      requirements.push(`Alternative: ${mentorType.cost_alternative}`);
    }
    if (mentorType.requires_relationship) {
      requirements.push(`Relationship at least ${mentorType.requires_relationship} with NPC`);
    }
    requirements.push(`Find an NPC of class: ${mentorType.typical_npc_class.join(', ')}`);

    return requirements;
  }

  // ─── HELPERS ─────────────────────────────────────────────────────────────

  function _isSkillAvailableAtLocation(skill, location, state) {
    const locationSkills = {
      city: ['all'],
      town: ['smithing', 'carpentry', 'medicine', 'reading', 'haggle', 'etiquette', 'theology'],
      village: ['agriculture', 'survival', 'hunting', 'brawling'],
      monastery: ['reading', 'theology', 'medicine', 'history', 'law'],
      castle: ['sword', 'horsemanship', 'tactics', 'command', 'etiquette', 'heraldry'],
      port: ['seamanship', 'navigation', 'haggle']
    };

    const locationType = state.map.current_location_type || 'village';
    const available = locationSkills[locationType] || locationSkills.village;
    return available.includes('all') || available.includes(skill);
  }

  function _skillToMentorType(skill) {
    const map = {
      sword: 'combat_veteran', brawling: 'combat_veteran', tactics: 'combat_veteran',
      smithing: 'master_smith', engineering: 'master_smith',
      reading: 'scholar_monk', theology: 'scholar_monk', medicine: 'physician',
      haggle: 'merchant_trader', stewardship: 'merchant_trader',
      hunting: 'hunter_tracker', survival: 'hunter_tracker', archery: 'hunter_tracker',
      performance: 'court_performer', etiquette: 'nobleman_etiquette',
      stealth: 'thief_master', lockpicking: 'thief_master',
      carpentry: 'carpenter_engineer'
    };
    return map[skill] || 'combat_veteran';
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    MENTOR_TYPES,
    findAvailableMentors,
    recruitMentor,
    conductSession,
    getMentorRequirements
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MentorEngine };
}

// END FILE: client/js/engine/mentor-engine.js
