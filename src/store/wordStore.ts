import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CefrLevel } from "@/store/userStore";

export type WordStatus = "learned" | "learning" | "planned";

export interface PersonalWord {
  word: string;
  definition: string;
  examples: string[];
  audioUrl: string;
  partOfSpeech: string;
  cefrLevel: CefrLevel;
  phonic: string;
  paragraph: string;
  status: WordStatus;
  addedAt: number; // timestamp
}

interface WordState {
  words: PersonalWord[];
  addWord: (word: Omit<PersonalWord, "addedAt" | "status">, status?: WordStatus) => void;
  removeWord: (word: string) => void;
  updateWordStatus: (word: string, status: WordStatus) => void;
  getWord: (word: string) => PersonalWord | undefined;
  getWordsByStatus: (status: WordStatus) => PersonalWord[];
  getWordsCount: () => number;
}

export const useWordStore = create<WordState>()(
  persist(
    (set, get) => ({
      words: [],
      
      addWord: (wordData, status = "planned") => {
        const existingWord = get().words.find((w) => w.word === wordData.word);
        if (existingWord) {
          // Если слово уже есть, обновляем его
          set((state) => ({
            words: state.words.map((w) =>
              w.word === wordData.word
                ? { ...w, ...wordData, status, addedAt: Date.now() }
                : w
            ),
          }));
        } else {
          // Добавляем новое слово
          set((state) => ({
            words: [
              ...state.words,
              {
                ...wordData,
                status,
                addedAt: Date.now(),
              },
            ],
          }));
        }
      },
      
      removeWord: (word) => {
        set((state) => ({
          words: state.words.filter((w) => w.word !== word),
        }));
      },
      
      updateWordStatus: (word, status) => {
        set((state) => ({
          words: state.words.map((w) =>
            w.word === word ? { ...w, status } : w
          ),
        }));
      },
      
      getWord: (word) => {
        return get().words.find((w) => w.word === word);
      },
      
      getWordsByStatus: (status) => {
        return get().words.filter((w) => w.status === status);
      },
      
      getWordsCount: () => {
        return get().words.length;
      },
    }),
    {
      name: "personal-words-storage",
    }
  )
);

