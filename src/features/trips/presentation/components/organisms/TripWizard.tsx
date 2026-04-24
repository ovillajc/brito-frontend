'use client'

/**
 * @fileoverview Wizard dinámico para registro de Viajes (Trips).
 * Muestra pasos condicionales dependiendo del cliente seleccionado.
 *
 * @organism
 */

import React, { useEffect, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence } from 'framer-motion'
import { MapPin, Briefcase, Plus, Trash2 } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Button } from '@/src/core/presentation/components/ui/button'
import type { TripsTableRowEntity } from './TripsTable'
import { ClientEntity, UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import { toast } from 'sonner'
import { upsertTripWithClientDataAction } from '../../actions/trips.actions'

// ── Schema Zod ────────────────────────────────────────────────────────────────

// Schema para el log de DETTES (tiendas Walmart)
const detteLogSchema = z.object({
  storeName: z.string().min(1, 'El nombre de la tienda es requerido'),
  appointmentAt: z.string().optional(),
})

const tripWizardSchema = z.object({
  // Step 1 — Datos Generales
  clientId: z.string().min(1, 'El cliente es obligatorio'),
  origin: z.string().min(1, 'El origen es obligatorio'),
  destination: z.string().min(1, 'El destino es obligatorio'),
  unitEconomicNumber: z.string().min(1, 'La unidad es obligatoria'),
  operatorName: z.string().min(1, 'El operador es obligatorio'),
  departureDate: z.string().optional(),

  // Step 2 — Datos Walmart (Opcionales, validados condicionalmente si es Walmart)
  coordinatorName: z.string().optional(),
  route: z.string().optional(),
  cartaPorteWalmart: z.string().optional(),
  numStores: z.number({ error: 'Ingresa un número' }).min(1).optional().or(z.literal('')),

  // Step 3 — DETTES (Opcionales)
  dettesLog: z.array(detteLogSchema).optional(),
})

type TripWizardValues = z.infer<typeof tripWizardSchema>

// ── Props ─────────────────────────────────────────────────────────────────────

interface TripWizardProps {
  isOpen: boolean
  onClose: () => void
  tripRow?: TripsTableRowEntity
  clients?: ClientEntity[]
  units?: UnitAssemblyEntity[]
}

type SubmissionStatus = 'idle' | 'success' | 'error'

// ── Componente ────────────────────────────────────────────────────────────────

export function TripWizard({ isOpen, onClose, tripRow, clients = [], units = [] }: TripWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const isEdit = !!tripRow

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    control,
    setValue,
    formState: { errors },
  } = useForm<TripWizardValues>({
    resolver: zodResolver(tripWizardSchema),
    defaultValues: {
      clientId: '',
      origin: '',
      destination: '',
      unitEconomicNumber: '',
      operatorName: '',
      departureDate: '',
      coordinatorName: '',
      route: '',
      cartaPorteWalmart: '',
      numStores: '',
      dettesLog: [],
    },
  })

  const { fields: dettesFields, append: appendDette, remove: removeDette } = useFieldArray({
    control,
    name: 'dettesLog',
  })

  // Watchers para lógica condicional
  const selectedClientId = watch('clientId')
  const selectedClient = clients.find(c => c.id === selectedClientId)
  const isWalmart = selectedClient?.tradeName?.toLowerCase().includes('walmart')

  const selectedUnitNumber = watch('unitEconomicNumber')

  useEffect(() => {
    if (selectedUnitNumber && !isEdit) {
      const selectedUnit = units.find(u => u.economicNumber === selectedUnitNumber)
      if (selectedUnit?.employeeName) {
        setValue('operatorName', selectedUnit.employeeName, { shouldValidate: true })
      }
    }
  }, [selectedUnitNumber, units, setValue, isEdit])

  // Pre-poblar al editar
  useEffect(() => {
    if (isOpen && tripRow) {
      reset({
        clientId: tripRow.clientId ?? '',
        origin: tripRow.origin ?? '',
        destination: tripRow.destination ?? '',
        unitEconomicNumber: tripRow.unitEconomicNumber ?? '',
        operatorName: tripRow.operatorName ?? '',
        departureDate: tripRow.departureDate ? tripRow.departureDate.substring(0, 16) : '', // yyyy-MM-ddThh:mm
        
        // Walmart data si existe
        coordinatorName: tripRow.walmartData?.coordinatorName ?? '',
        route: tripRow.walmartData?.route ?? '',
        cartaPorteWalmart: tripRow.walmartData?.cartaPorteWalmart ?? '',
        numStores: tripRow.walmartData?.numStores ?? '',
        dettesLog: [],
      })
    } else if (isOpen && !tripRow) {
      reset()
    }
  }, [isOpen, tripRow, reset])

  // Handlers
  const goNext = async () => {
    let fieldsToValidate: (keyof TripWizardValues)[] = []
    
    if (activeStep === 0) {
      fieldsToValidate = ['clientId', 'origin', 'destination', 'unitEconomicNumber', 'operatorName']
    } else if (activeStep === 1 && isWalmart) {
      fieldsToValidate = ['coordinatorName', 'route', 'cartaPorteWalmart', 'numStores']
    }

    const ok = await trigger(fieldsToValidate)
    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const selectedUnit = units.find(u => u.economicNumber === data.unitEconomicNumber)
      const unitAssemblyId = selectedUnit?.id ?? null
      if (!unitAssemblyId) {
        toast.error('No se encontró la unidad seleccionada')
        setSubmissionError('No se encontró la unidad seleccionada')
        setSubmissionStatus('error')
        return
      }

      const departureDate = data.departureDate ? new Date(data.departureDate) : null

      const result = await upsertTripWithClientDataAction({
        trip: {
          id: isEdit ? tripRow?.id : undefined,
          clientId: data.clientId,
          origin: data.origin,
          destination: data.destination,
          departureDate,
          unitAssemblyId,
          status: isEdit ? tripRow?.status : 'scheduled',
        },
        walmart: isWalmart
          ? {
              coordinatorName: data.coordinatorName?.trim() || null,
              route: data.route?.trim() || null,
              cartaPorteWalmart: data.cartaPorteWalmart?.trim() || null,
              numStores: typeof data.numStores === 'number' ? data.numStores : null,
              dettesLog: (data.dettesLog ?? []).map((d) => ({
                storeId: d.storeName,
                storeName: d.storeName,
                appointmentAt: d.appointmentAt ? new Date(d.appointmentAt).toISOString() : null,
              })),
            }
          : undefined,
      })

      if (!result.ok) {
        toast.error(result.error.message)
        setSubmissionError(result.error.message)
        setSubmissionStatus('error')
        return
      }

      toast.success(isEdit ? 'Viaje actualizado' : 'Viaje creado')
      setSubmissionError(null)
      setSubmissionStatus('success')
    } catch {
      toast.error('Error inesperado al guardar el viaje')
      setSubmissionError('Error inesperado al guardar el viaje')
      setSubmissionStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleClose = () => {
    setActiveStep(0)
    setSubmissionStatus('idle')
    setSubmissionError(null)
    onClose()
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setActiveStep(0)
    setSubmissionError(null)
    if (!isEdit) reset()
  }

  // ── Contenido de los pasos ────────────────────────────────────────────────

  const inputClass = 'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
  const errorClass = 'text-xs text-red-500 mt-1'

  // Step 1 — Datos Base
  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        
        <div className="grid gap-2">
          <Label htmlFor="clientId">Cliente</Label>
          <select id="clientId" className={inputClass} {...register('clientId')}>
            <option value="">Selecciona un cliente</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.tradeName || c.companyName} ({c.companyName || c.tradeName})</option>
            ))}
          </select>
          {errors.clientId && <p className={errorClass}>{errors.clientId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="origin">Origen</Label>
            <Input id="origin" placeholder="Ej. Monterrey" {...register('origin')} />
            {errors.origin && <p className={errorClass}>{errors.origin.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destino</Label>
            <Input id="destination" placeholder="Ej. Nuevo Laredo" {...register('destination')} />
            {errors.destination && <p className={errorClass}>{errors.destination.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="unitEconomicNumber">Unidad (Tracto)</Label>
            <select id="unitEconomicNumber" className={inputClass} {...register('unitEconomicNumber')}>
              <option value="">Selecciona una unidad</option>
              {units.map(u => (
                <option key={u.id} value={u.economicNumber}>{u.name} ({u.economicNumber})</option>
              ))}
            </select>
            {errors.unitEconomicNumber && <p className={errorClass}>{errors.unitEconomicNumber.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="operatorName">Operador</Label>
            <Input id="operatorName" placeholder="Nombre del operador" {...register('operatorName')} />
            {errors.operatorName && <p className={errorClass}>{errors.operatorName.message}</p>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="departureDate">Fecha de Salida Programada</Label>
          <Input id="departureDate" type="datetime-local" {...register('departureDate')} />
        </div>

      </div>
      <WizardFooter isFirstStep isLastStep={!isWalmart} onCancel={handleClose} onNext={isWalmart ? goNext : handleFinish} isSubmitting={isSubmitting} />
    </div>
  )

  // Step 2 — Datos Walmart
  const step2Walmart = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/30">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="size-4 text-blue-600 dark:text-blue-400" />
          <h3 className="text-sm font-bold text-blue-900 dark:text-blue-100">Campos Específicos: Walmart</h3>
        </div>
        <p className="text-xs text-blue-700 dark:text-blue-300">
          El cliente seleccionado es Walmart. Por favor llena los datos operativos requeridos para el armado del viaje.
        </p>
      </div>

      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="coordinatorName">Nombre del Coordinador</Label>
          <Input id="coordinatorName" placeholder="Coordinador en turno" {...register('coordinatorName')} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="route">Ruta</Label>
            <Input id="route" placeholder="Ej. R-NTE-01" {...register('route')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="cartaPorteWalmart">Carta Porte Walmart</Label>
            <Input id="cartaPorteWalmart" placeholder="Ej. CP-99123" {...register('cartaPorteWalmart')} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="numStores">Número de Tiendas (Paradas)</Label>
          <input 
            id="numStores" 
            type="number" 
            min="1" 
            placeholder="0" 
            className={inputClass}
            {...register('numStores', { valueAsNumber: true, setValueAs: (v) => v === '' ? '' : Number(v) })} 
          />
        </div>
      </div>
      <WizardFooter isFirstStep={false} isLastStep={false} onCancel={handleClose} onBack={goBack} onNext={goNext} />
    </div>
  )

  // Step 3 — Bitácora DETTES (Walmart)
  const step3Dettes = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Plan de Ruta (DETTES)</h3>
          <p className="text-xs text-stone-500 dark:text-zinc-400">Agrega las tiendas que visitará este viaje.</p>
        </div>
        <Button 
          type="button" 
          variant="outline" 
          size="sm" 
          className="gap-2"
          onClick={() => appendDette({ storeName: '', appointmentAt: '' })}
        >
          <Plus className="size-4" />
          Agregar Tienda
        </Button>
      </div>

      <div className="space-y-3">
        {dettesFields.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-xl">
            <p className="text-sm text-stone-500 dark:text-zinc-400">No hay tiendas en la ruta aún.</p>
          </div>
        ) : (
          dettesFields.map((field, index) => (
            <div key={field.id} className="flex items-end gap-3 p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-700">
              <div className="flex-1 grid gap-2">
                <Label>Tienda {index + 1}</Label>
                <Input placeholder="Ej. Bodega Aurrera Lincoln" {...register(`dettesLog.${index}.storeName` as const)} />
                {errors.dettesLog?.[index]?.storeName && (
                  <p className={errorClass}>{errors.dettesLog[index]?.storeName?.message}</p>
                )}
              </div>
              <div className="flex-1 grid gap-2">
                <Label>Cita Programada</Label>
                <Input type="datetime-local" {...register(`dettesLog.${index}.appointmentAt` as const)} />
              </div>
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="text-red-500 hover:text-red-600 hover:bg-red-50 mb-0.5"
                onClick={() => removeDette(index)}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))
        )}
      </div>

      <WizardFooter isFirstStep={false} isLastStep onCancel={handleClose} onBack={goBack} onNext={handleFinish} isSubmitting={isSubmitting} />
    </div>
  )

  const baseSteps: WizardStep[] = [
    { id: '1', title: 'Datos Base', content: step1 },
  ]

  const walmartSteps: WizardStep[] = [
    { id: '2', title: 'Operativa Walmart', content: step2Walmart },
    { id: '3', title: 'Log DETTES', content: step3Dettes },
  ]

  const steps = isWalmart ? [...baseSteps, ...walmartSteps] : baseSteps

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success'
              ? (isEdit ? '¡Viaje Actualizado!' : '¡Viaje Creado!')
              : 'Error al procesar'}
            message={submissionStatus === 'success'
              ? `El viaje ha sido ${isEdit ? 'actualizado' : 'registrado'} correctamente.`
              : (submissionError ?? 'No pudimos completar la operación en este momento.')}
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
            secondaryActionLabel={submissionStatus === 'success' && !isEdit ? 'Crear otro' : undefined}
            onSecondaryAction={!isEdit ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={isOpen}
          onClose={handleClose}
          title={isEdit ? 'Editar Viaje' : 'Registrar Nuevo Viaje'}
          description={isEdit && tripRow ? `Editando viaje ${tripRow.folio}` : 'Ingresa los datos del servicio a realizar'}
          icon={<MapPin className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
