import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Habit } from '../types'

// ── Queries ──────────────────────────────────────────────────────────────────

export function useHabits(archived = false) {
  return useQuery({
    queryKey: ['habits', { archived }],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('archived', archived)
        .order('position', { ascending: true })
      if (error) throw error
      return data as Habit[]
    },
  })
}

export function useHabit(id: string) {
  return useQuery({
    queryKey: ['habits', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('habits')
        .select('*')
        .eq('id', id)
        .single()
      if (error) throw error
      return data as Habit
    },
    enabled: Boolean(id),
  })
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      if (error) throw error
      return data
    },
  })
}

// ── Mutations ─────────────────────────────────────────────────────────────────

export function useCreateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Set position to end of list
      const { count } = await supabase
        .from('habits')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)

      const { data, error } = await supabase
        .from('habits')
        .insert({ ...habit, user_id: user.id, position: count ?? 0 })
        .select()
        .single()
      if (error) throw error
      return data as Habit
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useUpdateHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Habit> & { id: string }) => {
      const { data, error } = await supabase
        .from('habits')
        .update(updates)
        .eq('id', id)
        .select()
        .single()
      if (error) throw error
      return data as Habit
    },
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['habits'] })
      qc.invalidateQueries({ queryKey: ['habits', vars.id] })
    },
  })
}

export function useArchiveHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, archived }: { id: string; archived: boolean }) => {
      const { error } = await supabase
        .from('habits')
        .update({ archived })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, archived }) => {
      await qc.cancelQueries({ queryKey: ['habits'] })
      const prev = qc.getQueryData<Habit[]>(['habits', { archived: !archived }])
      qc.setQueryData<Habit[]>(['habits', { archived: !archived }], (old) =>
        old?.filter((h) => h.id !== id) ?? []
      )
      return { prev }
    },
    onError: (_err, vars, ctx) => {
      qc.setQueryData(['habits', { archived: !vars.archived }], ctx?.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}

export function useDeleteHabit() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('habits').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  })
}
