/**
 * @fileoverview Página principal del módulo de Operaciones.
 * Presenta el selector de categorías con panel de contenido dinámico.
 */

'use client'

import { Activity } from 'lucide-react'
import { OperationsCategorySelector } from '@/src/features/operations/presentation/components/organisms/OperationsCategorySelector'

export default function OperationsPage() {
  return (
    <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center size-8 rounded-xl bg-[#1a5c3a]/10">
            <Activity className="size-4 text-[#1a5c3a]" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-stone-900 dark:text-zinc-100">
            Operaciones
          </h1>
        </div>
        <p className="text-[13px] text-stone-400 dark:text-zinc-500 ml-[42px]">
          Selecciona una categoría para ver las operaciones disponibles
        </p>
      </div>

      {/* Divider */}
      <div className="h-px bg-stone-100 dark:bg-zinc-800" />

      {/* Category selector + dynamic panel */}
      <OperationsCategorySelector />
    </div>
  )
}
