// FILE: client/js/ui/council-view.js — PART 10
// Council/Advisor management panel for The Fate of Heinrich.
// IIFE pattern — exposes global `CouncilView`.

(function (global) {
  'use strict';

  // ═══════════════════════════════════════════ Constants ══════════════════════════════════════════

  var POSITIONS = ['steward', 'marshal', 'chancellor', 'spymaster', 'chaplain', 'master_builder', 'physician'];

  var POSITION_META = {
    steward: {
      title:       'Steward',
      icon:        '📜',
      description: 'Manages your finances and estates',
      keyStat:     'stewardship',
      keyStatLabel:'Stewardship',
      color:       '#c8a96e'
    },
    marshal: {
      title:       'Marshal',
      icon:        '⚔️',
      description: 'Commands your military forces and garrison',
      keyStat:     'tactics',
      keyStatLabel:'Tactics',
      color:       '#b94a4a'
    },
    chancellor: {
      title:       'Chancellor',
      icon:        '🖋️',
      description: 'Handles diplomatic correspondence and legal matters',
      keyStat:     'law',
      keyStatLabel:'Law',
      color:       '#4a7ab9'
    },
    spymaster: {
      title:       'Spymaster',
      icon:        '🕵️',
      description: 'Runs your intelligence network and counter-espionage',
      keyStat:     'espionage',
      keyStatLabel:'Espionage',
      color:       '#6a4a8c'
    },
    chaplain: {
      title:       'Chaplain',
      icon:        '✝️',
      description: 'Advises on religious matters and your soul',
      keyStat:     'theology',
      keyStatLabel:'Theology',
      color:       '#e8d87a'
    },
    master_builder: {
      title:       'Master Builder',
      icon:        '🏗️',
      description: 'Oversees construction and infrastructure',
      keyStat:     'engineering',
      keyStatLabel:'Engineering',
      color:       '#7a9c5a'
    },
    physician: {
      title:       'Physician',
      icon:        '⚕️',
      description: 'Maintains your health and that of your household',
      keyStat:     'medicine',
      keyStatLabel:'Medicine',
      color:       '#4ab9a0'
    }
  };

  var MOOD_CONFIG = {
    satisfied: { label: 'Satisfied', icon: '😊', cls: 'mood-satisfied' },
    concerned:  { label: 'Concerned',  icon: '😐', cls: 'mood-concerned'  },
    worried:    { label: 'Worried',    icon: '😟', cls: 'mood-worried'    },
    unknown:    { label: 'Unknown',    icon: '❓', cls: 'mood-unknown'    }
  };

  // Classes that unlock a formal council
  var COUNCIL_UNLOCK_CLASSES = ['Knight', 'Baron', 'Viscount', 'Count', 'Duke', 'Prince', 'King', 'Lord'];

  // ═══════════════════════════════════════════ State ══════════════════════════════════════════════

  var _containerId      = null;
  var _container        = null;
  var _councilState     = {};
  var _npcsState        = {};
  var _currentPosition  = null;
  var _adviceVisible    = {};   // position → bool
  var _initialized      = false;

  // ═══════════════════════════════════════════ Helpers ════════════════════════════════════════════

  function _el(id) {
    return document.getElementById(id);
  }

  function _qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function _qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function _make(tag, cls, innerHTML) {
    var el = document.createElement(tag);
    if (cls)       el.className   = cls;
    if (innerHTML) el.innerHTML   = innerHTML;
    return el;
  }

  function _clamp(v, min, max) {
    return Math.min(max, Math.max(min, v));
  }

  function _escHtml(str) {
    return String(str)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')
      .replace(/'/g, '&#039;');
  }

  function _getInitials(name) {
    if (!name) return '?';
    var parts = String(name).trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return String(name).slice(0, 2).toUpperCase();
  }

  function _hasCouncilAccess(councilState) {
    var cls = (councilState && councilState.playerClass) || '';
    return COUNCIL_UNLOCK_CLASSES.indexOf(cls) !== -1;
  }

  function _getMood(advisorData, councilState) {
    if (advisorData && advisorData.mood) {
      return MOOD_CONFIG[advisorData.mood] || MOOD_CONFIG.unknown;
    }
    // derive from loyalty if no explicit mood
    var loyalty = (advisorData && advisorData.loyalty) || 50;
    if (loyalty >= 70) return MOOD_CONFIG.satisfied;
    if (loyalty >= 40) return MOOD_CONFIG.concerned;
    return MOOD_CONFIG.worried;
  }

  function _getLoyaltyClass(loyalty) {
    if (loyalty >= 70) return 'loyalty-high';
    if (loyalty >= 40) return 'loyalty-mid';
    return 'loyalty-low';
  }

  function _getNpcById(npcId) {
    if (!_npcsState) return null;
    if (Array.isArray(_npcsState)) {
      for (var i = 0; i < _npcsState.length; i++) {
        if (_npcsState[i].id === npcId || _npcsState[i].npcId === npcId) return _npcsState[i];
      }
      return null;
    }
    return _npcsState[npcId] || null;
  }

  // ═══════════════════════════════════════════ Render Helpers ═════════════════════════════════════

  function _renderLoyaltyBar(loyalty) {
    var pct = _clamp(loyalty, 0, 100);
    var cls = _getLoyaltyClass(pct);
    return (
      '<div class="loyalty-bar-wrap" title="Loyalty: ' + pct + '/100">' +
        '<div class="loyalty-bar-track">' +
          '<div class="loyalty-bar-fill ' + cls + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="loyalty-label">' + pct + '</span>' +
      '</div>'
    );
  }

  function _renderMoodBadge(mood) {
    return '<span class="mood-badge ' + mood.cls + '">' + mood.icon + ' ' + _escHtml(mood.label) + '</span>';
  }

  function _renderPortraitCircle(name, color) {
    var initials = _getInitials(name);
    return (
      '<div class="portrait-circle" style="background:' + (color || '#888') + '">' +
        '<span class="portrait-initials">' + _escHtml(initials) + '</span>' +
      '</div>'
    );
  }

  function _renderFilledPosition(position, advisor, npc, councilState) {
    var meta   = POSITION_META[position];
    var mood   = _getMood(advisor, councilState);
    var npcName = (npc && npc.name) || (advisor && advisor.name) || 'Unknown';
    var loyalty = (advisor && advisor.loyalty != null) ? advisor.loyalty : 50;
    var keyStatVal = 0;
    if (npc && npc.skills) keyStatVal = npc.skills[meta.keyStat] || 0;
    else if (npc && npc.stats) keyStatVal = npc.stats[meta.keyStat] || 0;
    var adviceText = (advisor && advisor.currentAdvice) ? advisor.currentAdvice : '';

    return (
      '<div class="council-position filled" data-position="' + position + '">' +
        '<div class="position-header">' +
          '<span class="position-icon">' + meta.icon + '</span>' +
          '<div class="position-titles">' +
            '<span class="position-title">' + _escHtml(meta.title) + '</span>' +
            '<span class="npc-name">' + _escHtml(npcName) + '</span>' +
          '</div>' +
          _renderMoodBadge(mood) +
        '</div>' +
        '<div class="position-body">' +
          _renderPortraitCircle(npcName, meta.color) +
          '<div class="position-stats">' +
            '<div class="stat-row">' +
              '<span class="stat-label">' + _escHtml(meta.keyStatLabel) + '</span>' +
              '<span class="stat-value">' + keyStatVal + '</span>' +
            '</div>' +
            '<div class="stat-row">' +
              '<span class="stat-label">Loyalty</span>' +
              _renderLoyaltyBar(loyalty) +
            '</div>' +
          '</div>' +
        '</div>' +
        (adviceText ?
          '<div class="position-advice" data-position="' + position + '">' +
            '<span class="advice-speaker">' + _escHtml(npcName) + ' the ' + _escHtml(meta.title) + ' advises:</span>' +
            '<p class="advice-text">&ldquo;' + _escHtml(adviceText) + '&rdquo;</p>' +
          '</div>' : '') +
        '<div class="position-actions">' +
          '<button class="btn-small btn-detail" data-position="' + position + '">View Details</button>' +
          '<button class="btn-small btn-advice" data-position="' + position + '">Ask Advice</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderVacantPosition(position) {
    var meta = POSITION_META[position];
    return (
      '<div class="council-position vacant" data-position="' + position + '">' +
        '<div class="position-header">' +
          '<span class="position-icon vacant-icon">' + meta.icon + '</span>' +
          '<div class="position-titles">' +
            '<span class="position-title">' + _escHtml(meta.title) + '</span>' +
            '<span class="vacant-label">VACANT</span>' +
          '</div>' +
        '</div>' +
        '<div class="position-body vacant-body">' +
          '<p class="vacant-description">' + _escHtml(meta.description) + '</p>' +
          '<button class="btn-appoint" data-position="' + position + '">⚑ Appoint Advisor</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderLockedPanel() {
    return (
      '<div class="council-locked">' +
        '<div class="locked-icon">🏰</div>' +
        '<h3 class="locked-title">Formal Council Unavailable</h3>' +
        '<p class="locked-desc">' +
          'Only a Knight or higher may maintain a formal council of advisors. ' +
          'Earn the rank of Knight — through combat, service, or patronage — ' +
          'to assemble advisors and govern your holdings.' +
        '</p>' +
        '<div class="locked-hint">Current rank grants no council privileges.</div>' +
      '</div>'
    );
  }

  function _renderCouncilGrid(councilState) {
    var html = '<div class="council-grid">';
    for (var i = 0; i < POSITIONS.length; i++) {
      var position = POSITIONS[i];
      var advisor  = councilState[position] || null;
      if (advisor && (advisor.npcId || advisor.name)) {
        var npc = advisor.npcId ? _getNpcById(advisor.npcId) : null;
        html += _renderFilledPosition(position, advisor, npc, councilState);
      } else {
        html += _renderVacantPosition(position);
      }
    }
    html += '</div>';
    return html;
  }

  function _renderCouncilSummary(councilState) {
    var filled = 0;
    for (var i = 0; i < POSITIONS.length; i++) {
      var a = councilState[POSITIONS[i]];
      if (a && (a.npcId || a.name)) filled++;
    }
    var total = POSITIONS.length;
    return (
      '<div class="council-summary">' +
        '<span class="council-summary-label">Council Strength</span>' +
        '<span class="council-summary-filled">' + filled + ' / ' + total + ' positions filled</span>' +
        '<div class="council-summary-bar-track">' +
          '<div class="council-summary-bar-fill" style="width:' + Math.round((filled / total) * 100) + '%"></div>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderAdvisorDetailModal(position, advisor, npc, councilState) {
    var meta    = POSITION_META[position];
    var npcName = (npc && npc.name) || (advisor && advisor.name) || 'Unknown';
    var loyalty = (advisor && advisor.loyalty != null) ? advisor.loyalty : 50;
    var mood    = _getMood(advisor, councilState);
    var background = (npc && npc.background) || (advisor && advisor.background) || 'Nothing is known of this advisor\'s past.';
    var personality = (npc && npc.personality) || (advisor && advisor.personality) || '';
    var traits  = (npc && npc.traits) || (advisor && advisor.traits) || [];
    var keyStatVal = 0;
    if (npc && npc.skills) keyStatVal = npc.skills[meta.keyStat] || 0;
    else if (npc && npc.stats) keyStatVal = npc.stats[meta.keyStat] || 0;

    var traitsHtml = '';
    if (traits.length) {
      traitsHtml = '<div class="detail-traits">';
      for (var i = 0; i < traits.length; i++) {
        traitsHtml += '<span class="trait-badge">' + _escHtml(traits[i]) + '</span>';
      }
      traitsHtml += '</div>';
    }

    var skillsHtml = '';
    var npcSkills = (npc && (npc.skills || npc.stats)) || {};
    var skillKeys = Object.keys(npcSkills);
    if (skillKeys.length) {
      skillsHtml = '<div class="detail-skills"><h4>Skills</h4><div class="skills-grid">';
      for (var s = 0; s < skillKeys.length; s++) {
        var sk = skillKeys[s];
        var sv = npcSkills[sk];
        skillsHtml += (
          '<div class="skill-entry">' +
            '<span class="skill-name">' + _escHtml(sk) + '</span>' +
            '<span class="skill-val">' + sv + '</span>' +
          '</div>'
        );
      }
      skillsHtml += '</div></div>';
    }

    return (
      '<div class="advisor-detail-modal" id="advisor-detail-modal">' +
        '<div class="modal-backdrop" id="council-modal-backdrop"></div>' +
        '<div class="modal-content">' +
          '<button class="modal-close" id="council-modal-close">✕</button>' +
          '<div class="modal-header" style="border-color:' + meta.color + '">' +
            _renderPortraitCircle(npcName, meta.color) +
            '<div class="modal-header-text">' +
              '<h2>' + _escHtml(npcName) + '</h2>' +
              '<p class="modal-subtitle">' + meta.icon + ' ' + _escHtml(meta.title) + '</p>' +
              _renderMoodBadge(mood) +
            '</div>' +
          '</div>' +
          '<div class="modal-body">' +
            '<div class="detail-section">' +
              '<h4>Background</h4>' +
              '<p>' + _escHtml(background) + '</p>' +
            '</div>' +
            (personality ? '<div class="detail-section"><h4>Personality</h4><p>' + _escHtml(personality) + '</p></div>' : '') +
            traitsHtml +
            '<div class="detail-section">' +
              '<h4>Key Stat: ' + _escHtml(meta.keyStatLabel) + '</h4>' +
              '<span class="big-stat">' + keyStatVal + '</span>' +
            '</div>' +
            '<div class="detail-section">' +
              '<h4>Loyalty</h4>' +
              _renderLoyaltyBar(loyalty) +
            '</div>' +
            skillsHtml +
            '<div class="detail-section">' +
              '<h4>Role</h4>' +
              '<p>' + _escHtml(meta.description) + '</p>' +
            '</div>' +
          '</div>' +
          '<div class="modal-footer">' +
            '<button class="btn-small btn-dismiss-advisor" data-position="' + position + '">Dismiss Advisor</button>' +
            '<button class="btn-small btn-ask-advice" data-position="' + position + '">Ask for Advice</button>' +
            '<button class="btn-small" id="council-modal-close-btn">Close</button>' +
          '</div>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderAdvicePanel(position, advisor, npc, situation) {
    var meta    = POSITION_META[position];
    var npcName = (npc && npc.name) || (advisor && advisor.name) || 'Your ' + meta.title;
    var advice  = (advisor && advisor.currentAdvice) || (advisor && advisor.advice) || 'Your advisor has nothing to say at this time.';
    if (situation && advisor && advisor.situationalAdvice && advisor.situationalAdvice[situation]) {
      advice = advisor.situationalAdvice[situation];
    }
    return (
      '<div class="advice-entry" data-position="' + position + '">' +
        '<span class="advice-badge" style="background:' + meta.color + '">' + meta.icon + '</span>' +
        '<div class="advice-content">' +
          '<span class="advice-speaker-name">' + _escHtml(npcName) + ' the ' + _escHtml(meta.title) + ' advises:</span>' +
          '<p class="advice-text">&ldquo;' + _escHtml(advice) + '&rdquo;</p>' +
        '</div>' +
      '</div>'
    );
  }

  // ═══════════════════════════════════════════ Event Binding ══════════════════════════════════════

  function _bindEvents() {
    if (!_container) return;

    _container.addEventListener('click', function (e) {
      var target = e.target || e.srcElement;

      // Detail button
      if (target.classList.contains('btn-detail')) {
        var pos = target.getAttribute('data-position');
        if (pos) CouncilView.showAdvisorDetail(pos);
        return;
      }

      // Ask Advice button (individual)
      if (target.classList.contains('btn-advice') || target.classList.contains('btn-ask-advice')) {
        var pos2 = target.getAttribute('data-position');
        if (pos2) CouncilView.showAdvice(pos2, null);
        return;
      }

      // Appoint advisor
      if (target.classList.contains('btn-appoint')) {
        var pos3 = target.getAttribute('data-position');
        if (pos3) _dispatchEvent('council:appoint', { position: pos3 });
        return;
      }

      // Dismiss advisor
      if (target.classList.contains('btn-dismiss-advisor')) {
        var pos4 = target.getAttribute('data-position');
        if (pos4) {
          if (window.confirm('Are you sure you wish to dismiss this advisor?')) {
            _dispatchEvent('council:dismiss', { position: pos4 });
            _closeModal();
          }
        }
        return;
      }

      // Modal close
      if (target.id === 'council-modal-close' || target.id === 'council-modal-close-btn' || target.id === 'council-modal-backdrop') {
        _closeModal();
        return;
      }
    });
  }

  function _dispatchEvent(name, detail) {
    var evt;
    try {
      evt = new CustomEvent(name, { detail: detail, bubbles: true });
    } catch (ex) {
      evt = document.createEvent('CustomEvent');
      evt.initCustomEvent(name, true, false, detail);
    }
    if (_container) _container.dispatchEvent(evt);
  }

  function _closeModal() {
    var modal = _el('advisor-detail-modal');
    if (modal) modal.parentNode.removeChild(modal);
  }

  // ═══════════════════════════════════════════ Public API ═════════════════════════════════════════

  var CouncilView = {

    /**
     * Initialize the council view.
     * @param {string} containerId - DOM element ID to render into
     */
    init: function (containerId) {
      _containerId = containerId;
      _container   = document.getElementById(containerId);
      if (!_container) {
        console.warn('[CouncilView] Container not found: ' + containerId);
        return;
      }
      _container.classList.add('council-view');
      _initialized = true;
      _bindEvents();
    },

    /**
     * Full render of the council panel.
     * @param {Object} councilState - council positions from game state
     * @param {Object|Array} npcsState - NPC definitions
     */
    render: function (councilState, npcsState) {
      if (!_initialized) {
        console.warn('[CouncilView] Not initialized. Call init() first.');
        return;
      }
      _councilState = councilState || {};
      _npcsState    = npcsState    || {};

      var html = '<div class="council-panel">';
      html += '<div class="council-panel-header">';
      html += '<h2 class="council-panel-title">⚜️ Council of Advisors</h2>';

      if (_hasCouncilAccess(_councilState)) {
        html += '<button class="btn-small btn-all-advice" id="btn-all-advice">Ask All Advisors</button>';
      }
      html += '</div>';

      if (!_hasCouncilAccess(_councilState)) {
        html += _renderLockedPanel();
      } else {
        html += _renderCouncilSummary(_councilState);
        html += _renderCouncilGrid(_councilState);
      }

      html += '<div id="council-advice-board" class="council-advice-board hidden"></div>';
      html += '</div>';

      _container.innerHTML = html;

      // Bind the "Ask All Advisors" button
      var allBtn = _el('btn-all-advice');
      if (allBtn) {
        allBtn.addEventListener('click', function () {
          CouncilView.requestAllAdvice(null);
        });
      }
    },

    /**
     * Update the council panel with new state without full re-render.
     * @param {Object} councilState
     * @param {Object|Array} npcsState
     */
    update: function (councilState, npcsState) {
      _councilState = councilState || _councilState;
      _npcsState    = npcsState    || _npcsState;
      // Re-render the grid in place
      var grid = _qs('.council-grid', _container);
      if (grid) {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = _renderCouncilGrid(_councilState);
        grid.parentNode.replaceChild(tempDiv.firstChild, grid);
      } else {
        CouncilView.render(_councilState, _npcsState);
      }
      // Update summary bar
      var summary = _qs('.council-summary', _container);
      if (summary) {
        var tempSum = document.createElement('div');
        tempSum.innerHTML = _renderCouncilSummary(_councilState);
        summary.parentNode.replaceChild(tempSum.firstChild, summary);
      }
    },

    /**
     * Show detailed modal for an advisor position.
     * @param {string} position - one of POSITIONS
     */
    showAdvisorDetail: function (position) {
      if (!POSITION_META[position]) {
        console.warn('[CouncilView] Unknown position: ' + position);
        return;
      }
      _closeModal(); // close any existing modal

      var advisor = _councilState[position] || null;
      if (!advisor || (!advisor.npcId && !advisor.name)) {
        // Position is vacant — show appoint prompt
        _dispatchEvent('council:appoint', { position: position });
        return;
      }
      var npc = advisor.npcId ? _getNpcById(advisor.npcId) : null;
      var modalHtml = _renderAdvisorDetailModal(position, advisor, npc, _councilState);
      var wrapper   = document.createElement('div');
      wrapper.innerHTML = modalHtml;
      document.body.appendChild(wrapper.firstChild);
      _currentPosition = position;
    },

    /**
     * Show advice from a specific position.
     * @param {string} position - advisor position
     * @param {string|null} situation - optional situation key
     */
    showAdvice: function (position, situation) {
      if (!POSITION_META[position]) return;
      var advisor = _councilState[position] || null;
      if (!advisor || (!advisor.npcId && !advisor.name)) {
        _showToast('The ' + POSITION_META[position].title + ' position is vacant.');
        return;
      }
      var npc = advisor.npcId ? _getNpcById(advisor.npcId) : null;
      var board = _el('council-advice-board');
      if (!board) return;

      // Toggle: if advice already shown for this position, hide it
      var existing = _qs('[data-position="' + position + '"].advice-entry', board);
      if (existing) {
        existing.parentNode.removeChild(existing);
        _adviceVisible[position] = false;
        if (board.children.length === 0) board.classList.add('hidden');
        return;
      }

      board.classList.remove('hidden');
      var entryEl = document.createElement('div');
      entryEl.innerHTML = _renderAdvicePanel(position, advisor, npc, situation);
      board.appendChild(entryEl.firstChild);
      _adviceVisible[position] = true;

      // Dispatch event so engine can generate advice if not pre-computed
      _dispatchEvent('council:requestAdvice', { position: position, situation: situation });
    },

    /**
     * Show advice from ALL filled council positions simultaneously.
     * @param {string|null} situation
     */
    requestAllAdvice: function (situation) {
      var board = _el('council-advice-board');
      if (!board) return;
      board.innerHTML = '';
      board.classList.add('hidden');

      var anyAdvice = false;
      for (var i = 0; i < POSITIONS.length; i++) {
        var position = POSITIONS[i];
        var advisor  = _councilState[position];
        if (!advisor || (!advisor.npcId && !advisor.name)) continue;
        var npc = advisor.npcId ? _getNpcById(advisor.npcId) : null;
        var entryEl = document.createElement('div');
        entryEl.innerHTML = _renderAdvicePanel(position, advisor, npc, situation);
        board.appendChild(entryEl.firstChild);
        _adviceVisible[position] = true;
        anyAdvice = true;
      }

      if (anyAdvice) {
        board.classList.remove('hidden');
        // Add a close button at top
        var closeBtn = document.createElement('button');
        closeBtn.className    = 'btn-small advice-board-close';
        closeBtn.textContent  = '✕ Dismiss Council';
        closeBtn.addEventListener('click', function () {
          board.innerHTML = '';
          board.classList.add('hidden');
          _adviceVisible = {};
        });
        board.insertBefore(closeBtn, board.firstChild);

        _dispatchEvent('council:requestAllAdvice', { situation: situation });
      } else {
        _showToast('No advisors are currently appointed to your council.');
      }
    }
  };

  // ═══════════════════════════════════════════ Toast utility ══════════════════════════════════════

  function _showToast(message) {
    var toast = document.createElement('div');
    toast.className   = 'council-toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(function () { toast.classList.add('visible'); }, 10);
    setTimeout(function () {
      toast.classList.remove('visible');
      setTimeout(function () {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 400);
    }, 3000);
  }

  // ═══════════════════════════════════════════ CSS Injection ══════════════════════════════════════

  (function _injectStyles() {
    if (document.getElementById('council-view-styles')) return;
    var style = document.createElement('style');
    style.id  = 'council-view-styles';
    style.textContent = [
      '.council-view { font-family: inherit; }',
      '.council-panel { display:flex; flex-direction:column; gap:12px; padding:12px; }',
      '.council-panel-header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #c8a96e; padding-bottom:8px; }',
      '.council-panel-title { margin:0; font-size:1.2em; color:#c8a96e; }',
      '.council-summary { display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(200,169,110,0.08); border-radius:6px; }',
      '.council-summary-label { font-size:0.85em; color:#aaa; }',
      '.council-summary-filled { font-size:0.9em; color:#c8a96e; font-weight:bold; }',
      '.council-summary-bar-track { flex:1; height:6px; background:#333; border-radius:3px; overflow:hidden; }',
      '.council-summary-bar-fill { height:100%; background:linear-gradient(to right,#c8a96e,#e8d87a); border-radius:3px; transition:width 0.4s; }',
      '.council-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }',
      '.council-position { background:#1e1e1e; border:1px solid #333; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px; transition:border-color 0.2s; }',
      '.council-position.filled:hover { border-color:#c8a96e; }',
      '.council-position.vacant { border:1px dashed #555; opacity:0.75; }',
      '.position-header { display:flex; align-items:center; gap:10px; }',
      '.position-icon { font-size:1.4em; }',
      '.vacant-icon { opacity:0.4; }',
      '.position-titles { flex:1; display:flex; flex-direction:column; }',
      '.position-title { font-weight:bold; font-size:0.95em; color:#ddd; }',
      '.npc-name { font-size:0.85em; color:#c8a96e; }',
      '.vacant-label { font-size:0.8em; color:#888; letter-spacing:0.08em; }',
      '.position-body { display:flex; align-items:center; gap:12px; }',
      '.vacant-body { flex-direction:column; align-items:flex-start; gap:6px; }',
      '.vacant-description { font-size:0.85em; color:#999; margin:0; font-style:italic; }',
      '.portrait-circle { width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
      '.portrait-initials { color:#fff; font-weight:bold; font-size:0.9em; text-shadow:0 1px 2px rgba(0,0,0,0.5); }',
      '.position-stats { flex:1; display:flex; flex-direction:column; gap:4px; }',
      '.stat-row { display:flex; align-items:center; gap:6px; font-size:0.82em; }',
      '.stat-label { color:#aaa; min-width:70px; }',
      '.stat-value { color:#e8d87a; font-weight:bold; }',
      '.loyalty-bar-wrap { display:flex; align-items:center; gap:6px; flex:1; }',
      '.loyalty-bar-track { flex:1; height:5px; background:#333; border-radius:3px; overflow:hidden; }',
      '.loyalty-bar-fill { height:100%; border-radius:3px; transition:width 0.3s; }',
      '.loyalty-bar-fill.loyalty-high { background:#5c9e5c; }',
      '.loyalty-bar-fill.loyalty-mid  { background:#c8a030; }',
      '.loyalty-bar-fill.loyalty-low  { background:#b94a4a; }',
      '.loyalty-label { font-size:0.78em; color:#aaa; }',
      '.mood-badge { font-size:0.78em; padding:2px 6px; border-radius:10px; white-space:nowrap; }',
      '.mood-satisfied { background:rgba(92,158,92,0.2); color:#8fcf8f; border:1px solid rgba(92,158,92,0.4); }',
      '.mood-concerned  { background:rgba(200,160,48,0.2); color:#e8c060; border:1px solid rgba(200,160,48,0.4); }',
      '.mood-worried    { background:rgba(185,74,74,0.2); color:#e07070; border:1px solid rgba(185,74,74,0.4); }',
      '.mood-unknown    { background:rgba(136,136,136,0.2); color:#aaa; border:1px solid #555; }',
      '.position-advice { background:rgba(200,169,110,0.08); border-left:3px solid #c8a96e; padding:8px 10px; border-radius:0 4px 4px 0; font-size:0.85em; }',
      '.advice-speaker { font-weight:bold; color:#c8a96e; display:block; margin-bottom:4px; }',
      '.advice-text { margin:0; color:#ccc; font-style:italic; line-height:1.5; }',
      '.position-actions { display:flex; gap:8px; margin-top:4px; }',
      '.btn-small { padding:4px 10px; font-size:0.8em; border:1px solid #555; background:#252525; color:#ccc; border-radius:4px; cursor:pointer; transition:background 0.15s,border-color 0.15s; }',
      '.btn-small:hover { background:#333; border-color:#c8a96e; color:#e8d87a; }',
      '.btn-appoint { padding:5px 12px; font-size:0.82em; border:1px solid #c8a96e; background:rgba(200,169,110,0.12); color:#c8a96e; border-radius:4px; cursor:pointer; transition:background 0.15s; }',
      '.btn-appoint:hover { background:rgba(200,169,110,0.25); }',
      '.council-locked { text-align:center; padding:32px 20px; background:#1a1a1a; border:1px solid #444; border-radius:8px; }',
      '.locked-icon { font-size:3em; margin-bottom:12px; }',
      '.locked-title { color:#c8a96e; margin:0 0 10px; font-size:1.1em; }',
      '.locked-desc { color:#999; font-size:0.9em; line-height:1.6; max-width:400px; margin:0 auto 10px; }',
      '.locked-hint { font-size:0.8em; color:#666; font-style:italic; }',
      '.council-advice-board { display:flex; flex-direction:column; gap:10px; padding:12px; background:#1a1a1a; border:1px solid #444; border-radius:8px; }',
      '.council-advice-board.hidden { display:none; }',
      '.advice-board-close { align-self:flex-end; }',
      '.advice-entry { display:flex; gap:10px; align-items:flex-start; padding:10px; background:#222; border-radius:6px; border:1px solid #333; }',
      '.advice-badge { font-size:1.3em; width:28px; height:28px; border-radius:50%; display:flex; align-items:center; justify-content:center; flex-shrink:0; }',
      '.advice-content { flex:1; }',
      '.advice-speaker-name { font-weight:bold; font-size:0.85em; color:#c8a96e; display:block; margin-bottom:4px; }',
      '.advisor-detail-modal { position:fixed; inset:0; z-index:10000; display:flex; align-items:center; justify-content:center; }',
      '.modal-backdrop { position:absolute; inset:0; background:rgba(0,0,0,0.7); }',
      '.modal-content { position:relative; z-index:1; background:#1e1e1e; border:1px solid #444; border-radius:10px; width:90%; max-width:520px; max-height:85vh; overflow-y:auto; padding:0; box-shadow:0 8px 32px rgba(0,0,0,0.6); }',
      '.modal-close { position:absolute; top:10px; right:12px; background:none; border:none; color:#888; font-size:1.1em; cursor:pointer; z-index:2; }',
      '.modal-close:hover { color:#fff; }',
      '.modal-header { display:flex; gap:14px; align-items:center; padding:16px 20px; border-bottom:3px solid #c8a96e; }',
      '.modal-header-text h2 { margin:0 0 4px; font-size:1.1em; color:#fff; }',
      '.modal-subtitle { font-size:0.85em; color:#c8a96e; margin:0 0 6px; }',
      '.modal-body { padding:16px 20px; display:flex; flex-direction:column; gap:12px; }',
      '.detail-section { border-bottom:1px solid #2a2a2a; padding-bottom:10px; }',
      '.detail-section h4 { margin:0 0 6px; font-size:0.85em; color:#888; text-transform:uppercase; letter-spacing:0.06em; }',
      '.detail-section p { margin:0; color:#ccc; font-size:0.9em; line-height:1.6; }',
      '.big-stat { font-size:2em; font-weight:bold; color:#e8d87a; }',
      '.detail-traits { display:flex; flex-wrap:wrap; gap:6px; }',
      '.trait-badge { font-size:0.78em; padding:3px 8px; background:#2a2a2a; border:1px solid #444; border-radius:10px; color:#ccc; }',
      '.detail-skills .skills-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(120px,1fr)); gap:6px; }',
      '.skill-entry { display:flex; justify-content:space-between; font-size:0.82em; padding:3px 6px; background:#2a2a2a; border-radius:3px; }',
      '.skill-name { color:#aaa; }',
      '.skill-val { color:#e8d87a; font-weight:bold; }',
      '.modal-footer { display:flex; gap:8px; justify-content:flex-end; padding:12px 20px; border-top:1px solid #333; }',
      '.btn-dismiss-advisor { border-color:#b94a4a !important; color:#b94a4a !important; }',
      '.btn-dismiss-advisor:hover { background:rgba(185,74,74,0.15) !important; }',
      '.council-toast { position:fixed; bottom:20px; left:50%; transform:translateX(-50%) translateY(10px); background:#1e1e1e; border:1px solid #c8a96e; color:#ccc; padding:8px 18px; border-radius:20px; font-size:0.9em; opacity:0; transition:opacity 0.3s,transform 0.3s; z-index:99999; pointer-events:none; }',
      '.council-toast.visible { opacity:1; transform:translateX(-50%) translateY(0); }'
    ].join('\n');
    document.head.appendChild(style);
  }());

  // ═══════════════════════════════════════════ Export ═════════════════════════════════════════════

  global.CouncilView = CouncilView;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/council-view.js
