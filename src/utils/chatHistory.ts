/**
 * Chat history management utilities
 * Handles saving and loading chat history from localStorage
 */

import type { ChatMessage } from '@/types/chat';
import type { ChatTopic } from '@/components/ChatTopicSelector';

const HISTORY_PREFIX = 'chat_';

/**
 * Get storage key for chat history
 * @param userId - User ID
 * @param topic - Chat topic
 * @returns Storage key
 */
export function getChatHistoryKey(userId: string, topic: ChatTopic | null): string {
  const topicKey = topic || 'general';
  return `${HISTORY_PREFIX}${userId}_${topicKey}`;
}

/**
 * Save chat history to localStorage
 * @param userId - User ID
 * @param topic - Chat topic
 * @param messages - Chat messages to save
 */
export function saveChatHistory(
  userId: string,
  topic: ChatTopic | null,
  messages: ChatMessage[]
): void {
  try {
    const key = getChatHistoryKey(userId, topic);
    const data = JSON.stringify({
      messages,
      topic,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(key, data);
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
}

/**
 * Load chat history from localStorage
 * @param userId - User ID
 * @param topic - Chat topic
 * @returns Chat messages or null if not found
 */
export function loadChatHistory(
  userId: string,
  topic: ChatTopic | null
): ChatMessage[] | null {
  try {
    const key = getChatHistoryKey(userId, topic);
    const data = localStorage.getItem(key);
    
    if (!data) {
      return null;
    }

    const parsed = JSON.parse(data);
    return parsed.messages || null;
  } catch (error) {
    console.error('Failed to load chat history:', error);
    return null;
  }
}

/**
 * Clear chat history for a specific user and topic
 * @param userId - User ID
 * @param topic - Chat topic
 */
export function clearChatHistory(userId: string, topic: ChatTopic | null): void {
  try {
    const key = getChatHistoryKey(userId, topic);
    localStorage.removeItem(key);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
}

/**
 * Clear all chat history for a user
 * @param userId - User ID
 */
export function clearAllChatHistory(userId: string): void {
  try {
    const keys = Object.keys(localStorage);
    const prefix = `${HISTORY_PREFIX}${userId}_`;
    
    keys.forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear all chat history:', error);
  }
}

