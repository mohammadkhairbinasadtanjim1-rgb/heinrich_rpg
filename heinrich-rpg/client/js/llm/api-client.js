// FILE: client/js/llm/api-client.js — PART 9

/**
 * ApiClient — handles all browser ↔ Express /api/llm communication.
 * Exposed as a browser global via IIFE; no ES module import/export.
 *
 * Responsibilities:
 *  - Provider/model/key configuration
 *  - POST /api/llm/test   → testConnection()
 *  - POST /api/llm/chat   → sendPrompt()
 *  - SSE  /api/llm/stream → streamPrompt()
 *  - Static provider catalogue → getProviders()
 *  - 60-second request timeout
 *  - 2 retries on network failure (not on 4xx)
 *  - Unique requestId per request
 */
const ApiClient = (() => {
  // ─── Private state ────────────────────────────────────────────────────────
  let _config = {
    provider: '',
    model: '',
    apiKey: '',
    endpoint: 'http://localhost:3000',
  };

  const REQUEST_TIMEOUT_MS = 60_000;
  const MAX_RETRIES = 2;

  // ─── Utility helpers ──────────────────────────────────────────────────────

  /** Generates a short unique ID for request deduplication. */
  function _generateRequestId() {
    return `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  /**
   * Builds the base URL without trailing slash.
   * Falls back to the stored endpoint if none supplied.
   */
  function _baseUrl(overrideEndpoint) {
    return (overrideEndpoint || _config.endpoint).replace(/\/$/, '');
  }

  /**
   * Wraps fetch with:
   *  - AbortController-based timeout
   *  - Retry logic (network failures only, not 4xx/5xx)
   *
   * @param {string}  url
   * @param {RequestInit} options
   * @param {number}  [retries=MAX_RETRIES]
   * @returns {Promise<Response>}
   */
  async function _fetchWithRetry(url, options, retries = MAX_RETRIES) {
    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timerId);
      return response;
    } catch (err) {
      clearTimeout(timerId);
      const isNetworkError = err.name === 'TypeError' || err.name === 'AbortError';
      if (isNetworkError && retries > 0) {
        // Exponential back-off: 500 ms, then 1 000 ms
        const delay = 500 * (MAX_RETRIES - retries + 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        return _fetchWithRetry(url, options, retries - 1);
      }
      throw err;
    }
  }

  /**
   * Shared JSON POST helper.  Throws on network errors; returns parsed body.
   */
  async function _postJson(path, payload) {
    const url = `${_baseUrl()}${path}`;
    const requestId = _generateRequestId();

    const response = await _fetchWithRetry(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': requestId,
      },
      body: JSON.stringify({ ...payload, requestId }),
    });

    if (!response.ok) {
      // Do NOT retry 4xx errors
      let errBody = {};
      try { errBody = await response.json(); } catch (_) { /* ignore */ }
      const msg = errBody.message || errBody.error || `HTTP ${response.status}`;
      const err = new Error(msg);
      err.status = response.status;
      err.requestId = requestId;
      throw err;
    }

    return response.json();
  }

  // ─── Public API ───────────────────────────────────────────────────────────

  /**
   * configure(config)
   * Merges supplied config into stored config.
   *
   * @param {{ provider?: string, model?: string, apiKey?: string, endpoint?: string }} config
   */
  function configure(config) {
    if (!config || typeof config !== 'object') return;
    if (config.provider  !== undefined) _config.provider  = config.provider;
    if (config.model     !== undefined) _config.model     = config.model;
    if (config.apiKey    !== undefined) _config.apiKey    = config.apiKey;
    if (config.endpoint  !== undefined) _config.endpoint  = config.endpoint.replace(/\/$/, '');
  }

  /**
   * testConnection()
   * POST /api/llm/test — verifies the current provider/key combo works.
   *
   * @returns {Promise<{success: boolean, message: string, latency_ms: number}>}
   */
  async function testConnection() {
    const t0 = performance.now();
    try {
      const body = await _postJson('/api/llm/test', {
        provider: _config.provider,
        model:    _config.model,
        apiKey:   _config.apiKey,
      });
      return {
        success:    body.success !== false,
        message:    body.message || 'Connection successful',
        latency_ms: Math.round(performance.now() - t0),
      };
    } catch (err) {
      return {
        success:    false,
        message:    err.message || 'Connection failed',
        latency_ms: Math.round(performance.now() - t0),
      };
    }
  }

  /**
   * sendPrompt(systemPrompt, userPrompt, options)
   * POST /api/llm/chat
   *
   * @param {string} systemPrompt
   * @param {string} userPrompt
   * @param {{ maxTokens?: number, temperature?: number }} [options={}]
   * @returns {Promise<{success: boolean, text: string, tokens_used: number, latency_ms: number}>}
   */
  async function sendPrompt(systemPrompt, userPrompt, options = {}) {
    const t0 = performance.now();
    try {
      const body = await _postJson('/api/llm/chat', {
        provider:     _config.provider,
        model:        _config.model,
        apiKey:       _config.apiKey,
        systemPrompt,
        userPrompt,
        maxTokens:    options.maxTokens   ?? 1024,
        temperature:  options.temperature ?? 0.8,
      });
      return {
        success:     true,
        text:        body.text || body.content || '',
        tokens_used: body.tokens_used || body.usage?.total_tokens || 0,
        latency_ms:  Math.round(performance.now() - t0),
      };
    } catch (err) {
      return {
        success:     false,
        text:        '',
        tokens_used: 0,
        latency_ms:  Math.round(performance.now() - t0),
        error:       err.message,
      };
    }
  }

  /**
   * streamPrompt(systemPrompt, userPrompt, options, onChunk, onComplete, onError)
   * Streams response via SSE from POST /api/llm/stream.
   *
   * The server is expected to respond with text/event-stream where each event
   * carries either:
   *   data: {"chunk":"..."}
   *   data: {"done":true,"fullText":"..."}
   *   data: {"error":"..."}
   *
   * @param {string}   systemPrompt
   * @param {string}   userPrompt
   * @param {{ maxTokens?: number, temperature?: number }} options
   * @param {(text: string) => void}     onChunk
   * @param {(fullText: string) => void} onComplete
   * @param {(err: Error) => void}       onError
   */
  async function streamPrompt(systemPrompt, userPrompt, options = {}, onChunk, onComplete, onError) {
    const requestId = _generateRequestId();
    const url = `${_baseUrl()}/api/llm/stream`;

    const controller = new AbortController();
    const timerId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let accumulatedText = '';

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Request-Id': requestId,
          'Accept':       'text/event-stream',
        },
        body: JSON.stringify({
          provider:     _config.provider,
          model:        _config.model,
          apiKey:       _config.apiKey,
          systemPrompt,
          userPrompt,
          maxTokens:    options.maxTokens   ?? 1024,
          temperature:  options.temperature ?? 0.8,
          requestId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timerId);

      if (!response.ok) {
        let errBody = {};
        try { errBody = await response.json(); } catch (_) { /* ignore */ }
        const msg = errBody.message || `HTTP ${response.status}`;
        if (typeof onError === 'function') onError(new Error(msg));
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Process complete SSE events (terminated by \n\n)
        const parts = buffer.split('\n\n');
        buffer = parts.pop(); // keep incomplete chunk

        for (const part of parts) {
          const lines = part.split('\n');
          for (const line of lines) {
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            if (!jsonStr || jsonStr === '[DONE]') continue;

            try {
              const parsed = JSON.parse(jsonStr);

              if (parsed.error) {
                if (typeof onError === 'function') onError(new Error(parsed.error));
                return;
              }

              if (parsed.done) {
                const full = parsed.fullText || accumulatedText;
                if (typeof onComplete === 'function') onComplete(full);
                return;
              }

              if (parsed.chunk) {
                accumulatedText += parsed.chunk;
                if (typeof onChunk === 'function') onChunk(parsed.chunk);
              }
            } catch (_parseErr) {
              // Non-JSON SSE comment or keep-alive — skip
            }
          }
        }
      }

      // Stream ended without explicit done event
      if (typeof onComplete === 'function') onComplete(accumulatedText);

    } catch (err) {
      clearTimeout(timerId);
      if (typeof onError === 'function') onError(err);
    }
  }

  /**
   * getProviders()
   * Returns the static catalogue of supported LLM providers.
   *
   * @returns {Array<{id:string, name:string, models:string[], requiresKey:boolean, defaultEndpoint:string}>}
   */
  function getProviders() {
    return [
      {
        id:              'openai',
        name:            'OpenAI',
        models:          ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
        requiresKey:     true,
        defaultEndpoint: 'https://api.openai.com/v1',
      },
      {
        id:              'anthropic',
        name:            'Anthropic',
        models:          [
          'claude-opus-4-5',
          'claude-sonnet-4-5',
          'claude-haiku-4-5',
          'claude-3-5-sonnet-20241022',
          'claude-3-5-haiku-20241022',
          'claude-3-opus-20240229',
        ],
        requiresKey:     true,
        defaultEndpoint: 'https://api.anthropic.com',
      },
      {
        id:              'google',
        name:            'Google Gemini',
        models:          [
          'gemini-2.0-flash',
          'gemini-2.0-flash-lite',
          'gemini-1.5-pro',
          'gemini-1.5-flash',
        ],
        requiresKey:     true,
        defaultEndpoint: 'https://generativelanguage.googleapis.com',
      },
      {
        id:              'mistral',
        name:            'Mistral AI',
        models:          ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'open-mistral-7b'],
        requiresKey:     true,
        defaultEndpoint: 'https://api.mistral.ai/v1',
      },
      {
        id:              'ollama',
        name:            'Ollama (local)',
        models:          ['llama3.3', 'llama3.2', 'mistral', 'gemma3', 'phi4', 'qwen2.5'],
        requiresKey:     false,
        defaultEndpoint: 'http://localhost:11434',
      },
      {
        id:              'custom',
        name:            'Custom / OpenAI-compatible',
        models:          [],
        requiresKey:     false,
        defaultEndpoint: 'http://localhost:8080/v1',
      },
    ];
  }

  /**
   * isConfigured()
   * Returns true if the minimum viable config is present.
   * Ollama and custom providers do not require an API key.
   *
   * @returns {boolean}
   */
  function isConfigured() {
    if (!_config.provider || !_config.model) return false;
    const noKeyProviders = ['ollama', 'custom'];
    if (noKeyProviders.includes(_config.provider)) return true;
    return Boolean(_config.apiKey && _config.apiKey.trim().length > 0);
  }

  // ─── Expose public surface ────────────────────────────────────────────────
  return Object.freeze({
    configure,
    testConnection,
    sendPrompt,
    streamPrompt,
    getProviders,
    isConfigured,
    /** Read-only snapshot of current config (key redacted). */
    get config() {
      return {
        provider: _config.provider,
        model:    _config.model,
        apiKey:   _config.apiKey ? '***' : '',
        endpoint: _config.endpoint,
      };
    },
  });
})();

// END FILE: client/js/llm/api-client.js
