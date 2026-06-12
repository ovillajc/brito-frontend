'use client'

import { useEffect, useState } from 'react'
import { useFieldArray, useForm, type FieldErrors, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { AnimatePresence } from 'framer-motion'
import { UserPlus, UserCog, Paperclip, Plus, Trash2, CheckCircle, ExternalLink } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { uploadFileToR2Action } from '@/src/core/infrastructure/storage/r2-upload.action'
import { createEmployeeSchema, CreateEmployeeInput } from '../../../domain/schemas/employee.schema'
import { createEmployeeAction, deleteEmployeeDocumentFileAction, updateEmployeeAction } from '../../actions/employee.actions'
import { useDepartments } from '../../hooks/use-departments'
import { EmployeeEntity } from '../../../domain/entities'

interface EmployeeWizardProps {
  isOpen: boolean
  onClose: () => void
  employee?: EmployeeEntity
}

type SubmissionStatus = 'idle' | 'success' | 'error'
const ALLOWED_DOCUMENT_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])
const MAX_DOCUMENT_SIZE_BYTES = 10 * 1024 * 1024
const PENDING_FILE_TOKEN = '__pending_file__'

function SummaryField({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
      <p className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-stone-900 dark:text-zinc-100">{value}</p>
    </div>
  )
}

export function EmployeeWizard({ isOpen, onClose, employee }: EmployeeWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [pendingDocumentFiles, setPendingDocumentFiles] = useState<Record<string, File | null>>({})
  const [pendingDocumentPreviews, setPendingDocumentPreviews] = useState<Record<string, string>>({})
  const { data: departments, isLoading: isLoadingDepts } = useDepartments()

  const isEdit = !!employee

  const {
    register,
    trigger,
    reset,
    getValues,
    setValue,
    setError,
    clearErrors,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateEmployeeInput>({
    resolver: zodResolver(createEmployeeSchema) as unknown as Resolver<CreateEmployeeInput>,
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
      documents: [],
    },
  })

  const { fields: documentFields, append: appendDocument, remove: removeDocument } = useFieldArray<CreateEmployeeInput>({
    control,
    name: 'documents',
  })

  // Pre-populate form when editing
  useEffect(() => {
    if (isOpen && employee) {
      setPendingDocumentFiles({})
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
        documents: employee.documents.map((doc) => ({
          id: doc.id,
          documentName: doc.documentName,
          fileUrl: doc.fileUrl,
        })),
      })
    } else if (isOpen && !employee) {
      setPendingDocumentFiles({})
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
        documents: [],
      })
    }
  }, [isOpen, employee, reset])

  const jobTitle = watch('jobTitle')
  const departmentId = watch('departmentId')
  const documents = watch('documents') ?? []
  const isSelectedOperator = jobTitle === 'Operador'
  const documentStepIndex = isSelectedOperator ? 4 : 3
  const summaryStepIndex = documentStepIndex + 2
  const selectedDepartmentName = departments?.find((dept) => dept.id === departmentId)?.name ?? 'Sin asignar'

  const displayValue = (value?: string | null) => (value && value.trim().length > 0 ? value : 'No capturado')

  const setPendingFileForField = (fieldId: string, file: File | null) => {
    setPendingDocumentFiles((prev) => {
      if (!file) {
        const next = { ...prev }
        delete next[fieldId]
        return next
      }

      return { ...prev, [fieldId]: file }
    })
  }

  const setPendingPreviewForField = (fieldId: string, previewUrl: string | null) => {
    setPendingDocumentPreviews((prev) => {
      const previousPreview = prev[fieldId]
      if (previousPreview && previousPreview !== previewUrl) {
        URL.revokeObjectURL(previousPreview)
      }

      if (!previewUrl) {
        const next = { ...prev }
        delete next[fieldId]
        return next
      }

      return { ...prev, [fieldId]: previewUrl }
    })
  }

  const getPendingFileForIndex = (index: number) => {
    const fieldId = documentFields[index]?.id
    return fieldId ? pendingDocumentFiles[fieldId] ?? null : null
  }

  const getPendingPreviewForIndex = (index: number) => {
    const fieldId = documentFields[index]?.id
    return fieldId ? pendingDocumentPreviews[fieldId] ?? null : null
  }

  const getOriginalDocumentUrl = (documentId?: string) =>
    employee?.documents.find((doc) => doc.id === documentId)?.fileUrl ?? ''

  const handleDocumentFileSelection = (fieldId: string, index: number, file: File | null) => {
    if (!file) return

    if (!ALLOWED_DOCUMENT_TYPES.has(file.type)) {
      toast.error('Tipo de archivo no permitido. Solo se aceptan PDF, JPG, PNG y WEBP.')
      return
    }

    if (file.size > MAX_DOCUMENT_SIZE_BYTES) {
      toast.error('El archivo excede el limite de 10 MB.')
      return
    }

    setPendingFileForField(fieldId, file)
    setPendingPreviewForField(fieldId, URL.createObjectURL(file))
    setValue(`documents.${index}.fileUrl`, `${PENDING_FILE_TOKEN}:${file.name}`, { shouldDirty: true })
    clearErrors(`documents.${index}.fileUrl`)
  }

  const validateDocumentsStep = () => {
    clearErrors('documents')

    const documents = getValues('documents') ?? []
    let hasErrors = false

    documents.forEach((doc, index) => {
      const pendingFile = getPendingFileForIndex(index)
      const hasDocumentName = !!doc?.documentName?.trim()
      const hasAttachedFile = !!pendingFile || !!doc?.fileUrl

      if (!hasDocumentName) {
        hasErrors = true
        setError(`documents.${index}.documentName`, {
          type: 'manual',
          message: 'El nombre del documento es requerido',
        })
      }

      if (!hasAttachedFile) {
        hasErrors = true
        setError(`documents.${index}.fileUrl`, {
          type: 'manual',
          message: 'Debes seleccionar un archivo para este documento',
        })
      }
    })

    return !hasErrors
  }

  const handleRemoveDocumentAttachment = (index: number) => {
    const fieldId = documentFields[index]?.id
    const documentId = getValues(`documents.${index}.id`)
    if (fieldId) {
      setPendingFileForField(fieldId, null)
      setPendingPreviewForField(fieldId, null)
    }

    const originalUrl = getOriginalDocumentUrl(documentId)
    setValue(`documents.${index}.fileUrl`, originalUrl, { shouldValidate: true, shouldDirty: true })
    clearErrors(`documents.${index}.fileUrl`)
  }

  const handleRemoveDocument = (index: number) => {
    const fieldId = documentFields[index]?.id
    if (fieldId) {
      setPendingFileForField(fieldId, null)
      setPendingPreviewForField(fieldId, null)
    }

    removeDocument(index)
  }

  const cleanupUploadedFiles = async (urls: string[]) => {
    if (urls.length === 0) return
    await Promise.all(urls.map((url) => deleteEmployeeDocumentFileAction(url)))
  }

  const uploadPendingDocuments = async (documents: CreateEmployeeInput['documents']) => {
    const uploadedUrls: string[] = []

    try {
      const nextDocuments = await Promise.all(
        documents.map(async (document, index) => {
          const pendingFile = getPendingFileForIndex(index)
          if (!pendingFile) return document

          const formData = new FormData()
          formData.append('file', pendingFile)
          formData.append('folder', 'hr/employees/documents')

          const uploadResult = await uploadFileToR2Action(formData)
          if (!uploadResult.ok) {
            throw new Error(uploadResult.error.message || 'No se pudo subir uno de los documentos seleccionados.')
          }

          if (!uploadResult.data?.url) {
            throw new Error('No se pudo obtener la URL del documento subido.')
          }

          uploadedUrls.push(uploadResult.data.url)

          return {
            ...document,
            fileUrl: uploadResult.data.url,
          }
        })
      )

      return { documents: nextDocuments, uploadedUrls }
    } catch (error) {
      await cleanupUploadedFiles(uploadedUrls)
      throw error
    }
  }

  useEffect(() => {
    if (isSelectedOperator) {
      setValue('isOperator', true)
    }
  }, [isSelectedOperator, setValue])

  useEffect(() => {
    return () => {
      Object.values(pendingDocumentPreviews).forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl)
      })
    }
  }, [pendingDocumentPreviews])

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
    } else if (activeStep === documentStepIndex) {
      const isValidDocuments = validateDocumentsStep()
      if (isValidDocuments) {
        setActiveStep((prev) => prev + 1)
      }
      return
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setActiveStep((prev) => prev + 1)
    }
  }

  const goBack = () => setActiveStep((prev) => prev - 1)

  const goToFirstErrorStep = (formErrors: FieldErrors<CreateEmployeeInput>) => {
    if (formErrors.fullName || formErrors.birthDate || formErrors.contactEmail || formErrors.contactPhone) {
      setActiveStep(0)
      return
    }

    if (formErrors.rfc || formErrors.curp || formErrors.nss) {
      setActiveStep(1)
      return
    }

    if (formErrors.departmentId || formErrors.jobTitle || formErrors.hireDate || formErrors.isOperator) {
      setActiveStep(2)
      return
    }

    if (
      isSelectedOperator &&
      (formErrors.licenseNumber || formErrors.licenseType || formErrors.licenseExpiration || formErrors.opaloId || formErrors.opaloExpiration || formErrors.rcontrolId || formErrors.rcontrolExpiration || formErrors.fasttrackId || formErrors.fasttrackExpiration)
    ) {
      setActiveStep(3)
      return
    }

    if (formErrors.documents) {
      setActiveStep(documentStepIndex)
      return
    }

    setActiveStep(summaryStepIndex)
  }

  const handleFinish = async () => {
    // ── Paso 1: Validar Datos Generales ─────────────────────────────────────
    const step0Valid = await trigger(['fullName', 'contactEmail', 'contactPhone'])
    if (!step0Valid) {
      setActiveStep(0)
      toast.error('Hay campos pendientes. Revisa los Datos Generales.')
      return
    }

    // ── Paso 2: Validar Identificación ──────────────────────────────────────
    const step1Valid = await trigger(['rfc', 'curp', 'nss'])
    if (!step1Valid) {
      setActiveStep(1)
      toast.error('Hay campos pendientes. Revisa la Identificación.')
      return
    }

    // ── Paso 3: Validar Asignación ──────────────────────────────────────────
    const step2Valid = await trigger(['departmentId', 'jobTitle', 'hireDate'])
    if (!step2Valid) {
      setActiveStep(2)
      toast.error('Hay campos pendientes. Revisa la Asignación.')
      return
    }

    // ── Paso 4: Validar Credenciales (solo Operadores) ─────────────────────
    if (isSelectedOperator) {
      const step3Valid = await trigger(['licenseNumber', 'licenseType', 'licenseExpiration'])
      if (!step3Valid) {
        setActiveStep(3)
        toast.error('Hay campos pendientes. Revisa las Credenciales.')
        return
      }
    }

    // ── Paso 5: Validar Documentos (manual, nunca pasa por Zod) ────────────
    // Los documentos usan el token __pending_file__ en fileUrl hasta que se
    // suben a R2. Zod no los ve aqui; la validacion es exclusivamente manual.
    if (!validateDocumentsStep()) {
      setActiveStep(documentStepIndex)
      toast.error('Revisa los documentos pendientes antes de finalizar.')
      return
    }

    // ── Paso 6: Subir archivos a R2 y guardar en Supabase ─────────────────
    // Solo se sube a R2 si todas las validaciones pasaron.
    // Si Supabase falla, se eliminan los archivos ya subidos a R2 (rollback).
    setIsSubmitting(true)
    let uploadedUrls: string[] = []
    try {
      const data = getValues()
      const uploadResult = await uploadPendingDocuments(data.documents ?? [])
      uploadedUrls = uploadResult.uploadedUrls

      const payload = {
        ...data,
        documents: uploadResult.documents,
      }

      const result = isEdit
        ? await updateEmployeeAction({ ...payload, id: employee!.id })
        : await createEmployeeAction(payload)

      if (result.ok) {
        setPendingDocumentFiles({})
        setSubmissionStatus('success')
      } else {
        await cleanupUploadedFiles(uploadedUrls)
        setSubmissionStatus('error')
        toast.error(result.error.message || `Error al ${isEdit ? 'actualizar' : 'registrar'} empleado`)
      }
    } catch {
      await cleanupUploadedFiles(uploadedUrls)
      setSubmissionStatus('error')
      toast.error('Error inesperado al procesar la solicitud')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const handleClose = () => {
    setActiveStep(0)
    setSubmissionStatus('idle')
    onClose()
    setPendingDocumentFiles({})
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setActiveStep(0)
    if (!isEdit) reset()
    setPendingDocumentFiles({})
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
        isLastStep={false}
        onCancel={handleClose}
        onBack={goBack}
        onNext={goNext}
      />
    </div>
  )

  const stepSummaryContent = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-6">
        <div className="rounded-2xl border border-stone-200 bg-stone-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Resumen del expediente</p>
          <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
            Revisa toda la información antes de guardar. Puedes regresar a cualquier paso desde la barra superior.
          </p>
        </div>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Datos generales</p>
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryField label="Nombre completo" value={displayValue(watch('fullName'))} />
            <SummaryField label="Fecha de nacimiento" value={displayValue(watch('birthDate'))} />
            <SummaryField label="Correo electrónico" value={displayValue(watch('contactEmail'))} />
            <SummaryField label="Teléfono de contacto" value={displayValue(watch('contactPhone'))} />
          </div>
        </section>

        <section className="space-y-3">
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Identificación y asignación</p>
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryField label="RFC" value={displayValue(watch('rfc'))} />
            <SummaryField label="CURP" value={displayValue(watch('curp'))} />
            <SummaryField label="NSS" value={displayValue(watch('nss'))} />
            <SummaryField label="Tipo de empleado" value={watch('isOperator') ? 'Operativo' : 'Administrativo'} />
            <SummaryField label="Departamento" value={selectedDepartmentName} />
            <SummaryField label="Puesto / Cargo" value={displayValue(watch('jobTitle'))} />
            <SummaryField label="Fecha de contratación" value={displayValue(watch('hireDate'))} />
          </div>
        </section>

        {isSelectedOperator ? (
          <section className="space-y-3">
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Credenciales de operador</p>
            <div className="grid gap-3 md:grid-cols-2">
              <SummaryField label="Número de licencia" value={displayValue(watch('licenseNumber'))} />
              <SummaryField label="Tipo de licencia" value={displayValue(watch('licenseType'))} />
              <SummaryField label="Vigencia licencia" value={displayValue(watch('licenseExpiration'))} />
              <SummaryField label="ID RControl" value={displayValue(watch('rcontrolId'))} />
              <SummaryField label="Vigencia RControl" value={displayValue(watch('rcontrolExpiration'))} />
              <SummaryField label="ID Opalo" value={displayValue(watch('opaloId'))} />
              <SummaryField label="Vigencia Opalo" value={displayValue(watch('opaloExpiration'))} />
              <SummaryField label="ID Fasttrack" value={displayValue(watch('fasttrackId'))} />
              <SummaryField label="Vigencia Fasttrack" value={displayValue(watch('fasttrackExpiration'))} />
            </div>
          </section>
        ) : null}

        <section className="space-y-3">
          <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Salud y emergencias</p>
          <div className="grid gap-3 md:grid-cols-2">
            <SummaryField label="Contacto de emergencia" value={displayValue(watch('emergencyContactName'))} />
            <SummaryField label="Teléfono de emergencia" value={displayValue(watch('emergencyContactPhone'))} />
            <SummaryField label="Tipo de sangre" value={displayValue(watch('bloodType'))} />
            <SummaryField label="Notas médicas" value={displayValue(watch('medicalNotes'))} />
          </div>
        </section>

        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Documentación</p>
            <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">
              {documents.length} documento{documents.length === 1 ? '' : 's'}
            </span>
          </div>
          {documents.length > 0 ? (
            <div className="space-y-3">
              {documents.map((document, index) => {
                const pendingFile = getPendingFileForIndex(index)
                const pendingPreviewUrl = getPendingPreviewForIndex(index)
                const currentUrl = document.fileUrl && !document.fileUrl.startsWith(PENDING_FILE_TOKEN) ? document.fileUrl : ''

                return (
                  <div key={`${document.id ?? 'new'}-${index}`} className="rounded-xl border border-stone-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900/30">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-900 dark:text-zinc-100">{displayValue(document.documentName)}</p>
                        <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">
                          {pendingFile ? `Listo para subir: ${pendingFile.name}` : currentUrl ? 'Documento actual vinculado' : 'Sin archivo seleccionado'}
                        </p>
                      </div>
                      {pendingPreviewUrl || currentUrl ? (
                        <a
                          href={pendingPreviewUrl || currentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs text-[#1a5c3a] hover:underline dark:text-emerald-400"
                        >
                          <ExternalLink className="size-3.5" />
                          Ver archivo
                        </a>
                      ) : null}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-stone-200 p-6 text-center dark:border-zinc-700">
              <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">No se agregarán documentos en este registro</p>
            </div>
          )}
        </section>
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

  const stepDocumentsContent = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-2xl border border-stone-200 dark:border-zinc-800 bg-stone-50/70 dark:bg-zinc-900/40 p-4">
          <div>
            <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Expediente digital</p>
            <p className="text-xs text-stone-500 dark:text-zinc-400">Agrega documentos del empleado y adjunta sus archivos.</p>
          </div>
          <button
            type="button"
            onClick={() => appendDocument({ documentName: '', fileUrl: '' })}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#1a5c3a] px-4 text-sm font-medium text-white transition-colors hover:bg-[#14472d]"
          >
            <Plus className="size-4" />
            Agregar documento
          </button>
        </div>

        {documentFields.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-stone-200 dark:border-zinc-700 p-6 text-center">
            <Paperclip className="mx-auto mb-3 size-5 text-stone-300 dark:text-zinc-600" />
            <p className="text-sm font-medium text-stone-700 dark:text-zinc-300">Aun no hay documentos capturados</p>
            <p className="mt-1 text-xs text-stone-500 dark:text-zinc-400">Puedes continuar sin documentos o agregar los necesarios al expediente.</p>
          </div>
        ) : null}

        <div className="space-y-4">
          {documentFields.map((field, index) => {
            const fileUrl = watch(`documents.${index}.fileUrl`)
            const pendingFile = getPendingFileForIndex(index)
            const pendingPreviewUrl = getPendingPreviewForIndex(index)

            return (
              <div key={field.id} className="rounded-2xl border border-stone-200 dark:border-zinc-800 p-4 space-y-4 bg-white dark:bg-zinc-900/30">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-stone-900 dark:text-zinc-100">Documento {index + 1}</p>
                  <button
                    type="button"
                    onClick={() => handleRemoveDocument(index)}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    <Trash2 className="size-3.5" />
                    Eliminar
                  </button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="grid gap-2">
                    <input type="hidden" {...register(`documents.${index}.id`)} />
                    <Label htmlFor={`documents.${index}.documentName`}>Nombre del documento</Label>
                    <Input
                      id={`documents.${index}.documentName`}
                      placeholder="Ej. INE, Contrato, CURP"
                      {...register(`documents.${index}.documentName`)}
                    />
                    {errors.documents?.[index]?.documentName && (
                      <p className="text-xs text-red-500">{errors.documents[index]?.documentName?.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label>Cargar archivo</Label>
                  <input type="hidden" {...register(`documents.${index}.fileUrl`)} />
                  <div className="flex flex-col gap-2">
                    <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-stone-300 px-3 py-2 text-sm text-stone-500 transition-colors hover:border-[#1a5c3a] hover:text-[#1a5c3a] dark:border-zinc-600 dark:text-zinc-400 dark:hover:border-emerald-500 dark:hover:text-emerald-400">
                      <Paperclip className="size-4" />
                      {pendingFile ? 'Cambiar archivo seleccionado' : fileUrl ? 'Reemplazar archivo' : 'Adjuntar documento (PDF / Imagen)'}
                      <input
                        type="file"
                        accept="application/pdf,image/jpeg,image/jpg,image/png,image/webp"
                        className="hidden"
                        onChange={(event) => {
                          handleDocumentFileSelection(field.id, index, event.target.files?.[0] ?? null)
                          event.currentTarget.value = ''
                        }}
                      />
                    </label>
                    {pendingFile ? (
                      <div className="flex items-center gap-1.5 text-xs text-[#1a5c3a] dark:text-emerald-400">
                        <CheckCircle className="size-3.5 shrink-0" />
                        <span className="truncate">Archivo listo para subir al guardar: {pendingFile.name}</span>
                      </div>
                    ) : null}
                    {pendingFile && pendingPreviewUrl ? (
                      <a
                        href={pendingPreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#1a5c3a] dark:text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="size-3.5 shrink-0" />
                        Ver archivo seleccionado
                      </a>
                    ) : null}
                    {!pendingFile && fileUrl ? (
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-xs text-[#1a5c3a] dark:text-emerald-400 hover:underline"
                      >
                        <ExternalLink className="size-3.5 shrink-0" />
                        Ver documento actual
                      </a>
                    ) : null}
                    {(fileUrl || pendingFile) ? (
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleRemoveDocumentAttachment(index)}
                          className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:underline dark:text-red-400"
                        >
                          <Trash2 className="size-3.5" />
                          Quitar adjunto
                        </button>
                      </div>
                    ) : null}
                  </div>
                  {errors.documents?.[index]?.fileUrl && (
                    <p className="text-xs text-red-500">{errors.documents[index]?.fileUrl?.message}</p>
                  )}
                </div>
              </div>
            )
          })}
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

  const baseSteps: WizardStep[] = [
    { id: '1', title: 'Generales', content: step1Content },
    { id: '2', title: 'Identificación', content: step2Content },
    { id: '3', title: 'Asignación', content: step3Content },
  ]

  if (isSelectedOperator) {
    baseSteps.push({ id: '4', title: 'Credenciales', content: step4OperatorContent })
  }

  baseSteps.push({ id: '5', title: 'Documentación', content: stepDocumentsContent })
  baseSteps.push({ id: '6', title: 'Salud / Emerg.', content: stepHealthContent })
  baseSteps.push({ id: '7', title: 'Resumen', content: stepSummaryContent })

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
          onStepSelect={setActiveStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
