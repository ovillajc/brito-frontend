'use client'

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { UserPlus, UserCog } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { createEmployeeSchema, CreateEmployeeInput } from '../../../domain/schemas/employee.schema'
import { createEmployeeAction, updateEmployeeAction } from '../../actions/employee.actions'
import { useDepartments } from '../../hooks/use-departments'
import { EmployeeEntity } from '../../../domain/entities'

interface EmployeeWizardProps {
  isOpen: boolean
  onClose: () => void
  employee?: EmployeeEntity
}

type SubmissionStatus = 'idle' | 'success' | 'error'

export function EmployeeWizard({ isOpen, onClose, employee }: EmployeeWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const { data: departments, isLoading: isLoadingDepts } = useDepartments()

  const isEdit = !!employee

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      fullName: '',
      birthDate: '',
      contactEmail: '',
      contactPhone: '',
      rfc: '',
      curp: '',
      nss: '',
      isOperator: false,
      departmentId: '',
      jobTitle: '',
      hireDate: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      bloodType: '',
      medicalNotes: '',
      licenseNumber: '',
      licenseType: '',
      licenseExpiration: '',
      opaloId: '',
      opaloExpiration: '',
      rcontrolId: '',
      rcontrolExpiration: '',
      fasttrackId: '',
      fasttrackExpiration: '',
    },
  })

  // Pre-populate form when editing
  useEffect(() => {
    if (isOpen && employee) {
      reset({
        fullName: employee.fullName,
        birthDate: employee.birthDate ? employee.birthDate.toISOString().split('T')[0] : '',
        contactEmail: employee.contactEmail || '',
        contactPhone: employee.contactPhone || '',
        rfc: employee.rfc || '',
        curp: employee.curp || '',
        nss: employee.nss || '',
        isOperator: employee.isOperator,
        departmentId: employee.departmentId || '',
        jobTitle: employee.jobTitle || '',
        hireDate: employee.hireDate ? employee.hireDate.toISOString().split('T')[0] : '',
        emergencyContactName: employee.emergencyContactName || '',
        emergencyContactPhone: employee.emergencyContactPhone || '',
        bloodType: employee.bloodType || '',
        medicalNotes: employee.medicalNotes || '',
        licenseNumber: employee.licenseNumber || '',
        licenseType: employee.licenseType || '',
        licenseExpiration: employee.licenseExpiration ? employee.licenseExpiration.toISOString().split('T')[0] : '',
        opaloId: employee.opaloId || '',
        opaloExpiration: employee.opaloExpiration ? employee.opaloExpiration.toISOString().split('T')[0] : '',
        rcontrolId: employee.rcontrolId || '',
        rcontrolExpiration: employee.rcontrolExpiration ? employee.rcontrolExpiration.toISOString().split('T')[0] : '',
        fasttrackId: employee.fasttrackId || '',
        fasttrackExpiration: employee.fasttrackExpiration ? employee.fasttrackExpiration.toISOString().split('T')[0] : '',
      })
    } else if (isOpen && !employee) {
      reset({
        fullName: '',
        birthDate: '',
        contactEmail: '',
        contactPhone: '',
        rfc: '',
        curp: '',
        nss: '',
        isOperator: false,
        departmentId: '',
        jobTitle: '',
        hireDate: '',
        emergencyContactName: '',
        emergencyContactPhone: '',
        bloodType: '',
        medicalNotes: '',
        licenseNumber: '',
        licenseType: '',
        licenseExpiration: '',
        opaloId: '',
        opaloExpiration: '',
        rcontrolId: '',
        rcontrolExpiration: '',
        fasttrackId: '',
        fasttrackExpiration: '',
      })
    }
  }, [isOpen, employee, reset])

  const jobTitle = watch('jobTitle')
  const isSelectedOperator = jobTitle === 'Operador'

  useEffect(() => {
    if (isSelectedOperator) {
      setValue('isOperator', true)
    }
  }, [isSelectedOperator, setValue])

  // Handlers
  const goNext = async () => {
    // Validate current step fields before moving forward
    let fieldsToValidate: (keyof CreateEmployeeInput)[] = []
    
    if (activeStep === 0) {
      fieldsToValidate = ['fullName', 'contactEmail', 'contactPhone']
    } else if (activeStep === 1) {
      fieldsToValidate = ['rfc', 'curp', 'nss']
    } else if (activeStep === 2) {
      fieldsToValidate = ['departmentId', 'jobTitle', 'hireDate']
    } else if (activeStep === 3 && isSelectedOperator) {
      fieldsToValidate = ['licenseNumber', 'licenseType', 'licenseExpiration'] // Validate minimum required credentials if needed
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
      const result = isEdit 
        ? await updateEmployeeAction({ ...data, id: employee!.id })
        : await createEmployeeAction(data)

      if (result.ok) {
        setSubmissionStatus('success')
      } else {
        setSubmissionStatus('error')
        toast.error(result.error.message || `Error al ${isEdit ? 'actualizar' : 'registrar'} empleado`)
      }
    } catch (error) {
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
          <Label htmlFor="birthDate">Fecha de Nacimiento</Label>
          <Input 
            id="birthDate" 
            type="date" 
            {...register('birthDate')}
          />
          {errors.birthDate && <p className="text-xs text-red-500">{errors.birthDate.message}</p>}
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
            value={watch('isOperator') ? 'true' : 'false'}
            onChange={(e) => setValue('isOperator', e.target.value === 'true', { shouldValidate: true })}
          >
            <option value="false">Administrativo</option>
            <option value="true">Operativo (Conductor, Mecánico)</option>
          </select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="departmentId">Departamento</Label>
          <select 
            id="departmentId" 
            className="flex h-12 w-full items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            disabled={isLoadingDepts}
            {...register('departmentId')}
          >
            <option value="">Selecciona un departamento</option>
            {departments?.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
          {errors.departmentId && <p className="text-xs text-red-500">{errors.departmentId.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="jobTitle">Puesto / Cargo</Label>
          <select 
            id="jobTitle" 
            className="flex h-12 w-full items-center justify-between rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 disabled:cursor-not-allowed disabled:opacity-50 transition-colors"
            {...register('jobTitle')}
          >
            <option value="">Selecciona un puesto</option>
            <option value="Operador">Operador</option>
            <option value="Despachador">Despachador</option>
            <option value="Mecánico">Mecánico</option>
            <option value="Jefe de Flotilla">Jefe de Flotilla</option>
            <option value="Ejecutivo">Ejecutivo</option>
            <option value="Administrativo">Administrativo</option>
          </select>
          {errors.jobTitle && <p className="text-xs text-red-500">{errors.jobTitle.message}</p>}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="hireDate">Fecha de Contratación</Label>
          <Input 
            id="hireDate" 
            type="date" 
            {...register('hireDate')}
          />
          {errors.hireDate && <p className="text-xs text-red-500">{errors.hireDate.message}</p>}
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

  // Step 4: Credenciales de Operador (Only if Operador)
  const step4OperatorContent = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        {/* Licencia */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="licenseNumber">Número de Licencia</Label>
            <Input id="licenseNumber" placeholder="No. Licencia" {...register('licenseNumber')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="licenseType">Tipo de Licencia</Label>
            <Input id="licenseType" placeholder="P. ej. Federal B" {...register('licenseType')} />
          </div>
          <div className="grid gap-2 col-span-2">
            <Label htmlFor="licenseExpiration">Vigencia Licencia</Label>
            <Input id="licenseExpiration" type="date" {...register('licenseExpiration')} />
          </div>
        </div>
        
        {/* RControl */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="rcontrolId">ID RControl</Label>
            <Input id="rcontrolId" placeholder="No. RControl" {...register('rcontrolId')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="rcontrolExpiration">Vigencia RControl</Label>
            <Input id="rcontrolExpiration" type="date" {...register('rcontrolExpiration')} />
          </div>
        </div>

        {/* Opalo */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="opaloId">ID Opalo</Label>
            <Input id="opaloId" placeholder="No. Opalo" {...register('opaloId')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="opaloExpiration">Vigencia Opalo</Label>
            <Input id="opaloExpiration" type="date" {...register('opaloExpiration')} />
          </div>
        </div>

        {/* Fasttrack */}
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="fasttrackId">ID Fasttrack</Label>
            <Input id="fasttrackId" placeholder="No. Fasttrack" {...register('fasttrackId')} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="fasttrackExpiration">Vigencia Fasttrack</Label>
            <Input id="fasttrackExpiration" type="date" {...register('fasttrackExpiration')} />
          </div>
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

  // Step Last: Emergencias & Salud
  const stepHealthContent = (
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

  const baseSteps: WizardStep[] = [
    { id: '1', title: 'Generales', content: step1Content },
    { id: '2', title: 'Identificación', content: step2Content },
    { id: '3', title: 'Asignación', content: step3Content },
  ]

  if (isSelectedOperator) {
    baseSteps.push({ id: '4', title: 'Credenciales', content: step4OperatorContent })
  }

  baseSteps.push({ id: '5', title: 'Salud / Emerg.', content: stepHealthContent })

  const steps = baseSteps

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog 
          key="feedback"
          isOpen={isOpen} 
          onClose={handleClose}
          size="md"
        >
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success' 
              ? (isEdit ? '¡Actualización Exitosa!' : '¡Registro Exitoso!') 
              : `Error en el ${isEdit ? 'Proceso' : 'Registro'}`}
            message={submissionStatus === 'success' 
              ? `El empleado ha sido ${isEdit ? 'actualizado' : 'registrado'} correctamente en la plataforma.` 
              : `No pudimos completar la ${isEdit ? 'actualización' : 'operación'} en este momento.`}
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
            secondaryActionLabel={submissionStatus === 'success' && !isEdit ? 'Registrar otro' : undefined}
            onSecondaryAction={!isEdit ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={isOpen}
          onClose={handleClose}
          title={isEdit ? 'Editar Empleado' : 'Nuevo Empleado'}
          description={isEdit && employee ? `Editando información de ${employee.fullName}` : 'Completa el expediente del trabajador'}
          icon={isEdit ? <UserCog className="size-5" /> : <UserPlus className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}

