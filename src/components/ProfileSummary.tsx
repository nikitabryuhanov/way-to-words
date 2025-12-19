import { useUserStore } from "../store/userStore";

const ProfileSummary = () => {
  const { user } = useUserStore();

  if (!user) {
    return null;
  }

  const cefrLevelDisplay = user.cefrLevel || "Not tested yet";
  const cefrLevelColor = user.cefrLevel
    ? user.cefrLevel.startsWith("A")
      ? "text-green-600 dark:text-green-400"
      : user.cefrLevel.startsWith("B")
      ? "text-blue-600 dark:text-blue-400"
      : "text-purple-600 dark:text-purple-400"
    : "text-gray-500 dark:text-gray-400";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Profile Summary
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{user.email}</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            CEFR Level:
          </span>
          <span className={`text-lg font-semibold ${cefrLevelColor}`}>
            {cefrLevelDisplay}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Words Learned
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.stats.wordsLearned}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Tests Passed
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.stats.testsPassed}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Chats Count
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {user.stats.chatsCount}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSummary;

