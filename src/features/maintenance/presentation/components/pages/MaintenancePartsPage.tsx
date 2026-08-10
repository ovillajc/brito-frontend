'use client'

import React, { useMemo, useState } from 'react'
import { Settings, Info } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/src/core/presentation/components/ui/alert'
import { useAllWorkOrderParts, useMaintenanceCatalogs, useDeleteWorkOrderPart } from '@/src/features/maintenance/presentation/hooks/use-maintenance'
import type { WorkOrderPartReplicaEntity } from '@/src/features/maintenance/domain/entities/maintenance-entity'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { SpreadsheetTable, type SpreadsheetColumn } from '@/src/core/presentation/components/ui/SpreadsheetTable'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Label } from '@/src/core/presentation/components/ui/label'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Button } from '@/src/core/presentation/components/ui/button'
import { WorkOrderPartDetailsDialog } from '../organisms/WorkOrderPartDetailsDialog'
import { WorkOrderPartWizard } from '../organisms/WorkOrderPartWizard'

const dateFmt = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium' })
const money = new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 0 })

export default function MaintenancePartsPage() {
  const canManage = useAuthStore((state) => state.hasPermission('maintenance:manage'))

  const partsQuery = useAllWorkOrderParts({ pageSize: 5000 })
  const parts = partsQuery.data?.data ?? []
  const catalogsQuery = useMaintenanceCatalogs()
  const catalogs = catalogsQuery.data ?? null
  const deletePart = useDeleteWorkOrderPart()

  const [isPartWizardOpen, setIsPartWizardOpen] = useState(false)
  const [selectedPart, setSelectedPart] = useState<WorkOrderPartReplicaEntity | null>(null)

  const [isPartDetailsOpen, setIsPartDetailsOpen] = useState(false)
  const [detailPart, setDetailPart] = useState<WorkOrderPartReplicaEntity | null>(null)

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')

  const confirmExport = () => {
    alert(`Exportando gastos (Desde: ${exportStartDate || 'siempre'}, Hasta: ${exportEndDate || 'siempre'})`)
    setExportModalOpen(false)
  }

  const partsColumns = useMemo<SpreadsheetColumn<WorkOrderPartReplicaEntity>[]>(() => [
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
    <div className="flex flex-col gap-6">
      {canManage && (
        <Alert className="bg-stone-50/50 dark:bg-zinc-900/50 border-stone-200 dark:border-zinc-800">
          <Info className="h-4 w-4 !text-stone-500" />
          <AlertTitle className="text-stone-800 dark:text-stone-300 font-bold">Registro de Gastos</AlertTitle>
          <AlertDescription className="text-stone-600 dark:text-stone-400 mt-1">
            <p>
              Para <strong>registrar gastos a una orden de trabajo</strong>, te recomendamos usar la pestaña de <strong>Estancias</strong>, abrir los detalles de una estancia, seleccionar la orden y usar el botón de agregar gastos en la vista dividida. Esta tabla plana sirve para visualizar, exportar, y gestionar todos los gastos existentes.
            </p>
          </AlertDescription>
        </Alert>
      )}

      <SpreadsheetTable<WorkOrderPartReplicaEntity>
        canManage={canManage}
        pageSize={10}
        data={parts}
        columns={partsColumns as any}
        searchPlaceholder="Buscar gastos..."
        searchFilter={(row, term) => [row.workOrderFolio, row.description, row.brand].some((v) => v?.toLowerCase().includes(term))}
        actionLabel="Nuevo Gasto"
        onAction={() => { setSelectedPart(null); setIsPartWizardOpen(true); }}
        onEdit={(p) => { setSelectedPart(p); setIsPartWizardOpen(true); }}
        onView={(p) => { setDetailPart(p); setIsPartDetailsOpen(true); }}
        onDelete={async (p) => {
          try {
            await deletePart.mutateAsync(p.id)
            return { ok: true }
          } catch (e: any) {
            return { ok: false, error: { message: e.message || 'Error al eliminar gasto' } }
          }
        }}
        onExport={() => setExportModalOpen(true)}
        emptyState={{ icon: Settings, title: 'Sin gastos', description: 'No hay registros de gastos actualmente.' }}
      />

      <WorkOrderPartWizard
        key={`part-${selectedPart?.id ?? 'new'}-${isPartWizardOpen}`}
        isOpen={isPartWizardOpen}
        onClose={() => setIsPartWizardOpen(false)}
        workOrderId={selectedPart?.workOrderId || null}
        catalogs={catalogs}
        initialData={selectedPart}
      />

      <WorkOrderPartDetailsDialog
        isOpen={isPartDetailsOpen}
        onClose={() => { setIsPartDetailsOpen(false); setDetailPart(null) }}
        part={detailPart}
      />

      <Dialog
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Exportar Gastos a Excel"
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
