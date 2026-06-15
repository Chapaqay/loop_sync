import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHabits, useProfile, useArchiveHabit } from '../hooks/useHabits'
import { useAuth } from '../hooks/useAuth'
import { habitColor } from '../lib/colors'
import type { Habit } from '../types'

type Tab = 'active' | 'archived'

export default function HabitList() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [tab, setTab] = useState<Tab>('active')
  const [menuOpen, setMenuOpen] = useState<string | null>(null)

  const { data: profile } = useProfile()
  const { data: habits = [], isLoading } = useHabits(tab === 'archived')
  const archiveMutation = useArchiveHabit()

  const displayName =
    profile?.first_name ?? profile?.telegram_username ?? 'You'

  return (
    <div className="flex min-h-screen flex-col bg-gray-950">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-widest">Loop Sync</p>
          <p className="text-base font-semibold text-white">{displayName}</p>
        </div>
        <button
          onClick={() => navigate('/settings')}
          className="p-2 text-gray-400 hover:text-white"
          aria-label="Settings"
        >
          ⚙
        </button>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        {(['active', 'archived'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium capitalize transition-colors ${
              tab === t
                ? 'text-white border-b-2 border-cyan-500'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* List */}
      <main className="flex-1 overflow-y-auto">
        {isLoading && (
          <p className="py-12 text-center text-sm text-gray-600">Loading…</p>
        )}

        {!isLoading && habits.length === 0 && (
          <div className="py-16 text-center">
            <p className="text-gray-600 text-sm">
              {tab === 'active'
                ? 'No habits yet — tap + to add one'
                : 'No archived habits'}
            </p>
          </div>
        )}

        {habits.map((habit) => (
          <HabitRow
            key={habit.id}
            habit={habit}
            menuOpen={menuOpen === habit.id}
            onOpen={() => navigate(`/habits/${habit.id}`)}
            onMenuToggle={() =>
              setMenuOpen(menuOpen === habit.id ? null : habit.id)
            }
            onEdit={() => {
              setMenuOpen(null)
              navigate(`/habits/${habit.id}/edit`)
            }}
            onArchiveToggle={() => {
              setMenuOpen(null)
              archiveMutation.mutate({ id: habit.id, archived: !habit.archived })
            }}
          />
        ))}
      </main>

      {/* FAB */}
      {tab === 'active' && (
        <button
          onClick={() => navigate('/habits/new')}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-cyan-500 text-white text-2xl shadow-lg flex items-center justify-center hover:bg-cyan-400 active:scale-95 transition-transform"
          aria-label="Add habit"
        >
          +
        </button>
      )}

      {/* Tap-away to close menu */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => setMenuOpen(null)}
        />
      )}
    </div>
  )
}

// ── Habit row ─────────────────────────────────────────────────────────────────

interface HabitRowProps {
  habit: Habit
  menuOpen: boolean
  onOpen: () => void
  onMenuToggle: () => void
  onEdit: () => void
  onArchiveToggle: () => void
}

function HabitRow({ habit, menuOpen, onOpen, onMenuToggle, onEdit, onArchiveToggle }: HabitRowProps) {
  const color = habitColor(habit.color)

  return (
    <div
      className="relative flex items-center gap-3 px-4 py-3 border-b border-gray-900 active:bg-gray-900 cursor-pointer"
      onClick={onOpen}
    >
      {/* Color stripe */}
      <div
        className="w-1 self-stretch rounded-full flex-shrink-0"
        style={{ backgroundColor: color }}
      />

      {/* Name + frequency */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{habit.name}</p>
        <p className="text-xs text-gray-600 mt-0.5">
          {habit.freq_num === 1 && habit.freq_den === 1
            ? 'Daily'
            : `${habit.freq_num}× every ${habit.freq_den} days`}
        </p>
      </div>

      {/* Checkmark placeholders — Step 6 */}
      <div className="flex gap-1.5 items-center">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full border border-gray-800 bg-gray-900"
          />
        ))}
      </div>

      {/* Kebab menu button */}
      <button
        className="p-1 text-gray-600 hover:text-gray-300 z-20"
        onClick={(e) => {
          e.stopPropagation()
          onMenuToggle()
        }}
        aria-label="More options"
      >
        ⋮
      </button>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-4 top-10 z-30 w-40 rounded-lg border border-gray-800 bg-gray-900 shadow-xl overflow-hidden">
          <button
            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800"
            onClick={(e) => { e.stopPropagation(); onEdit() }}
          >
            Edit
          </button>
          <button
            className="w-full px-4 py-2.5 text-left text-sm text-gray-300 hover:bg-gray-800"
            onClick={(e) => { e.stopPropagation(); onArchiveToggle() }}
          >
            {habit.archived ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      )}
    </div>
  )
}
