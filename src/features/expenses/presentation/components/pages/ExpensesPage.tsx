'use client'

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { EXPENSE_CATEGORY, EXPENSE_SCOPE, type ExpenseCategory, type ExpenseScope } from '../../../domain/entities/expense-entity'
import { useCreateExpense, useExpenses } from '../../hooks/use-expenses'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/core/presentation/components/ui/card'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Button } from '@/src/core/presentation/components/ui/button'
import { ExpenseForm } from '../organisms/ExpenseForm'
import { ExpensesTable } from '../organisms/ExpensesTable'

const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  [EXPENSE_CATEGORY.Permits]: 'Permisos',
  [EXPENSE_CATEGORY.Certifications]: 'Certificaciones',
  [EXPENSE_CATEGORY.InventoryPurchase]: 'Compras de inventario',
  [EXPENSE_CATEGORY.SpareParts]: 'Refacciones',
  [EXPENSE_CATEGORY.Tools]: 'Herramientas',
  [EXPENSE_CATEGORY.PPE]: 'Equipo EPP',
  [EXPENSE_CATEGORY.Tolls]: 'Casetas',
  [EXPENSE_CATEGORY.FuelLoad]: 'Carga de combustible',
  [EXPENSE_CATEGORY.BaseTankLoad]: 'Carga tanque base',
  [EXPENSE_CATEGORY.TripIncidents]: 'Incidencias de viaje',
  [EXPENSE_CATEGORY.Maintenance]: 'Mantenimientos',
  [EXPENSE_CATEGORY.Other]: 'Otro',
}

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

export default function ExpensesPage() {
  const router = useRouter()
  const { data: expenses = [], isLoading, isError, error } = useExpenses()
  const createExpense = useCreateExpense()

  const [scopeFilter, setScopeFilter] = useState<ExpenseScope | 'all'>('all')
  const [categoryFilter, setCategoryFilter] = useState<ExpenseCategory | 'all'>('all')
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase()
    return expenses.filter((e) => {
      if (scopeFilter !== 'all' && e.scope !== scopeFilter) return false
      if (categoryFilter !== 'all' && e.category !== categoryFilter) return false
      if (!s) return true
      const haystack = [
        e.description,
        e.vendorName ?? '',
        e.reference ?? '',
        e.tripId ?? '',
        e.category,
        e.scope,
      ]
        .join(' ')
        .toLowerCase()
      return haystack.includes(s)
    })
  }, [expenses, scopeFilter, categoryFilter, search])

  const totals = useMemo(() => {
    const total = expenses.reduce((acc, e) => acc + e.amount, 0)
    const totalGeneral = expenses
      .filter((e) => e.scope === EXPENSE_SCOPE.General)
      .reduce((acc, e) => acc + e.amount, 0)
    const totalTrips = expenses
      .filter((e) => e.scope === EXPENSE_SCOPE.Trip)
      .reduce((acc, e) => acc + e.amount, 0)
    return { total, totalGeneral, totalTrips }
  }, [expenses])

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Gastos</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">
            Control general de gastos operativos y gastos asociados a viajes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push('/expenses/trips')}>
            Ver gastos por viaje
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card>
          <CardHeader>
            <CardTitle>Total</CardTitle>
            <CardDescription>Todos los gastos registrados</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money.format(totals.total)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Operativos</CardTitle>
            <CardDescription>Permisos, certificaciones, inventario, base</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money.format(totals.totalGeneral)}</CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Viajes</CardTitle>
            <CardDescription>Casetas, cargas, incidencias, mantenimientos</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money.format(totals.totalTrips)}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registrar gasto</CardTitle>
          <CardDescription>Por ahora se guarda como mock data (sin conexión a base de datos).</CardDescription>
        </CardHeader>
        <CardContent>
          <ExpenseForm
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
          <CardTitle>Listado</CardTitle>
          <CardDescription>Filtra y revisa los gastos registrados</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Buscar</span>
              <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Descripción, proveedor, referencia, viaje..." />
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Tipo</span>
              <select
                className="h-10 w-full rounded-md border border-outline-variant/30 bg-white dark:bg-zinc-900 px-3 text-sm"
                value={scopeFilter}
                onChange={(e) => setScopeFilter(e.target.value as ExpenseScope | 'all')}
              >
                <option value="all">Todos</option>
                <option value={EXPENSE_SCOPE.General}>Operativo</option>
                <option value={EXPENSE_SCOPE.Trip}>Viaje</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <span className="text-xs font-medium text-stone-600">Categoría</span>
              <select
                className="h-10 w-full rounded-md border border-outline-variant/30 bg-white dark:bg-zinc-900 px-3 text-sm"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ExpenseCategory | 'all')}
              >
                <option value="all">Todas</option>
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

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
