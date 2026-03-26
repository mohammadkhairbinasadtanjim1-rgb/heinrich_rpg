// FILE: client/js/ui/map-view.js — PART 10

(function (global) {
  'use strict';

  // ── Region & Location Data ───────────────────────────────────────────────────

  var REGIONS = {
    normandy: {
      label: 'Normandy',
      description: 'The heartland of Norman power. Rich farmlands, strong castles, and restless barons.',
      startRegion: true,
      locations: ['rouen', 'caen', 'bayeux', 'cherbourg', 'mont_saint_michel']
    },
    ile_de_france: {
      label: 'Île-de-France',
      description: 'The royal demesne, seat of the Capetian kings. The center of power in France.',
      locations: ['paris', 'versailles']
    },
    brittany: {
      label: 'Brittany',
      description: 'The wild western peninsula. Celtic tongues and independent dukes.',
      locations: ['rennes', 'nantes', 'brest']
    },
    anjou: {
      label: 'Anjou',
      description: 'The Angevin heartland. Contested between kings and nobles.',
      locations: ['angers']
    },
    maine: {
      label: 'Maine',
      description: 'A buffer county between Normandy and the south.',
      locations: ['le_mans']
    },
    picardy: {
      label: 'Picardy',
      description: 'Fertile plains to the north-east, contested borderlands.',
      locations: ['amiens']
    },
    champagne: {
      label: 'Champagne',
      description: 'Famous for its trade fairs, wines, and the crossroads of Europe.',
      locations: ['troyes', 'reims']
    },
    burgundy: {
      label: 'Burgundy',
      description: 'A powerful duchy, growing rich on wine and trade.',
      locations: ['dijon']
    },
    aquitaine: {
      label: 'Aquitaine',
      description: 'The vast southern duchy. Troubadour culture, vineyards, and Gascon warriors.',
      locations: ['bordeaux']
    },
    england: {
      label: 'England',
      description: 'Across the Narrow Sea. Norman lords over English peasants.',
      locations: ['london', 'southampton']
    },
    flanders: {
      label: 'Flanders',
      description: 'The wealthiest cloth-producing region in Europe. Merchant power.',
      locations: ['bruges', 'ghent']
    }
  };

  var LOCATIONS = {
    rouen: {
      label: 'Rouen',
      region: 'normandy',
      desc: 'The capital of Normandy. A great cathedral city on the Seine. Markets, guilds, and ducal courts.',
      features: ['market', 'castle', 'cathedral', 'port'],
      faction: 'Duchy of Normandy',
      safety: 'safe',
      coords: { x: 18, y: 22 },
      travelHubs: ['caen', 'paris', 'amiens']
    },
    caen: {
      label: 'Caen',
      region: 'normandy',
      desc: 'William the Conqueror\'s city. Two great abbeys and a formidable castle.',
      features: ['castle', 'monastery', 'market'],
      faction: 'Duchy of Normandy',
      safety: 'safe',
      coords: { x: 12, y: 20 },
      travelHubs: ['rouen', 'bayeux', 'le_mans']
    },
    bayeux: {
      label: 'Bayeux',
      region: 'normandy',
      desc: 'Ancient town, famous for its magnificent tapestry and bishop\'s seat.',
      features: ['cathedral', 'market'],
      faction: 'Duchy of Normandy',
      safety: 'safe',
      coords: { x: 10, y: 19 },
      travelHubs: ['caen', 'cherbourg']
    },
    cherbourg: {
      label: 'Cherbourg',
      region: 'normandy',
      desc: 'Northern port town. Gateway to England and the Channel Islands.',
      features: ['port', 'market'],
      faction: 'Duchy of Normandy',
      safety: 'moderate',
      coords: { x: 9, y: 15 },
      travelHubs: ['bayeux', 'southampton']
    },
    mont_saint_michel: {
      label: 'Mont-Saint-Michel',
      region: 'normandy',
      desc: 'The great tidal island monastery. A place of pilgrimage and wonder.',
      features: ['monastery', 'fortress'],
      faction: 'Church',
      safety: 'safe',
      coords: { x: 8, y: 24 },
      travelHubs: ['caen', 'rennes']
    },
    paris: {
      label: 'Paris',
      region: 'ile_de_france',
      desc: 'The greatest city in France. The royal court, Notre-Dame, and teeming markets.',
      features: ['market', 'castle', 'cathedral', 'university'],
      faction: 'French Crown',
      safety: 'safe',
      coords: { x: 25, y: 28 },
      travelHubs: ['rouen', 'troyes', 'amiens', 'versailles']
    },
    versailles: {
      label: 'Versailles (Village)',
      region: 'ile_de_france',
      desc: 'A small village near Paris with a modest hunting lodge.',
      features: ['hunting'],
      faction: 'French Crown',
      safety: 'safe',
      coords: { x: 23, y: 30 },
      travelHubs: ['paris']
    },
    rennes: {
      label: 'Rennes',
      region: 'brittany',
      desc: 'The Breton capital. A city caught between French and Breton identities.',
      features: ['market', 'castle'],
      faction: 'Duchy of Brittany',
      safety: 'safe',
      coords: { x: 10, y: 32 },
      travelHubs: ['mont_saint_michel', 'nantes', 'le_mans']
    },
    nantes: {
      label: 'Nantes',
      region: 'brittany',
      desc: 'A great river port at the mouth of the Loire. Breton dukes rule here.',
      features: ['port', 'market', 'castle'],
      faction: 'Duchy of Brittany',
      safety: 'safe',
      coords: { x: 11, y: 38 },
      travelHubs: ['rennes', 'angers']
    },
    brest: {
      label: 'Brest',
      region: 'brittany',
      desc: 'The western extremity of France. A wild harbour at the edge of the known world.',
      features: ['port'],
      faction: 'Duchy of Brittany',
      safety: 'moderate',
      coords: { x: 3, y: 28 },
      travelHubs: ['rennes']
    },
    angers: {
      label: 'Angers',
      region: 'anjou',
      desc: 'The dark castle on the Maine river. Centre of Angevin power.',
      features: ['castle', 'market'],
      faction: 'County of Anjou',
      safety: 'safe',
      coords: { x: 15, y: 40 },
      travelHubs: ['nantes', 'le_mans', 'bordeaux']
    },
    le_mans: {
      label: 'Le Mans',
      region: 'maine',
      desc: 'A cathedral city on the Sarthe. Wool trade and pilgrimage routes.',
      features: ['cathedral', 'market'],
      faction: 'County of Maine',
      safety: 'safe',
      coords: { x: 17, y: 34 },
      travelHubs: ['caen', 'rennes', 'angers', 'paris']
    },
    amiens: {
      label: 'Amiens',
      region: 'picardy',
      desc: 'A prosperous cloth town. The cathedral is the pride of the north.',
      features: ['cathedral', 'market'],
      faction: 'French Crown',
      safety: 'safe',
      coords: { x: 24, y: 18 },
      travelHubs: ['rouen', 'paris', 'bruges']
    },
    troyes: {
      label: 'Troyes',
      region: 'champagne',
      desc: 'Home of the great Champagne fairs. Merchants come from all of Europe.',
      features: ['market', 'cathedral'],
      faction: 'County of Champagne',
      safety: 'safe',
      coords: { x: 30, y: 30 },
      travelHubs: ['paris', 'reims', 'dijon']
    },
    reims: {
      label: 'Reims',
      region: 'champagne',
      desc: 'Where kings of France are crowned. The great coronation cathedral.',
      features: ['cathedral', 'market'],
      faction: 'French Crown',
      safety: 'safe',
      coords: { x: 30, y: 22 },
      travelHubs: ['paris', 'troyes', 'amiens']
    },
    dijon: {
      label: 'Dijon',
      region: 'burgundy',
      desc: 'The wealthy Burgundian capital. Powerful dukes and magnificent courts.',
      features: ['castle', 'market', 'monastery'],
      faction: 'Duchy of Burgundy',
      safety: 'safe',
      coords: { x: 35, y: 40 },
      travelHubs: ['troyes', 'bordeaux']
    },
    bordeaux: {
      label: 'Bordeaux',
      region: 'aquitaine',
      desc: 'The great wine city of the south. English and French fortunes collide here.',
      features: ['port', 'market', 'castle'],
      faction: 'Duchy of Aquitaine',
      safety: 'moderate',
      coords: { x: 18, y: 55 },
      travelHubs: ['angers', 'dijon']
    },
    london: {
      label: 'London',
      region: 'england',
      desc: 'The English capital. The Tower, the markets, and the mixed Norman-English court.',
      features: ['castle', 'market', 'port', 'cathedral'],
      faction: 'English Crown',
      safety: 'safe',
      coords: { x: 20, y: 10 },
      travelHubs: ['southampton', 'bruges']
    },
    southampton: {
      label: 'Southampton',
      region: 'england',
      desc: 'The main port of departure for Normandy. Ships cross daily when winds allow.',
      features: ['port', 'market'],
      faction: 'English Crown',
      safety: 'safe',
      coords: { x: 18, y: 13 },
      travelHubs: ['london', 'cherbourg']
    },
    bruges: {
      label: 'Bruges',
      region: 'flanders',
      desc: 'The Venice of the North. Canals, merchants, and the finest cloth in Europe.',
      features: ['port', 'market', 'cathedral'],
      faction: 'County of Flanders',
      safety: 'safe',
      coords: { x: 33, y: 14 },
      travelHubs: ['amiens', 'ghent', 'london']
    },
    ghent: {
      label: 'Ghent',
      region: 'flanders',
      desc: 'A powerful merchant city. Guilds and wealth make it nearly independent.',
      features: ['market', 'castle'],
      faction: 'County of Flanders',
      safety: 'safe',
      coords: { x: 35, y: 16 },
      travelHubs: ['bruges', 'amiens']
    }
  };

  // Sea routes (pairs)
  var SEA_ROUTES = [
    ['cherbourg', 'southampton'],
    ['brest', 'london'],
    ['bruges', 'london'],
    ['bordeaux', 'london']
  ];

  var FEATURE_ICONS = {
    market: '🏪',
    castle: '🏰',
    cathedral: '⛪',
    port: '⚓',
    monastery: '✝',
    university: '📖',
    hunting: '🦌',
    fortress: '🗼'
  };

  var SAFETY_LABELS = { safe: 'Peaceful', moderate: 'Some Danger', dangerous: 'Dangerous' };
  var SAFETY_CLASS = { safe: 'safety-safe', moderate: 'safety-moderate', dangerous: 'safety-dangerous' };

  var STATUS_SYMBOLS = {
    current: '◉',
    visited: '●',
    known: '○',
    rumored: '◌',
    unknown: '???'
  };

  // Travel speeds in km/day
  var TRAVEL_SPEED = { walking: 30, horse: 60, ship: 150 };

  // Rough distances (km) between connected locations
  var DISTANCES = {
    'rouen-caen': 120, 'rouen-paris': 135, 'rouen-amiens': 115,
    'caen-bayeux': 30, 'caen-le_mans': 140, 'caen-cherbourg': 115,
    'bayeux-cherbourg': 90,
    'mont_saint_michel-caen': 100, 'mont_saint_michel-rennes': 55,
    'paris-troyes': 170, 'paris-amiens': 140, 'paris-versailles': 20, 'paris-le_mans': 200,
    'troyes-reims': 120, 'troyes-dijon': 155,
    'reims-amiens': 130, 'reims-paris': 145,
    'amiens-bruges': 120,
    'rennes-nantes': 110, 'rennes-le_mans': 160, 'rennes-brest': 240,
    'nantes-angers': 90,
    'angers-le_mans': 90, 'angers-bordeaux': 320,
    'dijon-bordeaux': 530,
    'bruges-ghent': 50, 'bruges-london': 320,
    'ghent-amiens': 130,
    'london-southampton': 130,
    'cherbourg-southampton': 120,
    'bordeaux-london': 700,
    'brest-london': 450,
    'le_mans-paris': 200
  };

  // ── Utility ──────────────────────────────────────────────────────────────────

  function getDistance(fromId, toId) {
    var key1 = fromId + '-' + toId;
    var key2 = toId + '-' + fromId;
    return DISTANCES[key1] || DISTANCES[key2] || null;
  }

  function isSeaRoute(fromId, toId) {
    return SEA_ROUTES.some(function (pair) {
      return (pair[0] === fromId && pair[1] === toId) ||
             (pair[1] === fromId && pair[0] === toId);
    });
  }

  function travelTime(fromId, toId, mode) {
    var dist = getDistance(fromId, toId);
    if (dist === null) return null;
    var speed = TRAVEL_SPEED[mode || 'walking'];
    return Math.ceil(dist / speed);
  }

  function formatTravelTime(days) {
    if (days === null) return 'Unknown';
    if (days < 1) return 'Less than a day';
    if (days === 1) return '1 day';
    return days + ' days';
  }

  // ── MapView ───────────────────────────────────────────────────────────────────

  function MapView() {
    this._containerId = null;
    this._container = null;
    this._mapState = {};        // locationId → 'current'|'visited'|'known'|'rumored'|'unknown'
    this._currentLocation = null;
    this._selectedLocation = null;
    this._filter = 'all';
    this._activeRoute = null;   // { from, to, travelInfo }
    this._detailOverlay = null;
  }

  // ── init ─────────────────────────────────────────────────────────────────────

  MapView.prototype.init = function (containerId) {
    this._containerId = containerId;
    this._container = document.getElementById(containerId);
    if (!this._container) {
      console.error('[MapView] Container not found:', containerId);
      return;
    }
    this._container.classList.add('map-view');
    this._buildShell();
  };

  MapView.prototype._buildShell = function () {
    var self = this;
    this._container.innerHTML = '';

    // Filter bar
    var filterBar = document.createElement('div');
    filterBar.className = 'mv-filter-bar';
    var filters = [
      { key: 'all', label: 'All' },
      { key: 'visited', label: 'Visited' },
      { key: 'known', label: 'Known' },
      { key: 'rumors', label: 'Rumors' }
    ];
    filters.forEach(function (f) {
      var btn = document.createElement('button');
      btn.className = 'mv-filter-btn' + (f.key === self._filter ? ' active' : '');
      btn.dataset.filter = f.key;
      btn.textContent = f.label;
      btn.addEventListener('click', function () { self.setFilter(f.key); });
      filterBar.appendChild(btn);
    });
    this._container.appendChild(filterBar);

    // Legend
    var legend = document.createElement('div');
    legend.className = 'mv-legend';
    legend.innerHTML = Object.keys(STATUS_SYMBOLS).map(function (key) {
      return '<span class="mv-legend-item mv-status-' + key + '">'
        + STATUS_SYMBOLS[key] + ' ' + key.charAt(0).toUpperCase() + key.slice(1)
        + '</span>';
    }).join('');
    this._container.appendChild(legend);

    // Map body
    var body = document.createElement('div');
    body.className = 'mv-body';
    body.id = this._containerId + '-body';
    this._container.appendChild(body);

    // Detail overlay
    var overlay = document.createElement('div');
    overlay.className = 'mv-detail-overlay hidden';
    overlay.id = this._containerId + '-detail';
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) { self._closeDetail(); }
    });
    this._container.appendChild(overlay);
    this._detailOverlay = overlay;
  };

  // ── render ────────────────────────────────────────────────────────────────────

  MapView.prototype.render = function (mapState, currentLocation) {
    this._mapState = mapState || {};
    this._currentLocation = currentLocation || null;
    if (!this._container) return;
    this._renderMap();
  };

  MapView.prototype._renderMap = function () {
    var body = document.getElementById(this._containerId + '-body');
    if (!body) return;
    body.innerHTML = '';

    var self = this;

    // Current location banner
    if (this._currentLocation && LOCATIONS[this._currentLocation]) {
      var banner = document.createElement('div');
      banner.className = 'mv-current-banner';
      var loc = LOCATIONS[this._currentLocation];
      banner.innerHTML = '<span class="mv-current-symbol">◉</span>'
        + ' You are in <strong>' + loc.label + '</strong>'
        + ' <span class="mv-region-badge">' + (REGIONS[loc.region] ? REGIONS[loc.region].label : '') + '</span>';
      body.appendChild(banner);
    }

    // Route info if active
    if (this._activeRoute) {
      var routeInfo = document.createElement('div');
      routeInfo.className = 'mv-route-info';
      var fromLoc = LOCATIONS[this._activeRoute.from];
      var toLoc = LOCATIONS[this._activeRoute.to];
      var dist = getDistance(this._activeRoute.from, this._activeRoute.to);
      var sea = isSeaRoute(this._activeRoute.from, this._activeRoute.to);
      routeInfo.innerHTML = '<span class="mv-route-label">Route: </span>'
        + '<strong>' + (fromLoc ? fromLoc.label : this._activeRoute.from) + '</strong>'
        + ' → '
        + '<strong>' + (toLoc ? toLoc.label : this._activeRoute.to) + '</strong>'
        + (dist ? ' — ' + dist + 'km' : '')
        + (sea ? ' <span class="mv-sea-badge">⚓ Sea Route</span>' : '')
        + ' <button class="mv-route-clear">✕ Clear</button>';
      routeInfo.querySelector('.mv-route-clear').addEventListener('click', function () {
        self._activeRoute = null;
        self._renderMap();
      });
      body.appendChild(routeInfo);
    }

    // Region list
    Object.keys(REGIONS).forEach(function (regionKey) {
      var region = REGIONS[regionKey];
      var regionLocs = region.locations || [];

      // Filter locations
      var visibleLocs = regionLocs.filter(function (locId) {
        return self._shouldShowLocation(locId);
      });

      if (visibleLocs.length === 0 && self._filter !== 'all') return;

      var regionEl = document.createElement('div');
      regionEl.className = 'mv-region';
      regionEl.dataset.region = regionKey;

      var regionHeader = document.createElement('div');
      regionHeader.className = 'mv-region-header';
      regionHeader.innerHTML = '<span class="mv-region-name">' + region.label + '</span>'
        + '<span class="mv-region-desc">' + region.description + '</span>';
      regionEl.appendChild(regionHeader);

      var locList = document.createElement('div');
      locList.className = 'mv-loc-list';

      if (visibleLocs.length === 0) {
        var unknownNote = document.createElement('div');
        unknownNote.className = 'mv-loc-unknown-region';
        unknownNote.textContent = '??? Region largely unexplored';
        locList.appendChild(unknownNote);
      } else {
        visibleLocs.forEach(function (locId) {
          locList.appendChild(self._buildLocationEntry(locId));
        });
      }

      regionEl.appendChild(locList);
      body.appendChild(regionEl);
    });
  };

  MapView.prototype._shouldShowLocation = function (locId) {
    var status = this._getLocationStatus(locId);
    switch (this._filter) {
      case 'visited': return status === 'current' || status === 'visited';
      case 'known': return status !== 'unknown';
      case 'rumors': return status === 'rumored';
      case 'all': default: return true;
    }
  };

  MapView.prototype._getLocationStatus = function (locId) {
    if (locId === this._currentLocation) return 'current';
    return this._mapState[locId] || 'unknown';
  };

  MapView.prototype._buildLocationEntry = function (locId) {
    var self = this;
    var loc = LOCATIONS[locId];
    if (!loc) return document.createElement('div');

    var status = this._getLocationStatus(locId);
    var symbol = STATUS_SYMBOLS[status] || STATUS_SYMBOLS.unknown;
    var isHighlighted = this._activeRoute &&
      (this._activeRoute.from === locId || this._activeRoute.to === locId);
    var isSelected = this._selectedLocation === locId;

    var entry = document.createElement('div');
    entry.className = 'mv-loc-entry mv-status-' + status
      + (isHighlighted ? ' mv-route-highlight' : '')
      + (isSelected ? ' mv-selected' : '');
    entry.dataset.locId = locId;

    var line1 = document.createElement('div');
    line1.className = 'mv-loc-line1';

    var symbolEl = document.createElement('span');
    symbolEl.className = 'mv-loc-symbol mv-status-' + status;
    symbolEl.textContent = symbol;

    var nameEl = document.createElement('span');
    nameEl.className = 'mv-loc-name';
    nameEl.textContent = status === 'unknown' ? '???' : loc.label;

    line1.appendChild(symbolEl);
    line1.appendChild(nameEl);

    // Features icons
    if (status !== 'unknown' && loc.features) {
      var featuresEl = document.createElement('span');
      featuresEl.className = 'mv-loc-features';
      loc.features.forEach(function (feat) {
        if (FEATURE_ICONS[feat]) {
          var fi = document.createElement('span');
          fi.className = 'mv-feature-icon';
          fi.title = feat.charAt(0).toUpperCase() + feat.slice(1);
          fi.textContent = FEATURE_ICONS[feat];
          featuresEl.appendChild(fi);
        }
      });
      line1.appendChild(featuresEl);
    }

    entry.appendChild(line1);

    // Line 2: travel time and safety
    if (status !== 'unknown' && this._currentLocation && locId !== this._currentLocation) {
      var line2 = document.createElement('div');
      line2.className = 'mv-loc-line2';

      var tWalk = travelTime(this._currentLocation, locId, 'walking');
      var tHorse = travelTime(this._currentLocation, locId, 'horse');
      var sea = isSeaRoute(this._currentLocation, locId);

      if (tWalk !== null) {
        line2.innerHTML = '<span class="mv-travel-time">🚶 ' + formatTravelTime(tWalk)
          + (tHorse ? ' | 🐴 ' + formatTravelTime(tHorse) : '')
          + (sea ? ' | ⚓ ' + formatTravelTime(travelTime(this._currentLocation, locId, 'ship')) : '')
          + '</span>';
      } else if (sea) {
        line2.innerHTML = '<span class="mv-travel-time">⚓ Sea route available</span>';
      } else {
        line2.innerHTML = '<span class="mv-travel-time">Direct route unknown</span>';
      }

      var safetyEl = document.createElement('span');
      safetyEl.className = 'mv-safety ' + (SAFETY_CLASS[loc.safety] || '');
      safetyEl.textContent = SAFETY_LABELS[loc.safety] || loc.safety;
      line2.appendChild(safetyEl);

      entry.appendChild(line2);
    }

    // Click handler
    entry.addEventListener('click', function () {
      self.selectLocation(locId);
    });

    return entry;
  };

  // ── update ────────────────────────────────────────────────────────────────────

  MapView.prototype.update = function (mapState, currentLocation) {
    this._mapState = mapState || this._mapState;
    this._currentLocation = currentLocation || this._currentLocation;
    if (!this._container) return;
    this._renderMap();
  };

  // ── setCurrentLocation ───────────────────────────────────────────────────────

  MapView.prototype.setCurrentLocation = function (locationId) {
    this._currentLocation = locationId;
    if (this._mapState[locationId] !== 'visited' && this._mapState[locationId] !== 'current') {
      this._mapState[locationId] = 'visited';
    }
    this._renderMap();
  };

  // ── discoverLocation ─────────────────────────────────────────────────────────

  MapView.prototype.discoverLocation = function (locationId) {
    if (!this._mapState[locationId] || this._mapState[locationId] === 'unknown') {
      this._mapState[locationId] = 'known';
    }
    this._renderMap();
  };

  // ── selectLocation ────────────────────────────────────────────────────────────

  MapView.prototype.selectLocation = function (locationId) {
    this._selectedLocation = locationId;

    // Update selected class
    var body = document.getElementById(this._containerId + '-body');
    if (body) {
      body.querySelectorAll('.mv-loc-entry').forEach(function (el) {
        el.classList.toggle('mv-selected', el.dataset.locId === locationId);
      });
    }

    this._showLocationDetail(locationId);
  };

  MapView.prototype._showLocationDetail = function (locationId) {
    var self = this;
    var loc = LOCATIONS[locationId];
    if (!this._detailOverlay) return;

    var status = this._getLocationStatus(locationId);

    var panel = document.createElement('div');
    panel.className = 'mv-detail-panel';

    var closeBtn = document.createElement('button');
    closeBtn.className = 'mv-detail-close';
    closeBtn.textContent = '✕';
    closeBtn.addEventListener('click', function () { self._closeDetail(); });
    panel.appendChild(closeBtn);

    if (!loc || status === 'unknown') {
      panel.innerHTML += '<div class="mv-detail-unknown"><h3>??? Unknown Location</h3>'
        + '<p>You have no information about this place.</p></div>';
    } else {
      // Header
      var header = document.createElement('div');
      header.className = 'mv-detail-header';
      header.innerHTML = '<h3 class="mv-detail-name">' + loc.label + '</h3>'
        + '<span class="mv-detail-region">' + (REGIONS[loc.region] ? REGIONS[loc.region].label : '') + '</span>';
      panel.appendChild(header);

      // Status badges
      var badges = document.createElement('div');
      badges.className = 'mv-detail-badges';
      badges.innerHTML = '<span class="mv-badge mv-status-' + status + '">'
        + STATUS_SYMBOLS[status] + ' ' + status.charAt(0).toUpperCase() + status.slice(1)
        + '</span>'
        + '<span class="mv-badge ' + (SAFETY_CLASS[loc.safety] || '') + '">'
        + (SAFETY_LABELS[loc.safety] || loc.safety) + '</span>';
      panel.appendChild(badges);

      // Description
      var descEl = document.createElement('div');
      descEl.className = 'mv-detail-desc';
      descEl.textContent = loc.desc;
      panel.appendChild(descEl);

      // Features
      if (loc.features && loc.features.length > 0) {
        var featSection = document.createElement('div');
        featSection.className = 'mv-detail-features';
        featSection.innerHTML = '<div class="mv-detail-section-title">Notable Features</div>';
        loc.features.forEach(function (feat) {
          var fi = document.createElement('span');
          fi.className = 'mv-detail-feature-tag';
          fi.textContent = (FEATURE_ICONS[feat] || '') + ' ' + feat.charAt(0).toUpperCase() + feat.slice(1);
          featSection.appendChild(fi);
        });
        panel.appendChild(featSection);
      }

      // Faction
      var factionEl = document.createElement('div');
      factionEl.className = 'mv-detail-faction';
      factionEl.innerHTML = '<span class="mv-detail-section-title">Controlled by: </span>'
        + '<span class="mv-faction-name">' + (loc.faction || 'Unknown') + '</span>';
      panel.appendChild(factionEl);

      // Travel info
      if (this._currentLocation && locationId !== this._currentLocation) {
        var travelSection = document.createElement('div');
        travelSection.className = 'mv-detail-travel';
        var tWalk = travelTime(this._currentLocation, locationId, 'walking');
        var tHorse = travelTime(this._currentLocation, locationId, 'horse');
        var tShip = isSeaRoute(this._currentLocation, locationId)
          ? travelTime(this._currentLocation, locationId, 'ship') : null;
        var dist = getDistance(this._currentLocation, locationId);

        travelSection.innerHTML = '<div class="mv-detail-section-title">Travel from current location</div>'
          + (dist ? '<div class="mv-detail-distance">Distance: ~' + dist + 'km</div>' : '')
          + (tWalk !== null ? '<div>🚶 On foot: ' + formatTravelTime(tWalk) + '</div>' : '')
          + (tHorse !== null ? '<div>🐴 On horse: ' + formatTravelTime(tHorse) + '</div>' : '')
          + (tShip !== null ? '<div>⚓ By ship: ' + formatTravelTime(tShip) + '</div>' : '');

        // Show route button
        var routeBtn = document.createElement('button');
        routeBtn.className = 'mv-detail-route-btn';
        routeBtn.textContent = 'Show Route';
        routeBtn.addEventListener('click', function () {
          self.showRoute(self._currentLocation, locationId, {});
          self._closeDetail();
        });
        travelSection.appendChild(routeBtn);
        panel.appendChild(travelSection);
      }

      // Travel connections
      if (loc.travelHubs && loc.travelHubs.length > 0) {
        var connSection = document.createElement('div');
        connSection.className = 'mv-detail-connections';
        connSection.innerHTML = '<div class="mv-detail-section-title">Connected Locations</div>';
        loc.travelHubs.forEach(function (hubId) {
          var hub = LOCATIONS[hubId];
          if (!hub) return;
          var hubStatus = self._getLocationStatus(hubId);
          var connEl = document.createElement('span');
          connEl.className = 'mv-detail-connection mv-status-' + hubStatus;
          connEl.textContent = STATUS_SYMBOLS[hubStatus] + ' ' + hub.label;
          connEl.style.cursor = 'pointer';
          connEl.addEventListener('click', function () {
            self.selectLocation(hubId);
          });
          connSection.appendChild(connEl);
        });
        panel.appendChild(connSection);
      }
    }

    this._detailOverlay.innerHTML = '';
    this._detailOverlay.appendChild(panel);
    this._detailOverlay.classList.remove('hidden');
  };

  MapView.prototype._closeDetail = function () {
    this._selectedLocation = null;
    if (this._detailOverlay) {
      this._detailOverlay.classList.add('hidden');
      this._detailOverlay.innerHTML = '';
    }
    // Remove selected class
    var body = document.getElementById(this._containerId + '-body');
    if (body) {
      body.querySelectorAll('.mv-loc-entry.mv-selected').forEach(function (el) {
        el.classList.remove('mv-selected');
      });
    }
  };

  // ── getSelectedLocation ──────────────────────────────────────────────────────

  MapView.prototype.getSelectedLocation = function () {
    return this._selectedLocation;
  };

  // ── showRoute ────────────────────────────────────────────────────────────────

  MapView.prototype.showRoute = function (fromId, toId, travelInfo) {
    this._activeRoute = { from: fromId, to: toId, travelInfo: travelInfo || {} };
    this._renderMap();
  };

  // ── setFilter ────────────────────────────────────────────────────────────────

  MapView.prototype.setFilter = function (filter) {
    this._filter = filter;

    // Update filter buttons
    var filterBtns = this._container && this._container.querySelectorAll('.mv-filter-btn');
    if (filterBtns) {
      filterBtns.forEach(function (btn) {
        btn.classList.toggle('active', btn.dataset.filter === filter);
      });
    }

    this._renderMap();
  };

  // Expose to global
  global.MapView = MapView;

})(typeof window !== 'undefined' ? window : this);

// END FILE: client/js/ui/map-view.js
