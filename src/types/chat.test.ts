import { describe, it, expect } from 'vitest';
import { formatMessage, formatMessages } from './chat';

describe('chat types', () => {
  describe('formatMessage', () => {
    it('should format a user message with timestamp', () => {
      const message = formatMessage('user', 'Hello, world!');

      expect(message.author).toBe('user');
      expect(message.text).toBe('Hello, world!');
      expect(message.id).toBeDefined();
      expect(message.time).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
    });

    it('should format a bot message with timestamp', () => {
      const message = formatMessage('bot', 'Hi there!');

      expect(message.author).toBe('bot');
      expect(message.text).toBe('Hi there!');
      expect(message.id).toBeDefined();
      expect(message.time).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
    });

    it('should use provided id when given', () => {
      const customId = 'custom-id-123';
      const message = formatMessage('user', 'Test', customId);

      expect(message.id).toBe(customId);
    });

    it('should generate unique ids for different messages', () => {
      const message1 = formatMessage('user', 'First');
      // Add small delay to ensure different timestamp
      return new Promise((resolve) => {
        setTimeout(() => {
          const message2 = formatMessage('user', 'Second');
          expect(message1.id).not.toBe(message2.id);
          resolve(undefined);
        }, 1);
      });
    });
  });

  describe('formatMessages', () => {
    it('should format multiple messages with timestamps', () => {
      const messages = formatMessages([
        { author: 'user', text: 'Hello' },
        { author: 'bot', text: 'Hi there!' },
        { author: 'user', text: 'How are you?' },
      ]);

      expect(messages).toHaveLength(3);
      expect(messages[0].author).toBe('user');
      expect(messages[0].text).toBe('Hello');
      expect(messages[1].author).toBe('bot');
      expect(messages[1].text).toBe('Hi there!');
      expect(messages[2].author).toBe('user');
      expect(messages[2].text).toBe('How are you?');

      // All messages should have valid timestamps
      messages.forEach((msg) => {
        expect(msg.time).toMatch(/^\d{1,2}:\d{2}\s(AM|PM)$/);
        expect(msg.id).toBeDefined();
      });
    });

    it('should handle empty array', () => {
      const messages = formatMessages([]);

      expect(messages).toHaveLength(0);
    });

    it('should generate unique ids for each message', () => {
      const messages = formatMessages([
        { author: 'user', text: 'First' },
        { author: 'user', text: 'Second' },
        { author: 'user', text: 'Third' },
      ]);

      const ids = messages.map((m) => m.id);
      const uniqueIds = new Set(ids);

      // All IDs should be unique
      expect(uniqueIds.size).toBe(ids.length);
    });
  });
});

