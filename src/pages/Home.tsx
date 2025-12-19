import { Link } from "react-router-dom";
import { useUserStore } from "../store/userStore";

const Home = () => {
  const { user } = useUserStore();

  const publicPages = [
    {
      to: "/login",
      title: "Login",
      description: "Войти в аккаунт",
      icon: "🔐",
      color: "bg-blue-500 hover:bg-blue-600",
    },
    {
      to: "/register",
      title: "Register",
      description: "Создать новый аккаунт",
      icon: "📝",
      color: "bg-green-500 hover:bg-green-600",
    },
  ];

  const protectedPages = [
    {
      to: "/dictionary",
      title: "Dictionary",
      description: "Поиск слов с определениями и CEFR уровнями",
      icon: "📚",
      color: "bg-purple-500 hover:bg-purple-600",
    },
    {
      to: "/test",
      title: "Level Test",
      description: "Тест на определение уровня английского",
      icon: "📊",
      color: "bg-orange-500 hover:bg-orange-600",
    },
    {
      to: "/chat",
      title: "Chat Bot",
      description: "Общение с AI-ботом для практики",
      icon: "💬",
      color: "bg-indigo-500 hover:bg-indigo-600",
    },
    {
      to: "/profile",
      title: "Profile",
      description: "Ваш профиль и статистика обучения",
      icon: "👤",
      color: "bg-pink-500 hover:bg-pink-600",
    },
  ];

  const pagesToShow = user ? protectedPages : [...publicPages, ...protectedPages];

  return (
    <div className="py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Welcome to Way to Words
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400">
          {user
            ? `Добро пожаловать, ${user.email}!`
            : "Изучайте английский язык с помощью современных инструментов"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pagesToShow.map((page) => {
          const isProtected = protectedPages.some((p) => p.to === page.to);
          const isAccessible = !isProtected || user;

          return (
            <Link
              key={page.to}
              to={page.to}
              className={`block ${page.color} rounded-lg shadow-md p-6 text-white transition-all duration-200 transform hover:scale-105 ${
                !isAccessible ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="text-4xl">{page.icon}</div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-2">{page.title}</h3>
                  <p className="text-white/90 text-sm">{page.description}</p>
                  {isProtected && !user && (
                    <p className="text-white/70 text-xs mt-2 italic">
                      Требуется авторизация
                    </p>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {user && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Быстрый доступ
          </h2>
          <div className="flex flex-wrap gap-3">
            {protectedPages.map((page) => (
              <Link
                key={page.to}
                to={page.to}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg transition-colors"
              >
                {page.title}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

