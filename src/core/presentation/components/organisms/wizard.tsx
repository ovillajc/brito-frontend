/**
 * @fileoverview Componente Wizard reutilizable para flujos multi-paso.
 * Renderiza su propio header limpio (sin gradiente) con icono, título y stepper numerado.
 * Inspirado en el patrón visual de la imagen de referencia con los colores de la marca.
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { Check, X, Users } from 'lucide-react'

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
}

export interface WizardProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  /** Icono decorativo en el header. Por defecto muestra un ícono de usuarios. */
  icon?: React.ReactNode
  steps: WizardStep[]
  activeStep: number
  onStepSelect?: (stepIndex: number) => void
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Wizard({
  isOpen,
  onClose,
  title,
  description,
  icon,
  steps,
  activeStep,
  onStepSelect,
  className,
  size = 'lg',
}: WizardProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size={size}
      className={className}
      hideDefaultHeader
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-8 pt-7 pb-6 border-b border-stone-100 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          {/* Brand icon */}
          <div className="size-11 rounded-xl bg-[#006d37]/10 dark:bg-[#1a5c3a]/25 flex items-center justify-center text-[#006d37] dark:text-primary-container shrink-0">
            {icon ?? <Users className="size-5" />}
          </div>
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 tracking-tight leading-tight">
              {title}
            </h2>
            {description && (
              <p className="text-sm text-stone-500 dark:text-zinc-500 mt-0.5">{description}</p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="size-8 flex items-center justify-center rounded-full text-stone-400 dark:text-zinc-500 hover:bg-stone-100 dark:hover:bg-zinc-800 hover:text-stone-700 dark:hover:text-zinc-200 transition-colors"
        >
          <X className="size-4" />
        </button>
      </div>

      {/* ── Stepper ── */}
      <div className="px-8 py-5 bg-stone-50/60 dark:bg-zinc-900/50 border-b border-stone-100 dark:border-zinc-800">
        <div className="flex items-start">
          {steps.map((step, index) => {
            const isCompleted = index < activeStep
            const isActive = index === activeStep
            const isSelectable = typeof onStepSelect === 'function'

            return (
              <React.Fragment key={step.id}>
                {/* Step bubble + label */}
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onStepSelect?.(index)}
                    disabled={!isSelectable}
                    className={cn(
                      'size-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300',
                      isSelectable ? 'cursor-pointer' : 'cursor-default',
                      isCompleted
                        ? 'bg-[#006d37] text-white shadow-sm'
                        : isActive
                          ? 'bg-[#006d37] text-white shadow-md shadow-[#006d37]/30 ring-4 ring-[#006d37]/15'
                          : 'bg-white dark:bg-zinc-800 text-stone-400 dark:text-zinc-500 border-2 border-stone-200 dark:border-zinc-700'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="size-3.5" />
                    ) : (
                      <span>{String(index + 1).padStart(2, '0')}</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onStepSelect?.(index)}
                    disabled={!isSelectable}
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider whitespace-nowrap',
                      isSelectable ? 'cursor-pointer' : 'cursor-default',
                      isActive
                        ? 'text-[#006d37] dark:text-primary-container'
                        : isCompleted
                          ? 'text-stone-600 dark:text-zinc-400'
                          : 'text-stone-400 dark:text-zinc-600'
                    )}
                  >
                    {step.title}
                  </button>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 px-2 mt-4">
                    <div className="h-[2px] w-full rounded-full bg-stone-200 dark:bg-zinc-700 overflow-hidden">
                      <div
                        className="h-full bg-[#006d37] transition-all duration-500 ease-in-out rounded-full"
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
      </div>

      {/* ── Step Content ── */}
      <div className="flex-1 overflow-y-auto px-8 py-6 min-h-[320px]">
        {steps[activeStep]?.content}
      </div>
    </Dialog>
  )
}
