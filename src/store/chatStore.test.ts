import { describe, it, expect, beforeEach } from 'vitest';
import { useChatStore } from './chatStore';
import { act } from '@testing-library/react';

describe('chatStore', () => {
  beforeEach(() => {
    // Reset store before each test
    useChatStore.setState({
      messages: [
        {
          id: '1',
          author: 'bot',
          text: "Hello! I'm your English learning assistant. Choose a topic to start our conversation!",
          time: '12:00 PM',
        },
      ],
      topic: null,
    });
  });

  it('should initialize with default bot message', () => {
    const { messages, topic } = useChatStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].author).toBe('bot');
    expect(topic).toBeNull();
  });

  it('addUserMessage should add a user message', () => {
    act(() => {
      useChatStore.getState().addUserMessage('Hello!');
    });

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[1].author).toBe('user');
    expect(messages[1].text).toBe('Hello!');
    expect(messages[1].id).toBeDefined();
    expect(messages[1].time).toBeDefined();
  });

  it('addBotMessage should add a bot message', () => {
    act(() => {
      useChatStore.getState().addBotMessage('Hi there!');
    });

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(2);
    expect(messages[1].author).toBe('bot');
    expect(messages[1].text).toBe('Hi there!');
    expect(messages[1].id).toBeDefined();
    expect(messages[1].time).toBeDefined();
  });

  it('setTopic should update the topic', () => {
    act(() => {
      useChatStore.getState().setTopic('IT');
    });

    const { topic } = useChatStore.getState();
    expect(topic).toBe('IT');
  });

  it('setTopic should set topic to null', () => {
    act(() => {
      useChatStore.getState().setTopic('IT');
      useChatStore.getState().setTopic(null);
    });

    const { topic } = useChatStore.getState();
    expect(topic).toBeNull();
  });

  it('clearChat should reset messages and topic', () => {
    act(() => {
      useChatStore.getState().addUserMessage('Test');
      useChatStore.getState().addBotMessage('Response');
      useChatStore.getState().setTopic('IT');
      useChatStore.getState().clearChat();
    });

    const { messages, topic } = useChatStore.getState();
    expect(messages).toHaveLength(1);
    expect(messages[0].author).toBe('bot');
    expect(topic).toBeNull();
  });

  it('should maintain message order when adding multiple messages', () => {
    act(() => {
      useChatStore.getState().addUserMessage('First');
      useChatStore.getState().addBotMessage('Second');
      useChatStore.getState().addUserMessage('Third');
    });

    const { messages } = useChatStore.getState();
    expect(messages).toHaveLength(4); // 1 initial + 3 new
    expect(messages[1].text).toBe('First');
    expect(messages[2].text).toBe('Second');
    expect(messages[3].text).toBe('Third');
  });
});

