'use client'

/**
 * @fileoverview Formulario simplificado para registrar gastos de viaje
 * durante un ajuste de cuentas por operador.
 *
 * Categorías predefinidas: Casetas, Fitosanitarias, Tránsito, Diesel, Otros.
 * Siempre vincula al settlement_id; opcionalmente al trip_id.
 *
 * @organism
 */

import React, { useEffect, useMemo, useState } from 'react'
import { ArrowRight, X, CheckCircle2, Loader2, Link2, AlertCircle, Ticket, Leaf, Siren, Fuel, Package } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Label } from '@/src/core/presentation/components/ui/label'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useExpenseCatalogs, useExpenseSubcategories } from '@/src/features/expenses/presentation/hooks/use-expense-catalogs'
import { useCreateExpense } from '@/src/features/expenses/presentation/hooks/use-expenses'
import { toast } from 'sonner'
import type { CreateExpenseInput } from '@/src/features/expenses/domain/schemas/create-expense.schema'

// ── Tipos de gasto del formato de cuentas de Brito ──────────────────────────

const TRIP_EXPENSE_TYPES = [
  {
    key: 'casetas',
    label: 'Casetas',
    icon: Ticket,
    preferredCategoryNames: ['Impuestos_permisos'],
    preferredSubcategoryNames: ['Casetas'],
    categoryKeywords: ['impuestos_permisos', 'impuestos', 'permisos', 'caseta', 'peaje'],
    subcategoryKeywords: ['caseta', 'peaje'],
  },
  {
    key: 'fitosanitarias',
    label: 'Fitosanitarias',
    icon: Leaf,
    preferredCategoryNames: ['Impuestos_permisos'],
    preferredSubcategoryNames: ['Fitosanitarias'],
    categoryKeywords: ['impuestos_permisos', 'impuestos', 'permisos', 'fitosanitari'],
    subcategoryKeywords: ['fito', 'sanitari'],
  },
  {
    key: 'transito',
    label: 'Tránsito',
    icon: Siren,
    preferredCategoryNames: ['Impuestos_permisos'],
    preferredSubcategoryNames: ['Tránsito'],
    categoryKeywords: ['impuestos_permisos', 'impuestos', 'permisos', 'transito', 'multa'],
    subcategoryKeywords: ['transito', 'multa', 'infraccion'],
  },
  {
    key: 'diesel',
    label: 'Diesel',
    icon: Fuel,
    preferredCategoryNames: ['Combustible'],
    preferredSubcategoryNames: ['Diesel'],
    categoryKeywords: ['combustible', 'diesel'],
    subcategoryKeywords: ['diesel', 'combustible'],
  },
  {
    key: 'otros',
    label: 'Otros',
    icon: Package,
    preferredCategoryNames: ['Otros', 'Imprevistos'],
    preferredSubcategoryNames: ['Otro'],
    categoryKeywords: ['otros', 'imprevistos'],
    subcategoryKeywords: ['otro', 'varios', 'general', 'gasto', 'talacha', 'servicio'],
  },
] as const

type TripExpenseTypeKey = typeof TRIP_EXPENSE_TYPES[number]['key']

// ── Helpers ──────────────────────────────────────────────────────────────────

function normalize(str: string) {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function matchCategory(catName: string, catDesc: string | null, keywords: readonly string[]) {
  const n = normalize(catName)
  const d = catDesc ? normalize(catDesc) : ''
  return keywords.some(kw => {
    const nKw = normalize(kw)
    return n.includes(nKw) || d.includes(nKw)
  })
}

function matchPreferredName(name: string, preferredNames: readonly string[]) {
  const normalizedName = normalize(name)
  return preferredNames.some((preferred) => normalizedName === normalize(preferred))
}

// ── Colors ───────────────────────────────────────────────────────────────────

const TYPE_RING: Record<TripExpenseTypeKey, string> = {
  casetas:       'border-blue-500 bg-blue-500 text-white',
  fitosanitarias:'border-emerald-600 bg-emerald-600 text-white',
  transito:      'border-amber-500 bg-amber-500 text-white',
  diesel:        'border-orange-500 bg-orange-500 text-white',
  otros:         'border-stone-600 bg-stone-600 text-white',
}
const TYPE_IDLE: Record<TripExpenseTypeKey, string> = {
  casetas:       'border-blue-200 bg-blue-50/60 text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
  fitosanitarias:'border-emerald-200 bg-emerald-50/60 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-300',
  transito:      'border-amber-200 bg-amber-50/60 text-amber-700 dark:border-amber-800 dark:bg-amber-900/20 dark:text-amber-300',
  diesel:        'border-orange-200 bg-orange-50/60 text-orange-700 dark:border-orange-800 dark:bg-orange-900/20 dark:text-orange-300',
  otros:         'border-stone-200 bg-stone-50/60 text-stone-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300',
}

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' })

// ── Props ─────────────────────────────────────────────────────────────────────

interface TripExpenseEntryFormProps {
  /** ID del ajuste de cuentas del operador (opcional si es directo al viaje) */
  settlementId?: string | null
  /** ID del viaje — si se provee y el usuario activa el toggle, se vinculará */
  tripId?: string | null
  /** Folio del viaje para mostrarlo en UI */
  tripFolio?: string | null
  /** Callback al guardar exitosamente */
  onSaved?: () => void
  /** Callback para cancelar / cerrar el formulario */
  onCancel?: () => void
  /** Si el ajuste está cerrado, el form es de solo lectura */
  readOnly?: boolean
}

// ── Componente ────────────────────────────────────────────────────────────────

export function TripExpenseEntryForm({
  settlementId,
  tripId,
  tripFolio,
  onSaved,
  onCancel,
  readOnly = false,
}: TripExpenseEntryFormProps) {
  const { data: catalogs, isLoading: loadingCatalogs } = useExpenseCatalogs()
  const createExpense = useCreateExpense()

  // ── Estado local del formulario ──────────────────────────────────────────
  const [expenseType, setExpenseType] = useState<TripExpenseTypeKey>('casetas')
  const [description, setDescription] = useState('')
  const [expenseDate, setExpenseDate] = useState(new Date().toISOString().slice(0, 10))
  const [amount, setAmount] = useState<string>('')
  const [liters, setLiters] = useState<string>('')
  const [pricePerLiter, setPricePerLiter] = useState<string>('')
  const [selectedOtherCategoryId, setSelectedOtherCategoryId] = useState<string>('')
  const [selectedOtherSubcategoryId, setSelectedOtherSubcategoryId] = useState<string>('')
  // Si no hay settlementId, siempre lo vinculamos al viaje, no necesitamos el toggle
  const [linkToTrip, setLinkToTrip] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isDiesel = expenseType === 'diesel'
  const isOtherExpense = expenseType === 'otros'

  // ── Resolver categoryId ───────────────────────────────────────────────────
  const automaticCategoryId = useMemo(() => {
    if (!catalogs) return null
    const typeConfig = TRIP_EXPENSE_TYPES.find(t => t.key === expenseType)
    if (!typeConfig) return null
    const exactMatch = catalogs.categories.find(c =>
      matchPreferredName(c.name, typeConfig.preferredCategoryNames)
    )
    const matched = catalogs.categories.find(c =>
      matchCategory(c.name, c.description, typeConfig.categoryKeywords)
    )
    // Fallback: si no matchea, usar la primera categoría disponible para evitar null
    return exactMatch?.id ?? matched?.id ?? catalogs.categories[0]?.id ?? null
  }, [catalogs, expenseType])

  const categoryId = isOtherExpense ? (selectedOtherCategoryId || null) : automaticCategoryId

  const { data: subcategories = [], isLoading: loadingSubs } = useExpenseSubcategories(categoryId)

  // ── Resolver subcategoryId (primera que matchee, o la primera disponible) ─
  const automaticSubcategoryId = useMemo(() => {
    if (subcategories.length === 0) return null
    const typeConfig = TRIP_EXPENSE_TYPES.find(t => t.key === expenseType)
    if (!typeConfig) return subcategories[0]?.id ?? null
    const exactMatch = subcategories.find(s =>
      matchPreferredName(s.name, typeConfig.preferredSubcategoryNames)
    )
    const matched = subcategories.find(s =>
      matchCategory(s.name, null, typeConfig.subcategoryKeywords)
    )
    return exactMatch?.id ?? matched?.id ?? subcategories[0]?.id ?? null
  }, [subcategories, expenseType])

  const subcategoryId = isOtherExpense ? (selectedOtherSubcategoryId || null) : automaticSubcategoryId

  // ── Resolver unitId ───────────────────────────────────────────────────────
  const unitId = useMemo(() => {
    if (!catalogs) return null
    if (isDiesel) {
      return catalogs.measurementUnits.find(u => normalize(u.name).startsWith('litro'))?.id ?? null
    }
    const pref = ['servicio', 'pieza', 'unidad', 'vez', 'evento']
    for (const p of pref) {
      const found = catalogs.measurementUnits.find(u => normalize(u.name).startsWith(p))
      if (found) return found.id
    }
    return catalogs.measurementUnits[0]?.id ?? null
  }, [catalogs, isDiesel])

  // ── Auto-calcular monto para diesel ──────────────────────────────────────
  useEffect(() => {
    if (isDiesel) {
      const l = parseFloat(liters)
      const p = parseFloat(pricePerLiter)
      if (l > 0 && p > 0) {
        setAmount((l * p).toFixed(2))
      }
    }
  }, [liters, pricePerLiter, isDiesel])

  // ── Reset al cambiar tipo ─────────────────────────────────────────────────
  useEffect(() => {
    setErrors({})
    if (!isDiesel) {
      setLiters('')
      setPricePerLiter('')
    }
    if (!isOtherExpense) {
      setSelectedOtherCategoryId('')
      setSelectedOtherSubcategoryId('')
    }
  }, [expenseType, isDiesel, isOtherExpense])

  useEffect(() => {
    if (!isOtherExpense) return
    setSelectedOtherSubcategoryId('')
  }, [selectedOtherCategoryId, isOtherExpense])

  // ── Validación ────────────────────────────────────────────────────────────
  const validate = () => {
    const errs: Record<string, string> = {}
    if (!description.trim()) errs.description = 'Ingresa una descripción'
    if (!expenseDate) errs.expenseDate = 'Fecha requerida'
    const amountNum = parseFloat(amount)
    if (!amount || isNaN(amountNum) || amountNum <= 0) errs.amount = 'El monto debe ser mayor a 0'
    if (isDiesel) {
      const l = parseFloat(liters)
      const p = parseFloat(pricePerLiter)
      if (!liters || isNaN(l) || l <= 0) errs.liters = 'Ingresa los litros'
      if (!pricePerLiter || isNaN(p) || p <= 0) errs.pricePerLiter = 'Ingresa el precio por litro'
    }
    if (!categoryId) {
      errs.category = isOtherExpense
        ? 'Selecciona una categoría'
        : 'Categoría no disponible. Recarga la página.'
    }
    if (!subcategoryId) {
      errs.subcategory = isOtherExpense
        ? 'Selecciona una subcategoría'
        : 'Subcategoría no disponible. Recarga la página.'
    }
    if (!unitId) errs.unit = 'Unidad de medida no disponible. Recarga la página.'
    return errs
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (readOnly) return

    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    setIsSubmitting(true)
    setErrors({})

    const amountNum = parseFloat(amount)
    const quantity = isDiesel ? (parseFloat(liters) || 1) : 1
    const unitPrice = isDiesel ? (parseFloat(pricePerLiter) || amountNum) : amountNum
    const frequency = ['casetas', 'diesel', 'fitosanitarias'].includes(expenseType)
      ? 'recurrente'
      : 'extraordinario'

    const input: CreateExpenseInput = {
      categoryId: categoryId!,
      subcategoryId: subcategoryId!,
      description: description.trim(),
      unitPrice,
      quantity,
      unitId: unitId!,
      amount: amountNum,
      frequency,
      cargoTypeId: null,
      comments: null,
      expenseDate,
      receiptUrl: null,
      settlementId: settlementId ?? null,
      tripId: (linkToTrip && tripId) ? tripId : null,
      truckId: null,
      trailerId: null,
    }

    try {
      await createExpense.mutateAsync(input)
      toast.success(`Gasto de ${TRIP_EXPENSE_TYPES.find(t => t.key === expenseType)?.label} registrado`)
      // Reset form
      setDescription('')
      setAmount('')
      setLiters('')
      setPricePerLiter('')
      setExpenseDate(new Date().toISOString().slice(0, 10))
      onSaved?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al registrar el gasto')
    } finally {
      setIsSubmitting(false)
    }
  }

  // ── Estilos ───────────────────────────────────────────────────────────────
  const inputClass = cn(
    'h-10 w-full rounded-xl border border-stone-200 dark:border-zinc-700',
    'bg-white dark:bg-zinc-800 px-3 text-sm text-stone-900 dark:text-zinc-100',
    'placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/20 transition-colors',
    'disabled:opacity-50 disabled:cursor-not-allowed'
  )
  const errClass = 'text-[11px] text-red-500 mt-0.5'

  if (loadingCatalogs) {
    return (
      <div className="flex items-center justify-center gap-2 py-6 text-stone-500 dark:text-zinc-500">
        <Loader2 className="size-4 animate-spin" />
        <span className="text-sm">Cargando catálogos…</span>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* Errores globales (categoria/unidad no disponibles) */}
      {(errors.category || errors.subcategory || errors.unit) && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <AlertCircle className="size-4 text-red-500 mt-0.5 shrink-0" />
          <p className="text-xs text-red-700 dark:text-red-300">
            {errors.category ?? errors.subcategory ?? errors.unit}
          </p>
        </div>
      )}

      {/* Tipo de gasto */}
      <div>
        <Label className="text-xs font-semibold text-stone-600 dark:text-zinc-400 mb-2 block">
          Tipo de gasto
        </Label>
        <div className="grid grid-cols-5 gap-1.5">
          {TRIP_EXPENSE_TYPES.map(({ key, label, icon: Icon }) => {
            const isSelected = expenseType === key
            return (
              <button
                key={key}
                type="button"
                disabled={readOnly}
                onClick={() => setExpenseType(key)}
                className={cn(
                  'flex flex-col items-center gap-1 p-2 rounded-xl border text-xs font-medium transition-all duration-150',
                  'hover:opacity-90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
                  isSelected ? TYPE_RING[key] : TYPE_IDLE[key]
                )}
              >
                <Icon className="size-5 mb-0.5" />
                <span className="leading-tight text-center text-[10px]">{label}</span>
              </button>
            )
          })}
        </div>
        {loadingSubs && (
          <p className="text-[10px] text-stone-400 mt-1 flex items-center gap-1">
            <Loader2 className="size-2.5 animate-spin" /> Cargando subcategorías…
          </p>
        )}
      </div>

      {/* Descripción */}
      <div className="grid gap-1">
        <Label htmlFor="tef-desc" className="text-xs">
          {isDiesel ? 'Descripción / Folio de ticket' : 'Descripción del gasto'}
        </Label>
        <input
          id="tef-desc"
          disabled={readOnly}
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder={
            isDiesel         ? 'Ej. Carga diesel PEMEX km 120' :
            expenseType === 'casetas'       ? 'Ej. Caseta Saltillo-MTY' :
            expenseType === 'fitosanitarias'? 'Ej. Permiso fitosanitario Nogales' :
            expenseType === 'transito'      ? 'Ej. Multa tránsito federal' :
                                              'Ej. Talacha llanta, hospedaje...'
          }
          className={cn(inputClass, errors.description && 'border-red-400 focus:ring-red-400/20')}
        />
        {errors.description && <p className={errClass}>{errors.description}</p>}
      </div>

      {isOtherExpense && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label htmlFor="tef-other-category" className="text-xs">Categoría</Label>
            <select
              id="tef-other-category"
              disabled={readOnly || !catalogs}
              value={selectedOtherCategoryId}
              onChange={(e) => {
                setSelectedOtherCategoryId(e.target.value)
                setSelectedOtherSubcategoryId('')
              }}
              className={cn(inputClass, errors.category && 'border-red-400')}
            >
              <option value="">Selecciona una categoría</option>
              {(catalogs?.categories ?? []).map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
            {errors.category && <p className={errClass}>{errors.category}</p>}
          </div>

          <div className="grid gap-1">
            <Label htmlFor="tef-other-subcategory" className="text-xs">Subcategoría</Label>
            <select
              id="tef-other-subcategory"
              disabled={readOnly || !selectedOtherCategoryId || loadingSubs}
              value={selectedOtherSubcategoryId}
              onChange={(e) => setSelectedOtherSubcategoryId(e.target.value)}
              className={cn(inputClass, errors.subcategory && 'border-red-400')}
            >
              <option value="">
                {selectedOtherCategoryId ? 'Selecciona una subcategoría' : 'Primero selecciona una categoría'}
              </option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            {errors.subcategory && <p className={errClass}>{errors.subcategory}</p>}
          </div>
        </div>
      )}

      {/* Diesel: litros y precio/litro */}
      {isDiesel && (
        <div className="grid grid-cols-2 gap-3">
          <div className="grid gap-1">
            <Label htmlFor="tef-liters" className="text-xs">Litros cargados</Label>
            <input
              id="tef-liters"
              type="number"
              step="0.01"
              placeholder="Litros"
              disabled={readOnly}
              value={liters}
              onChange={e => setLiters(e.target.value)}
              className={cn(inputClass, errors.liters && 'border-red-400')}
            />
            {errors.liters && <p className={errClass}>{errors.liters}</p>}
          </div>
          <div className="grid gap-1">
            <Label htmlFor="tef-ppl" className="text-xs">Precio por litro ($)</Label>
            <input
              id="tef-ppl"
              type="number"
              step="0.001"
              placeholder="$/L"
              disabled={readOnly}
              value={pricePerLiter}
              onChange={e => setPricePerLiter(e.target.value)}
              className={cn(inputClass, errors.pricePerLiter && 'border-red-400')}
            />
            {errors.pricePerLiter && <p className={errClass}>{errors.pricePerLiter}</p>}
          </div>
        </div>
      )}

      {/* Fecha y Monto */}
      <div className="grid grid-cols-2 gap-3">
        <div className="grid gap-1">
          <Label htmlFor="tef-date" className="text-xs">Fecha del gasto</Label>
          <input
            id="tef-date"
            type="date"
            disabled={readOnly}
            value={expenseDate}
            onChange={e => setExpenseDate(e.target.value)}
            className={cn(inputClass, errors.expenseDate && 'border-red-400')}
          />
          {errors.expenseDate && <p className={errClass}>{errors.expenseDate}</p>}
        </div>
        <div className="grid gap-1">
          <Label htmlFor="tef-amount" className="text-xs">
            {isDiesel ? 'Total calculado ($)' : 'Monto ($)'}
          </Label>
          <input
            id="tef-amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            disabled={readOnly || isDiesel}
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className={cn(
              inputClass,
              errors.amount && 'border-red-400',
              isDiesel && 'bg-stone-50 dark:bg-zinc-900 font-semibold text-[#1a5c3a] dark:text-emerald-400'
            )}
          />
          {errors.amount && <p className={errClass}>{errors.amount}</p>}
          {isDiesel && parseFloat(liters) > 0 && parseFloat(pricePerLiter) > 0 && (
            <p className="text-[10px] text-stone-400">
              {liters}L × {money.format(parseFloat(pricePerLiter))}/L = {money.format(parseFloat(amount) || 0)}
            </p>
          )}
        </div>
      </div>

      {/* Toggle: vincular al viaje (solo si hay tripId y settlementId, si falta settlementId siempre se vincula al viaje) */}
      {tripId && settlementId && (
        <button
          type="button"
          disabled={readOnly}
          onClick={() => setLinkToTrip(v => !v)}
          className={cn(
            'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors',
            linkToTrip
              ? 'border-[#1a5c3a]/30 bg-[#1a5c3a]/5 dark:border-emerald-800 dark:bg-emerald-900/10'
              : 'border-stone-200 dark:border-zinc-700 bg-stone-50/60 dark:bg-zinc-900',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
        >
          <div className={cn(
            'h-5 w-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors',
            linkToTrip
              ? 'border-[#1a5c3a] bg-[#1a5c3a] dark:border-emerald-500 dark:bg-emerald-500'
              : 'border-stone-300 dark:border-zinc-600 bg-white dark:bg-zinc-800'
          )}>
            {linkToTrip && <CheckCircle2 className="size-3 text-white" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-stone-900 dark:text-zinc-100 flex items-center gap-1">
              <Link2 className="size-3 text-[#1a5c3a] dark:text-emerald-400 shrink-0" />
              Vincular al viaje
              {tripFolio && (
                <span className="font-bold text-[#1a5c3a] dark:text-emerald-400 ml-0.5">{tripFolio}</span>
              )}
            </p>
            <p className="text-[10px] text-stone-500 dark:text-zinc-500 mt-0.5">
              {linkToTrip
                ? 'El gasto quedará asociado al viaje y al ajuste de cuentas'
                : 'El gasto sólo se vinculará al ajuste general del operador'}
            </p>
          </div>
        </button>
      )}

      {/* Botones */}
      {!readOnly && (
        <div className="flex gap-2 pt-1">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-xl gap-1 text-xs px-4"
              onClick={onCancel}
              disabled={isSubmitting || createExpense.isPending}
            >
              <X className="size-3" />
              Cancelar
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            className="rounded-xl flex-1 gap-1.5 text-xs bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white dark:bg-primary-container dark:text-zinc-950"
            disabled={isSubmitting || createExpense.isPending || loadingSubs}
          >
            {(isSubmitting || createExpense.isPending) ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <ArrowRight className="size-3" />
            )}
            Registrar gasto
          </Button>
        </div>
      )}
    </form>
  )
}
