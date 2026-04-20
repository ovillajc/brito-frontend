'use client'

/**
 * @fileoverview Dialog de detalles de una Unidad Armada (solo lectura).
 */

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { UnitAssemblyEntity } from '../../../domain/entities'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import {
  Layers,
  User,
  Truck,
  Disc3,
  Building2,
  Hash,
  Tag,
  X,
  CheckCircle2,
  XCircle,
  Clock,
  History,
} from 'lucide-react'
import { useUnitAssemblyLogs } from '../../../presentation/hooks/use-fleet'

interface UnitAssemblyDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  assembly: UnitAssemblyEntity | null
}

/**
 * Dialog read-only que muestra los detalles completos de una Unidad Armada.
 */
export function UnitAssemblyDetailsDialog({ isOpen, onClose, assembly }: UnitAssemblyDetailsDialogProps) {
  const { data: logs, isLoading: isLoadingLogs } = useUnitAssemblyLogs(assembly?.id)

  if (!assembly) return null

  const DetailItem = ({
    icon: Icon,
    label,
    value,
  }: {
    icon: React.ElementType
    label: string
    value?: string | React.ReactNode | null
  }) => (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5 text-stone-400 dark:text-zinc-500">
        <Icon className="size-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
        {value ?? <span className="text-stone-300 dark:text-zinc-600 font-normal italic text-xs">No asignado</span>}
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
              <Layers className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">
                {assembly.name}
              </h2>
              <p className="text-sm text-white/70 mt-0.5">
                Económico: {assembly.economicNumber}
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

        <Tabs defaultValue="base" className="flex flex-col">
          <div className="px-8 pb-0">
            <TabsList className="bg-transparent gap-1 border-b border-white/10 w-full rounded-none pb-0">
              {['base', 'vehicles', 'admin', 'history'].map((tab) => {
                const labels: Record<string, string> = {
                  base: 'Identificación',
                  vehicles: 'Vehículos',
                  admin: 'Administrativo',
                  history: 'Historial'
                }
                return (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
                  >
                    {labels[tab]}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </div>

          <div className="bg-white dark:bg-zinc-900 max-h-[65vh] overflow-y-auto">
            <TabsContent value="base" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Datos Generales" icon={Tag} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Hash} label="Número Económico" value={assembly.economicNumber} />
                  <DetailItem icon={Tag} label="Nombre" value={assembly.name} />
                  <DetailItem
                    icon={CheckCircle2}
                    label="Estado"
                    value={
                      assembly.isActive
                        ? <Badge className="bg-[#1a5c3a] text-white font-bold">Activa</Badge>
                        : <Badge variant="secondary" className="bg-stone-200 text-stone-700">Inactiva</Badge>
                    }
                  />
                </div>
                {assembly.description && (
                  <div className="mt-6">
                    <DetailItem icon={Tag} label="Descripción" value={assembly.description} />
                  </div>
                )}
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Operador Asignado" icon={User} />
                <DetailItem icon={User} label="Nombre del Operador" value={assembly.employeeName} />
              </section>
            </TabsContent>

            <TabsContent value="vehicles" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Tractocamión" icon={Truck} />
                <DetailItem icon={Hash} label="N° Económico del Tracto" value={assembly.truckEconomicNumber} />
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <section>
                  <SectionTitle title="Remolque 1" icon={Disc3} />
                  <DetailItem
                    icon={Hash}
                    label="N° Económico del Remolque"
                    value={assembly.trailerEconomicNumber ?? (
                      <span className="flex items-center gap-1.5 text-stone-400 text-xs italic">
                        <XCircle className="size-3" />
                        Sin remolque
                      </span>
                    )}
                  />
                </section>
                <section>
                  <SectionTitle title="Remolque 2 (Full)" icon={Disc3} />
                  <DetailItem
                    icon={Hash}
                    label="N° Económico del Segundo Remolque"
                    value={assembly.trailer2EconomicNumber ?? (
                      <span className="flex items-center gap-1.5 text-stone-400 text-xs italic">
                        <XCircle className="size-3" />
                        Sin remolque
                      </span>
                    )}
                  />
                </section>
              </div>
            </TabsContent>

            <TabsContent value="admin" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Empresa Operadora" icon={Building2} />
                <DetailItem icon={Building2} label="Perfil de Compañía" value={assembly.companyProfileLegalName} />
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Cliente Asignado" icon={User} />
                <DetailItem icon={User} label="Nombre del Cliente" value={assembly.clientName} />
              </section>
            </TabsContent>

            <TabsContent value="history" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Historial de Movimientos" icon={History} />
                
                {isLoadingLogs ? (
                  <p className="text-sm text-stone-500">Cargando historial...</p>
                ) : logs && logs.length > 0 ? (
                  <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-stone-300 before:to-transparent">
                    {logs.map((log, index) => {
                      const actionLabel = log.action === 'CREATED' ? 'Creación' : log.action === 'UPDATED' ? 'Actualización' : 'Desvinculación';
                      const ActionIcon = log.action === 'CREATED' ? Layers : log.action === 'UPDATED' ? Clock : XCircle;

                      return (
                        <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-stone-100 group-[.is-active]:bg-[#1a5c3a] text-stone-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                            <ActionIcon className="w-4 h-4" />
                          </div>
                          
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded bg-stone-50 dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-800 shadow-sm">
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-stone-900 dark:text-zinc-100 text-sm">{actionLabel}</span>
                              <time className="text-xs font-medium text-[#1a5c3a] dark:text-primary-container">
                                {new Intl.DateTimeFormat('es-MX', {
                                  day: '2-digit',
                                  month: 'short',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit',
                                }).format(new Date(log.createdAt))}
                              </time>
                            </div>
                            <div className="text-xs text-stone-600 dark:text-zinc-400 mt-2 space-y-1">
                              <p><span className="font-semibold text-stone-800 dark:text-zinc-300">Tracto:</span> {log.truckEconomicNumber || 'N/A'}</p>
                              {log.trailerEconomicNumber && <p><span className="font-semibold text-stone-800 dark:text-zinc-300">Remolque:</span> {log.trailerEconomicNumber}</p>}
                              {log.trailer2EconomicNumber && <p><span className="font-semibold text-stone-800 dark:text-zinc-300">Remolque (2):</span> {log.trailer2EconomicNumber}</p>}
                              {log.employeeName && <p><span className="font-semibold text-stone-800 dark:text-zinc-300">Operador:</span> {log.employeeName}</p>}
                            </div>
                            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-zinc-700/50 flex justify-between items-center">
                              <span className="text-[10px] text-stone-500">Por: {log.profileName || 'Sistema'}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-stone-500 italic flex items-center gap-2">
                    <XCircle className="w-4 h-4" />
                    Aún no hay historial en esta unidad.
                  </p>
                )}
              </section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
