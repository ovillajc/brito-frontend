/**
 * @fileoverview Navbar superior del dashboard.
 * Incluye sidebar trigger, barra de búsqueda, indicador de estado y notificaciones.
 * Diseño inspirado en petro-flow adaptado a los tokens de Brito.
 */

'use client'

import { useState } from 'react'
import { Bell, Search, PanelLeftIcon } from 'lucide-react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useSidebar } from '@/src/core/presentation/context/SidebarContext'

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
  const [showNotifications, setShowNotifications] = useState(false)
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-stone-200 bg-white px-4">
      {/* Sidebar trigger */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="relative z-10 flex items-center justify-center size-8 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <PanelLeftIcon className="size-4 pointer-events-none" />
      </button>

      {/* Separator */}
      <div className="h-4 w-px bg-stone-200" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar módulos, viajes, unidades..."
          className="h-9 w-full pl-9 pr-4 rounded-[10px] bg-stone-50 border border-stone-200 text-[13px] text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-[#1a5c3a]/50 focus:ring-1 focus:ring-[#1a5c3a]/20 focus:bg-white transition-all shadow-sm"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1">
           <span className="px-1.5 py-0.5 rounded text-[10px] font-medium text-stone-400 bg-white border border-stone-200 shadow-sm">⌘F</span>
        </div>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <div className="hidden lg:flex items-center gap-2">
          {/* Refresh Button Mock */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-stone-200 transition-colors shadow-sm">
             <span className="flex items-center justify-center size-3.5 rounded-full border border-current border-t-transparent animate-spin" />
             Refresh
          </button>
          {/* Filter Button Mock */}
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-stone-200 transition-colors shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
             Filter
          </button>
        </div>

        {/* Separator */}
        <div className="hidden lg:block h-4 w-px bg-stone-200" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center size-9 rounded-full text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer border border-transparent hover:border-stone-200"
            aria-label="Notificaciones"
          >
            <Bell className="size-4 pointer-events-none" />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 size-1.5 rounded-full bg-[#e07020] ring-2 ring-white" />
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
              <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-2xl border border-stone-200 bg-white shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-stone-100 p-4">
                  <span className="text-xs font-bold text-stone-900 tracking-wide uppercase">
                    Notificaciones
                  </span>
                  <Badge className="text-[10px] bg-stone-100 text-stone-600 border-none shadow-none">
                    {unreadCount} nuevas
                  </Badge>
                </div>
                {NOTIFICATIONS.map((notification) => (
                  <button
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 w-full text-left cursor-pointer hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {notification.unread && (
                        <span className="size-1.5 rounded-full bg-[#1a5c3a] shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-bold',
                          notification.unread ? 'text-stone-900' : 'text-stone-500',
                        )}
                      >
                        {notification.title}
                      </span>
                      <span className="ml-auto text-[10px] text-stone-400 shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <span className="text-[11px] text-stone-500 pl-3.5 leading-snug">
                      {notification.description}
                    </span>
                  </button>
                ))}
                <div className="border-t border-stone-100 p-2">
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
           Quick Action
        </button>
      </div>
    </header>
  )
}
