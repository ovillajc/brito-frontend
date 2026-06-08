'use client'

/**
 * @fileoverview Wizard dinámico para registro de Gastos Operativos.
 * Recreado usando el patrón estándar de Wizards del sistema.
 *
 * @organism
 */

import { useEffect, useMemo, useState } from 'react'
import { useForm, type Resolver } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AnimatePresence } from 'framer-motion'
import { Receipt, ExternalLink, FileText } from 'lucide-react'
import { FileUploadButton } from '@/src/core/presentation/components/molecules/FileUploadButton'
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
import { useCreateExpense, useUpdateExpense } from '../../hooks/use-expenses'
import { useQueryClient } from '@tanstack/react-query'
import { useTripsList } from '@/src/features/trips/presentation/hooks/use-trips'
import { useOfflineForm } from '@/src/core/presentation/hooks/use-offline-form'
import { createExpenseAction } from '@/src/features/expenses/presentation/actions/expenses.actions'
import { useConnectivityStore } from '@/src/core/presentation/stores/use-connectivity-store'

// #region debug-point expense-create-missing-reporter
const __DBG_URL = process.env.NEXT_PUBLIC_DEBUG_SERVER_URL ?? ''
const __DBG_SESSION = process.env.NEXT_PUBLIC_DEBUG_SESSION_ID ?? ''
const __DBG_RUN_ID = process.env.NEXT_PUBLIC_DEBUG_RUN_ID ?? ''

async function dbgReport(event: string, data: Record<string, unknown> = {}) {
  if (!__DBG_URL || !__DBG_SESSION) return
  try {
    await fetch(__DBG_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ts: new Date().toISOString(),
        sessionId: __DBG_SESSION,
        runId: __DBG_RUN_ID || undefined,
        event,
        data,
      }),
      cache: 'no-store',
    })
  } catch {}
}
// #endregion debug-point expense-create-missing-reporter

// ── ReceiptPreview ───────────────────────────────────────────────────────────

/**
 * Muestra una previsualización inline del comprobante adjunto.
 * Detecta si es imagen (PNG, JPG, WEBP) o PDF y renderiza el componente adecuado.
 */
function ReceiptPreview({ url }: { url: string | null }) {
  if (!url) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg border border-dashed border-stone-200 dark:border-zinc-700 text-stone-400 dark:text-zinc-500 text-sm">
        <FileText className="size-4 shrink-0" />
        <span>Sin comprobante adjunto</span>
      </div>
    )
  }

  const isImage = /\.(png|jpe?g|webp)$/i.test(url)
  const isPdf   = /\.pdf$/i.test(url)

  return (
    <div className="flex flex-col gap-2">
      {isImage && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt="Comprobante del gasto"
          className="rounded-xl border border-stone-200 dark:border-zinc-700 max-h-56 object-contain bg-stone-50 dark:bg-zinc-900 w-full"
        />
      )}
      {isPdf && (
        <iframe
          src={url}
          title="Comprobante del gasto"
          className="w-full rounded-xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900"
          style={{ height: '220px' }}
        />
      )}
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-1.5 text-xs text-[#1a5c3a] dark:text-emerald-400 hover:underline"
      >
        <ExternalLink className="size-3.5 shrink-0" />
        Abrir documento en nueva pestaña
      </a>
    </div>
  )
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ExpenseWizardProps {
  isOpen: boolean
  onClose: () => void
  expenseRow?: ExpenseEntity
  defaultTripId?: string
  defaultSettlementId?: string
  mode?: 'create' | 'edit' | 'view'
}

type SubmissionStatus = 'idle' | 'success' | 'error'

// ── Componente ────────────────────────────────────────────────────────────────

export function ExpenseWizard({ isOpen, onClose, expenseRow, defaultTripId, defaultSettlementId, mode }: ExpenseWizardProps) {
  const [activeStep, setActiveStep] = useState(0)
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle')
  const [submissionError, setSubmissionError] = useState<string | null>(null)

  const resolvedMode: NonNullable<ExpenseWizardProps['mode']> = mode ?? (expenseRow ? 'edit' : 'create')
  const isEdit = resolvedMode === 'edit'
  const isReadOnly = resolvedMode === 'view'

  const { data: catalogs, isLoading: loadingCatalogs } = useExpenseCatalogs()
  const createExpense = useCreateExpense()
  const updateExpense = useUpdateExpense()
  const tripsQuery = useTripsList({ limit: 50 })
  const isOffline = useConnectivityStore((s) => s.status === 'offline')
  const isSubmitBlocked = useConnectivityStore((s) => s.isSubmitBlocked)
  const queryClient = useQueryClient()

  const { execute: executeOffline, isLoading: offlineLoading } = useOfflineForm<CreateExpenseInput, ExpenseEntity>({
    module: 'expenses',
    actionName: 'createExpenseAction',
    displayLabel: 'Gasto',
    onlineAction: createExpenseAction,
  })

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateExpenseInput>({
    resolver: zodResolver(createExpenseSchema) as unknown as Resolver<CreateExpenseInput>,
    defaultValues: {
      tripId: defaultTripId ?? null,
      truckId: null,
      trailerId: null,
      categoryId: '',
      subcategoryId: '',
      description: '',
      unitPrice: null,
      quantity: 1,
      unitId: null,
      amount: 0,
      frequency: null,
      cargoTypeId: null,
      comments: null,
      expenseDate: new Date().toISOString().slice(0, 10),
      receiptUrl: null,
      settlementId: defaultSettlementId ?? null,
    },
    mode: 'onSubmit',
  })

  const selectedCategoryId = watch('categoryId')
  const selectedSubcategoryId = watch('subcategoryId')
  const unitPrice = watch('unitPrice')
  const quantity = watch('quantity')

  const { data: subcategories = [], isLoading: loadingSubs } = useExpenseSubcategories(
    selectedCategoryId || null
  )

  const selectedSubcategoryName = useMemo(() => {
    if (!selectedSubcategoryId) return null
    return subcategories.find((s) => s.id === selectedSubcategoryId)?.name ?? null
  }, [selectedSubcategoryId, subcategories])

  const isDiesel = useMemo(() => {
    if (!selectedSubcategoryName) return false
    const normalized = selectedSubcategoryName
      .toLowerCase()
      .replaceAll('é', 'e')
      .replaceAll('í', 'i')
      .replaceAll('á', 'a')
      .replaceAll('ó', 'o')
      .replaceAll('ú', 'u')
    return normalized.includes('diesel')
  }, [selectedSubcategoryName])

  // Auto-calcular monto
  useEffect(() => {
    const p = Number(unitPrice)
    const q = Number(quantity)
    if (p > 0 && q > 0) {
      setValue('amount', parseFloat((p * q).toFixed(2)))
    }
  }, [unitPrice, quantity, setValue])

  // Validación Diesel -> Litros
  useEffect(() => {
    if (!isDiesel || isReadOnly) return
    const liters = (catalogs?.measurementUnits ?? []).find((u) => {
      const normalized = u.name
        .toLowerCase()
        .replaceAll('é', 'e')
        .replaceAll('í', 'i')
        .replaceAll('á', 'a')
        .replaceAll('ó', 'o')
        .replaceAll('ú', 'u')
      return normalized.startsWith('litro')
    })
    if (liters) setValue('unitId', liters.id)
  }, [isDiesel, catalogs?.measurementUnits, setValue])

  // Reset sub-categoría cuando cambia la categoría
  useEffect(() => {
    setValue('subcategoryId', '')
    setValue('unitId', null)
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
      if (defaultSettlementId) setValue('settlementId', defaultSettlementId)
    }
  }, [isOpen, expenseRow, reset, defaultTripId, defaultSettlementId, setValue])

  // Handlers
  const goNext = async () => {
    if (isReadOnly) {
      setActiveStep((p) => p + 1)
      return
    }
    const ok = await trigger(['categoryId', 'subcategoryId', 'expenseDate'])
    if (ok) setActiveStep((p) => p + 1)
  }

  const goBack = () => setActiveStep((p) => p - 1)

  const handleFinish = handleSubmit(async (data) => {
    try {
      if (isReadOnly) {
        handleClose()
        return
      }

      // #region debug-point expense-create-missing-submit
      void dbgReport('expenses.wizard.submit', {
        mode: resolvedMode,
        isOffline,
        isSubmitBlocked,
        hasReceiptUrl: !!data.receiptUrl,
        unitPrice: data.unitPrice,
        quantity: data.quantity,
        amount: data.amount,
        categoryId: data.categoryId,
        subcategoryId: data.subcategoryId,
        tripId: data.tripId,
      })
      // #endregion debug-point expense-create-missing-submit

      const amountFallback =
        data.unitPrice != null && data.quantity != null
          ? Number((data.unitPrice * data.quantity).toFixed(2))
          : data.amount
      const normalizedData = Number.isFinite(data.amount) && data.amount > 0
        ? data
        : { ...data, amount: amountFallback }

      if (isEdit && expenseRow) {
        // Edición siempre requiere red
        if (isOffline) {
          setSubmissionError('Editar registros requiere conexión a internet. Conéctate e inténtalo de nuevo.')
          setSubmissionStatus('error')
          return
        }
        await updateExpense.mutateAsync({ expenseId: expenseRow.id, input: normalizedData })
        setSubmissionError(null)
        setSubmissionStatus('success')
      } else {
        // Creación: soporta modo offline
        const displayData: Record<string, unknown> = {
          description: normalizedData.description,
          amount: normalizedData.amount,
          expenseDate: normalizedData.expenseDate,
          categoryId: normalizedData.categoryId,
          subcategoryId: normalizedData.subcategoryId,
        }
        const result = await executeOffline(normalizedData, displayData)
        // #region debug-point expense-create-missing-offline-result
        void dbgReport('expenses.wizard.executeOffline.result', {
          ok: result.ok,
          offline: !!result.offline,
          error: result.error ?? null,
        })
        // #endregion debug-point expense-create-missing-offline-result
        if (result.ok) {
          await queryClient.invalidateQueries({ queryKey: ['expenses'] })
          setSubmissionError(null)
          setSubmissionStatus('success')
        } else if (result.offline) {
          await queryClient.invalidateQueries({ queryKey: ['expenses'] })
          // Guardado localmente — cerrar el wizard
          handleClose()
        } else {
          setSubmissionError(result.error ?? 'No pudimos completar la operación en este momento.')
          setSubmissionStatus('error')
        }
      }
    } catch (e: unknown) {
      setSubmissionError(e instanceof Error ? e.message : 'Error inesperado al guardar el gasto')
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
        
        <div className="grid gap-2">
          <Label htmlFor="tripId">Viaje (Opcional)</Label>
          <select
            id="tripId"
            className={inputClass}
            disabled={tripsQuery.isLoading || isReadOnly}
            {...register('tripId', { setValueAs: (v) => v || null })}
          >
            <option value="">
              {tripsQuery.isLoading ? 'Cargando viajes...' : 'Sin viaje (Gasto general)'}
            </option>
            {(tripsQuery.data ?? []).map((t) => {
              const label = t.trip.tripNumber !== null
                ? `VJE-${String(t.trip.tripNumber).padStart(6, '0')}`
                : (t.trip.folio ?? t.trip.id)
              return (
                <option key={t.trip.id} value={t.trip.id}>
                  {label} — {t.trip.origin ?? '—'} → {t.trip.destination ?? '—'}
                </option>
              )
            })}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="categoryId">Categoría</Label>
            <select id="categoryId" className={inputClass} disabled={loadingCatalogs || isReadOnly} {...register('categoryId')}>
              <option value="">{loadingCatalogs ? 'Cargando...' : 'Selecciona categoría'}</option>
              {(catalogs?.categories ?? []).map(c => (
                <option key={c.id} value={c.id}>{c.name.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.categoryId && <p className={errorClass}>{errors.categoryId.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="subcategoryId">Detalle</Label>
            <select id="subcategoryId" className={inputClass} disabled={!selectedCategoryId || loadingSubs || isReadOnly} {...register('subcategoryId')}>
              <option value="">{!selectedCategoryId ? 'Primero selecciona categoría' : loadingSubs ? 'Cargando...' : 'Selecciona detalle'}</option>
              {subcategories.map(s => (
                <option key={s.id} value={s.id}>{s.name.replace(/_/g, ' ')}</option>
              ))}
            </select>
            {errors.subcategoryId && <p className={errorClass}>{errors.subcategoryId.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="expenseDate">Fecha</Label>
            <Input id="expenseDate" type="date" disabled={isReadOnly} {...register('expenseDate')} />
            {errors.expenseDate && <p className={errorClass}>{errors.expenseDate.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="frequency">Frecuencia</Label>
            <select id="frequency" className={inputClass} disabled={isReadOnly} {...register('frequency', { setValueAs: v => v || null })}>
              <option value="">Selecciona...</option>
              <option value={EXPENSE_FREQUENCY.Recurrent}>Recurrente</option>
              <option value={EXPENSE_FREQUENCY.Extraordinary}>Extraordinario</option>
            </select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="cargoTypeId">Tipo de carga (Opcional)</Label>
          <select id="cargoTypeId" className={inputClass} disabled={loadingCatalogs || isReadOnly} {...register('cargoTypeId', { setValueAs: v => v || null })}>
            <option value="">Selecciona...</option>
            {(catalogs?.cargoTypes ?? []).map(ct => (
              <option key={ct.id} value={ct.id}>{ct.name}</option>
            ))}
          </select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descripción (Opcional)</Label>
          <Input id="description" placeholder="Ej. Permiso Puerto" disabled={isReadOnly} {...register('description')} />
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
            <Input id="unitPrice" type="number" step="0.01" placeholder="0.00" disabled={isReadOnly} {...register('unitPrice', { setValueAs: v => v === '' ? null : Number(v) })} />
            {errors.unitPrice && <p className={errorClass}>{errors.unitPrice.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="quantity">Cantidad</Label>
            <Input id="quantity" type="number" step="0.01" placeholder="1" disabled={isReadOnly} {...register('quantity', { setValueAs: v => v === '' ? null : Number(v) })} />
            {errors.quantity && <p className={errorClass}>{errors.quantity.message}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unitId">U. de Medida</Label>
            <select id="unitId" className={inputClass} disabled={loadingCatalogs || isDiesel || isReadOnly} {...register('unitId', { setValueAs: v => v || null })}>
              <option value="">Selecciona...</option>
              {(catalogs?.measurementUnits ?? []).map(u => (
                <option key={u.id} value={u.id}>{u.name} {u.abbreviation ? `(${u.abbreviation})` : ''}</option>
              ))}
            </select>
            {errors.unitId && <p className={errorClass}>{errors.unitId.message}</p>}
          </div>
        </div>

        <div className="grid gap-2 relative">
          <Label htmlFor="amount">Monto total (MXN)</Label>
          <Input id="amount" type="number" step="0.01" placeholder="0.00" readOnly tabIndex={-1} {...register('amount', { valueAsNumber: true })} />
          {errors.amount && <p className={errorClass}>{errors.amount.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="receiptUrl">Ticket / Factura</Label>
          <input type="hidden" {...register('receiptUrl')} />
          {isReadOnly ? (
            // ── Modo Vista: Previsualización del comprobante ────────────────
            <ReceiptPreview url={watch('receiptUrl') ?? null} />
          ) : (
            // ── Modo Edición/Creación: Botón de carga ───────────────────────
            <div className="flex flex-col gap-2">
              <FileUploadButton
                folder="expenses/receipts"
                label="Adjuntar Ticket o Factura (PDF / Imagen)"
                currentUrl={watch('receiptUrl')}
                onUploadComplete={(url) => setValue('receiptUrl', url, { shouldValidate: true, shouldDirty: true })}
                disabled={isReadOnly || !(Number(unitPrice) > 0 && Number(quantity) > 0 && !!watch('unitId'))}
              />

              {watch('receiptUrl') ? (
                <button
                  type="button"
                  onClick={() => setValue('receiptUrl', null, { shouldValidate: true, shouldDirty: true })}
                  className="text-xs text-red-600 hover:underline self-start"
                >
                  Eliminar comprobante
                </button>
              ) : null}
            </div>
          )}
          {errors.receiptUrl && <p className={errorClass}>{errors.receiptUrl.message}</p>}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="comments">Comentarios</Label>
          <textarea 
            id="comments" 
            rows={3} 
            className={`${inputClass} h-auto py-3 resize-none`}
            disabled={isReadOnly}
            placeholder="Observaciones adicionales..."
            {...register('comments', {
              setValueAs: (v) => {
                if (typeof v !== 'string') return null
                const trimmed = v.trim()
                return trimmed === '' ? null : trimmed
              },
            })}
          />
        </div>

      </div>
      <WizardFooter
        isFirstStep={false}
        isLastStep
        onCancel={handleClose}
        onBack={goBack}
        onNext={isReadOnly ? handleClose : handleFinish}
        isSubmitting={createExpense.isPending || updateExpense.isPending || offlineLoading}
        isNextDisabled={isSubmitBlocked}
      />
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
          title={isReadOnly ? 'Detalles de Gasto' : isEdit ? 'Editar Gasto' : 'Registrar Nuevo Gasto'}
          description={isReadOnly ? 'Consulta la clasificación y los detalles económicos del gasto.' : isEdit ? `Editando detalles económicos` : 'Ingresa la clasificación y el monto del gasto'}
          icon={<Receipt className="size-5" />}
          steps={steps}
          activeStep={activeStep}
          size="lg"
        />
      )}
    </AnimatePresence>
  )
}
