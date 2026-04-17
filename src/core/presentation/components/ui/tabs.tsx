'use client'

/**
 * @fileoverview Componente Tabs implementado sin dependencias externas.
 * Usa React Context + estado local para el tab activo.
 * Compatible con selectores Tailwind `data-[state=active]:*`.
 */

import * as React from 'react'
import { cn } from '@/src/core/infrastructure/utils/cn'

// ─── Context ─────────────────────────────────────────────────────────────────

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = React.createContext<TabsContextValue | null>(null)

function useTabs(): TabsContextValue {
  const ctx = React.useContext(TabsContext)
  if (!ctx) throw new Error('Tabs compound components must be used within a <Tabs> provider')
  return ctx
}

// ─── Tabs (Root) ─────────────────────────────────────────────────────────────

interface TabsProps {
  /** Tab activo por defecto (modo no controlado) */
  defaultValue: string
  /** Tab activo (modo controlado) */
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

function Tabs({ defaultValue, value, onValueChange, children, className }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const activeTab = value ?? internalValue

  const setActiveTab = React.useCallback(
    (v: string) => {
      setInternalValue(v)
      onValueChange?.(v)
    },
    [onValueChange]
  )

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  )
}

// ─── TabsList ────────────────────────────────────────────────────────────────

interface TabsListProps {
  children: React.ReactNode
  className?: string
}

function TabsList({ children, className }: TabsListProps) {
  return (
    <div role="tablist" className={cn('flex items-center', className)}>
      {children}
    </div>
  )
}

// ─── TabsTrigger ─────────────────────────────────────────────────────────────

interface TabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

function TabsTrigger({ value, children, className }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabs()
  const isActive = activeTab === value

  return (
    <button
      role="tab"
      type="button"
      data-state={isActive ? 'active' : 'inactive'}
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-4 py-2 text-sm font-semibold transition-all duration-200 focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
        className
      )}
    >
      {children}
    </button>
  )
}

// ─── TabsContent ──────────────────────────────────────────────────────────────

interface TabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

function TabsContent({ value, children, className }: TabsContentProps) {
  const { activeTab } = useTabs()
  if (activeTab !== value) return null
  return (
    <div role="tabpanel" className={cn(className)}>
      {children}
    </div>
  )
}

export { Tabs, TabsList, TabsTrigger, TabsContent }
