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
import { FuelLoadDetailsDialog } from '@/src/features/trips/presentation/components/organisms/FuelLoadDetailsDialog'
import { useDeleteFuelLoad } from '@/src/features/trips/presentation/hooks/use-fuel-metrics'
import { Fuel } from 'lucide-react'

interface FuelLoadPageProps {
  trips: TripWithRelations[]
  units: UnitAssemblyEntity[]
  initialHistory?: FuelLoadHistoryRowEntity[]
}

function formatMoney(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function formatDateTimeLocal(value: string | null) {
  if (!value) return '—'
  const normalized = value.includes(' ') && !value.includes('T') ? value.replace(' ', 'T') : value
  const dt = new Date(normalized)
  if (Number.isNaN(dt.getTime())) return '—'

  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())} ${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`
}

import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

export default function FuelLoadPage({ trips, units, initialHistory = [] }: FuelLoadPageProps) {
  const historyQuery = useFuelLoadHistory(200, initialHistory)
  const deleteFuelLoad = useDeleteFuelLoad()
  const canManageFuel = useAuthStore((state) => state.hasPermission('fuel:manage'))
  const canManageFinances = useAuthStore((state) => state.hasPermission('finances:manage'))
  const canCreateFuelLoad = useAuthStore((state) => state.hasPermission('fuel_load:create'))
  const canCreate = canManageFuel || canManageFinances || canCreateFuelLoad
  const canEdit = canManageFuel || canManageFinances
  const canDelete = canManageFuel || canManageFinances
  
  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState<FuelLoadHistoryRowEntity | null>(null)

  const handleEdit = (row: FuelLoadHistoryRowEntity) => {
    setSelectedRow(row)
    setIsWizardOpen(true)
  }

  const handleDetails = (row: FuelLoadHistoryRowEntity) => {
    setSelectedRow(row)
    setIsDetailsOpen(true)
  }

  const columns: CrudColumn<FuelLoadHistoryRowEntity>[] = [
    {
      header: 'Fecha',
      cell: (row) => (
        <span className="text-sm text-stone-700 dark:text-zinc-200">
          {formatDateTimeLocal(row.loadDate)}
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
      header: 'Ticket / Tipo',
      cell: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-semibold text-stone-800 dark:text-zinc-200">
            {row.ticketFolio ?? '—'}
          </span>
          <span className="text-[11px] font-medium px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-400 w-fit">
            {row.vehicleType === 'TRUCK' ? 'Motor' : 'Termo'}
          </span>
        </div>
      ),
    },
    {
      header: 'Odómetro',
      cell: (row) => (
        <span className="text-sm text-stone-700 dark:text-zinc-200 font-mono">
          {row.odometerAtLoad ? row.odometerAtLoad.toLocaleString('es-MX') : '—'}
        </span>
      ),
    },
    {
      header: 'Litros',
      cell: (row) => (
        <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
          {row.litersLoaded.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} L
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
  ]

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedRow(null)
  }

  const handleCloseDetails = () => {
    setIsDetailsOpen(false)
    setSelectedRow(null)
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Carga de Diésel</h1>
        <p className="text-sm text-stone-500 dark:text-zinc-500">Historial y gestión de tickets</p>
      </div>

      <FuelLoadWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        trips={trips}
        units={units}
        editRow={selectedRow}
      />

      <FuelLoadDetailsDialog
        isOpen={isDetailsOpen}
        onClose={handleCloseDetails}
        loadRow={selectedRow}
      />

      <CrudDataTable<FuelLoadHistoryRowEntity>
        data={historyQuery.data ?? []}
        isLoading={historyQuery.isLoading}
        columns={columns}
        searchPlaceholder="Buscar por viaje, cliente, unidad, operador o ticket..."
        searchFilter={(row, term) =>
          [row.folio, row.clientName, row.unitEconomicNumber, row.operatorName, row.ticketFolio]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel={canCreate ? 'Registrar Carga' : undefined}
        onAction={canCreate ? (() => setIsWizardOpen(true)) : undefined}
        onView={handleDetails}
        onEdit={canEdit ? handleEdit : undefined}
        onDelete={canDelete ? (async (id) => {
          const result = await deleteFuelLoad.mutateAsync(id)
          if (result.ok) {
            historyQuery.refetch()
          }
          return result
        }) : undefined}
        emptyState={{
          icon: Fuel,
          title: 'Sin cargas registradas',
          description: 'Aún no hay registros de carga de diésel.',
        }}
      />
    </div>
  )
}
