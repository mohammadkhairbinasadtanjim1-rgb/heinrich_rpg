// FILE: client/js/ui/property-view.js — PART 10
// Holdings/property management panel for The Fate of Heinrich.
// IIFE pattern — exposes global `PropertyView`.

(function (global) {
  'use strict';

  // ═══════════════════════════════════════════ Constants ══════════════════════════════════════════

  var PROPERTY_TYPE_META = {
    hovel:         { icon: '🛖', label: 'Hovel',                category: 'dwelling'    },
    cottage:       { icon: '🏡', label: 'Cottage',              category: 'dwelling'    },
    house:         { icon: '🏠', label: 'House',                category: 'dwelling'    },
    manor:         { icon: '🏰', label: 'Manor',                category: 'dwelling'    },
    village:       { icon: '🏘️', label: 'Village (Partial)',    category: 'rural'       },
    town_house:    { icon: '🏙️', label: 'Town House',           category: 'dwelling'    },
    estate:        { icon: '🌄', label: 'Estate',               category: 'rural'       },
    castle:        { icon: '🏯', label: 'Castle',               category: 'military'    },
    fort:          { icon: '🗼', label: 'Fort',                 category: 'military'    },
    farm:          { icon: '🌾', label: 'Farm',                 category: 'production'  },
    mill:          { icon: '⚙️', label: 'Mill',                 category: 'production'  },
    inn:           { icon: '🍺', label: 'Inn',                  category: 'commercial'  },
    workshop:      { icon: '🔧', label: 'Workshop',             category: 'production'  },
    warehouse:     { icon: '📦', label: 'Warehouse',            category: 'commercial'  },
    dock:          { icon: '⚓', label: 'Dock',                 category: 'commercial'  },
    ship:          { icon: '⛵', label: 'Ship',                 category: 'transport'   }
  };

  var CONDITION_THRESHOLDS = [
    { min: 80, label: 'Excellent', cls: 'cond-excellent', barCls: 'bar-excellent' },
    { min: 60, label: 'Good',      cls: 'cond-good',      barCls: 'bar-good'      },
    { min: 40, label: 'Fair',      cls: 'cond-fair',      barCls: 'bar-fair'      },
    { min: 20, label: 'Poor',      cls: 'cond-poor',      barCls: 'bar-poor'      },
    { min:  0, label: 'Ruinous',   cls: 'cond-ruinous',   barCls: 'bar-ruinous'   }
  ];

  var FILTER_CATEGORIES = [
    { key: 'all',        label: 'All'        },
    { key: 'dwelling',   label: 'Dwellings'  },
    { key: 'production', label: 'Production' },
    { key: 'commercial', label: 'Commercial' },
    { key: 'military',   label: 'Military'   },
    { key: 'rural',      label: 'Rural'      },
    { key: 'transport',  label: 'Transport'  }
  ];

  // ═══════════════════════════════════════════ State ══════════════════════════════════════════════

  var _containerId      = null;
  var _container        = null;
  var _propertiesState  = {};
  var _activeFilter     = 'all';
  var _initialized      = false;

  // ═══════════════════════════════════════════ Helpers ════════════════════════════════════════════

  function _el(id)      { return document.getElementById(id); }
  function _qs(s, r)    { return (r || document).querySelector(s); }

  function _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function _fmtSous(n) {
    var num = Number(n) || 0;
    if (num > 0) return '<span class="income-pos">+' + num.toLocaleString() + ' s</span>';
    if (num < 0) return '<span class="income-neg">' + num.toLocaleString() + ' s</span>';
    return '<span class="income-zero">0 s</span>';
  }

  function _fmtSousPlain(n) {
    var num = Number(n) || 0;
    return (num >= 0 ? '+' : '') + num.toLocaleString() + ' s';
  }

  function _clamp(v, mn, mx) { return Math.min(mx, Math.max(mn, v)); }

  function _getConditionMeta(pct) {
    pct = _clamp(pct, 0, 100);
    for (var i = 0; i < CONDITION_THRESHOLDS.length; i++) {
      if (pct >= CONDITION_THRESHOLDS[i].min) return CONDITION_THRESHOLDS[i];
    }
    return CONDITION_THRESHOLDS[CONDITION_THRESHOLDS.length - 1];
  }

  function _getPropertyList(propertiesState) {
    var raw = (propertiesState && propertiesState.properties) || propertiesState || [];
    if (Array.isArray(raw)) return raw;
    return Object.keys(raw).map(function (k) {
      var p = raw[k]; p._id = p._id || k; return p;
    });
  }

  function _getPropertyById(propertyId) {
    var props = _getPropertyList(_propertiesState);
    for (var i = 0; i < props.length; i++) {
      var p = props[i];
      if ((p._id || p.id || p.propertyId) === propertyId ||
          String(p._id || p.id || p.propertyId) === String(propertyId)) return p;
    }
    return null;
  }

  function _getTypeMeta(type) {
    return PROPERTY_TYPE_META[type] || { icon: '🏠', label: type || 'Property', category: 'other' };
  }

  function _calcNetIncome(property) {
    var income  = (property && property.monthlyIncome)  || 0;
    var upkeep  = (property && property.monthlyUpkeep)  || 0;
    return income - upkeep;
  }

  function _filterProperties(props) {
    if (_activeFilter === 'all') return props;
    return props.filter(function (p) {
      var meta = _getTypeMeta(p.type);
      return meta.category === _activeFilter;
    });
  }

  function _dispatchEvent(name, detail) {
    var evt;
    try { evt = new CustomEvent(name, { detail: detail, bubbles: true }); }
    catch (ex) { evt = document.createEvent('CustomEvent'); evt.initCustomEvent(name, true, false, detail); }
    if (_container) _container.dispatchEvent(evt);
  }

  // ═══════════════════════════════════════════ Render Helpers ═════════════════════════════════════

  function _renderConditionBar(condition) {
    var pct  = _clamp(condition || 0, 0, 100);
    var meta = _getConditionMeta(pct);
    return (
      '<div class="condition-bar-wrap" title="Condition: ' + pct + '% — ' + meta.label + '">' +
        '<div class="condition-bar-track">' +
          '<div class="condition-bar-fill ' + meta.barCls + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="condition-label ' + meta.cls + '">' + pct + '%</span>' +
      '</div>'
    );
  }

  function _renderPropertyCard(property) {
    var pid       = property._id || property.id || property.propertyId || '';
    var name      = property.name     || 'Unnamed Property';
    var type      = property.type     || 'house';
    var location  = property.location || 'Unknown';
    var condition = property.condition != null ? property.condition : 100;
    var income    = property.monthlyIncome  || 0;
    var upkeep    = property.monthlyUpkeep  || 0;
    var netIncome = income - upkeep;
    var staff     = property.staffCount || (property.staff && property.staff.length) || 0;
    var tenants   = property.tenantCount || 0;
    var meta      = _getTypeMeta(type);
    var hasEvents = (property.events && property.events.length > 0);
    var condMeta  = _getConditionMeta(condition);
    var buildings = property.buildings || [];

    return (
      '<div class="property-card ' + (hasEvents ? 'has-events' : '') + '" data-property-id="' + _escHtml(String(pid)) + '">' +
        (hasEvents ? '<div class="event-indicator" title="Events requiring attention">!</div>' : '') +
        '<div class="property-card-header">' +
          '<span class="property-icon">' + meta.icon + '</span>' +
          '<div class="property-titles">' +
            '<span class="property-name">' + _escHtml(name) + '</span>' +
            '<span class="property-type-label">' + _escHtml(meta.label) + '</span>' +
          '</div>' +
          '<span class="property-location">📍 ' + _escHtml(location) + '</span>' +
        '</div>' +
        '<div class="property-condition-row">' +
          '<span class="cond-text ' + condMeta.cls + '">' + condMeta.label + '</span>' +
          _renderConditionBar(condition) +
        '</div>' +
        '<div class="property-economics">' +
          '<div class="econ-row">' +
            '<span class="econ-label">Monthly income</span>' + _fmtSous(income) +
          '</div>' +
          '<div class="econ-row">' +
            '<span class="econ-label">Monthly upkeep</span>' + _fmtSous(-upkeep) +
          '</div>' +
          '<div class="econ-row net">' +
            '<span class="econ-label">Net</span>' +
            '<span class="' + (netIncome >= 0 ? 'income-pos' : 'income-neg') + '">' + _fmtSousPlain(netIncome) + '</span>' +
          '</div>' +
        '</div>' +
        (staff || tenants ?
          '<div class="property-people">' +
            (staff   ? '<span class="people-badge">👤 ' + staff   + ' staff</span>'   : '') +
            (tenants ? '<span class="people-badge">🏠 ' + tenants + ' tenants</span>' : '') +
          '</div>' : '') +
        (buildings.length ?
          '<div class="property-buildings-preview">' +
            buildings.slice(0, 3).map(function (b) {
              return '<span class="building-tag">' + _escHtml(b.name || b) + '</span>';
            }).join('') +
            (buildings.length > 3 ? '<span class="building-tag more">+' + (buildings.length - 3) + ' more</span>' : '') +
          '</div>' : '') +
        '<div class="property-card-actions">' +
          '<button class="btn-small btn-property-detail" data-property-id="' + _escHtml(String(pid)) + '">Manage</button>' +
          '<button class="btn-small btn-property-events" data-property-id="' + _escHtml(String(pid)) + '"' + (!hasEvents ? ' disabled' : '') + '>Events' + (hasEvents ? ' ⚠️' : '') + '</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderIncomeBreakdown(income) {
    if (!income || !Object.keys(income).length) return '';
    var html = '<div class="breakdown-list">';
    var keys  = Object.keys(income);
    for (var i = 0; i < keys.length; i++) {
      var val = income[keys[i]];
      html += (
        '<div class="breakdown-row">' +
          '<span class="br-label">' + _escHtml(keys[i]) + '</span>' +
          '<span class="br-val income-pos">+' + (Number(val) || 0).toLocaleString() + ' s</span>' +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderExpenseBreakdown(expenses) {
    if (!expenses || !Object.keys(expenses).length) return '';
    var html = '<div class="breakdown-list">';
    var keys  = Object.keys(expenses);
    for (var i = 0; i < keys.length; i++) {
      var val = expenses[keys[i]];
      html += (
        '<div class="breakdown-row">' +
          '<span class="br-label">' + _escHtml(keys[i]) + '</span>' +
          '<span class="br-val income-neg">-' + (Number(val) || 0).toLocaleString() + ' s</span>' +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderStaffRoster(staff) {
    if (!staff || !staff.length) return '<p class="no-staff">No named staff.</p>';
    var html = '<div class="staff-list">';
    for (var i = 0; i < staff.length; i++) {
      var s = staff[i];
      html += (
        '<div class="staff-entry">' +
          '<span class="staff-name">' + _escHtml(s.name || 'Unknown') + '</span>' +
          '<span class="staff-role">' + _escHtml(s.role || '') + '</span>' +
          (s.wage ? '<span class="staff-wage income-neg">-' + (s.wage).toLocaleString() + ' s/mo</span>' : '') +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderBuildingsList(buildings) {
    if (!buildings || !buildings.length) return '<p class="no-buildings">No improvements built.</p>';
    var html = '<div class="buildings-list">';
    for (var i = 0; i < buildings.length; i++) {
      var b = buildings[i];
      var name = b.name || String(b);
      var cond = b.condition != null ? b.condition : 100;
      var condMeta = _getConditionMeta(cond);
      html += (
        '<div class="building-entry">' +
          '<span class="building-name">' + _escHtml(name) + '</span>' +
          '<span class="building-cond ' + condMeta.cls + '">' + cond + '%</span>' +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderImprovementsQueue(queue) {
    if (!queue || !queue.length) return '<p class="no-queue">No construction in progress.</p>';
    var html = '<div class="queue-list">';
    for (var i = 0; i < queue.length; i++) {
      var item = queue[i];
      var name  = item.name || String(item);
      var turns = item.turnsRemaining != null ? item.turnsRemaining : '?';
      var pct   = item.progress || 0;
      html += (
        '<div class="queue-entry">' +
          '<span class="queue-name">🔨 ' + _escHtml(name) + '</span>' +
          '<span class="queue-turns">' + turns + ' turn' + (turns !== 1 ? 's' : '') + ' left</span>' +
          '<div class="queue-progress-track"><div class="queue-progress-fill" style="width:' + _clamp(pct, 0, 100) + '%"></div></div>' +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderAvailableImprovements(available) {
    if (!available || !available.length) return '<p class="no-available">No improvements available at this time.</p>';
    var html = '<div class="available-list">';
    for (var i = 0; i < available.length; i++) {
      var item = available[i];
      var name  = item.name || String(item);
      var cost  = item.cost || 0;
      var turns = item.turns || item.buildTime || '?';
      var canAfford = item.canAfford !== false;
      html += (
        '<div class="available-entry ' + (!canAfford ? 'cant-afford' : '') + '">' +
          '<div class="avail-info">' +
            '<span class="avail-name">' + _escHtml(name) + '</span>' +
            (item.description ? '<span class="avail-desc">' + _escHtml(item.description) + '</span>' : '') +
          '</div>' +
          '<div class="avail-meta">' +
            '<span class="avail-cost income-neg">-' + cost.toLocaleString() + ' s</span>' +
            '<span class="avail-turns">' + turns + ' turns</span>' +
            '<button class="btn-small btn-build ' + (!canAfford ? 'btn-disabled' : '') + '" data-improvement="' + _escHtml(name) + '" ' + (!canAfford ? 'disabled' : '') + '>Build</button>' +
          '</div>' +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderEventsHistory(events) {
    if (!events || !events.length) return '<p class="no-events-text">No recent events.</p>';
    var recent = events.slice(-5).reverse();
    var html   = '<div class="events-history-list">';
    for (var i = 0; i < recent.length; i++) {
      var ev    = recent[i];
      var turn  = ev.turn  || '?';
      var title = ev.title || ev.type  || 'Event';
      var desc  = ev.description || ev.text || '';
      var urgent = ev.urgent || ev.requiresAction || false;
      html += (
        '<div class="event-entry ' + (urgent ? 'event-urgent' : '') + '">' +
          '<div class="event-header">' +
            '<span class="event-title">' + _escHtml(title) + '</span>' +
            '<span class="event-turn">Turn ' + turn + '</span>' +
          '</div>' +
          (desc ? '<p class="event-desc">' + _escHtml(desc) + '</p>' : '') +
          (urgent ? '<div class="event-urgent-label">⚠️ Requires attention</div>' : '') +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderPropertyDetail(property) {
    var pid       = property._id || property.id || property.propertyId || '';
    var name      = property.name      || 'Unnamed Property';
    var type      = property.type      || 'house';
    var location  = property.location  || 'Unknown';
    var condition = property.condition != null ? property.condition : 100;
    var desc      = property.description || '';
    var income    = property.monthlyIncome  || 0;
    var upkeep    = property.monthlyUpkeep  || 0;
    var netIncome = income - upkeep;
    var staff     = property.staff     || [];
    var buildings = property.buildings || [];
    var queue     = property.buildQueue || property.constructionQueue || [];
    var available = property.availableImprovements || [];
    var events    = property.events    || [];
    var incBreak  = property.incomeBreakdown  || {};
    var expBreak  = property.expenseBreakdown || {};
    var meta      = _getTypeMeta(type);
    var condMeta  = _getConditionMeta(condition);

    return (
      '<div class="property-detail">' +
        '<div class="property-detail-header">' +
          '<span class="property-detail-icon">' + meta.icon + '</span>' +
          '<div class="property-detail-titles">' +
            '<h3>' + _escHtml(name) + '</h3>' +
            '<span class="property-detail-type">' + _escHtml(meta.label) + ' · ' + _escHtml(location) + '</span>' +
          '</div>' +
          '<span class="cond-badge ' + condMeta.cls + '">' + condMeta.label + ' (' + condition + '%)</span>' +
        '</div>' +

        (desc ? '<p class="property-full-desc">' + _escHtml(desc) + '</p>' : '') +

        '<div class="detail-condition-bar">' +
          _renderConditionBar(condition) +
        '</div>' +

        '<div class="detail-two-col">' +
          '<div class="detail-col">' +
            '<h4>Income (monthly)</h4>' +
            _renderIncomeBreakdown(Object.keys(incBreak).length ? incBreak : { 'Total income': income }) +
            '<div class="income-total">Total: <span class="income-pos">+' + income.toLocaleString() + ' s</span></div>' +
          '</div>' +
          '<div class="detail-col">' +
            '<h4>Expenses (monthly)</h4>' +
            _renderExpenseBreakdown(Object.keys(expBreak).length ? expBreak : { 'Total upkeep': upkeep }) +
            '<div class="income-total">Total: <span class="income-neg">-' + upkeep.toLocaleString() + ' s</span></div>' +
            '<div class="net-total">Net: <span class="' + (netIncome >= 0 ? 'income-pos' : 'income-neg') + '">' + _fmtSousPlain(netIncome) + '</span></div>' +
          '</div>' +
        '</div>' +

        '<div class="detail-section">' +
          '<h4>Buildings</h4>' +
          _renderBuildingsList(buildings) +
        '</div>' +

        '<div class="detail-section">' +
          '<h4>Staff</h4>' +
          _renderStaffRoster(staff) +
        '</div>' +

        '<div class="detail-section">' +
          '<h4>Under Construction</h4>' +
          _renderImprovementsQueue(queue) +
        '</div>' +

        '<div class="detail-section">' +
          '<h4>Available Improvements</h4>' +
          _renderAvailableImprovements(available) +
        '</div>' +

        '<div class="detail-section">' +
          '<h4>Recent Events</h4>' +
          _renderEventsHistory(events) +
        '</div>' +

        '<div class="property-detail-actions">' +
          '<button class="btn-small btn-collect" data-property-id="' + _escHtml(String(pid)) + '">💰 Collect Income</button>' +
          '<button class="btn-small btn-repair" data-property-id="' + _escHtml(String(pid)) + '"' + (condition >= 100 ? ' disabled' : '') + '>🔧 Repair</button>' +
          '<button class="btn-small btn-show-build" data-property-id="' + _escHtml(String(pid)) + '">🏗️ Build</button>' +
          '<button class="btn-small btn-sell-property" data-property-id="' + _escHtml(String(pid)) + '">🪙 Sell Property</button>' +
          '<button class="btn-small btn-back-to-props" id="props-back-btn">← Back</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderFilterBar() {
    var html = '<div class="property-filters">';
    for (var i = 0; i < FILTER_CATEGORIES.length; i++) {
      var f = FILTER_CATEGORIES[i];
      html += (
        '<button class="filter-btn ' + (_activeFilter === f.key ? 'filter-active' : '') + '" data-filter="' + f.key + '">' +
          _escHtml(f.label) +
        '</button>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderSummaryBar(props) {
    var totalIncome = 0, totalUpkeep = 0;
    for (var i = 0; i < props.length; i++) {
      totalIncome += (props[i].monthlyIncome || 0);
      totalUpkeep += (props[i].monthlyUpkeep || 0);
    }
    var net = totalIncome - totalUpkeep;
    return (
      '<div class="property-summary-bar">' +
        '<div class="psb-item">' +
          '<span class="psb-label">Properties</span>' +
          '<span class="psb-val">' + props.length + '</span>' +
        '</div>' +
        '<div class="psb-item">' +
          '<span class="psb-label">Monthly income</span>' +
          '<span class="psb-val income-pos">+' + totalIncome.toLocaleString() + ' s</span>' +
        '</div>' +
        '<div class="psb-item">' +
          '<span class="psb-label">Monthly upkeep</span>' +
          '<span class="psb-val income-neg">-' + totalUpkeep.toLocaleString() + ' s</span>' +
        '</div>' +
        '<div class="psb-item highlight">' +
          '<span class="psb-label">Net per month</span>' +
          '<span class="psb-val ' + (net >= 0 ? 'income-pos' : 'income-neg') + '">' + _fmtSousPlain(net) + '</span>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderEmptyState() {
    return (
      '<div class="property-empty">' +
        '<div class="empty-icon">🏚️</div>' +
        '<h3>No Property</h3>' +
        '<p>You own no property. Consider renting a room or saving for a cottage. ' +
          'Even a modest dwelling provides shelter, storage, and a base of operations.</p>' +
        '<p class="empty-hint">Acquire property by purchasing it, winning it, or receiving it as a reward for service.</p>' +
      '</div>'
    );
  }

  function _renderConstructionOptions(property) {
    var pid       = property._id || property.id || property.propertyId || '';
    var name      = property.name || 'Property';
    var available = property.availableImprovements || [];
    return (
      '<div class="construction-options">' +
        '<button class="btn-small btn-back-to-props" id="props-back-btn" style="margin-bottom:12px">← Back</button>' +
        '<h3>Build at: ' + _escHtml(name) + '</h3>' +
        _renderAvailableImprovements(available) +
      '</div>'
    );
  }

  function _renderPropertyEvents(property) {
    var name   = property.name   || 'Property';
    var events = property.events || [];
    return (
      '<div class="property-events-view">' +
        '<button class="btn-small btn-back-to-props" id="props-back-btn" style="margin-bottom:12px">← Back</button>' +
        '<h3>Events at: ' + _escHtml(name) + '</h3>' +
        (events.length ?
          '<div class="events-full-list">' +
            events.slice().reverse().map(function (ev) {
              var urgent = ev.urgent || ev.requiresAction || false;
              return (
                '<div class="event-entry ' + (urgent ? 'event-urgent' : '') + '">' +
                  '<div class="event-header">' +
                    '<span class="event-title">' + _escHtml(ev.title || ev.type || 'Event') + '</span>' +
                    '<span class="event-turn">Turn ' + (ev.turn || '?') + '</span>' +
                  '</div>' +
                  (ev.description || ev.text ? '<p class="event-desc">' + _escHtml(ev.description || ev.text) + '</p>' : '') +
                  (urgent ?
                    '<div class="event-actions">' +
                      '<button class="btn-small btn-resolve-event" data-event-id="' + _escHtml(String(ev.id || ev._id || '')) + '">Resolve</button>' +
                    '</div>' : '') +
                '</div>'
              );
            }).join('') +
          '</div>' :
          '<p class="no-events-text">No events at this property.</p>'
        ) +
      '</div>'
    );
  }

  // ═══════════════════════════════════════════ Event Binding ══════════════════════════════════════

  function _bindEvents() {
    if (!_container) return;
    _container.addEventListener('click', function (e) {
      var target = e.target || e.srcElement;

      // Filter buttons
      if (target.classList.contains('filter-btn')) {
        _activeFilter = target.getAttribute('data-filter') || 'all';
        PropertyView.render(_propertiesState);
        return;
      }

      // Manage / Detail
      if (target.classList.contains('btn-property-detail')) {
        var id = target.getAttribute('data-property-id');
        if (id) PropertyView.showPropertyDetail(id);
        return;
      }

      // Events
      if (target.classList.contains('btn-property-events')) {
        var id2 = target.getAttribute('data-property-id');
        if (id2) PropertyView.showPropertyEvents(id2);
        return;
      }

      // Back
      if (target.id === 'props-back-btn' || target.classList.contains('btn-back-to-props')) {
        PropertyView.render(_propertiesState);
        return;
      }

      // Collect income
      if (target.classList.contains('btn-collect')) {
        _dispatchEvent('property:collectIncome', { propertyId: target.getAttribute('data-property-id') });
        return;
      }

      // Repair
      if (target.classList.contains('btn-repair')) {
        _dispatchEvent('property:repair', { propertyId: target.getAttribute('data-property-id') });
        return;
      }

      // Build button (open construction options)
      if (target.classList.contains('btn-show-build')) {
        var id3 = target.getAttribute('data-property-id');
        if (id3) PropertyView.showConstructionOptions(id3);
        return;
      }

      // Sell property
      if (target.classList.contains('btn-sell-property')) {
        var id4 = target.getAttribute('data-property-id');
        if (id4 && window.confirm('Are you sure you want to sell this property? This cannot be undone.')) {
          _dispatchEvent('property:sell', { propertyId: id4 });
        }
        return;
      }

      // Build improvement
      if (target.classList.contains('btn-build') && !target.disabled) {
        _dispatchEvent('property:build', {
          improvement: target.getAttribute('data-improvement')
        });
        return;
      }

      // Resolve event
      if (target.classList.contains('btn-resolve-event')) {
        _dispatchEvent('property:resolveEvent', { eventId: target.getAttribute('data-event-id') });
        return;
      }
    });
  }

  // ═══════════════════════════════════════════ Public API ═════════════════════════════════════════

  var PropertyView = {

    /**
     * Initialize property view.
     * @param {string} containerId
     */
    init: function (containerId) {
      _containerId = containerId;
      _container   = document.getElementById(containerId);
      if (!_container) {
        console.warn('[PropertyView] Container not found: ' + containerId);
        return;
      }
      _container.classList.add('property-view');
      _initialized = true;
      _bindEvents();
    },

    /**
     * Full render of properties panel.
     * @param {Object|Array} propertiesState
     */
    render: function (propertiesState) {
      if (!_initialized) { console.warn('[PropertyView] Not initialized.'); return; }
      _propertiesState = propertiesState || {};

      var allProps      = _getPropertyList(_propertiesState);
      var filteredProps = _filterProperties(allProps);

      var html = '<div class="property-panel">';
      html += '<div class="property-panel-header">';
      html += '<h2 class="property-panel-title">🏛️ Properties & Holdings</h2>';
      html += '</div>';

      if (!allProps.length) {
        html += _renderEmptyState();
      } else {
        html += _renderSummaryBar(allProps);
        html += _renderFilterBar();

        if (!filteredProps.length) {
          html += '<div class="no-filter-results"><p>No ' + _activeFilter + ' properties owned.</p></div>';
        } else {
          html += '<div class="property-grid">';
          for (var i = 0; i < filteredProps.length; i++) {
            html += _renderPropertyCard(filteredProps[i]);
          }
          html += '</div>';
        }
      }

      html += '</div>';
      _container.innerHTML = html;
    },

    /**
     * Update specific property card(s) in-place.
     * @param {Object|Array} propertiesState
     */
    update: function (propertiesState) {
      _propertiesState = propertiesState || _propertiesState;
      var grid = _qs('.property-grid', _container);
      if (grid) {
        var filtered = _filterProperties(_getPropertyList(_propertiesState));
        var html = '';
        for (var i = 0; i < filtered.length; i++) html += _renderPropertyCard(filtered[i]);
        grid.innerHTML = html;
        // Update summary bar
        var summary = _qs('.property-summary-bar', _container);
        if (summary) {
          var all = _getPropertyList(_propertiesState);
          var tempDiv = document.createElement('div');
          tempDiv.innerHTML = _renderSummaryBar(all);
          summary.parentNode.replaceChild(tempDiv.firstChild, summary);
        }
      } else {
        PropertyView.render(_propertiesState);
      }
    },

    /**
     * Show detailed management view for a property.
     * @param {string} propertyId
     */
    showPropertyDetail: function (propertyId) {
      var property = _getPropertyById(propertyId);
      if (!property) {
        console.warn('[PropertyView] Property not found: ' + propertyId);
        return;
      }
      var panel = _qs('.property-panel', _container);
      if (!panel) return;
      panel.innerHTML = _renderPropertyDetail(property);
    },

    /**
     * Show construction options for a property.
     * @param {string} propertyId
     */
    showConstructionOptions: function (propertyId) {
      var property = _getPropertyById(propertyId);
      if (!property) return;
      var panel = _qs('.property-panel', _container);
      if (!panel) return;
      panel.innerHTML = _renderConstructionOptions(property);
    },

    /**
     * Show recent events at a property.
     * @param {string} propertyId
     */
    showPropertyEvents: function (propertyId) {
      var property = _getPropertyById(propertyId);
      if (!property) return;
      var panel = _qs('.property-panel', _container);
      if (!panel) return;
      panel.innerHTML = _renderPropertyEvents(property);
    }
  };

  // ═══════════════════════════════════════════ CSS Injection ══════════════════════════════════════

  (function _injectStyles() {
    if (document.getElementById('property-view-styles')) return;
    var style = document.createElement('style');
    style.id  = 'property-view-styles';
    style.textContent = [
      '.property-view { font-family:inherit; }',
      '.property-panel { display:flex; flex-direction:column; gap:14px; padding:12px; }',
      '.property-panel-header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #7a9c5a; padding-bottom:8px; }',
      '.property-panel-title { margin:0; font-size:1.2em; color:#9ccf7a; }',
      '.property-summary-bar { display:flex; background:#1e1e1e; border:1px solid #2a2a2a; border-radius:8px; overflow:hidden; }',
      '.psb-item { flex:1; text-align:center; padding:10px 6px; border-right:1px solid #2a2a2a; }',
      '.psb-item:last-child { border-right:none; }',
      '.psb-item.highlight { background:rgba(122,156,90,0.08); }',
      '.psb-label { display:block; font-size:0.72em; color:#888; text-transform:uppercase; margin-bottom:3px; }',
      '.psb-val { font-size:1em; font-weight:bold; }',
      '.income-pos  { color:#8fcf8f; }',
      '.income-neg  { color:#e07070; }',
      '.income-zero { color:#888; }',
      '.property-filters { display:flex; flex-wrap:wrap; gap:6px; }',
      '.filter-btn { padding:4px 10px; font-size:0.8em; border:1px solid #333; background:#1a1a1a; color:#aaa; border-radius:14px; cursor:pointer; transition:all 0.15s; }',
      '.filter-btn:hover { border-color:#7a9c5a; color:#9ccf7a; }',
      '.filter-btn.filter-active { border-color:#7a9c5a; background:rgba(122,156,90,0.15); color:#9ccf7a; font-weight:bold; }',
      '.property-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }',
      '.property-card { background:#1e1e1e; border:1px solid #333; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px; position:relative; transition:border-color 0.2s; }',
      '.property-card:hover { border-color:#7a9c5a; }',
      '.property-card.has-events { border-color:rgba(200,160,48,0.5); }',
      '.event-indicator { position:absolute; top:-6px; right:10px; background:#c8a030; color:#fff; font-size:0.75em; font-weight:bold; width:18px; height:18px; border-radius:50%; display:flex; align-items:center; justify-content:center; }',
      '.property-card-header { display:flex; align-items:flex-start; gap:8px; }',
      '.property-icon { font-size:1.6em; flex-shrink:0; }',
      '.property-titles { flex:1; display:flex; flex-direction:column; gap:2px; }',
      '.property-name { font-weight:bold; color:#eee; font-size:0.95em; }',
      '.property-type-label { font-size:0.78em; color:#7a9c5a; }',
      '.property-location { font-size:0.75em; color:#888; white-space:nowrap; }',
      '.property-condition-row { display:flex; align-items:center; gap:8px; }',
      '.cond-text { font-size:0.78em; width:58px; flex-shrink:0; font-weight:bold; }',
      '.cond-excellent { color:#5c9e5c; }',
      '.cond-good      { color:#8fcf8f; }',
      '.cond-fair      { color:#c8a030; }',
      '.cond-poor      { color:#e07070; }',
      '.cond-ruinous   { color:#a03030; }',
      '.condition-bar-wrap { display:flex; align-items:center; gap:6px; flex:1; }',
      '.condition-bar-track { flex:1; height:5px; background:#2a2a2a; border-radius:3px; overflow:hidden; }',
      '.condition-bar-fill { height:100%; border-radius:3px; transition:width 0.35s; }',
      '.bar-excellent { background:linear-gradient(to right,#3a8c3a,#6ccc6c); }',
      '.bar-good      { background:linear-gradient(to right,#4a8c4a,#7acc7a); }',
      '.bar-fair      { background:linear-gradient(to right,#9c7c1a,#e8c060); }',
      '.bar-poor      { background:linear-gradient(to right,#8c3a1a,#cc7040); }',
      '.bar-ruinous   { background:linear-gradient(to right,#6c1a1a,#aa3030); }',
      '.condition-label { font-size:0.78em; color:#888; }',
      '.property-economics { display:flex; flex-direction:column; gap:3px; }',
      '.econ-row { display:flex; justify-content:space-between; font-size:0.82em; }',
      '.econ-row.net { border-top:1px solid #2a2a2a; padding-top:3px; font-weight:bold; }',
      '.econ-label { color:#888; }',
      '.property-people { display:flex; gap:8px; flex-wrap:wrap; }',
      '.people-badge { font-size:0.78em; color:#aaa; background:#252525; padding:2px 8px; border-radius:10px; }',
      '.property-buildings-preview { display:flex; flex-wrap:wrap; gap:5px; }',
      '.building-tag { font-size:0.72em; color:#aaa; background:#252525; border:1px solid #333; padding:2px 6px; border-radius:4px; }',
      '.building-tag.more { color:#888; }',
      '.property-card-actions { display:flex; gap:8px; }',
      '.property-empty { text-align:center; padding:32px 20px; background:#1a1a1a; border:1px dashed #333; border-radius:8px; }',
      '.empty-icon { font-size:3em; margin-bottom:12px; }',
      '.property-empty h3 { color:#9ccf7a; margin:0 0 10px; }',
      '.property-empty p { color:#999; font-size:0.9em; line-height:1.6; max-width:400px; margin:0 auto 8px; }',
      '.empty-hint { font-size:0.82em; color:#666; font-style:italic; }',
      '.no-filter-results { padding:20px; text-align:center; color:#888; font-size:0.9em; }',
      '.property-detail { display:flex; flex-direction:column; gap:12px; padding:4px; }',
      '.property-detail-header { display:flex; align-items:center; gap:12px; }',
      '.property-detail-icon { font-size:2.2em; flex-shrink:0; }',
      '.property-detail-titles { flex:1; }',
      '.property-detail-titles h3 { margin:0 0 3px; font-size:1.1em; color:#eee; }',
      '.property-detail-type { font-size:0.82em; color:#7a9c5a; }',
      '.cond-badge { font-size:0.82em; padding:4px 10px; border-radius:10px; white-space:nowrap; }',
      '.property-full-desc { font-size:0.9em; color:#aaa; font-style:italic; margin:0; line-height:1.6; }',
      '.detail-condition-bar { padding:4px 0; }',
      '.detail-two-col { display:grid; grid-template-columns:1fr 1fr; gap:14px; }',
      '.detail-col { background:#1a1a1a; border-radius:6px; padding:10px; }',
      '.detail-col h4 { margin:0 0 8px; font-size:0.82em; color:#888; text-transform:uppercase; letter-spacing:0.05em; }',
      '.breakdown-list { display:flex; flex-direction:column; gap:4px; }',
      '.breakdown-row { display:flex; justify-content:space-between; font-size:0.82em; color:#ccc; }',
      '.br-label { color:#aaa; }',
      '.income-total, .net-total { margin-top:6px; font-size:0.85em; border-top:1px solid #2a2a2a; padding-top:4px; display:flex; justify-content:space-between; font-weight:bold; }',
      '.detail-section { }',
      '.detail-section h4 { margin:0 0 8px; font-size:0.82em; color:#888; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #2a2a2a; padding-bottom:4px; }',
      '.buildings-list { display:flex; flex-direction:column; gap:4px; }',
      '.building-entry { display:flex; justify-content:space-between; font-size:0.85em; padding:4px 8px; background:#1a1a1a; border-radius:4px; }',
      '.building-name { color:#ccc; }',
      '.building-cond { font-weight:bold; }',
      '.no-buildings, .no-staff, .no-queue, .no-available, .no-events-text { font-size:0.85em; color:#666; font-style:italic; }',
      '.staff-list { display:flex; flex-direction:column; gap:4px; }',
      '.staff-entry { display:flex; gap:10px; font-size:0.85em; padding:4px 8px; background:#1a1a1a; border-radius:4px; }',
      '.staff-name { flex:1; color:#ccc; font-weight:bold; }',
      '.staff-role { flex:1; color:#aaa; }',
      '.staff-wage { color:#e07070; }',
      '.queue-list { display:flex; flex-direction:column; gap:6px; }',
      '.queue-entry { display:flex; align-items:center; gap:8px; font-size:0.85em; padding:5px 8px; background:#1a1a1a; border-radius:4px; }',
      '.queue-name { flex:1; color:#ccc; }',
      '.queue-turns { font-size:0.78em; color:#888; white-space:nowrap; }',
      '.queue-progress-track { width:60px; height:4px; background:#2a2a2a; border-radius:2px; overflow:hidden; flex-shrink:0; }',
      '.queue-progress-fill { height:100%; background:linear-gradient(to right,#7a9c5a,#aace8a); border-radius:2px; transition:width 0.3s; }',
      '.available-list { display:flex; flex-direction:column; gap:6px; }',
      '.available-entry { display:flex; align-items:center; gap:10px; padding:8px; background:#1a1a1a; border-radius:5px; border:1px solid #2a2a2a; }',
      '.available-entry.cant-afford { opacity:0.5; }',
      '.avail-info { flex:1; display:flex; flex-direction:column; gap:2px; }',
      '.avail-name { color:#ddd; font-size:0.88em; font-weight:bold; }',
      '.avail-desc { color:#888; font-size:0.78em; }',
      '.avail-meta { display:flex; align-items:center; gap:8px; }',
      '.avail-cost  { font-size:0.82em; }',
      '.avail-turns { font-size:0.78em; color:#888; }',
      '.btn-disabled { opacity:0.4; cursor:not-allowed; }',
      '.events-history-list, .events-full-list { display:flex; flex-direction:column; gap:8px; }',
      '.event-entry { padding:10px; background:#1a1a1a; border-radius:5px; border:1px solid #2a2a2a; }',
      '.event-entry.event-urgent { border-color:rgba(200,160,48,0.5); background:rgba(200,160,48,0.05); }',
      '.event-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }',
      '.event-title { font-weight:bold; color:#ddd; font-size:0.88em; }',
      '.event-turn { font-size:0.75em; color:#666; }',
      '.event-desc { margin:0; font-size:0.85em; color:#aaa; line-height:1.5; }',
      '.event-urgent-label { font-size:0.78em; color:#e8c060; margin-top:6px; }',
      '.event-actions { margin-top:6px; }',
      '.property-detail-actions { display:flex; gap:8px; flex-wrap:wrap; padding-top:10px; border-top:1px solid #2a2a2a; }',
      '.btn-sell-property { border-color:#b94a4a !important; color:#b94a4a !important; }',
      '.btn-sell-property:hover { background:rgba(185,74,74,0.12) !important; }',
      '.construction-options { display:flex; flex-direction:column; gap:12px; }',
      '.construction-options h3 { margin:0; font-size:1em; color:#ddd; }',
      '.property-events-view { display:flex; flex-direction:column; gap:12px; }',
      '.property-events-view h3 { margin:0; font-size:1em; color:#ddd; }'
    ].join('\n');
    document.head.appendChild(style);
  }());

  // ═══════════════════════════════════════════ Export ═════════════════════════════════════════════

  global.PropertyView = PropertyView;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/property-view.js
