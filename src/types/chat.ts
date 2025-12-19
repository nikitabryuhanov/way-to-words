/**
 * Chat message types and interfaces
 */

export type MessageAuthor = 'user' | 'bot';

export interface ChatMessage {
  id: string;
  author: MessageAuthor;
  text: string;
  time: string;
}

/**
 * Format a message with current timestamp
 */
export function formatMessage(
  author: MessageAuthor,
  text: string,
  id?: string
): ChatMessage {
  return {
    id: id || `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    author,
    text,
    time: new Date().toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

/**
 * Format multiple messages with timestamps
 */
export function formatMessages(
  messages: Array<{ author: MessageAuthor; text: string }>
): ChatMessage[] {
  return messages.map((msg, index) =>
    formatMessage(msg.author, msg.text, `${Date.now()}-${index}`)
  );
}

