import { useEffect, lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import Home from '@/pages/Home'
import Dictionary from '@/pages/Dictionary'
import LevelTest from '@/pages/LevelTest'
import ChatBot from '@/pages/ChatBot'
import Profile from '@/pages/Profile'
import Login from '@/pages/Login'
import Register from '@/pages/Register'
import { subscribeToAuthChanges } from '@/services/auth'
import { useUserStore, mapFirebaseUser } from '@/store/userStore'

// Import SpeechTest only in development
const SpeechTest = import.meta.env.DEV
  ? lazy(() => import('@/pages/SpeechTest'))
  : null

function App() {
  const { setUser, setLoading } = useUserStore()

  useEffect(() => {
    try {
      const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
        const user = mapFirebaseUser(firebaseUser)
        setUser(user)
        setLoading(false)
      })

      return () => {
        unsubscribe()
      }
    } catch (error) {
      console.error('Auth subscription error:', error)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once on mount

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route
          path="dictionary"
          element={
            <ProtectedRoute>
              <Dictionary />
            </ProtectedRoute>
          }
        />
        <Route
          path="test"
          element={
            <ProtectedRoute>
              <LevelTest />
            </ProtectedRoute>
          }
        />
        <Route
          path="chat"
          element={
            <ProtectedRoute>
              <ChatBot />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        {import.meta.env.DEV && SpeechTest && (
          <Route
            path="speech-test"
            element={
              <Suspense
                fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="text-lg text-gray-600 dark:text-gray-400">
                      Loading...
                    </div>
                  </div>
                }
              >
                <SpeechTest />
              </Suspense>
            }
          />
        )}
      </Route>
    </Routes>
  )
}

export default App

