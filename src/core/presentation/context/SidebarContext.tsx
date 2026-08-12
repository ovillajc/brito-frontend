/**
 * @fileoverview Contexto y Provider para el estado del sidebar.
 * Centraliza el estado de colapso para que pueda ser accedido desde el sidebar y el navbar.
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react'
import { useSettingsStore } from '@/src/core/presentation/store/settings-store'

interface SidebarContextValue {
  isCollapsed: boolean
  toggleCollapsed: () => void
  setIsCollapsed: (value: boolean) => void
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined)

/**
 * Provider que gestiona el estado del sidebar.
 */
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const storeCollapsed = useSettingsStore((state) => state.sidebarCollapsed)
  const setStoreCollapsed = useSettingsStore((state) => state.setSidebarCollapsed)
  
  // Local state for fast updates and SSR hydration safety
  const [isCollapsed, setIsCollapsed] = useState(true)

  // Sync with persistent store on mount
  useEffect(() => {
    setIsCollapsed(storeCollapsed)
  }, [storeCollapsed])

  // Custom setter that updates both local context state and persistent store
  const setSidebarState = useCallback((value: boolean) => {
    setIsCollapsed(value)
    setStoreCollapsed(value)
  }, [setStoreCollapsed])

  const toggleCollapsed = useCallback(() => {
    setSidebarState(!isCollapsed)
  }, [isCollapsed, setSidebarState])

  const value = useMemo(() => ({
    isCollapsed,
    toggleCollapsed,
    setIsCollapsed: setSidebarState,
  }), [isCollapsed, toggleCollapsed, setSidebarState])

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex min-h-svh w-full">
        {children}
      </div>
    </SidebarContext.Provider>
  )
}

/**
 * Hook para acceder al estado del sidebar.
 * Lanza un error si se usa fuera de un SidebarProvider.
 */
export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar debe usarse dentro de un SidebarProvider')
  }
  return context
}
