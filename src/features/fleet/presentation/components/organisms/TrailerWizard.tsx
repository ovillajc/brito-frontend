'use client'

/**
 * @fileoverview Wizard de creación y edición de Remolques.
 * Utiliza el componente genérico `Wizard` de core.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Disc3, PenLine } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { createTrailerSchema, CreateTrailerInput } from '../../../domain/schemas/trailer.schema'
import { createTrailerAction, updateTrailerAction } from '../../actions/trailer.actions'
import { TrailerEntity, vehicleStatus } from '../../../domain/entities'
import { useCompanyProfiles } from '../../../../company-profile/presentation/hooks/use-company-profile'
import { useTrailerModels } from '../../hooks/use-fleet'
import { useQueryClient } from '@tanstack/react-query'

interface TrailerWizardProps {
  isOpen: boolean
  onClose: () => void
  /** Si se provee un remolque, el wizard opera en modo edición. */
  trailer?: TrailerEntity
}

type SubmissionStatus = 'idle' | 'success' | 'error'

const STATUS_OPTIONS: { label: string; value: vehicleStatus }[] = [
  { label: 'Disponible', value: 'available' },
  { label: 'En Taller', value: 'maintenance' },
  { label: 'Asignada', value: 'assigned' },
]

/**
 * Wizard multi-paso para crear o editar un Remolque.
 */
export function TrailerWizard({ isOpen, onClose, trailer }: TrailerWizardProps) {
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: companies, isLoading: isLoadingCompanies } = useCompanyProfiles()
  const { data: trailerModels, isLoading: isLoadingModels } = useTrailerModels()

  const isEdit = !!trailer

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateTrailerInput>({
    resolver: zodResolver(createTrailerSchema),
    defaultValues: {
      economicNumber: '',
      plates: '',
      serialNumber: '',
      insurancePolicy: '',
      companyProfileId: '',
      trailerModelId: '',
      status: 'available',
      sizeFt: undefined,
      continuousRefrigeratedYield: undefined,
      continuousFrozenYield: undefined,
      ssRefrigeratedYield: undefined,
      ssFrozenYield: undefined,
    },
  })

  // Pre-populate form when editing
  useEffect(() => {
    if (isOpen && trailer) {
      reset({
        economicNumber: trailer.economicNumber,
        plates: trailer.plates || '',
        serialNumber: trailer.serialNumber || '',
        insurancePolicy: trailer.insurancePolicy || '',
        companyProfileId: trailer.companyProfileId || '',
        trailerModelId: trailer.trailerModelId || '',
        status: trailer.status,
        sizeFt: trailer.sizeFt || undefined,
        continuousRefrigeratedYield: trailer.continuousRefrigeratedYield || undefined,
        continuousFrozenYield: trailer.continuousFrozenYield || undefined,
        ssRefrigeratedYield: trailer.ssRefrigeratedYield || undefined,
        ssFrozenYield: trailer.ssFrozenYield || undefined,
      })
    } else if (isOpen && !trailer) {
      reset({
        economicNumber: '',
        plates: '',
        serialNumber: '',
        insurancePolicy: '',
        companyProfileId: '',
        trailerModelId: '',
        status: 'available',
        sizeFt: undefined,
        continuousRefrigeratedYield: undefined,
        continuousFrozenYield: undefined,
        ssRefrigeratedYield: undefined,
        ssFrozenYield: undefined,
      })
    }
  }, [isOpen, trailer, reset])

  const goNext = async () => {
    let fieldsToValidate: (keyof CreateTrailerInput)[] = []
    if (activeStep === 0) fieldsToValidate = ['economicNumber', 'trailerModelId', 'status']
    if (activeStep === 1) fieldsToValidate = ['plates']
    const isValid = await trigger(fieldsToValidate)
    if (isValid) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    setServerError(null)
    try {
      const result = isEdit
        ? await updateTrailerAction({ ...data, id: trailer!.id })
        : await createTrailerAction(data)

      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['fleet', 'trailers'] })
        setSubmissionStatus('success')
      } else {
        console.error("🔥 Error desde el servidor (Create/Update Trailer):", result.error)
        setServerError(result.error?.message || 'Error desconocido')
        setSubmissionStatus('error')
        toast.error(result.error?.message ?? `Error al ${isEdit ? 'actualizar' : 'crear'} remolque`)
      }
    } catch (err) {
      console.error("💥 Excepción capturada en handleFinish:", err)
      setServerError('Error inesperado al procesar la solicitud.')
      setSubmissionStatus('error')
      toast.error('Error inesperado al procesar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleClose = () => {
    setActiveStep(0)
    setSubmissionStatus('idle')
    setServerError(null)
    onClose()
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setServerError(null)
    setActiveStep(0)
    reset()
  }

  // ── Step 1: Datos Generales ──
  const step1Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="economicNumber">Número Económico</Label>
            <Input id="economicNumber" placeholder="REM-001" {...register('economicNumber')} />
            {errors.economicNumber && <p className="text-xs text-red-500">{errors.economicNumber.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="status">Estado</Label>
            <select
              id="status"
              className="flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors"
              {...register('status')}
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="trailerModelId">Modelo de Remolque</Label>
          <select
            id="trailerModelId"
            className="flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors"
            disabled={isLoadingModels}
            {...register('trailerModelId')}
          >
            <option value="">Selecciona un modelo *</option>
            {trailerModels?.map((model) => (
              <option key={model.id} value={model.id}>
                {model.name} {model.brand ? `(${model.brand})` : ''} - {model.size ? `[${model.size}]` : ''}
              </option>
            ))}
          </select>
          {errors.trailerModelId && <p className="text-xs text-red-500">{errors.trailerModelId.message}</p>}
        </div>
      </div>
      <WizardFooter isFirstStep isLastStep={false} onCancel={handleClose} onNext={goNext} />
    </div>
  )

  // ── Step 2: Documentación ──
  const step2Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="plates">Placas</Label>
            <Input id="plates" placeholder="1-XX-222" {...register('plates')} />
            {errors.plates && <p className="text-xs text-red-500">{errors.plates.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serialNumber">Número de Serie (VIN)</Label>
            <Input id="serialNumber" placeholder="SN-12345678" {...register('serialNumber')} />
            {errors.serialNumber && <p className="text-xs text-red-500">{errors.serialNumber.message}</p>}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="insurancePolicy">Póliza de Seguro</Label>
          <Input id="insurancePolicy" placeholder="POLICY-12345" {...register('insurancePolicy')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="companyProfileId">Perfil de Compañía (Propietario)</Label>
          <select
            id="companyProfileId"
            className="flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors"
            disabled={isLoadingCompanies}
            {...register('companyProfileId')}
          >
            <option value="">Selecciona una compañía (Opcional)</option>
            {companies?.map((company) => (
              <option key={company.id} value={company.id}>
                {company.legalName}
              </option>
            ))}
          </select>
          {errors.companyProfileId && <p className="text-xs text-red-500">{errors.companyProfileId.message}</p>}
        </div>
      </div>
      <WizardFooter isFirstStep={false} isLastStep={false} onCancel={handleClose} onBack={goBack} onNext={goNext} />
    </div>
  )

  // ── Step 3: Especificaciones de Rendimiento ──
  const step3Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="sizeFt">Tamaño Efectivo (Pies)</Label>
          <Input
            id="sizeFt"
            type="number"
            placeholder="53"
            {...register('sizeFt', { valueAsNumber: true })}
          />
        </div>
        
        <h4 className="text-sm font-semibold text-stone-900 dark:text-zinc-100 pt-2 border-t border-stone-100 dark:border-zinc-800">
          Rendimientos Teóricos
        </h4>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="continuousRefrigeratedYield" className="text-xs">Refrigerado (Contínuo)</Label>
            <Input id="continuousRefrigeratedYield" type="number" step="0.1" placeholder="Ej. 1.2" {...register('continuousRefrigeratedYield', { valueAsNumber: true })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="continuousFrozenYield" className="text-xs">Congelado (Contínuo)</Label>
            <Input id="continuousFrozenYield" type="number" step="0.1" placeholder="Ej. 1.5" {...register('continuousFrozenYield', { valueAsNumber: true })} />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="ssRefrigeratedYield" className="text-xs">Refrigerado (Start/Stop)</Label>
            <Input id="ssRefrigeratedYield" type="number" step="0.1" placeholder="Ej. 1.0" {...register('ssRefrigeratedYield', { valueAsNumber: true })} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="ssFrozenYield" className="text-xs">Congelado (Start/Stop)</Label>
            <Input id="ssFrozenYield" type="number" step="0.1" placeholder="Ej. 1.1" {...register('ssFrozenYield', { valueAsNumber: true })} />
          </div>
        </div>
      </div>
      <WizardFooter
        isFirstStep={false}
        isLastStep
        onCancel={handleClose}
        onBack={goBack}
        onNext={handleFinish}
        isSubmitting={isSubmitting}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Unidad', content: step1Content },
    { id: '2', title: 'Documentación', content: step2Content },
    { id: '3', title: 'Especificaciones', content: step3Content },
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success' ? (isEdit ? '¡Actualización Exitosa!' : '¡Remolque Registrado!') : 'Error en la operación'}
            message={submissionStatus === 'success'
              ? `El remolque ha sido ${isEdit ? 'actualizado' : 'registrado'} correctamente en la plataforma.`
              : (serverError || 'No pudimos completar la operación en este momento.')}
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
          title={isEdit ? 'Editar Remolque' : 'Nuevo Remolque'}
          description={isEdit && trailer ? `Editando: ${trailer.trailerModelName || 'Remolque'} — ${trailer.economicNumber}` : 'Registra un nuevo equipo de arrastre'}
          icon={isEdit ? <PenLine className="size-5" /> : <Disc3 className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
