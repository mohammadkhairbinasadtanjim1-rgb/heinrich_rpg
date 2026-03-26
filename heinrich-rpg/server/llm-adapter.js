// FILE: server/llm-adapter.js — PART 1
// Universal LLM API adapter for THE FATE OF HEINRICH
// Supports: OpenAI, Anthropic, Google, Mistral, Ollama, and custom endpoints

const https = require('https');
const http = require('http');

/**
 * LLM Provider configurations
 */
const PROVIDERS = {
  openai: {
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1/chat/completions',
    defaultModel: 'gpt-4o',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    buildRequest: (prompt, model, maxTokens) => ({
      model: model || 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 4096,
      temperature: 0.8
    }),
    parseResponse: (data) => {
      const parsed = JSON.parse(data);
      return parsed.choices[0].message.content;
    }
  },
  
  anthropic: {
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1/messages',
    defaultModel: 'claude-sonnet-4-20250514',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01'
    }),
    buildRequest: (prompt, model, maxTokens) => ({
      model: model || 'claude-sonnet-4-20250514',
      max_tokens: maxTokens || 4096,
      messages: [{ role: 'user', content: prompt }]
    }),
    parseResponse: (data) => {
      const parsed = JSON.parse(data);
      return parsed.content[0].text;
    }
  },
  
  google: {
    name: 'Google',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/models',
    defaultModel: 'gemini-pro',
    headers: () => ({
      'Content-Type': 'application/json'
    }),
    buildRequest: (prompt, model, maxTokens) => ({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        maxOutputTokens: maxTokens || 4096,
        temperature: 0.8
      }
    }),
    parseResponse: (data) => {
      const parsed = JSON.parse(data);
      return parsed.candidates[0].content.parts[0].text;
    },
    buildUrl: (baseUrl, model, apiKey) => {
      const modelName = model || 'gemini-pro';
      return `${baseUrl}/${modelName}:generateContent?key=${apiKey}`;
    }
  },
  
  mistral: {
    name: 'Mistral',
    baseUrl: 'https://api.mistral.ai/v1/chat/completions',
    defaultModel: 'mistral-large-latest',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    buildRequest: (prompt, model, maxTokens) => ({
      model: model || 'mistral-large-latest',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 4096,
      temperature: 0.8
    }),
    parseResponse: (data) => {
      const parsed = JSON.parse(data);
      return parsed.choices[0].message.content;
    }
  },
  
  ollama: {
    name: 'Ollama',
    baseUrl: 'http://localhost:11434/api/chat',
    defaultModel: 'llama2',
    headers: () => ({
      'Content-Type': 'application/json'
    }),
    buildRequest: (prompt, model, maxTokens) => ({
      model: model || 'llama2',
      messages: [{ role: 'user', content: prompt }],
      stream: false,
      options: {
        num_predict: maxTokens || 4096,
        temperature: 0.8
      }
    }),
    parseResponse: (data) => {
      const parsed = JSON.parse(data);
      return parsed.message.content;
    }
  },
  
  custom: {
    name: 'Custom (OpenAI-compatible)',
    baseUrl: '',
    defaultModel: '',
    headers: (apiKey) => ({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    }),
    buildRequest: (prompt, model, maxTokens) => ({
      model: model || '',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens || 4096,
      temperature: 0.8
    }),
    parseResponse: (data) => {
      const parsed = JSON.parse(data);
      return parsed.choices[0].message.content;
    }
  }
};

/**
 * Make HTTP/HTTPS request
 * @param {string} url - Full URL
 * @param {Object} options - Request options
 * @param {string} postData - JSON string to send
 * @returns {Promise<string>} Response body
 */
function makeRequest(url, options, postData) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

/**
 * Send prompt to LLM and get response
 * @param {Object} config - LLM configuration
 * @param {string} config.provider - Provider name (openai, anthropic, google, mistral, ollama, custom)
 * @param {string} config.apiKey - API key (not needed for ollama)
 * @param {string} config.model - Model name (optional, uses default)
 * @param {string} config.baseUrl - Custom base URL (for custom provider or ollama)
 * @param {string} prompt - The prompt to send
 * @param {number} maxTokens - Maximum tokens in response (default 4096)
 * @returns {Promise<Object>} { success, response, error, usage }
 */
async function sendPrompt(config, prompt, maxTokens = 4096) {
  const { provider, apiKey, model, baseUrl: customBaseUrl } = config;
  
  // Validate provider
  const providerConfig = PROVIDERS[provider];
  if (!providerConfig) {
    return {
      success: false,
      error: `Unknown provider: ${provider}. Supported: ${Object.keys(PROVIDERS).join(', ')}`
    };
  }
  
  // Validate API key (except for ollama)
  if (provider !== 'ollama' && !apiKey) {
    return {
      success: false,
      error: 'API key is required for this provider'
    };
  }
  
  try {
    // Build URL
    let url;
    if (provider === 'google') {
      url = providerConfig.buildUrl(providerConfig.baseUrl, model, apiKey);
    } else if (provider === 'ollama') {
      url = customBaseUrl || providerConfig.baseUrl;
    } else if (provider === 'custom') {
      url = customBaseUrl || providerConfig.baseUrl;
      if (!url) {
        return { success: false, error: 'Base URL is required for custom provider' };
      }
    } else {
      url = providerConfig.baseUrl;
    }
    
    // Build headers
    const headers = providerConfig.headers(apiKey);
    
    // Build request body
    const requestBody = providerConfig.buildRequest(prompt, model, maxTokens);
    const postData = JSON.stringify(requestBody);
    
    // Make request
    const options = {
      method: 'POST',
      headers: headers,
      timeout: 120000 // 2 minute timeout
    };
    
    const responseData = await makeRequest(url, options, postData);
    
    // Parse response
    const response = providerConfig.parseResponse(responseData);
    
    return {
      success: true,
      response: response,
      usage: {} // Could parse usage from response if available
    };
    
  } catch (error) {
    console.error(`LLM request failed (${provider}):`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Test connection to LLM provider
 * @param {Object} config - LLM configuration
 * @returns {Promise<Object>} { success, error }
 */
async function testConnection(config) {
  const testPrompt = 'Respond with exactly: "Connection successful."';
  
  const result = await sendPrompt(config, testPrompt, 50);
  
  if (!result.success) {
    return result;
  }
  
  // Check if response contains expected text
  if (result.response.toLowerCase().includes('connection successful')) {
    return { success: true };
  } else {
    return {
      success: true,
      warning: 'Connection established but response was unexpected: ' + result.response.substring(0, 100)
    };
  }
}

/**
 * Get list of available providers
 * @returns {Object} Provider names and their default models
 */
function getAvailableProviders() {
  const providers = {};
  
  for (const [key, config] of Object.entries(PROVIDERS)) {
    providers[key] = {
      name: config.name,
      defaultModel: config.defaultModel,
      requiresApiKey: key !== 'ollama'
    };
  }
  
  return providers;
}

/**
 * Get available models for a provider
 * Note: This returns common models. For full lists, provider APIs would need to be queried.
 * @param {string} provider - Provider name
 * @returns {string[]} Array of model names
 */
function getAvailableModels(provider) {
  const models = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'],
    anthropic: ['claude-sonnet-4-20250514', 'claude-haiku-4-20250514', 'claude-opus-4-20250514', 'claude-3-5-sonnet-20241022', 'claude-3-haiku-20240307'],
    google: ['gemini-pro', 'gemini-pro-vision', 'gemini-ultra'],
    mistral: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest', 'open-mixtral-8x7b'],
    ollama: ['llama2', 'llama3', 'mistral', 'codellama', 'phi', 'gemma'],
    custom: [] // User specifies their own model
  };
  
  return models[provider] || [];
}

module.exports = {
  sendPrompt,
  testConnection,
  getAvailableProviders,
  getAvailableModels,
  PROVIDERS
};
// END FILE: server/llm-adapter.js
