// FILE: client/js/ui/modals.js — PART 10

(function (global) {
  'use strict';

  // ─── Constants ────────────────────────────────────────────────────────────

  var PROVIDERS = [
    { value: 'openai',    label: 'OpenAI',            models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'] },
    { value: 'anthropic', label: 'Anthropic',          models: ['claude-opus-4-5', 'claude-sonnet-4-5', 'claude-haiku-3-5'] },
    { value: 'google',    label: 'Google Gemini',      models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash'] },
    { value: 'mistral',   label: 'Mistral',            models: ['mistral-large-latest', 'mistral-medium-latest', 'open-mistral-7b'] },
    { value: 'ollama',    label: 'Ollama (Local)',      models: ['llama3', 'mistral', 'phi3', 'gemma2', 'qwen2'] },
    { value: 'custom',    label: 'Custom / OpenAI-Compatible', models: [] }
  ];

  var MODAL_IDS = ['settings', 'api-config', 'save-load', 'help', 'confirm', 'item-detail', 'npc-detail', 'new-game', 'session-key-display'];

  // ─── Modals IIFE ─────────────────────────────────────────────────────────

  var Modals = (function () {

    var _overlay         = null;
    var _openModals      = {};
    var _closeCallbacks  = {};
    var _confirmResolve  = null;
    var _settings        = {};
    var _apiConfig       = {};

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

    function _loadSettings() {
      try {
        var s = localStorage.getItem('heinrich_settings');
        _settings = s ? JSON.parse(s) : {};
      } catch (e) { _settings = {}; }
      _settings = Object.assign({
        textSize: 'medium',
        paragraphSpacing: 'normal',
        theme: 'dark-parchment',
        proseAnimation: 'typewriter',
        autoSave: true,
        soundEffects: false,
        language: 'en'
      }, _settings);
    }

    function _saveSettings() {
      try { localStorage.setItem('heinrich_settings', JSON.stringify(_settings)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('settings:changed', { detail: _settings }));
    }

    function _loadApiConfig() {
      try {
        var s = localStorage.getItem('heinrich_api_config');
        _apiConfig = s ? JSON.parse(s) : {};
      } catch (e) { _apiConfig = {}; }
      _apiConfig = Object.assign({
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4o',
        serverUrl: 'http://localhost:3000',
        maxTokens: 1500,
        temperature: 0.85
      }, _apiConfig);
    }

    function _saveApiConfig() {
      try { localStorage.setItem('heinrich_api_config', JSON.stringify(_apiConfig)); } catch (e) {}
      document.dispatchEvent(new CustomEvent('api:configChanged', { detail: _apiConfig }));
    }

    // ── CSS injection ─────────────────────────────────────────────────────────

    function _injectStyles() {
      if (document.getElementById('modals-styles')) return;
      var style = document.createElement('style');
      style.id = 'modals-styles';
      style.textContent = [
        /* Overlay */
        '.modal-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.72); z-index:1000; display:flex; align-items:center; justify-content:center; padding:16px; box-sizing:border-box; animation:modal-fade-in 0.18s ease; }',
        '.modal-overlay.modal-fade-out { animation:modal-fade-out 0.15s ease forwards; }',
        '@keyframes modal-fade-in { from { opacity:0; } to { opacity:1; } }',
        '@keyframes modal-fade-out { from { opacity:1; } to { opacity:0; } }',
        /* Modal box */
        '.modal-box { background:#1a1410; border:1px solid rgba(212,175,55,0.35); border-radius:8px; color:#e8d5b0; max-width:560px; width:100%; max-height:calc(100vh - 40px); display:flex; flex-direction:column; box-shadow:0 20px 60px rgba(0,0,0,0.8); animation:modal-box-in 0.2s ease; position:relative; }',
        '.modal-box-wide { max-width:720px; }',
        '.modal-box-narrow { max-width:400px; }',
        '@keyframes modal-box-in { from { opacity:0; transform:translateY(-16px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }',
        /* Header */
        '.modal-header { display:flex; align-items:center; padding:14px 18px 12px; border-bottom:1px solid rgba(255,255,255,0.1); flex-shrink:0; }',
        '.modal-title { flex:1; font-size:1rem; font-weight:bold; color:#d4af37; }',
        '.modal-close-btn { background:none; border:none; color:rgba(232,213,176,0.5); cursor:pointer; font-size:1.2rem; line-height:1; padding:2px 6px; transition:color 0.15s; }',
        '.modal-close-btn:hover { color:#e8d5b0; }',
        /* Body */
        '.modal-body { flex:1; overflow-y:auto; padding:16px 18px; }',
        '.modal-body::-webkit-scrollbar { width:6px; }',
        '.modal-body::-webkit-scrollbar-thumb { background:rgba(212,175,55,0.4); border-radius:3px; }',
        /* Footer */
        '.modal-footer { display:flex; gap:8px; justify-content:flex-end; padding:12px 18px; border-top:1px solid rgba(255,255,255,0.1); flex-shrink:0; flex-wrap:wrap; }',
        /* Buttons */
        '.modal-btn { padding:7px 16px; border-radius:4px; cursor:pointer; font-size:0.85rem; border:1px solid; transition:all 0.15s; font-family:inherit; }',
        '.modal-btn-primary { background:rgba(212,175,55,0.2); border-color:#d4af37; color:#d4af37; }',
        '.modal-btn-primary:hover { background:rgba(212,175,55,0.35); }',
        '.modal-btn-secondary { background:rgba(255,255,255,0.07); border-color:rgba(255,255,255,0.25); color:#e8d5b0; }',
        '.modal-btn-secondary:hover { background:rgba(255,255,255,0.14); }',
        '.modal-btn-danger { background:rgba(231,76,60,0.15); border-color:rgba(231,76,60,0.5); color:#e74c3c; }',
        '.modal-btn-danger:hover { background:rgba(231,76,60,0.28); }',
        '.modal-btn-success { background:rgba(46,204,113,0.15); border-color:rgba(46,204,113,0.5); color:#2ecc71; }',
        '.modal-btn-success:hover { background:rgba(46,204,113,0.28); }',
        /* Form elements */
        '.modal-form-row { margin-bottom:12px; }',
        '.modal-label { display:block; font-size:0.8rem; color:rgba(232,213,176,0.65); margin-bottom:4px; }',
        '.modal-input,.modal-select,.modal-textarea { width:100%; box-sizing:border-box; background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.18); border-radius:4px; color:#e8d5b0; padding:6px 10px; font-size:0.85rem; font-family:inherit; transition:border-color 0.15s; }',
        '.modal-input:focus,.modal-select:focus,.modal-textarea:focus { outline:none; border-color:#d4af37; }',
        '.modal-input[type="password"] { letter-spacing:2px; }',
        '.modal-textarea { min-height:70px; resize:vertical; }',
        '.modal-select option { background:#1a1410; }',
        '.modal-toggle-row { display:flex; align-items:center; justify-content:space-between; padding:6px 0; }',
        '.modal-toggle-label { font-size:0.85rem; }',
        '.modal-toggle { position:relative; width:40px; height:22px; }',
        '.modal-toggle input { opacity:0; width:0; height:0; }',
        '.modal-toggle-slider { position:absolute; inset:0; background:rgba(255,255,255,0.15); border-radius:11px; cursor:pointer; transition:background 0.2s; }',
        '.modal-toggle-slider:before { content:""; position:absolute; width:16px; height:16px; left:3px; top:3px; background:#e8d5b0; border-radius:50%; transition:transform 0.2s; }',
        '.modal-toggle input:checked + .modal-toggle-slider { background:rgba(212,175,55,0.5); }',
        '.modal-toggle input:checked + .modal-toggle-slider:before { transform:translateX(18px); }',
        '.modal-toggle-disabled { opacity:0.4; pointer-events:none; }',
        '.modal-slider-row { display:flex; align-items:center; gap:10px; }',
        '.modal-slider { flex:1; accent-color:#d4af37; }',
        '.modal-slider-value { font-size:0.82rem; min-width:40px; text-align:right; color:#d4af37; }',
        /* Input with button */
        '.modal-input-group { display:flex; gap:6px; }',
        '.modal-input-group .modal-input { flex:1; }',
        '.modal-input-show-btn { background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.18); border-radius:4px; color:#e8d5b0; cursor:pointer; padding:0 10px; font-size:0.8rem; white-space:nowrap; }',
        /* Section dividers */
        '.modal-section { margin-bottom:18px; }',
        '.modal-section-title { font-size:0.82rem; font-weight:bold; color:#d4af37; text-transform:uppercase; letter-spacing:0.05em; margin-bottom:8px; padding-bottom:4px; border-bottom:1px solid rgba(212,175,55,0.2); }',
        /* Session key */
        '.modal-session-key-box { background:rgba(212,175,55,0.12); border:2px solid rgba(212,175,55,0.5); border-radius:6px; padding:14px 18px; text-align:center; margin-bottom:14px; }',
        '.modal-session-key-label { font-size:0.75rem; color:rgba(232,213,176,0.6); margin-bottom:4px; }',
        '.modal-session-key-value { font-size:1.8rem; font-weight:bold; color:#d4af37; letter-spacing:0.2em; font-family:monospace; }',
        '.modal-session-key-large { font-size:2.4rem; letter-spacing:0.3em; }',
        /* Save slots */
        '.modal-save-slot { display:flex; align-items:center; gap:10px; padding:8px 10px; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.1); border-radius:5px; margin-bottom:6px; }',
        '.modal-save-slot-info { flex:1; min-width:0; }',
        '.modal-save-slot-key { font-size:0.78rem; color:#d4af37; font-family:monospace; }',
        '.modal-save-slot-char { font-size:0.85rem; font-weight:bold; }',
        '.modal-save-slot-meta { font-size:0.72rem; color:rgba(232,213,176,0.5); }',
        /* Help tabs */
        '.modal-tabs { display:flex; border-bottom:1px solid rgba(255,255,255,0.12); margin-bottom:14px; flex-wrap:wrap; }',
        '.modal-tab-btn { padding:7px 14px; background:none; border:none; border-bottom:2px solid transparent; color:rgba(232,213,176,0.55); cursor:pointer; font-size:0.82rem; font-family:inherit; transition:all 0.15s; }',
        '.modal-tab-btn:hover { color:#e8d5b0; }',
        '.modal-tab-active { color:#d4af37 !important; border-bottom-color:#d4af37 !important; }',
        '.modal-tab-content { display:none; }',
        '.modal-tab-content.modal-tab-visible { display:block; }',
        /* Status indicators */
        '.modal-test-status { display:flex; align-items:center; gap:8px; padding:6px 10px; border-radius:4px; font-size:0.82rem; margin-top:8px; }',
        '.modal-test-ok { background:rgba(46,204,113,0.12); border:1px solid rgba(46,204,113,0.4); color:#2ecc71; }',
        '.modal-test-err { background:rgba(231,76,60,0.12); border:1px solid rgba(231,76,60,0.4); color:#e74c3c; }',
        '.modal-test-loading { background:rgba(212,175,55,0.1); border:1px solid rgba(212,175,55,0.35); color:#d4af37; }',
        '.modal-spinner { width:14px; height:14px; border:2px solid rgba(212,175,55,0.3); border-top-color:#d4af37; border-radius:50%; animation:modal-spin 0.8s linear infinite; }',
        '@keyframes modal-spin { to { transform:rotate(360deg); } }',
        /* Help content */
        '.modal-kbd { display:inline-block; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.25); border-radius:3px; padding:1px 6px; font-family:monospace; font-size:0.78rem; color:#e8d5b0; }',
        '.modal-shortcut-row { display:flex; justify-content:space-between; align-items:center; padding:4px 0; border-bottom:1px solid rgba(255,255,255,0.05); font-size:0.82rem; }',
        '.modal-shortcut-row:last-child { border-bottom:none; }',
        '.modal-shortcut-keys { display:flex; gap:4px; }',
        '.modal-faq-item { margin-bottom:14px; }',
        '.modal-faq-q { font-weight:bold; color:#d4af37; font-size:0.85rem; margin-bottom:3px; }',
        '.modal-faq-a { font-size:0.82rem; line-height:1.5; color:rgba(232,213,176,0.8); }',
        '.modal-mechanic-item { background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.08); border-radius:4px; padding:8px 10px; margin-bottom:8px; }',
        '.modal-mechanic-title { font-weight:bold; color:#d4af37; font-size:0.82rem; margin-bottom:3px; }',
        '.modal-mechanic-desc { font-size:0.8rem; line-height:1.5; color:rgba(232,213,176,0.75); }',
        /* New game */
        '.modal-new-game-intro { font-size:0.88rem; line-height:1.6; color:rgba(232,213,176,0.8); margin-bottom:16px; font-style:italic; text-align:center; }',
        '.modal-begin-btn { width:100%; padding:12px; font-size:1rem; font-weight:bold; letter-spacing:0.05em; margin-top:8px; }',
        /* Item/NPC detail */
        '.modal-item-icon { font-size:2rem; text-align:center; margin-bottom:10px; }',
        '.modal-item-name { font-size:1.1rem; font-weight:bold; color:#d4af37; text-align:center; margin-bottom:4px; }',
        '.modal-item-type { font-size:0.78rem; color:rgba(232,213,176,0.5); text-align:center; margin-bottom:12px; }',
        '.modal-npc-name { font-size:1.1rem; font-weight:bold; color:#d4af37; text-align:center; margin-bottom:4px; }',
        '.modal-npc-role { font-size:0.82rem; color:rgba(232,213,176,0.6); text-align:center; margin-bottom:12px; }',
        '.modal-detail-section { margin-bottom:12px; }',
        '.modal-detail-label { font-size:0.75rem; color:rgba(232,213,176,0.5); text-transform:uppercase; letter-spacing:0.05em; margin-bottom:3px; }',
        '.modal-detail-value { font-size:0.85rem; color:#e8d5b0; line-height:1.5; }',
        '.modal-rep-bar { display:flex; gap:4px; align-items:center; }',
        '.modal-rep-fill { height:6px; border-radius:3px; background:#d4af37; }',
        '.modal-rep-bg { flex:1; height:6px; border-radius:3px; background:rgba(255,255,255,0.1); overflow:hidden; }',
        /* Responsive */
        '@media (max-width:520px) { .modal-box { max-width:100% !important; } .modal-header,.modal-body,.modal-footer { padding:10px 12px; } }'
      ].join('\n');
      document.head.appendChild(style);
    }

    // ── Overlay ────────────────────────────────────────────────────────────

    function _createOverlay(modalId, allowClickOutside) {
      var overlay = _el('div', 'modal-overlay');
      overlay.dataset.modalId = modalId;

      if (allowClickOutside !== false) {
        overlay.addEventListener('click', function (e) {
          if (e.target === overlay) Modals.hide(modalId);
        });
      }

      document.addEventListener('keydown', function handler(e) {
        if (e.key === 'Escape' && allowClickOutside !== false) {
          Modals.hide(modalId);
          document.removeEventListener('keydown', handler);
        }
      });

      return overlay;
    }

    function _buildModal(title, bodyEl, footerEl, opts) {
      opts = opts || {};
      var box = _el('div', 'modal-box' + (opts.wide ? ' modal-box-wide' : '') + (opts.narrow ? ' modal-box-narrow' : ''));

      var header = _el('div', 'modal-header');
      var titleEl = _el('div', 'modal-title', _esc(title));
      header.appendChild(titleEl);

      if (opts.modalId && opts.closeBtn !== false) {
        var closeBtn = _el('button', 'modal-close-btn', '✕');
        closeBtn.title = 'Close';
        closeBtn.addEventListener('click', function () { Modals.hide(opts.modalId); });
        header.appendChild(closeBtn);
      }

      box.appendChild(header);
      box.appendChild(bodyEl);
      if (footerEl) box.appendChild(footerEl);
      return box;
    }

    // ── Settings modal ────────────────────────────────────────────────────────

    function _buildSettingsModal() {
      _loadSettings();
      var body = _el('div', 'modal-body');

      // Text Size
      body.appendChild(_buildSection('Display', [
        _buildSelectRow('text-size', 'Text Size', [
          { value: 'small', label: 'Small' }, { value: 'medium', label: 'Medium' },
          { value: 'large', label: 'Large' }, { value: 'xlarge', label: 'Extra Large' }
        ], _settings.textSize),
        _buildSelectRow('para-spacing', 'Paragraph Spacing', [
          { value: 'compact', label: 'Compact' }, { value: 'normal', label: 'Normal' },
          { value: 'relaxed', label: 'Relaxed' }
        ], _settings.paragraphSpacing),
        _buildSelectRow('theme', 'Theme', [
          { value: 'dark-parchment', label: 'Dark Parchment' },
          { value: 'light-parchment', label: 'Light Parchment' },
          { value: 'night', label: 'Night (High Contrast)' }
        ], _settings.theme)
      ]));

      body.appendChild(_buildSection('Gameplay', [
        _buildSelectRow('prose-anim', 'Prose Animation', [
          { value: 'typewriter', label: 'Typewriter Effect' },
          { value: 'instant', label: 'Instant' }
        ], _settings.proseAnimation),
        _buildToggleRow('auto-save', 'Auto-Save', _settings.autoSave)
      ]));

      body.appendChild(_buildSection('Audio & Language', [
        _buildToggleRow('sound-fx', 'Sound Effects (Coming Soon)', _settings.soundEffects, true),
        _buildToggleRow('lang-toggle', 'Language Selection (Coming Soon)', false, true)
      ]));

      var footer = _el('div', 'modal-footer');
      var resetBtn = _el('button', 'modal-btn modal-btn-secondary', 'Reset to Defaults');
      resetBtn.addEventListener('click', function () {
        localStorage.removeItem('heinrich_settings');
        _loadSettings();
        Modals.hide('settings');
        Modals.show('settings');
      });
      var saveBtn = _el('button', 'modal-btn modal-btn-primary', 'Save Settings');
      saveBtn.addEventListener('click', function () {
        _settings.textSize       = body.querySelector('#modal-field-text-size').value;
        _settings.paragraphSpacing = body.querySelector('#modal-field-para-spacing').value;
        _settings.theme          = body.querySelector('#modal-field-theme').value;
        _settings.proseAnimation = body.querySelector('#modal-field-prose-anim').value;
        _settings.autoSave       = body.querySelector('#modal-field-auto-save').checked;
        _saveSettings();
        Modals.hide('settings');
      });
      footer.appendChild(resetBtn);
      footer.appendChild(saveBtn);

      return { body: body, footer: footer };
    }

    function _buildSection(title, rows) {
      var sec = _el('div', 'modal-section');
      var t = _el('div', 'modal-section-title', _esc(title));
      sec.appendChild(t);
      rows.forEach(function (r) { if (r) sec.appendChild(r); });
      return sec;
    }

    function _buildSelectRow(id, label, options, currentVal) {
      var row = _el('div', 'modal-form-row');
      var lbl = _el('label', 'modal-label', _esc(label));
      lbl.setAttribute('for', 'modal-field-' + id);
      var sel = _el('select', 'modal-select');
      sel.id = 'modal-field-' + id;
      options.forEach(function (opt) {
        var o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === currentVal) o.selected = true;
        sel.appendChild(o);
      });
      row.appendChild(lbl);
      row.appendChild(sel);
      return row;
    }

    function _buildToggleRow(id, label, checked, disabled) {
      var row = _el('div', 'modal-toggle-row');
      var lbl = _el('span', 'modal-toggle-label', _esc(label));
      var toggle = _el('label', 'modal-toggle' + (disabled ? ' modal-toggle-disabled' : ''));
      var input = document.createElement('input');
      input.type = 'checkbox';
      input.id = 'modal-field-' + id;
      input.checked = !!checked;
      if (disabled) input.disabled = true;
      var slider = _el('span', 'modal-toggle-slider');
      toggle.appendChild(input);
      toggle.appendChild(slider);
      row.appendChild(lbl);
      row.appendChild(toggle);
      return row;
    }

    // ── API Config modal ──────────────────────────────────────────────────────

    function _buildApiConfigModal() {
      _loadApiConfig();
      var body = _el('div', 'modal-body');

      // Provider
      var providerRow = _buildSelectRow('provider', 'Provider', PROVIDERS.map(function (p) {
        return { value: p.value, label: p.label };
      }), _apiConfig.provider);
      body.appendChild(providerRow);

      // API Key
      var keyRow = _el('div', 'modal-form-row');
      var keyLbl = _el('label', 'modal-label', 'API Key');
      keyLbl.setAttribute('for', 'modal-field-api-key');
      var keyGroup = _el('div', 'modal-input-group');
      var keyInput = _el('input');
      keyInput.type = 'password';
      keyInput.id = 'modal-field-api-key';
      keyInput.className = 'modal-input';
      keyInput.value = _apiConfig.apiKey || '';
      keyInput.placeholder = 'sk-…';
      keyInput.autocomplete = 'off';
      var showBtn = _el('button', 'modal-input-show-btn', '👁');
      showBtn.type = 'button';
      showBtn.title = 'Show/hide API key';
      showBtn.addEventListener('click', function () {
        keyInput.type = keyInput.type === 'password' ? 'text' : 'password';
      });
      keyGroup.appendChild(keyInput);
      keyGroup.appendChild(showBtn);
      keyRow.appendChild(keyLbl);
      keyRow.appendChild(keyGroup);
      body.appendChild(keyRow);

      // Model
      var currentProvider = PROVIDERS.find(function (p) { return p.value === _apiConfig.provider; }) || PROVIDERS[0];
      var modelRow = _buildSelectRow('model', 'Model', currentProvider.models.map(function (m) {
        return { value: m, label: m };
      }), _apiConfig.model);
      body.appendChild(modelRow);

      // Server URL (for ollama/custom)
      var urlRow = _el('div', 'modal-form-row');
      urlRow.id = 'modal-url-row';
      var urlLbl = _el('label', 'modal-label', 'Server URL');
      urlLbl.setAttribute('for', 'modal-field-server-url');
      var urlInput = _el('input');
      urlInput.type = 'text';
      urlInput.id = 'modal-field-server-url';
      urlInput.className = 'modal-input';
      urlInput.value = _apiConfig.serverUrl || 'http://localhost:3000';
      urlRow.appendChild(urlLbl);
      urlRow.appendChild(urlInput);
      body.appendChild(urlRow);

      var localProviders = ['ollama', 'custom'];
      urlRow.style.display = localProviders.indexOf(_apiConfig.provider) !== -1 ? '' : 'none';

      // Update models when provider changes
      var providerSel = body.querySelector('#modal-field-provider');
      var modelSel    = body.querySelector('#modal-field-model');
      providerSel.addEventListener('change', function () {
        var pval = providerSel.value;
        var prov = PROVIDERS.find(function (p) { return p.value === pval; }) || PROVIDERS[0];
        modelSel.innerHTML = '';
        prov.models.forEach(function (m) {
          var o = document.createElement('option');
          o.value = m; o.textContent = m;
          modelSel.appendChild(o);
        });
        urlRow.style.display = localProviders.indexOf(pval) !== -1 ? '' : 'none';
      });

      // Max tokens
      var tokensRow = _el('div', 'modal-form-row');
      tokensRow.innerHTML = '<label class="modal-label" for="modal-field-max-tokens">Max Tokens</label>';
      var tokensSliderRow = _el('div', 'modal-slider-row');
      var tokensSlider = document.createElement('input');
      tokensSlider.type = 'range'; tokensSlider.min = '500'; tokensSlider.max = '4000'; tokensSlider.step = '100';
      tokensSlider.value = _apiConfig.maxTokens || 1500;
      tokensSlider.id = 'modal-field-max-tokens';
      tokensSlider.className = 'modal-slider';
      var tokensVal = _el('span', 'modal-slider-value', tokensSlider.value);
      tokensSlider.addEventListener('input', function () { tokensVal.textContent = tokensSlider.value; });
      tokensSliderRow.appendChild(tokensSlider);
      tokensSliderRow.appendChild(tokensVal);
      tokensRow.appendChild(tokensSliderRow);
      body.appendChild(tokensRow);

      // Temperature
      var tempRow = _el('div', 'modal-form-row');
      tempRow.innerHTML = '<label class="modal-label" for="modal-field-temperature">Temperature</label>';
      var tempSliderRow = _el('div', 'modal-slider-row');
      var tempSlider = document.createElement('input');
      tempSlider.type = 'range'; tempSlider.min = '0.1'; tempSlider.max = '1.5'; tempSlider.step = '0.05';
      tempSlider.value = _apiConfig.temperature || 0.85;
      tempSlider.id = 'modal-field-temperature';
      tempSlider.className = 'modal-slider';
      var tempVal = _el('span', 'modal-slider-value', parseFloat(tempSlider.value).toFixed(2));
      tempSlider.addEventListener('input', function () { tempVal.textContent = parseFloat(tempSlider.value).toFixed(2); });
      tempSliderRow.appendChild(tempSlider);
      tempSliderRow.appendChild(tempVal);
      tempRow.appendChild(tempSliderRow);
      body.appendChild(tempRow);

      // Test connection button
      var testBtn = _el('button', 'modal-btn modal-btn-secondary', '🔌 Test Connection');
      testBtn.style.marginTop = '4px';
      testBtn.addEventListener('click', function () {
        var statusEl = body.querySelector('.modal-test-status') || _el('div', 'modal-test-status modal-test-loading');
        if (!body.querySelector('.modal-test-status')) body.appendChild(statusEl);
        statusEl.className = 'modal-test-status modal-test-loading';
        statusEl.innerHTML = '<div class="modal-spinner"></div> Testing connection…';

        var config = {
          provider: providerSel.value,
          apiKey:   keyInput.value,
          model:    modelSel.value,
          serverUrl: urlInput.value
        };
        document.dispatchEvent(new CustomEvent('api:testConnection', {
          detail: { config: config, callback: function (ok, msg) {
            if (ok) {
              statusEl.className = 'modal-test-status modal-test-ok';
              statusEl.innerHTML = '✅ Connected' + (msg ? ': ' + _esc(msg) : '');
            } else {
              statusEl.className = 'modal-test-status modal-test-err';
              statusEl.innerHTML = '❌ Failed' + (msg ? ': ' + _esc(msg) : '');
            }
          }}
        }));
        // Fallback: auto-resolve after 5s if no response
        setTimeout(function () {
          if (statusEl.classList.contains('modal-test-loading')) {
            statusEl.className = 'modal-test-status modal-test-err';
            statusEl.innerHTML = '❌ No response from server';
          }
        }, 5000);
      });
      body.appendChild(testBtn);

      var footer = _el('div', 'modal-footer');
      var cancelBtn = _el('button', 'modal-btn modal-btn-secondary', 'Cancel');
      cancelBtn.addEventListener('click', function () { Modals.hide('api-config'); });
      var saveBtn = _el('button', 'modal-btn modal-btn-primary', 'Save');
      saveBtn.addEventListener('click', function () {
        _apiConfig.provider    = providerSel.value;
        _apiConfig.apiKey      = keyInput.value;
        _apiConfig.model       = modelSel.value;
        _apiConfig.serverUrl   = urlInput.value;
        _apiConfig.maxTokens   = parseInt(tokensSlider.value, 10);
        _apiConfig.temperature = parseFloat(tempSlider.value);
        _saveApiConfig();
        Modals.hide('api-config');
      });
      footer.appendChild(cancelBtn);
      footer.appendChild(saveBtn);

      return { body: body, footer: footer };
    }

    // ── Save/Load modal ───────────────────────────────────────────────────────

    function _buildSaveLoadModal(data) {
      data = data || {};
      var body = _el('div', 'modal-body');

      // Current session key
      var skBox = _el('div', 'modal-session-key-box');
      skBox.innerHTML =
        '<div class="modal-session-key-label">Your Session Key</div>' +
        '<div class="modal-session-key-value">' + _esc(data.sessionKey || '--------') + '</div>';
      body.appendChild(skBox);

      var copyBtn = _el('button', 'modal-btn modal-btn-secondary', '📋 Copy Session Key');
      copyBtn.style.width = '100%';
      copyBtn.style.marginBottom = '8px';
      copyBtn.addEventListener('click', function () {
        var key = data.sessionKey || '';
        if (navigator.clipboard) {
          navigator.clipboard.writeText(key).then(function () {
            copyBtn.textContent = '✅ Copied!';
            setTimeout(function () { copyBtn.textContent = '📋 Copy Session Key'; }, 2000);
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = key;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = '✅ Copied!';
          setTimeout(function () { copyBtn.textContent = '📋 Copy Session Key'; }, 2000);
        }
      });
      body.appendChild(copyBtn);

      var exportBtn = _el('button', 'modal-btn modal-btn-secondary', '💾 Export Save File');
      exportBtn.style.width = '100%';
      exportBtn.style.marginBottom = '8px';
      exportBtn.addEventListener('click', function () {
        document.dispatchEvent(new CustomEvent('save:export'));
      });
      body.appendChild(exportBtn);

      var importBtn = _el('button', 'modal-btn modal-btn-secondary', '📂 Import Save File');
      importBtn.style.width = '100%';
      importBtn.style.marginBottom = '14px';
      importBtn.addEventListener('click', function () {
        var fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.json';
        fileInput.addEventListener('change', function () {
          if (!fileInput.files || !fileInput.files[0]) return;
          var reader = new FileReader();
          reader.onload = function (e) {
            try {
              var saveData = JSON.parse(e.target.result);
              document.dispatchEvent(new CustomEvent('save:import', { detail: { saveData: saveData } }));
              Modals.hide('save-load');
            } catch (err) {
              Modals.show('confirm', { title: 'Import Failed', message: 'The save file could not be read. It may be corrupted.' });
            }
          };
          reader.readAsText(fileInput.files[0]);
        });
        fileInput.click();
      });
      body.appendChild(importBtn);

      // Previous sessions
      var sessTitle = _el('div', 'modal-section-title', 'Previous Sessions');
      body.appendChild(sessTitle);

      var sessions = data.sessions || [];
      if (sessions.length === 0) {
        body.appendChild(_el('p', null, '<em style="color:rgba(232,213,176,0.4);font-size:0.82rem;">No other sessions found.</em>'));
      } else {
        sessions.forEach(function (sess) {
          var slot = _el('div', 'modal-save-slot');
          slot.innerHTML =
            '<div class="modal-save-slot-info">' +
              '<div class="modal-save-slot-key">' + _esc(sess.sessionKey || '?') + '</div>' +
              '<div class="modal-save-slot-char">' + _esc(sess.characterName || 'Unknown') + '</div>' +
              '<div class="modal-save-slot-meta">Turn ' + _esc(sess.turn || '?') + ' • Saved: ' + _esc(sess.lastSaved || '?') + '</div>' +
            '</div>';
          var loadBtn = _el('button', 'modal-btn modal-btn-primary', 'Load');
          loadBtn.addEventListener('click', function () {
            Modals.confirm('Load session ' + (sess.sessionKey || '') + '? Your current session is still saved.', 'Load Session').then(function (confirmed) {
              if (confirmed) {
                document.dispatchEvent(new CustomEvent('save:loadSession', { detail: { sessionKey: sess.sessionKey } }));
                Modals.hide('save-load');
              }
            });
          });
          slot.appendChild(loadBtn);
          body.appendChild(slot);
        });
      }

      var footer = _el('div', 'modal-footer');
      var newGameBtn = _el('button', 'modal-btn modal-btn-danger', '🆕 New Game');
      newGameBtn.addEventListener('click', function () {
        Modals.confirm('Start a new game? Your current session is still saved and accessible via your session key.', 'New Game?').then(function (confirmed) {
          if (confirmed) {
            Modals.hide('save-load');
            Modals.show('new-game');
          }
        });
      });
      var closeBtn = _el('button', 'modal-btn modal-btn-secondary', 'Close');
      closeBtn.addEventListener('click', function () { Modals.hide('save-load'); });
      footer.appendChild(newGameBtn);
      footer.appendChild(closeBtn);

      return { body: body, footer: footer };
    }

    // ── Help modal ────────────────────────────────────────────────────────────

    function _buildHelpModal() {
      var body = _el('div', 'modal-body');
      var tabs = _el('div', 'modal-tabs');

      var tabDefs = [
        { id: 'controls',   label: 'Controls'         },
        { id: 'interface',  label: 'Interface Guide'   },
        { id: 'mechanics',  label: 'Game Mechanics'    },
        { id: 'faq',        label: 'FAQ'               }
      ];

      var tabContents = {};

      tabDefs.forEach(function (t, i) {
        var btn = _el('button', 'modal-tab-btn' + (i === 0 ? ' modal-tab-active' : ''), _esc(t.label));
        btn.dataset.tabId = t.id;
        tabs.appendChild(btn);
        var content = _el('div', 'modal-tab-content' + (i === 0 ? ' modal-tab-visible' : ''));
        content.id = 'modal-tab-' + t.id;
        tabContents[t.id] = content;
      });

      tabs.addEventListener('click', function (e) {
        var btn = e.target.closest('.modal-tab-btn');
        if (!btn) return;
        tabs.querySelectorAll('.modal-tab-btn').forEach(function (b) { b.classList.remove('modal-tab-active'); });
        btn.classList.add('modal-tab-active');
        var tid = btn.dataset.tabId;
        body.querySelectorAll('.modal-tab-content').forEach(function (c) { c.classList.remove('modal-tab-visible'); });
        var tc = body.querySelector('#modal-tab-' + tid);
        if (tc) tc.classList.add('modal-tab-visible');
      });

      body.appendChild(tabs);

      // Controls tab
      var shortcuts = [
        { keys: ['Enter'],             desc: 'Submit action'                },
        { keys: ['↑', '↓'],           desc: 'Browse action history'        },
        { keys: ['Ctrl', 'Z'],         desc: 'Undo last action (if available)' },
        { keys: ['Ctrl', 'S'],         desc: 'Save game'                    },
        { keys: ['Ctrl', 'Shift', 'H'],desc: 'Show this help dialog'        },
        { keys: ['Escape'],            desc: 'Close modal / cancel'         },
        { keys: ['Tab'],               desc: 'Focus input bar'              },
        { keys: ['F5'],                desc: 'Refresh prose (re-display)'   }
      ];
      var ctrlTab = tabContents['controls'];
      shortcuts.forEach(function (s) {
        var row = _el('div', 'modal-shortcut-row');
        var keysDiv = _el('div', 'modal-shortcut-keys');
        s.keys.forEach(function (k) { keysDiv.appendChild(_el('kbd', 'modal-kbd', _esc(k))); });
        var descSpan = _el('span', null, _esc(s.desc));
        row.appendChild(descSpan);
        row.appendChild(keysDiv);
        ctrlTab.appendChild(row);
      });
      body.appendChild(ctrlTab);

      // Interface Guide tab
      var ifaceTab = tabContents['interface'];
      var panels = [
        { icon: '📜', name: 'Prose Window (Center)', desc: 'Your story unfolds here. The AI narrator describes the world and the results of your actions. Scroll up to read history.' },
        { icon: '❤️', name: 'Stats Panel (Left)',    desc: 'Heinrich\'s vital statistics: Health, Hunger, Fatigue, Morale. Also shows location, weather, and current date.' },
        { icon: '📚', name: 'Info Panel (Right)',    desc: 'Tabs for NPCs, Inventory, Skills, Memory Palace, Consequences, Map, and Journal.' },
        { icon: '⌨️', name: 'Input Bar (Bottom)',   desc: 'Type what you want to do. Be specific — the AI understands natural language. Suggested actions appear as buttons.' },
        { icon: '🔑', name: 'Session Key (Top)',     desc: 'Your unique save code. Copy and save it — paste it in to resume your game later.' }
      ];
      panels.forEach(function (p) {
        var item = _el('div', 'modal-mechanic-item');
        item.innerHTML = '<div class="modal-mechanic-title">' + _esc(p.icon) + ' ' + _esc(p.name) + '</div><div class="modal-mechanic-desc">' + _esc(p.desc) + '</div>';
        ifaceTab.appendChild(item);
      });
      body.appendChild(ifaceTab);

      // Mechanics tab
      var mechTab = tabContents['mechanics'];
      var mechanics = [
        { title: '🎲 Skill Checks',       desc: 'When you attempt something difficult, the game rolls dice behind the scenes, modified by Heinrich\'s relevant skills and stats. The outcome is narrated naturally.' },
        { title: '⚡ Consequences',        desc: 'Your actions create ripple effects. Some resolve quickly; others haunt you for years or become permanent. The Consequences tab shows all active threads.' },
        { title: '👁️ Reputation',         desc: 'Different factions and individuals track how they see Heinrich. Your reputation affects what options are available to you.' },
        { title: '🧠 Memory Palace',       desc: 'Heinrich remembers things he learns. Facts, secrets, clues, and detected lies are tracked here. Search and connect entries to solve mysteries.' },
        { title: '🤝 Relationships',       desc: 'NPCs have relationships with Heinrich that change based on your choices. Allies can help; enemies can ruin you.' },
        { title: '📅 Time & Calendar',     desc: 'The world moves in real time. Days pass, seasons change, and scheduled events occur whether or not Heinrich is involved.' }
      ];
      mechanics.forEach(function (m) {
        var item = _el('div', 'modal-mechanic-item');
        item.innerHTML = '<div class="modal-mechanic-title">' + _esc(m.title) + '</div><div class="modal-mechanic-desc">' + _esc(m.desc) + '</div>';
        mechTab.appendChild(item);
      });
      body.appendChild(mechTab);

      // FAQ tab
      var faqTab = tabContents['faq'];
      var faqs = [
        { q: 'How do I save my game?',            a: 'Your game auto-saves after each action. Copy your Session Key (shown at the top) to return later. You can also export a save file.' },
        { q: 'Can I undo an action?',             a: 'The game simulates a living world — most actions cannot be undone. Think carefully before acting. Some consequences can be mitigated over time.' },
        { q: 'What if the AI does something wrong?', a: 'If the narrative seems off, you can type a correction like "That\'s not right — let\'s say instead that..." The AI will adapt.' },
        { q: 'How do I change the AI model?',     a: 'Go to Settings → API Configuration to change your provider, model, and key.' },
        { q: 'Will my session be lost?',          a: 'Not if you save your Session Key. Every turn is saved to the server. If you lose the key, contact support with any details you remember.' },
        { q: 'Can Heinrich die?',                 a: 'Yes. If Heinrich\'s health reaches zero, the story ends. Some choices lead to permanent, irrecoverable consequences. Play carefully.' }
      ];
      faqs.forEach(function (f) {
        var item = _el('div', 'modal-faq-item');
        item.innerHTML = '<div class="modal-faq-q">' + _esc(f.q) + '</div><div class="modal-faq-a">' + _esc(f.a) + '</div>';
        faqTab.appendChild(item);
      });
      body.appendChild(faqTab);

      var footer = _el('div', 'modal-footer');
      var closeBtn = _el('button', 'modal-btn modal-btn-primary', 'Close');
      closeBtn.addEventListener('click', function () { Modals.hide('help'); });
      footer.appendChild(closeBtn);

      return { body: body, footer: footer };
    }

    // ── Confirm modal ─────────────────────────────────────────────────────────

    function _buildConfirmModal(data) {
      data = data || {};
      var body = _el('div', 'modal-body');
      body.innerHTML = '<p style="font-size:0.9rem;line-height:1.6;color:#e8d5b0;">' + _esc(data.message || 'Are you sure?') + '</p>';

      var footer = _el('div', 'modal-footer');
      var cancelBtn = _el('button', 'modal-btn modal-btn-secondary', 'Cancel');
      cancelBtn.addEventListener('click', function () {
        if (_confirmResolve) { _confirmResolve(false); _confirmResolve = null; }
        Modals.hide('confirm');
      });
      var confirmBtn = _el('button', 'modal-btn modal-btn-primary', 'Confirm');
      confirmBtn.addEventListener('click', function () {
        if (_confirmResolve) { _confirmResolve(true); _confirmResolve = null; }
        Modals.hide('confirm');
      });
      footer.appendChild(cancelBtn);
      footer.appendChild(confirmBtn);

      return { body: body, footer: footer };
    }

    // ── Item Detail modal ─────────────────────────────────────────────────────

    function _buildItemDetailModal(data) {
      data = data || {};
      var item = data.item || {};
      var body = _el('div', 'modal-body');

      body.innerHTML =
        '<div class="modal-item-icon">' + _esc(item.icon || '📦') + '</div>' +
        '<div class="modal-item-name">' + _esc(item.name || 'Unknown Item') + '</div>' +
        '<div class="modal-item-type">' + _esc(item.type || '') + (item.rarity ? ' • ' + _esc(item.rarity) : '') + '</div>';

      if (item.description) {
        var descSec = _el('div', 'modal-detail-section');
        descSec.innerHTML = '<div class="modal-detail-label">Description</div><div class="modal-detail-value">' + _esc(item.description) + '</div>';
        body.appendChild(descSec);
      }

      if (item.properties) {
        var propSec = _el('div', 'modal-detail-section');
        propSec.innerHTML = '<div class="modal-detail-label">Properties</div>';
        var props = item.properties;
        var propList = _el('div', 'modal-detail-value');
        if (typeof props === 'object' && !Array.isArray(props)) {
          Object.keys(props).forEach(function (k) {
            var row = _el('div');
            row.innerHTML = '<span style="color:rgba(232,213,176,0.5)">' + _esc(k) + ':</span> ' + _esc(props[k]);
            propList.appendChild(row);
          });
        } else {
          propList.textContent = String(props);
        }
        propSec.appendChild(propList);
        body.appendChild(propSec);
      }

      if (item.condition !== undefined) {
        var condSec = _el('div', 'modal-detail-section');
        var condPct = Math.max(0, Math.min(100, parseInt(item.condition, 10) || 100));
        condSec.innerHTML = '<div class="modal-detail-label">Condition</div><div class="modal-rep-bar"><div class="modal-rep-bg"><div class="modal-rep-fill" style="width:' + condPct + '%"></div></div><span style="font-size:0.8rem;margin-left:6px;">' + condPct + '%</span></div>';
        body.appendChild(condSec);
      }

      if (item.value) {
        var valSec = _el('div', 'modal-detail-section');
        valSec.innerHTML = '<div class="modal-detail-label">Value</div><div class="modal-detail-value">' + _esc(item.value) + '</div>';
        body.appendChild(valSec);
      }

      var footer = _el('div', 'modal-footer');
      var closeBtn = _el('button', 'modal-btn modal-btn-primary', 'Close');
      closeBtn.addEventListener('click', function () { Modals.hide('item-detail'); });
      footer.appendChild(closeBtn);

      return { body: body, footer: footer };
    }

    // ── NPC Detail modal ──────────────────────────────────────────────────────

    function _buildNpcDetailModal(data) {
      data = data || {};
      var npc = data.npc || {};
      var body = _el('div', 'modal-body');

      body.innerHTML =
        '<div class="modal-item-icon">' + _esc(npc.icon || '🧑') + '</div>' +
        '<div class="modal-npc-name">' + _esc(npc.name || 'Unknown') + '</div>' +
        '<div class="modal-npc-role">' + _esc(npc.role || npc.occupation || '') +
          (npc.location ? ' — ' + _esc(npc.location) : '') + '</div>';

      var fields = [
        { label: 'Relationship',   key: 'relationship'  },
        { label: 'Disposition',    key: 'disposition'   },
        { label: 'Last Seen',      key: 'last_seen'     },
        { label: 'Notes',          key: 'notes'         },
        { label: 'Known Secrets',  key: 'known_secrets' },
        { label: 'Faction',        key: 'faction'       }
      ];

      fields.forEach(function (f) {
        if (npc[f.key] == null) return;
        var sec = _el('div', 'modal-detail-section');
        sec.innerHTML = '<div class="modal-detail-label">' + _esc(f.label) + '</div>';
        var val = npc[f.key];
        var valEl;
        if (Array.isArray(val)) {
          valEl = _el('div', 'modal-detail-value', val.map(_esc).join(', '));
        } else {
          valEl = _el('div', 'modal-detail-value', _esc(String(val)));
        }
        sec.appendChild(valEl);
        body.appendChild(sec);
      });

      // Relationship bar
      if (npc.relationship_score !== undefined) {
        var repSec = _el('div', 'modal-detail-section');
        var repPct = Math.max(0, Math.min(100, (parseInt(npc.relationship_score, 10) + 100) / 2));
        repSec.innerHTML = '<div class="modal-detail-label">Relationship Score (' + npc.relationship_score + ')</div><div class="modal-rep-bar"><div class="modal-rep-bg"><div class="modal-rep-fill" style="width:' + repPct + '%"></div></div></div>';
        body.appendChild(repSec);
      }

      var footer = _el('div', 'modal-footer');
      var closeBtn = _el('button', 'modal-btn modal-btn-primary', 'Close');
      closeBtn.addEventListener('click', function () { Modals.hide('npc-detail'); });
      footer.appendChild(closeBtn);

      return { body: body, footer: footer };
    }

    // ── New Game modal ────────────────────────────────────────────────────────

    function _buildNewGameModal() {
      var body = _el('div', 'modal-body');
      body.innerHTML = '<p class="modal-new-game-intro">"Every peasant has a fate. What will yours be?"</p>';

      var familyRow = _el('div', 'modal-form-row');
      var familyLbl = _el('label', 'modal-label', "What is Heinrich's family name?");
      familyLbl.setAttribute('for', 'modal-field-family-name');
      var familyInput = _el('input');
      familyInput.type = 'text';
      familyInput.id = 'modal-field-family-name';
      familyInput.className = 'modal-input';
      familyInput.value = 'Renard';
      familyInput.maxLength = 40;
      familyRow.appendChild(familyLbl);
      familyRow.appendChild(familyInput);
      body.appendChild(familyRow);

      var desireRow = _el('div', 'modal-form-row');
      var desireLbl = _el('label', 'modal-label', 'What does Heinrich want more than anything?');
      desireLbl.setAttribute('for', 'modal-field-desire');
      var desireInput = _el('textarea');
      desireInput.id = 'modal-field-desire';
      desireInput.className = 'modal-textarea';
      desireInput.placeholder = 'e.g., To escape his station and become a knight, to avenge his father's murder, to find true love…';
      desireRow.appendChild(desireLbl);
      desireRow.appendChild(desireInput);
      body.appendChild(desireRow);

      var fearRow = _el('div', 'modal-form-row');
      var fearLbl = _el('label', 'modal-label', 'What does Heinrich fear above all?');
      fearLbl.setAttribute('for', 'modal-field-fear');
      var fearInput = _el('textarea');
      fearInput.id = 'modal-field-fear';
      fearInput.className = 'modal-textarea';
      fearInput.placeholder = 'e.g., Being forgotten, dying like his father, betraying those he loves, being accused of heresy…';
      fearRow.appendChild(fearLbl);
      fearRow.appendChild(fearInput);
      body.appendChild(fearRow);

      var beginBtn = _el('button', 'modal-btn modal-btn-primary modal-begin-btn', '⚔️ Begin Your Fate');
      beginBtn.addEventListener('click', function () {
        var familyName = familyInput.value.trim() || 'Renard';
        var desire = desireInput.value.trim();
        var fear   = fearInput.value.trim();

        if (!desire) { desireInput.focus(); desireInput.style.borderColor = '#e74c3c'; return; }
        if (!fear)   { fearInput.focus();   fearInput.style.borderColor   = '#e74c3c'; return; }

        var evt = new CustomEvent('game:newGame', {
          detail: { familyName: familyName, desire: desire, fear: fear,
            callback: function (sessionKey) {
              Modals.hide('new-game');
              Modals.show('session-key-display', { sessionKey: sessionKey });
            }
          }
        });
        document.dispatchEvent(evt);
      });
      body.appendChild(beginBtn);

      var footer = _el('div', 'modal-footer');
      var cancelBtn = _el('button', 'modal-btn modal-btn-secondary', 'Cancel');
      cancelBtn.addEventListener('click', function () { Modals.hide('new-game'); });
      footer.appendChild(cancelBtn);

      return { body: body, footer: footer };
    }

    // ── Session Key Display modal ─────────────────────────────────────────────

    function _buildSessionKeyDisplayModal(data) {
      data = data || {};
      var key = data.sessionKey || '????????';
      var body = _el('div', 'modal-body');

      body.innerHTML =
        '<p style="font-size:0.9rem;line-height:1.6;text-align:center;color:rgba(232,213,176,0.8);margin-bottom:16px;">' +
        'Your game has been created. <strong>Write this down or save it somewhere safe.</strong> ' +
        'You\'ll need it to resume your game.</p>';

      var keyBox = _el('div', 'modal-session-key-box');
      keyBox.innerHTML =
        '<div class="modal-session-key-label">Session Key</div>' +
        '<div class="modal-session-key-value modal-session-key-large">' + _esc(key) + '</div>';
      body.appendChild(keyBox);

      var copyBtn = _el('button', 'modal-btn modal-btn-secondary', '📋 Copy to Clipboard');
      copyBtn.style.width = '100%';
      copyBtn.style.marginBottom = '8px';
      copyBtn.addEventListener('click', function () {
        if (navigator.clipboard) {
          navigator.clipboard.writeText(key).then(function () {
            copyBtn.textContent = '✅ Copied!';
          });
        } else {
          var ta = document.createElement('textarea');
          ta.value = key;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand('copy');
          document.body.removeChild(ta);
          copyBtn.textContent = '✅ Copied!';
        }
      });
      body.appendChild(copyBtn);

      var footer = _el('div', 'modal-footer');
      var beginBtn = _el('button', 'modal-btn modal-btn-primary', "✔ I've Saved It — Begin!");
      beginBtn.style.flex = '1';
      beginBtn.addEventListener('click', function () {
        Modals.hide('session-key-display');
        document.dispatchEvent(new CustomEvent('game:sessionKeySaved', { detail: { sessionKey: key } }));
      });
      footer.appendChild(beginBtn);

      return { body: body, footer: footer };
    }

    // ── Show/hide ─────────────────────────────────────────────────────────────

    function _showModal(modalId, title, built, opts) {
      Modals.hide(modalId);
      opts = opts || {};

      var allowClickOutside = (modalId !== 'session-key-display');
      var overlay = _createOverlay(modalId, allowClickOutside);

      var box = _buildModal(title, built.body, built.footer, {
        modalId: modalId,
        wide: opts.wide,
        narrow: opts.narrow,
        closeBtn: allowClickOutside
      });

      overlay.appendChild(box);
      document.body.appendChild(overlay);
      _openModals[modalId] = overlay;
    }

    // ── Public API ────────────────────────────────────────────────────────────

    var Modals = {

      init: function () {
        _injectStyles();
        _loadSettings();
        _loadApiConfig();

        // Global keyboard handler
        document.addEventListener('keydown', function (e) {
          if (e.key === 'Escape') {
            var keys = Object.keys(_openModals);
            if (keys.length > 0) {
              var last = keys[keys.length - 1];
              if (last !== 'session-key-display') Modals.hide(last);
            }
          }
        });
      },

      show: function (modalId, data) {
        data = data || {};
        var built, title;

        switch (modalId) {
          case 'settings':
            title = '⚙️ Settings';
            built = _buildSettingsModal();
            _showModal(modalId, title, built);
            break;
          case 'api-config':
            title = '🔌 API Configuration';
            built = _buildApiConfigModal();
            _showModal(modalId, title, built);
            break;
          case 'save-load':
            title = '💾 Save / Load';
            built = _buildSaveLoadModal(data);
            _showModal(modalId, title, built, { wide: true });
            break;
          case 'help':
            title = '❓ Help & Tutorial';
            built = _buildHelpModal();
            _showModal(modalId, title, built, { wide: true });
            break;
          case 'confirm':
            title = data.title || 'Confirm';
            built = _buildConfirmModal(data);
            _showModal(modalId, title, built, { narrow: true });
            break;
          case 'item-detail':
            title = (data.item && data.item.name) ? data.item.name : 'Item Detail';
            built = _buildItemDetailModal(data);
            _showModal(modalId, title, built, { narrow: true });
            break;
          case 'npc-detail':
            title = (data.npc && data.npc.name) ? data.npc.name : 'NPC Detail';
            built = _buildNpcDetailModal(data);
            _showModal(modalId, title, built, { narrow: true });
            break;
          case 'new-game':
            title = '⚔️ The Fate of Heinrich';
            built = _buildNewGameModal();
            _showModal(modalId, title, built);
            break;
          case 'session-key-display':
            title = '🔑 Your Session Key';
            built = _buildSessionKeyDisplayModal(data);
            _showModal(modalId, title, built, { narrow: true });
            break;
          default:
            console.warn('Modals.show: unknown modal id:', modalId);
            return;
        }
      },

      hide: function (modalId) {
        var overlay = _openModals[modalId];
        if (!overlay) return;

        overlay.classList.add('modal-fade-out');
        setTimeout(function () {
          if (overlay.parentNode) overlay.parentNode.removeChild(overlay);
        }, 160);
        delete _openModals[modalId];

        if (_closeCallbacks[modalId]) {
          _closeCallbacks[modalId].forEach(function (cb) { try { cb(); } catch (e) {} });
          delete _closeCallbacks[modalId];
        }

        // If confirm was dismissed without resolving
        if (modalId === 'confirm' && _confirmResolve) {
          _confirmResolve(false);
          _confirmResolve = null;
        }
      },

      hideAll: function () {
        Object.keys(_openModals).forEach(function (id) { Modals.hide(id); });
      },

      isOpen: function (modalId) {
        return !!_openModals[modalId];
      },

      onClose: function (modalId, callback) {
        if (!_closeCallbacks[modalId]) _closeCallbacks[modalId] = [];
        _closeCallbacks[modalId].push(callback);
      },

      confirm: function (message, title) {
        return new Promise(function (resolve) {
          _confirmResolve = resolve;
          Modals.show('confirm', { message: message, title: title || 'Confirm' });
        });
      }
    };

    return Modals;
  }());

  global.Modals = Modals;

}(window));

// END FILE: client/js/ui/modals.js
