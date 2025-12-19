import { speak } from '@/utils/speech';
import type { MessageAuthor } from '@/types/chat';

interface ChatMessageProps {
  author: MessageAuthor;
  text: string;
  time?: string;
  topic?: string | null;
}

const ChatMessage = ({ author, text, time, topic }: ChatMessageProps) => {
  const isUser = author === 'user';
  const displayTime = time || new Date().toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  const handleSpeak = () => {
    try {
      speak(text, {
        lang: 'en-US',
        rate: 1,
        pitch: 1,
        volume: 1,
      });
    } catch (error) {
      console.error('Failed to speak message:', error);
    }
  };

  return (
    <div
      className={`flex w-full mb-4 ${
        isUser ? 'justify-end' : 'justify-start'
      }`}
    >
      <div
        className={`flex flex-col max-w-[80%] sm:max-w-[70%] md:max-w-[60%] ${
          isUser ? 'items-end' : 'items-start'
        }`}
      >
        {/* Message bubble */}
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm relative group ${
            isUser
              ? 'bg-blue-600 text-white rounded-br-sm'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-sm'
          }`}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {text}
          </p>

          {/* Speak button for bot messages */}
          {!isUser && (
            <button
              onClick={handleSpeak}
              className="absolute -right-10 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1.5 rounded-full bg-white dark:bg-gray-600 hover:bg-gray-100 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 shadow-md border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Speak message"
              title="Speak this message"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Time stamp */}
        <span
          className={`text-xs text-gray-500 dark:text-gray-400 mt-1 px-2 ${
            isUser ? 'text-right' : 'text-left'
          }`}
        >
          {displayTime}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;

