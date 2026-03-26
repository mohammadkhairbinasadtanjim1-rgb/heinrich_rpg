// FILE: client/js/ui/prose-display.js — PART 10
// ProseDisplay — the scrolling narrative window for Heinrich RPG.
// IIFE pattern — exposes global `ProseDisplay`.

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────
  var TYPEWRITER_DELAY_MS   = 18;   // ms per character for typewriter effect
  var TYPEWRITER_CHUNK      = 3;    // chars added per tick for speed
  var MAX_PROSE_BLOCKS      = 300;  // prune oldest when exceeded
  var THEMES = {
    dark_parchment:  'theme-dark-parchment',
    light_parchment: 'theme-light-parchment',
    night:           'theme-night'
  };
  var FONT_SIZES = {
    small:  '0.85rem',
    medium: '1rem',
    large:  '1.15rem',
    xlarge: '1.35rem'
  };
  var PARAGRAPH_SPACINGS = {
    compact:  '0.8em',
    normal:   '1.3em',
    relaxed:  '1.9em'
  };

  // Tier styling map
  var TIER_CLASSES = {
    critical_success: 'tier-critical-success',
    great_success:    'tier-great-success',
    success:          'tier-success',
    partial:          'tier-partial',
    failure:          'tier-failure',
    critical_failure: 'tier-critical-failure'
  };
  var TIER_NAMES = {
    critical_success: 'Critical Success',
    great_success:    'Great Success',
    success:          'Success',
    partial:          'Partial Success',
    failure:          'Failure',
    critical_failure: 'Critical Failure'
  };

  // Separator icons
  var SEPARATOR_GLYPHS = {
    time_skip:    '✦ ─────────────────── ✦',
    day_change:   '☀  ═══════════════════  ☀',
    scene_change: '❧ ──────────────────── ❧'
  };

  // ─── Module state ─────────────────────────────────────────────────────────
  var _containerId      = null;
  var _container        = null;
  var _proseBlocks      = [];   // { id, type, html, text, timestamp }
  var _blockIdCounter   = 0;
  var _currentTheme     = 'dark_parchment';
  var _fontSize         = 'medium';
  var _spacing          = 'normal';
  var _typingIndicator  = null;
  var _typewriterQueue  = [];
  var _typewriterActive = false;

  // ─── Helpers ──────────────────────────────────────────────────────────────
  function _getContainer() {
    if (!_container) {
      _container = document.getElementById(_containerId || 'prose-container');
    }
    return _container;
  }

  function _nextId() {
    return 'prose-block-' + (++_blockIdCounter);
  }

  function _escapeHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function _stripHtml(html) {
    var tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  }

  function _pruneBlocks() {
    var c = _getContainer();
    if (!c) return;
    while (_proseBlocks.length > MAX_PROSE_BLOCKS) {
      var oldest = _proseBlocks.shift();
      var el = document.getElementById(oldest.id);
      if (el) { el.parentNode.removeChild(el); }
    }
  }

  // ─── Typewriter engine ────────────────────────────────────────────────────
  function _runTypewriter() {
    if (_typewriterActive || _typewriterQueue.length === 0) return;
    _typewriterActive = true;
    var job = _typewriterQueue.shift();
    var el  = job.el;
    var full = job.text;
    var idx  = 0;

    function tick() {
      if (idx >= full.length) {
        el.innerHTML = full;          // Ensure final HTML is correct
        el.classList.add('typewriter-done');
        _typewriterActive = false;
        if (_typewriterQueue.length > 0) { _runTypewriter(); }
        return;
      }
      // Advance by chunk, but only on text nodes to avoid breaking HTML tags
      idx = Math.min(idx + TYPEWRITER_CHUNK, full.length);
      // Reveal using clip: we render the full HTML and clip with character count
      // Safe approach: use a plain-text intermediate until done, then swap
      el.textContent = _stripHtml(full).substring(0, idx) + '▌';
      setTimeout(tick, TYPEWRITER_DELAY_MS);
    }

    tick();
  }

  function _typewriteBlock(el, htmlContent) {
    var plainText = _stripHtml(htmlContent);
    _typewriterQueue.push({ el: el, text: htmlContent, plainFull: plainText });
    _runTypewriter();
  }

  // ─── Core append ─────────────────────────────────────────────────────────
  function _appendBlock(htmlContent, options) {
    options = options || {};
    var c = _getContainer();
    if (!c) { console.warn('[ProseDisplay] Container not found'); return null; }

    var id       = _nextId();
    var type     = options.type || 'scene';
    var animate  = options.animate !== false;
    var timestamp = options.timestamp || Date.now();

    var wrapper = document.createElement('div');
    wrapper.id        = id;
    wrapper.className = 'prose-block prose-type-' + type + (animate ? ' prose-animate-in' : '');
    wrapper.setAttribute('data-timestamp', timestamp);
    wrapper.setAttribute('data-type', type);

    // Insert before typing indicator if it exists
    if (_typingIndicator && _typingIndicator.parentNode === c) {
      c.insertBefore(wrapper, _typingIndicator);
    } else {
      c.appendChild(wrapper);
    }

    if (animate && type === 'scene') {
      // Typewriter for important scene prose
      _typewriteBlock(wrapper, htmlContent);
    } else if (animate) {
      // Fade-in for non-scene content
      wrapper.innerHTML = htmlContent;
      wrapper.classList.add('fade-in');
      // Remove animation class after it completes
      setTimeout(function () { wrapper.classList.remove('fade-in'); }, 600);
    } else {
      wrapper.innerHTML = htmlContent;
    }

    _proseBlocks.push({
      id:        id,
      type:      type,
      html:      htmlContent,
      text:      _stripHtml(htmlContent),
      timestamp: timestamp
    });

    _pruneBlocks();
    ProseDisplay.scrollToBottom(true);
    return id;
  }

  // ─── Typing indicator ─────────────────────────────────────────────────────
  function _ensureTypingIndicator() {
    var c = _getContainer();
    if (!c) return;
    if (!_typingIndicator) {
      _typingIndicator = document.createElement('div');
      _typingIndicator.id        = 'prose-typing-indicator';
      _typingIndicator.className = 'typing-indicator';
      _typingIndicator.setAttribute('aria-label', 'Narrator is writing');
      _typingIndicator.innerHTML =
        '<span class="typing-dot"></span>' +
        '<span class="typing-dot"></span>' +
        '<span class="typing-dot"></span>';
    }
    if (!_typingIndicator.parentNode) {
      c.appendChild(_typingIndicator);
    }
  }

  // ─── Public API ───────────────────────────────────────────────────────────
  var ProseDisplay = {

    init: function (containerId) {
      _containerId = containerId || 'prose-container';
      _container   = document.getElementById(_containerId);
      if (!_container) {
        console.warn('[ProseDisplay] Container #' + _containerId + ' not found. Will retry on first use.');
      }
      // Apply defaults
      ProseDisplay.applyTheme(_currentTheme);
      ProseDisplay.setFontSize(_fontSize);
      ProseDisplay.setParagraphSpacing(_spacing);
    },

    // ── Prose blocks ─────────────────────────────────────────────────────────
    appendProse: function (htmlContent, options) {
      return _appendBlock(htmlContent, options);
    },

    // ── Skill check callout ──────────────────────────────────────────────────
    appendSkillCheck: function (checkData) {
      /*
       * checkData: { skill, level, difficulty, target, roll,
       *              tier, tierEmoji, xpGained, xpCurrent, xpThreshold, outcome }
       */
      var d        = checkData || {};
      var tier     = d.tier     || 'failure';
      var tierCls  = TIER_CLASSES[tier] || 'tier-failure';
      var tierName = TIER_NAMES[tier]   || tier;

      var xpLine = '';
      if (d.xpGained !== undefined) {
        xpLine =
          '<div class="check-xp">+' + _escapeHtml(d.xpGained) + ' XP → ' +
          _escapeHtml(d.skill) + ' ' +
          _escapeHtml(d.xpCurrent || 0) + '/' +
          _escapeHtml(d.xpThreshold || '?') +
          '</div>';
      }

      var html =
        '<div class="skill-check-callout ' + tierCls + '" role="note" aria-label="Skill check result">' +
          '<div class="check-header">' +
            '<span class="check-skill">' + _escapeHtml(d.skill || 'Unknown') + ' Lv.' + _escapeHtml(d.level || 0) + '</span>' +
            '<span class="check-difficulty">' + _escapeHtml(d.difficulty || '') + '</span>' +
          '</div>' +
          '<div class="check-roll">' +
            '<span class="roll-number">' + _escapeHtml(d.roll || 0) + '</span>' +
            '<span class="roll-vs">vs</span>' +
            '<span class="target-number">' + _escapeHtml(d.target || 0) + '</span>' +
          '</div>' +
          '<div class="check-result">' +
            '<span class="tier-emoji">' + _escapeHtml(d.tierEmoji || '') + '</span>' +
            '<span class="tier-name">' + _escapeHtml(tierName) + '</span>' +
          '</div>' +
          xpLine +
        '</div>';

      return _appendBlock(html, { type: 'skill_check', animate: true });
    },

    // ── World event ──────────────────────────────────────────────────────────
    appendWorldEvent: function (eventText) {
      var html =
        '<div class="world-event-note" role="note">' +
          '<span class="world-event-icon">🌍</span>' +
          '<span class="world-event-text">' + _escapeHtml(eventText) + '</span>' +
        '</div>';
      return _appendBlock(html, { type: 'event', animate: true });
    },

    // ── System message ───────────────────────────────────────────────────────
    appendSystemMessage: function (text, type) {
      var msgType = type || 'info';
      var icons   = { info: 'ℹ️', warning: '⚠️', error: '❌', success: '✅' };
      var icon    = icons[msgType] || 'ℹ️';
      var html =
        '<div class="system-message system-message-' + _escapeHtml(msgType) + '" role="alert">' +
          '<span class="system-icon">' + icon + '</span>' +
          '<span class="system-text">' + _escapeHtml(text) + '</span>' +
        '</div>';
      return _appendBlock(html, { type: 'system', animate: false });
    },

    // ── Invention update ─────────────────────────────────────────────────────
    appendInventionUpdate: function (inventionData) {
      var d    = inventionData || {};
      var pct  = Math.min(100, Math.max(0, Math.round((d.progress || 0) / (d.maxProgress || 1) * 100)));
      var filled = Math.round(pct / 100 * 8);
      var bar  = '█'.repeat(filled) + '░'.repeat(8 - filled);
      var html =
        '<div class="invention-update" role="note">' +
          '<div class="invention-header">⚙️ <strong>' + _escapeHtml(d.name || 'Invention') + '</strong></div>' +
          '<div class="invention-progress">' +
            '<span class="invention-bar">' + bar + '</span>' +
            '<span class="invention-pct">' + pct + '%</span>' +
          '</div>' +
          (d.milestone ? '<div class="invention-milestone">🔔 ' + _escapeHtml(d.milestone) + '</div>' : '') +
        '</div>';
      return _appendBlock(html, { type: 'system', animate: true });
    },

    // ── Separator ────────────────────────────────────────────────────────────
    appendSeparator: function (type) {
      var glyph = SEPARATOR_GLYPHS[type] || SEPARATOR_GLYPHS.scene_change;
      var html =
        '<div class="prose-separator prose-separator-' + _escapeHtml(type || 'scene_change') + '" role="separator">' +
          '<span class="separator-glyph">' + glyph + '</span>' +
        '</div>';
      return _appendBlock(html, { type: 'separator', animate: false });
    },

    // ── Clear ─────────────────────────────────────────────────────────────────
    clearProse: function (force) {
      if (!force && _proseBlocks.length > 0) {
        var confirmed = window.confirm('Clear all narrative? This cannot be undone.');
        if (!confirmed) return false;
      }
      var c = _getContainer();
      if (c) {
        // Preserve the typing indicator
        var savedIndicator = _typingIndicator;
        c.innerHTML = '';
        if (savedIndicator) {
          _typingIndicator = null; // will be re-created on demand
        }
      }
      _proseBlocks      = [];
      _typewriterQueue  = [];
      _typewriterActive = false;
      return true;
    },

    // ── History / export ──────────────────────────────────────────────────────
    getProseHistory: function () {
      return _proseBlocks.slice();
    },

    exportProseAsText: function () {
      return _proseBlocks
        .filter(function (b) { return b.type !== 'separator' && b.type !== 'system'; })
        .map(function (b) {
          var ts = new Date(b.timestamp).toLocaleTimeString();
          return '[' + ts + '] ' + b.text;
        })
        .join('\n\n');
    },

    // ── Typing indicator ──────────────────────────────────────────────────────
    setTypingIndicator: function (active) {
      if (active) {
        _ensureTypingIndicator();
        if (_typingIndicator) {
          _typingIndicator.style.display = 'flex';
          ProseDisplay.scrollToBottom(true);
        }
      } else {
        if (_typingIndicator) {
          _typingIndicator.style.display = 'none';
        }
      }
    },

    // ── Scroll ────────────────────────────────────────────────────────────────
    scrollToBottom: function (smooth) {
      var c = _getContainer();
      if (!c) return;
      c.scrollTo({
        top:      c.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto'
      });
    },

    // ── Word count ────────────────────────────────────────────────────────────
    getWordCount: function () {
      var total = 0;
      _proseBlocks.forEach(function (b) {
        if (b.text) {
          var words = b.text.trim().split(/\s+/);
          total += words.filter(function (w) { return w.length > 0; }).length;
        }
      });
      return total;
    },

    // ── Theme ─────────────────────────────────────────────────────────────────
    applyTheme: function (theme) {
      var c = _getContainer() || document.body;
      Object.values(THEMES).forEach(function (cls) { c.classList.remove(cls); });
      var cls = THEMES[theme];
      if (cls) {
        c.classList.add(cls);
        _currentTheme = theme;
      } else {
        console.warn('[ProseDisplay] Unknown theme:', theme);
      }
    },

    // ── Font size ─────────────────────────────────────────────────────────────
    setFontSize: function (size) {
      var c = _getContainer();
      if (!c) return;
      var sz = FONT_SIZES[size];
      if (sz) {
        c.style.fontSize = sz;
        _fontSize = size;
      } else {
        console.warn('[ProseDisplay] Unknown font size:', size);
      }
    },

    // ── Paragraph spacing ─────────────────────────────────────────────────────
    setParagraphSpacing: function (spacing) {
      var c = _getContainer();
      if (!c) return;
      var sp = PARAGRAPH_SPACINGS[spacing];
      if (sp) {
        // Apply to all existing and future p tags via CSS variable
        c.style.setProperty('--prose-paragraph-gap', sp);
        _spacing = spacing;
      } else {
        console.warn('[ProseDisplay] Unknown spacing:', spacing);
      }
    },

    // ── Getters ───────────────────────────────────────────────────────────────
    getCurrentTheme: function ()   { return _currentTheme; },
    getCurrentFontSize: function () { return _fontSize; },
    getCurrentSpacing: function ()  { return _spacing; }
  };

  // Expose global
  global.ProseDisplay = ProseDisplay;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/prose-display.js
