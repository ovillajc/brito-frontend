/**
 * @fileoverview Navbar superior del dashboard.
 * Incluye sidebar trigger, barra de búsqueda, indicador de estado y notificaciones.
 * Diseño inspirado en petro-flow adaptado a los tokens de Brito.
 */

'use client'

import { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { Bell, Search, PanelLeftIcon, Sun, Moon } from 'lucide-react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useSidebar } from '@/src/core/presentation/context/SidebarContext'
import { ConnectionIndicator } from '@/src/core/presentation/components/molecules/ConnectionIndicator'

interface Notification {
  id: number
  title: string
  description: string
  time: string
  unread: boolean
}

const NOTIFICATIONS: Notification[] = [
  {
    id: 1,
    title: 'Viaje completado',
    description: 'Ruta Villahermosa → Cd. del Carmen finalizada',
    time: 'Hace 15 min',
    unread: true,
  },
  {
    id: 2,
    title: 'Alerta de mantenimiento',
    description: 'Unidad TRC-042 — Aceite por debajo del mínimo',
    time: 'Hace 45 min',
    unread: true,
  },
  {
    id: 3,
    title: 'Factura generada',
    description: 'CFDI-2026-0342 emitida correctamente',
    time: 'Hace 2 horas',
    unread: false,
  },
]

/**
 * Navbar superior del dashboard con búsqueda, estado del sistema y notificaciones.
 */
export function DashboardNavbar() {
  const { toggleCollapsed } = useSidebar()
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length

  const isDark = mounted && (resolvedTheme === 'dark' || theme === 'dark')

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 transition-colors">
      {/* Sidebar trigger */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="relative z-10 flex items-center justify-center size-8 rounded-md text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <PanelLeftIcon className="size-4 pointer-events-none" />
      </button>

      {/* Separator */}
      <div className="h-4 w-px bg-stone-200" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 dark:text-zinc-500 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar módulos, viajes, unidades..."
          className="h-9 w-full pl-9 pr-4 rounded-[10px] bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 text-[13px] text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 focus:outline-none focus:border-[#1a5c3a]/50 focus:ring-1 focus:ring-[#1a5c3a]/20 focus:bg-white dark:focus:bg-zinc-800 transition-all shadow-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
           <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-stone-400 dark:text-zinc-500 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 shadow-sm">⌘F</span>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden lg:flex items-center gap-2">
          <ConnectionIndicator />

          {/* Separator */}
          <div className="h-4 w-px bg-stone-200" />

          {/* Language Toggle */}
          <button
            className="flex items-center justify-center size-8 rounded-md text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="Cambiar idioma"
            aria-label="Cambiar idioma"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
          </button>

          {/* Theme Toggle */}
          <button
            className="flex items-center justify-center size-8 rounded-md text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="Cambiar tema"
            aria-label="Cambiar tema"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {mounted ? (
              isDark ? <Moon className="size-4" /> : <Sun className="size-4" />
            ) : (
              <div className="size-4" />
            )}
          </button>

          {/* Fullscreen Toggle */}
          <button
            className="flex items-center justify-center size-8 rounded-md text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors"
            title="Pantalla completa"
            aria-label="Pantalla completa"
            onClick={() => {
              if (!document.fullscreenElement) {
                document.documentElement.requestFullscreen()
              } else {
                document.exitFullscreen()
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3 14 10"/><path d="M3 21l7-7"/></svg>
          </button>
        </div>

        {/* Separator */}
        <div className="hidden lg:block h-4 w-px bg-stone-200 dark:bg-zinc-700" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center size-9 rounded-full text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer border border-transparent hover:border-stone-200 dark:hover:border-zinc-700"
            aria-label="Notificaciones"
          >
            <Bell className="size-4 pointer-events-none" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#e07020] ring-2 ring-white dark:ring-zinc-900" />
            )}
          </button>

          {/* Notification dropdown */}
          {showNotifications && (
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowNotifications(false)}
                aria-hidden="true"
              />
              <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 p-4">
                  <span className="text-xs font-bold text-stone-900 dark:text-zinc-100 tracking-wide uppercase">
                    Notificaciones
                  </span>
                  <Badge className="text-[10px] bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 border-none shadow-none">
                    {unreadCount} nuevas
                  </Badge>
                </div>
                {NOTIFICATIONS.map((notification) => (
                  <button
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 w-full text-left cursor-pointer hover:bg-stone-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {notification.unread && (
                        <span className="size-1.5 rounded-full bg-[#1a5c3a] shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-bold',
                          notification.unread ? 'text-stone-900 dark:text-zinc-100' : 'text-stone-500 dark:text-zinc-500',
                        )}
                      >
                        {notification.title}
                      </span>
                      <span className="ml-auto text-[10px] text-stone-400 dark:text-zinc-500 shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 dark:text-zinc-500 pl-3.5 leading-snug">
                      {notification.description}
                    </span>
                  </button>
                ))}
                <div className="border-t border-stone-100 dark:border-zinc-800 p-2">
                  <span className="block w-full text-center text-[11px] font-bold text-[#1a5c3a] cursor-pointer hover:text-[#1a5c3a]/80 py-1 transition-colors">
                    Ver todas las notificaciones
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
        
        {/* Primary Action Button */}
        <button className="hidden lg:flex items-center gap-2 bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white px-4 py-1.5 rounded-[8px] text-[12px] font-bold transition-all shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
           Acción rápida
        </button>
      </div>
    </header>
  )
}
