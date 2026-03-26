// FILE: server/save-handler.js — PART 1
// Server-side save/load/session key management for THE FATE OF HEINRICH

const fs = require('fs');
const path = require('path');
const { generateSessionKey, isValidKeyFormat, normalizeKey } = require('./session-keys');

// Directory for save files
const SAVES_DIR = path.join(__dirname, '..', 'saves');

/**
 * Ensure the saves directory exists
 */
function ensureSavesDirectory() {
  if (!fs.existsSync(SAVES_DIR)) {
    fs.mkdirSync(SAVES_DIR, { recursive: true });
    console.log('Created saves directory:', SAVES_DIR);
  }
}

/**
 * Get the file path for a session key
 * @param {string} sessionKey - The session key
 * @returns {string} Full file path to the save file
 */
function getSaveFilePath(sessionKey) {
  const normalized = normalizeKey(sessionKey);
  return path.join(SAVES_DIR, `${normalized}.json`);
}

/**
 * Check if a save file exists for the given session key
 * @param {string} sessionKey - The session key
 * @returns {boolean} True if save exists
 */
function saveExists(sessionKey) {
  const filePath = getSaveFilePath(sessionKey);
  return fs.existsSync(filePath);
}

/**
 * List all existing session keys
 * @returns {string[]} Array of session keys
 */
function listAllSessionKeys() {
  ensureSavesDirectory();
  
  try {
    const files = fs.readdirSync(SAVES_DIR);
    return files
      .filter(file => file.endsWith('.json'))
      .map(file => file.replace('.json', ''));
  } catch (error) {
    console.error('Error reading saves directory:', error);
    return [];
  }
}

/**
 * Create a new game session
 * @param {Object} initialState - Initial game state object
 * @returns {Object} { success, sessionKey, error }
 */
function createNewSession(initialState) {
  ensureSavesDirectory();
  
  try {
    // Generate a unique session key
    const existingKeys = new Set(listAllSessionKeys());
    let sessionKey = generateSessionKey();
    let attempts = 0;
    
    while (existingKeys.has(sessionKey) && attempts < 100) {
      sessionKey = generateSessionKey();
      attempts++;
    }
    
    if (existingKeys.has(sessionKey)) {
      return { success: false, error: 'Could not generate unique session key' };
    }
    
    // Set session metadata
    const now = new Date().toISOString();
    const gameState = {
      ...initialState,
      meta: {
        ...initialState.meta,
        session_key: sessionKey,
        created: now,
        last_saved: now
      }
    };
    
    // Write save file
    const filePath = getSaveFilePath(sessionKey);
    fs.writeFileSync(filePath, JSON.stringify(gameState, null, 2), 'utf8');
    
    console.log(`Created new session: ${sessionKey}`);
    return { success: true, sessionKey };
    
  } catch (error) {
    console.error('Error creating new session:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Save game state to server
 * @param {string} sessionKey - The session key
 * @param {Object} gameState - Complete game state to save
 * @returns {Object} { success, error }
 */
function saveGame(sessionKey, gameState) {
  ensureSavesDirectory();
  
  const normalized = normalizeKey(sessionKey);
  
  if (!isValidKeyFormat(normalized)) {
    return { success: false, error: 'Invalid session key format' };
  }
  
  try {
    // Update last_saved timestamp
    const saveData = {
      ...gameState,
      meta: {
        ...gameState.meta,
        last_saved: new Date().toISOString()
      }
    };
    
    const filePath = getSaveFilePath(normalized);
    fs.writeFileSync(filePath, JSON.stringify(saveData, null, 2), 'utf8');
    
    console.log(`Saved session: ${normalized}`);
    return { success: true };
    
  } catch (error) {
    console.error('Error saving game:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Load game state from server
 * @param {string} sessionKey - The session key
 * @returns {Object} { success, gameState, error }
 */
function loadGame(sessionKey) {
  ensureSavesDirectory();
  
  const normalized = normalizeKey(sessionKey);
  
  if (!isValidKeyFormat(normalized)) {
    return { success: false, error: 'Invalid session key format' };
  }
  
  const filePath = getSaveFilePath(normalized);
  
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'Save not found' };
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const gameState = JSON.parse(fileContent);
    
    // Validate basic structure
    if (!gameState.meta || !gameState.meta.session_key) {
      return { success: false, error: 'Corrupted save file' };
    }
    
    console.log(`Loaded session: ${normalized}`);
    return { success: true, gameState };
    
  } catch (error) {
    console.error('Error loading game:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete a save file
 * @param {string} sessionKey - The session key
 * @returns {Object} { success, error }
 */
function deleteSave(sessionKey) {
  ensureSavesDirectory();
  
  const normalized = normalizeKey(sessionKey);
  const filePath = getSaveFilePath(normalized);
  
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'Save not found' };
  }
  
  try {
    fs.unlinkSync(filePath);
    console.log(`Deleted session: ${normalized}`);
    return { success: true };
  } catch (error) {
    console.error('Error deleting save:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Export save as JSON string for download
 * @param {string} sessionKey - The session key
 * @returns {Object} { success, data (JSON string), error }
 */
function exportSave(sessionKey) {
  const result = loadGame(sessionKey);
  
  if (!result.success) {
    return result;
  }
  
  try {
    const jsonData = JSON.stringify(result.gameState, null, 2);
    return { success: true, data: jsonData };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Import save from JSON string
 * @param {string} jsonData - JSON string of game state
 * @returns {Object} { success, sessionKey, error }
 */
function importSave(jsonData) {
  ensureSavesDirectory();
  
  try {
    const gameState = JSON.parse(jsonData);
    
    // Validate basic structure
    if (!gameState.meta) {
      return { success: false, error: 'Invalid save format: missing meta' };
    }
    
    // Generate new session key for imported save
    const existingKeys = new Set(listAllSessionKeys());
    let sessionKey = generateSessionKey();
    let attempts = 0;
    
    while (existingKeys.has(sessionKey) && attempts < 100) {
      sessionKey = generateSessionKey();
      attempts++;
    }
    
    if (existingKeys.has(sessionKey)) {
      return { success: false, error: 'Could not generate unique session key' };
    }
    
    // Update metadata
    const now = new Date().toISOString();
    gameState.meta.session_key = sessionKey;
    gameState.meta.last_saved = now;
    
    // Write save file
    const filePath = getSaveFilePath(sessionKey);
    fs.writeFileSync(filePath, JSON.stringify(gameState, null, 2), 'utf8');
    
    console.log(`Imported session: ${sessionKey}`);
    return { success: true, sessionKey };
    
  } catch (error) {
    console.error('Error importing save:', error);
    return { success: false, error: 'Invalid JSON format' };
  }
}

/**
 * Get save file info without loading full state
 * @param {string} sessionKey - The session key
 * @returns {Object} { success, info: { created, last_saved, turn, total_turns_played }, error }
 */
function getSaveInfo(sessionKey) {
  const normalized = normalizeKey(sessionKey);
  const filePath = getSaveFilePath(normalized);
  
  if (!fs.existsSync(filePath)) {
    return { success: false, error: 'Save not found' };
  }
  
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const gameState = JSON.parse(fileContent);
    
    return {
      success: true,
      info: {
        session_key: gameState.meta.session_key,
        created: gameState.meta.created,
        last_saved: gameState.meta.last_saved,
        turn: gameState.meta.turn,
        total_turns_played: gameState.meta.total_turns_played,
        llm_provider: gameState.meta.llm_provider,
        llm_model: gameState.meta.llm_model
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

// Initialize saves directory on module load
ensureSavesDirectory();

module.exports = {
  createNewSession,
  saveGame,
  loadGame,
  deleteSave,
  exportSave,
  importSave,
  getSaveInfo,
  listAllSessionKeys,
  saveExists,
  SAVES_DIR
};
// END FILE: server/save-handler.js
