import { useState, useCallback, useRef } from 'react';
import { startRecognition, checkSpeechSupport } from '@/utils/speech';

interface VoiceButtonProps {
  onText: (text: string) => void;
  className?: string;
}

const VoiceButton = ({ onText, className = '' }: VoiceButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stopRecognitionRef = useRef<(() => void) | null>(null);
  const support = checkSpeechSupport();

  const handleClick = useCallback(() => {
    if (!support.recognition) {
      setError('Speech Recognition is not supported in this browser');
      return;
    }

    if (isListening) {
      // Stop recognition if already listening
      if (stopRecognitionRef.current) {
        stopRecognitionRef.current();
        stopRecognitionRef.current = null;
      }
      setIsListening(false);
      return;
    }

    try {
      setError(null);
      setIsListening(true);

      const stopRecognition = startRecognition(
        (text) => {
          // Called when speech is recognized
          onText(text);
          setIsListening(false);
          stopRecognitionRef.current = null;
        },
        () => {
          // Called when recognition ends
          setIsListening(false);
          stopRecognitionRef.current = null;
        }
      );

      // Store stop function
      stopRecognitionRef.current = stopRecognition || null;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to start speech recognition';
      setError(errorMessage);
      setIsListening(false);
      stopRecognitionRef.current = null;
    }
  }, [isListening, onText, support.recognition]);

  const isDisabled = !support.recognition;

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleClick}
        disabled={isDisabled}
        className={`
          relative px-6 py-3 rounded-lg font-medium transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-2
          ${
            isDisabled
              ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
              : isListening
              ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 text-white animate-pulse'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white'
          }
          ${className}
        `}
        aria-label={isListening ? 'Listening...' : 'Start voice recognition'}
      >
        <div className="flex items-center gap-2">
          {isListening ? (
            <>
              <svg
                className="w-5 h-5 animate-pulse"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>Listening...</span>
            </>
          ) : (
            <>
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
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
              <span>Start Voice Input</span>
            </>
          )}
        </div>
      </button>

      {error && (
        <p className="text-sm text-red-600 dark:text-red-400 text-center max-w-xs">
          {error}
        </p>
      )}

      {isDisabled && (
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-xs">
          Speech Recognition is not supported in this browser. Please use Chrome, Edge, or Safari.
        </p>
      )}
    </div>
  );
};

export default VoiceButton;

