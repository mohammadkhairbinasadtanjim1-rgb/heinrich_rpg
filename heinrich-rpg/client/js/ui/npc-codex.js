// FILE: client/js/ui/npc-codex.js — PART 10

(function (global) {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────────

  var RELATIONSHIP_ICONS = {
    lover:   '❤️',
    ally:    '👥',
    neutral: '😐',
    hostile: '😤',
    dead:    '💀',
    unknown: '🔍'
  };

  var RELATIONSHIP_CLASSES = {
    lover:   'rel-lover',
    ally:    'rel-ally',
    neutral: 'rel-neutral',
    hostile: 'rel-hostile',
    dead:    'rel-dead',
    unknown: 'rel-unknown'
  };

  var FILTER_OPTIONS = [
    { key: 'all',      label: 'All NPCs' },
    { key: 'active',   label: 'Active' },
    { key: 'present',  label: 'Nearby' },
    { key: 'friendly', label: 'Friendly' },
    { key: 'hostile',  label: 'Hostile' },
    { key: 'dead',     label: 'Dead' },
    { key: 'unknown',  label: 'Unknown' }
  ];

  var SORT_OPTIONS = [
    { key: 'name',         label: 'Name' },
    { key: 'relationship', label: 'Relationship' },
    { key: 'last_seen',    label: 'Last Seen' },
    { key: 'importance',   label: 'Importance' }
  ];

  var IMPORTANCE_LABELS = {
    critical: '★★★',
    major:    '★★',
    minor:    '★',
    passing:  '·'
  };

  // ── Utility ──────────────────────────────────────────────────────────────────

  function getRelationshipType(favorability) {
    if (typeof favorability !== 'number') return 'unknown';
    if (favorability >= 80) return 'lover';
    if (favorability >= 40) return 'ally';
    if (favorability >= -10) return 'neutral';
    return 'hostile';
  }

  function getFavorabilityLabel(score) {
    if (typeof score !== 'number') return 'Unknown';
    if (score >= 90) return 'Devoted';
    if (score >= 70) return 'Fond';
    if (score >= 40) return 'Friendly';
    if (score >= 10) return 'Warm';
    if (score >= -10) return 'Neutral';
    if (score >= -30) return 'Cool';
    if (score >= -60) return 'Hostile';
    return 'Bitter Enemy';
  }

  function formatTurnAge(currentTurn, lastSeenTurn) {
    if (lastSeenTurn === undefined || lastSeenTurn === null) return 'Never seen';
    var diff = currentTurn - lastSeenTurn;
    if (diff === 0) return 'Right now';
    if (diff === 1) return '1 turn ago';
    return diff + ' turns ago';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ── NPCCodex ─────────────────────────────────────────────────────────────────

  function NPCCodex() {
    this._containerId = null;
    this._container = null;
    this._npcsState = {};
    this._relationshipsState = {};
    this._filter = 'all';
    this._sortField = 'importance';
    this._searchQuery = '';
    this._selectedNPCId = null;
    this._currentTurn = 0;
    this._detailOverlay = null;
  }

  // ── init ─────────────────────────────────────────────────────────────────────

  NPCCodex.prototype.init = function (containerId) {
    this._containerId = containerId;
    this._container = document.getElementById(containerId);
    if (!this._container) {
      console.error('[NPCCodex] Container not found:', containerId);
      return;
    }
    this._container.classList.add('npc-codex');
    this._buildShell();
  };

  NPCCodex.prototype._buildShell = function () {
    var self = this;
    this._container.innerHTML = '';

    // Search bar
    var searchWrap = document.createElement('div');
    searchWrap.className = 'nc-search-wrap';
    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'nc-search';
    searchInput.placeholder = 'Search by name, location, role, faction…';
    searchInput.addEventListener('input', function (e) {
      self._searchQuery = e.target.value.toLowerCase().trim();
      self._renderList();
    });
    searchWrap.appendChild(searchInput);
    this._container.appendChild(searchWrap);

    // Filter bar
    var filterBar = document.createElement('div');
    filterBar.className = 'nc-filter-bar';
    FILTER_OPTIONS.forEach(function (f) {
      var btn = document.createElement('button');
      btn.className = 'nc-filter-btn' + (f.key === self._filter ? ' active' : '');
      btn.dataset.filter = f.key;
      btn.textContent = f.label;
      btn.addEventListener('click', function () { self.setFilter(f.key); });
      filterBar.appendChild(btn);
    });
    this._container.appendChild(filterBar);

    // Sort bar
    var sortBar = document.createElement('div');
    sortBar.className = 'nc-sort-bar';
    var sortLabel = document.createElement('span');
    sortLabel.className = 'nc-sort-label';
    sortLabel.textContent = 'Sort: ';
    sortBar.appendChild(sortLabel);
    SORT_OPTIONS.forEach(function (s) {
      var btn = document.createElement('button');
      btn.className = 'nc-sort-btn' + (s.key === self._sortField ? ' active' : '');
      btn.dataset.sort = s.key;
      btn.textContent = s.label;
      btn.addEventListener('click', function () { self.sortBy(s.key); });
      sortBar.appendChild(btn);
    });
    this._container.appendChild(sortBar);

    // List
    var listWrap = document.createElement('div');
    listWrap.className = 'nc-list-wrap';
    listWrap.id = this._containerId + '-list';
    this._container.appendChild(listWrap);

    // Summary footer
    var footer = document.createElement('div');
    footer.className = 'nc-footer';
    footer.id = this._containerId + '-footer';
    this._container.appendChild(footer);

    // Detail overlay
    var overlay = document.createElement('div');
    overlay.className = 'nc-detail-overlay hidden';
    overlay.id = this._containerId + '-detail';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { self.hideNPCDetail(); }
    });
    this._container.appendChild(overlay);
    this._detailOverlay = overlay;
  };

  // ── render ────────────────────────────────────────────────────────────────────

  NPCCodex.prototype.render = function (npcsState, relationshipsState) {
    this._npcsState = npcsState || {};
    this._relationshipsState = relationshipsState || {};
    this._currentTurn = (npcsState && npcsState._currentTurn) || 0;
    if (!this._container) return;
    this._renderList();
    this._renderFooter();
  };

  NPCCodex.prototype._renderList = function () {
    var listWrap = document.getElementById(this._containerId + '-list');
    if (!listWrap) return;
    listWrap.innerHTML = '';

    var self = this;
    var npcs = this._getFilteredSortedNPCs();
    var living = npcs.filter(function (npc) { return !npc.dead; });
    var dead = npcs.filter(function (npc) { return npc.dead; });

    if (living.length === 0 && dead.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'nc-empty';
      empty.textContent = 'No NPCs found.';
      listWrap.appendChild(empty);
      return;
    }

    // Living NPCs
    if (living.length > 0) {
      living.forEach(function (npc) {
        listWrap.appendChild(self._buildNPCEntry(npc));
      });
    }

    // Dead section
    if (dead.length > 0 && (self._filter === 'all' || self._filter === 'dead')) {
      var deadHeader = document.createElement('div');
      deadHeader.className = 'nc-dead-section-header';
      deadHeader.textContent = '💀 Departed — ' + dead.length + ' soul' + (dead.length !== 1 ? 's' : '');
      listWrap.appendChild(deadHeader);

      dead.forEach(function (npc) {
        listWrap.appendChild(self._buildNPCEntry(npc));
      });
    }
  };

  NPCCodex.prototype._buildNPCEntry = function (npc) {
    var self = this;
    var rel = this._relationshipsState[npc.id] || {};
    var favorability = rel.favorability !== undefined ? rel.favorability : null;
    var relType = npc.dead ? 'dead' : getRelationshipType(favorability);
    var relIcon = RELATIONSHIP_ICONS[relType] || RELATIONSHIP_ICONS.unknown;
    var relClass = RELATIONSHIP_CLASSES[relType] || '';
    var lastSeen = formatTurnAge(this._currentTurn, rel.lastSeenTurn);
    var isSelected = this._selectedNPCId === npc.id;

    var entry = document.createElement('div');
    entry.className = 'nc-npc-entry ' + relClass + (npc.dead ? ' nc-dead' : '') + (isSelected ? ' nc-selected' : '');
    entry.dataset.npcId = npc.id;

    // Line 1: icon + name + role + location
    var line1 = document.createElement('div');
    line1.className = 'nc-entry-line1';

    var iconEl = document.createElement('span');
    iconEl.className = 'nc-rel-icon';
    iconEl.title = relType.charAt(0).toUpperCase() + relType.slice(1);
    iconEl.textContent = relIcon;

    var nameEl = document.createElement('span');
    nameEl.className = 'nc-npc-name';
    nameEl.textContent = npc.name || 'Unknown';

    var roleEl = document.createElement('span');
    roleEl.className = 'nc-npc-role';
    roleEl.textContent = [npc.role, npc.location].filter(Boolean).join(', ') || '—';

    var impEl = document.createElement('span');
    impEl.className = 'nc-npc-importance';
    impEl.title = 'Importance';
    impEl.textContent = IMPORTANCE_LABELS[npc.importance] || IMPORTANCE_LABELS.passing;

    line1.appendChild(iconEl);
    line1.appendChild(nameEl);
    line1.appendChild(document.createTextNode(' — '));
    line1.appendChild(roleEl);
    line1.appendChild(impEl);
    entry.appendChild(line1);

    // Line 2: favorability bar + last seen
    var line2 = document.createElement('div');
    line2.className = 'nc-entry-line2';

    if (favorability !== null && !npc.dead) {
      var favBar = document.createElement('div');
      favBar.className = 'nc-fav-bar';
      var favFill = document.createElement('div');
      favFill.className = 'nc-fav-fill ' + relClass;
      // Map -100 to +100 to 0-100%
      var favPct = Math.max(0, Math.min(100, (favorability + 100) / 2));
      favFill.style.width = favPct + '%';
      favBar.appendChild(favFill);
      var favLabel = document.createElement('span');
      favLabel.className = 'nc-fav-label';
      favLabel.textContent = getFavorabilityLabel(favorability);
      line2.appendChild(favBar);
      line2.appendChild(favLabel);
    } else if (npc.dead) {
      var deathEl = document.createElement('span');
      deathEl.className = 'nc-death-note';
      deathEl.textContent = 'Died turn ' + (npc.deathTurn || '?')
        + (npc.causeOfDeath ? ' — ' + npc.causeOfDeath : '');
      line2.appendChild(deathEl);
    }

    var lastSeenEl = document.createElement('span');
    lastSeenEl.className = 'nc-last-seen';
    lastSeenEl.textContent = lastSeen;
    line2.appendChild(lastSeenEl);
    entry.appendChild(line2);

    entry.addEventListener('click', function () {
      self.showNPCDetail(npc.id);
    });

    return entry;
  };

  NPCCodex.prototype._getFilteredSortedNPCs = function () {
    var self = this;
    var all = Object.keys(this._npcsState).map(function (id) {
      var npc = self._npcsState[id];
      return Object.assign({}, npc, { id: id });
    });

    // Search filter
    if (this._searchQuery) {
      var q = this._searchQuery;
      all = all.filter(function (npc) {
        return (npc.name || '').toLowerCase().indexOf(q) !== -1
          || (npc.role || '').toLowerCase().indexOf(q) !== -1
          || (npc.location || '').toLowerCase().indexOf(q) !== -1
          || (npc.faction || '').toLowerCase().indexOf(q) !== -1;
      });
    }

    // Category filter
    switch (this._filter) {
      case 'active':
        all = all.filter(function (npc) { return !npc.dead; });
        break;
      case 'present':
        all = all.filter(function (npc) { return !npc.dead && npc.presentWithHeinrich; });
        break;
      case 'friendly':
        all = all.filter(function (npc) {
          if (npc.dead) return false;
          var rel = self._relationshipsState[npc.id] || {};
          return (rel.favorability || 0) >= 40;
        });
        break;
      case 'hostile':
        all = all.filter(function (npc) {
          if (npc.dead) return false;
          var rel = self._relationshipsState[npc.id] || {};
          return (rel.favorability || 0) < -10;
        });
        break;
      case 'dead':
        all = all.filter(function (npc) { return npc.dead; });
        break;
      case 'unknown':
        all = all.filter(function (npc) {
          if (npc.dead) return false;
          var rel = self._relationshipsState[npc.id] || {};
          return rel.favorability === undefined || rel.favorability === null;
        });
        break;
      case 'all':
      default:
        break;
    }

    // Sort
    var sortField = this._sortField;
    all.sort(function (a, b) {
      switch (sortField) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'relationship': {
          var relA = (self._relationshipsState[a.id] || {}).favorability || 0;
          var relB = (self._relationshipsState[b.id] || {}).favorability || 0;
          return relB - relA;
        }
        case 'last_seen': {
          var lsA = (self._relationshipsState[a.id] || {}).lastSeenTurn || 0;
          var lsB = (self._relationshipsState[b.id] || {}).lastSeenTurn || 0;
          return lsB - lsA;
        }
        case 'importance': {
          var impOrder = { critical: 4, major: 3, minor: 2, passing: 1 };
          var iA = impOrder[a.importance] || 1;
          var iB = impOrder[b.importance] || 1;
          return iB - iA;
        }
        default:
          return 0;
      }
    });

    return all;
  };

  NPCCodex.prototype._renderFooter = function () {
    var footer = document.getElementById(this._containerId + '-footer');
    if (!footer) return;
    var total = Object.keys(this._npcsState).length;
    var living = 0;
    var hostile = 0;
    var friendly = 0;
    var self = this;
    Object.keys(this._npcsState).forEach(function (id) {
      var npc = self._npcsState[id];
      if (!npc.dead) {
        living++;
        var rel = (self._relationshipsState[id] || {}).favorability;
        if (rel !== undefined) {
          if (rel >= 40) friendly++;
          else if (rel < -10) hostile++;
        }
      }
    });
    footer.innerHTML = '<span class="nc-footer-item"><b>' + total + '</b> total</span>'
      + '<span class="nc-footer-item"><b>' + living + '</b> living</span>'
      + '<span class="nc-footer-item rel-ally"><b>' + friendly + '</b> friendly</span>'
      + '<span class="nc-footer-item rel-hostile"><b>' + hostile + '</b> hostile</span>';
  };

  // ── update ────────────────────────────────────────────────────────────────────

  NPCCodex.prototype.update = function (npcsState, relationshipsState) {
    this._npcsState = npcsState || this._npcsState;
    this._relationshipsState = relationshipsState || this._relationshipsState;
    if (!this._container) return;
    this._renderList();
    this._renderFooter();
    // If detail panel open, refresh it
    if (this._selectedNPCId) {
      this.showNPCDetail(this._selectedNPCId);
    }
  };

  // ── search ────────────────────────────────────────────────────────────────────

  NPCCodex.prototype.search = function (query) {
    this._searchQuery = (query || '').toLowerCase().trim();
    var searchInput = this._container && this._container.querySelector('.nc-search');
    if (searchInput) searchInput.value = query || '';
    this._renderList();
  };

  // ── setFilter ────────────────────────────────────────────────────────────────

  NPCCodex.prototype.setFilter = function (filter) {
    this._filter = filter;
    var btns = this._container && this._container.querySelectorAll('.nc-filter-btn');
    if (btns) {
      btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
    }
    this._renderList();
  };

  // ── sortBy ────────────────────────────────────────────────────────────────────

  NPCCodex.prototype.sortBy = function (field) {
    this._sortField = field;
    var btns = this._container && this._container.querySelectorAll('.nc-sort-btn');
    if (btns) {
      btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.sort === field);
      });
    }
    this._renderList();
  };

  // ── showNPCDetail ─────────────────────────────────────────────────────────────

  NPCCodex.prototype.showNPCDetail = function (npcId) {
    this._selectedNPCId = npcId;
    if (!this._detailOverlay) return;

    var self = this;
    var npc = this._npcsState[npcId];
    if (!npc) return;

    var rel = this._relationshipsState[npcId] || {};
    var favorability = rel.favorability !== undefined ? rel.favorability : null;
    var relType = npc.dead ? 'dead' : getRelationshipType(favorability);
    var relIcon = RELATIONSHIP_ICONS[relType] || RELATIONSHIP_ICONS.unknown;

    var panel = document.createElement('div');
    panel.className = 'nc-detail-panel' + (npc.dead ? ' nc-dead' : '');

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'nc-detail-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () { self.hideNPCDetail(); });
    panel.appendChild(closeBtn);

    // Header: name + role
    var headerEl = document.createElement('div');
    headerEl.className = 'nc-detail-header';
    headerEl.innerHTML = '<span class="nc-detail-rel-icon ' + (RELATIONSHIP_CLASSES[relType] || '') + '">'
      + relIcon + '</span>'
      + '<div class="nc-detail-name-block">'
      + '<h3 class="nc-detail-name">' + escapeHtml(npc.name || 'Unknown') + '</h3>'
      + '<div class="nc-detail-role">' + escapeHtml(npc.role || '') + '</div>'
      + '</div>';
    panel.appendChild(headerEl);

    // Appearance + Age
    var bioEl = document.createElement('div');
    bioEl.className = 'nc-detail-bio';
    if (npc.age) {
      bioEl.innerHTML += '<span class="nc-bio-item">Age: <strong>' + npc.age + '</strong></span>';
    }
    if (npc.location) {
      bioEl.innerHTML += '<span class="nc-bio-item">Last known: <strong>' + escapeHtml(npc.location) + '</strong></span>';
    }
    if (npc.appearance) {
      var appEl = document.createElement('div');
      appEl.className = 'nc-detail-appearance';
      appEl.innerHTML = '<span class="nc-detail-section-title">Appearance</span>'
        + '<p>' + escapeHtml(npc.appearance) + '</p>';
      bioEl.appendChild(appEl);
    }
    panel.appendChild(bioEl);

    // Dead notice
    if (npc.dead) {
      var deadNotice = document.createElement('div');
      deadNotice.className = 'nc-detail-dead-notice';
      deadNotice.innerHTML = '💀 Died turn ' + (npc.deathTurn || '?')
        + (npc.causeOfDeath ? ' — ' + escapeHtml(npc.causeOfDeath) : '');
      panel.appendChild(deadNotice);
    }

    // Relationship
    if (favorability !== null && !npc.dead) {
      var relSection = document.createElement('div');
      relSection.className = 'nc-detail-section';
      relSection.innerHTML = '<div class="nc-detail-section-title">Relationship</div>';
      var favPct = Math.max(0, Math.min(100, (favorability + 100) / 2));
      relSection.innerHTML += '<div class="nc-detail-fav-wrap">'
        + '<div class="nc-detail-fav-bar"><div class="nc-detail-fav-fill ' + (RELATIONSHIP_CLASSES[relType] || '') + '" style="width:' + favPct + '%"></div></div>'
        + '<span class="nc-detail-fav-label">' + getFavorabilityLabel(favorability) + ' (' + favorability + ')</span>'
        + '</div>';

      // Emotional memory summary (last 3 significant)
      if (rel.emotionalMemory && rel.emotionalMemory.length > 0) {
        var memEl = document.createElement('div');
        memEl.className = 'nc-detail-emotional-memory';
        memEl.innerHTML = '<div class="nc-detail-subsection-title">Recent Impressions</div>';
        rel.emotionalMemory.slice(-3).reverse().forEach(function (mem) {
          var mRow = document.createElement('div');
          mRow.className = 'nc-mem-row ' + (mem.positive ? 'nc-mem-positive' : 'nc-mem-negative');
          mRow.innerHTML = '<span class="nc-mem-icon">' + (mem.positive ? '↑' : '↓') + '</span>'
            + '<span class="nc-mem-text">' + escapeHtml(mem.summary || '') + '</span>'
            + '<span class="nc-mem-turn">Turn ' + (mem.turn || '?') + '</span>';
          memEl.appendChild(mRow);
        });
        relSection.appendChild(memEl);
      }
      panel.appendChild(relSection);
    }

    // Personality traits
    if (npc.traits && npc.traits.length > 0) {
      var traitsSection = document.createElement('div');
      traitsSection.className = 'nc-detail-section';
      traitsSection.innerHTML = '<div class="nc-detail-section-title">Personality</div>';
      var traitList = document.createElement('div');
      traitList.className = 'nc-trait-list';
      npc.traits.forEach(function (trait) {
        var t = document.createElement('span');
        t.className = 'nc-trait-tag';
        t.textContent = trait;
        traitList.appendChild(t);
      });
      traitsSection.appendChild(traitList);
      panel.appendChild(traitsSection);
    }

    // What Heinrich knows
    var knowsSection = document.createElement('div');
    knowsSection.className = 'nc-detail-section';
    knowsSection.innerHTML = '<div class="nc-detail-section-title">What You Know</div>';
    if (npc.knownWants) {
      knowsSection.innerHTML += '<div class="nc-knows-row"><span class="nc-knows-label">Wants:</span> '
        + escapeHtml(npc.knownWants) + '</div>';
    }
    if (npc.knownSecrets && npc.knownSecrets.length > 0) {
      var secretsEl = document.createElement('div');
      secretsEl.className = 'nc-knows-row nc-secrets';
      secretsEl.innerHTML = '<span class="nc-knows-label">🔒 Secrets:</span> ';
      npc.knownSecrets.forEach(function (secret) {
        secretsEl.innerHTML += '<span class="nc-secret-tag">' + escapeHtml(secret) + '</span>';
      });
      knowsSection.appendChild(secretsEl);
    }
    if (npc.knownSkills && npc.knownSkills.length > 0) {
      knowsSection.innerHTML += '<div class="nc-knows-row"><span class="nc-knows-label">Skills:</span> '
        + npc.knownSkills.map(function (s) { return escapeHtml(s); }).join(', ') + '</div>';
    }
    if (!npc.knownWants && (!npc.knownSecrets || npc.knownSecrets.length === 0) && (!npc.knownSkills || npc.knownSkills.length === 0)) {
      knowsSection.innerHTML += '<div class="nc-knows-none">You know little about this person.</div>';
    }
    panel.appendChild(knowsSection);

    // Faction
    if (npc.faction) {
      var factionEl = document.createElement('div');
      factionEl.className = 'nc-detail-section';
      factionEl.innerHTML = '<div class="nc-detail-section-title">Faction</div>'
        + '<div class="nc-faction-name">' + escapeHtml(npc.faction) + '</div>';
      panel.appendChild(factionEl);
    }

    // Schedule
    if (npc.schedule && npc.schedule.length > 0) {
      var schedSection = document.createElement('div');
      schedSection.className = 'nc-detail-section';
      schedSection.innerHTML = '<div class="nc-detail-section-title">Typical Schedule</div>';
      npc.schedule.forEach(function (entry) {
        var sRow = document.createElement('div');
        sRow.className = 'nc-schedule-row';
        sRow.innerHTML = '<span class="nc-sched-time">' + escapeHtml(entry.time || '') + '</span>'
          + '<span class="nc-sched-activity">' + escapeHtml(entry.activity || '') + '</span>'
          + (entry.location ? '<span class="nc-sched-loc">at ' + escapeHtml(entry.location) + '</span>' : '');
        schedSection.appendChild(sRow);
      });
      panel.appendChild(schedSection);
    }

    // Interaction history (last 5)
    if (rel.interactions && rel.interactions.length > 0) {
      var histSection = document.createElement('div');
      histSection.className = 'nc-detail-section';
      histSection.innerHTML = '<div class="nc-detail-section-title">Recent Interactions</div>';
      var recent = rel.interactions.slice(-5).reverse();
      recent.forEach(function (interaction) {
        var iRow = document.createElement('div');
        iRow.className = 'nc-interaction-row';
        iRow.innerHTML = '<span class="nc-int-turn">Turn ' + (interaction.turn || '?') + '</span>'
          + '<span class="nc-int-summary">' + escapeHtml(interaction.summary || '') + '</span>';
        histSection.appendChild(iRow);
      });
      panel.appendChild(histSection);
    }

    // Active grudges / debts
    if (rel.grudges && rel.grudges.length > 0) {
      var grudgesSection = document.createElement('div');
      grudgesSection.className = 'nc-detail-section nc-grudges';
      grudgesSection.innerHTML = '<div class="nc-detail-section-title">⚔️ Active Grudges</div>';
      rel.grudges.forEach(function (g) {
        grudgesSection.innerHTML += '<div class="nc-grudge-row">' + escapeHtml(g) + '</div>';
      });
      panel.appendChild(grudgesSection);
    }
    if (rel.debts && rel.debts.length > 0) {
      var debtsSection = document.createElement('div');
      debtsSection.className = 'nc-detail-section nc-debts';
      debtsSection.innerHTML = '<div class="nc-detail-section-title">⚖️ Debts & Obligations</div>';
      rel.debts.forEach(function (d) {
        debtsSection.innerHTML += '<div class="nc-debt-row">' + escapeHtml(d) + '</div>';
      });
      panel.appendChild(debtsSection);
    }

    // Action buttons
    if (!npc.dead) {
      var actionsEl = document.createElement('div');
      actionsEl.className = 'nc-detail-actions';

      var actions = [
        { label: 'Talk to them', icon: '💬', action: 'talk' },
        { label: 'Send letter', icon: '✉️', action: 'letter' },
        { label: 'Find them', icon: '🔍', action: 'find' },
        { label: 'Forget them', icon: '🗑', action: 'forget' }
      ];

      actions.forEach(function (a) {
        var btn = document.createElement('button');
        btn.className = 'nc-action-btn nc-action-' + a.action;
        btn.innerHTML = a.icon + ' ' + a.label;
        btn.addEventListener('click', function () {
          if (typeof self.onNPCAction === 'function') {
            self.onNPCAction(npcId, a.action);
          }
        });
        actionsEl.appendChild(btn);
      });

      panel.appendChild(actionsEl);
    }

    this._detailOverlay.innerHTML = '';
    this._detailOverlay.appendChild(panel);
    this._detailOverlay.classList.remove('hidden');
  };

  // ── hideNPCDetail ─────────────────────────────────────────────────────────────

  NPCCodex.prototype.hideNPCDetail = function () {
    this._selectedNPCId = null;
    if (this._detailOverlay) {
      this._detailOverlay.classList.add('hidden');
      this._detailOverlay.innerHTML = '';
    }
  };

  // ── getSelectedNPC ────────────────────────────────────────────────────────────

  NPCCodex.prototype.getSelectedNPC = function () {
    return this._selectedNPCId;
  };

  // ── onNPCAction callback (override externally) ────────────────────────────────

  NPCCodex.prototype.onNPCAction = null;

  // Expose to global
  global.NPCCodex = NPCCodex;

})(typeof window !== 'undefined' ? window : this);

// END FILE: client/js/ui/npc-codex.js
