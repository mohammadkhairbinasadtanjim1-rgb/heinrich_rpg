// FILE: client/js/ui/memory-palace.js — PART 10

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────

  var CATEGORY_ICONS = {
    facts:         '📚',
    secrets:       '🤫',
    clues:         '🔍',
    lies_detected: '⚠️'
  };

  var RELIABILITY_ICONS = {
    certain:  '🔵',
    probable: '🟡',
    rumored:  '🟠',
    suspected:'🔴'
  };

  var RELIABILITY_LABELS = {
    certain:  'Certain',
    probable: 'Probable',
    rumored:  'Rumored',
    suspected:'Suspected'
  };

  var CATEGORY_LABELS = {
    facts:         'Facts',
    secrets:       'Secrets',
    clues:         'Clues',
    lies_detected: 'Lies Detected'
  };

  var ALL_CATEGORIES = ['facts', 'secrets', 'clues', 'lies_detected'];

  // ─── MemoryPalace IIFE ────────────────────────────────────────────────────

  var MemoryPalace = (function () {

    // Private state
    var _containerId   = null;
    var _container     = null;
    var _memoryState   = null;
    var _currentCategory = 'all';
    var _currentSort   = 'date_learned';
    var _searchQuery   = '';
    var _selectedEntry = null;
    var _connectedPair = [];
    var _searchDebounce = null;

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

    // ── All entries flat list ────────────────────────────────────────────────

    function _allEntries(state) {
      if (!state) return [];
      var entries = [];
      ALL_CATEGORIES.forEach(function (cat) {
        var arr = state[cat];
        if (Array.isArray(arr)) {
          arr.forEach(function (e) {
            var entry = Object.assign({}, e);
            if (!entry.category) entry.category = cat;
            entries.push(entry);
          });
        }
      });
      return entries;
    }

    // ── Filter ──────────────────────────────────────────────────────────────

    function _filterEntries(entries, category, query) {
      var filtered = entries;

      if (category && category !== 'all') {
        var catKey = category === 'lies' ? 'lies_detected' : category;
        filtered = filtered.filter(function (e) {
          return e.category === catKey;
        });
      }

      if (query && query.trim() !== '') {
        var q = query.trim().toLowerCase();
        filtered = filtered.filter(function (e) {
          if (e.content && e.content.toLowerCase().indexOf(q) !== -1) return true;
          if (e.source && e.source.toLowerCase().indexOf(q) !== -1) return true;
          if (e.category && e.category.toLowerCase().indexOf(q) !== -1) return true;
          if (Array.isArray(e.tags)) {
            return e.tags.some(function (t) {
              return t.toLowerCase().indexOf(q) !== -1;
            });
          }
          return false;
        });
      }

      return filtered;
    }

    // ── Sort ─────────────────────────────────────────────────────────────────

    function _sortEntries(entries, sortField) {
      var sorted = entries.slice();
      sorted.sort(function (a, b) {
        switch (sortField) {
          case 'date_learned':
            var da = a.date_learned || '';
            var db = b.date_learned || '';
            if (da < db) return 1;
            if (da > db) return -1;
            return 0;
          case 'relevance':
            var ra = _reliabilityOrder(a.reliability);
            var rb = _reliabilityOrder(b.reliability);
            if (ra !== rb) return rb - ra;
            return 0;
          case 'category':
            var ca = ALL_CATEGORIES.indexOf(a.category);
            var cb = ALL_CATEGORIES.indexOf(b.category);
            if (ca !== cb) return ca - cb;
            return 0;
          case 'source':
            var sa = (a.source || '').toLowerCase();
            var sb = (b.source || '').toLowerCase();
            if (sa < sb) return -1;
            if (sa > sb) return 1;
            return 0;
          default:
            return 0;
        }
      });
      return sorted;
    }

    function _reliabilityOrder(rel) {
      var order = { certain: 4, probable: 3, rumored: 2, suspected: 1 };
      return order[rel] || 0;
    }

    // ── Stats bar ────────────────────────────────────────────────────────────

    function _buildStatsBar(state) {
      var bar = _el('div', 'mp-stats-bar');

      var allEntries = _allEntries(state);
      var totalCount = allEntries.length;

      var totalBtn = _el('button', 'mp-stat-btn' + (_currentCategory === 'all' ? ' mp-stat-active' : ''));
      totalBtn.dataset.category = 'all';
      totalBtn.innerHTML = '<span class="mp-stat-icon">🧠</span><span class="mp-stat-label">All</span><span class="mp-stat-count">' + totalCount + '</span>';
      bar.appendChild(totalBtn);

      ALL_CATEGORIES.forEach(function (cat) {
        var arr = state && Array.isArray(state[cat]) ? state[cat] : [];
        var catDisplay = cat === 'lies_detected' ? 'lies' : cat;
        var btn = _el('button', 'mp-stat-btn' + (_currentCategory === catDisplay || _currentCategory === cat ? ' mp-stat-active' : ''));
        btn.dataset.category = catDisplay;
        btn.innerHTML =
          '<span class="mp-stat-icon">' + (CATEGORY_ICONS[cat] || '📄') + '</span>' +
          '<span class="mp-stat-label">' + (CATEGORY_LABELS[cat] || cat) + '</span>' +
          '<span class="mp-stat-count">' + arr.length + '</span>';
        bar.appendChild(btn);
      });

      return bar;
    }

    // ── Toolbar ──────────────────────────────────────────────────────────────

    function _buildToolbar() {
      var toolbar = _el('div', 'mp-toolbar');

      // Search
      var searchWrapper = _el('div', 'mp-search-wrapper');
      var searchIcon = _el('span', 'mp-search-icon', '🔍');
      var searchInput = _el('input');
      searchInput.type = 'text';
      searchInput.className = 'mp-search-input';
      searchInput.placeholder = 'Search memory palace…';
      searchInput.value = _searchQuery;
      searchInput.id = 'mp-search-input';
      searchWrapper.appendChild(searchIcon);
      searchWrapper.appendChild(searchInput);
      toolbar.appendChild(searchWrapper);

      // Sort
      var sortWrapper = _el('div', 'mp-sort-wrapper');
      var sortLabel = _el('label', 'mp-sort-label', 'Sort:');
      sortLabel.setAttribute('for', 'mp-sort-select');
      var sortSelect = _el('select', 'mp-sort-select');
      sortSelect.id = 'mp-sort-select';
      [
        { value: 'date_learned', label: 'Date Learned' },
        { value: 'relevance',    label: 'Reliability'  },
        { value: 'category',     label: 'Category'     },
        { value: 'source',       label: 'Source'       }
      ].forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === _currentSort) o.selected = true;
        sortSelect.appendChild(o);
      });
      sortWrapper.appendChild(sortLabel);
      sortWrapper.appendChild(sortSelect);
      toolbar.appendChild(sortWrapper);

      // Export
      var exportBtn = _el('button', 'mp-export-btn', '📥 Export');
      exportBtn.title = 'Export Memory Palace as text file';
      toolbar.appendChild(exportBtn);

      return toolbar;
    }

    // ── Entry card ───────────────────────────────────────────────────────────

    function _buildEntryCard(entry) {
      var catKey = entry.category || 'facts';
      var catNorm = catKey === 'lies_detected' ? 'lies_detected' : catKey;
      var isConnected = _connectedPair.length === 2 &&
        (_connectedPair[0] === entry.id || _connectedPair[1] === entry.id);
      var isSelected = _selectedEntry === entry.id;

      var card = _el('div',
        'mp-entry-card mp-cat-' + catNorm +
        (entry.acted_upon ? ' mp-acted-upon' : '') +
        (isConnected ? ' mp-connected-highlight' : '') +
        (isSelected ? ' mp-selected' : '')
      );
      card.dataset.entryId = entry.id;

      // Header row
      var header = _el('div', 'mp-entry-header');

      var catIcon = _el('span', 'mp-entry-cat-icon', CATEGORY_ICONS[catNorm] || '📄');
      catIcon.title = CATEGORY_LABELS[catNorm] || catNorm;
      header.appendChild(catIcon);

      var relIcon = _el('span', 'mp-entry-reliability');
      relIcon.innerHTML = (RELIABILITY_ICONS[entry.reliability] || '⚪') +
        '<span class="mp-rel-label">' + _esc(RELIABILITY_LABELS[entry.reliability] || entry.reliability || '') + '</span>';
      relIcon.title = 'Reliability: ' + (RELIABILITY_LABELS[entry.reliability] || '');
      header.appendChild(relIcon);

      if (entry.acted_upon) {
        var actedBadge = _el('span', 'mp-acted-badge', '✔ Used');
        header.appendChild(actedBadge);
      }

      if (isConnected) {
        var connBadge = _el('span', 'mp-connected-badge', '🔗 Linked');
        header.appendChild(connBadge);
      }

      var actions = _el('div', 'mp-entry-actions');
      var detailBtn = _el('button', 'mp-detail-btn', '🔎');
      detailBtn.title = 'Show detail';
      detailBtn.dataset.entryId = entry.id;
      actions.appendChild(detailBtn);

      if (!entry.acted_upon && (catNorm === 'clues' || catNorm === 'secrets')) {
        var markBtn = _el('button', 'mp-mark-btn', '✔');
        markBtn.title = 'Mark as acted upon';
        markBtn.dataset.entryId = entry.id;
        actions.appendChild(markBtn);
      }

      header.appendChild(actions);
      card.appendChild(header);

      // Content
      var contentEl = _el('div', 'mp-entry-content', _esc(entry.content || ''));
      card.appendChild(contentEl);

      // Meta row
      var meta = _el('div', 'mp-entry-meta');
      meta.innerHTML =
        '<span class="mp-meta-source">📜 ' + _esc(entry.source || 'Unknown') + '</span>' +
        '<span class="mp-meta-date">🕐 ' + _esc(_formatDate(entry.date_learned)) + '</span>';
      card.appendChild(meta);

      // Tags
      if (Array.isArray(entry.tags) && entry.tags.length > 0) {
        var tagsEl = _el('div', 'mp-entry-tags');
        entry.tags.forEach(function (tag) {
          var badge = _el('span', 'mp-tag-badge', _esc(tag));
          tagsEl.appendChild(badge);
        });
        card.appendChild(tagsEl);
      }

      // Connected entries indicator
      if (Array.isArray(entry.connected_to) && entry.connected_to.length > 0) {
        var connEl = _el('div', 'mp-entry-connections');
        connEl.innerHTML = '🔗 Connected to ' + entry.connected_to.length + ' other entr' +
          (entry.connected_to.length === 1 ? 'y' : 'ies');
        card.appendChild(connEl);
      }

      return card;
    }

    function _formatDate(dateLearned) {
      if (!dateLearned) return 'Unknown';
      if (typeof dateLearned === 'object' && dateLearned.turn !== undefined) {
        return 'Turn ' + dateLearned.turn + (dateLearned.date ? ', ' + dateLearned.date : '');
      }
      return String(dateLearned);
    }

    // ── Clue connections section ─────────────────────────────────────────────

    function _buildClueConnections(state) {
      var clues = (state && Array.isArray(state.clues)) ? state.clues : [];
      if (clues.length < 2) return null;

      // Find pairs of clues that share tags
      var connections = [];
      for (var i = 0; i < clues.length; i++) {
        for (var j = i + 1; j < clues.length; j++) {
          var tagsA = clues[i].tags || [];
          var tagsB = clues[j].tags || [];
          var shared = tagsA.filter(function (t) { return tagsB.indexOf(t) !== -1; });
          if (shared.length > 0) {
            connections.push({ a: clues[i], b: clues[j], shared: shared });
          }
          // Also check connected_to arrays
          if (Array.isArray(clues[i].connected_to) && clues[i].connected_to.indexOf(clues[j].id) !== -1) {
            var exists = connections.some(function (c) {
              return (c.a.id === clues[i].id && c.b.id === clues[j].id);
            });
            if (!exists) connections.push({ a: clues[i], b: clues[j], shared: [] });
          }
        }
      }

      if (connections.length === 0) return null;

      var section = _el('div', 'mp-clue-connections');
      var title = _el('h3', 'mp-section-title', '🔗 Potential Clue Connections');
      section.appendChild(title);

      var subtitle = _el('p', 'mp-section-subtitle',
        'These clues may be related. Click a connection to highlight both entries.');
      section.appendChild(subtitle);

      connections.forEach(function (conn) {
        var row = _el('div', 'mp-conn-row');
        row.dataset.idA = conn.a.id;
        row.dataset.idB = conn.b.id;

        var aSpan = _el('span', 'mp-conn-entry', _esc(_truncate(conn.a.content, 50)));
        aSpan.title = conn.a.content;
        var linkIcon = _el('span', 'mp-conn-link');
        linkIcon.innerHTML = conn.shared.length > 0
          ? '🔗 <span class="mp-conn-tags">' + conn.shared.map(_esc).join(', ') + '</span>'
          : '🔗';
        var bSpan = _el('span', 'mp-conn-entry', _esc(_truncate(conn.b.content, 50)));
        bSpan.title = conn.b.content;

        row.appendChild(aSpan);
        row.appendChild(linkIcon);
        row.appendChild(bSpan);
        section.appendChild(row);
      });

      return section;
    }

    function _truncate(str, len) {
      if (!str) return '';
      return str.length > len ? str.substring(0, len) + '…' : str;
    }

    // ── Entry detail panel ───────────────────────────────────────────────────

    function _buildDetailPanel(entry) {
      if (!entry) return null;

      var panel = _el('div', 'mp-detail-panel');

      var closeBtn = _el('button', 'mp-detail-close', '✕');
      closeBtn.title = 'Close detail';
      panel.appendChild(closeBtn);

      var catNorm = entry.category || 'facts';
      var header = _el('div', 'mp-detail-header');
      header.innerHTML =
        '<span class="mp-detail-cat-icon">' + (CATEGORY_ICONS[catNorm] || '📄') + '</span>' +
        '<span class="mp-detail-cat-label">' + _esc(CATEGORY_LABELS[catNorm] || catNorm) + '</span>' +
        '<span class="mp-detail-rel">' + (RELIABILITY_ICONS[entry.reliability] || '⚪') +
        ' ' + _esc(RELIABILITY_LABELS[entry.reliability] || entry.reliability || '') + '</span>';
      panel.appendChild(header);

      var content = _el('div', 'mp-detail-content', _esc(entry.content || ''));
      panel.appendChild(content);

      var meta = _el('dl', 'mp-detail-meta');

      function addMeta(label, value) {
        var dt = _el('dt', '', label);
        var dd = _el('dd', '', value);
        meta.appendChild(dt);
        meta.appendChild(dd);
      }

      addMeta('Source:', _esc(entry.source || 'Unknown'));
      addMeta('Learned:', _esc(_formatDate(entry.date_learned)));
      addMeta('Reliability:', (RELIABILITY_ICONS[entry.reliability] || '⚪') + ' ' + _esc(RELIABILITY_LABELS[entry.reliability] || entry.reliability || 'Unknown'));
      addMeta('Acted Upon:', entry.acted_upon ? '✔ Yes' : 'No');
      addMeta('Entry ID:', _esc(entry.id || ''));

      panel.appendChild(meta);

      if (Array.isArray(entry.tags) && entry.tags.length > 0) {
        var tagsSection = _el('div', 'mp-detail-tags-section');
        tagsSection.innerHTML = '<strong>Tags:</strong> ';
        entry.tags.forEach(function (tag) {
          var badge = _el('span', 'mp-tag-badge', _esc(tag));
          tagsSection.appendChild(badge);
        });
        panel.appendChild(tagsSection);
      }

      if (Array.isArray(entry.connected_to) && entry.connected_to.length > 0) {
        var connSection = _el('div', 'mp-detail-conn-section');
        connSection.innerHTML = '<strong>Connected Entries:</strong>';
        var connList = _el('ul', 'mp-detail-conn-list');
        entry.connected_to.forEach(function (cid) {
          var li = _el('li', 'mp-detail-conn-item');
          var link = _el('a', 'mp-conn-link-btn', '🔍 ' + _esc(cid));
          link.href = '#';
          link.dataset.entryId = cid;
          li.appendChild(link);
          connList.appendChild(li);
        });
        connSection.appendChild(connList);
        panel.appendChild(connSection);
      }

      // Action buttons
      var detailActions = _el('div', 'mp-detail-actions');

      if (!entry.acted_upon && (entry.category === 'clues' || entry.category === 'secrets')) {
        var markActedBtn = _el('button', 'mp-btn mp-btn-primary', '✔ Mark as Acted Upon');
        markActedBtn.dataset.entryId = entry.id;
        markActedBtn.classList.add('mp-mark-acted-detail');
        detailActions.appendChild(markActedBtn);
      }

      var connectBtn = _el('button', 'mp-btn mp-btn-secondary', '🔗 Connect to Another Entry');
      connectBtn.dataset.entryId = entry.id;
      connectBtn.classList.add('mp-connect-btn-detail');
      detailActions.appendChild(connectBtn);

      panel.appendChild(detailActions);

      return panel;
    }

    // ── CSS injection ────────────────────────────────────────────────────────

    function _injectStyles() {
      if (document.getElementById('mp-styles')) return;
      var style = document.createElement('style');
      style.id = 'mp-styles';
      style.textContent = [
        '.mp-container { display:flex; flex-direction:column; height:100%; font-family:inherit; color:#e8d5b0; background:transparent; }',
        '.mp-stats-bar { display:flex; flex-wrap:wrap; gap:6px; padding:8px 12px; background:rgba(0,0,0,0.3); border-bottom:1px solid rgba(255,255,255,0.1); }',
        '.mp-stat-btn { display:flex; align-items:center; gap:4px; padding:4px 10px; border:1px solid rgba(255,255,255,0.2); border-radius:16px; background:rgba(255,255,255,0.05); color:#e8d5b0; cursor:pointer; font-size:0.8rem; transition:all 0.2s; }',
        '.mp-stat-btn:hover { background:rgba(255,255,255,0.12); border-color:rgba(255,255,255,0.4); }',
        '.mp-stat-active { background:rgba(212,175,55,0.25) !important; border-color:#d4af37 !important; color:#f0d060 !important; }',
        '.mp-stat-count { background:rgba(255,255,255,0.15); border-radius:10px; padding:1px 6px; font-weight:bold; font-size:0.75rem; }',
        '.mp-toolbar { display:flex; align-items:center; gap:10px; padding:8px 12px; background:rgba(0,0,0,0.2); border-bottom:1px solid rgba(255,255,255,0.08); flex-wrap:wrap; }',
        '.mp-search-wrapper { display:flex; align-items:center; gap:6px; flex:1; min-width:140px; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.15); border-radius:6px; padding:4px 8px; }',
        '.mp-search-input { background:transparent; border:none; outline:none; color:#e8d5b0; font-size:0.85rem; flex:1; min-width:80px; }',
        '.mp-search-input::placeholder { color:rgba(232,213,176,0.4); }',
        '.mp-sort-wrapper { display:flex; align-items:center; gap:6px; }',
        '.mp-sort-label { font-size:0.8rem; color:rgba(232,213,176,0.6); }',
        '.mp-sort-select { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.15); border-radius:4px; color:#e8d5b0; padding:4px 6px; font-size:0.8rem; cursor:pointer; }',
        '.mp-export-btn { padding:4px 10px; border:1px solid rgba(212,175,55,0.5); border-radius:4px; background:rgba(212,175,55,0.1); color:#d4af37; cursor:pointer; font-size:0.8rem; transition:all 0.2s; white-space:nowrap; }',
        '.mp-export-btn:hover { background:rgba(212,175,55,0.2); }',
        '.mp-body { display:flex; flex:1; overflow:hidden; }',
        '.mp-entries-area { flex:1; overflow-y:auto; padding:10px 12px; display:flex; flex-direction:column; gap:8px; }',
        '.mp-entries-area::-webkit-scrollbar { width:6px; }',
        '.mp-entries-area::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.4); border-radius:3px; }',
        '.mp-entry-card { background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.12); border-radius:6px; padding:10px 12px; transition:all 0.2s; cursor:default; }',
        '.mp-entry-card:hover { background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.25); }',
        '.mp-selected { border-color:#d4af37 !important; background:rgba(212,175,55,0.08) !important; }',
        '.mp-connected-highlight { border-color:#7ecfff !important; background:rgba(126,207,255,0.08) !important; box-shadow:0 0 0 2px rgba(126,207,255,0.3); }',
        '.mp-acted-upon { opacity:0.55; }',
        '.mp-cat-facts { border-left:3px solid #5b9bd5; }',
        '.mp-cat-secrets { border-left:3px solid #9b59b6; }',
        '.mp-cat-clues { border-left:3px solid #f39c12; }',
        '.mp-cat-lies_detected { border-left:3px solid #e74c3c; }',
        '.mp-entry-header { display:flex; align-items:center; gap:6px; margin-bottom:5px; }',
        '.mp-entry-cat-icon { font-size:1rem; }',
        '.mp-entry-reliability { display:flex; align-items:center; gap:3px; font-size:0.8rem; }',
        '.mp-rel-label { color:rgba(232,213,176,0.5); font-size:0.75rem; }',
        '.mp-acted-badge { font-size:0.7rem; background:rgba(46,204,113,0.2); color:#2ecc71; border:1px solid rgba(46,204,113,0.4); border-radius:10px; padding:1px 6px; }',
        '.mp-connected-badge { font-size:0.7rem; background:rgba(126,207,255,0.2); color:#7ecfff; border:1px solid rgba(126,207,255,0.4); border-radius:10px; padding:1px 6px; }',
        '.mp-entry-actions { margin-left:auto; display:flex; gap:4px; }',
        '.mp-detail-btn,.mp-mark-btn { background:none; border:1px solid rgba(255,255,255,0.2); border-radius:4px; color:#e8d5b0; cursor:pointer; padding:2px 6px; font-size:0.75rem; transition:all 0.15s; }',
        '.mp-detail-btn:hover { background:rgba(255,255,255,0.12); }',
        '.mp-mark-btn:hover { background:rgba(46,204,113,0.15); border-color:#2ecc71; color:#2ecc71; }',
        '.mp-entry-content { font-size:0.88rem; line-height:1.5; color:#e8d5b0; margin-bottom:5px; }',
        '.mp-entry-meta { display:flex; gap:14px; font-size:0.75rem; color:rgba(232,213,176,0.55); margin-bottom:4px; flex-wrap:wrap; }',
        '.mp-entry-tags { display:flex; flex-wrap:wrap; gap:4px; }',
        '.mp-tag-badge { font-size:0.7rem; padding:1px 7px; border-radius:10px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.18); color:rgba(232,213,176,0.8); }',
        '.mp-entry-connections { font-size:0.75rem; color:#7ecfff; margin-top:4px; }',
        '.mp-empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; flex:1; gap:10px; color:rgba(232,213,176,0.4); padding:40px 20px; text-align:center; }',
        '.mp-empty-icon { font-size:2.5rem; }',
        '.mp-empty-text { font-size:0.9rem; }',
        '.mp-section-title { font-size:0.9rem; color:#d4af37; border-bottom:1px solid rgba(212,175,55,0.3); padding-bottom:4px; margin:0 0 8px 0; }',
        '.mp-section-subtitle { font-size:0.78rem; color:rgba(232,213,176,0.5); margin:0 0 8px 0; }',
        '.mp-clue-connections { background:rgba(243,156,18,0.05); border:1px solid rgba(243,156,18,0.2); border-radius:6px; padding:10px 12px; margin-top:4px; }',
        '.mp-conn-row { display:flex; align-items:center; gap:8px; padding:5px 0; border-bottom:1px solid rgba(255,255,255,0.05); cursor:pointer; font-size:0.8rem; flex-wrap:wrap; transition:background 0.15s; border-radius:4px; }',
        '.mp-conn-row:last-child { border-bottom:none; }',
        '.mp-conn-row:hover { background:rgba(255,255,255,0.05); }',
        '.mp-conn-entry { flex:1; color:#e8d5b0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }',
        '.mp-conn-link { color:#7ecfff; white-space:nowrap; font-size:0.75rem; }',
        '.mp-conn-tags { color:rgba(126,207,255,0.7); }',
        '.mp-detail-panel { width:280px; border-left:1px solid rgba(255,255,255,0.1); background:rgba(0,0,0,0.35); overflow-y:auto; padding:14px; position:relative; flex-shrink:0; }',
        '.mp-detail-panel::-webkit-scrollbar { width:4px; }',
        '.mp-detail-panel::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.4); border-radius:2px; }',
        '.mp-detail-close { position:absolute; top:8px; right:8px; background:none; border:none; color:rgba(232,213,176,0.6); cursor:pointer; font-size:1rem; line-height:1; padding:2px 6px; transition:color 0.15s; }',
        '.mp-detail-close:hover { color:#e8d5b0; }',
        '.mp-detail-header { display:flex; align-items:center; gap:6px; margin-bottom:10px; padding-right:24px; flex-wrap:wrap; }',
        '.mp-detail-cat-icon { font-size:1.2rem; }',
        '.mp-detail-cat-label { font-size:0.8rem; color:rgba(232,213,176,0.6); }',
        '.mp-detail-rel { font-size:0.8rem; }',
        '.mp-detail-content { font-size:0.88rem; line-height:1.6; color:#e8d5b0; background:rgba(255,255,255,0.04); border-radius:4px; padding:8px; margin-bottom:10px; }',
        '.mp-detail-meta { display:grid; grid-template-columns:auto 1fr; gap:2px 8px; font-size:0.78rem; margin-bottom:10px; }',
        '.mp-detail-meta dt { color:rgba(232,213,176,0.5); font-weight:bold; }',
        '.mp-detail-meta dd { color:#e8d5b0; margin:0; word-break:break-word; }',
        '.mp-detail-tags-section,.mp-detail-conn-section { margin-bottom:10px; font-size:0.8rem; }',
        '.mp-detail-conn-list { list-style:none; padding:0; margin:4px 0 0 0; }',
        '.mp-detail-conn-item { margin-bottom:3px; }',
        '.mp-conn-link-btn { color:#7ecfff; text-decoration:none; font-size:0.8rem; }',
        '.mp-conn-link-btn:hover { text-decoration:underline; }',
        '.mp-detail-actions { display:flex; flex-direction:column; gap:6px; }',
        '.mp-btn { padding:6px 10px; border-radius:4px; cursor:pointer; font-size:0.8rem; border:1px solid; transition:all 0.15s; text-align:center; }',
        '.mp-btn-primary { background:rgba(46,204,113,0.15); border-color:rgba(46,204,113,0.5); color:#2ecc71; }',
        '.mp-btn-primary:hover { background:rgba(46,204,113,0.25); }',
        '.mp-btn-secondary { background:rgba(126,207,255,0.1); border-color:rgba(126,207,255,0.4); color:#7ecfff; }',
        '.mp-btn-secondary:hover { background:rgba(126,207,255,0.2); }',
        '.mp-new-entry { animation:mp-slide-in 0.35s ease; }',
        '@keyframes mp-slide-in { from { opacity:0; transform:translateY(-10px); } to { opacity:1; transform:translateY(0); } }',
        '.mp-search-highlight { background:rgba(212,175,55,0.3); border-radius:2px; }',
        '@media (max-width:600px) { .mp-detail-panel { width:100%; border-left:none; border-top:1px solid rgba(255,255,255,0.1); } .mp-body { flex-direction:column; } }'
      ].join('\n');
      document.head.appendChild(style);
    }

    // ── Event wiring ─────────────────────────────────────────────────────────

    function _wireEvents(container) {
      // Stats bar category buttons
      container.addEventListener('click', function (e) {
        var statBtn = e.target.closest('.mp-stat-btn');
        if (statBtn) {
          _currentCategory = statBtn.dataset.category || 'all';
          _render();
          return;
        }

        // Detail button
        var detailBtn = e.target.closest('.mp-detail-btn');
        if (detailBtn) {
          var eid = detailBtn.dataset.entryId;
          if (eid) {
            _selectedEntry = (_selectedEntry === eid) ? null : eid;
            _render();
          }
          return;
        }

        // Mark acted button (card)
        var markBtn = e.target.closest('.mp-mark-btn');
        if (markBtn) {
          var mid = markBtn.dataset.entryId;
          if (mid) { MemoryPalace.markActedUpon(mid); }
          return;
        }

        // Mark acted button (detail panel)
        var markDetailBtn = e.target.closest('.mp-mark-acted-detail');
        if (markDetailBtn) {
          var mdid = markDetailBtn.dataset.entryId;
          if (mdid) { MemoryPalace.markActedUpon(mdid); }
          return;
        }

        // Connect btn in detail
        var connectDetailBtn = e.target.closest('.mp-connect-btn-detail');
        if (connectDetailBtn) {
          var cdid = connectDetailBtn.dataset.entryId;
          if (cdid) {
            if (_connectedPair.length === 0) {
              _connectedPair = [cdid];
              connectDetailBtn.textContent = '🔗 Click another entry…';
            } else if (_connectedPair.length === 1 && _connectedPair[0] !== cdid) {
              _connectedPair.push(cdid);
              MemoryPalace.connectEntries(_connectedPair[0], _connectedPair[1]);
              _connectedPair = [];
              _render();
            }
          }
          return;
        }

        // Detail panel close
        var closeBtn = e.target.closest('.mp-detail-close');
        if (closeBtn) {
          _selectedEntry = null;
          _render();
          return;
        }

        // Clue connection row
        var connRow = e.target.closest('.mp-conn-row');
        if (connRow) {
          var idA = connRow.dataset.idA;
          var idB = connRow.dataset.idB;
          if (idA && idB) {
            MemoryPalace.connectEntries(idA, idB);
          }
          return;
        }

        // Connected entry link in detail
        var connLink = e.target.closest('.mp-conn-link-btn');
        if (connLink) {
          e.preventDefault();
          var lid = connLink.dataset.entryId;
          if (lid) { MemoryPalace.showEntryDetail(lid); }
          return;
        }

        // Export button
        var exportBtn = e.target.closest('.mp-export-btn');
        if (exportBtn) {
          MemoryPalace.exportMemoryPalace();
          return;
        }
      });

      // Sort select
      container.addEventListener('change', function (e) {
        if (e.target.classList.contains('mp-sort-select')) {
          _currentSort = e.target.value;
          _render();
        }
      });

      // Search input
      container.addEventListener('input', function (e) {
        if (e.target.classList.contains('mp-search-input')) {
          clearTimeout(_searchDebounce);
          _searchDebounce = setTimeout(function () {
            _searchQuery = e.target.value;
            _render();
          }, 250);
        }
      });
    }

    // ── Core render ──────────────────────────────────────────────────────────

    function _render() {
      var container = _getContainer();
      if (!container) return;

      var state = _memoryState || {};

      // Build wrapper if not present
      var wrapper = container.querySelector('.mp-container');
      if (!wrapper) {
        container.innerHTML = '';
        wrapper = _el('div', 'mp-container');
        container.appendChild(wrapper);
        _wireEvents(container);
      } else {
        wrapper.innerHTML = '';
      }

      // Stats bar
      wrapper.appendChild(_buildStatsBar(state));

      // Toolbar
      wrapper.appendChild(_buildToolbar());

      // Body
      var body = _el('div', 'mp-body');
      wrapper.appendChild(body);

      // Entries area
      var entriesArea = _el('div', 'mp-entries-area');
      body.appendChild(entriesArea);

      var allEntries = _allEntries(state);
      var filtered   = _filterEntries(allEntries, _currentCategory, _searchQuery);
      var sorted     = _sortEntries(filtered, _currentSort);

      if (sorted.length === 0) {
        var empty = _el('div', 'mp-empty-state');
        empty.innerHTML = '<span class="mp-empty-icon">🧠</span><span class="mp-empty-text">' +
          (_searchQuery ? 'No entries match your search.' : 'No memory entries yet.') +
          '</span>';
        entriesArea.appendChild(empty);
      } else {
        sorted.forEach(function (entry) {
          var card = _buildEntryCard(entry);
          entriesArea.appendChild(card);
        });

        // Clue connections section (only when viewing all or clues)
        if (_currentCategory === 'all' || _currentCategory === 'clues') {
          var clueConns = _buildClueConnections(state);
          if (clueConns) {
            entriesArea.appendChild(clueConns);
          }
        }
      }

      // Detail panel
      if (_selectedEntry) {
        var allE = _allEntries(state);
        var entryObj = null;
        for (var i = 0; i < allE.length; i++) {
          if (allE[i].id === _selectedEntry) { entryObj = allE[i]; break; }
        }
        if (entryObj) {
          var detailPanel = _buildDetailPanel(entryObj);
          if (detailPanel) body.appendChild(detailPanel);
        }
      }
    }

    // ── Find entry by id ─────────────────────────────────────────────────────

    function _findEntry(id) {
      if (!_memoryState) return null;
      var all = _allEntries(_memoryState);
      for (var i = 0; i < all.length; i++) {
        if (all[i].id === id) return all[i];
      }
      return null;
    }

    // ── Public API ───────────────────────────────────────────────────────────

    var MemoryPalace = {

      init: function (containerId) {
        _containerId = containerId;
        _injectStyles();
        _container = document.getElementById(containerId);
        if (_container) {
          _container.innerHTML = '<div class="mp-container"><div class="mp-empty-state"><span class="mp-empty-icon">🧠</span><span class="mp-empty-text">No memories loaded.</span></div></div>';
          _wireEvents(_container);
        }
      },

      render: function (memoryState) {
        _memoryState = memoryState || {};
        _render();
      },

      update: function (memoryState, newEntries) {
        var oldState = _memoryState || {};
        _memoryState = memoryState || {};

        _render();

        // Animate new entries
        if (Array.isArray(newEntries) && newEntries.length > 0) {
          var container = _getContainer();
          if (!container) return;
          newEntries.forEach(function (entry) {
            var card = container.querySelector('[data-entry-id="' + entry.id + '"]');
            if (card) {
              card.classList.add('mp-new-entry');
              setTimeout(function () {
                card.classList.remove('mp-new-entry');
              }, 600);
            }
          });
        }
      },

      search: function (query) {
        _searchQuery = query || '';
        _render();
        return _filterEntries(_allEntries(_memoryState || {}), _currentCategory, _searchQuery);
      },

      setCategory: function (category) {
        _currentCategory = category || 'all';
        _render();
      },

      sortBy: function (field) {
        var valid = ['date_learned', 'relevance', 'category', 'source'];
        if (valid.indexOf(field) !== -1) {
          _currentSort = field;
          _render();
        }
      },

      showEntryDetail: function (entryId) {
        _selectedEntry = entryId;
        _connectedPair = [];
        _render();
        // Scroll entry into view
        var container = _getContainer();
        if (container) {
          var card = container.querySelector('[data-entry-id="' + entryId + '"]');
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }
        }
      },

      connectEntries: function (id1, id2) {
        _connectedPair = [id1, id2];
        _render();

        // Auto-clear highlight after 4 seconds
        setTimeout(function () {
          if (_connectedPair[0] === id1 && _connectedPair[1] === id2) {
            _connectedPair = [];
            _render();
          }
        }, 4000);
      },

      markActedUpon: function (entryId) {
        if (!_memoryState) return;
        var found = false;
        ALL_CATEGORIES.forEach(function (cat) {
          var arr = _memoryState[cat];
          if (Array.isArray(arr)) {
            arr.forEach(function (entry) {
              if (entry.id === entryId) {
                entry.acted_upon = true;
                found = true;
              }
            });
          }
        });
        if (found) {
          _render();
          // Dispatch event for game engine
          var ev = new CustomEvent('memory:actedUpon', { detail: { entryId: entryId } });
          document.dispatchEvent(ev);
        }
      },

      exportMemoryPalace: function () {
        if (!_memoryState) return;
        var lines = ['═══════════════════════════════════', 'HEINRICH\'S MEMORY PALACE', 'Exported: ' + new Date().toLocaleString(), '═══════════════════════════════════', ''];

        ALL_CATEGORIES.forEach(function (cat) {
          var arr = _memoryState[cat];
          if (!Array.isArray(arr) || arr.length === 0) return;

          lines.push('');
          lines.push('── ' + (CATEGORY_LABELS[cat] || cat).toUpperCase() + ' ──');
          lines.push('');

          arr.forEach(function (entry, idx) {
            lines.push((idx + 1) + '. ' + (entry.content || ''));
            lines.push('   Source: ' + (entry.source || 'Unknown'));
            lines.push('   Learned: ' + _formatDate(entry.date_learned));
            lines.push('   Reliability: ' + (RELIABILITY_LABELS[entry.reliability] || entry.reliability || 'Unknown'));
            if (Array.isArray(entry.tags) && entry.tags.length > 0) {
              lines.push('   Tags: ' + entry.tags.join(', '));
            }
            if (entry.acted_upon) lines.push('   [ACTED UPON]');
            lines.push('');
          });
        });

        var text = lines.join('\n');
        var blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        var url  = URL.createObjectURL(blob);
        var a    = document.createElement('a');
        a.href   = url;
        a.download = 'heinrich-memory-palace.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
      }
    };

    return MemoryPalace;
  }());

  global.MemoryPalace = MemoryPalace;

}(window));

// END FILE: client/js/ui/memory-palace.js
