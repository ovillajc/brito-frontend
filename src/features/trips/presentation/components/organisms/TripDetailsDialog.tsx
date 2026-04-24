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
import { X, MapPin, Truck, Calendar, User, FileText, ShoppingCart, Briefcase, Hash } from 'lucide-react'
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
                    <DetailItem icon={Hash} label="Núm. Tiendas" value={tripRow.walmartData?.numStores} />
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
          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
