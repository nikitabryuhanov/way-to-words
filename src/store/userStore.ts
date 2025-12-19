import { create } from "zustand";
import type { User as FirebaseUser } from "@/services/auth";

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export interface UserStats {
  wordsLearned: number;
  testsPassed: number;
  chatsCount: number;
}

export interface User {
  uid: string;
  email: string;
  cefrLevel: CefrLevel | null;
  stats: UserStats;
}

interface UserState {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  updateCefrLevel: (level: CefrLevel | null) => void;
  updateStats: (stats: Partial<UserStats>) => void;
}

const defaultStats: UserStats = {
  wordsLearned: 0,
  testsPassed: 0,
  chatsCount: 0,
};

export const useUserStore = create<UserState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  updateCefrLevel: (level) =>
    set((state) => ({
      user: state.user ? { ...state.user, cefrLevel: level } : null,
    })),
  updateStats: (newStats) =>
    set((state) => ({
      user: state.user
        ? {
            ...state.user,
            stats: { ...state.user.stats, ...newStats },
          }
        : null,
    })),
}));

export const mapFirebaseUser = (firebaseUser: FirebaseUser | null): User | null => {
  if (!firebaseUser || !firebaseUser.email) {
    return null;
  }
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email,
    cefrLevel: null,
    stats: defaultStats,
  };
};

