'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { HandCoins } from 'lucide-react'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import type { EmployeeEntity } from '@/src/features/hr/domain/entities'
import { useUnitAssemblies } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { useTripsList } from '@/src/features/trips/presentation/hooks/use-trips'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import { createExpenseAdvanceSchema, type CreateExpenseAdvanceInput } from '@/src/features/expenses/domain/schemas/create-expense-advance.schema'
import { ADVANCE_METHOD, type ExpenseAdvanceEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import { useCreateExpenseAdvance, useUpdateExpenseAdvance } from '@/src/features/expenses/presentation/hooks/use-expense-assignments'
import type { z } from 'zod'

type AdvanceFormValues = z.input<typeof createExpenseAdvanceSchema>

interface ExpenseAdvanceWizardProps {
  isOpen: boolean
  onClose: () => void
  advanceRow?: ExpenseAdvanceEntity
  mode?: 'create' | 'edit' | 'view'
}

export function ExpenseAdvanceWizard({ isOpen, onClose, advanceRow, mode = 'create' }: ExpenseAdvanceWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const createAdvance = useCreateExpenseAdvance()
  const updateAdvance = useUpdateExpenseAdvance()
  
  const isView = mode === 'view'
  const isEdit = mode === 'edit'

  const assembliesQuery = useUnitAssemblies()
  const tripsQuery = useTripsList({ limit: 200 })
  const employeesQuery = useQuery({
    queryKey: ['expenses', 'assignments', 'employees'],
    queryFn: async () => {
      const result = await getEmployeesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as EmployeeEntity[]
    },
    staleTime: 1000 * 60 * 10,
  })

  const operators = useMemo(() => {
    return (employeesQuery.data ?? []).filter((e) => e.isOperator && e.isActive)
  }, [employeesQuery.data])

  const trips = useMemo(() => tripsQuery.data ?? [], [tripsQuery.data])
  const assemblies = useMemo(() => assembliesQuery.data ?? [], [assembliesQuery.data])

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<AdvanceFormValues>({
    resolver: zodResolver(createExpenseAdvanceSchema),
    defaultValues: {
      tripId: null,
      unitAssemblyId: null,
      operatorId: '',
      truckId: null,
      trailerId: null,
      amount: 0,
      method: ADVANCE_METHOD.Cash,
      assignedAt: new Date().toISOString().slice(0, 10),
      notes: null,
    },
  })

  const selectedAssemblyId = watch('unitAssemblyId')
  const selectedOperatorId = watch('operatorId')

  useEffect(() => {
    if (!isOpen) return
    if (advanceRow) {
      reset({
        tripId: advanceRow.tripId ?? null,
        unitAssemblyId: advanceRow.unitAssemblyId ?? null,
        operatorId: advanceRow.operatorId,
        truckId: advanceRow.truckId ?? null,
        trailerId: advanceRow.trailerId ?? null,
        amount: advanceRow.amount,
        method: advanceRow.method,
        assignedAt: advanceRow.assignedAt ? new Date(advanceRow.assignedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10),
        notes: advanceRow.notes ?? null,
      })
    } else {
      reset({
        tripId: null,
        unitAssemblyId: null,
        operatorId: '',
        truckId: null,
        trailerId: null,
        amount: 0,
        method: ADVANCE_METHOD.Cash,
        assignedAt: new Date().toISOString().slice(0, 10),
        notes: null,
      })
    }
  }, [isOpen, reset, advanceRow])

  const selectedAssembly = useMemo(() => {
    if (!selectedAssemblyId) return null
    return assemblies.find((a) => a.id === selectedAssemblyId) ?? null
  }, [assemblies, selectedAssemblyId])

  const filteredTrips = useMemo(() => {
    if (!selectedOperatorId) return trips
    return trips.filter((t) => t.trip.unitAssemblyId && t.trip.unitAssemblyId === selectedAssemblyId).length > 0
      ? trips.filter((t) => t.trip.unitAssemblyId === selectedAssemblyId)
      : trips
  }, [trips, selectedOperatorId, selectedAssemblyId])

  const inputClass = cn(
    'h-10 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#006d37]/30'
  )
  const errorClass = 'text-xs text-red-600 mt-1'

  const goNext = async () => {
    const ok = await trigger(['operatorId', 'amount', 'method', 'assignedAt'])
    if (ok) setActiveStep(1)
  }

  const handleClose = () => onClose()

  const onFinish = handleSubmit(async (vals) => {
    try {
      if (isView) {
        handleClose()
        return
      }
      
      const patched = selectedAssembly
        ? {
            ...vals,
            operatorId: vals.operatorId || selectedAssembly.employeeId,
            truckId: vals.truckId ?? selectedAssembly.truckId,
            trailerId: vals.trailerId ?? selectedAssembly.trailerId ?? null,
          }
        : vals

      const parsed: CreateExpenseAdvanceInput = createExpenseAdvanceSchema.parse(patched)
      
      if (isEdit && advanceRow) {
        await updateAdvance.mutateAsync({ id: advanceRow.id, data: parsed })
        toast.success('Asignación actualizada')
      } else {
        await createAdvance.mutateAsync(parsed)
        toast.success('Asignación registrada')
      }
      
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar asignación')
    }
  })

  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="operatorId">Operador</Label>
          <select id="operatorId" className={inputClass} disabled={employeesQuery.isLoading || isView} {...register('operatorId')}>
            <option value="">{employeesQuery.isLoading ? 'Cargando...' : 'Selecciona...'}</option>
            {operators.map((o) => (
              <option key={o.id} value={o.id}>{o.fullName}</option>
            ))}
          </select>
          {errors.operatorId && <p className={errorClass}>{errors.operatorId.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unitAssemblyId">Unidad asignada (Opcional)</Label>
          <select
            id="unitAssemblyId"
            className={inputClass}
            disabled={assembliesQuery.isLoading || isView}
            {...register('unitAssemblyId', { setValueAs: (v) => v || null })}
          >
            <option value="">{assembliesQuery.isLoading ? 'Cargando...' : 'Selecciona...'}</option>
            {assemblies.map((a) => (
              <option key={a.id} value={a.id}>
                {a.economicNumber} · {a.employeeName ?? a.employeeId}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Monto</Label>
          <Input id="amount" type="number" step="0.01" className={inputClass} disabled={isView} {...register('amount', { setValueAs: (v) => Number(v) })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="method">Método</Label>
          <select id="method" className={inputClass} disabled={isView} {...register('method')}>
            <option value={ADVANCE_METHOD.Cash}>Efectivo</option>
            <option value={ADVANCE_METHOD.Transfer}>Transferencia</option>
          </select>
          {errors.method && <p className={errorClass}>{errors.method.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="assignedAt">Fecha</Label>
          <Input id="assignedAt" type="date" className={inputClass} disabled={isView} {...register('assignedAt')} />
          {errors.assignedAt && <p className={errorClass}>{errors.assignedAt.message}</p>}
        </div>
      </div>

      <WizardFooter isFirstStep isLastStep={false} onCancel={handleClose} onNext={goNext} />
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid gap-2">
        <Label htmlFor="tripId">Vincular a viaje (Opcional)</Label>
        <select
          id="tripId"
          className={inputClass}
          disabled={tripsQuery.isLoading || isView}
          {...register('tripId', { setValueAs: (v) => v || null })}
        >
          <option value="">{tripsQuery.isLoading ? 'Cargando...' : 'Selecciona...'}</option>
          {filteredTrips.map((t) => (
            <option key={t.trip.id} value={t.trip.id}>
              {formatTripFolio(t)}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="notes">Notas (Opcional)</Label>
        <textarea
          id="notes"
          rows={4}
          disabled={isView}
          className={cn(inputClass, 'h-auto py-3 resize-none')}
          {...register('notes', { setValueAs: (v) => (typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : null) })}
        />
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep
        onCancel={handleClose}
        onBack={() => setActiveStep(0)}
        onNext={isView ? handleClose : onFinish}
        nextLabel={isView ? 'Cerrar' : undefined}
        isSubmitting={createAdvance.isPending || updateAdvance.isPending}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: 'adv-1', title: 'Asignación', content: step1 },
    { id: 'adv-2', title: 'Vínculo', content: step2 },
  ]

  return (
    <Wizard
      isOpen={isOpen}
      onClose={handleClose}
      title={isView ? 'Detalles de Asignación' : isEdit ? 'Editar Asignación' : 'Nueva Asignación'}
      description={isView ? 'Consulta los detalles de esta salida de dinero.' : isEdit ? 'Modifica los datos de esta asignación.' : 'Registra una salida de dinero para gastos de operación.'}
      icon={<HandCoins className="size-5" />}
      steps={steps}
      activeStep={activeStep}
      size="lg"
    />
  )
}

function formatTripFolio(t: TripWithRelations) {
  if (t.trip.folio) return t.trip.folio
  if (t.trip.tripNumber !== null) return `VJE-${String(t.trip.tripNumber).padStart(6, '0')}`
  return t.trip.id
}

