// FILE: client/js/ui/input-handler.js — PART 10
// InputHandler — all player input management for Heinrich RPG.
// IIFE pattern — exposes global `InputHandler`.

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────
  var MAX_INPUT_CHARS    = 500;
  var MAX_HISTORY        = 50;
  var FEEDBACK_DURATION  = 2500; // ms
  var CHOICE_KEYS        = ['a', 'b', 'c', 'd', 'e'];

  // ─── Quick action definitions ─────────────────────────────────────────────
  var DEFAULT_QUICK_ACTIONS = [
    { id: 'attack',    icon: '⚔️',  label: 'Attack',    action: 'attack',    disabled: false, tooltip: 'Initiate combat' },
    { id: 'defend',    icon: '🛡️',  label: 'Defend',    action: 'defend',    disabled: false, tooltip: 'Take a defensive stance' },
    { id: 'flee',      icon: '🏃',  label: 'Flee',      action: 'flee',      disabled: false, tooltip: 'Attempt to escape' },
    { id: 'look',      icon: '👁️',  label: 'Look',      action: 'look',      disabled: false, tooltip: 'Examine surroundings' },
    { id: 'talk',      icon: '💬',  label: 'Talk',      action: 'talk',      disabled: false, tooltip: 'Speak to someone' },
    { id: 'inventory', icon: '🎒',  label: 'Inventory', action: 'inventory', disabled: false, tooltip: 'Check inventory (Ctrl+I)' },
    { id: 'map',       icon: '🗺️',  label: 'Map',       action: 'map',       disabled: false, tooltip: 'View map (Ctrl+M)' },
    { id: 'rest',      icon: '😴',  label: 'Rest',      action: 'rest',      disabled: false, tooltip: 'Rest and recover' },
    { id: 'recall',    icon: '🧠',  label: 'Recall',    action: 'recall',    disabled: false, tooltip: 'Recall information' },
    { id: 'save',      icon: '💾',  label: 'Save',      action: 'save',      disabled: false, tooltip: 'Quick save (Ctrl+S)' },
    { id: 'export',    icon: '📤',  label: 'Export',    action: 'export',    disabled: false, tooltip: 'Export chronicle' }
  ];

  var COMBAT_QUICK_ACTIONS = [
    { id: 'strike',    icon: '⚔️',  label: 'Strike',    action: 'strike',    disabled: false, tooltip: 'Strike the enemy' },
    { id: 'parry',     icon: '🛡️',  label: 'Parry',     action: 'parry',     disabled: false, tooltip: 'Parry incoming blow' },
    { id: 'dodge',     icon: '💨',  label: 'Dodge',     action: 'dodge',     disabled: false, tooltip: 'Dodge out of the way' },
    { id: 'disarm',    icon: '🤲',  label: 'Disarm',    action: 'disarm',    disabled: false, tooltip: 'Attempt to disarm' },
    { id: 'grapple',   icon: '💪',  label: 'Grapple',   action: 'grapple',   disabled: false, tooltip: 'Grab and wrestle' },
    { id: 'flee',      icon: '🏃',  label: 'Flee',      action: 'flee',      disabled: false, tooltip: 'Attempt to escape' },
    { id: 'shout',     icon: '📢',  label: 'Shout',     action: 'shout',     disabled: false, tooltip: 'Cry out — surrender or taunt' },
    { id: 'save',      icon: '💾',  label: 'Save',      action: 'save',      disabled: false, tooltip: 'Quick save (Ctrl+S)' }
  ];

  var DIALOGUE_QUICK_ACTIONS = [
    { id: 'persuade',  icon: '🗣️',  label: 'Persuade',  action: 'persuade',  disabled: false, tooltip: 'Attempt persuasion' },
    { id: 'deceive',   icon: '🎭',  label: 'Deceive',   action: 'deceive',   disabled: false, tooltip: 'Attempt deception' },
    { id: 'intimidate',icon: '😠',  label: 'Intimidate',action: 'intimidate',disabled: false, tooltip: 'Try intimidation' },
    { id: 'charm',     icon: '😊',  label: 'Charm',     action: 'charm',     disabled: false, tooltip: 'Use charm' },
    { id: 'bribe',     icon: '💰',  label: 'Bribe',     action: 'bribe',     disabled: false, tooltip: 'Offer a bribe' },
    { id: 'inquire',   icon: '❓',  label: 'Inquire',   action: 'inquire',   disabled: false, tooltip: 'Ask for information' },
    { id: 'leave',     icon: '🚶',  label: 'Leave',     action: 'leave',     disabled: false, tooltip: 'End the conversation' },
    { id: 'save',      icon: '💾',  label: 'Save',      action: 'save',      disabled: false, tooltip: 'Quick save (Ctrl+S)' }
  ];

  var SKILL_QUICK_ACTIONS = [
    { id: 'focus',     icon: '🧘',  label: 'Focus',     action: 'focus',     disabled: false, tooltip: 'Focus for bonus' },
    { id: 'prepare',   icon: '📋',  label: 'Prepare',   action: 'prepare',   disabled: false, tooltip: 'Prepare carefully' },
    { id: 'improvise', icon: '🎲',  label: 'Improvise', action: 'improvise', disabled: false, tooltip: 'Try an improvised approach' },
    { id: 'assist',    icon: '🤝',  label: 'Assist',    action: 'assist',    disabled: false, tooltip: 'Ask for assistance' },
    { id: 'abort',     icon: '❌',  label: 'Abort',     action: 'abort',     disabled: false, tooltip: 'Abandon this attempt' },
    { id: 'save',      icon: '💾',  label: 'Save',      action: 'save',      disabled: false, tooltip: 'Quick save (Ctrl+S)' }
  ];

  var MODE_PLACEHOLDERS = {
    normal:   'What does Heinrich do? (Enter to send, Shift+Enter for new line)',
    combat:   'Your combat action… or choose a button above',
    dialogue: 'What does Heinrich say or do?',
    skill:    'How does Heinrich approach this challenge?'
  };

  // ─── State ────────────────────────────────────────────────────────────────
  var _containerId     = null;
  var _container       = null;
  var _inputEl         = null;
  var _counterEl       = null;
  var _choiceBarEl     = null;
  var _quickBarEl      = null;
  var _feedbackEl      = null;
  var _submitCallback  = null;
  var _currentChoices  = [];
  var _inputHistory    = [];
  var _historyIndex    = -1;
  var _currentMode     = 'normal';
  var _disabled        = false;
  var _feedbackTimer   = null;
  var _initialized     = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function _esc(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _fire(type, extra) {
    if (typeof _submitCallback !== 'function') return;
    var payload = Object.assign({ type: type }, extra || {});
    _submitCallback(payload);
  }

  // ─── Build DOM ────────────────────────────────────────────────────────────
  function _build(container) {
    container.innerHTML = '';
    container.className = 'input-area';

    // Choice bar (hidden by default)
    _choiceBarEl = document.createElement('div');
    _choiceBarEl.id        = 'choice-bar';
    _choiceBarEl.className = 'choice-bar';
    _choiceBarEl.setAttribute('role', 'group');
    _choiceBarEl.setAttribute('aria-label', 'Choice buttons');
    _choiceBarEl.style.display = 'none';
    container.appendChild(_choiceBarEl);

    // Input row
    var inputRow = document.createElement('div');
    inputRow.className = 'input-row';

    _inputEl = document.createElement('textarea');
    _inputEl.id          = 'player-input';
    _inputEl.className   = 'player-input';
    _inputEl.rows        = 2;
    _inputEl.maxLength   = MAX_INPUT_CHARS;
    _inputEl.placeholder = MODE_PLACEHOLDERS.normal;
    _inputEl.setAttribute('aria-label', 'Player command input');
    _inputEl.setAttribute('autocomplete', 'off');
    _inputEl.setAttribute('autocorrect', 'off');
    _inputEl.setAttribute('spellcheck', 'true');

    var sendBtn = document.createElement('button');
    sendBtn.id        = 'send-btn';
    sendBtn.className = 'send-btn';
    sendBtn.innerHTML = '▶';
    sendBtn.setAttribute('aria-label', 'Send command');
    sendBtn.setAttribute('title', 'Send (Enter)');
    sendBtn.addEventListener('click', _onSendClick);

    _counterEl = document.createElement('span');
    _counterEl.className = 'char-counter';
    _counterEl.textContent = '0/' + MAX_INPUT_CHARS;
    _counterEl.setAttribute('aria-live', 'polite');

    inputRow.appendChild(_inputEl);
    inputRow.appendChild(sendBtn);

    var inputMeta = document.createElement('div');
    inputMeta.className = 'input-meta';
    inputMeta.appendChild(_counterEl);
    inputRow.appendChild(inputMeta);

    container.appendChild(inputRow);

    // Feedback area
    _feedbackEl = document.createElement('div');
    _feedbackEl.id        = 'input-feedback';
    _feedbackEl.className = 'input-feedback';
    _feedbackEl.setAttribute('role', 'status');
    _feedbackEl.setAttribute('aria-live', 'polite');
    _feedbackEl.style.display = 'none';
    container.appendChild(_feedbackEl);

    // Quick action bar
    _quickBarEl = document.createElement('div');
    _quickBarEl.id        = 'quick-action-bar';
    _quickBarEl.className = 'quick-action-bar';
    _quickBarEl.setAttribute('role', 'toolbar');
    _quickBarEl.setAttribute('aria-label', 'Quick actions');
    container.appendChild(_quickBarEl);

    // Wire up events
    _inputEl.addEventListener('input',   _onInput);
    _inputEl.addEventListener('keydown', _onKeyDown);

    // Render default quick actions
    InputHandler.setQuickActions(DEFAULT_QUICK_ACTIONS);
  }

  // ─── Event handlers ────────────────────────────────────────────────────────
  function _onInput() {
    var len = _inputEl.value.length;
    if (_counterEl) {
      _counterEl.textContent = len + '/' + MAX_INPUT_CHARS;
      _counterEl.classList.toggle('counter-warn',  len > MAX_INPUT_CHARS * 0.85);
      _counterEl.classList.toggle('counter-limit', len >= MAX_INPUT_CHARS);
    }
  }

  function _onKeyDown(e) {
    // Enter to submit (not Shift+Enter)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      _onSendClick();
      return;
    }

    // Arrow up/down for history
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      InputHandler.navigateHistory('up');
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      InputHandler.navigateHistory('down');
      return;
    }

    // Choice letter keys (a-e) when choices are visible
    if (_currentChoices.length > 0 && !e.ctrlKey && !e.altKey && !e.metaKey) {
      var key = e.key.toLowerCase();
      var idx = CHOICE_KEYS.indexOf(key);
      if (idx >= 0 && idx < _currentChoices.length) {
        e.preventDefault();
        _selectChoice(idx);
        return;
      }
    }

    // Ctrl+S — quick save
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      _fire('quick', { text: 'save', quickActionId: 'save' });
      return;
    }

    // Ctrl+M — toggle map
    if (e.ctrlKey && e.key.toLowerCase() === 'm') {
      e.preventDefault();
      if (global.InfoPanel) { global.InfoPanel.setActiveTab('map'); }
      if (global.Layout)    { global.Layout.showPanel('panel-right'); }
      return;
    }

    // Ctrl+I — toggle inventory
    if (e.ctrlKey && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      if (global.InfoPanel) { global.InfoPanel.setActiveTab('inventory'); }
      if (global.Layout)    { global.Layout.showPanel('panel-right'); }
      return;
    }

    // Escape — clear input / close modal
    if (e.key === 'Escape') {
      if (_inputEl.value.length > 0) {
        InputHandler.clearInput();
      } else {
        // Signal to close any open modal
        var evt = new CustomEvent('heinrich:escape', { bubbles: true });
        document.dispatchEvent(evt);
      }
      return;
    }
  }

  // Global keydown for choice shortcuts when input is NOT focused
  function _onGlobalKeyDown(e) {
    // Only if choice bar is visible and input is not focused
    if (document.activeElement === _inputEl) return;
    if (!_currentChoices.length) return;
    if (e.ctrlKey || e.altKey || e.metaKey) return;

    var key = e.key.toLowerCase();
    var idx = CHOICE_KEYS.indexOf(key);
    if (idx >= 0 && idx < _currentChoices.length) {
      e.preventDefault();
      _selectChoice(idx);
    }

    // Ctrl+S global
    if (e.ctrlKey && e.key.toLowerCase() === 's') {
      e.preventDefault();
      _fire('quick', { text: 'save', quickActionId: 'save' });
    }
  }

  function _onSendClick() {
    if (_disabled) return;
    var text = _inputEl ? _inputEl.value.trim() : '';
    if (!text) return;

    InputHandler.addToHistory(text);
    InputHandler.clearInput();
    _historyIndex = -1;
    InputHandler.clearChoices();

    _fire('free', { text: text });
  }

  function _selectChoice(idx) {
    if (_disabled) return;
    if (idx < 0 || idx >= _currentChoices.length) return;
    var choiceText = _currentChoices[idx];
    InputHandler.clearChoices();
    _fire('choice', { text: choiceText, choiceIndex: idx });
  }

  // ─── Render quick actions ─────────────────────────────────────────────────
  function _renderQuickBar(actions) {
    if (!_quickBarEl) return;
    _quickBarEl.innerHTML = '';
    actions.forEach(function (act) {
      var btn = document.createElement('button');
      btn.className   = 'quick-action-btn' + (act.disabled ? ' qa-disabled' : '');
      btn.dataset.qid = act.id;
      btn.disabled    = !!act.disabled;
      btn.innerHTML   =
        '<span class="qa-icon">' + act.icon + '</span>' +
        '<span class="qa-label">' + _esc(act.label) + '</span>';
      if (act.tooltip) { btn.title = act.tooltip; }
      btn.setAttribute('aria-label', act.label);

      btn.addEventListener('click', function () {
        if (_disabled || act.disabled) return;
        var actionText = act.action || act.label;
        _fire('quick', { text: actionText, quickActionId: act.id });
      });

      _quickBarEl.appendChild(btn);
    });
  }

  // ─── Render choices ────────────────────────────────────────────────────────
  function _renderChoiceBar(choices) {
    if (!_choiceBarEl) return;
    _choiceBarEl.innerHTML = '';

    choices.forEach(function (choice, i) {
      var key = CHOICE_KEYS[i] ? CHOICE_KEYS[i].toUpperCase() : String(i + 1);
      var btn = document.createElement('button');
      btn.className   = 'choice-btn';
      btn.dataset.idx = i;
      btn.innerHTML   =
        '<span class="choice-key">[' + key + ']</span> ' +
        '<span class="choice-text">' + _esc(choice) + '</span>';
      btn.setAttribute('aria-label', 'Choice ' + key + ': ' + choice);

      btn.addEventListener('click', function () {
        _selectChoice(i);
      });

      _choiceBarEl.appendChild(btn);
    });

    _choiceBarEl.style.display = choices.length ? 'flex' : 'none';
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  var InputHandler = {

    init: function (containerId) {
      if (_initialized) return;
      _initialized = true;

      _containerId = containerId || 'input-area';
      _container   = document.getElementById(_containerId);
      if (!_container) {
        console.warn('[InputHandler] Container #' + _containerId + ' not found.');
        return;
      }

      _build(_container);
      document.addEventListener('keydown', _onGlobalKeyDown);
    },

    // ── Choices ───────────────────────────────────────────────────────────────
    setChoices: function (choices) {
      _currentChoices = (choices || []).slice(0, 5);
      _renderChoiceBar(_currentChoices);
    },

    clearChoices: function () {
      _currentChoices = [];
      if (_choiceBarEl) { _choiceBarEl.style.display = 'none'; _choiceBarEl.innerHTML = ''; }
    },

    // ── Quick actions ─────────────────────────────────────────────────────────
    setQuickActions: function (actions) {
      _renderQuickBar(actions || []);
    },

    getDefaultQuickActions: function () {
      return DEFAULT_QUICK_ACTIONS.slice();
    },

    // ── Enable / disable ──────────────────────────────────────────────────────
    disable: function () {
      _disabled = true;
      if (_inputEl) {
        _inputEl.disabled = true;
        _inputEl.classList.add('input-disabled');
      }
      if (_container) {
        _container.querySelectorAll('button').forEach(function (b) {
          b.disabled = true;
        });
      }
    },

    enable: function () {
      _disabled = false;
      if (_inputEl) {
        _inputEl.disabled = false;
        _inputEl.classList.remove('input-disabled');
      }
      if (_container) {
        _container.querySelectorAll('button').forEach(function (b) {
          // Re-enable unless it was explicitly disabled (quick action disabled flag)
          var qid = b.dataset.qid;
          if (!qid) {
            b.disabled = false;
            return;
          }
          // Find matching action
          var allActions = DEFAULT_QUICK_ACTIONS.concat(COMBAT_QUICK_ACTIONS)
            .concat(DIALOGUE_QUICK_ACTIONS).concat(SKILL_QUICK_ACTIONS);
          var act = allActions.find(function (a) { return a.id === qid; });
          b.disabled = act ? !!act.disabled : false;
        });
      }
      InputHandler.focus();
    },

    // ── Placeholder ───────────────────────────────────────────────────────────
    setPlaceholder: function (text) {
      if (_inputEl) { _inputEl.placeholder = text; }
    },

    // ── Focus ─────────────────────────────────────────────────────────────────
    focus: function () {
      if (_inputEl && !_disabled) { _inputEl.focus(); }
    },

    // ── Submit callback ───────────────────────────────────────────────────────
    onSubmit: function (callback) {
      if (typeof callback !== 'function') {
        console.error('[InputHandler] onSubmit: callback must be a function');
        return;
      }
      _submitCallback = callback;
    },

    // ── Input value ──────────────────────────────────────────────────────────
    getInputValue: function () {
      return _inputEl ? _inputEl.value : '';
    },

    clearInput: function () {
      if (_inputEl) {
        _inputEl.value = '';
        _onInput();
      }
    },

    // ── History management ────────────────────────────────────────────────────
    addToHistory: function (input) {
      if (!input || !input.trim()) return;
      // Avoid duplicating last entry
      if (_inputHistory[0] === input) return;
      _inputHistory.unshift(input);
      if (_inputHistory.length > MAX_HISTORY) {
        _inputHistory.length = MAX_HISTORY;
      }
      _historyIndex = -1;
    },

    navigateHistory: function (direction) {
      if (!_inputHistory.length) return;

      if (direction === 'up') {
        _historyIndex = Math.min(_historyIndex + 1, _inputHistory.length - 1);
      } else if (direction === 'down') {
        _historyIndex = Math.max(_historyIndex - 1, -1);
      }

      if (_inputEl) {
        if (_historyIndex === -1) {
          _inputEl.value = '';
        } else {
          _inputEl.value = _inputHistory[_historyIndex] || '';
          // Move cursor to end
          var len = _inputEl.value.length;
          _inputEl.setSelectionRange(len, len);
        }
        _onInput();
      }
    },

    // ── Input mode ────────────────────────────────────────────────────────────
    setInputMode: function (mode) {
      _currentMode = mode || 'normal';
      var placeholder = MODE_PLACEHOLDERS[_currentMode] || MODE_PLACEHOLDERS.normal;
      InputHandler.setPlaceholder(placeholder);

      switch (_currentMode) {
        case 'combat':
          InputHandler.setQuickActions(COMBAT_QUICK_ACTIONS);
          break;
        case 'dialogue':
          InputHandler.setQuickActions(DIALOGUE_QUICK_ACTIONS);
          break;
        case 'skill':
          InputHandler.setQuickActions(SKILL_QUICK_ACTIONS);
          break;
        default:
          InputHandler.setQuickActions(DEFAULT_QUICK_ACTIONS);
          break;
      }

      // Visual indicator
      if (_container) {
        _container.dataset.mode = _currentMode;
        _container.classList.remove(
          'mode-normal', 'mode-combat', 'mode-dialogue', 'mode-skill'
        );
        _container.classList.add('mode-' + _currentMode);
      }
    },

    // ── Feedback ──────────────────────────────────────────────────────────────
    showInputFeedback: function (message, type) {
      if (!_feedbackEl) return;

      if (_feedbackTimer) {
        clearTimeout(_feedbackTimer);
        _feedbackTimer = null;
      }

      var msgType = type || 'info';
      var icons   = { info: 'ℹ️', error: '❌', success: '✅', warning: '⚠️' };
      var icon    = icons[msgType] || 'ℹ️';

      _feedbackEl.className  = 'input-feedback feedback-' + msgType;
      _feedbackEl.innerHTML  = icon + ' ' + _esc(message);
      _feedbackEl.style.display = 'block';

      _feedbackTimer = setTimeout(function () {
        if (_feedbackEl) {
          _feedbackEl.style.display = 'none';
          _feedbackEl.innerHTML     = '';
        }
        _feedbackTimer = null;
      }, FEEDBACK_DURATION);
    },

    // ── State getters ─────────────────────────────────────────────────────────
    getInputMode: function ()    { return _currentMode; },
    isDisabled:   function ()    { return _disabled; },
    getHistory:   function ()    { return _inputHistory.slice(); }
  };

  // Expose global
  global.InputHandler = InputHandler;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/input-handler.js
