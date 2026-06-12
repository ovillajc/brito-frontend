'use client'

/**
 * @fileoverview Wizard dinámico para registro de Viajes (Trips).
 * Muestra pasos condicionales dependiendo del cliente seleccionado.
 *
 * @organism
 */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Controller, useFieldArray, useForm } from 'react-hook-form'
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
import { Textarea } from '@/src/core/presentation/components/ui/textarea'
import { ConfirmDialog } from '@/src/core/presentation/components/molecules/confirm-dialog'
import type { TripsTableRowEntity } from './TripsTable'
import { TripStatus, UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import { ClientEntity } from '@/src/features/clients/domain/entities'
import { toast } from 'sonner'
import { getNextTripNumberClientForMonthAction, upsertTripWithClientDataAction } from '../../actions/trips.actions'
import { useCompanyProfiles } from '@/src/features/company-profile/presentation/hooks/use-company-profile'
import { isUnitAssignableForNewTrip } from '@/src/features/trips/domain/rules/is-unit-assignable'

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
  forceUnitAssignment: z.boolean().optional(),
  operatorName: z.string().min(1, 'El operador es obligatorio'),
  departureDate: z.string().optional(),
  observations: z.string().optional(),
  status: z.enum([
    'scheduled',
    'in_progress',
    'in_delivery',
    'completed',
    'cancelled',
  ]).optional(),



  // Holcim fields
  tripNumberClient: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  holcimExpensesReviewed: z.string().optional(),
  holcimRemision: z.string().optional(),
  holcimFactura: z.string().optional(),

  // Barichon fields
  barichonExpensesReviewed: z.string().optional(),
  barichonTicket: z.string().optional(),
  barichonGrossWeight: z.string().optional(),
  barichonTareWeight: z.string().optional(),
  barichonUnloading: z.string().optional(),
  barichonRemision: z.string().optional(),
  barichonMaterial: z.string().optional(),
  barichonFactura: z.string().optional(),
  barichonPo: z.string().optional(),
  barichonTotal: z.string().optional(),

  // Step 2 — Datos Walmart (Opcionales, validados condicionalmente si es Walmart)
  coordinatorName: z.string().optional(),
  route: z.string().optional(),
  walmartCargoType: z.string().optional(),
  cartaPorteWalmart: z.string().optional(),
  numStores: z.number({ error: 'Ingresa un número' }).min(1).optional().or(z.literal('')),
  walmartDepartureTemperature: z.string().optional(),
  walmartDepartureTime: z.string().optional(),
  walmartDestinationCities: z.string().optional(),
  walmartIncidencias: z.string().optional(),
  strNumLoad: z.string().optional(),
  dhdNumLoad: z.string().optional(),
  strComplementCartaPorte: z.string().optional(),
  dhdComplementCartaPorte: z.string().optional(),
  strPreinvoiceKm: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  dhdPreinvoiceKm: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  strKmTraveled: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  dhdKmTraveled: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  strDiesel: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  dhdDiesel: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  strCasetas: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  dhdCasetas: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  strTotalInvoice: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),
  dhdTotalInvoice: z.number({ error: 'Ingresa un número' }).optional().or(z.literal('')),

  // Step 3 — DETTES (Opcionales)
  dettesLog: z.array(detteLogSchema).optional(),
})

type TripWizardValues = z.infer<typeof tripWizardSchema>

function toDateTimeLocalValue(iso: string | null | undefined): string {
  if (!iso) return ''
  const dt = new Date(iso)
  if (Number.isNaN(dt.getTime())) return ''
  return dt.toISOString().slice(0, 16)
}

function getWalmartDestinationCities(clientSpecificData: Record<string, unknown> | null | undefined): string {
  if (!clientSpecificData || typeof clientSpecificData !== 'object') return ''
  const walmartRaw = (clientSpecificData as Record<string, unknown>).walmart
  if (!walmartRaw || typeof walmartRaw !== 'object') return ''
  const destinationCities = (walmartRaw as Record<string, unknown>).destinationCities
  return typeof destinationCities === 'string' ? destinationCities : ''
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TripWizardProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: (tripId: string) => void | Promise<void>
  tripRow?: TripsTableRowEntity
  clients?: ClientEntity[]
  units?: UnitAssemblyEntity[]
}

type SubmissionStatus = 'idle' | 'success' | 'error'

// ── Componente ────────────────────────────────────────────────────────────────

export function TripWizard({ isOpen, onClose, onSaved, tripRow, clients = [], units = [] }: TripWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState<string | null>(null)
  const [holcimTripLabel, setHolcimTripLabel] = useState<string>('')
  const holcimAutoNumberKeyRef = useRef<string>('')
  const lastConfirmedUnitNumberRef = useRef<string>('')
  const [isUnitOverrideDialogOpen, setIsUnitOverrideDialogOpen] = useState(false)
  const [pendingUnitEconomicNumber, setPendingUnitEconomicNumber] = useState<string | null>(null)

  const isEdit = !!tripRow

  const companyProfilesQuery = useCompanyProfiles()
  const activeCompany = companyProfilesQuery.data?.[0] ?? null

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    control,
    setValue,
    setError,
    getValues,
    formState: { errors },
  } = useForm<TripWizardValues>({
    resolver: zodResolver(tripWizardSchema),
    defaultValues: {
      clientId: '',
      origin: '',
      destination: '',
      unitEconomicNumber: '',
      forceUnitAssignment: false,
      operatorName: '',
      departureDate: '',
      observations: '',
      tripNumberClient: '',
      holcimExpensesReviewed: '',
      holcimRemision: '',
      holcimFactura: '',
      barichonExpensesReviewed: '',
      barichonTicket: '',
      barichonGrossWeight: '',
      barichonTareWeight: '',
      barichonUnloading: '',
      barichonRemision: '',
      barichonMaterial: '',
      barichonFactura: '',
      barichonPo: '',
      barichonTotal: '',
      coordinatorName: '',
      status: 'scheduled',
      route: '',
      walmartCargoType: '',
      cartaPorteWalmart: '',
      numStores: '',
      walmartDepartureTemperature: '',
      walmartDepartureTime: '',
      walmartDestinationCities: '',
      walmartIncidencias: '',
      strNumLoad: '',
      dhdNumLoad: '',
      strComplementCartaPorte: '',
      dhdComplementCartaPorte: '',
      strPreinvoiceKm: '',
      dhdPreinvoiceKm: '',
      strKmTraveled: '',
      dhdKmTraveled: '',
      strDiesel: '',
      dhdDiesel: '',
      strCasetas: '',
      dhdCasetas: '',
      strTotalInvoice: '',
      dhdTotalInvoice: '',
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
  const normalizedClientLabel = normalizeText(selectedClient?.tradeName ?? selectedClient?.companyName ?? '')
  const isBarichonClient = [
    'altopetrum',
    'solinmar',
    'soluciones integrales maritimas',
  ].some((k) => normalizedClientLabel.includes(k))
  const isBarichon = isBarichonClient

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

  const barichonDefaults = useMemo(() => {
    const raw = tripRow?.clientSpecificData
    if (!raw || typeof raw !== 'object') {
      return {
        expensesReviewed: '',
        ticket: '',
        grossWeight: '',
        tareWeight: '',
        unloading: '',
        remision: '',
        material: '',
        factura: '',
        po: '',
        total: '',
      }
    }
    const b = (raw as Record<string, unknown>).barichon
    if (!b || typeof b !== 'object') {
      return {
        expensesReviewed: '',
        ticket: '',
        grossWeight: '',
        tareWeight: '',
        unloading: '',
        remision: '',
        material: '',
        factura: '',
        po: '',
        total: '',
      }
    }
    const obj = b as Record<string, unknown>
    const weight = obj.weight && typeof obj.weight === 'object' ? obj.weight as Record<string, unknown> : null
    return {
      expensesReviewed: typeof obj.expensesReviewed === 'string' ? obj.expensesReviewed : '',
      ticket: typeof obj.ticket === 'string' ? obj.ticket : '',
      grossWeight: typeof weight?.gross === 'number' ? String(weight.gross) : '',
      tareWeight: typeof weight?.tare === 'number' ? String(weight.tare) : '',
      unloading: typeof obj.unloading === 'string' ? obj.unloading : '',
      remision: typeof obj.remision === 'string' ? obj.remision : '',
      material: typeof obj.material === 'string' ? obj.material : '',
      factura: typeof obj.factura === 'string' ? obj.factura : '',
      po: typeof obj.po === 'string' ? obj.po : '',
      total: typeof obj.total === 'number' ? String(obj.total) : '',
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
        forceUnitAssignment: false,
        operatorName: tripRow.operatorName ?? '',
        departureDate: tripRow.departureDate ? tripRow.departureDate.substring(0, 16) : '', // yyyy-MM-ddThh:mm
        observations: tripRow.observations ?? '',

        tripNumberClient: tripRow.tripNumberClient ?? '',
        holcimExpensesReviewed: holcimDefaults.expensesReviewed,
        holcimRemision: holcimDefaults.remision,
        holcimFactura: holcimDefaults.factura,

        barichonExpensesReviewed: barichonDefaults.expensesReviewed,
        barichonTicket: barichonDefaults.ticket,
        barichonGrossWeight: barichonDefaults.grossWeight,
        barichonTareWeight: barichonDefaults.tareWeight,
        barichonUnloading: barichonDefaults.unloading,
        barichonRemision: barichonDefaults.remision,
        barichonMaterial: barichonDefaults.material,
        barichonFactura: barichonDefaults.factura,
        barichonPo: barichonDefaults.po,
        barichonTotal: barichonDefaults.total,
        
        // Walmart data si existe
        coordinatorName: tripRow.walmartData?.coordinatorName ?? '',
        route: tripRow.walmartData?.route ?? '',
        cartaPorteWalmart: tripRow.walmartData?.cartaPorteWalmart ?? '',
        numStores: typeof tripRow.walmartData?.numStores === 'number' ? tripRow.walmartData.numStores : '',
        walmartCargoType: tripRow.walmartData?.cargoType ?? '',
        walmartDepartureTemperature: tripRow.walmartData?.departureTemperature ?? '',
        walmartDepartureTime: toDateTimeLocalValue(tripRow.walmartData?.departureTime),
        walmartDestinationCities: getWalmartDestinationCities(tripRow.clientSpecificData),
        walmartIncidencias: tripRow.walmartData?.incidencias ?? '',
        strNumLoad: tripRow.walmartData?.strNumLoad ?? '',
        dhdNumLoad: tripRow.walmartData?.dhdNumLoad ?? '',
        strComplementCartaPorte: tripRow.walmartData?.strComplementCartaPorte ?? '',
        dhdComplementCartaPorte: tripRow.walmartData?.dhdComplementCartaPorte ?? '',
        strPreinvoiceKm: typeof tripRow.walmartData?.strPreinvoiceKm === 'number' ? tripRow.walmartData.strPreinvoiceKm : '',
        dhdPreinvoiceKm: typeof tripRow.walmartData?.dhdPreinvoiceKm === 'number' ? tripRow.walmartData.dhdPreinvoiceKm : '',
        strKmTraveled: typeof tripRow.walmartData?.strKmTraveled === 'number' ? tripRow.walmartData.strKmTraveled : '',
        dhdKmTraveled: typeof tripRow.walmartData?.dhdKmTraveled === 'number' ? tripRow.walmartData.dhdKmTraveled : '',
        strDiesel: typeof tripRow.walmartData?.strDiesel === 'number' ? tripRow.walmartData.strDiesel : '',
        dhdDiesel: typeof tripRow.walmartData?.dhdDiesel === 'number' ? tripRow.walmartData.dhdDiesel : '',
        strCasetas: typeof tripRow.walmartData?.strCasetas === 'number' ? tripRow.walmartData.strCasetas : '',
        dhdCasetas: typeof tripRow.walmartData?.dhdCasetas === 'number' ? tripRow.walmartData.dhdCasetas : '',
        strTotalInvoice: typeof tripRow.walmartData?.strTotalInvoice === 'number' ? tripRow.walmartData.strTotalInvoice : '',
        dhdTotalInvoice: typeof tripRow.walmartData?.dhdTotalInvoice === 'number' ? tripRow.walmartData.dhdTotalInvoice : '',
        dettesLog: Array.isArray(tripRow.walmartData?.dettesLog) 
          ? tripRow.walmartData.dettesLog.map((d) => {
              const row = d && typeof d === 'object' ? (d as Record<string, unknown>) : {}
              const storeId = typeof row.storeId === 'string' ? row.storeId : ''
              const storeName = typeof row.storeName === 'string' ? row.storeName : ''
              const appointmentAtRaw = typeof row.appointmentAt === 'string' ? row.appointmentAt : null
              return {
                storeName: storeId || storeName || '',
                appointmentAt: toDateTimeLocalValue(appointmentAtRaw),
              }
            })
          : [],
        status: tripRow.status ?? 'scheduled',
      })
      lastConfirmedUnitNumberRef.current = tripRow.unitEconomicNumber ?? ''
      setPendingUnitEconomicNumber(null)
      setIsUnitOverrideDialogOpen(false)

    } else if (isOpen && !tripRow) {
      reset()
      lastConfirmedUnitNumberRef.current = ''
      setPendingUnitEconomicNumber(null)
      setIsUnitOverrideDialogOpen(false)
    }
  }, [isOpen, tripRow, reset, holcimDefaults, barichonDefaults])

  useEffect(() => {
    if (!isOpen) return
    if (!selectedClientId) return
    if (isEdit) {
      if (typeof tripRow?.tripNumberClient === 'number' && tripRow.tripNumberClient > 0) {
        if (isHolcim) {
          const dt = tripRow.departureDate ? new Date(tripRow.departureDate) : null
          if (dt) {
            setHolcimTripLabel(formatHolcimTripLabel(dt, tripRow.tripNumberClient))
          }
        }
        return
      }

      const current = getValues('tripNumberClient')
      if (typeof current === 'number' && current > 0) return
    }

    const dt = departureDateValue
      ? new Date(departureDateValue)
      : (tripRow?.departureDate ? new Date(tripRow.departureDate) : new Date())
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
      if (isHolcim) {
        setHolcimTripLabel(formatHolcimTripLabel(dt, next))
      }
    })()
  }, [departureDateValue, getValues, isEdit, isHolcim, isOpen, selectedClientId, setValue, tripRow?.departureDate, tripRow?.tripNumberClient])

  // Handlers
  const validateBarichonFields = () => {
    let hasErrors = false

    const values = getValues()

    const tripNum = typeof values.tripNumberClient === 'number'
      ? values.tripNumberClient
      : Number(values.tripNumberClient)
    
    if (values.tripNumberClient !== '' && values.tripNumberClient != null && (!Number.isFinite(tripNum) || tripNum <= 0)) {
      setError('tripNumberClient', { type: 'validate', message: 'Ingresa un número válido' })
      hasErrors = true
    }

    const grossRaw = values.barichonGrossWeight?.trim() ?? ''
    const tareRaw = values.barichonTareWeight?.trim() ?? ''
    const totalRaw = values.barichonTotal?.trim() ?? ''

    if (grossRaw.length > 0) {
      const gross = Number(grossRaw.replace(/,/g, ''))
      if (!Number.isFinite(gross) || gross < 0) {
        setError('barichonGrossWeight', { type: 'validate', message: 'Ingresa un peso bruto válido' })
        hasErrors = true
      }
    }

    if (tareRaw.length > 0) {
      const tare = Number(tareRaw.replace(/,/g, ''))
      if (!Number.isFinite(tare) || tare < 0) {
        setError('barichonTareWeight', { type: 'validate', message: 'Ingresa un peso tara válido' })
        hasErrors = true
      }
    }

    if (totalRaw.length > 0) {
      const total = Number(totalRaw.replace(/,/g, ''))
      if (!Number.isFinite(total) || total < 0) {
        setError('barichonTotal', { type: 'validate', message: 'Ingresa un total válido' })
        hasErrors = true
      }
    }

    return !hasErrors
  }

  const buildBarichonPayload = (values: TripWizardValues) => {
    const gross = Number((values.barichonGrossWeight ?? '').replace(/,/g, ''))
    const tare = Number((values.barichonTareWeight ?? '').replace(/,/g, ''))
    const net = Number.isFinite(gross) && Number.isFinite(tare) ? gross - tare : null
    const total = Number((values.barichonTotal ?? '').replace(/,/g, ''))

    return {
      expensesReviewed: values.barichonExpensesReviewed?.trim() ? values.barichonExpensesReviewed.trim() : null,
      ticket: values.barichonTicket?.trim() ? values.barichonTicket.trim() : null,
      unloading: values.barichonUnloading?.trim() ? values.barichonUnloading.trim() : null,
      remision: values.barichonRemision?.trim() ? values.barichonRemision.trim() : null,
      material: values.barichonMaterial?.trim() ? values.barichonMaterial.trim() : null,
      factura: values.barichonFactura?.trim() ? values.barichonFactura.trim() : null,
      po: values.barichonPo?.trim() ? values.barichonPo.trim() : null,
      total: Number.isFinite(total) ? total : null,
      weight: {
        gross: Number.isFinite(gross) ? gross : null,
        tare: Number.isFinite(tare) ? tare : null,
        net,
      },
      unit: {
        economicNumber: selectedUnit?.economicNumber ?? values.unitEconomicNumber ?? null,
        operatorName: values.operatorName?.trim() ? values.operatorName.trim() : null,
        truckPlates: selectedUnit?.truckPlates ?? null,
        trailerPlates: selectedUnit?.trailerPlates ?? null,
        trailer2Plates: selectedUnit?.trailer2Plates ?? null,
      },
    }
  }

  const goNext = async () => {
    const currentId = steps[activeStep]?.id
    let ok = true

    if (currentId === 'base') {
      ok = await trigger(['clientId', 'origin', 'destination', 'unitEconomicNumber', 'operatorName'])
    }

    if (currentId === 'barichon') {
      ok = validateBarichonFields()
    }

    if (currentId === 'walmart') {
      ok = await trigger(['coordinatorName', 'route', 'cartaPorteWalmart', 'numStores'])
    }

    if (currentId === 'holcim') {
      ok = await trigger(['holcimRemision', 'holcimFactura'])
    }

    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      if (isBarichon) {
        const barOk = validateBarichonFields()
        if (!barOk) {
          toast.error('Faltan campos obligatorios para Barichon')
          return
        }
      }

      if (isHolcim) {
        const tripNum = typeof data.tripNumberClient === 'number' ? data.tripNumberClient : Number(data.tripNumberClient)
        let hasHolcimErrors = false

        if (data.tripNumberClient !== '' && data.tripNumberClient != null && (!Number.isFinite(tripNum) || tripNum <= 0)) {
          toast.error('Número de viaje inválido.')
          hasHolcimErrors = true
        }

        if (hasHolcimErrors) {
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

      const isSameUnitAsExisting = Boolean(isEdit && tripRow?.unitAssemblyId && tripRow.unitAssemblyId === unitAssemblyId)
      const forceUnitAssignment = Boolean(data.forceUnitAssignment)
      if (!forceUnitAssignment && !isSameUnitAsExisting && !isUnitAssignableForNewTrip(selectedUnit?.status)) {
        const msg = 'La unidad seleccionada no está disponible para asignarse a un nuevo viaje'
        toast.error(msg)
        setError('unitEconomicNumber', { type: 'validate', message: msg })
        return
      }

      const departureDate = data.departureDate ? new Date(data.departureDate) : null

      const clientSpecificDataBase = isEdit ? (tripRow?.clientSpecificData ?? null) : null
      const clientSpecificData =
        isBarichon
          ? {
              ...(clientSpecificDataBase && typeof clientSpecificDataBase === 'object' ? clientSpecificDataBase : {}),
              barichon: buildBarichonPayload(data),
            }
          : (
              clientSpecificDataBase &&
              typeof clientSpecificDataBase === 'object' &&
              'barichon' in (clientSpecificDataBase as Record<string, unknown>)
                ? Object.fromEntries(
                    Object.entries(clientSpecificDataBase as Record<string, unknown>).filter(([k]) => k !== 'barichon')
                  )
                : clientSpecificDataBase
            )
      
      const clientSpecificDataWithHolcim =
        isHolcim
          ? {
              ...(clientSpecificData && typeof clientSpecificData === 'object' ? clientSpecificData : {}),
              holcim: {
                expensesReviewed: data.holcimExpensesReviewed?.trim() ? data.holcimExpensesReviewed.trim() : null,
                remision: data.holcimRemision?.trim() ? data.holcimRemision.trim() : null,
                factura: data.holcimFactura?.trim() ? data.holcimFactura.trim() : null,
              },
            }
          : (
              clientSpecificData &&
              typeof clientSpecificData === 'object' &&
              'holcim' in (clientSpecificData as Record<string, unknown>)
                ? Object.fromEntries(
                    Object.entries(clientSpecificData as Record<string, unknown>).filter(([k]) => k !== 'holcim')
                  )
                : clientSpecificData
            )

      const baseClientSpecific =
        clientSpecificDataWithHolcim && typeof clientSpecificDataWithHolcim === 'object'
          ? (clientSpecificDataWithHolcim as Record<string, unknown>)
          : null

      const destinationCitiesRaw = data.walmartDestinationCities?.trim() ?? ''
      const clientSpecificDataFinal =
        isWalmart
          ? {
              ...(baseClientSpecific ?? {}),
              walmart: {
                ...(baseClientSpecific?.walmart && typeof baseClientSpecific.walmart === 'object'
                  ? (baseClientSpecific.walmart as Record<string, unknown>)
                  : {}),
                destinationCities: destinationCitiesRaw.length > 0 ? destinationCitiesRaw : null,
              },
            }
          : (
              baseClientSpecific && 'walmart' in baseClientSpecific
                ? Object.fromEntries(Object.entries(baseClientSpecific).filter(([k]) => k !== 'walmart'))
                : baseClientSpecific
            )

      const tripNumberClient = typeof data.tripNumberClient === 'number' ? data.tripNumberClient : null

      const result = await upsertTripWithClientDataAction({
        trip: {
          id: isEdit ? tripRow?.id : undefined,
          clientId: data.clientId,
          companyProfileId: activeCompany?.id ?? null,
          origin: data.origin,
          destination: data.destination,
          departureDate,
          unitAssemblyId,
          status: data.status as TripStatus,
          tripNumberClient,
          observations: data.observations?.trim() || null,

          clientSpecificData: clientSpecificDataFinal && Object.keys(clientSpecificDataFinal).length > 0 ? clientSpecificDataFinal : null,
        },
        forceUnitAssignment,
        walmart: isWalmart
          ? {
              coordinatorName: data.coordinatorName?.trim() || null,
              route: data.route?.trim() || null,
              cargoType: data.walmartCargoType?.trim() || null,
              cartaPorteWalmart: data.cartaPorteWalmart?.trim() || null,
              numStores: typeof data.numStores === 'number' ? data.numStores : null,
              departureTemperature: data.walmartDepartureTemperature?.trim() || null,
              departureTime: data.walmartDepartureTime ? new Date(data.walmartDepartureTime).toISOString() : null,
              incidencias: data.walmartIncidencias?.trim() || null,
              str: {
                numLoad: data.strNumLoad?.trim() || null,
                complementCartaPorte: data.strComplementCartaPorte?.trim() || null,
                preinvoiceKm: typeof data.strPreinvoiceKm === 'number' ? data.strPreinvoiceKm : null,
                kmTraveled: typeof data.strKmTraveled === 'number' ? data.strKmTraveled : null,
                diesel: typeof data.strDiesel === 'number' ? data.strDiesel : null,
                casetas: typeof data.strCasetas === 'number' ? data.strCasetas : null,
                totalInvoice: typeof data.strTotalInvoice === 'number' ? data.strTotalInvoice : null,
              },
              dhd: {
                numLoad: data.dhdNumLoad?.trim() || null,
                complementCartaPorte: data.dhdComplementCartaPorte?.trim() || null,
                preinvoiceKm: typeof data.dhdPreinvoiceKm === 'number' ? data.dhdPreinvoiceKm : null,
                kmTraveled: typeof data.dhdKmTraveled === 'number' ? data.dhdKmTraveled : null,
                diesel: typeof data.dhdDiesel === 'number' ? data.dhdDiesel : null,
                casetas: typeof data.dhdCasetas === 'number' ? data.dhdCasetas : null,
                totalInvoice: typeof data.dhdTotalInvoice === 'number' ? data.dhdTotalInvoice : null,
              },
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
      if (onSaved) {
        await onSaved(result.data.trip.id)
      }
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
  const statusSuffixForUnit = (unit: UnitAssemblyEntity): string => {
    const status = unit.status
    const map: Record<string, string> = {
      at_base: 'Disponible',
      assigned: 'Asignada',
      in_trip: 'En viaje',
      in_route: 'En ruta',
      returning: 'Regresando',
      at_client: 'En cliente',
      in_workshop: 'En taller',
    }
    const label = map[status] ?? status
    return label ? ` — ${label}` : ''
  }

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
            <Controller
              name="unitEconomicNumber"
              control={control}
              render={({ field }) => (
                <select
                  id="unitEconomicNumber"
                  className={inputClass}
                  value={field.value}
                  onBlur={field.onBlur}
                  ref={field.ref}
                  onChange={(e) => {
                    const next = e.target.value
                    const unit = units.find((u) => u.economicNumber === next) ?? null
                    const unitAssemblyId = unit?.id ?? null
                    const isSameUnitAsExisting = Boolean(
                      isEdit &&
                      tripRow?.unitAssemblyId &&
                      unitAssemblyId &&
                      tripRow.unitAssemblyId === unitAssemblyId
                    )
                    const isBlocked = Boolean(unit && !isSameUnitAsExisting && !isUnitAssignableForNewTrip(unit.status))

                    if (isBlocked) {
                      setPendingUnitEconomicNumber(next)
                      setIsUnitOverrideDialogOpen(true)
                      return
                    }

                    field.onChange(next)
                    lastConfirmedUnitNumberRef.current = next
                    setValue('forceUnitAssignment', false, { shouldValidate: false })
                  }}
                >
                  <option value="">Selecciona una unidad</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.economicNumber}>
                      {u.name} ({u.economicNumber})
                      {statusSuffixForUnit(u)}
                    </option>
                  ))}
                </select>
              )}
            />
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

        <div className="grid gap-2">
          <Label htmlFor="status">Estado del Viaje</Label>
          <select id="status" className={inputClass} {...register('status')}>
            <option value="scheduled">Programado</option>
            <option value="in_progress">En Ruta</option>
            <option value="in_delivery">En Reparto</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>

          {errors.status && <p className={errorClass}>{errors.status.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="observations">Observaciones</Label>
          <Textarea id="observations" placeholder="Notas u observaciones del viaje..." {...register('observations')} />
        </div>

      </div>
      <WizardFooter
        isFirstStep
        isLastStep={!isBarichon && !isWalmart && !isHolcim}
        onCancel={handleClose}
        onNext={(isBarichon || isWalmart || isHolcim) ? goNext : handleFinish}
        isSubmitting={isSubmitting}
      />
    </div>
  )

  const barichonGrossValue = watch('barichonGrossWeight') ?? ''
  const barichonTareValue = watch('barichonTareWeight') ?? ''
  const barichonNetWeight = useMemo(() => {
    const gross = Number(barichonGrossValue)
    const tare = Number(barichonTareValue)
    if (!Number.isFinite(gross) || !Number.isFinite(tare)) return null
    return gross - tare
  }, [barichonGrossValue, barichonTareValue])

  const step2Barichon = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30">
        <div className="flex items-center gap-2 mb-1">
          <Factory className="size-4 text-emerald-700 dark:text-emerald-300" />
          <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Bitácora: Barichon</h3>
        </div>
        <p className="text-xs text-emerald-700 dark:text-emerald-300">
          Captura los datos requeridos por la bitácora de viajes del company_profile.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label>Número de viaje</Label>
          {isHolcim ? (
            <div className={`${inputClass} flex items-center`}>
              <span className="text-sm font-mono font-bold text-stone-900 dark:text-zinc-100">
                {holcimTripLabel || '—'}
              </span>
            </div>
          ) : (
            <input
              type="number"
              min="1"
              placeholder="1"
              className={inputClass}
              {...register('tripNumberClient', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
            />
          )}
          {errors.tripNumberClient && <p className={errorClass}>{errors.tripNumberClient.message as string}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="barichonExpensesReviewed">Gastos revisados</Label>
          <Input id="barichonExpensesReviewed" placeholder="Ej. Casetas, Urea, Talachas..." {...register('barichonExpensesReviewed')} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="barichonTicket">Ticket</Label>
          <Input id="barichonTicket" placeholder="Ej. TCK-12345" {...register('barichonTicket')} />
          {errors.barichonTicket && <p className={errorClass}>{errors.barichonTicket.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="barichonUnloading">Descarga</Label>
          <Input id="barichonUnloading" placeholder="Ej. Patio / Andén / Cliente" {...register('barichonUnloading')} />
          {errors.barichonUnloading && <p className={errorClass}>{errors.barichonUnloading.message as string}</p>}
        </div>
      </div>

      <div className="p-4 rounded-xl border border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-stone-700 dark:text-zinc-200 uppercase tracking-widest">Peso material</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="barichonGrossWeight">Peso Bruto</Label>
            <Input id="barichonGrossWeight" placeholder="0" inputMode="decimal" {...register('barichonGrossWeight')} />
            {errors.barichonGrossWeight && <p className={errorClass}>{errors.barichonGrossWeight.message as string}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="barichonTareWeight">Peso Tara</Label>
            <Input id="barichonTareWeight" placeholder="0" inputMode="decimal" {...register('barichonTareWeight')} />
            {errors.barichonTareWeight && <p className={errorClass}>{errors.barichonTareWeight.message as string}</p>}
          </div>
          <div className="grid gap-2">
            <Label>Peso Neto</Label>
            <div className={`${inputClass} flex items-center`}>
              <span className="text-sm font-mono font-bold text-stone-900 dark:text-zinc-100">
                {barichonNetWeight == null ? '—' : barichonNetWeight}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="barichonRemision">Remisión</Label>
          <Input id="barichonRemision" placeholder="Ej. REM-12345" {...register('barichonRemision')} />
          {errors.barichonRemision && <p className={errorClass}>{errors.barichonRemision.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="barichonMaterial">Material</Label>
          <Input id="barichonMaterial" placeholder="Ej. Cemento" {...register('barichonMaterial')} />
          {errors.barichonMaterial && <p className={errorClass}>{errors.barichonMaterial.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="barichonFactura">Factura</Label>
          <Input id="barichonFactura" placeholder="Ej. FAC-12345" {...register('barichonFactura')} />
          {errors.barichonFactura && <p className={errorClass}>{errors.barichonFactura.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="barichonPo">PO</Label>
          <Input id="barichonPo" placeholder="Ej. PO-12345" {...register('barichonPo')} />
          {errors.barichonPo && <p className={errorClass}>{errors.barichonPo.message as string}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="barichonTotal">Total</Label>
          <Input id="barichonTotal" placeholder="0" inputMode="decimal" {...register('barichonTotal')} />
          {errors.barichonTotal && <p className={errorClass}>{errors.barichonTotal.message as string}</p>}
        </div>
        <div className="grid gap-2">
          <Label>Unidad / Placas</Label>
          <div className={`${inputClass} flex flex-col justify-center h-auto py-3`}>
            <span className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
              {selectedUnit?.economicNumber ?? selectedUnitNumber ?? '—'} · {dataOrEmpty(selectedUnit?.employeeName ?? watch('operatorName'))}
            </span>
            <span className="text-xs text-stone-500 dark:text-zinc-400 mt-0.5">
              Tracto: {dataOrEmpty(selectedUnit?.truckPlates)} · Tolva: {dataOrEmpty(selectedUnit?.trailerPlates)}{selectedUnit?.trailer2Plates ? ` · Tolva 2: ${selectedUnit.trailer2Plates}` : ''}
            </span>
          </div>
        </div>
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep={!isWalmart && !isHolcim}
        onCancel={handleClose}
        onBack={goBack}
        onNext={(!isWalmart && !isHolcim) ? handleFinish : goNext}
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
          <input type="hidden" {...register('tripNumberClient', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })} />
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

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="walmartCargoType">Tipo de carga</Label>
            <select id="walmartCargoType" className={inputClass} {...register('walmartCargoType')}>
              <option value="">Selecciona un tipo</option>
              <option value="refrigerado">Refrigerado</option>
              <option value="congelado">Congelado</option>
              <option value="fruta">Frutas y verduras</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="walmartDepartureTemperature">Temperatura (Thermo)</Label>
            <Input
              id="walmartDepartureTemperature"
              placeholder="Ej. 4°C"
              {...register('walmartDepartureTemperature')}
            />
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
            {...register('numStores', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="walmartDepartureTime">Fecha (Walmart)</Label>
            <Input id="walmartDepartureTime" type="datetime-local" {...register('walmartDepartureTime')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="walmartDestinationCities">Ciudades de destino</Label>
            <Input id="walmartDestinationCities" placeholder="Ej. Monterrey, Saltillo..." {...register('walmartDestinationCities')} />
          </div>
        </div>

        <div className="rounded-xl border border-stone-200 dark:border-zinc-700 overflow-hidden">
          <div className="grid grid-cols-3 bg-stone-50 dark:bg-zinc-800/50">
            <div className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-zinc-200">Campo</div>
            <div className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-zinc-200">STR</div>
            <div className="px-4 py-2 text-xs font-bold text-stone-700 dark:text-zinc-200">DHD</div>
          </div>

          <div className="grid grid-cols-3 border-t border-stone-200 dark:border-zinc-700">
            <div className="px-4 py-3 text-xs text-stone-600 dark:text-zinc-400">Número de carga</div>
            <div className="px-4 py-2">
              <Input placeholder="Ej. 12345" {...register('strNumLoad')} />
            </div>
            <div className="px-4 py-2">
              <Input placeholder="Ej. 12345" {...register('dhdNumLoad')} />
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-stone-200 dark:border-zinc-700">
            <div className="px-4 py-3 text-xs text-stone-600 dark:text-zinc-400">Complemento carta porte</div>
            <div className="px-4 py-2">
              <Input placeholder="Ej. CCP-001" {...register('strComplementCartaPorte')} />
            </div>
            <div className="px-4 py-2">
              <Input placeholder="Ej. CCP-001" {...register('dhdComplementCartaPorte')} />
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-stone-200 dark:border-zinc-700">
            <div className="px-4 py-3 text-xs text-stone-600 dark:text-zinc-400">Prefactura</div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('strPreinvoiceKm', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('dhdPreinvoiceKm', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-stone-200 dark:border-zinc-700">
            <div className="px-4 py-3 text-xs text-stone-600 dark:text-zinc-400">Kilómetros recorridos</div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('strKmTraveled', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('dhdKmTraveled', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-stone-200 dark:border-zinc-700">
            <div className="px-4 py-3 text-xs text-stone-600 dark:text-zinc-400">Diésel</div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('strDiesel', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('dhdDiesel', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-stone-200 dark:border-zinc-700">
            <div className="px-4 py-3 text-xs text-stone-600 dark:text-zinc-400">Casetas</div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('strCasetas', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('dhdCasetas', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 border-t border-stone-200 dark:border-zinc-700">
            <div className="px-4 py-3 text-xs text-stone-600 dark:text-zinc-400">Total a facturar</div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('strTotalInvoice', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
            <div className="px-4 py-2">
              <input
                type="number"
                step="0.01"
                placeholder="0"
                className={inputClass}
                {...register('dhdTotalInvoice', { setValueAs: (v) => v === '' || Number.isNaN(Number(v)) ? '' : Number(v) })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="walmartIncidencias">Incidencias</Label>
        <Textarea
          id="walmartIncidencias"
          placeholder="Incidencias del viaje (Walmart)..."
          {...register('walmartIncidencias')}
        />
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

  const walmartSteps: WizardStep[] = [
    { id: '2', title: 'Operativa Walmart', content: step2Walmart },
    { id: '3', title: 'Log DETTES', content: step3Dettes },
  ]

  const holcimSteps: WizardStep[] = [
    { id: 'holcim', title: 'Operativa Holcim', content: step2Holcim },
  ]

  const barichonSteps: WizardStep[] = [
    { id: 'barichon', title: 'Bitácora Barichon', content: step2Barichon },
  ]

  const steps = useMemo(() => {
    const s: WizardStep[] = [{ id: 'base', title: 'Datos Base', content: step1 }]
    if (isBarichon) s.push(...barichonSteps)
    if (isWalmart) return [...s, ...walmartSteps.map((w, idx) => ({ ...w, id: idx === 0 ? 'walmart' : 'dettes' }))]
    if (isHolcim) return [...s, ...holcimSteps]
    return s
  }, [isBarichon, isHolcim, isWalmart, step1, step2Barichon, step2Walmart, step3Dettes, step2Holcim])

  useEffect(() => {
    if (!isOpen) return
    if (activeStep < steps.length) return
    setActiveStep(Math.max(0, steps.length - 1))
  }, [activeStep, isOpen, steps.length])

  const pendingUnit = pendingUnitEconomicNumber
    ? (units.find((u) => u.economicNumber === pendingUnitEconomicNumber) ?? null)
    : null

  return (
    <>
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

      <ConfirmDialog
        isOpen={isUnitOverrideDialogOpen}
        onClose={() => {
          setIsUnitOverrideDialogOpen(false)
          setPendingUnitEconomicNumber(null)
        }}
        onConfirm={() => {
          const next = pendingUnitEconomicNumber ?? ''
          setIsUnitOverrideDialogOpen(false)
          setPendingUnitEconomicNumber(null)
          if (!next) return
          setValue('unitEconomicNumber', next, { shouldValidate: true })
          setValue('forceUnitAssignment', true, { shouldValidate: false })
          lastConfirmedUnitNumberRef.current = next
        }}
        title="Unidad no disponible"
        description={
          pendingUnit
            ? `La unidad ${pendingUnit.economicNumber} no está disponible (por ejemplo: en viaje). ¿Seguro que deseas asignarla de todos modos?`
            : 'La unidad seleccionada no está disponible (por ejemplo: en viaje). ¿Seguro que deseas asignarla de todos modos?'
        }
        confirmLabel="Asignar"
        cancelLabel="Cancelar"
        variant="warning"
      />
    </>
  )
}

function formatHolcimTripLabel(date: Date, tripNumberClient: number) {
  const year = date.getUTCFullYear()
  const month = String(date.getUTCMonth() + 1).padStart(2, '0')
  const counter = String(tripNumberClient).padStart(3, '0')
  return `${year}-${month}-${counter}`
}

function dataOrEmpty(value: string | null | undefined) {
  return value && value.trim().length > 0 ? value : '—'
}

function normalizeText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}
