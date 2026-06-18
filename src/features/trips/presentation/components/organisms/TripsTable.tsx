'use client'

/**
 * @fileoverview Componente principal de la tabla de Viajes (Trips).
 * Utiliza CrudDataTable y orquesta la apertura del TripWizard y TripDetailsDialog.
 *
 * @organism
 */

import { useCallback, useMemo, useState } from 'react'
import {  MapPin, Briefcase } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { TripWizard } from './TripWizard'
import { TripDetailsDialog } from './TripDetailsDialog'
import { ConfirmDialog } from '@/src/core/presentation/components/molecules/confirm-dialog'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Label } from '@/src/core/presentation/components/ui/label'
import { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import { ClientEntity } from '@/src/features/clients/domain/entities'
import type { TripWithRelations, TripStatus } from '@/src/features/trips/domain/entities/trip-entity'
import { useTripsList } from '../../hooks/use-trips'
import { deleteTripAction, updateTripStatusAction } from '@/src/features/trips/presentation/actions/trips.actions'
import type { TripsListFilters } from '@/src/features/trips/domain/repositories/i-trips-repository'
import { canManageTripsForClient } from '@/src/features/trips/domain/rules/client-access'
import { toast } from 'sonner'
import * as XLSX from 'xlsx'

// ── Entidades de vista ────────────────────────────────────────────────────────

export interface TripsTableRowEntity {
  id: string
  folio: string
  clientId: string
  clientName: string // e.g. "Walmart"
  origin: string
  destination: string
  departureDate: string | null
  actualDepartureDate: string | null
  status: TripStatus
  unitAssemblyId: string | null
  unitEconomicNumber: string | null
  operatorName: string | null
  isFullAssembly: boolean

  tripNumberClient: number | null
  observations: string | null
  clientSpecificData: Record<string, unknown> | null
  
  // Datos específicos Walmart (si aplica)
  walmartData?: {
    coordinatorName: string | null
    route: string | null
    cargoType: string | null
    cartaPorteWalmart: string | null
    numStores: number | null
    statusWalmart: string | null
    strNumLoad: string | null
    strComplementCartaPorte: string | null
    strPreinvoiceKm: number | null
    strKmTraveled: number | null
    strDiesel: number | null
    strCasetas: number | null
    strTotalInvoice: number | null
    dhdNumLoad: string | null
    dhdComplementCartaPorte: string | null
    dhdPreinvoiceKm: number | null
    dhdKmTraveled: number | null
    dhdDiesel: number | null
    dhdCasetas: number | null
    dhdTotalInvoice: number | null
    dettesLog: unknown
    departureTemperature: string | null
    departureTime: string | null
    incidencias: string | null
  }
}

const STATUS_MAP: Record<TripStatus, { label: string; className: string }> = {
  scheduled: { label: 'Programado', className: 'bg-amber-500/10 text-amber-600 border-amber-300' },
  in_progress: { label: 'En Ruta', className: 'bg-blue-500/10 text-blue-600 border-blue-300' },
  in_delivery: { label: 'En Reparto', className: 'bg-cyan-500/10 text-cyan-600 border-cyan-300' },
  completed: { label: 'Completado', className: 'bg-emerald-600 text-white font-bold' },
  cancelled: { label: 'Cancelado', className: 'bg-stone-200 text-stone-700' },
}

const STATUS_OPTIONS: TripStatus[] = ['scheduled', 'in_progress', 'in_delivery', 'completed', 'cancelled']

// ── Props & Componente ────────────────────────────────────────────────────────

interface TripsTableProps {
  clients?: ClientEntity[]
  units?: UnitAssemblyEntity[]
  trips?: TripWithRelations[]
  filters?: TripsListFilters
}

function mapToRowEntity(item: TripWithRelations): TripsTableRowEntity {
  const folio = item.trip.tripNumber !== null
    ? `VJE-${String(item.trip.tripNumber).padStart(6, '0')}`
    : (item.trip.folio ?? item.trip.id)
  return {
    id: item.trip.id,
    folio,
    clientId: item.trip.clientId ?? '',
    clientName: item.clientName ?? '—',
    origin: item.trip.origin ?? '',
    destination: item.trip.destination ?? '',
    departureDate: item.trip.departureDate ? item.trip.departureDate.toISOString() : null,
    actualDepartureDate: item.trip.actualDepartureDate ? item.trip.actualDepartureDate.toISOString() : null,
    status: item.trip.status,
    unitAssemblyId: item.trip.unitAssemblyId,
    unitEconomicNumber: item.unitEconomicNumber,
    operatorName: item.operatorName,
    isFullAssembly: item.isFullAssembly,
    tripNumberClient: item.trip.tripNumberClient ?? null,
    observations: item.trip.observations ?? null,
    clientSpecificData: item.trip.clientSpecificData ?? null,
    walmartData: item.walmartData ?? undefined,
  }
}



import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'
import { exportTripsToExcel } from '../../utils/export-trips-excel'

export function TripsTable({ clients = [], units = [], trips = [], filters }: TripsTableProps) {
  const tripsQuery = useTripsList(filters, filters ? undefined : trips)
  const rawTrips = tripsQuery.data
  const rows = useMemo(() => {
    const list = (tripsQuery.data ?? []).map(mapToRowEntity)
    return list.sort((a, b) => {
      const dateA = a.departureDate ? new Date(a.departureDate).getTime() : 0
      const dateB = b.departureDate ? new Date(b.departureDate).getTime() : 0
      return dateB - dateA
    })
  }, [tripsQuery.data])

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TripsTableRowEntity | null>(null)
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<TripsTableRowEntity | null>(null)

  const canManageAll = useAuthStore((state) => state.hasPermission('trips:manage_all'))
  const canManageWalmart = useAuthStore((state) => state.hasPermission('trips:manage_walmart'))
  const canManageLogistics = useAuthStore((state) => state.hasPermission('trips:manage_logistica'))

  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState<{
    tripId: string
    folio: string
    from: TripStatus
    to: TripStatus
  } | null>(null)

  const [exportModalOpen, setExportModalOpen] = useState(false)
  const [exportDataToFilter, setExportDataToFilter] = useState<TripsTableRowEntity[] | null>(null)
  const [exportStartDate, setExportStartDate] = useState('')
  const [exportEndDate, setExportEndDate] = useState('')

  // Determinar si puede editar una fila específica
  const canEditRow = useCallback((row: TripsTableRowEntity) => {
    return canManageTripsForClient({
      clientName: row.clientName,
      canManageAll,
      canManageWalmart,
      canManageLogistics,
    })
  }, [canManageAll, canManageWalmart, canManageLogistics])

  const canCreate = canManageAll || canManageWalmart || canManageLogistics
  const canDelete = canManageAll

  const unitsMap = useMemo(() => {
    return new Map(units.map((unit) => [unit.id, unit]))
  }, [units])

  const rawTripsMap = useMemo(() => {
    return new Map((rawTrips ?? []).map((item) => [item.trip.id, item]))
  }, [rawTrips])

  const creatableClients = canManageAll
    ? clients
    : clients.filter((c) => {
        const name = c.tradeName ?? c.companyName ?? ''
        return canManageTripsForClient({
          clientName: name,
          canManageAll,
          canManageWalmart,
          canManageLogistics,
        })
      })

  const handleView = (row: TripsTableRowEntity) => {
    setDetailRow(row)
    setIsDetailsOpen(true)
  }

  const handleEdit = (row: TripsTableRowEntity) => {
    setSelectedRow(row)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedRow(null)
  }

  const handleExportTrips = (filteredRows: TripsTableRowEntity[]) => {
    if (!filteredRows.length) {
      toast.error('No hay viajes para exportar')
      return
    }
    setExportDataToFilter(filteredRows)
    setExportModalOpen(true)
  }

  const confirmExportTrips = () => {
    if (!exportDataToFilter) return

    let finalRows = exportDataToFilter

    if (exportStartDate) {
      const startStr = exportStartDate + 'T00:00:00'
      const start = new Date(startStr)
      finalRows = finalRows.filter(r => {
        const tripItem = rawTripsMap.get(r.id)
        if (!tripItem?.trip.departureDate) return false
        return new Date(tripItem.trip.departureDate) >= start
      })
    }

    if (exportEndDate) {
      const endStr = exportEndDate + 'T23:59:59'
      const end = new Date(endStr)
      finalRows = finalRows.filter(r => {
        const tripItem = rawTripsMap.get(r.id)
        if (!tripItem?.trip.departureDate) return false
        return new Date(tripItem.trip.departureDate) <= end
      })
    }

    if (finalRows.length === 0) {
      toast.error('No hay viajes en el rango de fechas seleccionado')
      return
    }

    exportTripsToExcel({
      filteredRows: finalRows,
      rawTripsMap,
      unitsMap,
    })
    
    setExportModalOpen(false)
  }

  const columns = useMemo((): CrudColumn<TripsTableRowEntity>[] => {
    const selectedClient = filters?.clientId ? clients.find(c => c.id === filters.clientId) : null
    const isWalmartSelected = !!selectedClient && (
      selectedClient.tradeName?.toLowerCase().includes('walmart') ||
      selectedClient.companyName?.toLowerCase().includes('walmart')
    )

    const isHolcimSelected = !!selectedClient && (
      selectedClient.tradeName?.toLowerCase().includes('holcim') ||
      selectedClient.companyName?.toLowerCase().includes('holcim')
    )

    const normalizedClientLabel = selectedClient ? (selectedClient.tradeName ?? selectedClient.companyName ?? '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, "") : ''
    const isBarichonSelected = [
      'altopetrum',
      'solinmar',
      'soluciones integrales maritimas',
    ].some((k) => normalizedClientLabel.includes(k))

    const baseColumns: CrudColumn<TripsTableRowEntity>[] = [
      {
        header: 'Viaje',
        cell: (row) => (
          <div className="flex flex-col">
            <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors font-mono">
              {row.folio}
            </span>
          </div>
        ),
      },
      {
        header: 'Fecha',
        cell: (row) => {
          if (!row.departureDate) return <span className="text-stone-400">—</span>
          const d = new Date(row.departureDate)
          const dateStr = d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' })
          const timeStr = d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', hour12: false })
          return (
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200 capitalize">{dateStr}</span>
              <span className="text-xs text-stone-500 dark:text-zinc-400">{timeStr} hrs</span>
            </div>
          )
        }
      },
      {
        header: 'Ruta',
        cell: (row) => (
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400">
              <MapPin className="size-3 text-stone-400" />
              <span className="truncate max-w-[120px]">{row.origin || '—'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400 mt-0.5">
              <MapPin className="size-3 text-[#006d37] dark:text-primary-container" />
              <span className="truncate max-w-[120px]">{row.destination || '—'}</span>
            </div>
          </div>
        ),
      },
      ...(selectedClient ? [] : [{
        header: 'Cliente',
        cell: (row: TripsTableRowEntity) => (
          <div className="flex items-center gap-2 min-w-[120px]">
            <div className="p-1.5 rounded bg-stone-100 dark:bg-zinc-800">
              <Briefcase className="size-3 text-stone-500 dark:text-zinc-400" />
            </div>
            <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
              {row.clientName}
            </span>
          </div>
        ),
      }]),
      {
        header: 'Unidad / Operador',
        cell: (row) => (
          <div className="flex flex-col gap-0.5 min-w-[150px]">
            <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
              {row.unitEconomicNumber ?? '—'}
            </span>
            <span className="text-[11px] text-stone-400 dark:text-zinc-500">
              {row.operatorName ?? 'Sin operador'}
            </span>
          </div>
        ),
      },
      {
        header: 'Estado',
        cell: (row) => {
          const cfg = STATUS_MAP[row.status] ?? { label: row.status, className: 'bg-stone-100 text-stone-600' }

          if (!canEditRow(row)) {
            return <Badge className={cfg.className}>{cfg.label}</Badge>
          }

          return (
            <div onClick={(e) => e.stopPropagation()}>
              <select
                className="h-8 rounded-lg border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 text-xs text-stone-900 dark:text-zinc-100"
                value={row.status}
                onChange={(e) => {
                  const next = e.target.value as TripStatus
                  if (next === row.status) return
                  setPendingStatusUpdate({ tripId: row.id, folio: row.folio, from: row.status, to: next })
                  setIsStatusDialogOpen(true)
                }}
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_MAP[s]?.label ?? s}
                  </option>
                ))}
              </select>
            </div>
          )
        },
      },
    ]

    if (isWalmartSelected) {
      const walmartColumns: CrudColumn<TripsTableRowEntity>[] = [
        { header: 'W: Coordinador', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{row.walmartData?.coordinatorName || '—'}</span> },
        { header: 'W: Ruta Walmart', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{row.walmartData?.route || '—'}</span> },
        { header: 'W: Tipo Carga', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.cargoType || '—'}</span> },
        { header: 'W: Carta Porte', cell: (row) => <span className="text-sm font-mono min-w-[100px] inline-block">{row.walmartData?.cartaPorteWalmart || '—'}</span> },
        { header: 'W: Estatus Walmart', cell: (row) => <span className="text-sm font-semibold text-[#1a5c3a] dark:text-primary-container min-w-[120px] inline-block">{row.walmartData?.statusWalmart || '—'}</span> },
        { header: 'W: Tiendas', cell: (row) => <span className="text-sm min-w-[80px] inline-block">{row.walmartData?.numStores ?? '—'}</span> },
        { header: 'W: Temp. Salida', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.departureTemperature || '—'}</span> },
        { 
          header: 'W: Hora Salida', 
          cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.departureTime ? new Date(row.walmartData.departureTime).toLocaleString('es-MX', { hour12: false }) : '—'}</span> 
        },
        { header: 'W: STR Num Load', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.strNumLoad || '—'}</span> },
        { header: 'W: STR Compl. CP', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.strComplementCartaPorte || '—'}</span> },
        { header: 'W: STR KM Pre-fact', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.strPreinvoiceKm ?? '—'}</span> },
        { header: 'W: STR KM Recorridos', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.strKmTraveled ?? '—'}</span> },
        { header: 'W: STR Diesel', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.strDiesel ?? '—'}</span> },
        { header: 'W: STR Casetas', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.strCasetas ?? '—'}</span> },
        { header: 'W: STR Total Facturado', cell: (row) => <span className="text-sm min-w-[100px] inline-block font-semibold">{row.walmartData?.strTotalInvoice ?? '—'}</span> },
        { header: 'W: DHD Num Load', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.dhdNumLoad || '—'}</span> },
        { header: 'W: DHD Compl. CP', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.dhdComplementCartaPorte || '—'}</span> },
        { header: 'W: DHD KM Pre-fact', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.dhdPreinvoiceKm ?? '—'}</span> },
        { header: 'W: DHD KM Recorridos', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.dhdKmTraveled ?? '—'}</span> },
        { header: 'W: DHD Diesel', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.dhdDiesel ?? '—'}</span> },
        { header: 'W: DHD Casetas', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{row.walmartData?.dhdCasetas ?? '—'}</span> },
        { header: 'W: DHD Total Facturado', cell: (row) => <span className="text-sm min-w-[100px] inline-block font-semibold">{row.walmartData?.dhdTotalInvoice ?? '—'}</span> },
        { header: 'W: Incidencias', cell: (row) => <span className="text-sm min-w-[200px] inline-block truncate" title={row.walmartData?.incidencias || ''}>{row.walmartData?.incidencias || '—'}</span> },
      ]
      return [...baseColumns, ...walmartColumns]
    }

    if (isHolcimSelected) {
      const holcimColumns: CrudColumn<TripsTableRowEntity>[] = [
        { header: 'H: Núm. Viaje', cell: (row) => <span className="text-sm min-w-[100px] inline-block font-mono">{row.tripNumberClient ?? '—'}</span> },
        { header: 'H: Remisión', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.holcim?.remision as string) || '—'}</span> },
        { header: 'H: Factura', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.holcim?.factura as string) || '—'}</span> },
        { header: 'H: Gastos Revisados', cell: (row) => {
            const exp = (row.clientSpecificData as Record<string, any>)?.holcim?.expensesReviewed
            const val = typeof exp === 'string' ? exp : (exp === true ? 'Sí' : '—')
            return <span className="text-sm min-w-[120px] inline-block">{val}</span>
        } },
      ]
      return [...baseColumns, ...holcimColumns]
    }

    if (isBarichonSelected) {
      const barichonColumns: CrudColumn<TripsTableRowEntity>[] = [
        { header: 'B: Núm. Viaje', cell: (row) => <span className="text-sm min-w-[100px] inline-block font-mono">{row.tripNumberClient ?? '—'}</span> },
        { header: 'B: Ticket', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.ticket as string) || '—'}</span> },
        { header: 'B: Descarga', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.unloading as string) || '—'}</span> },
        { header: 'B: Peso Bruto', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.weight?.gross as number) ?? '—'}</span> },
        { header: 'B: Tara', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.weight?.tare as number) ?? '—'}</span> },
        { header: 'B: Peso Neto', cell: (row) => <span className="text-sm min-w-[100px] inline-block font-semibold">{((row.clientSpecificData as Record<string, any>)?.barichon?.weight?.net as number) ?? '—'}</span> },
        { header: 'B: Remisión', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.remision as string) || '—'}</span> },
        { header: 'B: Factura', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.factura as string) || '—'}</span> },
        { header: 'B: Material', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.material as string) || '—'}</span> },
        { header: 'B: PO', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.po as string) || '—'}</span> },
        { header: 'B: Total', cell: (row) => <span className="text-sm min-w-[100px] inline-block font-semibold">{((row.clientSpecificData as Record<string, any>)?.barichon?.total as number) ?? '—'}</span> },
        { header: 'B: Gastos Revisados', cell: (row) => <span className="text-sm min-w-[120px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.expensesReviewed as string) || '—'}</span> },
        { header: 'B: Placas Tracto', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.unit?.truckPlates as string) || '—'}</span> },
        { header: 'B: Placas Tolva', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.unit?.trailerPlates as string) || '—'}</span> },
        { header: 'B: Placas Tolva 2', cell: (row) => <span className="text-sm min-w-[100px] inline-block">{((row.clientSpecificData as Record<string, any>)?.barichon?.unit?.trailer2Plates as string) || '—'}</span> },
      ]
      return [...baseColumns, ...barichonColumns]
    }

    return baseColumns
  }, [canEditRow, filters?.clientId, clients])

  const selectedClient = filters?.clientId ? clients.find(c => c.id === filters.clientId) : null
  const selectedClientName = selectedClient ? (selectedClient.tradeName ?? selectedClient.companyName ?? '').replace(/\s*\(.*?\)\s*/g, '').trim() : ''

  return (
    <>
      <CrudDataTable<TripsTableRowEntity>
        title={
          selectedClient ? (
            <h2 className="text-2xl font-bold text-stone-900 dark:text-zinc-100">
              Bitácora {selectedClientName}
            </h2>
          ) : undefined
        }
        data={rows}
        isLoading={tripsQuery.isLoading}
        columns={columns}
        searchPlaceholder="Buscar por folio, cliente u origen..."
        searchFilter={(row, term) =>
          [row.folio, row.clientName, row.origin, row.destination, row.unitEconomicNumber]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel={canCreate ? "Nuevo Viaje" : undefined}
        onAction={canCreate ? () => { setSelectedRow(null); setIsWizardOpen(true) } : undefined}
        onView={handleView}
        onEdit={handleEdit}
        canEdit={canEditRow}
        onDelete={canDelete ? async (id) => {
          const result = await deleteTripAction(id)
          if (result.ok) {
            await tripsQuery.refetch()
            return { ok: true }
          }
          return { ok: false, error: { message: result.error.message } }
        } : undefined}
        emptyState={{
          icon: MapPin,
          title: 'Sin viajes registrados',
          description: 'Aún no hay viajes registrados en el sistema.',
        }}
        onExport={handleExportTrips}
      />

      {/* Pasa los clientes y unidades al wizard para que arme el dropdown */}
      <TripWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        onSaved={async () => {
          await tripsQuery.refetch()
        }}
        tripRow={selectedRow ?? undefined}
        clients={creatableClients}
        units={units}
      />

      <TripDetailsDialog
        isOpen={isDetailsOpen}
        tripRow={detailRow}
        onClose={() => { setIsDetailsOpen(false); setDetailRow(null) }}
      />

      <Dialog
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Exportar viajes a Excel"
        description="Selecciona un rango de fechas de salida para filtrar los viajes a exportar. Si lo dejas en blanco, se exportarán todos los viajes de la vista actual."
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
              onClick={confirmExportTrips}
              className="bg-[#1a5c3a] text-white hover:bg-[#124029]"
            >
              Descargar Excel
            </Button>
          </div>
        </div>
      </Dialog>

      <ConfirmDialog
        isOpen={isStatusDialogOpen}
        onClose={() => {
          if (isUpdatingStatus) return
          setIsStatusDialogOpen(false)
          setPendingStatusUpdate(null)
        }}
        onConfirm={async () => {
          if (!pendingStatusUpdate) return
          try {
            setIsUpdatingStatus(true)
            const result = await updateTripStatusAction(pendingStatusUpdate.tripId, pendingStatusUpdate.to)
            if (!result.ok) {
              toast.error(result.error.message)
              return
            }
            toast.success('Estado actualizado')
            setIsStatusDialogOpen(false)
            setPendingStatusUpdate(null)
            await tripsQuery.refetch()
          } finally {
            setIsUpdatingStatus(false)
          }
        }}
        isLoading={isUpdatingStatus}
        title="Cambiar estado del viaje"
        description={
          pendingStatusUpdate
            ? `Vas a cambiar ${pendingStatusUpdate.folio} de "${STATUS_MAP[pendingStatusUpdate.from]?.label ?? pendingStatusUpdate.from}" a "${STATUS_MAP[pendingStatusUpdate.to]?.label ?? pendingStatusUpdate.to}". ¿Deseas continuar?`
            : '¿Deseas cambiar el estado del viaje?'
        }
        confirmLabel="Actualizar"
        cancelLabel="Cancelar"
        variant="warning"
      />
    </>
  )
}
