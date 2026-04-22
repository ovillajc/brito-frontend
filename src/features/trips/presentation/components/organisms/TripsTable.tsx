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

// ── Entidades de vista ────────────────────────────────────────────────────────

export interface TripsTableRowEntity {
  id: string
  folio: string
  clientId: string
  clientName: string // e.g. "Walmart"
  origin: string
  destination: string
  departureDate: string | null
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  unitEconomicNumber: string | null
  operatorName: string | null
  isFullAssembly: boolean
  
  // Datos específicos Walmart (si aplica)
  walmartData?: {
    coordinatorName: string | null
    route: string | null
    cartaPorteWalmart: string | null
    numStores: number | null
  }
}

// ── Mock data para desarrollo UI ──────────────────────────────────────────────

const MOCK_CLIENTS = [
  { id: 'client-walmart', tradeName: 'Walmart', companyName: 'Nueva Wal-Mart de México S.R.L. de C.V.' },
  { id: 'client-gen', tradeName: 'Cliente Genérico', companyName: 'Logística SA de CV' },
]

const MOCK_TRIPS: TripsTableRowEntity[] = [
  {
    id: 'trip-001',
    folio: 'VJE-0042',
    clientId: 'client-walmart',
    clientName: 'Walmart',
    origin: 'Monterrey, NL',
    destination: 'Walmart Apodaca #5',
    departureDate: '2026-04-21T08:00:00Z',
    status: 'completed',
    unitEconomicNumber: 'ECO-105',
    operatorName: 'Juan Pérez',
    isFullAssembly: true,
    walmartData: {
      coordinatorName: 'Carlos Coord',
      route: 'R-NTE-01',
      cartaPorteWalmart: 'CPW-9912',
      numStores: 3
    }
  },
  {
    id: 'trip-002',
    folio: 'VJE-0043',
    clientId: 'client-gen',
    clientName: 'Cliente Genérico',
    origin: 'Saltillo, COAH',
    destination: 'Nuevo Laredo, TAMPS',
    departureDate: '2026-04-22T09:30:00Z',
    status: 'in-progress',
    unitEconomicNumber: 'ECO-210',
    operatorName: 'Luis García',
    isFullAssembly: false,
  }
]

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
      const map: Record<string, { label: string; className: string }> = {
        completed: { label: 'Completado', className: 'bg-[#1a5c3a] text-white font-bold' },
        'in-progress': { label: 'En Ruta', className: 'bg-blue-500/10 text-blue-600 border-blue-300' },
        scheduled: { label: 'Programado', className: 'bg-amber-500/10 text-amber-600 border-amber-300' },
        cancelled: { label: 'Cancelado', className: 'bg-stone-200 text-stone-700' },
      }
      const cfg = map[row.status] ?? { label: row.status, className: 'bg-stone-100 text-stone-600' }
      return <Badge className={cfg.className}>{cfg.label}</Badge>
    },
  },
]

// ── Props & Componente ────────────────────────────────────────────────────────

interface TripsTableProps {
  initialData?: TripsTableRowEntity[]
  isLoading?: boolean
}

export function TripsTable({ initialData = MOCK_TRIPS, isLoading = false }: TripsTableProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TripsTableRowEntity | null>(null)
  
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<TripsTableRowEntity | null>(null)

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
        data={initialData}
        isLoading={isLoading}
        columns={TRIPS_COLUMNS}
        searchPlaceholder="Buscar por folio, cliente u origen..."
        searchFilter={(row, term) =>
          [row.folio, row.clientName, row.origin, row.destination, row.unitEconomicNumber]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Nuevo Viaje"
        onAction={() => { setSelectedRow(null); setIsWizardOpen(true) }}
        onView={handleView}
        onEdit={handleEdit}
        emptyState={{
          icon: MapPin,
          title: 'Sin viajes registrados',
          description: 'Aún no hay viajes registrados en el sistema.',
        }}
      />

      {/* Pasa los clientes mock al wizard para que arme el dropdown */}
      <TripWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        tripRow={selectedRow ?? undefined}
        clients={MOCK_CLIENTS}
      />

      <TripDetailsDialog
        isOpen={isDetailsOpen}
        tripRow={detailRow}
        onClose={() => { setIsDetailsOpen(false); setDetailRow(null) }}
      />
    </>
  )
}
