'use client'

import React, { useState } from 'react'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'

interface CreateEmployeeWizardProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateEmployeeWizard({ isOpen, onClose }: CreateEmployeeWizardProps) {
  const [activeStep, setActiveStep] = useState(0)

  // Handlers
  const goNext = () => setActiveStep((prev) => prev + 1)
  const goBack = () => setActiveStep((prev) => prev - 1)
  const finish = () => {
    // Submit logic here
    setActiveStep(0)
    onClose()
  }
  
  const handleClose = () => {
    setActiveStep(0)
    onClose()
  }

  // Step 1: Datos Generales
  const step1Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nombre Completo</Label>
          <Input id="name" placeholder="P. ej. Juan Pérez" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Correo Electrónico (opcional)</Label>
          <Input id="email" type="email" placeholder="juan@netus.com" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Teléfono de Contacto</Label>
          <Input id="phone" placeholder="10 dígitos" />
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

  // Step 2: Asignación
  const step2Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="role">Tipo de Empleado</Label>
          <select 
            id="role" 
            className="flex h-10 w-full items-center justify-between rounded-md border border-stone-200 bg-white px-3 py-2 text-sm placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="operativo">Operativo (Conductor, Mecánico)</option>
            <option value="administrativo">Administrativo</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="department">Departamento</Label>
          <Input id="department" placeholder="P. ej. Logística" />
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

  // Step 3: Confirmación / Documentos
  const step3Content = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
         <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 p-6 flex flex-col items-center justify-center text-center">
            <p className="text-sm font-medium text-stone-600 mb-2">Arrastra los documentos del empleado aquí</p>
            <p className="text-xs text-stone-400">INE, Comprobante de domicilio, etc. (Opcional por ahora)</p>
         </div>
         <p className="text-sm text-stone-600">Al finalizar, el empleado quedará registrado en estatus "Activo" de forma predeterminada.</p>
      </div>

      <WizardFooter
        isFirstStep={false}
        isLastStep={true}
        onCancel={handleClose}
        onBack={goBack}
        onNext={finish}
      />
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Datos Generales', content: step1Content },
    { id: '2', title: 'Asignación', content: step2Content },
    { id: '3', title: 'Documentación', content: step3Content },
  ]

  return (
    <Wizard
      isOpen={isOpen}
      onClose={handleClose}
      title="Nuevo Empleado"
      description="Completa el registro paso a paso"
      steps={steps}
      activeStep={activeStep}
      size="lg"
    />
  )
}
