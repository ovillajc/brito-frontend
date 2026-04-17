'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { cn } from '@/src/core/infrastructure/utils/cn'

/**
 * Propiedades para el componente ActionFeedback.
 */
export interface ActionFeedbackProps {
  /** Estado de la acción: éxito o error. */
  status: 'success' | 'error'
  /** Título principal de la notificación. */
  title: string
  /** Mensaje descriptivo. */
  message: string
  /** Etiqueta del botón principal (por defecto "Cerrar"). */
  primaryActionLabel?: string
  /** Función a ejecutar al hacer clic en el botón principal. */
  onPrimaryAction?: () => void
  /** Etiqueta opcional para un botón secundario. */
  secondaryActionLabel?: string
  /** Función opcional para el botón secundario (ej. "Reintentar" o "Crear otro"). */
  onSecondaryAction?: () => void
}

/**
 * Componente reutilizable para mostrar feedback animado después de una acción.
 * Utiliza Framer Motion para transiciones suaves y una estética premium.
 */
export function ActionFeedback({
  status,
  title,
  message,
  primaryActionLabel = 'Cerrar',
  onPrimaryAction,
  secondaryActionLabel,
  onSecondaryAction
}: ActionFeedbackProps) {
  const isSuccess = status === 'success'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center justify-center text-center py-10 px-6 h-full min-h-[350px]"
    >
      {/* Icon Animation Container */}
      <div className="relative mb-8">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 0.1 
          }}
          className={cn(
            "size-24 rounded-full flex items-center justify-center relative z-10",
            isSuccess 
              ? "bg-[#1a5c3a]/10 text-[#1a5c3a] shadow-[0_0_40px_rgba(26,92,58,0.15)]" 
              : "bg-[#e07020]/10 text-[#e07020] shadow-[0_0_40px_rgba(224,112,32,0.15)]"
          )}
        >
          {isSuccess ? (
            <CheckCircle2 className="size-12 stroke-[2.5]" />
          ) : (
            <XCircle className="size-12 stroke-[2.5]" />
          )}
        </motion.div>
        
        {/* Decorative background pulse */}
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: [0, 0.5, 0], scale: [1, 1.5, 2] }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            ease: "easeOut"
          }}
          className={cn(
            "absolute inset-0 rounded-full blur-2xl -z-0",
            isSuccess ? "bg-[#1a5c3a]/20" : "bg-[#e07020]/20"
          )}
        />
      </div>

      {/* Text Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 max-w-sm"
      >
        <h3 className="text-2xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
          {title}
        </h3>
        <p className="text-stone-500 dark:text-zinc-400 leading-relaxed text-sm px-4">
          {message}
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="flex flex-col sm:flex-row items-center gap-3 mt-10 w-full max-w-xs sm:max-w-none justify-center"
      >
        {secondaryActionLabel && onSecondaryAction && (
          <Button
            variant="outline"
            onClick={onSecondaryAction}
            className="w-full sm:w-auto min-w-[140px] rounded-xl border-stone-200 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/50"
          >
            <RefreshCw className="size-4 mr-2" />
            {secondaryActionLabel}
          </Button>
        )}
        
        <Button
          variant={isSuccess ? 'green' : 'orange'}
          onClick={onPrimaryAction}
          className="w-full sm:w-auto min-w-[140px] rounded-xl font-bold shadow-lg shadow-black/5"
        >
          {primaryActionLabel}
        </Button>
      </motion.div>
    </motion.div>
  )
}
