'use client'

import React, { useMemo, useState } from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Label } from '@/src/core/presentation/components/ui/label'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { CheckCircle2, AlertTriangle, Link2, Unlink } from 'lucide-react'
import type { OperatorSettlementKpiEntity } from '@/src/features/expenses/domain/entities/operator-settlement-entity'
import {
  useCloseOperatorSettlement,
  useExpenseAdvances,
  useLinkExpenseToSettlement,
  useUnlinkExpenseFromSettlement,
} from '@/src/features/expenses/presentation/hooks/use-expense-assignments'
import { toast } from 'sonner'
import { ExpenseWizard } from './ExpenseForm'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const fmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

interface OperatorSettlementDialogProps {
  isOpen: boolean
  onClose: () => void
  settlement: OperatorSettlementKpiEntity | null
  /** Tabla/lista de gastos vinculados al ajuste (settlement_id filter) */
  children?: React.ReactNode
  /** Gastos sin settlement_id para el panel "vincular existente" */
  unlinkedExpenses?: { id: string; description: string; amount: number; expenseDate?: string }[]
}

export function OperatorSettlementDialog({
  isOpen,
  onClose,
  settlement,
  children,
  unlinkedExpenses = [],
}: OperatorSettlementDialogProps) {
  const closeSettlement = useCloseOperatorSettlement()
  const linkExpense = useLinkExpenseToSettlement()
  const unlinkExpense = useUnlinkExpenseFromSettlement()
  const advancesQuery = useExpenseAdvances()
  const advances = advancesQuery.data ?? []

  const [notes, setNotes] = useState('')
  const [showLinkPanel, setShowLinkPanel] = useState(false)
  const [isExpenseWizardOpen, setIsExpenseWizardOpen] = useState(false)

  // Adelantos del operador en el período del ajuste
  const settlementAdvances = useMemo(() => {
    if (!settlement) return []
    return advances.filter((a) => a.operatorId === settlement.operatorId)
  }, [advances, settlement])

  const handleClose = () => {
    setNotes('')
    setShowLinkPanel(false)
    onClose()
  }

  const handleClose_ = async () => {
    if (!settlement) return
    try {
      await closeSettlement.mutateAsync({
        settlementId: settlement.settlementId,
        notes: notes.trim() || null,
      })
      toast.success('Ajuste de cuentas cerrado')
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al cerrar el ajuste')
    }
  }

  const handleLink = async (expenseId: string) => {
    if (!settlement) return
    try {
      await linkExpense.mutateAsync({ expenseId, settlementId: settlement.settlementId })
      toast.success('Gasto vinculado al ajuste')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al vincular gasto')
    }
  }

  const handleUnlink = async (expenseId: string) => {
    try {
      await unlinkExpense.mutateAsync(expenseId)
      toast.success('Gasto desvinculado')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al desvincular gasto')
    }
  }

  if (!settlement) return null

  const isClosed = settlement.status === 'closed'

  const balanceLabel =
    settlement.balanceAmount > 0
      ? 'Saldo a favor de la empresa (El operador debe devolver dinero)'
      : settlement.balanceAmount < 0
        ? 'Saldo a favor del operador (La empresa debe reembolsar)'
        : 'Cuentas cuadradas exactamente'

  const inputClass = cn(
    'h-10 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm',
    'focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#006d37]/30'
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Ajuste de Cuentas — ${settlement.operatorName ?? settlement.operatorId}`}
      description={`Abierto el ${fmt.format(settlement.openedAt)}${isClosed && settlement.closedAt ? ` · Cerrado el ${fmt.format(settlement.closedAt)}` : ''}`}
      size="full"
    >
      <div className="p-6 space-y-6">

        {/* Estado y badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Asignado: {money.format(settlement.assignedAmount)}</Badge>
          <Badge variant="outline">Comprobado: {money.format(settlement.spentAmount)}</Badge>
          <Badge variant="outline">Balance: {money.format(settlement.balanceAmount)}</Badge>
          <Badge variant="outline">{settlement.expenseCount} gasto{settlement.expenseCount !== 1 ? 's' : ''}</Badge>
          {isClosed ? (
            <Badge className="bg-[#1a5c3a] dark:bg-primary-container/80 text-white dark:text-zinc-950 font-bold">
              Cerrado
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20">
              Abierto
            </Badge>
          )}
        </div>

        {/* Resumen financiero + adelantos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Card balance */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Resumen</p>
            <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">{balanceLabel}</p>
            <div className="flex items-center gap-2 mt-3">
              {settlement.balanceAmount > 0 ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : settlement.balanceAmount < 0 ? (
                <AlertTriangle className="size-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="size-4 text-stone-400" />
              )}
              <span
                className={cn(
                  'text-lg font-bold',
                  settlement.balanceAmount > 0 ? 'text-emerald-700' : settlement.balanceAmount < 0 ? 'text-amber-700' : 'text-stone-500'
                )}
              >
                {money.format(Math.abs(settlement.balanceAmount))}
              </span>
            </div>
          </div>

          {/* Adelantos del operador en el período */}
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-2">
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
              Adelantos del operador ({settlement.advanceCount})
            </p>
            <div className="mt-3 space-y-2">
              {settlementAdvances.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-zinc-500">No hay adelantos registrados en este período.</p>
              ) : (
                settlementAdvances.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-700 dark:text-zinc-300">
                      {fmt.format(new Date(a.assignedAt))} · {a.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                      {a.tripFolio ? <span className="ml-1 text-stone-400 dark:text-zinc-500">({a.tripFolio})</span> : null}
                    </span>
                    <span className="font-semibold">{money.format(a.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Gastos vinculados + paneles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Panel izquierdo: gastos vinculados al ajuste */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="p-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Gastos vinculados</p>
                <p className="text-xs text-stone-500 dark:text-zinc-500 mt-0.5">Gastos asignados a este ajuste de cuentas.</p>
              </div>
              {!isClosed && (
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl text-xs gap-1"
                  onClick={() => setShowLinkPanel((v) => !v)}
                >
                  <Link2 className="size-3" />
                  {showLinkPanel ? 'Ocultar' : 'Vincular gasto'}
                </Button>
              )}
            </div>
            <div className="p-4">
              {children}
            </div>
          </div>

          {/* Panel derecho: vincular gasto existente O cerrar ajuste */}
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            {showLinkPanel && !isClosed ? (
              <>
                <div className="p-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Vincular gasto existente</p>
                    <p className="text-xs text-stone-500 dark:text-zinc-500 mt-0.5">
                      Selecciona un gasto sin ajuste asignado para vincularlo a este operador.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="rounded-xl text-xs h-8 px-3" onClick={() => setIsExpenseWizardOpen(true)}>
                    + Nuevo gasto
                  </Button>
                </div>
                <div className="p-4 space-y-2 max-h-64 overflow-y-auto">
                  {unlinkedExpenses.length === 0 ? (
                    <p className="text-sm text-stone-500 dark:text-zinc-500">No hay gastos sin ajuste disponibles.</p>
                  ) : (
                    unlinkedExpenses.map((exp) => (
                      <div
                        key={exp.id}
                        className="flex items-center justify-between p-3 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50/50 dark:bg-zinc-800/50"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-stone-900 dark:text-zinc-100 truncate max-w-[180px]">
                            {exp.description}
                          </span>
                          {exp.expenseDate && (
                            <span className="text-xs text-stone-500 dark:text-zinc-500">
                              {exp.expenseDate}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{money.format(exp.amount)}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="rounded-lg text-xs h-7 px-2"
                            onClick={() => handleLink(exp.id)}
                            disabled={linkExpense.isPending}
                          >
                            Vincular
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : (
              <>
                <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
                  <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Cierre del ajuste</p>
                  <p className="text-xs text-stone-500 dark:text-zinc-500 mt-0.5">
                    {isClosed
                      ? 'Este ajuste ya fue cerrado. No se permiten más cambios.'
                      : 'Revisa que los números cuadren antes de cerrar el ajuste.'}
                  </p>
                </div>
                <div className="p-4 space-y-4">
                  {!isClosed && (
                    <div className="grid gap-2">
                      <Label htmlFor="settlement-notes">Notas (Opcional)</Label>
                      <textarea
                        id="settlement-notes"
                        rows={4}
                        className={cn(inputClass, 'h-auto py-3 resize-none')}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Observaciones del ajuste de cuentas..."
                      />
                    </div>
                  )}

                  {settlement.notes && (
                    <div className="p-3 rounded-xl bg-stone-50 dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700">
                      <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium mb-1">Notas registradas</p>
                      <p className="text-sm text-stone-700 dark:text-zinc-300">{settlement.notes}</p>
                    </div>
                  )}

                  <Button
                    type="button"
                    className="w-full h-10 rounded-xl"
                    disabled={isClosed || closeSettlement.isPending}
                    onClick={handleClose_}
                  >
                    {isClosed ? 'Ajuste cerrado' : 'Cerrar ajuste de cuentas'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Wizard para crear un nuevo gasto desde el dialog */}
      <ExpenseWizard
        isOpen={isExpenseWizardOpen}
        onClose={() => setIsExpenseWizardOpen(false)}
        defaultSettlementId={settlement.settlementId}
        mode="create"
      />
    </Dialog>
  )
}
