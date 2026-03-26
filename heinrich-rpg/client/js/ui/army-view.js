// FILE: client/js/ui/army-view.js — PART 10
// Army management panel for The Fate of Heinrich.
// IIFE pattern — exposes global `ArmyView`.

(function (global) {
  'use strict';

  // ═══════════════════════════════════════════ Constants ══════════════════════════════════════════

  var UNIT_TYPES = {
    men_at_arms:     { label: 'Men-at-Arms',     icon: '🗡️',  sortOrder: 0 },
    archers:         { label: 'Archers',          icon: '🏹',  sortOrder: 1 },
    spearmen:        { label: 'Spearmen',         icon: '🛡️',  sortOrder: 2 },
    knights:         { label: 'Knights/Cavalry',  icon: '⚔️',  sortOrder: 3 },
    cavalry:         { label: 'Cavalry',          icon: '⚔️',  sortOrder: 3 },
    siege_engineers: { label: 'Siege Engineers',  icon: '🔨',  sortOrder: 4 },
    camp_followers:  { label: 'Camp Followers',   icon: '🏥',  sortOrder: 5 }
  };

  var CONDITION_LEVELS = [
    { label: 'Fresh',     minMorale: 75, cls: 'condition-fresh',     icon: '💪' },
    { label: 'Tired',     minMorale: 50, cls: 'condition-tired',     icon: '😓' },
    { label: 'Exhausted', minMorale: 25, cls: 'condition-exhausted', icon: '😰' },
    { label: 'Broken',    minMorale: 0,  cls: 'condition-broken',    icon: '💀' }
  ];

  var ARMY_CLASSES = ['Knight', 'Baron', 'Viscount', 'Count', 'Duke', 'Prince', 'King', 'Lord', 'Mercenary Captain', 'Warlord'];

  // ═══════════════════════════════════════════ State ══════════════════════════════════════════════

  var _containerId   = null;
  var _container     = null;
  var _armiesState   = {};
  var _initialized   = false;

  // ═══════════════════════════════════════════ Helpers ════════════════════════════════════════════

  function _el(id) { return document.getElementById(id); }

  function _qs(sel, root) { return (root || document).querySelector(sel); }

  function _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function _clamp(v, mn, mx) { return Math.min(mx, Math.max(mn, v)); }

  function _hasArmyAccess(armiesState) {
    var cls = (armiesState && armiesState.playerClass) || '';
    return ARMY_CLASSES.indexOf(cls) !== -1;
  }

  function _getCondition(morale) {
    morale = _clamp(morale || 0, 0, 100);
    for (var i = 0; i < CONDITION_LEVELS.length; i++) {
      if (morale >= CONDITION_LEVELS[i].minMorale) return CONDITION_LEVELS[i];
    }
    return CONDITION_LEVELS[CONDITION_LEVELS.length - 1];
  }

  function _getMoraleBarClass(morale) {
    if (morale >= 70) return 'morale-high';
    if (morale >= 40) return 'morale-mid';
    return 'morale-low';
  }

  function _getSupplyClass(supplyDays) {
    if (supplyDays < 3)  return 'supply-critical';
    if (supplyDays < 7)  return 'supply-low';
    return 'supply-ok';
  }

  function _countTotalUnits(army) {
    var units = (army && army.units) || {};
    var total = 0;
    var keys  = Object.keys(units);
    for (var i = 0; i < keys.length; i++) { total += (units[keys[i]] || 0); }
    return total;
  }

  function _countAllForces(armiesState) {
    var armies = (armiesState && armiesState.armies) || [];
    if (!Array.isArray(armies)) {
      armies = Object.keys(armies).map(function (k) { return armies[k]; });
    }
    var total = 0;
    for (var i = 0; i < armies.length; i++) { total += _countTotalUnits(armies[i]); }
    return total;
  }

  function _calcReadiness(army) {
    var morale  = _clamp((army && army.morale) || 0, 0, 100);
    var supply  = _clamp((army && army.supplyDays) || 0, 0, 30);
    var supplyPct = Math.min(100, (supply / 30) * 100);
    return Math.round((morale * 0.6) + (supplyPct * 0.4));
  }

  function _getArmyList(armiesState) {
    var raw = (armiesState && armiesState.armies) || [];
    if (Array.isArray(raw)) return raw;
    return Object.keys(raw).map(function (k) { var a = raw[k]; a._id = a._id || k; return a; });
  }

  function _dispatchEvent(name, detail) {
    var evt;
    try { evt = new CustomEvent(name, { detail: detail, bubbles: true }); }
    catch (ex) { evt = document.createEvent('CustomEvent'); evt.initCustomEvent(name, true, false, detail); }
    if (_container) _container.dispatchEvent(evt);
  }

  // ═══════════════════════════════════════════ Render Helpers ═════════════════════════════════════

  function _renderMoraleBar(morale) {
    var pct = _clamp(morale || 0, 0, 100);
    var cls = _getMoraleBarClass(pct);
    return (
      '<div class="army-bar-wrap" title="Morale: ' + pct + '/100">' +
        '<div class="army-bar-label">Morale</div>' +
        '<div class="army-bar-track">' +
          '<div class="army-bar-fill ' + cls + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="army-bar-val">' + pct + '</span>' +
      '</div>'
    );
  }

  function _renderSupplyBar(supplyDays) {
    var days = _clamp(supplyDays || 0, 0, 30);
    var pct  = Math.round((days / 30) * 100);
    var cls  = _getSupplyClass(days);
    return (
      '<div class="army-bar-wrap" title="Supply: ' + days + ' days remaining">' +
        '<div class="army-bar-label">Supply</div>' +
        '<div class="army-bar-track">' +
          '<div class="army-bar-fill ' + cls + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="army-bar-val">' + days + 'd</span>' +
      '</div>'
    );
  }

  function _renderReadinessBar(readiness) {
    var pct = _clamp(readiness || 0, 0, 100);
    var cls = pct >= 70 ? 'morale-high' : pct >= 40 ? 'morale-mid' : 'morale-low';
    return (
      '<div class="army-bar-wrap" title="Readiness: ' + pct + '%">' +
        '<div class="army-bar-label">Readiness</div>' +
        '<div class="army-bar-track">' +
          '<div class="army-bar-fill ' + cls + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="army-bar-val">' + pct + '%</span>' +
      '</div>'
    );
  }

  function _renderUnitBreakdown(units) {
    if (!units || !Object.keys(units).length) {
      return '<p class="army-no-units">No units recorded.</p>';
    }
    var html  = '<div class="unit-breakdown">';
    var types = Object.keys(units).sort(function (a, b) {
      var ao = (UNIT_TYPES[a] && UNIT_TYPES[a].sortOrder) || 99;
      var bo = (UNIT_TYPES[b] && UNIT_TYPES[b].sortOrder) || 99;
      return ao - bo;
    });
    for (var i = 0; i < types.length; i++) {
      var type  = types[i];
      var count = units[type] || 0;
      if (count <= 0) continue;
      var meta  = UNIT_TYPES[type] || { label: type, icon: '👤' };
      html += (
        '<div class="unit-row">' +
          '<span class="unit-icon">' + meta.icon + '</span>' +
          '<span class="unit-label">' + _escHtml(meta.label) + '</span>' +
          '<span class="unit-count">' + count.toLocaleString() + '</span>' +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderModifiers(modifiers) {
    if (!modifiers || !modifiers.length) return '';
    var html = '<div class="army-modifiers"><h4>Active Modifiers</h4><div class="modifiers-list">';
    for (var i = 0; i < modifiers.length; i++) {
      var mod = modifiers[i];
      var isPos = (mod.value || 0) >= 0;
      html += (
        '<div class="modifier-tag ' + (isPos ? 'mod-positive' : 'mod-negative') + '">' +
          _escHtml(mod.label || mod.name || 'Modifier') + ' ' +
          '<span class="mod-val">' + (isPos ? '+' : '') + (mod.value || '') + '</span>' +
        '</div>'
      );
    }
    html += '</div></div>';
    return html;
  }

  function _renderArmyCard(army) {
    var armyId    = army._id || army.id || army.armyId || '';
    var name      = army.name || 'Unnamed Force';
    var commander = army.commander || 'Heinrich';
    var location  = army.location || 'Unknown';
    var morale    = army.morale || 0;
    var supply    = army.supplyDays || 0;
    var totalUnits = _countTotalUnits(army);
    var readiness  = _calcReadiness(army);
    var condition  = _getCondition(morale);
    var payStatus  = army.paid !== false;

    return (
      '<div class="army-card" data-army-id="' + _escHtml(String(armyId)) + '">' +
        '<div class="army-card-header">' +
          '<div class="army-card-title-row">' +
            '<span class="army-name">' + _escHtml(name) + '</span>' +
            '<span class="army-condition ' + condition.cls + '">' + condition.icon + ' ' + condition.label + '</span>' +
          '</div>' +
          '<div class="army-card-meta">' +
            '<span class="army-meta-item">⚔️ ' + totalUnits.toLocaleString() + ' troops</span>' +
            '<span class="army-meta-item">📍 ' + _escHtml(location) + '</span>' +
            '<span class="army-meta-item">👤 ' + _escHtml(commander) + '</span>' +
            '<span class="army-pay-status ' + (payStatus ? 'pay-ok' : 'pay-late') + '">' +
              (payStatus ? '💰 Paid' : '⚠️ Unpaid') +
            '</span>' +
          '</div>' +
        '</div>' +
        '<div class="army-card-bars">' +
          _renderMoraleBar(morale) +
          _renderSupplyBar(supply) +
          _renderReadinessBar(readiness) +
        '</div>' +
        '<div class="army-card-actions">' +
          '<button class="btn-small btn-army-detail" data-army-id="' + _escHtml(String(armyId)) + '">View Details</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderOverviewSummary(armiesState) {
    var armies     = _getArmyList(armiesState);
    var totalForce = _countAllForces(armiesState);
    var totalArmies = armies.length;
    var avgMorale  = 0;
    if (totalArmies > 0) {
      var sumMorale = 0;
      for (var i = 0; i < armies.length; i++) sumMorale += (armies[i].morale || 0);
      avgMorale = Math.round(sumMorale / totalArmies);
    }
    return (
      '<div class="army-overview-summary">' +
        '<div class="overview-stat">' +
          '<span class="overview-stat-val">' + totalForce.toLocaleString() + '</span>' +
          '<span class="overview-stat-label">Total Troops</span>' +
        '</div>' +
        '<div class="overview-stat">' +
          '<span class="overview-stat-val">' + totalArmies + '</span>' +
          '<span class="overview-stat-label">Armies / Groups</span>' +
        '</div>' +
        '<div class="overview-stat">' +
          '<span class="overview-stat-val">' + avgMorale + '</span>' +
          '<span class="overview-stat-label">Avg. Morale</span>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderLockedPanel() {
    return (
      '<div class="army-locked">' +
        '<div class="locked-icon">⚔️</div>' +
        '<h3>No Military Command</h3>' +
        '<p>' +
          'You must earn the rank of Knight or higher to field a recognized military force. ' +
          'Until then, you may fight, but you cannot command armies, receive garrisons, or recruit levies.' +
        '</p>' +
        '<div class="locked-hint">Earn knighthood through battlefield valor or noble patronage.</div>' +
      '</div>'
    );
  }

  function _renderDetailContent(army) {
    var name      = army.name       || 'Unnamed Force';
    var commander = army.commander  || 'Heinrich';
    var location  = army.location   || 'Unknown';
    var morale    = army.morale     || 0;
    var supply    = army.supplyDays || 0;
    var condition = _getCondition(morale);
    var casualties = (army.casualties != null) ? army.casualties : 'None recorded';
    var payStatus  = army.paid !== false;
    var modifiers  = army.modifiers || [];
    var notes      = army.notes     || '';

    return (
      '<div class="army-detail">' +
        '<div class="army-detail-header">' +
          '<h3>' + _escHtml(name) + '</h3>' +
          '<p class="detail-sub">Commander: <strong>' + _escHtml(commander) + '</strong> &nbsp;|&nbsp; Location: <strong>' + _escHtml(location) + '</strong></p>' +
        '</div>' +
        '<div class="detail-condition-row">' +
          '<span class="army-condition big-condition ' + condition.cls + '">' + condition.icon + ' ' + condition.label + '</span>' +
          '<span class="army-pay-status ' + (payStatus ? 'pay-ok' : 'pay-late') + '">' + (payStatus ? '💰 Paid and provisioned' : '⚠️ Pay in arrears!') + '</span>' +
        '</div>' +
        '<div class="detail-bars">' +
          _renderMoraleBar(morale) +
          _renderSupplyBar(supply) +
          _renderReadinessBar(_calcReadiness(army)) +
        '</div>' +
        '<div class="detail-units">' +
          '<h4>Unit Composition</h4>' +
          _renderUnitBreakdown(army.units) +
        '</div>' +
        _renderModifiers(modifiers) +
        '<div class="detail-casualties">' +
          '<h4>Casualties (since last battle)</h4>' +
          '<p>' + _escHtml(String(casualties)) + '</p>' +
        '</div>' +
        (notes ? '<div class="detail-notes"><h4>Notes</h4><p>' + _escHtml(notes) + '</p></div>' : '') +
        '<div class="detail-actions">' +
          '<button class="btn-small btn-march" data-army-id="' + _escHtml(String(army._id || army.id || '')) + '">March</button>' +
          '<button class="btn-small btn-resupply" data-army-id="' + _escHtml(String(army._id || army.id || '')) + '">Resupply</button>' +
          '<button class="btn-small btn-disband" data-army-id="' + _escHtml(String(army._id || army.id || '')) + '">Disband</button>' +
          '<button class="btn-small btn-close-detail" id="army-detail-close">← Back</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderBattleResult(result) {
    var outcome    = (result && result.outcome)   || 'UNKNOWN';
    var attacker   = (result && result.attacker)  || {};
    var defender   = (result && result.defender)  || {};
    var moraleChange = (result && result.moraleChange) || 0;
    var loot       = (result && result.loot)      || 0;
    var position   = (result && result.position)  || 'Unknown';
    var events     = (result && result.events)    || [];
    var outcomeMap = {
      VICTORY: { cls: 'outcome-victory', icon: '🏆', label: 'VICTORY' },
      DEFEAT:  { cls: 'outcome-defeat',  icon: '💀', label: 'DEFEAT'  },
      DRAW:    { cls: 'outcome-draw',    icon: '⚖️',  label: 'DRAW'    }
    };
    var oc = outcomeMap[outcome.toUpperCase()] || outcomeMap.DRAW;

    var eventsHtml = '';
    if (events.length) {
      eventsHtml = '<div class="battle-events"><h4>Notable Events</h4><ul>';
      for (var i = 0; i < events.length; i++) {
        eventsHtml += '<li>' + _escHtml(events[i]) + '</li>';
      }
      eventsHtml += '</ul></div>';
    }

    return (
      '<div class="battle-summary">' +
        '<div class="battle-outcome ' + oc.cls + '">' +
          '<span class="outcome-icon">' + oc.icon + '</span>' +
          '<span class="outcome-label">' + oc.label + '</span>' +
        '</div>' +
        '<div class="battle-details">' +
          '<div class="battle-side">' +
            '<h4>Your Forces</h4>' +
            '<div class="battle-stat-row"><span>Casualties:</span><span class="cas-val">' + ((attacker.casualties || 0)).toLocaleString() + '</span></div>' +
            '<div class="battle-stat-row"><span>Survivors:</span><span>' + ((attacker.survivors || 0)).toLocaleString() + '</span></div>' +
          '</div>' +
          '<div class="battle-vs">⚔️</div>' +
          '<div class="battle-side">' +
            '<h4>Enemy Forces</h4>' +
            '<div class="battle-stat-row"><span>Casualties:</span><span class="cas-val">' + ((defender.casualties || 0)).toLocaleString() + '</span></div>' +
            '<div class="battle-stat-row"><span>Survivors:</span><span>' + ((defender.survivors || 0)).toLocaleString() + '</span></div>' +
          '</div>' +
        '</div>' +
        eventsHtml +
        '<div class="battle-aftermath">' +
          '<div class="aftermath-row">' +
            '<span>💰 Loot taken:</span>' +
            '<span class="loot-val">' + loot.toLocaleString() + ' sous</span>' +
          '</div>' +
          '<div class="aftermath-row">' +
            '<span>📊 Morale change:</span>' +
            '<span class="' + (moraleChange >= 0 ? 'pos-change' : 'neg-change') + '">' +
              (moraleChange >= 0 ? '+' : '') + moraleChange +
            '</span>' +
          '</div>' +
          '<div class="aftermath-row">' +
            '<span>📍 Position after battle:</span>' +
            '<span>' + _escHtml(position) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="battle-actions">' +
          '<button class="btn-small" id="battle-summary-close">Continue</button>' +
        '</div>' +
      '</div>'
    );
  }

  // ═══════════════════════════════════════════ Event Binding ══════════════════════════════════════

  function _bindEvents() {
    if (!_container) return;
    _container.addEventListener('click', function (e) {
      var target = e.target || e.srcElement;

      if (target.classList.contains('btn-army-detail')) {
        var id = target.getAttribute('data-army-id');
        if (id) ArmyView.showArmyDetail(id);
        return;
      }

      if (target.id === 'army-detail-close') {
        ArmyView.render(_armiesState);
        return;
      }

      if (target.id === 'battle-summary-close') {
        _el('army-modal-overlay') && _el('army-modal-overlay').remove();
        _dispatchEvent('army:battleSummaryClosed', {});
        return;
      }

      if (target.classList.contains('btn-march')) {
        _dispatchEvent('army:march', { armyId: target.getAttribute('data-army-id') });
        return;
      }

      if (target.classList.contains('btn-resupply')) {
        _dispatchEvent('army:resupply', { armyId: target.getAttribute('data-army-id') });
        return;
      }

      if (target.classList.contains('btn-disband')) {
        var aid = target.getAttribute('data-army-id');
        if (aid && window.confirm('Disband this army? This cannot be undone.')) {
          _dispatchEvent('army:disband', { armyId: aid });
        }
        return;
      }
    });
  }

  // ═══════════════════════════════════════════ Public API ═════════════════════════════════════════

  var ArmyView = {

    /**
     * Initialize army view.
     * @param {string} containerId
     */
    init: function (containerId) {
      _containerId = containerId;
      _container   = document.getElementById(containerId);
      if (!_container) {
        console.warn('[ArmyView] Container not found: ' + containerId);
        return;
      }
      _container.classList.add('army-view');
      _initialized = true;
      _bindEvents();
    },

    /**
     * Full render of army overview.
     * @param {Object} armiesState
     */
    render: function (armiesState) {
      if (!_initialized) { console.warn('[ArmyView] Not initialized.'); return; }
      _armiesState = armiesState || {};

      var html = '<div class="army-panel">';
      html += '<div class="army-panel-header">';
      html += '<h2 class="army-panel-title">⚔️ Military Forces</h2>';
      html += '</div>';

      if (!_hasArmyAccess(_armiesState)) {
        html += _renderLockedPanel();
      } else {
        var armies = _getArmyList(_armiesState);
        html += _renderOverviewSummary(_armiesState);
        if (!armies.length) {
          html += '<div class="army-none"><p>You command no forces at present.</p><p class="army-none-hint">Recruit soldiers, hire mercenaries, or receive troops from your liege.</p></div>';
        } else {
          html += '<div class="army-grid">';
          for (var i = 0; i < armies.length; i++) {
            html += _renderArmyCard(armies[i]);
          }
          html += '</div>';
        }
      }
      html += '</div>';
      _container.innerHTML = html;
    },

    /**
     * Update army view in-place.
     * @param {Object} armiesState
     */
    update: function (armiesState) {
      _armiesState = armiesState || _armiesState;
      var grid = _qs('.army-grid', _container);
      if (grid) {
        var armies = _getArmyList(_armiesState);
        var newHtml = '';
        for (var i = 0; i < armies.length; i++) newHtml += _renderArmyCard(armies[i]);
        grid.innerHTML = newHtml;
        var summary = _qs('.army-overview-summary', _container);
        if (summary) summary.outerHTML = _renderOverviewSummary(_armiesState);
      } else {
        ArmyView.render(_armiesState);
      }
    },

    /**
     * Show detailed panel for a specific army.
     * @param {string} armyId
     */
    showArmyDetail: function (armyId) {
      var armies = _getArmyList(_armiesState);
      var army   = null;
      for (var i = 0; i < armies.length; i++) {
        var a = armies[i];
        if ((a._id || a.id || a.armyId) === armyId || String(a._id || a.id || a.armyId) === String(armyId)) {
          army = a; break;
        }
      }
      if (!army) {
        console.warn('[ArmyView] Army not found: ' + armyId);
        return;
      }
      // Replace grid content with detail view
      var panel = _qs('.army-panel', _container);
      if (panel) {
        var existing = _qs('.army-grid', panel) || _qs('.army-none', panel);
        if (existing) {
          var tempDiv = document.createElement('div');
          tempDiv.innerHTML = _renderDetailContent(army);
          existing.parentNode.replaceChild(tempDiv.firstChild, existing);
        }
      }
    },

    /**
     * Show battle result screen (modal overlay).
     * @param {Object} battleResult
     */
    showBattleSummary: function (battleResult) {
      // Remove any existing overlay
      var old = _el('army-modal-overlay');
      if (old) old.parentNode.removeChild(old);

      var overlay  = document.createElement('div');
      overlay.id   = 'army-modal-overlay';
      overlay.innerHTML = (
        '<div class="army-modal-backdrop"></div>' +
        '<div class="army-modal-content">' +
          _renderBattleResult(battleResult) +
        '</div>'
      );
      document.body.appendChild(overlay);

      // Allow backdrop click to close
      var backdrop = overlay.querySelector('.army-modal-backdrop');
      if (backdrop) {
        backdrop.addEventListener('click', function () {
          overlay.parentNode && overlay.parentNode.removeChild(overlay);
        });
      }
    }
  };

  // ═══════════════════════════════════════════ CSS Injection ══════════════════════════════════════

  (function _injectStyles() {
    if (document.getElementById('army-view-styles')) return;
    var style = document.createElement('style');
    style.id  = 'army-view-styles';
    style.textContent = [
      '.army-view { font-family:inherit; }',
      '.army-panel { display:flex; flex-direction:column; gap:14px; padding:12px; }',
      '.army-panel-header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #b94a4a; padding-bottom:8px; }',
      '.army-panel-title { margin:0; font-size:1.2em; color:#e07070; }',
      '.army-overview-summary { display:flex; gap:0; background:#1e1e1e; border:1px solid #333; border-radius:8px; overflow:hidden; }',
      '.overview-stat { flex:1; text-align:center; padding:14px 8px; border-right:1px solid #2a2a2a; }',
      '.overview-stat:last-child { border-right:none; }',
      '.overview-stat-val { display:block; font-size:1.8em; font-weight:bold; color:#e07070; }',
      '.overview-stat-label { font-size:0.78em; color:#888; text-transform:uppercase; letter-spacing:0.06em; }',
      '.army-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:14px; }',
      '.army-card { background:#1e1e1e; border:1px solid #333; border-radius:8px; padding:14px; display:flex; flex-direction:column; gap:10px; transition:border-color 0.2s; }',
      '.army-card:hover { border-color:#b94a4a; }',
      '.army-card-header { display:flex; flex-direction:column; gap:6px; }',
      '.army-card-title-row { display:flex; justify-content:space-between; align-items:center; }',
      '.army-name { font-weight:bold; font-size:1em; color:#eee; }',
      '.army-condition { font-size:0.82em; padding:2px 8px; border-radius:10px; }',
      '.condition-fresh     { background:rgba(92,158,92,0.2); color:#8fcf8f; border:1px solid rgba(92,158,92,0.3); }',
      '.condition-tired     { background:rgba(200,160,48,0.2); color:#e8c060; border:1px solid rgba(200,160,48,0.3); }',
      '.condition-exhausted { background:rgba(185,74,74,0.2); color:#e07070; border:1px solid rgba(185,74,74,0.3); }',
      '.condition-broken    { background:rgba(80,20,20,0.5); color:#c04040; border:1px solid rgba(185,74,74,0.6); }',
      '.army-card-meta { display:flex; flex-wrap:wrap; gap:8px; }',
      '.army-meta-item { font-size:0.8em; color:#aaa; }',
      '.army-pay-status { font-size:0.8em; padding:1px 6px; border-radius:4px; }',
      '.pay-ok   { color:#8fcf8f; background:rgba(92,158,92,0.12); }',
      '.pay-late { color:#e07070; background:rgba(185,74,74,0.12); }',
      '.army-card-bars { display:flex; flex-direction:column; gap:6px; }',
      '.army-bar-wrap { display:flex; align-items:center; gap:8px; font-size:0.82em; }',
      '.army-bar-label { width:60px; color:#888; text-align:right; flex-shrink:0; }',
      '.army-bar-track { flex:1; height:6px; background:#2a2a2a; border-radius:3px; overflow:hidden; }',
      '.army-bar-fill { height:100%; border-radius:3px; transition:width 0.35s; }',
      '.army-bar-fill.morale-high { background:linear-gradient(to right,#3a8c3a,#6ccc6c); }',
      '.army-bar-fill.morale-mid  { background:linear-gradient(to right,#9c7c1a,#e8c060); }',
      '.army-bar-fill.morale-low  { background:linear-gradient(to right,#8c2a2a,#e07070); }',
      '.army-bar-fill.supply-ok       { background:linear-gradient(to right,#1a6c9c,#6caacc); }',
      '.army-bar-fill.supply-low      { background:linear-gradient(to right,#9c7c1a,#e8c060); }',
      '.army-bar-fill.supply-critical { background:linear-gradient(to right,#8c1a1a,#cc4444); }',
      '.army-bar-val { width:32px; font-size:0.82em; color:#aaa; text-align:right; }',
      '.army-card-actions { display:flex; gap:8px; }',
      '.unit-breakdown { display:flex; flex-direction:column; gap:4px; }',
      '.unit-row { display:flex; align-items:center; gap:10px; padding:4px 8px; background:#252525; border-radius:4px; }',
      '.unit-icon { font-size:1.1em; width:24px; text-align:center; }',
      '.unit-label { flex:1; font-size:0.88em; color:#ccc; }',
      '.unit-count { font-size:0.88em; font-weight:bold; color:#e8d87a; }',
      '.army-no-units { color:#888; font-style:italic; font-size:0.88em; }',
      '.army-modifiers { margin-top:4px; }',
      '.army-modifiers h4 { margin:0 0 6px; font-size:0.82em; color:#888; text-transform:uppercase; }',
      '.modifiers-list { display:flex; flex-wrap:wrap; gap:6px; }',
      '.modifier-tag { font-size:0.78em; padding:2px 8px; border-radius:10px; }',
      '.mod-positive { background:rgba(92,158,92,0.15); color:#8fcf8f; border:1px solid rgba(92,158,92,0.3); }',
      '.mod-negative { background:rgba(185,74,74,0.15); color:#e07070; border:1px solid rgba(185,74,74,0.3); }',
      '.mod-val { font-weight:bold; }',
      '.army-detail { display:flex; flex-direction:column; gap:12px; padding:4px; }',
      '.army-detail-header h3 { margin:0 0 4px; font-size:1.1em; color:#eee; }',
      '.detail-sub { margin:0; font-size:0.85em; color:#aaa; }',
      '.detail-condition-row { display:flex; align-items:center; gap:12px; flex-wrap:wrap; }',
      '.big-condition { font-size:1em; padding:4px 12px; }',
      '.detail-bars { display:flex; flex-direction:column; gap:6px; padding:8px; background:#1a1a1a; border-radius:6px; }',
      '.detail-units h4, .army-modifiers h4, .detail-casualties h4, .detail-notes h4 { margin:0 0 8px; font-size:0.85em; color:#888; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #2a2a2a; padding-bottom:4px; }',
      '.detail-casualties p, .detail-notes p { font-size:0.9em; color:#ccc; margin:0; }',
      '.detail-actions { display:flex; gap:8px; flex-wrap:wrap; padding-top:8px; border-top:1px solid #2a2a2a; }',
      '.army-locked { text-align:center; padding:32px 20px; background:#1a1a1a; border:1px solid #444; border-radius:8px; }',
      '.army-locked .locked-icon { font-size:3em; margin-bottom:12px; }',
      '.army-locked h3 { color:#e07070; margin:0 0 10px; }',
      '.army-locked p { color:#999; font-size:0.9em; line-height:1.6; max-width:400px; margin:0 auto 10px; }',
      '.army-locked .locked-hint { font-size:0.8em; color:#666; font-style:italic; }',
      '.army-none { text-align:center; padding:24px; background:#1a1a1a; border:1px dashed #333; border-radius:8px; }',
      '.army-none p { margin:0 0 6px; color:#888; }',
      '.army-none-hint { font-size:0.82em; color:#666; font-style:italic; }',
      '#army-modal-overlay { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; }',
      '.army-modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.75); }',
      '.army-modal-content { position:relative; z-index:1; background:#1e1e1e; border:1px solid #444; border-radius:10px; width:90%; max-width:560px; max-height:85vh; overflow-y:auto; padding:0; box-shadow:0 8px 32px rgba(0,0,0,0.7); }',
      '.battle-summary { display:flex; flex-direction:column; gap:16px; padding:20px; }',
      '.battle-outcome { display:flex; flex-direction:column; align-items:center; padding:24px 16px; border-radius:8px; }',
      '.outcome-victory { background:linear-gradient(135deg,#1a3a1a,#2a5a2a); border:2px solid #5c9e5c; }',
      '.outcome-defeat  { background:linear-gradient(135deg,#3a1a1a,#5a2a2a); border:2px solid #b94a4a; }',
      '.outcome-draw    { background:linear-gradient(135deg,#2a2a1a,#3a3a2a); border:2px solid #c8a030; }',
      '.outcome-icon { font-size:3em; margin-bottom:8px; }',
      '.outcome-label { font-size:2em; font-weight:bold; letter-spacing:0.15em; }',
      '.outcome-victory .outcome-label { color:#8fcf8f; }',
      '.outcome-defeat  .outcome-label { color:#e07070; }',
      '.outcome-draw    .outcome-label { color:#e8c060; }',
      '.battle-details { display:flex; align-items:center; gap:12px; background:#1a1a1a; padding:14px; border-radius:6px; }',
      '.battle-side { flex:1; }',
      '.battle-side h4 { margin:0 0 8px; font-size:0.85em; color:#888; text-transform:uppercase; }',
      '.battle-stat-row { display:flex; justify-content:space-between; font-size:0.88em; color:#ccc; padding:2px 0; }',
      '.cas-val { color:#e07070; font-weight:bold; }',
      '.battle-vs { font-size:1.5em; color:#666; }',
      '.battle-events { background:#1a1a1a; padding:12px; border-radius:6px; }',
      '.battle-events h4 { margin:0 0 8px; font-size:0.85em; color:#888; text-transform:uppercase; }',
      '.battle-events ul { margin:0; padding-left:18px; }',
      '.battle-events li { font-size:0.88em; color:#ccc; margin-bottom:4px; }',
      '.battle-aftermath { display:flex; flex-direction:column; gap:6px; }',
      '.aftermath-row { display:flex; justify-content:space-between; font-size:0.9em; color:#ccc; padding:4px 8px; background:#1a1a1a; border-radius:4px; }',
      '.loot-val { color:#e8d87a; font-weight:bold; }',
      '.pos-change { color:#8fcf8f; font-weight:bold; }',
      '.neg-change { color:#e07070; font-weight:bold; }',
      '.battle-actions { display:flex; justify-content:flex-end; padding-top:4px; }'
    ].join('\n');
    document.head.appendChild(style);
  }());

  // ═══════════════════════════════════════════ Export ═════════════════════════════════════════════

  global.ArmyView = ArmyView;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/army-view.js
