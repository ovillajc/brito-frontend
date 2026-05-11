'use client'

/**
 * @fileoverview Dialog de detalles de una carga de diésel.
 * Muestra información completa del ticket, vehículo y viaje asociado.
 * 
 * @organism
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { X, Fuel, Truck, Calendar, User, FileText, Hash, MapPin, BarChart2 } from 'lucide-react'
import type { FuelLoadHistoryRowEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'

interface FuelLoadDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  loadRow: FuelLoadHistoryRowEntity | null
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

function formatMoney(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

export function FuelLoadDetailsDialog({ isOpen, onClose, loadRow }: FuelLoadDetailsDialogProps) {
  if (!loadRow) return null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
      {/* ── Gradient Header ── */}
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-8">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Fuel className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                  Ticket: {loadRow.ticketFolio ?? 'S/N'}
                </h2>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {loadRow.vehicleType === 'TRUCK' ? 'Motor' : 'Termo'}
                </Badge>
              </div>
              <p className="text-sm text-white/80 mt-0.5 font-mono">
                {loadRow.folio}
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

      <div className="bg-white dark:bg-zinc-900 p-8 space-y-8 max-h-[75vh] overflow-y-auto">
        <section>
          <SectionTitle title="Información de Carga" icon={Fuel} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem icon={Calendar} label="Fecha de Carga" value={loadRow.loadDate ? new Date(loadRow.loadDate).toLocaleString('es-MX') : null} />
            <DetailItem icon={Fuel} label="Litros Cargados" value={`${loadRow.litersLoaded.toLocaleString('es-MX')} L`} />
            <DetailItem icon={BarChart2} label="Odómetro / Horas" value={loadRow.odometerAtLoad?.toLocaleString('es-MX') ?? '—'} />
            <DetailItem icon={Hash} label="Precio por Litro" value={formatMoney(loadRow.pricePerLiter)} />
            <DetailItem icon={FileText} label="Costo Total" value={formatMoney(loadRow.totalCost)} />
            <DetailItem icon={MapPin} label="Origen de Combustible" value={loadRow.sourceType === 'INTERNAL_TANK' ? 'Tanque Base' : 'Externo'} />
          </div>
        </section>

        <Separator className="bg-stone-100 dark:bg-zinc-800" />

        <section>
          <SectionTitle title="Asignación y Viaje" icon={Truck} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetailItem icon={Truck} label="Unidad" value={loadRow.unitEconomicNumber} />
            <DetailItem icon={User} label="Operador" value={loadRow.operatorName} />
            <DetailItem icon={Hash} label="Folio Viaje" value={loadRow.folio} />
            <DetailItem icon={User} label="Cliente" value={loadRow.clientName} />
          </div>
        </section>

        {loadRow.isFullTankFill && (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-3">
            <div className="size-8 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
              <Fuel className="size-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">Tanque Lleno</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">Esta carga fue marcada como "tanque lleno", lo que la hace válida para cálculos de rendimiento real.</p>
            </div>
          </div>
        )}
      </div>
    </Dialog>
  )
}
