'use client'

import { useState } from 'react'
import { Link2 } from 'lucide-react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { useExpenseAdvances, useDeleteExpenseAdvance } from '../../hooks/use-expense-assignments'
import type { ExpenseAdvanceEntity } from '../../../domain/entities/expense-assignment-entity'
import { ExpenseAdvanceWizard } from './ExpenseAdvanceWizard'
import { ExpenseAdvanceDetailsDialog } from './ExpenseAdvanceDetailsDialog'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface ExpenseAdvancesTabProps {
  canManage: boolean
}

export function ExpenseAdvancesTab({ canManage }: ExpenseAdvancesTabProps) {
  const advancesQuery = useExpenseAdvances()
  const deleteAdvance = useDeleteExpenseAdvance()
  
  const [isAdvanceWizardOpen, setIsAdvanceWizardOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState<'create' | 'edit'>('create')
  const [selectedAdvance, setSelectedAdvance] = useState<ExpenseAdvanceEntity | undefined>(undefined)

  const advances = advancesQuery.data ?? []

  const ADVANCE_COLUMNS: CrudColumn<ExpenseAdvanceEntity>[] = [
    {
      header: 'Asignación',
      cell: (a) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
            {a.tripFolio ?? 'Sin viaje'}
          </span>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 truncate max-w-[260px]">
            {a.operatorName ?? a.operatorId} · {a.unitLabel ?? '—'}
          </span>
        </div>
      ),
    },
    {
      header: 'Monto',
      cell: (a) => money.format(a.amount),
      className: 'text-sm text-stone-600 dark:text-zinc-400',
    },
    {
      header: 'Método',
      cell: (a) => (
        <Badge variant="outline" className="border-stone-200 dark:border-zinc-700 text-stone-700 dark:text-zinc-300">
          {a.method === 'cash' ? 'Efectivo' : 'Transferencia'}
        </Badge>
      ),
      className: 'w-[140px]',
    },
    {
      header: 'Fecha',
      cell: (a) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(a.assignedAt)),
      className: 'text-sm text-stone-600 dark:text-zinc-400',
    },
    {
      header: 'Estado',
      cell: (a) =>
        a.tripId ? (
          <Badge className="bg-[#1a5c3a] dark:bg-primary-container/80 hover:bg-[#1a5c3a]/90 text-white dark:text-zinc-950 font-bold">
            Vinculado
          </Badge>
        ) : (
          <Badge variant="secondary" className="bg-amber-500/10 text-amber-700 border border-amber-500/20">
            Pendiente
          </Badge>
        ),
      className: 'w-[120px]',
    },
  ]

  const openAdvanceWizard = (mode: 'create' | 'edit', advance?: ExpenseAdvanceEntity) => {
    setWizardMode(mode)
    setSelectedAdvance(advance)
    setIsAdvanceWizardOpen(true)
  }

  const openAdvanceDetails = (advance: ExpenseAdvanceEntity) => {
    setSelectedAdvance(advance)
    setIsDetailsDialogOpen(true)
  }

  const handleDeleteAdvance = async (id: string) => {
    try {
      await deleteAdvance.mutateAsync(id)
      return { ok: true }
    } catch (e) {
      return { ok: false, error: { message: e instanceof Error ? e.message : 'Error desconocido' } }
    }
  }

  return (
    <>
      <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
        <CrudDataTable<ExpenseAdvanceEntity>
          canManage={canManage}
          data={advances}
          isLoading={advancesQuery.isLoading}
          columns={ADVANCE_COLUMNS}
          pageSize={8}
          searchPlaceholder="Buscar por operador o folio..."
          searchFilter={(row, term) =>
            [row.operatorName, row.tripFolio, row.unitLabel, row.notes].some((v) => v?.toLowerCase().includes(term))
          }
          actionLabel="Nueva Asignación"
          onAction={() => openAdvanceWizard('create')}
          onView={openAdvanceDetails}
          onEdit={(a) => openAdvanceWizard('edit', a)}
          onDelete={handleDeleteAdvance}
          deleteConfirmTitle={(a) => a.tripId ? '¿Eliminar asignación vinculada?' : '¿Eliminar asignación?'}
          deleteConfirmDescription={(a) =>
            a.tripId
              ? 'Esta asignación está vinculada a un viaje. Eliminarla afectará las cuentas del viaje. ¿Estás seguro de que deseas eliminarla permanentemente?'
              : 'Esta acción es irreversible. El registro será eliminado permanentemente.'
          }
          emptyState={{
            icon: Link2,
            title: 'Sin asignaciones',
            description: 'Registra una asignación de efectivo/transferencia para un operador.',
          }}
        />
      </div>

      <ExpenseAdvanceWizard
        isOpen={isAdvanceWizardOpen}
        onClose={() => {
          setIsAdvanceWizardOpen(false)
          setSelectedAdvance(undefined)
          setWizardMode('create')
        }}
        advanceRow={selectedAdvance}
        mode={wizardMode}
      />

      <ExpenseAdvanceDetailsDialog
        isOpen={isDetailsDialogOpen}
        onClose={() => {
          setIsDetailsDialogOpen(false)
          setSelectedAdvance(undefined)
        }}
        advance={selectedAdvance || null}
      />
    </>
  )
}
