/**
 * @fileoverview Átomo: tarjeta de categoría de operación.
 * Muestra el icono, etiqueta y descripción de una categoría.
 * Es seleccionable y reacciona visualmente al estado activo.
 */

'use client'

import {
  Building2,
  Route,
  ClipboardList,
  Users2,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'
import type { OperationCategoryEntity } from '@/src/features/operations/domain/entities/operation-category.entity'

const ICON_MAP: Record<string, LucideIcon> = {
  Building2,
  Route,
  ClipboardList,
  Users2,
}

interface CategoryTabProps {
  category: OperationCategoryEntity
  isActive: boolean
  onClick: () => void
}

/**
 * Tarjeta-tab de categoría de operación.
 * Diseño minimalista inspirado en los tokens de color de Brito.
 */
export function CategoryTab({ category, isActive, onClick }: CategoryTabProps) {
  const Icon = ICON_MAP[category.icon] ?? Building2

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative flex flex-col items-start gap-3 rounded-2xl border p-5 text-left transition-all duration-200',
        'hover:shadow-md hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1a5c3a]/40',
        isActive
          ? 'border-[#1a5c3a]/25 bg-white dark:bg-zinc-900 shadow-md ring-1 ring-[#1a5c3a]/15'
          : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-stone-300 dark:hover:border-zinc-700',
      )}
    >
      {/* Active indicator bar */}
      {isActive && (
        <span className="absolute left-0 top-4 bottom-4 w-[3px] rounded-full bg-[#1a5c3a]" />
      )}

      {/* Icon */}
      <div
        className={cn(
          'flex items-center justify-center size-9 rounded-xl transition-colors duration-200',
          isActive ? category.bgColor : 'bg-stone-100 dark:bg-zinc-800',
        )}
      >
        <Icon
          className={cn(
            'size-4 transition-colors duration-200',
            isActive ? category.color : 'text-stone-500 dark:text-zinc-400',
          )}
        />
      </div>

      {/* Label */}
      <div className="flex flex-col gap-0.5">
        <span
          className={cn(
            'text-[13px] font-bold leading-tight transition-colors',
            isActive
              ? 'text-stone-900 dark:text-zinc-100'
              : 'text-stone-600 dark:text-zinc-400',
          )}
        >
          {category.label}
        </span>
        <span className="text-[11px] text-stone-400 dark:text-zinc-500 leading-snug line-clamp-2">
          {category.description}
        </span>
      </div>
    </button>
  )
}
