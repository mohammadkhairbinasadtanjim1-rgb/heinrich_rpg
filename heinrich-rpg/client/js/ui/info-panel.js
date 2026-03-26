// FILE: client/js/ui/info-panel.js — PART 10
// InfoPanel — right panel with tabbed content for Heinrich RPG.
// IIFE pattern — exposes global `InfoPanel`.

(function (global) {
  'use strict';

  // ─── Tab definitions ──────────────────────────────────────────────────────
  var TABS = [
    { name: 'npcs',         label: 'NPCs',         icon: '👥', shortcut: '1' },
    { name: 'inventory',    label: 'Inventory',    icon: '🎒', shortcut: '2' },
    { name: 'map',          label: 'Map',          icon: '🗺️',  shortcut: '3' },
    { name: 'skills',       label: 'Skills',       icon: '📈', shortcut: '4' },
    { name: 'holdings',     label: 'Holdings',     icon: '🏰', shortcut: '5' },
    { name: 'chronicle',    label: 'Chronicle',    icon: '📜', shortcut: '6' },
    { name: 'memory',       label: 'Memory',       icon: '🧠', shortcut: '7' },
    { name: 'consequences', label: 'Consequences', icon: '⚡', shortcut: '8' },
    { name: 'inventions',   label: 'Inventions',   icon: '⚙️', shortcut: '9' }
  ];

  var STORAGE_KEY = 'heinrich_infopanel_prefs';

  // ─── State ────────────────────────────────────────────────────────────────
  var _containerId     = null;
  var _container       = null;
  var _activeTab       = 'npcs';
  var _tabRenderers    = {};   // tabName → renderFn(gameState, containerEl)
  var _tabBadges       = {};   // tabName → count
  var _tabNewFlags     = {};   // tabName → bool (unseen changes)
  var _tabLastSeen     = {};   // tabName → timestamp
  var _tabContentEls   = {};   // tabName → DOM element
  var _tabButtonEls    = {};   // tabName → DOM button element
  var _lastGameState   = null;
  var _tabBarEl        = null;
  var _contentAreaEl   = null;
  var _initialized     = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function _esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _savePrefs() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ activeTab: _activeTab }));
    } catch (e) { /* ignore */ }
  }

  function _loadPrefs() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) { return JSON.parse(raw); }
    } catch (e) { /* ignore */ }
    return { activeTab: 'npcs' };
  }

  // ─── Build DOM ────────────────────────────────────────────────────────────
  function _buildTabBar() {
    var bar = document.createElement('div');
    bar.className = 'info-panel-tab-bar';
    bar.setAttribute('role', 'tablist');
    bar.setAttribute('aria-label', 'Info Panel Tabs');

    TABS.forEach(function (tab) {
      var btn = document.createElement('button');
      btn.className        = 'info-tab-btn';
      btn.dataset.tab      = tab.name;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', 'false');
      btn.setAttribute('aria-controls', 'info-pane-' + tab.name);
      btn.setAttribute('title', tab.label + ' (Alt+' + tab.shortcut + ')');
      btn.innerHTML =
        '<span class="tab-icon">' + tab.icon + '</span>' +
        '<span class="tab-label">' + _esc(tab.label) + '</span>' +
        '<span class="tab-badge" id="tab-badge-' + tab.name + '" aria-live="polite" style="display:none"></span>' +
        '<span class="tab-new-dot" id="tab-new-' + tab.name + '" style="display:none" title="New content"></span>';

      btn.addEventListener('click', function () {
        InfoPanel.setActiveTab(tab.name);
      });

      _tabButtonEls[tab.name] = btn;
      bar.appendChild(btn);
    });

    return bar;
  }

  function _buildContentPanes() {
    var area = document.createElement('div');
    area.className = 'info-panel-content';

    TABS.forEach(function (tab) {
      var pane = document.createElement('div');
      pane.id        = 'info-pane-' + tab.name;
      pane.className = 'info-tab-pane';
      pane.setAttribute('role', 'tabpanel');
      pane.setAttribute('aria-labelledby', 'info-tab-btn-' + tab.name);
      pane.setAttribute('aria-hidden', 'true');
      pane.style.display = 'none';

      // Default placeholder
      pane.innerHTML =
        '<div class="info-pane-placeholder">' +
          tab.icon + ' ' + _esc(tab.label) + ' loading…' +
        '</div>';

      _tabContentEls[tab.name] = pane;
      area.appendChild(pane);
    });

    return area;
  }

  // ─── Tab switching ────────────────────────────────────────────────────────
  function _showPane(tabName) {
    // Hide all
    TABS.forEach(function (tab) {
      var pane = _tabContentEls[tab.name];
      var btn  = _tabButtonEls[tab.name];
      if (pane) {
        pane.style.display = 'none';
        pane.classList.remove('tab-pane-active', 'tab-fade-in');
        pane.setAttribute('aria-hidden', 'true');
      }
      if (btn) {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      }
    });

    // Show target
    var targetPane = _tabContentEls[tabName];
    var targetBtn  = _tabButtonEls[tabName];
    if (targetPane) {
      targetPane.style.display = 'block';
      // Trigger fade
      requestAnimationFrame(function () {
        targetPane.classList.add('tab-pane-active', 'tab-fade-in');
      });
      targetPane.setAttribute('aria-hidden', 'false');
    }
    if (targetBtn) {
      targetBtn.classList.add('active');
      targetBtn.setAttribute('aria-selected', 'true');
    }

    // Clear "new" dot when user views tab
    _tabNewFlags[tabName] = false;
    _tabLastSeen[tabName] = Date.now();
    var newDot = document.getElementById('tab-new-' + tabName);
    if (newDot) { newDot.style.display = 'none'; }
  }

  // ─── Default placeholder renderers ────────────────────────────────────────
  function _defaultNpcRenderer(gs, el) {
    var npcs = (gs && gs.npcs) ? gs.npcs : [];
    if (!npcs.length) {
      el.innerHTML = '<p class="info-empty">No notable people nearby.</p>';
      return;
    }
    el.innerHTML = npcs.map(function (npc) {
      var favor     = npc.favorability || npc.favor || 0;
      var favorColor = favor >= 50 ? '#2d5a27' : favor >= 0 ? '#c4a35a' : '#8b2500';
      return (
        '<div class="npc-card">' +
          '<div class="npc-name">' + _esc(npc.name || 'Unknown') + '</div>' +
          '<div class="npc-role">' + _esc(npc.role || '') + '</div>' +
          '<div class="npc-favor" style="color:' + favorColor + '">' +
            '♥ ' + favor + '</div>' +
          (npc.mood ? '<div class="npc-mood">' + _esc(npc.mood) + '</div>' : '') +
        '</div>'
      );
    }).join('');
  }

  function _defaultInventoryRenderer(gs, el) {
    var inv = (gs && gs.inventory) ? gs.inventory : [];
    if (!inv.length) {
      el.innerHTML = '<p class="info-empty">Your pack is empty.</p>';
      return;
    }
    el.innerHTML =
      '<table class="inventory-table">' +
        '<thead><tr>' +
          '<th>Item</th><th>Qty</th><th>Weight</th>' +
        '</tr></thead>' +
        '<tbody>' +
        inv.map(function (item) {
          var qty    = item.quantity != null ? item.quantity : 1;
          var weight = item.weight   != null ? item.weight   : '–';
          return (
            '<tr>' +
              '<td>' + _esc(item.name || 'Item') + '</td>' +
              '<td>' + _esc(qty) + '</td>' +
              '<td>' + _esc(weight) + '</td>' +
            '</tr>'
          );
        }).join('') +
        '</tbody>' +
      '</table>';
  }

  function _defaultSkillsRenderer(gs, el) {
    var skills = (gs && gs.skills) ? gs.skills : {};
    var keys   = Object.keys(skills);
    if (!keys.length) {
      el.innerHTML = '<p class="info-empty">No skills recorded.</p>';
      return;
    }
    var BAR_LEN = 8;
    el.innerHTML =
      '<div class="skills-list">' +
      keys.map(function (k) {
        var s      = skills[k];
        var level  = s.level  || s || 0;
        var xp     = s.xp     || 0;
        var xpMax  = s.xpMax  || s.xpThreshold || 100;
        var filled = Math.round((xp / xpMax) * BAR_LEN);
        var bar    = '█'.repeat(filled) + '░'.repeat(BAR_LEN - filled);
        return (
          '<div class="skill-row">' +
            '<span class="skill-name">' + _esc(k) + '</span>' +
            '<span class="skill-level">Lv.' + _esc(level) + '</span>' +
            '<span class="skill-bar">' + bar + '</span>' +
            '<span class="skill-xp">' + _esc(xp) + '/' + _esc(xpMax) + '</span>' +
          '</div>'
        );
      }).join('') +
      '</div>';
  }

  function _defaultMapRenderer(gs, el) {
    el.innerHTML =
      '<div class="map-placeholder">' +
        '🗺️<br><small>Interactive map coming soon.<br>Current location: ' +
        _esc((gs && gs.location && gs.location.name) || 'Unknown') + '</small>' +
      '</div>';
  }

  function _defaultHoldingsRenderer(gs, el) {
    var holdings = (gs && gs.holdings) ? gs.holdings : [];
    if (!holdings.length) {
      el.innerHTML = '<p class="info-empty">No holdings owned.</p>';
      return;
    }
    el.innerHTML = holdings.map(function (h) {
      return (
        '<div class="holding-card">' +
          '<div class="holding-name">🏰 ' + _esc(h.name || 'Holding') + '</div>' +
          '<div class="holding-type">' + _esc(h.type || '') + '</div>' +
          (h.condition ? '<div class="holding-cond">' + _esc(h.condition) + '</div>' : '') +
        '</div>'
      );
    }).join('');
  }

  function _defaultChronicleRenderer(gs, el) {
    el.innerHTML =
      '<div class="chronicle-placeholder">' +
        '📜 Chronicle of Heinrich<br>' +
        '<small>Session events are recorded here.</small>' +
      '</div>';
    if (global.ProseDisplay && typeof global.ProseDisplay.exportProseAsText === 'function') {
      var text = global.ProseDisplay.exportProseAsText();
      if (text) {
        el.innerHTML =
          '<div class="chronicle-content">' +
            '<pre>' + _esc(text) + '</pre>' +
          '</div>';
      }
    }
  }

  function _defaultMemoryRenderer(gs, el) {
    var memory = (gs && gs.memory) ? gs.memory : [];
    if (!memory.length) {
      el.innerHTML = '<p class="info-empty">No memories recorded.</p>';
      return;
    }
    el.innerHTML =
      '<div class="memory-list">' +
      memory.map(function (m) {
        var type    = typeof m === 'string' ? 'fact' : (m.type || 'fact');
        var content = typeof m === 'string' ? m      : (m.content || m.text || '');
        var icons   = { fact: '💡', person: '👤', place: '📍', event: '⚡', secret: '🤫' };
        var icon    = icons[type] || '💡';
        return (
          '<div class="memory-entry">' +
            '<span class="memory-icon">' + icon + '</span>' +
            '<span class="memory-text">' + _esc(content) + '</span>' +
          '</div>'
        );
      }).join('') +
      '</div>';
  }

  function _defaultConsequencesRenderer(gs, el) {
    var cons  = (gs && gs.consequences) ? gs.consequences : [];
    var oaths = (gs && gs.oaths)        ? gs.oaths        : [];

    el.innerHTML = '';

    if (oaths.length) {
      var oathSection = document.createElement('div');
      oathSection.innerHTML =
        '<h4 class="info-subsection-title">📜 Active Oaths (' + oaths.length + ')</h4>' +
        oaths.map(function (o) {
          var text   = typeof o === 'string' ? o : (o.text || o.description || 'Oath');
          var broken = o.broken ? ' <span class="oath-broken">[BROKEN]</span>' : '';
          return '<div class="oath-entry">' + _esc(text) + broken + '</div>';
        }).join('');
      el.appendChild(oathSection);
    }

    if (cons.length) {
      var consSection = document.createElement('div');
      consSection.innerHTML =
        '<h4 class="info-subsection-title">⚡ Consequence Threads (' + cons.length + ')</h4>' +
        cons.map(function (c) {
          var text     = typeof c === 'string' ? c : (c.description || c.text || 'Consequence');
          var severity = typeof c === 'object' ? (c.severity || '') : '';
          var col      = severity === 'severe' ? '#8b2500' : severity === 'moderate' ? '#c4a35a' : '#e8dcc8';
          return (
            '<div class="consequence-entry" style="color:' + col + '">' +
              _esc(text) +
            '</div>'
          );
        }).join('');
      el.appendChild(consSection);
    }

    if (!oaths.length && !cons.length) {
      el.innerHTML = '<p class="info-empty">No active oaths or consequences.</p>';
    }
  }

  function _defaultInventionsRenderer(gs, el) {
    var inventions = (gs && gs.inventions) ? gs.inventions : [];
    if (!inventions.length) {
      el.innerHTML = '<p class="info-empty">No inventions in progress.</p>';
      return;
    }
    el.innerHTML = inventions.map(function (inv) {
      var progress = inv.progress  || 0;
      var maxProg  = inv.maxProgress || 100;
      var pct      = Math.round(Math.min(100, (progress / maxProg) * 100));
      var filled   = Math.round(pct / 100 * 8);
      var bar      = '█'.repeat(filled) + '░'.repeat(8 - filled);
      return (
        '<div class="invention-card">' +
          '<div class="invention-name">⚙️ ' + _esc(inv.name || 'Invention') + '</div>' +
          '<div class="invention-stage">' + _esc(inv.stage || '') + '</div>' +
          '<div class="invention-progress-row">' +
            '<span class="inv-bar">' + bar + '</span>' +
            '<span class="inv-pct">' + pct + '%</span>' +
          '</div>' +
          (inv.nextMilestone ? '<div class="inv-next">Next: ' + _esc(inv.nextMilestone) + '</div>' : '') +
        '</div>'
      );
    }).join('');
  }

  // ─── Register default renderers ───────────────────────────────────────────
  var DEFAULT_RENDERERS = {
    npcs:         _defaultNpcRenderer,
    inventory:    _defaultInventoryRenderer,
    map:          _defaultMapRenderer,
    skills:       _defaultSkillsRenderer,
    holdings:     _defaultHoldingsRenderer,
    chronicle:    _defaultChronicleRenderer,
    memory:       _defaultMemoryRenderer,
    consequences: _defaultConsequencesRenderer,
    inventions:   _defaultInventionsRenderer
  };

  // ─── Keyboard shortcuts setup ─────────────────────────────────────────────
  function _setupKeyboardShortcuts() {
    document.addEventListener('keydown', function (e) {
      if (!e.altKey) return;
      TABS.forEach(function (tab) {
        if (e.key === tab.shortcut) {
          e.preventDefault();
          InfoPanel.setActiveTab(tab.name);
          if (global.Layout && typeof global.Layout.showPanel === 'function') {
            global.Layout.showPanel('panel-right');
          }
        }
      });
    });
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  var InfoPanel = {

    init: function (containerId) {
      if (_initialized) return;
      _initialized = true;

      _containerId = containerId || 'info-panel';
      _container   = document.getElementById(_containerId);
      if (!_container) {
        console.warn('[InfoPanel] Container #' + _containerId + ' not found.');
        return;
      }

      // Build structure
      _container.innerHTML = '';

      _tabBarEl      = _buildTabBar();
      _contentAreaEl = _buildContentPanes();

      _container.appendChild(_tabBarEl);
      _container.appendChild(_contentAreaEl);

      // Register defaults
      Object.keys(DEFAULT_RENDERERS).forEach(function (tabName) {
        if (!_tabRenderers[tabName]) {
          _tabRenderers[tabName] = DEFAULT_RENDERERS[tabName];
        }
      });

      // Keyboard shortcuts (Alt+1..9)
      _setupKeyboardShortcuts();

      // Restore last tab
      var prefs = _loadPrefs();
      var startTab = prefs.activeTab || 'npcs';
      InfoPanel.setActiveTab(startTab);
    },

    // ── Tab switching ─────────────────────────────────────────────────────────
    setActiveTab: function (tabName) {
      var valid = TABS.some(function (t) { return t.name === tabName; });
      if (!valid) {
        console.warn('[InfoPanel] Unknown tab:', tabName);
        return;
      }

      _activeTab = tabName;
      _showPane(tabName);
      _savePrefs();

      // Render content
      if (_lastGameState) {
        InfoPanel._renderTabContent(tabName, _lastGameState);
      }
    },

    getActiveTab: function () {
      return _activeTab;
    },

    // ── Render ────────────────────────────────────────────────────────────────
    render: function (gameState) {
      _lastGameState = gameState;
      InfoPanel._renderTabContent(_activeTab, gameState);
    },

    update: function (gameState, tabName) {
      _lastGameState = gameState;
      var target = tabName || _activeTab;

      if (target === _activeTab) {
        InfoPanel._renderTabContent(target, gameState);
      } else {
        // Mark as "new" since tab has new content but isn't active
        _tabNewFlags[target] = true;
        var newDot = document.getElementById('tab-new-' + target);
        if (newDot) { newDot.style.display = 'block'; }
      }
    },

    // Internal render dispatcher
    _renderTabContent: function (tabName, gameState) {
      var pane = _tabContentEls[tabName];
      if (!pane) return;

      var renderer = _tabRenderers[tabName];
      if (renderer) {
        try {
          renderer(gameState, pane);
        } catch (err) {
          pane.innerHTML =
            '<p class="info-error">Error rendering ' + _esc(tabName) + ': ' + _esc(err.message) + '</p>';
          console.error('[InfoPanel] Render error for tab', tabName, err);
        }
      } else {
        pane.innerHTML =
          '<p class="info-empty">' + _esc(tabName) + ' — no renderer registered.</p>';
      }
    },

    // ── Register custom renderer ───────────────────────────────────────────────
    registerTabContent: function (tabName, renderFn) {
      if (typeof renderFn !== 'function') {
        console.error('[InfoPanel] registerTabContent: renderFn must be a function');
        return;
      }
      _tabRenderers[tabName] = renderFn;
    },

    // ── Force refresh ─────────────────────────────────────────────────────────
    refreshTab: function (tabName) {
      if (_lastGameState) {
        InfoPanel._renderTabContent(tabName || _activeTab, _lastGameState);
      }
    },

    // ── Badge management ──────────────────────────────────────────────────────
    showTabBadge: function (tabName, count) {
      _tabBadges[tabName] = count;
      var el = document.getElementById('tab-badge-' + tabName);
      if (el) {
        el.textContent    = count > 99 ? '99+' : String(count);
        el.style.display  = count > 0  ? 'inline-flex' : 'none';
      }
    },

    clearTabBadge: function (tabName) {
      delete _tabBadges[tabName];
      var el = document.getElementById('tab-badge-' + tabName);
      if (el) {
        el.textContent   = '';
        el.style.display = 'none';
      }
    },

    // ── New indicator ─────────────────────────────────────────────────────────
    markTabNew: function (tabName) {
      if (tabName === _activeTab) return; // already viewing
      _tabNewFlags[tabName] = true;
      var el = document.getElementById('tab-new-' + tabName);
      if (el) { el.style.display = 'block'; }
    },

    // ── Tab info ─────────────────────────────────────────────────────────────
    getTabNames: function () {
      return TABS.map(function (t) { return t.name; });
    }
  };

  // Expose global
  global.InfoPanel = InfoPanel;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/info-panel.js
