'use client'

/**
 * @fileoverview Dialog de detalles de un Remolque (solo lectura).
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { TrailerEntity, vehicleStatus } from '../../../domain/entities'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import { cn } from '@/src/core/infrastructure/utils/cn'
import {
  Disc3,
  Hash,
  Shield,
  Snowflake,
  Wind,
  Key,
  X,
  Tag,
  Maximize,
  Type,
  Building2,
} from 'lucide-react'

interface TrailerDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  trailer: TrailerEntity | null
}

const STATUS_MAP: Record<vehicleStatus, { label: string; className: string }> = {
  available:    { label: 'Disponible',        className: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  in_trip:      { label: 'En Viaje',          className: 'bg-primary/10 text-primary border-primary/20' },
  maintenance:  { label: 'Mantenimiento',     className: 'bg-orange-500/10 text-orange-600 border-orange-500/20' },
  out_service:  { label: 'Fuera de Servicio', className: 'bg-red-500/10 text-red-600 border-red-500/20' },
}

/**
 * Dialog de solo lectura con los detalles completos de un remolque.
 */
export function TrailerDetailsDialog({ isOpen, onClose, trailer }: TrailerDetailsDialogProps) {
  if (!trailer) return null

  const statusConfig = STATUS_MAP[trailer.status]

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    className = '',
  }: {
    icon: React.ElementType
    label: string
    value: string | React.ReactNode
    className?: string
  }) => (
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

  const SectionTitle = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="size-8 rounded-lg bg-[#006d37]/8 dark:bg-[#1a5c3a]/20 flex items-center justify-center">
        <Icon className="size-4 text-[#006d37] dark:text-primary-container" />
      </div>
      <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-100 uppercase tracking-widest">{title}</h3>
    </div>
  )

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
      {/* ── Gradient Header ── */}
      <div className="bg-linear-to-br from-[#1a5c3a] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Disc3 className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                {trailer.trailerModelName || 'Remolque sin modelo'}
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                Económico: {trailer.economicNumber}
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
              <TabsTrigger
                value="tech"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
              >
                Datos Técnicos
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white dark:bg-zinc-900 max-h-[68vh] overflow-y-auto">
            {/* ── Tab: Información General ── */}
            <TabsContent value="info" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Identificación" icon={Tag} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Hash} label="N° Económico" value={trailer.economicNumber} />
                  <DetailItem icon={Disc3} label="Modelo" value={trailer.trailerModelName} />
                  <DetailItem
                    icon={Shield}
                    label="Estado"
                    value={
                      <Badge variant="outline" className={cn(statusConfig.className)}>
                        {statusConfig.label}
                      </Badge>
                    }
                  />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Documentación" icon={Key} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Type} label="Placas" value={trailer.plates} />
                  <DetailItem icon={Hash} label="N° de Serie (VIN)" value={trailer.serialNumber} />
                  <DetailItem icon={Shield} label="Póliza de Seguro" value={trailer.insurancePolicy} />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Propietario" icon={Building2} />
                <div className="grid grid-cols-1 gap-6">
                  <DetailItem icon={Building2} label="Perfil de Compañía" value={trailer.companyProfileLegalName} />
                </div>
              </section>
            </TabsContent>

            {/* ── Tab: Datos Técnicos ── */}
            <TabsContent value="tech" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Especificaciones" icon={Maximize} />
                <div className="grid grid-cols-1 gap-6">
                  <DetailItem 
                    icon={Maximize} 
                    label="Tamaño (Pies)" 
                    value={trailer.sizeFt ? `${trailer.sizeFt} ft` : undefined} 
                  />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Rendimiento Teórico (Refrigerados)" icon={Wind} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem
                    icon={Wind}
                    label="Contínuo (km/L)"
                    value={trailer.continuousRefrigeratedYield ? String(trailer.continuousRefrigeratedYield) : undefined}
                  />
                  <DetailItem
                    icon={Wind}
                    label="Start/Stop (km/L)"
                    value={trailer.ssRefrigeratedYield ? String(trailer.ssRefrigeratedYield) : undefined}
                  />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Rendimiento Teórico (Congelados)" icon={Snowflake} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <DetailItem
                    icon={Snowflake}
                    label="Contínuo (km/L)"
                    value={trailer.continuousFrozenYield ? String(trailer.continuousFrozenYield) : undefined}
                  />
                  <DetailItem
                    icon={Snowflake}
                    label="Start/Stop (km/L)"
                    value={trailer.ssFrozenYield ? String(trailer.ssFrozenYield) : undefined}
                  />
                </div>
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
