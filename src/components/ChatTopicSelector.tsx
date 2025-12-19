export type ChatTopic = 'IT' | 'Study' | 'Travel' | 'Daily life' | 'Rest';

interface ChatTopicSelectorProps {
  activeTopic: ChatTopic | null;
  onChange: (topic: ChatTopic) => void;
}

const topics: ChatTopic[] = ['IT', 'Study', 'Travel', 'Daily life', 'Rest'];

const ChatTopicSelector = ({
  activeTopic,
  onChange,
}: ChatTopicSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300 self-center">
        Topic:
      </span>
      {topics.map((topic) => (
        <button
          key={topic}
          onClick={() => onChange(topic)}
          className={`
            px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800
            ${
              activeTopic === topic
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
        >
          {topic}
        </button>
      ))}
    </div>
  );
};

export default ChatTopicSelector;

