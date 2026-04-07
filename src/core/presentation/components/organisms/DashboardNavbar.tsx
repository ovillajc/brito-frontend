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
    <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b border-outline-variant/20 bg-surface-container-lowest/80 backdrop-blur-md px-4 isolation-isolate">
      {/* Sidebar trigger */}
      <button
        type="button"
        onClick={toggleCollapsed}
        className="relative z-10 flex items-center justify-center size-8 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
        aria-label="Toggle sidebar"
      >
        <PanelLeftIcon className="size-4 pointer-events-none" />
      </button>

      {/* Separator */}
      <div className="h-5 w-px bg-outline-variant/30" />

      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant pointer-events-none" />
        <input
          type="text"
          placeholder="Buscar módulos, viajes, unidades..."
          className="h-9 w-full pl-9 pr-4 rounded-lg bg-surface-container border border-outline-variant/20 text-sm text-on-surface placeholder:text-on-surface-variant/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-colors"
        />
      </div>

      <div className="flex items-center gap-1.5 ml-auto">
        {/* Live indicator */}
        <div className="hidden lg:flex items-center gap-2 rounded-md border border-outline-variant/20 bg-surface-container/30 px-3 py-1.5">
          <span className="relative flex size-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[10px] font-medium tracking-wider uppercase text-on-surface-variant">
            Sistema activo
          </span>
        </div>

        {/* Separator */}
        <div className="hidden lg:block h-5 w-px bg-outline-variant/30 mx-1" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative flex items-center justify-center size-9 rounded-md text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
            aria-label="Notificaciones"
          >
            <Bell className="size-4 pointer-events-none" />
            {unreadCount > 0 && (
              <Badge className="absolute -top-0.5 -right-0.5 size-4 items-center justify-center rounded-full p-0 text-[9px]">
                {unreadCount}
              </Badge>
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
              <div className="absolute right-0 top-full mt-2 w-80 z-50 rounded-xl border border-outline-variant/20 bg-surface-container-lowest shadow-lg overflow-hidden">
                <div className="flex items-center justify-between border-b border-outline-variant/20 p-3">
                  <span className="text-xs font-semibold text-on-surface tracking-wide uppercase">
                    Notificaciones
                  </span>
                  <Badge variant="secondary" className="text-[10px]">
                    {unreadCount} nuevas
                  </Badge>
                </div>
                {NOTIFICATIONS.map((notification) => (
                  <button
                    key={notification.id}
                    className="flex flex-col items-start gap-1 p-3 w-full text-left cursor-pointer hover:bg-surface-container/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 w-full">
                      {notification.unread && (
                        <span className="size-1.5 rounded-full bg-primary shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-xs font-medium',
                          notification.unread ? 'text-on-surface' : 'text-on-surface-variant',
                        )}
                      >
                        {notification.title}
                      </span>
                      <span className="ml-auto text-[10px] text-on-surface-variant shrink-0">
                        {notification.time}
                      </span>
                    </div>
                    <span className="text-[11px] text-on-surface-variant pl-3.5">
                      {notification.description}
                    </span>
                  </button>
                ))}
                <div className="border-t border-outline-variant/20 p-2">
                  <span className="block w-full text-center text-[11px] font-medium text-primary cursor-pointer hover:text-primary/80 py-1 transition-colors">
                    Ver todas las notificaciones
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
