'use client'

/**
 * @fileoverview Página principal de Gastos y Egresos con segmentación operativa y administrativa.
 */

import React, { useState } from 'react'
import { ExpensesTable } from '../organisms/ExpensesTable'
import { cn } from '@/src/core/infrastructure/utils/cn'

export default function ExpensesPage() {
  const [expenseType, setExpenseType] = useState<'operativo' | 'general' | 'all'>('all')

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Gastos y Egresos</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">Gestión de gastos operativos, administrativos y generales.</p>
        </div>

        {/* ── Tabs Segmentación ──────────────────────────────────────────────── */}
        <div className="flex items-center p-1 bg-stone-100 dark:bg-zinc-800 rounded-lg border border-stone-200 dark:border-zinc-700 w-fit overflow-x-auto">
          <button
            onClick={() => setExpenseType('all')}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap',
              expenseType === 'all' 
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm' 
                : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300'
            )}
          >
            Todos
          </button>
          <button
            onClick={() => setExpenseType('operativo')}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap',
              expenseType === 'operativo' 
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm' 
                : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300'
            )}
          >
            Operativos
          </button>
          <button
            onClick={() => setExpenseType('general')}
            className={cn(
              'px-4 py-1.5 text-sm font-medium rounded-md transition-all whitespace-nowrap',
              expenseType === 'general' 
                ? 'bg-white dark:bg-zinc-900 text-stone-900 dark:text-zinc-100 shadow-sm' 
                : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-300'
            )}
          >
            Administrativos / Generales
          </button>
        </div>
      </div>

      {/* ── KPIs / Stats Rápidos (Placeholder) ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Placeholder cards para futuras integraciones */}
      </div>

      {/* ── Tabla principal ─────────────────────────────────────── */}
      <ExpensesTable expenseType={expenseType} />
    </div>
  )
}
