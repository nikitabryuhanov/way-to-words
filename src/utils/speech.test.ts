import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { checkSpeechSupport } from './speech';

describe('speech.ts', () => {
  describe('checkSpeechSupport', () => {
    const originalWindow = global.window;

    beforeEach(() => {
      // Reset window object
      global.window = { ...originalWindow } as Window & typeof globalThis;
    });

    afterEach(() => {
      global.window = originalWindow;
    });

    it('should return recognition: true when SpeechRecognition is available', () => {
      // Mock SpeechRecognition
      global.window.SpeechRecognition = class {} as any;
      global.window.speechSynthesis = {} as any;

      const support = checkSpeechSupport();

      expect(support.recognition).toBe(true);
      expect(support.synthesis).toBe(true);
    });

    it('should return recognition: true when webkitSpeechRecognition is available', () => {
      // Mock webkitSpeechRecognition
      global.window.webkitSpeechRecognition = class {} as any;
      global.window.speechSynthesis = {} as any;

      const support = checkSpeechSupport();

      expect(support.recognition).toBe(true);
      expect(support.synthesis).toBe(true);
    });

    it('should return recognition: false when neither SpeechRecognition nor webkitSpeechRecognition is available', () => {
      // Remove both recognition APIs
      delete (global.window as any).SpeechRecognition;
      delete (global.window as any).webkitSpeechRecognition;
      global.window.speechSynthesis = {} as any;

      const support = checkSpeechSupport();

      expect(support.recognition).toBe(false);
      expect(support.synthesis).toBe(true);
    });

    it('should return synthesis: false when speechSynthesis is not available', () => {
      global.window.SpeechRecognition = class {} as any;
      delete (global.window as any).speechSynthesis;

      const support = checkSpeechSupport();

      expect(support.recognition).toBe(true);
      expect(support.synthesis).toBe(false);
    });

    it('should return both false when neither API is available', () => {
      delete (global.window as any).SpeechRecognition;
      delete (global.window as any).webkitSpeechRecognition;
      delete (global.window as any).speechSynthesis;

      const support = checkSpeechSupport();

      expect(support.recognition).toBe(false);
      expect(support.synthesis).toBe(false);
    });
  });
});

