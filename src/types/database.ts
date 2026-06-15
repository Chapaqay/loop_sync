// Hand-written DB types matching supabase/migrations/0001_init.sql
// Replace with `supabase gen types typescript` output once CLI is set up.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          telegram_id: number | null
          telegram_username: string | null
          first_name: string | null
          language_code: string
          first_weekday: number
          theme: string
          created_at: string
        }
        Insert: {
          id: string
          telegram_id?: number | null
          telegram_username?: string | null
          first_name?: string | null
          language_code?: string
          first_weekday?: number
          theme?: string
          created_at?: string
        }
        Update: {
          telegram_id?: number | null
          telegram_username?: string | null
          first_name?: string | null
          language_code?: string
          first_weekday?: number
          theme?: string
        }
      }
      habits: {
        Row: {
          id: string
          user_id: string
          name: string
          question: string | null
          description: string | null
          color: number
          type: number
          unit: string
          target_type: number
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
        Insert: {
          id?: string
          user_id: string
          name: string
          question?: string | null
          description?: string | null
          color?: number
          type?: number
          unit?: string
          target_type?: number
          target_value?: number
          freq_num?: number
          freq_den?: number
          reminder_hour?: number | null
          reminder_minute?: number | null
          reminder_days?: number
          position?: number
          archived?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          name?: string
          question?: string | null
          description?: string | null
          color?: number
          type?: number
          unit?: string
          target_type?: number
          target_value?: number
          freq_num?: number
          freq_den?: number
          reminder_hour?: number | null
          reminder_minute?: number | null
          reminder_days?: number
          position?: number
          archived?: boolean
          updated_at?: string
        }
      }
      entries: {
        Row: {
          id: string
          habit_id: string
          user_id: string
          day: string
          value: number
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          habit_id: string
          user_id: string
          day: string
          value: number
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          value?: number
          notes?: string | null
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
