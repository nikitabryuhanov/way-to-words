/**
 * HuggingFace Inference API Client
 * Provides a unified interface for calling HuggingFace models
 * Includes logging for success/error and response time
 */

require('dotenv').config();

const HF_TOKEN = process.env.HF_TOKEN;
const HF_API_URL = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct';

// Use global fetch (Node 18+) or require node-fetch for older versions
let fetch;
if (typeof globalThis.fetch === 'function') {
  fetch = globalThis.fetch;
} else {
  try {
    fetch = require('node-fetch');
  } catch (error) {
    console.error('fetch is not available. Please use Node 18+ or install node-fetch');
    process.exit(1);
  }
}

/**
 * Call HuggingFace Inference API for chat completion
 * @param {string} prompt - The prompt to send to the model
 * @returns {Promise<string>} - The generated response text
 */
async function callChatModel(prompt) {
  if (!HF_TOKEN) {
    const error = new Error('HF_TOKEN is not configured');
    logError('HF_TOKEN_MISSING', error);
    throw error;
  }

  const startTime = Date.now();
  let success = false;
  let responseTime = 0;

  try {
    const response = await fetch(HF_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 250,
          temperature: 0.7,
          top_p: 0.9,
          return_full_text: false,
        },
      }),
    });

    responseTime = Date.now() - startTime;

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      // Handle model loading errors
      if (response.status === 503) {
        const error = new Error('Model is loading. Please try again in a few seconds.');
        logError('HF_API_503', error, responseTime);
        throw error;
      }
      
      const error = new Error(
        errorData.error || `HF API error: ${response.status} ${response.statusText}`
      );
      logError('HF_API_ERROR', error, responseTime, { status: response.status });
      throw error;
    }

    const data = await response.json();
    
    // Handle different response formats
    let result;
    if (Array.isArray(data) && data.length > 0) {
      // Standard format: [{ generated_text: "..." }]
      result = data[0].generated_text || data[0].summary_text || '';
    } else if (data.generated_text) {
      // Alternative format: { generated_text: "..." }
      result = data.generated_text;
    } else if (typeof data === 'string') {
      // Direct string response
      result = data;
    } else {
      const error = new Error('Unexpected response format from HF API');
      logError('HF_API_FORMAT_ERROR', error, responseTime);
      throw error;
    }

    if (!result || result.trim().length === 0) {
      const error = new Error('Empty response from HF API');
      logError('HF_API_EMPTY', error, responseTime);
      throw error;
    }

    success = true;
    logSuccess('HF_API_CALL', responseTime, { responseLength: result.length });
    
    return result;
  } catch (error) {
    if (!responseTime) {
      responseTime = Date.now() - startTime;
    }
    
    if (!success) {
      logError('HF_API_CALL', error, responseTime);
    }
    
    throw error;
  }
}

/**
 * Log successful API call
 * @param {string} operation - Operation name
 * @param {number} responseTime - Response time in milliseconds
 * @param {Object} metadata - Additional metadata
 */
function logSuccess(operation, responseTime, metadata = {}) {
  const timestamp = new Date().toISOString();
  const metadataStr = Object.keys(metadata).length > 0 
    ? ` | ${JSON.stringify(metadata)}` 
    : '';
  console.log(`[${timestamp}] ✅ ${operation} | ${responseTime}ms${metadataStr}`);
}

/**
 * Log error
 * @param {string} operation - Operation name
 * @param {Error} error - Error object
 * @param {number} responseTime - Response time in milliseconds (if available)
 * @param {Object} metadata - Additional metadata
 */
function logError(operation, error, responseTime = null, metadata = {}) {
  const timestamp = new Date().toISOString();
  const timeStr = responseTime !== null ? ` | ${responseTime}ms` : '';
  const metadataStr = Object.keys(metadata).length > 0 
    ? ` | ${JSON.stringify(metadata)}` 
    : '';
  console.error(
    `[${timestamp}] ❌ ${operation} | ${error.message}${timeStr}${metadataStr}`
  );
}

module.exports = {
  callChatModel,
};

