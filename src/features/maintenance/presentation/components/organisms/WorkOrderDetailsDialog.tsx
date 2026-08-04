'use client'

import React from 'react'
import { X, Wrench, Clock, PenTool, Hash, AlertTriangle, Layers, User, Calendar, FileText, DollarSign } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import type { WorkshopWorkOrderReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface WorkOrderDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  workOrder: WorkshopWorkOrderReplicaEntity | null
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

export function WorkOrderDetailsDialog({ isOpen, onClose, workOrder }: WorkOrderDetailsDialogProps) {
  if (!workOrder) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <PenTool className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight font-mono">
                  {workOrder.workOrderFolio}
                </h2>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {workOrder.status === 'open' ? 'Abierta' : 'Cerrada'}
                </Badge>
              </div>
              <p className="text-sm text-white/80 mt-0.5">
                Estancia: {workOrder.stayFolio}
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
          <SectionTitle title="Fechas y Tiempos" icon={Clock} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem icon={Calendar} label="Inicio del Trabajo" value={dateFmt.format(new Date(workOrder.startedAt))} />
            <DetailItem icon={Calendar} label="Fin del Trabajo" value={workOrder.finishedAt ? dateFmt.format(new Date(workOrder.finishedAt)) : null} />
            <DetailItem icon={Clock} label="Días en Trabajo" value={workOrder.daysInWork !== null ? `${workOrder.daysInWork} días` : null} />
          </div>
        </section>

        <Separator className="bg-stone-100 dark:bg-zinc-800" />

        <section>
          <SectionTitle title="Detalles del Trabajo" icon={Wrench} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DetailItem icon={Layers} label="Tipo de Mantenimiento" value={workOrder.maintenanceTypeName} />
            <DetailItem icon={Wrench} label="Categoría Mecánica" value={workOrder.mechanicalCategoryName} />
            <DetailItem icon={AlertTriangle} label="Falla o Problema" value={workOrder.failureLocation} />
            <DetailItem icon={Hash} label="No. Económico / Placas" value={workOrder.unitEconomicNumber ? `${workOrder.unitEconomicNumber} ${workOrder.unitPlates ? `(${workOrder.unitPlates})` : ''}` : null} />
            <DetailItem icon={FileText} label="Descripción" value={workOrder.description} className="md:col-span-2" />
          </div>
        </section>

        <Separator className="bg-stone-100 dark:bg-zinc-800" />

        <section>
          <SectionTitle title="Personal y Costos" icon={User} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem icon={User} label="Especialista" value={workOrder.specialistEmployeeName} />
            <DetailItem icon={User} label="Supervisor" value={workOrder.supervisorProfileName} />
            <DetailItem icon={DollarSign} label="Costo Total" value={money.format(workOrder.totalCost)} />
          </div>
        </section>
      </div>
    </Dialog>
  )
}
