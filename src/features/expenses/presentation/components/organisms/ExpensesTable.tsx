'use client'

import React from 'react'
import type { ExpenseEntity } from '../../../domain/entities/expense-entity'
import { EXPENSE_SCOPE } from '../../../domain/entities/expense-entity'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/core/presentation/components/ui/table'

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('es-MX', { year: 'numeric', month: '2-digit', day: '2-digit' }).format(date)
}

function scopeBadge(scope: ExpenseEntity['scope']) {
  if (scope === EXPENSE_SCOPE.Trip) return <Badge variant="secondary">Viaje</Badge>
  return <Badge variant="outline">Operativo</Badge>
}

export function ExpensesTable({ expenses }: { expenses: ExpenseEntity[] }) {
  return (
    <TableContainer>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tipo</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead>Fecha</TableHead>
            <TableHead>Descripción</TableHead>
            <TableHead>Proveedor</TableHead>
            <TableHead>Viaje</TableHead>
            <TableHead className="text-right">Monto</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center text-stone-500">
                Sin gastos para mostrar.
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{scopeBadge(e.scope)}</TableCell>
                <TableCell className="capitalize">{e.category.replaceAll('_', ' ')}</TableCell>
                <TableCell>{formatDate(e.occurredAt)}</TableCell>
                <TableCell className="max-w-[420px]">
                  <div className="truncate" title={e.description}>
                    {e.description}
                  </div>
                  {e.reference ? (
                    <div className="text-xs text-stone-500 truncate" title={e.reference}>
                      {e.reference}
                    </div>
                  ) : null}
                </TableCell>
                <TableCell className="max-w-[220px]">
                  <div className="truncate" title={e.vendorName ?? undefined}>
                    {e.vendorName ?? '—'}
                  </div>
                </TableCell>
                <TableCell>{e.tripId ?? '—'}</TableCell>
                <TableCell className="text-right font-semibold">{money.format(e.amount)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

