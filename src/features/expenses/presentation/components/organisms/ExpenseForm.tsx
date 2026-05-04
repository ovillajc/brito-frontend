'use client'

/**
 * @fileoverview Wizard dinámico para registro de Gastos Operativos.
 * Recreado usando el patrón estándar de Wizards del sistema.
 *
 * @organism
 */

import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence } from 'framer-motion'
import { Receipt } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { ActionFeedback } from '@/src/core/presentation/components/molecules/ActionFeedback'
import { Wizard, type WizardStep } from '@/src/core/presentation/components/organisms/wizard'
import { WizardFooter } from '@/src/core/presentation/components/molecules/wizard-footer'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import type { ExpenseEntity } from '../../../domain/entities/expense-entity'
import { EXPENSE_FREQUENCY } from '../../../domain/entities/expense-entity'
import { createExpenseSchema, type CreateExpenseInput } from '../../../domain/schemas/create-expense.schema'
import { useExpenseCatalogs, useExpenseSubcategories } from '../../hooks/use-expense-catalogs'
import { useCreateExpense } from '../../hooks/use-expenses'

// ── Props ─────────────────────────────────────────────────────────────────────

interface ExpenseWizardProps {
  isOpen: boolean
  onClose: () => void
  expenseRow?: ExpenseEntity
  defaultTripId?: string
}

type SubmissionStatus = 'idle' | 'success' | 'error'

// ── Componente ────────────────────────────────────────────────────────────────

export function ExpenseWizard({ isOpen, onClose, expenseRow, defaultTripId }: ExpenseWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const isEdit = !!expenseRow

  const { data: catalogs, isLoading: loadingCatalogs } = useExpenseCatalogs()
  const createExpense = useCreateExpense()

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema) as any,
    defaultValues: {
      tripId: defaultTripId ?? null,
      truckId: null,
      trailerId: null,
      categoryId: '',
      subcategoryId: '',
      description: '',
      unitPrice: null,
      quantity: null,
      unitId: null,
      amount: 0,
      frequency: null,
      cargoTypeId: null,
      comments: null,
      expenseDate: new Date().toISOString().slice(0, 10),
      receiptUrl: null,
    },
    mode: 'onSubmit',
  })

  const selectedCategoryId = watch('categoryId')
  const unitPrice = watch('unitPrice')
  const quantity = watch('quantity')

  const { data: subcategories = [], isLoading: loadingSubs } = useExpenseSubcategories(
    selectedCategoryId || null
  )

  // Auto-calcular monto
  useEffect(() => {
    const p = Number(unitPrice)
    const q = Number(quantity)
    if (p > 0 && q > 0) {
      setValue('amount', parseFloat((p * q).toFixed(2)))
    }
  }, [unitPrice, quantity, setValue])

  // Reset sub-categoría cuando cambia la categoría
  useEffect(() => {
    setValue('subcategoryId', '')
  }, [selectedCategoryId, setValue])

  // Pre-poblar al editar
  useEffect(() => {
    if (isOpen && expenseRow) {
      reset({
        tripId: expenseRow.tripId,
        truckId: expenseRow.truckId,
        trailerId: expenseRow.trailerId,
        categoryId: expenseRow.categoryId ?? '',
        subcategoryId: expenseRow.subcategoryId ?? '',
        description: expenseRow.description,
        unitPrice: expenseRow.unitPrice,
        quantity: expenseRow.quantity,
        unitId: expenseRow.unitId,
        amount: expenseRow.amount,
        frequency: expenseRow.frequency,
        cargoTypeId: expenseRow.cargoTypeId,
        comments: expenseRow.comments,
        expenseDate: expenseRow.expenseDate.toISOString().slice(0, 10),
        receiptUrl: expenseRow.receiptUrl,
      })
    } else if (isOpen && !expenseRow) {
      reset()
      if (defaultTripId) setValue('tripId', defaultTripId)
    }
  }, [isOpen, expenseRow, reset, defaultTripId, setValue])

  // Handlers
  const goNext = async () => {
    const ok = await trigger(['categoryId', 'subcategoryId', 'expenseDate', 'description'])
    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    try {
      // Por ahora asume que es create, la mutación subyacente de Supabase Action lo insertará
      await createExpense.mutateAsync(data)
      setSubmissionError(null)
      setSubmissionStatus('success')
    } catch (e: any) {
      setSubmissionError(e.message || 'Error inesperado al guardar el gasto')
      setSubmissionStatus('error')
    }
  })

  const handleClose = () => {
    setActiveStep(0)
    setSubmissionStatus('idle')
    setSubmissionError(null)
    onClose()
  }

  const handleReset = () => {
    setSubmissionStatus('idle')
    setActiveStep(0)
    setSubmissionError(null)
    if (!isEdit) reset()
  }

  // ── Contenido de los pasos ────────────────────────────────────────────────

  const inputClass = 'flex h-12 w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-4 py-2 text-sm text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors'
  const errorClass = 'text-xs text-red-500 mt-1'

  const step1 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="categoryId">Categoría</Label>
            <select id="categoryId" className={inputClass} disabled={loadingCatalogs} {...register('categoryId')}>
              <option value="">{loadingCatalogs ? 'Cargando...' : 'Selecciona categoría'}</option>
              {(catalogs?.categories ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subcategoryId">Detalle</Label>
            <select id="subcategoryId" className={inputClass} disabled={!selectedCategoryId || loadingSubs} {...register('subcategoryId')}>
              <option value="">{!selectedCategoryId ? 'Primero selecciona categoría' : loadingSubs ? 'Cargando...' : 'Selecciona detalle'}</option>
              {subcategories.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            {errors.subcategoryId && <p className={errorClass}>{errors.subcategoryId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="expenseDate">Fecha</Label>
            <Input id="expenseDate" type="date" {...register('expenseDate')} />
            {errors.expenseDate && <p className={errorClass}>{errors.expenseDate.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Frecuencia</Label>
            <select id="frequency" className={inputClass} {...register('frequency', { setValueAs: v => v || null })}>
              <option value="">Selecciona...</option>
              <option value={EXPENSE_FREQUENCY.Recurrent}>Recurrente</option>
              <option value={EXPENSE_FREQUENCY.Extraordinary}>Extraordinario</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cargoTypeId">Tipo de carga (Opcional)</Label>
          <select id="cargoTypeId" className={inputClass} disabled={loadingCatalogs} {...register('cargoTypeId', { setValueAs: v => v || null })}>
            <option value="">Selecciona...</option>
            {(catalogs?.cargoTypes ?? []).map(ct => (
              <option key={ct.id} value={ct.id}>{ct.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción</Label>
          <Input id="description" placeholder="Ej. Permiso Puerto" {...register('description')} />
          {errors.description && <p className={errorClass}>{errors.description.message}</p>}
        </div>

      </div>
      <WizardFooter isFirstStep isLastStep={false} onCancel={handleClose} onNext={goNext} />
    </div>
  )

  const step2 = (
    <div className="flex flex-col gap-6 pt-2">
      <div className="space-y-4">
        
        <div className="grid grid-cols-3 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="unitPrice">Precio Unitario</Label>
            <Input id="unitPrice" type="number" step="0.01" placeholder="0.00" {...register('unitPrice', { setValueAs: v => v === '' ? null : Number(v) })} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input id="quantity" type="number" step="0.01" placeholder="1" {...register('quantity', { setValueAs: v => v === '' ? null : Number(v) })} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unitId">U. de Medida</Label>
            <select id="unitId" className={inputClass} disabled={loadingCatalogs} {...register('unitId', { setValueAs: v => v || null })}>
              <option value="">Selecciona...</option>
              {(catalogs?.measurementUnits ?? []).map(u => (
                <option key={u.id} value={u.id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-2 relative">
          <Label htmlFor="amount">Monto total (MXN)</Label>
          <Input id="amount" type="number" step="0.01" placeholder="0.00" {...register('amount', { valueAsNumber: true })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="comments">Comentarios</Label>
          <textarea 
            id="comments" 
            rows={3} 
            className={`${inputClass} h-auto py-3 resize-none`}
            placeholder="Observaciones adicionales..."
            {...register('comments', { setValueAs: v => v.trim() === '' ? null : v.trim() })}
          />
        </div>

      </div>
      <WizardFooter isFirstStep={false} isLastStep onCancel={handleClose} onBack={goBack} onNext={handleFinish} isSubmitting={createExpense.isPending} />
    </div>
  )

  const steps: WizardStep[] = [
    { id: '1', title: 'Clasificación', content: step1 },
    { id: '2', title: 'Detalles Económicos', content: step2 },
  ]

  return (
    <AnimatePresence mode="wait">
      {submissionStatus !== 'idle' ? (
        <Dialog key="feedback" isOpen={isOpen} onClose={handleClose} size="md">
          <ActionFeedback
            status={submissionStatus}
            title={submissionStatus === 'success'
              ? (isEdit ? '¡Gasto Actualizado!' : '¡Gasto Registrado!')
              : 'Error al procesar'}
            message={submissionStatus === 'success'
              ? `El gasto ha sido ${isEdit ? 'actualizado' : 'registrado'} correctamente.`
              : (submissionError ?? 'No pudimos completar la operación en este momento.')}
            primaryActionLabel="Finalizar"
            onPrimaryAction={handleClose}
            secondaryActionLabel={submissionStatus === 'success' && !isEdit ? 'Crear otro' : undefined}
            onSecondaryAction={!isEdit ? handleReset : undefined}
          />
        </Dialog>
      ) : (
        <Wizard
          key="wizard"
          isOpen={isOpen}
          onClose={handleClose}
          title={isEdit ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          description={isEdit ? `Editando detalles económicos` : 'Ingresa la clasificación y el monto del gasto'}
          icon={<Receipt className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
