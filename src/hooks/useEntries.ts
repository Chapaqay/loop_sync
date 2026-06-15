import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Entry } from '../types'

export function useEntriesForDays(habitIds: string[], dayStrings: string[]) {
  return useQuery({
    queryKey: ['entries', habitIds.slice().sort().join(','), dayStrings.join(',')],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('entries')
        .select('*')
        .in('habit_id', habitIds)
        .in('day', dayStrings)
      if (error) throw error
      return data as Entry[]
    },
    enabled: habitIds.length > 0 && dayStrings.length > 0,
  })
}
