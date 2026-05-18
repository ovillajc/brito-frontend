'use client'

/**
 * @fileoverview Dialog de detalles completos de un Gasto.
 * Sigue el patrón idéntico a FuelMetricsDetailsDialog:
 * gradient header + tabs + DetailItem.
 *
 * Tabs:
 *   1. Detalles Económicos: monto, precio unitario, cantidad, unidad, frecuencia
 *   2. Clasificación: categoría, subcategoría, tipo de carga, viaje vinculado
 *   3. Comprobante: imagen/PDF del ticket o factura adjunto
 *
 * @organism
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { cn } from '@/src/core/infrastructure/utils/cn'
import {
  X, Receipt, DollarSign, Calendar, Tag, Layers,
  Hash, FileText, Truck, ExternalLink, Package,
} from 'lucide-react'
import type { ExpenseEntity } from '../../../domain/entities/expense-entity'
import { EXPENSE_FREQUENCY } from '../../../domain/entities/expense-entity'

// ── Props ──────────────────────────────────────────────────────────────────────

interface ExpenseDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  expense: ExpenseEntity | null
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function DetailItem({
  icon: Icon, label, value, className = '',
}: {
  icon: React.ElementType; label: string; value: React.ReactNode; className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-stone-400 dark:text-zinc-500">
        <Icon className="size-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
        {value ?? <span className="text-stone-300 dark:text-zinc-600 font-normal italic text-xs">No registrado</span>}
      </div>
    </div>
  )
}

function SectionTitle({ title, icon: Icon }: { title: string; icon: React.ElementType }) {
  return (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="size-8 rounded-lg bg-[#006d37]/8 dark:bg-[#1a5c3a]/20 flex items-center justify-center">
        <Icon className="size-4 text-[#006d37] dark:text-primary-container" />
      </div>
      <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-100 uppercase tracking-widest">{title}</h3>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 })
const shortDate = new Intl.DateTimeFormat('es-MX', { dateStyle: 'long' })

// ── Componente principal ──────────────────────────────────────────────────────

/**
 * Dialog de detalles completos de un Gasto.
 *
 * @param isOpen - Si el dialog está abierto.
 * @param onClose - Callback para cerrar el dialog.
 * @param expense - Entidad del gasto a mostrar.
 */
export function ExpenseDetailsDialog({ isOpen, onClose, expense }: ExpenseDetailsDialogProps) {
  if (!expense) return null

  const isImage = expense.receiptUrl ? /\.(png|jpe?g|webp)$/i.test(expense.receiptUrl) : false
  const isPdf   = expense.receiptUrl ? /\.pdf$/i.test(expense.receiptUrl) : false

  const frequencyLabel =
    expense.frequency === EXPENSE_FREQUENCY.Recurrent ? 'Recurrente'
    : expense.frequency === EXPENSE_FREQUENCY.Extraordinary ? 'Extraordinario'
    : null

  const categoryDisplay = expense.categoryName?.replace(/_/g, ' ') ?? null
  const subcategoryDisplay = expense.subcategoryName?.replace(/_/g, ' ') ?? null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>

      {/* ── Gradient Header ── */}
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">

        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Receipt className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                {expense.description}
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                {categoryDisplay ?? 'Sin categoría'}
                {subcategoryDisplay ? ` · ${subcategoryDisplay}` : ''}
              </p>
            </div>
          </div>
          <button
            type="button" onClick={onClose} aria-label="Cerrar"
            className="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="economico" className="flex flex-col">
          <div className="px-8 pb-0">
            <TabsList className="bg-transparent gap-1 border-b border-white/10 w-full rounded-none pb-0">
              {[
                { value: 'economico', label: 'Detalles Económicos' },
                { value: 'clasificacion', label: 'Clasificación' },
                { value: 'comprobante', label: 'Comprobante' },
              ].map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value}
                  className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
                >
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div className="bg-white dark:bg-zinc-900 max-h-[68vh] overflow-y-auto">

            {/* ── Tab 1: Detalles Económicos ── */}
            <TabsContent value="economico" className="p-8 space-y-8">

              {/* Monto principal */}
              <section>
                <SectionTitle title="Monto" icon={DollarSign} />
                <div className="flex items-center justify-center p-6 rounded-2xl bg-[#006d37]/5 dark:bg-[#1a5c3a]/10 border border-[#006d37]/10">
                  <span className="text-4xl font-extrabold text-[#006d37] dark:text-primary-container">
                    {money.format(expense.amount)}
                  </span>
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              {/* Desglose de precio */}
              <section>
                <SectionTitle title="Desglose" icon={Hash} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                    <DetailItem
                      icon={DollarSign}
                      label="Precio Unitario"
                      value={expense.unitPrice != null ? money.format(expense.unitPrice) : null}
                    />
                  </div>
                  <div className="flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                    <DetailItem
                      icon={Package}
                      label="Cantidad"
                      value={
                        expense.quantity != null
                          ? `${expense.quantity.toLocaleString('es-MX')}${expense.unitName ? ` ${expense.unitName}` : ''}`
                          : null
                      }
                    />
                  </div>
                  <div className="flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                    <DetailItem
                      icon={Calendar}
                      label="Fecha del Gasto"
                      value={shortDate.format(expense.expenseDate)}
                    />
                  </div>
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              {/* Frecuencia y comentarios */}
              <section>
                <SectionTitle title="Observaciones" icon={FileText} />
                <div className="grid grid-cols-1 gap-4">
                  {frequencyLabel && (
                    <DetailItem
                      icon={Hash}
                      label="Frecuencia"
                      value={
                        <Badge
                          variant={expense.frequency === EXPENSE_FREQUENCY.Recurrent ? 'secondary' : 'outline'}
                          className="capitalize"
                        >
                          {frequencyLabel}
                        </Badge>
                      }
                    />
                  )}
                  {expense.comments && (
                    <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">Comentarios</p>
                      <p className="text-sm text-stone-700 dark:text-zinc-300">{expense.comments}</p>
                    </div>
                  )}
                  {!frequencyLabel && !expense.comments && (
                    <p className="text-sm text-stone-400 dark:text-zinc-500 italic">Sin observaciones adicionales.</p>
                  )}
                </div>
              </section>

            </TabsContent>

            {/* ── Tab 2: Clasificación ── */}
            <TabsContent value="clasificacion" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Categoría" icon={Layers} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                    <DetailItem icon={Tag} label="Categoría" value={categoryDisplay} />
                  </div>
                  <div className="flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                    <DetailItem icon={Tag} label="Subcategoría / Detalle" value={subcategoryDisplay} />
                  </div>
                  {expense.cargoTypeName && (
                    <div className="md:col-span-2 flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                      <DetailItem icon={Package} label="Tipo de Carga" value={expense.cargoTypeName} />
                    </div>
                  )}
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Vinculación Operativa" icon={Truck} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className={cn(
                    'flex flex-col gap-4 p-4 rounded-xl border',
                    expense.tripId
                      ? 'bg-[#006d37]/5 border-[#006d37]/20 dark:bg-[#1a5c3a]/10'
                      : 'bg-stone-50 dark:bg-zinc-800/50 border-stone-100 dark:border-zinc-700'
                  )}>
                    <DetailItem
                      icon={FileText}
                      label="Viaje Vinculado"
                      value={expense.tripId
                        ? <span className="font-mono text-[#006d37] dark:text-primary-container">VJE-{expense.tripId.split('-')[0]}</span>
                        : <span className="text-stone-400 italic text-xs">Sin viaje asignado</span>
                      }
                    />
                  </div>
                  <div className={cn(
                    'flex flex-col gap-4 p-4 rounded-xl border',
                    expense.truckId
                      ? 'bg-[#006d37]/5 border-[#006d37]/20 dark:bg-[#1a5c3a]/10'
                      : 'bg-stone-50 dark:bg-zinc-800/50 border-stone-100 dark:border-zinc-700'
                  )}>
                    <DetailItem
                      icon={Truck}
                      label="Tractocamión"
                      value={expense.truckId
                        ? <span className="font-mono text-xs">{expense.truckId.split('-')[0]}…</span>
                        : <span className="text-stone-400 italic text-xs">Sin unidad asignada</span>
                      }
                    />
                  </div>
                  <div className={cn(
                    'flex flex-col gap-4 p-4 rounded-xl border',
                    expense.trailerId
                      ? 'bg-[#006d37]/5 border-[#006d37]/20 dark:bg-[#1a5c3a]/10'
                      : 'bg-stone-50 dark:bg-zinc-800/50 border-stone-100 dark:border-zinc-700'
                  )}>
                    <DetailItem
                      icon={Truck}
                      label="Remolque"
                      value={expense.trailerId
                        ? <span className="font-mono text-xs">{expense.trailerId.split('-')[0]}…</span>
                        : <span className="text-stone-400 italic text-xs">Sin remolque asignado</span>
                      }
                    />
                  </div>
                </div>
              </section>
            </TabsContent>

            {/* ── Tab 3: Comprobante ── */}
            <TabsContent value="comprobante" className="p-8">
              <SectionTitle title="Ticket / Factura" icon={Receipt} />

              {!expense.receiptUrl ? (
                <div className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-stone-200 dark:border-zinc-700 text-center">
                  <div className="size-14 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-3">
                    <FileText className="size-7 text-stone-300 dark:text-zinc-600" />
                  </div>
                  <p className="text-sm font-semibold text-stone-500 dark:text-zinc-400">Sin comprobante adjunto</p>
                  <p className="text-xs text-stone-400 dark:text-zinc-500 mt-1">
                    No se adjuntó ningún ticket o factura a este gasto.
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {isImage && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={expense.receiptUrl}
                      alt="Comprobante del gasto"
                      className="rounded-2xl border border-stone-200 dark:border-zinc-700 max-h-96 object-contain bg-stone-50 dark:bg-zinc-900 w-full"
                    />
                  )}
                  {isPdf && (
                    <iframe
                      src={expense.receiptUrl}
                      title="Comprobante del gasto"
                      className="w-full rounded-2xl border border-stone-200 dark:border-zinc-700 bg-stone-50 dark:bg-zinc-900"
                      style={{ height: '420px' }}
                    />
                  )}
                  {!isImage && !isPdf && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700">
                      <FileText className="size-5 text-stone-400 shrink-0" />
                      <span className="text-sm text-stone-600 dark:text-zinc-300 truncate">{expense.receiptUrl}</span>
                    </div>
                  )}
                  <a
                    href={expense.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-[#1a5c3a]/30 text-[#1a5c3a] dark:text-emerald-400 text-sm font-medium hover:bg-[#1a5c3a]/5 transition-colors"
                  >
                    <ExternalLink className="size-4" />
                    Abrir en nueva pestaña
                  </a>
                </div>
              )}
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
