/**
 * Express backend server for Way to Words chat bot
 * Handles chat API requests from React frontend
 * Integrates with HuggingFace Inference API
 */

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { callChatModel } = require('./hfClient');

const app = express();
const PORT = process.env.PORT || 4000;
const HF_TOKEN = process.env.HF_TOKEN;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite dev server
  credentials: true,
}));
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('Request body:', JSON.stringify(req.body, null, 2));
  }
  next();
});


/**
 * Build prompt for English tutor conversation
 * @param {Object} params - Chat parameters
 * @param {string} params.message - User message
 * @param {string} params.topic - Conversation topic
 * @param {string|null} params.cefrLevel - User's CEFR level
 * @param {Array} params.history - Conversation history
 * @returns {string} - Formatted prompt
 */
function buildPrompt({ message, topic, cefrLevel, history }) {
  const level = cefrLevel || 'A1';
  const topicText = topic || 'general conversation';
  
  // Build system prompt
  let prompt = `You are an English tutor for CEFR ${level} level students. Topic: ${topicText}. Answer in simple English and correct errors gently.\n\n`;
  
  // Add recent history (last 3-5 messages)
  if (history && history.length > 0) {
    const recentHistory = history.slice(-5); // Last 5 messages
    prompt += 'Recent conversation:\n';
    recentHistory.forEach((msg) => {
      const role = msg.author === 'user' ? 'Student' : 'Tutor';
      prompt += `${role}: ${msg.text}\n`;
    });
    prompt += '\n';
  }
  
  // Add current message
  prompt += `Student: ${message}\nTutor:`;
  
  return prompt;
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    hfConfigured: !!HF_TOKEN,
  });
});

/**
 * Parse JSON from LLM response with fallback strategies
 * @param {string} text - Raw text response from LLM
 * @returns {Object} - Parsed JSON object with level and explanation
 */
function parseEvaluationResponse(text) {
  // Strategy 1: Try direct JSON.parse
  try {
    const parsed = JSON.parse(text);
    if (parsed.level && parsed.explanation) {
      return parsed;
    }
  } catch (e) {
    // Continue to next strategy
  }

  // Strategy 2: Try to find JSON using RegExp
  try {
    // Match JSON object pattern: { "level": "...", "explanation": "..." }
    // This pattern looks for a JSON object containing both "level" and "explanation" keys
    const jsonMatch = text.match(/\{[\s\S]*?"level"[\s\S]*?"explanation"[\s\S]*?\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (parsed.level && parsed.explanation) {
        return parsed;
      }
    }

    // Alternative: Match any JSON object (more permissive)
    // This tries to find any JSON object in the text
    const jsonObjectMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonObjectMatch) {
      const parsed = JSON.parse(jsonObjectMatch[0]);
      if (parsed.level && parsed.explanation) {
        return parsed;
      }
    }
  } catch (e) {
    // Continue to fallback
  }

  // Strategy 3: Fallback response
  return {
    level: 'B1',
    explanation: 'Fallback due to parse error',
  };
}

/**
 * Build prompt for CEFR level evaluation
 * @param {string} answer - User's answer to evaluate
 * @returns {string} - Formatted prompt
 */
function buildEvaluationPrompt(answer) {
  return `You are an English examiner. Rate the following answer on CEFR A1–C2 and explain briefly. Return STRICT JSON: { "level": "A1"|"A2"|"B1"|"B2"|"C1"|"C2", "explanation": "string" }.

Answer to evaluate:
${answer}

JSON response:`;
}

// Evaluate endpoint for AI-powered CEFR level assessment
app.post('/api/evaluate', async (req, res) => {
  try {
    const { answer } = req.body;

    // Validate request
    if (!answer || typeof answer !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Answer is required and must be a string',
      });
    }

    // Log incoming request
    console.log('Evaluate request received:');
    console.log('  Answer length:', answer.length);
    console.log('  Answer preview:', answer.substring(0, 100) + '...');

    // Build prompt for HuggingFace
    const prompt = buildEvaluationPrompt(answer);
    console.log('Generated evaluation prompt:', prompt.substring(0, 200) + '...');

    // Call HuggingFace API
    let llmResponse;
    try {
      llmResponse = await callChatModel(prompt);
      
      // Clean up the response
      if (llmResponse.includes('JSON response:')) {
        llmResponse = llmResponse.split('JSON response:').pop().trim();
      }
      
      // Ensure we have a valid response
      if (!llmResponse || llmResponse.trim().length === 0) {
        throw new Error('Empty response from HF API');
      }
    } catch (hfError) {
      console.error('HuggingFace API error:', hfError);
      // Return fallback response
      return res.json({
        level: 'B1',
        explanation: 'Fallback due to parse error',
        timestamp: new Date().toISOString(),
      });
    }

    // Parse the response with fallback strategies
    const parsed = parseEvaluationResponse(llmResponse);
    
    // Validate parsed result
    const validLevels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validLevels.includes(parsed.level)) {
      console.warn('Invalid level parsed, using fallback:', parsed.level);
      parsed.level = 'B1';
      parsed.explanation = 'Fallback due to parse error';
    }

    // Return response
    res.json({
      level: parsed.level,
      explanation: parsed.explanation || 'No explanation provided',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing evaluate request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to process evaluation request',
    });
  }
});

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, topic, cefrLevel, history } = req.body;

    // Validate request
    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        error: 'Invalid request',
        message: 'Message is required and must be a string',
      });
    }

    // Log incoming request details
    console.log('Chat request received:');
    console.log('  Message:', message);
    console.log('  Topic:', topic || 'none');
    console.log('  CEFR Level:', cefrLevel || 'none');
    console.log('  History length:', history?.length || 0);

    // Build prompt for HuggingFace
    const prompt = buildPrompt({ message, topic, cefrLevel, history });
    console.log('Generated prompt:', prompt.substring(0, 200) + '...');

    // Call HuggingFace API
    let reply;
    try {
      reply = await callChatModel(prompt);
      
      // Clean up the response (remove prompt if it was included)
      if (reply.includes('Tutor:')) {
        reply = reply.split('Tutor:').pop().trim();
      }
      
      // Ensure we have a valid response
      if (!reply || reply.trim().length === 0) {
        throw new Error('Empty response from HF API');
      }
    } catch (hfError) {
      console.error('HuggingFace API error:', hfError);
      // Fallback response
      reply = 'Sorry, I am unavailable.';
    }

    // Return response
    res.json({
      reply,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Failed to process chat request',
    });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message || 'An unexpected error occurred',
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for http://localhost:5173`);
  console.log(`💬 Chat endpoint: POST http://localhost:${PORT}/api/chat`);
  console.log(`📊 Evaluate endpoint: POST http://localhost:${PORT}/api/evaluate`);
});

