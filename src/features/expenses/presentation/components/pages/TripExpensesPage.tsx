'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EXPENSE_SCOPE } from '../../../domain/entities/expense-entity'
import { useCreateExpense, useExpenses } from '../../hooks/use-expenses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/core/presentation/components/ui/card'
import { Button } from '@/src/core/presentation/components/ui/button'
import { ExpenseForm } from '../organisms/ExpenseForm'
import { ExpensesTable } from '../organisms/ExpensesTable'

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

export default function TripExpensesPage() {
  const router = useRouter()
  const { data: expenses = [], isLoading, isError, error } = useExpenses()
  const createExpense = useCreateExpense()

  const tripExpenses = useMemo(
    () => expenses.filter((e) => e.scope === EXPENSE_SCOPE.Trip),
    [expenses]
  )

  const tripIds = useMemo(() => {
    const set = new Set<string>()
    for (const e of tripExpenses) {
      if (e.tripId) set.add(e.tripId)
    }
    return Array.from(set).sort()
  }, [tripExpenses])

  const [tripId, setTripId] = useState<string>('all')

  const filtered = useMemo(() => {
    if (tripId === 'all') return tripExpenses
    return tripExpenses.filter((e) => e.tripId === tripId)
  }, [tripExpenses, tripId])

  const total = useMemo(() => filtered.reduce((acc, e) => acc + e.amount, 0), [filtered])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Gastos por viaje</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">
            Revisa qué gastos generaron los viajes y registra nuevos gastos asociados.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/expenses')}>
            Volver a gastos
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Resumen</CardTitle>
          <CardDescription>Filtra por viaje para ver el total y el detalle</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-end gap-3">
            <div className="flex flex-col gap-1 w-full md:max-w-sm">
              <span className="text-xs font-medium text-stone-600">Viaje</span>
              <select
                className="h-10 w-full rounded-md border border-outline-variant/30 bg-white dark:bg-zinc-900 px-3 text-sm"
                value={tripId}
                onChange={(e) => setTripId(e.target.value)}
              >
                <option value="all">Todos</option>
                {tripIds.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-2xl font-bold">{money.format(total)}</div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Registrar gasto de viaje</CardTitle>
          <CardDescription>Usa el ID de viaje para asociar el gasto al viaje correspondiente.</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm
            defaultScope={EXPENSE_SCOPE.Trip}
            isSubmitting={createExpense.isPending}
            onSubmitExpense={async (input) => {
              await createExpense.mutateAsync(input)
            }}
          />
          {createExpense.isError ? (
            <p className="mt-3 text-sm text-red-600">
              {(createExpense.error as Error).message}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detalle</CardTitle>
          <CardDescription>Gastos asociados a viajes</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-sm text-stone-500">Cargando gastos...</p>
          ) : isError ? (
            <p className="text-sm text-red-600">{(error as Error).message}</p>
          ) : (
            <ExpensesTable expenses={filtered} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

