'use client'

import { create } from 'zustand'

/**
 * @fileoverview Store de Zustand para el estado de conectividad de la app.
 *
 * Este store es la fuente de verdad para:
 * - Si el usuario tiene o no internet
 * - Si hay una sincronización en progreso
 * - Cuántos registros están pendientes / cuántos fallaron
 *
 * Se inicializa en el ConnectivityProvider (layout global).
 */

// ── Tipos ─────────────────────────────────────────────────────────────────────

type ConnectivityStatus =
  | 'online'
  | 'offline'
  | 'syncing'
  | 'sync_error'

interface ConnectivityState {
  /** Estado actual de la conectividad. */
  status: ConnectivityStatus
  /** Número total de mutaciones pendientes en la cola. */
  pendingCount: number
  /** Índice de la mutación actual siendo sincronizada. */
  syncCurrent: number
  /** Total de mutaciones a sincronizar en el ciclo actual. */
  syncTotal: number
  /** Número de mutaciones que fallaron en el último ciclo. */
  errorCount: number
  /** Si el submit de formularios está bloqueado por sync en progreso. */
  isSubmitBlocked: boolean
}

interface ConnectivityActions {
  setOnline: () => void
  setOffline: () => void
  setSyncing: (current: number, total: number) => void
  setSyncError: (errorCount: number) => void
  setSyncDone: () => void
  setPendingCount: (count: number) => void
}

// ── Store ─────────────────────────────────────────────────────────────────────

export const useConnectivityStore = create<ConnectivityState & ConnectivityActions>((set) => ({
  status: 'online',
  pendingCount: 0,
  syncCurrent: 0,
  syncTotal: 0,
  errorCount: 0,
  isSubmitBlocked: false,

  setOnline: () => set({ status: 'online', isSubmitBlocked: false }),
  setOffline: () => set({ status: 'offline', isSubmitBlocked: false }),

  setSyncing: (current, total) =>
    set({ status: 'syncing', syncCurrent: current, syncTotal: total, isSubmitBlocked: true }),

  setSyncError: (errorCount) =>
    set({ status: 'sync_error', errorCount, isSubmitBlocked: false }),

  setSyncDone: () =>
    set({ status: 'online', isSubmitBlocked: false, pendingCount: 0, syncCurrent: 0, syncTotal: 0 }),

  setPendingCount: (count) => set({ pendingCount: count }),
}))
