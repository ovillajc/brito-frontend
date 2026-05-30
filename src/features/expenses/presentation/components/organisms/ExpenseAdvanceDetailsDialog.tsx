'use client'

/**
 * @fileoverview Dialog de detalles de un Anticipo de Gastos (solo lectura).
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import { cn } from '@/src/core/infrastructure/utils/cn'
import {
  HandCoins,
  CreditCard,
  Banknote,
  Calendar,
  FileText,
  User,
  Truck,
  MapPin,
  Tag,
  Briefcase,
  X,
} from 'lucide-react'
import { ADVANCE_METHOD, type ExpenseAdvanceEntity } from '../../../domain/entities/expense-assignment-entity'

interface ExpenseAdvanceDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  advance: ExpenseAdvanceEntity | null
}

const METHOD_MAP: Record<string, { label: string; icon: React.ElementType }> = {
  [ADVANCE_METHOD.Cash]: { label: 'Efectivo', icon: Banknote },
  [ADVANCE_METHOD.Transfer]: { label: 'Transferencia', icon: CreditCard },
}

function DetailItem({
  icon: Icon,
  label,
  value,
  className = '',
}: {
  icon: React.ElementType
  label: string
  value: string | React.ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-stone-400 dark:text-zinc-500">
        <Icon className="size-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
        {value || <span className="text-stone-300 dark:text-zinc-600 font-normal italic text-xs">No registrado</span>}
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

/**
 * Dialog de solo lectura con los detalles completos de un anticipo de gastos.
 */
export function ExpenseAdvanceDetailsDialog({ isOpen, onClose, advance }: ExpenseAdvanceDetailsDialogProps) {
  if (!advance) return null

  const methodConfig = METHOD_MAP[advance.method] || METHOD_MAP[ADVANCE_METHOD.Cash]
  const MethodIcon = methodConfig.icon

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
      {/* ── Gradient Header ── */}
      <div className="bg-linear-to-br from-[#1a5c3a] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <HandCoins className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                {new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(advance.amount)}
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                {advance.operatorName || 'Operador Desconocido'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab selector bar */}
        <Tabs defaultValue="info" className="flex flex-col">
          <div className="px-8 pb-0">
            <TabsList className="bg-transparent gap-1 border-b border-white/10 w-full rounded-none pb-0">
              <TabsTrigger
                value="info"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
              >
                Información General
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white dark:bg-zinc-900 max-h-[68vh] overflow-y-auto">
            {/* ── Tab: Información General ── */}
            <TabsContent value="info" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Detalles del Pago" icon={Tag} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem 
                    icon={MethodIcon} 
                    label="Método" 
                    value={
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                        {methodConfig.label}
                      </Badge>
                    } 
                  />
                  <DetailItem 
                    icon={Calendar} 
                    label="Fecha de Asignación" 
                    value={new Date(advance.assignedAt).toLocaleDateString('es-MX')} 
                  />
                  <DetailItem 
                    icon={FileText} 
                    label="Notas" 
                    value={advance.notes} 
                  />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Detalles Operativos" icon={Briefcase} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={User} label="Operador" value={advance.operatorName} />
                  <DetailItem icon={MapPin} label="Viaje Vinculado" value={advance.tripFolio} />
                  <DetailItem icon={Truck} label="Unidad Asignada" value={advance.unitLabel} />
                </div>
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
