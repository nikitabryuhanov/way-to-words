import { describe, it, expect, beforeEach } from 'vitest';
import { useUserStore } from './userStore';
import type { User } from './userStore';

describe('userStore', () => {
  beforeEach(() => {
    // Reset store state before each test
    useUserStore.setState({
      user: null,
      loading: true,
    });
  });

  it('initializes with null user and loading true', () => {
    const state = useUserStore.getState();
    expect(state.user).toBeNull();
    expect(state.loading).toBe(true);
  });

  it('sets user correctly', () => {
    const mockUser: User = {
      uid: '123',
      email: 'test@example.com',
      cefrLevel: null,
      stats: {
        wordsLearned: 0,
        testsPassed: 0,
        chatsCount: 0,
      },
    };

    useUserStore.getState().setUser(mockUser);
    const state = useUserStore.getState();
    expect(state.user).toEqual(mockUser);
    expect(state.user?.email).toBe('test@example.com');
  });

  it('sets loading state correctly', () => {
    useUserStore.getState().setLoading(false);
    expect(useUserStore.getState().loading).toBe(false);

    useUserStore.getState().setLoading(true);
    expect(useUserStore.getState().loading).toBe(true);
  });

  it('updates CEFR level correctly', () => {
    const mockUser: User = {
      uid: '123',
      email: 'test@example.com',
      cefrLevel: null,
      stats: {
        wordsLearned: 0,
        testsPassed: 0,
        chatsCount: 0,
      },
    };

    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().updateCefrLevel('B1');

    const state = useUserStore.getState();
    expect(state.user?.cefrLevel).toBe('B1');
  });

  it('updates stats correctly', () => {
    const mockUser: User = {
      uid: '123',
      email: 'test@example.com',
      cefrLevel: null,
      stats: {
        wordsLearned: 0,
        testsPassed: 0,
        chatsCount: 0,
      },
    };

    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().updateStats({
      wordsLearned: 10,
      testsPassed: 5,
    });

    const state = useUserStore.getState();
    expect(state.user?.stats.wordsLearned).toBe(10);
    expect(state.user?.stats.testsPassed).toBe(5);
    expect(state.user?.stats.chatsCount).toBe(0); // Should remain unchanged
  });

  it('updates partial stats correctly', () => {
    const mockUser: User = {
      uid: '123',
      email: 'test@example.com',
      cefrLevel: 'A2',
      stats: {
        wordsLearned: 10,
        testsPassed: 5,
        chatsCount: 3,
      },
    };

    useUserStore.getState().setUser(mockUser);
    useUserStore.getState().updateStats({
      wordsLearned: 20,
    });

    const state = useUserStore.getState();
    expect(state.user?.stats.wordsLearned).toBe(20);
    expect(state.user?.stats.testsPassed).toBe(5); // Should remain unchanged
    expect(state.user?.stats.chatsCount).toBe(3); // Should remain unchanged
  });

  it('handles null user when updating CEFR level', () => {
    useUserStore.getState().setUser(null);
    useUserStore.getState().updateCefrLevel('B2');

    const state = useUserStore.getState();
    expect(state.user).toBeNull();
  });

  it('handles null user when updating stats', () => {
    useUserStore.getState().setUser(null);
    useUserStore.getState().updateStats({
      wordsLearned: 10,
    });

    const state = useUserStore.getState();
    expect(state.user).toBeNull();
  });
});

