// FILE: client/js/ui/invention-view.js — PART 10
// Invention tracker panel for The Fate of Heinrich.
// IIFE pattern — exposes global `InventionView`.

(function (global) {
  'use strict';

  // ═══════════════════════════════════════════ Constants ══════════════════════════════════════════

  var INVENTION_STAGES = [
    {
      key:         'conceived',
      label:       'Conceived',
      icon:        '💡',
      description: 'The idea exists in your mind. Requirements have been assessed.',
      cls:         'stage-conceived'
    },
    {
      key:         'researching',
      label:       'Researching',
      icon:        '🔬',
      description: 'Active experimentation underway. Progress tracked turn by turn.',
      cls:         'stage-researching'
    },
    {
      key:         'prototyped',
      label:       'Prototyped',
      icon:        '⚙️',
      description: 'A crude working version exists. Needs refinement.',
      cls:         'stage-prototyped'
    },
    {
      key:         'perfected',
      label:       'Perfected',
      icon:        '✅',
      description: 'A reliable, working invention ready for the world.',
      cls:         'stage-perfected'
    },
    {
      key:         'introduced',
      label:       'Introduced',
      icon:        '🌍',
      description: 'Released to the world. The consequences are now unfolding.',
      cls:         'stage-introduced'
    }
  ];

  var FILTER_OPTIONS = [
    { key: 'all',         label: 'All'        },
    { key: 'conceived',   label: '💡 Conceived'   },
    { key: 'researching', label: '🔬 Researching' },
    { key: 'prototyped',  label: '⚙️ Prototyped'  },
    { key: 'perfected',   label: '✅ Perfected'   },
    { key: 'introduced',  label: '🌍 Introduced'  }
  ];

  var STAGE_ORDER = { conceived: 0, researching: 1, prototyped: 2, perfected: 3, introduced: 4 };

  // Reaction sentiment helpers
  var REACTION_SENTIMENT = {
    hostile:    { cls: 'react-hostile',    icon: '😡' },
    suspicious: { cls: 'react-suspicious', icon: '😒' },
    cautious:   { cls: 'react-cautious',   icon: '🤔' },
    neutral:    { cls: 'react-neutral',    icon: '😐' },
    curious:    { cls: 'react-curious',    icon: '👀' },
    interested: { cls: 'react-interested', icon: '😮' },
    accepting:  { cls: 'react-accepting',  icon: '😊' },
    enthusiastic:{ cls:'react-enthusiastic',icon: '🤩' }
  };

  // ═══════════════════════════════════════════ State ══════════════════════════════════════════════

  var _containerId      = null;
  var _container        = null;
  var _inventionsState  = {};
  var _activeFilter     = 'all';
  var _initialized      = false;

  // ═══════════════════════════════════════════ Helpers ════════════════════════════════════════════

  function _el(id)   { return document.getElementById(id); }
  function _qs(s, r) { return (r || document).querySelector(s); }

  function _escHtml(str) {
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#039;');
  }

  function _clamp(v, mn, mx) { return Math.min(mx, Math.max(mn, v)); }

  function _getStageMeta(stageKey) {
    for (var i = 0; i < INVENTION_STAGES.length; i++) {
      if (INVENTION_STAGES[i].key === stageKey) return INVENTION_STAGES[i];
    }
    return INVENTION_STAGES[0];
  }

  function _getInventionList(inventionsState) {
    var raw = (inventionsState && inventionsState.inventions) || inventionsState || [];
    if (Array.isArray(raw)) return raw;
    return Object.keys(raw).map(function (k) {
      var inv = raw[k]; inv._id = inv._id || k; return inv;
    });
  }

  function _getInventionById(inventionId) {
    var inventions = _getInventionList(_inventionsState);
    for (var i = 0; i < inventions.length; i++) {
      var inv = inventions[i];
      if ((inv._id || inv.id || inv.inventionId) === inventionId ||
          String(inv._id || inv.id || inv.inventionId) === String(inventionId)) return inv;
    }
    return null;
  }

  function _filterInventions(inventions) {
    if (_activeFilter === 'all') return inventions;
    return inventions.filter(function (inv) { return inv.stage === _activeFilter; });
  }

  function _dispatchEvent(name, detail) {
    var evt;
    try { evt = new CustomEvent(name, { detail: detail, bubbles: true }); }
    catch (ex) { evt = document.createEvent('CustomEvent'); evt.initCustomEvent(name, true, false, detail); }
    if (_container) _container.dispatchEvent(evt);
  }

  function _getStageIndex(stageKey) {
    return STAGE_ORDER[stageKey] != null ? STAGE_ORDER[stageKey] : -1;
  }

  // ═══════════════════════════════════════════ Render Helpers ═════════════════════════════════════

  function _renderProgressBar(current, max, label) {
    var pct = max > 0 ? _clamp(Math.round((current / max) * 100), 0, 100) : 0;
    var barCls = pct >= 75 ? 'prog-high' : pct >= 40 ? 'prog-mid' : 'prog-low';
    return (
      '<div class="progress-bar-wrap">' +
        (label ? '<span class="prog-label">' + _escHtml(label) + '</span>' : '') +
        '<div class="progress-bar-track">' +
          '<div class="progress-bar-fill ' + barCls + '" style="width:' + pct + '%"></div>' +
        '</div>' +
        '<span class="prog-val">' + current + '/' + max + '</span>' +
      '</div>'
    );
  }

  function _renderStagePips(currentStage) {
    var currentIdx = _getStageIndex(currentStage);
    var html = '<div class="stage-pips">';
    for (var i = 0; i < INVENTION_STAGES.length; i++) {
      var s    = INVENTION_STAGES[i];
      var done = (i < currentIdx);
      var cur  = (i === currentIdx);
      html += (
        '<div class="stage-pip ' + (done ? 'pip-done' : cur ? 'pip-current' : 'pip-future') + '" title="' + _escHtml(s.label) + '">' +
          s.icon +
        '</div>'
      );
      if (i < INVENTION_STAGES.length - 1) {
        html += '<div class="pip-connector ' + (done ? 'conn-done' : '') + '"></div>';
      }
    }
    html += '</div>';
    return html;
  }

  function _renderRequirementsChecklist(requirements, currentSkills, currentMaterials) {
    if (!requirements) return '';

    var skillReqs    = requirements.skills    || [];
    var materialReqs = requirements.materials || [];
    var otherReqs    = requirements.other     || [];

    var html = '<div class="requirements-checklist">';

    if (skillReqs.length) {
      html += '<div class="req-group"><h5>Skills Required</h5>';
      for (var i = 0; i < skillReqs.length; i++) {
        var sr     = skillReqs[i];
        var skName = sr.skill || sr.name || String(sr);
        var skReq  = sr.level || sr.required || 0;
        var skCur  = (currentSkills && currentSkills[skName]) || 0;
        var met    = skCur >= skReq;
        html += (
          '<div class="req-row ' + (met ? 'req-met' : 'req-unmet') + '">' +
            '<span class="req-check">' + (met ? '✅' : '❌') + '</span>' +
            '<span class="req-skill-name">' + _escHtml(skName) + '</span>' +
            '<span class="req-levels">' + skCur + ' / ' + skReq + '</span>' +
          '</div>'
        );
      }
      html += '</div>';
    }

    if (materialReqs.length) {
      html += '<div class="req-group"><h5>Materials Needed</h5>';
      for (var j = 0; j < materialReqs.length; j++) {
        var mr    = materialReqs[j];
        var mName = mr.item || mr.name || String(mr);
        var mQty  = mr.quantity || mr.qty || 1;
        var mHave = (currentMaterials && currentMaterials[mName]) || 0;
        var mMet  = mHave >= mQty;
        html += (
          '<div class="req-row ' + (mMet ? 'req-met' : 'req-unmet') + '">' +
            '<span class="req-check">' + (mMet ? '✅' : '❌') + '</span>' +
            '<span class="req-mat-name">' + _escHtml(mName) + '</span>' +
            '<span class="req-qty">' + mHave + ' / ' + mQty + '</span>' +
          '</div>'
        );
      }
      html += '</div>';
    }

    if (otherReqs.length) {
      html += '<div class="req-group"><h5>Other Requirements</h5>';
      for (var k = 0; k < otherReqs.length; k++) {
        var or_   = otherReqs[k];
        var orLbl = or_.label || or_.description || String(or_);
        var orMet = or_.met !== false;
        html += (
          '<div class="req-row ' + (orMet ? 'req-met' : 'req-unmet') + '">' +
            '<span class="req-check">' + (orMet ? '✅' : '❌') + '</span>' +
            '<span class="req-other-label">' + _escHtml(orLbl) + '</span>' +
          '</div>'
        );
      }
      html += '</div>';
    }

    html += '</div>';
    return html;
  }

  function _areRequirementsMet(requirements, currentSkills, currentMaterials) {
    if (!requirements) return true;
    var skillReqs = requirements.skills || [];
    for (var i = 0; i < skillReqs.length; i++) {
      var sr   = skillReqs[i];
      var name = sr.skill || sr.name || '';
      var req  = sr.level || sr.required || 0;
      var cur  = (currentSkills && currentSkills[name]) || 0;
      if (cur < req) return false;
    }
    var materialReqs = requirements.materials || [];
    for (var j = 0; j < materialReqs.length; j++) {
      var mr   = materialReqs[j];
      var mName= mr.item || mr.name || '';
      var mQty = mr.quantity || mr.qty || 1;
      var mHave= (currentMaterials && currentMaterials[mName]) || 0;
      if (mHave < mQty) return false;
    }
    var otherReqs = requirements.other || [];
    for (var k = 0; k < otherReqs.length; k++) {
      if (otherReqs[k].met === false) return false;
    }
    return true;
  }

  function _renderWorldReactions(reactions) {
    if (!reactions || !Object.keys(reactions).length) return '';
    var groups = ['church', 'nobles', 'commonPeople', 'merchants', 'scholars'];
    var groupLabels = {
      church:        'The Church',
      nobles:        'The Nobility',
      commonPeople:  'Common People',
      merchants:     'Merchants',
      scholars:      'Scholars'
    };

    var html = '<div class="world-reactions">';
    var keys = Object.keys(reactions);
    for (var i = 0; i < keys.length; i++) {
      var key    = keys[i];
      var data   = reactions[key];
      if (!data) continue;
      var label   = groupLabels[key] || key;
      var sentiment = (data.sentiment || data.attitude || 'neutral').toLowerCase();
      var sentMeta  = REACTION_SENTIMENT[sentiment] || REACTION_SENTIMENT.neutral;
      var text      = data.text || data.description || '';
      html += (
        '<div class="reaction-entry">' +
          '<div class="reaction-header">' +
            '<span class="reaction-group">' + _escHtml(label) + '</span>' +
            '<span class="reaction-sentiment ' + sentMeta.cls + '">' + sentMeta.icon + ' ' + _escHtml(sentiment) + '</span>' +
          '</div>' +
          (text ? '<p class="reaction-text">' + _escHtml(text) + '</p>' : '') +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderEconomicDisruption(disruption) {
    if (!disruption) return '';
    var industries = disruption.industries || disruption.sectors || [];
    var magnitude  = disruption.magnitude  || '';
    var desc       = disruption.description || '';
    var html = '<div class="econ-disruption">';
    if (magnitude) {
      html += '<span class="disruption-magnitude">Disruption: <strong>' + _escHtml(String(magnitude)) + '</strong></span>';
    }
    if (desc) {
      html += '<p class="disruption-desc">' + _escHtml(desc) + '</p>';
    }
    if (industries.length) {
      html += '<div class="disruption-industries">';
      for (var i = 0; i < industries.length; i++) {
        var ind = industries[i];
        var iName  = ind.name  || ind.sector || String(ind);
        var impact = ind.impact || '';
        var isPos  = ind.positive === true;
        html += (
          '<div class="disruption-row ' + (isPos ? 'dis-pos' : 'dis-neg') + '">' +
            '<span>' + _escHtml(iName) + '</span>' +
            (impact ? '<span class="dis-impact">' + _escHtml(String(impact)) + '</span>' : '') +
          '</div>'
        );
      }
      html += '</div>';
    }
    html += '</div>';
    return html;
  }

  function _renderCopyAttempts(copyAttempts) {
    if (!copyAttempts || !copyAttempts.length) return '';
    var html = '<div class="copy-attempts"><h5>Known Copy / Theft Attempts</h5><ul>';
    for (var i = 0; i < copyAttempts.length; i++) {
      var ca    = copyAttempts[i];
      var actor = ca.actor || ca.name || 'Unknown party';
      var outcome = ca.outcome || ca.result || 'Unknown outcome';
      var turn  = ca.turn || '';
      html += (
        '<li>' +
          '<strong>' + _escHtml(actor) + '</strong>' +
          (turn ? ' (Turn ' + turn + ')' : '') +
          ': ' + _escHtml(outcome) +
        '</li>'
      );
    }
    html += '</ul></div>';
    return html;
  }

  function _renderResearchLog(log) {
    if (!log || !log.length) return '<p class="no-log">No research attempts recorded yet.</p>';
    var recent = log.slice(-5).reverse();
    var html   = '<div class="research-log">';
    for (var i = 0; i < recent.length; i++) {
      var entry   = recent[i];
      var turn    = entry.turn    || '?';
      var outcome = entry.outcome || entry.result || 'Inconclusive';
      var gain    = entry.progressGained != null ? entry.progressGained : null;
      var notes   = entry.notes   || entry.description || '';
      var isPos   = outcome.toLowerCase().indexOf('fail') === -1 &&
                    outcome.toLowerCase().indexOf('bad')  === -1 &&
                    outcome.toLowerCase().indexOf('setback') === -1;
      html += (
        '<div class="log-entry ' + (isPos ? 'log-success' : 'log-failure') + '">' +
          '<div class="log-header">' +
            '<span class="log-turn">Turn ' + turn + '</span>' +
            '<span class="log-outcome">' + _escHtml(outcome) + '</span>' +
            (gain !== null ? '<span class="log-gain ' + (gain >= 0 ? 'gain-pos' : 'gain-neg') + '">' + (gain >= 0 ? '+' : '') + gain + ' progress</span>' : '') +
          '</div>' +
          (notes ? '<p class="log-notes">' + _escHtml(notes) + '</p>' : '') +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderInventionCard(invention) {
    var invId      = invention._id || invention.id || invention.inventionId || '';
    var name       = invention.name       || 'Unnamed Invention';
    var stage      = invention.stage      || 'conceived';
    var inspiration= invention.inspiration || invention.originalInput || '';
    var progress   = invention.progress   || 0;
    var maxProgress= invention.maxProgress || invention.progressRequired || 100;
    var historicalNote = invention.historicalNote || '';
    var skills     = invention.requiredSkills    || (invention.requirements && invention.requirements.skills) || [];
    var materials  = invention.requiredMaterials || (invention.requirements && invention.requirements.materials) || [];
    var stageMeta  = _getStageMeta(stage);

    // Build skills preview
    var skillsPreview = '';
    if (skills.length) {
      var playerSkills = (_inventionsState && _inventionsState.playerSkills) || {};
      var allMet = true;
      var previewItems = skills.slice(0, 3);
      for (var i = 0; i < previewItems.length; i++) {
        var sr  = previewItems[i];
        var sName = sr.skill || sr.name || String(sr);
        var sReq  = sr.level || sr.required || 0;
        var sCur  = playerSkills[sName] || 0;
        if (sCur < sReq) allMet = false;
        skillsPreview += '<span class="skill-chip ' + (sCur >= sReq ? 'chip-met' : 'chip-unmet') + '">' + _escHtml(sName) + ' ' + sCur + '/' + sReq + '</span>';
      }
      if (skills.length > 3) skillsPreview += '<span class="skill-chip chip-more">+' + (skills.length - 3) + ' more</span>';
    }

    return (
      '<div class="invention-card ' + stageMeta.cls + '" data-invention-id="' + _escHtml(String(invId)) + '">' +
        '<div class="invention-card-header">' +
          '<span class="invention-stage-icon" title="' + _escHtml(stageMeta.label) + '">' + stageMeta.icon + '</span>' +
          '<div class="invention-titles">' +
            '<span class="invention-name">' + _escHtml(name) + '</span>' +
            '<span class="invention-stage-label ' + stageMeta.cls + '">' + _escHtml(stageMeta.label) + '</span>' +
          '</div>' +
        '</div>' +

        (inspiration ? '<p class="invention-inspiration">Inspired by: &ldquo;' + _escHtml(inspiration) + '&rdquo;</p>' : '') +

        (stage === 'researching' ? _renderProgressBar(progress, maxProgress, 'Research') : '') +

        (skillsPreview ? '<div class="invention-skills-preview">' + skillsPreview + '</div>' : '') +

        (materials.length ?
          '<div class="invention-materials-preview">' +
            materials.slice(0, 3).map(function (m) {
              var mName = m.item || m.name || String(m);
              return '<span class="material-chip">' + _escHtml(mName) + '</span>';
            }).join('') +
            (materials.length > 3 ? '<span class="material-chip chip-more">+' + (materials.length - 3) + '</span>' : '') +
          '</div>' : '') +

        (historicalNote ? '<p class="historical-note">📜 ' + _escHtml(historicalNote) + '</p>' : '') +

        '<div class="invention-card-actions">' +
          '<button class="btn-small btn-invention-detail" data-invention-id="' + _escHtml(String(invId)) + '">Details</button>' +
        '</div>' +
      '</div>'
    );
  }

  function _renderInventionDetail(invention) {
    var invId      = invention._id || invention.id || invention.inventionId || '';
    var name       = invention.name          || 'Unnamed Invention';
    var stage      = invention.stage         || 'conceived';
    var inspiration= invention.inspiration   || invention.originalInput || '';
    var fullDesc   = invention.description   || invention.fullDescription || '';
    var progress   = invention.progress      || 0;
    var maxProgress= invention.maxProgress   || invention.progressRequired || 100;
    var turnsIn    = invention.turnsInvested || 0;
    var turnsEst   = invention.turnsEstimated != null ? invention.turnsEstimated : '?';
    var historicalNote = invention.historicalNote || '';
    var protoQuality   = invention.prototypeQuality || null;
    var requirements   = invention.requirements || null;
    var worldReactions = invention.worldReactions   || null;
    var economicDisr   = invention.economicDisruption || null;
    var copyAttempts   = invention.copyAttempts || [];
    var researchLog    = invention.researchLog  || invention.log || [];
    var playerSkills   = (_inventionsState && _inventionsState.playerSkills)   || {};
    var playerMaterials= (_inventionsState && _inventionsState.playerMaterials) || {};
    var stageMeta      = _getStageMeta(stage);
    var stageIdx       = _getStageIndex(stage);

    // Compute action buttons
    var reqMet         = _areRequirementsMet(requirements, playerSkills, playerMaterials);
    var canStartResearch = (stage === 'conceived' && reqMet);
    var canPrototype     = (stage === 'researching' && progress >= maxProgress);
    var canIntroduce     = (stage === 'prototyped' || stage === 'perfected');

    return (
      '<div class="invention-detail">' +
        '<div class="invention-detail-header ' + stageMeta.cls + '">' +
          '<div class="inv-header-row">' +
            '<span class="inv-detail-icon">' + stageMeta.icon + '</span>' +
            '<div class="inv-header-text">' +
              '<h3>' + _escHtml(name) + '</h3>' +
              '<span class="inv-stage-badge ' + stageMeta.cls + '">' + _escHtml(stageMeta.label) + '</span>' +
            '</div>' +
          '</div>' +
          _renderStagePips(stage) +
        '</div>' +

        (inspiration ? '<blockquote class="inv-inspiration">&ldquo;' + _escHtml(inspiration) + '&rdquo;</blockquote>' : '') +
        (fullDesc    ? '<p class="inv-full-desc">' + _escHtml(fullDesc) + '</p>' : '') +

        (historicalNote ?
          '<div class="inv-historical-note">' +
            '📜 <em>' + _escHtml(historicalNote) + '</em>' +
          '</div>' : '') +

        // Requirements
        (requirements ?
          '<div class="inv-section">' +
            '<h4>Requirements</h4>' +
            _renderRequirementsChecklist(requirements, playerSkills, playerMaterials) +
          '</div>' : '') +

        // Research progress
        (stage === 'researching' || stageIdx > 1 ?
          '<div class="inv-section">' +
            '<h4>Research Progress</h4>' +
            _renderProgressBar(progress, maxProgress, 'Progress') +
            '<div class="research-meta">' +
              '<span>Turns invested: <strong>' + turnsIn + '</strong></span>' +
              '<span>Estimated remaining: <strong>' + (typeof turnsEst === 'number' ? turnsEst + ' turns' : turnsEst) + '</strong></span>' +
            '</div>' +
          '</div>' : '') +

        // Prototype quality
        (protoQuality !== null ?
          '<div class="inv-section">' +
            '<h4>Prototype Quality</h4>' +
            '<div class="proto-quality">' +
              '<span class="proto-quality-val">' + _escHtml(String(protoQuality)) + '</span>' +
              (typeof protoQuality === 'number' ? _renderProgressBar(protoQuality, 100, '') : '') +
            '</div>' +
          '</div>' : '') +

        // World reaction (if introduced)
        (stage === 'introduced' && worldReactions ?
          '<div class="inv-section">' +
            '<h4>World Reaction</h4>' +
            _renderWorldReactions(worldReactions) +
          '</div>' : '') +

        // Economic disruption
        (stage === 'introduced' && economicDisr ?
          '<div class="inv-section">' +
            '<h4>Economic Disruption</h4>' +
            _renderEconomicDisruption(economicDisr) +
          '</div>' : '') +

        // Copy/theft attempts
        (stage === 'introduced' && copyAttempts.length ?
          '<div class="inv-section">' +
            _renderCopyAttempts(copyAttempts) +
          '</div>' : '') +

        // Research log
        '<div class="inv-section">' +
          '<h4>Research Log (last 5)</h4>' +
          _renderResearchLog(researchLog) +
        '</div>' +

        // Action buttons
        '<div class="invention-detail-actions">' +
          (canStartResearch ?
            '<button class="btn-action btn-start-research" data-invention-id="' + _escHtml(String(invId)) + '">🔬 Start Research</button>' : '') +
          (!canStartResearch && stage === 'conceived' ?
            '<button class="btn-action btn-disabled" disabled title="Requirements not met">🔬 Start Research (requirements not met)</button>' : '') +
          (canPrototype ?
            '<button class="btn-action btn-begin-prototype" data-invention-id="' + _escHtml(String(invId)) + '">⚙️ Begin Prototype</button>' : '') +
          (canIntroduce ?
            '<button class="btn-action btn-introduce btn-introduce-warning" data-invention-id="' + _escHtml(String(invId)) + '">🌍 Introduce to World</button>' : '') +
          '<button class="btn-small btn-back-to-inventions" id="inventions-back-btn">← Back</button>' +
        '</div>' +

        (canIntroduce ?
          '<div class="introduce-warning">' +
            '⚠️ <strong>Warning:</strong> Introducing this invention to the world may have far-reaching and irreversible consequences — ' +
            'for your reputation, the economy, the Church\'s attitude toward you, and the course of history itself.' +
          '</div>' : '') +

      '</div>'
    );
  }

  function _renderFilterBar() {
    var html = '<div class="invention-filters">';
    for (var i = 0; i < FILTER_OPTIONS.length; i++) {
      var f = FILTER_OPTIONS[i];
      html += (
        '<button class="inv-filter-btn ' + (_activeFilter === f.key ? 'inv-filter-active' : '') + '" data-filter="' + f.key + '">' +
          _escHtml(f.label) +
        '</button>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderSummaryBar(inventions) {
    var counts = { conceived: 0, researching: 0, prototyped: 0, perfected: 0, introduced: 0 };
    for (var i = 0; i < inventions.length; i++) {
      var s = inventions[i].stage;
      if (counts[s] !== undefined) counts[s]++;
    }
    var html = '<div class="invention-summary-bar">';
    for (var j = 0; j < INVENTION_STAGES.length; j++) {
      var stage = INVENTION_STAGES[j];
      var count = counts[stage.key] || 0;
      html += (
        '<div class="isb-item ' + stage.cls + '">' +
          '<span class="isb-icon">' + stage.icon + '</span>' +
          '<span class="isb-count">' + count + '</span>' +
          '<span class="isb-label">' + _escHtml(stage.label) + '</span>' +
        '</div>'
      );
    }
    html += '</div>';
    return html;
  }

  function _renderEmptyState() {
    return (
      '<div class="invention-empty">' +
        '<div class="empty-icon">💡</div>' +
        '<h3>No Inventions</h3>' +
        '<p>You have conceived no inventions yet. When you suggest an invention during gameplay — ' +
          'a new device, process, or technique ahead of its time — it will appear here for you to develop.</p>' +
        '<p class="empty-hint">Share an idea with the world by describing it to Heinrich during your conversations.</p>' +
      '</div>'
    );
  }

  // ═══════════════════════════════════════════ Event Binding ══════════════════════════════════════

  function _bindEvents() {
    if (!_container) return;
    _container.addEventListener('click', function (e) {
      var target = e.target || e.srcElement;

      // Filter buttons
      if (target.classList.contains('inv-filter-btn')) {
        _activeFilter = target.getAttribute('data-filter') || 'all';
        InventionView.render(_inventionsState);
        return;
      }

      // Detail button
      if (target.classList.contains('btn-invention-detail')) {
        var id = target.getAttribute('data-invention-id');
        if (id) InventionView.showInventionDetail(id);
        return;
      }

      // Back
      if (target.id === 'inventions-back-btn' || target.classList.contains('btn-back-to-inventions')) {
        InventionView.render(_inventionsState);
        return;
      }

      // Start research
      if (target.classList.contains('btn-start-research')) {
        var id2 = target.getAttribute('data-invention-id');
        if (id2) _dispatchEvent('invention:startResearch', { inventionId: id2 });
        return;
      }

      // Begin prototype
      if (target.classList.contains('btn-begin-prototype')) {
        var id3 = target.getAttribute('data-invention-id');
        if (id3) _dispatchEvent('invention:beginPrototype', { inventionId: id3 });
        return;
      }

      // Introduce to world
      if (target.classList.contains('btn-introduce-warning')) {
        var id4 = target.getAttribute('data-invention-id');
        if (id4) {
          if (window.confirm(
            'Introducing this invention to the world is IRREVERSIBLE.\n\n' +
            'It may change your reputation, provoke the Church, reshape the economy, ' +
            'and alter the course of history.\n\n' +
            'Are you certain you wish to proceed?'
          )) {
            _dispatchEvent('invention:introduce', { inventionId: id4 });
          }
        }
        return;
      }
    });
  }

  // ═══════════════════════════════════════════ Public API ═════════════════════════════════════════

  var InventionView = {

    /**
     * Initialize invention view.
     * @param {string} containerId
     */
    init: function (containerId) {
      _containerId = containerId;
      _container   = document.getElementById(containerId);
      if (!_container) {
        console.warn('[InventionView] Container not found: ' + containerId);
        return;
      }
      _container.classList.add('invention-view');
      _initialized = true;
      _bindEvents();
    },

    /**
     * Full render of inventions panel.
     * @param {Object|Array} inventionsState
     */
    render: function (inventionsState) {
      if (!_initialized) { console.warn('[InventionView] Not initialized.'); return; }
      _inventionsState = inventionsState || {};

      var allInv      = _getInventionList(_inventionsState);
      var filteredInv = _filterInventions(allInv);

      var html = '<div class="invention-panel">';
      html += '<div class="invention-panel-header">';
      html += '<h2 class="invention-panel-title">💡 Inventions & Discoveries</h2>';
      html += '</div>';

      if (!allInv.length) {
        html += _renderEmptyState();
      } else {
        html += _renderSummaryBar(allInv);
        html += _renderFilterBar();

        if (!filteredInv.length) {
          html += '<div class="no-filter-results"><p>No inventions at this stage.</p></div>';
        } else {
          html += '<div class="invention-grid">';
          for (var i = 0; i < filteredInv.length; i++) {
            html += _renderInventionCard(filteredInv[i]);
          }
          html += '</div>';
        }
      }

      html += '</div>';
      _container.innerHTML = html;
    },

    /**
     * Update invention view — optionally targeting a specific changed invention.
     * @param {Object|Array} inventionsState
     * @param {Object|null} changedInvention - specific invention that changed (optional)
     */
    update: function (inventionsState, changedInvention) {
      _inventionsState = inventionsState || _inventionsState;

      if (changedInvention) {
        var invId = changedInvention._id || changedInvention.id || changedInvention.inventionId;
        var card  = _container && _qs('[data-invention-id="' + invId + '"].invention-card', _container);
        if (card) {
          var tempDiv  = document.createElement('div');
          tempDiv.innerHTML = _renderInventionCard(changedInvention);
          card.parentNode.replaceChild(tempDiv.firstChild, card);
          return;
        }
      }

      // Check if we're currently showing the detail view for the changed invention
      var detailView = _container && _qs('.invention-detail', _container);
      if (detailView && changedInvention) {
        var currentId = _qs('[data-invention-id]', detailView);
        if (currentId) {
          var did = currentId.getAttribute('data-invention-id');
          if (String(changedInvention._id || changedInvention.id) === String(did)) {
            InventionView.showInventionDetail(String(did));
            return;
          }
        }
      }

      // Full re-render
      var grid = _qs('.invention-grid', _container);
      if (grid) {
        var filtered = _filterInventions(_getInventionList(_inventionsState));
        var html     = '';
        for (var i = 0; i < filtered.length; i++) html += _renderInventionCard(filtered[i]);
        grid.innerHTML = html;
        // Update summary bar
        var summary = _qs('.invention-summary-bar', _container);
        if (summary) {
          var all = _getInventionList(_inventionsState);
          var tempDiv2 = document.createElement('div');
          tempDiv2.innerHTML = _renderSummaryBar(all);
          summary.parentNode.replaceChild(tempDiv2.firstChild, summary);
        }
      } else {
        InventionView.render(_inventionsState);
      }
    },

    /**
     * Show full detail view for a specific invention.
     * @param {string} inventionId
     */
    showInventionDetail: function (inventionId) {
      var invention = _getInventionById(inventionId);
      if (!invention) {
        console.warn('[InventionView] Invention not found: ' + inventionId);
        return;
      }
      var panel = _qs('.invention-panel', _container);
      if (!panel) return;
      panel.innerHTML = _renderInventionDetail(invention);
    },

    /**
     * Set the active filter and re-render.
     * @param {'all'|'conceived'|'researching'|'prototyped'|'perfected'|'introduced'} filter
     */
    setFilter: function (filter) {
      var validFilters = ['all', 'conceived', 'researching', 'prototyped', 'perfected', 'introduced'];
      if (validFilters.indexOf(filter) === -1) {
        console.warn('[InventionView] Invalid filter: ' + filter);
        return;
      }
      _activeFilter = filter;
      InventionView.render(_inventionsState);
    }
  };

  // ═══════════════════════════════════════════ CSS Injection ══════════════════════════════════════

  (function _injectStyles() {
    if (document.getElementById('invention-view-styles')) return;
    var style = document.createElement('style');
    style.id  = 'invention-view-styles';
    style.textContent = [
      '.invention-view { font-family:inherit; }',
      '.invention-panel { display:flex; flex-direction:column; gap:14px; padding:12px; }',
      '.invention-panel-header { display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #a070d0; padding-bottom:8px; }',
      '.invention-panel-title { margin:0; font-size:1.2em; color:#c090e8; }',
      '.invention-summary-bar { display:flex; gap:0; background:#1e1e1e; border:1px solid #2a2a2a; border-radius:8px; overflow:hidden; }',
      '.isb-item { flex:1; display:flex; flex-direction:column; align-items:center; padding:8px 4px; border-right:1px solid #2a2a2a; }',
      '.isb-item:last-child { border-right:none; }',
      '.isb-icon { font-size:1.2em; }',
      '.isb-count { font-size:1.3em; font-weight:bold; color:#eee; }',
      '.isb-label { font-size:0.65em; color:#888; text-transform:uppercase; text-align:center; }',
      '.stage-conceived   .isb-count { color:#c8c830; }',
      '.stage-researching .isb-count { color:#70a0d8; }',
      '.stage-prototyped  .isb-count { color:#c87030; }',
      '.stage-perfected   .isb-count { color:#5c9e5c; }',
      '.stage-introduced  .isb-count { color:#c090e8; }',
      '.invention-filters { display:flex; flex-wrap:wrap; gap:6px; }',
      '.inv-filter-btn { padding:4px 10px; font-size:0.8em; border:1px solid #333; background:#1a1a1a; color:#aaa; border-radius:14px; cursor:pointer; transition:all 0.15s; }',
      '.inv-filter-btn:hover { border-color:#a070d0; color:#c090e8; }',
      '.inv-filter-btn.inv-filter-active { border-color:#a070d0; background:rgba(160,112,208,0.15); color:#c090e8; font-weight:bold; }',
      '.invention-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(260px,1fr)); gap:14px; }',
      '.invention-card { background:#1e1e1e; border:1px solid #333; border-radius:8px; padding:12px; display:flex; flex-direction:column; gap:8px; transition:border-color 0.2s; }',
      '.invention-card:hover { border-color:#a070d0; }',
      '.stage-conceived   { border-color:rgba(200,200,48,0.25); }',
      '.stage-researching { border-color:rgba(112,160,216,0.25); }',
      '.stage-prototyped  { border-color:rgba(200,112,48,0.25); }',
      '.stage-perfected   { border-color:rgba(92,158,92,0.25); }',
      '.stage-introduced  { border-color:rgba(192,144,232,0.35); }',
      '.invention-card-header { display:flex; align-items:center; gap:10px; }',
      '.invention-stage-icon { font-size:1.5em; flex-shrink:0; }',
      '.invention-titles { flex:1; display:flex; flex-direction:column; gap:2px; }',
      '.invention-name { font-weight:bold; color:#eee; font-size:0.95em; }',
      '.invention-stage-label { font-size:0.75em; }',
      '.stage-conceived   .invention-stage-label { color:#c8c830; }',
      '.stage-researching .invention-stage-label { color:#70a0d8; }',
      '.stage-prototyped  .invention-stage-label { color:#c87030; }',
      '.stage-perfected   .invention-stage-label { color:#5c9e5c; }',
      '.stage-introduced  .invention-stage-label { color:#c090e8; }',
      '.invention-inspiration { font-size:0.82em; color:#999; font-style:italic; margin:0; }',
      '.progress-bar-wrap { display:flex; align-items:center; gap:8px; font-size:0.82em; }',
      '.prog-label { color:#888; min-width:60px; }',
      '.progress-bar-track { flex:1; height:6px; background:#2a2a2a; border-radius:3px; overflow:hidden; }',
      '.progress-bar-fill { height:100%; border-radius:3px; transition:width 0.4s; }',
      '.prog-high { background:linear-gradient(to right,#3a8c3a,#6ccc6c); }',
      '.prog-mid  { background:linear-gradient(to right,#8c7c1a,#d8b840); }',
      '.prog-low  { background:linear-gradient(to right,#6c4a8c,#a070d0); }',
      '.prog-val { color:#aaa; font-size:0.82em; white-space:nowrap; }',
      '.invention-skills-preview, .invention-materials-preview { display:flex; flex-wrap:wrap; gap:4px; }',
      '.skill-chip { font-size:0.72em; padding:2px 6px; border-radius:10px; }',
      '.chip-met    { background:rgba(92,158,92,0.15); color:#8fcf8f; border:1px solid rgba(92,158,92,0.3); }',
      '.chip-unmet  { background:rgba(185,74,74,0.15); color:#e07070; border:1px solid rgba(185,74,74,0.3); }',
      '.chip-more   { background:#252525; color:#888; border:1px solid #333; }',
      '.material-chip { font-size:0.72em; padding:2px 6px; background:#252525; color:#aaa; border:1px solid #333; border-radius:10px; }',
      '.historical-note { font-size:0.78em; color:#888; background:rgba(200,169,110,0.06); border-left:3px solid #c8a96e; padding:4px 8px; margin:0; border-radius:0 3px 3px 0; font-style:italic; }',
      '.invention-card-actions { display:flex; gap:8px; margin-top:4px; }',
      '.invention-empty { text-align:center; padding:32px 20px; background:#1a1a1a; border:1px dashed #444; border-radius:8px; }',
      '.invention-empty .empty-icon { font-size:3em; margin-bottom:12px; }',
      '.invention-empty h3 { color:#c090e8; margin:0 0 10px; }',
      '.invention-empty p { color:#999; font-size:0.9em; line-height:1.6; max-width:400px; margin:0 auto 8px; }',
      '.invention-empty .empty-hint { font-size:0.82em; color:#666; font-style:italic; }',
      '.no-filter-results { padding:20px; text-align:center; color:#888; font-size:0.9em; }',
      '.invention-detail { display:flex; flex-direction:column; gap:14px; padding:4px; }',
      '.invention-detail-header { padding:14px; border-radius:8px 8px 0 0; background:#1a1a1a; border-bottom:1px solid #2a2a2a; display:flex; flex-direction:column; gap:10px; }',
      '.inv-header-row { display:flex; align-items:center; gap:12px; }',
      '.inv-detail-icon { font-size:2em; flex-shrink:0; }',
      '.inv-header-text { flex:1; }',
      '.inv-header-text h3 { margin:0 0 4px; font-size:1.1em; color:#eee; }',
      '.inv-stage-badge { font-size:0.8em; padding:2px 10px; border-radius:10px; display:inline-block; }',
      '.stage-conceived   .inv-stage-badge { background:rgba(200,200,48,0.15); color:#c8c830; border:1px solid rgba(200,200,48,0.3); }',
      '.stage-researching .inv-stage-badge { background:rgba(112,160,216,0.15); color:#70a0d8; border:1px solid rgba(112,160,216,0.3); }',
      '.stage-prototyped  .inv-stage-badge { background:rgba(200,112,48,0.15); color:#c87030; border:1px solid rgba(200,112,48,0.3); }',
      '.stage-perfected   .inv-stage-badge { background:rgba(92,158,92,0.15); color:#5c9e5c; border:1px solid rgba(92,158,92,0.3); }',
      '.stage-introduced  .inv-stage-badge { background:rgba(192,144,232,0.15); color:#c090e8; border:1px solid rgba(192,144,232,0.3); }',
      '.stage-pips { display:flex; align-items:center; gap:0; overflow-x:auto; }',
      '.stage-pip { width:32px; height:32px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1em; flex-shrink:0; }',
      '.pip-done    { background:rgba(92,158,92,0.2); border:2px solid #5c9e5c; }',
      '.pip-current { background:rgba(160,112,208,0.25); border:2px solid #a070d0; box-shadow:0 0 8px rgba(160,112,208,0.4); }',
      '.pip-future  { background:#1a1a1a; border:2px solid #333; opacity:0.5; }',
      '.pip-connector { flex:1; height:2px; background:#2a2a2a; min-width:12px; }',
      '.conn-done { background:#5c9e5c; }',
      '.inv-inspiration { font-style:italic; color:#999; border-left:3px solid #a070d0; padding:6px 12px; margin:0; background:rgba(160,112,208,0.06); border-radius:0 4px 4px 0; }',
      '.inv-full-desc { color:#ccc; font-size:0.9em; line-height:1.6; margin:0; }',
      '.inv-historical-note { font-size:0.85em; color:#aaa; background:rgba(200,169,110,0.08); border:1px solid rgba(200,169,110,0.2); border-radius:5px; padding:8px 12px; font-style:italic; }',
      '.inv-section { display:flex; flex-direction:column; gap:8px; }',
      '.inv-section h4 { margin:0; font-size:0.82em; color:#888; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid #2a2a2a; padding-bottom:4px; }',
      '.requirements-checklist { display:flex; flex-direction:column; gap:8px; }',
      '.req-group h5 { margin:0 0 6px; font-size:0.8em; color:#888; }',
      '.req-row { display:flex; align-items:center; gap:8px; font-size:0.85em; padding:4px 6px; border-radius:4px; }',
      '.req-met   { background:rgba(92,158,92,0.08); }',
      '.req-unmet { background:rgba(185,74,74,0.08); }',
      '.req-check { font-size:0.9em; flex-shrink:0; }',
      '.req-skill-name, .req-mat-name, .req-other-label { flex:1; color:#ccc; }',
      '.req-levels, .req-qty { font-size:0.82em; color:#888; }',
      '.research-meta { display:flex; gap:16px; font-size:0.85em; color:#aaa; flex-wrap:wrap; }',
      '.research-meta strong { color:#eee; }',
      '.proto-quality { display:flex; align-items:center; gap:10px; }',
      '.proto-quality-val { font-size:1.5em; font-weight:bold; color:#c87030; }',
      '.world-reactions { display:flex; flex-direction:column; gap:8px; }',
      '.reaction-entry { padding:8px; background:#1a1a1a; border-radius:5px; }',
      '.reaction-header { display:flex; justify-content:space-between; align-items:center; margin-bottom:4px; }',
      '.reaction-group { font-weight:bold; font-size:0.88em; color:#ddd; }',
      '.reaction-sentiment { font-size:0.78em; padding:2px 7px; border-radius:10px; }',
      '.react-hostile     { background:rgba(185,30,30,0.2); color:#e04040; border:1px solid rgba(185,30,30,0.4); }',
      '.react-suspicious  { background:rgba(185,100,30,0.2); color:#e09040; border:1px solid rgba(185,100,30,0.4); }',
      '.react-cautious    { background:rgba(185,160,30,0.2); color:#e8c840; border:1px solid rgba(185,160,30,0.4); }',
      '.react-neutral     { background:rgba(120,120,120,0.2); color:#aaa; border:1px solid #444; }',
      '.react-curious     { background:rgba(60,120,185,0.2); color:#70a0d8; border:1px solid rgba(60,120,185,0.4); }',
      '.react-interested  { background:rgba(80,150,185,0.2); color:#80c0d8; border:1px solid rgba(80,150,185,0.4); }',
      '.react-accepting   { background:rgba(60,158,92,0.2); color:#70cc90; border:1px solid rgba(60,158,92,0.4); }',
      '.react-enthusiastic{ background:rgba(160,112,208,0.2); color:#c090e8; border:1px solid rgba(160,112,208,0.4); }',
      '.reaction-text { margin:0; font-size:0.85em; color:#aaa; line-height:1.5; }',
      '.econ-disruption { display:flex; flex-direction:column; gap:6px; }',
      '.disruption-magnitude { font-size:0.85em; color:#aaa; }',
      '.disruption-magnitude strong { color:#eee; }',
      '.disruption-desc { font-size:0.85em; color:#aaa; margin:0; font-style:italic; }',
      '.disruption-industries { display:flex; flex-direction:column; gap:4px; }',
      '.disruption-row { display:flex; justify-content:space-between; font-size:0.82em; padding:3px 8px; border-radius:3px; }',
      '.dis-pos { background:rgba(92,158,92,0.1); color:#8fcf8f; }',
      '.dis-neg { background:rgba(185,74,74,0.1); color:#e07070; }',
      '.dis-impact { font-weight:bold; }',
      '.copy-attempts h5 { margin:0 0 6px; font-size:0.82em; color:#888; text-transform:uppercase; }',
      '.copy-attempts ul { margin:0; padding-left:16px; }',
      '.copy-attempts li { font-size:0.85em; color:#ccc; margin-bottom:4px; line-height:1.5; }',
      '.research-log { display:flex; flex-direction:column; gap:6px; }',
      '.no-log { font-size:0.85em; color:#666; font-style:italic; }',
      '.log-entry { padding:8px; border-radius:5px; border:1px solid #2a2a2a; }',
      '.log-success { background:rgba(60,100,60,0.15); }',
      '.log-failure { background:rgba(100,40,40,0.15); }',
      '.log-header { display:flex; align-items:center; gap:8px; margin-bottom:3px; }',
      '.log-turn { font-size:0.75em; color:#888; }',
      '.log-outcome { flex:1; font-size:0.85em; color:#ddd; }',
      '.log-gain { font-size:0.82em; font-weight:bold; }',
      '.gain-pos { color:#8fcf8f; }',
      '.gain-neg { color:#e07070; }',
      '.log-notes { margin:0; font-size:0.82em; color:#aaa; font-style:italic; line-height:1.5; }',
      '.invention-detail-actions { display:flex; gap:8px; flex-wrap:wrap; padding-top:10px; border-top:1px solid #2a2a2a; }',
      '.btn-action { padding:7px 14px; font-size:0.88em; border-radius:5px; cursor:pointer; border:1px solid #555; background:#252525; color:#ddd; transition:all 0.15s; }',
      '.btn-action:hover:not(:disabled) { background:#333; }',
      '.btn-start-research { border-color:#70a0d8; color:#70a0d8; }',
      '.btn-start-research:hover { background:rgba(112,160,216,0.12) !important; }',
      '.btn-begin-prototype { border-color:#c87030; color:#c87030; }',
      '.btn-begin-prototype:hover { background:rgba(200,112,48,0.12) !important; }',
      '.btn-introduce-warning { border-color:#c090e8; color:#c090e8; }',
      '.btn-introduce-warning:hover { background:rgba(192,144,232,0.12) !important; }',
      '.btn-action.btn-disabled { opacity:0.4; cursor:not-allowed; }',
      '.introduce-warning { background:rgba(185,74,74,0.1); border:1px solid rgba(185,74,74,0.35); border-radius:6px; padding:10px 14px; font-size:0.85em; color:#e07070; line-height:1.6; }'
    ].join('\n');
    document.head.appendChild(style);
  }());

  // ═══════════════════════════════════════════ Export ═════════════════════════════════════════════

  global.InventionView = InventionView;

}(typeof window !== 'undefined' ? window : this));

// END FILE: client/js/ui/invention-view.js
