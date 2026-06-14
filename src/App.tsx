import { Routes, Route } from 'react-router-dom'
import HabitList from './pages/HabitList'
import HabitDetail from './pages/HabitDetail'
import HabitForm from './pages/HabitForm'
import Settings from './pages/Settings'

// TODO: wrap with AuthProvider once auth is wired (Step 4)
export default function App() {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Routes>
        <Route path="/" element={<HabitList />} />
        <Route path="/habit/:id" element={<HabitDetail />} />
        <Route path="/habit/new" element={<HabitForm />} />
        <Route path="/habit/:id/edit" element={<HabitForm />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </div>
  )
}
