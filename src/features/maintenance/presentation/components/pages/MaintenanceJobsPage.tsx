'use client'

import React, { useMemo, useState } from 'react'
import { Wrench, Info, ArrowRight, CheckCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/src/core/presentation/components/ui/alert'
import { useAllWorkOrders, useMaintenanceCatalogs, useDeleteWorkOrder, useUpdateWorkOrder } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkshopWorkOrderReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { WorkOrderWizard } from '../organisms/WorkOrderWizard'
import { CloseWorkOrderDialog } from '../organisms/CloseWorkOrderDialog'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { SpreadsheetTable, type SpreadsheetColumn, type TableFilterConfig } from '@/src/core/presentation/components/ui/SpreadsheetTable'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Button } from '@/src/core/presentation/components/ui/button'
import { WorkOrderDetailsDialog } from '../organisms/WorkOrderDetailsDialog'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export default function MaintenanceJobsPage() {
  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))

  const woQuery = useAllWorkOrders({ pageSize: 5000 })
  const workOrders = woQuery.data?.data ?? []
  const catalogsQuery = useMaintenanceCatalogs()
  const catalogs = catalogsQuery.data ?? null
  const deleteWorkOrder = useDeleteWorkOrder()
  const updateWorkOrder = useUpdateWorkOrder()

  const [isWoWizardOpen, setIsWoWizardOpen] = useState(false)
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false)
  const [selectedWo, setSelectedWo] = useState<WorkshopWorkOrderReplicaEntity | null>(null)

  const [isWoDetailsOpen, setIsWoDetailsOpen] = useState(false)
  const [detailWo, setDetailWo] = useState<WorkshopWorkOrderReplicaEntity | null>(null)

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')

  const confirmExport = () => {
    alert(`Exportando trabajos (Desde: ${exportStartDate || 'siempre'}, Hasta: ${exportEndDate || 'siempre'})`)
    setExportModalOpen(false)
  }

  const tableFilters = useMemo((): TableFilterConfig<WorkshopWorkOrderReplicaEntity>[] => [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'open', label: 'Abierta' },
        { value: 'in_progress', label: 'En progreso' },
        { value: 'on_hold', label: 'En espera' },
        { value: 'completed', label: 'Cerrada' },
      ],
    },
    {
      id: 'startedAt',
      label: 'Fecha de Inicio',
      type: 'date-range',
      filterFn: (row, value) => {
        if (!row.startedAt) return false;
        const d = new Date(row.startedAt).getTime();
        const start = value.start ? new Date(value.start + 'T00:00:00').getTime() : null;
        const end = value.end ? new Date(value.end + 'T23:59:59').getTime() : null;
        
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      }
    }
  ], []);

  const woColumns = useMemo<SpreadsheetColumn<WorkshopWorkOrderReplicaEntity>[]>(() => [
    { key: 'stayFolio', header: 'Folio de Estancia', resizable: true, filterable: true, render: (s) => <span className="font-mono text-stone-700">{s.stayFolio}</span> },
    { key: 'woFolio', header: 'Folio Trabajo', resizable: true, filterable: true, render: (s) => <span className="font-mono font-bold text-stone-900">{s.workOrderFolio}</span> },
    { key: 'stayEntered', header: 'Fecha ingreso Taller', resizable: true, render: (s) => <div className="text-sm">{dateFmt.format(new Date(s.stayEnteredAt))}</div> },
    { key: 'started', header: 'Fecha inicio Taller', resizable: true, render: (s) => <div className="text-sm">{dateFmt.format(new Date(s.startedAt))}</div> },
    { key: 'finished', header: 'Fecha fin Taller', resizable: true, render: (s) => <div className="text-sm">{s.finishedAt ? dateFmt.format(new Date(s.finishedAt)) : '—'}</div> },
    { key: 'days', header: 'Días de Trabajo', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.daysInWork === null ? '—' : String(s.daysInWork)}</div> },
    {
      key: 'status', header: 'Estado', resizable: true, filterable: true, render: (s) => (
        <select
          value={s.status}
          onChange={async (e) => {
            if (!canManage) return;
            try {
              await updateWorkOrder.mutateAsync({ id: s.id, data: { status: e.target.value as any } })
            } catch (err) {
              console.error(err)
            }
          }}
          disabled={!canManage || updateWorkOrder.isPending}
          className="text-xs h-7 rounded border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-stone-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-[#1a5c3a]"
        >
          <option value="open">Abierta</option>
          <option value="in_progress">En progreso</option>
          <option value="on_hold">En espera</option>
          <option value="completed">Cerrada</option>
        </select>
      )
    },
    { key: 'cost', header: 'Costo Total', resizable: true, render: (s) => <div className="text-sm">{money.format(s.totalCost)}</div> },
    { key: 'locType', header: 'Tipo Locación', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.locationType || '—'}</div> },
    { key: 'eco', header: 'No. Económico', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.unitEconomicNumber || '—'}</div> },
    { key: 'plates', header: 'Placas', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.unitPlates || '—'}</div> },
    { key: 'reason', header: 'Motivo Taller', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.stayReason || '—'}</div> },
    { key: 'mntType', header: 'Tipo Mantenimiento', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.maintenanceTypeName || '—'}</div> },
    { key: 'mechCat', header: 'Categoría Mecánica', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.mechanicalCategoryName || '—'}</div> },
    { key: 'failLoc', header: 'Falla o Problema', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.failureLocation || '—'}</div> },
    { key: 'spec', header: 'Especialista', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.specialistName || '—'}</div> },
    { key: 'sup', header: 'Supervisor', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.supervisorName || '—'}</div> },
    { key: 'desc', header: 'Descripción', resizable: true, filterable: true, render: (s) => <div className="text-sm truncate max-w-50">{s.description}</div> },
  ], [])

  return (
    <div className="flex flex-col gap-4">
      {canManage && (
        <Alert className="bg-stone-50/50 dark:bg-zinc-900/50 border-stone-200 dark:border-zinc-800">
          <Info className="h-4 w-4 !text-stone-500" />
          <AlertTitle className="text-stone-800 dark:text-stone-300 font-bold">Registro de Trabajos</AlertTitle>
          <AlertDescription className="text-stone-600 dark:text-stone-400 mt-1 flex flex-col gap-2">
            <p>
              Para <strong>crear una nueva orden de trabajo</strong>, ve a la pestaña de Estancias, abre los detalles de una estancia, y usa el botón <span className="font-mono text-xs bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-stone-700 dark:text-zinc-200">+ Nueva Orden de Trabajo</span>.
            </p>
            <p className="text-amber-700 dark:text-amber-500">
              <strong className="font-bold flex items-center gap-1.5"><Wrench className="size-3" /> Mantenimiento Predictivo:</strong> Usa la <strong>Vista Jerárquica (Estancias)</strong> para registrar fallas específicas en los componentes de los vehículos. Esta tabla plana sirve para consultas y edición rápida de órdenes existentes.
            </p>
          </AlertDescription>
        </Alert>
      )}
      <SpreadsheetTable<WorkshopWorkOrderReplicaEntity>
        stateKey="maintenance-jobs-table"
        canManage={canManage}
        pageSize={10}
        data={workOrders}
        columns={woColumns as any}
        filters={tableFilters}
        draggableRows={true}
        onRowReorder={(from, to, newData) => console.log('Reordered jobs:', from, to)}
        searchPlaceholder="Buscar orden de trabajo..."
        searchFilter={(row, term) => [row.workOrderFolio, row.stayFolio, row.description].some((v) => v?.toLowerCase().includes(term))}
        actionLabel={undefined}
        onAction={undefined}
        onEdit={(wo) => { setSelectedWo(wo); setIsWoWizardOpen(true); }}
        rowActions={[
          {
            label: 'Cerrar Orden',
            icon: <CheckCircle className="size-3.5" />,
            onClick: (wo) => { setSelectedWo(wo); setIsCloseDialogOpen(true); },
            variant: 'ghost',
            className: 'text-[#1a5c3a] hover:bg-[#1a5c3a]/10',
          }
        ]}
        onView={(wo) => { setDetailWo(wo); setIsWoDetailsOpen(true); }}
        onDelete={async (wo) => {
          try {
            await deleteWorkOrder.mutateAsync(wo.id)
            return { ok: true }
          } catch (e: any) {
            return { ok: false, error: { message: e.message || 'Error al eliminar orden de trabajo' } }
          }
        }}
        onExport={() => setExportModalOpen(true)}
        emptyState={{ icon: Wrench, title: 'Sin órdenes de trabajo', description: 'No hay registros de órdenes actualmente.' }}
      />

      <WorkOrderWizard
        key={`wo-${selectedWo?.id ?? 'new'}-${isWoWizardOpen}`}
        isOpen={isWoWizardOpen && !!selectedWo}
        onClose={() => setIsWoWizardOpen(false)}
        stayId={selectedWo?.stayId ?? ''}
        stayFolio={selectedWo?.stayFolio ?? ''}
        catalogs={catalogs}
        initialData={selectedWo}
      />

      <CloseWorkOrderDialog
        isOpen={isCloseDialogOpen}
        onClose={() => { setIsCloseDialogOpen(false); setSelectedWo(null); }}
        workOrder={selectedWo}
      />

      <WorkOrderDetailsDialog
        isOpen={isWoDetailsOpen}
        onClose={() => { setIsWoDetailsOpen(false); setDetailWo(null) }}
        workOrder={detailWo}
      />

      <Dialog
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Exportar Trabajos a Excel"
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
