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
import { useCreateWorkOrder, useUpdateWorkOrder } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkshopWorkOrderReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import type { z } from 'zod'

type WorkOrderFormValues = z.input<typeof createWorkOrderSchema>

interface WorkOrderWizardProps {
  isOpen: boolean
  onClose: () => void
  stayId: string
  stayFolio: string
  catalogs: MaintenanceCatalogsEntity | null
  initialData?: WorkshopWorkOrderReplicaEntity | null
}

export function WorkOrderWizard({ isOpen, onClose, stayId, stayFolio, catalogs, initialData }: WorkOrderWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isInternalSpecialist, setIsInternalSpecialist] = useState(false)
  const createWorkOrder = useCreateWorkOrder()
  const updateWorkOrder = useUpdateWorkOrder()
  const isEditing = !!initialData

  const matchingMaintenanceTypeId = useMemo(() => {
    if (!initialData || !catalogs || !initialData.maintenanceTypeName) return null
    return (catalogs.maintenanceTypes ?? []).find((t) => t.name === initialData.maintenanceTypeName)?.id ?? null
  }, [initialData, catalogs])

  const matchingMechanicalCategoryId = useMemo(() => {
    if (!initialData || !catalogs || !initialData.mechanicalCategoryName) return null
    return (catalogs.maintenanceServices ?? []).find((c) => c.name === initialData.mechanicalCategoryName)?.id ?? null
  }, [initialData, catalogs])

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<WorkOrderFormValues>({
    resolver: zodResolver(createWorkOrderSchema),
    defaultValues: {
      stayId,
      folio: stayFolio,
      maintenanceTypeId: null,
      mechanicalCategoryId: null,
      startedAt: new Date().toISOString().slice(0, 10),
      finishedAt: null,
      status: WORK_ORDER_STATUS.Open,
      specialistEmployeeId: null,
      specialistName: null,
      description: '',
      details: null,
      locationType: 'BASE',
      failureLocation: null,
      vehicleActivityAtFailure: null,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      reset({
        stayId,
        folio: initialData.workOrderFolio,
        maintenanceTypeId: matchingMaintenanceTypeId,
        mechanicalCategoryId: matchingMechanicalCategoryId,
        startedAt: new Date(initialData.startedAt).toISOString().slice(0, 10),
        finishedAt: initialData.finishedAt ? new Date(initialData.finishedAt).toISOString().slice(0, 10) : null,
        status: initialData.status,
        specialistEmployeeId: initialData.specialistEmployeeId || null,
        specialistName: initialData.specialistName || null,
        description: initialData.description,
        details: initialData.details,
        locationType: (initialData as any).locationType || 'BASE',
        failureLocation: (initialData as any).failureLocation || null,
        vehicleActivityAtFailure: (initialData as any).vehicleActivityAtFailure || null,
      })
      setIsInternalSpecialist(!!initialData.specialistEmployeeId)
    } else {
      reset({
        stayId,
        folio: stayFolio,
        maintenanceTypeId: null,
        mechanicalCategoryId: null,
        startedAt: new Date().toISOString().slice(0, 10),
        finishedAt: null,
        status: WORK_ORDER_STATUS.Open,
        specialistEmployeeId: null,
        specialistName: null,
        description: '',
        details: null,
        locationType: 'BASE',
        failureLocation: null,
        vehicleActivityAtFailure: null,
      })
      setIsInternalSpecialist(false)
    }
  }, [isOpen, reset, stayId, initialData, matchingMaintenanceTypeId, matchingMechanicalCategoryId])

  const selectedTypeId = watch('maintenanceTypeId')

  const filteredServices = useMemo(() => {
    const typeId = selectedTypeId || matchingMaintenanceTypeId
    if (!typeId || !catalogs?.maintenanceServices) return []
    return catalogs.maintenanceServices.filter((s) => s.maintenanceTypeId === typeId)
  }, [catalogs?.maintenanceServices, selectedTypeId, matchingMaintenanceTypeId])

  const inputClass = cn(
    'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
  )

  const errorClass = 'text-xs text-red-500 mt-1'

  const goNext = async () => {
    const ok = await trigger(['folio', 'startedAt', 'status', 'description'])
    if (ok) setActiveStep(1)
  }

  const handleClose = () => onClose()

  const onFinish = handleSubmit(
    async (vals) => {
      try {
        const parsed: CreateWorkOrderInput = createWorkOrderSchema.parse(vals)
        if (isEditing && initialData) {
          const { supervisorName, supervisorEmployeeId, finishedAt, ...updatePayload } = parsed
          await updateWorkOrder.mutateAsync({ id: initialData.id, data: updatePayload })
        } else {
          await createWorkOrder.mutateAsync(parsed)
        }
        toast.success(isEditing ? 'Orden de trabajo actualizada' : 'Orden de trabajo creada')
        handleClose()
      } catch (e) {
        console.error('[WorkOrderWizard] Error on finish:', e)
        toast.error(e instanceof Error ? e.message : 'Error al guardar orden')
      }
    },
    (errors) => {
      console.error('[WorkOrderWizard] Validation errors:', errors)
      toast.error('Por favor, corrige los errores de validación antes de continuar.')
    }
  )

  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="folio">Folio del trabajo (Heredado)</Label>
          <Input id="folio" readOnly className={cn(inputClass, "bg-stone-100 dark:bg-zinc-800/50 text-stone-500 font-mono")} {...register('folio')} />
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
          <div className="flex items-center justify-between">
            <Label>Especialista (Opcional)</Label>
            <label className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
              <input 
                type="checkbox" 
                checked={isInternalSpecialist}
                className="rounded border-stone-300 text-[#1a5c3a] focus:ring-[#1a5c3a]"
                onChange={(e) => {
                  setIsInternalSpecialist(e.target.checked)
                  if (e.target.checked) {
                    setValue('specialistName', null)
                  } else {
                    setValue('specialistEmployeeId', null)
                  }
                }} 
              />
              Es interno
            </label>
          </div>
          {isInternalSpecialist ? (
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
          ) : (
            <Input
              id="specialistName"
              placeholder="Nombre del especialista externo"
              className={inputClass}
              {...register('specialistName', { setValueAs: (v) => v || null })}
            />
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="maintenanceTypeId">Tipo (Opcional)</Label>
          <select
            id="maintenanceTypeId"
            className={inputClass}
            disabled={!catalogs}
            {...register('maintenanceTypeId', {
              setValueAs: (v) => v || null,
              onChange: () => setValue('mechanicalCategoryId', null),
            })}
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
            disabled={!selectedTypeId}
            {...register('mechanicalCategoryId', { setValueAs: (v) => v || null })}
          >
            <option value="">
              {!selectedTypeId ? 'Selecciona un tipo primero...' : 'Selecciona...'}
            </option>
            {filteredServices.map((c) => (
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="locationType">Lugar de Falla/Trabajo</Label>
          <select id="locationType" className={inputClass} {...register('locationType', { setValueAs: (v) => v || null })}>
            <option value="BASE">Taller Base</option>
            <option value="EXTERNAL">Externo (Rescate/Ruta)</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="failureLocation">Ubicación de Falla (Opcional)</Label>
          <Input id="failureLocation" className={inputClass} placeholder="Ej. CEDIS, Base Brito..." {...register('failureLocation', { setValueAs: (v) => v || null })} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="vehicleActivityAtFailure">Actividad del vehículo (Opcional)</Label>
        <Input id="vehicleActivityAtFailure" className={inputClass} placeholder="Ej. Descargando, En ruta..." {...register('vehicleActivityAtFailure', { setValueAs: (v) => v || null })} />
      </div>
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
      title={isEditing ? 'Editar Orden de Trabajo' : 'Nueva Orden de Trabajo'}
      description={isEditing ? 'Modifica los detalles de la orden de trabajo seleccionada.' : 'Registra una actividad dentro de la estancia.'}
      icon={<ClipboardList className="size-5" />}
      steps={steps}
      activeStep={activeStep}
      size="lg"
    />
  )
}
