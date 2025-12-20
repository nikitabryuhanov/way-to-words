/**
 * Chat Bot API service
 * Prepares structure for future AI integration (HuggingFace, OpenAI, etc.)
 */

export interface ChatRequest {
  message: string;
  topic: string;
  cefrLevel: string | null;
  history: {
    author: 'user' | 'bot';
    text: string;
  }[];
}

export interface ChatResponse {
  text: string;
  error?: string;
}

// Base URL for backend server
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';
const CHAT_API_URL = `${BASE_URL}/api/chat`;

// Request timeout in milliseconds (20 seconds)
const REQUEST_TIMEOUT = 20000;

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

/**
 * Send chat message to AI service
 * Connects to Node.js backend server
 * 
 * @param req - Chat request with message, topic, CEFR level, and history
 * @returns Promise with bot response text
 */
export async function sendChatMessage(req: ChatRequest): Promise<string> {
  try {
    const response = await fetchWithTimeout(
      CHAT_API_URL,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(req),
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
    
    if (!data.reply) {
      throw new Error('Invalid response format: missing reply field');
    }

    return data.reply;
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
 * Send chat message with streaming support (for future SSE implementation)
 * @param req - Chat request
 * @param onChunk - Callback for each chunk of the response
 * @returns Promise that resolves when streaming is complete
 */
export async function sendChatMessageStream(
  req: ChatRequest,
  onChunk: (chunk: string) => void
): Promise<void> {
  // Simulate streaming response
  const fullResponse = await sendChatMessage(req);
  
  // Simulate word-by-word streaming
  const words = fullResponse.split(' ');
  for (let i = 0; i < words.length; i++) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    onChunk(words[i] + (i < words.length - 1 ? ' ' : ''));
  }

  // Future implementation will use EventSource or WebSocket:
  // const eventSource = new EventSource(`/api/chat-stream?message=${encodeURIComponent(req.message)}`);
  // eventSource.onmessage = (event) => {
  //   const data = JSON.parse(event.data);
  //   if (data.content) {
  //     onChunk(data.content);
  //   }
  // };
}

