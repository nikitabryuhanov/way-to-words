import { useEffect, useState, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, RadialBarChart, RadialBar } from "recharts";
import { useUserStore } from "@/store/userStore";
import { useWordStore } from "@/store/wordStore";
import ProfileSummary from "@/components/ProfileSummary";

const Profile = () => {
  const { user, updateStats } = useUserStore();
  const { words, getWordsByStatus } = useWordStore();
  const [isDark, setIsDark] = useState(false);

  // Memoize learned words count to prevent unnecessary recalculations
  const learnedWordsCount = useMemo(() => {
    return words.filter(w => w.status === "learned").length;
  }, [words]);

  useEffect(() => {
    const checkDarkMode = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkDarkMode();
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  // Update stats based on real data from word store
  useEffect(() => {
    if (!user) return;
    
    // Only update if the count actually changed to prevent infinite loops
    if (user.stats.wordsLearned !== learnedWordsCount) {
      updateStats({
        wordsLearned: learnedWordsCount,
        // testsPassed and chatsCount пока остаются mock, можно обновить позже
        testsPassed: user.stats.testsPassed || 0,
        chatsCount: user.stats.chatsCount || 0,
      });
    }
    // updateStats is stable from Zustand, but we exclude it to be safe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, learnedWordsCount]);

  if (!user) {
    return null;
  }

  const barChartData = [
    {
      name: "Words",
      value: user.stats.wordsLearned,
    },
    {
      name: "Tests",
      value: user.stats.testsPassed,
    },
    {
      name: "Chats",
      value: user.stats.chatsCount,
    },
  ];

  const radialChartData = [
    {
      name: "Progress",
      value: Math.min(
        ((user.stats.wordsLearned + user.stats.testsPassed * 10 + user.stats.chatsCount * 5) / 500) * 100,
        100
      ),
      fill: "#3b82f6",
    },
  ];

  return (
    <div className="py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Profile
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Your learning progress and statistics
        </p>
      </div>

      {/* Profile Summary Card */}
      <ProfileSummary />

      {/* Statistics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Statistics Overview
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barChartData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#374151" : "#e5e7eb"}
              />
              <XAxis
                dataKey="name"
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                tick={{ fill: isDark ? "#d1d5db" : "#374151" }}
              />
              <YAxis
                stroke={isDark ? "#9ca3af" : "#6b7280"}
                tick={{ fill: isDark ? "#d1d5db" : "#374151" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "rgba(255, 255, 255, 0.95)",
                  border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: isDark ? "#f3f4f6" : "#111827",
                }}
                itemStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
                labelStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
              />
              <Legend
                wrapperStyle={{ color: isDark ? "#d1d5db" : "#374151" }}
              />
              <Bar
                dataKey="value"
                fill="#3b82f6"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Radial Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Overall Progress
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="60%"
              outerRadius="90%"
              data={radialChartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                label={{ position: "insideStart", fill: "#fff" }}
                background
                dataKey="value"
                cornerRadius={10}
                fill="#3b82f6"
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, "Progress"]}
                contentStyle={{
                  backgroundColor: isDark ? "#1f2937" : "rgba(255, 255, 255, 0.95)",
                  border: isDark ? "1px solid #374151" : "1px solid #e5e7eb",
                  borderRadius: "8px",
                  color: isDark ? "#f3f4f6" : "#111827",
                }}
                itemStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
                labelStyle={{ color: isDark ? "#f3f4f6" : "#111827" }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Overall Learning Progress
            </p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
              {radialChartData[0].value.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;


