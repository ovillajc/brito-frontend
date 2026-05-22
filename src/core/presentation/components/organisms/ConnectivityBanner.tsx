'use client'

/**
 * @fileoverview Banner de estado de conectividad y sincronización.
 *
 * Se muestra en la parte superior del layout cuando:
 * - El usuario está sin conexión (modo offline)
 * - Hay registros pendientes de sincronizar
 * - La sincronización está en progreso
 * - Hubo errores en la sincronización
 *
 * @organism
 */

import { Wifi, WifiOff, RefreshCw, AlertTriangle, CloudOff } from 'lucide-react'
import { useConnectivityStore } from '../../stores/use-connectivity-store'
import { cn } from '@/src/core/infrastructure/utils/cn'

/**
 * Banner de conectividad. Montar en el layout del dashboard, encima del contenido principal.
 */
export function ConnectivityBanner() {
  const status = useConnectivityStore((s) => s.status)
  const pendingCount = useConnectivityStore((s) => s.pendingCount)
  const syncCurrent = useConnectivityStore((s) => s.syncCurrent)
  const syncTotal = useConnectivityStore((s) => s.syncTotal)
  const errorCount = useConnectivityStore((s) => s.errorCount)

  // Online y sin pendientes → no mostrar nada
  if (status === 'online' && pendingCount === 0) return null

  const configs = {
    offline: {
      bg: 'bg-amber-500',
      icon: WifiOff,
      message: pendingCount > 0
        ? `Sin conexión — ${pendingCount} registro${pendingCount > 1 ? 's' : ''} guardado${pendingCount > 1 ? 's' : ''} localmente`
        : 'Sin conexión a internet — Los formularios se guardarán localmente',
    },
    syncing: {
      bg: 'bg-[#006d37]',
      icon: RefreshCw,
      message: `Sincronizando... (${syncCurrent}/${syncTotal})`,
    },
    sync_error: {
      bg: 'bg-red-600',
      icon: AlertTriangle,
      message: `${errorCount} registro${errorCount > 1 ? 's' : ''} no se pudo${errorCount > 1 ? 'ieron' : ''} sincronizar — Reintentando automáticamente`,
    },
    online: {
      bg: 'bg-[#006d37]',
      icon: Wifi,
      message: pendingCount > 0
        ? `${pendingCount} registro${pendingCount > 1 ? 's' : ''} pendiente${pendingCount > 1 ? 's' : ''} de sincronizar`
        : '',
    },
  }

  const config = configs[status]
  if (!config.message) return null
  const Icon = config.icon

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex items-center justify-center gap-2.5 py-2 px-4 text-white text-xs font-semibold text-center',
        config.bg,
        status === 'syncing' && 'animate-pulse',
      )}
    >
      <Icon
        className={cn('size-3.5 shrink-0', status === 'syncing' && 'animate-spin')}
        aria-hidden
      />
      <span>{config.message}</span>
      {status === 'offline' && (
        <span className="ml-2 flex items-center gap-1 opacity-75">
          <CloudOff className="size-3" aria-hidden />
          <span>Modo offline activo</span>
        </span>
      )}
    </div>
  )
}
