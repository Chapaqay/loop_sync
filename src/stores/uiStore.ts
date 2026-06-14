// TODO: Step 4/10 — Zustand store for UI state (active tab, theme, selected habit)
import { create } from 'zustand'

interface UIState {
  theme: 'auto' | 'dark' | 'light'
  activeTab: 'all' | 'active' | 'archived'
  setTheme: (theme: UIState['theme']) => void
  setActiveTab: (tab: UIState['activeTab']) => void
}

export const useUIStore = create<UIState>((set) => ({
  theme: 'dark',
  activeTab: 'active',
  setTheme: (theme) => set({ theme }),
  setActiveTab: (tab) => set({ activeTab: tab }),
}))
