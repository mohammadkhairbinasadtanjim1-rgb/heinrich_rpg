// FILE: client/js/ui/layout.js — PART 10
// Layout controller for the three-panel Heinrich RPG interface.
// IIFE pattern — exposes global `Layout`.

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────
  var BREAKPOINT_DESKTOP = 1200;
  var BREAKPOINT_TABLET  = 768;
  var STORAGE_KEY        = 'heinrich_layout_prefs';
  var PANEL_LEFT_ID      = 'panel-left';
  var PANEL_RIGHT_ID     = 'panel-right';
  var PANEL_CENTER_ID    = 'panel-center';
  var INPUT_AREA_ID      = 'input-area';
  var HEADER_ID          = 'header';

  // ─── State ────────────────────────────────────────────────────────────────
  var _currentMode          = 'desktop';
  var _panelVisibility      = { left: true, right: true };
  var _activeTab            = {};           // panelId → tabName
  var _resizeObserver       = null;
  var _panelCallbacks       = [];
  var _typingIndicatorEl    = null;
  var _loadingOverlayEl     = null;
  var _initialized          = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function _el(id) {
    return document.getElementById(id);
  }

  function _qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function _applyClass(el, cls, add) {
    if (!el) return;
    if (add) { el.classList.add(cls); }
    else      { el.classList.remove(cls); }
  }

  function _notify(event, data) {
    _panelCallbacks.forEach(function (cb) {
      if (typeof cb[event] === 'function') {
        try { cb[event](data); } catch (e) { /* swallow */ }
      }
    });
  }

  // ─── Loading overlay ──────────────────────────────────────────────────────
  function _createLoadingOverlay() {
    if (_loadingOverlayEl) return;
    var el = document.createElement('div');
    el.id = 'layout-loading-overlay';
    el.setAttribute('aria-live', 'assertive');
    el.setAttribute('aria-label', 'Loading');
    el.innerHTML =
      '<div class="loading-inner">' +
        '<div class="loading-spinner"></div>' +
        '<p class="loading-message">The fates are weaving…</p>' +
      '</div>';
    el.style.cssText =
      'display:none;position:fixed;inset:0;z-index:9000;' +
      'background:rgba(10,6,2,0.82);' +
      'align-items:center;justify-content:center;';
    document.body.appendChild(el);
    _loadingOverlayEl = el;
  }

  // ─── Typing indicator ─────────────────────────────────────────────────────
  function _createTypingIndicator() {
    if (_typingIndicatorEl) return;
    var el = document.createElement('div');
    el.id = 'llm-typing-indicator';
    el.setAttribute('aria-label', 'Narrator is composing');
    el.innerHTML =
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span>' +
      '<span class="typing-dot"></span>';
    el.style.cssText =
      'display:none;padding:8px 16px;font-size:1.4em;letter-spacing:2px;' +
      'color:#c4a35a;opacity:0.85;';
    _typingIndicatorEl = el;

    // Inject into prose container if available
    var proseContainer = _el('prose-container') || _el(PANEL_CENTER_ID);
    if (proseContainer) {
      proseContainer.appendChild(el);
    }
  }

  // ─── Panel helpers ────────────────────────────────────────────────────────
  function _setPanelVisible(panelId, visible) {
    var panel = _el(panelId);
    if (!panel) return;
    if (visible) {
      panel.classList.remove('panel-hidden');
      panel.setAttribute('aria-hidden', 'false');
    } else {
      panel.classList.add('panel-hidden');
      panel.setAttribute('aria-hidden', 'true');
    }
    if (panelId === PANEL_LEFT_ID)  { _panelVisibility.left  = visible; }
    if (panelId === PANEL_RIGHT_ID) { _panelVisibility.right = visible; }

    _updateCenterFlex();
    _notify('onPanelToggle', { panelId: panelId, visible: visible });
  }

  function _updateCenterFlex() {
    var center = _el(PANEL_CENTER_ID);
    if (!center) return;
    var mode = Layout.getLayoutMode();
    if (mode === 'mobile') {
      center.style.flex = '1';
      return;
    }
    // Center flexes to fill whatever left/right leave
    center.style.flex = '1';
  }

  // ─── Mobile bottom tabs ───────────────────────────────────────────────────
  function _createMobileTabBar() {
    if (_el('mobile-tab-bar')) return;
    var bar = document.createElement('div');
    bar.id = 'mobile-tab-bar';
    bar.setAttribute('role', 'tablist');
    bar.innerHTML =
      '<button role="tab" data-panel="' + PANEL_LEFT_ID  + '" aria-label="Stats">📊 Stats</button>' +
      '<button role="tab" data-panel="prose"                  aria-label="Story">📜 Story</button>' +
      '<button role="tab" data-panel="' + PANEL_RIGHT_ID + '" aria-label="Info">🗂 Info</button>';
    document.body.appendChild(bar);

    bar.addEventListener('click', function (e) {
      var btn = e.target.closest('button[data-panel]');
      if (!btn) return;
      var targetPanel = btn.dataset.panel;
      if (targetPanel === 'prose') {
        _setPanelVisible(PANEL_LEFT_ID,  false);
        _setPanelVisible(PANEL_RIGHT_ID, false);
        var center = _el(PANEL_CENTER_ID);
        if (center) { center.classList.remove('panel-hidden'); }
      } else {
        var center2 = _el(PANEL_CENTER_ID);
        if (center2) { center2.classList.add('panel-hidden'); }
        _setPanelVisible(PANEL_LEFT_ID,  targetPanel === PANEL_LEFT_ID);
        _setPanelVisible(PANEL_RIGHT_ID, targetPanel === PANEL_RIGHT_ID);
      }
      // Update active state
      bar.querySelectorAll('button').forEach(function (b) {
        b.classList.toggle('active', b === btn);
      });
    });
  }

  function _removeMobileTabBar() {
    var bar = _el('mobile-tab-bar');
    if (bar) { bar.parentNode.removeChild(bar); }
  }

  // ─── Resize handling ──────────────────────────────────────────────────────
  function _applyLayoutMode(mode) {
    var body = document.body;
    body.classList.remove('layout-desktop', 'layout-tablet', 'layout-mobile');
    body.classList.add('layout-' + mode);

    var prev = _currentMode;
    _currentMode = mode;

    if (mode === 'desktop') {
      _removeMobileTabBar();
      // Restore preferences
      var prefs = Layout.loadPreferences();
      _setPanelVisible(PANEL_LEFT_ID,  prefs.left  !== false);
      _setPanelVisible(PANEL_RIGHT_ID, prefs.right !== false);
      var center = _el(PANEL_CENTER_ID);
      if (center) { center.classList.remove('panel-hidden'); }
    } else if (mode === 'tablet') {
      _removeMobileTabBar();
      var center2 = _el(PANEL_CENTER_ID);
      if (center2) { center2.classList.remove('panel-hidden'); }
      // Right panel collapses by default on tablet
      _setPanelVisible(PANEL_RIGHT_ID, false);
      _setPanelVisible(PANEL_LEFT_ID,  true);
    } else if (mode === 'mobile') {
      _createMobileTabBar();
      // Show only center by default
      _setPanelVisible(PANEL_LEFT_ID,  false);
      _setPanelVisible(PANEL_RIGHT_ID, false);
      var center3 = _el(PANEL_CENTER_ID);
      if (center3) { center3.classList.remove('panel-hidden'); }
    }

    if (prev !== mode) {
      _notify('onLayoutModeChange', { mode: mode, previous: prev });
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  var Layout = {

    init: function () {
      if (_initialized) return;
      _initialized = true;

      // Ensure header role
      var header = _el(HEADER_ID);
      if (header) { header.setAttribute('role', 'banner'); }

      // Create utility elements
      _createLoadingOverlay();
      _createTypingIndicator();

      // Load saved preferences
      var prefs = Layout.loadPreferences();
      if (prefs.left  !== undefined) { _panelVisibility.left  = prefs.left;  }
      if (prefs.right !== undefined) { _panelVisibility.right = prefs.right; }

      // Set initial mode
      var mode = Layout.getLayoutMode();
      _applyLayoutMode(mode);

      // Set up resize observer
      if (typeof ResizeObserver !== 'undefined') {
        _resizeObserver = new ResizeObserver(function () {
          Layout.onResize();
        });
        _resizeObserver.observe(document.body);
      } else {
        window.addEventListener('resize', function () {
          Layout.onResize();
        });
      }

      // Keyboard shortcuts for panel toggles
      document.addEventListener('keydown', function (e) {
        if (e.altKey && e.key === 'ArrowLeft')  { Layout.togglePanel(PANEL_LEFT_ID);  }
        if (e.altKey && e.key === 'ArrowRight') { Layout.togglePanel(PANEL_RIGHT_ID); }
      });

      _notify('onInit', { mode: _currentMode });
    },

    // ── Panel visibility ────────────────────────────────────────────────────
    showPanel: function (panelId) {
      _setPanelVisible(panelId, true);
      Layout.savePreferences();
    },

    hidePanel: function (panelId) {
      _setPanelVisible(panelId, false);
      Layout.savePreferences();
    },

    togglePanel: function (panelId) {
      var isHidden = _el(panelId) && _el(panelId).classList.contains('panel-hidden');
      if (isHidden) { Layout.showPanel(panelId); }
      else          { Layout.hidePanel(panelId); }
    },

    // ── Tab management ──────────────────────────────────────────────────────
    setPanelTab: function (panelId, tabName) {
      _activeTab[panelId] = tabName;
      var panel = _el(panelId);
      if (!panel) return;

      // Deactivate all tabs in panel
      panel.querySelectorAll('[data-tab]').forEach(function (btn) {
        var isActive = btn.dataset.tab === tabName;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      });

      // Show/hide tab panes
      panel.querySelectorAll('[data-tab-pane]').forEach(function (pane) {
        var isActive = pane.dataset.tabPane === tabName;
        pane.classList.toggle('tab-pane-active', isActive);
        pane.setAttribute('aria-hidden', isActive ? 'false' : 'true');
      });

      _notify('onTabChange', { panelId: panelId, tab: tabName });
    },

    // ── Layout mode ─────────────────────────────────────────────────────────
    setLayoutMode: function (mode) {
      if (!['desktop', 'tablet', 'mobile'].includes(mode)) {
        console.warn('[Layout] Unknown mode:', mode);
        return;
      }
      _applyLayoutMode(mode);
    },

    getLayoutMode: function () {
      var w = window.innerWidth;
      if (w >= BREAKPOINT_DESKTOP) { return 'desktop'; }
      if (w >= BREAKPOINT_TABLET)  { return 'tablet';  }
      return 'mobile';
    },

    // ── Prose scroll ────────────────────────────────────────────────────────
    scrollProseToBottom: function () {
      var el = _el('prose-container') || _el(PANEL_CENTER_ID);
      if (!el) return;
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
    },

    scrollProseToTop: function () {
      var el = _el('prose-container') || _el(PANEL_CENTER_ID);
      if (!el) return;
      el.scrollTo({ top: 0, behavior: 'smooth' });
    },

    // ── Section highlight ────────────────────────────────────────────────────
    highlightSection: function (sectionId, duration) {
      var el = _el(sectionId);
      if (!el) return;
      var ms = duration || 1800;
      el.classList.add('section-highlight');
      setTimeout(function () {
        el.classList.remove('section-highlight');
      }, ms);
    },

    // ── Loading overlay ──────────────────────────────────────────────────────
    showLoadingOverlay: function (message) {
      _createLoadingOverlay();
      var msgEl = _loadingOverlayEl.querySelector('.loading-message');
      if (msgEl) { msgEl.textContent = message || 'The fates are weaving…'; }
      _loadingOverlayEl.style.display = 'flex';
      document.body.setAttribute('aria-busy', 'true');
    },

    hideLoadingOverlay: function () {
      if (!_loadingOverlayEl) return;
      _loadingOverlayEl.style.display = 'none';
      document.body.removeAttribute('aria-busy');
    },

    // ── LLM typing indicator ─────────────────────────────────────────────────
    showLLMTypingIndicator: function () {
      _createTypingIndicator();
      if (_typingIndicatorEl) {
        _typingIndicatorEl.style.display = 'flex';
        Layout.scrollProseToBottom();
      }
    },

    hideLLMTypingIndicator: function () {
      if (_typingIndicatorEl) {
        _typingIndicatorEl.style.display = 'none';
      }
    },

    // ── Header / session display ─────────────────────────────────────────────
    setSessionDisplay: function (key) {
      var el = _qs('#header .session-key') || _el('session-key');
      if (el) { el.textContent = key ? ('Session: ' + key) : ''; }
    },

    setTitle: function (title) {
      document.title = title || 'The Fate of Heinrich';
      var el = _qs('#header .header-title') || _el('header-title');
      if (el) { el.textContent = title || 'The Fate of Heinrich'; }
    },

    // ── Resize handler ───────────────────────────────────────────────────────
    onResize: function () {
      var newMode = Layout.getLayoutMode();
      if (newMode !== _currentMode) {
        _applyLayoutMode(newMode);
      }
    },

    // ── Preferences ──────────────────────────────────────────────────────────
    savePreferences: function () {
      try {
        var prefs = {
          left:    _panelVisibility.left,
          right:   _panelVisibility.right,
          activeTab: _activeTab
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
      } catch (e) { /* localStorage unavailable */ }
    },

    loadPreferences: function () {
      try {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw) { return JSON.parse(raw); }
      } catch (e) { /* ignore */ }
      return { left: true, right: true, activeTab: {} };
    },

    // ── Callback registration ─────────────────────────────────────────────────
    registerPanelToggleCallbacks: function (callbacks) {
      if (callbacks && typeof callbacks === 'object') {
        _panelCallbacks.push(callbacks);
      }
    },

    // ── State query ───────────────────────────────────────────────────────────
    isPanelVisible: function (panelId) {
      var el = _el(panelId);
      return el ? !el.classList.contains('panel-hidden') : false;
    },

    getCurrentMode: function () {
      return _currentMode;
    }
  };

  // Expose global
  global.Layout = Layout;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/layout.js
