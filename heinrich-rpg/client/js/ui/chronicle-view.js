// FILE: client/js/ui/chronicle-view.js — PART 10

(function (global) {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────────

  var VIEWS = ['timeline', 'by_chapter', 'achievements', 'legacy'];

  var ENTRY_TYPE_ICONS = {
    combat:     '⚔️',
    travel:     '🗺️',
    political:  '👑',
    romantic:   '❤️',
    invention:  '⚙️',
    crime:      '🗡️',
    spiritual:  '✝',
    economic:   '💰',
    social:     '🗣️',
    death:      '💀',
    birth:      '✦',
    milestone:  '🏆',
    default:    '📜'
  };

  var ENTRY_TYPE_LABELS = {
    combat:    'Combat',
    travel:    'Travel',
    political: 'Political',
    romantic:  'Romantic',
    invention: 'Invention',
    crime:     'Crime',
    spiritual: 'Spiritual',
    economic:  'Economic',
    social:    'Social',
    death:     'Death',
    birth:     'Birth',
    milestone: 'Milestone'
  };

  var FILTER_TYPES = [
    { key: 'all',       label: 'All' },
    { key: 'combat',    label: '⚔️ Combat' },
    { key: 'travel',    label: '🗺️ Travel' },
    { key: 'political', label: '👑 Political' },
    { key: 'romantic',  label: '❤️ Romantic' },
    { key: 'invention', label: '⚙️ Invention' },
    { key: 'crime',     label: '🗡️ Crime' },
    { key: 'spiritual', label: '✝ Spiritual' },
    { key: 'economic',  label: '💰 Economic' }
  ];

  var ACHIEVEMENT_RARITIES = {
    common:     { label: 'Common',     class: 'ach-common',     color: '#aaa' },
    uncommon:   { label: 'Uncommon',   class: 'ach-uncommon',   color: '#4caf50' },
    rare:       { label: 'Rare',       class: 'ach-rare',       color: '#2196f3' },
    legendary:  { label: 'Legendary',  class: 'ach-legendary',  color: '#ffd700' }
  };

  var LEGACY_TITLES = [
    { max: 50,  title: 'Forgotten Peasant' },
    { max: 100, title: 'Local Legend' },
    { max: 200, title: 'Man of Note' },
    { max: 300, title: 'Figure of History' },
    { max: 400, title: 'Legend of France' },
    { max: 500, title: 'Immortal Name' }
  ];

  var LEGACY_CATEGORIES = [
    { key: 'wealth',      label: 'Wealth Accumulated',        max: 100, icon: '💰' },
    { key: 'lives',       label: 'Lives Changed',             max: 100, icon: '👥' },
    { key: 'territories', label: 'Territories Influenced',    max: 100, icon: '🏰' },
    { key: 'inventions',  label: 'Inventions Introduced',     max: 100, icon: '⚙️' },
    { key: 'songs',       label: 'Songs & Stories',           max: 50,  icon: '🎵' },
    { key: 'duration',    label: 'Duration of Play',          max: 50,  icon: '⏳' }
  ];

  // Medieval month names
  var MEDIEVAL_MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  var ORDINAL_SUFFIXES = ['th', 'st', 'nd', 'rd'];

  // ── Utility ──────────────────────────────────────────────────────────────────

  function getOrdinal(n) {
    var v = n % 100;
    if (v >= 11 && v <= 13) return n + 'th';
    return n + (ORDINAL_SUFFIXES[n % 10] || ORDINAL_SUFFIXES[0]);
  }

  function formatMedievalDate(dateObj) {
    // dateObj: { year, month (1-12), day }
    if (!dateObj) return 'An unknown date';
    var day = getOrdinal(dateObj.day || 1);
    var month = MEDIEVAL_MONTHS[(dateObj.month || 1) - 1] || 'January';
    var year = dateObj.year || 1403;
    return day + ' day of ' + month + ', in the Year of Our Lord ' + year;
  }

  function getLegacyTitle(score) {
    for (var i = 0; i < LEGACY_TITLES.length; i++) {
      if (score <= LEGACY_TITLES[i].max) return LEGACY_TITLES[i].title;
    }
    return LEGACY_TITLES[LEGACY_TITLES.length - 1].title;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getTurnDateLabel(turnNumber) {
    return 'Turn ' + turnNumber;
  }

  // ── ChronicleView ─────────────────────────────────────────────────────────────

  function ChronicleView() {
    this._containerId = null;
    this._container = null;
    this._chronicleState = {};
    this._calendarState = {};
    this._currentView = 'timeline';
    this._filterType = 'all';
    this._searchQuery = '';
    this._expandedChapters = {};
    this._detailOverlay = null;
  }

  // ── init ─────────────────────────────────────────────────────────────────────

  ChronicleView.prototype.init = function (containerId) {
    this._containerId = containerId;
    this._container = document.getElementById(containerId);
    if (!this._container) {
      console.error('[ChronicleView] Container not found:', containerId);
      return;
    }
    this._container.classList.add('chronicle-view');
    this._buildShell();
  };

  ChronicleView.prototype._buildShell = function () {
    var self = this;
    this._container.innerHTML = '';

    // View tabs
    var tabBar = document.createElement('div');
    tabBar.className = 'cv-tab-bar';
    var viewLabels = {
      timeline:    '📜 Timeline',
      by_chapter:  '📖 Chapters',
      achievements:'🏆 Achievements',
      legacy:      '⭐ Legacy'
    };
    VIEWS.forEach(function (view) {
      var tab = document.createElement('button');
      tab.className = 'cv-tab' + (view === self._currentView ? ' active' : '');
      tab.dataset.view = view;
      tab.textContent = viewLabels[view] || view;
      tab.addEventListener('click', function () { self.setView(view); });
      tabBar.appendChild(tab);
    });
    this._container.appendChild(tabBar);

    // Search + filter row (for timeline/chapters)
    var toolRow = document.createElement('div');
    toolRow.className = 'cv-tool-row';
    toolRow.id = this._containerId + '-tool-row';

    var searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.className = 'cv-search';
    searchInput.placeholder = 'Search chronicle…';
    searchInput.addEventListener('input', function (e) {
      self._searchQuery = e.target.value.toLowerCase().trim();
      self._renderBody();
    });
    toolRow.appendChild(searchInput);

    var filterSel = document.createElement('select');
    filterSel.className = 'cv-type-filter';
    FILTER_TYPES.forEach(function (f) {
      var opt = document.createElement('option');
      opt.value = f.key;
      opt.textContent = f.label;
      filterSel.appendChild(opt);
    });
    filterSel.addEventListener('change', function (e) {
      self.filterByType(e.target.value);
    });
    toolRow.appendChild(filterSel);

    var exportBtn = document.createElement('button');
    exportBtn.className = 'cv-export-btn';
    exportBtn.textContent = '⬇ Export';
    exportBtn.addEventListener('click', function () { self.exportChronicle(); });
    toolRow.appendChild(exportBtn);

    this._container.appendChild(toolRow);

    // Body
    var body = document.createElement('div');
    body.className = 'cv-body';
    body.id = this._containerId + '-body';
    this._container.appendChild(body);

    // Detail overlay
    var overlay = document.createElement('div');
    overlay.className = 'cv-detail-overlay hidden';
    overlay.id = this._containerId + '-detail';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        overlay.innerHTML = '';
      }
    });
    this._container.appendChild(overlay);
    this._detailOverlay = overlay;
  };

  // ── render ────────────────────────────────────────────────────────────────────

  ChronicleView.prototype.render = function (chronicleState, calendarState) {
    this._chronicleState = chronicleState || {};
    this._calendarState = calendarState || {};
    if (!this._container) return;
    this._renderBody();
  };

  ChronicleView.prototype._renderBody = function () {
    var body = document.getElementById(this._containerId + '-body');
    if (!body) return;
    body.innerHTML = '';

    var toolRow = document.getElementById(this._containerId + '-tool-row');
    if (toolRow) {
      var showTools = (this._currentView === 'timeline' || this._currentView === 'by_chapter');
      toolRow.style.display = showTools ? '' : 'none';
    }

    switch (this._currentView) {
      case 'timeline':
        this._renderTimeline(body);
        break;
      case 'by_chapter':
        this._renderByChapter(body);
        break;
      case 'achievements':
        this._renderAchievements(body);
        break;
      case 'legacy':
        this._renderLegacy(body);
        break;
    }
  };

  // ── Timeline View ─────────────────────────────────────────────────────────────

  ChronicleView.prototype._renderTimeline = function (body) {
    var self = this;
    var entries = this._getFilteredEntries();

    if (entries.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'cv-empty';
      empty.textContent = 'No chronicle entries yet. Live the tale, and it shall be written.';
      body.appendChild(empty);
      return;
    }

    var titleEl = document.createElement('div');
    titleEl.className = 'cv-timeline-title';
    titleEl.textContent = 'The Life of Heinrich Renard';
    body.appendChild(titleEl);

    var timeline = document.createElement('div');
    timeline.className = 'cv-timeline';

    // Group by approximate date clusters (10 turns per cluster)
    var grouped = {};
    entries.forEach(function (entry) {
      var cluster = Math.floor((entry.turn || 0) / 10) * 10;
      if (!grouped[cluster]) grouped[cluster] = [];
      grouped[cluster].push(entry);
    });

    var clusters = Object.keys(grouped).map(Number).sort(function (a, b) { return b - a; });

    clusters.forEach(function (cluster) {
      var clusterEntries = grouped[cluster];

      clusterEntries.forEach(function (entry) {
        var entryEl = self._buildTimelineEntry(entry);
        timeline.appendChild(entryEl);
      });
    });

    body.appendChild(timeline);
  };

  ChronicleView.prototype._buildTimelineEntry = function (entry) {
    var icon = ENTRY_TYPE_ICONS[entry.type] || ENTRY_TYPE_ICONS.default;
    var dateStr = entry.date ? formatMedievalDate(entry.date) : getTurnDateLabel(entry.turn || 0);

    var entryEl = document.createElement('div');
    entryEl.className = 'cv-timeline-entry cv-entry-' + (entry.type || 'default');
    entryEl.dataset.turn = entry.turn || 0;

    var iconEl = document.createElement('div');
    iconEl.className = 'cv-entry-icon';
    iconEl.textContent = icon;

    var contentEl = document.createElement('div');
    contentEl.className = 'cv-entry-content';

    var dateEl = document.createElement('div');
    dateEl.className = 'cv-entry-date';
    dateEl.textContent = dateStr;

    var typeEl = document.createElement('span');
    typeEl.className = 'cv-entry-type-badge cv-type-' + (entry.type || 'default');
    typeEl.textContent = ENTRY_TYPE_LABELS[entry.type] || (entry.type || 'Event');

    var summaryEl = document.createElement('div');
    summaryEl.className = 'cv-entry-summary';
    summaryEl.textContent = entry.summary || '';

    var turnEl = document.createElement('div');
    turnEl.className = 'cv-entry-turn';
    turnEl.textContent = 'Turn ' + (entry.turn || 0);

    contentEl.appendChild(dateEl);
    contentEl.appendChild(typeEl);
    contentEl.appendChild(summaryEl);
    contentEl.appendChild(turnEl);
    entryEl.appendChild(iconEl);
    entryEl.appendChild(contentEl);

    return entryEl;
  };

  ChronicleView.prototype._getFilteredEntries = function () {
    var entries = (this._chronicleState.entries || []).slice();

    // Type filter
    if (this._filterType && this._filterType !== 'all') {
      var filterType = this._filterType;
      entries = entries.filter(function (e) { return e.type === filterType; });
    }

    // Search
    if (this._searchQuery) {
      var q = this._searchQuery;
      entries = entries.filter(function (e) {
        return (e.summary || '').toLowerCase().indexOf(q) !== -1
          || (e.title || '').toLowerCase().indexOf(q) !== -1;
      });
    }

    // Sort newest first
    entries.sort(function (a, b) { return (b.turn || 0) - (a.turn || 0); });

    return entries;
  };

  // ── By Chapter View ───────────────────────────────────────────────────────────

  ChronicleView.prototype._renderByChapter = function (body) {
    var self = this;
    var chapters = this._buildChapters();

    if (chapters.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'cv-empty';
      empty.textContent = 'No chapters yet. Heinrich\'s story is just beginning.';
      body.appendChild(empty);
      return;
    }

    chapters.forEach(function (chapter) {
      var chEl = document.createElement('div');
      chEl.className = 'cv-chapter';
      chEl.dataset.chapter = chapter.number;

      var isExpanded = self._expandedChapters[chapter.number] !== false; // default open

      var chHeader = document.createElement('div');
      chHeader.className = 'cv-chapter-header' + (isExpanded ? ' expanded' : '');
      chHeader.innerHTML = '<span class="cv-chapter-num">Chapter ' + toRoman(chapter.number) + '</span>'
        + '<span class="cv-chapter-title">' + escapeHtml(chapter.title) + '</span>'
        + '<span class="cv-chapter-turns">Turns ' + chapter.startTurn + '–' + (chapter.endTurn || '…') + '</span>'
        + '<span class="cv-chapter-toggle">' + (isExpanded ? '▾' : '▸') + '</span>';

      chHeader.addEventListener('click', function () {
        self._expandedChapters[chapter.number] = !isExpanded;
        self._renderBody();
      });

      chEl.appendChild(chHeader);

      if (isExpanded) {
        var chBody = document.createElement('div');
        chBody.className = 'cv-chapter-body';

        if (chapter.description) {
          var chDesc = document.createElement('div');
          chDesc.className = 'cv-chapter-desc';
          chDesc.textContent = chapter.description;
          chBody.appendChild(chDesc);
        }

        // Filter entries for this chapter
        var allEntries = self._getFilteredEntries();
        var chEntries = allEntries.filter(function (e) {
          var t = e.turn || 0;
          return t >= chapter.startTurn && (chapter.endTurn === null || t <= chapter.endTurn);
        });

        if (chEntries.length === 0) {
          var noEntries = document.createElement('div');
          noEntries.className = 'cv-chapter-empty';
          noEntries.textContent = 'No recorded events in this chapter.';
          chBody.appendChild(noEntries);
        } else {
          var entryList = document.createElement('div');
          entryList.className = 'cv-chapter-entries';
          chEntries.forEach(function (entry) {
            entryList.appendChild(self._buildTimelineEntry(entry));
          });
          chBody.appendChild(entryList);
        }

        chEl.appendChild(chBody);
      }

      body.appendChild(chEl);
    });
  };

  ChronicleView.prototype._buildChapters = function () {
    var chapters = this._chronicleState.chapters;
    if (chapters && chapters.length > 0) return chapters;

    // Auto-generate chapters from entries if not explicitly defined
    var entries = this._chronicleState.entries || [];
    if (entries.length === 0) return [];

    var allTurns = entries.map(function (e) { return e.turn || 0; });
    var maxTurn = Math.max.apply(null, allTurns);
    var generatedChapters = [];

    // Find class change milestones
    var milestones = entries.filter(function (e) { return e.type === 'milestone' && e.isClassChange; });

    if (milestones.length === 0) {
      // Just one chapter
      generatedChapters.push({
        number: 1,
        title: 'The Serf',
        startTurn: 0,
        endTurn: null,
        description: 'The beginning of Heinrich\'s tale, born low and striving upward.'
      });
    } else {
      var starts = [0].concat(milestones.map(function (m) { return m.turn || 0; }));
      var titles = ['The Serf'].concat(milestones.map(function (m) { return m.chapterTitle || 'The Next Chapter'; }));

      starts.forEach(function (startTurn, idx) {
        generatedChapters.push({
          number: idx + 1,
          title: titles[idx],
          startTurn: startTurn,
          endTurn: idx < starts.length - 1 ? starts[idx + 1] - 1 : null,
          description: null
        });
      });
    }

    return generatedChapters;
  };

  function toRoman(n) {
    var vals = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];
    var syms = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];
    var result = '';
    for (var i = 0; i < vals.length; i++) {
      while (n >= vals[i]) {
        result += syms[i];
        n -= vals[i];
      }
    }
    return result || 'I';
  }

  // ── Achievements View ─────────────────────────────────────────────────────────

  ChronicleView.prototype._renderAchievements = function (body) {
    var achievements = this._chronicleState.achievements || [];

    var header = document.createElement('div');
    header.className = 'cv-ach-header';
    header.innerHTML = '<h2 class="cv-ach-title">Achievements</h2>'
      + '<div class="cv-ach-count"><b>' + achievements.length + '</b> earned</div>';
    body.appendChild(header);

    if (achievements.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'cv-empty';
      empty.textContent = 'No achievements yet. Great deeds await.';
      body.appendChild(empty);
      return;
    }

    // Group by rarity
    var byRarity = { legendary: [], rare: [], uncommon: [], common: [] };
    achievements.forEach(function (ach) {
      var r = ach.rarity || 'common';
      if (!byRarity[r]) byRarity[r] = [];
      byRarity[r].push(ach);
    });

    var rarityOrder = ['legendary', 'rare', 'uncommon', 'common'];
    var self = this;

    rarityOrder.forEach(function (rarity) {
      var group = byRarity[rarity];
      if (!group || group.length === 0) return;
      var rarityInfo = ACHIEVEMENT_RARITIES[rarity] || ACHIEVEMENT_RARITIES.common;

      var groupEl = document.createElement('div');
      groupEl.className = 'cv-ach-group cv-ach-group-' + rarity;

      var groupHeader = document.createElement('div');
      groupHeader.className = 'cv-ach-group-header ' + rarityInfo.class;
      groupHeader.textContent = rarityInfo.label + ' (' + group.length + ')';
      groupEl.appendChild(groupHeader);

      var grid = document.createElement('div');
      grid.className = 'cv-ach-grid';

      group.forEach(function (ach) {
        var achEl = document.createElement('div');
        achEl.className = 'cv-ach-card ' + rarityInfo.class;

        var achIcon = document.createElement('div');
        achIcon.className = 'cv-ach-icon';
        achIcon.textContent = ach.icon || '🏆';

        var achName = document.createElement('div');
        achName.className = 'cv-ach-name';
        achName.textContent = ach.name || 'Unknown Achievement';

        var achDesc = document.createElement('div');
        achDesc.className = 'cv-ach-desc';
        achDesc.textContent = ach.description || '';

        var achDate = document.createElement('div');
        achDate.className = 'cv-ach-date';
        achDate.textContent = ach.date ? formatMedievalDate(ach.date) : (ach.turn ? 'Turn ' + ach.turn : '');

        achEl.appendChild(achIcon);
        achEl.appendChild(achName);
        achEl.appendChild(achDesc);
        achEl.appendChild(achDate);

        achEl.addEventListener('click', function () {
          self._showAchievementDetail(ach);
        });

        grid.appendChild(achEl);
      });

      groupEl.appendChild(grid);
      body.appendChild(groupEl);
    });
  };

  ChronicleView.prototype._showAchievementDetail = function (ach) {
    if (!this._detailOverlay) return;
    var self = this;
    var rarityInfo = ACHIEVEMENT_RARITIES[ach.rarity || 'common'] || ACHIEVEMENT_RARITIES.common;

    var panel = document.createElement('div');
    panel.className = 'cv-ach-detail-panel ' + rarityInfo.class;

    var closeBtn = document.createElement('button');
    closeBtn.className = 'cv-detail-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () {
      self._detailOverlay.classList.add('hidden');
      self._detailOverlay.innerHTML = '';
    });
    panel.appendChild(closeBtn);

    panel.innerHTML += '<div class="cv-ach-detail-icon">' + (ach.icon || '🏆') + '</div>'
      + '<h3 class="cv-ach-detail-name">' + escapeHtml(ach.name || '') + '</h3>'
      + '<div class="cv-ach-detail-rarity ' + rarityInfo.class + '">' + rarityInfo.label + '</div>'
      + '<div class="cv-ach-detail-desc">' + escapeHtml(ach.description || '') + '</div>'
      + (ach.flavorText ? '<div class="cv-ach-detail-flavor">"' + escapeHtml(ach.flavorText) + '"</div>' : '')
      + '<div class="cv-ach-detail-date">Earned: ' + (ach.date ? formatMedievalDate(ach.date) : 'Turn ' + (ach.turn || '?')) + '</div>';

    this._detailOverlay.innerHTML = '';
    this._detailOverlay.appendChild(panel);
    this._detailOverlay.classList.remove('hidden');
  };

  // ── Legacy View ───────────────────────────────────────────────────────────────

  ChronicleView.prototype._renderLegacy = function (body) {
    var legacy = this._chronicleState.legacy || {};

    // Compute total score
    var totalScore = 0;
    var scores = {};
    LEGACY_CATEGORIES.forEach(function (cat) {
      var raw = legacy[cat.key] || 0;
      var capped = Math.min(cat.max, Math.max(0, raw));
      scores[cat.key] = capped;
      totalScore += capped;
    });

    var legacyTitle = getLegacyTitle(totalScore);

    // Heinrich name
    var characterName = (this._chronicleState.characterName) || 'Heinrich Renard';

    // Legacy banner
    var banner = document.createElement('div');
    banner.className = 'cv-legacy-banner';
    banner.innerHTML = '<div class="cv-legacy-character-name">' + escapeHtml(characterName) + '</div>'
      + '<div class="cv-legacy-score-display">'
      + '<span class="cv-legacy-score">' + totalScore + '</span>'
      + '<span class="cv-legacy-max">/500</span>'
      + '</div>'
      + '<div class="cv-legacy-title">' + escapeHtml(legacyTitle) + '</div>';
    body.appendChild(banner);

    // Overall bar
    var overallWrap = document.createElement('div');
    overallWrap.className = 'cv-legacy-overall';
    var overallPct = Math.floor((totalScore / 500) * 100);
    overallWrap.innerHTML = '<div class="cv-legacy-overall-bar">'
      + '<div class="cv-legacy-overall-fill" style="width:' + overallPct + '%"></div>'
      + '</div>';
    body.appendChild(overallWrap);

    // Legacy title progression
    var progressionEl = document.createElement('div');
    progressionEl.className = 'cv-legacy-progression';
    LEGACY_TITLES.forEach(function (tier) {
      var reached = totalScore >= (tier.max - 50);
      var current = totalScore <= tier.max && totalScore > (tier.max - 50);
      var tierEl = document.createElement('div');
      tierEl.className = 'cv-legacy-tier'
        + (reached ? ' cv-tier-reached' : '')
        + (current ? ' cv-tier-current' : '');
      tierEl.innerHTML = '<span class="cv-tier-threshold">' + tier.max + '</span>'
        + '<span class="cv-tier-title">' + tier.title + '</span>';
      progressionEl.appendChild(tierEl);
    });
    body.appendChild(progressionEl);

    // Category breakdown
    var breakdown = document.createElement('div');
    breakdown.className = 'cv-legacy-breakdown';
    var breakdownTitle = document.createElement('div');
    breakdownTitle.className = 'cv-legacy-section-title';
    breakdownTitle.textContent = 'Legacy Breakdown';
    breakdown.appendChild(breakdownTitle);

    LEGACY_CATEGORIES.forEach(function (cat) {
      var score = scores[cat.key];
      var pct = Math.floor((score / cat.max) * 100);

      var catEl = document.createElement('div');
      catEl.className = 'cv-legacy-cat';

      var catHeader = document.createElement('div');
      catHeader.className = 'cv-legacy-cat-header';
      catHeader.innerHTML = '<span class="cv-legacy-cat-icon">' + cat.icon + '</span>'
        + '<span class="cv-legacy-cat-label">' + cat.label + '</span>'
        + '<span class="cv-legacy-cat-score">' + score + ' / ' + cat.max + '</span>';

      var catBar = document.createElement('div');
      catBar.className = 'cv-legacy-cat-bar';
      var catFill = document.createElement('div');
      catFill.className = 'cv-legacy-cat-fill';
      catFill.style.width = pct + '%';
      catBar.appendChild(catFill);

      catEl.appendChild(catHeader);
      catEl.appendChild(catBar);
      breakdown.appendChild(catEl);
    });

    body.appendChild(breakdown);

    // Songs and stories about Heinrich
    var songs = this._chronicleState.songsAboutHeinrich || [];
    if (songs.length > 0) {
      var songsEl = document.createElement('div');
      songsEl.className = 'cv-legacy-songs';
      songsEl.innerHTML = '<div class="cv-legacy-section-title">🎵 Songs & Stories</div>';
      songs.forEach(function (song) {
        var songEl = document.createElement('div');
        songEl.className = 'cv-song-entry';
        songEl.innerHTML = '<div class="cv-song-title">' + escapeHtml(song.title || 'Untitled') + '</div>'
          + '<div class="cv-song-desc">' + escapeHtml(song.description || '') + '</div>'
          + (song.origin ? '<div class="cv-song-origin">Composed in ' + escapeHtml(song.origin) + '</div>' : '');
        songsEl.appendChild(songEl);
      });
      body.appendChild(songsEl);
    }
  };

  // ── update ────────────────────────────────────────────────────────────────────

  ChronicleView.prototype.update = function (chronicleState) {
    this._chronicleState = chronicleState || this._chronicleState;
    if (!this._container) return;
    this._renderBody();
  };

  // ── setView ───────────────────────────────────────────────────────────────────

  ChronicleView.prototype.setView = function (view) {
    if (VIEWS.indexOf(view) === -1) return;
    this._currentView = view;

    var tabs = this._container && this._container.querySelectorAll('.cv-tab');
    if (tabs) {
      tabs.forEach(function (tab) {
        tab.classList.toggle('active', tab.dataset.view === view);
      });
    }

    this._renderBody();
  };

  // ── filterByType ──────────────────────────────────────────────────────────────

  ChronicleView.prototype.filterByType = function (type) {
    this._filterType = type || 'all';
    var sel = this._container && this._container.querySelector('.cv-type-filter');
    if (sel) sel.value = this._filterType;
    this._renderBody();
  };

  // ── searchChronicle ───────────────────────────────────────────────────────────

  ChronicleView.prototype.searchChronicle = function (query) {
    this._searchQuery = (query || '').toLowerCase().trim();
    var input = this._container && this._container.querySelector('.cv-search');
    if (input) input.value = query || '';
    if (this._currentView !== 'timeline' && this._currentView !== 'by_chapter') {
      this.setView('timeline');
    } else {
      this._renderBody();
    }
  };

  // ── exportChronicle ───────────────────────────────────────────────────────────

  ChronicleView.prototype.exportChronicle = function () {
    var chronicle = this._chronicleState;
    var characterName = chronicle.characterName || 'Heinrich Renard';
    var chapters = this._buildChapters();
    var entries = (chronicle.entries || []).slice().sort(function (a, b) {
      return (a.turn || 0) - (b.turn || 0);
    });
    var achievements = chronicle.achievements || [];
    var legacy = chronicle.legacy || {};

    var lines = [];
    lines.push('══════════════════════════════════════════════════');
    lines.push('THE CHRONICLE OF ' + characterName.toUpperCase());
    lines.push('══════════════════════════════════════════════════');
    lines.push('');

    // Chapters
    chapters.forEach(function (chapter) {
      lines.push('── Chapter ' + toRoman(chapter.number) + ': ' + chapter.title + ' ──');
      if (chapter.description) lines.push(chapter.description);
      lines.push('Turns ' + chapter.startTurn + '–' + (chapter.endTurn || '…'));
      lines.push('');

      var chEntries = entries.filter(function (e) {
        var t = e.turn || 0;
        return t >= chapter.startTurn && (chapter.endTurn === null || t <= chapter.endTurn);
      });

      chEntries.forEach(function (e) {
        var dateStr = e.date ? formatMedievalDate(e.date) : 'Turn ' + (e.turn || 0);
        var icon = ENTRY_TYPE_ICONS[e.type] || ENTRY_TYPE_ICONS.default;
        lines.push('[' + dateStr + '] ' + icon + ' ' + (e.summary || ''));
      });
      lines.push('');
    });

    // Achievements
    if (achievements.length > 0) {
      lines.push('── Achievements ──');
      achievements.forEach(function (ach) {
        var rarityInfo = ACHIEVEMENT_RARITIES[ach.rarity || 'common'] || ACHIEVEMENT_RARITIES.common;
        lines.push((ach.icon || '🏆') + ' ' + ach.name + ' [' + rarityInfo.label + ']');
        if (ach.description) lines.push('   ' + ach.description);
      });
      lines.push('');
    }

    // Legacy
    lines.push('── Legacy ──');
    var totalScore = 0;
    LEGACY_CATEGORIES.forEach(function (cat) {
      var score = Math.min(cat.max, Math.max(0, legacy[cat.key] || 0));
      totalScore += score;
      lines.push(cat.icon + ' ' + cat.label + ': ' + score + '/' + cat.max);
    });
    lines.push('');
    lines.push('Total Legacy Score: ' + totalScore + '/500 — ' + getLegacyTitle(totalScore));
    lines.push('');
    lines.push('══════════════════════════════════════════════════');

    var text = lines.join('\n');

    // Trigger download
    try {
      var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = 'chronicle-of-' + characterName.toLowerCase().replace(/\s+/g, '-') + '.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('[ChronicleView] Export failed:', e);
      // Fallback: show in overlay
      if (this._detailOverlay) {
        var panel = document.createElement('div');
        panel.className = 'cv-export-panel';
        var closeBtn = document.createElement('button');
        closeBtn.className = 'cv-detail-close';
        closeBtn.textContent = '✕';
        var overlay = this._detailOverlay;
        closeBtn.addEventListener('click', function () {
          overlay.classList.add('hidden');
          overlay.innerHTML = '';
        });
        var pre = document.createElement('pre');
        pre.className = 'cv-export-text';
        pre.textContent = text;
        panel.appendChild(closeBtn);
        panel.appendChild(pre);
        this._detailOverlay.innerHTML = '';
        this._detailOverlay.appendChild(panel);
        this._detailOverlay.classList.remove('hidden');
      }
    }

    return text;
  };

  // Expose to global
  global.ChronicleView = ChronicleView;

})(typeof window !== 'undefined' ? window : this);

// END FILE: client/js/ui/chronicle-view.js
