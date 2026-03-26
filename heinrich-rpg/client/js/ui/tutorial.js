// FILE: client/js/ui/tutorial.js — PART 10

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────

  var STORAGE_KEY = 'heinrich_tutorial_complete';
  var STEP_KEY    = 'heinrich_tutorial_step';

  var STEPS = [
    {
      id:      'welcome',
      title:   'Welcome, Heinrich Renard',
      content: 'You are Heinrich Renard, an 18-year-old peasant in Normandy, 1403. ' +
               'This is your story — shaped entirely by your choices, narrated by an AI storyteller. ' +
               'No two playthroughs are the same.',
      target:  null,   // full-screen overlay
      position:'center'
    },
    {
      id:      'session-key',
      title:   'Your Session Key',
      content: 'This is your session key. <strong>Write it down or copy it somewhere safe.</strong> ' +
               'It\'s the only way to resume your game later. Treat it like a password.',
      target:  '[data-tutorial="session-key"]',
      position:'bottom'
    },
    {
      id:      'prose-window',
      title:   'The Prose Window',
      content: 'Your story unfolds here. Every action you take is narrated by an AI storyteller ' +
               'in rich, literary prose. Scroll up to re-read previous scenes.',
      target:  '[data-tutorial="prose-window"]',
      position:'right'
    },
    {
      id:      'stats-panel',
      title:   'Your Vital Statistics',
      content: 'Watch your <strong>Health</strong>, <strong>Hunger</strong>, <strong>Fatigue</strong>, ' +
               'and <strong>Morale</strong> — they affect everything. A starving man fights poorly. ' +
               'An exhausted man makes bad decisions.',
      target:  '[data-tutorial="stats-panel"]',
      position:'right'
    },
    {
      id:      'info-panel',
      title:   'The Information Panel',
      content: 'Tabs here hold your <strong>NPCs</strong>, <strong>Inventory</strong>, <strong>Skills</strong>, ' +
               '<strong>Memory Palace</strong>, <strong>Consequences</strong>, <strong>Map</strong>, and <strong>Journal</strong>. ' +
               'Explore them often — information is your most powerful tool.',
      target:  '[data-tutorial="info-panel"]',
      position:'left'
    },
    {
      id:      'input-bar',
      title:   'The Input Bar',
      content: 'Type what you want to do here, or select one of the suggested actions. ' +
               'Be specific — the AI understands natural language. ' +
               '"I approach the miller and ask about the grain shortage" works better than "talk to miller."',
      target:  '[data-tutorial="input-bar"]',
      position:'top'
    },
    {
      id:      'skill-checks',
      title:   'Skill Checks',
      content: 'When you attempt something difficult, the game rolls dice behind the scenes. ' +
               'Your skills and current condition modify the outcome. ' +
               'You\'ll see the result shown like this in the narrative.',
      target:  '[data-tutorial="skill-check-example"]',
      position:'top',
      fallback: 'prose-window'
    },
    {
      id:      'consequences',
      title:   'Consequences',
      content: 'Your choices have consequences — some immediate, some delayed by days or years. ' +
               'The <strong>Consequences</strong> tab tracks every active thread. ' +
               'Some consequences can be resolved; a few will follow Heinrich forever.',
      target:  '[data-tutorial="consequences-tab"]',
      position:'left',
      fallback: 'info-panel'
    },
    {
      id:      'first-action',
      title:   'Your First Action',
      content: 'You\'re standing in a Norman village at dawn, the year 1403. ' +
               'The world is waking around you. <strong>What will you do?</strong> ' +
               'Type your first action below, and let your story begin.',
      target:  '[data-tutorial="input-bar"]',
      position:'top'
    },
    {
      id:      'done',
      title:   'You\'re Ready',
      content: 'That\'s everything you need to know. ' +
               'Write your story. Make choices that matter. ' +
               '<strong>The world will remember Heinrich Renard.</strong>',
      target:  null,
      position:'center'
    }
  ];

  // ─── Tutorial IIFE ────────────────────────────────────────────────────────

  var Tutorial = (function () {

    var _currentStepIndex = 0;
    var _active           = false;
    var _spotlightEl      = null;
    var _tooltipEl        = null;
    var _backdropEl       = null;
    var _dotsEl           = null;

    // ── CSS injection ────────────────────────────────────────────────────────

    function _injectStyles() {
      if (document.getElementById('tutorial-styles')) return;
      var style = document.createElement('style');
      style.id = 'tutorial-styles';
      style.textContent = [
        /* Backdrop */
        '#tutorial-backdrop { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.75); z-index:8000; pointer-events:all; transition:opacity 0.25s; }',
        '#tutorial-backdrop.tut-hidden { opacity:0; pointer-events:none; }',
        /* Spotlight cutout using box-shadow */
        '#tutorial-spotlight { position:fixed; z-index:8001; border-radius:6px; box-shadow:0 0 0 9999px rgba(0,0,0,0.75), 0 0 0 3px rgba(255,255,255,0.6), 0 0 20px 4px rgba(255,255,255,0.25); pointer-events:none; transition:all 0.3s cubic-bezier(0.4,0,0.2,1); }',
        '#tutorial-spotlight.tut-hidden { opacity:0; }',
        /* Tooltip */
        '#tutorial-tooltip { position:fixed; z-index:8002; background:#1a1410; border:1px solid rgba(212,175,55,0.5); border-radius:8px; box-shadow:0 8px 32px rgba(0,0,0,0.7); padding:16px 18px; width:320px; max-width:calc(100vw - 32px); color:#e8d5b0; animation:tut-tooltip-in 0.25s ease; }',
        '@keyframes tut-tooltip-in { from { opacity:0; transform:translateY(8px); } to { opacity:1; transform:translateY(0); } }',
        '#tutorial-tooltip.tut-hidden { display:none; }',
        '.tut-tooltip-arrow { position:absolute; width:10px; height:10px; background:#1a1410; border:1px solid rgba(212,175,55,0.5); transform:rotate(45deg); }',
        '.tut-arrow-top    { bottom:-6px; left:50%; transform:translateX(-50%) rotate(45deg); border-top:none; border-left:none; }',
        '.tut-arrow-bottom { top:-6px; left:50%; transform:translateX(-50%) rotate(45deg); border-bottom:none; border-right:none; }',
        '.tut-arrow-left   { right:-6px; top:50%; transform:translateY(-50%) rotate(45deg); border-top:none; border-right:none; }',
        '.tut-arrow-right  { left:-6px; top:50%; transform:translateY(-50%) rotate(45deg); border-bottom:none; border-left:none; }',
        '.tut-tooltip-header { display:flex; align-items:center; gap:8px; margin-bottom:8px; }',
        '.tut-tooltip-step-num { font-size:0.72rem; color:rgba(212,175,55,0.6); font-weight:bold; }',
        '.tut-tooltip-title { font-size:0.92rem; font-weight:bold; color:#d4af37; flex:1; }',
        '.tut-tooltip-content { font-size:0.83rem; line-height:1.6; color:rgba(232,213,176,0.88); margin-bottom:14px; }',
        '.tut-tooltip-content strong { color:#e8d5b0; }',
        '.tut-tooltip-actions { display:flex; align-items:center; gap:8px; }',
        '.tut-btn { padding:6px 14px; border-radius:4px; cursor:pointer; font-size:0.82rem; border:1px solid; transition:all 0.15s; font-family:inherit; white-space:nowrap; }',
        '.tut-btn-primary { background:rgba(212,175,55,0.2); border-color:#d4af37; color:#d4af37; }',
        '.tut-btn-primary:hover { background:rgba(212,175,55,0.35); }',
        '.tut-btn-skip { background:none; border-color:rgba(255,255,255,0.2); color:rgba(232,213,176,0.4); font-size:0.75rem; padding:4px 10px; }',
        '.tut-btn-skip:hover { color:rgba(232,213,176,0.8); border-color:rgba(255,255,255,0.4); }',
        '.tut-dot-row { display:flex; gap:5px; justify-content:center; margin-top:12px; }',
        '.tut-dot { width:7px; height:7px; border-radius:50%; background:rgba(255,255,255,0.2); transition:background 0.2s; cursor:pointer; }',
        '.tut-dot-active { background:#d4af37; }',
        '.tut-dot-done { background:rgba(212,175,55,0.4); }',
        /* Center overlay panel */
        '#tutorial-center-panel { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:8002; background:#1a1410; border:1px solid rgba(212,175,55,0.5); border-radius:10px; box-shadow:0 16px 48px rgba(0,0,0,0.8); padding:28px 30px; width:460px; max-width:calc(100vw - 32px); text-align:center; color:#e8d5b0; animation:tut-tooltip-in 0.3s ease; }',
        '#tutorial-center-panel.tut-hidden { display:none; }',
        '.tut-center-icon { font-size:2.5rem; margin-bottom:12px; }',
        '.tut-center-title { font-size:1.15rem; font-weight:bold; color:#d4af37; margin-bottom:10px; }',
        '.tut-center-content { font-size:0.88rem; line-height:1.7; color:rgba(232,213,176,0.85); margin-bottom:20px; }',
        '.tut-center-content strong { color:#e8d5b0; }',
        '.tut-center-actions { display:flex; justify-content:center; gap:10px; flex-wrap:wrap; }'
      ].join('\n');
      document.head.appendChild(style);
    }

    // ── DOM helpers ──────────────────────────────────────────────────────────

    function _el(tag, id, className, html) {
      var el = document.createElement(tag);
      if (id) el.id = id;
      if (className) el.className = className;
      if (html !== undefined) el.innerHTML = html;
      return el;
    }

    // ── Create DOM elements ───────────────────────────────────────────────────

    function _createElements() {
      // Backdrop
      if (!document.getElementById('tutorial-backdrop')) {
        _backdropEl = _el('div', 'tutorial-backdrop', 'tut-hidden');
        _backdropEl.addEventListener('click', function (e) {
          if (e.target === _backdropEl) {
            // Allow clicking backdrop on center steps to advance
            var step = STEPS[_currentStepIndex];
            if (step && step.target === null) Tutorial.next();
          }
        });
        document.body.appendChild(_backdropEl);
      } else {
        _backdropEl = document.getElementById('tutorial-backdrop');
      }

      // Spotlight
      if (!document.getElementById('tutorial-spotlight')) {
        _spotlightEl = _el('div', 'tutorial-spotlight', 'tut-hidden');
        document.body.appendChild(_spotlightEl);
      } else {
        _spotlightEl = document.getElementById('tutorial-spotlight');
      }

      // Tooltip
      if (!document.getElementById('tutorial-tooltip')) {
        _tooltipEl = _el('div', 'tutorial-tooltip', 'tut-hidden');
        document.body.appendChild(_tooltipEl);
      } else {
        _tooltipEl = document.getElementById('tutorial-tooltip');
      }

      // Center panel
      if (!document.getElementById('tutorial-center-panel')) {
        var centerEl = _el('div', 'tutorial-center-panel', 'tut-hidden');
        document.body.appendChild(centerEl);
      }
    }

    // ── Position helpers ──────────────────────────────────────────────────────

    function _getTargetRect(selector) {
      if (!selector) return null;
      var el = document.querySelector(selector);
      if (!el) return null;
      var rect = el.getBoundingClientRect();
      return { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
    }

    function _positionSpotlight(rect) {
      var pad = 6;
      if (!_spotlightEl) return;
      _spotlightEl.classList.remove('tut-hidden');
      _spotlightEl.style.top    = (rect.top  - pad) + 'px';
      _spotlightEl.style.left   = (rect.left - pad) + 'px';
      _spotlightEl.style.width  = (rect.width  + pad * 2) + 'px';
      _spotlightEl.style.height = (rect.height + pad * 2) + 'px';
    }

    function _hideSpotlight() {
      if (_spotlightEl) _spotlightEl.classList.add('tut-hidden');
    }

    function _positionTooltip(rect, position, step, stepIndex) {
      if (!_tooltipEl) return;
      _tooltipEl.className = '';
      _tooltipEl.innerHTML = '';

      var total   = STEPS.length;
      var isLast  = stepIndex >= total - 1;
      var isFirst = stepIndex === 0;

      // Arrow element
      var arrowClass = { top:'tut-arrow-top', bottom:'tut-arrow-bottom', left:'tut-arrow-left', right:'tut-arrow-right' };

      // Build content
      var header = _el('div', null, 'tut-tooltip-header');
      header.innerHTML =
        '<span class="tut-tooltip-step-num">Step ' + (stepIndex + 1) + ' / ' + total + '</span>' +
        '<span class="tut-tooltip-title">' + _esc(step.title) + '</span>';
      _tooltipEl.appendChild(header);

      var content = _el('div', null, 'tut-tooltip-content');
      content.innerHTML = step.content; // trusted internal content
      _tooltipEl.appendChild(content);

      var actions = _el('div', null, 'tut-tooltip-actions');

      var skipBtn = _el('button', null, 'tut-btn tut-btn-skip', 'Skip Tutorial');
      skipBtn.addEventListener('click', Tutorial.skip);
      actions.appendChild(skipBtn);

      var nextBtn = _el('button', null, 'tut-btn tut-btn-primary', isLast ? '✔ Done' : 'Next →');
      nextBtn.addEventListener('click', isLast ? Tutorial.complete : Tutorial.next);
      actions.appendChild(nextBtn);

      _tooltipEl.appendChild(actions);

      // Dots
      var dotRow = _el('div', null, 'tut-dot-row');
      for (var i = 0; i < total; i++) {
        var dot = _el('span', null, 'tut-dot' + (i === stepIndex ? ' tut-dot-active' : i < stepIndex ? ' tut-dot-done' : ''));
        (function (idx) {
          dot.addEventListener('click', function () { Tutorial.showStep(STEPS[idx].id); });
        }(i));
        dotRow.appendChild(dot);
      }
      _tooltipEl.appendChild(dotRow);

      // Arrow
      var arrow = _el('div', null, 'tut-tooltip-arrow ' + (arrowClass[position] || 'tut-arrow-bottom'));
      _tooltipEl.appendChild(arrow);

      // Position the tooltip
      document.body.appendChild(_tooltipEl); // ensure in DOM for sizing
      var tw = _tooltipEl.offsetWidth  || 320;
      var th = _tooltipEl.offsetHeight || 160;
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      var pad = 12;

      var top, left;

      switch (position) {
        case 'bottom':
          top  = rect.top + rect.height + 14;
          left = rect.left + (rect.width / 2) - (tw / 2);
          break;
        case 'top':
          top  = rect.top - th - 14;
          left = rect.left + (rect.width / 2) - (tw / 2);
          break;
        case 'right':
          top  = rect.top + (rect.height / 2) - (th / 2);
          left = rect.left + rect.width + 14;
          break;
        case 'left':
          top  = rect.top + (rect.height / 2) - (th / 2);
          left = rect.left - tw - 14;
          break;
        default:
          top  = rect.top + rect.height + 14;
          left = rect.left + (rect.width / 2) - (tw / 2);
      }

      // Clamp to viewport
      if (left + tw > vw - pad) left = vw - tw - pad;
      if (left < pad) left = pad;
      if (top + th > vh - pad) top = vh - th - pad;
      if (top < pad) top = pad;

      _tooltipEl.style.top  = top  + 'px';
      _tooltipEl.style.left = left + 'px';
      _tooltipEl.classList.remove('tut-hidden');
    }

    function _hideTooltip() {
      if (_tooltipEl) _tooltipEl.classList.add('tut-hidden');
    }

    // ── Center panel ──────────────────────────────────────────────────────────

    function _showCenterPanel(step, stepIndex) {
      var panel = document.getElementById('tutorial-center-panel');
      if (!panel) return;

      var total  = STEPS.length;
      var isLast = stepIndex >= total - 1;

      var centerIcons = {
        welcome:      '⚔️',
        done:         '🏰',
        'first-action': '✍️'
      };
      var icon = centerIcons[step.id] || '📜';

      panel.innerHTML =
        '<div class="tut-center-icon">' + icon + '</div>' +
        '<div class="tut-center-title">' + _esc(step.title) + '</div>' +
        '<div class="tut-center-content">' + step.content + '</div>' +
        '<div class="tut-center-actions"></div>';

      // Step dots
      var dotRow = _el('div', null, 'tut-dot-row');
      dotRow.style.marginTop = '0';
      dotRow.style.marginBottom = '14px';
      for (var i = 0; i < total; i++) {
        var dot = _el('span', null, 'tut-dot' + (i === stepIndex ? ' tut-dot-active' : i < stepIndex ? ' tut-dot-done' : ''));
        (function (idx) {
          dot.addEventListener('click', function () { Tutorial.showStep(STEPS[idx].id); });
        }(i));
        dotRow.appendChild(dot);
      }
      var contentEl = panel.querySelector('.tut-center-content');
      panel.insertBefore(dotRow, contentEl.nextSibling);

      var actionsEl = panel.querySelector('.tut-center-actions');

      if (!isLast) {
        var skipBtn = _el('button', null, 'tut-btn tut-btn-skip', 'Skip Tutorial');
        skipBtn.addEventListener('click', Tutorial.skip);
        actionsEl.appendChild(skipBtn);
      }

      var nextBtn = _el('button', null, 'tut-btn tut-btn-primary',
        isLast ? '✔ Begin Your Story' : 'Next →');
      nextBtn.addEventListener('click', isLast ? Tutorial.complete : Tutorial.next);
      actionsEl.appendChild(nextBtn);

      panel.classList.remove('tut-hidden');
    }

    function _hideCenterPanel() {
      var panel = document.getElementById('tutorial-center-panel');
      if (panel) panel.classList.add('tut-hidden');
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    function _esc(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function _scrollIntoView(selector) {
      if (!selector) return;
      var el = document.querySelector(selector);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // ── Save progress ─────────────────────────────────────────────────────────

    function _saveProgress(stepIndex) {
      try { localStorage.setItem(STEP_KEY, String(stepIndex)); } catch (e) {}
    }

    function _loadProgress() {
      try {
        var s = localStorage.getItem(STEP_KEY);
        if (s !== null) return parseInt(s, 10) || 0;
      } catch (e) {}
      return 0;
    }

    // ── Core step display ─────────────────────────────────────────────────────

    function _displayStep(stepIndex) {
      if (stepIndex < 0 || stepIndex >= STEPS.length) return;

      _currentStepIndex = stepIndex;
      _saveProgress(stepIndex);

      var step = STEPS[stepIndex];

      // Ensure elements created
      _createElements();

      // Show backdrop
      if (_backdropEl) _backdropEl.classList.remove('tut-hidden');

      // Determine target
      var selector = step.target;
      var rect     = _getTargetRect(selector);

      // Fallback target
      if (!rect && step.fallback) {
        var fallbackSel = '[data-tutorial="' + step.fallback + '"]';
        rect = _getTargetRect(fallbackSel);
      }

      if (step.target === null) {
        // Center panel
        _hideSpotlight();
        _hideTooltip();
        _showCenterPanel(step, stepIndex);
      } else if (rect) {
        _scrollIntoView(selector);
        setTimeout(function () {
          var r2 = _getTargetRect(selector) || rect;
          _hideCenterPanel();
          _positionSpotlight(r2);
          _positionTooltip(r2, step.position || 'bottom', step, stepIndex);
          _hideTooltip(); // will be shown by positionTooltip
          _positionTooltip(r2, step.position || 'bottom', step, stepIndex);
        }, 150);
      } else {
        // Target not found — show as center
        _hideSpotlight();
        _hideTooltip();
        _showCenterPanel(step, stepIndex);
      }

      // Fire event
      document.dispatchEvent(new CustomEvent('tutorial:step', { detail: { stepId: step.id, stepIndex: stepIndex } }));
    }

    // ── Window resize ─────────────────────────────────────────────────────────

    var _resizeTimer = null;
    function _onResize() {
      clearTimeout(_resizeTimer);
      _resizeTimer = setTimeout(function () {
        if (_active) _displayStep(_currentStepIndex);
      }, 200);
    }

    // ── Public API ────────────────────────────────────────────────────────────

    var Tutorial = {

      init: function () {
        _injectStyles();
        _createElements();

        window.addEventListener('resize', _onResize);

        // Keyboard navigation
        document.addEventListener('keydown', function (e) {
          if (!_active) return;
          if (e.key === 'ArrowRight' || e.key === 'Enter') {
            if (document.activeElement && document.activeElement.tagName === 'INPUT') return;
            Tutorial.next();
          }
          if (e.key === 'ArrowLeft') Tutorial.showStep(STEPS[Math.max(0, _currentStepIndex - 1)].id);
          if (e.key === 'Escape') Tutorial.skip();
        });
      },

      isFirstTime: function () {
        try {
          return !localStorage.getItem(STORAGE_KEY);
        } catch (e) {
          return true;
        }
      },

      start: function () {
        _active = true;
        var savedStep = _loadProgress();
        // Don't resume from the last step — restart from welcome
        if (savedStep >= STEPS.length - 1) savedStep = 0;
        _displayStep(savedStep);
        document.dispatchEvent(new CustomEvent('tutorial:started'));
      },

      next: function () {
        if (!_active) return;
        var nextIndex = _currentStepIndex + 1;
        if (nextIndex >= STEPS.length) {
          Tutorial.complete();
        } else {
          _displayStep(nextIndex);
        }
      },

      skip: function () {
        _active = false;
        _hideSpotlight();
        _hideTooltip();
        _hideCenterPanel();
        if (_backdropEl) _backdropEl.classList.add('tut-hidden');
        try { localStorage.setItem(STORAGE_KEY, 'skipped'); } catch (e) {}
        document.dispatchEvent(new CustomEvent('tutorial:skipped'));
      },

      complete: function () {
        _active = false;
        _hideSpotlight();
        _hideTooltip();
        _hideCenterPanel();
        if (_backdropEl) _backdropEl.classList.add('tut-hidden');
        try {
          localStorage.setItem(STORAGE_KEY, 'complete');
          localStorage.removeItem(STEP_KEY);
        } catch (e) {}
        document.dispatchEvent(new CustomEvent('tutorial:complete'));
      },

      reset: function () {
        try {
          localStorage.removeItem(STORAGE_KEY);
          localStorage.removeItem(STEP_KEY);
        } catch (e) {}
        _currentStepIndex = 0;
        _active = false;
        _hideSpotlight();
        _hideTooltip();
        _hideCenterPanel();
        if (_backdropEl) _backdropEl.classList.add('tut-hidden');
      },

      showStep: function (stepId) {
        var idx = -1;
        for (var i = 0; i < STEPS.length; i++) {
          if (STEPS[i].id === stepId) { idx = i; break; }
        }
        if (idx === -1) {
          // Try numeric
          var n = parseInt(stepId, 10);
          if (!isNaN(n) && n >= 0 && n < STEPS.length) idx = n;
        }
        if (idx === -1) return;
        _active = true;
        _displayStep(idx);
      },

      hideStep: function () {
        _hideSpotlight();
        _hideTooltip();
        _hideCenterPanel();
        if (_backdropEl) _backdropEl.classList.add('tut-hidden');
      },

      getProgress: function () {
        var total   = STEPS.length;
        var current = _currentStepIndex + 1;
        return {
          current:    current,
          total:      total,
          percentage: Math.round((current / total) * 100),
          stepId:     STEPS[_currentStepIndex] ? STEPS[_currentStepIndex].id : null
        };
      },

      getSteps: function () {
        return STEPS.slice();
      },

      isActive: function () {
        return _active;
      }
    };

    return Tutorial;
  }());

  global.Tutorial = Tutorial;

}(window));

// END FILE: client/js/ui/tutorial.js
