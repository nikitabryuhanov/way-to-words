import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Dictionary from './pages/Dictionary'
import LevelTest from './pages/LevelTest'
import ChatBot from './pages/ChatBot'
import Profile from './pages/Profile'
import Login from './pages/Login'
import Register from './pages/Register'
import { subscribeToAuthChanges } from './services/auth'
import { useUserStore, mapFirebaseUser } from './store/userStore'

function App() {
  const { setUser, setLoading } = useUserStore()

  useEffect(() => {
    console.log('App useEffect running')
    try {
      const unsubscribe = subscribeToAuthChanges((firebaseUser) => {
        console.log('Auth state changed:', firebaseUser)
        const user = mapFirebaseUser(firebaseUser)
        setUser(user)
        setLoading(false)
      })

      return () => {
        console.log('Cleaning up auth subscription')
        unsubscribe()
      }
    } catch (error) {
      console.error('Auth subscription error:', error)
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty deps - only run once on mount

  console.log('App rendering')

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
      </Route>
    </Routes>
  )
}

export default App

