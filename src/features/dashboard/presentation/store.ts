/**
 * @fileoverview Store de Zustand para el Dashboard.
 * Sigue las reglas de AGENTS.md (selectores atómicos y hidratación).
 */

import { create } from 'zustand'

interface DashboardState {
  isRefreshing: boolean

  // Acciones
  setIsRefreshing: (isRefreshing: boolean) => void
}

/**
 * Store global para el feature de Dashboard.
 * Gestiona el estado de la UI (layout flat, sin tabs).
 */
export const useDashboardStore = create<DashboardState>((set) => ({
  isRefreshing: false,

  setIsRefreshing: (isRefreshing) => set({ isRefreshing }),
}))
