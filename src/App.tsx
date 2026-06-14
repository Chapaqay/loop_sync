import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { useAuth } from './hooks/useAuth'
import HabitList from './pages/HabitList'
import HabitDetail from './pages/HabitDetail'
import HabitForm from './pages/HabitForm'
import Settings from './pages/Settings'
import SignIn from './pages/SignIn'

function AuthGate({ children }: { children: React.ReactNode }) {
  const { session, loading, error } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <p className="text-sm text-gray-400">Loading…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950 p-8">
        <p className="text-sm text-red-400">Auth error: {error}</p>
      </div>
    )
  }

  if (!session) return <SignIn />

  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-950 text-gray-100">
        <AuthGate>
          <Routes>
            <Route path="/" element={<HabitList />} />
            <Route path="/habit/:id" element={<HabitDetail />} />
            <Route path="/habit/new" element={<HabitForm />} />
            <Route path="/habit/:id/edit" element={<HabitForm />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AuthGate>
      </div>
    </AuthProvider>
  )
}
