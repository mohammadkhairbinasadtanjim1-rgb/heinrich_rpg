// FILE: client/js/ui/consequence-tracker.js — PART 10

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────

  var STATUS_COLORS = {
    active:    '#d4af37',
    pending:   '#888888',
    resolved:  '#2ecc71',
    permanent: '#e74c3c'
  };

  var STATUS_LABELS = {
    active:    'Active',
    pending:   'Pending',
    resolved:  'Resolved',
    permanent: 'Permanent'
  };

  var TYPE_ICONS = {
    reputation:  '👁️',
    relationship:'❤️',
    wound:       '🩹',
    scar:        '⚔️',
    legal:       '⚖️',
    spiritual:   '✝️',
    economic:    '💰',
    political:   '👑',
    social:      '👥',
    oath:        '📜',
    curse:       '🌑',
    quest:       'quest',
    default:     '⚡'
  };

  // ─── ConsequenceTracker IIFE ──────────────────────────────────────────────

  var ConsequenceTracker = (function () {

    var _containerId        = null;
    var _consequencesState  = null;
    var _currentFilter      = 'all';
    var _currentSort        = 'severity';
    var _selectedId         = null;

    // ── DOM helpers ──────────────────────────────────────────────────────────

    function _el(tag, className, html) {
      var el = document.createElement(tag);
      if (className) el.className = className;
      if (html !== undefined) el.innerHTML = html;
      return el;
    }

    function _esc(str) {
      if (str == null) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }

    function _getContainer() {
      return document.getElementById(_containerId);
    }

    // ── Severity display ─────────────────────────────────────────────────────

    function _severityFlames(severity) {
      var s = parseInt(severity, 10) || 1;
      if (s >= 10) return '<span class="ct-flame ct-flame-skull" title="Catastrophic">☠️</span>';
      if (s >= 7)  return '<span class="ct-flame" title="Severe">🔥🔥🔥</span>';
      if (s >= 4)  return '<span class="ct-flame" title="Moderate">🔥🔥</span>';
      return '<span class="ct-flame" title="Minor">🔥</span>';
    }

    function _severityBar(severity) {
      var s = Math.min(10, Math.max(1, parseInt(severity, 10) || 1));
      var pct = (s / 10) * 100;
      var color = s >= 10 ? '#e74c3c' : s >= 7 ? '#e67e22' : s >= 4 ? '#f39c12' : '#f1c40f';
      return '<div class="ct-severity-bar-wrap" title="Severity ' + s + '/10">' +
        '<div class="ct-severity-bar" style="width:' + pct + '%;background:' + color + '"></div>' +
        '</div>';
    }

    function _typeIcon(type) {
      if (!type) return TYPE_ICONS.default;
      var key = type.toLowerCase();
      return TYPE_ICONS[key] || TYPE_ICONS.default;
    }

    // ── Filter / Sort ────────────────────────────────────────────────────────

    function _getAll(state) {
      if (!state) return [];
      if (Array.isArray(state)) return state;
      if (Array.isArray(state.consequences)) return state.consequences;
      if (Array.isArray(state.threads)) return state.threads;
      return [];
    }

    function _filterConsequences(list, filter) {
      if (!filter || filter === 'all') return list;
      return list.filter(function (c) { return c.status === filter; });
    }

    function _sortConsequences(list, sortField) {
      var sorted = list.slice();
      sorted.sort(function (a, b) {
        switch (sortField) {
          case 'severity':
            return (parseInt(b.severity, 10) || 0) - (parseInt(a.severity, 10) || 0);
          case 'date':
            return (parseInt(b.trigger_turn, 10) || 0) - (parseInt(a.trigger_turn, 10) || 0);
          case 'type':
            var ta = (a.type || '').toLowerCase();
            var tb = (b.type || '').toLowerCase();
            if (ta < tb) return -1;
            if (ta > tb) return 1;
            return 0;
          case 'expiry':
            // Permanent (null) last, then soonest first
            var ea = a.expiry_turn == null ? Infinity : parseInt(a.expiry_turn, 10) || 0;
            var eb = b.expiry_turn == null ? Infinity : parseInt(b.expiry_turn, 10) || 0;
            return ea - eb;
          default:
            return 0;
        }
      });
      return sorted;
    }

    // ── Badge count ──────────────────────────────────────────────────────────

    function _updateTabBadge(count) {
      // Try to update a tab badge if it exists in the surrounding UI
      var badge = document.querySelector('[data-tab-badge="consequences"]');
      if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? '' : 'none';
      }
    }

    // ── Consequence card ─────────────────────────────────────────────────────

    function _buildConsequenceCard(consequence) {
      var isSelected = _selectedId === consequence.id;
      var statusColor = STATUS_COLORS[consequence.status] || '#888';

      var card = _el('div', 'ct-card ct-status-' + (consequence.status || 'active') + (isSelected ? ' ct-selected' : ''));
      card.dataset.cid = consequence.id;
      card.style.borderLeftColor = statusColor;

      // Header
      var header = _el('div', 'ct-card-header');

      var typeIconEl = _el('span', 'ct-type-icon');
      typeIconEl.textContent = _typeIcon(consequence.type);
      typeIconEl.title = consequence.type || 'Consequence';
      header.appendChild(typeIconEl);

      var titleWrap = _el('div', 'ct-title-wrap');
      var titleEl = _el('div', 'ct-card-title', _esc(consequence.title || 'Unnamed Consequence'));
      titleWrap.appendChild(titleEl);

      var metaEl = _el('div', 'ct-card-meta');
      metaEl.innerHTML =
        '<span class="ct-turn-label">Turn ' + _esc(consequence.trigger_turn || '?') + '</span>' +
        (consequence.expiry_turn
          ? '<span class="ct-expiry-label">Expires: Turn ' + _esc(consequence.expiry_turn) + '</span>'
          : '<span class="ct-permanent-label">Permanent</span>');
      titleWrap.appendChild(metaEl);
      header.appendChild(titleWrap);

      var severityEl = _el('div', 'ct-severity-col');
      severityEl.innerHTML = _severityFlames(consequence.severity) + _severityBar(consequence.severity);
      header.appendChild(severityEl);

      var statusBadge = _el('span', 'ct-status-badge ct-status-badge-' + (consequence.status || 'active'));
      statusBadge.textContent = STATUS_LABELS[consequence.status] || consequence.status || 'Active';
      statusBadge.style.color = statusColor;
      statusBadge.style.borderColor = statusColor;
      header.appendChild(statusBadge);

      var expandBtn = _el('button', 'ct-expand-btn', isSelected ? '▲' : '▼');
      expandBtn.title = isSelected ? 'Collapse' : 'Expand';
      expandBtn.dataset.cid = consequence.id;
      header.appendChild(expandBtn);

      card.appendChild(header);

      // Description (always shown)
      if (consequence.description) {
        var desc = _el('div', 'ct-card-desc', _esc(consequence.description));
        card.appendChild(desc);
      }

      // Expanded detail
      if (isSelected) {
        var detail = _buildConsequenceDetail(consequence);
        card.appendChild(detail);
      }

      return card;
    }

    function _buildConsequenceDetail(c) {
      var detail = _el('div', 'ct-card-detail');

      // Timeline
      var timeline = _el('div', 'ct-timeline');
      var tlTitle = _el('div', 'ct-timeline-title', '⏱ Timeline');
      timeline.appendChild(tlTitle);

      // Trigger action
      if (c.trigger_action) {
        var tlItem = _el('div', 'ct-tl-item ct-tl-trigger');
        tlItem.innerHTML =
          '<span class="ct-tl-dot"></span>' +
          '<span class="ct-tl-turn">Turn ' + _esc(c.trigger_turn || '?') + '</span>' +
          '<span class="ct-tl-label">Triggered by:</span>' +
          '<span class="ct-tl-text">' + _esc(c.trigger_action) + '</span>';
        timeline.appendChild(tlItem);
      }

      // Immediate effect
      if (c.immediate_effect) {
        var imm = _el('div', 'ct-tl-item ct-tl-immediate');
        imm.innerHTML =
          '<span class="ct-tl-dot"></span>' +
          '<span class="ct-tl-label">⚡ Immediate:</span>' +
          '<span class="ct-tl-text">' + _esc(c.immediate_effect) + '</span>';
        timeline.appendChild(imm);
      }

      // Mutations (how it evolved)
      if (Array.isArray(c.mutations) && c.mutations.length > 0) {
        c.mutations.forEach(function (mutation) {
          var mItem = _el('div', 'ct-tl-item ct-tl-mutation');
          mItem.innerHTML =
            '<span class="ct-tl-dot ct-tl-dot-mut"></span>' +
            '<span class="ct-tl-turn">Turn ' + _esc(mutation.turn || '?') + '</span>' +
            '<span class="ct-tl-label">↪ Evolved:</span>' +
            '<span class="ct-tl-text">' + _esc(mutation.description || mutation.text || '') + '</span>';
          timeline.appendChild(mItem);
        });
      }

      // Ripple effects
      if (c.ripple_effects) {
        var ripple = _el('div', 'ct-tl-item ct-tl-ripple');
        ripple.innerHTML =
          '<span class="ct-tl-dot ct-tl-dot-ripple"></span>' +
          '<span class="ct-tl-label">🌊 Building:</span>' +
          '<span class="ct-tl-text">' + _esc(c.ripple_effects) + '</span>';
        timeline.appendChild(ripple);
      }

      // Deep effect (coming if unresolved)
      if (c.deep_effect) {
        var deep = _el('div', 'ct-tl-item ct-tl-deep');
        deep.innerHTML =
          '<span class="ct-tl-dot ct-tl-dot-deep"></span>' +
          '<span class="ct-tl-label">⚠️ If Unresolved:</span>' +
          '<span class="ct-tl-text ct-deep-text">' + _esc(c.deep_effect) + '</span>';
        timeline.appendChild(deep);
      }

      detail.appendChild(timeline);

      // Witnesses
      if (Array.isArray(c.witnesses) && c.witnesses.length > 0) {
        var witnessSection = _el('div', 'ct-witnesses-section');
        witnessSection.innerHTML = '<span class="ct-section-label">👁 Witnesses:</span> ';
        c.witnesses.forEach(function (w) {
          var badge = _el('span', 'ct-witness-badge', _esc(typeof w === 'object' ? (w.name || w.id) : w));
          witnessSection.appendChild(badge);
        });
        detail.appendChild(witnessSection);
      }

      // Resolution paths
      if (Array.isArray(c.resolution_paths) && c.resolution_paths.length > 0) {
        var resSection = _el('div', 'ct-resolution-section');
        var resTitle = _el('div', 'ct-section-label', '🛤 Resolution Paths:');
        resSection.appendChild(resTitle);

        c.resolution_paths.forEach(function (path, i) {
          var pathEl = _el('div', 'ct-res-path');
          var label = path.label || path.description || ('Option ' + (i + 1));
          var requirement = path.requirement || path.requires || '';
          var difficulty  = path.difficulty || '';

          pathEl.innerHTML =
            '<span class="ct-res-num">' + (i + 1) + '</span>' +
            '<span class="ct-res-label">' + _esc(label) + '</span>' +
            (requirement ? '<span class="ct-res-req">Requires: ' + _esc(requirement) + '</span>' : '') +
            (difficulty  ? '<span class="ct-res-diff">Difficulty: ' + _esc(difficulty) + '</span>' : '');

          resSection.appendChild(pathEl);
        });

        detail.appendChild(resSection);
      }

      return detail;
    }

    // ── Permanent section ────────────────────────────────────────────────────

    function _buildPermanentSection(permanents) {
      if (!permanents || permanents.length === 0) return null;

      var section = _el('div', 'ct-permanent-section');
      var header = _el('div', 'ct-permanent-header');
      header.innerHTML =
        '<span class="ct-permanent-icon">☠️</span>' +
        '<span class="ct-permanent-title">Permanent Consequences</span>';
      section.appendChild(header);

      var explanation = _el('p', 'ct-permanent-explanation',
        'These consequences have permanently altered Heinrich\'s story. They cannot be resolved or undone.');
      section.appendChild(explanation);

      permanents.forEach(function (c) {
        var item = _el('div', 'ct-permanent-item');
        item.dataset.cid = c.id;

        item.innerHTML =
          '<span class="ct-perm-icon">' + _typeIcon(c.type) + '</span>' +
          '<div class="ct-perm-content">' +
            '<div class="ct-perm-title">' + _esc(c.title || 'Unnamed') + '</div>' +
            '<div class="ct-perm-desc">' + _esc(c.description || '') + '</div>' +
            '<div class="ct-perm-meta">Turn ' + _esc(c.trigger_turn || '?') + ' • ' +
              _severityFlames(c.severity) +
            '</div>' +
          '</div>';

        section.appendChild(item);
      });

      return section;
    }

    // ── Filter bar ───────────────────────────────────────────────────────────

    function _buildFilterBar(all) {
      var bar = _el('div', 'ct-filter-bar');

      var filters = [
        { key: 'all',       label: 'All',       icon: '⚡' },
        { key: 'active',    label: 'Active',    icon: '🔴' },
        { key: 'pending',   label: 'Pending',   icon: '⏳' },
        { key: 'resolved',  label: 'Resolved',  icon: '✅' },
        { key: 'permanent', label: 'Permanent', icon: '☠️'  }
      ];

      filters.forEach(function (f) {
        var count = f.key === 'all' ? all.length : all.filter(function (c) { return c.status === f.key; }).length;
        var btn = _el('button', 'ct-filter-btn' + (_currentFilter === f.key ? ' ct-filter-active' : ''));
        btn.dataset.filter = f.key;
        btn.innerHTML =
          '<span class="ct-filter-icon">' + f.icon + '</span>' +
          '<span class="ct-filter-label">' + f.label + '</span>' +
          '<span class="ct-filter-count">' + count + '</span>';
        bar.appendChild(btn);
      });

      return bar;
    }

    // ── Sort toolbar ──────────────────────────────────────────────────────────

    function _buildSortBar() {
      var bar = _el('div', 'ct-sort-bar');

      var label = _el('span', 'ct-sort-label', 'Sort by:');
      bar.appendChild(label);

      var select = _el('select', 'ct-sort-select');
      select.id = 'ct-sort-select';
      [
        { value: 'severity', label: 'Severity'    },
        { value: 'date',     label: 'Date'        },
        { value: 'type',     label: 'Type'        },
        { value: 'expiry',   label: 'Expiry Turn' }
      ].forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === _currentSort) o.selected = true;
        select.appendChild(o);
      });
      bar.appendChild(select);

      return bar;
    }

    // ── CSS injection ────────────────────────────────────────────────────────

    function _injectStyles() {
      if (document.getElementById('ct-styles')) return;
      var style = document.createElement('style');
      style.id = 'ct-styles';
      style.textContent = [
        '.ct-container { display:flex; flex-direction:column; height:100%; font-family:inherit; color:#e8d5b0; background:transparent; }',
        '.ct-filter-bar { display:flex; flex-wrap:wrap; gap:6px; padding:8px 12px; background:rgba(0,0,0,0.3); border-bottom:1px solid rgba(255,255,255,0.1); }',
        '.ct-filter-btn { display:flex; align-items:center; gap:4px; padding:4px 10px; border:1px solid rgba(255,255,255,0.2); border-radius:16px; background:rgba(255,255,255,0.05); color:#e8d5b0; cursor:pointer; font-size:0.8rem; transition:all 0.2s; }',
        '.ct-filter-btn:hover { background:rgba(255,255,255,0.12); }',
        '.ct-filter-active { background:rgba(212,175,55,0.2) !important; border-color:#d4af37 !important; color:#f0d060 !important; }',
        '.ct-filter-count { background:rgba(255,255,255,0.15); border-radius:10px; padding:1px 6px; font-weight:bold; font-size:0.75rem; }',
        '.ct-sort-bar { display:flex; align-items:center; gap:8px; padding:6px 12px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(255,255,255,0.08); }',
        '.ct-sort-label { font-size:0.8rem; color:rgba(232,213,176,0.5); }',
        '.ct-sort-select { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.15); border-radius:4px; color:#e8d5b0; padding:3px 6px; font-size:0.8rem; cursor:pointer; }',
        '.ct-entries-area { flex:1; overflow-y:auto; padding:10px 12px; display:flex; flex-direction:column; gap:8px; }',
        '.ct-entries-area::-webkit-scrollbar { width:6px; }',
        '.ct-entries-area::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.4); border-radius:3px; }',
        '.ct-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-left:3px solid #d4af37; border-radius:6px; padding:10px 12px; transition:all 0.2s; }',
        '.ct-card:hover { background:rgba(255,255,255,0.07); }',
        '.ct-selected { border-color:#d4af37; background:rgba(212,175,55,0.06) !important; }',
        '.ct-status-resolved { opacity:0.65; }',
        '.ct-card-header { display:flex; align-items:flex-start; gap:8px; margin-bottom:4px; }',
        '.ct-type-icon { font-size:1.1rem; flex-shrink:0; margin-top:1px; }',
        '.ct-title-wrap { flex:1; min-width:0; }',
        '.ct-card-title { font-size:0.9rem; font-weight:bold; color:#e8d5b0; }',
        '.ct-card-meta { display:flex; gap:8px; margin-top:2px; flex-wrap:wrap; }',
        '.ct-turn-label { font-size:0.72rem; color:rgba(232,213,176,0.5); }',
        '.ct-expiry-label { font-size:0.72rem; color:rgba(232,213,176,0.5); }',
        '.ct-permanent-label { font-size:0.72rem; color:#e74c3c; }',
        '.ct-severity-col { display:flex; flex-direction:column; align-items:flex-end; gap:3px; flex-shrink:0; }',
        '.ct-flame { font-size:0.85rem; letter-spacing:-2px; }',
        '.ct-flame-skull { font-size:1rem; letter-spacing:0; }',
        '.ct-severity-bar-wrap { width:48px; height:4px; background:rgba(255,255,255,0.1); border-radius:2px; overflow:hidden; }',
        '.ct-severity-bar { height:100%; border-radius:2px; transition:width 0.3s; }',
        '.ct-status-badge { font-size:0.7rem; border:1px solid; border-radius:10px; padding:1px 7px; white-space:nowrap; flex-shrink:0; margin-top:2px; }',
        '.ct-expand-btn { background:none; border:none; color:rgba(232,213,176,0.5); cursor:pointer; font-size:0.75rem; flex-shrink:0; padding:2px 4px; transition:color 0.15s; }',
        '.ct-expand-btn:hover { color:#e8d5b0; }',
        '.ct-card-desc { font-size:0.82rem; color:rgba(232,213,176,0.7); line-height:1.5; padding:0 0 0 28px; margin-bottom:4px; }',
        '.ct-card-detail { padding:8px 0 0 28px; border-top:1px solid rgba(255,255,255,0.08); margin-top:8px; }',
        '.ct-timeline { margin-bottom:10px; }',
        '.ct-timeline-title { font-size:0.78rem; color:#d4af37; font-weight:bold; margin-bottom:6px; }',
        '.ct-tl-item { display:flex; align-items:flex-start; gap:6px; font-size:0.78rem; margin-bottom:5px; flex-wrap:wrap; }',
        '.ct-tl-dot { width:8px; height:8px; border-radius:50%; background:#d4af37; flex-shrink:0; margin-top:3px; }',
        '.ct-tl-dot-mut { background:#9b59b6; }',
        '.ct-tl-dot-ripple { background:#3498db; }',
        '.ct-tl-dot-deep { background:#e74c3c; }',
        '.ct-tl-turn { color:rgba(232,213,176,0.45); font-size:0.72rem; white-space:nowrap; }',
        '.ct-tl-label { color:rgba(232,213,176,0.6); font-weight:bold; white-space:nowrap; }',
        '.ct-tl-text { color:#e8d5b0; flex:1; line-height:1.4; }',
        '.ct-deep-text { color:#e67e22; }',
        '.ct-witnesses-section { display:flex; align-items:center; flex-wrap:wrap; gap:5px; margin-bottom:8px; font-size:0.78rem; }',
        '.ct-section-label { font-size:0.78rem; color:rgba(232,213,176,0.6); font-weight:bold; white-space:nowrap; }',
        '.ct-witness-badge { font-size:0.72rem; padding:1px 7px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.18); border-radius:10px; color:#e8d5b0; }',
        '.ct-resolution-section { margin-bottom:6px; }',
        '.ct-res-path { display:flex; align-items:flex-start; gap:6px; padding:5px 8px; background:rgba(46,204,113,0.06); border:1px solid rgba(46,204,113,0.15); border-radius:4px; margin-bottom:4px; flex-wrap:wrap; cursor:pointer; transition:background 0.15s; }',
        '.ct-res-path:hover { background:rgba(46,204,113,0.12); }',
        '.ct-res-num { font-size:0.72rem; background:rgba(46,204,113,0.2); color:#2ecc71; border-radius:50%; width:16px; height:16px; display:flex; align-items:center; justify-content:center; flex-shrink:0; font-weight:bold; }',
        '.ct-res-label { font-size:0.8rem; color:#e8d5b0; flex:1; }',
        '.ct-res-req { font-size:0.72rem; color:rgba(232,213,176,0.5); flex-basis:100%; padding-left:22px; }',
        '.ct-res-diff { font-size:0.72rem; color:#f39c12; flex-basis:100%; padding-left:22px; }',
        '.ct-permanent-section { background:rgba(231,76,60,0.06); border:1px solid rgba(231,76,60,0.25); border-radius:6px; padding:12px; margin-top:4px; }',
        '.ct-permanent-header { display:flex; align-items:center; gap:8px; margin-bottom:6px; }',
        '.ct-permanent-icon { font-size:1.2rem; }',
        '.ct-permanent-title { font-size:0.88rem; font-weight:bold; color:#e74c3c; }',
        '.ct-permanent-explanation { font-size:0.78rem; color:rgba(231,76,60,0.7); margin:0 0 10px 0; font-style:italic; }',
        '.ct-permanent-item { display:flex; gap:8px; padding:6px 0; border-bottom:1px solid rgba(231,76,60,0.1); }',
        '.ct-permanent-item:last-child { border-bottom:none; }',
        '.ct-perm-icon { font-size:1rem; flex-shrink:0; }',
        '.ct-perm-content { flex:1; }',
        '.ct-perm-title { font-size:0.82rem; font-weight:bold; color:#e8d5b0; }',
        '.ct-perm-desc { font-size:0.78rem; color:rgba(232,213,176,0.65); line-height:1.4; margin-top:2px; }',
        '.ct-perm-meta { font-size:0.72rem; color:rgba(232,213,176,0.4); margin-top:3px; }',
        '.ct-empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:10px; color:rgba(232,213,176,0.4); padding:40px 20px; text-align:center; }',
        '.ct-empty-icon { font-size:2.5rem; }',
        '.ct-empty-text { font-size:0.9rem; }',
        '@media (max-width:600px) { .ct-card-header { flex-wrap:wrap; } }'
      ].join('\n');
      document.head.appendChild(style);
    }

    // ── Event wiring ─────────────────────────────────────────────────────────

    function _wireEvents(container) {
      container.addEventListener('click', function (e) {
        // Filter buttons
        var filterBtn = e.target.closest('.ct-filter-btn');
        if (filterBtn) {
          _currentFilter = filterBtn.dataset.filter || 'all';
          _render();
          return;
        }

        // Expand button
        var expandBtn = e.target.closest('.ct-expand-btn');
        if (expandBtn) {
          var cid = expandBtn.dataset.cid;
          if (cid) {
            _selectedId = (_selectedId === cid) ? null : cid;
            _render();
          }
          return;
        }

        // Card click (expand/collapse)
        var card = e.target.closest('.ct-card');
        if (card) {
          var cid2 = card.dataset.cid;
          if (cid2 && !e.target.closest('.ct-res-path') && !e.target.closest('.ct-expand-btn')) {
            _selectedId = (_selectedId === cid2) ? null : cid2;
            _render();
          }
          return;
        }
      });

      // Sort
      container.addEventListener('change', function (e) {
        if (e.target.classList.contains('ct-sort-select')) {
          _currentSort = e.target.value;
          _render();
        }
      });
    }

    // ── Core render ──────────────────────────────────────────────────────────

    function _render() {
      var container = _getContainer();
      if (!container) return;

      var state = _consequencesState;
      var all   = _getAll(state);

      var permanents = all.filter(function (c) { return c.status === 'permanent'; });
      var nonPermanent = all.filter(function (c) { return c.status !== 'permanent'; });

      var filtered = _filterConsequences(
        _currentFilter === 'permanent' ? permanents : nonPermanent,
        _currentFilter === 'permanent' ? 'permanent' : _currentFilter
      );
      var sorted = _sortConsequences(filtered, _currentSort);

      // Active count badge
      var activeCount = all.filter(function (c) { return c.status === 'active'; }).length;
      _updateTabBadge(activeCount);

      var wrapper = container.querySelector('.ct-container');
      if (!wrapper) {
        container.innerHTML = '';
        wrapper = _el('div', 'ct-container');
        container.appendChild(wrapper);
        _wireEvents(container);
      } else {
        wrapper.innerHTML = '';
      }

      wrapper.appendChild(_buildFilterBar(all));
      wrapper.appendChild(_buildSortBar());

      var entriesArea = _el('div', 'ct-entries-area');

      if (sorted.length === 0 && !(_currentFilter === 'all' && permanents.length > 0)) {
        var empty = _el('div', 'ct-empty-state');
        empty.innerHTML =
          '<span class="ct-empty-icon">✅</span>' +
          '<span class="ct-empty-text">' +
          (_currentFilter === 'all' ? 'No consequences yet.' : 'No ' + _currentFilter + ' consequences.') +
          '</span>';
        entriesArea.appendChild(empty);
      } else {
        sorted.forEach(function (c) {
          entriesArea.appendChild(_buildConsequenceCard(c));
        });

        // Show permanents at bottom when not filtered to permanent only
        if (_currentFilter !== 'permanent' && permanents.length > 0) {
          var permSection = _buildPermanentSection(permanents);
          if (permSection) entriesArea.appendChild(permSection);
        } else if (_currentFilter === 'permanent') {
          permanents.forEach(function (c) {
            entriesArea.appendChild(_buildConsequenceCard(c));
          });
        }
      }

      wrapper.appendChild(entriesArea);
    }

    // ── Public API ───────────────────────────────────────────────────────────

    var ConsequenceTracker = {

      init: function (containerId) {
        _containerId = containerId;
        _injectStyles();
        var container = document.getElementById(containerId);
        if (container) {
          container.innerHTML = '<div class="ct-container"><div class="ct-empty-state"><span class="ct-empty-icon">⚡</span><span class="ct-empty-text">No consequence data loaded.</span></div></div>';
          _wireEvents(container);
        }
      },

      render: function (consequencesState) {
        _consequencesState = consequencesState;
        _render();
      },

      update: function (consequencesState) {
        _consequencesState = consequencesState;
        _render();
      },

      setFilter: function (filter) {
        var valid = ['all', 'active', 'pending', 'resolved', 'permanent'];
        if (valid.indexOf(filter) !== -1) {
          _currentFilter = filter;
          _render();
        }
      },

      sortBy: function (field) {
        var valid = ['severity', 'date', 'type', 'expiry'];
        if (valid.indexOf(field) !== -1) {
          _currentSort = field;
          _render();
        }
      },

      showConsequenceDetail: function (consequenceId) {
        _selectedId = consequenceId;
        _render();
        var container = _getContainer();
        if (container) {
          var card = container.querySelector('[data-cid="' + consequenceId + '"]');
          if (card) card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
      },

      getActiveCount: function () {
        var all = _getAll(_consequencesState);
        return all.filter(function (c) { return c.status === 'active'; }).length;
      }
    };

    return ConsequenceTracker;
  }());

  global.ConsequenceTracker = ConsequenceTracker;

}(window));

// END FILE: client/js/ui/consequence-tracker.js
