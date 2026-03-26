// FILE: client/js/ui/inventory-view.js — PART 10

(function (global) {
  'use strict';

  // ── Constants ────────────────────────────────────────────────────────────────

  var EQUIPMENT_SLOTS = [
    { id: 'head',      label: 'Head',      icon: '🪖' },
    { id: 'torso',     label: 'Torso',     icon: '🥋' },
    { id: 'legs',      label: 'Legs',      icon: '👖' },
    { id: 'feet',      label: 'Feet',      icon: '👢' },
    { id: 'hands',     label: 'Hands',     icon: '🧤' },
    { id: 'belt',      label: 'Belt',      icon: '🔱' },
    { id: 'primary',   label: 'Primary',   icon: '⚔️' },
    { id: 'secondary', label: 'Secondary', icon: '🗡️' },
    { id: 'shield',    label: 'Shield',    icon: '🛡️' }
  ];

  var QUALITY_ICONS = {
    wretched:   { icon: '⚫', class: 'q-wretched',   label: 'Wretched' },
    poor:       { icon: '⬛', class: 'q-poor',       label: 'Poor' },
    common:     { icon: '◻️', class: 'q-common',     label: 'Common' },
    good:       { icon: '🔷', class: 'q-good',       label: 'Good' },
    fine:       { icon: '🔶', class: 'q-fine',       label: 'Fine' },
    masterwork: { icon: '💠', class: 'q-masterwork', label: 'Masterwork' },
    legendary:  { icon: '⭐', class: 'q-legendary',  label: 'Legendary' }
  };

  var ITEM_FILTERS = [
    { key: 'all',       label: 'All' },
    { key: 'weapons',   label: 'Weapons' },
    { key: 'armor',     label: 'Armor' },
    { key: 'tools',     label: 'Tools' },
    { key: 'food',      label: 'Food' },
    { key: 'valuables', label: 'Valuables' },
    { key: 'misc',      label: 'Misc' }
  ];

  var SORT_OPTIONS = [
    { key: 'name',      label: 'Name' },
    { key: 'weight',    label: 'Weight' },
    { key: 'value',     label: 'Value' },
    { key: 'condition', label: 'Condition' }
  ];

  var WEALTH_TIERS = [
    { max: 50,    label: 'Destitute',       class: 'wealth-destitute' },
    { max: 200,   label: 'Poor',            class: 'wealth-poor' },
    { max: 500,   label: 'Modest',          class: 'wealth-modest' },
    { max: 1500,  label: 'Comfortable',     class: 'wealth-comfortable' },
    { max: 5000,  label: 'Well-off',        class: 'wealth-welloff' },
    { max: 15000, label: 'Wealthy',         class: 'wealth-wealthy' },
    { max: 50000, label: 'Rich',            class: 'wealth-rich' },
    { max: Infinity, label: 'Very Rich',    class: 'wealth-veryrich' }
  ];

  // ── Utility ──────────────────────────────────────────────────────────────────

  function getQualityInfo(quality) {
    return QUALITY_ICONS[quality] || QUALITY_ICONS.common;
  }

  function formatWeight(kg) {
    if (kg === undefined || kg === null) return '—';
    return kg.toFixed(1) + 'kg';
  }

  function formatValue(deniers) {
    if (deniers === undefined || deniers === null) return '—';
    if (deniers < 12) return deniers + 'd';
    var sous = Math.floor(deniers / 12);
    var remD = deniers % 12;
    if (sous < 20) return sous + 's' + (remD > 0 ? ' ' + remD + 'd' : '');
    var livres = Math.floor(sous / 20);
    var remS = sous % 20;
    return livres + 'l' + (remS > 0 ? ' ' + remS + 's' : '') + (remD > 0 ? ' ' + remD + 'd' : '');
  }

  function getWealthTier(totalDeniers) {
    for (var i = 0; i < WEALTH_TIERS.length; i++) {
      if (totalDeniers <= WEALTH_TIERS[i].max) return WEALTH_TIERS[i];
    }
    return WEALTH_TIERS[WEALTH_TIERS.length - 1];
  }

  function conditionPercent(condition) {
    // condition is 0-100
    if (typeof condition !== 'number') return 100;
    return Math.max(0, Math.min(100, condition));
  }

  function conditionLabel(pct) {
    if (pct >= 90) return 'Pristine';
    if (pct >= 70) return 'Good';
    if (pct >= 50) return 'Worn';
    if (pct >= 30) return 'Damaged';
    if (pct >= 10) return 'Poor';
    return 'Ruined';
  }

  function conditionClass(pct) {
    if (pct >= 70) return 'cond-good';
    if (pct >= 40) return 'cond-moderate';
    return 'cond-bad';
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Strength skill level → max carry in kg
  function maxCarryWeight(strengthLevel) {
    var base = 20;
    return base + (strengthLevel || 0) * 5;
  }

  // ── InventoryView ─────────────────────────────────────────────────────────────

  function InventoryView() {
    this._containerId = null;
    this._container = null;
    this._inventoryState = {};
    this._filter = 'all';
    this._sortField = 'name';
    this._selectedItemId = null;
    this._detailOverlay = null;
  }

  // ── init ─────────────────────────────────────────────────────────────────────

  InventoryView.prototype.init = function (containerId) {
    this._containerId = containerId;
    this._container = document.getElementById(containerId);
    if (!this._container) {
      console.error('[InventoryView] Container not found:', containerId);
      return;
    }
    this._container.classList.add('inventory-view');
    this._buildShell();
  };

  InventoryView.prototype._buildShell = function () {
    var self = this;
    this._container.innerHTML = '';

    // Filter bar
    var filterBar = document.createElement('div');
    filterBar.className = 'iv-filter-bar';
    ITEM_FILTERS.forEach(function (f) {
      var btn = document.createElement('button');
      btn.className = 'iv-filter-btn' + (f.key === self._filter ? ' active' : '');
      btn.dataset.filter = f.key;
      btn.textContent = f.label;
      btn.addEventListener('click', function () { self.setFilter(f.key); });
      filterBar.appendChild(btn);
    });
    this._container.appendChild(filterBar);

    // Sort bar
    var sortBar = document.createElement('div');
    sortBar.className = 'iv-sort-bar';
    var sortLabel = document.createElement('span');
    sortLabel.className = 'iv-sort-label';
    sortLabel.textContent = 'Sort: ';
    sortBar.appendChild(sortLabel);
    SORT_OPTIONS.forEach(function (s) {
      var btn = document.createElement('button');
      btn.className = 'iv-sort-btn' + (s.key === self._sortField ? ' active' : '');
      btn.dataset.sort = s.key;
      btn.textContent = s.label;
      btn.addEventListener('click', function () { self.sortBy(s.key); });
      sortBar.appendChild(btn);
    });
    this._container.appendChild(sortBar);

    // Main body
    var body = document.createElement('div');
    body.className = 'iv-body';
    body.id = this._containerId + '-body';
    this._container.appendChild(body);

    // Detail overlay
    var overlay = document.createElement('div');
    overlay.className = 'iv-detail-overlay hidden';
    overlay.id = this._containerId + '-detail';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { self.hideItemDetail(); }
    });
    this._container.appendChild(overlay);
    this._detailOverlay = overlay;
  };

  // ── render ────────────────────────────────────────────────────────────────────

  InventoryView.prototype.render = function (inventoryState) {
    this._inventoryState = inventoryState || {};
    if (!this._container) return;
    this._renderBody();
  };

  InventoryView.prototype._renderBody = function () {
    var body = document.getElementById(this._containerId + '-body');
    if (!body) return;
    body.innerHTML = '';

    var inv = this._inventoryState;
    var equipped = inv.equipped || {};
    var carried = inv.carried || [];
    var coins = inv.coins || { deniers: 0, sous: 0, livres: 0 };
    var stored = inv.stored || {};
    var strengthLevel = inv.strengthLevel || 0;

    // 1. EQUIPPED section
    body.appendChild(this._buildEquippedSection(equipped));

    // 2. CARRIED section
    body.appendChild(this._buildCarriedSection(carried, strengthLevel));

    // 3. COIN section
    body.appendChild(this._buildCoinSection(coins));

    // 4. ENCUMBRANCE
    body.appendChild(this._buildEncumbranceSection(carried, strengthLevel));

    // 5. STORED section (only if has storage)
    if (Object.keys(stored).length > 0) {
      body.appendChild(this._buildStoredSection(stored));
    }

    // 6. NAMED ITEMS section
    var namedItems = carried.filter(function (item) { return item.named; });
    var equippedNamed = Object.values(equipped).filter(function (item) { return item && item.named; });
    var allNamed = namedItems.concat(equippedNamed);
    if (allNamed.length > 0) {
      body.appendChild(this._buildNamedItemsSection(allNamed));
    }
  };

  // ── Equipped Section ─────────────────────────────────────────────────────────

  InventoryView.prototype._buildEquippedSection = function (equipped) {
    var self = this;
    var section = document.createElement('div');
    section.className = 'iv-section iv-equipped-section';

    var header = document.createElement('div');
    header.className = 'iv-section-header';
    header.innerHTML = '<span class="iv-section-icon">⚔️</span><span class="iv-section-title">Equipped</span>';
    section.appendChild(header);

    var grid = document.createElement('div');
    grid.className = 'iv-equipment-grid';

    EQUIPMENT_SLOTS.forEach(function (slot) {
      var item = equipped[slot.id];
      var slotEl = document.createElement('div');
      slotEl.className = 'iv-slot' + (item ? ' iv-slot-filled' : ' iv-slot-empty');
      slotEl.dataset.slot = slot.id;

      var slotLabel = document.createElement('div');
      slotLabel.className = 'iv-slot-label';
      slotLabel.innerHTML = slot.icon + ' <span>' + slot.label + '</span>';
      slotEl.appendChild(slotLabel);

      if (item) {
        var qi = getQualityInfo(item.quality);
        var cond = conditionPercent(item.condition);
        var condEl = document.createElement('div');
        condEl.className = 'iv-slot-item';
        condEl.innerHTML = '<span class="iv-item-quality-icon ' + qi.class + '">' + qi.icon + '</span>'
          + '<span class="iv-item-name">' + escapeHtml(item.name || 'Unknown') + '</span>';

        var condBar = document.createElement('div');
        condBar.className = 'iv-slot-cond-bar';
        var condFill = document.createElement('div');
        condFill.className = 'iv-slot-cond-fill ' + conditionClass(cond);
        condFill.style.width = cond + '%';
        condFill.title = conditionLabel(cond) + ' (' + cond + '%)';
        condBar.appendChild(condFill);

        slotEl.appendChild(condEl);
        slotEl.appendChild(condBar);

        slotEl.addEventListener('click', function () {
          if (item.id) self.showItemDetail(item.id);
        });
      } else {
        var emptyEl = document.createElement('div');
        emptyEl.className = 'iv-slot-empty-label';
        emptyEl.textContent = '— empty —';
        slotEl.appendChild(emptyEl);
      }

      grid.appendChild(slotEl);
    });

    section.appendChild(grid);
    return section;
  };

  // ── Carried Section ──────────────────────────────────────────────────────────

  InventoryView.prototype._buildCarriedSection = function (carried, strengthLevel) {
    var self = this;
    var filtered = this._applyFilter(carried);
    var sorted = this._applySort(filtered);

    var section = document.createElement('div');
    section.className = 'iv-section iv-carried-section';

    var totalWeight = carried.reduce(function (sum, item) {
      return sum + (item.weight || 0);
    }, 0);

    var header = document.createElement('div');
    header.className = 'iv-section-header';
    header.innerHTML = '<span class="iv-section-icon">🎒</span>'
      + '<span class="iv-section-title">Carried</span>'
      + '<span class="iv-section-meta">' + carried.length + ' items · ' + totalWeight.toFixed(1) + 'kg</span>';
    section.appendChild(header);

    if (sorted.length === 0) {
      var empty = document.createElement('div');
      empty.className = 'iv-empty';
      empty.textContent = this._filter === 'all' ? 'Carrying nothing.' : 'No items in this category.';
      section.appendChild(empty);
    } else {
      var list = document.createElement('div');
      list.className = 'iv-item-list';
      sorted.forEach(function (item) {
        list.appendChild(self._buildItemEntry(item));
      });
      section.appendChild(list);
    }

    return section;
  };

  InventoryView.prototype._applyFilter = function (items) {
    if (this._filter === 'all') return items;
    return items.filter(function (item) {
      return item.type === this._filter;
    }, this);
  };

  InventoryView.prototype._applySort = function (items) {
    var field = this._sortField;
    return items.slice().sort(function (a, b) {
      switch (field) {
        case 'name':
          return (a.name || '').localeCompare(b.name || '');
        case 'weight':
          return (b.weight || 0) - (a.weight || 0);
        case 'value':
          return (b.value || 0) - (a.value || 0);
        case 'condition':
          return (b.condition || 100) - (a.condition || 100);
        default:
          return 0;
      }
    });
  };

  InventoryView.prototype._buildItemEntry = function (item) {
    var self = this;
    var qi = getQualityInfo(item.quality);
    var cond = conditionPercent(item.condition);
    var isSelected = this._selectedItemId === (item.id);

    var entry = document.createElement('div');
    entry.className = 'iv-item-entry ' + qi.class + (item.named ? ' iv-named-item' : '') + (isSelected ? ' iv-selected' : '');
    if (item.id) entry.dataset.itemId = item.id;

    // Quality icon
    var qualIcon = document.createElement('span');
    qualIcon.className = 'iv-item-quality-icon ' + qi.class;
    qualIcon.title = qi.label;
    qualIcon.textContent = qi.icon;

    // Name
    var nameEl = document.createElement('span');
    nameEl.className = 'iv-item-name';
    nameEl.textContent = item.name || 'Unknown item';

    // Condition bar
    var condBar = document.createElement('div');
    condBar.className = 'iv-item-cond-bar';
    var condFill = document.createElement('div');
    condFill.className = 'iv-item-cond-fill ' + conditionClass(cond);
    condFill.style.width = cond + '%';
    condFill.title = conditionLabel(cond);
    condBar.appendChild(condFill);

    // Weight
    var weightEl = document.createElement('span');
    weightEl.className = 'iv-item-weight';
    weightEl.textContent = formatWeight(item.weight);

    // Value
    var valueEl = document.createElement('span');
    valueEl.className = 'iv-item-value';
    valueEl.textContent = formatValue(item.value);

    entry.appendChild(qualIcon);
    entry.appendChild(nameEl);
    entry.appendChild(condBar);
    entry.appendChild(weightEl);
    entry.appendChild(valueEl);

    if (item.named) {
      var namedBadge = document.createElement('span');
      namedBadge.className = 'iv-named-badge';
      namedBadge.title = 'Named item with history';
      namedBadge.textContent = '✦';
      entry.appendChild(namedBadge);
    }

    entry.addEventListener('click', function () {
      if (item.id) self.showItemDetail(item.id);
    });

    return entry;
  };

  // ── Coin Section ──────────────────────────────────────────────────────────────

  InventoryView.prototype._buildCoinSection = function (coins) {
    var deniers = (coins.deniers || 0) + (coins.sous || 0) * 12 + (coins.livres || 0) * 240;
    var wealthTier = getWealthTier(deniers);

    var section = document.createElement('div');
    section.className = 'iv-section iv-coin-section';

    var header = document.createElement('div');
    header.className = 'iv-section-header';
    header.innerHTML = '<span class="iv-section-icon">💰</span><span class="iv-section-title">Coin</span>';
    section.appendChild(header);

    var coinDisplay = document.createElement('div');
    coinDisplay.className = 'iv-coin-display';
    coinDisplay.innerHTML = '<span class="iv-coin-livres">' + (coins.livres || 0) + '<span class="iv-coin-unit">l</span></span>'
      + '<span class="iv-coin-sous">' + (coins.sous || 0) + '<span class="iv-coin-unit">s</span></span>'
      + '<span class="iv-coin-deniers">' + (coins.deniers || 0) + '<span class="iv-coin-unit">d</span></span>'
      + '<span class="iv-wealth-badge ' + wealthTier.class + '">' + wealthTier.label + '</span>';
    section.appendChild(coinDisplay);

    var totalEl = document.createElement('div');
    totalEl.className = 'iv-coin-total';
    totalEl.textContent = 'Total: ' + formatValue(deniers);
    section.appendChild(totalEl);

    return section;
  };

  // ── Encumbrance Section ───────────────────────────────────────────────────────

  InventoryView.prototype._buildEncumbranceSection = function (carried, strengthLevel) {
    var current = carried.reduce(function (sum, item) {
      return sum + (item.weight || 0);
    }, 0);
    // Also add equipped items
    var equipped = (this._inventoryState.equipped) || {};
    Object.values(equipped).forEach(function (item) {
      if (item) current += (item.weight || 0);
    });

    var max = maxCarryWeight(strengthLevel);
    var pct = Math.min(100, Math.floor((current / max) * 100));
    var encClass = pct >= 90 ? 'enc-over' : pct >= 70 ? 'enc-heavy' : pct >= 40 ? 'enc-moderate' : 'enc-light';

    var section = document.createElement('div');
    section.className = 'iv-section iv-encumbrance-section';

    var header = document.createElement('div');
    header.className = 'iv-section-header';
    header.innerHTML = '<span class="iv-section-icon">⚖️</span><span class="iv-section-title">Encumbrance</span>';
    section.appendChild(header);

    var barWrap = document.createElement('div');
    barWrap.className = 'iv-enc-wrap';

    var barLabel = document.createElement('div');
    barLabel.className = 'iv-enc-label';
    barLabel.innerHTML = '<span>' + current.toFixed(1) + 'kg / ' + max + 'kg</span>'
      + '<span class="iv-enc-pct ' + encClass + '">' + pct + '%</span>';

    var barOuter = document.createElement('div');
    barOuter.className = 'iv-enc-bar';
    var barFill = document.createElement('div');
    barFill.className = 'iv-enc-fill ' + encClass;
    barFill.style.width = pct + '%';
    barOuter.appendChild(barFill);

    if (pct >= 90) {
      var overloadNote = document.createElement('div');
      overloadNote.className = 'iv-enc-warning';
      overloadNote.textContent = pct >= 100 ? '⚠ Overloaded — movement severely impaired!' : '⚠ Heavily loaded — movement impaired.';
      barWrap.appendChild(barLabel);
      barWrap.appendChild(barOuter);
      barWrap.appendChild(overloadNote);
    } else {
      barWrap.appendChild(barLabel);
      barWrap.appendChild(barOuter);
    }

    section.appendChild(barWrap);
    return section;
  };

  // ── Stored Section ────────────────────────────────────────────────────────────

  InventoryView.prototype._buildStoredSection = function (stored) {
    var self = this;
    var section = document.createElement('div');
    section.className = 'iv-section iv-stored-section';

    var header = document.createElement('div');
    header.className = 'iv-section-header';
    header.innerHTML = '<span class="iv-section-icon">🏠</span><span class="iv-section-title">Stored at Properties</span>';
    section.appendChild(header);

    Object.keys(stored).forEach(function (locationName) {
      var items = stored[locationName];
      if (!items || items.length === 0) return;

      var locBlock = document.createElement('div');
      locBlock.className = 'iv-stored-location';

      var locHeader = document.createElement('div');
      locHeader.className = 'iv-stored-loc-header';
      locHeader.textContent = locationName + ' (' + items.length + ' items)';
      locBlock.appendChild(locHeader);

      var locList = document.createElement('div');
      locList.className = 'iv-item-list iv-stored-list';
      items.forEach(function (item) {
        locList.appendChild(self._buildItemEntry(item));
      });
      locBlock.appendChild(locList);
      section.appendChild(locBlock);
    });

    return section;
  };

  // ── Named Items Section ───────────────────────────────────────────────────────

  InventoryView.prototype._buildNamedItemsSection = function (namedItems) {
    var self = this;
    var section = document.createElement('div');
    section.className = 'iv-section iv-named-section';

    var header = document.createElement('div');
    header.className = 'iv-section-header';
    header.innerHTML = '<span class="iv-section-icon">✦</span><span class="iv-section-title">Named Items</span>';
    section.appendChild(header);

    namedItems.forEach(function (item) {
      var qi = getQualityInfo(item.quality);
      var namedEl = document.createElement('div');
      namedEl.className = 'iv-named-item-card ' + qi.class;

      namedEl.innerHTML = '<div class="iv-named-item-header">'
        + '<span class="iv-item-quality-icon ' + qi.class + '">' + qi.icon + '</span>'
        + '<span class="iv-named-item-name">' + escapeHtml(item.name || 'Unknown') + '</span>'
        + '<span class="iv-named-item-type">' + escapeHtml(item.type || '') + '</span>'
        + '</div>'
        + (item.namedItemHistory ? '<div class="iv-named-item-history">' + escapeHtml(item.namedItemHistory) + '</div>' : '');

      namedEl.addEventListener('click', function () {
        if (item.id) self.showItemDetail(item.id);
      });

      section.appendChild(namedEl);
    });

    return section;
  };

  // ── update ────────────────────────────────────────────────────────────────────

  InventoryView.prototype.update = function (inventoryState, changedItems) {
    this._inventoryState = inventoryState || this._inventoryState;
    if (!this._container) return;

    if (!changedItems || changedItems.length === 0) {
      this._renderBody();
      return;
    }

    // For partial updates, full re-render is safest given the section structure
    this._renderBody();
  };

  // ── showItemDetail ────────────────────────────────────────────────────────────

  InventoryView.prototype.showItemDetail = function (itemId) {
    this._selectedItemId = itemId;
    if (!this._detailOverlay) return;

    var self = this;
    var item = this._findItemById(itemId);
    if (!item) return;

    var qi = getQualityInfo(item.quality);
    var cond = conditionPercent(item.condition);
    var isEquipped = this._isItemEquipped(itemId);

    var panel = document.createElement('div');
    panel.className = 'iv-detail-panel ' + qi.class;

    // Close button
    var closeBtn = document.createElement('button');
    closeBtn.className = 'iv-detail-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () { self.hideItemDetail(); });
    panel.appendChild(closeBtn);

    // Header
    var headerEl = document.createElement('div');
    headerEl.className = 'iv-detail-header';
    headerEl.innerHTML = '<span class="iv-detail-quality-icon ' + qi.class + '">' + qi.icon + '</span>'
      + '<div class="iv-detail-name-block">'
      + '<h3 class="iv-detail-name">' + escapeHtml(item.name || 'Unknown') + '</h3>'
      + '<div class="iv-detail-quality-label ' + qi.class + '">' + qi.label + '</div>'
      + '</div>';
    panel.appendChild(headerEl);

    if (item.named && item.namedItemHistory) {
      var namedBanner = document.createElement('div');
      namedBanner.className = 'iv-detail-named-banner';
      namedBanner.innerHTML = '✦ Named Item ✦<div class="iv-detail-named-history">' + escapeHtml(item.namedItemHistory) + '</div>';
      panel.appendChild(namedBanner);
    }

    // Stats
    var statsEl = document.createElement('div');
    statsEl.className = 'iv-detail-stats';
    statsEl.innerHTML = '<div class="iv-detail-stat"><span class="iv-stat-label">Type</span><span class="iv-stat-val">' + escapeHtml(item.type || '—') + '</span></div>'
      + '<div class="iv-detail-stat"><span class="iv-stat-label">Weight</span><span class="iv-stat-val">' + formatWeight(item.weight) + '</span></div>'
      + '<div class="iv-detail-stat"><span class="iv-stat-label">Value</span><span class="iv-stat-val">~' + formatValue(item.value) + '</span></div>';
    if (item.materials) {
      statsEl.innerHTML += '<div class="iv-detail-stat"><span class="iv-stat-label">Materials</span><span class="iv-stat-val">' + escapeHtml(item.materials) + '</span></div>';
    }
    panel.appendChild(statsEl);

    // Condition
    var condSection = document.createElement('div');
    condSection.className = 'iv-detail-condition';
    condSection.innerHTML = '<div class="iv-detail-section-title">Condition</div>'
      + '<div class="iv-cond-wrap">'
      + '<div class="iv-detail-cond-bar"><div class="iv-detail-cond-fill ' + conditionClass(cond) + '" style="width:' + cond + '%"></div></div>'
      + '<span class="iv-cond-label ' + conditionClass(cond) + '">' + conditionLabel(cond) + ' (' + cond + '%)</span>'
      + '</div>';
    panel.appendChild(condSection);

    // Description
    if (item.description) {
      var descEl = document.createElement('div');
      descEl.className = 'iv-detail-desc';
      descEl.textContent = item.description;
      panel.appendChild(descEl);
    }

    // Special properties
    if (item.properties && item.properties.length > 0) {
      var propsEl = document.createElement('div');
      propsEl.className = 'iv-detail-section';
      propsEl.innerHTML = '<div class="iv-detail-section-title">Special Properties</div>';
      item.properties.forEach(function (prop) {
        var propEl = document.createElement('div');
        propEl.className = 'iv-prop-row';
        propEl.innerHTML = '<span class="iv-prop-bullet">◆</span><span class="iv-prop-text">' + escapeHtml(prop) + '</span>';
        propsEl.appendChild(propEl);
      });
      panel.appendChild(propsEl);
    }

    // Actions
    var actionsEl = document.createElement('div');
    actionsEl.className = 'iv-detail-actions';

    // Equip / Unequip
    if (item.slot) {
      var equipBtn = document.createElement('button');
      equipBtn.className = 'iv-action-btn iv-action-equip';
      equipBtn.textContent = isEquipped ? 'Unequip' : 'Equip';
      equipBtn.addEventListener('click', function () {
        if (typeof self.onItemAction === 'function') {
          self.onItemAction(itemId, isEquipped ? 'unequip' : 'equip');
        }
      });
      actionsEl.appendChild(equipBtn);
    }

    // Drop
    var dropBtn = document.createElement('button');
    dropBtn.className = 'iv-action-btn iv-action-drop';
    dropBtn.textContent = 'Drop';
    dropBtn.addEventListener('click', function () {
      if (typeof self.onItemAction === 'function') {
        self.onItemAction(itemId, 'drop');
      }
    });
    actionsEl.appendChild(dropBtn);

    // Examine
    var examineBtn = document.createElement('button');
    examineBtn.className = 'iv-action-btn iv-action-examine';
    examineBtn.textContent = 'Examine';
    examineBtn.addEventListener('click', function () {
      if (typeof self.onItemAction === 'function') {
        self.onItemAction(itemId, 'examine');
      }
    });
    actionsEl.appendChild(examineBtn);

    // Repair (if damaged and applicable)
    if (cond < 80 && (item.type === 'weapons' || item.type === 'armor' || item.type === 'tools')) {
      var repairBtn = document.createElement('button');
      repairBtn.className = 'iv-action-btn iv-action-repair';
      repairBtn.textContent = 'Repair';
      repairBtn.addEventListener('click', function () {
        if (typeof self.onItemAction === 'function') {
          self.onItemAction(itemId, 'repair');
        }
      });
      actionsEl.appendChild(repairBtn);
    }

    panel.appendChild(actionsEl);

    this._detailOverlay.innerHTML = '';
    this._detailOverlay.appendChild(panel);
    this._detailOverlay.classList.remove('hidden');
  };

  InventoryView.prototype._findItemById = function (itemId) {
    var inv = this._inventoryState;
    var carried = inv.carried || [];
    var equipped = inv.equipped || {};
    var stored = inv.stored || {};

    // Search carried
    for (var i = 0; i < carried.length; i++) {
      if (carried[i].id === itemId) return carried[i];
    }
    // Search equipped
    var slots = Object.keys(equipped);
    for (var j = 0; j < slots.length; j++) {
      var item = equipped[slots[j]];
      if (item && item.id === itemId) return item;
    }
    // Search stored
    var locations = Object.keys(stored);
    for (var k = 0; k < locations.length; k++) {
      var locItems = stored[locations[k]];
      for (var m = 0; m < locItems.length; m++) {
        if (locItems[m].id === itemId) return locItems[m];
      }
    }
    return null;
  };

  InventoryView.prototype._isItemEquipped = function (itemId) {
    var equipped = (this._inventoryState.equipped) || {};
    return Object.values(equipped).some(function (item) {
      return item && item.id === itemId;
    });
  };

  // ── hideItemDetail ────────────────────────────────────────────────────────────

  InventoryView.prototype.hideItemDetail = function () {
    this._selectedItemId = null;
    if (this._detailOverlay) {
      this._detailOverlay.classList.add('hidden');
      this._detailOverlay.innerHTML = '';
    }
  };

  // ── setFilter ────────────────────────────────────────────────────────────────

  InventoryView.prototype.setFilter = function (filter) {
    this._filter = filter;
    var btns = this._container && this._container.querySelectorAll('.iv-filter-btn');
    if (btns) {
      btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
    }
    this._renderBody();
  };

  // ── sortBy ────────────────────────────────────────────────────────────────────

  InventoryView.prototype.sortBy = function (field) {
    this._sortField = field;
    var btns = this._container && this._container.querySelectorAll('.iv-sort-btn');
    if (btns) {
      btns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.sort === field);
      });
    }
    this._renderBody();
  };

  // ── getEquipmentSummary ───────────────────────────────────────────────────────

  InventoryView.prototype.getEquipmentSummary = function () {
    var equipped = (this._inventoryState.equipped) || {};
    var lines = [];
    EQUIPMENT_SLOTS.forEach(function (slot) {
      var item = equipped[slot.id];
      if (item) {
        var qi = getQualityInfo(item.quality);
        var cond = conditionPercent(item.condition);
        lines.push(slot.label + ': ' + item.name + ' [' + qi.label + ', ' + conditionLabel(cond) + ']');
      }
    });
    if (lines.length === 0) return 'No items equipped.';
    return lines.join('\n');
  };

  // ── onItemAction callback (override externally) ───────────────────────────────

  InventoryView.prototype.onItemAction = null;

  // Expose to global
  global.InventoryView = InventoryView;

})(typeof window !== 'undefined' ? window : this);

// END FILE: client/js/ui/inventory-view.js
