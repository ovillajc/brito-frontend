'use client'

/**
 * @fileoverview Wizard de creación y edición de Tractocamiones.
 * Utiliza el componente genérico `Wizard` de core y el patrón de `EmployeeWizard`.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Truck, PenLine } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { createTruckSchema, CreateTruckInput } from '../../../domain/schemas/truck.schema'
import { createTruckAction, updateTruckAction } from '../../actions/truck.actions'
import { TruckEntity, vehicleStatus } from '../../../domain/entities'
import { useCompanyProfiles } from '../../../../company-profile/presentation/hooks/use-company-profile'

interface TruckWizardProps {
  isOpen: boolean
  onClose: () => void
  /** Si se provee un truck, el wizard opera en modo edición. */
  truck?: TruckEntity
}

type SubmissionStatus = 'idle' | 'success' | 'error'

const STATUS_OPTIONS: { label: string; value: vehicleStatus }[] = [
  { label: 'Disponible', value: 'available' },
  { label: 'En Taller', value: 'maintenance' },
  { label: 'Asignada', value: 'assigned' },
]

/**
 * Wizard multi-paso para crear o editar un Tractocamión.
 */
import { useQueryClient } from '@tanstack/react-query'

export function TruckWizard({ isOpen, onClose, truck }: TruckWizardProps) {
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [serverError, setServerError] = useState<string | null>(null)

  const { data: companies, isLoading: isLoadingCompanies } = useCompanyProfiles()

  const isEdit = !!truck

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateTruckInput>({
    resolver: zodResolver(createTruckSchema),
    defaultValues: {
      economicNumber: '',
      brand: '',
      model: '',
      year: new Date().getFullYear(),
      plates: '',
      serialNumber: '',
      insurancePolicy: '',
      companyProfileId: '',
      status: 'available',
      engine: '',
      tireSize: '',
      tankCapacity: undefined,
      vehicleType: 'TRUCK',
    },
  })

  // Pre-populate form when editing
  useEffect(() => {
    if (isOpen && truck) {
      reset({
        economicNumber: truck.economicNumber,
        brand: truck.brand,
        model: truck.model,
        year: truck.year,
        plates: truck.plates,
        serialNumber: truck.serialNumber ?? '',
        insurancePolicy: truck.insurancePolicy ?? '',
        companyProfileId: truck.companyProfileId ?? '',
        status: truck.status,
        engine: truck.engine ?? '',
        tireSize: truck.tireSize ?? '',
        tankCapacity: truck.tankCapacity ?? undefined,
        vehicleType: truck.vehicleType ?? 'TRUCK',
        sizeFt: truck.sizeFt ?? undefined,
        capacityKg: truck.capacityKg ?? undefined,
      })
    } else if (isOpen && !truck) {
      reset({
        economicNumber: '',
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        plates: '',
        serialNumber: '',
        insurancePolicy: '',
        companyProfileId: '',
        status: 'available',
        engine: '',
        tireSize: '',
        tankCapacity: undefined,
        vehicleType: 'TRUCK',
        sizeFt: undefined,
        capacityKg: undefined,
      })
    }
  }, [isOpen, truck, reset])

  const goNext = async () => {
    let fieldsToValidate: (keyof CreateTruckInput)[] = []
    if (activeStep === 0) fieldsToValidate = ['economicNumber', 'brand', 'model', 'year', 'status']
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
        ? await updateTruckAction({ ...data, id: truck!.id })
        : await createTruckAction(data)

      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['fleet', 'tractors'] })
        setSubmissionStatus('success')
      } else {
        console.error("🔥 Error desde el servidor (Create/Update Truck):", result.error)
        setServerError(result.error?.message || 'Error desconocido')
        setSubmissionStatus('error')
        toast.error(result.error?.message ?? `Error al ${isEdit ? 'actualizar' : 'crear'} tracto`)
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
    if (!isEdit) reset()
    onClose()
  }

  const handleReset = () => {
    setActiveStep(0)
    setSubmissionStatus('idle')
    setServerError(null)
    reset()
  }

  // ── Step 1: Datos Generales ──
  const step1Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="vehicleType">Tipo de Vehículo</Label>
            <select
              id="vehicleType"
              className="flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors"
              {...register('vehicleType')}
            >
              <option value="TRUCK">Tractocamión</option>
              <option value="TORTON">Torton (Unidad unificada)</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="economicNumber">Número Económico</Label>
            <Input id="economicNumber" placeholder="ECO-001" {...register('economicNumber')} />
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
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="brand">Marca</Label>
            <Input id="brand" placeholder="Kenworth, Freightliner..." {...register('brand')} />
            {errors.brand && <p className="text-xs text-red-500">{errors.brand.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="model">Modelo</Label>
            <Input id="model" placeholder="T680, Cascadia..." {...register('model')} />
            {errors.model && <p className="text-xs text-red-500">{errors.model.message}</p>}
          </div>
        </div>
        <div className="grid gap-2 max-w-xs">
          <Label htmlFor="year">Año</Label>
          <Input
            id="year"
            type="number"
            placeholder="2024"
            {...register('year', { valueAsNumber: true })}
          />
          {errors.year && <p className="text-xs text-red-500">{errors.year.message}</p>}
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
            <Input id="plates" placeholder="ABC-1234" {...register('plates')} />
            {errors.plates && <p className="text-xs text-red-500">{errors.plates.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="serialNumber">Número de Serie (VIN)</Label>
            <Input id="serialNumber" placeholder="1HKBR868X7A000000" {...register('serialNumber')} />
            {errors.serialNumber && <p className="text-xs text-red-500">{errors.serialNumber.message}</p>}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="insurancePolicy">Póliza de Seguro</Label>
          <Input id="insurancePolicy" placeholder="POLICY-12345" {...register('insurancePolicy')} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="companyProfileId">Perfil de Compañía</Label>
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

  // ── Step 3: Datos Técnicos ──
  const step3Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="engine">Motor</Label>
            <Input id="engine" placeholder="Cummins X15, Detroit..." {...register('engine')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="tireSize">Talla de Llanta</Label>
            <Input id="tireSize" placeholder="11R22.5" {...register('tireSize')} />
          </div>
        </div>
        <div className="grid gap-2">
            <Label htmlFor="tankCapacity">Capacidad de Tanque (L)</Label>
            <Input
              id="tankCapacity"
              type="number"
              placeholder="600"
              {...register('tankCapacity', { valueAsNumber: true })}
            />
          </div>
          {watch('vehicleType') === 'TORTON' && (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="capacityKg">Capacidad de Carga (kg)</Label>
                <Input
                  id="capacityKg"
                  type="number"
                  placeholder="25000"
                  {...register('capacityKg', { valueAsNumber: true })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="sizeFt">Tamaño (Pies)</Label>
                <Input
                  id="sizeFt"
                  type="number"
                  placeholder="53"
                  {...register('sizeFt', { valueAsNumber: true })}
                />
              </div>
            </div>
          )}
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
    { id: '3', title: 'Técnico', content: step3Content },
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success' ? (isEdit ? '¡Actualización Exitosa!' : '¡Tracto Registrado!') : 'Error en la operación'}
            message={submissionStatus === 'success'
              ? `El tracto ha sido ${isEdit ? 'actualizado' : 'registrado'} correctamente en la plataforma.`
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
          title={isEdit ? 'Editar Tracto' : 'Nuevo Tracto'}
          description={isEdit && truck ? `Editando: ${truck.brand} ${truck.model} — ${truck.plates}` : 'Registra un nuevo tractocamión'}
          icon={isEdit ? <PenLine className="size-5" /> : <Truck className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
