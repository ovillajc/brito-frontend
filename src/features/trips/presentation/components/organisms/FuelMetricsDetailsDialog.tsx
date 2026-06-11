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
import { useFuelLoadsForTrip } from '@/src/features/trips/presentation/hooks/use-fuel-metrics'
import { GetFuelLoadSegments } from '@/src/features/trips/application/GetFuelLoadSegments'

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
  const { data: loads = [] } = useFuelLoadsForTrip(tripRow?.id ?? null)

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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                    <DetailItem icon={Gauge} label="KM Inicial" value={fmtInt(tripRow.kmInitial, 'km')} />
                    <DetailItem icon={Calendar} label="Fecha y Hora (Inicial)" value={tripRow.kmInitialDate ? new Date(tripRow.kmInitialDate).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short', hour12: false }) : null} />
                  </div>
                  <div className="flex flex-col gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                    <DetailItem icon={Gauge} label="KM Final" value={fmtInt(tripRow.kmFinal, 'km')} />
                    <DetailItem icon={Calendar} label="Fecha y Hora (Final)" value={tripRow.kmFinalDate ? new Date(tripRow.kmFinalDate).toLocaleString('es-MX', { dateStyle: 'medium', timeStyle: 'short', hour12: false }) : null} />
                  </div>
                  <div className="col-span-1 md:col-span-2 flex items-center justify-between p-4 bg-[#006d37]/10 border border-[#006d37]/20 rounded-xl">
                    <DetailItem icon={Gauge} label="KM Recorridos Totales"
                      value={tripRow.kmTraveled !== null
                        ? <span className="text-xl font-extrabold text-[#006d37] dark:text-primary-container">{fmtInt(tripRow.kmTraveled, 'km')}</span>
                        : null
                      }
                    />
                  </div>
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

                {loads.filter((l) => l.vehicleType === 'TRUCK').length > 0 && (
                  <div className="mt-6 border border-stone-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-stone-50 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 border-b border-stone-200 dark:border-zinc-700">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Fecha / Ticket</th>
                          <th className="px-4 py-2 font-semibold text-right">Odómetro</th>
                          <th className="px-4 py-2 font-semibold text-right">Km Tramo</th>
                          <th className="px-4 py-2 font-semibold text-right">Litros</th>
                          <th className="px-4 py-2 font-semibold text-right">Rend. Tramo</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                        {GetFuelLoadSegments(loads.filter(l => l.vehicleType === 'TRUCK')).map((seg, i) => (
                          <tr key={seg.loadId} className="group hover:bg-stone-50/50 dark:hover:bg-zinc-800/50">
                            <td className="px-4 py-2">
                              <span className="block font-medium text-stone-900 dark:text-zinc-100">{seg.loadDate ? new Date(seg.loadDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : 'N/D'}</span>
                              <span className="text-[10px] text-stone-400 font-mono">{loads.find(l => l.id === seg.loadId)?.ticketFolio}</span>
                            </td>
                            <td className="px-4 py-2 text-right font-mono text-stone-600 dark:text-zinc-400">{fmtInt(seg.odometerAtLoad)}</td>
                            <td className="px-4 py-2 text-right text-stone-900 dark:text-zinc-100 font-medium">{seg.kmSegment ? `+${fmtInt(seg.kmSegment)} km` : <span className="text-stone-300 italic">—</span>}</td>
                            <td className="px-4 py-2 text-right text-stone-900 dark:text-zinc-100 font-medium">
                              {fmt(seg.litersLoaded, 'L')}
                              {!seg.isFullTankFill && <span className="block text-[9px] text-amber-500 uppercase">Parcial</span>}
                            </td>
                            <td className="px-4 py-2 text-right">
                              {seg.realYieldSegment !== null
                                ? <span className="font-bold text-[#006d37] dark:text-primary-container">{seg.realYieldSegment.toFixed(2)} km/L</span>
                                : <span className="text-stone-300 italic">—</span>
                              }
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
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
              {(tripRow.litersRealR1 !== null || tripRow.r1StartDate || tripRow.hoursR1 !== null || tripRow.litersRealR2 !== null || tripRow.r2StartDate || tripRow.hoursR2 !== null) && (
                <>
                  <Separator className="bg-stone-100 dark:bg-zinc-800" />
                  <section>
                    <SectionTitle title="Remolques" icon={Truck} />
                    <div className="grid grid-cols-2 gap-8">
                      {(tripRow.litersRealR1 !== null || tripRow.r1StartDate || tripRow.hoursR1 !== null) && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 pb-2">Remolque 1 (R1)</p>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-2 gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                              <DetailItem icon={Calendar} label="Encendido" value={tripRow.r1StartDate ? new Date(tripRow.r1StartDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : null} />
                              <DetailItem icon={Calendar} label="Apagado" value={tripRow.r1EndDate ? new Date(tripRow.r1EndDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : null} />
                            </div>
                            <div className="flex items-center justify-between">
                              <DetailItem icon={Fuel} label="Litros Totales R1" value={fmt(tripRow.litersRealR1, 'L')} />
                              <div className="px-3 py-2 bg-[#006d37]/10 dark:bg-[#1a5c3a]/20 rounded-lg border border-[#006d37]/20 text-right">
                                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#006d37] dark:text-primary-container mb-1">Total Horas (Auto)</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">{tripRow.hoursR1 !== null ? `${tripRow.hoursR1} h` : '—'}</span>
                              </div>
                            </div>
                            {loads.some((l) => l.vehicleType === 'TRAILER') && (
                              <div className="mt-2 border border-stone-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-stone-50 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 border-b border-stone-200 dark:border-zinc-700">
                                    <tr>
                                      <th className="px-3 py-2 font-semibold">Fecha / Ticket</th>
                                      <th className="px-3 py-2 font-semibold text-right">Litros</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                                    {loads.filter((l) => l.vehicleType === 'TRAILER' && (!l.trailerId || l.litersLoaded > 0)).map((seg) => (
                                      <tr key={seg.id} className="group hover:bg-stone-50/50 dark:hover:bg-zinc-800/50">
                                        <td className="px-3 py-2">
                                          <span className="block font-medium text-stone-900 dark:text-zinc-100">{seg.loadDate ? new Date(seg.loadDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : 'N/D'}</span>
                                          <span className="text-[10px] text-stone-400 font-mono">{seg.ticketFolio}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-stone-900 dark:text-zinc-100 font-medium">
                                          {fmt(seg.litersLoaded, 'L')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      {(tripRow.litersRealR2 !== null || tripRow.r2StartDate || tripRow.hoursR2 !== null) && (
                        <div className="space-y-4">
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-500 border-b border-stone-100 dark:border-zinc-800 pb-2">Remolque 2 (R2)</p>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="grid grid-cols-2 gap-4 bg-stone-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-stone-100 dark:border-zinc-700">
                              <DetailItem icon={Calendar} label="Encendido" value={tripRow.r2StartDate ? new Date(tripRow.r2StartDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : null} />
                              <DetailItem icon={Calendar} label="Apagado" value={tripRow.r2EndDate ? new Date(tripRow.r2EndDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : null} />
                            </div>
                            <div className="flex items-center justify-between">
                              <DetailItem icon={Fuel} label="Litros Totales R2" value={fmt(tripRow.litersRealR2, 'L')} />
                              <div className="px-3 py-2 bg-[#006d37]/10 dark:bg-[#1a5c3a]/20 rounded-lg border border-[#006d37]/20 text-right">
                                <span className="block text-[10px] font-bold uppercase tracking-widest text-[#006d37] dark:text-primary-container mb-1">Total Horas (Auto)</span>
                                <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">{tripRow.hoursR2 !== null ? `${tripRow.hoursR2} h` : '—'}</span>
                              </div>
                            </div>
                            {loads.filter(l => l.vehicleType === 'TRAILER').length > 0 && (
                              <div className="mt-2 border border-stone-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white dark:bg-zinc-900">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-stone-50 dark:bg-zinc-800 text-stone-500 dark:text-zinc-400 border-b border-stone-200 dark:border-zinc-700">
                                    <tr>
                                      <th className="px-3 py-2 font-semibold">Fecha / Ticket</th>
                                      <th className="px-3 py-2 font-semibold text-right">Litros</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-stone-100 dark:divide-zinc-800">
                                    {loads.filter((l) => l.vehicleType === 'TRAILER' && (!l.trailerId || l.litersLoaded > 0)).map((seg) => (
                                      <tr key={seg.id} className="group hover:bg-stone-50/50 dark:hover:bg-zinc-800/50">
                                        <td className="px-3 py-2">
                                          <span className="block font-medium text-stone-900 dark:text-zinc-100">{seg.loadDate ? new Date(seg.loadDate).toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short', hour12: false }) : 'N/D'}</span>
                                          <span className="text-[10px] text-stone-400 font-mono">{seg.ticketFolio}</span>
                                        </td>
                                        <td className="px-3 py-2 text-right text-stone-900 dark:text-zinc-100 font-medium">
                                          {fmt(seg.litersLoaded, 'L')}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
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
