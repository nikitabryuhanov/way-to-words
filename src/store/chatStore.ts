import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, MessageAuthor } from '@/types/chat';
import { formatMessage } from '@/types/chat';
import type { ChatTopic } from '@/components/ChatTopicSelector';

interface ChatState {
  messages: ChatMessage[];
  topic: ChatTopic | null;
  isLoading: boolean;
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  setTopic: (topic: ChatTopic | null) => void;
  setLoading: (loading: boolean) => void;
  clearChat: () => void;
  setMessages: (messages: ChatMessage[]) => void;
}

const initialBotMessage: ChatMessage = formatMessage(
  'bot',
  "Hello! I'm your English learning assistant. Choose a topic to start our conversation!"
);

const MAX_MESSAGES = 30;

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [initialBotMessage],
      topic: null,
      isLoading: false,

      addUserMessage: (text: string) => {
        const message = formatMessage('user', text);
        set((state) => {
          const newMessages = [...state.messages, message];
          // Limit to MAX_MESSAGES, keep the first (initial bot message) and last messages
          const limitedMessages = newMessages.length > MAX_MESSAGES
            ? [newMessages[0], ...newMessages.slice(-(MAX_MESSAGES - 1))]
            : newMessages;
          return { messages: limitedMessages };
        });
      },

      addBotMessage: (text: string) => {
        const message = formatMessage('bot', text);
        set((state) => {
          const newMessages = [...state.messages, message];
          // Limit to MAX_MESSAGES, keep the first (initial bot message) and last messages
          const limitedMessages = newMessages.length > MAX_MESSAGES
            ? [newMessages[0], ...newMessages.slice(-(MAX_MESSAGES - 1))]
            : newMessages;
          return { messages: limitedMessages };
        });
      },

      setTopic: (topic: ChatTopic | null) => {
        set({ topic });
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },

      setMessages: (messages: ChatMessage[]) => {
        // Limit messages when setting
        const limitedMessages = messages.length > MAX_MESSAGES
          ? [messages[0], ...messages.slice(-(MAX_MESSAGES - 1))]
          : messages;
        set({ messages: limitedMessages });
      },

      clearChat: () => {
        set({
          messages: [initialBotMessage],
          topic: null,
          isLoading: false,
        });
      },
    }),
    {
      name: 'chat-storage',
      // Only persist messages and topic, not isLoading
      partialize: (state) => ({
        messages: state.messages,
        topic: state.topic,
      }),
    }
  )
);

