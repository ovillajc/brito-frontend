'use client'

/**
 * @fileoverview Página de Gastos Operativos filtrada por Viaje, refactorizada al estilo Trips.
 */

import React, { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExpensesTable } from '@/src/features/expenses/presentation/components/organisms/ExpensesTable'
import { ArrowLeft, MapPin, Route } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { useTripsList } from '@/src/features/trips/presentation/hooks/use-trips'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'

export default function TripExpensesPage() {
  const router = useRouter()
  const tripsQuery = useTripsList({ limit: 200 })
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null)

  type TripRowEntity = {
    id: string
    folio: string
    clientName: string
    origin: string
    destination: string
    status: string
  }

  const tripRows: TripRowEntity[] = useMemo(() => {
    const items = tripsQuery.data ?? []
    return items.map(mapTripToRow)
  }, [tripsQuery.data])

  const selectedTrip = useMemo(() => {
    if (!selectedTripId) return null
    return tripRows.find((t) => t.id === selectedTripId) ?? null
  }, [selectedTripId, tripRows])

  const TRIPS_COLUMNS: CrudColumn<TripRowEntity>[] = [
    {
      header: 'Viaje',
      cell: (row) => (
        <div className="flex flex-col">
          <span className="font-mono font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
            {row.folio}
          </span>
          <span className="text-[11px] text-stone-500 dark:text-zinc-400 truncate max-w-[220px]">
            {row.clientName}
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
            <span className="truncate max-w-[160px]">{row.origin || '—'}</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-zinc-400 mt-0.5">
            <MapPin className="size-3 text-[#006d37] dark:text-primary-container" />
            <span className="truncate max-w-[160px]">{row.destination || '—'}</span>
          </div>
        </div>
      ),
    },
    {
      header: 'Estado',
      cell: (row) => {
        const map: Record<string, { label: string; className: string }> = {
          completed: { label: 'Completado', className: 'bg-[#1a5c3a] text-white font-bold' },
          in_progress: { label: 'En Ruta', className: 'bg-blue-500/10 text-blue-600 border-blue-300' },
          scheduled: { label: 'Programado', className: 'bg-amber-500/10 text-amber-600 border-amber-300' },
          cancelled: { label: 'Cancelado', className: 'bg-stone-200 text-stone-700' },
        }
        const cfg = map[row.status] ?? { label: row.status, className: 'bg-stone-100 text-stone-600' }
        return <Badge className={cfg.className}>{cfg.label}</Badge>
      },
      className: 'w-[140px]',
    },
  ]

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="grid items-center">
            <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Gastos por Viaje</h1>
            <p className="text-sm text-stone-500 dark:text-zinc-500">
              Desglose específico de los costos asociados a las rutas.
            </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col gap-4">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Viajes</h2>
            <p className="text-sm text-stone-500 dark:text-zinc-500">
              Selecciona un viaje para ver y consultar sus gastos.
            </p>
          </div>

          <CrudDataTable<TripRowEntity>
            data={tripRows}
            isLoading={tripsQuery.isLoading}
            columns={TRIPS_COLUMNS}
            searchPlaceholder="Buscar por folio, cliente u origen..."
            searchFilter={(row, term) =>
              [row.folio, row.clientName, row.origin, row.destination].some((val) => val?.toLowerCase().includes(term))
            }
            onView={(row) => setSelectedTripId(row.id)}
            emptyState={{
              icon: Route,
              title: 'Sin viajes registrados',
              description: 'Aún no hay viajes cargados en el sistema.',
            }}
          />
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">Gastos del Viaje</h2>
              <p className="text-sm text-stone-500 dark:text-zinc-500">
                {selectedTrip
                  ? `${selectedTrip.folio} — ${selectedTrip.origin || '—'} → ${selectedTrip.destination || '—'}`
                  : 'Selecciona un viaje para cargar sus gastos.'}
              </p>
            </div>
            {selectedTripId && (
              <Button variant="outline" className="h-9 rounded-xl" onClick={() => setSelectedTripId(null)}>
                Limpiar
              </Button>
            )}
          </div>

          {selectedTripId ? (
            <ExpensesTable tripIdFilter={selectedTripId} />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 bg-stone-50/50 border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-[20px] text-center">
              <div className="size-16 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                <Route className="size-8 text-stone-300 dark:text-zinc-600" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
                Selecciona un viaje
              </h3>
              <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
                Haz click en un viaje de la tabla para ver su listado de gastos.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function mapTripToRow(item: TripWithRelations) {
  const folio = item.trip.tripNumber !== null
    ? `VJE-${String(item.trip.tripNumber).padStart(6, '0')}`
    : (item.trip.folio ?? item.trip.id)

  return {
    id: item.trip.id,
    folio,
    clientName: item.clientName ?? '—',
    origin: item.trip.origin ?? '',
    destination: item.trip.destination ?? '',
    status: item.trip.status,
  }
}
