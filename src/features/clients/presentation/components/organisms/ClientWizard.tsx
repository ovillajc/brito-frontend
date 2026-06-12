'use client'

/**
 * @fileoverview Wizard para crear o editar un cliente.
 *
 * @organism
 */

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { ClientEntity } from '@/src/features/clients/domain/entities'
import { upsertClientAction } from '@/src/features/clients/presentation/actions/client.actions'
import { toast } from 'sonner'
import { Building2, FileText, MapPin } from 'lucide-react'
import { useCompanyProfiles } from '@/src/features/company-profile/presentation/hooks/use-company-profile'

const clientWizardSchema = z.object({
  tradeName: z.string().min(1, 'El nombre comercial es obligatorio'),
  companyName: z.string().min(1, 'La razón social es obligatoria'),
  rfc: z.string().optional(),
  taxDomicile: z.string().optional(),
  taxRegime: z.string().optional(),
  companyProfileId: z.string().optional(),
})

type ClientWizardValues = z.infer<typeof clientWizardSchema>

interface ClientWizardProps {
  isOpen: boolean
  onClose: () => void
  onSaved?: () => void | Promise<void>
  clientData?: ClientEntity | null
}

export function ClientWizard({ isOpen, onClose, onSaved, clientData }: ClientWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const companyProfilesQuery = useCompanyProfiles()
  const companyProfiles = companyProfilesQuery.data ?? []

  const isEdit = !!clientData

  const {
    register,
    handleSubmit,
    reset,
    trigger,
    watch,
    formState: { errors },
  } = useForm<ClientWizardValues>({
    resolver: zodResolver(clientWizardSchema),
    defaultValues: {
      tradeName: '',
      companyName: '',
      rfc: '',
      taxDomicile: '',
      taxRegime: '',
      companyProfileId: '',
    },
  })

  useEffect(() => {
    if (isOpen) {
      if (clientData) {
        reset({
          tradeName: clientData.tradeName ?? '',
          companyName: clientData.companyName ?? '',
          rfc: clientData.rfc ?? '',
          taxDomicile: clientData.taxDomicile ?? '',
          taxRegime: clientData.taxRegime ?? '',
          companyProfileId: clientData.companyProfileId ?? '',
        })
      } else {
        reset({
          tradeName: '',
          companyName: '',
          rfc: '',
          taxDomicile: '',
          taxRegime: '',
          companyProfileId: '',
        })
      }
      setActiveStep(0)
      setSubmissionStatus('idle')
      setSubmissionError(null)
    }
  }, [isOpen, clientData, reset])

  const goNext = async () => {
    const ok = await trigger()
    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    setSubmissionStatus('idle')
    setSubmissionError(null)
    try {
      const payload: Partial<ClientEntity> = {
        id: clientData?.id,
        tradeName: data.tradeName.trim(),
        companyName: data.companyName.trim(),
        rfc: data.rfc?.trim() || null,
        taxDomicile: data.taxDomicile?.trim() || null,
        taxRegime: data.taxRegime?.trim() || null,
        companyProfileId: data.companyProfileId || null,
      }

      const result = await upsertClientAction(payload)

      if (!result.ok) {
        setSubmissionError(result.error.message)
        setSubmissionStatus('error')
        toast.error(result.error.message)
        return
      }

      setSubmissionStatus('success')
      toast.success(isEdit ? 'Cliente actualizado' : 'Cliente registrado')
      if (onSaved) await onSaved()
    } catch (error) {
      setSubmissionError('Ocurrió un error inesperado')
      setSubmissionStatus('error')
      toast.error('Ocurrió un error inesperado')
    } finally {
      setIsSubmitting(false)
    }
  })

  const inputClass = 'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
  const errorClass = 'text-xs text-red-500 mt-1'

  const step1 = (
    <div className="flex flex-col gap-6 pt-2 h-full">
      <div className="space-y-4 flex-1">
        <div className="grid gap-2">
          <Label htmlFor="companyProfileId">Empresa de Facturación (Opcional)</Label>
          <select
            id="companyProfileId"
            {...register('companyProfileId')}
            className={inputClass}
          >
            <option value="">Selecciona una entidad legal...</option>
            {companyProfiles.map(cp => (
              <option key={cp.id} value={cp.id}>{cp.legalName}</option>
            ))}
          </select>
          {errors.companyProfileId && <p className={errorClass}>{errors.companyProfileId.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="tradeName">Nombre Comercial</Label>
            <Input id="tradeName" placeholder="Ej. Netus" {...register('tradeName')} className={inputClass} />
            {errors.tradeName && <p className={errorClass}>{errors.tradeName.message}</p>}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="companyName">Razón Social</Label>
            <Input id="companyName" placeholder="Ej. Netus Devs S.A. de C.V." {...register('companyName')} className={inputClass} />
            {errors.companyName && <p className={errorClass}>{errors.companyName.message}</p>}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="rfc">RFC</Label>
          <Input id="rfc" placeholder="Ej. NDE123456789" {...register('rfc')} className={inputClass} />
          {errors.rfc && <p className={errorClass}>{errors.rfc.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="taxRegime">Régimen Fiscal</Label>
          <Input id="taxRegime" placeholder="Ej. Régimen General de Ley Personas Morales" {...register('taxRegime')} className={inputClass} />
          {errors.taxRegime && <p className={errorClass}>{errors.taxRegime.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="taxDomicile">Domicilio Fiscal</Label>
          <Input id="taxDomicile" placeholder="Ej. Calle, Número, Colonia, C.P., Ciudad" {...register('taxDomicile')} className={inputClass} />
          {errors.taxDomicile && <p className={errorClass}>{errors.taxDomicile.message}</p>}
        </div>
      </div>
      <WizardFooter
        isFirstStep={true}
        isLastStep={false}
        onCancel={() => {
          setSubmissionStatus('idle')
          setSubmissionError(null)
          onClose()
        }}
        onNext={goNext}
      />
    </div>
  )

  const formValues = watch()

  const step2 = (
    <div className="flex flex-col gap-6 pt-2 h-full">
      <div className="flex-1 space-y-4">
        <div className="rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-800/50 p-6">
          <h4 className="text-sm font-bold text-stone-900 dark:text-zinc-100 mb-4">Información Capturada</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="col-span-2">
              <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Empresa Vinculada</span>
              <span className="font-medium text-[#1a5c3a] dark:text-primary-container">
                {formValues.companyProfileId 
                  ? companyProfiles.find(cp => cp.id === formValues.companyProfileId)?.legalName || 'Desconocida'
                  : 'Ninguna (Independiente)'}
              </span>
            </div>

            <div>
              <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Nombre Comercial</span>
              <span className="font-medium text-stone-900 dark:text-zinc-100">{formValues.tradeName || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Razón Social</span>
              <span className="font-medium text-stone-900 dark:text-zinc-100">{formValues.companyName || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1">RFC</span>
              <span className="font-medium text-stone-900 dark:text-zinc-100">{formValues.rfc || '—'}</span>
            </div>
            <div>
              <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Régimen Fiscal</span>
              <span className="font-medium text-stone-900 dark:text-zinc-100">{formValues.taxRegime || '—'}</span>
            </div>
            <div className="col-span-2">
              <span className="block text-xs font-semibold text-stone-500 dark:text-zinc-400 uppercase tracking-wider mb-1">Domicilio Fiscal</span>
              <span className="font-medium text-stone-900 dark:text-zinc-100">{formValues.taxDomicile || '—'}</span>
            </div>
          </div>
        </div>
      </div>
      <WizardFooter
        isFirstStep={false}
        isLastStep={true}
        onBack={goBack}
        onNext={handleFinish}
        onCancel={() => {
          setSubmissionStatus('idle')
          setSubmissionError(null)
          onClose()
        }}
        isSubmitting={isSubmitting}
      />
    </div>
  )

  const steps: WizardStep[] = [
    {
      id: 'general',
      title: 'Datos Generales',
      content: step1,
    },
    {
      id: 'summary',
      title: 'Resumen',
      content: step2,
    },
  ]

  const handleClose = () => {
    setSubmissionStatus('idle')
    setSubmissionError(null)
    onClose()
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setSubmissionError(null)
    setActiveStep(0)
    reset()
  }

  return (
    <>
      {submissionStatus !== 'idle' ? (
        <Dialog isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus}
            title={
              submissionStatus === 'success'
                ? isEdit
                  ? '¡Cliente actualizado!'
                  : '¡Cliente registrado!'
                : 'Error al guardar'
            }
            message={
              submissionStatus === 'success'
                ? isEdit
                  ? 'Los datos se guardaron correctamente.'
                  : 'El nuevo cliente ya está disponible.'
                : submissionError ?? 'Ocurrió un problema, intenta de nuevo.'
            }
            primaryActionLabel={submissionStatus === 'error' ? 'Reintentar' : 'Finalizar'}
            onPrimaryAction={submissionStatus === 'error' ? () => setSubmissionStatus('idle') : handleClose}
            secondaryActionLabel={submissionStatus === 'success' && !isEdit ? 'Crear otro' : undefined}
            onSecondaryAction={submissionStatus === 'success' && !isEdit ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          isOpen={isOpen}
          onClose={handleClose}
          title={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}
          description={isEdit ? 'Actualiza los datos del cliente' : 'Ingresa los datos para un nuevo cliente'}
          icon={<Building2 className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </>
  )
}
