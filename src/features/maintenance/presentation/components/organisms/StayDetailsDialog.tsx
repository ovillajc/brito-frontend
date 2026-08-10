'use client'

import React, { useState } from 'react'
import { X, Wrench, ClipboardList, PackagePlus, Lock, Calendar, Info, Clock, DollarSign, PenTool, Layers, Pencil, Trash2, Plus } from 'lucide-react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import type { WorkshopStayReplicaEntity, WorkshopWorkOrderEntity, WorkshopWorkOrderReplicaEntity, WorkOrderIssueEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { useCloseWorkshopStay, useMaintenanceCatalogs, useStayWorkOrders, useWorkOrderParts, useDeleteWorkOrder, useWorkOrderIssues } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import { WorkOrderWizard } from './WorkOrderWizard'
import { WorkOrderIssueWizard } from './WorkOrderIssueWizard'
import { toast } from 'sonner'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { WorkOrderPartWizard } from './WorkOrderPartWizard'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

interface StayDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  stay: WorkshopStayReplicaEntity | null
  defaultTab?: 'general' | 'orders'
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

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  open: { label: 'Abierta', className: 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
  in_progress: { label: 'En Proceso', className: 'bg-blue-500/15 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400' },
  completed: { label: 'Finalizada', className: 'bg-emerald-500/15 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' },
  on_hold: { label: 'En Espera', className: 'bg-stone-400/15 text-stone-600 dark:bg-zinc-600/20 dark:text-zinc-400' },
}

/** Adapta WorkshopWorkOrderEntity al formato que espera WorkOrderWizard (initialData: WorkshopWorkOrderReplicaEntity) */
function toReplicaShape(wo: WorkshopWorkOrderEntity, stayFolio: string): WorkshopWorkOrderReplicaEntity {
  return {
    id: wo.id,
    stayId: wo.stayId,
    stayFolio,
    workOrderFolio: wo.folio,
    stayEnteredAt: new Date(),
    startedAt: wo.startedAt,
    finishedAt: wo.finishedAt,
    daysInWork: null,
    status: wo.status,
    totalCost: wo.totalCost,
    locationType: null,
    unitEconomicNumber: null,
    unitPlates: null,
    stayReason: null,
    maintenanceTypeName: wo.maintenanceTypeName,
    mechanicalCategoryName: wo.mechanicalCategoryName,
    failureLocation: null,
    vehicleActivityAtFailure: null,
    specialistName: wo.specialistName,
    specialistEmployeeId: null,
    supervisorName: null,
    description: wo.description,
    details: wo.details,
  }
}

export function StayDetailsDialog({ isOpen, onClose, stay, defaultTab = 'general' }: StayDetailsDialogProps) {
  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkshopWorkOrderEntity | null>(null)
  const [isWorkOrderWizardOpen, setIsWorkOrderWizardOpen] = useState(false)
  const [editingWorkOrder, setEditingWorkOrder] = useState<WorkshopWorkOrderEntity | null>(null)
  const [isPartWizardOpen, setIsPartWizardOpen] = useState(false)
  const [deletingWoId, setDeletingWoId] = useState<string | null>(null)

  const catalogsQuery = useMaintenanceCatalogs()
  const workOrdersQuery = useStayWorkOrders(stay?.id ?? null)
  const partsQuery = useWorkOrderParts(selectedWorkOrder?.id ?? null)
  const issuesQuery = useWorkOrderIssues(selectedWorkOrder?.id ?? null)
  const closeStay = useCloseWorkshopStay()
  const deleteWorkOrder = useDeleteWorkOrder()

  const workOrders = workOrdersQuery.data ?? []
  const parts = partsQuery.data ?? []
  const issues = issuesQuery.data ?? []

  const openNewOrderWizard = () => {
    setEditingWorkOrder(null)
    setIsWorkOrderWizardOpen(true)
  }

  const openEditWizard = (wo: WorkshopWorkOrderEntity) => {
    setEditingWorkOrder(wo)
    setIsWorkOrderWizardOpen(true)
  }

  const handleDeleteWorkOrder = async (wo: WorkshopWorkOrderEntity) => {
    setDeletingWoId(wo.id)
    try {
      await deleteWorkOrder.mutateAsync(wo.id)
      if (selectedWorkOrder?.id === wo.id) setSelectedWorkOrder(null)
      toast.success('Orden de trabajo eliminada')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Error al eliminar orden')
    } finally {
      setDeletingWoId(null)
    }
  }

  const handleCloseStay = async () => {
    if (!stay) return
    await closeStay.mutateAsync(stay.id)
  }

  if (!stay) return null

  const isStayClosed = stay.exitedAt !== null

  return (
    <Dialog isOpen={isOpen} onClose={onClose} size="lg" hideDefaultHeader>
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
                <Badge variant="secondary" className={cn(
                  "border-none font-semibold text-xs",
                  isStayClosed
                    ? "bg-stone-400/30 text-stone-200"
                    : "bg-emerald-400/30 text-emerald-100"
                )}>
                  {isStayClosed ? 'Cerrada' : 'Abierta'}
                </Badge>
              </div>
              <p className="text-sm text-white/80 mt-0.5">
                {stay.economicNumber ? `No. Eco: ${stay.economicNumber} · ${stay.vehicleType}` : stay.vehicleType}
                {stay.plates ? ` · ${stay.plates}` : ''}
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
        <Tabs defaultValue={defaultTab} className="flex flex-col">
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
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all flex items-center gap-2"
              >
                Órdenes de Trabajo
                {workOrders.length > 0 && (
                  <span className="inline-flex items-center justify-center size-5 rounded-full bg-white/20 text-white text-[10px] font-bold">
                    {workOrders.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger
                value="predictive"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all flex items-center gap-2"
              >
                Predictivo (Fallas)
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

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              <section>
                <SectionTitle title="Desglose de Inversión" icon={Layers} />
                <div className="bg-stone-50 dark:bg-zinc-800/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-500 dark:text-zinc-400">Total Refacciones:</span>
                    <span className="font-semibold text-stone-900 dark:text-zinc-100">
                      {money.format(workOrders.reduce((sum, wo) => sum + wo.totalCost, 0))}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-500 dark:text-zinc-400">Órdenes de Trabajo:</span>
                    <span className="font-semibold text-stone-900 dark:text-zinc-100">
                      {workOrders.length}
                    </span>
                  </div>
                </div>
              </section>

              {!isStayClosed && canManage && (
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
                  {/* Header del panel */}
                  <div className="p-4 border-b border-stone-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 sticky top-0 z-10 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                        <PenTool className="size-4 text-[#006d37]" />
                        Órdenes de trabajo
                      </h3>
                      <span className="text-[10px] font-mono text-stone-400">{stay.folio}</span>
                    </div>
                    {/* Botón CTA prominente */}
                    {canManage && !isStayClosed ? (
                      <Button
                        size="sm"
                        className="w-full h-9 bg-[#1a5c3a] hover:bg-[#124029] text-white rounded-xl font-semibold text-sm gap-2 shadow-sm transition-all hover:shadow-md"
                        onClick={openNewOrderWizard}
                      >
                        <Plus className="size-4" />
                        Nueva Orden de Trabajo
                      </Button>
                    ) : isStayClosed ? (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-stone-100 dark:bg-zinc-800 text-xs text-stone-500 dark:text-zinc-400">
                        <Lock className="size-3 shrink-0" />
                        Estancia cerrada — solo lectura
                      </div>
                    ) : null}
                  </div>

                  {/* Lista de órdenes */}
                  <div className="overflow-y-auto p-4 flex flex-col gap-2 flex-1">
                    {workOrdersQuery.isLoading ? (
                      <div className="text-center py-8 text-stone-400">
                        <div className="size-6 border-2 border-[#006d37]/30 border-t-[#006d37] rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs">Cargando órdenes...</p>
                      </div>
                    ) : workOrders.length === 0 ? (
                      <div className="text-center py-12 flex flex-col items-center gap-3">
                        <div className="size-14 rounded-2xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
                          <ClipboardList className="size-7 text-stone-300 dark:text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-500 dark:text-zinc-400">Sin órdenes registradas</p>
                          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">
                            {canManage && !isStayClosed ? 'Usa el botón verde para agregar una.' : 'No hay trabajos en esta estancia.'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      workOrders.map(wo => {
                        const statusCfg = STATUS_CONFIG[wo.status] ?? STATUS_CONFIG.open
                        const isSelected = selectedWorkOrder?.id === wo.id
                        const isDeleting = deletingWoId === wo.id
                        return (
                          <div
                            key={wo.id}
                            className={cn(
                              'flex flex-col p-3 rounded-xl border transition-all cursor-pointer',
                              isSelected
                                ? 'border-[#006d37] bg-[#006d37]/5 shadow-sm ring-1 ring-[#006d37]/20'
                                : 'border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#006d37]/30 hover:bg-stone-50/80 dark:hover:bg-zinc-800/50'
                            )}
                            onClick={() => setSelectedWorkOrder(isSelected ? null : wo)}
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="font-mono text-sm font-bold text-stone-900 dark:text-zinc-100">{wo.folio}</span>
                              <span className={cn('text-[10px] px-2 py-0.5 rounded-full font-semibold', statusCfg.className)}>
                                {statusCfg.label}
                              </span>
                            </div>
                            <p className="text-xs text-stone-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">{wo.description}</p>
                            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-stone-100 dark:border-zinc-800/50">
                              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                                {wo.mechanicalCategoryName && (
                                  <span className="text-[10px] text-stone-500 dark:text-zinc-500 truncate">{wo.mechanicalCategoryName}</span>
                                )}
                                {wo.specialistName && (
                                  <span className="text-[10px] text-stone-400 dark:text-zinc-600 truncate">{wo.specialistName}</span>
                                )}
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                <span className="text-xs font-bold text-[#006d37]">{money.format(wo.totalCost)}</span>
                                {canManage && (
                                  <div className="flex items-center gap-0.5" onClick={e => e.stopPropagation()}>
                                    <button
                                      type="button"
                                      aria-label="Editar orden"
                                      className="size-6 flex items-center justify-center rounded-lg text-stone-400 hover:text-[#1a5c3a] hover:bg-[#1a5c3a]/10 transition-colors"
                                      onClick={() => openEditWizard(wo)}
                                    >
                                      <Pencil className="size-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      aria-label="Eliminar orden"
                                      disabled={isDeleting}
                                      className="size-6 flex items-center justify-center rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                      onClick={() => handleDeleteWorkOrder(wo)}
                                    >
                                      {isDeleting ? (
                                        <div className="size-3 border border-red-400 border-t-transparent rounded-full animate-spin" />
                                      ) : (
                                        <Trash2 className="size-3.5" />
                                      )}
                                    </button>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    )}
                  </div>
                </div>

                {/* Panel Derecho: Refacciones */}
                <div className="w-full md:w-1/2 flex flex-col bg-white dark:bg-zinc-900">
                  <div className="p-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between sticky top-0 z-10">
                    <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                      <Layers className="size-4 text-[#006d37]" />
                      Refacciones
                      {selectedWorkOrder && (
                        <span className="text-[10px] text-stone-400 font-normal ml-1">— {selectedWorkOrder.folio}</span>
                      )}
                    </h3>
                    {canManage && !isStayClosed && selectedWorkOrder && (
                      <Button size="sm" variant="ghost" className="h-8 text-xs font-semibold text-[#006d37] gap-1.5" onClick={() => setIsPartWizardOpen(true)}>
                        <Plus className="size-3.5" />
                        Agregar
                      </Button>
                    )}
                  </div>
                  <div className="overflow-y-auto p-4 flex flex-col gap-2 flex-1">
                    {!selectedWorkOrder ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
                        <div className="size-14 rounded-2xl bg-stone-50 dark:bg-zinc-800 flex items-center justify-center">
                          <PackagePlus className="size-7 text-stone-300 dark:text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-500 dark:text-zinc-400">Selecciona una orden</p>
                          <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">para ver sus refacciones</p>
                        </div>
                      </div>
                    ) : partsQuery.isLoading ? (
                      <div className="text-center py-8">
                        <div className="size-6 border-2 border-[#006d37]/30 border-t-[#006d37] rounded-full animate-spin mx-auto mb-2" />
                        <p className="text-xs text-stone-400">Cargando...</p>
                      </div>
                    ) : parts.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
                        <div className="size-14 rounded-2xl bg-stone-50 dark:bg-zinc-800 flex items-center justify-center">
                          <PackagePlus className="size-7 text-stone-300 dark:text-zinc-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-stone-500 dark:text-zinc-400">Sin refacciones</p>
                          {canManage && !isStayClosed && (
                            <p className="text-xs text-stone-400 mt-0.5">Usa "+ Agregar" para registrar una.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      parts.map(p => (
                        <div key={p.id} className="flex flex-col p-3 rounded-xl border border-stone-100 dark:border-zinc-800 bg-stone-50/30 dark:bg-zinc-800/20 hover:bg-stone-50 dark:hover:bg-zinc-800/40 transition-colors">
                          <div className="flex w-full items-start justify-between">
                            <div className="flex flex-col flex-1 min-w-0 pr-2">
                              <span className="font-semibold text-sm text-stone-900 dark:text-zinc-100 truncate">{p.description}</span>
                              <span className="text-[10px] text-stone-400 mt-0.5">{p.providerName || 'Sin proveedor'}</span>
                            </div>
                            <span className="text-sm font-bold text-stone-900 dark:text-zinc-100 whitespace-nowrap">{money.format(p.total)}</span>
                          </div>
                          <div className="flex w-full items-center gap-4 mt-2 pt-2 border-t border-stone-100 dark:border-zinc-800/50">
                            <span className="text-[11px] text-stone-500 dark:text-zinc-400">
                              Cant: <strong className="text-stone-700 dark:text-zinc-200">{p.quantity}</strong>
                            </span>
                            <span className="text-[11px] text-stone-500 dark:text-zinc-400">
                              Unitario: <strong className="text-stone-700 dark:text-zinc-200">{money.format(p.unitPrice)}</strong>
                            </span>
                            {p.brand && (
                              <span className="text-[11px] text-stone-500 dark:text-zinc-400">
                                Marca: <strong className="text-stone-700 dark:text-zinc-200">{p.brand}</strong>
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* ── Tab: Predictivo ── */}
            <TabsContent value="predictive" className="p-8 space-y-8">
              {!selectedWorkOrder ? (
                <div className="flex flex-col items-center justify-center h-full py-12 gap-3 text-center">
                  <div className="size-14 rounded-2xl bg-stone-50 dark:bg-zinc-800 flex items-center justify-center">
                    <Info className="size-7 text-stone-300 dark:text-zinc-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-stone-500 dark:text-zinc-400">Selecciona una orden en la pestaña anterior</p>
                    <p className="text-xs text-stone-400 dark:text-zinc-500 mt-0.5">para agregar información predictiva de fallas.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <SectionTitle title="Fallas Registradas" icon={Info} />
                    <div className="space-y-3">
                      {issuesQuery.isLoading ? (
                        <p className="text-sm text-stone-500">Cargando fallas...</p>
                      ) : issues.length === 0 ? (
                        <p className="text-sm text-stone-500">No hay fallas registradas para esta orden.</p>
                      ) : (
                        issues.map((issue: WorkOrderIssueEntity) => (
                          <div key={issue.id} className="p-3 border rounded-xl bg-stone-50 dark:bg-zinc-800/50">
                            <h4 className="text-sm font-semibold">{issue.componentName}</h4>
                            <p className="text-xs text-stone-600 dark:text-zinc-400 mt-1">{issue.reportedIssue}</p>
                            {issue.mechanicNotes && (
                              <p className="text-xs text-stone-500 italic mt-1">" {issue.mechanicNotes} "</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {canManage && !isStayClosed && (
                    <div>
                      <WorkOrderIssueWizard workOrderId={selectedWorkOrder.id} />
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <WorkOrderWizard
        key={`wo-${editingWorkOrder?.id ?? 'new'}-${isWorkOrderWizardOpen}`}
        isOpen={isWorkOrderWizardOpen}
        onClose={() => { setIsWorkOrderWizardOpen(false); setEditingWorkOrder(null) }}
        stayId={stay.id}
        catalogs={catalogsQuery.data ?? null}
        initialData={editingWorkOrder ? toReplicaShape(editingWorkOrder, stay.folio) : null}
      />

      <WorkOrderPartWizard
        key={`part-${selectedWorkOrder?.id ?? 'none'}-${isPartWizardOpen ? 'open' : 'closed'}`}
        isOpen={isPartWizardOpen}
        onClose={() => setIsPartWizardOpen(false)}
        workOrderId={selectedWorkOrder?.id ?? null}
        catalogs={catalogsQuery.data ?? null}
      />
    </Dialog>
  )
}
