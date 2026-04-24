'use client'

/**
 * @fileoverview Wizard de 4 pasos para registro de métricas de combustible.
 * Patrón idéntico a EmployeeWizard: AnimatePresence + Wizard + WizardFooter + ActionFeedback.
 *
 * Pasos:
 *   1. Datos del viaje (monitorista, observaciones)
 *   2. Odómetro (km inicial, km final, km prefactura)
 *   3. Motor (ticket, litros, precio/L)
 *   4. Remolques R1/R2 (litros, horas)
 *
 * @organism
 */

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence } from 'framer-motion'
import { BarChart2, Fuel } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import type { TripFuelRowEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'
import { useSaveFuelMetrics } from '@/src/features/trips/presentation/hooks/use-fuel-metrics'
import { toast } from 'sonner'

// ── Schema Zod (Zod v4: usa `error` en lugar de `invalid_type_error`) ─────────

const fuelMetricsSchema = z.object({
  monitoredBy: z.string().min(1, 'El nombre del monitorista es obligatorio'),
  observations: z.string().optional(),

  kmInitial: z.number({ error: 'Ingresa el km inicial' }).min(0),
  kmFinal: z.number({ error: 'Ingresa el km final' }).min(0),
  totalKmPreinvoice: z.number().min(0).nullable().optional(),

  litersRealR1: z.number().min(0).optional(),
  hoursR1: z.number().min(0).optional(),
  litersRealR2: z.number().min(0).optional(),
  hoursR2: z.number().min(0).optional(),
}).refine((d) => d.kmFinal >= d.kmInitial, {
  message: 'El km final no puede ser menor al km inicial',
  path: ['kmFinal'],
})

type FuelMetricsValues = z.infer<typeof fuelMetricsSchema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface FuelMetricsWizardProps {
  isOpen: boolean
  onClose: () => void
  tripRow?: TripFuelRowEntity
}

type SubmissionStatus = 'idle' | 'success' | 'error'

function PreviewCard({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 rounded-xl border ${
        accent
          ? 'bg-[#006d37]/5 border-[#006d37]/20'
          : 'bg-stone-50 dark:bg-zinc-800/50 border-stone-100 dark:border-zinc-700'
      }`}
    >
      <span className="text-sm text-stone-600 dark:text-zinc-400">{label}</span>
      <span
        className={`text-base font-bold ${
          accent
            ? 'text-[#006d37] dark:text-primary-container'
            : 'text-stone-900 dark:text-zinc-100'
        }`}
      >
        {value}
      </span>
    </div>
  )
}

// ── Componente ────────────────────────────────────────────────────────────────

export function FuelMetricsWizard({ isOpen, onClose, tripRow }: FuelMetricsWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const isEdit = !!tripRow
  const tripId = tripRow?.id ?? ''
  const saveFuelMetrics = useSaveFuelMetrics(tripId)

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = useForm<FuelMetricsValues>({
    resolver: zodResolver(fuelMetricsSchema),
    defaultValues: {
      monitoredBy: '', observations: '',
      kmInitial: undefined, kmFinal: undefined, totalKmPreinvoice: null,
      litersRealR1: 0, hoursR1: 0, litersRealR2: 0, hoursR2: 0,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (tripRow) {
      reset({
        monitoredBy: tripRow.monitoredBy ?? '',
        observations: tripRow.observations ?? '',
        kmInitial: tripRow.kmInitial ?? undefined,
        kmFinal: tripRow.kmFinal ?? undefined,
        totalKmPreinvoice: tripRow.preinvoiceKm ?? null,
        litersRealR1: tripRow.litersRealR1 ?? 0,
        hoursR1: tripRow.hoursR1 ?? 0,
        litersRealR2: tripRow.litersRealR2 ?? 0,
        hoursR2: tripRow.hoursR2 ?? 0,
      })
    } else {
      reset()
    }
  }, [isOpen, tripRow, reset])

  // Cálculos en tiempo real
  const kmI = watch('kmInitial')
  const kmF = watch('kmFinal')
  const kmTraveled = kmI != null && kmF != null && kmF >= kmI ? kmF - kmI : null

  const goNext = async () => {
    const fieldMap: Record<number, (keyof FuelMetricsValues)[]> = {
      0: ['monitoredBy'],
      1: ['kmInitial', 'kmFinal'],
    }
    const ok = await trigger(fieldMap[activeStep] ?? [])
    if (ok) setActiveStep((p) => p + 1)
  }
  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (_data) => {
    if (!tripRow) {
      toast.error('Selecciona un viaje para registrar métricas')
      return
    }
    setIsSubmitting(true)
    try {
      const result = await saveFuelMetrics.mutateAsync({
        kmInitial: _data.kmInitial,
        kmFinal: _data.kmFinal,
        fuelLoadId: tripRow.fuelLoadId ?? null,
        hoursR1: _data.hoursR1 ?? 0,
        litersRealR1: _data.litersRealR1 ?? 0,
        hoursR2: _data.hoursR2 ?? 0,
        litersRealR2: _data.litersRealR2 ?? 0,
        totalKmPreinvoice: _data.totalKmPreinvoice ?? null,
      })

      if (!result.ok) {
        setSubmissionStatus('error')
        return
      }

      setSubmissionStatus('success')
    } catch {
      setSubmissionStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleClose = () => { setActiveStep(0); setSubmissionStatus('idle'); onClose() }
  const handleReset = () => { setSubmissionStatus('idle'); setActiveStep(0); if (!isEdit) reset() }

  // ── Estilos compartidos ───────────────────────────────────────────────────
  const inputClass = [
    'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700',
    'bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100',
    'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors',
  ].join(' ')
  const err = (msg?: string) => msg ? <p className="text-xs text-red-500 mt-1">{msg}</p> : null

  // ── Paso 1: Datos del viaje ───────────────────────────────────────────────
  const step1Content = (
    <div className="flex flex-col gap-5 pt-2">
      {tripRow && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-700">
          <div className="size-9 rounded-lg bg-[#006d37]/10 flex items-center justify-center">
            <Fuel className="size-4 text-[#006d37] dark:text-primary-container" />
          </div>
          <div>
            <p className="text-sm font-bold text-stone-900 dark:text-zinc-100 font-mono">{tripRow.folio}</p>
            <p className="text-xs text-stone-500 dark:text-zinc-400">{tripRow.origin} → {tripRow.destination}</p>
          </div>
        </div>
      )}
      <div className="grid gap-2">
        <Label htmlFor="monitoredBy">Monitorista en turno</Label>
        <Input id="monitoredBy" placeholder="Nombre del monitorista" {...register('monitoredBy')} />
        {err(errors.monitoredBy?.message)}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="observations">Observaciones (opcional)</Label>
        <textarea
          id="observations" rows={3}
          placeholder="Incidencias, demoras, notas relevantes..."
          className={`${inputClass} h-auto resize-none`}
          {...register('observations')}
        />
      </div>
      <WizardFooter isFirstStep isLastStep={false} onCancel={handleClose} onNext={goNext} />
    </div>
  )

  // ── Paso 2: Odómetro ─────────────────────────────────────────────────────
  const step2Content = (
    <div className="flex flex-col gap-5 pt-2">
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="kmInitial">KM Inicial</Label>
          <input id="kmInitial" type="number" step="1" min="0" placeholder="0" className={inputClass}
            {...register('kmInitial', { valueAsNumber: true })} />
          {err(errors.kmInitial?.message)}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="kmFinal">KM Final</Label>
          <input id="kmFinal" type="number" step="1" min="0" placeholder="0" className={inputClass}
            {...register('kmFinal', { valueAsNumber: true })} />
          {err(errors.kmFinal?.message)}
        </div>
      </div>
      {kmTraveled !== null && (
        <PreviewCard label="KM Recorridos calculados" value={`${kmTraveled.toLocaleString('es-MX')} km`} accent />
      )}
      <div className="grid gap-2">
        <Label htmlFor="totalKmPreinvoice">KM Prefactura (opcional)</Label>
        <input id="totalKmPreinvoice" type="number" step="1" min="0"
          placeholder="KM según prefactura del cliente" className={inputClass}
          {...register('totalKmPreinvoice', { valueAsNumber: true, setValueAs: (v) => v === '' ? null : Number(v) })} />
      </div>
      <WizardFooter isFirstStep={false} isLastStep={false} onCancel={handleClose} onBack={goBack} onNext={goNext} />
    </div>
  )

  // ── Paso 3: Carga motor (solo lectura) ────────────────────────────────────
  const step3Content = (
    <div className="flex flex-col gap-5 pt-2">
      {!tripRow?.fuelLoadId ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-900 p-4">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200">Sin carga registrada</p>
          <p className="text-xs text-amber-800/80 dark:text-amber-200/80 mt-1">
            Registra primero la carga de diésel en el módulo de Guardia para asociarla a este viaje.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <PreviewCard label="Folio de ticket" value={tripRow.ticketFolio ?? '—'} />
          <PreviewCard label="Litros motor" value={tripRow.litersEngine !== null ? `${tripRow.litersEngine.toFixed(1)} L` : '—'} />
          <PreviewCard label="Precio / L" value={tripRow.pricePerLiter !== null ? `$${tripRow.pricePerLiter.toFixed(2)} MXN` : '—'} />
          <PreviewCard
            label="Total motor"
            value={tripRow.totalCostEngine !== null
              ? `$${tripRow.totalCostEngine.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN`
              : '—'
            }
            accent
          />
        </div>
      )}
      <WizardFooter isFirstStep={false} isLastStep={false} onCancel={handleClose} onBack={goBack} onNext={goNext} />
    </div>
  )

  // ── Paso 4: Remolques ─────────────────────────────────────────────────────
  const step4Content = (
    <div className="flex flex-col gap-5 pt-2">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">Remolque 1 (R1)</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hoursR1">Horas R1</Label>
            <input id="hoursR1" type="number" step="0.5" min="0" placeholder="0" className={inputClass}
              {...register('hoursR1', { valueAsNumber: true })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="litersRealR1">Litros Reales R1</Label>
            <input id="litersRealR1" type="number" step="0.01" min="0" placeholder="0.00" className={inputClass}
              {...register('litersRealR1', { valueAsNumber: true })} />
          </div>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-1">Remolque 2 (R2)</p>
        <p className="text-[11px] text-stone-400 dark:text-zinc-500 mb-3">Solo aplica para unidades Full (2 remolques)</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="hoursR2">Horas R2</Label>
            <input id="hoursR2" type="number" step="0.5" min="0" placeholder="0" className={inputClass}
              {...register('hoursR2', { valueAsNumber: true })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="litersRealR2">Litros Reales R2</Label>
            <input id="litersRealR2" type="number" step="0.01" min="0" placeholder="0.00" className={inputClass}
              {...register('litersRealR2', { valueAsNumber: true })} />
          </div>
        </div>
      </div>
      <WizardFooter isFirstStep={false} isLastStep onCancel={handleClose} onBack={goBack} onNext={handleFinish} isSubmitting={isSubmitting} />
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Viaje', content: step1Content },
    { id: '2', title: 'Odómetro', content: step2Content },
    { id: '3', title: 'Motor', content: step3Content },
    { id: '4', title: 'Remolques', content: step4Content },
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success'
              ? (isEdit ? '¡Métricas Actualizadas!' : '¡Registro Exitoso!')
              : 'Error al guardar'}
            message={submissionStatus === 'success'
              ? `Las métricas han sido ${isEdit ? 'actualizadas' : 'registradas'} correctamente.`
              : 'No pudimos completar la operación. Intenta de nuevo.'}
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
            secondaryActionLabel={submissionStatus === 'success' && !isEdit ? 'Registrar otro' : undefined}
            onSecondaryAction={!isEdit ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={isOpen}
          onClose={handleClose}
          title={isEdit ? 'Editar Métricas' : 'Registrar Métricas de Combustible'}
          description={isEdit && tripRow
            ? `Editando viaje ${tripRow.folio}`
            : 'Ingresa los datos del recorrido y consumo de diésel'}
          icon={<BarChart2 className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
