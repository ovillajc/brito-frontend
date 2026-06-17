'use client'

import React, { useEffect, useMemo, useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { HandCoins, AlertTriangle, Search } from 'lucide-react'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Button } from '@/src/core/presentation/components/ui/button'
import { SearchableSelect } from '@/src/core/presentation/components/molecules/searchable-select'
import { DateTimePicker24h } from '@/src/core/presentation/components/molecules/date-time-picker-24h'
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
import { useCreateExpenseAdvance, useUpdateExpenseAdvance, useExpenseAdvances } from '@/src/features/expenses/presentation/hooks/use-expense-assignments'
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
  const advancesQuery = useExpenseAdvances()
  
  const [duplicateWarning, setDuplicateWarning] = useState<ExpenseAdvanceEntity | null>(null)
  const hasConfirmedDuplicateRef = useRef(false)
  
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

  const getLocalDatetime = (d: Date = new Date()) => {
    const tzOffset = d.getTimezoneOffset() * 60000
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
  }

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    setValue,
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
      assignedAt: getLocalDatetime(),
      notes: null,
    },
  })

  const selectedAssemblyId = watch('unitAssemblyId')
  const selectedOperatorId = watch('operatorId')
  const assignedAtValue = watch('assignedAt')

  useEffect(() => {
    if (!isOpen) return
    setActiveStep(0)
    hasConfirmedDuplicateRef.current = false
    setDuplicateWarning(null)
    if (advanceRow) {
      reset({
        tripId: advanceRow.tripId ?? null,
        unitAssemblyId: advanceRow.unitAssemblyId ?? null,
        operatorId: advanceRow.operatorId,
        truckId: advanceRow.truckId ?? null,
        trailerId: advanceRow.trailerId ?? null,
        amount: advanceRow.amount,
        method: advanceRow.method,
        assignedAt: advanceRow.assignedAt ? getLocalDatetime(new Date(advanceRow.assignedAt)) : getLocalDatetime(),
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
        assignedAt: getLocalDatetime(),
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
      parsed.assignedAt = new Date(parsed.assignedAt).toISOString()
      
      // VALIDATION FOR DUPLICATES
      if (!hasConfirmedDuplicateRef.current) {
        const existingAdvances = advancesQuery.data ?? []
        const duplicates = existingAdvances.filter((a) => {
          if (isEdit && advanceRow && a.id === advanceRow.id) return false
          const sameOperator = a.operatorId === parsed.operatorId
          const sameAmount = a.amount === parsed.amount
          const timeDiff = Math.abs(new Date(a.assignedAt).getTime() - new Date(parsed.assignedAt).getTime())
          const within10Hours = timeDiff <= 10 * 60 * 60 * 1000
          return sameOperator && sameAmount && within10Hours
        })

        if (duplicates.length > 0) {
          setDuplicateWarning(duplicates[0])
          return
        }
      }
      
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
          <SearchableSelect
            options={operators.map(o => ({ value: o.id, label: o.fullName }))}
            value={selectedOperatorId || null}
            onChange={(val) => setValue('operatorId', val, { shouldValidate: true })}
            disabled={employeesQuery.isLoading || isView}
            isLoading={employeesQuery.isLoading}
            placeholder="Selecciona un operador..."
            searchPlaceholder="Buscar por nombre..."
            error={!!errors.operatorId}
          />
          {errors.operatorId && <p className={errorClass}>{errors.operatorId.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unitAssemblyId">Unidad asignada (Opcional)</Label>
          <SearchableSelect
            options={assemblies.map(a => ({ value: a.id, label: `${a.economicNumber} · ${a.employeeName ?? a.employeeId}` }))}
            value={selectedAssemblyId || null}
            onChange={(val) => setValue('unitAssemblyId', val, { shouldValidate: true })}
            disabled={assembliesQuery.isLoading || isView}
            isLoading={assembliesQuery.isLoading}
            placeholder="Selecciona una unidad..."
            searchPlaceholder="Buscar por número o nombre..."
            error={!!errors.unitAssemblyId}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="amount">Monto</Label>
          <Input id="amount" type="number" step="0.01" className={inputClass} disabled={isView} onFocus={(e) => e.target.select()} {...register('amount', { setValueAs: (v) => Number(v) })} />
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

        <div className="grid gap-2 sm:col-span-2">
          <Label htmlFor="assignedAt">Fecha y Hora</Label>
          <DateTimePicker24h 
            value={assignedAtValue} 
            onChange={(val) => setValue('assignedAt', val, { shouldValidate: true })} 
            disabled={isView} 
            error={!!errors.assignedAt} 
          />
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
    <>
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

      <Dialog
        isOpen={!!duplicateWarning}
        onClose={() => setDuplicateWarning(null)}
        title="Posible duplicado detectado"
        size="sm"
      >
        <div className="p-6 pt-2 flex flex-col items-center text-center">
          <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mb-4">
            <AlertTriangle className="size-6 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-sm text-stone-600 dark:text-zinc-400 mb-6">
            Hemos detectado que ya existe una asignación para este operador por la misma cantidad y en un rango de 10 horas. 
            ¿Estás seguro de que deseas registrarla de nuevo?
          </p>
          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 rounded-xl h-11" onClick={() => setDuplicateWarning(null)}>
              Cancelar
            </Button>
            <Button 
              className="flex-1 rounded-xl h-11 bg-amber-600 hover:bg-amber-700 text-white border-0"
              onClick={() => {
                hasConfirmedDuplicateRef.current = true
                setDuplicateWarning(null)
                // Usamos un timeout corto para permitir que el modal se cierre antes de ejecutar el submit y evitar bloqueos en el UI
                setTimeout(() => onFinish(), 50)
              }}
            >
              Sí, registrar
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  )
}

function formatTripFolio(t: TripWithRelations) {
  if (t.trip.folio) return t.trip.folio
  if (t.trip.tripNumber !== null) return `VJE-${String(t.trip.tripNumber).padStart(6, '0')}`
  return t.trip.id
}

