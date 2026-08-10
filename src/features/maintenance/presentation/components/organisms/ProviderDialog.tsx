'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { createProviderSchema, type CreateProviderInput } from '@/src/features/maintenance/domain/schemas/create-provider.schema'
import { useCreateProvider, useUpdateProvider } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { MaintenanceProviderEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'

interface ProviderDialogProps {
  isOpen: boolean
  onClose: () => void
  initialData?: MaintenanceProviderEntity | null
}

const inputClass = cn(
  'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
)

const errorClass = 'text-xs text-red-500 mt-1'

/**
 * Wizard para crear o editar un proveedor de mantenimiento.
 * Usa React Hook Form + Zod conforme a las reglas del proyecto.
 */
export function ProviderDialog({ isOpen, onClose, initialData }: ProviderDialogProps) {
  const isEditing = !!initialData
  const createProvider = useCreateProvider()
  const updateProvider = useUpdateProvider()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProviderInput>({
    resolver: zodResolver(createProviderSchema),
    defaultValues: {
      name: '',
      providerType: 'EXTERNAL',
      isActive: true,
    },
  })

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      reset({
        name: initialData.name,
        providerType: initialData.providerType,
        isActive: initialData.isActive,
      })
    } else {
      reset({ name: '', providerType: 'EXTERNAL', isActive: true })
    }
  }, [isOpen, reset, initialData])

  const handleClose = () => onClose()

  const onFinish = handleSubmit(
    async (values) => {
      try {
        if (isEditing && initialData) {
          await updateProvider.mutateAsync({ id: initialData.id, data: values })
          toast.success('Proveedor actualizado correctamente')
        } else {
          await createProvider.mutateAsync(values)
          toast.success('Proveedor registrado correctamente')
        }
        handleClose()
      } catch (e) {
        console.error('[ProviderDialog] Error on finish:', e)
        toast.error(e instanceof Error ? e.message : 'Error al guardar el proveedor')
      }
    },
    (errors) => {
      console.error('[ProviderDialog] Validation errors:', errors)
      toast.error('Por favor, corrige los errores de validación antes de continuar.')
    }
  )

  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      {/* Nombre */}
      <div className="grid gap-2">
        <Label htmlFor="provider-name">Nombre del proveedor</Label>
        <Input
          id="provider-name"
          className={inputClass}
          placeholder="Ej. Autopartes del Norte S.A."
          {...register('name')}
        />
        {errors.name && <p className={errorClass}>{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Tipo de proveedor */}
        <div className="grid gap-2">
          <Label htmlFor="provider-type">Tipo</Label>
          <select
            id="provider-type"
            className={inputClass}
            {...register('providerType')}
          >
            <option value="EXTERNAL">Externo</option>
            <option value="INTERNAL">Interno</option>
          </select>
          {errors.providerType && <p className={errorClass}>{errors.providerType.message}</p>}
        </div>

        {/* Activo */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between mt-[34px]">
            <Label>Estado del proveedor</Label>
            <label className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 cursor-pointer">
              <input
                id="provider-active"
                type="checkbox"
                className="rounded border-stone-300 text-[#1a5c3a] focus:ring-[#1a5c3a]"
                {...register('isActive')}
              />
              Activo
            </label>
          </div>
        </div>
      </div>

      <WizardFooter
        isFirstStep
        isLastStep
        onCancel={handleClose}
        onNext={onFinish}
        isSubmitting={createProvider.isPending || updateProvider.isPending}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: 'provider-1', title: 'Datos Generales', content: step1 },
  ]

  return (
    <Wizard
      isOpen={isOpen}
      onClose={handleClose}
      title={isEditing ? 'Editar Proveedor' : 'Nuevo Proveedor'}
      description={isEditing ? 'Modifica los datos del proveedor seleccionado.' : 'Registra un nuevo proveedor para uso en el taller.'}
      icon={<Building2 className="size-5" />}
      steps={steps}
      activeStep={0}
      size="md"
    />
  )
}
