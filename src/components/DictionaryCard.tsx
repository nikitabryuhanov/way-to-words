import { useState, useEffect, useRef } from "react";
import type { CefrLevel } from "@/store/userStore";
import { useWordStore, type WordStatus } from "@/store/wordStore";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

interface DictionaryCardProps {
  word: string;
  definition: string;
  cefrLevel: CefrLevel;
  audioUrl: string;
  example: string;
  partOfSpeech: string;
  phonic: string;
  paragraph: string;
  examples?: string[];
}

const DictionaryCard = ({
  word,
  definition,
  cefrLevel,
  audioUrl,
  example,
  partOfSpeech,
  phonic,
  paragraph,
  examples = [],
}: DictionaryCardProps) => {
  const { addWord, getWord, updateWordStatus, removeWord } = useWordStore();
  const savedWord = getWord(word);
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowStatusMenu(false);
      }
    };

    if (showStatusMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showStatusMenu]);

  const playAudio = () => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.play().catch((error) => {
        console.error("Error playing audio:", error);
      });
    }
  };

  const handleAddToDictionary = (status: WordStatus = "planned") => {
    addWord(
      {
        word,
        definition,
        examples: examples.length > 0 ? examples : [example],
        audioUrl,
        partOfSpeech,
        cefrLevel,
        phonic,
        paragraph,
      },
      status
    );
    setShowStatusMenu(false);
  };

  const handleStatusChange = (status: WordStatus) => {
    if (savedWord) {
      updateWordStatus(word, status);
    } else {
      handleAddToDictionary(status);
    }
    setShowStatusMenu(false);
  };

  const getStatusColor = (status: WordStatus): string => {
    switch (status) {
      case "learned":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300";
      case "learning":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300";
      case "planned":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  const getStatusLabel = (status: WordStatus): string => {
    switch (status) {
      case "learned":
        return "Выучено";
      case "learning":
        return "Учу";
      case "planned":
        return "В планах";
      default:
        return status;
    }
  };

  const getCefrColor = (level: CefrLevel): string => {
    if (level.startsWith("A")) {
      return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
    } else if (level.startsWith("B")) {
      return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
    } else {
      return "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700";
    }
  };

  return (
    <Card className="p-6" hover>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                {word}
              </h3>
              {phonic && (
                <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">
                  {phonic}
                </p>
              )}
            </div>
            {audioUrl && (
              <button
                onClick={playAudio}
                className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors flex-shrink-0"
                aria-label="Play pronunciation"
              >
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                  />
                </svg>
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400 italic">
              {partOfSpeech}
            </span>
            <span
              className={`px-2 py-1 rounded-md text-xs font-semibold border ${getCefrColor(
                cefrLevel
              )}`}
            >
              {cefrLevel}
            </span>
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
          {definition}
        </p>
      </div>

      {example && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
            Example:
          </p>
          <p className="text-gray-700 dark:text-gray-300 italic">
            "{example}"
          </p>
        </div>
      )}

      {paragraph && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
            About this word:
          </p>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
            {paragraph}
          </p>
        </div>
      )}

      {/* Add to Dictionary Section */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {savedWord ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Статус:
              </span>
              <span
                className={`px-3 py-1 rounded-md text-xs font-semibold ${getStatusColor(
                  savedWord.status
                )}`}
              >
                {getStatusLabel(savedWord.status)}
              </span>
            </div>
          ) : (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Не добавлено в словарь
            </span>
          )}
          
          <div className="relative" ref={menuRef}>
            <Button
              onClick={() => setShowStatusMenu(!showStatusMenu)}
              variant="primary"
              size="sm"
            >
              {savedWord ? "Изменить статус" : "Добавить в словарь"}
            </Button>
            
            {showStatusMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <div className="py-1">
                  {(["planned", "learning", "learned"] as WordStatus[]).map((status) => (
                    <button
                      key={status}
                      onClick={() => handleStatusChange(status)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                        savedWord?.status === status
                          ? "bg-blue-50 dark:bg-blue-900/20"
                          : ""
                      }`}
                    >
                      {getStatusLabel(status)}
                    </button>
                  ))}
                  {savedWord && (
                    <>
                      <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          removeWord(word);
                          setShowStatusMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        Удалить из словаря
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default DictionaryCard;

