import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from '@/components/ChatMessage';
import ChatTopicSelector, { type ChatTopic } from '@/components/ChatTopicSelector';
import VoiceButton from '@/components/VoiceButton';
import Button from '@/components/ui/Button';
import { sendChatMessage } from '@/services/chatBotAPI';
import { useUserStore } from '@/store/userStore';
import { useChatStore } from '@/store/chatStore';
import { saveChatHistory, loadChatHistory } from '@/utils/chatHistory';
import { formatMessage } from '@/types/chat';

const ChatBot = () => {
  const { user } = useUserStore();
  const { messages, topic, isLoading, addUserMessage, addBotMessage, setTopic, setLoading, setMessages } = useChatStore();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chat history on mount or when topic/user changes
  useEffect(() => {
    if (!user?.uid || !topic) return;

    const savedHistory = loadChatHistory(user.uid, topic);
    if (savedHistory && savedHistory.length > 0) {
      setMessages(savedHistory);
    }
  }, [user?.uid, topic, setMessages]);

  // Save chat history whenever messages change
  useEffect(() => {
    if (!user?.uid || !topic || messages.length <= 1) return;

    saveChatHistory(user.uid, topic, messages);
  }, [messages, user?.uid, topic]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const showErrorToast = useCallback((message: string) => {
    // Simple toast notification using alert (can be replaced with a toast library)
    const toast = document.createElement('div');
    toast.className = 'fixed top-4 right-4 bg-red-600 text-white px-6 py-3 rounded-lg shadow-lg z-50 max-w-md';
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity 0.3s';
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }, []);

  const handleSendMessage = useCallback(async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessageText = inputText.trim();
    
    // Add user message immediately
    addUserMessage(userMessageText);
    setInputText('');
    setLoading(true);

    try {
      // Prepare chat request
      const chatRequest = {
        message: userMessageText,
        topic: topic || '',
        cefrLevel: user?.cefrLevel || null,
        history: messages.map((msg) => ({
          author: msg.author,
          text: msg.text,
        })),
      };

      // Call API service
      const botResponseText = await sendChatMessage(chatRequest);
      addBotMessage(botResponseText);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to get response. Please try again.';
      
      // Show error toast
      showErrorToast(errorMessage);
      
      // Also add error message to chat
      addBotMessage(`Error: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [inputText, topic, messages, user?.cefrLevel, isLoading, addUserMessage, addBotMessage, setLoading, showErrorToast]);

  const handleVoiceText = useCallback(
    (text: string) => {
      setInputText((prev) => (prev ? `${prev} ${text}` : text));
      inputRef.current?.focus();
    },
    []
  );

  const handleTopicChange = useCallback((newTopic: ChatTopic) => {
    // Save current history before switching topics
    if (user?.uid && topic) {
      saveChatHistory(user.uid, topic, messages);
    }

    // Switch topic
    setTopic(newTopic);

    // Load history for new topic
    if (user?.uid) {
      const savedHistory = loadChatHistory(user.uid, newTopic);
      if (savedHistory && savedHistory.length > 0) {
        setMessages(savedHistory);
      } else {
        // If no history, add welcome message
        const welcomeMessage = formatMessage(
          'bot',
          `Great! Let's talk about ${newTopic.toLowerCase()}. What would you like to discuss?`
        );
        setMessages([welcomeMessage]);
      }
    }
  }, [user?.uid, topic, messages, setTopic, setMessages]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Topic Selector */}
      <ChatTopicSelector activeTopic={topic} onChange={handleTopicChange} />

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        <div className="max-w-4xl mx-auto">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              author={message.author}
              text={message.text}
              time={message.time}
              topic={topic}
            />
          ))}

          {/* Typing indicator */}
          {isLoading && (
            <div className="flex justify-start mb-4">
              <div className="flex flex-col max-w-[60%] items-start">
                <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce" />
                      <div
                        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.2s' }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0.4s' }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-300 ml-2">
                      Bot is typing...
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row gap-3 items-end">
            {/* Text Input */}
            <div className="flex-1 w-full">
              <textarea
                ref={inputRef}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
                placeholder="Type your message... (Press Enter to send, Shift+Enter for new line)"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                rows={1}
                style={{
                  minHeight: '48px',
                  maxHeight: '120px',
                }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = `${Math.min(target.scrollHeight, 120)}px`;
                }}
              />
            </div>

            {/* Voice Button */}
            <div className={isLoading ? 'opacity-50 pointer-events-none' : ''}>
              <VoiceButton onText={handleVoiceText} className="flex-shrink-0" />
            </div>

            {/* Send Button */}
            <Button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || isLoading}
              variant="primary"
              size="md"
              className="flex-shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </Button>
          </div>

          {/* Helper text */}
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            Select a topic to start a conversation
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
