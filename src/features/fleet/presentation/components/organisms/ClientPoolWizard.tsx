'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence } from 'framer-motion'
import { Layers } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { usePoolMutations } from '@/src/features/fleet/presentation/hooks/use-pools'

const createClientPoolSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional().or(z.literal('')),
})

type CreateClientPoolValues = z.input<typeof createClientPoolSchema>

type SubmissionStatus = 'idle' | 'success' | 'error'

interface ClientPoolWizardProps {
  isOpen: boolean
  onClose: () => void
  clientId: string
  clientLabel: string
}

export function ClientPoolWizard({ isOpen, onClose, clientId, clientLabel }: ClientPoolWizardProps) {
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { createPool } = usePoolMutations()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateClientPoolValues>({
    resolver: zodResolver(createClientPoolSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const handleFinish = handleSubmit(async (values) => {
    setErrorMessage(null)
    const result = await createPool.mutateAsync({
      name: values.name.trim(),
      description: values.description?.trim() ? values.description.trim() : null,
      clientId,
    })

    if (!result.ok) {
      setSubmissionStatus('error')
      setErrorMessage(result.error.message)
      return
    }

    setSubmissionStatus('success')
  })

  const handleClose = () => {
    setSubmissionStatus('idle')
    setErrorMessage(null)
    reset({ name: '', description: '' })
    onClose()
  }

  const steps: WizardStep[] = [
    {
      id: '1',
      title: 'Datos',
      content: (
        <div className="flex flex-col gap-6 pt-2">
          <div className="space-y-4">
            <div className="grid gap-2">
              <Label>Cliente</Label>
              <div className="flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800 px-4 items-center text-sm text-stone-700 dark:text-zinc-200">
                {clientLabel}
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Nombre del Pool</Label>
              <Input id="name" placeholder="Ej. Pool Walmart MTY" {...register('name')} />
              {errors.name?.message ? <p className="text-xs text-red-500 mt-1">{errors.name.message}</p> : null}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Descripción (opcional)</Label>
              <Input id="description" placeholder="Ej. Dedicado a CEDIS MTY" {...register('description')} />
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus === 'success' ? 'success' : 'error'}
            title={submissionStatus === 'success' ? '¡Pool Creado!' : 'Error al crear pool'}
            message={submissionStatus === 'success'
              ? 'El pool se registró correctamente.'
              : (errorMessage ?? 'No pudimos completar la operación.')
            }
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={isOpen}
          onClose={handleClose}
          title="Crear Pool"
          description={`Cliente: ${clientLabel}`}
          icon={<Layers className="size-5" />}
          steps={steps}
          activeStep={0}
          size="lg"
          showFooter
          onFinish={handleFinish}
          isSubmitting={createPool.isPending}
        />
      )}
    </AnimatePresence>
  )
}
