import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format, subDays } from 'date-fns'
import { useHabits, useArchiveHabit, useProfile } from '../hooks/useHabits'
import { useEntriesForDays } from '../hooks/useEntries'
import { habitColor } from '../lib/colors'
import { ENTRY, NUMERIC_SCALE } from '../lib/core/entry'
import type { Habit, Entry } from '../types'

// 5 days ending today, newest-right (today is the rightmost column)
function useDays() {
  const today = new Date()
  return useMemo(
    () => Array.from({ length: 5 }, (_, i) => subDays(today, 4 - i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [today.toDateString()],
  )
}

export default function HabitList() {
  const navigate = useNavigate()
  const [menuHabitId, setMenuHabitId] = useState<string | null>(null)

  const days = useDays()
  const dayStrings = days.map((d) => format(d, 'yyyy-MM-dd'))

  const { data: profile } = useProfile()
  const { data: habits = [], isLoading } = useHabits(false)
  const habitIds = habits.map((h) => h.id)
  const { data: entries = [] } = useEntriesForDays(habitIds, dayStrings)
  const archiveMutation = useArchiveHabit()

  const displayName = profile?.first_name ?? profile?.telegram_username ?? 'Habits'

  // { habitId: { dayString: Entry } }
  const entryMap = useMemo(() => {
    const map: Record<string, Record<string, Entry>> = {}
    for (const e of entries) {
      if (!map[e.habit_id]) map[e.habit_id] = {}
      map[e.habit_id][e.day] = e
    }
    return map
  }, [entries])

  // Simple score: % of shown days completed (placeholder until Step 7 algorithm)
  function quickScore(habit: Habit, habitEntries: Record<string, Entry>): number {
    const done = dayStrings.filter((d) => {
      const e = habitEntries[d]
      if (!e) return false
      if (habit.type === 0) return e.value >= ENTRY.YES_AUTO
      return e.value >= (habit.target_value ?? 0) * NUMERIC_SCALE
    }).length
    return done / dayStrings.length
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#0d0d0d] select-none">
      {/* App header */}
      <header className="flex items-center justify-between px-4 pt-3 pb-2">
        <p className="text-xl font-bold text-white tracking-tight">{displayName}</p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/habits/new')}
            className="text-white text-2xl leading-none pb-0.5"
            aria-label="Add habit"
          >
            +
          </button>
          <button
            onClick={() => navigate('/settings')}
            className="text-gray-500 text-xl leading-none"
            aria-label="Settings"
          >
            ⋮
          </button>
        </div>
      </header>

      {/* Date column headers — w-12 (48px) matches checkmarkWidth from dimens.xml */}
      <div className="flex items-end pb-1 border-b border-gray-900">
        {/* Spacer for name column + kebab */}
        <div className="flex-1" />
        {days.map((day, i) => (
          <div key={i} className="w-12 text-center">
            <p className="text-[10px] font-semibold text-gray-600 leading-tight">
              {format(day, 'EEE').toUpperCase()}
            </p>
            <p className="text-[11px] font-medium text-gray-500 leading-tight">
              {format(day, 'd')}
            </p>
          </div>
        ))}
        {/* Placeholder width matching kebab button so day columns stay aligned */}
        <div className="w-6" />
      </div>

      {/* Habit grid */}
      <main className="flex-1 overflow-y-auto pb-20">
        {isLoading && (
          <p className="py-12 text-center text-xs text-gray-700">Loading…</p>
        )}

        {!isLoading && habits.length === 0 && (
          <p className="py-16 text-center text-sm text-gray-700">
            No habits yet — tap + to add one
          </p>
        )}

        {habits.map((habit) => {
          const habitEntries = entryMap[habit.id] ?? {}
          const score = quickScore(habit, habitEntries)
          const color = habitColor(habit.color)

          return (
            <HabitRow
              key={habit.id}
              habit={habit}
              color={color}
              score={score}
              days={dayStrings}
              habitEntries={habitEntries}
              menuOpen={menuHabitId === habit.id}
              onTap={() => {
                if (menuHabitId) { setMenuHabitId(null); return }
                navigate(`/habits/${habit.id}`)
              }}
              onMenuToggle={(e) => {
                e.stopPropagation()
                setMenuHabitId(menuHabitId === habit.id ? null : habit.id)
              }}
              onEdit={() => {
                setMenuHabitId(null)
                navigate(`/habits/${habit.id}/edit`)
              }}
              onArchive={() => {
                setMenuHabitId(null)
                archiveMutation.mutate({ id: habit.id, archived: true })
              }}
            />
          )
        })}
      </main>

      {/* Tap-away overlay */}
      {menuHabitId && (
        <div className="fixed inset-0 z-10" onClick={() => setMenuHabitId(null)} />
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/habits/new')}
        className="fixed bottom-6 right-5 w-14 h-14 rounded-full bg-cyan-500 shadow-xl text-white text-3xl flex items-center justify-center active:scale-95 transition-transform z-20"
        aria-label="Add habit"
      >
        +
      </button>
    </div>
  )
}

// ── Ring icon ─────────────────────────────────────────────────────────────────

function RingIcon({ color, fill }: { color: string; fill: number }) {
  const r = 9
  const cx = 12
  const cy = 12
  const circ = 2 * Math.PI * r
  const clamped = Math.min(Math.max(fill, 0), 1)

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" className="flex-shrink-0">
      {/* Background track */}
      <circle
        cx={cx} cy={cy} r={r}
        fill="none"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="3"
      />
      {/* Filled arc */}
      {clamped > 0 && (
        <circle
          cx={cx} cy={cy} r={r}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - clamped)}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
    </svg>
  )
}

// ── Habit row ─────────────────────────────────────────────────────────────────

interface HabitRowProps {
  habit: Habit
  color: string
  score: number
  days: string[]
  habitEntries: Record<string, Entry>
  menuOpen: boolean
  onTap: () => void
  onMenuToggle: (e: React.MouseEvent) => void
  onEdit: () => void
  onArchive: () => void
}

function HabitRow({
  habit, color, score, days, habitEntries,
  menuOpen, onTap, onMenuToggle, onEdit, onArchive,
}: HabitRowProps) {
  return (
    <div className="relative border-b border-gray-900">
      {/* Row — h-12 (48px) matches checkmarkHeight from dimens.xml */}
      <div
        className="flex items-center h-12 active:bg-gray-900 cursor-pointer"
        onClick={onTap}
      >
        {/* Name column: ring + name, takes all remaining space */}
        <div className="flex-1 flex items-center gap-2 min-w-0 pl-3 pr-1">
          <RingIcon color={color} fill={score} />
          <span
            className="text-sm font-medium truncate"
            style={{ color }}
          >
            {habit.name}
          </span>
        </div>

        {/* Day cells — w-12 (48px) = checkmarkWidth from dimens.xml */}
        {days.map((day) => (
          <DayCell
            key={day}
            habit={habit}
            entry={habitEntries[day]}
            color={color}
          />
        ))}

        {/* Kebab — 24px wide so header spacer can match */}
        <button
          className="w-6 flex items-center justify-center text-gray-700 hover:text-gray-400 text-base z-20 flex-shrink-0 h-full"
          onClick={onMenuToggle}
          aria-label="More options"
        >
          ⋮
        </button>
      </div>

      {/* Dropdown menu */}
      {menuOpen && (
        <div className="absolute right-4 top-10 z-30 w-36 rounded-lg border border-gray-800 bg-gray-900 shadow-2xl overflow-hidden">
          <button
            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 active:bg-gray-800"
            onClick={(e) => { e.stopPropagation(); onEdit() }}
          >
            Edit
          </button>
          <button
            className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-gray-800 active:bg-gray-800 border-t border-gray-800"
            onClick={(e) => { e.stopPropagation(); onArchive() }}
          >
            Archive
          </button>
        </div>
      )}
    </div>
  )
}

// ── Day cell ──────────────────────────────────────────────────────────────────

function DayCell({ habit, entry, color }: { habit: Habit; entry?: Entry; color: string }) {
  const val = entry?.value

  if (habit.type === 0) {
    // Boolean: checkmark or X, 48×48 cell
    const done = val !== undefined && val >= ENTRY.YES_AUTO
    return (
      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
        <span
          className="text-base font-bold"
          style={done ? { color } : { color: 'rgba(255,255,255,0.12)' }}
        >
          {done ? '✓' : '✕'}
        </span>
      </div>
    )
  }

  // Numerical: show value or dim X
  if (!val) {
    return (
      <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
        <span className="text-base font-bold" style={{ color: 'rgba(255,255,255,0.12)' }}>✕</span>
      </div>
    )
  }

  const num = val / NUMERIC_SCALE
  const target = habit.target_value ?? 0
  const metTarget = target > 0 ? num >= target : true
  const displayNum = Number.isInteger(num) ? String(num) : num.toFixed(1)

  return (
    <div className="w-12 h-12 flex flex-col items-center justify-center leading-tight flex-shrink-0">
      <span
        className="text-xs font-bold"
        style={{ color: metTarget ? color : 'rgba(255,255,255,0.35)' }}
      >
        {displayNum}
      </span>
      {habit.unit && (
        <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{habit.unit}</span>
      )}
    </div>
  )
}
