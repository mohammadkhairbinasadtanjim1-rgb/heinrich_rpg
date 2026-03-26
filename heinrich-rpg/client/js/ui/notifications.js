// FILE: client/js/ui/notifications.js — PART 10

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────

  var DEFAULT_DURATIONS = {
    info:        3000,
    success:     3000,
    warning:     5000,
    error:       8000,
    achievement: 5000,
    event:       4000,
    skill:       4000
  };

  var TYPE_ICONS = {
    info:        'ℹ️',
    success:     '✅',
    warning:     '⚠️',
    error:       '❌',
    achievement: '🏆',
    event:       '📜',
    skill:       '⚔️'
  };

  var TYPE_TITLES = {
    info:        'Info',
    success:     'Success',
    warning:     'Warning',
    error:       'Error',
    achievement: 'Achievement',
    event:       'World Event',
    skill:       'Skill Gained'
  };

  var MAX_VISIBLE = 5;

  // ─── Notifications IIFE ───────────────────────────────────────────────────

  var Notifications = (function () {

    var _container  = null;
    var _toasts     = {};       // id → { el, timerId }
    var _queue      = [];       // pending items when max reached
    var _idCounter  = 0;

    // ── CSS injection ────────────────────────────────────────────────────────

    function _injectStyles() {
      if (document.getElementById('notif-styles')) return;
      var style = document.createElement('style');
      style.id = 'notif-styles';
      style.textContent = [
        /* Container */
        '#notif-container { position:fixed; top:16px; right:16px; z-index:9000; display:flex; flex-direction:column; gap:8px; width:320px; max-width:calc(100vw - 32px); pointer-events:none; }',
        /* Base toast */
        '.toast { display:flex; align-items:flex-start; gap:10px; background:#1a1410; border:1px solid rgba(255,255,255,0.15); border-radius:7px; padding:10px 12px; box-shadow:0 4px 20px rgba(0,0,0,0.6); pointer-events:all; animation:toast-in 0.28s cubic-bezier(0.34,1.56,0.64,1); position:relative; overflow:hidden; }',
        '.toast.toast-removing { animation:toast-out 0.22s ease forwards; }',
        '@keyframes toast-in { from { opacity:0; transform:translateX(110%); } to { opacity:1; transform:translateX(0); } }',
        '@keyframes toast-out { from { opacity:1; transform:translateX(0); } to { opacity:0; transform:translateX(110%); } }',
        /* Progress bar */
        '.toast-progress { position:absolute; bottom:0; left:0; height:3px; border-radius:0 0 7px 7px; animation:toast-progress linear forwards; }',
        '@keyframes toast-progress { from { width:100%; } to { width:0%; } }',
        /* Icon */
        '.toast-icon { font-size:1.1rem; flex-shrink:0; line-height:1; margin-top:1px; }',
        /* Content */
        '.toast-content { flex:1; min-width:0; }',
        '.toast-title { font-size:0.8rem; font-weight:bold; margin-bottom:2px; color:#e8d5b0; }',
        '.toast-message { font-size:0.78rem; line-height:1.45; color:rgba(232,213,176,0.8); word-break:break-word; }',
        /* Close button */
        '.toast-close { background:none; border:none; color:rgba(232,213,176,0.4); cursor:pointer; font-size:1rem; line-height:1; padding:0 0 0 6px; flex-shrink:0; align-self:flex-start; transition:color 0.15s; pointer-events:all; }',
        '.toast-close:hover { color:#e8d5b0; }',
        /* Type variants */
        '.toast-info    { border-left:3px solid #5b9bd5; }',
        '.toast-info    .toast-progress { background:#5b9bd5; }',
        '.toast-success { border-left:3px solid #2ecc71; }',
        '.toast-success .toast-progress { background:#2ecc71; }',
        '.toast-warning { border-left:3px solid #f39c12; }',
        '.toast-warning .toast-progress { background:#f39c12; }',
        '.toast-error   { border-left:3px solid #e74c3c; }',
        '.toast-error   .toast-progress { background:#e74c3c; }',
        /* Achievement */
        '.toast-achievement { border:1px solid rgba(212,175,55,0.5); border-left:3px solid #d4af37; background:rgba(212,175,55,0.12); }',
        '.toast-achievement .toast-progress { background:#d4af37; }',
        '.toast-achievement .toast-title { color:#d4af37; }',
        '.toast-achievement .toast-icon { font-size:1.4rem; }',
        /* World Event */
        '.toast-event { border-left:3px solid #9b59b6; }',
        '.toast-event .toast-progress { background:#9b59b6; }',
        '.toast-event .toast-title { color:#c39bd3; }',
        /* Skill */
        '.toast-skill { border-left:3px solid #1abc9c; }',
        '.toast-skill .toast-progress { background:#1abc9c; }',
        '.toast-skill .toast-title { color:#1abc9c; }',
        /* Consequence */
        '.toast-consequence { border-left:3px solid #e67e22; }',
        '.toast-consequence .toast-progress { background:#e67e22; }',
        '.toast-consequence .toast-title { color:#e67e22; }',
        /* NPC event */
        '.toast-npc { border-left:3px solid #e91e63; }',
        '.toast-npc .toast-progress { background:#e91e63; }',
        '.toast-npc .toast-title { color:#f48fb1; }',
        /* Clickable toast */
        '.toast-clickable { cursor:pointer; }',
        '.toast-clickable:hover { background:rgba(255,255,255,0.05); }',
        /* Mobile */
        '@media (max-width:400px) { #notif-container { width:calc(100vw - 24px); right:12px; top:8px; } }'
      ].join('\n');
      document.head.appendChild(style);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    function _nextId() {
      return 'toast-' + (++_idCounter) + '-' + Date.now();
    }

    function _visibleCount() {
      return Object.keys(_toasts).length;
    }

    function _processQueue() {
      if (_queue.length === 0) return;
      if (_visibleCount() >= MAX_VISIBLE) return;
      var next = _queue.shift();
      _addToast(next);
    }

    function _addToast(opts) {
      if (!_container) return;
      if (_visibleCount() >= MAX_VISIBLE) {
        _queue.push(opts);
        return;
      }

      var id       = opts.id || _nextId();
      var type     = opts.type || 'info';
      var duration = opts.persistent ? 0 : (opts.duration || DEFAULT_DURATIONS[type] || 3000);

      var toast = document.createElement('div');
      toast.className = 'toast toast-' + type + (opts.onClick ? ' toast-clickable' : '');
      toast.dataset.toastId = id;

      // Icon
      var iconEl = document.createElement('div');
      iconEl.className = 'toast-icon';
      iconEl.textContent = opts.icon || TYPE_ICONS[type] || 'ℹ️';
      toast.appendChild(iconEl);

      // Content
      var contentEl = document.createElement('div');
      contentEl.className = 'toast-content';

      var titleText = opts.title || TYPE_TITLES[type] || type;
      if (titleText) {
        var titleEl = document.createElement('div');
        titleEl.className = 'toast-title';
        titleEl.textContent = titleText;
        contentEl.appendChild(titleEl);
      }

      var msgEl = document.createElement('div');
      msgEl.className = 'toast-message';
      msgEl.textContent = opts.message || '';
      contentEl.appendChild(msgEl);

      toast.appendChild(contentEl);

      // Close button
      var closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close';
      closeBtn.textContent = '×';
      closeBtn.title = 'Dismiss';
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        Notifications.hide(id);
      });
      toast.appendChild(closeBtn);

      // Progress bar
      if (!opts.persistent && duration > 0) {
        var progress = document.createElement('div');
        progress.className = 'toast-progress';
        progress.style.animationDuration = duration + 'ms';
        toast.appendChild(progress);
      }

      // Click handler
      if (opts.onClick) {
        toast.addEventListener('click', function () {
          opts.onClick();
          Notifications.hide(id);
        });
      }

      // Insert at top
      if (_container.firstChild) {
        _container.insertBefore(toast, _container.firstChild);
      } else {
        _container.appendChild(toast);
      }

      var timerId = null;
      if (!opts.persistent && duration > 0) {
        timerId = setTimeout(function () {
          Notifications.hide(id);
        }, duration);
      }

      _toasts[id] = { el: toast, timerId: timerId };
      return id;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    var Notifications = {

      init: function () {
        _injectStyles();
        if (!document.getElementById('notif-container')) {
          _container = document.createElement('div');
          _container.id = 'notif-container';
          document.body.appendChild(_container);
        } else {
          _container = document.getElementById('notif-container');
        }
      },

      show: function (message, type, options) {
        options = options || {};
        var opts = {
          message:    message,
          type:       type || 'info',
          id:         options.id || _nextId(),
          duration:   options.duration,
          persistent: options.persistent,
          icon:       options.icon,
          title:      options.title,
          onClick:    options.onClick
        };
        return _addToast(opts);
      },

      hide: function (id) {
        var entry = _toasts[id];
        if (!entry) return;

        if (entry.timerId) clearTimeout(entry.timerId);
        var el = entry.el;
        el.classList.add('toast-removing');
        setTimeout(function () {
          if (el.parentNode) el.parentNode.removeChild(el);
          delete _toasts[id];
          _processQueue();
        }, 240);
      },

      hideAll: function () {
        Object.keys(_toasts).forEach(function (id) { Notifications.hide(id); });
        _queue.length = 0;
      },

      info: function (message, options) {
        return Notifications.show(message, 'info', options);
      },

      success: function (message, options) {
        return Notifications.show(message, 'success', options);
      },

      warning: function (message, options) {
        return Notifications.show(message, 'warning', options);
      },

      error: function (message, options) {
        return Notifications.show(message, 'error', options);
      },

      achievement: function (title, description, icon) {
        return _addToast({
          type:     'achievement',
          icon:     icon || '🏆',
          title:    title || 'Achievement Unlocked',
          message:  description || '',
          duration: DEFAULT_DURATIONS.achievement
        });
      },

      skillUp: function (skillName, newLevel, branch) {
        var branchStr = branch ? ' [' + branch + ']' : '';
        return _addToast({
          type:    'skill',
          icon:    '⬆️',
          title:   'Skill Improved',
          message: (skillName || 'Skill') + branchStr + ' → Level ' + (newLevel || '?'),
          duration: DEFAULT_DURATIONS.skill
        });
      },

      worldEvent: function (title, description) {
        return _addToast({
          type:    'event',
          icon:    '📜',
          title:   title || 'World Event',
          message: description || '',
          duration: DEFAULT_DURATIONS.event
        });
      },

      consequence: function (title, severity) {
        var sev = parseInt(severity, 10) || 1;
        var icon = sev >= 10 ? '☠️' : sev >= 7 ? '🔥🔥🔥' : sev >= 4 ? '🔥🔥' : '🔥';
        return _addToast({
          type:    'consequence',
          icon:    icon,
          title:   'Consequence: ' + (title || 'New Thread'),
          message: 'Severity: ' + sev + '/10',
          duration: 6000
        });
      },

      npcEvent: function (npcName, event) {
        return _addToast({
          type:    'npc',
          icon:    '🧑',
          title:   npcName || 'NPC Event',
          message: event || '',
          duration: DEFAULT_DURATIONS.event
        });
      }
    };

    return Notifications;
  }());

  global.Notifications = Notifications;

}(window));

// END FILE: client/js/ui/notifications.js
