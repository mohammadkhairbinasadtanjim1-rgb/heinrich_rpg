// FILE: client/js/engine/class-system.js — PART 4

'use strict';

/**
 * CLASS SYSTEM — Social class ladder from Serf to Emperor,
 * class privileges/obligations, ascension requirements, failure conditions,
 * and the "social resistance" that the world exerts against Heinrich rising.
 */

const ClassSystem = (() => {

  // ─── FULL CLASS LADDER ─────────────────────────────────────────────────────
  // 12 tiers, multiple paths of ascension per tier
  const CLASS_LADDER = {

    serf: {
      tier: 1,
      id: 'serf',
      name: 'Serf',
      name_fr: 'Serf',
      description: 'Bound to the land. Property of the lord in all but name.',
      privileges: ['right_to_work_own_plot', 'church_protection_theoretically'],
      obligations: ['corvee_labor', 'grain_rent', 'cannot_leave_without_permission', 'heriot_tax_on_death'],
      social_penalties: { noble_npcs: -20, city_npcs: -10 },
      ascension_paths: {
        freeman_purchase: {
          label: 'Purchase Freedom',
          requirements: { coin_livres: 10, lord_agrees: true, skills: {} },
          description: 'Save enough coin and buy your freedom from your lord.'
        },
        flee_to_city: {
          label: 'Flee to City',
          requirements: { reach_city: true, stay_hidden_one_year: true },
          description: 'Medieval law: if a serf lives in a city for a year and a day, they become free.',
          risk: 'lord_may_pursue',
          heat_generated: 25
        },
        military_service: {
          label: 'Military Service',
          requirements: { skills: { polearms: 2 }, lord_consent: 'or_war_emergency' },
          description: 'Distinguished military service can earn freedom — and more.',
          grants_on_success: 'freeman_or_yeoman'
        },
        church_entry: {
          label: 'Enter the Church',
          requirements: { skills: { theology: 1 }, church_sponsor: true },
          description: 'A literate serf with Church backing can take minor orders.',
          grants: 'novice_monk'
        }
      },
      failure_conditions: ['cannot_pay_rent_and_refuses_corvee', 'branded_criminal'],
      nightmares_of_power: ['lords_anger', 'bad_harvest_starvation', 'forced_military_conscription']
    },

    freeman: {
      tier: 2,
      id: 'freeman',
      name: 'Freeman / Villein',
      name_fr: 'Homme Libre',
      description: 'Free to travel, work for pay, and own property — within limits.',
      privileges: ['freedom_of_movement', 'can_own_property', 'can_trade', 'can_testify_in_court'],
      obligations: ['pay_taxes', 'answer_lords_call_for_labor_on_own_lands'],
      social_penalties: { noble_npcs: -10 },
      ascension_paths: {
        master_craftsman: {
          label: 'Master Craftsman',
          requirements: { skills: { smithing: 6 }, guild_membership: true },
          description: 'Join a guild and achieve master status.',
          grants: 'burgher'
        },
        landownership: {
          label: 'Acquire Land',
          requirements: { coin_livres: 30, lord_sells: true },
          description: 'Buy a small holding and become a proper yeoman landowner.',
          grants: 'yeoman'
        },
        merchant_success: {
          label: 'Merchant Success',
          requirements: { wealth_tier: 'comfortable', trade_routes: 2 },
          grants: 'petty_merchant'
        },
        military_distinction: {
          label: 'Military Distinction',
          requirements: { skills: { command: 3 }, reputation_military: 50 },
          grants: 'yeoman_archer_or_sergeant'
        }
      },
      failure_conditions: ['lose_land_to_debt', 'serious_crime_conviction'],
      nightmares_of_power: ['bad_debt', 'guild_hostility', 'tax_collectors']
    },

    yeoman: {
      tier: 3,
      id: 'yeoman',
      name: 'Yeoman / Prosperous Farmer',
      name_fr: 'Yeoman / Laboureur',
      description: 'A free landowner of modest property. Independent, respected locally.',
      privileges: ['vote_in_local_assemblies', 'speak_at_manor_court', 'right_to_bear_arms'],
      obligations: ['military_levy_when_called', 'local_service'],
      social_penalties: {},
      ascension_paths: {
        merchant_prosperity: {
          label: 'Merchant Prosperity',
          requirements: { wealth_tier: 'wealthy', trade_routes: 4 },
          grants: 'merchant'
        },
        military_captain: {
          label: 'Military Captain',
          requirements: { skills: { command: 5, sword: 4 }, distinguished_service: true },
          grants: 'knight_candidate'
        },
        church_advancement: {
          label: 'Church Advancement',
          requirements: { skills: { theology: 3, reading: 3 }, church_rank: 'deacon' },
          grants: 'parish_priest'
        },
        marry_up: {
          label: 'Marriage Alliance',
          requirements: { skills: { seduction: 4, etiquette: 3 }, suitable_match_available: true },
          grants: 'petty_noble_by_marriage'
        }
      },
      nightmares_of_power: ['regional_lord_envy', 'crop_failure', 'military_obligations_expensive']
    },

    burgher: {
      tier: 4,
      id: 'burgher',
      name: 'Burgher / Master Craftsman',
      name_fr: 'Bourgeois',
      description: 'Urban citizen of standing. Guild member or established tradesman.',
      privileges: ['guild_rights', 'city_council_eligibility', 'legal_protections', 'travel_freely'],
      obligations: ['guild_dues', 'city_taxes', 'civic_duties'],
      social_penalties: {},
      ascension_paths: {
        wealthy_merchant: {
          label: 'Wealthy Merchant',
          requirements: { wealth_tier: 'rich', trade_company: true },
          grants: 'merchant_wealthy'
        },
        political_connection: {
          label: 'Political Alliance',
          requirements: { skills: { speech: 5 }, noble_patron: true },
          grants: 'petty_noble'
        },
        church_patron: {
          label: 'Church Patron',
          requirements: { coin_livres: 200, church_donation: true },
          grants: 'gentleman_honorary'
        }
      },
      nightmares_of_power: ['guild_politics', 'fire_destroys_workshop', 'noble_extortion']
    },

    petty_noble: {
      tier: 5,
      id: 'petty_noble',
      name: 'Petty Noble / Gentleman',
      name_fr: 'Gentilhomme',
      description: 'Born or risen to minor noble status. Exempt from most taxes. Socially superior.',
      privileges: ['tax_exemption', 'right_to_wear_certain_furs', 'cannot_be_tortured_without_cause', 'own_soldiers_legal'],
      obligations: ['military_service_to_overlord', 'maintain_station'],
      social_penalties: {},
      ascension_paths: {
        knighthood: {
          label: 'Earn Knighthood',
          requirements: { skills: { sword: 6, horsemanship: 5 }, distinguished_military: true, sponsor_required: true },
          grants: 'knight'
        },
        marry_higher: {
          label: 'Strategic Marriage',
          requirements: { skills: { seduction: 5, etiquette: 5 }, suitable_noble_match: true },
          grants: 'minor_lord'
        }
      },
      nightmares_of_power: ['maintaining_expensive_lifestyle', 'senior_noble_enemies', 'inheritance_disputes']
    },

    knight: {
      tier: 6,
      id: 'knight',
      name: 'Knight',
      name_fr: 'Chevalier',
      description: 'The warrior-noble. The ideal of chivalry and its brutal reality.',
      privileges: ['can_administer_justice', 'lead_military_forces', 'enter_tournaments', 'heraldic_arms'],
      obligations: ['40_days_military_service_per_year', 'maintain_horse_and_arms', 'chivalric_code'],
      social_penalties: {},
      ascension_paths: {
        lord_of_lands: {
          label: 'Gain a Fief',
          requirements: { distinguished_service: true, lord_grants_land: true },
          grants: 'minor_lord'
        },
        military_commander: {
          label: 'Rise by Sword',
          requirements: { skills: { command: 7, tactics: 5 }, major_victory: true },
          grants: 'banneret_or_captain'
        },
        royal_favor: {
          label: 'Royal Favor',
          requirements: { reputation_royal: 70, royal_service: true },
          grants: 'king_s_knight_or_lord'
        }
      },
      nightmares_of_power: ['tournament_injuries', 'war_expense', 'political_enemies_at_court', 'being_captured_and_ransomed']
    },

    minor_lord: {
      tier: 7,
      id: 'minor_lord',
      name: 'Minor Lord / Baron',
      name_fr: 'Seigneur / Baron',
      description: 'Land, serfs, income, obligations. The weight of lordship.',
      privileges: ['judicial_authority_over_serfs', 'collect_taxes', 'summon_levy', 'castle_right'],
      obligations: ['military_service_to_count_or_duke', 'attend_courts', 'maintain_peace'],
      social_penalties: {},
      ascension_paths: {
        county: {
          label: 'Gain County',
          requirements: { military_success: true, royal_favor: 80, wealth_tier: 'rich' },
          grants: 'count'
        },
        ecclesiastical: {
          label: 'Church Appointment',
          requirements: { skills: { theology: 6 }, bishop_appointment: true },
          grants: 'bishop'
        }
      },
      nightmares_of_power: ['managing_ambitious_subordinates', 'peasant_uprisings', 'expensive_wars', 'succession_crises']
    },

    count: {
      tier: 8,
      id: 'count',
      name: 'Count / Earl',
      name_fr: 'Comte',
      description: 'Regional power. A count can make or break lesser lords.',
      privileges: ['summon_armies', 'coin_minting_sometimes', 'high_justice', 'attend_royal_council'],
      obligations: ['attend_king_court', 'major_military_levies', 'maintain_regional_order'],
      ascension_paths: {
        duke_by_service: { requirements: { royal_service: 'extraordinary', decades_of_loyalty: true }, grants: 'duke' },
        rebel_duke: { requirements: { military_dominance_of_region: true, risk: 'treason' }, grants: 'duke' }
      },
      nightmares_of_power: ['king_jealousy', 'baronial_rebellion', 'crusade_obligations', 'dynastic_instability']
    },

    duke: {
      tier: 9,
      id: 'duke',
      name: 'Duke / Duke of Normandy etc.',
      name_fr: 'Duc',
      description: 'Near-sovereign power over major territories. Kings are sometimes more equal than others.',
      privileges: ['quasi_sovereign_territory', 'own_coinage', 'own_army', 'direct_church_appointments'],
      obligations: ['nominal_fealty_to_king', 'defend_realm'],
      ascension_paths: {
        king_by_election: { requirements: { major_crisis: true, political_maneuvering: 'extraordinary' }, grants: 'king' },
        king_by_conquest: { requirements: { military: 'overwhelming', legitimacy_claim: true }, grants: 'king' }
      },
      nightmares_of_power: ['royal_enmity', 'crusade_obligations_direct', 'constant_factional_warfare', 'assassination_attempts_constant']
    },

    bishop: {
      tier: 8,
      id: 'bishop',
      name: 'Bishop',
      name_fr: 'Évêque',
      description: 'Spiritual and temporal power. The Church has land, soldiers, and courts.',
      privileges: ['cannot_be_executed_without_papal_approval', 'own_courts', 'revenue_from_diocese', 'political_influence'],
      obligations: ['attend_councils', 'defend_church_interests', 'celibacy_nominally'],
      ascension_paths: {
        archbishop: { requirements: { distinguished_service: true, papal_favor: true }, grants: 'archbishop' },
        cardinal: { requirements: { papal_trust: 80 }, grants: 'cardinal' }
      }
    },

    king: {
      tier: 10,
      id: 'king',
      name: 'King of France',
      name_fr: 'Roi de France',
      description: 'The pinnacle of French secular power. Every lord theoretically owes you fealty.',
      privileges: ['absolute_authority_theoretically', 'cannot_be_judged_by_mortal_court', 'heritable_lordship'],
      obligations: ['defend_realm', 'maintain_church_alliance', 'costly_wars_and_crusades'],
      ascension_paths: {
        emperor_holy_roman: { requirements: { electoral_support: 4, enormous_wealth: true }, grants: 'emperor' }
      },
      nightmare_level: 'maximum'
    },

    pope: {
      tier: 11,
      id: 'pope',
      name: 'Pope',
      name_fr: 'Pape',
      description: 'Vicar of Christ. In 1403, the papacy is in crisis — there are actually three competing popes.',
      privileges: ['excommunicate_kings', 'call_crusades', 'theoretically_above_all_earthly_authority'],
      obligations: ['guard_doctrine', 'manage_ecclesiastical_empire'],
      special_note: 'Western Schism exists 1378-1417. Heinrich could exploit or resolve this.'
    },

    emperor: {
      tier: 12,
      id: 'emperor',
      name: 'Emperor',
      name_fr: 'Empereur',
      description: 'Heights no peasant has ever reached. The culmination of an extraordinary life.',
      privileges: ['theoretical_sovereignty_over_all_christian_princes'],
      nightmare_level: 'transcendent',
      achievement: 'FROM_SERF_TO_EMPEROR'
    }
  };

  // ─── SOCIAL RESISTANCE SYSTEM ─────────────────────────────────────────────

  /**
   * Calculate how much social resistance Heinrich faces when attempting
   * to rise above his current class.
   * 
   * The world resists: NPCs of higher status are skeptical, hostile, 
   * or actively obstructive to a man who is "above himself."
   */
  function getSocialResistance(currentClass, targetClass, context = {}) {
    const currentTier = CLASS_LADDER[currentClass]?.tier || 1;
    const targetTier = CLASS_LADDER[targetClass]?.tier || 1;
    const tierDifference = targetTier - currentTier;

    if (tierDifference <= 0) return { resistance: 0, description: 'No resistance — moving laterally or down.' };

    const baseResistance = tierDifference * 15;
    const resistanceModifiers = [];

    // Known background increases resistance
    if (context.birth_known && currentClass === 'serf') {
      resistanceModifiers.push({ label: 'Known Peasant Background', value: 20 });
    }

    // High reputation reduces resistance
    if (context.reputation_score > 70) {
      resistanceModifiers.push({ label: 'Strong Reputation', value: -15 });
    }

    // Noble sponsor reduces resistance
    if (context.has_noble_sponsor) {
      resistanceModifiers.push({ label: 'Noble Patronage', value: -20 });
    }

    // Extraordinary achievement reduces resistance
    if (context.heroic_achievement) {
      resistanceModifiers.push({ label: 'Exceptional Achievement', value: -25 });
    }

    const totalResistance = Math.max(0, baseResistance + resistanceModifiers.reduce((s, m) => s + m.value, 0));

    return {
      resistance: totalResistance,
      description: _getResistanceDescription(totalResistance),
      modifiers: resistanceModifiers
    };
  }

  function _getResistanceDescription(resistance) {
    if (resistance <= 10) return 'Minimal resistance. Your path is relatively clear.';
    if (resistance <= 25) return 'Some eyebrows raised. A few doors politely closed.';
    if (resistance <= 40) return 'Significant skepticism. You will need to prove yourself repeatedly.';
    if (resistance <= 60) return 'Strong opposition. Important people genuinely do not want this to happen.';
    return 'Massive resistance. The entire social order pushes back. You would need to be extraordinary.';
  }

  // ─── CLASS CHECKS ────────────────────────────────────────────────────────

  /**
   * Check if Heinrich meets ascension requirements for a given path.
   */
  function checkAscensionEligibility(currentClass, pathId, state) {
    const classDef = CLASS_LADDER[currentClass];
    if (!classDef) return { eligible: false, reason: 'Unknown class' };

    const path = classDef.ascension_paths?.[pathId];
    if (!path) return { eligible: false, reason: 'Unknown ascension path' };

    const requirements = path.requirements || {};
    const unmet = [];

    if (requirements.coin_livres) {
      const livres = state.inventory.coin.livres || 0;
      if (livres < requirements.coin_livres) {
        unmet.push(`Need ${requirements.coin_livres} livres (have ${livres})`);
      }
    }

    if (requirements.skills) {
      for (const [skill, level] of Object.entries(requirements.skills)) {
        const currentLevel = state.skills[skill]?.level || 0;
        if (currentLevel < level) {
          unmet.push(`Need ${skill} level ${level} (have ${currentLevel})`);
        }
      }
    }

    if (requirements.wealth_tier) {
      const wealthOrder = ['destitute', 'poor', 'struggling', 'comfortable', 'wealthy', 'rich', 'very_rich'];
      const currentIdx = wealthOrder.indexOf(state.inventory.wealth_tier);
      const reqIdx = wealthOrder.indexOf(requirements.wealth_tier);
      if (currentIdx < reqIdx) {
        unmet.push(`Need wealth tier: ${requirements.wealth_tier}`);
      }
    }

    return {
      eligible: unmet.length === 0,
      unmet_requirements: unmet,
      path_description: path.description || '',
      grants: path.grants
    };
  }

  /**
   * Perform class ascension — update state to new class.
   */
  function ascend(state, newClass) {
    const previousClass = state.heinrich.class;
    const newClassDef = CLASS_LADDER[newClass];
    if (!newClassDef) return { success: false, reason: 'Unknown class' };

    state.heinrich.class = newClass;
    state.heinrich.class_tier = newClassDef.tier;
    state.heinrich.class_privileges = [...(newClassDef.privileges || [])];
    state.heinrich.class_obligations = [...(newClassDef.obligations || [])];

    // Chronicle entry
    const entry = {
      turn: state.meta.turn,
      type: 'class_ascension',
      from: previousClass,
      to: newClass,
      description: `Rose from ${CLASS_LADDER[previousClass]?.name || previousClass} to ${newClassDef.name}`
    };
    state.chronicle.entries.push(entry);

    // Achievement
    if (previousClass === 'serf' && newClassDef.tier >= 6) {
      state.chronicle.achievements.push({ id: 'born_serf_now_knight', name: 'Born a Serf, Made a Knight', turn: state.meta.turn });
    }

    return { success: true, previous_class: previousClass, new_class: newClass, new_privileges: newClassDef.privileges };
  }

  /**
   * Get class privileges currently in effect.
   */
  function getClassPrivileges(heinrichClass) {
    return CLASS_LADDER[heinrichClass]?.privileges || [];
  }

  /**
   * Get social modifier when interacting with NPC of given class.
   */
  function getSocialClassModifier(heinrichClass, npcClass) {
    const hTier = CLASS_LADDER[heinrichClass]?.tier || 1;
    const nTier = CLASS_LADDER[npcClass]?.tier || 1;
    const diff = nTier - hTier;

    if (diff > 3) return { mod: -25, description: 'Vast social gulf — they barely see you as a person' };
    if (diff > 1) return { mod: -12, description: 'Clear social inferior — must prove worth' };
    if (diff === 1) return { mod: -5, description: 'Slight class disadvantage' };
    if (diff === 0) return { mod: 0, description: 'Social equals' };
    if (diff === -1) return { mod: 5, description: 'Speaking down to a social inferior — they are more deferential' };
    return { mod: 10, description: 'Significant social authority — they are deferential' };
  }

  /**
   * Get nightmare of power description for current class.
   */
  function getNightmaresOfPower(heinrichClass) {
    return CLASS_LADDER[heinrichClass]?.nightmares_of_power || [];
  }

  // ─── EXPORTS ─────────────────────────────────────────────────────────────

  return {
    CLASS_LADDER,
    getSocialResistance,
    checkAscensionEligibility,
    ascend,
    getClassPrivileges,
    getSocialClassModifier,
    getNightmaresOfPower
  };

})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ClassSystem };
}

// END FILE: client/js/engine/class-system.js
