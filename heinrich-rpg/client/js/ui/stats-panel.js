// FILE: client/js/ui/stats-panel.js — PART 10
// StatsPanel — left panel showing live game stats for Heinrich RPG.
// IIFE pattern — exposes global `StatsPanel`.

(function (global) {
  'use strict';

  // ─── Colour palette ───────────────────────────────────────────────────────
  var COLOR = {
    danger:  '#8b2500',
    warning: '#c4a35a',
    normal:  '#e8dcc8',
    good:    '#2d5a27',
    muted:   '#7a6e5f'
  };

  // ─── Unicode bar helpers ──────────────────────────────────────────────────
  // Renders an 8-character bar: ████░░░░
  var BAR_FILL  = '█';
  var BAR_EMPTY = '░';
  var BAR_LEN   = 8;

  function _bar(value, max) {
    var pct    = Math.min(1, Math.max(0, (value || 0) / (max || 1)));
    var filled = Math.round(pct * BAR_LEN);
    return BAR_FILL.repeat(filled) + BAR_EMPTY.repeat(BAR_LEN - filled);
  }

  function _barColor(pct) {
    if (pct <= 0.25) return COLOR.danger;
    if (pct <= 0.50) return COLOR.warning;
    return COLOR.good;
  }

  function _heatColor(pct) {
    if (pct >= 0.75) return COLOR.danger;
    if (pct >= 0.40) return COLOR.warning;
    return COLOR.good;
  }

  // ─── Formatting helpers ────────────────────────────────────────────────────
  function _esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _colorSpan(text, color) {
    return '<span style="color:' + color + '">' + _esc(text) + '</span>';
  }

  function _section(id, title, icon, content, clickTarget) {
    var onclick = clickTarget
      ? ' role="button" tabindex="0" data-open-panel="' + _esc(clickTarget) + '"'
      : '';
    return (
      '<div class="stats-section" id="stats-sec-' + _esc(id) + '"' + onclick + '>' +
        '<div class="stats-section-title">' + icon + ' ' + _esc(title) + '</div>' +
        '<div class="stats-section-body">' + content + '</div>' +
      '</div>'
    );
  }

  function _divider() {
    return '<div class="stats-divider">─────────────────</div>';
  }

  function _row(label, value) {
    return (
      '<div class="stats-row">' +
        '<span class="stats-label">' + _esc(label) + '</span>' +
        '<span class="stats-value">' + value + '</span>' +
      '</div>'
    );
  }

  function _moralBar(value) {
    // value 0-100 → 5 dots using Unicode block chars
    var blocks = ['▏','▎','▍','▌','▋','▊','▉','█'];
    var filled = Math.round(Math.min(1, Math.max(0, (value || 0) / 100)) * 5);
    return filled > 0 ? '●'.repeat(filled) + '○'.repeat(5 - filled) : '○○○○○';
  }

  // ─── Time of day icons ────────────────────────────────────────────────────
  function _timeIcon(timeOfDay) {
    var icons = {
      dawn:       '🌅',
      morning:    '☀️',
      midday:     '🌞',
      afternoon:  '🌤️',
      dusk:       '🌆',
      evening:    '🌙',
      night:      '🌑',
      midnight:   '🌚'
    };
    return icons[(timeOfDay || '').toLowerCase()] || '🕰️';
  }

  // ─── Weather icons ────────────────────────────────────────────────────────
  function _weatherIcon(weather) {
    var w = (weather || '').toLowerCase();
    if (w.includes('rain'))   return '🌧️';
    if (w.includes('snow'))   return '❄️';
    if (w.includes('storm'))  return '⛈️';
    if (w.includes('cloud'))  return '☁️';
    if (w.includes('fog'))    return '🌫️';
    if (w.includes('clear'))  return '☀️';
    if (w.includes('wind'))   return '💨';
    return '🌤️';
  }

  // ─── Season icons ─────────────────────────────────────────────────────────
  function _seasonIcon(season) {
    var icons = { spring: '🌱', summer: '☀️', autumn: '🍂', winter: '❄️' };
    return icons[(season || '').toLowerCase()] || '📅';
  }

  // ─── Class icons ──────────────────────────────────────────────────────────
  function _classIcon(cls) {
    var icons = {
      scholar:    '📚',
      merchant:   '⚖️',
      soldier:    '⚔️',
      priest:     '✝️',
      craftsman:  '🔨',
      physician:  '💊',
      noble:      '👑',
      peasant:    '🌾',
      alchemist:  '⚗️',
      spy:        '🕵️'
    };
    return icons[(cls || '').toLowerCase()] || '🧑';
  }

  // ─── Hunger/fatigue icons ─────────────────────────────────────────────────
  function _hungerIcon(value) {
    if (value >= 80) return '😵';
    if (value >= 60) return '😟';
    if (value >= 40) return '😐';
    return '😊';
  }

  function _fatigueIcon(value) {
    if (value >= 80) return '😴';
    if (value >= 60) return '😪';
    if (value >= 40) return '😐';
    return '⚡';
  }

  // ─── Mental state icons ───────────────────────────────────────────────────
  function _mentalIcon(state) {
    var icons = {
      calm:        '😌',
      anxious:     '😰',
      fearful:     '😨',
      determined:  '😤',
      despairing:  '😞',
      content:     '😊',
      manic:       '🤪',
      grief:       '😢',
      focused:     '🧠',
      traumatized: '😟'
    };
    return icons[(state || '').toLowerCase()] || '🙂';
  }

  // ─── Health status ────────────────────────────────────────────────────────
  function _healthColor(healthPct) {
    if (healthPct <= 0.20) return COLOR.danger;
    if (healthPct <= 0.50) return COLOR.warning;
    return COLOR.good;
  }

  function _healthLabel(healthPct) {
    if (healthPct <= 0.10) return 'Near Death';
    if (healthPct <= 0.25) return 'Critical';
    if (healthPct <= 0.50) return 'Wounded';
    if (healthPct <= 0.75) return 'Hurt';
    if (healthPct <= 0.90) return 'Lightly Wounded';
    return 'Healthy';
  }

  // ─── Coin display ─────────────────────────────────────────────────────────
  function _coinDisplay(coins) {
    var c     = coins || {};
    var parts = [];
    if (c.livres  > 0) parts.push(_esc(c.livres)  + 'L');
    if (c.sous    > 0) parts.push(_esc(c.sous)    + 's');
    if (c.deniers > 0) parts.push(_esc(c.deniers) + 'd');
    return parts.length ? parts.join(' ') : '0d';
  }

  // ─── Heart icon for relationship ─────────────────────────────────────────
  function _heartIcon(favorability) {
    var f = favorability || 0;
    if (f >= 80) return '❤️';
    if (f >= 60) return '🧡';
    if (f >= 40) return '💛';
    if (f >= 20) return '🤍';
    if (f < 0)   return '💔';
    return '🤍';
  }

  // ─── Reputation bar ──────────────────────────────────────────────────────
  function _repBar(value) {
    // value -100 to +100 → 8-char bar centered
    var pct    = (value + 100) / 200;   // 0..1
    var filled = Math.round(pct * BAR_LEN);
    return BAR_FILL.repeat(filled) + BAR_EMPTY.repeat(BAR_LEN - filled);
  }

  function _repColor(value) {
    if (value >= 50)  return COLOR.good;
    if (value >= 0)   return COLOR.normal;
    if (value >= -50) return COLOR.warning;
    return COLOR.danger;
  }

  // ─── Section renderers ────────────────────────────────────────────────────

  function _renderDateTime(gs) {
    var world  = gs.worldState || {};
    var date   = world.date   || 'Unknown date';
    var time   = world.timeOfDay || 'day';
    var weather = world.weather || 'Clear';
    var season = world.season  || 'spring';
    var html =
      _row('📅 Date', _esc(date)) +
      _row(_timeIcon(time) + ' Time',  _esc(time)) +
      _row(_weatherIcon(weather) + ' Weather', _esc(weather)) +
      _row(_seasonIcon(season) + ' Season', _esc(season));
    return _section('datetime', 'Date & Time', '', html, null);
  }

  function _renderLocation(gs) {
    var loc  = gs.location || {};
    var name = loc.name   || 'Unknown';
    var region = loc.region || '';
    var desc = (loc.description || '').substring(0, 60);
    if (loc.description && loc.description.length > 60) { desc += '…'; }
    var html =
      '<div class="stats-location-name">' + _esc(name) + '</div>' +
      (region ? '<div class="stats-location-region">' + _esc(region) + '</div>' : '') +
      (desc   ? '<div class="stats-location-desc">'   + _esc(desc)   + '</div>' : '');
    return _section('location', 'Location', '📍', html, 'map');
  }

  function _renderVitals(gs) {
    var vitals  = gs.vitals || {};
    var hp      = vitals.health     || 0;
    var hpMax   = vitals.healthMax  || 100;
    var hunger  = vitals.hunger     || 0;
    var fatigue = vitals.fatigue    || 0;
    var mental  = vitals.mentalState || 'calm';
    var temp    = vitals.bodyTemp;

    var hpPct  = hp / hpMax;
    var hpColor = _healthColor(hpPct);

    var html =
      '<div class="stats-row vitals-health">' +
        '<span class="stats-label">❤️ Health</span>' +
        '<span class="stats-value" style="color:' + hpColor + '">' +
          _esc(_healthLabel(hpPct)) + ' (' + _esc(hp) + '/' + _esc(hpMax) + ')' +
        '</span>' +
      '</div>' +
      '<div class="stats-row">' +
        '<span class="stats-label">' + _hungerIcon(hunger) + ' Hunger</span>' +
        '<span class="stats-value vitals-bar" style="color:' + _barColor(1 - hunger / 100) + '">' +
          _bar(hunger, 100) +
        '</span>' +
      '</div>' +
      '<div class="stats-row">' +
        '<span class="stats-label">' + _fatigueIcon(fatigue) + ' Fatigue</span>' +
        '<span class="stats-value vitals-bar" style="color:' + _barColor(1 - fatigue / 100) + '">' +
          _bar(fatigue, 100) +
        '</span>' +
      '</div>' +
      '<div class="stats-row">' +
        '<span class="stats-label">' + _mentalIcon(mental) + ' Mind</span>' +
        '<span class="stats-value">' + _esc(mental) + '</span>' +
      '</div>';

    if (temp !== undefined && temp !== null && temp !== 'normal') {
      html += _row('🌡️ Temp', _esc(temp));
    }

    return _section('vitals', 'Vitals', '💓', html, null);
  }

  function _renderWounds(gs) {
    var wounds = (gs.vitals || {}).wounds || [];
    if (!wounds.length) return '';

    var BODY_PARTS = ['Head', 'Torso', 'L.Arm', 'R.Arm', 'L.Leg', 'R.Leg'];
    var woundMap   = {};
    wounds.forEach(function (w) {
      var part = (w.location || '').toLowerCase();
      if (!woundMap[part]) { woundMap[part] = []; }
      woundMap[part].push(w.severity || 'minor');
    });

    var lines = BODY_PARTS.map(function (part) {
      var key     = part.toLowerCase().replace('.', '').replace(' ', '');
      var entries = woundMap[key] || [];
      if (!entries.length) return null;
      var badge = entries.map(function (s) {
        var icons = { minor: '⚠', moderate: '🩸', severe: '💀', critical: '☠' };
        return icons[s] || '⚠';
      }).join('');
      return '<span class="wound-entry">' + badge + ' ' + _esc(part) + '</span>';
    }).filter(Boolean);

    var html = '<div class="wounds-list">' + lines.join(' | ') + '</div>';
    return _section('wounds', 'Wounds', '🩹', html, null);
  }

  function _renderIdentity(gs) {
    var char = gs.character || gs.heinrich || {};
    var langs = (char.languages || []).join(', ') || 'None';
    var html  =
      _row('Name',  _esc(char.name  || 'Heinrich')) +
      _row('Age',   _esc(char.age   || '?')) +
      _row('Class', _classIcon(char.charClass) + ' ' + _esc(char.charClass || 'Unknown')) +
      _row('Languages', _esc(langs));
    return _section('identity', 'Identity', '👤', html, null);
  }

  function _renderWealth(gs) {
    var wealth = gs.wealth || {};
    var coins  = wealth.coins || {};
    var tier   = wealth.tier  || 'Poor';
    var html   =
      _row('💰 Coins', _coinDisplay(coins)) +
      _row('Status',   _esc(tier));
    return _section('wealth', 'Wealth', '💰', html, null);
  }

  function _renderHeat(gs) {
    var heat = (gs.criminal || {}).heat || 0;
    if (!heat) return '';
    var pct  = Math.min(1, heat / 100);
    var bar  = _bar(heat, 100);
    var col  = _heatColor(pct);
    var html =
      '<div class="stats-row">' +
        '<span class="stats-label">🔥 Exposure</span>' +
        '<span class="stats-value" style="color:' + col + '">' + bar + ' ' + _esc(heat) + '</span>' +
      '</div>';
    return _section('heat', 'Criminal Heat', '🔥', html, null);
  }

  function _renderReputation(gs) {
    var rep = gs.reputation || {};
    // Pick top 3 by absolute value for relevance
    var dims = Object.keys(rep).map(function (k) {
      return { key: k, value: rep[k] };
    }).sort(function (a, b) {
      return Math.abs(b.value) - Math.abs(a.value);
    }).slice(0, 3);

    if (!dims.length) return '';

    var html = dims.map(function (d) {
      var col = _repColor(d.value);
      return (
        '<div class="stats-row">' +
          '<span class="stats-label">' + _esc(d.key) + '</span>' +
          '<span class="stats-value rep-bar" style="color:' + col + '">' +
            _repBar(d.value) + ' <small>' + (d.value > 0 ? '+' : '') + _esc(d.value) + '</small>' +
          '</span>' +
        '</div>'
      );
    }).join('');

    return _section('reputation', 'Reputation', '⚖️', html, 'npcs');
  }

  function _renderMoralCompass(gs) {
    var m = gs.moralCompass || gs.morality || {};
    var axes = [
      { key: 'mercy',       label: 'Mercy'       },
      { key: 'honesty',     label: 'Honesty'      },
      { key: 'ambition',    label: 'Ambition'     },
      { key: 'violence',    label: 'Violence'     },
      { key: 'loyalty',     label: 'Loyalty'      },
      { key: 'compassion',  label: 'Compassion'   }
    ];

    var html = axes.map(function (a) {
      var val = m[a.key] !== undefined ? m[a.key] : 50;
      return (
        '<div class="moral-row">' +
          '<span class="moral-label">' + _esc(a.label) + '</span>' +
          '<span class="moral-bar">' + _moralBar(val) + '</span>' +
        '</div>'
      );
    }).join('');

    return _section('moral', 'Moral Compass', '🧭', html, null);
  }

  function _renderActiveEffects(gs) {
    var effects = [].concat(
      (gs.effects        || []),
      (gs.buffs          || []),
      (gs.debuffs        || []),
      (gs.diseases       || []),
      (gs.weatherEffects || [])
    ).slice(0, 5);

    if (!effects.length) return '';

    var html = effects.map(function (e) {
      var name  = typeof e === 'string' ? e : (e.name || 'Effect');
      var icon  = typeof e === 'object' ? (e.icon || '✨') : '✨';
      var type  = typeof e === 'object' ? (e.type || '') : '';
      var cls   = type === 'debuff' || type === 'disease' ? COLOR.danger : COLOR.good;
      return (
        '<div class="effect-entry" style="color:' + cls + '">' +
          icon + ' ' + _esc(name) +
        '</div>'
      );
    }).join('');

    return _section('effects', 'Active Effects', '✨', html, null);
  }

  function _renderAnimals(gs) {
    var animals = gs.animals || gs.companions || [];
    if (!animals.length) return '';

    var html = animals.map(function (a) {
      var bond    = a.bondLevel || 0;
      var hearts  = '❤️'.repeat(Math.min(5, Math.round(bond / 20)));
      var hpPct   = (a.health || 100) / (a.healthMax || 100);
      var hpColor = _healthColor(hpPct);
      return (
        '<div class="animal-entry">' +
          '<span class="animal-name">' + _esc(a.name) + '</span>' +
          ' (' + _esc(a.species || 'Animal') + ') ' +
          '<span style="color:' + hpColor + '">' + _esc(a.health || '?') + 'hp</span> ' +
          '<span class="animal-bond">' + hearts + '</span>' +
        '</div>'
      );
    }).join('');

    return _section('animals', 'Companions', '🐴', html, null);
  }

  function _renderOaths(gs) {
    var oaths = gs.oaths || [];
    if (!oaths.length) return '';
    var html =
      '<div class="clickable-count" role="button" tabindex="0" data-open-panel="consequences">' +
        '📜 ' + _esc(oaths.length) + ' active oath' + (oaths.length !== 1 ? 's' : '') +
      '</div>';
    return _section('oaths', 'Oaths', '📜', html, 'consequences');
  }

  function _renderConsequences(gs) {
    var cons = gs.consequences || gs.consequenceThreads || [];
    if (!cons.length) return '';
    var html =
      '<div class="clickable-count" role="button" tabindex="0" data-open-panel="consequences">' +
        '⚡ ' + _esc(cons.length) + ' active thread' + (cons.length !== 1 ? 's' : '') +
      '</div>';
    return _section('consequences', 'Consequences', '⚡', html, 'consequences');
  }

  function _renderRomance(gs) {
    var romance = gs.romance || gs.significantRelationship;
    if (!romance) return '';
    var fav  = romance.favorability || romance.favor || 0;
    var icon = _heartIcon(fav);
    var html = _row(icon + ' ' + _esc(romance.name || 'Someone'), _esc(fav) + '/100');
    return _section('romance', 'Relationship', '💕', html, 'npcs');
  }

  // ─── Full render ──────────────────────────────────────────────────────────
  function _fullRender(gs) {
    var parts = [
      _renderDateTime(gs),
      _renderLocation(gs),
      _divider(),
      _renderVitals(gs),
      _renderWounds(gs),
      _divider(),
      _renderIdentity(gs),
      _renderWealth(gs),
      _renderHeat(gs),
      _divider(),
      _renderReputation(gs),
      _renderMoralCompass(gs),
      _divider(),
      _renderActiveEffects(gs),
      _renderAnimals(gs),
      _divider(),
      _renderOaths(gs),
      _renderConsequences(gs),
      _renderRomance(gs)
    ];
    return parts.filter(Boolean).join('\n');
  }

  // ─── Module state ─────────────────────────────────────────────────────────
  var _containerId  = null;
  var _container    = null;
  var _lastState    = null;
  var _flashTimers  = {};

  // ─── Section key → renderer map ──────────────────────────────────────────
  var _SECTION_RENDERERS = {
    worldState:   function (gs) { return _renderDateTime(gs); },
    location:     function (gs) { return _renderLocation(gs); },
    vitals:       function (gs) { return _renderVitals(gs) + _renderWounds(gs); },
    wounds:       function (gs) { return _renderWounds(gs); },
    character:    function (gs) { return _renderIdentity(gs); },
    heinrich:     function (gs) { return _renderIdentity(gs); },
    wealth:       function (gs) { return _renderWealth(gs); },
    criminal:     function (gs) { return _renderHeat(gs); },
    reputation:   function (gs) { return _renderReputation(gs); },
    moralCompass: function (gs) { return _renderMoralCompass(gs); },
    morality:     function (gs) { return _renderMoralCompass(gs); },
    effects:      function (gs) { return _renderActiveEffects(gs); },
    buffs:        function (gs) { return _renderActiveEffects(gs); },
    animals:      function (gs) { return _renderAnimals(gs); },
    companions:   function (gs) { return _renderAnimals(gs); },
    oaths:        function (gs) { return _renderOaths(gs); },
    consequences: function (gs) { return _renderConsequences(gs); },
    romance:      function (gs) { return _renderRomance(gs); }
  };

  // ─── Click handler for sections ───────────────────────────────────────────
  function _setupClickHandlers(container) {
    container.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-open-panel]');
      if (!btn) return;
      var tab = btn.dataset.openPanel;
      if (global.InfoPanel && typeof global.InfoPanel.setActiveTab === 'function') {
        global.InfoPanel.setActiveTab(tab);
      }
      if (global.Layout && typeof global.Layout.showPanel === 'function') {
        global.Layout.showPanel('panel-right');
      }
    });
    // Keyboard activation for clickable elements
    container.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        var btn = e.target.closest('[data-open-panel]');
        if (btn) { btn.click(); }
      }
    });
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  var StatsPanel = {

    init: function (containerId) {
      _containerId = containerId || 'stats-panel';
      _container   = document.getElementById(_containerId);
      if (_container) {
        _setupClickHandlers(_container);
      } else {
        console.warn('[StatsPanel] Container #' + _containerId + ' not found.');
      }
    },

    // ── Full render ───────────────────────────────────────────────────────────
    render: function (gameState) {
      _lastState = gameState;
      var c = _container || document.getElementById(_containerId);
      if (!c) return;
      c.innerHTML = _fullRender(gameState);
    },

    // ── Partial update ────────────────────────────────────────────────────────
    update: function (gameState, changedKeys) {
      _lastState = gameState;
      var c = _container || document.getElementById(_containerId);
      if (!c) return;

      if (!changedKeys || !changedKeys.length) {
        StatsPanel.render(gameState);
        return;
      }

      // For each changed key, re-render the relevant section
      var rendered = {};
      changedKeys.forEach(function (key) {
        var fn = _SECTION_RENDERERS[key];
        if (!fn || rendered[key]) return;
        rendered[key] = true;

        // Map key to section IDs to update
        var sectionIds = {
          worldState:   ['stats-sec-datetime'],
          location:     ['stats-sec-location'],
          vitals:       ['stats-sec-vitals', 'stats-sec-wounds'],
          wounds:       ['stats-sec-wounds'],
          character:    ['stats-sec-identity'],
          heinrich:     ['stats-sec-identity'],
          wealth:       ['stats-sec-wealth'],
          criminal:     ['stats-sec-heat'],
          reputation:   ['stats-sec-reputation'],
          moralCompass: ['stats-sec-moral'],
          morality:     ['stats-sec-moral'],
          effects:      ['stats-sec-effects'],
          buffs:        ['stats-sec-effects'],
          animals:      ['stats-sec-animals'],
          companions:   ['stats-sec-animals'],
          oaths:        ['stats-sec-oaths'],
          consequences: ['stats-sec-consequences'],
          romance:      ['stats-sec-romance']
        };

        var ids = sectionIds[key] || [];
        ids.forEach(function (secId) {
          var el = document.getElementById(secId);
          if (el) {
            // Create temp container to parse new HTML
            var tmp    = document.createElement('div');
            tmp.innerHTML = fn(gameState);
            var newSec = tmp.querySelector('#' + secId);
            if (newSec) {
              el.innerHTML = newSec.innerHTML;
              StatsPanel.flash(key);
            }
          }
        });

        // If section doesn't exist yet (was absent because data was empty), full re-render
        if (!ids.length) {
          StatsPanel.render(gameState);
        }
      });
    },

    // ── Flash animation ───────────────────────────────────────────────────────
    flash: function (statKey) {
      var sectionMap = {
        vitals:       'stats-sec-vitals',
        health:       'stats-sec-vitals',
        wounds:       'stats-sec-wounds',
        wealth:       'stats-sec-wealth',
        reputation:   'stats-sec-reputation',
        criminal:     'stats-sec-heat',
        moralCompass: 'stats-sec-moral',
        morality:     'stats-sec-moral',
        location:     'stats-sec-location',
        worldState:   'stats-sec-datetime',
        oaths:        'stats-sec-oaths',
        consequences: 'stats-sec-consequences',
        romance:      'stats-sec-romance',
        animals:      'stats-sec-animals'
      };

      var secId = sectionMap[statKey] || ('stats-sec-' + statKey);
      var el    = document.getElementById(secId);
      if (!el) return;

      // Clear existing flash timer
      if (_flashTimers[secId]) {
        clearTimeout(_flashTimers[secId]);
        el.classList.remove('stat-flash');
      }

      // Force reflow
      void el.offsetWidth;
      el.classList.add('stat-flash');

      _flashTimers[secId] = setTimeout(function () {
        el.classList.remove('stat-flash');
        delete _flashTimers[secId];
      }, 1000);
    },

    // ── Last state accessor ────────────────────────────────────────────────────
    getLastState: function () {
      return _lastState;
    }
  };

  // Expose global
  global.StatsPanel = StatsPanel;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/stats-panel.js
