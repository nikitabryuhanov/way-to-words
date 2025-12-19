/**
 * Web Speech API utilities for speech recognition and synthesis
 * Based on MDN Web Speech API documentation
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Web_Speech_API/Using_the_Web_Speech_API
 */

// Type definitions for Web Speech API
interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognition;
}

interface WindowWithSpeechRecognition extends Window {
  SpeechRecognition?: SpeechRecognitionConstructor;
  webkitSpeechRecognition?: SpeechRecognitionConstructor;
}

/**
 * Check browser support for Web Speech API
 */
export interface SpeechSupportStatus {
  recognition: boolean;
  synthesis: boolean;
}

/**
 * Check if the browser supports Web Speech API features
 * @returns Object indicating support for recognition and synthesis
 */
export function checkSpeechSupport(): SpeechSupportStatus {
  const win = window as WindowWithSpeechRecognition;
  
  const recognitionSupported =
    typeof win.SpeechRecognition !== 'undefined' ||
    typeof win.webkitSpeechRecognition !== 'undefined';
  
  const synthesisSupported = 'speechSynthesis' in window;

  return {
    recognition: recognitionSupported,
    synthesis: synthesisSupported,
  };
}

/**
 * Get SpeechRecognition constructor with vendor prefix support
 * @throws Error if SpeechRecognition is not supported
 */
function getSpeechRecognition(): SpeechRecognitionConstructor {
  const win = window as WindowWithSpeechRecognition;
  const SpeechRecognition =
    win.SpeechRecognition || win.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    throw new Error(
      'Speech Recognition API is not supported in this browser. ' +
        'Please use a modern browser like Chrome, Edge, or Safari.'
    );
  }

  return SpeechRecognition;
}

/**
 * Start speech recognition
 * @param onResult - Callback function called when speech is recognized
 * @param onEnd - Optional callback function called when recognition ends
 * @returns Function to stop recognition, or null if not supported
 * @throws Error if Speech Recognition is not supported
 */
export function startRecognition(
  onResult: (text: string) => void,
  onEnd?: () => void
): (() => void) | null {
  const support = checkSpeechSupport();
  
  if (!support.recognition) {
    throw new Error(
      'Speech Recognition API is not supported in this browser. ' +
        'Please use a modern browser like Chrome, Edge, or Safari.'
    );
  }

  try {
    const SpeechRecognition = getSpeechRecognition();
    const recognition = new SpeechRecognition();

    // Configure recognition settings
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    // Handle recognition results
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const result = event.results[event.resultIndex];
      const transcript = result[0].transcript.trim();
      
      if (transcript) {
        onResult(transcript);
      }
    };

    // Handle errors
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error:', event.error, event.message);
      
      // Don't throw for common errors that can be handled gracefully
      if (event.error === 'no-speech' || event.error === 'audio-capture') {
        // These are recoverable errors
        return;
      }
      
      // For other errors, we might want to notify the user
      if (onEnd) {
        onEnd();
      }
    };

    // Handle recognition end
    recognition.onend = () => {
      if (onEnd) {
        onEnd();
      }
    };

    // Start recognition
    recognition.start();

    // Return stop function
    return () => {
      try {
        recognition.stop();
      } catch (error) {
        // Recognition might already be stopped
        console.warn('Error stopping recognition:', error);
      }
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to initialize speech recognition');
  }
}

/**
 * Speak text using speech synthesis
 * @param text - Text to be spoken
 * @param options - Optional configuration for speech
 * @throws Error if Speech Synthesis is not supported
 */
export function speak(
  text: string,
  options?: {
    lang?: string;
    pitch?: number;
    rate?: number;
    volume?: number;
    voice?: SpeechSynthesisVoice | null;
  }
): void {
  const support = checkSpeechSupport();

  if (!support.synthesis) {
    throw new Error(
      'Speech Synthesis API is not supported in this browser. ' +
        'Please use a modern browser.'
    );
  }

  if (!text || text.trim().length === 0) {
    console.warn('Empty text provided to speak function');
    return;
  }

  try {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    // Create utterance
    const utterance = new SpeechSynthesisUtterance(text);

    // Set language (default to English)
    utterance.lang = options?.lang || 'en-US';

    // Set pitch (0 to 2, default 1)
    utterance.pitch = options?.pitch ?? 1;

    // Set rate (0.1 to 10, default 1)
    utterance.rate = options?.rate ?? 1;

    // Set volume (0 to 1, default 1)
    utterance.volume = options?.volume ?? 1;

    // Set voice if provided
    if (options?.voice) {
      utterance.voice = options.voice;
    } else {
      // Try to find an English voice by default
      const voices = window.speechSynthesis.getVoices();
      const englishVoice = voices.find(
        (voice) => voice.lang.startsWith('en') && voice.default
      ) || voices.find((voice) => voice.lang.startsWith('en'));

      if (englishVoice) {
        utterance.voice = englishVoice;
      }
    }

    // Speak
    window.speechSynthesis.speak(utterance);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to speak text: ${error.message}`);
    }
    throw new Error('Failed to speak text');
  }
}

/**
 * Stop any ongoing speech synthesis
 */
export function stopSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get available voices for speech synthesis
 * @returns Array of available voices
 */
export function getVoices(): SpeechSynthesisVoice[] {
  if (!('speechSynthesis' in window)) {
    return [];
  }

  return window.speechSynthesis.getVoices();
}

/**
 * Wait for voices to be loaded and return them
 * Some browsers load voices asynchronously
 * @returns Promise that resolves with available voices
 */
export function getVoicesAsync(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve([]);
      return;
    }

    const voices = window.speechSynthesis.getVoices();
    
    if (voices.length > 0) {
      resolve(voices);
      return;
    }

    // Wait for voices to load
    const onVoicesChanged = () => {
      const loadedVoices = window.speechSynthesis.getVoices();
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(loadedVoices);
    };

    window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
    
    // Fallback timeout
    setTimeout(() => {
      window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
      resolve(window.speechSynthesis.getVoices());
    }, 1000);
  });
}

/**
 * Check if speech synthesis is currently speaking
 * @returns True if speech is in progress
 */
export function isSpeaking(): boolean {
  if (!('speechSynthesis' in window)) {
    return false;
  }

  return window.speechSynthesis.speaking;
}

/**
 * Pause speech synthesis
 */
export function pauseSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.pause();
  }
}

/**
 * Resume paused speech synthesis
 */
export function resumeSpeaking(): void {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.resume();
  }
}

