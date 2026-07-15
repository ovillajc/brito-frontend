'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Store } from 'lucide-react'
import { AnimatePresence } from 'framer-motion'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Input } from '@/src/core/presentation/components/ui/input'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { WalmartStoreEntity } from '@/src/features/operations/domain/entities/walmart-store.entity'
import {
  createWalmartStoreSchema,
  type CreateWalmartStoreInput,
  type UpdateWalmartStoreInput,
} from '@/src/features/operations/domain/schemas/walmart-store.schema'
import {
  createWalmartStoreAction,
  updateWalmartStoreAction,
} from '@/src/features/operations/presentation/actions/walmart-store.actions'

interface WalmartStoreFormDialogProps {
  open: boolean
  onClose: () => void
  store: WalmartStoreEntity | null
}

type FormInput = z.input<typeof createWalmartStoreSchema>
type FormOutput = CreateWalmartStoreInput
type SubmissionStatus = 'idle' | 'success' | 'error'

/**
 * Diálogo para crear o editar una tienda Walmart.
 * Usa react-hook-form + Zod para validación, con estilo Wizard.
 */
export function WalmartStoreFormDialog({ open, onClose, store }: WalmartStoreFormDialogProps) {
  const isEditing = !!store
  const [activeStep, setActiveStep] = useState(0)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    trigger,
    getValues,
    reset,
    formState: { errors },
  } = useForm<FormInput, any, FormOutput>({
    resolver: zodResolver(createWalmartStoreSchema),
    defaultValues: {
      name: '',
      location: '',
      postalCode: '',
      storeType: '',
      storeCode: '',
      isActive: true,
    },
  })

  useEffect(() => {
    if (store) {
      reset({
        name: store.name,
        location: store.location ?? '',
        postalCode: store.postalCode ?? '',
        storeType: store.storeType ?? '',
        storeCode: store.storeCode ?? '',
        isActive: store.isActive,
      })
    } else {
      reset({
        name: '',
        location: '',
        postalCode: '',
        storeType: '',
        storeCode: '',
        isActive: true,
      })
    }
  }, [store, reset])

  const handleClose = () => {
    onClose()
    setTimeout(() => {
      setSubmissionStatus('idle')
      setActiveStep(0)
    }, 300)
  }

  const handleReset = () => {
    reset({
      name: '',
      location: '',
      postalCode: '',
      storeType: '',
      storeCode: '',
      isActive: true,
    })
    setSubmissionStatus('idle')
    setActiveStep(0)
  }

  const onSubmit = async () => {
    const isValid = await trigger()
    if (!isValid) return

    setIsSubmitting(true)
    const values = getValues()
    let result

    try {
      if (isEditing && store) {
        const updateInput: UpdateWalmartStoreInput = { 
          id: store.id, 
          ...values, 
          isActive: values.isActive ?? true 
        }
        result = await updateWalmartStoreAction(updateInput)
      } else {
        const createInput: CreateWalmartStoreInput = {
          ...values,
          isActive: values.isActive ?? true
        }
        result = await createWalmartStoreAction(createInput)
      }

      if (result.ok) {
        setSubmissionStatus('success')
      } else {
        setSubmissionStatus('error')
      }
    } catch (error) {
      setSubmissionStatus('error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const stepContent = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="flex flex-col gap-4">
        {/* Nombre */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="store-name" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
            Nombre <span className="text-red-500">*</span>
          </label>
          <Input
            id="store-name"
            placeholder="Ej. Walmart Supercentro Periférico"
            {...register('name')}
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Código y Tipo en fila */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-code" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
              Código de tienda
            </label>
            <Input
              id="store-code"
              placeholder="Ej. WM-001"
              {...register('storeCode')}
            />
            {errors.storeCode && (
              <p className="text-xs text-red-500">{errors.storeCode.message}</p>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="store-type" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
              Tipo de tienda
            </label>
            <Input
              id="store-type"
              placeholder="Ej. Supercentro"
              {...register('storeType')}
            />
            {errors.storeType && (
              <p className="text-xs text-red-500">{errors.storeType.message}</p>
            )}
          </div>
        </div>

        {/* Ubicación */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="store-location" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
            Ubicación
          </label>
          <Input
            id="store-location"
            placeholder="Ej. Villahermosa, Tabasco"
            {...register('location')}
          />
        </div>

        {/* Código postal */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="store-postal-code" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
            Código postal
          </label>
          <Input
            id="store-postal-code"
            placeholder="Ej. 86000"
            {...register('postalCode')}
          />
        </div>

        {/* Estatus */}
        <div className="flex items-center gap-3 mt-2">
          <input
            type="checkbox"
            id="store-is-active"
            className="size-4 rounded border-stone-300 dark:border-zinc-600 accent-emerald-600"
            {...register('isActive')}
          />
          <label htmlFor="store-is-active" className="text-sm font-medium text-stone-700 dark:text-zinc-300">
            Tienda activa
          </label>
        </div>
      </div>

      <WizardFooter
        isFirstStep={true}
        isLastStep={true}
        onCancel={handleClose}
        onNext={onSubmit}
        isSubmitting={isSubmitting}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Información', content: stepContent }
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog 
          key="feedback"
          isOpen={open} 
          onClose={handleClose}
          size="md"
        >
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success' 
              ? (isEditing ? '¡Actualización Exitosa!' : '¡Registro Exitoso!') 
              : `Error en el ${isEditing ? 'Proceso' : 'Registro'}`}
            message={submissionStatus === 'success' 
              ? `La tienda ha sido ${isEditing ? 'actualizada' : 'registrada'} correctamente en el sistema.` 
              : `No pudimos completar la ${isEditing ? 'actualización' : 'operación'} en este momento.`}
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
            secondaryActionLabel={submissionStatus === 'success' && !isEditing ? 'Registrar otra' : undefined}
            onSecondaryAction={!isEditing ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={open}
          onClose={handleClose}
          title={isEditing ? 'Editar Tienda' : 'Nueva Tienda'}
          description={isEditing ? 'Actualiza la información de la tienda.' : 'Registra una nueva tienda Walmart en el sistema.'}
          icon={<Store className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          onStepSelect={setActiveStep}
          size="md"
        />
      )}
    </AnimatePresence>
  )
}
