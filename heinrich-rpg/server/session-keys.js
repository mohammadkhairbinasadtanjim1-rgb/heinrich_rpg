// FILE: server/session-keys.js — PART 1
// Session key generation and validation for THE FATE OF HEINRICH

const crypto = require('crypto');

// Character set for session keys: uppercase letters and digits (no ambiguous chars)
const KEY_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const KEY_LENGTH = 8;

/**
 * Generate a unique 8-character alphanumeric session key
 * Excludes ambiguous characters (0/O, 1/I/L) for readability
 * @returns {string} 8-character session key
 */
function generateSessionKey() {
  let key = '';
  const randomBytes = crypto.randomBytes(KEY_LENGTH);
  
  for (let i = 0; i < KEY_LENGTH; i++) {
    const index = randomBytes[i] % KEY_CHARS.length;
    key += KEY_CHARS[index];
  }
  
  return key;
}

/**
 * Validate session key format
 * @param {string} key - Session key to validate
 * @returns {boolean} True if valid format
 */
function isValidKeyFormat(key) {
  if (!key || typeof key !== 'string') return false;
  if (key.length !== KEY_LENGTH) return false;
  
  // Check all characters are in allowed set
  for (const char of key) {
    if (!KEY_CHARS.includes(char)) return false;
  }
  
  return true;
}

/**
 * Normalize session key (uppercase, trim whitespace)
 * @param {string} key - Raw key input
 * @returns {string} Normalized key
 */
function normalizeKey(key) {
  if (!key || typeof key !== 'string') return '';
  return key.trim().toUpperCase();
}

/**
 * Generate multiple unique session keys
 * @param {number} count - Number of keys to generate
 * @param {Set} existingKeys - Set of existing keys to avoid collisions
 * @returns {string[]} Array of unique session keys
 */
function generateUniqueKeys(count, existingKeys = new Set()) {
  const keys = [];
  const maxAttempts = count * 100; // Prevent infinite loops
  let attempts = 0;
  
  while (keys.length < count && attempts < maxAttempts) {
    const key = generateSessionKey();
    if (!existingKeys.has(key) && !keys.includes(key)) {
      keys.push(key);
    }
    attempts++;
  }
  
  return keys;
}

module.exports = {
  generateSessionKey,
  isValidKeyFormat,
  normalizeKey,
  generateUniqueKeys,
  KEY_LENGTH,
  KEY_CHARS
};
// END FILE: server/session-keys.js
