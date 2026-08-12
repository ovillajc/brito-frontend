import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface SettingsState {
  sidebarCollapsed: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      sidebarCollapsed: true, // Por defecto contraído
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'brito-settings',
    }
  )
)
