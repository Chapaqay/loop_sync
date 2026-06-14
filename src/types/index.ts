// Domain types mirroring the DB schema

export interface Profile {
  id: string
  telegram_id: number | null
  telegram_username: string | null
  first_name: string | null
  language_code: string
  first_weekday: number
  theme: string
  created_at: string
}

export interface Habit {
  id: string
  user_id: string
  name: string
  question: string | null
  description: string | null
  color: number
  type: 0 | 1
  unit: string
  target_type: 0 | 1
  target_value: number
  freq_num: number
  freq_den: number
  reminder_hour: number | null
  reminder_minute: number | null
  reminder_days: number
  position: number
  archived: boolean
  created_at: string
  updated_at: string
}

export interface Entry {
  id: string
  habit_id: string
  user_id: string
  day: string
  value: number
  notes: string | null
  created_at: string
  updated_at: string
}
