'use client'

import React, { useMemo, useState } from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Input } from '@/src/core/presentation/components/ui/input'
import { cn } from '@/src/core/infrastructure/utils/cn'
import {
  CheckCircle2,
  AlertTriangle,
  Link2,
  ChevronDown,
  ChevronRight,
  Plus,
  Receipt,
  TrendingUp,
  TrendingDown,
  Minus,
  Wallet,
  MapPin,
  ArrowUpCircle,
  RotateCcw,
  Lock,
  Unlock,
  Clock,
  X,
  Loader2,
  Search,
} from 'lucide-react'
import type { OperatorSettlementKpiEntity } from '@/src/features/expenses/domain/entities/operator-settlement-entity'
import {
  useCloseOperatorSettlement,
  useCreateTripSettlement,
  useDeleteTripSettlement,
  useExpenseAdvances,
  useLinkExpenseToSettlement,
  useTripExpenseAssignmentKpis,
} from '@/src/features/expenses/presentation/hooks/use-expense-assignments'
import { toast } from 'sonner'
import { ExpenseWizard } from './ExpenseForm'
import { TripExpenseEntryForm } from './TripExpenseEntryForm'
import { useExpenses } from '@/src/features/expenses/presentation/hooks/use-expenses'
import type { TripExpenseAssignmentKpiEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const fmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })

interface OperatorSettlementDialogProps {
  isOpen: boolean
  onClose: () => void
  settlement: OperatorSettlementKpiEntity | null
  children?: React.ReactNode
  unlinkedExpenses?: {
    id: string
    tripId?: string | null
    isFuelTankPurchase?: boolean
    description: string
    amount: number
    expenseDate?: string
    rawExpenseDate?: string | Date
  }[]
}

export function OperatorSettlementDialog({
  isOpen,
  onClose,
  settlement,
  children,
  unlinkedExpenses = [],
}: OperatorSettlementDialogProps) {
  const closeSettlement = useCloseOperatorSettlement()
  const createTripSettlement = useCreateTripSettlement()
  const deleteTripSettlement = useDeleteTripSettlement()
  const linkExpense = useLinkExpenseToSettlement()
  const advancesQuery = useExpenseAdvances()
  const tripKpisQuery = useTripExpenseAssignmentKpis()

  const [notes, setNotes] = useState('')
  const [isExpenseWizardOpen, setIsExpenseWizardOpen] = useState(false)
  const [mode, setMode] = useState<'general' | 'trip'>('general')
  const [expandedTripId, setExpandedTripId] = useState<string | null>(null)
  const [showEntryForm, setShowEntryForm] = useState(false)
  const [unlinkedSearch, setUnlinkedSearch] = useState('')
  const [showAllUnlinked, setShowAllUnlinked] = useState(false)

  const settlementAdvances = useMemo(() => {
    if (!settlement) return []
    return (advancesQuery.data ?? []).filter((a) => a.operatorId === settlement.operatorId)
  }, [advancesQuery.data, settlement])

  const operatorTrips = useMemo(() => {
    if (!settlement) return []
    return (tripKpisQuery.data ?? []).filter((t) => t.operatorId === settlement.operatorId)
  }, [tripKpisQuery.data, settlement])

  const settledTrips = useMemo(() => operatorTrips.filter((t) => t.isSettled), [operatorTrips])
  const pendingTrips = useMemo(() => operatorTrips.filter((t) => !t.isSettled), [operatorTrips])

  const filteredUnlinkedExpenses = useMemo(() => {
    let list = unlinkedExpenses.filter((expense) => !expense.tripId && !expense.isFuelTankPurchase)
    
    if (unlinkedSearch) {
      const q = unlinkedSearch.toLowerCase()
      list = list.filter(e => e.description.toLowerCase().includes(q))
    }
    
    if (!showAllUnlinked) {
      const oneMonthAgo = new Date()
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
      
      list = list.filter(e => {
        if (!e.rawExpenseDate) return true
        const expDate = new Date(e.rawExpenseDate)
        return expDate >= oneMonthAgo
      })
    }
    return list
  }, [unlinkedExpenses, unlinkedSearch, showAllUnlinked])

  const handleClose = () => {
    setNotes('')
    onClose()
  }

  const handleCloseSettlement = async () => {
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

  if (!settlement) return null

  const isClosed = settlement.status === 'closed'
  const balance = settlement.balanceAmount
  const balancePositive = balance > 0
  const balanceNegative = balance < 0
  const balanceZero = balance === 0

  // Iniciales del operador para avatar
  const operatorInitials = (settlement.operatorName ?? 'OP')
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      size="full"
      hideDefaultHeader
    >
      <div className="flex flex-col h-full">
        {/* ── HEADER VISUAL ─────────────────────────────────────────────── */}
        <div
          className={cn(
            'relative shrink-0 px-6 pt-5 pb-4 border-b',
            isClosed
              ? 'bg-linear-to-r from-stone-50 to-stone-100 dark:from-zinc-900 dark:to-zinc-800 border-stone-200 dark:border-zinc-700'
              : 'bg-linear-to-r from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-zinc-900 border-emerald-100/80 dark:border-emerald-900/40'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className={cn(
                  'size-12 rounded-2xl flex items-center justify-center text-lg font-bold shadow-sm shrink-0',
                  isClosed
                    ? 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300'
                    : 'bg-[#1a5c3a] text-white shadow-[#1a5c3a]/20'
                )}
              >
                {operatorInitials}
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 leading-tight">
                    {settlement.operatorName ?? settlement.operatorId}
                  </h2>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                      isClosed
                        ? 'bg-stone-200/80 text-stone-600 dark:bg-zinc-700 dark:text-zinc-300'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}
                  >
                    {isClosed ? <Lock className="size-2.5" /> : <Unlock className="size-2.5" />}
                    {isClosed ? 'Cerrado' : 'Abierto'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5 flex items-center gap-1">
                  <Clock className="size-3" />
                  Abierto el {fmt.format(settlement.openedAt)}
                  {isClosed && settlement.closedAt && ` · Cerrado el ${fmt.format(settlement.closedAt)}`}
                </p>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className="size-8 flex items-center justify-center rounded-full hover:bg-stone-100 dark:hover:bg-zinc-700 transition-colors shrink-0 text-stone-500"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            <div className="bg-white dark:bg-zinc-800/60 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60">
              <p className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Asignado</p>
              <p className="text-base font-bold text-stone-800 dark:text-zinc-100 mt-0.5">{money.format(settlement.assignedAmount)}</p>
            </div>
            <div className="bg-white dark:bg-zinc-800/60 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60">
              <p className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Comprobado</p>
              <p className="text-base font-bold text-stone-800 dark:text-zinc-100 mt-0.5">{money.format(settlement.spentAmount)}</p>
            </div>
            <div
              className={cn(
                'rounded-xl p-3 border',
                balancePositive
                  ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200/60 dark:border-emerald-800/40'
                  : balanceNegative
                    ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200/60 dark:border-amber-800/40'
                    : 'bg-white dark:bg-zinc-800/60 border-stone-100 dark:border-zinc-700/60'
              )}
            >
              <div className="flex items-center gap-1">
                <p className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Balance</p>
                {balancePositive && <TrendingUp className="size-3 text-emerald-500" />}
                {balanceNegative && <TrendingDown className="size-3 text-amber-500" />}
                {balanceZero && <Minus className="size-3 text-stone-400" />}
              </div>
              <p
                className={cn(
                  'text-base font-bold mt-0.5',
                  balancePositive ? 'text-emerald-700 dark:text-emerald-400' : balanceNegative ? 'text-amber-700 dark:text-amber-400' : 'text-stone-500'
                )}
              >
                {balanceNegative ? '-' : ''}{money.format(Math.abs(balance))}
              </p>
            </div>
            <div className="bg-white dark:bg-zinc-800/60 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60">
              <p className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Gastos</p>
              <p className="text-base font-bold text-stone-800 dark:text-zinc-100 mt-0.5">{settlement.expenseCount}</p>
            </div>
          </div>

          {/* Tab selector */}
          <div className="flex gap-1 mt-4 bg-stone-100/70 dark:bg-zinc-800/60 rounded-xl p-1 w-fit">
            {(['general', 'trip'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150',
                  mode === tab
                    ? 'bg-white dark:bg-zinc-700 text-stone-900 dark:text-zinc-100 shadow-sm'
                    : 'text-stone-500 dark:text-zinc-400 hover:text-stone-700 dark:hover:text-zinc-200'
                )}
              >
                {tab === 'general' ? 'General' : 'Por viaje'}
                {tab === 'trip' && operatorTrips.length > 0 && (
                  <span
                    className={cn(
                      'ml-1.5 inline-flex items-center justify-center size-4 rounded-full text-[10px] font-bold',
                      mode === 'trip'
                        ? 'bg-[#1a5c3a] text-white'
                        : 'bg-stone-200 dark:bg-zinc-600 text-stone-600 dark:text-zinc-300'
                    )}
                  >
                    {operatorTrips.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {mode === 'general' ? (
            <div className="p-6 space-y-5">

              {/* Banner de balance */}
              {!balanceZero && (
                <div
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium',
                    balancePositive
                      ? 'bg-emerald-50 border-emerald-200/70 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800/40 dark:text-emerald-300'
                      : 'bg-amber-50 border-amber-200/70 text-amber-800 dark:bg-amber-900/20 dark:border-amber-800/40 dark:text-amber-300'
                  )}
                >
                  {balancePositive
                    ? <CheckCircle2 className="size-4 shrink-0" />
                    : <AlertTriangle className="size-4 shrink-0" />}
                  {balancePositive
                    ? `El operador debe devolver ${money.format(Math.abs(balance))} a la empresa`
                    : `La empresa debe reembolsar ${money.format(Math.abs(balance))} al operador`}
                </div>
              )}

              {/* Alertas de viajes pendientes */}
              {pendingTrips.length > 0 && (
                <div className="rounded-xl border border-amber-200/60 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="size-7 rounded-lg bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center">
                      <AlertTriangle className="size-4 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                        {pendingTrips.length} viaje{pendingTrips.length !== 1 ? 's' : ''} sin liquidar
                      </p>
                      <p className="text-xs text-stone-500 dark:text-zinc-500">
                        Cambia a &quot;Por viaje&quot; para marcarlos como hechos
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setMode('trip')}
                      className="ml-auto text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline"
                    >
                      Ver viajes →
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {pendingTrips.slice(0, 6).map((t) => {
                      const label = t.tripNumber != null
                        ? `VJE-${String(t.tripNumber).padStart(6, '0')}`
                        : (t.folio ?? `VJE-${t.tripId.slice(0, 6)}`)
                      return (
                        <span
                          key={t.tripId}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-amber-200/60 dark:border-amber-800/30 text-[11px] font-medium text-stone-700 dark:text-zinc-300"
                        >
                          <MapPin className="size-2.5 text-amber-500" />
                          {label}
                        </span>
                      )
                    })}
                    {pendingTrips.length > 6 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-700 text-[11px] text-stone-400">
                        +{pendingTrips.length - 6} más
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* ── Panel izquierdo: adelantos + gastos ── */}
                <div className="space-y-4">
                  {/* Adelantos */}
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-700/60 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-stone-50/70 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-700/40">
                      <div className="size-6 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                        <Wallet className="size-3.5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100">
                        Adelantos
                      </p>
                      <Badge
                        variant="outline"
                        className="ml-auto text-[10px] h-5 px-1.5"
                      >
                        {settlement.advanceCount}
                      </Badge>
                    </div>
                    <div className="p-3 space-y-1.5">
                      {settlementAdvances.length === 0 ? (
                        <div className="py-4 text-center">
                          <Wallet className="size-6 text-stone-200 dark:text-zinc-700 mx-auto mb-1" />
                          <p className="text-xs text-stone-400 dark:text-zinc-500">Sin adelantos registrados</p>
                        </div>
                      ) : (
                        settlementAdvances.slice(0, 8).map((a) => (
                          <div
                            key={a.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50/60 dark:bg-zinc-900/40 hover:bg-stone-100/60 dark:hover:bg-zinc-800/60 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-stone-700 dark:text-zinc-300 truncate">
                                {a.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                                {a.tripFolio && <span className="ml-1 text-stone-400 dark:text-zinc-500">· {a.tripFolio}</span>}
                              </p>
                              <p className="text-[10px] text-stone-400 dark:text-zinc-500">
                                {fmt.format(new Date(a.assignedAt))}
                              </p>
                            </div>
                            <span className="text-sm font-bold text-stone-800 dark:text-zinc-200 ml-2 shrink-0">
                              {money.format(a.amount)}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Gastos vinculados */}
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-700/60 overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 bg-stone-50/70 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-700/40">
                      <div className="size-6 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                        <Receipt className="size-3.5 text-violet-600 dark:text-violet-400" />
                      </div>
                      <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Gastos vinculados</p>
                      {!isClosed && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto h-6 px-2 text-[10px] rounded-lg gap-1"
                          onClick={() => setIsExpenseWizardOpen(true)}
                        >
                          <Plus className="size-2.5" />
                          Nuevo
                        </Button>
                      )}
                    </div>
                    <div className="p-3">
                      {children}
                    </div>
                  </div>
                </div>

                {/* ── Panel derecho: vincular + cerrar ── */}
                <div className="space-y-4">
                  {/* Vincular existentes */}
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-700/60 overflow-hidden">
                    <div className="flex flex-col gap-2 px-4 py-3 bg-stone-50/70 dark:bg-zinc-800/40 border-b border-stone-100 dark:border-zinc-700/40">
                      <div className="flex items-center gap-2">
                        <div className="size-6 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center shrink-0">
                          <Link2 className="size-3.5 text-teal-600 dark:text-teal-400" />
                        </div>
                        <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100">Vincular gasto existente</p>
                      </div>
                      
                      <div className="relative mt-2">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-stone-400 dark:text-zinc-500" />
                        <Input
                          placeholder="Buscar gasto..."
                          value={unlinkedSearch}
                          onChange={(e) => setUnlinkedSearch(e.target.value)}
                          className="pl-9 h-9 text-sm bg-white dark:bg-zinc-900/50"
                        />
                      </div>
                    </div>
                    <div className="p-3 space-y-1.5 max-h-56 overflow-y-auto">
                      {filteredUnlinkedExpenses.length === 0 ? (
                        <div className="py-4 text-center">
                          <Link2 className="size-6 text-stone-200 dark:text-zinc-700 mx-auto mb-1" />
                          <p className="text-xs text-stone-400 dark:text-zinc-500">
                            No hay gastos sin ajuste encontrados
                          </p>
                        </div>
                      ) : (
                        filteredUnlinkedExpenses.map((exp) => (
                          <div
                            key={exp.id}
                            className="flex items-center justify-between px-3 py-2 rounded-lg bg-stone-50/60 dark:bg-zinc-900/40 border border-transparent hover:border-stone-200 dark:hover:border-zinc-700 transition-all"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-stone-800 dark:text-zinc-200 truncate max-w-[180px]">
                                {exp.description}
                              </p>
                              {exp.expenseDate && (
                                <p className="text-[10px] text-stone-400 dark:text-zinc-500">{exp.expenseDate}</p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                                {money.format(exp.amount)}
                              </span>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-6 px-2 text-[10px] rounded-lg"
                                onClick={() => handleLink(exp.id)}
                                disabled={isClosed || linkExpense.isPending}
                              >
                                Vincular
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                      
                      {!showAllUnlinked && unlinkedExpenses.length > filteredUnlinkedExpenses.length && (
                        <div className="pt-2 text-center border-t border-stone-100 dark:border-zinc-800/50 mt-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setShowAllUnlinked(true)}
                            className="text-xs text-stone-500 hover:text-stone-800 dark:text-zinc-400 dark:hover:text-zinc-200"
                          >
                            Cargar histórico
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Cierre del ajuste */}
                  <div
                    className={cn(
                      'rounded-xl border overflow-hidden',
                      isClosed
                        ? 'border-stone-200 dark:border-zinc-700/60'
                        : 'border-[#1a5c3a]/20 dark:border-emerald-800/30'
                    )}
                  >
                    <div
                      className={cn(
                        'flex items-center gap-2 px-4 py-3 border-b',
                        isClosed
                          ? 'bg-stone-50/70 dark:bg-zinc-800/40 border-stone-100 dark:border-zinc-700/40'
                          : 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100/60 dark:border-emerald-900/20'
                      )}
                    >
                      <div
                        className={cn(
                          'size-6 rounded-lg flex items-center justify-center',
                          isClosed
                            ? 'bg-stone-100 dark:bg-zinc-700'
                            : 'bg-[#1a5c3a]/10 dark:bg-emerald-900/30'
                        )}
                      >
                        {isClosed
                          ? <Lock className="size-3.5 text-stone-500 dark:text-zinc-400" />
                          : <Unlock className="size-3.5 text-[#1a5c3a] dark:text-emerald-400" />}
                      </div>
                      <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100">
                        {isClosed ? 'Ajuste cerrado' : 'Cerrar ajuste de cuentas'}
                      </p>
                    </div>
                    <div className="p-4 space-y-3">
                      {isClosed ? (
                        <div className="space-y-2">
                          <p className="text-xs text-stone-500 dark:text-zinc-400">
                            Este ajuste fue cerrado y no permite más cambios.
                          </p>
                          {settlement.notes && (
                            <div className="p-3 rounded-lg bg-stone-50 dark:bg-zinc-800/60 border border-stone-200 dark:border-zinc-700">
                              <p className="text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wide mb-1">
                                Notas registradas
                              </p>
                              <p className="text-sm text-stone-700 dark:text-zinc-300 leading-relaxed">
                                {settlement.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <>
                          <p className="text-xs text-stone-500 dark:text-zinc-400">
                            Revisa que los números cuadren antes de cerrar el ajuste. Esta acción marca el ajuste como finalizado.
                          </p>
                          <div className="space-y-1.5">
                            <label
                              htmlFor="settlement-notes"
                              className="text-xs font-medium text-stone-600 dark:text-zinc-400"
                            >
                              Notas finales (Opcional)
                            </label>
                            <textarea
                              id="settlement-notes"
                              rows={3}
                              className={cn(
                                'w-full rounded-xl border border-stone-200 dark:border-zinc-700',
                                'bg-white dark:bg-zinc-800 px-3 py-2 text-sm text-stone-900 dark:text-zinc-100',
                                'placeholder:text-stone-400 dark:placeholder:text-zinc-500',
                                'focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/25 focus:border-[#1a5c3a]/40',
                                'resize-none transition-all'
                              )}
                              value={notes}
                              onChange={(e) => setNotes(e.target.value)}
                              placeholder="Observaciones del cierre del ajuste..."
                            />
                          </div>
                          <Button
                            type="button"
                            className={cn(
                              'w-full h-10 rounded-xl font-semibold gap-2 transition-all',
                              'bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white shadow-sm shadow-[#1a5c3a]/20'
                            )}
                            disabled={closeSettlement.isPending}
                            onClick={handleCloseSettlement}
                          >
                            {closeSettlement.isPending ? (
                              <><Loader2 className="size-4 animate-spin" /> Cerrando...</>
                            ) : (
                              <><Lock className="size-4" /> Cerrar ajuste de cuentas</>
                            )}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* ── VISTA POR VIAJE ──────────────────────────────────────── */
            <div className="p-6 space-y-3">
              {/* Header de sección */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                    Viajes del operador
                  </p>
                  <p className="text-xs text-stone-500 dark:text-zinc-500 mt-0.5">
                    Expande un viaje para registrar gastos o marcar la liquidación
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {settledTrips.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      <CheckCircle2 className="size-2.5" />
                      {settledTrips.length} liquidado{settledTrips.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {pendingTrips.length > 0 && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                      <Clock className="size-2.5" />
                      {pendingTrips.length} pendiente{pendingTrips.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>

              {operatorTrips.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="size-14 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <MapPin className="size-7 text-stone-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-sm font-medium text-stone-500 dark:text-zinc-400">
                    Sin viajes registrados
                  </p>
                  <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
                    No hay viajes asociados a este operador en el período del ajuste
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {operatorTrips.map((t) => {
                    const isExpanded = expandedTripId === t.tripId
                    const tripLabel = t.tripNumber != null
                      ? `VJE-${String(t.tripNumber).padStart(6, '0')}`
                      : (t.folio ?? `VJE-${t.tripId.slice(0, 8)}`)

                    return (
                      <TripAccordionPanel
                        key={t.tripId}
                        trip={t}
                        tripLabel={tripLabel}
                        isExpanded={isExpanded}
                        onToggle={() => {
                          setExpandedTripId(isExpanded ? null : t.tripId)
                          setShowEntryForm(false)
                        }}
                        settlementId={settlement.settlementId}
                        showEntryForm={isExpanded && showEntryForm}
                        onShowEntryForm={() => setShowEntryForm(true)}
                        onHideEntryForm={() => setShowEntryForm(false)}
                        isClosed={isClosed}
                        onSettleTrip={async (tripId, operatorId, tripNotes) => {
                          await createTripSettlement.mutateAsync({ tripId, operatorId, notes: tripNotes })
                        }}
                        onUnsettleTrip={async (tripId) => {
                          await deleteTripSettlement.mutateAsync(tripId)
                        }}
                        isSettlingTrip={createTripSettlement.isPending || deleteTripSettlement.isPending}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <ExpenseWizard
        isOpen={isExpenseWizardOpen}
        onClose={() => setIsExpenseWizardOpen(false)}
        defaultSettlementId={settlement.settlementId}
        mode="create"
      />
    </Dialog>
  )
}

// ── TripAccordionPanel ─────────────────────────────────────────────────────────

interface TripAccordionPanelProps {
  trip: TripExpenseAssignmentKpiEntity
  tripLabel: string
  isExpanded: boolean
  onToggle: () => void
  settlementId: string
  showEntryForm: boolean
  onShowEntryForm: () => void
  onHideEntryForm: () => void
  isClosed: boolean
  onSettleTrip: (tripId: string, operatorId: string | null, notes: string | null) => Promise<unknown>
  onUnsettleTrip: (tripId: string) => Promise<unknown>
  isSettlingTrip: boolean
}

const moneyFmt = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'short' })

function TripAccordionPanel({
  trip,
  tripLabel,
  isExpanded,
  onToggle,
  settlementId,
  showEntryForm,
  onShowEntryForm,
  onHideEntryForm,
  isClosed,
  onSettleTrip,
  onUnsettleTrip,
  isSettlingTrip,
}: TripAccordionPanelProps) {
  const [tripNotes, setTripNotes] = useState('')

  const expensesQuery = useExpenses(
    { settlementId, tripId: trip.tripId },
    { enabled: isExpanded }
  )
  const expenses = expensesQuery.data ?? []
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)

  // Progreso de comprobación
  const progressPct = trip.assignedAmount > 0
    ? Math.min(100, (trip.spentAmount / trip.assignedAmount) * 100)
    : 0

  const handleTripSettlement = async () => {
    try {
      await onSettleTrip(trip.tripId, trip.operatorId ?? null, tripNotes.trim() || null)
      toast.success(`Liquidación registrada para ${tripLabel}`)
      setTripNotes('')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar liquidación del viaje')
    }
  }

  const handleUnsettle = async () => {
    try {
      await onUnsettleTrip(trip.tripId)
      toast.success(`Liquidación deshecha para ${tripLabel}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al deshacer liquidación del viaje')
    }
  }

  return (
    <div
      className={cn(
        'rounded-2xl border transition-all duration-200 overflow-hidden',
        isExpanded
          ? 'border-[#1a5c3a]/25 dark:border-emerald-800/50 shadow-md shadow-[#1a5c3a]/5'
          : trip.isSettled
            ? 'border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/20 dark:bg-emerald-900/5'
            : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50'
      )}
    >
      {/* Cabecera */}
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-stone-50/80 dark:hover:bg-zinc-800/30 transition-colors"
        onClick={onToggle}
      >
        {/* Ícono estado */}
        <div
          className={cn(
            'size-9 rounded-xl flex items-center justify-center shrink-0 transition-all',
            isExpanded
              ? 'bg-[#1a5c3a] text-white shadow-sm'
              : trip.isSettled
                ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                : 'bg-stone-100 dark:bg-zinc-800 text-stone-400 dark:text-zinc-500'
          )}
        >
          {isExpanded
            ? <ChevronDown className="size-4" />
            : trip.isSettled
              ? <CheckCircle2 className="size-4" />
              : <ChevronRight className="size-4" />}
        </div>

        {/* Info principal */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">{tripLabel}</p>
            {trip.isSettled ? (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                <CheckCircle2 className="size-2.5" /> Liquidado
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                <Clock className="size-2.5" /> Pendiente
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1">
            <p className="text-[11px] text-stone-500 dark:text-zinc-500">
              Adelanto: {moneyFmt.format(trip.assignedAmount)}
            </p>
            {/* Mini progress bar */}
            <div className="flex-1 max-w-[80px] h-1 bg-stone-200 dark:bg-zinc-700 rounded-full overflow-hidden hidden sm:block">
              <div
                className={cn(
                  'h-full rounded-full transition-all duration-500',
                  progressPct >= 100 ? 'bg-emerald-500' : progressPct > 0 ? 'bg-amber-400' : 'bg-stone-300 dark:bg-zinc-600'
                )}
                style={{ width: `${progressPct}%` }}
              />
            </div>
            {isExpanded && expenses.length > 0 && (
              <span className="text-[10px] text-stone-400 dark:text-zinc-500">
                {expenses.length} gasto{expenses.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Balance */}
        <div className="text-right shrink-0">
          <p
            className={cn(
              'text-sm font-bold',
              trip.balanceAmount > 0
                ? 'text-emerald-700 dark:text-emerald-400'
                : trip.balanceAmount < 0
                  ? 'text-amber-700 dark:text-amber-400'
                  : 'text-stone-500'
            )}
          >
            {moneyFmt.format(trip.balanceAmount)}
          </p>
          <p className="text-[10px] text-stone-400 dark:text-zinc-500">balance</p>
        </div>
      </button>

      {/* Contenido expandido */}
      {isExpanded && (
        <div className="border-t border-stone-100 dark:border-zinc-800">
          <div className="p-4 space-y-4">

            {/* Mini KPIs del viaje */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { label: 'Adelanto', value: moneyFmt.format(trip.assignedAmount), icon: ArrowUpCircle, color: 'text-blue-500' },
                { label: 'Gastado', value: moneyFmt.format(trip.spentAmount), icon: Receipt, color: 'text-violet-500' },
                { label: 'Balance', value: moneyFmt.format(trip.balanceAmount), icon: trip.balanceAmount >= 0 ? TrendingUp : TrendingDown, color: trip.balanceAmount >= 0 ? 'text-emerald-500' : 'text-amber-500' },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="bg-stone-50/70 dark:bg-zinc-800/40 rounded-xl p-2.5 text-center">
                  <Icon className={cn('size-3.5 mx-auto mb-1', color)} />
                  <p className="text-xs font-bold text-stone-800 dark:text-zinc-100">{value}</p>
                  <p className="text-[9px] text-stone-400 dark:text-zinc-500 uppercase tracking-wide">{label}</p>
                </div>
              ))}
            </div>

            {/* Lista de gastos */}
            {expensesQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-4 text-stone-400 dark:text-zinc-500">
                <Loader2 className="size-4 animate-spin" />
                <span className="text-xs">Cargando gastos…</span>
              </div>
            ) : expenses.length === 0 && !showEntryForm ? (
              <div className="py-4 text-center">
                <Receipt className="size-6 text-stone-200 dark:text-zinc-700 mx-auto mb-1.5" />
                <p className="text-xs text-stone-400 dark:text-zinc-500">
                  No hay gastos registrados para este viaje
                </p>
              </div>
            ) : expenses.length > 0 ? (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold text-stone-400 dark:text-zinc-500 uppercase tracking-wide px-1">
                  Gastos registrados
                </p>
                {expenses.map((exp) => (
                  <div
                    key={exp.id}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-stone-50/60 dark:bg-zinc-900/50 border border-stone-100 dark:border-zinc-800"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-stone-800 dark:text-zinc-200 truncate">
                        {exp.categoryName ?? '—'}
                        {exp.description ? <span className="text-stone-400 dark:text-zinc-500"> · {exp.description}</span> : null}
                      </p>
                      <p className="text-[10px] text-stone-400 dark:text-zinc-500">
                        {dateFmt.format(new Date(exp.expenseDate))}
                        {exp.subcategoryName ? ` · ${exp.subcategoryName}` : ''}
                      </p>
                    </div>
                    <p className="text-sm font-bold text-stone-800 dark:text-zinc-200 ml-3 shrink-0">
                      {moneyFmt.format(exp.amount)}
                    </p>
                  </div>
                ))}
                <div className="flex items-center justify-between px-3 pt-2 border-t border-stone-200 dark:border-zinc-700">
                  <p className="text-xs text-stone-500 dark:text-zinc-400 font-medium">Total gastos</p>
                  <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">{moneyFmt.format(totalExpenses)}</p>
                </div>
              </div>
            ) : null}

            {/* Formulario inline */}
            {!isClosed && (
              <div className="space-y-3">
                {showEntryForm ? (
                  <div className="p-4 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 space-y-3">
                    <p className="text-xs font-semibold text-stone-700 dark:text-zinc-300">
                      Registrar nuevo gasto
                    </p>
                    <TripExpenseEntryForm
                      settlementId={settlementId}
                      tripId={trip.tripId}
                      tripFolio={tripLabel}
                      onSaved={() => {
                        onHideEntryForm()
                        expensesQuery.refetch()
                      }}
                      onCancel={onHideEntryForm}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-stone-300 dark:border-zinc-700 text-xs font-medium text-stone-500 dark:text-zinc-400 hover:bg-stone-50 dark:hover:bg-zinc-800/40 hover:border-stone-400 dark:hover:border-zinc-600 transition-all"
                    onClick={onShowEntryForm}
                  >
                    <Plus className="size-3.5" />
                    Agregar gasto a este viaje
                  </button>
                )}

                {/* Sección liquidar / deshacer */}
                <div
                  className={cn(
                    'rounded-xl border p-4 space-y-3',
                    trip.isSettled
                      ? 'border-emerald-200/60 dark:border-emerald-900/30 bg-emerald-50/40 dark:bg-emerald-900/10'
                      : 'border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900'
                  )}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={cn(
                        'size-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                        trip.isSettled
                          ? 'bg-emerald-100 dark:bg-emerald-900/40'
                          : 'bg-stone-100 dark:bg-zinc-800'
                      )}
                    >
                      {trip.isSettled
                        ? <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        : <ArrowUpCircle className="size-3.5 text-stone-400" />}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-stone-800 dark:text-zinc-100">
                        {trip.isSettled ? 'Viaje liquidado' : 'Liquidar este viaje'}
                      </p>
                      <p className="text-[11px] text-stone-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                        {trip.isSettled
                          ? 'Las cuentas ya fueron marcadas como hechas. Puedes deshacerlo si necesitas hacer correcciones.'
                          : 'Marca las cuentas como hechas usando los gastos registrados arriba.'}
                      </p>
                    </div>
                  </div>

                  {!trip.isSettled && (
                    <div className="space-y-1.5">
                      <label
                        htmlFor={`trip-notes-${trip.tripId}`}
                        className="text-[11px] font-medium text-stone-500 dark:text-zinc-400"
                      >
                        Notas (Opcional)
                      </label>
                      <textarea
                        id={`trip-notes-${trip.tripId}`}
                        rows={2}
                        className={cn(
                          'w-full rounded-xl border border-stone-200 dark:border-zinc-700',
                          'bg-stone-50 dark:bg-zinc-800 px-3 py-2 text-sm',
                          'placeholder:text-stone-400 dark:placeholder:text-zinc-500',
                          'text-stone-900 dark:text-zinc-100',
                          'focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/25',
                          'resize-none'
                        )}
                        value={tripNotes}
                        onChange={(e) => setTripNotes(e.target.value)}
                        placeholder="Observaciones de la liquidación..."
                      />
                    </div>
                  )}

                  {!trip.isSettled ? (
                    <Button
                      type="button"
                      className="w-full h-9 rounded-xl text-sm font-semibold bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white gap-2 shadow-sm shadow-[#1a5c3a]/15"
                      disabled={isSettlingTrip}
                      onClick={handleTripSettlement}
                    >
                      {isSettlingTrip ? (
                        <><Loader2 className="size-4 animate-spin" /> Procesando...</>
                      ) : (
                        <><CheckCircle2 className="size-4" /> Marcar cuentas hechas</>
                      )}
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full h-9 rounded-xl text-sm font-medium gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/15 dark:text-red-400"
                      disabled={isSettlingTrip}
                      onClick={handleUnsettle}
                    >
                      {isSettlingTrip ? (
                        <><Loader2 className="size-4 animate-spin" /> Procesando...</>
                      ) : (
                        <><RotateCcw className="size-3.5" /> Deshacer cuentas</>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Si está cerrado y está liquidado, mostrar estado solo visual */}
            {isClosed && trip.isSettled && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-900/10 border border-emerald-200/40 dark:border-emerald-900/20">
                <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                  Viaje liquidado · Ajuste cerrado
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
