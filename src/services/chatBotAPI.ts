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

/**
 * Send chat message to AI service
 * Currently returns a fake response based on the request
 * Future: Will integrate with HuggingFace, OpenAI, or custom AI model
 * 
 * @param req - Chat request with message, topic, CEFR level, and history
 * @returns Promise with bot response text
 */
export async function sendChatMessage(req: ChatRequest): Promise<string> {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));

  // Generate fake response based on request
  if (!req.topic) {
    return 'Please select a topic to start our conversation!';
  }

  // Simple echo response with context
  const response = `You said: "${req.message}" (Topic: ${req.topic}${req.cefrLevel ? `, CEFR: ${req.cefrLevel}` : ''})`;

  // Future implementation will look like:
  // const response = await fetch('/api/chat', {
  //   method: 'POST',
  //   headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify(req),
  // });
  // const data = await response.json();
  // return data.text;

  return response;
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

