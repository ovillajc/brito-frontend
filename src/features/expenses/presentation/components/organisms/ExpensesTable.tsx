'use client'

/**
 * @fileoverview Tabla de Gastos Operativos refactorizada para usar CrudDataTable.
 */

import { useState } from 'react'
import { Receipt, Calendar, CreditCard } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { ExpenseWizard } from './ExpenseForm'
import type { ExpenseEntity } from '../../../domain/entities/expense-entity'
import { useExpenses } from '../../hooks/use-expenses'
import { EXPENSE_FREQUENCY } from '../../../domain/entities/expense-entity'

// ── Entidades de vista ────────────────────────────────────────────────────────

export type ExpensesTableRowEntity = ExpenseEntity

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  maximumFractionDigits: 2,
})

const shortDate = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: 'short',
  day: '2-digit',
})

// ── Definición de columnas ───────────────────────────────────────────────────

const EXPENSES_COLUMNS: CrudColumn<ExpensesTableRowEntity>[] = [
  {
    header: 'Detalle del Gasto',
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors truncate max-w-[200px]">
          {row.description}
        </span>
        <span className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 truncate max-w-[200px]">
          {row.subcategoryName ?? 'Sin detalle'}
        </span>
      </div>
    ),
  },
  {
    header: 'Clasificación',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-stone-100 dark:bg-zinc-800">
          <Receipt className="size-3 text-stone-500 dark:text-zinc-400" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
            {row.categoryName ?? '—'}
          </span>
          <span className="text-[11px] text-stone-400 dark:text-zinc-500">
            {row.cargoTypeName ?? 'Genérico'}
          </span>
        </div>
      </div>
    ),
  },
  {
    header: 'Fecha / Viaje',
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400">
          <Calendar className="size-3 text-stone-400" />
          <span>{shortDate.format(row.expenseDate)}</span>
        </div>
        {row.tripId && (
          <div className="flex items-center gap-1.5 text-xs text-[#006d37] dark:text-primary-container font-mono mt-0.5">
            <span className="truncate max-w-[120px]">VJE-{row.tripId.split('-')[0]}</span>
          </div>
        )}
      </div>
    ),
  },
  {
    header: 'Frecuencia',
    cell: (row) => {
      if (!row.frequency) return <span className="text-stone-400">—</span>
      return (
        <Badge
          variant={row.frequency === EXPENSE_FREQUENCY.Recurrent ? 'secondary' : 'outline'}
          className="capitalize text-[10px]"
        >
          {row.frequency}
        </Badge>
      )
    },
  },
  {
    header: 'Monto',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-emerald-50 dark:bg-emerald-950/20">
          <CreditCard className="size-3 text-emerald-600 dark:text-emerald-400" />
        </div>
        <span className="text-sm font-bold text-stone-900 dark:text-zinc-100 whitespace-nowrap">
          {money.format(row.amount)}
        </span>
      </div>
    ),
  },
]

// ── Props & Componente ────────────────────────────────────────────────────────

interface ExpensesTableProps {
  tripIdFilter?: string
}

export function ExpensesTable({ tripIdFilter }: ExpensesTableProps) {
  const query = useExpenses(tripIdFilter !== 'all' && tripIdFilter ? { tripId: tripIdFilter } : undefined)
  const rows = query.data ?? []

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<ExpensesTableRowEntity | null>(null)
  const [wizardMode, setWizardMode] = useState<'create' | 'edit' | 'view'>('create')

  const handleView = (row: ExpensesTableRowEntity) => {
    setWizardMode('view')
    setSelectedRow(row)
    setIsWizardOpen(true)
  }

  const handleEdit = (row: ExpensesTableRowEntity) => {
    setWizardMode('edit')
    setSelectedRow(row)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedRow(null)
    setWizardMode('create')
  }

  return (
    <>
      <CrudDataTable<ExpensesTableRowEntity>
        data={rows}
        isLoading={query.isLoading}
        columns={EXPENSES_COLUMNS}
        searchPlaceholder="Buscar por descripción, categoría o subcategoría..."
        searchFilter={(row, term) =>
          [row.description, row.categoryName, row.subcategoryName, row.comments]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Nuevo Gasto"
        onAction={() => { setWizardMode('create'); setSelectedRow(null); setIsWizardOpen(true) }}
        onView={handleView}
        onEdit={handleEdit}
        emptyState={{
          icon: Receipt,
          title: 'Sin gastos registrados',
          description: 'Aún no hay gastos registrados en el sistema.',
        }}
      />

      <ExpenseWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        expenseRow={selectedRow ?? undefined}
        defaultTripId={tripIdFilter !== 'all' ? tripIdFilter : undefined}
        mode={wizardMode}
      />
    </>
  )
}
