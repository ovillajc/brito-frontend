'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { createEmployeeSchema, CreateEmployeeInput } from '../../../domain/schemas/employee.schema'
import { createEmployeeAction } from '../../actions/employee.actions'

interface CreateEmployeeWizardProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateEmployeeWizard({ isOpen, onClose }: CreateEmployeeWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      fullName: '',
      contactEmail: '',
      contactPhone: '',
      rfc: '',
      curp: '',
      nss: '',
      isOperator: false,
      emergencyContactName: '',
      emergencyContactPhone: '',
      bloodType: '',
      medicalNotes: '',
    },
  })

  // Handlers
  const goNext = async () => {
    // Validate current step fields before moving forward
    let fieldsToValidate: (keyof CreateEmployeeInput)[] = []
    
    if (activeStep === 0) {
      fieldsToValidate = ['fullName', 'contactEmail', 'contactPhone']
    } else if (activeStep === 1) {
      fieldsToValidate = ['rfc', 'curp', 'nss']
    } else if (activeStep === 2) {
      fieldsToValidate = ['departmentId']
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const goBack = () => setActiveStep((prev) => prev - 1)

  const handleFinish = handleSubmit(async (data) => {
    setIsSubmitting(true)
    try {
      const result = await createEmployeeAction(data)
      if (result.ok) {
        toast.success('Empleado registrado exitosamente')
        handleClose()
      } else {
        toast.error(result.error.message || 'Error al registrar empleado')
      }
    } catch (error) {
      toast.error('Error inesperado al procesar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  })
  
  const handleClose = () => {
    setActiveStep(0)
    reset()
    onClose()
  }

  // Step 1: Datos Generales
  const step1Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="fullName">Nombre Completo</Label>
          <Input 
            id="fullName" 
            placeholder="P. ej. Juan Pérez" 
            {...register('fullName')}
          />
          {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactEmail">Correo Electrónico (opcional)</Label>
          <Input 
            id="contactEmail" 
            type="email" 
            placeholder="juan@netus.com" 
            {...register('contactEmail')}
          />
          {errors.contactEmail && <p className="text-xs text-red-500">{errors.contactEmail.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contactPhone">Teléfono de Contacto</Label>
          <Input 
            id="contactPhone" 
            placeholder="10 dígitos" 
            {...register('contactPhone')}
          />
          {errors.contactPhone && <p className="text-xs text-red-500">{errors.contactPhone.message}</p>}
        </div>
      </div>
      
      <WizardFooter
        isFirstStep={true}
        isLastStep={false}
        onCancel={handleClose}
        onNext={goNext}
      />
    </div>
  )

  // Step 2: Identificación Legal
  const step2Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="rfc">RFC</Label>
          <Input 
            id="rfc" 
            placeholder="ABCD123456XYZ" 
            {...register('rfc')}
          />
          {errors.rfc && <p className="text-xs text-red-500">{errors.rfc.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="curp">CURP</Label>
          <Input 
            id="curp" 
            placeholder="Ingresa los 18 caracteres" 
            {...register('curp')}
          />
          {errors.curp && <p className="text-xs text-red-500">{errors.curp.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="nss">NSS</Label>
          <Input 
            id="nss" 
            placeholder="Número de Seguro Social" 
            {...register('nss')}
          />
          {errors.nss && <p className="text-xs text-red-500">{errors.nss.message}</p>}
        </div>
      </div>
      
      <WizardFooter
        isFirstStep={false}
        isLastStep={false}
        onCancel={handleClose}
        onBack={goBack}
        onNext={goNext}
      />
    </div>
  )

  // Step 3: Asignación
  const step3Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="isOperator">Tipo de Empleado</Label>
          <select 
            id="isOperator" 
            className="flex h-12 w-full items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            {...register('isOperator', { setValueAs: (v) => v === 'true' })}
          >
            <option value="false">Administrativo</option>
            <option value="true">Operativo (Conductor, Mecánico)</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="departmentId">Departamento</Label>
          <Input 
            id="departmentId" 
            placeholder="P. ej. Logística (UUID por ahora)" 
            {...register('departmentId')}
          />
          {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId.message}</p>}
        </div>
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep={false}
        onCancel={handleClose}
        onBack={goBack}
        onNext={goNext}
      />
    </div>
  )

  // Step 4: Emergencias & Salud
  const step4Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="emergencyContactName">Contacto de Emergencia</Label>
            <Input 
              id="emergencyContactName" 
              placeholder="Nombre de contacto" 
              {...register('emergencyContactName')}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="emergencyContactPhone">Teléfono de Emergencia</Label>
            <Input 
              id="emergencyContactPhone" 
              placeholder="Teléfono" 
              {...register('emergencyContactPhone')}
            />
          </div>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bloodType">Tipo de Sangre</Label>
          <Input 
            id="bloodType" 
            placeholder="P. ej. O+" 
            {...register('bloodType')}
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="medicalNotes">Notas Médicas / Alergias</Label>
          <Input 
            id="medicalNotes" 
            placeholder="Información relevante de salud" 
            {...register('medicalNotes')}
          />
        </div>
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep={true}
        onCancel={handleClose}
        onBack={goBack}
        onNext={handleFinish}
        isSubmitting={isSubmitting}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Generales', content: step1Content },
    { id: '2', title: 'Identificación', content: step2Content },
    { id: '3', title: 'Asignación', content: step3Content },
    { id: '4', title: 'Salud / Emergencias', content: step4Content },
  ]

  return (
    <Wizard
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Empleado"
      description="Completa el expediente del trabajador"
      steps={steps}
      activeStep={activeStep}
      size="lg"
    />
  )
}

