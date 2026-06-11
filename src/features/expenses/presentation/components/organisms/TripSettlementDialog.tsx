'use client'

import React, { useMemo } from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Label } from '@/src/core/presentation/components/ui/label'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import type { TripExpenseAssignmentKpiEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import { useCreateTripSettlement, useExpenseAdvances } from '@/src/features/expenses/presentation/hooks/use-expense-assignments'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createTripSettlementSchema, type CreateTripSettlementInput } from '@/src/features/expenses/domain/schemas/create-trip-settlement.schema'
import { toast } from 'sonner'
import type { z } from 'zod'

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface TripSettlementDialogProps {
  isOpen: boolean
  onClose: () => void
  trip: TripExpenseAssignmentKpiEntity | null
  children?: React.ReactNode
}

export function TripSettlementDialog({ isOpen, onClose, trip, children }: TripSettlementDialogProps) {
  const createSettlement = useCreateTripSettlement()
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
    setValue,
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

  // Debug: capturamos errores si la validación falla
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

  if (!trip) return null

  // trip.balanceAmount = assignedAmount - spentAmount
  // Si assigned = 1000, spent = 800 -> balance = 200 (El operador debe devolver a la empresa)
  // Si assigned = 1000, spent = 1200 -> balance = -200 (La empresa debe al operador)
  const balanceLabel = trip.balanceAmount > 0 
    ? 'Saldo a favor de la empresa (El operador debe devolver dinero)' 
    : trip.balanceAmount < 0 
      ? 'Saldo a favor del operador (La empresa debe reembolsar)' 
      : 'Cuentas cuadradas exactamente'

  const inputClass = cn(
    'h-10 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#006d37]/30'
  )
  const errorClass = 'text-xs text-red-600 mt-1'

  const tripLabel = trip.tripNumber != null
    ? `VJE-${String(trip.tripNumber).padStart(6, '0')}`
    : (trip.folio ?? `VJE-${trip.tripId.slice(0, 8)}`)

  return (
    <Dialog
      isOpen={isOpen}
      onClose={handleClose}
      title={`Comprobación de Viaje ${tripLabel}`}
      description="Registra las cuentas hechas y adjunta evidencia del ticket de liquidación."
      size="full"
    >
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">Asignado: {money.format(trip.assignedAmount)}</Badge>
          <Badge variant="outline">Comprobado: {money.format(trip.spentAmount)}</Badge>
          <Badge variant="outline">Balance: {money.format(trip.balanceAmount)}</Badge>
          {trip.isSettled ? (
            <Badge className="bg-[#1a5c3a] dark:bg-primary-container/80 hover:bg-[#1a5c3a]/90 text-white dark:text-zinc-950 font-bold">
              Cuentas hechas
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-700 border border-amber-500/20">
              Cuentas pendientes
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Resumen</p>
            <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">{balanceLabel}</p>
            <div className="flex items-center gap-2 mt-3">
              {trip.balanceAmount > 0 ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : trip.balanceAmount < 0 ? (
                <AlertTriangle className="size-4 text-amber-600" />
              ) : (
                <CheckCircle2 className="size-4 text-stone-400" />
              )}
              <span className={cn('text-lg font-bold', trip.balanceAmount > 0 ? 'text-emerald-700' : trip.balanceAmount < 0 ? 'text-amber-700' : 'text-stone-500')}>
                {money.format(Math.abs(trip.balanceAmount))}
              </span>
            </div>
          </div>

          <div className="p-4 rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 lg:col-span-2">
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Asignaciones vinculadas</p>
            <div className="mt-3 space-y-2">
              {tripAdvances.length === 0 ? (
                <p className="text-sm text-stone-500 dark:text-zinc-500">No hay asignaciones vinculadas a este viaje.</p>
              ) : (
                tripAdvances.slice(0, 6).map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <span className="text-stone-700 dark:text-zinc-300">
                      {new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', hour12: false }).format(new Date(a.assignedAt))} · {a.method === 'cash' ? 'Efectivo' : 'Transferencia'}
                    </span>
                    <span className="font-semibold">{money.format(a.amount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Gastos del viaje</p>
              <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">Consulta el desglose antes de liquidar.</p>
            </div>
            <div className="p-4">
              {children}
            </div>
          </div>

          <div className="rounded-2xl border border-stone-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="p-4 border-b border-stone-100 dark:border-zinc-800">
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Cierre de Liquidación</p>
              <p className="text-xs text-stone-500 dark:text-zinc-500 mt-1">Revisa que los gastos cuadren antes de liquidar el viaje.</p>
            </div>
            <form className="p-4 space-y-4" onSubmit={onSubmit}>

              <div className="grid gap-2">
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <textarea
                  id="notes"
                  rows={5}
                  className={cn(inputClass, 'h-auto py-3 resize-none')}
                  {...register('notes', { setValueAs: (v) => (typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : null) })}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-10 rounded-xl"
                disabled={trip.isSettled || createSettlement.isPending}
              >
                {trip.isSettled ? 'Ya liquidado' : 'Marcar cuentas hechas'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
