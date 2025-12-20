/**
 * Tests for levelTestAPI service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { evaluateAnswer, type CefrLevel } from '../levelTestAPI';

// Mock fetch globally
global.fetch = vi.fn();

describe('levelTestAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('evaluateAnswer should successfully evaluate an answer and return level and explanation', async () => {
    const mockAnswer = 'I like to read books and watch movies in English.';

    const mockResponse = {
      level: 'B1',
      explanation: 'Your answer demonstrates intermediate English skills.',
      timestamp: '2025-01-20T12:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await evaluateAnswer(mockAnswer);

    expect(result.level).toBe('B1');
    expect(result.explanation).toBe(mockResponse.explanation);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/evaluate'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: mockAnswer }),
      })
    );
  });

  it('evaluateAnswer should handle HTTP errors', async () => {
    const mockAnswer = 'Test answer';

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal server error' }),
    });

    await expect(evaluateAnswer(mockAnswer)).rejects.toThrow('Internal server error');
  });

  it('evaluateAnswer should handle network errors', async () => {
    const mockAnswer = 'Test answer';

    (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(evaluateAnswer(mockAnswer)).rejects.toThrow('Network error');
  });

  it('evaluateAnswer should validate CEFR level', async () => {
    const mockAnswer = 'Test answer';

    const mockResponse = {
      level: 'INVALID',
      explanation: 'Some explanation',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    await expect(evaluateAnswer(mockAnswer)).rejects.toThrow('Invalid CEFR level');
  });

  it('evaluateAnswer should handle missing fields in response', async () => {
    const mockAnswer = 'Test answer';

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ level: 'B1' }), // Missing explanation
    });

    await expect(evaluateAnswer(mockAnswer)).rejects.toThrow('Invalid response format');
  });

  it('evaluateAnswer should accept all valid CEFR levels', async () => {
    const validLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const mockAnswer = 'Test answer';

    for (const level of validLevels) {
      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          level,
          explanation: `Explanation for ${level}`,
        }),
      });

      const result = await evaluateAnswer(mockAnswer);
      expect(result.level).toBe(level);
    }
  });
});

