// FILE: server/server.js — PART 1
// Express server for THE FATE OF HEINRICH
// API proxy + save management

const express = require('express');
const cors = require('cors');
const path = require('path');
const { 
  createNewSession, 
  saveGame, 
  loadGame, 
  deleteSave, 
  exportSave, 
  importSave, 
  getSaveInfo,
  listAllSessionKeys 
} = require('./save-handler');
const { 
  sendPrompt, 
  testConnection, 
  getAvailableProviders, 
  getAvailableModels 
} = require('./llm-adapter');
const { isValidKeyFormat, normalizeKey } = require('./session-keys');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.text({ limit: '10mb' }));

// Serve static files from client directory
app.use(express.static(path.join(__dirname, '..', 'client')));

// ═══════════════════════════════════════════════════════════════
// SAVE SYSTEM API ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/new
 * Create a new game session
 * Body: { initialState: Object }
 * Returns: { success, sessionKey, error }
 */
app.post('/api/new', (req, res) => {
  try {
    const { initialState } = req.body;
    
    if (!initialState || typeof initialState !== 'object') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request: initialState is required' 
      });
    }
    
    const result = createNewSession(initialState);
    
    if (result.success) {
      res.json({ success: true, sessionKey: result.sessionKey });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in /api/new:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/save
 * Save game state to server
 * Body: { sessionKey: string, gameState: Object }
 * Returns: { success, error }
 */
app.post('/api/save', (req, res) => {
  try {
    const { sessionKey, gameState } = req.body;
    
    if (!sessionKey || !gameState) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request: sessionKey and gameState are required' 
      });
    }
    
    const normalized = normalizeKey(sessionKey);
    
    if (!isValidKeyFormat(normalized)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid session key format' 
      });
    }
    
    const result = saveGame(normalized, gameState);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in /api/save:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/load/:key
 * Load game state by session key
 * Returns: { success, gameState, error }
 */
app.get('/api/load/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session key is required' 
      });
    }
    
    const result = loadGame(key);
    
    if (result.success) {
      res.json({ success: true, gameState: result.gameState });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in /api/load:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/export/:key
 * Export save as downloadable JSON file
 * Returns: JSON file download
 */
app.get('/api/export/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session key is required' 
      });
    }
    
    const result = exportSave(key);
    
    if (result.success) {
      const normalized = normalizeKey(key);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="heinrich-save-${normalized}.json"`);
      res.send(result.data);
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in /api/export:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/import
 * Import save from uploaded JSON file
 * Body: { jsonData: string }
 * Returns: { success, sessionKey, error }
 */
app.post('/api/import', (req, res) => {
  try {
    const { jsonData } = req.body;
    
    if (!jsonData || typeof jsonData !== 'string') {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request: jsonData is required' 
      });
    }
    
    const result = importSave(jsonData);
    
    if (result.success) {
      res.json({ success: true, sessionKey: result.sessionKey });
    } else {
      res.status(400).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in /api/import:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/info/:key
 * Get save file info without loading full state
 * Returns: { success, info: { created, last_saved, turn, total_turns_played }, error }
 */
app.get('/api/info/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session key is required' 
      });
    }
    
    const result = getSaveInfo(key);
    
    if (result.success) {
      res.json({ success: true, info: result.info });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in /api/info:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/sessions
 * List all existing session keys
 * Returns: { success, sessions: string[] }
 */
app.get('/api/sessions', (req, res) => {
  try {
    const sessions = listAllSessionKeys();
    res.json({ success: true, sessions });
  } catch (error) {
    console.error('Error in /api/sessions:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * DELETE /api/save/:key
 * Delete a save file
 * Returns: { success, error }
 */
app.delete('/api/save/:key', (req, res) => {
  try {
    const { key } = req.params;
    
    if (!key) {
      return res.status(400).json({ 
        success: false, 
        error: 'Session key is required' 
      });
    }
    
    const result = deleteSave(key);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error('Error in DELETE /api/save:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// LLM API PROXY ENDPOINTS
// ═══════════════════════════════════════════════════════════════

/**
 * POST /api/llm/send
 * Send prompt to LLM provider (proxy to hide API keys from client)
 * Body: { config: { provider, apiKey, model, baseUrl }, prompt: string, maxTokens: number }
 * Returns: { success, response, error }
 */
app.post('/api/llm/send', async (req, res) => {
  try {
    const { config, prompt, maxTokens } = req.body;
    
    if (!config || !prompt) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request: config and prompt are required' 
      });
    }
    
    const result = await sendPrompt(config, prompt, maxTokens);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/llm/send:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * POST /api/llm/test
 * Test connection to LLM provider
 * Body: { config: { provider, apiKey, model, baseUrl } }
 * Returns: { success, error }
 */
app.post('/api/llm/test', async (req, res) => {
  try {
    const { config } = req.body;
    
    if (!config) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid request: config is required' 
      });
    }
    
    const result = await testConnection(config);
    res.json(result);
  } catch (error) {
    console.error('Error in /api/llm/test:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/llm/providers
 * Get list of available LLM providers
 * Returns: { success, providers: Object }
 */
app.get('/api/llm/providers', (req, res) => {
  try {
    const providers = getAvailableProviders();
    res.json({ success: true, providers });
  } catch (error) {
    console.error('Error in /api/llm/providers:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

/**
 * GET /api/llm/models/:provider
 * Get available models for a provider
 * Returns: { success, models: string[] }
 */
app.get('/api/llm/models/:provider', (req, res) => {
  try {
    const { provider } = req.params;
    const models = getAvailableModels(provider);
    res.json({ success: true, models });
  } catch (error) {
    console.error('Error in /api/llm/models:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ═══════════════════════════════════════════════════════════════
// HEALTH CHECK
// ═══════════════════════════════════════════════════════════════

/**
 * GET /api/health
 * Server health check
 * Returns: { status, timestamp, version }
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ═══════════════════════════════════════════════════════════════
// CATCH-ALL: SERVE INDEX.HTML FOR CLIENT-SIDE ROUTING
// ═══════════════════════════════════════════════════════════════

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'index.html'));
});

// ═══════════════════════════════════════════════════════════════
// ERROR HANDLING
// ═══════════════════════════════════════════════════════════════

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    success: false, 
    error: 'Internal server error' 
  });
});

// ═══════════════════════════════════════════════════════════════
// START SERVER
// ═══════════════════════════════════════════════════════════════

app.listen(PORT, () => {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('⚔️  THE FATE OF HEINRICH — Medieval Text RPG');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
  console.log(`  Server running on http://localhost:${PORT}`);
  console.log('');
  console.log('  Open your browser and navigate to the address above.');
  console.log('');
  console.log('  API Endpoints:');
  console.log('    POST /api/new          — Create new game session');
  console.log('    POST /api/save         — Save game state');
  console.log('    GET  /api/load/:key    — Load game by session key');
  console.log('    GET  /api/export/:key  — Export save as JSON');
  console.log('    POST /api/import       — Import save from JSON');
  console.log('    GET  /api/info/:key    — Get save info');
  console.log('    GET  /api/sessions     — List all sessions');
  console.log('    DELETE /api/save/:key  — Delete save');
  console.log('    POST /api/llm/send     — Send prompt to LLM');
  console.log('    POST /api/llm/test     — Test LLM connection');
  console.log('    GET  /api/llm/providers — List LLM providers');
  console.log('    GET  /api/health       — Health check');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');
});

module.exports = app;
// END FILE: server/server.js
