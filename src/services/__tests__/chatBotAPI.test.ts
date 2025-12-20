/**
 * Tests for chatBotAPI service
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { sendChatMessage, type ChatRequest } from '../chatBotAPI';

// Mock fetch globally
global.fetch = vi.fn();

describe('chatBotAPI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('sendChatMessage should successfully send a message and return reply', async () => {
    const mockRequest: ChatRequest = {
      message: 'Hello!',
      topic: 'IT',
      cefrLevel: 'B1',
      history: [],
    };

    const mockResponse = {
      reply: 'Hello! How can I help you learn English today?',
      timestamp: '2025-01-20T12:00:00.000Z',
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await sendChatMessage(mockRequest);

    expect(result).toBe(mockResponse.reply);
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/chat'),
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockRequest),
      })
    );
  });

  it('sendChatMessage should handle HTTP errors', async () => {
    const mockRequest: ChatRequest = {
      message: 'Hello!',
      topic: 'IT',
      cefrLevel: 'B1',
      history: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal server error' }),
    });

    await expect(sendChatMessage(mockRequest)).rejects.toThrow('Internal server error');
  });

  it('sendChatMessage should handle network errors', async () => {
    const mockRequest: ChatRequest = {
      message: 'Hello!',
      topic: 'IT',
      cefrLevel: 'B1',
      history: [],
    };

    (global.fetch as any).mockRejectedValueOnce(new TypeError('Failed to fetch'));

    await expect(sendChatMessage(mockRequest)).rejects.toThrow('Network error');
  });

  it('sendChatMessage should handle timeout', async () => {
    const mockRequest: ChatRequest = {
      message: 'Hello!',
      topic: 'IT',
      cefrLevel: 'B1',
      history: [],
    };

    // Mock a fetch that never resolves (simulating timeout)
    (global.fetch as any).mockImplementationOnce(
      () => new Promise(() => {}) // Never resolves
    );

    // Use vi.useFakeTimers to test timeout
    vi.useFakeTimers();
    
    const promise = sendChatMessage(mockRequest);
    
    // Fast-forward time to trigger timeout
    vi.advanceTimersByTime(20000);
    
    await expect(promise).rejects.toThrow('Request timeout');
    
    vi.useRealTimers();
  });

  it('sendChatMessage should handle invalid response format', async () => {
    const mockRequest: ChatRequest = {
      message: 'Hello!',
      topic: 'IT',
      cefrLevel: 'B1',
      history: [],
    };

    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: 'No reply field' }),
    });

    await expect(sendChatMessage(mockRequest)).rejects.toThrow('Invalid response format');
  });
});

