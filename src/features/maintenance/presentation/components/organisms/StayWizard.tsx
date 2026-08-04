'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Wrench } from 'lucide-react'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useTractors, useTrailers } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { useQuery } from '@tanstack/react-query'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import type { EmployeeEntity } from '@/src/features/hr/domain/entities'
import { getTripsAction } from '@/src/features/trips/presentation/actions/trips.actions'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import { createWorkshopStaySchema, type CreateWorkshopStayInput } from '@/src/features/maintenance/domain/schemas/create-stay.schema'
import { VEHICLE_TYPE } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { useCreateWorkshopStay, useUpdateWorkshopStay } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkshopStayReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import type { z } from 'zod'

interface StayWizardProps {
  isOpen: boolean
  onClose: () => void
  initialData?: WorkshopStayReplicaEntity | null
}

type SubmissionStatus = 'idle' | 'success' | 'error'
type StayFormValues = z.input<typeof createWorkshopStaySchema>

function generateFolio() {
  const d = new Date()
  const date = d.toISOString().slice(0, 10)
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${date}-TALLER-${num}`
}

export function StayWizard({ isOpen, onClose, initialData }: StayWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const tractorsQuery = useTractors()
  const trailersQuery = useTrailers()
  const employeesQuery = useQuery({
    queryKey: ['maintenance', 'employees'],
    queryFn: async () => {
      const result = await getEmployeesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as EmployeeEntity[]
    },
    staleTime: 1000 * 60 * 10,
  })

  const tripsQuery = useQuery({
    queryKey: ['maintenance', 'trips'],
    queryFn: async () => {
      const result = await getTripsAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as TripWithRelations[]
    },
    staleTime: 1000 * 60 * 10,
  })

  const createStay = useCreateWorkshopStay()
  const updateStay = useUpdateWorkshopStay()
  const isEditing = !!initialData

  const matchingTruckId = useMemo(() => {
    if (!initialData || initialData.vehicleType !== 'TRUCK') return null
    return (tractorsQuery.data ?? []).find((t) => t.economicNumber === initialData.economicNumber)?.id ?? null
  }, [initialData, tractorsQuery.data])

  const matchingTrailerId = useMemo(() => {
    if (!initialData || initialData.vehicleType !== 'TRAILER') return null
    return (trailersQuery.data ?? []).find((t) => t.economicNumber === initialData.economicNumber)?.id ?? null
  }, [initialData, trailersQuery.data])

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<StayFormValues>({
    resolver: zodResolver(createWorkshopStaySchema),
    defaultValues: {
      folio: generateFolio(),
      vehicleType: VEHICLE_TYPE.Truck,
      truckId: null,
      trailerId: null,
      enteredAt: new Date().toISOString().slice(0, 10),
      reason: '',
      kmAtEntry: null,
      kmLastService: null,
      lastTripStartDate: null,
      deliveredByEmployeeId: null,
      pickedUpByEmployeeId: null,
      lastTripId: null,
    },
  })

  const vehicleType = watch('vehicleType')

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      reset({
        folio: initialData.folio,
        vehicleType: initialData.vehicleType,
        truckId: matchingTruckId,
        trailerId: matchingTrailerId,
        enteredAt: new Date(initialData.enteredAt).toISOString().slice(0, 10),
        reason: initialData.reason,
        kmAtEntry: initialData.kmAtEntry,
        kmLastService: initialData.kmLastService,
        lastTripStartDate: initialData.lastTripStartDate ? new Date(initialData.lastTripStartDate).toISOString().slice(0, 16) : null,
        deliveredByEmployeeId: initialData.deliveredByEmployeeId,
        pickedUpByEmployeeId: initialData.pickedUpByEmployeeId,
        lastTripId: initialData.lastTripId,
      })
    } else {
      reset({
        folio: generateFolio(),
        vehicleType: VEHICLE_TYPE.Truck,
        truckId: null,
        trailerId: null,
        enteredAt: new Date().toISOString().slice(0, 10),
        reason: '',
        kmAtEntry: null,
        kmLastService: null,
        lastTripStartDate: null,
        deliveredByEmployeeId: null,
        pickedUpByEmployeeId: null,
        lastTripId: null,
      })
    }
    setActiveStep(0)
    setSubmissionStatus('idle')
    setSubmissionError(null)
  }, [isOpen, initialData, reset, matchingTruckId, matchingTrailerId, employeesQuery.data, tripsQuery.data])

  const inputClass = cn(
    'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
  )

  const errorClass = 'text-xs text-red-500 mt-1'

  const operators = useMemo(() => {
    const list = (employeesQuery.data ?? []).filter((e) => e.isOperator && e.isActive)
    if (initialData?.deliveredByEmployeeId) {
      const alreadyInDelivered = list.some((e) => e.id === initialData.deliveredByEmployeeId)
      if (!alreadyInDelivered) {
        const matchingDelivered = (employeesQuery.data ?? []).find((e) => e.id === initialData.deliveredByEmployeeId)
        if (matchingDelivered) list.push(matchingDelivered)
      }
    }
    if (initialData?.pickedUpByEmployeeId) {
      const alreadyInPickedUp = list.some((e) => e.id === initialData.pickedUpByEmployeeId)
      if (!alreadyInPickedUp) {
        const matchingPickedUp = (employeesQuery.data ?? []).find((e) => e.id === initialData.pickedUpByEmployeeId)
        if (matchingPickedUp) list.push(matchingPickedUp)
      }
    }
    return list
  }, [employeesQuery.data, initialData])

  const trips = useMemo(() => {
    const list = [...(tripsQuery.data ?? [])]
    if (initialData?.lastTripId) {
      const alreadyInList = list.some((t) => t.trip.id === initialData.lastTripId)
      if (!alreadyInList) {
        list.push({
          trip: {
            id: initialData.lastTripId,
            folio: 'Viaje asociado',
            tripNumber: null,
          } as any,
          clientName: null,
        } as any)
      }
    }
    return list
  }, [tripsQuery.data, initialData])


  const goNext = async () => {
    const fields: (keyof StayFormValues)[] =
      activeStep === 0
        ? ['folio', 'vehicleType', 'truckId', 'trailerId', 'enteredAt', 'reason']
        : ['kmAtEntry', 'kmLastService', 'lastTripStartDate']

    const ok = await trigger(fields)
    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => Math.max(0, p - 1))

  const close = () => {
    onClose()
  }

  const onFinish = handleSubmit(
    async (values) => {
      try {
        setSubmissionStatus('idle')
        setSubmissionError(null)
        const parsed: CreateWorkshopStayInput = createWorkshopStaySchema.parse(values)
        console.log('[StayWizard] Submitting stay:', parsed)
        let result;
        if (isEditing && initialData) {
          result = await updateStay.mutateAsync({ id: initialData.id, data: parsed })
        } else {
          result = await createStay.mutateAsync(parsed)
        }
        console.log('[StayWizard] Result:', result)
        setSubmissionStatus('success')
        toast.success(isEditing ? 'Estancia actualizada' : 'Estancia registrada')
        close()
      } catch (e) {
        console.error('[StayWizard] Error:', e)
        const message = e instanceof Error ? e.message : 'Error al guardar'
        setSubmissionStatus('error')
        setSubmissionError(message)
        toast.error(message)
      }
    },
    (errors) => {
      console.error('[StayWizard] Validation errors:', errors)
      toast.error('Por favor, corrige los errores de validación antes de continuar.')
    }
  )

  const step1 = (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="folio">Folio</Label>
          <Input id="folio" className={inputClass} {...register('folio')} />
          {errors.folio && <p className={errorClass}>{errors.folio.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="enteredAt">Fecha de ingreso</Label>
          <Input id="enteredAt" type="date" className={inputClass} {...register('enteredAt')} />
          {errors.enteredAt && <p className={errorClass}>{errors.enteredAt.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="vehicleType">Tipo de unidad</Label>
          <select 
            id="vehicleType" 
            className={inputClass} 
            {...register('vehicleType', { 
              onChange: (e) => {
                // Limpiar el id de tracto o remolque al cambiar de tipo
                if (e.target.value === VEHICLE_TYPE.Truck) {
                  setValue('trailerId', null, { shouldValidate: true })
                } else {
                  setValue('truckId', null, { shouldValidate: true })
                }
              }
            })}
          >
            <option value={VEHICLE_TYPE.Truck}>Tractocamión</option>
            <option value={VEHICLE_TYPE.Trailer}>Remolque</option>
          </select>
        </div>

        {vehicleType === VEHICLE_TYPE.Truck ? (
          <div className="grid gap-2">
            <Label htmlFor="truckId">Tracto</Label>
            <select id="truckId" className={inputClass} disabled={tractorsQuery.isLoading} {...register('truckId', { setValueAs: (v) => v || null })}>
              <option value="">{tractorsQuery.isLoading ? 'Cargando...' : 'Selecciona un tracto'}</option>
              {(tractorsQuery.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.economicNumber} {t.plates ? `- ${t.plates}` : ''}
                </option>
              ))}
            </select>
            {errors.truckId && <p className={errorClass}>{errors.truckId.message}</p>}
          </div>
        ) : (
          <div className="grid gap-2">
            <Label htmlFor="trailerId">Remolque</Label>
            <select id="trailerId" className={inputClass} disabled={trailersQuery.isLoading} {...register('trailerId', { setValueAs: (v) => v || null })}>
              <option value="">{trailersQuery.isLoading ? 'Cargando...' : 'Selecciona un remolque'}</option>
              {(trailersQuery.data ?? []).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.economicNumber} {t.plates ? `- ${t.plates}` : ''}
                </option>
              ))}
            </select>
            {errors.trailerId && <p className={errorClass}>{errors.trailerId.message}</p>}
          </div>
        )}
      </div>

      <div className="grid gap-2">
        <Label htmlFor="reason">Motivo</Label>
        <Input id="reason" className={inputClass} placeholder="Ej. Falla, servicio programado, incidente" {...register('reason')} />
        {errors.reason && <p className={errorClass}>{errors.reason.message}</p>}
      </div>

      <WizardFooter
        isFirstStep={true}
        isLastStep={false}
        onCancel={close}
        onNext={goNext}
      />
    </div>
  )

  const step2 = (
    <div className="space-y-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="kmAtEntry">KM al ingreso (Opcional)</Label>
          <Input id="kmAtEntry" type="number" className={inputClass} {...register('kmAtEntry', { setValueAs: (v) => (v === '' ? null : Number(v)) })} />
          {errors.kmAtEntry && <p className={errorClass}>{errors.kmAtEntry.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="kmLastService">KM Último Servicio (Opcional)</Label>
          <Input id="kmLastService" type="number" className={inputClass} {...register('kmLastService', { setValueAs: (v) => (v === '' ? null : Number(v)) })} />
          {errors.kmLastService && <p className={errorClass}>{errors.kmLastService.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="lastTripStartDate">Inicio de Último Viaje (Opcional)</Label>
          <Input id="lastTripStartDate" type="datetime-local" className={inputClass} {...register('lastTripStartDate')} />
          {errors.lastTripStartDate && <p className={errorClass}>{errors.lastTripStartDate.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="deliveredByEmployeeId">Operador que entrega (Opcional)</Label>
          <select id="deliveredByEmployeeId" className={inputClass} disabled={employeesQuery.isLoading} {...register('deliveredByEmployeeId', { setValueAs: (v) => v || null })}>
            <option value="">{employeesQuery.isLoading ? 'Cargando...' : 'Selecciona...'}</option>
            {operators.map((o) => (
              <option key={o.id} value={o.id}>{o.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="lastTripId">Último viaje (Opcional)</Label>
        <select id="lastTripId" className={inputClass} disabled={tripsQuery.isLoading} {...register('lastTripId', { setValueAs: (v) => v || null })}>
          <option value="">{tripsQuery.isLoading ? 'Cargando...' : 'Selecciona un viaje (Opcional)...'}</option>
          {trips.map((t) => (
            <option key={t.trip.id} value={t.trip.id}>
              {t.trip.folio ?? `Viaje ${t.trip.tripNumber ?? 'Sin Folio'}`} - {t.clientName ?? 'Sin Cliente'}
            </option>
          ))}
        </select>
        {errors.lastTripId && <p className={errorClass}>{errors.lastTripId.message}</p>}
      </div>

      {submissionStatus === 'error' && submissionError && (
        <div className="p-3 rounded-xl border border-red-200 bg-red-50/50 text-red-800 text-sm">
          {submissionError}
        </div>
      )}

      <WizardFooter
        isFirstStep={false}
        isLastStep={true}
        onCancel={close}
        onBack={goBack}
        onNext={onFinish}
        isSubmitting={createStay.isPending}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: 'stay-1', title: 'Estancia', content: step1 },
    { id: 'stay-2', title: 'Detalle', content: step2 },
  ]

  return (
    <Wizard
      isOpen={isOpen}
      onClose={close}
      title={isEditing ? 'Editar Estancia de Taller' : 'Nueva Estancia de Taller'}
      description={isEditing ? 'Modifica los detalles de la estancia seleccionada.' : 'Registra el ingreso de una unidad al taller.'}
      icon={<Wrench className="size-5" />}
      steps={steps}
      activeStep={activeStep}
      size="lg"
    />
  )
}
