'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { PackagePlus } from 'lucide-react'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Checkbox } from '@/src/core/presentation/components/ui/checkbox'
import { cn } from '@/src/core/infrastructure/utils/cn'
import type { MaintenanceCatalogsEntity } from '@/src/features/maintenance/domain/repositories/i-maintenance-repository'
import { createWorkOrderPartSchema, type CreateWorkOrderPartInput } from '@/src/features/maintenance/domain/schemas/create-part.schema'
import { useCreateWorkOrderPart, useUpdateWorkOrderPart, useMeasurementUnits, useInventoryItems, useAllWorkOrders } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkOrderPartReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import type { z } from 'zod'

type PartFormValues = z.input<typeof createWorkOrderPartSchema>

interface WorkOrderPartWizardProps {
  isOpen: boolean
  onClose: () => void
  workOrderId: string | null
  catalogs: MaintenanceCatalogsEntity | null
  initialData?: WorkOrderPartReplicaEntity | null
}

type MeasurementUnitRow = { id: string; name: string; is_active: boolean }
type InventoryItemRow = { id: string; name: string }

export function WorkOrderPartWizard({ isOpen, onClose, workOrderId, catalogs, initialData }: WorkOrderPartWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [showInventorySelect, setShowInventorySelect] = useState(false)
  const createPart = useCreateWorkOrderPart()
  const updatePart = useUpdateWorkOrderPart()
  const isEditing = !!initialData

  const unitsQuery = useMeasurementUnits()
  const inventoryQuery = useInventoryItems()
  const workOrdersQuery = useAllWorkOrders()

  const matchingProviderId = useMemo(() => {
    if (!initialData || !catalogs || !initialData.providerName) return null
    return (catalogs.providers ?? []).find((p) => p.name === initialData.providerName)?.id ?? null
  }, [initialData, catalogs])

  const matchingUnitId = useMemo(() => {
    if (!initialData || !unitsQuery.data || !initialData.unitName) return null
    return (unitsQuery.data ?? []).find((u) => u.name === initialData.unitName)?.id ?? null
  }, [initialData, unitsQuery.data])

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm<PartFormValues>({
    resolver: zodResolver(createWorkOrderPartSchema),
    defaultValues: {
      workOrderId: workOrderId ?? '',
      providerId: null,
      inventoryItemId: null,
      isInternalSupply: false,
      description: '',
      brand: null,
      unitId: null,
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      taxRate: 0.16,
      paidBy: null,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      reset({
        workOrderId: workOrderId ?? initialData.workOrderId ?? '',
        providerId: matchingProviderId,
        inventoryItemId: initialData.inventoryItemId ?? null,
        isInternalSupply: initialData.isInternalSupply ?? false,
        description: initialData.description,
        brand: initialData.brand,
        unitId: matchingUnitId,
        quantity: initialData.quantity,
        unitPrice: initialData.unitPrice,
        discount: initialData.discount,
        taxRate: initialData.taxRate,
        paidBy: initialData.paidBy ?? null,
      })
    } else {
      reset({
        workOrderId: workOrderId ?? '',
        providerId: null,
        inventoryItemId: null,
        isInternalSupply: false,
        description: '',
        brand: null,
        unitId: null,
        quantity: 1,
        unitPrice: 0,
        discount: 0,
        taxRate: 0.16,
        paidBy: null,
      })
    }
  }, [isOpen, reset, workOrderId, initialData, matchingProviderId, matchingUnitId])

  const inputClass = cn(
    'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
  )

  const errorClass = 'text-xs text-red-500 mt-1'

  const providers = useMemo(() => catalogs?.providers ?? [], [catalogs])
  const units = useMemo(() => unitsQuery.data ?? [], [unitsQuery.data])
  const inventoryItems = useMemo(() => inventoryQuery.data ?? [], [inventoryQuery.data])
  const workOrders = useMemo(() => workOrdersQuery.data?.data ?? [], [workOrdersQuery.data])

  const goNext = async () => {
    const fieldsToValidate: (keyof PartFormValues)[] = ['description', 'quantity', 'unitPrice']
    if (!workOrderId && !isEditing) fieldsToValidate.push('workOrderId')

    const ok = await trigger(fieldsToValidate)
    if (ok) setActiveStep(1)
  }

  const handleClose = () => onClose()

  const onFinish = handleSubmit(
    async (vals) => {
      console.log('[WorkOrderPartWizard] onFinish called with vals:', vals)
      try {
        if (!vals.workOrderId) {
          console.log('[WorkOrderPartWizard] Error: workOrderId is missing')
          toast.error('Selecciona una orden de trabajo')
          return
        }

        console.log('[WorkOrderPartWizard] Parsing with Zod...')
        const parsed: CreateWorkOrderPartInput = createWorkOrderPartSchema.parse(vals)
        console.log('[WorkOrderPartWizard] Parsed successfully:', parsed)

        if (isEditing && initialData) {
          console.log('[WorkOrderPartWizard] Updating part...')
          await updatePart.mutateAsync({ id: initialData.id, data: parsed })
          console.log('[WorkOrderPartWizard] Update successful')
        } else {
          console.log('[WorkOrderPartWizard] Creating part...')
          await createPart.mutateAsync(parsed)
          console.log('[WorkOrderPartWizard] Create successful')
        }
        toast.success(isEditing ? 'Gasto actualizado' : 'Gasto registrado')
        handleClose()
      } catch (e) {
        console.error('[WorkOrderPartWizard] Exception caught in onFinish:', e)
        toast.error(e instanceof Error ? e.message : 'Error al guardar gasto')
      }
    },
    (errors) => {
      console.error('[WorkOrderPartWizard] Validation errors from react-hook-form:', errors)
      toast.error('Por favor, corrige los errores de validación antes de continuar.')
    }
  )

  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      {!workOrderId && !isEditing && (
        <div className="grid gap-2">
          <Label htmlFor="workOrderId">Orden de Trabajo</Label>
          <select
            id="workOrderId"
            className={inputClass}
            disabled={workOrdersQuery.isLoading}
            {...register('workOrderId')}
          >
            <option value="">{workOrdersQuery.isLoading ? 'Cargando...' : 'Selecciona una orden...'}</option>
            {workOrders.map((wo: any) => (
              <option key={wo.id} value={wo.id}>{wo.folio || wo.id}</option>
            ))}
          </select>
          {errors.workOrderId && <p className={errorClass}>{errors.workOrderId.message}</p>}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="providerId">Proveedor (Opcional)</Label>
          <select
            id="providerId"
            className={inputClass}
            disabled={!catalogs}
            {...register('providerId', { setValueAs: (v) => v || null })}
          >
            <option value="">{catalogs ? 'Selecciona...' : 'Cargando...'}</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label>Inventario</Label>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 h-10 px-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <Checkbox
                id="isInternalSupply"
                {...register('isInternalSupply')}
              />
              <Label htmlFor="isInternalSupply" className="cursor-pointer font-normal flex-1">
                Tomado del inventario
              </Label>
              {watch('isInternalSupply') && (
                <button
                  type="button"
                  onClick={() => setShowInventorySelect(!showInventorySelect)}
                  className="text-xs text-brito-green hover:underline"
                >
                  {showInventorySelect ? 'Ocultar' : 'Vincular'}
                </button>
              )}
            </div>

            {watch('isInternalSupply') && showInventorySelect && (
              <select
                id="inventoryItemId"
                className={inputClass}
                disabled={inventoryQuery.isLoading}
                {...register('inventoryItemId', { setValueAs: (v) => v || null })}
              >
                <option value="">{inventoryQuery.isLoading ? 'Cargando...' : 'Selecciona pieza (opcional)...'}</option>
                {inventoryItems.map((i) => (
                  <option key={i.id} value={i.id}>{i.name}</option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="description">Descripción del gasto</Label>
        <Input id="description" className={inputClass} placeholder="Ej. Filtro de aceite P559000" {...register('description')} />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="brand">Marca (Opcional)</Label>
          <Input id="brand" className={inputClass} placeholder="Ej. Donaldson" {...register('brand')} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="unitId">Unidad (Opcional)</Label>
          <select
            id="unitId"
            className={inputClass}
            disabled={unitsQuery.isLoading}
            {...register('unitId', { setValueAs: (v) => v || null })}
          >
            <option value="">{unitsQuery.isLoading ? 'Cargando...' : 'Selecciona...'}</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>{u.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-2 mt-4">
        <Label htmlFor="paidBy">Pagado por (Opcional)</Label>
        <Input id="paidBy" className={inputClass} placeholder="Nombre de quien pagó" {...register('paidBy')} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="quantity">Cantidad</Label>
          <Input id="quantity" type="number" step="0.01" className={inputClass} {...register('quantity', { setValueAs: (v) => Number(v) })} />
          {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="unitPrice">Precio Unitario</Label>
          <Input id="unitPrice" type="number" step="0.01" className={inputClass} {...register('unitPrice', { setValueAs: (v) => Number(v) })} />
          {errors.unitPrice && <p className={errorClass}>{errors.unitPrice.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="discount">Descuento</Label>
          <Input id="discount" type="number" step="0.01" className={inputClass} {...register('discount', { setValueAs: (v) => Number(v) })} />
        </div>
      </div>

      <WizardFooter isFirstStep isLastStep={false} onCancel={handleClose} onNext={goNext} />
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-6 pt-2">
      {(() => {
        const quantity = Number(watch('quantity'))
        const unitPrice = Number(watch('unitPrice'))
        const discount = Number(watch('discount'))
        const taxRate = Number(watch('taxRate'))

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="taxRate">IVA (0–1)</Label>
              <Input id="taxRate" type="number" step="0.01" className={inputClass} {...register('taxRate', { setValueAs: (v) => Number(v) })} />
              {errors.taxRate && <p className={errorClass}>{errors.taxRate.message}</p>}
            </div>
            <div className="grid gap-2">
              <Label>Total estimado</Label>
              <div className="h-10 rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-3 text-sm flex items-center">
                {estimateTotal({ quantity, unitPrice, discount, taxRate })}
              </div>
            </div>
          </div>
        )
      })()}

      <WizardFooter
        isFirstStep={false}
        isLastStep
        onCancel={handleClose}
        onBack={() => setActiveStep(0)}
        onNext={onFinish}
        isSubmitting={createPart.isPending}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: 'part-1', title: 'Gasto', content: step1 },
    { id: 'part-2', title: 'Total', content: step2 },
  ]

  return (
    <Wizard
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Gasto' : 'Nuevo Gasto'}
      description={isEditing ? 'Modifica los detalles del gasto seleccionado.' : 'Registra gastos y costos asociados a una orden.'}
      icon={<PackagePlus className="size-5" />}
      steps={steps}
      activeStep={activeStep}
      size="lg"
    />
  )
}

function estimateTotal(input: { quantity: number; unitPrice: number; discount: number; taxRate: number }) {
  const base = input.quantity * input.unitPrice
  const discounted = base - input.discount
  const total = discounted * (1 + input.taxRate)
  const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })
  return money.format(Number.isFinite(total) ? total : 0)
}
