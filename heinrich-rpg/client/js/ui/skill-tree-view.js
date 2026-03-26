// FILE: client/js/ui/skill-tree-view.js — PART 10

(function (global) {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────────

  var SKILL_CATEGORIES = {
    combat: {
      label: 'Combat',
      icon: '⚔️',
      skills: ['brawling', 'sword', 'dagger', 'axe', 'archery', 'polearms', 'shield', 'unarmed']
    },
    physical: {
      label: 'Physical',
      icon: '💪',
      skills: ['strength', 'agility', 'endurance', 'swimming', 'climbing']
    },
    social: {
      label: 'Social',
      icon: '🗣️',
      skills: ['speech', 'deception', 'intimidation', 'haggle', 'etiquette', 'command', 'seduction', 'read_people', 'performance']
    },
    craft_knowledge: {
      label: 'Craft & Knowledge',
      icon: '📚',
      skills: ['stewardship', 'smithing', 'carpentry', 'agriculture', 'hunting', 'medicine', 'cooking', 'engineering', 'reading', 'law', 'heraldry', 'theology', 'history', 'tactics']
    },
    languages: {
      label: 'Languages',
      icon: '📜',
      skills: ['norman_french', 'parisian_french', 'latin', 'english', 'italian', 'german', 'occitan', 'flemish', 'arabic']
    },
    stealth_crime: {
      label: 'Stealth & Crime',
      icon: '🗡️',
      skills: ['stealth', 'lockpicking', 'pickpocket', 'forgery_skill', 'espionage']
    },
    mobility: {
      label: 'Mobility',
      icon: '🐴',
      skills: ['horsemanship', 'navigation', 'seamanship', 'survival']
    }
  };

  var SKILL_LABELS = {
    brawling: 'Brawling', sword: 'Sword', dagger: 'Dagger', axe: 'Axe',
    archery: 'Archery', polearms: 'Polearms', shield: 'Shield', unarmed: 'Unarmed',
    strength: 'Strength', agility: 'Agility', endurance: 'Endurance',
    swimming: 'Swimming', climbing: 'Climbing',
    speech: 'Speech', deception: 'Deception', intimidation: 'Intimidation',
    haggle: 'Haggle', etiquette: 'Etiquette', command: 'Command',
    seduction: 'Seduction', read_people: 'Read People', performance: 'Performance',
    stewardship: 'Stewardship', smithing: 'Smithing', carpentry: 'Carpentry',
    agriculture: 'Agriculture', hunting: 'Hunting', medicine: 'Medicine',
    cooking: 'Cooking', engineering: 'Engineering', reading: 'Reading',
    law: 'Law', heraldry: 'Heraldry', theology: 'Theology', history: 'History',
    tactics: 'Tactics',
    norman_french: 'Norman French', parisian_french: 'Parisian French', latin: 'Latin',
    english: 'English', italian: 'Italian', german: 'German', occitan: 'Occitan',
    flemish: 'Flemish', arabic: 'Arabic',
    stealth: 'Stealth', lockpicking: 'Lockpicking', pickpocket: 'Pickpocket',
    forgery_skill: 'Forgery', espionage: 'Espionage',
    horsemanship: 'Horsemanship', navigation: 'Navigation',
    seamanship: 'Seamanship', survival: 'Survival'
  };

  var SKILL_DESCRIPTIONS = {
    brawling: 'Street fighting, wrestling, and tavern brawls. The foundation of common violence.',
    sword: 'Mastery of the blade — from a common arming sword to the knightly longsword.',
    dagger: 'Close-quarters knife work, assassination strikes, and backup weapon use.',
    axe: 'The woodsman\'s tool turned weapon. Brutal, effective, feared.',
    archery: 'Bow and crossbow proficiency. Hunting and ranged combat.',
    polearms: 'Spears, halberds, and bills. The weapon of common soldiers and militias.',
    shield: 'Active defense — bashing, blocking, and formation fighting with a shield.',
    unarmed: 'Bare-knuckle combat, joint locks, and grappling. Useful when disarmed.',
    strength: 'Raw physical power. Affects carrying capacity, melee damage, and heavy labor.',
    agility: 'Speed and dexterity. Affects dodge, initiative, and finesse tasks.',
    endurance: 'Stamina and constitution. Affects how long you can fight, march, or labor.',
    swimming: 'The ability to cross rivers, escape shipwrecks, and survive the sea.',
    climbing: 'Scaling walls, cliffs, and trees. Essential for castle infiltration.',
    speech: 'Persuasion and rhetoric. The art of getting what you want through words.',
    deception: 'Lying, misdirection, and maintaining false identities.',
    intimidation: 'Using fear and force of personality to compel others.',
    haggle: 'The merchant\'s art. Negotiating prices and contract terms.',
    etiquette: 'Courtly manners and social norms. Essential for noble circles.',
    command: 'Leadership in battle and organization. Men follow your orders.',
    seduction: 'The art of charm, flirtation, and romantic manipulation.',
    read_people: 'Reading emotions, detecting lies, and understanding motives.',
    performance: 'Music, storytelling, acting, and other performing arts.',
    stewardship: 'Managing estates, finances, and resources efficiently.',
    smithing: 'Working metal — weapons, armor, tools, and iron goods.',
    carpentry: 'Woodworking for construction, furniture, and tools.',
    agriculture: 'Farming, animal husbandry, and land management.',
    hunting: 'Tracking, trapping, and bringing down game.',
    medicine: 'Treating wounds, illness, and injury with herbs and skill.',
    cooking: 'Preparing food — survival rations to noble feasts.',
    engineering: 'Siege engines, fortifications, mills, and complex construction.',
    reading: 'Literacy — reading and writing Latin and vernacular texts.',
    law: 'Knowledge of feudal law, contracts, and legal proceedings.',
    heraldry: 'Identifying noble houses by coat of arms and sigil.',
    theology: 'Religious knowledge, scripture, and Church doctrine.',
    history: 'Knowledge of past events, dynastic lines, and chronicles.',
    tactics: 'Battle planning, troop positioning, and strategic thinking.',
    norman_french: 'The language of the Norman nobility and ruling class.',
    parisian_french: 'The prestige dialect of the Île-de-France court.',
    latin: 'The language of the Church, law, and scholarship.',
    english: 'The tongue of the English peasantry and growing merchant class.',
    italian: 'The language of Italian merchants and bankers.',
    german: 'The tongue of the Holy Roman Empire\'s peoples.',
    occitan: 'The language of the troubadours and southern France.',
    flemish: 'The language of Flanders\' wealthy cloth merchants.',
    arabic: 'The tongue of Crusader contacts, scholars, and distant traders.',
    stealth: 'Moving unseen and unheard. Essential for spying and assassination.',
    lockpicking: 'Opening locks without keys. The thief\'s essential skill.',
    pickpocket: 'Lifting purses and items without the victim noticing.',
    forgery_skill: 'Creating false documents, seals, and written evidence.',
    espionage: 'Gathering intelligence, running informants, and counter-espionage.',
    horsemanship: 'Riding and caring for horses. Required for cavalry and swift travel.',
    navigation: 'Finding direction by stars, landmarks, and maps.',
    seamanship: 'Sailing ships and boats on rivers, coast, and open sea.',
    survival: 'Living off the land — finding food, shelter, and water in the wilderness.'
  };

  var SKILL_BRANCHES = {
    sword: ['Footwork', 'Parry Mastery', 'Counter-Strike', 'Disarming', 'Mounted Swordplay'],
    brawling: ['Haymaker', 'Clinch Fighting', 'Dirty Tricks', 'Crowd Brawler'],
    archery: ['Rapid Shot', 'Long Range', 'Moving Target', 'Crossbow Mastery'],
    speech: ['Rhetoric', 'Inspiration', 'Negotiation', 'Oratory'],
    deception: ['Disguise', 'Impersonation', 'Misdirection', 'False Identity'],
    medicine: ['Wound Closure', 'Herbalism', 'Fever Treatment', 'Surgery'],
    stealth: ['Shadow Step', 'Disguise Self', 'Silent Kill', 'Urban Camouflage'],
    horsemanship: ['Mounted Combat', 'Horse Breeding', 'Cavalry Charge', 'Battle Horse'],
    smithing: ['Bladesmith', 'Armorsmith', 'Tool Making', 'Master Craft'],
    tactics: ['Defensive Formation', 'Flanking', 'Ambush', 'Siege Tactics'],
    engineering: ['Siege Engine', 'Fortification', 'Bridge Building', 'Windmill Design'],
    reading: ['Latin Fluency', 'Illumination', 'Translation', 'Record Keeping'],
    haggle: ['Bulk Discount', 'Appraisal', 'Market Timing', 'Trade Network'],
    command: ['Rally Cry', 'Squad Tactics', 'Logistics', 'Morale Boost'],
    espionage: ['Dead Drop', 'Code Making', 'Interrogation', 'Counter-Intelligence']
  };

  var SKILL_PASSIVES = {
    sword: { 3: '+1 to hit with swords', 6: 'Parry chance +15%', 10: 'Legendary blade mastery — enemies hesitate' },
    brawling: { 3: 'Brawl damage +2', 6: 'Cannot be grappled by weaker opponents', 10: 'Bar fights never start — reputation precedes you' },
    archery: { 3: 'Range increased by 20%', 6: 'Headshot bonus unlocked', 10: 'Legendary archer — songs are sung of your aim' },
    speech: { 3: 'NPC disposition +5 on first meeting', 6: 'Can sway crowds', 10: 'Your words move nations — +20 disposition always' },
    strength: { 3: 'Carry capacity +15kg', 6: 'Melee damage +3', 10: 'Can move boulders, break gates barehanded' },
    agility: { 3: '+1 to dodge rolls', 6: 'Initiative always first in small groups', 10: 'Cannot be surrounded — always find an escape' },
    endurance: { 3: 'Fatigue threshold doubled', 6: 'Can march 2 days without rest', 10: 'Near-death recovery bonus — impossible to exhaust' },
    stealth: { 3: 'Guards\' awareness radius -20%', 6: 'Can hide in plain sight if still', 10: 'Effectively invisible at night — legendary shadow' },
    medicine: { 3: 'Wound healing rate +50%', 6: 'Can cure infections', 10: 'Never lose a patient to sword wounds' },
    horsemanship: { 3: 'Travel speed +10%', 6: 'Horse bond — your horse obeys perfectly', 10: 'Legendary rider — horses come to your call' },
    tactics: { 3: '+1 to battle rolls when commanding', 6: 'Can identify enemy weak points before battle', 10: 'Battles you command are studied by future generals' }
  };

  // XP thresholds from dice.js spec: 30, 60, 100, 150, 200, 260, then +70 each level
  var XP_THRESHOLDS = (function () {
    var t = [0, 30, 60, 100, 150, 200, 260];
    var last = 260;
    for (var i = 7; i <= 10; i++) {
      last += 70;
      t.push(last);
    }
    return t; // index = level, value = XP needed to reach next level
  })();

  // ── SkillTreeView ─────────────────────────────────────────────────────────────

  function SkillTreeView() {
    this._containerId = null;
    this._container = null;
    this._currentCategory = 'combat';
    this._skillsState = {};
    this._expandedSkills = {};
    this._searchQuery = '';
    this._detailSkill = null;
    this._detailOverlay = null;
  }

  // ── init ─────────────────────────────────────────────────────────────────────

  SkillTreeView.prototype.init = function (containerId) {
    this._containerId = containerId;
    this._container = document.getElementById(containerId);
    if (!this._container) {
      console.error('[SkillTreeView] Container not found:', containerId);
      return;
    }
    this._container.classList.add('skill-tree-view');
    this._buildShell();
  };

  SkillTreeView.prototype._buildShell = function () {
    var self = this;
    this._container.innerHTML = '';

    // Category tabs
    var tabBar = document.createElement('div');
    tabBar.className = 'stv-tab-bar';
    Object.keys(SKILL_CATEGORIES).forEach(function (key) {
      var cat = SKILL_CATEGORIES[key];
      var tab = document.createElement('button');
      tab.className = 'stv-tab' + (key === self._currentCategory ? ' active' : '');
      tab.dataset.category = key;
      tab.title = cat.label;
      tab.innerHTML = '<span class="stv-tab-icon">' + cat.icon + '</span>'
        + '<span class="stv-tab-label">' + cat.label + '</span>';
      tab.addEventListener('click', function () { self.setCategory(key); });
      tabBar.appendChild(tab);
    });
    this._container.appendChild(tabBar);

    // Search bar
    var searchWrap = document.createElement('div');
    searchWrap.className = 'stv-search-wrap';
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'stv-search';
    searchInput.placeholder = 'Search skills…';
    searchInput.value = this._searchQuery;
    searchInput.addEventListener('input', function (e) {
      self._searchQuery = e.target.value.toLowerCase().trim();
      self._renderSkillList();
    });
    searchWrap.appendChild(searchInput);
    this._container.appendChild(searchWrap);

    // Skill list
    var listWrap = document.createElement('div');
    listWrap.className = 'stv-list-wrap';
    listWrap.id = this._containerId + '-skill-list';
    this._container.appendChild(listWrap);

    // Summary footer
    var footer = document.createElement('div');
    footer.className = 'stv-footer';
    footer.id = this._containerId + '-footer';
    this._container.appendChild(footer);

    // Detail overlay
    var overlay = document.createElement('div');
    overlay.className = 'stv-detail-overlay hidden';
    overlay.id = this._containerId + '-detail-overlay';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { self.hideSkillDetail(); }
    });
    this._container.appendChild(overlay);
    this._detailOverlay = overlay;
  };

  // ── render ───────────────────────────────────────────────────────────────────

  SkillTreeView.prototype.render = function (skillsState) {
    this._skillsState = skillsState || {};
    if (!this._container) return;
    this._renderSkillList();
    this._renderFooter();
  };

  SkillTreeView.prototype._renderSkillList = function () {
    var listWrap = document.getElementById(this._containerId + '-skill-list');
    if (!listWrap) return;
    listWrap.innerHTML = '';

    var self = this;
    var query = this._searchQuery;
    var skillsToShow = [];

    if (query) {
      // Search across ALL categories
      Object.keys(SKILL_CATEGORIES).forEach(function (catKey) {
        SKILL_CATEGORIES[catKey].skills.forEach(function (sk) {
          var label = (SKILL_LABELS[sk] || sk).toLowerCase();
          if (label.indexOf(query) !== -1) {
            skillsToShow.push({ skill: sk, category: catKey });
          }
        });
      });
    } else {
      var cat = SKILL_CATEGORIES[this._currentCategory];
      if (cat) {
        cat.skills.forEach(function (sk) {
          skillsToShow.push({ skill: sk, category: self._currentCategory });
        });
      }
    }

    if (skillsToShow.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'stv-empty';
      empty.textContent = 'No skills found.';
      listWrap.appendChild(empty);
      return;
    }

    skillsToShow.forEach(function (item) {
      listWrap.appendChild(self._buildSkillNode(item.skill));
    });
  };

  SkillTreeView.prototype._buildSkillNode = function (skillName) {
    var self = this;
    var state = this._skillsState[skillName] || { level: 0, xp: 0 };
    var level = state.level || 0;
    var xp = state.xp || 0;
    var label = SKILL_LABELS[skillName] || skillName;
    var tier = this._getTier(level);
    var expanded = !!this._expandedSkills[skillName];

    var node = document.createElement('div');
    node.className = 'stv-skill-node tier-' + tier.key;
    node.dataset.skill = skillName;

    // Header row
    var header = document.createElement('div');
    header.className = 'stv-skill-header';

    var icon = document.createElement('span');
    icon.className = 'stv-skill-icon';
    icon.textContent = tier.icon;

    var nameSpan = document.createElement('span');
    nameSpan.className = 'stv-skill-name';
    nameSpan.textContent = label;

    var levelBadge = document.createElement('span');
    levelBadge.className = 'stv-skill-level';
    levelBadge.textContent = level > 0 ? level : '—';

    // XP mini-bar
    var xpBar = document.createElement('div');
    xpBar.className = 'stv-xp-bar';
    var xpFill = document.createElement('div');
    xpFill.className = 'stv-xp-fill';
    var pct = this._xpPercent(level, xp);
    xpFill.style.width = pct + '%';
    xpBar.appendChild(xpFill);

    var detailBtn = document.createElement('button');
    detailBtn.className = 'stv-detail-btn';
    detailBtn.title = 'Show detail';
    detailBtn.textContent = 'ℹ';
    detailBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      self.showSkillDetail(skillName);
    });

    header.appendChild(icon);
    header.appendChild(nameSpan);
    header.appendChild(xpBar);
    header.appendChild(levelBadge);
    header.appendChild(detailBtn);

    // Expand button if has branches and level >= 3
    var branches = SKILL_BRANCHES[skillName];
    if (branches && level >= 3) {
      var expandBtn = document.createElement('button');
      expandBtn.className = 'stv-expand-btn';
      expandBtn.textContent = expanded ? '▾' : '▸';
      expandBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        if (self._expandedSkills[skillName]) {
          self.collapseSkill(skillName);
        } else {
          self.expandSkill(skillName);
        }
      });
      header.insertBefore(expandBtn, detailBtn);
    }

    header.addEventListener('click', function () { self.showSkillDetail(skillName); });
    node.appendChild(header);

    // Passive milestones
    var passives = SKILL_PASSIVES[skillName];
    if (passives && level > 0) {
      var passiveRow = document.createElement('div');
      passiveRow.className = 'stv-passive-row';
      [3, 6, 10].forEach(function (threshold) {
        if (passives[threshold]) {
          var pw = document.createElement('span');
          pw.className = 'stv-passive-check' + (level >= threshold ? ' unlocked' : ' locked');
          pw.title = passives[threshold];
          pw.textContent = level >= threshold ? '✓' : '○';
          pw.setAttribute('data-threshold', threshold);
          passiveRow.appendChild(pw);
        }
      });
      node.appendChild(passiveRow);
    }

    // Branch nodes if expanded
    if (expanded && branches && level >= 3) {
      var branchList = document.createElement('div');
      branchList.className = 'stv-branch-list';
      branches.forEach(function (branch, idx) {
        var branchUnlocked = level >= (3 + idx * 1); // unlock 1 per level above 3
        var bNode = document.createElement('div');
        bNode.className = 'stv-branch-node' + (branchUnlocked ? ' unlocked' : ' locked');
        bNode.innerHTML = '<span class="stv-branch-bullet">' + (branchUnlocked ? '◆' : '◇') + '</span>'
          + '<span class="stv-branch-name">' + branch + '</span>';
        branchList.appendChild(bNode);
      });
      node.appendChild(branchList);
    }

    return node;
  };

  SkillTreeView.prototype._getTier = function (level) {
    if (level === 0) return { key: 'locked', icon: '🔒', label: 'Locked' };
    if (level <= 2) return { key: 'learning', icon: '✦', label: 'Learning' };
    if (level <= 5) return { key: 'practicing', icon: '★', label: 'Practicing' };
    if (level <= 8) return { key: 'skilled', icon: '✸', label: 'Skilled' };
    return { key: 'master', icon: '👑', label: 'Master' };
  };

  SkillTreeView.prototype._xpPercent = function (level, xp) {
    if (level >= 10) return 100;
    var needed = XP_THRESHOLDS[level + 1] - XP_THRESHOLDS[level];
    if (!needed) return 0;
    var accumulated = xp - XP_THRESHOLDS[level];
    if (accumulated < 0) accumulated = 0;
    return Math.min(100, Math.floor((accumulated / needed) * 100));
  };

  SkillTreeView.prototype._renderFooter = function () {
    var footer = document.getElementById(this._containerId + '-footer');
    if (!footer) return;

    var total = 0;
    var active = 0;
    var skilled = 0;
    var masters = 0;

    Object.keys(this._skillsState).forEach(function (sk) {
      var lvl = (this._skillsState[sk] || {}).level || 0;
      total += lvl;
      if (lvl > 0) active++;
      if (lvl >= 6) skilled++;
      if (lvl >= 9) masters++;
    }, this);

    footer.innerHTML = '<div class="stv-footer-stats">'
      + '<span class="stv-footer-item"><b>' + active + '</b> skills active</span>'
      + '<span class="stv-footer-item"><b>' + skilled + '</b> skilled</span>'
      + '<span class="stv-footer-item"><b>' + masters + '</b> masters</span>'
      + '<span class="stv-footer-item">Total points: <b>' + total + '</b></span>'
      + '</div>';
  };

  // ── update ───────────────────────────────────────────────────────────────────

  SkillTreeView.prototype.update = function (skillsState, changedSkills) {
    this._skillsState = skillsState || {};
    if (!this._container) return;

    var self = this;
    var listWrap = document.getElementById(this._containerId + '-skill-list');

    if (!changedSkills || !listWrap) {
      this.render(skillsState);
      return;
    }

    changedSkills.forEach(function (skillName) {
      var existing = listWrap.querySelector('[data-skill="' + skillName + '"]');
      if (existing) {
        var fresh = self._buildSkillNode(skillName);
        listWrap.replaceChild(fresh, existing);
      }
    });

    this._renderFooter();
  };

  // ── setCategory ──────────────────────────────────────────────────────────────

  SkillTreeView.prototype.setCategory = function (categoryName) {
    if (!SKILL_CATEGORIES[categoryName]) return;
    this._currentCategory = categoryName;
    this._searchQuery = '';

    // Update search input
    var searchInput = this._container && this._container.querySelector('.stv-search');
    if (searchInput) searchInput.value = '';

    // Update tab active state
    var tabs = this._container && this._container.querySelectorAll('.stv-tab');
    if (tabs) {
      tabs.forEach(function (tab) {
        tab.classList.toggle('active', tab.dataset.category === categoryName);
      });
    }

    this._renderSkillList();
  };

  // ── expandSkill / collapseSkill ───────────────────────────────────────────────

  SkillTreeView.prototype.expandSkill = function (skillName) {
    this._expandedSkills[skillName] = true;
    var listWrap = document.getElementById(this._containerId + '-skill-list');
    if (!listWrap) return;
    var existing = listWrap.querySelector('[data-skill="' + skillName + '"]');
    if (existing) {
      var fresh = this._buildSkillNode(skillName);
      listWrap.replaceChild(fresh, existing);
    }
  };

  SkillTreeView.prototype.collapseSkill = function (skillName) {
    delete this._expandedSkills[skillName];
    var listWrap = document.getElementById(this._containerId + '-skill-list');
    if (!listWrap) return;
    var existing = listWrap.querySelector('[data-skill="' + skillName + '"]');
    if (existing) {
      var fresh = this._buildSkillNode(skillName);
      listWrap.replaceChild(fresh, existing);
    }
  };

  // ── showSkillDetail ──────────────────────────────────────────────────────────

  SkillTreeView.prototype.showSkillDetail = function (skillName) {
    this._detailSkill = skillName;
    if (!this._detailOverlay) return;

    var self = this;
    var state = this._skillsState[skillName] || { level: 0, xp: 0 };
    var level = state.level || 0;
    var xp = state.xp || 0;
    var label = SKILL_LABELS[skillName] || skillName;
    var tier = this._getTier(level);
    var desc = SKILL_DESCRIPTIONS[skillName] || 'No description available.';
    var branches = SKILL_BRANCHES[skillName] || [];
    var passives = SKILL_PASSIVES[skillName] || {};
    var xpPct = this._xpPercent(level, xp);
    var xpNeeded = level < 10 ? (XP_THRESHOLDS[level + 1] - XP_THRESHOLDS[level]) : 0;
    var xpAcc = level < 10 ? Math.max(0, xp - XP_THRESHOLDS[level]) : 0;

    var panel = document.createElement('div');
    panel.className = 'stv-detail-panel';

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'stv-detail-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () { self.hideSkillDetail(); });
    panel.appendChild(closeBtn);

    // Title
    var titleEl = document.createElement('div');
    titleEl.className = 'stv-detail-title';
    titleEl.innerHTML = '<span class="stv-detail-icon">' + tier.icon + '</span>'
      + '<span class="stv-detail-name">' + label + '</span>'
      + '<span class="stv-detail-tier tier-' + tier.key + '">' + tier.label + '</span>';
    panel.appendChild(titleEl);

    // Level display
    var levelRow = document.createElement('div');
    levelRow.className = 'stv-detail-level-row';
    levelRow.innerHTML = '<span class="stv-detail-level-label">Level</span>'
      + '<span class="stv-detail-level-value">' + level + ' / 10</span>';
    panel.appendChild(levelRow);

    // Level bar
    var levelBarWrap = document.createElement('div');
    levelBarWrap.className = 'stv-detail-level-bar-wrap';
    for (var i = 1; i <= 10; i++) {
      var pip = document.createElement('div');
      pip.className = 'stv-level-pip' + (i <= level ? ' filled' : '');
      levelBarWrap.appendChild(pip);
    }
    panel.appendChild(levelBarWrap);

    // XP progress
    if (level < 10) {
      var xpSection = document.createElement('div');
      xpSection.className = 'stv-detail-xp-section';
      xpSection.innerHTML = '<div class="stv-detail-xp-label">XP to next level: '
        + xpAcc + ' / ' + xpNeeded + '</div>';
      var xpBarOuter = document.createElement('div');
      xpBarOuter.className = 'stv-detail-xp-bar';
      var xpBarInner = document.createElement('div');
      xpBarInner.className = 'stv-detail-xp-fill';
      xpBarInner.style.width = xpPct + '%';
      xpBarOuter.appendChild(xpBarInner);
      xpSection.appendChild(xpBarOuter);
      panel.appendChild(xpSection);
    } else {
      var maxLevel = document.createElement('div');
      maxLevel.className = 'stv-detail-maxlevel';
      maxLevel.textContent = '✦ Maximum level reached ✦';
      panel.appendChild(maxLevel);
    }

    // Description
    var descEl = document.createElement('div');
    descEl.className = 'stv-detail-desc';
    descEl.textContent = desc;
    panel.appendChild(descEl);

    // Passives
    var passiveKeys = [3, 6, 10];
    var hasPassive = passiveKeys.some(function (k) { return passives[k]; });
    if (hasPassive) {
      var passiveSection = document.createElement('div');
      passiveSection.className = 'stv-detail-passives';
      var passiveTitle = document.createElement('div');
      passiveTitle.className = 'stv-detail-section-title';
      passiveTitle.textContent = 'Passive Milestones';
      passiveSection.appendChild(passiveTitle);
      passiveKeys.forEach(function (threshold) {
        if (!passives[threshold]) return;
        var row = document.createElement('div');
        row.className = 'stv-detail-passive-row' + (level >= threshold ? ' unlocked' : ' locked');
        row.innerHTML = '<span class="stv-passive-level">Lv ' + threshold + '</span>'
          + '<span class="stv-passive-status">' + (level >= threshold ? '✓' : '○') + '</span>'
          + '<span class="stv-passive-text">' + passives[threshold] + '</span>';
        passiveSection.appendChild(row);
      });
      panel.appendChild(passiveSection);
    }

    // Branches
    if (branches.length > 0) {
      var branchSection = document.createElement('div');
      branchSection.className = 'stv-detail-branches';
      var branchTitle = document.createElement('div');
      branchTitle.className = 'stv-detail-section-title';
      branchTitle.textContent = 'Branches' + (level < 3 ? ' (unlocked at level 3)' : '');
      branchSection.appendChild(branchTitle);
      branches.forEach(function (branch, idx) {
        var reqLevel = 3 + idx;
        var unlocked = level >= reqLevel;
        var bRow = document.createElement('div');
        bRow.className = 'stv-detail-branch-row' + (unlocked ? ' unlocked' : ' locked');
        bRow.innerHTML = '<span class="stv-branch-bullet">' + (unlocked ? '◆' : '◇') + '</span>'
          + '<span class="stv-branch-name">' + branch + '</span>'
          + '<span class="stv-branch-req">Req. Lv ' + reqLevel + '</span>';
        branchSection.appendChild(bRow);
      });
      panel.appendChild(branchSection);
    }

    this._detailOverlay.innerHTML = '';
    this._detailOverlay.appendChild(panel);
    this._detailOverlay.classList.remove('hidden');
  };

  SkillTreeView.prototype.hideSkillDetail = function () {
    this._detailSkill = null;
    if (this._detailOverlay) {
      this._detailOverlay.classList.add('hidden');
      this._detailOverlay.innerHTML = '';
    }
  };

  // ── getters ──────────────────────────────────────────────────────────────────

  SkillTreeView.prototype.getDetailSkill = function () {
    return this._detailSkill;
  };

  // Expose to global
  global.SkillTreeView = SkillTreeView;

})(typeof window !== 'undefined' ? window : this);

// END FILE: client/js/ui/skill-tree-view.js
