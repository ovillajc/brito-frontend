'use client'

import React from 'react'
import { useConnectionStatus } from '@/src/core/presentation/hooks/use-connection-status'
import { cn } from '@/src/core/infrastructure/utils/cn'

const CONFIG = {
  online: {
    dot: 'bg-emerald-500',
    ping: 'bg-emerald-400',
    label: 'SISTEMA ACTIVO',
    text: 'text-stone-500',
    border: 'border-stone-200',
  },
  slow: {
    dot: 'bg-yellow-500',
    ping: 'bg-yellow-400',
    label: 'CONEXIÓN LENTA',
    text: 'text-yellow-700',
    border: 'border-yellow-200',
  },
  offline: {
    dot: 'bg-red-500',
    ping: 'bg-red-400',
    label: 'SIN CONEXIÓN',
    text: 'text-red-600',
    border: 'border-red-200',
  },
}

export function ConnectionIndicator() {
  const status = useConnectionStatus()
  const current = CONFIG[status]

  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-md border bg-stone-50/60 px-3 py-1.5 cursor-default',
        current.border
      )}
      title={current.label}
    >
      {/* Animated dot */}
      <span className="relative flex size-2">
        <span className={cn('absolute inline-flex h-full w-full animate-ping rounded-full opacity-75', current.ping)} />
        <span className={cn('relative inline-flex size-2 rounded-full', current.dot)} />
      </span>

      {/* Label */}
      <span className={cn('text-[10px] font-medium tracking-wider uppercase', current.text)}>
        {current.label}
      </span>
    </div>
  )
}
