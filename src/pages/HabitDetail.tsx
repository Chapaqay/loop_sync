// Step 8 — full detail with charts. For now: name + back button.
import { useNavigate, useParams } from 'react-router-dom'
import { useHabit } from '../hooks/useHabits'

export default function HabitDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: habit, isLoading } = useHabit(id ?? '')

  return (
    <div className="flex min-h-screen flex-col bg-gray-950 text-white">
      <header className="flex items-center gap-3 px-4 py-3 border-b border-gray-800">
        <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white text-lg">
          ←
        </button>
        <p className="font-semibold">
          {isLoading ? '…' : (habit?.name ?? 'Habit detail')}
        </p>
      </header>
      <div className="flex-1 flex items-center justify-center">
        <p className="text-gray-600 text-sm">Full detail coming in Step 8</p>
      </div>
    </div>
  )
}
