import { createContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import { isTelegramMiniApp, getMiniAppInitData, expandMiniApp } from '../lib/telegram'
import { signInWithMiniApp } from '../lib/auth'

interface AuthState {
  session: Session | null
  user: User | null
  loading: boolean
  error: string | null
}

interface AuthContextValue extends AuthState {
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  error: null,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    session: null,
    user: null,
    loading: true,
    error: null,
  })

  useEffect(() => {
    // Subscribe to auth state changes first so we don't miss events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState((prev) => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
        error: null,
      }))
    })

    // If running inside Telegram Mini App, auto-sign-in with initData
    expandMiniApp()
    if (isTelegramMiniApp()) {
      signInWithMiniApp(getMiniAppInitData()).catch((err: Error) => {
        setState((prev) => ({ ...prev, loading: false, error: err.message }))
      })
    } else {
      // Check for an existing browser session
      supabase.auth.getSession().then(({ data: { session } }) => {
        setState((prev) => ({
          ...prev,
          session,
          user: session?.user ?? null,
          loading: false,
        }))
      })
    }

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ session: null, user: null, loading: false, error: null })
  }

  return <AuthContext.Provider value={{ ...state, signOut }}>{children}</AuthContext.Provider>
}
