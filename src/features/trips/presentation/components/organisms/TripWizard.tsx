'use client'

/**
 * @fileoverview Wizard dinámico para registro de Viajes (Trips).
 * Muestra pasos condicionales dependiendo del cliente seleccionado.
 *
 * @organism
 */

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { AnimatePresence } from 'framer-motion'
import { MapPin, Briefcase, Plus, Trash2, Factory } from 'lucide-react'
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
import { getNextTripNumberClientForMonthAction, upsertTripWithClientDataAction } from '../../actions/trips.actions'

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

  // Holcim fields
  tripNumberClient: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  holcimExpensesReviewed: z.string().optional(),
  holcimRemision: z.string().optional(),
  holcimFactura: z.string().optional(),

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
  const [holcimTripLabel, setHolcimTripLabel] = useState<string>('')
  const holcimAutoNumberKeyRef = useRef<string>('')

  const isEdit = !!tripRow

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    control,
    setValue,
    setError,
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
      tripNumberClient: '',
      holcimExpensesReviewed: '',
      holcimRemision: '',
      holcimFactura: '',
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
  const clientLabel = (selectedClient?.tradeName ?? selectedClient?.companyName ?? '').toLowerCase()
  const isWalmart = clientLabel.includes('walmart')
  const isHolcim = clientLabel.includes('holcim')

  const selectedUnitNumber = watch('unitEconomicNumber')
  const departureDateValue = watch('departureDate')
  const selectedUnit = useMemo(
    () => units.find(u => u.economicNumber === selectedUnitNumber) ?? null,
    [units, selectedUnitNumber]
  )

  useEffect(() => {
    if (selectedUnitNumber && !isEdit) {
      const selectedUnit = units.find(u => u.economicNumber === selectedUnitNumber)
      if (selectedUnit?.employeeName) {
        setValue('operatorName', selectedUnit.employeeName, { shouldValidate: true })
      }
    }
  }, [selectedUnitNumber, units, setValue, isEdit])

  const holcimDefaults = useMemo(() => {
    const raw = tripRow?.clientSpecificData
    if (!raw || typeof raw !== 'object') {
      return { expensesReviewed: '', remision: '', factura: '' }
    }
    const holcim = (raw as Record<string, unknown>).holcim
    if (!holcim || typeof holcim !== 'object') {
      return { expensesReviewed: '', remision: '', factura: '' }
    }
    const h = holcim as Record<string, unknown>
    return {
      expensesReviewed: typeof h.expensesReviewed === 'string'
        ? h.expensesReviewed
        : (h.expensesReviewed === true ? 'Sí' : ''),
      remision: typeof h.remision === 'string' ? h.remision : '',
      factura: typeof h.factura === 'string' ? h.factura : '',
    }
  }, [tripRow?.clientSpecificData])

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

        tripNumberClient: tripRow.tripNumberClient ?? '',
        holcimExpensesReviewed: holcimDefaults.expensesReviewed,
        holcimRemision: holcimDefaults.remision,
        holcimFactura: holcimDefaults.factura,
        
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
  }, [isOpen, tripRow, reset, holcimDefaults])

  useEffect(() => {
    if (!isOpen) return
    if (!isHolcim) return
    if (isEdit) {
      if (typeof tripRow?.tripNumberClient === 'number' && tripRow.tripNumberClient > 0) {
        const dt = tripRow.departureDate ? new Date(tripRow.departureDate) : null
        if (dt) {
          setHolcimTripLabel(formatHolcimTripLabel(dt, tripRow.tripNumberClient))
        }
      }
      return
    }

    const dt = departureDateValue ? new Date(departureDateValue) : new Date()
    if (Number.isNaN(dt.getTime())) return

    const key = `${selectedClientId}:${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}`
    if (holcimAutoNumberKeyRef.current === key) return
    holcimAutoNumberKeyRef.current = key

    ;(async () => {
      const month = dt.getUTCMonth() + 1
      const year = dt.getUTCFullYear()
      const result = await getNextTripNumberClientForMonthAction(selectedClientId, month, year)
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }

      const next = result.data
      setValue('tripNumberClient', next, { shouldValidate: false })
      setHolcimTripLabel(formatHolcimTripLabel(dt, next))
    })()
  }, [departureDateValue, isEdit, isHolcim, isOpen, selectedClientId, setValue, tripRow?.departureDate, tripRow?.tripNumberClient])

  // Handlers
  const goNext = async () => {
    let fieldsToValidate: (keyof TripWizardValues)[] = []
    
    if (activeStep === 0) {
      fieldsToValidate = ['clientId', 'origin', 'destination', 'unitEconomicNumber', 'operatorName']
    } else if (activeStep === 1 && isWalmart) {
      fieldsToValidate = ['coordinatorName', 'route', 'cartaPorteWalmart', 'numStores']
    } else if (activeStep === 1 && isHolcim) {
      fieldsToValidate = ['holcimRemision', 'holcimFactura']
    }

    const ok = await trigger(fieldsToValidate)
    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      if (isHolcim) {
        const tripNum = typeof data.tripNumberClient === 'number' ? data.tripNumberClient : Number(data.tripNumberClient)

        const rem = data.holcimRemision?.trim() ?? ''
        const fac = data.holcimFactura?.trim() ?? ''

        let hasHolcimErrors = false

        if (!Number.isFinite(tripNum) || tripNum <= 0) {
          toast.error('No se pudo generar el número de viaje. Intenta cambiar la fecha o reabrir el formulario.')
          hasHolcimErrors = true
        }
        if (rem.length === 0) {
          setError('holcimRemision', { type: 'validate', message: 'La remisión es obligatoria' })
          hasHolcimErrors = true
        }
        if (fac.length === 0) {
          setError('holcimFactura', { type: 'validate', message: 'La factura es obligatoria' })
          hasHolcimErrors = true
        }

        if (hasHolcimErrors) {
          toast.error('Faltan campos obligatorios para Holcim')
          return
        }
      }

      const selectedUnit = units.find(u => u.economicNumber === data.unitEconomicNumber)
      const unitAssemblyId = selectedUnit?.id ?? null
      if (!unitAssemblyId) {
        toast.error('No se encontró la unidad seleccionada')
        setSubmissionError('No se encontró la unidad seleccionada')
        setSubmissionStatus('error')
        return
      }

      const departureDate = data.departureDate ? new Date(data.departureDate) : null

      const clientSpecificDataBase = isEdit ? (tripRow?.clientSpecificData ?? null) : null
      const clientSpecificData =
        isHolcim
          ? {
              ...(clientSpecificDataBase && typeof clientSpecificDataBase === 'object' ? clientSpecificDataBase : {}),
              holcim: {
                expensesReviewed: data.holcimExpensesReviewed?.trim() ? data.holcimExpensesReviewed.trim() : null,
                remision: data.holcimRemision?.trim() ? data.holcimRemision.trim() : null,
                factura: data.holcimFactura?.trim() ? data.holcimFactura.trim() : null,
              },
            }
          : (
              clientSpecificDataBase &&
              typeof clientSpecificDataBase === 'object' &&
              'holcim' in (clientSpecificDataBase as Record<string, unknown>)
                ? Object.fromEntries(
                    Object.entries(clientSpecificDataBase as Record<string, unknown>).filter(([k]) => k !== 'holcim')
                  )
                : clientSpecificDataBase
            )

      const result = await upsertTripWithClientDataAction({
        trip: {
          id: isEdit ? tripRow?.id : undefined,
          clientId: data.clientId,
          origin: data.origin,
          destination: data.destination,
          departureDate,
          unitAssemblyId,
          status: isEdit ? tripRow?.status : 'scheduled',
          tripNumberClient: isHolcim && typeof data.tripNumberClient === 'number' ? data.tripNumberClient : null,
          clientSpecificData: clientSpecificData && Object.keys(clientSpecificData).length > 0 ? clientSpecificData : null,
        },
        walmart: isWalmart
          ? {
              coordinatorName: data.coordinatorName?.trim() || null,
              route: data.route?.trim() || null,
              cartaPorteWalmart: data.cartaPorteWalmart?.trim() || null,
              numStores: typeof data.numStores === 'number' ? data.numStores : null,
              dettesLog: (data.dettesLog ?? []).map((d: { storeName: string; appointmentAt?: string }) => ({
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
    setHolcimTripLabel('')
    holcimAutoNumberKeyRef.current = ''
    onClose()
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setActiveStep(0)
    setSubmissionError(null)
    setHolcimTripLabel('')
    holcimAutoNumberKeyRef.current = ''
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
      <WizardFooter
        isFirstStep
        isLastStep={!isWalmart && !isHolcim}
        onCancel={handleClose}
        onNext={(isWalmart || isHolcim) ? goNext : handleFinish}
        isSubmitting={isSubmitting}
      />
    </div>
  )
  const step2Holcim = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-2 mb-1">
          <Factory className="size-4 text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Campos Específicos: Holcim</h3>
        </div>
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          Captura la información de remisión/factura para el control del cliente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Número de viaje</Label>
          <div className={`${inputClass} flex items-center`}>
            <span className="text-sm font-mono font-bold text-stone-900 dark:text-zinc-100">
              {holcimTripLabel || '—'}
            </span>
          </div>
          <input type="hidden" {...register('tripNumberClient', { valueAsNumber: true, setValueAs: (v) => v === '' ? '' : Number(v) })} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="holcimExpensesReviewed">Gastos revisados</Label>
          <Input id="holcimExpensesReviewed" placeholder="Ej. Casetas, Urea, Talachas..." {...register('holcimExpensesReviewed')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="holcimRemision">Remisión</Label>
          <Input id="holcimRemision" placeholder="Ej. REM-12345" {...register('holcimRemision')} />
          {errors.holcimRemision && <p className={errorClass}>{errors.holcimRemision.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="holcimFactura">Factura</Label>
          <Input id="holcimFactura" placeholder="Ej. FAC-12345" {...register('holcimFactura')} />
          {errors.holcimFactura && <p className={errorClass}>{errors.holcimFactura.message as string}</p>}
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

  const holcimSteps: WizardStep[] = [
    { id: '2', title: 'Operativa Holcim', content: step2Holcim },
  ]

  const steps = isWalmart
    ? [...baseSteps, ...walmartSteps]
    : (isHolcim ? [...baseSteps, ...holcimSteps] : baseSteps)

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

function formatHolcimTripLabel(date: Date, tripNumberClient: number) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const counter = String(tripNumberClient).padStart(3, '0')
  return `${year}-${month}-${counter}`
}
