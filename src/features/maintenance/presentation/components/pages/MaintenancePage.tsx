'use client'

import React, { useMemo, useState } from 'react'
import { ClipboardList, Wrench, Settings } from 'lucide-react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { useWorkshopStays, useAllWorkOrders, useAllWorkOrderParts, useMaintenanceCatalogs, useDeleteWorkshopStay, useDeleteWorkOrder, useDeleteWorkOrderPart } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkshopStayReplicaEntity, WorkshopWorkOrderReplicaEntity, WorkOrderPartReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { StayWizard } from '../organisms/StayWizard'
import { WorkOrderWizard } from '../organisms/WorkOrderWizard'
import { WorkOrderPartWizard } from '../organisms/WorkOrderPartWizard'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { SpreadsheetTable, type SpreadsheetColumn } from '@/src/core/presentation/components/ui/SpreadsheetTable'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Button } from '@/src/core/presentation/components/ui/button'
import { StayDetailsDialog } from '../organisms/StayDetailsDialog'
import { WorkOrderDetailsDialog } from '../organisms/WorkOrderDetailsDialog'
import { WorkOrderPartDetailsDialog } from '../organisms/WorkOrderPartDetailsDialog'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export default function MaintenancePage() {
  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))

  const [activeTab, setActiveTab] = useState('stays')

  const staysQuery = useWorkshopStays({ pageSize: 5000 })
  const staysPaginated = staysQuery.data
  const stays = staysPaginated?.data ?? []

  const woQuery = useAllWorkOrders({ pageSize: 5000 })
  const workOrders = woQuery.data?.data ?? []

  const partsQuery = useAllWorkOrderParts({ pageSize: 5000 })
  const parts = partsQuery.data?.data ?? []

  const catalogsQuery = useMaintenanceCatalogs()
  const catalogs = catalogsQuery.data ?? null

  const deleteStay = useDeleteWorkshopStay()
  const deleteWorkOrder = useDeleteWorkOrder()
  const deletePart = useDeleteWorkOrderPart()

  const [isStayWizardOpen, setIsStayWizardOpen] = useState(false)
  const [selectedStay, setSelectedStay] = useState<WorkshopStayReplicaEntity | null>(null)

  const [isWoWizardOpen, setIsWoWizardOpen] = useState(false)
  const [selectedWo, setSelectedWo] = useState<WorkshopWorkOrderReplicaEntity | null>(null)

  const [isPartWizardOpen, setIsPartWizardOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<WorkOrderPartReplicaEntity | null>(null)

  // Details States
  const [isStayDetailsOpen, setIsStayDetailsOpen] = useState(false)
  const [detailStay, setDetailStay] = useState<WorkshopStayReplicaEntity | null>(null)

  const [isWoDetailsOpen, setIsWoDetailsOpen] = useState(false)
  const [detailWo, setDetailWo] = useState<WorkshopWorkOrderReplicaEntity | null>(null)

  const [isPartDetailsOpen, setIsPartDetailsOpen] = useState(false)
  const [detailPart, setDetailPart] = useState<WorkOrderPartReplicaEntity | null>(null)

  // Export States
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')
  const [exportType, setExportType] = useState<'stays' | 'jobs' | 'parts'>('stays')

  const handleExport = (type: 'stays' | 'jobs' | 'parts') => {
    setExportType(type)
    setExportModalOpen(true)
  }

  const confirmExport = () => {
    // TODO: Implement actual export logic based on exportType and dates
    alert(`Exportando ${exportType} (Desde: ${exportStartDate || 'siempre'}, Hasta: ${exportEndDate || 'siempre'})`)
    setExportModalOpen(false)
  }

  // -- Stays Columns --
  const staysColumns = useMemo<SpreadsheetColumn<WorkshopStayReplicaEntity>[]>(() => [
    { key: 'id', header: 'ID de registro', render: (s) => <div className="text-xs text-stone-500">{s.id.substring(0,8)}</div> },
    { key: 'seq', header: 'No. Secuencial', render: (s) => <div className="text-sm">{String(s.sequentialNumber)}</div> },
    { key: 'folio', header: 'Folio de Estancia', render: (s) => <div className="font-mono font-bold text-stone-900">{s.folio}</div> },
    { key: 'entered', header: 'Fecha de ingreso', render: (s) => <div className="text-sm">{dateFmt.format(new Date(s.enteredAt))}</div> },
    { key: 'exited', header: 'Fecha de salida', render: (s) => <div className="text-sm">{s.exitedAt ? dateFmt.format(new Date(s.exitedAt)) : '—'}</div> },
    { key: 'days', header: 'Días en Taller', render: (s) => <div className="text-sm">{s.daysInShop === null ? '—' : String(s.daysInShop)}</div> },
    { key: 'reason', header: 'Motivo', render: (s) => <div className="text-sm max-w-xs truncate">{s.reason}</div> },
    { key: 'cost', header: 'Costo Total', render: (s) => <div className="text-sm">{money.format(s.totalCost)}</div> },
    { key: 'eco', header: 'No. Económico', render: (s) => <div className="text-sm">{s.economicNumber || '—'}</div> },
    { key: 'type', header: 'Tipo de Vehículo', render: (s) => <div className="text-sm">{s.vehicleType}</div> },
    { key: 'plates', header: 'Placas', render: (s) => <div className="text-sm">{s.plates || '—'}</div> },
    { key: 'delivered', header: 'Entregado Por', render: (s) => <div className="text-sm">{s.deliveredByEmployeeName || '—'}</div> },
    { key: 'received', header: 'Recibido Por', render: (s) => <div className="text-sm">{s.receivedByProfileName || '—'}</div> },
    { key: 'pickedup', header: 'Recogido Por', render: (s) => <div className="text-sm">{s.pickedUpByEmployeeName || '—'}</div> },
    { key: 'km', header: 'Km de Ingreso', render: (s) => <div className="text-sm">{s.kmAtEntry ?? '—'}</div> },
    { key: 'km_last', header: 'KM Último Servicio', render: (s) => <div className="text-sm">{s.kmLastService ?? '—'}</div> },
    { key: 'last_trip_start', header: 'Inicio de último Viaje', render: (s) => <div className="text-sm">{s.lastTripStartDate ? dateFmt.format(new Date(s.lastTripStartDate)) : '—'}</div> },
    { key: 'notes', header: 'Observaciones', render: (s) => <div className="text-sm">{s.notes || '—'}</div> },
    { key: 'last_client', header: 'Último Cliente', render: (s) => <div className="text-sm">{s.lastClientName || '—'}</div> },
    { key: 'last_dest', header: 'Último Destino', render: (s) => <div className="text-sm">{s.lastDestination || '—'}</div> },
  ], [])

  // -- Work Orders Columns --
  const woColumns = useMemo<SpreadsheetColumn<WorkshopWorkOrderReplicaEntity>[]>(() => [
    { key: 'id', header: 'ID de registro', render: (s) => <div className="text-xs text-stone-500">{s.id.substring(0,8)}</div> },
    { key: 'stayFolio', header: 'Folio de Estancia', render: (s) => <span className="font-mono text-stone-700">{s.stayFolio}</span> },
    { key: 'woFolio', header: 'Folio Trabajo', render: (s) => <span className="font-mono font-bold text-stone-900">{s.workOrderFolio}</span> },
    { key: 'stayEntered', header: 'Fecha ingreso Taller', render: (s) => <div className="text-sm">{dateFmt.format(new Date(s.stayEnteredAt))}</div> },
    { key: 'started', header: 'Fecha inicio Taller', render: (s) => <div className="text-sm">{dateFmt.format(new Date(s.startedAt))}</div> },
    { key: 'finished', header: 'Fecha fin Taller', render: (s) => <div className="text-sm">{s.finishedAt ? dateFmt.format(new Date(s.finishedAt)) : '—'}</div> },
    { key: 'days', header: 'Días de Trabajo', render: (s) => <div className="text-sm">{s.daysInWork === null ? '—' : String(s.daysInWork)}</div> },
    { key: 'status', header: 'Estado', render: (s) => (
      s.status === 'open' ? <Badge className="bg-amber-500/15 text-amber-700">Abierta</Badge> : <Badge className="bg-[#006d37] text-white">Cerrada</Badge>
    ) },
    { key: 'cost', header: 'Costo Total', render: (s) => <div className="text-sm">{money.format(s.totalCost)}</div> },
    { key: 'locType', header: 'Tipo Locación', render: (s) => <div className="text-sm">{s.locationType || '—'}</div> },
    { key: 'eco', header: 'No. Económico', render: (s) => <div className="text-sm">{s.unitEconomicNumber || '—'}</div> },
    { key: 'plates', header: 'Placas', render: (s) => <div className="text-sm">{s.unitPlates || '—'}</div> },
    { key: 'reason', header: 'Motivo Taller', render: (s) => <div className="text-sm">{s.stayReason || '—'}</div> },
    { key: 'mntType', header: 'Tipo Mantenimiento', render: (s) => <div className="text-sm">{s.maintenanceTypeName || '—'}</div> },
    { key: 'mechCat', header: 'Categoría Mecánica', render: (s) => <div className="text-sm">{s.mechanicalCategoryName || '—'}</div> },
    { key: 'failLoc', header: 'Falla o Problema', render: (s) => <div className="text-sm">{s.failureLocation || '—'}</div> },
    { key: 'spec', header: 'Especialista', render: (s) => <div className="text-sm">{s.specialistEmployeeName || '—'}</div> },
    { key: 'sup', header: 'Supervisor', render: (s) => <div className="text-sm">{s.supervisorProfileName || '—'}</div> },
    { key: 'desc', header: 'Descripción', render: (s) => <div className="text-sm truncate max-w-50">{s.description}</div> },
  ], [])

  // -- Parts Columns --
  const partsColumns = useMemo<SpreadsheetColumn<WorkOrderPartReplicaEntity>[]>(() => [
    { key: 'id', header: 'ID Registro', render: (s) => <div className="text-xs text-stone-500">{s.id.substring(0,8)}</div> },
    { key: 'stayFolio', header: 'Folio Estancia', render: (s) => <span className="font-mono text-stone-700">{s.stayFolio}</span> },
    { key: 'stayEntered', header: 'Fecha Ingreso', render: (s) => <div className="text-sm">{dateFmt.format(new Date(s.stayEnteredAt))}</div> },
    { key: 'woFolio', header: 'Folio Trabajo', render: (s) => <span className="font-mono text-stone-700">{s.workOrderFolio}</span> },
    { key: 'eco', header: 'No. Económico', render: (s) => <div className="text-sm">{s.unitEconomicNumber || '—'}</div> },
    { key: 'plates', header: 'Placas', render: (s) => <div className="text-sm">{s.unitPlates || '—'}</div> },
    { key: 'reason', header: 'Motivo Estancia', render: (s) => <div className="text-sm truncate max-w-37.5">{s.stayReason || '—'}</div> },
    { key: 'mntType', header: 'Tipo Mantenimiento', render: (s) => <div className="text-sm">{s.maintenanceTypeName || '—'}</div> },
    { key: 'mechCat', header: 'Categoría Mecánica', render: (s) => <div className="text-sm">{s.mechanicalCategoryName || '—'}</div> },
    { key: 'concept', header: 'Concepto/Pieza', render: (s) => <div className="text-sm font-medium">{s.description}</div> },
    { key: 'provider', header: 'Proveedor', render: (s) => <div className="text-sm">{s.providerName || '—'}</div> },
    { key: 'brand', header: 'Marca', render: (s) => <div className="text-sm">{s.brand || '—'}</div> },
    { key: 'unit', header: 'Unidad de Medida', render: (s) => <div className="text-sm">{s.unitName || '—'}</div> },
    { key: 'price', header: 'Precio Unitario', render: (s) => <div className="text-sm">{money.format(s.unitPrice)}</div> },
    { key: 'qty', header: 'Cantidad', render: (s) => <div className="text-sm">{String(s.quantity)}</div> },
    { key: 'discount', header: 'Descuento', render: (s) => <div className="text-sm">{s.discount ? `${s.discount}%` : '0%'}</div> },
    { key: 'total', header: 'Importe Total', render: (s) => <div className="text-sm font-bold">{money.format(s.totalWithTax)}</div> },
    { key: 'paidBy', header: 'Pagado Por', render: (s) => <div className="text-sm">{s.paidBy || '—'}</div> },
  ], [])

  return (
    <div className="flex flex-col gap-8 p-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Visión General de Taller (Réplicas)</h2>
          <p className="text-sm text-stone-500">
            Mapeo exacto de las vistas solicitadas para Estancias, Trabajos y Refacciones.
          </p>
        </div>
      </div>

      <Tabs defaultValue="stays" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex items-center gap-1 border-b border-outline-variant/30 mb-4 bg-transparent w-full">
          <TabsTrigger 
            value="stays" 
            className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-none rounded-t-lg bg-transparent data-[state=active]:text-primary data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=inactive]:text-on-surface-variant data-[state=inactive]:hover:text-on-surface data-[state=inactive]:hover:bg-surface-container-low/50"
          >
            <ClipboardList className="size-4" />
            Estancias
          </TabsTrigger>
          <TabsTrigger 
            value="jobs" 
            className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-none rounded-t-lg bg-transparent data-[state=active]:text-primary data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=inactive]:text-on-surface-variant data-[state=inactive]:hover:text-on-surface data-[state=inactive]:hover:bg-surface-container-low/50"
          >
            <Wrench className="size-4" />
            Trabajos
          </TabsTrigger>
          <TabsTrigger 
            value="parts" 
            className="relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors rounded-none rounded-t-lg bg-transparent data-[state=active]:text-primary data-[state=active]:after:absolute data-[state=active]:after:bottom-0 data-[state=active]:after:left-0 data-[state=active]:after:right-0 data-[state=active]:after:h-0.5 data-[state=active]:after:bg-primary data-[state=inactive]:text-on-surface-variant data-[state=inactive]:hover:text-on-surface data-[state=inactive]:hover:bg-surface-container-low/50"
          >
            <Settings className="size-4" />
            Refacciones
          </TabsTrigger>
        </TabsList>

          <TabsContent value="stays" className="m-0 border-none outline-none flex flex-col h-auto">
            <SpreadsheetTable<WorkshopStayReplicaEntity>
              canManage={canManage}
              pageSize={10}
              data={stays}
              columns={staysColumns.map(c => {
                if (c.key === 'last_trip_start') {
                  return {
                    ...c,
                    render: (s) => {
                      if (!s.lastTripStartDate) return <div className="text-sm">—</div>
                      try {
                        const d = new Date(s.lastTripStartDate)
                        if (isNaN(d.getTime())) return <div className="text-sm">—</div>
                        return <div className="text-sm">{dateFmt.format(d)}</div>
                      } catch (e) {
                        return <div className="text-sm">—</div>
                      }
                    }
                  }
                }
                return c
              })}
              searchPlaceholder="Buscar estancia..."
              searchFilter={(row, term) => [row.folio, row.reason, row.economicNumber].some((v) => v?.toLowerCase().includes(term))}
              actionLabel="Nueva Estancia"
              onAction={() => { setSelectedStay(null); setIsStayWizardOpen(true); }}
              onEdit={(s) => { setSelectedStay(s); setIsStayWizardOpen(true); }}
              onView={(s) => { setDetailStay(s); setIsStayDetailsOpen(true); }}
              onDelete={async (s) => {
                try {
                  await deleteStay.mutateAsync(s.id)
                  return { ok: true }
                } catch (e: any) {
                  return { ok: false, error: { message: e.message || 'Error al eliminar estancia' } }
                }
              }}
              onExport={() => handleExport('stays')}
              emptyState={{ icon: ClipboardList, title: 'Sin estancias', description: 'No hay registros.' }}
            />
          </TabsContent>

          <TabsContent value="jobs" className="m-0 border-none outline-none flex flex-col h-auto">
            <SpreadsheetTable<WorkshopWorkOrderReplicaEntity>
              canManage={canManage}
              pageSize={10}
              data={workOrders}
              columns={woColumns as any}
              searchPlaceholder="Buscar orden de trabajo..."
              searchFilter={(row, term) => [row.workOrderFolio, row.stayFolio, row.description].some((v) => v?.toLowerCase().includes(term))}
              actionLabel="Nueva Orden"
              onAction={() => { setSelectedWo(null); setIsWoWizardOpen(true); }}
              onEdit={(wo) => { setSelectedWo(wo); setIsWoWizardOpen(true); }}
              onView={(wo) => { setDetailWo(wo); setIsWoDetailsOpen(true); }}
              onDelete={async (wo) => {
                try {
                  await deleteWorkOrder.mutateAsync(wo.id)
                  return { ok: true }
                } catch (e: any) {
                  return { ok: false, error: { message: e.message || 'Error al eliminar orden de trabajo' } }
                }
              }}
              onExport={() => handleExport('jobs')}
              emptyState={{ icon: Wrench, title: 'Sin órdenes de trabajo', description: 'No hay registros.' }}
            />
          </TabsContent>

          <TabsContent value="parts" className="m-0 border-none outline-none flex flex-col h-auto">
            <SpreadsheetTable<WorkOrderPartReplicaEntity>
              canManage={canManage}
              pageSize={10}
              data={parts}
              columns={partsColumns as any}
              searchPlaceholder="Buscar refacciones..."
              searchFilter={(row, term) => [row.workOrderFolio, row.description, row.brand].some((v) => v?.toLowerCase().includes(term))}
              actionLabel="Nueva Refacción"
              onAction={() => { setSelectedPart(null); setIsPartWizardOpen(true); }}
              onEdit={(p) => { setSelectedPart(p); setIsPartWizardOpen(true); }}
              onView={(p) => { setDetailPart(p); setIsPartDetailsOpen(true); }}
              onDelete={async (p) => {
                try {
                  await deletePart.mutateAsync(p.id)
                  return { ok: true }
                } catch (e: any) {
                  return { ok: false, error: { message: e.message || 'Error al eliminar refacción' } }
                }
              }}
              onExport={() => handleExport('parts')}
              emptyState={{ icon: Settings, title: 'Sin refacciones', description: 'No hay registros.' }}
            />
          </TabsContent>
      </Tabs>

      <StayWizard key={`stay-${selectedStay?.id ?? 'new'}-${isStayWizardOpen}`} isOpen={isStayWizardOpen} onClose={() => setIsStayWizardOpen(false)} initialData={selectedStay} />
      <WorkOrderWizard key={`wo-${selectedWo?.id ?? 'new'}-${isWoWizardOpen}`} isOpen={isWoWizardOpen} onClose={() => setIsWoWizardOpen(false)} stayId={selectedWo?.stayId || ''} catalogs={catalogs} initialData={selectedWo} />
      <WorkOrderPartWizard key={`part-${selectedPart?.id ?? 'new'}-${isPartWizardOpen}`} isOpen={isPartWizardOpen} onClose={() => setIsPartWizardOpen(false)} workOrderId={selectedPart?.workOrderId || null} catalogs={catalogs} initialData={selectedPart} />

      {/* Detail Dialogs */}
      <StayDetailsDialog isOpen={isStayDetailsOpen} onClose={() => { setIsStayDetailsOpen(false); setDetailStay(null) }} stay={detailStay} />
      <WorkOrderDetailsDialog isOpen={isWoDetailsOpen} onClose={() => { setIsWoDetailsOpen(false); setDetailWo(null) }} workOrder={detailWo} />
      <WorkOrderPartDetailsDialog isOpen={isPartDetailsOpen} onClose={() => { setIsPartDetailsOpen(false); setDetailPart(null) }} part={detailPart} />

      {/* Export Dialog */}
      <Dialog
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title={`Exportar ${exportType === 'stays' ? 'Estancias' : exportType === 'jobs' ? 'Trabajos' : 'Refacciones'} a Excel`}
        description="Selecciona un rango de fechas para filtrar los registros a exportar. Si lo dejas en blanco, se exportarán todos."
      >
        <div className="p-6 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exportStartDate">Fecha de inicio</Label>
              <Input
                id="exportStartDate"
                type="date"
                value={exportStartDate}
                onChange={(e) => setExportStartDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="exportEndDate">Fecha de fin</Label>
              <Input
                id="exportEndDate"
                type="date"
                value={exportEndDate}
                onChange={(e) => setExportEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex justify-end pt-4 gap-2">
            <Button
              variant="outline"
              onClick={() => setExportModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              onClick={confirmExport}
              className="bg-[#1a5c3a] text-white hover:bg-[#124029]"
            >
              Descargar Excel
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
