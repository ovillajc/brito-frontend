'use client'

import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Fuel } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import type { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Checkbox } from '@/src/core/presentation/components/ui/checkbox'
import { FUEL_LOAD_SOURCE_TYPE, fuelLoadSchema, type FuelLoadFormValues } from '@/src/features/trips/domain/schemas/fuel-load.schema'
import { useRegisterFuelLoad } from '@/src/features/trips/presentation/hooks/use-fuel-metrics'

type SubmissionStatus = 'idle' | 'success' | 'error'

interface FuelLoadWizardProps {
  isOpen: boolean
  onClose: () => void
  trips: TripWithRelations[]
  units: UnitAssemblyEntity[]
}

function formatMoney(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

export function FuelLoadWizard({ isOpen, onClose, trips, units }: FuelLoadWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const registerFuelLoad = useRegisterFuelLoad()

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    reset,
    formState: { errors },
  } = useForm<FuelLoadFormValues>({
    resolver: zodResolver(fuelLoadSchema),
    defaultValues: {
      tripId: '',
      vehicleType: 'TRUCK',
      trailerId: '',
      ticketFolio: '',
      loadDate: new Date().toISOString().slice(0, 16),
      litersLoaded: undefined,
      pricePerLiter: undefined,
      isFullTankFill: false,
      sourceType: FUEL_LOAD_SOURCE_TYPE.External,
    },
  })

  const tripId = watch('tripId')
  const vehicleType = watch('vehicleType')
  const liters = watch('litersLoaded')
  const price = watch('pricePerLiter')
  const sourceType = watch('sourceType')

  const selectedTrip = useMemo(() => trips.find((t) => t.trip.id === tripId) ?? null, [trips, tripId])
  const selectedUnit = useMemo(() => {
    const unitAssemblyId = selectedTrip?.trip.unitAssemblyId
    if (!unitAssemblyId) return null
    return units.find((u) => u.id === unitAssemblyId) ?? null
  }, [selectedTrip, units])

  const totalCost = liters != null && price != null ? liters * price : null

  const inputClass = [
    'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700',
    'bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100',
    'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors',
  ].join(' ')

  const err = (msg?: string) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null

  const goNext = async () => {
    const map: Record<number, (keyof FuelLoadFormValues)[]> = {
      0: ['tripId', 'vehicleType', 'trailerId'],
      1: ['ticketFolio', 'loadDate', 'sourceType', 'odometerAtLoad'],
      2: ['litersLoaded', 'pricePerLiter', 'isFullTankFill'],
    }

    const fields = map[activeStep] ?? []
    const ok = await trigger(fields)
    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => Math.max(0, p - 1))

  const handleFinish = handleSubmit(async (values) => {
    setErrorMessage(null)
    if (!selectedTrip) {
      setSubmissionStatus('error')
      setErrorMessage('Selecciona un viaje válido')
      return
    }
    if (!selectedUnit) {
      setSubmissionStatus('error')
      setErrorMessage('El viaje no tiene una unidad asignada')
      return
    }

    const loadDate = new Date(values.loadDate)
    if (Number.isNaN(loadDate.getTime())) {
      setSubmissionStatus('error')
      setErrorMessage('Fecha de carga inválida')
      return
    }

    const result = await registerFuelLoad.mutateAsync({
      tripId: values.tripId || null,
      truckId: selectedUnit.truckId,
      operatorId: selectedUnit.employeeId,
      ticketFolio: values.ticketFolio,
      loadDate,
      vehicleType: values.vehicleType ?? 'TRUCK',
      trailerId: values.trailerId || null,
      litersLoaded: values.litersLoaded,
      pricePerLiter: values.pricePerLiter ?? null,
      isFullTankFill: values.isFullTankFill,
      sourceType: values.sourceType,
      odometerAtLoad: values.odometerAtLoad ?? null,
    })

    if (!result.ok) {
      setSubmissionStatus('error')
      setErrorMessage(result.error.message)
      return
    }

    setSubmissionStatus('success')
  })

  const handleClose = () => {
    setActiveStep(0)
    setSubmissionStatus('idle')
    setErrorMessage(null)
    onClose()
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setErrorMessage(null)
    setActiveStep(0)
    reset({
      tripId: '',
      vehicleType: 'TRUCK',
      trailerId: '',
      ticketFolio: '',
      loadDate: new Date().toISOString().slice(0, 16),
      litersLoaded: undefined,
      pricePerLiter: undefined,
      isFullTankFill: false,
      sourceType: FUEL_LOAD_SOURCE_TYPE.External,
    })
  }

  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="tripId">Viaje (opcional si es base)</Label>
          <select id="tripId" className={inputClass} {...register('tripId')}>
            <option value="">Sin viaje (Carga base)</option>
            {trips.map((t) => (
              <option key={t.trip.id} value={t.trip.id}>
                {(t.trip.tripNumber !== null
                  ? `VJE-${String(t.trip.tripNumber).padStart(6, '0')}`
                  : (t.trip.folio ?? t.trip.id.slice(0, 8))
                )} — {(t.unitEconomicNumber ?? 'Sin unidad')} — {(t.trip.origin ?? '—')} → {(t.trip.destination ?? '—')}
              </option>
            ))}
          </select>
          {err(errors.tripId?.message)}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="vehicleType">Tipo de vehículo</Label>
          <select id="vehicleType" className={inputClass} {...register('vehicleType')}>
            <option value="TRUCK">Tractocamión (Motor)</option>
            <option value="TRAILER">Remolque (Termo)</option>
          </select>
          {err(errors.vehicleType?.message)}
        </div>
      </div>

      {vehicleType === 'TRAILER' && selectedUnit && (
        <div className="grid gap-2">
          <Label htmlFor="trailerId">Seleccionar Remolque</Label>
          <select id="trailerId" className={inputClass} {...register('trailerId')}>
            <option value="" disabled>Selecciona el termo</option>
            {selectedUnit.trailerId && <option value={selectedUnit.trailerId}>Termo 1 (Activo)</option>}
            {selectedUnit.trailer2Id && <option value={selectedUnit.trailer2Id}>Termo 2 (Activo)</option>}
          </select>
          {err(errors.trailerId?.message)}
        </div>
      )}

      {selectedTrip && (
        <div className="rounded-2xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500">Unidad</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                {selectedTrip.unitEconomicNumber ?? '—'}
              </p>
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500">Operador</p>
              <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
                {selectedTrip.operatorName ?? '—'}
              </p>
            </div>
          </div>
        </div>
      )}

      <WizardFooter
        isFirstStep
        isLastStep={false}
        onCancel={handleClose}
        onNext={goNext}
        isSubmitting={registerFuelLoad.isPending}
      />
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="ticketFolio">Folio del ticket</Label>
          <Input id="ticketFolio" placeholder="Ej. TK-00123456" {...register('ticketFolio')} />
          {err(errors.ticketFolio?.message)}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="loadDate">Fecha y hora de carga</Label>
          <input id="loadDate" type="datetime-local" className={inputClass} {...register('loadDate')} />
          {err(errors.loadDate?.message)}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="sourceType">Origen</Label>
          <select id="sourceType" className={inputClass} {...register('sourceType')}>
            <option value={FUEL_LOAD_SOURCE_TYPE.External}>Gasolinera / Externo</option>
            <option value={FUEL_LOAD_SOURCE_TYPE.InternalTank}>Tanque Base / Interno</option>
          </select>
        </div>

        {vehicleType === 'TRUCK' && (
          <div className="grid gap-2">
            <Label htmlFor="odometerAtLoad">Odómetro al cargar (Opcional)</Label>
            <Input id="odometerAtLoad" type="number" step="1" min="0" placeholder="Ej. 150500" {...register('odometerAtLoad', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
            {err(errors.odometerAtLoad?.message)}
          </div>
        )}
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep={false}
        onCancel={handleClose}
        onBack={goBack}
        onNext={goNext}
        isSubmitting={registerFuelLoad.isPending}
      />
    </div>
  )

  const step3 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="litersLoaded">Litros cargados (motor)</Label>
          <input
            id="litersLoaded"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={inputClass}
            {...register('litersLoaded', { valueAsNumber: true })}
          />
          {err(errors.litersLoaded?.message)}
        </div>

        {sourceType === FUEL_LOAD_SOURCE_TYPE.External ? (
          <div className="grid gap-2">
            <Label htmlFor="pricePerLiter">Precio / Litro (MXN)</Label>
            <input
              id="pricePerLiter"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              className={inputClass}
              {...register('pricePerLiter', { valueAsNumber: true })}
            />
            {err(errors.pricePerLiter?.message)}
          </div>
        ) : (
          <div className="grid gap-2">
            <Label>Precio / Litro (MXN)</Label>
            <div className={inputClass}>
              <span className="text-sm text-stone-500 dark:text-zinc-400">
                Se calculará automáticamente con el promedio del tanque
              </span>
            </div>
          </div>
        )}
      </div>

      {sourceType === FUEL_LOAD_SOURCE_TYPE.External && totalCost !== null && (
        <div className="rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-800/50 p-4">
          <p className="text-xs text-stone-500 dark:text-zinc-500">Total calculado</p>
          <p className="text-lg font-bold text-stone-900 dark:text-zinc-100">
            {formatMoney(totalCost)}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <Checkbox id="isFullTankFill" {...register('isFullTankFill')} />
        <Label htmlFor="isFullTankFill">Llenado a tanque completo</Label>
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep
        onCancel={handleClose}
        onBack={goBack}
        onNext={handleFinish}
        isSubmitting={registerFuelLoad.isPending}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Viaje', content: step1 },
    { id: '2', title: 'Ticket', content: step2 },
    { id: '3', title: 'Litros', content: step3 },
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus === 'success' ? 'success' : 'error'}
            title={submissionStatus === 'success' ? '¡Carga Registrada!' : 'Error al procesar'}
            message={submissionStatus === 'success'
              ? 'La carga de diésel quedó registrada correctamente.'
              : (errorMessage ?? 'No pudimos completar la operación en este momento.')
            }
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
            secondaryActionLabel={submissionStatus === 'success' ? 'Registrar otra' : undefined}
            onSecondaryAction={submissionStatus === 'success' ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={isOpen}
          onClose={handleClose}
          title="Registrar Carga de Diésel"
          description="Captura simplificada (Guardia/Supervisor)"
          icon={<Fuel className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}

