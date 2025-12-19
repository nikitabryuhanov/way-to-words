import type { CefrLevel } from "@/store/userStore";

export interface WordDefinition {
  pos: string;
  definition: string;
  cefr: CefrLevel;
  example: string;
}

export interface DictionaryWord {
  word: string;
  definitions: WordDefinition[];
  phonic: string;
  audio: string;
  paragraph: string;
}

export interface DictionaryResult {
  word: string;
  definition: string;
  examples: string[];
  audioUrl: string;
  partOfSpeech: string;
  cefrLevel: CefrLevel;
  phonic: string;
  paragraph: string;
}

// Use proxy in development, direct URL in production
const API_URL = import.meta.env.DEV 
  ? "/api/dictionary"
  : (import.meta.env.VITE_DICTIONARY_API_URL || "https://en.dictionary-api.com/v1");

export const searchWord = async (query: string): Promise<DictionaryResult[]> => {
  if (!query || query.trim().length === 0) {
    throw new Error("Query cannot be empty");
  }

  const normalizedQuery = query.trim().toLowerCase();
  const url = `${API_URL}/${normalizedQuery}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });


    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Word not found");
      }
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Проверяем, что данные есть и это массив
    if (!data) {
      throw new Error("Word not found");
    }

    // API может вернуть массив или один объект
    const wordsArray = Array.isArray(data) ? data : [data];

    if (wordsArray.length === 0) {
      throw new Error("Word not found");
    }

    // Преобразуем данные API в наш формат
    const results: DictionaryResult[] = [];

    wordsArray.forEach((wordData: any) => {
      // Проверяем наличие обязательных полей
      if (!wordData || !wordData.word) {
        return; // Пропускаем некорректные данные
      }

      // Проверяем наличие definitions
      const definitions = wordData.definitions || [];
      
      if (!Array.isArray(definitions) || definitions.length === 0) {
        // Если нет определений, создаем одно из доступных данных
        results.push({
          word: wordData.word || "",
          definition: wordData.definition || wordData.paragraph || "No definition available",
          examples: wordData.example ? [wordData.example] : [],
          audioUrl: wordData.audio || "",
          partOfSpeech: wordData.pos || wordData.partOfSpeech || "unknown",
          cefrLevel: wordData.cefr || "A1",
          phonic: wordData.phonic || "",
          paragraph: wordData.paragraph || "",
        });
        return;
      }

      // Обрабатываем каждое определение
      definitions.forEach((def: any) => {
        if (!def) return;
        
        results.push({
          word: wordData.word,
          definition: def.definition || "",
          examples: def.example ? [def.example] : [],
          audioUrl: wordData.audio || "",
          partOfSpeech: def.pos || "",
          cefrLevel: def.cefr || "A1",
          phonic: wordData.phonic || "",
          paragraph: wordData.paragraph || "",
        });
      });
    });

    if (results.length === 0) {
      throw new Error("Word not found or no definitions available");
    }

    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Failed to fetch word definition");
  }
};

