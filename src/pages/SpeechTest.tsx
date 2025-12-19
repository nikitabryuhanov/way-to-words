import { useState, useCallback } from 'react';
import { speak, checkSpeechSupport, stopSpeaking } from '@/utils/speech';
import VoiceButton from '@/components/VoiceButton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const SpeechTest = () => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const support = checkSpeechSupport();

  const handleVoiceText = useCallback((recognizedText: string) => {
    setText((prev) => {
      // Append recognized text to existing text
      return prev ? `${prev} ${recognizedText}` : recognizedText;
    });
    setError(null);
  }, []);

  const handleSpeak = useCallback(() => {
    if (!text.trim()) {
      setError('Please enter some text to speak');
      return;
    }

    if (!support.synthesis) {
      setError('Speech Synthesis is not supported in this browser');
      return;
    }

    try {
      setError(null);
      setIsSpeaking(true);

      // Stop any ongoing speech
      stopSpeaking();

      // Speak the text
      speak(text, {
        lang: 'en-US',
        rate: 1,
        pitch: 1,
        volume: 1,
      });

      // Note: We can't easily detect when speech ends with the current API
      // So we'll set a timeout based on text length
      const estimatedDuration = text.length * 50; // Rough estimate: 50ms per character
      setTimeout(() => {
        setIsSpeaking(false);
      }, Math.min(estimatedDuration, 30000)); // Max 30 seconds
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to speak text';
      setError(errorMessage);
      setIsSpeaking(false);
    }
  }, [text, support.synthesis]);

  const handleStopSpeaking = useCallback(() => {
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  const handleClear = useCallback(() => {
    setText('');
    setError(null);
    stopSpeaking();
    setIsSpeaking(false);
  }, []);

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Speech Test
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Test Web Speech API: Voice Recognition and Text-to-Speech
        </p>
      </div>

      {/* Support Status */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Browser Support:
            </h3>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    support.recognition
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Recognition: {support.recognition ? 'Supported' : 'Not Supported'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`w-3 h-3 rounded-full ${
                    support.synthesis
                      ? 'bg-green-500'
                      : 'bg-red-500'
                  }`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Synthesis: {support.synthesis ? 'Supported' : 'Not Supported'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Text Area */}
      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label
              htmlFor="text-input"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Text:
            </label>
            <textarea
              id="text-input"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text or use voice input..."
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors resize-y min-h-[150px]"
              rows={6}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <VoiceButton onText={handleVoiceText} />

            <div className="flex gap-2">
              <Button
                onClick={handleSpeak}
                disabled={!support.synthesis || !text.trim() || isSpeaking}
                variant="primary"
              >
                {isSpeaking ? (
                  <>
                    <svg
                      className="w-4 h-4 mr-2 animate-pulse"
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
                    Speaking...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-4 h-4 mr-2"
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
                    Speak
                  </>
                )}
              </Button>

              {isSpeaking && (
                <Button onClick={handleStopSpeaking} variant="secondary" size="md">
                  Stop
                </Button>
              )}

              <Button onClick={handleClear} variant="ghost" size="md">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Instructions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
          How to use:
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">1.</span>
            <span>
              Click "Start Voice Input" and speak. The recognized text will be added to the textarea.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">2.</span>
            <span>
              Type or edit text in the textarea manually.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">3.</span>
            <span>
              Click "Speak" to hear the text read aloud using text-to-speech.
            </span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-600 dark:text-blue-400">4.</span>
            <span>
              Use "Stop" to interrupt speech, or "Clear" to clear the textarea.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
};

export default SpeechTest;

