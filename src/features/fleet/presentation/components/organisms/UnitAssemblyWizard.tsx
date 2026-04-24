'use client'

/**
 * @fileoverview Wizard de creación y edición de Unidades Armadas.
 * Combina Operador (employee) + Tracto (truck) + Remolque (trailer) + Cliente + Compañía.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { Layers, PenLine } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { createUnitAssemblySchema, CreateUnitAssemblyInput } from '../../../domain/schemas/unit-assembly.schema'
import { createUnitAssemblyAction, updateUnitAssemblyAction } from '../../actions/unit-assembly.actions'
import { UnitAssemblyEntity } from '../../../domain/entities'
import { useCompanyProfiles } from '../../../../company-profile/presentation/hooks/use-company-profile'
import { useTractors, useTrailers, useClients } from '../../hooks/use-fleet'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { EmployeeEntity } from '@/src/features/hr/domain/entities'

const SELECT_CLASS =
  'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'

interface UnitAssemblyWizardProps {
  isOpen: boolean
  onClose: () => void
  assembly?: UnitAssemblyEntity
}

type SubmissionStatus = 'idle' | 'success' | 'error'

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
    formState: { errors },
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
    },
  })

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
      </div>
      <WizardFooter isFirstStep isLastStep={false} onCancel={handleClose} onNext={goNext} />
    </div>
  )

  // ── Step 2: Vehículos ──
  const step2Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="truckId">Tractocamión *</Label>
          <select id="truckId" className={SELECT_CLASS} disabled={isLoadingTrucks} {...register('truckId')}>
            <option value="">Selecciona un tracto *</option>
            {trucks?.map((t) => (
              <option key={t.id} value={t.id}>
                {t.economicNumber} — {t.brand} {t.model} [{t.plates}]
              </option>
            ))}
          </select>
          {errors.truckId && <p className="text-xs text-red-500">{errors.truckId.message}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="trailerId">Remolque 1 (opcional)</Label>
            <select id="trailerId" className={SELECT_CLASS} disabled={isLoadingTrailers} {...register('trailerId')}>
              <option value="">Sin remolque asignado</option>
              {trailers?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.economicNumber} — {t.trailerModelName || 'Sin modelo'} [{t.plates || '---'}]
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="trailer2Id">Remolque 2 (opcional)</Label>
            <select id="trailer2Id" className={SELECT_CLASS} disabled={isLoadingTrailers} {...register('trailer2Id')}>
              <option value="">Sin remolque 2 asignado</option>
              {trailers?.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.economicNumber} — {t.trailerModelName || 'Sin modelo'} [{t.plates || '---'}]
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <WizardFooter isFirstStep={false} isLastStep={false} onCancel={handleClose} onBack={goBack} onNext={goNext} />
    </div>
  )

  // ── Step 3: Operador ──
  const step3Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="employeeId">Operador *</Label>
          <select id="employeeId" className={SELECT_CLASS} disabled={isLoadingOperators} {...register('employeeId')}>
            <option value="">Selecciona un operador *</option>
            {operators?.map((e) => (
              <option key={e.id} value={e.id}>
                {e.fullName} {e.rfc ? `— RFC: ${e.rfc}` : ''}
              </option>
            ))}
          </select>
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
    { id: '1', title: 'Identificación', content: step1Content },
    { id: '2', title: 'Vehículos', content: step2Content },
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
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
