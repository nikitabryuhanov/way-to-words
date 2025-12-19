import { useState, useEffect, useRef, useCallback } from 'react';
import VoiceButton from '@/components/VoiceButton';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { speak } from '@/utils/speech';
import { evaluateAnswer } from '@/services/levelTestAPI';
import { useUserStore } from '@/store/userStore';

interface Question {
  id: string;
  type: 'open-ended';
  text: string;
  placeholder?: string;
}

// Sample questions for the test
const sampleQuestions: Question[] = [
  {
    id: '1',
    type: 'open-ended',
    text: 'Tell me about yourself. What are your hobbies and interests?',
    placeholder: 'Type or speak your answer...',
  },
  {
    id: '2',
    type: 'open-ended',
    text: 'Describe your typical day. What do you usually do from morning to evening?',
    placeholder: 'Type or speak your answer...',
  },
  {
    id: '3',
    type: 'open-ended',
    text: 'What is your favorite book or movie? Why do you like it?',
    placeholder: 'Type or speak your answer...',
  },
  {
    id: '4',
    type: 'open-ended',
    text: 'If you could travel anywhere in the world, where would you go and why?',
    placeholder: 'Type or speak your answer...',
  },
  {
    id: '5',
    type: 'open-ended',
    text: 'What are your goals for learning English? How do you plan to achieve them?',
    placeholder: 'Type or speak your answer...',
  },
];

type TestState = 'not-started' | 'in-progress' | 'completed' | 'results';

const LevelTest = () => {
  const { user, updateCefrLevel } = useUserStore();
  const [testState, setTestState] = useState<TestState>('not-started');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [testResult, setTestResult] = useState<{ level: string; explanation: string } | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const currentQuestion = sampleQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === sampleQuestions.length - 1;

  // Clear answer when moving to next question
  useEffect(() => {
    if (testState === 'in-progress' && currentQuestion) {
      // Load saved answer if exists, otherwise clear
      const savedAnswer = answers[currentQuestion.id] || '';
      setCurrentAnswer(savedAnswer);
      
      // Focus textarea
      setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
    }
  }, [currentQuestionIndex, testState, currentQuestion?.id, answers]);

  // Save answer when it changes
  useEffect(() => {
    if (currentQuestion && currentAnswer !== undefined) {
      setAnswers((prev) => ({
        ...prev,
        [currentQuestion.id]: currentAnswer,
      }));
    }
  }, [currentAnswer, currentQuestion?.id]);

  const handleStartTest = () => {
    setTestState('in-progress');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentAnswer('');
  };

  const handleVoiceText = useCallback((text: string) => {
    setCurrentAnswer((prev) => (prev ? `${prev} ${text}` : text));
    // Focus textarea after voice input
    setTimeout(() => {
      textareaRef.current?.focus();
    }, 100);
  }, []);

  const handleListenQuestion = useCallback(() => {
    if (currentQuestion) {
      try {
        speak(currentQuestion.text, {
          lang: 'en-US',
          rate: 0.9, // Slightly slower for clarity
          pitch: 1,
          volume: 1,
        });
      } catch (error) {
        console.error('Failed to speak question:', error);
      }
    }
  }, [currentQuestion]);

  const handleNextQuestion = () => {
    if (isLastQuestion) {
      handleSubmitTest();
    } else {
      // Clear current answer for next question
      setCurrentAnswer('');
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      // Clear current answer
      setCurrentAnswer('');
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    setIsEvaluating(true);
    
    try {
      // Combine all answers into a single text for evaluation
      const allAnswers = sampleQuestions
        .map((q) => answers[q.id] || '')
        .filter((answer) => answer.trim().length > 0)
        .join(' ');

      if (!allAnswers.trim()) {
        alert('Please answer at least one question before submitting.');
        setIsEvaluating(false);
        return;
      }

      const result = await evaluateAnswer(allAnswers);
      setTestResult(result);
      setTestState('results');

      // Update user's CEFR level in store
      if (user && result.level) {
        updateCefrLevel(result.level as 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2');
      }
    } catch (error) {
      console.error('Error evaluating test:', error);
      alert('Failed to evaluate test. Please try again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleRestartTest = () => {
    setTestState('not-started');
    setCurrentQuestionIndex(0);
    setAnswers({});
    setCurrentAnswer('');
    setTestResult(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Shift+Enter for new line, but don't submit on Enter alone
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Optionally move to next question on Enter
      // handleNextQuestion();
    }
  };

  if (testState === 'not-started') {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            CEFR Level Test
          </h1>
          <Card className="p-6">
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This test will help determine your English proficiency level according to the CEFR
              (Common European Framework of Reference) scale.
            </p>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You will be asked {sampleQuestions.length} open-ended questions. Answer them as
              naturally as possible. You can type your answers or use voice input.
            </p>
            <div className="flex gap-4">
              <Button onClick={handleStartTest} variant="primary">
                Start Test
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (testState === 'results') {
    return (
      <div className="py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Test Results
          </h1>
          {testResult && (
            <Card className="p-6 space-y-4">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
                  Your CEFR Level: {testResult.level}
                </h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  {testResult.explanation}
                </p>
              </div>
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button onClick={handleRestartTest} variant="primary">
                  Take Test Again
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            CEFR Level Test
          </h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600 dark:text-gray-400">
              Question {currentQuestionIndex + 1} of {sampleQuestions.length}
            </p>
            <div className="flex gap-2">
              {currentQuestionIndex > 0 && (
                <Button onClick={handlePreviousQuestion} variant="secondary" size="sm">
                  Previous
                </Button>
              )}
              <Button
                onClick={handleNextQuestion}
                variant="primary"
                size="sm"
                disabled={isEvaluating}
              >
                {isLastQuestion ? 'Submit' : 'Next'}
              </Button>
            </div>
          </div>
        </div>

        <Card className="p-6 space-y-4">
          {/* Question */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex-1">
                {currentQuestion.text}
              </h2>
              <Button
                onClick={handleListenQuestion}
                variant="ghost"
                size="icon"
                className="flex-shrink-0"
                title="Listen to question"
                aria-label="Listen to question"
              >
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
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
              </Button>
            </div>
          </div>

          {/* Answer Input */}
          <div className="space-y-3">
            <label
              htmlFor="answer"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              Your Answer
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  id="answer"
                  value={currentAnswer}
                  onChange={(e) => setCurrentAnswer(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={currentQuestion.placeholder || 'Type or speak your answer...'}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors resize-none"
                  rows={6}
                  style={{
                    minHeight: '120px',
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <VoiceButton
                  onText={handleVoiceText}
                  className="flex-shrink-0"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              You can type your answer or use the microphone button to speak your answer.
            </p>
          </div>

          {/* Progress indicator */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 dark:bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentQuestionIndex + 1) / sampleQuestions.length) * 100}%`,
                  }}
                />
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {Math.round(((currentQuestionIndex + 1) / sampleQuestions.length) * 100)}%
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LevelTest;
