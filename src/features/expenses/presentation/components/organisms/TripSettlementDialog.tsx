'use client'

import React, { useMemo } from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { cn } from '@/src/core/infrastructure/utils/cn'
import {
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  MapPin,
  Clock,
  Lock,
  X,
  Loader2,
  RotateCcw,
} from 'lucide-react'
import type { TripExpenseAssignmentKpiEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import { useCreateTripSettlement, useExpenseAdvances, useDeleteTripSettlement } from '@/src/features/expenses/presentation/hooks/use-expense-assignments'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTripSettlementSchema, type CreateTripSettlementInput } from '@/src/features/expenses/domain/schemas/create-trip-settlement.schema'
import { toast } from 'sonner'
import type { z } from 'zod'
import { TripExpenseEntryForm } from './TripExpenseEntryForm'
import { Label } from '@radix-ui/react-label'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })
const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', hour12: false })

interface TripSettlementDialogProps {
  isOpen: boolean
  onClose: () => void
  trip: TripExpenseAssignmentKpiEntity | null
  children?: React.ReactNode
}

export function TripSettlementDialog({ isOpen, onClose, trip, children }: TripSettlementDialogProps) {
  const createSettlement = useCreateTripSettlement()
  const deleteSettlement = useDeleteTripSettlement()
  const advancesQuery = useExpenseAdvances()
  const advances = advancesQuery.data ?? []

  const tripAdvances = useMemo(() => {
    if (!trip) return []
    return advances.filter((a) => a.tripId === trip.tripId)
  }, [advances, trip])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<z.input<typeof createTripSettlementSchema>>({
    resolver: zodResolver(createTripSettlementSchema),
    defaultValues: {
      tripId: '',
      operatorId: null,
      notes: null,
    },
  })

  // Sincronizar el formulario con el viaje seleccionado al abrir el diálogo
  React.useEffect(() => {
    if (isOpen && trip) {
      reset({
        tripId: trip.tripId,
        operatorId: trip.operatorId ?? null,
        notes: null,
      })
    }
  }, [isOpen, trip, reset])

  const handleClose = () => {
    reset()
    onClose()
  }

  const onError = (errs: unknown) => {
    console.error('Errores de validación:', JSON.stringify(errs, null, 2))
    toast.error('Por favor, verifica los campos e inténtalo de nuevo')
  }

  const onSubmit = handleSubmit(async (vals) => {
    try {
      if (!trip) return
      const payload: CreateTripSettlementInput = createTripSettlementSchema.parse({
        ...vals,
        tripId: trip.tripId,
        operatorId: trip.operatorId ?? null,
      })
      await createSettlement.mutateAsync(payload)
      toast.success('Comprobación registrada')
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar comprobación')
    }
  }, onError)

  const handleUnsettle = async () => {
    if (!trip || !trip.isSettled) return
    try {
      await deleteSettlement.mutateAsync(trip.tripId)
      toast.success('Comprobación deshecha')
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al deshacer comprobación')
    }
  }

  if (!trip) return null

  const isSettled = trip.isSettled
  const balance = trip.balanceAmount
  const balancePositive = balance > 0
  const balanceNegative = balance < 0
  const balanceZero = balance === 0

  const tripLabel = trip.tripNumber != null
    ? `VJE-${String(trip.tripNumber).padStart(6, '0')}`
    : (trip.folio ?? `VJE-${trip.tripId.slice(0, 8)}`)

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
            'relative shrink-0 px-6 pt-5 pb-6 border-b',
            isSettled
              ? 'bg-linear-to-r from-emerald-50 via-white to-emerald-50/30 dark:from-emerald-950/30 dark:via-zinc-900 dark:to-zinc-900 border-emerald-100/80 dark:border-emerald-900/40'
              : 'bg-linear-to-r from-stone-50 to-stone-100 dark:from-zinc-900 dark:to-zinc-800 border-stone-200 dark:border-zinc-700'
          )}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {/* Icono */}
              <div
                className={cn(
                  'size-12 rounded-2xl flex items-center justify-center text-lg shadow-sm shrink-0',
                  isSettled
                    ? 'bg-[#1a5c3a] text-white shadow-[#1a5c3a]/20'
                    : 'bg-stone-200 dark:bg-zinc-700 text-stone-600 dark:text-zinc-300'
                )}
              >
                <MapPin className="size-6" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 leading-tight">
                    Viaje {tripLabel}
                  </h2>
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full',
                      isSettled
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}
                  >
                    {isSettled ? <CheckCircle2 className="size-2.5" /> : <Clock className="size-2.5" />}
                    {isSettled ? 'Cuentas hechas' : 'Cuentas pendientes'}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
                  Operador: {trip.operatorName ?? 'Sin asignar'}
                </p>
              </div>
            </div>

            {/* Botón cerrar */}
            <button
              onClick={handleClose}
              className="size-8 flex items-center justify-center rounded-full hover:bg-stone-200/50 dark:hover:bg-zinc-700 transition-colors shrink-0 text-stone-500"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-4">
            <div className="bg-white dark:bg-zinc-800/60 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60">
              <p className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Asignado (Adelantos)</p>
              <p className="text-base font-bold text-stone-800 dark:text-zinc-100 mt-0.5">{money.format(trip.assignedAmount)}</p>
            </div>
            <div className="bg-white dark:bg-zinc-800/60 rounded-xl p-3 border border-stone-100 dark:border-zinc-700/60">
              <p className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wide">Comprobado</p>
              <p className="text-base font-bold text-stone-800 dark:text-zinc-100 mt-0.5">{money.format(trip.spentAmount)}</p>
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
          </div>
        </div>

        {/* ── BODY ─────────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto min-h-0 bg-stone-50/30 dark:bg-zinc-950/20">
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
                  ? `El operador debe devolver ${money.format(Math.abs(balance))} a la empresa por este viaje`
                  : `La empresa debe reembolsar ${money.format(Math.abs(balance))} al operador por este viaje`}
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Panel izquierdo: Formulario de gasto rápido y asignaciones */}
              <div className="space-y-6">
                {!isSettled && (
                  <div className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 overflow-hidden">
                    <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
                      <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Registrar gasto rápido</p>
                      <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">
                        Añade casetas, diesel y otros gastos directamente a este viaje.
                      </p>
                    </div>
                    <div className="p-4 bg-stone-50/50 dark:bg-zinc-900/50">
                      <TripExpenseEntryForm
                        tripId={trip.tripId}
                        tripFolio={tripLabel}
                        readOnly={isSettled}
                      />
                    </div>
                  </div>
                )}

                <div className="rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                  <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Adelantos del viaje</p>
                    <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">Dinero asignado para los gastos de esta ruta.</p>
                  </div>
                  <div className="p-4 space-y-2">
                    {tripAdvances.length === 0 ? (
                      <p className="text-sm text-stone-500 dark:text-zinc-500">No hay adelantos vinculados a este viaje.</p>
                    ) : (
                      tripAdvances.map((a) => (
                        <div key={a.id} className="flex items-center justify-between p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-800">
                          <div className="min-w-0">
                            <span className="text-xs font-medium text-stone-800 dark:text-zinc-200">
                              {a.method === 'cash' ? '💵 Efectivo' : '🏦 Transferencia'}
                            </span>
                            <p className="text-[10px] text-stone-500 dark:text-zinc-500 mt-0.5">
                              {dateFmt.format(new Date(a.assignedAt))}
                            </p>
                          </div>
                          <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">{money.format(a.amount)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Panel derecho: Gastos registrados y Cierre */}
              <div className="space-y-6">
                <div className="rounded-xl border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                  <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
                    <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Gastos registrados</p>
                    <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">Revisa el desglose antes de liquidar el viaje.</p>
                  </div>
                  <div className="p-4">
                    {children}
                  </div>
                </div>

                <div
                  className={cn(
                    'rounded-xl border overflow-hidden',
                    isSettled
                      ? 'border-emerald-200/60 dark:border-emerald-900/30'
                      : 'border-[#1a5c3a]/20 dark:border-emerald-800/30'
                  )}
                >
                  <div
                    className={cn(
                      'flex items-center gap-2 px-4 py-3 border-b',
                      isSettled
                        ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-100/60 dark:border-emerald-900/20'
                        : 'bg-stone-50/70 dark:bg-zinc-800/40 border-stone-100 dark:border-zinc-700/40'
                    )}
                  >
                    <div
                      className={cn(
                        'size-6 rounded-lg flex items-center justify-center shrink-0',
                        isSettled
                          ? 'bg-emerald-100 dark:bg-emerald-900/40'
                          : 'bg-[#1a5c3a]/10 dark:bg-emerald-900/30'
                      )}
                    >
                      {isSettled
                        ? <CheckCircle2 className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        : <Lock className="size-3.5 text-[#1a5c3a] dark:text-emerald-400" />}
                    </div>
                    <p className="text-sm font-semibold text-stone-800 dark:text-zinc-100">
                      {isSettled ? 'Liquidación completada' : 'Cierre de Liquidación'}
                    </p>
                  </div>
                  
                  <div className="p-4 bg-white dark:bg-zinc-900">
                    <form className="space-y-4" onSubmit={onSubmit}>
                      {!isSettled && (
                        <div className="grid gap-1.5">
                          <Label htmlFor="notes" className="text-xs text-stone-600 dark:text-zinc-400">Notas (Opcional)</Label>
                          <textarea
                            id="notes"
                            rows={3}
                            className={cn(
                              'w-full rounded-xl border border-stone-200 dark:border-zinc-700',
                              'bg-stone-50 dark:bg-zinc-800 px-3 py-2 text-sm',
                              'focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/25 focus:border-[#1a5c3a]/40',
                              'resize-none transition-all'
                            )}
                            {...register('notes', { setValueAs: (v) => (typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : null) })}
                            placeholder="Observaciones de la liquidación del viaje..."
                          />
                        </div>
                      )}

                      <div className="flex gap-2">
                        {!isSettled ? (
                          <Button
                            type="submit"
                            className="w-full h-10 rounded-xl font-semibold bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white gap-2 shadow-sm"
                            disabled={createSettlement.isPending}
                          >
                            {createSettlement.isPending ? (
                              <><Loader2 className="size-4 animate-spin" /> Procesando...</>
                            ) : (
                              <><CheckCircle2 className="size-4" /> Marcar cuentas hechas</>
                            )}
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full h-10 rounded-xl font-medium gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/15"
                            disabled={deleteSettlement.isPending}
                            onClick={handleUnsettle}
                          >
                            {deleteSettlement.isPending ? (
                              <><Loader2 className="size-4 animate-spin" /> Procesando...</>
                            ) : (
                              <><RotateCcw className="size-4" /> Deshacer cuentas</>
                            )}
                          </Button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
