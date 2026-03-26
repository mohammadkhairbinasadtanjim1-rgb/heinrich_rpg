// FILE: client/js/save/save-client.js — PART 9

/**
 * SaveClient — handles all game persistence between the browser and Express server.
 * Exposed as a browser global via IIFE; no ES module import/export.
 *
 * Responsibilities:
 *  - newGame / saveGame / loadGame / autoSave
 *  - exportGame (file download) / importGame (file upload)
 *  - listSessions / deleteSession
 *  - getServerStatus
 *  - localStorage fallback cache
 *  - Custom DOM events: heinrich:saved, heinrich:loaded, heinrich:savefailed
 *  - Debounced autoSave (max once per 10 seconds)
 */
const SaveClient = (() => {

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const LS_PREFIX           = 'heinrich_';
  const LS_SERVER_URL_KEY   = `${LS_PREFIX}serverUrl`;
  const LS_SESSION_KEY_KEY  = `${LS_PREFIX}currentSessionKey`;
  const REQUEST_TIMEOUT_MS  = 30_000;
  const AUTOSAVE_DEBOUNCE_MS = 10_000;

  let _serverUrl        = localStorage.getItem(LS_SERVER_URL_KEY) || 'http://localhost:3000';
  let _currentSessionKey = localStorage.getItem(LS_SESSION_KEY_KEY) || null;
  let _autoSaveTimer    = null;
  let _autoSavePending  = null;

  // ═══════════════════════════════════════════════════════════════════════════
  // PRIVATE UTILITIES
  // ═══════════════════════════════════════════════════════════════════════════

  function _base() {
    return _serverUrl.replace(/\/$/, '');
  }

  function _lsKey(suffix) {
    return `${LS_PREFIX}${suffix}`;
  }

  /**
   * Fetch wrapper with AbortController timeout.
   * Does NOT retry — save operations should not double-fire.
   */
  async function _fetchWithTimeout(url, options = {}) {
    const controller = new AbortController();
    const timerId    = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timerId);
      return response;
    } catch (err) {
      clearTimeout(timerId);
      throw err;
    }
  }

  /** Fires a custom DOM event on window. */
  function _dispatchEvent(name, detail = {}) {
    try {
      const event = new CustomEvent(name, { bubbles: true, detail });
      window.dispatchEvent(event);
    } catch (_) {
      // Silently ignore if DOM not available (e.g., unit tests)
    }
  }

  /**
   * Persists the session game state to localStorage as a backup cache.
   * Stores as JSON under `heinrich_cache_{sessionKey}`.
   */
  function _cacheToLocalStorage(sessionKey, gameState) {
    if (!sessionKey || !gameState) return;
    try {
      const entry = JSON.stringify({
        sessionKey,
        gameState,
        timestamp: new Date().toISOString(),
      });
      localStorage.setItem(_lsKey(`cache_${sessionKey}`), entry);
    } catch (err) {
      console.warn('[SaveClient] localStorage cache write failed:', err.message);
    }
  }

  /**
   * Reads cached game state from localStorage.
   * Returns null if not found or parse fails.
   */
  function _readFromLocalStorage(sessionKey) {
    if (!sessionKey) return null;
    try {
      const raw = localStorage.getItem(_lsKey(`cache_${sessionKey}`));
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (_) {
      return null;
    }
  }

  /** Stores the current session key to localStorage. */
  function _persistSessionKey(key) {
    _currentSessionKey = key;
    if (key) {
      localStorage.setItem(LS_SESSION_KEY_KEY, key);
    } else {
      localStorage.removeItem(LS_SESSION_KEY_KEY);
    }
  }

  /**
   * Parses a server response, throwing on non-OK status.
   * Returns parsed JSON body.
   */
  async function _parseResponse(response) {
    let body = {};
    try {
      body = await response.json();
    } catch (_) {
      body = {};
    }
    if (!response.ok) {
      const msg = body.message || body.error || `HTTP ${response.status}`;
      const err = new Error(msg);
      err.status = response.status;
      throw err;
    }
    return body;
  }

  /**
   * Formats a date as YYYY-MM-DD for export filenames.
   */
  function _formatDateForFilename(date) {
    const d = date instanceof Date ? date : new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  /**
   * Triggers a browser file download of the given JSON data.
   */
  function _triggerDownload(filename, jsonData) {
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    // Clean up
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // PUBLIC API
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * setServerUrl(url)
   * Updates the server base URL and persists it to localStorage.
   *
   * @param {string} url
   */
  function setServerUrl(url) {
    if (!url || typeof url !== 'string') return;
    _serverUrl = url.replace(/\/$/, '');
    localStorage.setItem(LS_SERVER_URL_KEY, _serverUrl);
  }

  /**
   * newGame(initialState)
   * POST /api/new
   * Creates a new session on the server, stores the session key.
   *
   * @param {Object} initialState
   * @returns {Promise<{ success: boolean, sessionKey: string, timestamp: string }>}
   */
  async function newGame(initialState) {
    try {
      const response = await _fetchWithTimeout(`${_base()}/api/new`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ initialState }),
      });
      const body = await _parseResponse(response);
      const sessionKey = body.sessionKey || body.session_key || body.key;
      if (sessionKey) {
        _persistSessionKey(sessionKey);
        _cacheToLocalStorage(sessionKey, initialState);
      }
      return {
        success:    true,
        sessionKey,
        timestamp:  body.timestamp || new Date().toISOString(),
      };
    } catch (err) {
      _dispatchEvent('heinrich:savefailed', { action: 'newGame', error: err.message });
      return {
        success:    false,
        sessionKey: null,
        timestamp:  new Date().toISOString(),
        error:      err.message,
      };
    }
  }

  /**
   * saveGame(gameState)
   * POST /api/save
   * Saves game state to server and caches to localStorage.
   *
   * @param {Object} gameState
   * @returns {Promise<{ success: boolean, timestamp: string }>}
   */
  async function saveGame(gameState) {
    const sessionKey = _currentSessionKey;
    if (!sessionKey) {
      const err = { success: false, timestamp: new Date().toISOString(), error: 'No active session key' };
      _dispatchEvent('heinrich:savefailed', { action: 'saveGame', error: err.error });
      return err;
    }

    // Optimistically write to localStorage first
    _cacheToLocalStorage(sessionKey, gameState);

    try {
      const response = await _fetchWithTimeout(`${_base()}/api/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionKey, gameState }),
      });
      const body      = await _parseResponse(response);
      const timestamp = body.timestamp || new Date().toISOString();

      _dispatchEvent('heinrich:saved', { sessionKey, timestamp });
      return { success: true, timestamp };
    } catch (err) {
      _dispatchEvent('heinrich:savefailed', { action: 'saveGame', error: err.message, sessionKey });
      return { success: false, timestamp: new Date().toISOString(), error: err.message };
    }
  }

  /**
   * loadGame(sessionKey)
   * GET /api/load/:key
   * Loads from server; falls back to localStorage cache on failure.
   *
   * @param {string} [sessionKey]   - defaults to _currentSessionKey
   * @returns {Promise<{ success: boolean, gameState: Object|null, timestamp: string }>}
   */
  async function loadGame(sessionKey) {
    const key = sessionKey || _currentSessionKey;
    if (!key) {
      return { success: false, gameState: null, timestamp: new Date().toISOString(), error: 'No session key provided' };
    }

    try {
      const response = await _fetchWithTimeout(`${_base()}/api/load/${encodeURIComponent(key)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const body = await _parseResponse(response);
      const gameState = body.gameState || body.game_state || body.data || null;
      const timestamp = body.timestamp || new Date().toISOString();

      _persistSessionKey(key);
      if (gameState) _cacheToLocalStorage(key, gameState);

      _dispatchEvent('heinrich:loaded', { sessionKey: key, timestamp });
      return { success: true, gameState, timestamp };
    } catch (err) {
      // Server failed — try localStorage fallback
      const cached = _readFromLocalStorage(key);
      if (cached && cached.gameState) {
        console.warn('[SaveClient] Server load failed; using localStorage cache.', err.message);
        _persistSessionKey(key);
        _dispatchEvent('heinrich:loaded', { sessionKey: key, timestamp: cached.timestamp, fromCache: true });
        return { success: true, gameState: cached.gameState, timestamp: cached.timestamp, fromCache: true };
      }
      return { success: false, gameState: null, timestamp: new Date().toISOString(), error: err.message };
    }
  }

  /**
   * autoSave(gameState)
   * Debounced silent save — fires at most once per 10 seconds.
   * Does not dispatch heinrich:saved (silent).
   *
   * @param {Object} gameState
   */
  function autoSave(gameState) {
    _autoSavePending = gameState;

    if (_autoSaveTimer) return; // already scheduled

    _autoSaveTimer = setTimeout(async () => {
      const state = _autoSavePending;
      _autoSavePending = null;
      _autoSaveTimer   = null;

      if (!state) return;

      const sessionKey = _currentSessionKey;
      if (!sessionKey) return;

      // Always update localStorage immediately
      _cacheToLocalStorage(sessionKey, state);

      // Best-effort server save (silent — no events)
      try {
        await _fetchWithTimeout(`${_base()}/api/save`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionKey, gameState: state, autoSave: true }),
        });
      } catch (_) {
        // autoSave failures are silent
      }
    }, AUTOSAVE_DEBOUNCE_MS);
  }

  /**
   * exportGame(sessionKey)
   * GET /api/export/:key
   * Fetches export JSON from server and triggers a browser download.
   *
   * @param {string} [sessionKey]
   * @returns {Promise<{ success: boolean }>}
   */
  async function exportGame(sessionKey) {
    const key = sessionKey || _currentSessionKey;
    if (!key) return { success: false, error: 'No session key' };

    try {
      const response = await _fetchWithTimeout(
        `${_base()}/api/export/${encodeURIComponent(key)}`,
        { method: 'GET', headers: { 'Accept': 'application/json' } },
      );

      if (!response.ok) {
        // Try to use cached data as fallback for export
        const cached = _readFromLocalStorage(key);
        if (cached) {
          const date     = _formatDateForFilename(new Date());
          const filename = `heinrich-${key}-${date}.json`;
          _triggerDownload(filename, cached);
          return { success: true, fromCache: true };
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const jsonData = await response.json();
      const date     = _formatDateForFilename(new Date());
      const filename = `heinrich-${key}-${date}.json`;
      _triggerDownload(filename, jsonData);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * importGame(jsonFile)
   * Reads a File object, sends its parsed content to POST /api/import.
   *
   * @param {File} jsonFile
   * @returns {Promise<{ success: boolean, sessionKey: string|null }>}
   */
  async function importGame(jsonFile) {
    if (!(jsonFile instanceof File)) {
      return { success: false, sessionKey: null, error: 'Argument must be a File object' };
    }

    let parsed;
    try {
      const text = await jsonFile.text();
      parsed = JSON.parse(text);
    } catch (err) {
      return { success: false, sessionKey: null, error: `Failed to parse file: ${err.message}` };
    }

    try {
      const response = await _fetchWithTimeout(`${_base()}/api/import`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importData: parsed }),
      });
      const body       = await _parseResponse(response);
      const sessionKey = body.sessionKey || body.session_key || body.key || null;

      if (sessionKey) {
        _persistSessionKey(sessionKey);
        if (parsed.gameState || parsed.data) {
          _cacheToLocalStorage(sessionKey, parsed.gameState || parsed.data);
        }
      }

      return { success: true, sessionKey };
    } catch (err) {
      return { success: false, sessionKey: null, error: err.message };
    }
  }

  /**
   * listSessions()
   * GET /api/sessions
   *
   * @returns {Promise<{ success: boolean, sessions: Array<{ key, created, lastSaved, turn, characterName }> }>}
   */
  async function listSessions() {
    try {
      const response = await _fetchWithTimeout(`${_base()}/api/sessions`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const body = await _parseResponse(response);
      const sessions = body.sessions || body.data || [];
      return { success: true, sessions };
    } catch (err) {
      return { success: false, sessions: [], error: err.message };
    }
  }

  /**
   * deleteSession(sessionKey)
   * DELETE /api/session/:key
   *
   * @param {string} sessionKey
   * @returns {Promise<{ success: boolean }>}
   */
  async function deleteSession(sessionKey) {
    if (!sessionKey) return { success: false, error: 'No session key provided' };

    try {
      const response = await _fetchWithTimeout(
        `${_base()}/api/session/${encodeURIComponent(sessionKey)}`,
        { method: 'DELETE', headers: { 'Accept': 'application/json' } },
      );
      await _parseResponse(response);

      // Clean up localStorage cache for this session
      try {
        localStorage.removeItem(_lsKey(`cache_${sessionKey}`));
      } catch (_) { /* ignore */ }

      // If we just deleted the current session, clear the stored key
      if (_currentSessionKey === sessionKey) {
        _persistSessionKey(null);
      }

      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }

  /**
   * getServerStatus()
   * GET /api/status
   *
   * @returns {Promise<{ online: boolean, version: string, saveCount: number }>}
   */
  async function getServerStatus() {
    try {
      const response = await _fetchWithTimeout(`${_base()}/api/status`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
      });
      const body = await _parseResponse(response);
      return {
        online:    true,
        version:   body.version   || body.v || 'unknown',
        saveCount: body.saveCount || body.save_count || 0,
      };
    } catch (err) {
      return { online: false, version: 'unknown', saveCount: 0, error: err.message };
    }
  }

  // ─── Expose public surface ─────────────────────────────────────────────────
  return Object.freeze({
    // Configuration
    setServerUrl,

    // Core save/load
    newGame,
    saveGame,
    loadGame,
    autoSave,

    // Import / export
    exportGame,
    importGame,

    // Session management
    listSessions,
    deleteSession,

    // Server health
    getServerStatus,

    // Accessors
    get serverUrl()         { return _serverUrl; },
    get currentSessionKey() { return _currentSessionKey; },
  });
})();

// END FILE: client/js/save/save-client.js
