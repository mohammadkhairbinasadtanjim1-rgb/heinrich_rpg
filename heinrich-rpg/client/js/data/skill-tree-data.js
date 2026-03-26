// FILE: client/js/data/skill-tree-data.js — PART 3
// Complete skill tree definition for THE FATE OF HEINRICH

export const SKILL_TREE_DATA = {
  // ═══════════════════════════════════════════════════════════════
  // COMBAT SKILLS
  // ═══════════════════════════════════════════════════════════════
  categories: {
    combat: {
      name: 'Combat',
      icon: '⚔️',
      skills: ['brawling', 'sword', 'dagger', 'axe', 'archery', 'polearms', 'shield', 'unarmed']
    },
    physical: {
      name: 'Physical',
      icon: '💪',
      skills: ['strength', 'agility', 'endurance', 'swimming', 'climbing']
    },
    social: {
      name: 'Social',
      icon: '💬',
      skills: ['speech', 'deception', 'intimidation', 'haggle', 'etiquette', 'command', 'seduction', 'read_people', 'performance']
    },
    craft: {
      name: 'Craft & Trade',
      icon: '🔨',
      skills: ['stewardship', 'smithing', 'carpentry', 'agriculture', 'hunting', 'medicine', 'cooking', 'engineering']
    },
    knowledge: {
      name: 'Knowledge',
      icon: '📚',
      skills: ['reading', 'law', 'heraldry', 'theology', 'history', 'tactics', 'languages']
    },
    covert: {
      name: 'Covert',
      icon: '🕵️',
      skills: ['stealth', 'lockpicking', 'pickpocket', 'forgery_skill', 'espionage']
    },
    travel: {
      name: 'Travel & Exploration',
      icon: '🗺️',
      skills: ['horsemanship', 'navigation', 'seamanship', 'survival']
    }
  },

  skills: {
    // ─────────────────────────────────────────────────────────────
    // COMBAT
    // ─────────────────────────────────────────────────────────────
    brawling: {
      name: 'Brawling',
      description: 'Fighting with fists, elbows, knees, and improvised strikes. The art of the common man\'s violence.',
      icon: '👊',
      category: 'combat',
      starting_level: 4,
      passives: {
        3: { name: 'Iron Knuckles', description: 'Unarmed strikes deal +2 damage. Hands count as weapons.' },
        6: { name: 'Street Fighter', description: 'In taverns and crowds, gain +10 to all brawling checks. Improvised weapons cost no penalty.' },
        10: { name: 'Brawler\'s Legend', description: 'Reputation as a fighter precedes you. Enemies hesitate. +15 to intimidation when your brawling reputation is known.' }
      },
      branches: {
        grappling: {
          name: 'Grappling',
          description: 'Holds, throws, joint locks, and wrestling techniques.',
          unlock_requirement: 'brawling >= 3',
          passives: {
            3: { name: 'Iron Grip', description: 'Grappled targets cannot break free without a strength check.' },
            6: { name: 'Submission Artist', description: 'Can force surrender through pain compliance. Enemies yield rather than die.' },
            10: { name: 'Unbreakable Hold', description: 'Once grappled, target cannot escape without outside help.' }
          }
        },
        dirty_fighting: {
          name: 'Dirty Fighting',
          description: 'Eye gouges, groin kicks, biting, sand throwing. No honor, maximum effectiveness.',
          unlock_requirement: 'brawling >= 4',
          passives: {
            3: { name: 'No Rules', description: 'Dirty tricks cause stun effects. Opponents lose their next action.' },
            6: { name: 'Crippling Strike', description: 'Targeted dirty attacks can permanently injure limbs.' },
            10: { name: 'Death Touch', description: 'Precise strikes to vulnerable points. Can kill silently with bare hands.' }
          }
        },
        pit_fighting: {
          name: 'Pit Fighting',
          description: 'Crowd performance, showmanship, and the psychology of arena combat.',
          unlock_requirement: 'brawling >= 5',
          passives: {
            3: { name: 'Crowd Pleaser', description: 'Fighting before crowds generates income and reputation.' },
            6: { name: 'Arena Veteran', description: 'Psychological advantage against opponents who fear your reputation.' },
            10: { name: 'Champion', description: 'Legendary pit fighter status. Nobles pay to watch. Criminals fear you.' }
          }
        }
      }
    },

    sword: {
      name: 'Sword',
      description: 'The weapon of knights and gentlemen. Mastery of the blade in all its forms.',
      icon: '🗡️',
      category: 'combat',
      starting_level: 0,
      passives: {
        3: { name: 'Blade Sense', description: 'Can parry attacks that would otherwise be impossible. +5 to defense.' },
        6: { name: 'Swordsman\'s Eye', description: 'Read opponent\'s stance and predict their next move. +10 to all sword checks.' },
        10: { name: 'Master of the Blade', description: 'Legendary swordsmanship. Can disarm, wound specific body parts, or kill with surgical precision.' }
      },
      branches: {
        longsword: {
          name: 'Longsword',
          description: 'The knightly weapon. Two-handed power and reach.',
          unlock_requirement: 'sword >= 3',
          passives: {
            3: { name: 'Half-Swording', description: 'Can grip the blade for close-quarters leverage. Effective against armor.' },
            6: { name: 'Mordhau', description: 'Pommel strikes and blade-gripping techniques for armored opponents.' },
            10: { name: 'Knight\'s Mastery', description: 'Complete longsword mastery. Effective against any opponent, armored or not.' }
          }
        },
        dual_wield: {
          name: 'Dual Wield',
          description: 'Fighting with two blades simultaneously.',
          unlock_requirement: 'sword >= 4 AND agility >= 4',
          passives: {
            3: { name: 'Off-Hand Proficiency', description: 'No penalty for off-hand attacks.' },
            6: { name: 'Blade Dance', description: 'Constant motion makes you harder to hit. +10 to dodge.' },
            10: { name: 'Twin Blades', description: 'Two simultaneous attacks per round. Opponents cannot defend against both.' }
          }
        },
        mounted_swordplay: {
          name: 'Mounted Swordplay',
          description: 'Fighting from horseback with a sword.',
          unlock_requirement: 'sword >= 4 AND horsemanship >= 4',
          passives: {
            3: { name: 'Cavalry Strike', description: 'Mounted attacks gain momentum bonus.' },
            6: { name: 'Warhorse Bond', description: 'Horse and rider fight as one unit.' },
            10: { name: 'Knight Errant', description: 'Devastating mounted combat. Can cut through infantry formations.' }
          }
        }
      }
    },

    dagger: {
      name: 'Dagger',
      description: 'The hidden blade. Close quarters, concealment, and the art of the killing stroke.',
      icon: '🔪',
      category: 'combat',
      starting_level: 0,
      passives: {
        3: { name: 'Quick Draw', description: 'Can draw and strike in a single motion. No action cost to draw.' },
        6: { name: 'Vital Points', description: 'Know exactly where to strike for maximum damage. Ignores light armor.' },
        10: { name: 'Shadow Blade', description: 'Dagger attacks are nearly silent. Can kill without alerting nearby people.' }
      },
      branches: {
        assassination: {
          name: 'Assassination',
          description: 'The art of killing silently and without trace.',
          unlock_requirement: 'dagger >= 4 AND stealth >= 3',
          passives: {
            3: { name: 'Clean Kill', description: 'Assassination attempts leave minimal evidence.' },
            6: { name: 'Poison Craft', description: 'Can apply poisons to blades. Know which poisons leave no trace.' },
            10: { name: 'Ghost', description: 'Perfect assassination. No witnesses, no evidence, no suspicion.' }
          }
        },
        dagger_parry: {
          name: 'Dagger Parry',
          description: 'Using a dagger defensively to catch and redirect larger weapons.',
          unlock_requirement: 'dagger >= 3',
          passives: {
            3: { name: 'Blade Catch', description: 'Can parry sword attacks with a dagger.' },
            6: { name: 'Counter Strike', description: 'Successful parry immediately enables a counter-attack.' },
            10: { name: 'Untouchable', description: 'Dagger parry mastery. Can defend against multiple attackers.' }
          }
        }
      }
    },

    axe: {
      name: 'Axe',
      description: 'The woodcutter\'s tool made weapon. Brutal, powerful, and effective against armor.',
      icon: '🪓',
      category: 'combat',
      starting_level: 2,
      passives: {
        3: { name: 'Chopping Power', description: 'Axe attacks deal +3 damage. Effective against shields.' },
        6: { name: 'Armor Cleaver', description: 'Axe attacks ignore 2 points of armor. Can damage shields permanently.' },
        10: { name: 'Berserker\'s Axe', description: 'In rage, axe attacks become devastating. +20 damage, ignore all armor.' }
      },
      branches: {
        shield_breaker: {
          name: 'Shield Breaker',
          description: 'Techniques specifically designed to destroy enemy shields.',
          unlock_requirement: 'axe >= 3',
          passives: {
            3: { name: 'Shield Splitter', description: 'Targeted attacks can crack and break shields.' },
            6: { name: 'Disarm', description: 'Can knock weapons from hands with axe strikes.' },
            10: { name: 'Destroyer', description: 'Can destroy any shield in 1-2 strikes. Enemies without shields panic.' }
          }
        },
        throwing_axe: {
          name: 'Throwing Axe',
          description: 'The art of throwing axes with accuracy and power.',
          unlock_requirement: 'axe >= 3 AND strength >= 3',
          passives: {
            3: { name: 'Accurate Throw', description: 'Thrown axes hit reliably at short range.' },
            6: { name: 'Multiple Throws', description: 'Can carry and throw multiple axes in quick succession.' },
            10: { name: 'Axe Storm', description: 'Legendary throwing accuracy. Can hit moving targets at long range.' }
          }
        }
      }
    },

    archery: {
      name: 'Archery',
      description: 'The bow and its variants. Ranged combat, hunting, and the patience of the hunter.',
      icon: '🏹',
      category: 'combat',
      starting_level: 2,
      passives: {
        3: { name: 'Steady Aim', description: 'Can hold aim without penalty. +5 to all archery checks.' },
        6: { name: 'Archer\'s Eye', description: 'Can estimate range and wind. +10 to long-range shots.' },
        10: { name: 'Master Archer', description: 'Legendary accuracy. Can shoot through narrow gaps, hit moving targets, split arrows.' }
      },
      branches: {
        shortbow: {
          name: 'Shortbow',
          description: 'The hunter\'s bow. Fast, mobile, effective at medium range.',
          unlock_requirement: 'archery >= 2',
          passives: {
            3: { name: 'Rapid Fire', description: 'Can fire two arrows per round with shortbow.' },
            6: { name: 'Mounted Archery', description: 'Can fire shortbow from horseback without penalty.' },
            10: { name: 'Arrow Storm', description: 'Three arrows per round. Devastating against unarmored targets.' }
          }
        },
        longbow: {
          name: 'Longbow',
          description: 'The English weapon. Extreme range and armor-piercing power.',
          unlock_requirement: 'archery >= 3 AND strength >= 4',
          passives: {
            3: { name: 'War Draw', description: 'Full draw power. Longbow arrows penetrate light armor.' },
            6: { name: 'Bodkin Point', description: 'Armor-piercing arrows. Effective against plate armor.' },
            10: { name: 'Longbowman', description: 'Legendary longbow mastery. Can pierce heavy armor at 200 yards.' }
          }
        },
        crossbow: {
          name: 'Crossbow',
          description: 'The mechanical bow. Powerful, slow to reload, requires less training.',
          unlock_requirement: 'archery >= 2',
          passives: {
            3: { name: 'Efficient Reload', description: 'Reload time reduced. Can reload while moving.' },
            6: { name: 'Siege Crossbow', description: 'Can use heavy crossbows. Devastating against armor.' },
            10: { name: 'Crossbow Master', description: 'Rapid reload and perfect accuracy. Effective at extreme range.' }
          }
        },
        sling: {
          name: 'Sling',
          description: 'The shepherd\'s weapon. Cheap, concealable, surprisingly deadly.',
          unlock_requirement: 'archery >= 1',
          passives: {
            3: { name: 'Stone Finder', description: 'Can always find ammunition. Sling stones are free.' },
            6: { name: 'Lead Shot', description: 'Can use lead bullets for increased damage and range.' },
            10: { name: 'Sling Master', description: 'Devastating accuracy. Can stun or kill at medium range.' }
          }
        }
      }
    },

    polearms: {
      name: 'Polearms',
      description: 'Spears, halberds, and staves. Reach weapons that dominate the battlefield.',
      icon: '🔱',
      category: 'combat',
      starting_level: 1,
      passives: {
        3: { name: 'Reach Advantage', description: 'Polearm attacks can strike before opponents close distance.' },
        6: { name: 'Formation Fighter', description: 'Bonus when fighting alongside allies with polearms.' },
        10: { name: 'Polearm Master', description: 'Complete mastery. Can use any polearm weapon without penalty.' }
      },
      branches: {
        spear: {
          name: 'Spear',
          description: 'The oldest weapon. Thrusting, throwing, and formation fighting.',
          unlock_requirement: 'polearms >= 1',
          passives: {
            3: { name: 'Spear Wall', description: 'Can brace spear against charges. Devastating against cavalry.' },
            6: { name: 'Throwing Spear', description: 'Can throw spear with accuracy and power.' },
            10: { name: 'Spearman\'s Art', description: 'Legendary spear mastery. Can fight multiple opponents simultaneously.' }
          }
        },
        halberd: {
          name: 'Halberd',
          description: 'The combined axe-spear. Versatile, powerful, effective against cavalry.',
          unlock_requirement: 'polearms >= 3 AND strength >= 3',
          passives: {
            3: { name: 'Hook and Pull', description: 'Can hook mounted opponents and pull them from horses.' },
            6: { name: 'Armor Piercer', description: 'Halberd spike penetrates armor effectively.' },
            10: { name: 'Halberdier', description: 'Devastating halberd mastery. Can fight cavalry, infantry, and armored opponents.' }
          }
        },
        staff: {
          name: 'Staff',
          description: 'The traveler\'s weapon. Non-lethal, versatile, always available.',
          unlock_requirement: 'polearms >= 1',
          passives: {
            3: { name: 'Non-Lethal', description: 'Staff attacks can subdue without killing. Useful for captures.' },
            6: { name: 'Staff Parry', description: 'Excellent defensive weapon. Can parry sword attacks.' },
            10: { name: 'Staff Master', description: 'Legendary staff mastery. Can fight multiple armed opponents.' }
          }
        }
      }
    },

    shield: {
      name: 'Shield',
      description: 'The art of defense. Using a shield to protect yourself and others.',
      icon: '🛡️',
      category: 'combat',
      starting_level: 0,
      passives: {
        3: { name: 'Shield Block', description: 'Can block attacks that would otherwise hit. +10 to defense.' },
        6: { name: 'Shield Mastery', description: 'Shield becomes an extension of the body. No movement penalty.' },
        10: { name: 'Fortress', description: 'Legendary shield use. Can protect allies. Arrows and bolts deflected.' }
      },
      branches: {
        shield_wall: {
          name: 'Shield Wall',
          description: 'Formation fighting with shields. The backbone of medieval infantry.',
          unlock_requirement: 'shield >= 3 AND command >= 2',
          passives: {
            3: { name: 'Wall Formation', description: 'Can organize allies into shield wall. Bonus to all defenders.' },
            6: { name: 'Advance', description: 'Shield wall can advance while maintaining formation.' },
            10: { name: 'Unbreakable Wall', description: 'Perfect shield wall. Nearly impossible to break through.' }
          }
        },
        shield_bash: {
          name: 'Shield Bash',
          description: 'Using the shield as an offensive weapon.',
          unlock_requirement: 'shield >= 2 AND strength >= 3',
          passives: {
            3: { name: 'Staggering Blow', description: 'Shield bash staggers opponents, opening them to follow-up attacks.' },
            6: { name: 'Knockdown', description: 'Powerful shield bash can knock opponents to the ground.' },
            10: { name: 'Battering Ram', description: 'Shield bash can break through doors and knock down multiple opponents.' }
          }
        }
      }
    },

    unarmed: {
      name: 'Unarmed',
      description: 'Fighting without weapons. Strikes, kicks, and the body as a weapon.',
      icon: '🥊',
      category: 'combat',
      starting_level: 3,
      passives: {
        3: { name: 'Hardened Hands', description: 'Hands and feet deal weapon-level damage.' },
        6: { name: 'Combat Instinct', description: 'Never truly unarmed. Can fight effectively in any situation.' },
        10: { name: 'Living Weapon', description: 'Body is a deadly weapon. Can kill with a single strike.' }
      },
      branches: {
        wrestling: {
          name: 'Wrestling',
          description: 'Throws, takedowns, and ground fighting.',
          unlock_requirement: 'unarmed >= 2',
          passives: {
            3: { name: 'Takedown', description: 'Can throw opponents to the ground reliably.' },
            6: { name: 'Ground Control', description: 'Dominant on the ground. Opponents cannot escape.' },
            10: { name: 'Wrestler\'s Mastery', description: 'Can defeat armed opponents through wrestling alone.' }
          }
        },
        disarm: {
          name: 'Disarm',
          description: 'Techniques for removing weapons from opponents.',
          unlock_requirement: 'unarmed >= 3 AND agility >= 3',
          passives: {
            3: { name: 'Weapon Strip', description: 'Can disarm opponents in close quarters.' },
            6: { name: 'Redirect', description: 'Can redirect opponent\'s weapon against them.' },
            10: { name: 'Disarm Master', description: 'Can disarm any opponent. Weapons become liabilities against you.' }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // PHYSICAL
    // ─────────────────────────────────────────────────────────────
    strength: {
      name: 'Strength',
      description: 'Raw physical power. Lifting, breaking, and the force behind every blow.',
      icon: '💪',
      category: 'physical',
      starting_level: 5,
      passives: {
        3: { name: 'Powerful Build', description: 'Can carry more weight. Physical tasks require less effort.' },
        6: { name: 'Ox Strength', description: 'Can perform feats of strength that astonish onlookers. +15 to all strength checks.' },
        10: { name: 'Legendary Strength', description: 'Superhuman strength. Can bend iron bars, lift horses, break chains.' }
      },
      branches: {
        mighty_blow: {
          name: 'Mighty Blow',
          description: 'Channeling maximum strength into a single devastating strike.',
          unlock_requirement: 'strength >= 4',
          passives: {
            3: { name: 'Power Strike', description: 'Can sacrifice accuracy for devastating power. +10 damage, -10 to hit.' },
            6: { name: 'Armor Crusher', description: 'Mighty blows can damage and dent armor permanently.' },
            10: { name: 'Earthshaker', description: 'Single strike can knock down multiple opponents. Legendary power.' }
          }
        },
        beast_of_burden: {
          name: 'Beast of Burden',
          description: 'Extraordinary carrying capacity and endurance under load.',
          unlock_requirement: 'strength >= 3 AND endurance >= 3',
          passives: {
            3: { name: 'Pack Mule', description: 'Can carry twice normal weight without penalty.' },
            6: { name: 'Iron Back', description: 'Can carry enormous loads. Useful for construction and logistics.' },
            10: { name: 'Titan\'s Burden', description: 'Can carry loads that would require a cart. Legendary endurance.' }
          }
        }
      }
    },

    agility: {
      name: 'Agility',
      description: 'Speed, balance, and coordination. The difference between a hit and a miss.',
      icon: '⚡',
      category: 'physical',
      starting_level: 3,
      passives: {
        3: { name: 'Quick Reflexes', description: 'React faster than opponents. +5 to initiative.' },
        6: { name: 'Fluid Motion', description: 'Move through crowds and obstacles without slowing. +10 to agility checks.' },
        10: { name: 'Blur', description: 'Move so fast opponents struggle to track you. +20 to dodge.' }
      },
      branches: {
        acrobatics: {
          name: 'Acrobatics',
          description: 'Tumbling, vaulting, and using the environment in combat.',
          unlock_requirement: 'agility >= 3',
          passives: {
            3: { name: 'Tumble', description: 'Can roll and tumble to avoid attacks and fall damage.' },
            6: { name: 'Wall Runner', description: 'Can run along walls briefly. Use environment for tactical advantage.' },
            10: { name: 'Acrobat', description: 'Extraordinary acrobatic ability. Can fight while performing impossible maneuvers.' }
          }
        },
        dodge_mastery: {
          name: 'Dodge Mastery',
          description: 'The art of not being where the attack lands.',
          unlock_requirement: 'agility >= 4',
          passives: {
            3: { name: 'Evasion', description: 'Can dodge attacks that would normally be unavoidable.' },
            6: { name: 'Ghost Step', description: 'Move through combat without being struck. +15 to dodge.' },
            10: { name: 'Untouchable', description: 'Legendary evasion. Opponents struggle to land any blow.' }
          }
        },
        quick_draw: {
          name: 'Quick Draw',
          description: 'Drawing weapons with lightning speed.',
          unlock_requirement: 'agility >= 3',
          passives: {
            3: { name: 'Fast Draw', description: 'Draw weapon as a free action. Always ready.' },
            6: { name: 'Ambidextrous', description: 'Can draw and use either hand equally well.' },
            10: { name: 'Blur Draw', description: 'Draw and strike before opponents can react. Always wins initiative.' }
          }
        }
      }
    },

    endurance: {
      name: 'Endurance',
      description: 'The ability to keep going when others stop. Stamina, pain tolerance, and resilience.',
      icon: '🏃',
      category: 'physical',
      starting_level: 5,
      passives: {
        3: { name: 'Second Wind', description: 'Can push through fatigue. Recover stamina faster.' },
        6: { name: 'Iron Will', description: 'Can continue fighting at wound levels that would incapacitate others.' },
        10: { name: 'Indomitable', description: 'Legendary endurance. Can fight for days without rest. Wounds slow you but don\'t stop you.' }
      },
      branches: {
        iron_constitution: {
          name: 'Iron Constitution',
          description: 'Resistance to disease, poison, and environmental hardship.',
          unlock_requirement: 'endurance >= 3',
          passives: {
            3: { name: 'Disease Resistance', description: '+20 to resist disease. Recover from illness faster.' },
            6: { name: 'Poison Tolerance', description: 'Partial resistance to poisons. Reduced effects.' },
            10: { name: 'Immune', description: 'Near-immunity to common diseases and poisons. Legendary constitution.' }
          }
        },
        pain_tolerance: {
          name: 'Pain Tolerance',
          description: 'Fighting through wounds that would stop others.',
          unlock_requirement: 'endurance >= 4',
          passives: {
            3: { name: 'Grit', description: 'Wound penalties reduced by half.' },
            6: { name: 'Berserker\'s Rage', description: 'Wounds can fuel combat effectiveness rather than hinder it.' },
            10: { name: 'Unstoppable', description: 'Can fight at death\'s door. Wounds that would kill others merely slow you.' }
          }
        },
        marathon: {
          name: 'Marathon',
          description: 'Long-distance running and sustained physical effort.',
          unlock_requirement: 'endurance >= 3',
          passives: {
            3: { name: 'Long Runner', description: 'Can run for hours without stopping. Useful for travel and escape.' },
            6: { name: 'Tireless', description: 'Fatigue accumulates much more slowly.' },
            10: { name: 'Marathon Runner', description: 'Can run 50+ miles in a day. Legendary endurance.' }
          }
        }
      }
    },

    swimming: {
      name: 'Swimming',
      description: 'Moving through water. Survival, escape, and underwater combat.',
      icon: '🏊',
      category: 'physical',
      starting_level: 1,
      passives: {
        3: { name: 'Strong Swimmer', description: 'Can swim in rough water and currents.' },
        6: { name: 'Aquatic', description: 'Move through water as easily as land.' },
        10: { name: 'Sea Born', description: 'Legendary swimming. Can swim in stormy seas, dive to great depths.' }
      },
      branches: {
        underwater_combat: {
          name: 'Underwater Combat',
          description: 'Fighting while submerged.',
          unlock_requirement: 'swimming >= 4',
          passives: {
            3: { name: 'Water Fighter', description: 'Can fight effectively while swimming.' },
            6: { name: 'Ambush from Water', description: 'Can attack from underwater, surprising opponents.' },
            10: { name: 'Aquatic Predator', description: 'Deadly in water. Can drag opponents under.' }
          }
        }
      }
    },

    climbing: {
      name: 'Climbing',
      description: 'Scaling walls, cliffs, and structures. The art of going up.',
      icon: '🧗',
      category: 'physical',
      starting_level: 1,
      passives: {
        3: { name: 'Sure Grip', description: 'Can climb rough surfaces without equipment.' },
        6: { name: 'Spider Climb', description: 'Can climb nearly any surface. Smooth walls with minimal handholds.' },
        10: { name: 'Wall Walker', description: 'Legendary climbing. Can scale castle walls, cliff faces, any structure.' }
      },
      branches: {
        urban_scaling: {
          name: 'Urban Scaling',
          description: 'Climbing buildings, walls, and urban structures.',
          unlock_requirement: 'climbing >= 3',
          passives: {
            3: { name: 'Rooftop Runner', description: 'Can move across rooftops quickly and quietly.' },
            6: { name: 'Castle Breaker', description: 'Can scale castle walls and fortifications.' },
            10: { name: 'Shadow Climber', description: 'Can infiltrate any fortification by climbing. Legendary urban mobility.' }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // SOCIAL
    // ─────────────────────────────────────────────────────────────
    speech: {
      name: 'Speech',
      description: 'The power of words. Persuasion, rhetoric, and the ability to move people.',
      icon: '🗣️',
      category: 'social',
      starting_level: 3,
      passives: {
        3: { name: 'Compelling Voice', description: 'People listen when you speak. +5 to all speech checks.' },
        6: { name: 'Orator\'s Gift', description: 'Can sway crowds and change minds. +10 to speech checks.' },
        10: { name: 'Voice of God', description: 'Legendary oratory. Can inspire armies, convert enemies, move kings.' }
      },
      branches: {
        oratory: {
          name: 'Oratory',
          description: 'Public speaking, sermons, and addressing crowds.',
          unlock_requirement: 'speech >= 3',
          passives: {
            3: { name: 'Crowd Control', description: 'Can address and manage large crowds effectively.' },
            6: { name: 'Rabble Rouser', description: 'Can incite crowds to action. Dangerous power.' },
            10: { name: 'Demagogue', description: 'Can move entire populations. Legendary public speaking.' }
          }
        },
        negotiation: {
          name: 'Negotiation',
          description: 'Finding mutually beneficial agreements. The art of the deal.',
          unlock_requirement: 'speech >= 3 AND haggle >= 2',
          passives: {
            3: { name: 'Common Ground', description: 'Can find compromise in difficult situations.' },
            6: { name: 'Master Negotiator', description: 'Can negotiate favorable terms in almost any situation.' },
            10: { name: 'Peacemaker', description: 'Can end wars and feuds through negotiation. Legendary diplomacy.' }
          }
        },
        inspire: {
          name: 'Inspire',
          description: 'Motivating others to extraordinary effort.',
          unlock_requirement: 'speech >= 4 AND command >= 2',
          passives: {
            3: { name: 'Rally', description: 'Can rally demoralized troops and workers.' },
            6: { name: 'Battle Cry', description: 'Inspiring speech before battle grants allies +10 to all checks.' },
            10: { name: 'Legend', description: 'Your presence alone inspires. Allies fight beyond their limits.' }
          }
        }
      }
    },

    deception: {
      name: 'Deception',
      description: 'Lying, misdirection, and the art of making people believe what isn\'t true.',
      icon: '🎭',
      category: 'social',
      starting_level: 2,
      passives: {
        3: { name: 'Poker Face', description: 'Emotions don\'t show. Lies are harder to detect.' },
        6: { name: 'Master Liar', description: 'Can maintain complex deceptions. +10 to all deception checks.' },
        10: { name: 'The Great Deceiver', description: 'Legendary deception. Can fool anyone, maintain any lie indefinitely.' }
      },
      branches: {
        disguise: {
          name: 'Disguise',
          description: 'Changing appearance to pass as someone else.',
          unlock_requirement: 'deception >= 3',
          passives: {
            3: { name: 'Basic Disguise', description: 'Can pass as a different class or profession.' },
            6: { name: 'Master of Faces', description: 'Can impersonate specific individuals.' },
            10: { name: 'Ghost Identity', description: 'Can become anyone. Perfect disguise that fools even close associates.' }
          }
        },
        forgery: {
          name: 'Forgery',
          description: 'Creating false documents, seals, and written materials.',
          unlock_requirement: 'deception >= 3 AND reading >= 2',
          passives: {
            3: { name: 'Document Forger', description: 'Can create convincing false documents.' },
            6: { name: 'Seal Forger', description: 'Can replicate official seals and signatures.' },
            10: { name: 'Master Forger', description: 'Can forge any document, seal, or written material perfectly.' }
          }
        },
        double_life: {
          name: 'Double Life',
          description: 'Maintaining multiple identities simultaneously.',
          unlock_requirement: 'deception >= 5 AND disguise >= 3',
          passives: {
            3: { name: 'Compartmentalization', description: 'Can keep multiple identities separate without confusion.' },
            6: { name: 'Multiple Lives', description: 'Can maintain 3+ separate identities simultaneously.' },
            10: { name: 'Ghost', description: 'True identity is completely hidden. Can disappear and reappear as anyone.' }
          }
        }
      }
    },

    intimidation: {
      name: 'Intimidation',
      description: 'Making people afraid. The power of presence, threat, and violence.',
      icon: '😤',
      category: 'social',
      starting_level: 3,
      passives: {
        3: { name: 'Menacing Presence', description: 'People sense danger around you. +5 to intimidation.' },
        6: { name: 'Fear Aura', description: 'Weaker opponents hesitate before attacking. +10 to intimidation.' },
        10: { name: 'Terror', description: 'Legendary intimidation. Can make armies hesitate, break men without touching them.' }
      },
      branches: {
        interrogation: {
          name: 'Interrogation',
          description: 'Extracting information through fear and pressure.',
          unlock_requirement: 'intimidation >= 3',
          passives: {
            3: { name: 'Pressure', description: 'Can extract information through psychological pressure.' },
            6: { name: 'Breaking Point', description: 'Know exactly how to break someone\'s resistance.' },
            10: { name: 'Inquisitor', description: 'Can extract any information from anyone. Legendary interrogation.' }
          }
        },
        warlord_presence: {
          name: 'Warlord Presence',
          description: 'The commanding presence of a military leader.',
          unlock_requirement: 'intimidation >= 4 AND command >= 3',
          passives: {
            3: { name: 'Commander\'s Voice', description: 'Troops obey instantly. Enemies hesitate.' },
            6: { name: 'Warlord', description: 'Your presence on the battlefield affects morale of both sides.' },
            10: { name: 'Living Legend', description: 'Your reputation alone wins battles. Enemies surrender rather than fight.' }
          }
        },
        silent_threat: {
          name: 'Silent Threat',
          description: 'Intimidating without words. The look, the gesture, the implication.',
          unlock_requirement: 'intimidation >= 3',
          passives: {
            3: { name: 'The Look', description: 'A glance can communicate threat effectively.' },
            6: { name: 'Wordless Warning', description: 'Can intimidate without speaking. Useful in public.' },
            10: { name: 'Death Stare', description: 'A look can stop men in their tracks. Legendary silent intimidation.' }
          }
        }
      }
    },

    haggle: {
      name: 'Haggle',
      description: 'The art of the deal. Getting better prices, finding hidden value, and trading profitably.',
      icon: '💰',
      category: 'social',
      starting_level: 2,
      passives: {
        3: { name: 'Sharp Eye', description: 'Can spot overpriced goods and undervalued items.' },
        6: { name: 'Market Sense', description: 'Instinctively know fair prices. +10 to all haggle checks.' },
        10: { name: 'Master Trader', description: 'Legendary haggling. Can buy low and sell high in any market.' }
      },
      branches: {
        black_market: {
          name: 'Black Market',
          description: 'Trading in illegal or restricted goods.',
          unlock_requirement: 'haggle >= 3',
          passives: {
            3: { name: 'Underground Contacts', description: 'Know where to find illegal goods and buyers.' },
            6: { name: 'Fence', description: 'Can move stolen goods without suspicion.' },
            10: { name: 'Shadow Merchant', description: 'Control black market networks. Profit from anything.' }
          }
        },
        monopoly: {
          name: 'Monopoly',
          description: 'Controlling supply of goods to set prices.',
          unlock_requirement: 'haggle >= 5 AND stewardship >= 3',
          passives: {
            3: { name: 'Corner the Market', description: 'Can buy up supply of specific goods to control prices.' },
            6: { name: 'Price Setter', description: 'Control enough supply to dictate regional prices.' },
            10: { name: 'Trade King', description: 'Monopoly control over major trade goods. Legendary economic power.' }
          }
        },
        price_manipulation: {
          name: 'Price Manipulation',
          description: 'Artificially inflating or deflating prices through rumor and action.',
          unlock_requirement: 'haggle >= 4 AND deception >= 3',
          passives: {
            3: { name: 'Rumor Trader', description: 'Can spread rumors that affect market prices.' },
            6: { name: 'Market Manipulator', description: 'Can cause price crashes and spikes through coordinated action.' },
            10: { name: 'Economic Predator', description: 'Can destroy competitors through market manipulation.' }
          }
        }
      }
    },

    etiquette: {
      name: 'Etiquette',
      description: 'The rules of polite society. How to behave among nobles, clergy, and the powerful.',
      icon: '🎩',
      category: 'social',
      starting_level: 0,
      passives: {
        3: { name: 'Presentable', description: 'Can pass in polite company without embarrassing yourself.' },
        6: { name: 'Courtly Manner', description: 'Comfortable in noble courts. +10 to social checks with upper classes.' },
        10: { name: 'Perfect Courtier', description: 'Legendary etiquette. Can navigate any social situation flawlessly.' }
      },
      branches: {
        court_manners: {
          name: 'Court Manners',
          description: 'The specific protocols of noble courts.',
          unlock_requirement: 'etiquette >= 2',
          passives: {
            3: { name: 'Court Ready', description: 'Can attend noble courts without causing offense.' },
            6: { name: 'Courtier', description: 'Comfortable and effective in court politics.' },
            10: { name: 'Master Courtier', description: 'Can navigate the most complex court politics.' }
          }
        },
        royal_protocol: {
          name: 'Royal Protocol',
          description: 'The specific rules for interacting with royalty.',
          unlock_requirement: 'etiquette >= 4 AND court_manners >= 3',
          passives: {
            3: { name: 'Royal Audience', description: 'Can request and survive royal audiences.' },
            6: { name: 'Royal Favor', description: 'Know how to gain and maintain royal favor.' },
            10: { name: 'King\'s Confidant', description: 'Can become a trusted advisor to royalty.' }
          }
        },
        cultural_fluency: {
          name: 'Cultural Fluency',
          description: 'Understanding and navigating different cultural norms.',
          unlock_requirement: 'etiquette >= 3',
          passives: {
            3: { name: 'Cultural Awareness', description: 'Understand basic customs of foreign cultures.' },
            6: { name: 'Cultural Chameleon', description: 'Can adapt to any culture\'s norms quickly.' },
            10: { name: 'Citizen of the World', description: 'Comfortable in any culture. No cultural penalties.' }
          }
        }
      }
    },

    command: {
      name: 'Command',
      description: 'Leadership and the ability to direct others effectively.',
      icon: '👑',
      category: 'social',
      starting_level: 1,
      passives: {
        3: { name: 'Natural Leader', description: 'People follow your orders more readily. +5 to command checks.' },
        6: { name: 'Commander', description: 'Can lead groups effectively. +10 to command checks.' },
        10: { name: 'Born Leader', description: 'Legendary command. People follow you into impossible situations.' }
      },
      branches: {
        squad_leader: {
          name: 'Squad Leader',
          description: 'Leading small groups of fighters.',
          unlock_requirement: 'command >= 2',
          passives: {
            3: { name: 'Squad Tactics', description: 'Can coordinate small group tactics effectively.' },
            6: { name: 'Elite Squad', description: 'Your squad fights as a cohesive unit. Bonus to all members.' },
            10: { name: 'Legendary Squad', description: 'Your squad becomes legendary. Morale never breaks.' }
          }
        },
        captain: {
          name: 'Captain',
          description: 'Leading companies of soldiers.',
          unlock_requirement: 'command >= 4 AND squad_leader >= 3',
          passives: {
            3: { name: 'Company Commander', description: 'Can effectively command 50-200 soldiers.' },
            6: { name: 'Veteran Captain', description: 'Troops under your command fight better and break less easily.' },
            10: { name: 'Legendary Captain', description: 'Your company is feared. Enemies hesitate to face you.' }
          }
        },
        war_commander: {
          name: 'War Commander',
          description: 'Leading armies in major battles.',
          unlock_requirement: 'command >= 6 AND captain >= 4 AND tactics >= 3',
          passives: {
            3: { name: 'Army Commander', description: 'Can effectively command armies of thousands.' },
            6: { name: 'Battle Master', description: 'Your tactical decisions in battle are inspired.' },
            10: { name: 'Warlord', description: 'Legendary war command. Can win battles against overwhelming odds.' }
          }
        },
        siege_craft: {
          name: 'Siege Craft',
          description: 'The art of taking and defending fortifications.',
          unlock_requirement: 'command >= 4 AND engineering >= 2',
          passives: {
            3: { name: 'Siege Basics', description: 'Understand siege warfare fundamentals.' },
            6: { name: 'Siege Master', description: 'Can conduct effective sieges and defend against them.' },
            10: { name: 'Castle Breaker', description: 'No fortification can withstand your siege. Legendary siege craft.' }
          }
        }
      }
    },

    seduction: {
      name: 'Seduction',
      description: 'The art of attraction and romantic manipulation.',
      icon: '💕',
      category: 'social',
      starting_level: 1,
      passives: {
        3: { name: 'Charming', description: 'Naturally attractive and appealing. +5 to seduction checks.' },
        6: { name: 'Irresistible', description: 'Few can resist your charm. +10 to seduction checks.' },
        10: { name: 'Fatal Attraction', description: 'Legendary seduction. Can make anyone fall in love.' }
      },
      branches: {
        courtly_love: {
          name: 'Courtly Love',
          description: 'The noble tradition of romantic pursuit and devotion.',
          unlock_requirement: 'seduction >= 2 AND etiquette >= 2',
          passives: {
            3: { name: 'Troubadour\'s Heart', description: 'Can express romantic devotion in the courtly tradition.' },
            6: { name: 'Noble Romance', description: 'Can pursue and win noble romantic interests.' },
            10: { name: 'Perfect Lover', description: 'Legendary courtly love. Can win the heart of any noble.' }
          }
        },
        temptation: {
          name: 'Temptation',
          description: 'Using attraction to manipulate and control.',
          unlock_requirement: 'seduction >= 3 AND deception >= 2',
          passives: {
            3: { name: 'Honey Trap', description: 'Can use attraction to extract information and favors.' },
            6: { name: 'Puppet Strings', description: 'Can control people through romantic manipulation.' },
            10: { name: 'Siren', description: 'Legendary temptation. Can destroy people through attraction.' }
          }
        },
        political_marriage: {
          name: 'Political Marriage',
          description: 'Using marriage as a political tool.',
          unlock_requirement: 'seduction >= 4 AND etiquette >= 3 AND law >= 2',
          passives: {
            3: { name: 'Eligible Match', description: 'Understand the politics of marriage alliances.' },
            6: { name: 'Marriage Broker', description: 'Can arrange politically advantageous marriages.' },
            10: { name: 'Dynasty Builder', description: 'Can use marriage to build political empires.' }
          }
        }
      }
    },

    read_people: {
      name: 'Read People',
      description: 'Understanding what people really think and feel beneath the surface.',
      icon: '👁️',
      category: 'social',
      starting_level: 3,
      passives: {
        3: { name: 'Intuition', description: 'Sense when something is wrong. +5 to read people checks.' },
        6: { name: 'Empathy', description: 'Understand people\'s motivations deeply. +10 to read people checks.' },
        10: { name: 'Mind Reader', description: 'Legendary insight. Can read anyone like a book.' }
      },
      branches: {
        detect_lies: {
          name: 'Detect Lies',
          description: 'Knowing when someone is being dishonest.',
          unlock_requirement: 'read_people >= 2',
          passives: {
            3: { name: 'Lie Detector', description: 'Can usually tell when someone is lying.' },
            6: { name: 'Truth Seeker', description: 'Very difficult to deceive. +15 to detect lies.' },
            10: { name: 'Infallible', description: 'Cannot be deceived. Know truth from lies instantly.' }
          }
        },
        predict_behavior: {
          name: 'Predict Behavior',
          description: 'Anticipating what people will do before they do it.',
          unlock_requirement: 'read_people >= 3',
          passives: {
            3: { name: 'Pattern Recognition', description: 'Can predict likely actions based on personality.' },
            6: { name: 'Behavioral Prediction', description: 'Can predict complex behavior chains.' },
            10: { name: 'Oracle', description: 'Can predict what anyone will do in almost any situation.' }
          }
        },
        puppet_master: {
          name: 'Puppet Master',
          description: 'Using psychological insight to manipulate people.',
          unlock_requirement: 'read_people >= 5 AND deception >= 3',
          passives: {
            3: { name: 'Pressure Points', description: 'Know exactly what motivates and frightens each person.' },
            6: { name: 'Strings', description: 'Can manipulate people through their own psychology.' },
            10: { name: 'Puppet Master', description: 'Legendary manipulation. Can control people without them knowing.' }
          }
        }
      }
    },

    performance: {
      name: 'Performance',
      description: 'Music, song, storytelling, and the art of entertaining.',
      icon: '🎵',
      category: 'social',
      starting_level: 0,
      passives: {
        3: { name: 'Entertainer', description: 'Can earn coin through performance. Crowds enjoy your work.' },
        6: { name: 'Skilled Performer', description: 'Memorable performances. People talk about you. +10 to performance.' },
        10: { name: 'Master Performer', description: 'Legendary performance. Can move audiences to tears or laughter at will.' }
      },
      branches: {
        tavern_singer: {
          name: 'Tavern Singer',
          description: 'Performing in taverns and common spaces.',
          unlock_requirement: 'performance >= 1',
          passives: {
            3: { name: 'Crowd Pleaser', description: 'Tavern audiences love you. Earn good coin.' },
            6: { name: 'Beloved Entertainer', description: 'Known and welcomed in taverns across the region.' },
            10: { name: 'Legendary Tavern Singer', description: 'Your songs are sung everywhere. Legendary reputation.' }
          }
        },
        troubadour: {
          name: 'Troubadour',
          description: 'The traveling musician and poet of the noble tradition.',
          unlock_requirement: 'performance >= 3 AND etiquette >= 2',
          passives: {
            3: { name: 'Noble Entertainer', description: 'Can perform for noble audiences.' },
            6: { name: 'Court Favorite', description: 'Welcomed in noble courts. Earn patronage.' },
            10: { name: 'Legendary Troubadour', description: 'Your songs are sung in courts across Europe.' }
          }
        },
        court_musician: {
          name: 'Court Musician',
          description: 'Serving as a permanent musician in a noble court.',
          unlock_requirement: 'performance >= 4 AND etiquette >= 3',
          passives: {
            3: { name: 'Court Position', description: 'Can secure a position as court musician.' },
            6: { name: 'Noble Confidant', description: 'Music creates intimacy. Nobles share secrets.' },
            10: { name: 'Royal Musician', description: 'Serve royalty. Extraordinary access and influence.' }
          }
        },
        legendary_performer: {
          name: 'Legendary Performer',
          description: 'Achieving legendary status as a performer.',
          unlock_requirement: 'performance >= 7',
          passives: {
            3: { name: 'Famous', description: 'Known across the region. People travel to hear you.' },
            6: { name: 'Legendary', description: 'Songs about you are sung. Your name is known everywhere.' },
            10: { name: 'Immortal Art', description: 'Your performances will be remembered for generations.' }
          }
        },
        composer: {
          name: 'Composer',
          description: 'Creating original music and songs.',
          unlock_requirement: 'performance >= 4',
          passives: {
            3: { name: 'Songwriter', description: 'Can compose original songs that spread through the region.' },
            6: { name: 'Master Composer', description: 'Your compositions are masterworks. Performed by others.' },
            10: { name: 'Musical Genius', description: 'Legendary compositions. Your music changes culture.' }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // CRAFT & TRADE
    // ─────────────────────────────────────────────────────────────
    stewardship: {
      name: 'Stewardship',
      description: 'Managing resources, estates, and finances. The art of making things run.',
      icon: '📊',
      category: 'craft',
      starting_level: 1,
      passives: {
        3: { name: 'Efficient Manager', description: 'Resources go further under your management. +10% income.' },
        6: { name: 'Master Steward', description: 'Excellent resource management. +20% income, reduced waste.' },
        10: { name: 'Economic Genius', description: 'Legendary stewardship. Can make any enterprise profitable.' }
      },
      branches: {
        estate_management: {
          name: 'Estate Management',
          description: 'Running a noble estate or large property.',
          unlock_requirement: 'stewardship >= 2',
          passives: {
            3: { name: 'Estate Manager', description: 'Can run a small estate effectively.' },
            6: { name: 'Lord\'s Steward', description: 'Can manage large estates and multiple properties.' },
            10: { name: 'Master of Estates', description: 'Can manage vast holdings. Legendary estate management.' }
          }
        },
        tax_collection: {
          name: 'Tax Collection',
          description: 'Collecting taxes and dues efficiently.',
          unlock_requirement: 'stewardship >= 3 AND intimidation >= 2',
          passives: {
            3: { name: 'Tax Collector', description: 'Can collect taxes effectively. Minimal evasion.' },
            6: { name: 'Revenue Master', description: 'Maximize tax collection. Find hidden wealth.' },
            10: { name: 'Fiscal Genius', description: 'Extract maximum revenue from any territory.' }
          }
        },
        city_administration: {
          name: 'City Administration',
          description: 'Running a city or large town.',
          unlock_requirement: 'stewardship >= 5 AND law >= 2',
          passives: {
            3: { name: 'City Manager', description: 'Can administer a city effectively.' },
            6: { name: 'Urban Planner', description: 'Can improve city infrastructure and efficiency.' },
            10: { name: 'City Builder', description: 'Can transform cities. Legendary urban administration.' }
          }
        },
        kingdom_finance: {
          name: 'Kingdom Finance',
          description: 'Managing the finances of a kingdom.',
          unlock_requirement: 'stewardship >= 7 AND city_administration >= 4',
          passives: {
            3: { name: 'Royal Treasurer', description: 'Can manage kingdom-level finances.' },
            6: { name: 'Economic Minister', description: 'Can reform and improve kingdom economy.' },
            10: { name: 'Economic Architect', description: 'Can build economic systems that last generations.' }
          }
        }
      }
    },

    smithing: {
      name: 'Smithing',
      description: 'Working metal. From horseshoes to swords, the forge is your domain.',
      icon: '⚒️',
      category: 'craft',
      starting_level: 2,
      passives: {
        3: { name: 'Forge Sense', description: 'Can judge metal quality by sight and sound. +5 to smithing.' },
        6: { name: 'Master Smith', description: 'Produce high-quality work consistently. +10 to smithing.' },
        10: { name: 'Legendary Smith', description: 'Your work is sought by kings. Can create masterwork items.' }
      },
      branches: {
        weaponsmith: {
          name: 'Weaponsmith',
          description: 'Crafting weapons of war.',
          unlock_requirement: 'smithing >= 3',
          passives: {
            3: { name: 'Weapon Maker', description: 'Can craft functional weapons of good quality.' },
            6: { name: 'Master Weaponsmith', description: 'Craft superior weapons. Sought by warriors.' },
            10: { name: 'Legendary Weaponsmith', description: 'Your weapons are legendary. Named items that pass through history.' }
          }
        },
        armorsmith: {
          name: 'Armorsmith',
          description: 'Crafting armor and protective equipment.',
          unlock_requirement: 'smithing >= 4',
          passives: {
            3: { name: 'Armor Maker', description: 'Can craft functional armor of good quality.' },
            6: { name: 'Master Armorsmith', description: 'Craft superior armor. Sought by knights.' },
            10: { name: 'Legendary Armorsmith', description: 'Your armor is legendary. Sought by kings.' }
          }
        },
        masterwork_crafting: {
          name: 'Masterwork Crafting',
          description: 'Creating items of extraordinary quality.',
          unlock_requirement: 'smithing >= 6',
          passives: {
            3: { name: 'Fine Work', description: 'Can consistently produce fine quality items.' },
            6: { name: 'Masterwork', description: 'Can create masterwork items with special properties.' },
            10: { name: 'Legendary Craft', description: 'Create legendary items that become famous artifacts.' }
          }
        },
        siege_engineering: {
          name: 'Siege Engineering',
          description: 'Building siege weapons and fortification components.',
          unlock_requirement: 'smithing >= 4 AND engineering >= 2',
          passives: {
            3: { name: 'Siege Smith', description: 'Can craft components for siege weapons.' },
            6: { name: 'War Engineer', description: 'Can build complete siege weapons.' },
            10: { name: 'Master Engineer', description: 'Can build any siege weapon or fortification component.' }
          }
        }
      }
    },

    carpentry: {
      name: 'Carpentry',
      description: 'Working wood. Buildings, furniture, tools, and the structures of civilization.',
      icon: '🪚',
      category: 'craft',
      starting_level: 3,
      passives: {
        3: { name: 'Wood Sense', description: 'Can judge wood quality and grain. +5 to carpentry.' },
        6: { name: 'Master Carpenter', description: 'Produce high-quality work consistently. +10 to carpentry.' },
        10: { name: 'Legendary Carpenter', description: 'Your work is architectural art. Can build anything.' }
      },
      branches: {
        shipbuilding: {
          name: 'Shipbuilding',
          description: 'Constructing and repairing ships.',
          unlock_requirement: 'carpentry >= 4 AND seamanship >= 2',
          passives: {
            3: { name: 'Ship Builder', description: 'Can build small boats and repair ships.' },
            6: { name: 'Master Shipwright', description: 'Can build large ships of good quality.' },
            10: { name: 'Legendary Shipwright', description: 'Can build any ship. Your vessels are legendary.' }
          }
        },
        fortification: {
          name: 'Fortification',
          description: 'Building defensive structures and fortifications.',
          unlock_requirement: 'carpentry >= 4 AND engineering >= 2',
          passives: {
            3: { name: 'Fortification Builder', description: 'Can build wooden fortifications and palisades.' },
            6: { name: 'Castle Builder', description: 'Can design and build stone fortifications.' },
            10: { name: 'Master Fortifier', description: 'Can build impregnable fortifications.' }
          }
        },
        architecture: {
          name: 'Architecture',
          description: 'Designing and building impressive structures.',
          unlock_requirement: 'carpentry >= 5 AND engineering >= 3',
          passives: {
            3: { name: 'Builder', description: 'Can design and build functional structures.' },
            6: { name: 'Architect', description: 'Can design impressive buildings and structures.' },
            10: { name: 'Master Architect', description: 'Your buildings are architectural masterpieces.' }
          }
        }
      }
    },

    agriculture: {
      name: 'Agriculture',
      description: 'The foundation of civilization. Growing food, managing land, and feeding people.',
      icon: '🌾',
      category: 'craft',
      starting_level: 4,
      passives: {
        3: { name: 'Green Thumb', description: 'Crops grow better under your care. +10% yield.' },
        6: { name: 'Master Farmer', description: 'Exceptional agricultural knowledge. +20% yield, better disease resistance.' },
        10: { name: 'Agricultural Genius', description: 'Legendary farming knowledge. Can feed armies from barren land.' }
      },
      branches: {
        animal_husbandry: {
          name: 'Animal Husbandry',
          description: 'Raising and breeding livestock.',
          unlock_requirement: 'agriculture >= 2',
          passives: {
            3: { name: 'Animal Keeper', description: 'Can raise healthy livestock.' },
            6: { name: 'Breeder', description: 'Can selectively breed animals for desired traits.' },
            10: { name: 'Master Breeder', description: 'Can breed exceptional animals. Legendary livestock.' }
          }
        },
        viticulture: {
          name: 'Viticulture',
          description: 'Growing grapes and making wine.',
          unlock_requirement: 'agriculture >= 3',
          passives: {
            3: { name: 'Vintner', description: 'Can grow grapes and make basic wine.' },
            6: { name: 'Master Vintner', description: 'Produce excellent wine. Sought by nobles.' },
            10: { name: 'Legendary Vintner', description: 'Your wine is legendary. Sought by kings.' }
          }
        },
        estate_farming: {
          name: 'Estate Farming',
          description: 'Managing large agricultural estates.',
          unlock_requirement: 'agriculture >= 4 AND stewardship >= 2',
          passives: {
            3: { name: 'Estate Farmer', description: 'Can manage large farms and multiple fields.' },
            6: { name: 'Agricultural Manager', description: 'Maximize production from any land.' },
            10: { name: 'Agricultural Empire', description: 'Can feed entire regions. Legendary agricultural management.' }
          }
        },
        famine_preparation: {
          name: 'Famine Preparation',
          description: 'Preparing for and surviving food shortages.',
          unlock_requirement: 'agriculture >= 4',
          passives: {
            3: { name: 'Food Storage', description: 'Know how to store food for long periods.' },
            6: { name: 'Famine Planner', description: 'Can prepare communities for food shortages.' },
            10: { name: 'Famine Breaker', description: 'Can prevent famines through preparation and innovation.' }
          }
        }
      }
    },

    hunting: {
      name: 'Hunting',
      description: 'Tracking, trapping, and killing wild animals. Survival and sport.',
      icon: '🦌',
      category: 'craft',
      starting_level: 3,
      passives: {
        3: { name: 'Hunter\'s Eye', description: 'Can read animal signs and tracks. +5 to hunting.' },
        6: { name: 'Master Hunter', description: 'Rarely return empty-handed. +10 to hunting.' },
        10: { name: 'Legendary Hunter', description: 'Can hunt any animal in any terrain. Legendary tracking.' }
      },
      branches: {
        tracking: {
          name: 'Tracking',
          description: 'Following animals and people through any terrain.',
          unlock_requirement: 'hunting >= 2',
          passives: {
            3: { name: 'Tracker', description: 'Can follow tracks in most conditions.' },
            6: { name: 'Master Tracker', description: 'Can track in difficult conditions. Follow days-old trails.' },
            10: { name: 'Legendary Tracker', description: 'Can track anyone anywhere. Nothing escapes your notice.' }
          }
        },
        trapping: {
          name: 'Trapping',
          description: 'Setting traps for animals and people.',
          unlock_requirement: 'hunting >= 2',
          passives: {
            3: { name: 'Trapper', description: 'Can set effective animal traps.' },
            6: { name: 'Master Trapper', description: 'Traps are nearly undetectable. High success rate.' },
            10: { name: 'Trap Master', description: 'Can trap anything. Traps can be used against people too.' }
          }
        },
        falconry: {
          name: 'Falconry',
          description: 'Training and hunting with birds of prey.',
          unlock_requirement: 'hunting >= 3',
          passives: {
            3: { name: 'Falconer', description: 'Can train and hunt with hawks and falcons.' },
            6: { name: 'Master Falconer', description: 'Exceptional bond with birds. They perform complex tasks.' },
            10: { name: 'Legendary Falconer', description: 'Your birds are legendary. Can use them for espionage.' }
          }
        },
        big_game: {
          name: 'Big Game',
          description: 'Hunting dangerous large animals.',
          unlock_requirement: 'hunting >= 4 AND strength >= 3',
          passives: {
            3: { name: 'Big Game Hunter', description: 'Can hunt boar, bear, and other dangerous animals.' },
            6: { name: 'Monster Hunter', description: 'Can hunt the most dangerous animals. Wolves, bears, lions.' },
            10: { name: 'Legendary Hunter', description: 'Can hunt any creature. Your trophies are legendary.' }
          }
        }
      }
    },

    medicine: {
      name: 'Medicine',
      description: 'Healing the sick and wounded. The art of keeping people alive.',
      icon: '⚕️',
      category: 'craft',
      starting_level: 0,
      passives: {
        3: { name: 'Healer\'s Touch', description: 'Wounds heal faster under your care. +5 to medicine.' },
        6: { name: 'Skilled Physician', description: 'Can treat most injuries and illnesses. +10 to medicine.' },
        10: { name: 'Master Physician', description: 'Legendary medical knowledge. Can treat almost anything.' }
      },
      branches: {
        herbalism: {
          name: 'Herbalism',
          description: 'Using plants for healing and other purposes.',
          unlock_requirement: 'medicine >= 1',
          passives: {
            3: { name: 'Herbalist', description: 'Know common medicinal plants and their uses.' },
            6: { name: 'Master Herbalist', description: 'Know rare and powerful plants. Can create complex remedies.' },
            10: { name: 'Legendary Herbalist', description: 'Know every plant and its properties. Can cure almost anything.' }
          }
        },
        surgery: {
          name: 'Surgery',
          description: 'Cutting into the body to heal it.',
          unlock_requirement: 'medicine >= 3',
          passives: {
            3: { name: 'Surgeon', description: 'Can perform basic surgical procedures.' },
            6: { name: 'Master Surgeon', description: 'Can perform complex surgeries. Save lives others cannot.' },
            10: { name: 'Legendary Surgeon', description: 'Can perform miraculous surgeries. Save the unsaveable.' }
          }
        },
        plague_doctor: {
          name: 'Plague Doctor',
          description: 'Treating epidemic diseases and mass casualties.',
          unlock_requirement: 'medicine >= 4',
          passives: {
            3: { name: 'Disease Expert', description: 'Understand how diseases spread and how to contain them.' },
            6: { name: 'Plague Fighter', description: 'Can treat plague victims with some success.' },
            10: { name: 'Plague Breaker', description: 'Can stop epidemics. Legendary disease knowledge.' }
          }
        },
        poison_craft: {
          name: 'Poison Craft',
          description: 'Creating and using poisons.',
          unlock_requirement: 'medicine >= 3 AND herbalism >= 2',
          passives: {
            3: { name: 'Poisoner', description: 'Can create basic poisons.' },
            6: { name: 'Master Poisoner', description: 'Create complex, undetectable poisons.' },
            10: { name: 'Legendary Poisoner', description: 'Can create any poison. Undetectable, untraceable.' }
          }
        }
      }
    },

    cooking: {
      name: 'Cooking',
      description: 'Preparing food. From field rations to noble feasts.',
      icon: '🍖',
      category: 'craft',
      starting_level: 1,
      passives: {
        3: { name: 'Good Cook', description: 'Food is tasty and nutritious. Morale bonus for those you feed.' },
        6: { name: 'Skilled Cook', description: 'Excellent food. People seek you out. +10 to cooking.' },
        10: { name: 'Master Chef', description: 'Legendary cooking. Your food is an experience.' }
      },
      branches: {
        field_cooking: {
          name: 'Field Cooking',
          description: 'Cooking in difficult conditions with limited resources.',
          unlock_requirement: 'cooking >= 1',
          passives: {
            3: { name: 'Camp Cook', description: 'Can make good food from minimal ingredients.' },
            6: { name: 'Army Cook', description: 'Can feed large groups efficiently in the field.' },
            10: { name: 'Miracle Cook', description: 'Can make excellent food from almost nothing.' }
          }
        },
        feast_preparation: {
          name: 'Feast Preparation',
          description: 'Preparing elaborate feasts for noble occasions.',
          unlock_requirement: 'cooking >= 4 AND etiquette >= 2',
          passives: {
            3: { name: 'Feast Cook', description: 'Can prepare impressive feasts.' },
            6: { name: 'Master Feast Maker', description: 'Your feasts are legendary. Nobles compete for your services.' },
            10: { name: 'Royal Chef', description: 'Can prepare feasts worthy of kings.' }
          }
        },
        poison_detection: {
          name: 'Poison Detection',
          description: 'Identifying poisons in food and drink.',
          unlock_requirement: 'cooking >= 2 AND medicine >= 1',
          passives: {
            3: { name: 'Taster', description: 'Can detect common poisons in food.' },
            6: { name: 'Poison Expert', description: 'Can detect subtle poisons. Hard to fool.' },
            10: { name: 'Infallible Taster', description: 'Cannot be poisoned through food. Detect any poison.' }
          }
        }
      }
    },

    engineering: {
      name: 'Engineering',
      description: 'Designing and building complex structures and machines.',
      icon: '⚙️',
      category: 'craft',
      starting_level: 0,
      passives: {
        3: { name: 'Builder\'s Eye', description: 'Can assess structural integrity and design flaws.' },
        6: { name: 'Engineer', description: 'Can design and build complex structures. +10 to engineering.' },
        10: { name: 'Master Engineer', description: 'Legendary engineering. Can build anything conceivable.' }
      },
      branches: {
        siege_weapons: {
          name: 'Siege Weapons',
          description: 'Building and operating siege weapons.',
          unlock_requirement: 'engineering >= 2',
          passives: {
            3: { name: 'Siege Operator', description: 'Can operate trebuchets, catapults, and other siege weapons.' },
            6: { name: 'Siege Builder', description: 'Can build siege weapons in the field.' },
            10: { name: 'Siege Master', description: 'Can build and operate any siege weapon. Legendary siege engineering.' }
          }
        },
        fortification_design: {
          name: 'Fortification Design',
          description: 'Designing defensive structures.',
          unlock_requirement: 'engineering >= 3',
          passives: {
            3: { name: 'Fortification Designer', description: 'Can design effective defensive structures.' },
            6: { name: 'Castle Designer', description: 'Can design impressive castles and fortifications.' },
            10: { name: 'Master Fortifier', description: 'Your fortifications are impregnable. Legendary design.' }
          }
        },
        infrastructure: {
          name: 'Infrastructure',
          description: 'Building roads, bridges, mills, and other infrastructure.',
          unlock_requirement: 'engineering >= 3',
          passives: {
            3: { name: 'Infrastructure Builder', description: 'Can build roads, bridges, and basic infrastructure.' },
            6: { name: 'Master Builder', description: 'Can build impressive infrastructure that lasts generations.' },
            10: { name: 'Civilization Builder', description: 'Can transform regions through infrastructure. Legendary engineering.' }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // KNOWLEDGE
    // ─────────────────────────────────────────────────────────────
    reading: {
      name: 'Reading',
      description: 'Literacy and the ability to access written knowledge.',
      icon: '📖',
      category: 'knowledge',
      starting_level: 0,
      passives: {
        3: { name: 'Literate', description: 'Can read and write in your native language.' },
        6: { name: 'Scholar', description: 'Can read complex texts. Access to written knowledge.' },
        10: { name: 'Master Scholar', description: 'Can read any text. Extraordinary comprehension and retention.' }
      },
      branches: {
        latin: {
          name: 'Latin',
          description: 'Reading and writing in Latin, the language of the Church and scholarship.',
          unlock_requirement: 'reading >= 2',
          passives: {
            3: { name: 'Latin Reader', description: 'Can read basic Latin texts.' },
            6: { name: 'Latin Scholar', description: 'Can read complex Latin. Access to Church and scholarly texts.' },
            10: { name: 'Latin Master', description: 'Fluent in Latin. Can access all written knowledge of the age.' }
          }
        },
        classical_education: {
          name: 'Classical Education',
          description: 'Knowledge of ancient Greek and Roman texts.',
          unlock_requirement: 'reading >= 4 AND latin >= 3',
          passives: {
            3: { name: 'Classical Reader', description: 'Can read classical texts. Access to ancient knowledge.' },
            6: { name: 'Classical Scholar', description: 'Deep knowledge of classical philosophy and science.' },
            10: { name: 'Renaissance Man', description: 'Extraordinary classical knowledge. Can apply ancient wisdom to modern problems.' }
          }
        },
        cartography: {
          name: 'Cartography',
          description: 'Reading and creating maps.',
          unlock_requirement: 'reading >= 2 AND navigation >= 2',
          passives: {
            3: { name: 'Map Reader', description: 'Can read and use maps effectively.' },
            6: { name: 'Cartographer', description: 'Can create accurate maps. Valuable skill.' },
            10: { name: 'Master Cartographer', description: 'Can create extraordinary maps. Your maps are sought by kings.' }
          }
        },
        codebreaking: {
          name: 'Codebreaking',
          description: 'Deciphering coded messages and creating codes.',
          unlock_requirement: 'reading >= 3 AND espionage >= 2',
          passives: {
            3: { name: 'Code Reader', description: 'Can break simple codes and ciphers.' },
            6: { name: 'Cryptographer', description: 'Can break complex codes. Create unbreakable ciphers.' },
            10: { name: 'Master Cryptographer', description: 'Can break any code. Your ciphers are unbreakable.' }
          }
        }
      }
    },

    law: {
      name: 'Law',
      description: 'Knowledge of legal systems, rights, and how to use them.',
      icon: '⚖️',
      category: 'knowledge',
      starting_level: 0,
      passives: {
        3: { name: 'Legal Awareness', description: 'Know your basic rights and how the law works.' },
        6: { name: 'Legal Expert', description: 'Can navigate legal systems effectively. +10 to law checks.' },
        10: { name: 'Master of Law', description: 'Legendary legal knowledge. Can win any case, exploit any loophole.' }
      },
      branches: {
        local_custom: {
          name: 'Local Custom',
          description: 'Knowledge of local laws and customs.',
          unlock_requirement: 'law >= 1',
          passives: {
            3: { name: 'Local Expert', description: 'Know local laws and customs thoroughly.' },
            6: { name: 'Custom Master', description: 'Can use local customs to your advantage.' },
            10: { name: 'Legal Manipulator', description: 'Can exploit local customs to achieve any legal goal.' }
          }
        },
        canon_law: {
          name: 'Canon Law',
          description: 'Church law and ecclesiastical legal systems.',
          unlock_requirement: 'law >= 2 AND theology >= 2',
          passives: {
            3: { name: 'Church Law', description: 'Know basic Church law and how it applies.' },
            6: { name: 'Canon Lawyer', description: 'Can navigate Church legal systems effectively.' },
            10: { name: 'Master Canon Lawyer', description: 'Can use Church law to achieve almost any goal.' }
          }
        },
        royal_law: {
          name: 'Royal Law',
          description: 'The law of kings and nobles.',
          unlock_requirement: 'law >= 3',
          passives: {
            3: { name: 'Royal Law Expert', description: 'Know royal law and how it applies.' },
            6: { name: 'Royal Lawyer', description: 'Can navigate royal legal systems effectively.' },
            10: { name: 'Master Royal Lawyer', description: 'Can use royal law to achieve almost any goal.' }
          }
        },
        trial_advocacy: {
          name: 'Trial Advocacy',
          description: 'Arguing cases in court.',
          unlock_requirement: 'law >= 3 AND speech >= 3',
          passives: {
            3: { name: 'Advocate', description: 'Can argue cases in court effectively.' },
            6: { name: 'Master Advocate', description: 'Rarely lose cases. Juries and judges favor you.' },
            10: { name: 'Legendary Advocate', description: 'Can win any case. Legendary courtroom presence.' }
          }
        },
        legislative_power: {
          name: 'Legislative Power',
          description: 'Creating and changing laws.',
          unlock_requirement: 'law >= 6 AND command >= 4',
          passives: {
            3: { name: 'Lawmaker', description: 'Can propose and influence laws.' },
            6: { name: 'Master Lawmaker', description: 'Can create lasting legal changes.' },
            10: { name: 'Law Giver', description: 'Can reshape legal systems. Your laws outlast you.' }
          }
        }
      }
    },

    heraldry: {
      name: 'Heraldry',
      description: 'Knowledge of noble houses, coats of arms, and the language of nobility.',
      icon: '🏰',
      category: 'knowledge',
      starting_level: 0,
      passives: {
        3: { name: 'Herald\'s Eye', description: 'Can identify noble houses by their symbols.' },
        6: { name: 'Heraldry Expert', description: 'Know the heraldry of all major noble houses.' },
        10: { name: 'Master Herald', description: 'Legendary heraldry knowledge. Know every house, every claim.' }
      },
      branches: {
        noble_identification: {
          name: 'Noble Identification',
          description: 'Identifying nobles and their houses.',
          unlock_requirement: 'heraldry >= 1',
          passives: {
            3: { name: 'Noble Spotter', description: 'Can identify most nobles by their heraldry.' },
            6: { name: 'Genealogist', description: 'Know the family trees of major noble houses.' },
            10: { name: 'Living Encyclopedia', description: 'Know every noble family in France and beyond.' }
          }
        },
        lineage_tracking: {
          name: 'Lineage Tracking',
          description: 'Tracing family lines and inheritance claims.',
          unlock_requirement: 'heraldry >= 2',
          passives: {
            3: { name: 'Lineage Expert', description: 'Can trace family lines and identify inheritance claims.' },
            6: { name: 'Genealogy Master', description: 'Can find obscure claims and connections.' },
            10: { name: 'Claim Finder', description: 'Can find or construct legitimate claims to any title.' }
          }
        },
        fabricate_claims: {
          name: 'Fabricate Claims',
          description: 'Creating false but convincing noble claims.',
          unlock_requirement: 'heraldry >= 4 AND deception >= 3',
          passives: {
            3: { name: 'Claim Fabricator', description: 'Can create plausible false noble claims.' },
            6: { name: 'Master Fabricator', description: 'Create convincing false claims that withstand scrutiny.' },
            10: { name: 'Legendary Fabricator', description: 'Can create unassailable false claims. Become anyone.' }
          }
        }
      }
    },

    theology: {
      name: 'Theology',
      description: 'Knowledge of religion, the Church, and spiritual matters.',
      icon: '✝️',
      category: 'knowledge',
      starting_level: 1,
      passives: {
        3: { name: 'Faithful', description: 'Understand Church teachings. Can participate in religious life.' },
        6: { name: 'Theologian', description: 'Deep religious knowledge. Can debate theology.' },
        10: { name: 'Master Theologian', description: 'Legendary theological knowledge. Can interpret scripture authoritatively.' }
      },
      branches: {
        preaching: {
          name: 'Preaching',
          description: 'Delivering sermons and religious instruction.',
          unlock_requirement: 'theology >= 2 AND speech >= 2',
          passives: {
            3: { name: 'Preacher', description: 'Can deliver effective sermons.' },
            6: { name: 'Inspiring Preacher', description: 'Your sermons move people. Gain followers.' },
            10: { name: 'Prophet', description: 'Legendary preaching. Can inspire religious movements.' }
          }
        },
        inquisition_knowledge: {
          name: 'Inquisition Knowledge',
          description: 'Understanding how the Inquisition works and how to avoid it.',
          unlock_requirement: 'theology >= 3',
          passives: {
            3: { name: 'Inquisition Aware', description: 'Know how the Inquisition operates. Avoid suspicion.' },
            6: { name: 'Inquisition Expert', description: 'Can navigate Inquisition investigations. Help others avoid it.' },
            10: { name: 'Inquisition Master', description: 'Can manipulate Inquisition processes. Use it as a weapon.' }
          }
        },
        papal_politics: {
          name: 'Papal Politics',
          description: 'Understanding and navigating Church politics.',
          unlock_requirement: 'theology >= 4 AND etiquette >= 3',
          passives: {
            3: { name: 'Church Politician', description: 'Understand Church political dynamics.' },
            6: { name: 'Papal Advisor', description: 'Can navigate Church politics effectively.' },
            10: { name: 'Church Power Broker', description: 'Can influence Church decisions at the highest level.' }
          }
        },
        excommunication_defense: {
          name: 'Excommunication Defense',
          description: 'Defending against or reversing excommunication.',
          unlock_requirement: 'theology >= 4 AND law >= 3',
          passives: {
            3: { name: 'Excommunication Expert', description: 'Know how excommunication works and how to fight it.' },
            6: { name: 'Defender of Faith', description: 'Can defend against excommunication effectively.' },
            10: { name: 'Untouchable', description: 'Cannot be effectively excommunicated. Know every defense.' }
          }
        }
      }
    },

    history: {
      name: 'History',
      description: 'Knowledge of the past and how it shapes the present.',
      icon: '📜',
      category: 'knowledge',
      starting_level: 0,
      passives: {
        3: { name: 'Historically Aware', description: 'Know major historical events and their significance.' },
        6: { name: 'Historian', description: 'Deep historical knowledge. Can draw lessons from the past.' },
        10: { name: 'Master Historian', description: 'Legendary historical knowledge. Can predict future from past patterns.' }
      },
      branches: {
        military_history: {
          name: 'Military History',
          description: 'Knowledge of past battles and military campaigns.',
          unlock_requirement: 'history >= 2',
          passives: {
            3: { name: 'Battle Student', description: 'Know famous battles and their lessons.' },
            6: { name: 'Military Historian', description: 'Can apply historical military lessons to current situations.' },
            10: { name: 'Tactical Genius', description: 'Historical knowledge informs brilliant tactical decisions.' }
          }
        },
        dynastic_knowledge: {
          name: 'Dynastic Knowledge',
          description: 'Knowledge of royal and noble family histories.',
          unlock_requirement: 'history >= 2 AND heraldry >= 1',
          passives: {
            3: { name: 'Dynastic Expert', description: 'Know the histories of major dynasties.' },
            6: { name: 'Dynastic Scholar', description: 'Know obscure dynastic connections and claims.' },
            10: { name: 'Dynastic Master', description: 'Know every dynastic claim and connection in Europe.' }
          }
        },
        legendary_precedent: {
          name: 'Legendary Precedent',
          description: 'Using historical precedent to justify actions.',
          unlock_requirement: 'history >= 4 AND law >= 2',
          passives: {
            3: { name: 'Precedent Finder', description: 'Can find historical precedents to justify actions.' },
            6: { name: 'Precedent Master', description: 'Can find precedents for almost anything.' },
            10: { name: 'History Weaponizer', description: 'Can use history to justify any action. Legendary precedent knowledge.' }
          }
        }
      }
    },

    tactics: {
      name: 'Tactics',
      description: 'The art of military strategy and battlefield decision-making.',
      icon: '♟️',
      category: 'knowledge',
      starting_level: 0,
      passives: {
        3: { name: 'Tactical Thinker', description: 'Can assess battlefield situations quickly.' },
        6: { name: 'Tactician', description: 'Excellent tactical decision-making. +10 to tactics checks.' },
        10: { name: 'Master Tactician', description: 'Legendary tactical genius. Can win battles against overwhelming odds.' }
      },
      branches: {
        ambush_planning: {
          name: 'Ambush Planning',
          description: 'Setting up and executing ambushes.',
          unlock_requirement: 'tactics >= 2 AND stealth >= 2',
          passives: {
            3: { name: 'Ambush Planner', description: 'Can plan effective ambushes.' },
            6: { name: 'Master Ambusher', description: 'Ambushes are devastating. Enemies rarely escape.' },
            10: { name: 'Ambush Legend', description: 'Legendary ambush planning. Can destroy forces many times your size.' }
          }
        },
        formation_command: {
          name: 'Formation Command',
          description: 'Commanding troops in formation.',
          unlock_requirement: 'tactics >= 3 AND command >= 3',
          passives: {
            3: { name: 'Formation Expert', description: 'Can command troops in various formations effectively.' },
            6: { name: 'Formation Master', description: 'Troops in your formations fight at peak effectiveness.' },
            10: { name: 'Formation Legend', description: 'Your formations are legendary. Enemies cannot break them.' }
          }
        },
        siege_strategy: {
          name: 'Siege Strategy',
          description: 'Strategic planning for sieges.',
          unlock_requirement: 'tactics >= 3 AND engineering >= 2',
          passives: {
            3: { name: 'Siege Strategist', description: 'Can plan effective sieges.' },
            6: { name: 'Siege Master', description: 'Can take any fortification given time and resources.' },
            10: { name: 'Siege Legend', description: 'No fortification can withstand your siege strategy.' }
          }
        },
        grand_strategy: {
          name: 'Grand Strategy',
          description: 'Strategic planning at the campaign and war level.',
          unlock_requirement: 'tactics >= 5 AND command >= 4',
          passives: {
            3: { name: 'Campaign Planner', description: 'Can plan effective military campaigns.' },
            6: { name: 'Grand Strategist', description: 'Can plan and execute complex multi-front campaigns.' },
            10: { name: 'Military Genius', description: 'Legendary grand strategy. Can win wars against impossible odds.' }
          }
        }
      }
    },

    languages: {
      name: 'Languages',
      description: 'Speaking and understanding foreign languages.',
      icon: '🌍',
      category: 'knowledge',
      starting_level: 0,
      // Languages are handled differently - each is a sub-skill
      sub_skills: {
        norman_french: { name: 'Norman French', starting_level: 10, description: 'Your native tongue.' },
        parisian_french: { name: 'Parisian French', starting_level: 0, description: 'The prestige dialect of the French court.' },
        latin: { name: 'Latin', starting_level: 0, description: 'The language of the Church and scholarship.' },
        english: { name: 'English', starting_level: 0, description: 'The language of England.' },
        italian: { name: 'Italian', starting_level: 0, description: 'The language of Italy and trade.' },
        german: { name: 'German', starting_level: 0, description: 'The language of the Holy Roman Empire.' },
        occitan: { name: 'Occitan', starting_level: 0, description: 'The language of southern France and troubadours.' },
        flemish: { name: 'Flemish', starting_level: 0, description: 'The language of Flanders and trade.' },
        arabic: { name: 'Arabic', starting_level: 0, description: 'The language of the Islamic world and scholarship.' }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // COVERT
    // ─────────────────────────────────────────────────────────────
    stealth: {
      name: 'Stealth',
      description: 'Moving unseen and unheard. The art of not being noticed.',
      icon: '👤',
      category: 'covert',
      starting_level: 2,
      passives: {
        3: { name: 'Shadow Walker', description: 'Can move quietly in most conditions.' },
        6: { name: 'Ghost', description: 'Nearly impossible to detect when hiding. +10 to stealth.' },
        10: { name: 'Invisible', description: 'Legendary stealth. Can pass through guarded areas undetected.' }
      },
      branches: {
        urban_stealth: {
          name: 'Urban Stealth',
          description: 'Moving unseen in cities and towns.',
          unlock_requirement: 'stealth >= 2',
          passives: {
            3: { name: 'City Shadow', description: 'Can move through cities without being noticed.' },
            6: { name: 'Urban Ghost', description: 'Can follow people through cities without detection.' },
            10: { name: 'City Phantom', description: 'Legendary urban stealth. Can infiltrate any building.' }
          }
        },
        wilderness_camouflage: {
          name: 'Wilderness Camouflage',
          description: 'Hiding in natural environments.',
          unlock_requirement: 'stealth >= 2 AND survival >= 2',
          passives: {
            3: { name: 'Forest Shadow', description: 'Can hide effectively in forests and wilderness.' },
            6: { name: 'Nature\'s Ghost', description: 'Can become nearly invisible in natural environments.' },
            10: { name: 'Wilderness Phantom', description: 'Legendary wilderness camouflage. Can hide in plain sight.' }
          }
        },
        infiltration: {
          name: 'Infiltration',
          description: 'Entering secured locations without authorization.',
          unlock_requirement: 'stealth >= 4 AND lockpicking >= 2',
          passives: {
            3: { name: 'Infiltrator', description: 'Can enter most secured locations.' },
            6: { name: 'Master Infiltrator', description: 'Can infiltrate heavily guarded locations.' },
            10: { name: 'Legendary Infiltrator', description: 'No location is secure against you.' }
          }
        },
        ghost: {
          name: 'Ghost',
          description: 'Complete mastery of stealth and invisibility.',
          unlock_requirement: 'stealth >= 7 AND infiltration >= 4',
          passives: {
            3: { name: 'Shadow', description: 'Can move through any environment without detection.' },
            6: { name: 'Phantom', description: 'People doubt you exist. No evidence of your presence.' },
            10: { name: 'Ghost', description: 'Legendary stealth mastery. Can be anywhere, seen by no one.' }
          }
        }
      }
    },

    lockpicking: {
      name: 'Lockpicking',
      description: 'Opening locks without keys. The thief\'s essential skill.',
      icon: '🔓',
      category: 'covert',
      starting_level: 0,
      passives: {
        3: { name: 'Lock Sense', description: 'Can feel the mechanism of a lock. +5 to lockpicking.' },
        6: { name: 'Master Picker', description: 'Can open most locks quickly. +10 to lockpicking.' },
        10: { name: 'Legendary Lockpick', description: 'No lock can stop you. Can open anything.' }
      },
      branches: {
        safe_cracking: {
          name: 'Safe Cracking',
          description: 'Opening complex strongboxes and safes.',
          unlock_requirement: 'lockpicking >= 4',
          passives: {
            3: { name: 'Safe Cracker', description: 'Can open most strongboxes.' },
            6: { name: 'Master Safe Cracker', description: 'Can open complex safes and strongboxes.' },
            10: { name: 'Legendary Safe Cracker', description: 'No strongbox can stop you.' }
          }
        },
        trap_disarm: {
          name: 'Trap Disarm',
          description: 'Detecting and disarming traps.',
          unlock_requirement: 'lockpicking >= 2',
          passives: {
            3: { name: 'Trap Finder', description: 'Can detect most traps.' },
            6: { name: 'Trap Disarmer', description: 'Can disarm complex traps safely.' },
            10: { name: 'Trap Master', description: 'Can detect and disarm any trap. Can also set them.' }
          }
        }
      }
    },

    pickpocket: {
      name: 'Pickpocket',
      description: 'Stealing from people without their knowledge.',
      icon: '✋',
      category: 'covert',
      starting_level: 0,
      passives: {
        3: { name: 'Light Fingers', description: 'Can steal small items without detection.' },
        6: { name: 'Master Thief', description: 'Can steal almost anything from anyone. +10 to pickpocket.' },
        10: { name: 'Legendary Thief', description: 'Can steal anything from anyone. Undetectable.' }
      },
      branches: {
        plant_evidence: {
          name: 'Plant Evidence',
          description: 'Placing items on people without their knowledge.',
          unlock_requirement: 'pickpocket >= 3',
          passives: {
            3: { name: 'Evidence Planter', description: 'Can plant items on people to frame them.' },
            6: { name: 'Master Framer', description: 'Can frame anyone for anything.' },
            10: { name: 'Legendary Framer', description: 'Can destroy anyone through planted evidence.' }
          }
        },
        cutpurse_master: {
          name: 'Cutpurse Master',
          description: 'Stealing purses and valuables in crowds.',
          unlock_requirement: 'pickpocket >= 3',
          passives: {
            3: { name: 'Cutpurse', description: 'Can steal purses in crowds efficiently.' },
            6: { name: 'Master Cutpurse', description: 'Can steal from multiple targets in quick succession.' },
            10: { name: 'Legendary Cutpurse', description: 'Can steal from anyone in any situation.' }
          }
        }
      }
    },

    forgery_skill: {
      name: 'Forgery',
      description: 'Creating false documents, seals, and written materials.',
      icon: '📝',
      category: 'covert',
      starting_level: 0,
      passives: {
        3: { name: 'Forger', description: 'Can create convincing false documents.' },
        6: { name: 'Master Forger', description: 'Can forge complex documents and seals. +10 to forgery.' },
        10: { name: 'Legendary Forger', description: 'Can forge anything. Undetectable forgeries.' }
      },
      branches: {
        document_forgery: {
          name: 'Document Forgery',
          description: 'Forging official documents.',
          unlock_requirement: 'forgery_skill >= 2 AND reading >= 2',
          passives: {
            3: { name: 'Document Forger', description: 'Can forge basic official documents.' },
            6: { name: 'Master Document Forger', description: 'Can forge complex official documents.' },
            10: { name: 'Legendary Document Forger', description: 'Can forge any document. Undetectable.' }
          }
        },
        seal_forgery: {
          name: 'Seal Forgery',
          description: 'Replicating official seals and stamps.',
          unlock_requirement: 'forgery_skill >= 3 AND smithing >= 2',
          passives: {
            3: { name: 'Seal Forger', description: 'Can replicate common seals.' },
            6: { name: 'Master Seal Forger', description: 'Can replicate any seal.' },
            10: { name: 'Legendary Seal Forger', description: 'Can replicate any seal perfectly. Undetectable.' }
          }
        },
        identity_fabrication: {
          name: 'Identity Fabrication',
          description: 'Creating complete false identities with documentation.',
          unlock_requirement: 'forgery_skill >= 4 AND deception >= 3',
          passives: {
            3: { name: 'Identity Forger', description: 'Can create basic false identities.' },
            6: { name: 'Master Identity Forger', description: 'Can create complete, convincing false identities.' },
            10: { name: 'Legendary Identity Forger', description: 'Can create any identity. Undetectable.' }
          }
        }
      }
    },

    espionage: {
      name: 'Espionage',
      description: 'The art of intelligence gathering and covert operations.',
      icon: '🕵️',
      category: 'covert',
      starting_level: 0,
      passives: {
        3: { name: 'Spy', description: 'Can gather intelligence effectively.' },
        6: { name: 'Master Spy', description: 'Excellent intelligence gathering. +10 to espionage.' },
        10: { name: 'Spymaster', description: 'Legendary espionage. Can run complex intelligence networks.' }
      },
      branches: {
        intelligence_network: {
          name: 'Intelligence Network',
          description: 'Building and managing spy networks.',
          unlock_requirement: 'espionage >= 3',
          passives: {
            3: { name: 'Network Builder', description: 'Can recruit and manage a small spy network.' },
            6: { name: 'Network Master', description: 'Can run a large, effective spy network.' },
            10: { name: 'Shadow Empire', description: 'Legendary spy network. Know everything that happens.' }
          }
        },
        counter_intelligence: {
          name: 'Counter Intelligence',
          description: 'Detecting and neutralizing enemy spies.',
          unlock_requirement: 'espionage >= 3',
          passives: {
            3: { name: 'Spy Hunter', description: 'Can detect enemy spies.' },
            6: { name: 'Counter Intelligence Expert', description: 'Can neutralize enemy spy networks.' },
            10: { name: 'Shadow Breaker', description: 'Can destroy any enemy intelligence operation.' }
          }
        },
        shadow_war: {
          name: 'Shadow War',
          description: 'Conducting covert warfare through assassination, sabotage, and manipulation.',
          unlock_requirement: 'espionage >= 5 AND intelligence_network >= 3',
          passives: {
            3: { name: 'Shadow Warrior', description: 'Can conduct covert operations effectively.' },
            6: { name: 'Shadow War Master', description: 'Can wage effective covert warfare.' },
            10: { name: 'Shadow King', description: 'Legendary covert warfare. Can topple kingdoms from the shadows.' }
          }
        }
      }
    },

    // ─────────────────────────────────────────────────────────────
    // TRAVEL & EXPLORATION
    // ─────────────────────────────────────────────────────────────
    horsemanship: {
      name: 'Horsemanship',
      description: 'Riding and working with horses.',
      icon: '🐴',
      category: 'travel',
      starting_level: 1,
      passives: {
        3: { name: 'Rider', description: 'Can ride horses competently in most situations.' },
        6: { name: 'Skilled Rider', description: 'Excellent horsemanship. +10 to horsemanship checks.' },
        10: { name: 'Master Horseman', description: 'Legendary horsemanship. Horse and rider are one.' }
      },
      branches: {
        mounted_combat: {
          name: 'Mounted Combat',
          description: 'Fighting from horseback.',
          unlock_requirement: 'horsemanship >= 3',
          passives: {
            3: { name: 'Mounted Fighter', description: 'Can fight effectively from horseback.' },
            6: { name: 'Cavalry Warrior', description: 'Devastating mounted combat. +15 to mounted attacks.' },
            10: { name: 'Legendary Cavalry', description: 'Legendary mounted combat. Can charge through infantry.' }
          }
        },
        horse_archery: {
          name: 'Horse Archery',
          description: 'Shooting a bow from horseback.',
          unlock_requirement: 'horsemanship >= 4 AND archery >= 3',
          passives: {
            3: { name: 'Horse Archer', description: 'Can shoot from horseback without penalty.' },
            6: { name: 'Master Horse Archer', description: 'Devastating horse archery. Can shoot while galloping.' },
            10: { name: 'Legendary Horse Archer', description: 'Legendary horse archery. Can hit any target at any speed.' }
          }
        },
        cavalry_charge: {
          name: 'Cavalry Charge',
          description: 'Leading devastating cavalry charges.',
          unlock_requirement: 'horsemanship >= 5 AND mounted_combat >= 3',
          passives: {
            3: { name: 'Charge Leader', description: 'Can lead effective cavalry charges.' },
            6: { name: 'Charge Master', description: 'Devastating cavalry charges. Break infantry formations.' },
            10: { name: 'Legendary Charger', description: 'Legendary cavalry charges. Can break any formation.' }
          }
        },
        horse_breeding: {
          name: 'Horse Breeding',
          description: 'Breeding and training horses.',
          unlock_requirement: 'horsemanship >= 3 AND animal_husbandry >= 2',
          passives: {
            3: { name: 'Horse Breeder', description: 'Can breed horses for desired traits.' },
            6: { name: 'Master Breeder', description: 'Can breed exceptional horses.' },
            10: { name: 'Legendary Breeder', description: 'Can breed legendary horses. Sought by kings.' }
          }
        }
      }
    },

    navigation: {
      name: 'Navigation',
      description: 'Finding your way across land and sea.',
      icon: '🧭',
      category: 'travel',
      starting_level: 1,
      passives: {
        3: { name: 'Wayfinder', description: 'Rarely get lost. Can navigate by landmarks.' },
        6: { name: 'Navigator', description: 'Excellent navigation. +10 to navigation checks.' },
        10: { name: 'Master Navigator', description: 'Legendary navigation. Can find any destination.' }
      },
      branches: {
        sea_navigation: {
          name: 'Sea Navigation',
          description: 'Navigating at sea.',
          unlock_requirement: 'navigation >= 3 AND seamanship >= 2',
          passives: {
            3: { name: 'Sea Navigator', description: 'Can navigate coastal waters.' },
            6: { name: 'Ocean Navigator', description: 'Can navigate open ocean.' },
            10: { name: 'Legendary Sea Navigator', description: 'Can navigate any sea in any conditions.' }
          }
        },
        star_reading: {
          name: 'Star Reading',
          description: 'Navigating by the stars.',
          unlock_requirement: 'navigation >= 2',
          passives: {
            3: { name: 'Star Reader', description: 'Can navigate by stars at night.' },
            6: { name: 'Celestial Navigator', description: 'Can determine exact position by stars.' },
            10: { name: 'Legendary Star Reader', description: 'Can navigate anywhere using celestial bodies.' }
          }
        },
        pathfinding: {
          name: 'Pathfinding',
          description: 'Finding the best route through any terrain.',
          unlock_requirement: 'navigation >= 2 AND survival >= 2',
          passives: {
            3: { name: 'Pathfinder', description: 'Can find good routes through difficult terrain.' },
            6: { name: 'Master Pathfinder', description: 'Can find optimal routes through any terrain.' },
            10: { name: 'Legendary Pathfinder', description: 'Can find paths where none exist.' }
          }
        }
      }
    },

    seamanship: {
      name: 'Seamanship',
      description: 'Operating ships and surviving at sea.',
      icon: '⚓',
      category: 'travel',
      starting_level: 0,
      passives: {
        3: { name: 'Sailor', description: 'Can crew a ship competently.' },
        6: { name: 'Skilled Sailor', description: 'Excellent seamanship. +10 to seamanship checks.' },
        10: { name: 'Master Sailor', description: 'Legendary seamanship. Can sail any ship in any conditions.' }
      },
      branches: {
        ship_combat: {
          name: 'Ship Combat',
          description: 'Fighting at sea.',
          unlock_requirement: 'seamanship >= 3',
          passives: {
            3: { name: 'Sea Fighter', description: 'Can fight effectively in naval combat.' },
            6: { name: 'Naval Warrior', description: 'Excellent naval combat. +15 to ship combat.' },
            10: { name: 'Legendary Naval Fighter', description: 'Legendary naval combat. Can win any sea battle.' }
          }
        },
        fleet_command: {
          name: 'Fleet Command',
          description: 'Commanding multiple ships in battle.',
          unlock_requirement: 'seamanship >= 5 AND command >= 4',
          passives: {
            3: { name: 'Fleet Commander', description: 'Can command a small fleet effectively.' },
            6: { name: 'Admiral', description: 'Can command large fleets. Excellent naval tactics.' },
            10: { name: 'Legendary Admiral', description: 'Legendary fleet command. Can win naval wars.' }
          }
        },
        piracy: {
          name: 'Piracy',
          description: 'Raiding ships and coastal settlements.',
          unlock_requirement: 'seamanship >= 3 AND ship_combat >= 2',
          passives: {
            3: { name: 'Pirate', description: 'Can conduct effective piracy.' },
            6: { name: 'Pirate Captain', description: 'Feared pirate. Ships flee at your approach.' },
            10: { name: 'Legendary Pirate', description: 'Legendary piracy. Control sea lanes.' }
          }
        }
      }
    },

    survival: {
      name: 'Survival',
      description: 'Staying alive in harsh conditions. Finding food, shelter, and safety.',
      icon: '🌲',
      category: 'travel',
      starting_level: 2,
      passives: {
        3: { name: 'Survivor', description: 'Can survive in most environments.' },
        6: { name: 'Wilderness Expert', description: 'Thrive in harsh conditions. +10 to survival.' },
        10: { name: 'Master Survivor', description: 'Legendary survival. Can survive anywhere.' }
      },
      branches: {
        desert_survival: {
          name: 'Desert Survival',
          description: 'Surviving in arid environments.',
          unlock_requirement: 'survival >= 3',
          passives: {
            3: { name: 'Desert Walker', description: 'Can survive in desert conditions.' },
            6: { name: 'Desert Expert', description: 'Thrive in desert environments.' },
            10: { name: 'Desert Master', description: 'Legendary desert survival. Can cross any desert.' }
          }
        },
        mountain_survival: {
          name: 'Mountain Survival',
          description: 'Surviving in mountain environments.',
          unlock_requirement: 'survival >= 3 AND climbing >= 2',
          passives: {
            3: { name: 'Mountain Walker', description: 'Can survive in mountain conditions.' },
            6: { name: 'Mountain Expert', description: 'Thrive in mountain environments.' },
            10: { name: 'Mountain Master', description: 'Legendary mountain survival. Can cross any mountain range.' }
          }
        },
        urban_survival: {
          name: 'Urban Survival',
          description: 'Surviving in cities without resources.',
          unlock_requirement: 'survival >= 2',
          passives: {
            3: { name: 'Street Survivor', description: 'Can survive on city streets without money.' },
            6: { name: 'Urban Expert', description: 'Thrive in urban environments. Find resources anywhere.' },
            10: { name: 'Urban Master', description: 'Legendary urban survival. Can thrive in any city.' }
          }
        },
        war_zone_survival: {
          name: 'War Zone Survival',
          description: 'Surviving in active combat zones.',
          unlock_requirement: 'survival >= 4 AND endurance >= 3',
          passives: {
            3: { name: 'War Survivor', description: 'Can survive in active war zones.' },
            6: { name: 'War Zone Expert', description: 'Thrive in war zones. Find safety and resources.' },
            10: { name: 'War Zone Master', description: 'Legendary war zone survival. Can survive anything.' }
          }
        }
      }
    }
  }
};

// XP thresholds for each level
export const XP_THRESHOLDS = [
  0,    // Level 0 → 1: 30 XP
  30,   // Level 1 → 2: 60 XP
  90,   // Level 2 → 3: 100 XP
  190,  // Level 3 → 4: 150 XP
  340,  // Level 4 → 5: 200 XP
  540,  // Level 5 → 6: 260 XP
  800,  // Level 6 → 7: 330 XP
  1130, // Level 7 → 8: 400 XP
  1530, // Level 8 → 9: 470 XP
  2000  // Level 9 → 10: 540 XP
];

// XP needed to go from level N to N+1
export const XP_PER_LEVEL = [30, 60, 100, 150, 200, 260, 330, 400, 470, 540];

export default SKILL_TREE_DATA;
// END FILE: client/js/data/skill-tree-data.js
