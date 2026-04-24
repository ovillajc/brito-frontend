'use client'

/**
 * @fileoverview Página de Carga de Diésel.
 */

import React, { useState } from 'react'
import type { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { useFuelLoadHistory } from '@/src/features/trips/presentation/hooks/use-fuel-metrics'
import type { FuelLoadHistoryRowEntity } from '@/src/features/trips/domain/entities/fuel-metrics-entity'

import { FuelLoadWizard } from '@/src/features/trips/presentation/components/organisms/FuelLoadWizard'

interface FuelLoadPageProps {
  trips: TripWithRelations[]
  units: UnitAssemblyEntity[]
  initialHistory?: FuelLoadHistoryRowEntity[]
}

function formatMoney(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function formatDateIso(value: string | null) {
  if (!value) return '—'
  const iso = value.replace(' ', 'T')
  if (iso.length >= 16) return `${iso.slice(0, 10)} ${iso.slice(11, 16)}`
  return value
}

const HISTORY_COLUMNS: CrudColumn<FuelLoadHistoryRowEntity>[] = [
  {
    header: 'Fecha',
    cell: (row) => (
      <span className="text-sm text-stone-700 dark:text-zinc-200">
        {formatDateIso(row.loadDate)}
      </span>
    ),
  },
  {
    header: 'Viaje',
    cell: (row) => (
      <span className="font-mono font-bold text-stone-900 dark:text-zinc-100">
        {row.folio}
      </span>
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
          {row.operatorName ?? '—'}
        </span>
      </div>
    ),
  },
  {
    header: 'Ticket',
    cell: (row) => (
      <span className="text-sm text-stone-700 dark:text-zinc-200">
        {row.ticketFolio ?? '—'}
      </span>
    ),
  },
  {
    header: 'Litros',
    cell: (row) => (
      <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
        {row.litersLoaded.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    ),
  },
  {
    header: '$/L',
    cell: (row) => (
      <span className="text-sm text-stone-700 dark:text-zinc-200">
        {formatMoney(row.pricePerLiter)}
      </span>
    ),
  },
  {
    header: 'Total',
    cell: (row) => (
      <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">
        {formatMoney(row.totalCost)}
      </span>
    ),
  },
  {
    header: 'Origen',
    cell: (row) => (
      <span className="text-xs font-semibold text-stone-500 dark:text-zinc-400">
        {row.sourceType === 'INTERNAL_TANK' ? 'Tanque Base' : 'Externo'}
      </span>
    ),
  },
]

export default function FuelLoadPage({ trips, units, initialHistory = [] }: FuelLoadPageProps) {
  const historyQuery = useFuelLoadHistory(200, initialHistory)
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Carga de Diésel</h1>
        <p className="text-sm text-stone-500 dark:text-zinc-500">Módulo de guardias</p>
      </div>

      <FuelLoadWizard
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        trips={trips}
        units={units}
      />

      <CrudDataTable<FuelLoadHistoryRowEntity>
        data={historyQuery.data ?? []}
        isLoading={historyQuery.isLoading}
        columns={HISTORY_COLUMNS}
        searchPlaceholder="Buscar por viaje, cliente, unidad, operador o ticket..."
        searchFilter={(row, term) =>
          [row.folio, row.clientName, row.unitEconomicNumber, row.operatorName, row.ticketFolio]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Registrar Carga"
        onAction={() => setIsWizardOpen(true)}
        emptyState={{
          icon: () => null,
          title: 'Sin cargas registradas',
          description: 'Aún no hay registros de carga de diésel.',
        }}
      />
    </div>
  )
}
