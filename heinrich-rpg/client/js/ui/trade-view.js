// FILE: client/js/ui/trade-view.js — PART 10
// Trade route and merchant company management panel for The Fate of Heinrich.
// IIFE pattern — exposes global `TradeView`.

(function (global) {
  'use strict';

  // ═══════════════════════════════════════════ Constants ══════════════════════════════════════════

  var COMPANY_STAGES = [
    {
      key:         'none',
      label:       'No Trading Company',
      icon:        '🚫',
      description: 'You conduct no organised trade. Start a trading company to begin profiting from commerce.'
    },
    {
      key:         'sole_trader',
      label:       'Sole Trader',
      icon:        '🎒',
      description: 'You buy and sell goods yourself at local markets. Simple, low-risk, low-reward.'
    },
    {
      key:         'partnership',
      label:       'Partnership',
      icon:        '🤝',
      description: 'You operate trade routes in partnership with a trusted merchant NPC, sharing profits and risks.'
    },
    {
      key:         'small_company',
      label:       'Small Company',
      icon:        '🏪',
      description: '2–3 active routes with hired merchants. Modest but reliable income across nearby regions.'
    },
    {
      key:         'trade_house',
      label:       'Trade House',
      icon:        '🏢',
      description: '5+ routes across multiple regions. A recognised name in commerce with salaried factors.'
    },
    {
      key:         'trade_empire',
      label:       'Trade Empire',
      icon:        '🌍',
      description: 'International routes, factors in multiple cities. One of the great merchant houses of the era.'
    }
  ];

  var ROUTE_STATUSES = {
    in_transit: { label: 'In Transit', icon: '🚚', cls: 'status-transit'  },
    arrived:    { label: 'Arrived',    icon: '✅', cls: 'status-arrived'  },
    delayed:    { label: 'Delayed',    icon: '⏳', cls: 'status-delayed'  },
    attacked:   { label: 'Attacked',   icon: '⚔️', cls: 'status-attacked' }
  };

  var TREND_ICONS = {
    surging: '↑↑',
    rising:  '↑',
    stable:  '→',
    falling: '↓',
    crashing:'↓↓'
  };

  var TREND_CLASSES = {
    surging: 'trend-surging',
    rising:  'trend-rising',
    stable:  'trend-stable',
    falling: 'trend-falling',
    crashing:'trend-crashing'
  };

  // ═══════════════════════════════════════════ State ══════════════════════════════════════════════

  var _containerId   = null;
  var _container     = null;
  var _tradeState    = {};
  var _economyState  = {};
  var _initialized   = false;

  // ═══════════════════════════════════════════ Helpers ════════════════════════════════════════════

  function _el(id) { return document.getElementById(id); }
  function _qs(sel, root) { return (root || document).querySelector(sel); }

  function _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function _fmtSous(n) {
    var num = Number(n) || 0;
    if (num < 0) return '-' + Math.abs(num).toLocaleString() + ' s';
    return num.toLocaleString() + ' s';
  }

  function _fmtSousColored(n) {
    var num = Number(n) || 0;
    if (num > 0) return '<span class="money-pos">+' + num.toLocaleString() + ' s</span>';
    if (num < 0) return '<span class="money-neg">' + num.toLocaleString() + ' s</span>';
    return '<span class="money-zero">0 s</span>';
  }

  function _getRouteList(tradeState) {
    var raw = (tradeState && tradeState.routes) || [];
    if (Array.isArray(raw)) return raw;
    return Object.keys(raw).map(function (k) { var r = raw[k]; r._id = r._id || k; return r; });
  }

  function _getCompanyStage(tradeState) {
    var stageKey = (tradeState && tradeState.companyStage) || 'none';
    for (var i = 0; i < COMPANY_STAGES.length; i++) {
      if (COMPANY_STAGES[i].key === stageKey) return COMPANY_STAGES[i];
    }
    return COMPANY_STAGES[0];
  }

  function _getRouteById(routeId) {
    var routes = _getRouteList(_tradeState);
    for (var i = 0; i < routes.length; i++) {
      var r = routes[i];
      if ((r._id || r.id || r.routeId) === routeId || String(r._id || r.id || r.routeId) === String(routeId)) return r;
    }
    return null;
  }

  function _dispatchEvent(name, detail) {
    var evt;
    try { evt = new CustomEvent(name, { detail: detail, bubbles: true }); }
    catch (ex) { evt = document.createEvent('CustomEvent'); evt.initCustomEvent(name, true, false, detail); }
    if (_container) _container.dispatchEvent(evt);
  }

  // ═══════════════════════════════════════════ Render Helpers ═════════════════════════════════════

  function _renderCompanyStageBar(currentStage) {
    var currentIdx = 0;
    for (var i = 0; i < COMPANY_STAGES.length; i++) {
      if (COMPANY_STAGES[i].key === currentStage) { currentIdx = i; break; }
    }
    var html = '<div class="company-stage-bar">';
    for (var j = 0; j < COMPANY_STAGES.length; j++) {
      var s     = COMPANY_STAGES[j];
      var isCur = (j === currentIdx);
      var isPast= (j < currentIdx);
      html += (
        '<div class="stage-step ' + (isCur ? 'stage-current' : isPast ? 'stage-done' : 'stage-future') + '" title="' + _escHtml(s.label) + '">' +
          '<span class="stage-icon">' + s.icon + '</span>' +
          '<span class="stage-label">' + _escHtml(s.label) + '</span>' +
        '</div>'
      );
      if (j < COMPANY_STAGES.length - 1) {
        html += '<div class="stage-connector ' + (j < currentIdx ? 'connector-done' : '') + '"></div>';
      }
    }
    html += '</div>';
    return html;
  }

  function _renderRouteCard(route) {
    var routeId    = route._id || route.id || route.routeId || '';
    var name       = route.name     || 'Unnamed Route';
    var from       = route.from     || '?';
    var to         = route.to       || '?';
    var goods      = route.goods    || route.commodity || 'Mixed goods';
    var quantity   = route.quantity || 0;
    var value      = route.value    || 0;
    var rawStatus  = route.status   || 'in_transit';
    var statusMeta = ROUTE_STATUSES[rawStatus] || ROUTE_STATUSES.in_transit;
    var nextArr    = route.nextArrival != null ? route.nextArrival + ' turn' + (route.nextArrival !== 1 ? 's' : '') : 'Unknown';
    var lastProfit = route.lastProfit != null ? route.lastProfit : null;
    var merchant   = route.merchant || '';

    return (
      '<div class="route-card" data-route-id="' + _escHtml(String(routeId)) + '">' +
        '<div class="route-card-header">' +
          '<span class="route-name">' + _escHtml(name) + '</span>' +
          '<span class="route-status ' + statusMeta.cls + '">' + statusMeta.icon + ' ' + _escHtml(statusMeta.label) + '</span>' +
        '</div>' +
        '<div class="route-path">' +
          '<span class="route-from">' + _escHtml(from) + '</span>' +
          '<span class="route-arrow">→</span>' +
          '<span class="route-to">' + _escHtml(to) + '</span>' +
        '</div>' +
        '<div class="route-details">' +
          '<div class="route-detail-row">' +
            '<span class="rd-label">Goods:</span>' +
            '<span class="rd-val">' + _escHtml(goods) + '</span>' +
          '</div>' +
          '<div class="route-detail-row">' +
            '<span class="rd-label">Quantity:</span>' +
            '<span class="rd-val">' + quantity.toLocaleString() + ' units</span>' +
          '</div>' +
          '<div class="route-detail-row">' +
            '<span class="rd-label">Cargo value:</span>' +
            '<span class="rd-val">' + _fmtSous(value) + '</span>' +
          '</div>' +
          (merchant ? '<div class="route-detail-row"><span class="rd-label">Merchant:</span><span class="rd-val">' + _escHtml(merchant) + '</span></div>' : '') +
          '<div class="route-detail-row">' +
            '<span class="rd-label">Next arrival:</span>' +
            '<span class="rd-val">' + _escHtml(nextArr) + '</span>' +
          '</div>' +
          (lastProfit !== null ?
            '<div class="route-detail-row"><span class="rd-label">Last cycle profit:</span><span class="rd-val">' + _fmtSousColored(lastProfit) + '</span></div>' : '') +
        '</div>' +
        '<div class="route-actions">' +
          '<button class="btn-small btn-route-detail" data-route-id="' + _escHtml(String(routeId)) + '">Details</button>' +
          '<button class="btn-small btn-route-cancel" data-route-id="' + _escHtml(String(routeId)) + '">Cancel Route</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderRouteDetail(route) {
    var name      = route.name       || 'Unnamed Route';
    var from      = route.from       || '?';
    var to        = route.to         || '?';
    var goods     = route.goods      || route.commodity || 'Mixed goods';
    var quantity  = route.quantity   || 0;
    var value     = route.value      || 0;
    var rawStatus = route.status     || 'in_transit';
    var statusMeta= ROUTE_STATUSES[rawStatus] || ROUTE_STATUSES.in_transit;
    var nextArr   = route.nextArrival != null ? route.nextArrival + ' turn' + (route.nextArrival !== 1 ? 's' : '') : 'Unknown';
    var lastProfit= route.lastProfit != null ? route.lastProfit : 0;
    var merchant  = route.merchant || 'You (personally)';
    var history   = route.history   || [];
    var risk      = route.riskLevel || 'Low';
    var notes     = route.notes     || '';

    var historyHtml = '';
    if (history.length) {
      historyHtml = '<div class="route-history"><h4>History</h4><ul>';
      for (var i = 0; i < history.length; i++) {
        var h = history[i];
        historyHtml += '<li class="history-entry">' +
          '<span class="history-turn">Turn ' + (h.turn || '?') + ':</span> ' +
          _escHtml(h.event || h.description || '') +
          (h.profit != null ? ' <span class="' + (h.profit >= 0 ? 'money-pos' : 'money-neg') + '">' + _fmtSousColored(h.profit) + '</span>' : '') +
          '</li>';
      }
      historyHtml += '</ul></div>';
    }

    return (
      '<div class="route-detail-view">' +
        '<div class="route-detail-header">' +
          '<h3>' + _escHtml(name) + '</h3>' +
          '<div class="route-path large">' +
            '<span>' + _escHtml(from) + '</span>' +
            '<span class="route-arrow">→</span>' +
            '<span>' + _escHtml(to) + '</span>' +
          '</div>' +
          '<span class="route-status ' + statusMeta.cls + '">' + statusMeta.icon + ' ' + _escHtml(statusMeta.label) + '</span>' +
        '</div>' +
        '<div class="route-detail-body">' +
          '<div class="detail-grid">' +
            '<div class="detail-cell"><span class="dc-label">Goods</span><span class="dc-val">' + _escHtml(goods) + '</span></div>' +
            '<div class="detail-cell"><span class="dc-label">Quantity</span><span class="dc-val">' + quantity.toLocaleString() + '</span></div>' +
            '<div class="detail-cell"><span class="dc-label">Cargo Value</span><span class="dc-val">' + _fmtSous(value) + '</span></div>' +
            '<div class="detail-cell"><span class="dc-label">Merchant</span><span class="dc-val">' + _escHtml(merchant) + '</span></div>' +
            '<div class="detail-cell"><span class="dc-label">Next Arrival</span><span class="dc-val">' + _escHtml(nextArr) + '</span></div>' +
            '<div class="detail-cell"><span class="dc-label">Last Profit</span><span class="dc-val">' + _fmtSousColored(lastProfit) + '</span></div>' +
            '<div class="detail-cell"><span class="dc-label">Risk Level</span><span class="dc-val">' + _escHtml(risk) + '</span></div>' +
          '</div>' +
          (notes ? '<p class="route-notes">' + _escHtml(notes) + '</p>' : '') +
          historyHtml +
        '</div>' +
        '<div class="route-detail-actions">' +
          '<button class="btn-small btn-back-to-trade" id="trade-back-btn">← Back</button>' +
          '<button class="btn-small btn-route-cancel" data-route-id="' + _escHtml(String(route._id || route.id || '')) + '">Cancel Route</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderMarketPrices(regionId, economyState) {
    var markets  = (economyState && economyState.markets) || {};
    var regional = markets[regionId] || (economyState && economyState.prices) || {};
    var commodities = Object.keys(regional);

    if (!commodities.length) {
      return '<div class="market-empty"><p>No market price data available for this region.</p></div>';
    }

    var stock = (economyState && economyState.playerStock) || {};

    var html = (
      '<div class="market-prices">' +
        '<h3>Market Prices — ' + _escHtml(String(regionId)) + '</h3>' +
        '<div class="market-table">' +
          '<div class="market-header">' +
            '<span>Commodity</span>' +
            '<span>Price</span>' +
            '<span>Trend</span>' +
            '<span>Supply</span>' +
            '<span>Demand</span>' +
            '<span>Your Stock</span>' +
          '</div>'
    );

    for (var i = 0; i < commodities.length; i++) {
      var name = commodities[i];
      var data = regional[name] || {};
      var price    = data.price    || data.current || 0;
      var base     = data.base     || data.basePrice || price;
      var trend    = data.trend    || 'stable';
      var supply   = data.supply   || 0;
      var demand   = data.demand   || 0;
      var myStock  = stock[name]   || 0;
      var trendIcon = TREND_ICONS[trend]   || '→';
      var trendCls  = TREND_CLASSES[trend] || 'trend-stable';
      var priceChange = (base > 0) ? Math.round(((price - base) / base) * 100) : 0;
      var priceCls = price > base ? 'price-above' : price < base ? 'price-below' : 'price-base';

      html += (
        '<div class="market-row">' +
          '<span class="mkt-name">' + _escHtml(name) + '</span>' +
          '<span class="mkt-price ' + priceCls + '">' + _fmtSous(price) +
            (priceChange !== 0 ? ' <small>(' + (priceChange > 0 ? '+' : '') + priceChange + '%)</small>' : '') +
          '</span>' +
          '<span class="mkt-trend ' + _escHtml(trendCls) + '">' + trendIcon + ' ' + _escHtml(trend) + '</span>' +
          '<span class="mkt-supply">' + supply.toLocaleString() + '</span>' +
          '<span class="mkt-demand">' + demand.toLocaleString() + '</span>' +
          '<span class="mkt-stock">' + myStock.toLocaleString() + '</span>' +
        '</div>'
      );
    }

    html += '</div></div>';
    return html;
  }

  function _renderCompanyFinances(tradeState, economyState) {
    var company  = (tradeState && tradeState.company) || {};
    var assets   = company.assets   || (economyState && economyState.companyAssets)   || 0;
    var goodsVal = company.goodsValue|| (economyState && economyState.companyGoodsVal)|| 0;
    var debts    = company.debts    || (economyState && economyState.companyDebts)    || 0;
    var income   = company.monthlyIncome || (economyState && economyState.companyIncome)|| 0;
    var expenses = company.monthlyExpenses||(economyState && economyState.companyExpenses)||0;
    var wages    = company.wages    || (economyState && economyState.companyWages)    || 0;
    var debtsOwed= company.debtsOwed|| (economyState && economyState.debtsOwed)       || 0;
    var employees= company.employees|| [];
    var totalAssets = assets + goodsVal - debts;
    var netMonthly  = income - expenses;

    var employeeHtml = '';
    if (employees.length) {
      employeeHtml = '<div class="company-employees"><h4>Employees</h4><div class="employee-list">';
      for (var i = 0; i < employees.length; i++) {
        var emp = employees[i];
        employeeHtml += (
          '<div class="employee-row">' +
            '<span class="emp-name">' + _escHtml(emp.name || 'Employee') + '</span>' +
            '<span class="emp-role">' + _escHtml(emp.role || '') + '</span>' +
            '<span class="emp-wage">' + _fmtSous(emp.wage || 0) + '/month</span>' +
          '</div>'
        );
      }
      employeeHtml += '</div></div>';
    }

    return (
      '<div class="company-finances">' +
        '<h3>Company Finances</h3>' +
        '<div class="finance-grid">' +
          '<div class="finance-cell">' +
            '<span class="fc-label">Coin on hand</span>' +
            '<span class="fc-val">' + _fmtSous(assets) + '</span>' +
          '</div>' +
          '<div class="finance-cell">' +
            '<span class="fc-label">Goods value</span>' +
            '<span class="fc-val">' + _fmtSous(goodsVal) + '</span>' +
          '</div>' +
          '<div class="finance-cell">' +
            '<span class="fc-label">Debts owed to you</span>' +
            '<span class="fc-val money-pos">' + _fmtSous(debtsOwed) + '</span>' +
          '</div>' +
          '<div class="finance-cell">' +
            '<span class="fc-label">Your debts</span>' +
            '<span class="fc-val money-neg">' + _fmtSous(debts) + '</span>' +
          '</div>' +
          '<div class="finance-cell highlight">' +
            '<span class="fc-label">Total assets</span>' +
            '<span class="fc-val ' + (totalAssets >= 0 ? 'money-pos' : 'money-neg') + '">' + _fmtSous(totalAssets) + '</span>' +
          '</div>' +
          '<div class="finance-cell">' +
            '<span class="fc-label">Monthly income</span>' +
            '<span class="fc-val money-pos">' + _fmtSous(income) + '</span>' +
          '</div>' +
          '<div class="finance-cell">' +
            '<span class="fc-label">Monthly expenses</span>' +
            '<span class="fc-val money-neg">' + _fmtSous(expenses) + '</span>' +
          '</div>' +
          '<div class="finance-cell">' +
            '<span class="fc-label">Wages</span>' +
            '<span class="fc-val money-neg">' + _fmtSous(wages) + '</span>' +
          '</div>' +
          '<div class="finance-cell highlight">' +
            '<span class="fc-label">Net monthly</span>' +
            '<span class="fc-val ' + (netMonthly >= 0 ? 'money-pos' : 'money-neg') + '">' + (netMonthly >= 0 ? '+' : '') + _fmtSous(netMonthly) + '</span>' +
          '</div>' +
        '</div>' +
        employeeHtml +
      '</div>'
    );
  }

  function _renderNoCompanyPanel(tradeState) {
    return (
      '<div class="trade-no-company">' +
        '<div class="no-company-icon">🏪</div>' +
        '<h3>No Trading Company</h3>' +
        '<p>You conduct no organised trade. Starting a trading company requires some initial capital and connections. Even a humble sole trader can grow into a great merchant house in time.</p>' +
        '<button class="btn-start-company" id="btn-start-company">⚖️ Start a Trading Company</button>' +
      '</div>'
    );
  }

  // ═══════════════════════════════════════════ Event Binding ══════════════════════════════════════

  function _bindEvents() {
    if (!_container) return;
    _container.addEventListener('click', function (e) {
      var target = e.target || e.srcElement;

      if (target.classList.contains('btn-route-detail')) {
        var id = target.getAttribute('data-route-id');
        if (id) TradeView.showRouteDetail(id);
        return;
      }

      if (target.id === 'trade-back-btn' || target.classList.contains('btn-back-to-trade')) {
        TradeView.render(_tradeState, _economyState);
        return;
      }

      if (target.classList.contains('btn-route-cancel')) {
        var rid = target.getAttribute('data-route-id');
        if (rid && window.confirm('Cancel this trade route? Goods currently in transit may be lost.')) {
          _dispatchEvent('trade:cancelRoute', { routeId: rid });
        }
        return;
      }

      if (target.id === 'btn-start-company' || target.classList.contains('btn-start-company')) {
        _dispatchEvent('trade:startCompany', {});
        return;
      }

      if (target.id === 'btn-company-overview') {
        TradeView.showCompanyOverview();
        return;
      }

      if (target.classList.contains('btn-new-route')) {
        _dispatchEvent('trade:newRoute', {});
        return;
      }

      if (target.classList.contains('btn-show-market')) {
        var rid2 = target.getAttribute('data-region-id');
        if (rid2) TradeView.showMarketPrices(rid2);
        return;
      }
    });
  }

  // ═══════════════════════════════════════════ Public API ═════════════════════════════════════════

  var TradeView = {

    /**
     * Initialize trade view.
     * @param {string} containerId
     */
    init: function (containerId) {
      _containerId = containerId;
      _container   = document.getElementById(containerId);
      if (!_container) {
        console.warn('[TradeView] Container not found: ' + containerId);
        return;
      }
      _container.classList.add('trade-view');
      _initialized = true;
      _bindEvents();
    },

    /**
     * Full render of trade panel.
     * @param {Object} tradeState
     * @param {Object} economyState
     */
    render: function (tradeState, economyState) {
      if (!_initialized) { console.warn('[TradeView] Not initialized.'); return; }
      _tradeState   = tradeState   || {};
      _economyState = economyState || {};

      var stage  = _getCompanyStage(_tradeState);
      var routes = _getRouteList(_tradeState);

      var html = '<div class="trade-panel">';
      html += '<div class="trade-panel-header">';
      html += '<h2 class="trade-panel-title">⚖️ Trade & Commerce</h2>';

      if (stage.key !== 'none') {
        html += '<div class="trade-header-actions">';
        html += '<button class="btn-small btn-new-route">+ New Route</button>';
        html += '<button class="btn-small" id="btn-company-overview">Company Finances</button>';
        html += '</div>';
      }
      html += '</div>';

      if (stage.key === 'none') {
        html += _renderNoCompanyPanel(_tradeState);
      } else {
        // Stage progress bar
        html += _renderCompanyStageBar(stage.key);

        // Stage description
        html += (
          '<div class="company-stage-info">' +
            '<span class="stage-info-icon">' + stage.icon + '</span>' +
            '<div>' +
              '<strong>' + _escHtml(stage.label) + '</strong>' +
              '<p class="stage-info-desc">' + _escHtml(stage.description) + '</p>' +
            '</div>' +
          '</div>'
        );

        // Active routes
        html += '<div class="trade-routes-section">';
        html += '<h3>Active Routes <span class="route-count">(' + routes.length + ')</span></h3>';

        if (!routes.length) {
          html += '<div class="no-routes"><p>No active trade routes. Create a route to begin moving goods.</p></div>';
        } else {
          html += '<div class="routes-grid">';
          for (var i = 0; i < routes.length; i++) {
            html += _renderRouteCard(routes[i]);
          }
          html += '</div>';
        }
        html += '</div>';

        // Market overview buttons
        var regions = (_tradeState && _tradeState.knownRegions) ||
                      (Object.keys((_economyState && _economyState.markets) || {}));
        if (regions && regions.length) {
          html += '<div class="market-buttons"><h3>Market Prices</h3><div class="market-btn-row">';
          for (var j = 0; j < regions.length; j++) {
            html += '<button class="btn-small btn-show-market" data-region-id="' + _escHtml(String(regions[j])) + '">' +
                    '📊 ' + _escHtml(String(regions[j])) + '</button>';
          }
          html += '</div></div>';
        }
      }

      html += '</div>';
      _container.innerHTML = html;
    },

    /**
     * Update trade view in-place.
     * @param {Object} tradeState
     * @param {Object} economyState
     */
    update: function (tradeState, economyState) {
      _tradeState   = tradeState   || _tradeState;
      _economyState = economyState || _economyState;
      var grid = _qs('.routes-grid', _container);
      if (grid) {
        var routes = _getRouteList(_tradeState);
        var html   = '';
        for (var i = 0; i < routes.length; i++) html += _renderRouteCard(routes[i]);
        grid.innerHTML = html;
      } else {
        TradeView.render(_tradeState, _economyState);
      }
    },

    /**
     * Show detailed view for a specific route.
     * @param {string} routeId
     */
    showRouteDetail: function (routeId) {
      var route = _getRouteById(routeId);
      if (!route) {
        console.warn('[TradeView] Route not found: ' + routeId);
        return;
      }
      var panel = _qs('.trade-panel', _container);
      if (!panel) return;
      var detail   = document.createElement('div');
      detail.innerHTML = _renderRouteDetail(route);
      panel.innerHTML  = '';
      panel.appendChild(detail.firstChild);
    },

    /**
     * Show company finances overview.
     */
    showCompanyOverview: function () {
      var panel = _qs('.trade-panel', _container);
      if (!panel) return;
      var content = (
        '<div class="trade-sub-panel">' +
          '<button class="btn-small btn-back-to-trade" id="trade-back-btn" style="margin-bottom:12px">← Back to Trade</button>' +
          _renderCompanyFinances(_tradeState, _economyState) +
        '</div>'
      );
      panel.innerHTML = content;
    },

    /**
     * Show market prices for a region.
     * @param {string} regionId
     */
    showMarketPrices: function (regionId) {
      var panel = _qs('.trade-panel', _container);
      if (!panel) return;
      var content = (
        '<div class="trade-sub-panel">' +
          '<button class="btn-small btn-back-to-trade" id="trade-back-btn" style="margin-bottom:12px">← Back to Trade</button>' +
          _renderMarketPrices(regionId, _economyState) +
        '</div>'
      );
      panel.innerHTML = content;
    }
  };

  // ═══════════════════════════════════════════ CSS Injection ══════════════════════════════════════

  (function _injectStyles() {
    if (document.getElementById('trade-view-styles')) return;
    var style = document.createElement('style');
    style.id  = 'trade-view-styles';
    style.textContent = [
      '.trade-view { font-family:inherit; }',
      '.trade-panel { display:flex; flex-direction:column; gap:16px; padding:12px; }',
      '.trade-panel-header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #e8d87a; padding-bottom:8px; }',
      '.trade-panel-title { margin:0; font-size:1.2em; color:#e8d87a; }',
      '.trade-header-actions { display:flex; gap:8px; }',
      '.company-stage-bar { display:flex; align-items:center; overflow-x:auto; padding:8px 0; gap:0; }',
      '.stage-step { display:flex; flex-direction:column; align-items:center; gap:3px; padding:6px 10px; border-radius:6px; flex-shrink:0; min-width:80px; text-align:center; }',
      '.stage-step.stage-current { background:rgba(232,216,122,0.15); border:1px solid #e8d87a; }',
      '.stage-step.stage-done    { opacity:0.7; }',
      '.stage-step.stage-future  { opacity:0.4; }',
      '.stage-icon { font-size:1.2em; }',
      '.stage-label { font-size:0.7em; color:#aaa; white-space:nowrap; }',
      '.stage-step.stage-current .stage-label { color:#e8d87a; }',
      '.stage-connector { flex:1; height:2px; background:#2a2a2a; min-width:16px; }',
      '.stage-connector.connector-done { background:#c8a030; }',
      '.company-stage-info { display:flex; align-items:flex-start; gap:10px; padding:10px; background:rgba(232,216,122,0.06); border-radius:6px; border:1px solid #2a2a2a; }',
      '.stage-info-icon { font-size:1.8em; flex-shrink:0; }',
      '.company-stage-info strong { color:#e8d87a; font-size:0.95em; }',
      '.stage-info-desc { margin:4px 0 0; font-size:0.85em; color:#999; line-height:1.5; }',
      '.trade-routes-section h3, .market-buttons h3 { font-size:0.95em; color:#ddd; margin:0 0 10px; }',
      '.route-count { font-size:0.8em; color:#888; }',
      '.routes-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:12px; }',
      '.route-card { background:#1e1e1e; border:1px solid #333; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px; transition:border-color 0.2s; }',
      '.route-card:hover { border-color:#e8d87a; }',
      '.route-card-header { display:flex; justify-content:space-between; align-items:center; }',
      '.route-name { font-weight:bold; color:#eee; font-size:0.95em; }',
      '.route-status { font-size:0.78em; padding:2px 7px; border-radius:10px; }',
      '.status-transit  { background:rgba(100,160,220,0.15); color:#6aa0dc; border:1px solid rgba(100,160,220,0.3); }',
      '.status-arrived  { background:rgba(92,158,92,0.15);  color:#8fcf8f; border:1px solid rgba(92,158,92,0.3);  }',
      '.status-delayed  { background:rgba(200,160,48,0.15); color:#e8c060; border:1px solid rgba(200,160,48,0.3); }',
      '.status-attacked { background:rgba(185,74,74,0.15);  color:#e07070; border:1px solid rgba(185,74,74,0.3);  }',
      '.route-path { display:flex; align-items:center; gap:8px; font-size:0.88em; }',
      '.route-from, .route-to { color:#c8a96e; font-weight:bold; }',
      '.route-arrow { color:#666; font-size:1.1em; }',
      '.route-path.large { font-size:1.1em; margin-bottom:6px; }',
      '.route-details { display:flex; flex-direction:column; gap:4px; }',
      '.route-detail-row { display:flex; justify-content:space-between; font-size:0.82em; }',
      '.rd-label { color:#888; }',
      '.rd-val { color:#ccc; }',
      '.route-actions { display:flex; gap:8px; margin-top:4px; }',
      '.no-routes { padding:16px; text-align:center; background:#1a1a1a; border:1px dashed #333; border-radius:6px; }',
      '.no-routes p { color:#888; font-size:0.9em; margin:0; }',
      '.money-pos  { color:#8fcf8f; font-weight:bold; }',
      '.money-neg  { color:#e07070; font-weight:bold; }',
      '.money-zero { color:#888; }',
      '.market-btn-row { display:flex; flex-wrap:wrap; gap:8px; }',
      '.market-prices h3 { color:#ddd; margin:0 0 12px; }',
      '.market-table { display:flex; flex-direction:column; gap:2px; }',
      '.market-header { display:grid; grid-template-columns:2fr 1.5fr 1.2fr 1fr 1fr 1fr; gap:8px; padding:6px 10px; font-size:0.78em; color:#888; text-transform:uppercase; letter-spacing:0.05em; background:#1a1a1a; border-radius:4px 4px 0 0; }',
      '.market-row    { display:grid; grid-template-columns:2fr 1.5fr 1.2fr 1fr 1fr 1fr; gap:8px; padding:7px 10px; font-size:0.85em; background:#1e1e1e; border-bottom:1px solid #222; }',
      '.market-row:hover { background:#252525; }',
      '.mkt-name { color:#ddd; font-weight:bold; }',
      '.price-above { color:#e07070; }',
      '.price-below { color:#8fcf8f; }',
      '.price-base  { color:#ccc; }',
      '.trend-surging { color:#e07070; font-weight:bold; }',
      '.trend-rising  { color:#e8a060; }',
      '.trend-stable  { color:#aaa; }',
      '.trend-falling { color:#8fcf8f; }',
      '.trend-crashing{ color:#5c9e5c; font-weight:bold; }',
      '.company-finances h3 { color:#ddd; margin:0 0 12px; }',
      '.finance-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(180px,1fr)); gap:10px; margin-bottom:14px; }',
      '.finance-cell { background:#1e1e1e; border:1px solid #2a2a2a; border-radius:6px; padding:10px; display:flex; flex-direction:column; gap:4px; }',
      '.finance-cell.highlight { border-color:#e8d87a; background:rgba(232,216,122,0.06); }',
      '.fc-label { font-size:0.78em; color:#888; text-transform:uppercase; }',
      '.fc-val { font-size:1.2em; font-weight:bold; color:#eee; }',
      '.company-employees h4 { margin:0 0 8px; font-size:0.85em; color:#888; text-transform:uppercase; }',
      '.employee-list { display:flex; flex-direction:column; gap:4px; }',
      '.employee-row { display:flex; gap:10px; font-size:0.88em; padding:5px 8px; background:#1a1a1a; border-radius:4px; }',
      '.emp-name { flex:1; color:#ddd; font-weight:bold; }',
      '.emp-role { flex:1; color:#aaa; }',
      '.emp-wage { color:#e8d87a; }',
      '.trade-no-company { text-align:center; padding:32px 20px; background:#1a1a1a; border:1px dashed #444; border-radius:8px; }',
      '.no-company-icon { font-size:3em; margin-bottom:12px; }',
      '.trade-no-company h3 { color:#e8d87a; margin:0 0 10px; }',
      '.trade-no-company p  { color:#999; font-size:0.9em; line-height:1.6; max-width:380px; margin:0 auto 16px; }',
      '.btn-start-company { padding:8px 20px; font-size:0.95em; border:1px solid #e8d87a; background:rgba(232,216,122,0.12); color:#e8d87a; border-radius:6px; cursor:pointer; transition:background 0.15s; }',
      '.btn-start-company:hover { background:rgba(232,216,122,0.25); }',
      '.route-detail-view { display:flex; flex-direction:column; gap:12px; }',
      '.route-detail-header { display:flex; flex-direction:column; gap:6px; }',
      '.route-detail-header h3 { margin:0; font-size:1.1em; color:#eee; }',
      '.route-detail-body { display:flex; flex-direction:column; gap:12px; }',
      '.detail-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); gap:8px; }',
      '.detail-cell { background:#1e1e1e; border:1px solid #2a2a2a; border-radius:5px; padding:8px; display:flex; flex-direction:column; }',
      '.dc-label { font-size:0.75em; color:#888; text-transform:uppercase; margin-bottom:3px; }',
      '.dc-val { font-size:0.95em; color:#ccc; }',
      '.route-notes { font-size:0.85em; color:#999; font-style:italic; margin:0; padding:8px; background:#1a1a1a; border-radius:4px; }',
      '.route-history h4 { margin:0 0 8px; font-size:0.85em; color:#888; text-transform:uppercase; }',
      '.route-history ul { margin:0; padding-left:16px; list-style:disc; }',
      '.history-entry { font-size:0.85em; color:#ccc; margin-bottom:4px; line-height:1.5; }',
      '.history-turn { color:#888; }',
      '.route-detail-actions, .trade-sub-panel .btn-small { margin-top:4px; }',
      '.trade-sub-panel { display:flex; flex-direction:column; gap:12px; }'
    ].join('\n');
    document.head.appendChild(style);
  }());

  // ═══════════════════════════════════════════ Export ═════════════════════════════════════════════

  global.TradeView = TradeView;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/trade-view.js
