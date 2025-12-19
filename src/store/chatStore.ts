import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ChatMessage, MessageAuthor } from '@/types/chat';
import { formatMessage } from '@/types/chat';
import type { ChatTopic } from '@/components/ChatTopicSelector';

interface ChatState {
  messages: ChatMessage[];
  topic: ChatTopic | null;
  addUserMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  setTopic: (topic: ChatTopic | null) => void;
  clearChat: () => void;
}

const initialBotMessage: ChatMessage = formatMessage(
  'bot',
  "Hello! I'm your English learning assistant. Choose a topic to start our conversation!"
);

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [initialBotMessage],
      topic: null,

      addUserMessage: (text: string) => {
        const message = formatMessage('user', text);
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      addBotMessage: (text: string) => {
        const message = formatMessage('bot', text);
        set((state) => ({
          messages: [...state.messages, message],
        }));
      },

      setTopic: (topic: ChatTopic | null) => {
        set({ topic });
      },

      clearChat: () => {
        set({
          messages: [initialBotMessage],
          topic: null,
        });
      },
    }),
    {
      name: 'chat-storage',
      // Only persist messages and topic, not temporary state
    }
  )
);

