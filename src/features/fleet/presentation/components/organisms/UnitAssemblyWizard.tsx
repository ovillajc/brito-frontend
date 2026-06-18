'use client'

/**
 * @fileoverview Wizard de creación y edición de Unidades Armadas.
 * Combina Operador (employee) + Tracto (truck) + Remolque (trailer) + Cliente + Compañía.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { ChevronDown, Layers, PenLine, Search } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { createUnitAssemblySchema, CreateUnitAssemblyInput } from '../../../domain/schemas/unit-assembly.schema'
import { createUnitAssemblyAction, updateUnitAssemblyAction } from '../../actions/unit-assembly.actions'
import { UnitAssemblyEntity, UnitStatus } from '../../../domain/entities'

import { useCompanyProfiles } from '../../../../company-profile/presentation/hooks/use-company-profile'
import { useTractors, useTrailers, useClients } from '../../hooks/use-fleet'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { EmployeeEntity } from '@/src/features/hr/domain/entities'

const SELECT_CLASS =
  'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'

function normalizeSearch(value: string | null | undefined) {
  return (value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

interface SearchableSelectOption {
  value: string
  label: string
  keywords?: string
}

interface SearchableSelectProps {
  value: string
  onChange: (value: string) => void
  options: SearchableSelectOption[]
  placeholder: string
  emptyLabel: string
  noResultsLabel: string
  disabled?: boolean
}

function SearchableSelect({
  value,
  onChange,
  options,
  placeholder,
  emptyLabel,
  noResultsLabel,
  disabled = false,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value) ?? null,
    [options, value]
  )

  const filteredOptions = useMemo(() => {
    const term = normalizeSearch(query)
    if (!term) return options
    return options.filter((option) =>
      normalizeSearch(`${option.label} ${option.keywords ?? ''}`).includes(term)
    )
  }, [options, query])

  const handleSelect = (nextValue: string) => {
    onChange(nextValue)
    setQuery('')
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-stone-400 dark:text-zinc-500" />
        <Input
          value={isOpen ? query : (selectedOption?.label ?? '')}
          onFocus={() => {
            setQuery('')
            setIsOpen(true)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            setIsOpen(true)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setQuery('')
              setIsOpen(false)
            }
            if (e.key === 'Enter' && filteredOptions.length === 1) {
              e.preventDefault()
              handleSelect(filteredOptions[0].value)
            }
          }}
          onBlur={() => {
            window.setTimeout(() => {
              setQuery('')
              setIsOpen(false)
            }, 120)
          }}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 z-10 -translate-y-1/2 text-stone-400 transition-colors hover:text-stone-600 disabled:pointer-events-none disabled:opacity-50 dark:text-zinc-500 dark:hover:text-zinc-300"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (disabled) return
            setQuery('')
            setIsOpen((prev) => !prev)
          }}
          disabled={disabled}
          aria-label="Mostrar opciones"
        >
          <ChevronDown className="size-4" />
        </button>
      </div>

      {isOpen && !disabled && (
        <div className="absolute z-50 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-stone-200 bg-white p-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => handleSelect('')}
            className="flex w-full rounded-lg px-3 py-2 text-left text-sm text-stone-600 transition-colors hover:bg-stone-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
          >
            {emptyLabel}
          </button>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  option.value === value
                    ? 'bg-[#1a5c3a]/10 text-[#1a5c3a] dark:bg-emerald-500/15 dark:text-emerald-300'
                    : 'text-stone-700 hover:bg-stone-100 dark:text-zinc-200 dark:hover:bg-zinc-800'
                }`}
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-stone-500 dark:text-zinc-400">
              {noResultsLabel}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface UnitAssemblyWizardProps {
  isOpen: boolean
  onClose: () => void
  assembly?: UnitAssemblyEntity
}

type SubmissionStatus = 'idle' | 'success' | 'error'

const UNIT_STATUS_OPTIONS: { label: string; value: UnitStatus }[] = [
  { label: 'Retornando', value: 'returning' },
  { label: 'En Base', value: 'at_base' },
  { label: 'En Base Cliente', value: 'at_client' },
  { label: 'En Viaje', value: 'in_trip' },
  { label: 'En Taller', value: 'in_workshop' },
]

const UNIT_ASSEMBLY_FIELD_DICTIONARY: Record<string, string> = {
  name: 'Nombre de la Unidad',
  economicNumber: 'Número Económico',
  description: 'Descripción',
  employeeId: 'Operador',
  truckId: 'Tractocamión',
  trailerId: 'Remolque 1',
  trailer2Id: 'Remolque 2',
  clientId: 'Cliente Asignado',
  companyProfileId: 'Empresa Propietaria',
  isActive: 'Unidad activa',
  status: 'Estado Operativo de la Unidad',
  theoreticalYield: 'Rendimiento Teórico (km/L)',
  poolRole: 'Rol en Pool',
  substitutesUnitId: 'Sustituye a Unidad',
}

/**
 * Wizard multi-paso para crear o editar una Unidad Armada.
 */
export function UnitAssemblyWizard({ isOpen, onClose, assembly }: UnitAssemblyWizardProps) {
  const queryClient = useQueryClient()
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')

  // ── Data sources for dropdowns ──
  const { data: companies, isLoading: isLoadingCompanies } = useCompanyProfiles()
  const { data: clients, isLoading: isLoadingClients } = useClients()
  const { data: trucks, isLoading: isLoadingTrucks } = useTractors()
  const { data: trailers, isLoading: isLoadingTrailers } = useTrailers()
  const { data: operators, isLoading: isLoadingOperators } = useQuery({
    queryKey: ['hr', 'employees', 'operators'],
    queryFn: async () => {
      const result = await getEmployeesAction()
      if (!result.ok) throw new Error(result.error.message)
      return (result.data as EmployeeEntity[]).filter((e) => e.isOperator && e.isActive)
    },
    staleTime: 1000 * 60 * 5,
  })

  const isEdit = !!assembly

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty, dirtyFields },
  } = useForm<CreateUnitAssemblyInput>({
    resolver: zodResolver(createUnitAssemblySchema),
    defaultValues: {
      name: '',
      economicNumber: '',
      description: '',
      employeeId: '',
      truckId: '',
      trailerId: '',
      trailer2Id: '',
      clientId: '',
      companyProfileId: '',
      isActive: true,
      status: 'at_base',
      theoreticalYield: undefined,
      poolRole: 'titular',
      substitutesUnitId: null,
    },

  })

  const selectedTruckId = watch('truckId')
  const selectedTrailerId = watch('trailerId')
  const selectedTrailer2Id = watch('trailer2Id')
  const selectedEmployeeId = watch('employeeId')

  const operatorOptions = useMemo(
    () =>
      (operators ?? []).map((operator) => ({
        value: operator.id,
        label: `${operator.fullName}${operator.rfc ? ` — RFC: ${operator.rfc}` : ''}`,
        keywords: `${operator.fullName} ${operator.rfc ?? ''} ${operator.licenseNumber ?? ''} ${operator.opaloId ?? ''}`,
      })),
    [operators]
  )

  const truckOptions = useMemo(
    () =>
      (trucks ?? []).map((truck) => ({
        value: truck.id,
        label: `${truck.economicNumber} — ${truck.brand} ${truck.model} [${truck.plates}]`,
        keywords: `${truck.economicNumber} ${truck.brand} ${truck.model} ${truck.plates} ${truck.vehicleType ?? ''}`,
      })),
    [trucks]
  )

  const trailerOptions = useMemo(
    () =>
      (trailers ?? []).map((trailer) => ({
        value: trailer.id,
        label: `${trailer.economicNumber} — ${trailer.trailerModelName || 'Sin modelo'} [${trailer.plates || '---'}]`,
        keywords: `${trailer.economicNumber} ${trailer.trailerModelName ?? ''} ${trailer.plates ?? ''}`,
      })),
    [trailers]
  )

  useEffect(() => {
    if (isOpen && assembly) {
      reset({
        name: assembly.name,
        economicNumber: assembly.economicNumber,
        description: assembly.description || '',
        employeeId: assembly.employeeId,
        truckId: assembly.truckId,
        trailerId: assembly.trailerId || '',
        trailer2Id: assembly.trailer2Id || '',
        clientId: assembly.clientId || '',
        companyProfileId: assembly.companyProfileId || '',
        isActive: assembly.isActive,
        status: assembly.status || 'at_base',
        theoreticalYield: assembly.theoreticalYield ?? undefined,
        poolRole: assembly.poolRole ?? 'titular',
        substitutesUnitId: assembly.substitutesUnitId || null,
      })

    } else if (isOpen && !assembly) {
      reset({
        name: '',
        economicNumber: '',
        description: '',
        employeeId: '',
        truckId: '',
        trailerId: '',
        trailer2Id: '',
        clientId: '',
        companyProfileId: '',
        isActive: true,
        theoreticalYield: undefined,
        poolRole: 'titular',
        substitutesUnitId: null,
      })
    }
  }, [isOpen, assembly, reset])

  const goNext = async () => {
    let fields: (keyof CreateUnitAssemblyInput)[] = []
    if (activeStep === 0) fields = ['name', 'economicNumber', 'companyProfileId', 'clientId']
    if (activeStep === 1) fields = ['truckId', 'trailerId', 'trailer2Id']
    if (activeStep === 2) fields = ['employeeId']
    const valid = await trigger(fields)
    if (valid) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const result = isEdit
        ? await updateUnitAssemblyAction({ ...data, id: assembly!.id })
        : await createUnitAssemblyAction(data)

      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['fleet', 'assemblies'] })
        setSubmissionStatus('success')
      } else {
        setSubmissionStatus('error')
        toast.error(result.error?.message ?? `Error al ${isEdit ? 'actualizar' : 'crear'} unidad`)
      }
    } catch {
      setSubmissionStatus('error')
      toast.error('Error inesperado al procesar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  })

  const handleClose = () => {
    setActiveStep(0)
    setSubmissionStatus('idle')
    onClose()
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setActiveStep(0)
    if (!isEdit) reset()
  }

  // ── Step 1: Identificación de la Unidad ──
  const step1Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nombre de la Unidad</Label>
            <Input id="name" placeholder="Ej. Unidad Norte 01" {...register('name')} />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="economicNumber">Número Económico</Label>
            <Input id="economicNumber" placeholder="UN-001" {...register('economicNumber')} />
            {errors.economicNumber && <p className="text-xs text-red-500">{errors.economicNumber.message}</p>}
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="description">Descripción (opcional)</Label>
          <Input id="description" placeholder="Ruta asignada, notas especiales..." {...register('description')} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="companyProfileId">Empresa Propietaria</Label>
            <select id="companyProfileId" className={SELECT_CLASS} disabled={isLoadingCompanies} {...register('companyProfileId')}>
              <option value="">Selecciona una empresa (opcional)</option>
              {companies?.map((c) => (
                <option key={c.id} value={c.id}>{c.legalName}</option>
              ))}
            </select>
            {errors.companyProfileId && <p className="text-xs text-red-500">{errors.companyProfileId.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="clientId">Cliente Asignado</Label>
            <select id="clientId" className={SELECT_CLASS} disabled={isLoadingClients} {...register('clientId')}>
              <option value="">Selecciona un cliente (opcional)</option>
              {clients?.map((cl) => (
                <option key={cl.id} value={cl.id}>
                  {cl.tradeName || cl.companyName || 'Sin nombre'}
                </option>
              ))}
            </select>
            {errors.clientId && <p className="text-xs text-red-500">{errors.clientId.message}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="poolRole">Rol en Pool</Label>
            <select id="poolRole" className={SELECT_CLASS} {...register('poolRole')}>
              <option value="titular">Titular</option>
              <option value="sustituta">Sustituta</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 2: Vehículos ──
  const step2Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="truckId">Tractocamión *</Label>
          <input type="hidden" {...register('truckId')} />
          <SearchableSelect
            value={selectedTruckId ?? ''}
            onChange={(value) => setValue('truckId', value, { shouldDirty: true, shouldValidate: true })}
            options={truckOptions}
            placeholder="Buscar y seleccionar tracto por económico, marca, modelo o placas"
            emptyLabel="Selecciona un tracto *"
            noResultsLabel="No se encontraron tractos con esa búsqueda."
            disabled={isLoadingTrucks}
          />
          {errors.truckId && <p className="text-xs text-red-500">{errors.truckId.message}</p>}
        </div>
        
        {(() => {
          const selectedTruck = trucks?.find(t => t.id === selectedTruckId)
          const isTorton = selectedTruck?.vehicleType === 'TORTON'

          if (isTorton) {
            return (
              <div className="bg-[#1a5c3a]/10 border border-[#1a5c3a]/20 p-4 rounded-xl">
                <p className="text-sm text-[#1a5c3a] font-medium">Has seleccionado un Torton. Los Tortons son unidades unificadas y no requieren asignación de remolques separados.</p>
              </div>
            )
          }

          return (
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="trailerId">Remolque 1 (opcional)</Label>
                <input type="hidden" {...register('trailerId')} />
                <SearchableSelect
                  value={selectedTrailerId ?? ''}
                  onChange={(value) => setValue('trailerId', value, { shouldDirty: true, shouldValidate: true })}
                  options={trailerOptions}
                  placeholder="Buscar y seleccionar remolque por económico, modelo o placas"
                  emptyLabel="Sin remolque asignado"
                  noResultsLabel="No se encontraron remolques para Remolque 1."
                  disabled={isLoadingTrailers}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="trailer2Id">Remolque 2 (opcional)</Label>
                <input type="hidden" {...register('trailer2Id')} />
                <SearchableSelect
                  value={selectedTrailer2Id ?? ''}
                  onChange={(value) => setValue('trailer2Id', value, { shouldDirty: true, shouldValidate: true })}
                  options={trailerOptions}
                  placeholder="Buscar y seleccionar remolque por económico, modelo o placas"
                  emptyLabel="Sin remolque 2 asignado"
                  noResultsLabel="No se encontraron remolques para Remolque 2."
                  disabled={isLoadingTrailers}
                />
              </div>
            </div>
          )
        })()}
        
        <div className="grid gap-2 mt-2">
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            El rendimiento teórico representa los km/L esperados con esta combinación de tracto y remolque.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="theoreticalYield">Rendimiento Teórico (km/L)</Label>
              <Input
                id="theoreticalYield"
                type="number"
                step="0.1"
                placeholder="2.5"
                {...register('theoreticalYield', { valueAsNumber: true })}
              />
              {errors.theoreticalYield && <p className="text-xs text-red-500">{errors.theoreticalYield.message}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // ── Step 3: Operador ──
  const step3Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="employeeId">Operador *</Label>
          <input type="hidden" {...register('employeeId')} />
          <SearchableSelect
            value={selectedEmployeeId ?? ''}
            onChange={(value) => setValue('employeeId', value, { shouldDirty: true, shouldValidate: true })}
            options={operatorOptions}
            placeholder="Buscar y seleccionar operador por nombre, RFC o licencia"
            emptyLabel="Selecciona un operador *"
            noResultsLabel="No se encontraron operadores con esa búsqueda."
            disabled={isLoadingOperators}
          />
          {errors.employeeId && <p className="text-xs text-red-500">{errors.employeeId.message}</p>}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            id="isActive"
            className="rounded border-stone-300 dark:border-zinc-600 accent-[#1a5c3a]"
            {...register('isActive')}
          />
          <Label htmlFor="isActive" className="cursor-pointer">Unidad activa</Label>
        </div>
        <div className="grid gap-2 mt-4">
          <Label htmlFor="status">Estado Operativo de la Unidad</Label>
          <select id="status" className={SELECT_CLASS} {...register('status')}>
            {UNIT_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

      </div>
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Identificación', content: step1Content, onNext: goNext },
    { id: '2', title: 'Vehículos', content: step2Content, onNext: goNext },
    { id: '3', title: 'Operador', content: step3Content },
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success'
              ? (isEdit ? '¡Unidad Actualizada!' : '¡Unidad Armada!')
              : 'Error en la operación'}
            message={submissionStatus === 'success'
              ? `La unidad ha sido ${isEdit ? 'actualizada' : 'registrada'} correctamente.`
              : 'No pudimos completar la operación en este momento.'}
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
            secondaryActionLabel={submissionStatus === 'success' && !isEdit ? 'Armar otra' : undefined}
            onSecondaryAction={!isEdit ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={isOpen}
          onClose={handleClose}
          title={isEdit ? 'Editar Unidad' : 'Armar Unidad'}
          description={isEdit && assembly
            ? `Editando: ${assembly.name} — ${assembly.economicNumber}`
            : 'Vincula un operador, tracto y remolque para crear una unidad operativa'}
          icon={isEdit ? <PenLine className="size-5" /> : <Layers className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          onStepSelect={setActiveStep}
          size="lg"
          showFooter
          onFinish={handleFinish}
          isSubmitting={isSubmitting}
          canFastFinish={isEdit && isDirty}
          dirtyFields={dirtyFields}
          fieldDictionary={UNIT_ASSEMBLY_FIELD_DICTIONARY}
        />
      )}
    </AnimatePresence>
  )
}
