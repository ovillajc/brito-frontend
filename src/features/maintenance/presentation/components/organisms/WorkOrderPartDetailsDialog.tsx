'use client'

import React from 'react'
import { X, Settings, Calendar, DollarSign, PenTool, Hash, Info, MapPin, Package, Building2 } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import type { WorkOrderPartReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface WorkOrderPartDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  part: WorkOrderPartReplicaEntity | null
}

function DetailItem({ icon: Icon, label, value, className = '' }: { icon: React.ElementType, label: string, value: React.ReactNode, className?: string }) {
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

export function WorkOrderPartDetailsDialog({ isOpen, onClose, part }: WorkOrderPartDetailsDialogProps) {
  if (!part) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Settings className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight font-mono">
                  {part.description}
                </h2>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {part.paidBy || 'Por definir'}
                </Badge>
              </div>
              <p className="text-sm text-white/80 mt-0.5 font-mono">
                Estancia: {part.stayFolio} / Trabajo: {part.workOrderFolio}
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
      </div>

      <div className="bg-white dark:bg-zinc-900 p-8 space-y-8 max-h-[70vh] overflow-y-auto">
        <section>
          <SectionTitle title="Detalles del Concepto" icon={Package} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem icon={Info} label="Descripción de Pieza" value={part.description} className="md:col-span-2" />
            <DetailItem icon={Building2} label="Proveedor" value={part.providerName} />
            <DetailItem icon={Package} label="Marca" value={part.brand} />
          </div>
        </section>

        <Separator className="bg-stone-100 dark:bg-zinc-800" />

        <section>
          <SectionTitle title="Costos y Cantidades" icon={DollarSign} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <DetailItem icon={Hash} label="Cantidad" value={`${part.quantity} ${part.unitName || 'und'}`} />
            <DetailItem icon={DollarSign} label="Precio Unitario" value={money.format(part.unitPrice)} />
            <DetailItem icon={DollarSign} label="Descuento" value={part.discount ? `${part.discount}%` : '0%'} />
            <DetailItem icon={DollarSign} label="Importe Total" value={<span className="text-[#006d37] dark:text-[#1a5c3a]">{money.format(part.totalWithTax)}</span>} />
          </div>
        </section>

        <Separator className="bg-stone-100 dark:bg-zinc-800" />

        <section>
          <SectionTitle title="Información Adicional" icon={MapPin} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem icon={Hash} label="No. Económico / Placas" value={part.unitEconomicNumber ? `${part.unitEconomicNumber} ${part.unitPlates ? `(${part.unitPlates})` : ''}` : null} />
            <DetailItem icon={PenTool} label="Tipo de Mantenimiento" value={part.maintenanceTypeName} />
            <DetailItem icon={Calendar} label="Fecha de Ingreso (Taller)" value={dateFmt.format(new Date(part.stayEnteredAt))} />
          </div>
        </section>
      </div>
    </Dialog>
  )
}
