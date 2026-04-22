'use client'

/**
 * @fileoverview Tabla de Rendimientos de Combustible (Base Combustible V3).
 * Usa CrudDataTable siguiendo el mismo patrón de EmployeesTable.
 *
 * Orquesta FuelMetricsWizard y FuelMetricsDetailsDialog.
 *
 * @organism
 */

import { useState } from 'react'
import { Fuel, TrendingDown, TrendingUp } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { FuelMetricsWizard } from './FuelMetricsWizard'
import { FuelMetricsDetailsDialog } from './FuelMetricsDetailsDialog'
import { cn } from '@/src/core/infrastructure/utils/cn'

// ── Entidad de vista ────────────────────────────────────────────────────────

/**
 * Fila de la tabla de rendimientos.
 * Combina trips + trip_fuel_metrics + fuel_loads calculado en el Use Case.
 */
export interface TripFuelRowEntity {
  id: string
  folio: string
  origin: string
  destination: string
  departureDate: string | null

  // Unidad
  unitEconomicNumber: string | null
  truckPlates: string | null
  operatorName: string | null
  isFullAssembly: boolean

  // Odómetro
  kmInitial: number | null
  kmFinal: number | null
  kmTraveled: number | null

  // Motor
  ticketFolio: string | null
  litersEngine: number | null
  pricePerLiter: number | null
  totalCostEngine: number | null

  // Remolques
  litersRealR1: number | null
  hoursR1: number | null
  litersRealR2: number | null
  hoursR2: number | null

  // Calculados (del Use Case GetTripFuelMetrics)
  realYieldEngine: number | null        // km/L
  litersTheoreticalEngine: number | null
  savingsExcessEngine: number | null    // + = exceso  — - = ahorro

  totalDieselCostTrip: number | null
  totalSavingsExcess: number | null

  preinvoiceKm: number | null
  preinvoiceVariance: number | null

  status: string
  observations: string | null
  monitoredBy: string | null
}

// ── Sub-componentes de render ───────────────────────────────────────────────

function SavingsBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-stone-300 dark:text-zinc-600 text-xs italic">N/D</span>
  const isExcess = value > 0
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold',
      isExcess
        ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400'
        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400'
    )}>
      {isExcess ? <TrendingUp className="size-2.5" /> : <TrendingDown className="size-2.5" />}
      {isExcess ? '+' : ''}{value.toFixed(2)} L
    </span>
  )
}

function YieldCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-stone-300 dark:text-zinc-600 text-xs italic">N/D</span>
  return (
    <span className="font-mono text-sm font-semibold text-stone-900 dark:text-zinc-100">
      {value.toFixed(2)} <span className="text-[10px] font-normal text-stone-400">km/L</span>
    </span>
  )
}

// ── Columnas ────────────────────────────────────────────────────────────────

const STATUS_MAP: Record<string, { label: string; className: string }> = {
  completed: { label: 'Completado', className: 'bg-[#1a5c3a] dark:bg-primary-container/80 text-white font-bold' },
  in_progress: { label: 'En Ruta', className: 'bg-blue-500/10 text-blue-600 border-blue-300 dark:text-blue-400' },
  scheduled: { label: 'Programado', className: 'bg-amber-500/10 text-amber-600 border-amber-300 dark:text-amber-400' },
  cancelled: { label: 'Cancelado', className: 'bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-400' },
}

const FUEL_METRICS_COLUMNS: CrudColumn<TripFuelRowEntity>[] = [
  {
    header: 'Viaje / Folio',
    cell: (row) => (
      <div className="flex flex-col">
        <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors font-mono">
          {row.folio}
        </span>
        <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-semibold text-stone-400 dark:text-zinc-500 mt-0.5">
          <span>{row.origin || '—'}</span>
          <span>→</span>
          <span>{row.destination || '—'}</span>
        </div>
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
        {row.isFullAssembly && (
          <Badge variant="outline" className="w-fit text-[9px] py-0 px-1.5 border-amber-300 text-amber-600 bg-amber-50 dark:bg-amber-950/20">
            FULL
          </Badge>
        )}
      </div>
    ),
  },
  {
    header: 'KM Recorridos',
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        {row.kmTraveled !== null
          ? <>
              <span className="font-mono text-sm font-bold text-stone-900 dark:text-zinc-100">
                {row.kmTraveled.toLocaleString('es-MX')}
              </span>
              <span className="text-[10px] text-stone-400">km</span>
            </>
          : <span className="text-stone-300 dark:text-zinc-600 text-xs font-normal italic">Sin datos</span>
        }
      </div>
    ),
    className: 'tabular-nums',
  },
  {
    header: 'Litros Motor',
    cell: (row) => (
      <div className="flex flex-col gap-0.5">
        {row.litersEngine !== null
          ? <span className="font-mono text-sm text-stone-800 dark:text-zinc-200">{row.litersEngine.toFixed(1)} L</span>
          : <span className="text-stone-300 dark:text-zinc-600 text-xs italic">N/D</span>
        }
        {row.ticketFolio && (
          <span className="text-[10px] text-stone-400 dark:text-zinc-500 font-mono">#{row.ticketFolio}</span>
        )}
      </div>
    ),
  },
  {
    header: 'Rend. Real',
    cell: (row) => <YieldCell value={row.realYieldEngine} />,
  },
  {
    header: 'Ahorro / Exceso',
    cell: (row) => <SavingsBadge value={row.savingsExcessEngine} />,
  },
  {
    header: 'Total Diésel',
    cell: (row) => (
      row.totalDieselCostTrip !== null
        ? <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">
            ${row.totalDieselCostTrip.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        : <span className="text-stone-300 dark:text-zinc-600 text-xs italic">N/D</span>
    ),
  },
  {
    header: 'Estado',
    cell: (row) => {
      const cfg = STATUS_MAP[row.status] ?? { label: row.status, className: 'bg-stone-100 text-stone-600' }
      return <Badge className={cfg.className}>{cfg.label}</Badge>
    },
  },
]

// ── Mock data para UI ────────────────────────────────────────────────────────

const MOCK_DATA: TripFuelRowEntity[] = [
  {
    id: 'trip-001', folio: 'VJE-0042', origin: 'Monterrey, NL', destination: 'Walmart Apodaca #5',
    departureDate: '2026-04-21', unitEconomicNumber: 'ECO-105', truckPlates: 'MX-1234',
    operatorName: 'Juan Pérez', isFullAssembly: true,
    kmInitial: 12300, kmFinal: 13584, kmTraveled: 1284,
    ticketFolio: 'TK-00812', litersEngine: 280.5, pricePerLiter: 23.50, totalCostEngine: 6591.75,
    litersRealR1: 45.0, hoursR1: 10, litersRealR2: 38.2, hoursR2: 10,
    realYieldEngine: 4.58, litersTheoreticalEngine: 257.0, savingsExcessEngine: 23.5,
    totalDieselCostTrip: 8524.95, totalSavingsExcess: 18.3,
    preinvoiceKm: 1300, preinvoiceVariance: 16,
    status: 'completed', observations: null, monitoredBy: 'Monitorista 1',
  },
  {
    id: 'trip-002', folio: 'VJE-0041', origin: 'Monterrey, NL', destination: 'Walmart Escobedo #12',
    departureDate: '2026-04-20', unitEconomicNumber: 'ECO-108', truckPlates: 'MX-5678',
    operatorName: 'Carlos Ruiz', isFullAssembly: false,
    kmInitial: 8500, kmFinal: 9456, kmTraveled: 956,
    ticketFolio: 'TK-00798', litersEngine: 198.0, pricePerLiter: 23.50, totalCostEngine: 4653.0,
    litersRealR1: null, hoursR1: null, litersRealR2: null, hoursR2: null,
    realYieldEngine: 4.83, litersTheoreticalEngine: 210.0, savingsExcessEngine: -12.0,
    totalDieselCostTrip: 4653.0, totalSavingsExcess: -12.0,
    preinvoiceKm: 960, preinvoiceVariance: 4,
    status: 'completed', observations: 'Demora en entrega tienda 3', monitoredBy: 'Monitorista 1',
  },
  {
    id: 'trip-003', folio: 'VJE-0043', origin: 'Monterrey, NL', destination: 'Walmart Cumbres',
    departureDate: '2026-04-21', unitEconomicNumber: 'ECO-112', truckPlates: 'MX-9012',
    operatorName: 'Luis García', isFullAssembly: true,
    kmInitial: null, kmFinal: null, kmTraveled: null,
    ticketFolio: null, litersEngine: null, pricePerLiter: null, totalCostEngine: null,
    litersRealR1: null, hoursR1: null, litersRealR2: null, hoursR2: null,
    realYieldEngine: null, litersTheoreticalEngine: null, savingsExcessEngine: null,
    totalDieselCostTrip: null, totalSavingsExcess: null,
    preinvoiceKm: null, preinvoiceVariance: null,
    status: 'in_progress', observations: null, monitoredBy: null,
  },
]

// ── Props y Componente ───────────────────────────────────────────────────────

interface FuelMetricsTableProps {
  initialData?: TripFuelRowEntity[]
  isLoading?: boolean
}

/**
 * Tabla principal de rendimientos de combustible.
 * Orquesta el Wizard y el DetailsDialog internamente (mismo patrón que EmployeesTable).
 */
export function FuelMetricsTable({ initialData = MOCK_DATA, isLoading = false }: FuelMetricsTableProps) {
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TripFuelRowEntity | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<TripFuelRowEntity | null>(null)

  return (
    <>
      <CrudDataTable<TripFuelRowEntity>
        data={initialData}
        isLoading={isLoading}
        columns={FUEL_METRICS_COLUMNS}
        searchPlaceholder="Buscar por folio, unidad u operador..."
        searchFilter={(row, term) =>
          [row.folio, row.unitEconomicNumber, row.operatorName, row.destination, row.ticketFolio]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Registrar Métricas"
        onAction={() => { setSelectedRow(null); setIsWizardOpen(true) }}
        onView={(row) => { setDetailRow(row); setIsDetailsOpen(true) }}
        onEdit={(row) => { setSelectedRow(row); setIsWizardOpen(true) }}
        emptyState={{
          icon: Fuel,
          title: 'Sin registros de combustible',
          description: 'Aún no hay métricas de combustible registradas para este período.',
        }}
      />

      <FuelMetricsWizard
        isOpen={isWizardOpen}
        tripRow={selectedRow ?? undefined}
        onClose={() => { setIsWizardOpen(false); setSelectedRow(null) }}
      />

      <FuelMetricsDetailsDialog
        isOpen={isDetailsOpen}
        tripRow={detailRow}
        onClose={() => { setIsDetailsOpen(false); setDetailRow(null) }}
      />
    </>
  )
}
