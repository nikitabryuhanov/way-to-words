import { useState, FormEvent } from "react";
import { searchWord } from "../services/dictionaryAPI";
import type { DictionaryResult } from "../services/dictionaryAPI";
import DictionaryCard from "../components/DictionaryCard";
import type { CefrLevel } from "../store/userStore";
import { useWordStore, type WordStatus } from "../store/wordStore";

type TabType = "search" | "my-words";

const Dictionary = () => {
  const [activeTab, setActiveTab] = useState<TabType>("search");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DictionaryResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cefrFilter, setCefrFilter] = useState<CefrLevel | "All">("All");
  const [statusFilter, setStatusFilter] = useState<WordStatus | "All">("All");
  
  const { words, getWordsByStatus, removeWord, updateWordStatus } = useWordStore();

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setError("Please enter a word to search");
      return;
    }

    setLoading(true);
    setError(null);
    setResults([]);

    try {
      const data = await searchWord(query.trim());
      setResults(data);
      if (data.length === 0) {
        setError("Word not found");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to search word";
      setError(errorMessage);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter((result) => {
    if (cefrFilter === "All") return true;
    return result.cefrLevel === cefrFilter;
  });

  const cefrOptions: (CefrLevel | "All")[] = ["All", "A1", "A2", "B1", "B2", "C1", "C2"];
  const statusOptions: (WordStatus | "All")[] = ["All", "planned", "learning", "learned"];

  // Filter personal words
  const filteredPersonalWords = words.filter((word) => {
    if (statusFilter !== "All" && word.status !== statusFilter) return false;
    if (cefrFilter !== "All" && word.cefrLevel !== cefrFilter) return false;
    return true;
  });

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

  const getStatusColor = (status: WordStatus): string => {
    switch (status) {
      case "learned":
        return "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700";
      case "learning":
        return "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700";
      case "planned":
        return "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-300 dark:border-yellow-700";
      default:
        return "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300";
    }
  };

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Dictionary
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Search for word definitions with CEFR levels
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex space-x-8">
          <button
            onClick={() => setActiveTab("search")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "search"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            Search
          </button>
          <button
            onClick={() => setActiveTab("my-words")}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === "my-words"
                ? "border-blue-500 text-blue-600 dark:text-blue-400"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300"
            }`}
          >
            My Words ({words.length})
          </button>
        </nav>
      </div>

      {/* Search Tab Content */}
      {activeTab === "search" && (
        <>
          {/* Search Form */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter a word to search..."
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                disabled={loading}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          {/* CEFR Filter */}
          {results.length > 0 && (
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Filter by CEFR:
              </label>
              <select
                value={cefrFilter}
                onChange={(e) => setCefrFilter(e.target.value as CefrLevel | "All")}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
              >
                {cefrOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <svg
              className="w-5 h-5 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-red-700 dark:text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && filteredResults.length > 0 && (
        <div className="space-y-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Found {filteredResults.length} definition{filteredResults.length !== 1 ? "s" : ""}
            {cefrFilter !== "All" && ` (filtered by ${cefrFilter})`}
          </div>
          <div className="grid grid-cols-1 gap-4">
            {filteredResults.map((result, index) => (
              <DictionaryCard
                key={`${result.word}-${index}`}
                word={result.word}
                definition={result.definition}
                cefrLevel={result.cefrLevel}
                audioUrl={result.audioUrl}
                example={result.examples[0] || ""}
                partOfSpeech={result.partOfSpeech}
                phonic={result.phonic}
                paragraph={result.paragraph}
                examples={result.examples}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && results.length === 0 && query && (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            No results found. Try searching for a different word.
          </p>
        </div>
      )}
        </>
      )}

      {/* My Words Tab Content */}
      {activeTab === "my-words" && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by Status:
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as WordStatus | "All")}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                >
                  {statusOptions.map((option) => (
                    <option key={option} value={option}>
                      {option === "All" ? "All" : getStatusLabel(option as WordStatus)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by CEFR:
                </label>
                <select
                  value={cefrFilter}
                  onChange={(e) => setCefrFilter(e.target.value as CefrLevel | "All")}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors"
                >
                  {cefrOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Words List */}
          {filteredPersonalWords.length > 0 ? (
            <div className="space-y-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                Found {filteredPersonalWords.length} word{filteredPersonalWords.length !== 1 ? "s" : ""}
                {statusFilter !== "All" && ` (${getStatusLabel(statusFilter as WordStatus)})`}
                {cefrFilter !== "All" && ` (CEFR: ${cefrFilter})`}
              </div>
              <div className="grid grid-cols-1 gap-4">
                {filteredPersonalWords.map((word) => (
                  <div
                    key={word.word}
                    className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
                  >
                    <DictionaryCard
                      word={word.word}
                      definition={word.definition}
                      cefrLevel={word.cefrLevel}
                      audioUrl={word.audioUrl}
                      example={word.examples[0] || ""}
                      partOfSpeech={word.partOfSpeech}
                      phonic={word.phonic}
                      paragraph={word.paragraph}
                      examples={word.examples}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {words.length === 0
                  ? "Your personal dictionary is empty. Search for words and add them to your dictionary!"
                  : "No words found with the selected filters."}
              </p>
              {words.length === 0 && (
                <button
                  onClick={() => setActiveTab("search")}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors"
                >
                  Go to Search
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Dictionary;


