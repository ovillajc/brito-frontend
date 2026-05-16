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
import type { TripFuelRowEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'
import { useFuelMetricsRows } from '@/src/features/trips/presentation/hooks/use-fuel-metrics'
import { deleteTripFuelMetricsAction } from '@/src/features/trips/presentation/actions/fuel-metrics.actions'

// ── Entidad de vista ────────────────────────────────────────────────────────

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
    header: 'Cliente',
    cell: (row) => (
      <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
        {row.clientName ?? '—'}
      </span>
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

// ── Props y Componente ───────────────────────────────────────────────────────

interface FuelMetricsTableProps {
  initialData?: TripFuelRowEntity[]
}

/**
 * Tabla principal de rendimientos de combustible.
 * Orquesta el Wizard y el DetailsDialog internamente (mismo patrón que EmployeesTable).
 */
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

export function FuelMetricsTable({ initialData }: FuelMetricsTableProps) {
  const { data, isLoading } = useFuelMetricsRows(initialData)
  const canManage = useAuthStore((state) => state.hasPermission('fuel:manage'))
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<TripFuelRowEntity | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailRow, setDetailRow] = useState<TripFuelRowEntity | null>(null)

  return (
    <>
      <CrudDataTable<TripFuelRowEntity>
        canManage={canManage}
        data={data}
        isLoading={isLoading}
        columns={FUEL_METRICS_COLUMNS}
        searchPlaceholder="Buscar por folio, unidad u operador..."
        searchFilter={(row, term) =>
          [row.folio, row.clientName, row.unitEconomicNumber, row.operatorName, row.origin, row.destination, row.ticketFolio]
            .some((val) => val?.toLowerCase().includes(term))
        }
        onView={(row) => { setDetailRow(row); setIsDetailsOpen(true) }}
        onEdit={(row) => { setSelectedRow(row); setIsWizardOpen(true) }}
        onDelete={async (id) => {
          const result = await deleteTripFuelMetricsAction(id)
          if (result.ok) {
            return { ok: true }
          }
          return { ok: false, error: { message: result.error.message } }
        }}
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
