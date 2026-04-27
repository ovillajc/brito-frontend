'use client'

/**
 * @fileoverview Dialog de detalles completos de un viaje con métricas de combustible.
 * Patrón idéntico a EmployeeDetailsDialog: gradient header + tabs + DetailItem.
 *
 * Tabs:
 *   1. Rendimientos: km, litros, rend. motor, remolques, ahorro/exceso, totales
 *   2. Datos del Viaje: unidad, operador, monitorista, estado, observaciones
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
  X, Fuel, Gauge, TrendingDown, TrendingUp, Truck,
  Hash, Calendar, User, MapPin, FileText, BarChart2,
} from 'lucide-react'
import type { TripFuelRowEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'

interface FuelMetricsDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  tripRow: TripFuelRowEntity | null
}

// ── Sub-componentes (espejo de EmployeeDetailsDialog) ─────────────────────────

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

function MetricBar({ real, theoretical, label }: { real: number | null; theoretical: number | null; label: string }) {
  if (real === null || theoretical === null || theoretical === 0) return null
  const pct = Math.min(100, (real / theoretical) * 100)
  const isOver = real > theoretical
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-stone-500 dark:text-zinc-400">{label}</span>
        <span className={cn('font-bold', isOver ? 'text-red-500' : 'text-emerald-600')}>
          {real.toFixed(1)} / {theoretical.toFixed(1)} L
        </span>
      </div>
      <div className="h-2 rounded-full bg-stone-100 dark:bg-zinc-800 overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', isOver ? 'bg-red-400' : 'bg-[#006d37]')}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

// ── Helpers de formato ─────────────────────────────────────────────────────────

const fmt = (n: number | null, unit = '') =>
  n !== null ? `${n.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}${unit ? ' ' + unit : ''}` : null

const fmtInt = (n: number | null, unit = '') =>
  n !== null ? `${n.toLocaleString('es-MX')}${unit ? ' ' + unit : ''}` : null

// ── Componente principal ──────────────────────────────────────────────────────

export function FuelMetricsDetailsDialog({ isOpen, onClose, tripRow }: FuelMetricsDetailsDialogProps) {
  if (!tripRow) return null

  const STATUS_MAP: Record<string, { label: string; className: string }> = {
    completed: { label: 'Completado', className: 'bg-[#1a5c3a] text-white font-bold' },
    in_progress: { label: 'En Ruta', className: 'bg-blue-500/10 text-blue-600 border-blue-300' },
    scheduled: { label: 'Programado', className: 'bg-amber-500/10 text-amber-600 border-amber-300' },
    cancelled: { label: 'Cancelado', className: 'bg-stone-200 text-stone-700' },
  }
  const statusCfg = STATUS_MAP[tripRow.status] ?? { label: tripRow.status, className: '' }

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>

      {/* ── Gradient Header (mismo patrón que EmployeeDetailsDialog) ── */}
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">

        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Fuel className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight font-mono">
                {tripRow.folio}
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                {tripRow.origin} → {tripRow.destination}
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
        <Tabs defaultValue="rendimientos" className="flex flex-col">
          <div className="px-8 pb-0">
            <TabsList className="bg-transparent gap-1 border-b border-white/10 w-full rounded-none pb-0">
              {[
                { value: 'rendimientos', label: 'Rendimientos' },
                { value: 'viaje', label: 'Datos del Viaje' },
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

            {/* ── Tab 1: Rendimientos ── */}
            <TabsContent value="rendimientos" className="p-8 space-y-8">

              {/* Odómetro */}
              <section>
                <SectionTitle title="Odómetro" icon={Gauge} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Gauge} label="KM Inicial" value={fmtInt(tripRow.kmInitial, 'km')} />
                  <DetailItem icon={Gauge} label="KM Final" value={fmtInt(tripRow.kmFinal, 'km')} />
                  <DetailItem icon={Gauge} label="KM Recorridos"
                    value={tripRow.kmTraveled !== null
                      ? <span className="text-base font-extrabold text-[#006d37] dark:text-primary-container">{fmtInt(tripRow.kmTraveled, 'km')}</span>
                      : null
                    }
                  />
                </div>
                {tripRow.preinvoiceKm !== null && (
                  <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-stone-50 dark:bg-zinc-800/50 border border-stone-100 dark:border-zinc-700">
                    <FileText className="size-4 text-stone-400" />
                    <span className="text-sm text-stone-600 dark:text-zinc-400">
                      KM Prefactura: <strong>{fmtInt(tripRow.preinvoiceKm, 'km')}</strong>
                      {tripRow.preinvoiceVariance !== null && (
                        <span className={cn('ml-2 text-xs font-bold', Math.abs(tripRow.preinvoiceVariance) > 5 ? 'text-amber-500' : 'text-emerald-600')}>
                          (varianza: {tripRow.preinvoiceVariance > 0 ? '+' : ''}{tripRow.preinvoiceVariance} km)
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              {/* Motor */}
              <section>
                <SectionTitle title="Motor — Carga de Diésel" icon={Fuel} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Hash} label="Folio Ticket" value={tripRow.ticketFolio} />
                  <DetailItem icon={Fuel} label="Litros Cargados" value={fmt(tripRow.litersEngine, 'L')} />
                  <DetailItem icon={BarChart2} label="Rendimiento Real"
                    value={tripRow.realYieldEngine !== null
                      ? <span className="text-base font-extrabold text-[#006d37] dark:text-primary-container">{tripRow.realYieldEngine.toFixed(2)} km/L</span>
                      : null
                    }
                  />
                </div>
                <div className="mt-4">
                  <MetricBar real={tripRow.litersEngine} theoretical={tripRow.litersTheoreticalEngine} label="Litros reales vs. teóricos (Motor)" />
                </div>
                {tripRow.savingsExcessEngine !== null && (
                  <div className={cn(
                    'mt-3 flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold',
                    tripRow.savingsExcessEngine > 0
                      ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border border-red-200/50'
                      : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 border border-emerald-200/50'
                  )}>
                    {tripRow.savingsExcessEngine > 0 ? <TrendingUp className="size-4" /> : <TrendingDown className="size-4" />}
                    <span>
                      {tripRow.savingsExcessEngine > 0 ? 'Exceso' : 'Ahorro'} motor:{' '}
                      <strong>{tripRow.savingsExcessEngine > 0 ? '+' : ''}{fmt(tripRow.savingsExcessEngine, 'L')}</strong>
                    </span>
                  </div>
                )}
              </section>

              {/* Remolques */}
              {(tripRow.litersRealR1 !== null || tripRow.litersRealR2 !== null) && (
                <>
                  <Separator className="bg-stone-100 dark:bg-zinc-800" />
                  <section>
                    <SectionTitle title="Remolques" icon={Truck} />
                    <div className="grid grid-cols-2 gap-8">
                      {tripRow.litersRealR1 !== null && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500">R1</p>
                          <DetailItem icon={Fuel} label="Litros Reales R1" value={fmt(tripRow.litersRealR1, 'L')} />
                          <DetailItem icon={BarChart2} label="Horas R1" value={tripRow.hoursR1 !== null ? `${tripRow.hoursR1} h` : null} />
                        </div>
                      )}
                      {tripRow.litersRealR2 !== null && (
                        <div className="space-y-3">
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500">R2</p>
                          <DetailItem icon={Fuel} label="Litros Reales R2" value={fmt(tripRow.litersRealR2, 'L')} />
                          <DetailItem icon={BarChart2} label="Horas R2" value={tripRow.hoursR2 !== null ? `${tripRow.hoursR2} h` : null} />
                        </div>
                      )}
                    </div>
                  </section>
                </>
              )}

              {/* Totales */}
              <Separator className="bg-stone-100 dark:bg-zinc-800" />
              <section>
                <SectionTitle title="Totales del Viaje" icon={BarChart2} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={Fuel} label="Costo Total Diésel"
                    value={tripRow.totalDieselCostTrip !== null
                      ? <span className="text-base font-extrabold">
                          ${tripRow.totalDieselCostTrip.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                        </span>
                      : null
                    }
                  />
                  <DetailItem icon={BarChart2} label="Ahorro / Exceso Total"
                    value={tripRow.totalSavingsExcess !== null
                      ? <span className={cn('font-bold text-base', tripRow.totalSavingsExcess > 0 ? 'text-red-500' : 'text-emerald-600')}>
                          {tripRow.totalSavingsExcess > 0 ? '+' : ''}{fmt(tripRow.totalSavingsExcess, 'L')}
                        </span>
                      : null
                    }
                  />
                </div>
              </section>
            </TabsContent>

            {/* ── Tab 2: Datos del Viaje ── */}
            <TabsContent value="viaje" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Información del Viaje" icon={MapPin} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Calendar} label="Fecha de Salida" value={tripRow.departureDate} />
                  <DetailItem icon={MapPin} label="Origen" value={tripRow.origin} />
                  <DetailItem icon={MapPin} label="Destino" value={tripRow.destination} />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Unidad" icon={Truck} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Truck} label="N° Económico" value={tripRow.unitEconomicNumber} />
                  <DetailItem icon={Hash} label="Placas Tracto" value={tripRow.truckPlates} />
                  <DetailItem icon={User} label="Operador" value={tripRow.operatorName} />
                </div>
                <div className="mt-4">
                  <DetailItem icon={Truck} label="Configuración"
                    value={
                      <Badge className={tripRow.isFullAssembly
                        ? 'bg-amber-500/10 text-amber-700 border border-amber-300'
                        : 'bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }>
                        {tripRow.isFullAssembly ? 'Full (2 remolques)' : 'Sencillo (1 remolque)'}
                      </Badge>
                    }
                  />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Monitoreo" icon={User} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem icon={User} label="Monitorista" value={tripRow.monitoredBy} />
                  <DetailItem icon={FileText} label="Estado"
                    value={<Badge className={statusCfg.className}>{statusCfg.label}</Badge>}
                  />
                </div>
                {tripRow.observations && (
                  <div className="mt-4 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200/50">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1.5">Observaciones</p>
                    <p className="text-sm text-stone-700 dark:text-zinc-300">{tripRow.observations}</p>
                  </div>
                )}
              </section>
            </TabsContent>

          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
