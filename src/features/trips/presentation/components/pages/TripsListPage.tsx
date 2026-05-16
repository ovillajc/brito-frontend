'use client'

/**
 * @fileoverview Página base de Viajes refactorizada para usar el patrón estándar.
 */

import { useMemo, useState } from 'react'
import { TripsTable } from '../organisms/TripsTable'
import { ClientEntity, UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import type { TripsListFilters } from '@/src/features/trips/domain/repositories/i-trips-repository'

interface TripsListPageProps {
  clients?: ClientEntity[]
  units?: UnitAssemblyEntity[]
  trips?: TripWithRelations[]
}

export default function TripsListPage({ clients = [], units = [], trips = [] }: TripsListPageProps) {
  const [clientId, setClientId] = useState<string>('all')

  const clientOptions = useMemo(() => {
    const mapped = clients
      .map((c) => ({
        id: c.id,
        label: (c.tradeName ?? c.companyName ?? '').trim(),
      }))
      .filter((c) => c.label.length > 0)
      .sort((a, b) => a.label.localeCompare(b.label, 'es-MX'))

    return [{ id: 'all', label: 'Todos los clientes' }, ...mapped]
  }, [clients])

  const filters: TripsListFilters | undefined = clientId === 'all' ? undefined : { clientId }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Viajes y Logística</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">Gestión de viajes genéricos y operativos por cliente.</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
            className="h-10 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30"
          >
            {clientOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── KPIs / Stats Rápidos (Placeholder) ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Placeholder cards if needed */}
      </div>

      {/* ── Tabla principal ─────────────────────────────────────── */}
      <TripsTable clients={clients} units={units} trips={trips} filters={filters} />
    </div>
  )
}
