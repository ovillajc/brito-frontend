/**
 * @fileoverview Contexto y Provider para el estado del sidebar.
 * Centraliza el estado de colapso para que pueda ser accedido desde el sidebar y el navbar.
 */

'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'

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
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapsed = useCallback(() => {
    setIsCollapsed((prev) => !prev)
  }, [])

  const value = useMemo(() => ({
    isCollapsed,
    toggleCollapsed,
    setIsCollapsed,
  }), [isCollapsed, toggleCollapsed])

  return (
    <SidebarContext.Provider value={value}>
      <div className="flex min-h-svh w-full bg-surface-container-lowest">
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
