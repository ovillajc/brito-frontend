'use client'

import React, { useMemo, useState } from 'react'
import { AlertTriangle, HandCoins, Receipt, CheckCircle2, Link2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useExpenseAdvances, useTripExpenseAssignmentKpis } from '../../hooks/use-expense-assignments'
import type { ExpenseAdvanceEntity, TripExpenseAssignmentKpiEntity } from '../../../domain/entities/expense-assignment-entity'
import { ExpenseAdvanceWizard } from '../organisms/ExpenseAdvanceWizard'
import { ExpenseAdvanceDetailsDialog } from '../organisms/ExpenseAdvanceDetailsDialog'
import { useDeleteExpenseAdvance } from '../../hooks/use-expense-assignments'
import { TripSettlementDialog } from '../organisms/TripSettlementDialog'
import { ExpensesTable } from '@/src/features/expenses/presentation/components/organisms/ExpensesTable'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

export default function ExpenseAssignmentsPage() {
  const advancesQuery = useExpenseAdvances()
  const tripKpisQuery = useTripExpenseAssignmentKpis(200)

  const canManage = useAuthStore((state) => state.hasPermission('expenses:manage'))

  const [isAdvanceWizardOpen, setIsAdvanceWizardOpen] = useState(false)
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false)
  const [wizardMode, setWizardMode] = useState<'create' | 'edit'>('create')
  const [selectedAdvance, setSelectedAdvance] = useState<ExpenseAdvanceEntity | undefined>(undefined)
  
  const deleteAdvance = useDeleteExpenseAdvance()
  const [selectedTrip, setSelectedTrip] = useState<TripExpenseAssignmentKpiEntity | null>(null)
  const [isSettlementOpen, setIsSettlementOpen] = useState(false)

  const advances = advancesQuery.data ?? []
  const tripKpis = tripKpisQuery.data ?? []

  const pendingTrips = useMemo(() => tripKpis.filter((k) => k.settlementStatus === 'pending'), [tripKpis])
  const settledTrips = useMemo(() => tripKpis.filter((k) => k.settlementStatus === 'settled'), [tripKpis])

  const totals = useMemo(() => {
    const assigned = tripKpis.reduce((acc, k) => acc + k.assignedAmount, 0)
    const spent = tripKpis.reduce((acc, k) => acc + k.spentAmount, 0)
    return { assigned, spent, diff: spent - assigned }
  }, [tripKpis])

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
      cell: (a) => new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(a.assignedAt)),
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

  const openSettlement = (trip: TripExpenseAssignmentKpiEntity) => {
    setSelectedTrip(trip)
    setIsSettlementOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="rounded-2xl border-stone-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <HandCoins className="size-4 text-primary" />
              Cantidad Enviada
            </CardTitle>
            <CardDescription>Asignaciones vinculadas a viajes</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money.format(totals.assigned)}</CardContent>
        </Card>

        <Card className="rounded-2xl border-stone-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Receipt className="size-4 text-primary" />
              Cantidad Comprobada
            </CardTitle>
            <CardDescription>Suma de gastos por viaje</CardDescription>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{money.format(totals.spent)}</CardContent>
        </Card>

        <Card className="rounded-2xl border-stone-200 dark:border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {totals.diff >= 0 ? (
                <AlertTriangle className="size-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="size-4 text-emerald-600" />
              )}
              Balance Neto
            </CardTitle>
            <CardDescription>Comprobado - Enviado</CardDescription>
          </CardHeader>
          <CardContent className={cn('text-2xl font-bold', totals.diff >= 0 ? 'text-amber-700' : 'text-emerald-700')}>
            {money.format(totals.diff)}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Cuentas pendientes</h2>
              <p className="text-sm text-stone-500 dark:text-zinc-500">
                Viajes con asignación y sin comprobación registrada.
              </p>
            </div>
            <Badge variant="secondary">{pendingTrips.length}</Badge>
          </div>

          <div className="space-y-3">
            {pendingTrips.length === 0 ? (
              <div className="p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 text-sm text-stone-600 dark:text-zinc-400">
                No hay cuentas pendientes.
              </div>
            ) : (
              pendingTrips.slice(0, 8).map((k) => (
                <button
                  key={k.tripId}
                  onClick={() => openSettlement(k)}
                  className="w-full text-left p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                        {k.tripNumber != null 
                          ? `VJE-${String(k.tripNumber).padStart(6, '0')}` 
                          : (k.folio ?? `VJE-${k.tripId.slice(0, 8)}`)}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">
                        Enviado: {money.format(k.assignedAmount)} · Comprobado: {money.format(k.spentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20">Pendiente</Badge>
                      <p className="text-sm font-bold text-amber-700 mt-2">{money.format(k.balanceAmount)}</p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between mt-2">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Cuentas hechas</h2>
              <p className="text-sm text-stone-500 dark:text-zinc-500">Viajes ya liquidados (historial reciente)</p>
            </div>
            <Badge variant="secondary">{settledTrips.length}</Badge>
          </div>

          <div className="space-y-3">
            {settledTrips.length === 0 ? (
              <div className="p-6 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/50 dark:bg-zinc-900/40 text-sm text-stone-600 dark:text-zinc-400">
                No hay cuentas liquidadas recientemente.
              </div>
            ) : (
              settledTrips.slice(0, 10).map((k) => (
                <button
                  key={k.tripId}
                  onClick={() => openSettlement(k)}
                  className="w-full text-left p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-stone-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-mono font-bold text-stone-900 dark:text-zinc-100">
                        {k.tripNumber != null 
                          ? `VJE-${String(k.tripNumber).padStart(6, '0')}` 
                          : (k.folio ?? `VJE-${k.tripId.slice(0, 8)}`)}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">
                        Enviado: {money.format(k.assignedAmount)} · Comprobado: {money.format(k.spentAmount)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className="bg-[#1a5c3a] dark:bg-primary-container/80 text-white dark:text-zinc-950 font-bold">Hechas</Badge>
                      <p className={cn('text-sm font-bold mt-2', k.balanceAmount > 0 ? 'text-emerald-700' : k.balanceAmount < 0 ? 'text-amber-700' : 'text-stone-500')}>
                        {money.format(Math.abs(k.balanceAmount))}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <CrudDataTable<ExpenseAdvanceEntity>
            canManage={canManage}
            data={advances}
            isLoading={advancesQuery.isLoading}
            columns={ADVANCE_COLUMNS}
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
      </div>

      <TripSettlementDialog
        isOpen={isSettlementOpen}
        onClose={() => { setIsSettlementOpen(false); setSelectedTrip(null) }}
        trip={selectedTrip}
      >
        {selectedTrip?.tripId ? <ExpensesTable tripIdFilter={selectedTrip.tripId} /> : null}
      </TripSettlementDialog>

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
    </div>
  )
}
