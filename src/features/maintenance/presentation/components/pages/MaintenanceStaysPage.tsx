'use client'

import React, { useMemo, useState } from 'react'
import { ClipboardList, Wrench, CheckCircle, Zap } from 'lucide-react'
import { useWorkshopStays, useDeleteWorkshopStay } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkshopStayReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { StayWizard } from '../organisms/StayWizard'
import { CloseWorkshopStayDialog } from '../organisms/CloseWorkshopStayDialog'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { SpreadsheetTable, type SpreadsheetColumn, type TableFilterConfig } from '@/src/core/presentation/components/ui/SpreadsheetTable'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/src/core/presentation/components/ui/alert'
import { StayDetailsDialog } from '../organisms/StayDetailsDialog'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export default function MaintenanceStaysPage() {
  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))

  const staysQuery = useWorkshopStays({ pageSize: 5000 })
  const staysPaginated = staysQuery.data
  const stays = staysPaginated?.data ?? []
  const deleteStay = useDeleteWorkshopStay()

  const [isStayWizardOpen, setIsStayWizardOpen] = useState(false)
  const [selectedStay, setSelectedStay] = useState<WorkshopStayReplicaEntity | null>(null)

  const [isStayDetailsOpen, setIsStayDetailsOpen] = useState(false)
  const [detailStay, setDetailStay] = useState<WorkshopStayReplicaEntity | null>(null)
  const [detailStayTab, setDetailStayTab] = useState<'general' | 'orders'>('general')

  const [isCloseStayOpen, setIsCloseStayOpen] = useState(false)
  const [stayToClose, setStayToClose] = useState<WorkshopStayReplicaEntity | null>(null)

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')

  const confirmExport = () => {
    alert(`Exportando estancias (Desde: ${exportStartDate || 'siempre'}, Hasta: ${exportEndDate || 'siempre'})`)
    setExportModalOpen(false)
  }

  const tableFilters = useMemo((): TableFilterConfig<WorkshopStayReplicaEntity>[] => [
    {
      id: 'status',
      label: 'Estado',
      type: 'select',
      options: [
        { value: 'entered', label: 'Ingresada' },
        { value: 'in_workshop', label: 'En Taller' },
        { value: 'completed', label: 'Terminada' },
        { value: 'released', label: 'Liberada' },
      ],
    },
    {
      id: 'enteredAt',
      label: 'Fecha de Ingreso',
      type: 'date-range',
      filterFn: (row, value) => {
        if (!row.enteredAt) return false;
        const d = new Date(row.enteredAt).getTime();
        const start = value.start ? new Date(value.start + 'T00:00:00').getTime() : null;
        const end = value.end ? new Date(value.end + 'T23:59:59').getTime() : null;
        
        if (start && d < start) return false;
        if (end && d > end) return false;
        return true;
      }
    }
  ], []);

  const staysColumns = useMemo<SpreadsheetColumn<WorkshopStayReplicaEntity>[]>(() => [
    { key: 'seq', header: 'No. Secuencial', resizable: true, filterable: true, render: (s) => <div className="text-sm">{String(s.sequentialNumber)}</div> },
    { key: 'folio', header: 'Folio de Estancia', resizable: true, filterable: true, render: (s) => <div className="font-mono font-bold text-stone-900">{s.folio}</div> },
    { key: 'entered', header: 'Fecha de ingreso', resizable: true, render: (s) => <div className="text-sm">{dateFmt.format(new Date(s.enteredAt))}</div> },
    { key: 'exited', header: 'Fecha de salida', resizable: true, render: (s) => <div className="text-sm">{s.exitedAt ? dateFmt.format(new Date(s.exitedAt)) : '—'}</div> },
    { key: 'days', header: 'Días en Taller', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.daysInShop === null ? '—' : String(s.daysInShop)}</div> },
    { key: 'reason', header: 'Motivo', resizable: true, filterable: true, render: (s) => <div className="text-sm max-w-xs truncate">{s.reason}</div> },
    { key: 'cost', header: 'Costo Total', resizable: true, render: (s) => <div className="text-sm">{money.format(s.totalCost)}</div> },
    { key: 'eco', header: 'No. Económico', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.economicNumber || '—'}</div> },
    { key: 'type', header: 'Tipo de Vehículo', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.vehicleType}</div> },
    { key: 'plates', header: 'Placas', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.plates || '—'}</div> },
    { key: 'delivered', header: 'Entregado Por', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.deliveredByEmployeeName || '—'}</div> },
    { key: 'received', header: 'Recibido Por', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.receivedByProfileName || '—'}</div> },
    { key: 'pickedup', header: 'Recogido Por', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.pickedUpByEmployeeName || '—'}</div> },
    { key: 'km', header: 'Km de Ingreso', resizable: true, render: (s) => <div className="text-sm">{s.kmAtEntry ?? '—'}</div> },
    { key: 'km_last', header: 'KM Último Servicio', resizable: true, render: (s) => <div className="text-sm">{s.kmLastService ?? '—'}</div> },
    { 
      key: 'last_trip_start', 
      header: 'Inicio de último Viaje', 
      resizable: true,
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
    },
    { key: 'notes', header: 'Observaciones', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.notes || '—'}</div> },
    { key: 'last_client', header: 'Último Cliente', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.lastClientName || '—'}</div> },
    { key: 'last_dest', header: 'Último Destino', resizable: true, filterable: true, render: (s) => <div className="text-sm">{s.lastDestination || '—'}</div> },
  ], [])

  return (
    <div className="flex flex-col gap-6">
      <Alert className="bg-amber-500/10 text-amber-900 border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-200">
        <Zap className="h-4 w-4 !text-amber-600 dark:!text-amber-400" />
        <AlertTitle className="text-amber-800 dark:text-amber-300 font-bold">Mantenimiento Predictivo Activo</AlertTitle>
        <AlertDescription className="text-amber-700/90 dark:text-amber-400/90 mt-1">
          Usa la <strong>Vista Jerárquica (Detalles de Estancia)</strong> para registrar fallas específicas en los componentes de los vehículos. Esta información alimenta nuestro modelo predictivo para prevenir futuras averías. La vista plana sigue disponible para consultas rápidas.
        </AlertDescription>
      </Alert>

      <SpreadsheetTable<WorkshopStayReplicaEntity>
        stateKey="maintenance-stays-table"
        canManage={canManage}
        pageSize={10}
        data={stays}
        columns={staysColumns}
        filters={tableFilters}
        draggableRows={true}
        onRowReorder={(from, to, newData) => console.log('Reordered stays:', from, to)}
        searchPlaceholder="Buscar estancia..."
        searchFilter={(row, term) => [row.folio, row.reason, row.economicNumber].some((v) => v?.toLowerCase().includes(term))}
        actionLabel="Nueva Estancia"
        onAction={() => { setSelectedStay(null); setIsStayWizardOpen(true); }}
        onEdit={(s) => { setSelectedStay(s); setIsStayWizardOpen(true); }}
        rowActions={[
          {
            label: 'Cerrar Estadía',
            icon: <CheckCircle className="size-3.5" />,
            onClick: (s) => { setStayToClose(s); setIsCloseStayOpen(true) },
            variant: 'ghost',
            className: 'text-[#1a5c3a] hover:bg-[#1a5c3a]/10',
          },
          {
            label: 'Ver Trabajos',
            icon: <Wrench className="size-3.5" />,
            onClick: (s) => { setDetailStay(s); setDetailStayTab('orders'); setIsStayDetailsOpen(true) },
            variant: 'ghost',
            className: 'text-[#006d37] hover:bg-[#006d37]/10',
          }
        ]}
        onView={(s) => { setDetailStay(s); setDetailStayTab('general'); setIsStayDetailsOpen(true); }}
        onDelete={async (s) => {
          try {
            await deleteStay.mutateAsync(s.id)
            return { ok: true }
          } catch (e: any) {
            return { ok: false, error: { message: e.message || 'Error al eliminar estancia' } }
          }
        }}
        onExport={() => setExportModalOpen(true)}
        emptyState={{ icon: ClipboardList, title: 'Sin estancias', description: 'No hay registros de estancias actualmente.' }}
      />

      <StayWizard 
        key={`stay-${selectedStay?.id ?? 'new'}-${isStayWizardOpen}`} 
        isOpen={isStayWizardOpen} 
        onClose={() => setIsStayWizardOpen(false)} 
        initialData={selectedStay} 
      />

      <StayDetailsDialog 
        isOpen={isStayDetailsOpen} 
        onClose={() => { setIsStayDetailsOpen(false); setDetailStay(null) }} 
        stay={detailStay}
        defaultTab={detailStayTab}
      />

      <CloseWorkshopStayDialog
        isOpen={isCloseStayOpen}
        onClose={() => { setIsCloseStayOpen(false); setStayToClose(null) }}
        stay={stayToClose}
      />

      <Dialog
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Exportar Estancias a Excel"
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
