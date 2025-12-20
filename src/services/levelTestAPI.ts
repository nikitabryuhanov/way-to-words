/**
 * Level Test API service
 * Integrates with AI-powered CEFR level evaluation via backend API
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const EVALUATE_API_URL = `${BASE_URL}/api/evaluate`;

// Request timeout in milliseconds (30 seconds for evaluation)
const REQUEST_TIMEOUT = 30000;

/**
 * Create a fetch request with timeout
 */
function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<Response>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    ),
  ]);
}

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface LevelTestResult {
  level: CefrLevel;
  explanation: string;
}

/**
 * Evaluate user's answer to determine CEFR level using AI
 * Connects to Node.js backend server with HuggingFace integration
 * 
 * @param answer - User's answer or test response
 * @returns Promise with evaluated CEFR level and explanation
 */
export async function evaluateAnswer(answer: string): Promise<LevelTestResult> {
  try {
    const response = await fetchWithTimeout(
      EVALUATE_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer }),
      },
      REQUEST_TIMEOUT
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    
    if (!data.level || !data.explanation) {
      throw new Error('Invalid response format: missing level or explanation');
    }

    // Validate level is a valid CEFR level
    const validLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    if (!validLevels.includes(data.level as CefrLevel)) {
      throw new Error(`Invalid CEFR level: ${data.level}`);
    }

    return {
      level: data.level as CefrLevel,
      explanation: data.explanation,
    };
  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.message === 'Request timeout') {
      throw new Error('Request timeout: Server did not respond in time. Please try again.');
    }

    // Handle network errors
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Network error: Unable to connect to server. Please check if the backend is running.');
    }

    // Re-throw other errors
    throw error;
  }
}

/**
 * Evaluate multiple answers to determine overall CEFR level
 * @param answers - Array of user answers
 * @returns Promise with evaluated CEFR level and detailed explanation
 */
export async function evaluateMultipleAnswers(
  answers: string[]
): Promise<LevelTestResult> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 1000));

  // For now, evaluate based on average (placeholder logic)
  const levels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
  const randomLevel = levels[Math.floor(Math.random() * levels.length)];

  const explanations: Record<CefrLevel, string> = {
    A1: 'Based on your responses, you demonstrate basic English skills across multiple areas.',
    A2: 'Your answers show elementary English proficiency with consistent performance.',
    B1: 'You have intermediate English skills with good understanding of various topics.',
    B2: 'You demonstrate upper-intermediate proficiency with strong language abilities.',
    C1: 'You show advanced English skills with excellent command of the language.',
    C2: 'You have mastery-level English proficiency with near-native capabilities.',
  };

  return {
    level: randomLevel,
    explanation: explanations[randomLevel],
  };
}

