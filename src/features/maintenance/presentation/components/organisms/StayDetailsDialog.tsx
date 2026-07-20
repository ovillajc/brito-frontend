'use client'

import React, { useMemo, useState } from 'react'
import { X, Wrench, ClipboardList, PackagePlus, Lock, MapPin, Briefcase, Calendar, Info, Clock, DollarSign, PenTool, Layers } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import type { WorkshopStayKpiEntity, WorkshopWorkOrderEntity, WorkOrderPartEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { useCloseWorkshopStay, useMaintenanceCatalogs, useStayWorkOrders, useWorkOrderParts } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import { WorkOrderWizard } from './WorkOrderWizard'
import { WorkOrderPartWizard } from './WorkOrderPartWizard'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

interface StayDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  stay: WorkshopStayKpiEntity | null
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

export function StayDetailsDialog({ isOpen, onClose, stay }: StayDetailsDialogProps) {
  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkshopWorkOrderEntity | null>(null)
  const [isWorkOrderWizardOpen, setIsWorkOrderWizardOpen] = useState(false)
  const [isPartWizardOpen, setIsPartWizardOpen] = useState(false)

  const catalogsQuery = useMaintenanceCatalogs()
  const workOrdersQuery = useStayWorkOrders(stay?.id ?? null)
  const partsQuery = useWorkOrderParts(selectedWorkOrder?.id ?? null)
  const closeStay = useCloseWorkshopStay()

  const workOrders = workOrdersQuery.data ?? []
  const parts = partsQuery.data ?? []

  const handleClose = () => {
    onClose()
  }

  const handleCloseStay = async () => {
    if (!stay) return
    await closeStay.mutateAsync(stay.id)
  }

  if (!stay) return null

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} size="lg" hideDefaultHeader>
      {/* ── Gradient Header ── */}
      <div className="bg-linear-to-br from-[#006d37] via-on-primary-container to-[#004020]">
        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <Wrench className="size-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-bold text-white tracking-tight leading-tight font-mono">
                  {stay.folio}
                </h2>
                <Badge variant="secondary" className="bg-white/20 text-white hover:bg-white/30 border-none">
                  {stay.status === 'open' ? 'Abierta' : 'Cerrada'}
                </Badge>
              </div>
              <p className="text-sm text-white/80 mt-0.5">
                {stay.unitLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
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
                Detalles Generales
              </TabsTrigger>
              <TabsTrigger
                value="orders"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
              >
                Órdenes de Trabajo ({workOrders.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="bg-white dark:bg-zinc-900 max-h-[68vh] overflow-y-auto min-h-[500px]">
            {/* ── Tab: General ── */}
            <TabsContent value="general" className="p-8 space-y-8">
              <section>
                <SectionTitle title="Fechas y Tiempos" icon={Clock} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Calendar} label="Ingreso" value={dateFmt.format(new Date(stay.enteredAt))} />
                  <DetailItem icon={Calendar} label="Salida" value={stay.exitedAt ? dateFmt.format(new Date(stay.exitedAt)) : null} />
                  <DetailItem icon={Clock} label="Días en Taller" value={stay.daysInShop !== null ? `${stay.daysInShop} días` : null} />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Costos e Información" icon={DollarSign} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={DollarSign} label="Costo Total" value={money.format(stay.totalCost)} />
                  <DetailItem icon={Info} label="Motivo de Ingreso" value={stay.reason} className="md:col-span-2" />
                </div>
              </section>

              {stay.status === 'open' && canManage && (
                <>
                  <Separator className="bg-stone-100 dark:bg-zinc-800" />
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      className="h-9 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={closeStay.isPending}
                      onClick={handleCloseStay}
                    >
                      <Lock className="size-4 mr-2" />
                      Cerrar Estancia
                    </Button>
                  </div>
                </>
              )}
            </TabsContent>

            {/* ── Tab: Órdenes y Refacciones ── */}
            <TabsContent value="orders" className="p-0">
              <div className="flex flex-col md:flex-row h-full min-h-[500px]">
                {/* Panel Izquierdo: Órdenes */}
                <div className="w-full md:w-1/2 border-r border-stone-100 dark:border-zinc-800 flex flex-col bg-stone-50/50 dark:bg-zinc-900/50">
                  <div className="p-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 sticky top-0">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                      <PenTool className="size-4 text-[#006d37]" />
                      Órdenes
                    </h3>
                    {canManage && stay.status === 'open' && (
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-[#006d37]" onClick={() => setIsWorkOrderWizardOpen(true)}>
                        + Nueva Orden
                      </Button>
                    )}
                  </div>
                  <div className="overflow-y-auto p-4 flex flex-col gap-2 flex-1">
                    {workOrders.length === 0 ? (
                      <div className="text-center py-8 text-stone-400">
                        <ClipboardList className="size-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No hay órdenes registradas.</p>
                      </div>
                    ) : (
                      workOrders.map(wo => (
                        <button
                          key={wo.id}
                          onClick={() => setSelectedWorkOrder(wo)}
                          className={`flex flex-col items-start p-3 rounded-xl border text-left transition-all ${
                            selectedWorkOrder?.id === wo.id 
                            ? 'border-[#006d37] bg-[#006d37]/5 shadow-sm ring-1 ring-[#006d37]/20' 
                            : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#006d37]/30 hover:bg-stone-50'
                          }`}
                        >
                          <div className="flex w-full items-center justify-between mb-1">
                            <span className="font-mono text-sm font-bold text-stone-900 dark:text-zinc-100">{wo.folio}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300 font-medium">
                              {wo.status}
                            </span>
                          </div>
                          <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2">{wo.description}</p>
                          <div className="flex w-full items-center justify-between mt-2 pt-2 border-t border-stone-100 dark:border-zinc-800/50">
                            <span className="text-[10px] text-stone-500">{wo.mechanicalCategoryName}</span>
                            <span className="text-xs font-bold text-[#006d37]">{money.format(wo.totalCost)}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Panel Derecho: Refacciones */}
                <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-zinc-900">
                  <div className="p-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 z-10">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                      <Layers className="size-4 text-[#006d37]" />
                      Refacciones
                    </h3>
                    {canManage && stay.status === 'open' && selectedWorkOrder && (
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-[#006d37]" onClick={() => setIsPartWizardOpen(true)}>
                        + Agregar
                      </Button>
                    )}
                  </div>
                  <div className="overflow-y-auto p-4 flex flex-col gap-2 flex-1">
                    {!selectedWorkOrder ? (
                      <div className="text-center py-12 text-stone-400 flex flex-col items-center justify-center h-full">
                        <PackagePlus className="size-10 mx-auto mb-3 opacity-20" />
                        <p className="text-sm font-medium text-stone-500">Selecciona una orden</p>
                        <p className="text-xs mt-1">Para ver sus refacciones asociadas</p>
                      </div>
                    ) : partsQuery.isLoading ? (
                      <p className="text-xs text-stone-400 text-center py-4">Cargando refacciones...</p>
                    ) : parts.length === 0 ? (
                      <div className="text-center py-12 text-stone-400">
                        <PackagePlus className="size-8 mx-auto mb-2 opacity-50" />
                        <p className="text-xs">No se han registrado piezas.</p>
                      </div>
                    ) : (
                      parts.map(p => (
                        <div key={p.id} className="flex flex-col p-3 rounded-lg border border-stone-100 dark:border-zinc-800 bg-stone-50/30 dark:bg-zinc-800/20">
                          <div className="flex w-full items-start justify-between">
                            <div className="flex flex-col">
                              <span className="font-semibold text-sm text-stone-900 dark:text-zinc-100">{p.description}</span>
                              <span className="text-[10px] text-stone-500 mt-0.5">{p.providerName || 'Sin proveedor'}</span>
                            </div>
                            <span className="text-xs font-bold text-stone-900">{money.format(p.total)}</span>
                          </div>
                          <div className="flex w-full items-center gap-4 mt-2">
                            <span className="text-[11px] text-stone-500">
                              Cant: <strong className="text-stone-700">{p.quantity}</strong>
                            </span>
                            <span className="text-[11px] text-stone-500">
                              Unitario: <strong className="text-stone-700">{money.format(p.unitCost)}</strong>
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <WorkOrderWizard
        key={`${stay.id}-${isWorkOrderWizardOpen ? 'open' : 'closed'}`}
        isOpen={isWorkOrderWizardOpen}
        onClose={() => setIsWorkOrderWizardOpen(false)}
        stayId={stay.id}
        catalogs={catalogsQuery.data ?? null}
      />

      <WorkOrderPartWizard
        key={`${selectedWorkOrder?.id ?? 'none'}-${isPartWizardOpen ? 'open' : 'closed'}`}
        isOpen={isPartWizardOpen}
        onClose={() => setIsPartWizardOpen(false)}
        workOrderId={selectedWorkOrder?.id ?? null}
        catalogs={catalogsQuery.data ?? null}
      />
    </Dialog>
  )
}
