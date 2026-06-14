// TODO: Step 5 — habit list with checkmark rows, tabs (All/Active/Archived), FAB
import { useAuth } from '../hooks/useAuth'

export default function HabitList() {
  const { user, signOut } = useAuth()

  const name =
    user?.user_metadata?.first_name ??
    user?.user_metadata?.telegram_username ??
    user?.email ??
    'Unknown'

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-950 text-white">
      <p className="text-lg">Signed in as <span className="font-semibold">{name}</span></p>
      <p className="text-sm text-gray-400">Habit list coming in Step 5</p>
      <button
        onClick={signOut}
        className="mt-4 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-300 hover:bg-gray-700"
      >
        Sign out
      </button>
    </div>
  )
}
