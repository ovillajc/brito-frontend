'use client'

/**
 * @fileoverview Dialog de detalles del viaje.
 * Pestaña General siempre presente. Si es de Walmart, muestra tab de Walmart.
 *
 * @organism
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { X, MapPin, Truck, Calendar, User, FileText, ShoppingCart, Briefcase, Hash, Factory, CheckCircle2 } from 'lucide-react'
import type { TripsTableRowEntity } from './TripsTable'

interface TripDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  tripRow: TripsTableRowEntity | null
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

export function TripDetailsDialog({ isOpen, onClose, tripRow }: TripDetailsDialogProps) {
  if (!tripRow) return null

  const isWalmart = tripRow.clientName?.toLowerCase().includes('walmart')
  const isHolcim = tripRow.clientName?.toLowerCase().includes('holcim')

  const barichon = (() => {
    const raw = tripRow.clientSpecificData
    if (!raw || typeof raw !== 'object') return null
    const b = (raw as Record<string, unknown>).barichon
    if (!b || typeof b !== 'object') return null
    const obj = b as Record<string, unknown>
    const weight = obj.weight && typeof obj.weight === 'object' ? obj.weight as Record<string, unknown> : null
    const unit = obj.unit && typeof obj.unit === 'object' ? obj.unit as Record<string, unknown> : null
    return {
      expensesReviewed: typeof obj.expensesReviewed === 'string' ? obj.expensesReviewed : null,
      ticket: typeof obj.ticket === 'string' ? obj.ticket : null,
      unloading: typeof obj.unloading === 'string' ? obj.unloading : null,
      remision: typeof obj.remision === 'string' ? obj.remision : null,
      material: typeof obj.material === 'string' ? obj.material : null,
      factura: typeof obj.factura === 'string' ? obj.factura : null,
      po: typeof obj.po === 'string' ? obj.po : null,
      total: typeof obj.total === 'number' ? obj.total : null,
      weight: {
        gross: typeof weight?.gross === 'number' ? weight.gross : null,
        tare: typeof weight?.tare === 'number' ? weight.tare : null,
        net: typeof weight?.net === 'number' ? weight.net : null,
      },
      unit: {
        economicNumber: typeof unit?.economicNumber === 'string' ? unit.economicNumber : null,
        operatorName: typeof unit?.operatorName === 'string' ? unit.operatorName : null,
        truckPlates: typeof unit?.truckPlates === 'string' ? unit.truckPlates : null,
        trailerPlates: typeof unit?.trailerPlates === 'string' ? unit.trailerPlates : null,
        trailer2Plates: typeof unit?.trailer2Plates === 'string' ? unit.trailer2Plates : null,
      },
    }
  })()

  const isBarichon = Boolean(barichon)

  const holcim = (() => {
    const raw = tripRow.clientSpecificData
    if (!raw || typeof raw !== 'object') return null
    const h = (raw as Record<string, unknown>).holcim
    if (!h || typeof h !== 'object') return null
    const obj = h as Record<string, unknown>
    return {
      expensesReviewed: typeof obj.expensesReviewed === 'string'
        ? obj.expensesReviewed
        : (obj.expensesReviewed === true ? 'Sí' : ''),
      remision: typeof obj.remision === 'string' ? obj.remision : null,
      factura: typeof obj.factura === 'string' ? obj.factura : null,
    }
  })()

  const holcimTripLabel = (() => {
    if (!isHolcim) return null
    if (tripRow.tripNumberClient == null) return null
    const dt = tripRow.departureDate ? new Date(tripRow.departureDate) : null
    if (!dt || Number.isNaN(dt.getTime())) return String(tripRow.tripNumberClient)
    const year = dt.getUTCFullYear()
    const month = String(dt.getUTCMonth() + 1).padStart(2, '0')
    const counter = String(tripRow.tripNumberClient).padStart(3, '0')
    return `${year}-${month}-${counter}`
  })()

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
      {/* ── Gradient Header ── */}
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <MapPin className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight font-mono">
                  {tripRow.folio}
                </h2>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {tripRow.status}
                </Badge>
              </div>
              <p className="text-sm text-white/80 mt-0.5">
                {tripRow.clientName}
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

        {/* Tabs Selector */}
        <Tabs defaultValue="general" className="flex flex-col">
          <div className="px-8 pb-0">
            <TabsList className="bg-transparent gap-1 border-b border-white/10 w-full rounded-none pb-0">
              <TabsTrigger
                value="general"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
              >
                Datos del Viaje
              </TabsTrigger>
              {isWalmart && (
                <TabsTrigger
                  value="walmart"
                  className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
                >
                  Datos Walmart
                </TabsTrigger>
              )}
              {isHolcim && (
                <TabsTrigger
                  value="holcim"
                  className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
                >
                  Datos Holcim
                </TabsTrigger>
              )}
              {isBarichon && (
                <TabsTrigger
                  value="barichon"
                  className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
                >
                  Barichon
                </TabsTrigger>
              )}
            </TabsList>
          </div>

          <div className="bg-white dark:bg-zinc-900 max-h-[68vh] overflow-y-auto">
            {/* ── Tab: General ── */}
            <TabsContent value="general" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Ruta y Cliente" icon={MapPin} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Briefcase} label="Cliente" value={tripRow.clientName} />
                  <DetailItem icon={MapPin} label="Origen" value={tripRow.origin} />
                  <DetailItem icon={MapPin} label="Destino" value={tripRow.destination} />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Asignaciones" icon={Truck} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Truck} label="N° Económico" value={tripRow.unitEconomicNumber} />
                  <DetailItem icon={User} label="Operador" value={tripRow.operatorName} />
                  <DetailItem icon={Calendar} label="Fecha de Salida" value={tripRow.departureDate ? new Date(tripRow.departureDate).toLocaleString('es-MX') : null} />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Control" icon={Hash} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Hash} label="Núm. Viaje Cliente" value={tripRow.tripNumberClient} />
                  <DetailItem icon={FileText} label="Observaciones" value={tripRow.observations} className="md:col-span-2" />
                </div>
              </section>
            </TabsContent>

            {/* ── Tab: Walmart ── */}
            {isWalmart && (
              <TabsContent value="walmart" className="p-8 space-y-8">
                <section>
                  <SectionTitle title="Detalles Operativos Walmart" icon={ShoppingCart} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={User} label="Coordinador" value={tripRow.walmartData?.coordinatorName} />
                    <DetailItem icon={MapPin} label="Ruta Walmart" value={tripRow.walmartData?.route} />
                    <DetailItem icon={FileText} label="Carta Porte" value={tripRow.walmartData?.cartaPorteWalmart} />
                    <DetailItem icon={Hash} label="Estatus" value={tripRow.walmartData?.statusWalmart} />
                    <DetailItem icon={Hash} label="Núm. Tiendas" value={tripRow.walmartData?.numStores} />
                    <DetailItem icon={MapPin} label="Temp. Salida" value={tripRow.walmartData?.departureTemperature} />
                    <DetailItem icon={Calendar} label="Hora Salida" value={tripRow.walmartData?.departureTime ? new Date(tripRow.walmartData.departureTime).toLocaleString('es-MX') : null} />
                  </div>
                </section>

                <Separator className="bg-stone-100 dark:bg-zinc-800" />

                <section>
                  <SectionTitle title="Métricas STR" icon={Hash} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={Hash} label="Num Load" value={tripRow.walmartData?.strNumLoad} />
                    <DetailItem icon={FileText} label="Compl. Carta Porte" value={tripRow.walmartData?.strComplementCartaPorte} />
                    <DetailItem icon={Hash} label="KM Pre-facturados" value={tripRow.walmartData?.strPreinvoiceKm} />
                    <DetailItem icon={Hash} label="KM Recorridos" value={tripRow.walmartData?.strKmTraveled} />
                    <DetailItem icon={Hash} label="Diesel" value={tripRow.walmartData?.strDiesel} />
                    <DetailItem icon={Hash} label="Casetas" value={tripRow.walmartData?.strCasetas} />
                    <DetailItem icon={Hash} label="Total Facturado" value={tripRow.walmartData?.strTotalInvoice} />
                  </div>
                </section>

                <Separator className="bg-stone-100 dark:bg-zinc-800" />

                <section>
                  <SectionTitle title="Métricas DHD" icon={Hash} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={Hash} label="Num Load" value={tripRow.walmartData?.dhdNumLoad} />
                    <DetailItem icon={FileText} label="Compl. Carta Porte" value={tripRow.walmartData?.dhdComplementCartaPorte} />
                    <DetailItem icon={Hash} label="KM Pre-facturados" value={tripRow.walmartData?.dhdPreinvoiceKm} />
                    <DetailItem icon={Hash} label="KM Recorridos" value={tripRow.walmartData?.dhdKmTraveled} />
                    <DetailItem icon={Hash} label="Diesel" value={tripRow.walmartData?.dhdDiesel} />
                    <DetailItem icon={Hash} label="Casetas" value={tripRow.walmartData?.dhdCasetas} />
                    <DetailItem icon={Hash} label="Total Facturado" value={tripRow.walmartData?.dhdTotalInvoice} />
                  </div>
                </section>

                <Separator className="bg-stone-100 dark:bg-zinc-800" />

                <section>
                  <SectionTitle title="Incidencias" icon={FileText} />
                  <div className="grid grid-cols-1 gap-6">
                    <DetailItem icon={FileText} label="Observaciones" value={tripRow.walmartData?.incidencias} />
                  </div>
                </section>

                <Separator className="bg-stone-100 dark:bg-zinc-800" />
                
                <section>
                  <SectionTitle title="Bitácora DETTES" icon={FileText} />
                  <div className="flex flex-col items-center justify-center py-8 bg-stone-50 dark:bg-zinc-800/50 rounded-xl border border-stone-100 dark:border-zinc-800 text-center">
                    <ShoppingCart className="size-8 text-stone-300 dark:text-zinc-600 mb-3" />
                    <p className="text-sm font-semibold text-stone-700 dark:text-zinc-300">Log de tiendas visitadas</p>
                    <p className="text-xs text-stone-500 mt-1">Esta tabla mostrará las citas y llegadas a cada tienda del recorrido.</p>
                  </div>
                </section>
              </TabsContent>
            )}

            {isHolcim && (
              <TabsContent value="holcim" className="p-8 space-y-8">
                <section>
                  <SectionTitle title="Detalles Operativos Holcim" icon={Factory} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={Hash} label="Número de viaje" value={holcimTripLabel} />
                    <DetailItem icon={FileText} label="Remisión" value={holcim?.remision} />
                    <DetailItem icon={FileText} label="Factura" value={holcim?.factura} />
                  </div>
                  <div className="mt-6">
                    <DetailItem icon={CheckCircle2} label="Gastos revisados" value={holcim?.expensesReviewed} />
                  </div>
                </section>
              </TabsContent>
            )}

            {isBarichon && (
              <TabsContent value="barichon" className="p-8 space-y-8">
                <section>
                  <SectionTitle title="Bitácora Barichon" icon={Factory} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={Hash} label="Núm. viaje" value={tripRow.tripNumberClient} />
                    <DetailItem icon={FileText} label="Ticket" value={barichon?.ticket} />
                    <DetailItem icon={FileText} label="Descarga" value={barichon?.unloading} />
                  </div>
                </section>

                <Separator className="bg-stone-100 dark:bg-zinc-800" />

                <section>
                  <SectionTitle title="Peso material" icon={FileText} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={Hash} label="Bruto" value={barichon?.weight.gross} />
                    <DetailItem icon={Hash} label="Tara" value={barichon?.weight.tare} />
                    <DetailItem icon={Hash} label="Neto" value={barichon?.weight.net} />
                  </div>
                </section>

                <Separator className="bg-stone-100 dark:bg-zinc-800" />

                <section>
                  <SectionTitle title="Documentos" icon={FileText} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={FileText} label="Cliente" value={tripRow.clientName} />
                    <DetailItem icon={FileText} label="Remisión" value={barichon?.remision} />
                    <DetailItem icon={FileText} label="Factura" value={barichon?.factura} />
                    <DetailItem icon={FileText} label="Material" value={barichon?.material} />
                    <DetailItem icon={FileText} label="PO" value={barichon?.po} />
                    <DetailItem icon={Hash} label="Total" value={barichon?.total} />
                  </div>
                </section>

                <Separator className="bg-stone-100 dark:bg-zinc-800" />

                <section>
                  <SectionTitle title="Unidad" icon={Truck} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <DetailItem icon={Truck} label="Unidad" value={barichon?.unit.economicNumber ?? tripRow.unitEconomicNumber} />
                    <DetailItem icon={User} label="Operador" value={barichon?.unit.operatorName ?? tripRow.operatorName} />
                    <DetailItem icon={FileText} label="Placas" value={[
                      barichon?.unit.truckPlates ? `Tracto: ${barichon.unit.truckPlates}` : null,
                      barichon?.unit.trailerPlates ? `Tolva: ${barichon.unit.trailerPlates}` : null,
                      barichon?.unit.trailer2Plates ? `Tolva 2: ${barichon.unit.trailer2Plates}` : null,
                    ].filter(Boolean).join(' · ') || null} />
                  </div>
                  <div className="mt-6">
                    <DetailItem icon={CheckCircle2} label="Gastos revisados" value={barichon?.expensesReviewed} />
                  </div>
                </section>
              </TabsContent>
            )}
          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
