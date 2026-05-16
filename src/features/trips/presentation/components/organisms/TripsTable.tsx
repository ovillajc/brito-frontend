'use client'

/**
 * @fileoverview Componente principal de la tabla de Viajes (Trips).
 * Utiliza CrudDataTable y orquesta la apertura del TripWizard y TripDetailsDialog.
 *
 * @organism
 */

import { useState } from 'react'
import { MapPin, Briefcase } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { TripWizard } from './TripWizard'
import { TripDetailsDialog } from './TripDetailsDialog'
import { ClientEntity, UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import type { TripWithRelations, TripStatus } from '@/src/features/trips/domain/entities/trip-entity'
import { useTripsList } from '../../hooks/use-trips'
import { deleteTripAction } from '@/src/features/trips/presentation/actions/trips.actions'
import type { TripsListFilters } from '@/src/features/trips/domain/repositories/i-trips-repository'
import { isLogisticsAllowedClientName, isWalmartClientName } from '@/src/features/trips/domain/rules/client-access'

// ── Entidades de vista ────────────────────────────────────────────────────────

export interface TripsTableRowEntity {
  id: string
  folio: string
  clientId: string
  clientName: string // e.g. "Walmart"
  origin: string
  destination: string
  departureDate: string | null
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
    cartaPorteWalmart: string | null
    numStores: number | null
  }
}

// ── Definición de columnas ───────────────────────────────────────────────────

const TRIPS_COLUMNS: CrudColumn<TripsTableRowEntity>[] = [
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
  {
    header: 'Cliente',
    cell: (row) => (
      <div className="flex items-center gap-2">
        <div className="p-1.5 rounded bg-stone-100 dark:bg-zinc-800">
          <Briefcase className="size-3 text-stone-500 dark:text-zinc-400" />
        </div>
        <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
          {row.clientName}
        </span>
      </div>
    ),
  },
  {
    header: 'Unidad / Operador',
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
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
      const map: Record<TripStatus, { label: string; className: string }> = {
        scheduled: { label: 'Programado', className: 'bg-amber-500/10 text-amber-600 border-amber-300' },
        in_progress: { label: 'En Ruta', className: 'bg-blue-500/10 text-blue-600 border-blue-300' },
        in_delivery: { label: 'En Reparto', className: 'bg-cyan-500/10 text-cyan-600 border-cyan-300' },
        completed: { label: 'Completado', className: 'bg-emerald-600 text-white font-bold' },
        cancelled: { label: 'Cancelado', className: 'bg-stone-200 text-stone-700' },
      }
      const cfg = map[row.status] ?? { label: row.status, className: 'bg-stone-100 text-stone-600' }
      return <Badge className={cfg.className}>{cfg.label}</Badge>
    },
  },
]

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

export function TripsTable({ clients = [], units = [], trips = [], filters }: TripsTableProps) {
  const tripsQuery = useTripsList(filters, filters ? undefined : trips)
  const rows = (tripsQuery.data ?? []).map(mapToRowEntity)

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TripsTableRowEntity | null>(null)
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<TripsTableRowEntity | null>(null)

  const canManageAll = useAuthStore((state) => state.hasPermission('trips:manage_all'))
  const canManageWalmart = useAuthStore((state) => state.hasPermission('trips:manage_walmart'))
  const canManageLogistics = useAuthStore((state) => state.hasPermission('trips:manage_logistica'))

  // Determinar si puede editar una fila específica
  const canEditRow = (row: TripsTableRowEntity) => {
    if (canManageAll) return true
    if (canManageWalmart && isWalmartClientName(row.clientName)) return true
    if (canManageLogistics && isLogisticsAllowedClientName(row.clientName)) return true
    return false
  }

  const canCreate = canManageAll || canManageWalmart || canManageLogistics
  const canDelete = canManageAll

  const creatableClients = canManageAll
    ? clients
    : clients.filter((c) => {
        const name = c.tradeName ?? c.companyName ?? ''
        if (canManageWalmart && isWalmartClientName(name)) return true
        if (canManageLogistics && isLogisticsAllowedClientName(name)) return true
        return false
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

  return (
    <>
      <CrudDataTable<TripsTableRowEntity>
        data={rows}
        isLoading={tripsQuery.isLoading}
        columns={TRIPS_COLUMNS}
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
      />

      {/* Pasa los clientes y unidades al wizard para que arme el dropdown */}
      <TripWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        tripRow={selectedRow ?? undefined}
        clients={creatableClients}
        units={units}
      />

      <TripDetailsDialog
        isOpen={isDetailsOpen}
        tripRow={detailRow}
        onClose={() => { setIsDetailsOpen(false); setDetailRow(null) }}
      />
    </>
  )
}
