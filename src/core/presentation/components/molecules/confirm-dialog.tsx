'use client'

/**
 * @fileoverview Diálogo de confirmación reutilizable para acciones destructivas.
 * Acepta variantes de peligro (rojo) y advertencia (naranja).
 * Reside en core porque es transversal a todos los módulos del sistema.
 */

import React from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { cn } from '@/src/core/infrastructure/utils/cn'

type ConfirmVariant = 'danger' | 'warning'

interface ConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  /** Callback ejecutado cuando el usuario confirma la acción */
  onConfirm: () => void | Promise<void>
  title: string
  description: string
  /** Texto del botón de confirmación. Por defecto: "Eliminar" */
  confirmLabel?: string
  /** Texto del botón de cancelación. Por defecto: "Cancelar" */
  cancelLabel?: string
  /** Si true, deshabilita los botones y muestra estado de carga */
  isLoading?: boolean
  /** danger = rojo, warning = naranja. Por defecto: "danger" */
  variant?: ConfirmVariant
}

const VARIANT_CONFIG: Record<
  ConfirmVariant,
  { iconBg: string; iconColor: string; btnClass: string; icon: React.ElementType }
> = {
  danger: {
    iconBg: 'bg-red-50 dark:bg-red-950/30',
    iconColor: 'text-red-500',
    btnClass:
      'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-600 text-white focus-visible:ring-red-500',
    icon: Trash2,
  },
  warning: {
    iconBg: 'bg-orange-50 dark:bg-orange-950/30',
    iconColor: 'text-orange-500',
    btnClass:
      'bg-[#e07020] hover:bg-[#c0601a] dark:bg-[#e07020] dark:hover:bg-[#c0601a] text-white focus-visible:ring-orange-500',
    icon: AlertTriangle,
  },
}

/**
 * Diálogo de confirmación para acciones destructivas o advertencias.
 * Completamente reutilizable en cualquier feature del sistema.
 */
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  isLoading = false,
  variant = 'danger',
}: ConfirmDialogProps) {
  const config = VARIANT_CONFIG[variant]
  const Icon = config.icon

  const handleConfirm = async () => {
    await onConfirm()
  }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="sm" hideDefaultHeader>
      <div className="p-8 flex flex-col items-center text-center gap-5">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-4 right-4 size-7 flex items-center justify-center rounded-full text-stone-400 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-700 transition-colors"
        >
          <X className="size-3.5" />
        </button>

        {/* Icon */}
        <div
          className={cn(
            'size-16 rounded-2xl flex items-center justify-center',
            config.iconBg
          )}
        >
          <Icon className={cn('size-7', config.iconColor)} />
        </div>

        {/* Copy */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
            {title}
          </h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-[280px] leading-relaxed">
            {description}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 w-full mt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11 rounded-xl border-2 border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300 text-sm font-bold hover:bg-stone-50 dark:hover:bg-zinc-800 disabled:opacity-50 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className={cn(
              'flex-1 h-11 rounded-xl text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60',
              config.btnClass
            )}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="size-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                Procesando…
              </span>
            ) : (
              confirmLabel
            )}
          </button>
        </div>
      </div>
    </Dialog>
  )
}
