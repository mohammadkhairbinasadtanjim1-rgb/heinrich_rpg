// FILE: client/js/data/class-ladder-data.js — PART 3
// Class ladder definitions for THE FATE OF HEINRICH
// 12 tiers from Serf to Emperor, with multiple paths per tier

export const CLASS_LADDER = {
  // ═══════════════════════════════════════════════════════════════
  // TIER 1: SERF (Starting class)
  // ═══════════════════════════════════════════════════════════════
  serf: {
    name: 'Serf',
    tier: 1,
    description: 'Bound to the land. The lowest rung of feudal society.',
    icon: '🌾',
    privileges: [],
    obligations: [
      'corvee_labor',      // Must work lord\'s land 3 days/week
      'grain_rent',        // Must give portion of harvest
      'cannot_leave_without_permission', // Tied to the land
      'cannot_own_weapons_without_permission',
      'must_use_lord_mill', // Pay to grind grain
      'must_use_lord_oven'  // Pay to bake bread
    ],
    failure_conditions: [
      'Caught fleeing the manor',
      'Refusing corvee labor',
      'Hiding grain from lord'
    ],
    advancement_paths: {
      free_peasant: {
        name: 'Free Peasant',
        requirements: {
          description: 'Earn enough to buy freedom, or flee to a city for a year and a day',
          options: [
            { method: 'purchase_freedom', cost: { livres: 5 }, description: 'Buy your freedom from your lord' },
            { method: 'city_escape', turns: 365, description: 'Flee to a city and remain uncaught for a year and a day' },
            { method: 'military_service', description: 'Serve in a lord\'s army and be granted freedom' }
          ]
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 2: FREE PEASANT
  // ═══════════════════════════════════════════════════════════════
  free_peasant: {
    name: 'Free Peasant',
    tier: 2,
    description: 'Free from serfdom. Can own property, move freely, and pursue a trade.',
    icon: '🏡',
    privileges: [
      'can_own_property',
      'can_move_freely',
      'can_pursue_trade',
      'can_own_weapons',
      'can_testify_in_court'
    ],
    obligations: [
      'pay_taxes',
      'military_levy_when_called'
    ],
    failure_conditions: [
      'Convicted of serious crime',
      'Debt slavery'
    ],
    advancement_paths: {
      craftsman: {
        name: 'Craftsman',
        requirements: {
          skills: { smithing: 3, carpentry: 3, OR: true },
          description: 'Master a craft and join a guild'
        }
      },
      soldier: {
        name: 'Soldier',
        requirements: {
          skills: { brawling: 4, OR: { sword: 2, axe: 3, archery: 3 } },
          description: 'Enlist in a lord\'s army'
        }
      },
      merchant: {
        name: 'Merchant',
        requirements: {
          coin: { livres: 2 },
          skills: { haggle: 3 },
          description: 'Accumulate capital and begin trading'
        }
      },
      monk: {
        name: 'Novice Monk',
        requirements: {
          skills: { theology: 2, reading: 1 },
          description: 'Enter a monastery'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 3: CRAFTSMAN / SOLDIER / MERCHANT / NOVICE MONK
  // ═══════════════════════════════════════════════════════════════
  craftsman: {
    name: 'Craftsman',
    tier: 3,
    description: 'A skilled artisan with guild membership. Respected in the community.',
    icon: '⚒️',
    privileges: [
      'guild_membership',
      'can_take_apprentices',
      'guild_legal_protection',
      'can_own_workshop',
      'respected_in_community'
    ],
    obligations: [
      'guild_dues',
      'guild_regulations',
      'quality_standards'
    ],
    failure_conditions: [
      'Expelled from guild',
      'Producing substandard work',
      'Undercutting guild prices'
    ],
    advancement_paths: {
      master_craftsman: {
        name: 'Master Craftsman',
        requirements: {
          skills: { smithing: 6, OR: { carpentry: 6, medicine: 5 } },
          reputation: { craftsmen: 50 },
          description: 'Achieve master status in your guild'
        }
      },
      merchant: {
        name: 'Merchant',
        requirements: {
          coin: { livres: 5 },
          skills: { haggle: 4 },
          description: 'Transition from making to trading'
        }
      }
    }
  },

  soldier: {
    name: 'Soldier',
    tier: 3,
    description: 'A professional fighter in service to a lord. Respected, dangerous, and mobile.',
    icon: '⚔️',
    privileges: [
      'can_carry_weapons_openly',
      'military_pay',
      'lord_protection',
      'access_to_military_equipment',
      'can_travel_with_army'
    ],
    obligations: [
      'military_service',
      'obey_officers',
      'maintain_equipment'
    ],
    failure_conditions: [
      'Desertion',
      'Insubordination',
      'Cowardice in battle'
    ],
    advancement_paths: {
      sergeant: {
        name: 'Sergeant',
        requirements: {
          skills: { command: 3, brawling: 5, OR: { sword: 4, axe: 4 } },
          reputation: { military: 40 },
          description: 'Prove yourself in battle and earn command of a squad'
        }
      },
      mercenary: {
        name: 'Mercenary',
        requirements: {
          skills: { brawling: 5, OR: { sword: 4, axe: 4 } },
          description: 'Sell your sword to the highest bidder'
        }
      }
    }
  },

  merchant: {
    name: 'Merchant',
    tier: 3,
    description: 'A trader who buys and sells goods for profit. Wealth is power.',
    icon: '💰',
    privileges: [
      'can_travel_freely',
      'access_to_markets',
      'can_extend_credit',
      'merchant_guild_access',
      'can_hire_guards'
    ],
    obligations: [
      'market_taxes',
      'guild_dues_if_member',
      'honest_weights_and_measures'
    ],
    failure_conditions: [
      'Bankruptcy',
      'Convicted of fraud',
      'Expelled from merchant guild'
    ],
    advancement_paths: {
      wealthy_merchant: {
        name: 'Wealthy Merchant',
        requirements: {
          coin: { livres: 50 },
          skills: { haggle: 5, stewardship: 3 },
          description: 'Accumulate significant wealth and trading connections'
        }
      },
      guild_master: {
        name: 'Guild Master',
        requirements: {
          coin: { livres: 30 },
          skills: { haggle: 5, speech: 4, stewardship: 4 },
          reputation: { merchants: 60 },
          description: 'Rise to lead a merchant guild'
        }
      }
    }
  },

  novice_monk: {
    name: 'Novice Monk',
    tier: 3,
    description: 'A religious novice in training. Access to Church education and protection.',
    icon: '✝️',
    privileges: [
      'church_protection',
      'access_to_library',
      'free_food_and_shelter',
      'education',
      'cannot_be_tried_in_secular_court'
    ],
    obligations: [
      'religious_vows',
      'obey_abbot',
      'daily_prayers',
      'manual_labor'
    ],
    failure_conditions: [
      'Breaking vows',
      'Expelled from monastery',
      'Heresy'
    ],
    advancement_paths: {
      monk: {
        name: 'Monk',
        requirements: {
          skills: { theology: 3, reading: 2 },
          turns: 365,
          description: 'Complete novitiate and take full vows'
        }
      },
      parish_priest: {
        name: 'Parish Priest',
        requirements: {
          skills: { theology: 3, speech: 3, reading: 2 },
          description: 'Be ordained as a priest'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 4: MASTER CRAFTSMAN / SERGEANT / WEALTHY MERCHANT / MONK
  // ═══════════════════════════════════════════════════════════════
  master_craftsman: {
    name: 'Master Craftsman',
    tier: 4,
    description: 'A recognized master of your craft. Wealthy, respected, and influential.',
    icon: '🏆',
    privileges: [
      'guild_master_candidate',
      'can_train_journeymen',
      'premium_prices',
      'noble_commissions',
      'civic_voice'
    ],
    obligations: [
      'guild_leadership_duties',
      'quality_standards',
      'train_apprentices'
    ],
    failure_conditions: [
      'Masterwork failure',
      'Guild expulsion'
    ],
    advancement_paths: {
      guild_master: {
        name: 'Guild Master',
        requirements: {
          skills: { stewardship: 4, speech: 4 },
          reputation: { craftsmen: 70 },
          description: 'Lead your guild'
        }
      },
      royal_craftsman: {
        name: 'Royal Craftsman',
        requirements: {
          skills: { smithing: 8, OR: { carpentry: 8 } },
          reputation: { nobles: 40 },
          description: 'Earn a royal commission and appointment'
        }
      }
    }
  },

  sergeant: {
    name: 'Sergeant',
    tier: 4,
    description: 'A veteran soldier with command authority. Respected by troops and officers.',
    icon: '🎖️',
    privileges: [
      'command_squad',
      'higher_pay',
      'better_equipment',
      'officer_access',
      'military_justice_rights'
    ],
    obligations: [
      'responsible_for_squad',
      'maintain_discipline',
      'lead_from_front'
    ],
    failure_conditions: [
      'Squad failure',
      'Cowardice',
      'Insubordination'
    ],
    advancement_paths: {
      captain: {
        name: 'Captain',
        requirements: {
          skills: { command: 5, tactics: 3 },
          reputation: { military: 60 },
          description: 'Earn command of a company'
        }
      },
      knight_errant: {
        name: 'Knight Errant',
        requirements: {
          skills: { sword: 5, horsemanship: 4, etiquette: 2 },
          equipment: ['horse', 'sword'],
          description: 'Earn knighthood through deeds of valor'
        }
      }
    }
  },

  wealthy_merchant: {
    name: 'Wealthy Merchant',
    tier: 4,
    description: 'A prosperous trader with significant capital and connections.',
    icon: '💎',
    privileges: [
      'access_to_noble_markets',
      'can_lend_money',
      'political_influence',
      'can_buy_minor_titles',
      'respected_by_nobles'
    ],
    obligations: [
      'substantial_taxes',
      'guild_leadership_duties'
    ],
    failure_conditions: [
      'Major financial loss',
      'Fraud conviction'
    ],
    advancement_paths: {
      guild_master: {
        name: 'Guild Master',
        requirements: {
          coin: { livres: 100 },
          skills: { haggle: 6, stewardship: 5, speech: 5 },
          reputation: { merchants: 70 },
          description: 'Lead the merchant guild'
        }
      },
      minor_noble: {
        name: 'Minor Noble',
        requirements: {
          coin: { livres: 200 },
          description: 'Purchase a minor title or estate'
        }
      }
    }
  },

  monk: {
    name: 'Monk',
    tier: 4,
    description: 'A full member of a religious order. Scholar, healer, and man of God.',
    icon: '📿',
    privileges: [
      'church_legal_immunity',
      'access_to_all_church_libraries',
      'church_hospitality_network',
      'can_perform_sacraments',
      'respected_everywhere'
    ],
    obligations: [
      'full_religious_vows',
      'obey_abbot',
      'daily_office',
      'poverty_vow'
    ],
    failure_conditions: [
      'Breaking major vows',
      'Heresy',
      'Excommunication'
    ],
    advancement_paths: {
      prior: {
        name: 'Prior',
        requirements: {
          skills: { theology: 5, stewardship: 3, command: 3 },
          reputation: { church: 60 },
          description: 'Rise to lead a priory'
        }
      },
      scholar: {
        name: 'Scholar',
        requirements: {
          skills: { theology: 5, reading: 5, history: 3 },
          description: 'Become a recognized Church scholar'
        }
      }
    }
  },

  parish_priest: {
    name: 'Parish Priest',
    tier: 4,
    description: 'A priest serving a local community. Confessor, counselor, and spiritual guide.',
    icon: '⛪',
    privileges: [
      'church_legal_immunity',
      'parish_income',
      'community_respect',
      'can_perform_all_sacraments',
      'access_to_church_network'
    ],
    obligations: [
      'serve_parish',
      'celibacy',
      'obey_bishop',
      'perform_sacraments'
    ],
    failure_conditions: [
      'Heresy',
      'Scandal',
      'Excommunication'
    ],
    advancement_paths: {
      canon: {
        name: 'Canon',
        requirements: {
          skills: { theology: 5, etiquette: 3 },
          reputation: { church: 60 },
          description: 'Join a cathedral chapter'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 5: CAPTAIN / KNIGHT ERRANT / GUILD MASTER / PRIOR
  // ═══════════════════════════════════════════════════════════════
  captain: {
    name: 'Captain',
    tier: 5,
    description: 'Commander of a company of soldiers. A man of war and authority.',
    icon: '🎯',
    privileges: [
      'command_company',
      'officer_pay',
      'noble_access',
      'can_recruit_soldiers',
      'military_honors'
    ],
    obligations: [
      'responsible_for_company',
      'serve_lord',
      'maintain_discipline'
    ],
    failure_conditions: [
      'Major military defeat',
      'Mutiny',
      'Desertion'
    ],
    advancement_paths: {
      knight: {
        name: 'Knight',
        requirements: {
          skills: { sword: 6, horsemanship: 5, etiquette: 3, command: 5 },
          reputation: { military: 70, nobles: 40 },
          description: 'Be formally knighted by a lord'
        }
      },
      mercenary_captain: {
        name: 'Mercenary Captain',
        requirements: {
          skills: { command: 5, tactics: 4 },
          description: 'Lead your own mercenary company'
        }
      }
    }
  },

  knight_errant: {
    name: 'Knight Errant',
    tier: 5,
    description: 'A wandering knight seeking glory and fortune. Free but without land.',
    icon: '🏇',
    privileges: [
      'noble_status',
      'can_bear_arms_freely',
      'tournament_access',
      'noble_hospitality',
      'can_challenge_to_duel'
    ],
    obligations: [
      'chivalric_code',
      'cannot_refuse_honorable_challenge',
      'must_protect_weak'
    ],
    failure_conditions: [
      'Dishonor',
      'Cowardice',
      'Breaking chivalric code'
    ],
    advancement_paths: {
      knight: {
        name: 'Knight',
        requirements: {
          skills: { sword: 6, horsemanship: 5, etiquette: 4 },
          reputation: { nobles: 50 },
          description: 'Earn a fief and become a landed knight'
        }
      }
    }
  },

  guild_master: {
    name: 'Guild Master',
    tier: 5,
    description: 'Leader of a merchant or craft guild. Economic power and civic influence.',
    icon: '🏛️',
    privileges: [
      'control_guild_prices',
      'civic_council_seat',
      'noble_access',
      'can_grant_guild_membership',
      'significant_political_influence'
    ],
    obligations: [
      'guild_leadership',
      'civic_duties',
      'maintain_guild_standards'
    ],
    failure_conditions: [
      'Guild collapse',
      'Corruption scandal',
      'Removed by guild members'
    ],
    advancement_paths: {
      merchant_prince: {
        name: 'Merchant Prince',
        requirements: {
          coin: { livres: 500 },
          skills: { haggle: 7, stewardship: 6, speech: 6 },
          reputation: { merchants: 80, nobles: 50 },
          description: 'Achieve extraordinary wealth and influence'
        }
      },
      minor_noble: {
        name: 'Minor Noble',
        requirements: {
          coin: { livres: 300 },
          description: 'Purchase nobility'
        }
      }
    }
  },

  prior: {
    name: 'Prior',
    tier: 5,
    description: 'Head of a priory. Significant religious authority and resources.',
    icon: '🕍',
    privileges: [
      'lead_priory',
      'control_priory_resources',
      'bishop_access',
      'can_grant_church_sanctuary',
      'significant_religious_authority'
    ],
    obligations: [
      'manage_priory',
      'obey_abbot_or_bishop',
      'maintain_religious_standards'
    ],
    failure_conditions: [
      'Priory scandal',
      'Heresy',
      'Removed by bishop'
    ],
    advancement_paths: {
      abbot: {
        name: 'Abbot',
        requirements: {
          skills: { theology: 6, stewardship: 5, command: 4 },
          reputation: { church: 70 },
          description: 'Lead an abbey'
        }
      },
      bishop: {
        name: 'Bishop',
        requirements: {
          skills: { theology: 7, etiquette: 5, speech: 5 },
          reputation: { church: 80, nobles: 50 },
          description: 'Be appointed to a bishopric'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 6: KNIGHT / MERCENARY CAPTAIN / MERCHANT PRINCE / ABBOT
  // ═══════════════════════════════════════════════════════════════
  knight: {
    name: 'Knight',
    tier: 6,
    description: 'A landed knight with a fief. Noble status, military power, and feudal obligations.',
    icon: '⚔️',
    privileges: [
      'noble_status',
      'fief_income',
      'can_hold_court',
      'can_knight_others',
      'tournament_champion_rights',
      'can_bear_coat_of_arms'
    ],
    obligations: [
      'military_service_to_liege',
      'protect_peasants',
      'maintain_fief',
      'chivalric_code'
    ],
    failure_conditions: [
      'Dishonor',
      'Losing fief',
      'Excommunication'
    ],
    advancement_paths: {
      baron: {
        name: 'Baron',
        requirements: {
          skills: { command: 6, etiquette: 5, stewardship: 5 },
          reputation: { nobles: 60 },
          properties: 3,
          description: 'Accumulate enough land and vassals to be recognized as a baron'
        }
      },
      household_knight: {
        name: 'Household Knight',
        requirements: {
          reputation: { nobles: 70 },
          description: 'Become a trusted member of a great lord\'s household'
        }
      }
    }
  },

  mercenary_captain: {
    name: 'Mercenary Captain',
    tier: 6,
    description: 'Leader of a mercenary company. Feared, wealthy, and politically useful.',
    icon: '💀',
    privileges: [
      'command_mercenary_company',
      'negotiate_contracts',
      'feared_reputation',
      'access_to_all_sides',
      'significant_military_power'
    ],
    obligations: [
      'pay_troops',
      'honor_contracts',
      'maintain_company_reputation'
    ],
    failure_conditions: [
      'Company mutiny',
      'Contract breach',
      'Major defeat'
    ],
    advancement_paths: {
      condottiere: {
        name: 'Condottiere',
        requirements: {
          skills: { command: 7, tactics: 5 },
          army_size: 500,
          reputation: { military: 80 },
          description: 'Lead a major mercenary force'
        }
      }
    }
  },

  merchant_prince: {
    name: 'Merchant Prince',
    tier: 6,
    description: 'An extraordinarily wealthy merchant with quasi-noble status.',
    icon: '👑',
    privileges: [
      'quasi_noble_status',
      'control_trade_routes',
      'can_lend_to_kings',
      'political_power_through_wealth',
      'can_buy_titles'
    ],
    obligations: [
      'maintain_trade_empire',
      'political_obligations'
    ],
    failure_conditions: [
      'Financial ruin',
      'Political enemies destroy you'
    ],
    advancement_paths: {
      minor_noble: {
        name: 'Minor Noble',
        requirements: {
          coin: { livres: 1000 },
          description: 'Purchase a title of nobility'
        }
      }
    }
  },

  abbot: {
    name: 'Abbot',
    tier: 6,
    description: 'Head of an abbey. Significant religious, economic, and political power.',
    icon: '⛪',
    privileges: [
      'lead_abbey',
      'control_abbey_lands',
      'bishop_peer',
      'can_excommunicate_locally',
      'significant_political_influence'
    ],
    obligations: [
      'manage_abbey',
      'obey_bishop',
      'maintain_religious_standards'
    ],
    failure_conditions: [
      'Abbey scandal',
      'Heresy',
      'Removed by bishop'
    ],
    advancement_paths: {
      bishop: {
        name: 'Bishop',
        requirements: {
          skills: { theology: 7, etiquette: 5, speech: 5 },
          reputation: { church: 80 },
          description: 'Be appointed to a bishopric'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 7: BARON / CONDOTTIERE / BISHOP
  // ═══════════════════════════════════════════════════════════════
  baron: {
    name: 'Baron',
    tier: 7,
    description: 'A minor noble lord with significant land and vassals.',
    icon: '🏰',
    privileges: [
      'hold_barony',
      'hold_court',
      'low_justice',
      'collect_taxes',
      'raise_levy',
      'can_grant_knighthood'
    ],
    obligations: [
      'military_service_to_count',
      'maintain_order',
      'protect_subjects'
    ],
    failure_conditions: [
      'Rebellion',
      'Losing barony',
      'Attainder'
    ],
    advancement_paths: {
      count: {
        name: 'Count',
        requirements: {
          skills: { command: 7, stewardship: 6, etiquette: 6 },
          reputation: { nobles: 70 },
          properties: 5,
          description: 'Accumulate enough power to be recognized as a count'
        }
      }
    }
  },

  condottiere: {
    name: 'Condottiere',
    tier: 7,
    description: 'A major mercenary lord. Kings pay for your services.',
    icon: '⚔️',
    privileges: [
      'command_major_army',
      'negotiate_with_kings',
      'quasi_noble_status',
      'feared_across_europe',
      'can_hold_territory'
    ],
    obligations: [
      'pay_large_army',
      'honor_contracts'
    ],
    failure_conditions: [
      'Army destroyed',
      'Betrayal by employer'
    ],
    advancement_paths: {
      warlord: {
        name: 'Warlord',
        requirements: {
          skills: { command: 8, tactics: 6 },
          army_size: 2000,
          description: 'Carve out your own territory by force'
        }
      }
    }
  },

  bishop: {
    name: 'Bishop',
    tier: 7,
    description: 'A prince of the Church. Spiritual and temporal power combined.',
    icon: '✝️',
    privileges: [
      'lead_diocese',
      'high_justice_in_church_courts',
      'control_church_lands',
      'can_excommunicate',
      'peer_of_realm',
      'access_to_pope'
    ],
    obligations: [
      'manage_diocese',
      'obey_archbishop',
      'maintain_church_standards'
    ],
    failure_conditions: [
      'Heresy',
      'Scandal',
      'Removed by pope'
    ],
    advancement_paths: {
      archbishop: {
        name: 'Archbishop',
        requirements: {
          skills: { theology: 8, etiquette: 6, speech: 6 },
          reputation: { church: 90 },
          description: 'Be appointed to an archbishopric'
        }
      },
      cardinal: {
        name: 'Cardinal',
        requirements: {
          skills: { theology: 8, etiquette: 7, papal_politics: 5 },
          reputation: { church: 90, pope: 60 },
          description: 'Be elevated to the College of Cardinals'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 8: COUNT / WARLORD / ARCHBISHOP
  // ═══════════════════════════════════════════════════════════════
  count: {
    name: 'Count',
    tier: 8,
    description: 'A powerful noble lord controlling a county.',
    icon: '🏯',
    privileges: [
      'hold_county',
      'high_justice',
      'raise_significant_army',
      'peer_of_realm',
      'can_grant_baronies'
    ],
    obligations: [
      'military_service_to_duke',
      'maintain_order_in_county'
    ],
    failure_conditions: [
      'Rebellion',
      'Attainder',
      'Military defeat'
    ],
    advancement_paths: {
      duke: {
        name: 'Duke',
        requirements: {
          skills: { command: 8, stewardship: 7, etiquette: 7 },
          reputation: { nobles: 80 },
          properties: 8,
          description: 'Accumulate enough power to be recognized as a duke'
        }
      }
    }
  },

  warlord: {
    name: 'Warlord',
    tier: 8,
    description: 'A military lord who holds territory by force of arms.',
    icon: '⚔️',
    privileges: [
      'hold_territory',
      'command_large_army',
      'feared_by_all',
      'can_negotiate_with_kings'
    ],
    obligations: [
      'maintain_army',
      'defend_territory'
    ],
    failure_conditions: [
      'Military defeat',
      'Army mutiny'
    ],
    advancement_paths: {
      duke: {
        name: 'Duke',
        requirements: {
          skills: { command: 9, tactics: 7 },
          description: 'Legitimize your power through political means'
        }
      }
    }
  },

  archbishop: {
    name: 'Archbishop',
    tier: 8,
    description: 'Head of a church province. One of the most powerful men in Christendom.',
    icon: '⛪',
    privileges: [
      'lead_church_province',
      'crown_kings',
      'control_vast_church_lands',
      'can_call_councils',
      'peer_of_realm'
    ],
    obligations: [
      'manage_province',
      'obey_pope'
    ],
    failure_conditions: [
      'Heresy',
      'Removed by pope'
    ],
    advancement_paths: {
      cardinal: {
        name: 'Cardinal',
        requirements: {
          skills: { theology: 9, etiquette: 7 },
          reputation: { church: 95, pope: 70 },
          description: 'Be elevated to the College of Cardinals'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 9: DUKE / CARDINAL
  // ═══════════════════════════════════════════════════════════════
  duke: {
    name: 'Duke',
    tier: 9,
    description: 'One of the most powerful nobles in the realm. Near-royal status.',
    icon: '👑',
    privileges: [
      'hold_duchy',
      'near_royal_status',
      'can_raise_large_army',
      'can_grant_counties',
      'peer_of_realm',
      'can_challenge_king'
    ],
    obligations: [
      'military_service_to_king',
      'maintain_duchy'
    ],
    failure_conditions: [
      'Rebellion',
      'Attainder',
      'Military defeat by king'
    ],
    advancement_paths: {
      king: {
        name: 'King',
        requirements: {
          skills: { command: 9, etiquette: 8, stewardship: 8 },
          reputation: { nobles: 90 },
          description: 'Claim a crown through inheritance, conquest, or election'
        }
      }
    }
  },

  cardinal: {
    name: 'Cardinal',
    tier: 9,
    description: 'A prince of the Church. Elects the Pope. One of the most powerful men in Christendom.',
    icon: '✝️',
    privileges: [
      'elect_pope',
      'papal_legate_authority',
      'control_vast_resources',
      'diplomatic_immunity',
      'can_crown_kings'
    ],
    obligations: [
      'serve_pope',
      'maintain_church_standards'
    ],
    failure_conditions: [
      'Heresy',
      'Removed by pope'
    ],
    advancement_paths: {
      pope: {
        name: 'Pope',
        requirements: {
          skills: { theology: 10, etiquette: 9, speech: 8 },
          reputation: { church: 99, cardinals: 50 },
          description: 'Be elected Pope by the College of Cardinals'
        }
      }
    }
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 10: KING / POPE
  // ═══════════════════════════════════════════════════════════════
  king: {
    name: 'King',
    tier: 10,
    description: 'Ruler of a kingdom. The pinnacle of secular power.',
    icon: '👑',
    privileges: [
      'rule_kingdom',
      'high_justice_over_all',
      'command_national_army',
      'can_grant_all_titles',
      'diplomatic_recognition',
      'can_declare_war'
    ],
    obligations: [
      'protect_realm',
      'maintain_justice',
      'defend_church'
    ],
    failure_conditions: [
      'Deposition',
      'Conquest',
      'Excommunication'
    ],
    advancement_paths: {
      emperor: {
        name: 'Emperor',
        requirements: {
          skills: { command: 10, etiquette: 9, stewardship: 9 },
          reputation: { nobles: 95 },
          kingdoms: 2,
          description: 'Rule multiple kingdoms or be crowned Emperor'
        }
      }
    }
  },

  pope: {
    name: 'Pope',
    tier: 10,
    description: 'Vicar of Christ. Supreme head of the Catholic Church.',
    icon: '✝️',
    privileges: [
      'supreme_church_authority',
      'can_excommunicate_kings',
      'can_call_crusades',
      'control_vast_church_wealth',
      'diplomatic_recognition_by_all',
      'can_crown_emperors'
    ],
    obligations: [
      'lead_church',
      'maintain_faith'
    ],
    failure_conditions: [
      'Schism',
      'Deposition by council'
    ],
    advancement_paths: {}
  },

  // ═══════════════════════════════════════════════════════════════
  // TIER 11: EMPEROR
  // ═══════════════════════════════════════════════════════════════
  emperor: {
    name: 'Emperor',
    tier: 11,
    description: 'Ruler of an empire. The highest secular title in Christendom.',
    icon: '🏛️',
    privileges: [
      'rule_empire',
      'supreme_secular_authority',
      'can_grant_kingdoms',
      'peer_of_pope',
      'command_vast_armies'
    ],
    obligations: [
      'protect_christendom',
      'maintain_empire'
    ],
    failure_conditions: [
      'Empire collapse',
      'Deposition'
    ],
    advancement_paths: {}
  }
};

// Social class resistance to advancement
// The higher you climb, the more the system resists
export const CLASS_RESISTANCE = {
  serf_to_free_peasant: 10,
  free_peasant_to_tier3: 20,
  tier3_to_tier4: 30,
  tier4_to_tier5: 40,
  tier5_to_tier6: 55,
  tier6_to_tier7: 65,
  tier7_to_tier8: 75,
  tier8_to_tier9: 85,
  tier9_to_tier10: 92,
  tier10_to_tier11: 97
};

// Nightmare of Power: problems that scale with status
export const NIGHTMARE_OF_POWER = {
  serf: ['Starvation', 'Lord\'s cruelty', 'Disease', 'Bandit raids'],
  free_peasant: ['Taxes', 'Crop failure', 'Debt', 'Conscription'],
  craftsman: ['Guild politics', 'Competition', 'Apprentice problems', 'Supply shortages'],
  soldier: ['Battle wounds', 'Unpaid wages', 'Desertion of comrades', 'Enemy capture'],
  merchant: ['Market crashes', 'Robbery', 'Fraud by partners', 'Political interference'],
  knight: ['Feudal obligations', 'Tournament injuries', 'Rival knights', 'Peasant revolts'],
  baron: ['Vassal rebellions', 'Neighboring lords', 'Royal demands', 'Succession crises'],
  count: ['Duke\'s demands', 'Internal politics', 'Assassination attempts', 'War'],
  duke: ['Royal jealousy', 'Rival dukes', 'Succession wars', 'Papal interference'],
  king: ['Noble rebellions', 'Foreign invasion', 'Succession crises', 'Papal excommunication'],
  emperor: ['Everything, everywhere, all at once']
};

export default CLASS_LADDER;
// END FILE: client/js/data/class-ladder-data.js
