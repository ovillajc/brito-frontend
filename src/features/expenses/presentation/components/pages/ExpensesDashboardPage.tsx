'use client'

/**
 * @fileoverview Dashboard analítico de gastos operativos.
 * Muestra KPIs de totales y una tabla pivoteada por categoría.
 */

import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { useExpenses } from '../../hooks/use-expenses'
import { useExpenseCatalogs } from '../../hooks/use-expense-catalogs'
import { TrendingDown, Receipt, AlertTriangle } from 'lucide-react'
import type { ExpenseEntity } from '../../../domain/entities/expense-entity'
import { ExpensesTable } from '../organisms/ExpensesTable'

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 0,
})

// ── Tipos para el Pivoteo ──────────────────────────────────────────

interface PivotRow {
  tripId: string
  // Totales por categoría
  [category: string]: number | string
  // Total del viaje
  total: number
}

// ── Componente ──────────────────────────────────────────────────────

export default function ExpensesDashboardPage() {
  const { data: expenses = [], isLoading, isError, error } = useExpenses()
  const catalogsQuery = useExpenseCatalogs()
  const categories = useMemo(
    () => (catalogsQuery.data?.categories ?? []).map((c) => c.name),
    [catalogsQuery.data?.categories]
  )
  const columns = useMemo(() => [...categories, 'Sin Categoría'], [categories])

  // Calcular KPIs Generales
  const grandTotal = useMemo(() => expenses.reduce((acc, e) => acc + e.amount, 0), [expenses])

  // Generar la tabla pivote de Viajes vs Categorías
  const pivotData = useMemo(() => {
    const tripMap = new Map<string, PivotRow>()

    for (const e of expenses) {
      // Si el gasto no está asignado a un viaje, lo agrupamos en "Gastos Generales"
      const tId = e.tripId ?? 'Gastos Generales (Sin Viaje)'
      
      if (!tripMap.has(tId)) {
        // Inicializar fila
        const initialRow: PivotRow = { tripId: tId, total: 0 }
        for (const cat of columns) initialRow[cat] = 0
        initialRow['Sin Categoría'] = 0
        tripMap.set(tId, initialRow)
      }

      const row = tripMap.get(tId)!
      const catName = e.categoryName ?? 'Sin Categoría'
      
      // Sumar monto en la columna correspondiente
      if (catName in row) {
        (row[catName] as number) += e.amount
      } else {
        row[catName] = ((row[catName] as number) || 0) + e.amount
      }
      
      row.total += e.amount
    }

    // Convertir a array y ordenar (Gastos generales primero, luego alfabético o por total)
    return Array.from(tripMap.values()).sort((a, b) => b.total - a.total)
  }, [expenses, columns])

  return (
    <div className="flex flex-col gap-6">
      
      {/* ── KPIs Rápidos ──────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <Card className="border shadow-sm">
          <CardContent className="flex items-center justify-between py-5 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/20">
                <TrendingDown className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Total Histórico</p>
                <p className="text-2xl font-bold text-stone-900 dark:text-zinc-100">{money.format(grandTotal)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border shadow-sm">
          <CardContent className="flex items-center justify-between py-5 px-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-stone-100 dark:bg-zinc-800">
                <Receipt className="h-5 w-5 text-stone-600 dark:text-zinc-400" />
              </div>
              <div>
                <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">Registros</p>
                <p className="text-2xl font-bold text-stone-900 dark:text-zinc-100">{expenses.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* ── Tabla Pivote ──────────────────────────────────────────── */}
      <Card className="border shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-outline-variant/30 bg-stone-50/50 dark:bg-zinc-900/50">
          <CardTitle className="text-base flex items-center gap-2">
            Desglose de Gastos por Viaje (Pivote)
          </CardTitle>
          <CardDescription className="text-xs mt-1">
            Matriz de costos distribuidos en las categorías operativas.
          </CardDescription>
        </CardHeader>
        
        <div className="overflow-x-auto">
          {isLoading || catalogsQuery.isLoading ? (
            <div className="p-8 text-center text-sm text-stone-500 animate-pulse">Cargando reporte...</div>
          ) : isError ? (
            <div className="p-8 flex items-center justify-center gap-2 text-sm text-red-500">
              <AlertTriangle className="h-4 w-4" />
              {(error as Error).message}
            </div>
          ) : catalogsQuery.isError ? (
            <div className="p-8 flex items-center justify-center gap-2 text-sm text-red-500">
              <AlertTriangle className="h-4 w-4" />
              {(catalogsQuery.error as Error).message}
            </div>
          ) : pivotData.length === 0 ? (
            <div className="p-8 text-center text-sm text-stone-500">No hay datos suficientes para generar el reporte.</div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-stone-500 uppercase bg-stone-50 dark:bg-zinc-900 border-b border-stone-200 dark:border-zinc-800">
                <tr>
                  <th className="px-4 py-3 font-semibold w-48 truncate">Referencia / Viaje</th>
                  {columns.map(cat => (
                    <th key={cat} className="px-4 py-3 font-semibold text-right min-w-[120px]">
                      {cat.replace('_', ' ')}
                    </th>
                  ))}
                  <th className="px-4 py-3 font-bold text-right text-stone-900 dark:text-zinc-100 min-w-[120px]">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 dark:divide-zinc-800">
                {pivotData.map((row) => (
                  <tr key={row.tripId} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors">
                    <td className="px-4 py-3 font-mono font-medium text-stone-900 dark:text-zinc-100">
                      {row.tripId.includes('Generales') ? row.tripId : `VJE-${row.tripId.split('-')[0]}`}
                    </td>
                    
                    {columns.map(cat => (
                      <td key={cat} className="px-4 py-3 text-right tabular-nums text-stone-600 dark:text-zinc-400">
                        {row[cat] ? money.format(row[cat] as number) : '—'}
                      </td>
                    ))}
                    
                    <td className="px-4 py-3 text-right font-bold text-[#1a5c3a] dark:text-emerald-400 tabular-nums">
                      {money.format(row.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-stone-100 dark:bg-zinc-900 border-t-2 border-stone-300 dark:border-zinc-700 font-bold">
                <tr>
                  <td className="px-4 py-3">GRAND TOTAL</td>
                  {columns.map(cat => {
                    const sum = pivotData.reduce((acc, row) => acc + ((row[cat] as number) || 0), 0)
                    return (
                      <td key={cat} className="px-4 py-3 text-right tabular-nums">
                        {money.format(sum)}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-right text-lg text-emerald-700 dark:text-emerald-400 tabular-nums">
                    {money.format(grandTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          )}
        </div>
      </Card>

      <div className="flex flex-col gap-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Registro de Gastos</h2>
          <p className="text-sm text-stone-500 dark:text-zinc-500">Alta y consulta de gastos generales y por viaje.</p>
        </div>
        <ExpensesTable />
      </div>

    </div>
  )
}
