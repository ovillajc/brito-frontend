'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { ClipboardList } from 'lucide-react'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useQuery } from '@tanstack/react-query'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import type { EmployeeEntity } from '@/src/features/hr/domain/entities'
import type { MaintenanceCatalogsEntity } from '@/src/features/maintenance/domain/repositories/i-maintenance-repository'
import { createWorkOrderSchema, type CreateWorkOrderInput } from '@/src/features/maintenance/domain/schemas/create-work-order.schema'
import { WORK_ORDER_STATUS } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { useCreateWorkOrder } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { z } from 'zod'

type WorkOrderFormValues = z.input<typeof createWorkOrderSchema>

interface WorkOrderWizardProps {
  isOpen: boolean
  onClose: () => void
  stayId: string
  catalogs: MaintenanceCatalogsEntity | null
}

function generateWorkOrderFolio() {
  const num = Math.floor(Math.random() * 9000) + 1000
  return `${num}-Trabajo`
}

export function WorkOrderWizard({ isOpen, onClose, stayId, catalogs }: WorkOrderWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const createWorkOrder = useCreateWorkOrder()

  const employeesQuery = useQuery({
    queryKey: ['maintenance', 'employees'],
    queryFn: async () => {
      const result = await getEmployeesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as EmployeeEntity[]
    },
    staleTime: 1000 * 60 * 10,
  })

  const specialists = useMemo(() => {
    return (employeesQuery.data ?? []).filter((e) => e.isActive)
  }, [employeesQuery.data])

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      stayId,
      folio: generateWorkOrderFolio(),
      maintenanceTypeId: null,
      mechanicalCategoryId: null,
      startedAt: new Date().toISOString().slice(0, 10),
      finishedAt: null,
      status: WORK_ORDER_STATUS.Open,
      specialistEmployeeId: null,
      description: '',
      details: null,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    reset({
      stayId,
      folio: generateWorkOrderFolio(),
      maintenanceTypeId: null,
      mechanicalCategoryId: null,
      startedAt: new Date().toISOString().slice(0, 10),
      finishedAt: null,
      status: WORK_ORDER_STATUS.Open,
      specialistEmployeeId: null,
      description: '',
      details: null,
    })
  }, [isOpen, reset, stayId])

  const inputClass = cn(
    'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
  )

  const errorClass = 'text-xs text-red-500 mt-1'

  const goNext = async () => {
    const ok = await trigger(['folio', 'startedAt', 'status', 'description'])
    if (ok) setActiveStep(1)
  }

  const handleClose = () => onClose()

  const onFinish = handleSubmit(async (vals) => {
    try {
      const parsed: CreateWorkOrderInput = createWorkOrderSchema.parse(vals)
      await createWorkOrder.mutateAsync(parsed)
      toast.success('Orden de trabajo creada')
      handleClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al crear orden')
    }
  })

  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="folio">Folio del trabajo</Label>
          <Input id="folio" className={inputClass} {...register('folio')} />
          {errors.folio && <p className={errorClass}>{errors.folio.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="startedAt">Inicio</Label>
          <Input id="startedAt" type="date" className={inputClass} {...register('startedAt')} />
          {errors.startedAt && <p className={errorClass}>{errors.startedAt.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="status">Estado</Label>
          <select id="status" className={inputClass} {...register('status')}>
            <option value={WORK_ORDER_STATUS.Open}>Abierto</option>
            <option value={WORK_ORDER_STATUS.InProgress}>En proceso</option>
            <option value={WORK_ORDER_STATUS.OnHold}>En espera</option>
            <option value={WORK_ORDER_STATUS.Completed}>Finalizado</option>
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="specialistEmployeeId">Especialista (Opcional)</Label>
          <select
            id="specialistEmployeeId"
            className={inputClass}
            disabled={employeesQuery.isLoading}
            {...register('specialistEmployeeId', { setValueAs: (v) => v || null })}
          >
            <option value="">{employeesQuery.isLoading ? 'Cargando...' : 'Selecciona...'}</option>
            {specialists.map((e) => (
              <option key={e.id} value={e.id}>{e.fullName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="maintenanceTypeId">Tipo (Opcional)</Label>
          <select
            id="maintenanceTypeId"
            className={inputClass}
            disabled={!catalogs}
            {...register('maintenanceTypeId', { setValueAs: (v) => v || null })}
          >
            <option value="">{catalogs ? 'Selecciona...' : 'Cargando...'}</option>
            {(catalogs?.maintenanceTypes ?? []).map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="mechanicalCategoryId">Categoría (Opcional)</Label>
          <select
            id="mechanicalCategoryId"
            className={inputClass}
            disabled={!catalogs}
            {...register('mechanicalCategoryId', { setValueAs: (v) => v || null })}
          >
            <option value="">{catalogs ? 'Selecciona...' : 'Cargando...'}</option>
            {(catalogs?.mechanicalCategories ?? []).map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descripción</Label>
        <Input id="description" className={inputClass} placeholder="Ej. Reparación de motor" {...register('description')} />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      <WizardFooter isFirstStep isLastStep={false} onCancel={handleClose} onNext={goNext} />
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid gap-2">
        <Label htmlFor="details">Detalle (Opcional)</Label>
        <textarea
          id="details"
          rows={6}
          className={cn(inputClass, 'h-auto py-3 resize-none')}
          placeholder="Describe las labores realizadas..."
          {...register('details', {
            setValueAs: (v) => (typeof v === 'string' ? (v.trim() === '' ? null : v.trim()) : null),
          })}
        />
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep
        onCancel={handleClose}
        onBack={() => setActiveStep(0)}
        onNext={onFinish}
        isSubmitting={createWorkOrder.isPending}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: 'wo-1', title: 'Trabajo', content: step1 },
    { id: 'wo-2', title: 'Detalle', content: step2 },
  ]

  return (
    <Wizard
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Orden de Trabajo"
      description="Registra una actividad dentro de la estancia."
      icon={<ClipboardList className="size-5" />}
      steps={steps}
      activeStep={activeStep}
      size="lg"
    />
  )
}
