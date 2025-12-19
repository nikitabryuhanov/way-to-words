import { Outlet } from 'react-router-dom';
import Header from '@/components/Header';

import { useLocation } from 'react-router-dom';

const Layout = () => {
  const location = useLocation();
  const isChatPage = location.pathname === '/chat';

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      {isChatPage ? (
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      ) : (
        <>
          <main className="flex-1 container mx-auto px-4 py-8 max-w-7xl">
            <Outlet />
          </main>
          <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-auto">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
              <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                <p>© 2025 Way to Words. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export default Layout;

