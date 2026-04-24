'use client'

/**
 * @fileoverview Página base de Viajes refactorizada para usar el patrón estándar.
 */

import React from 'react'
import { TripsTable } from '../organisms/TripsTable'
import { ClientEntity, UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'

interface TripsListPageProps {
  clients?: ClientEntity[]
  units?: UnitAssemblyEntity[]
  trips?: TripWithRelations[]
}

export default function TripsListPage({ clients = [], units = [], trips = [] }: TripsListPageProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Viajes y Logística</h1>
          <p className="text-sm text-stone-500 dark:text-zinc-500">Gestión de viajes genéricos y operativos por cliente.</p>
        </div>
      </div>

      {/* ── KPIs / Stats Rápidos (Placeholder) ────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Placeholder cards if needed */}
      </div>

      {/* ── Tabla principal ─────────────────────────────────────── */}
      <TripsTable clients={clients} units={units} trips={trips} />
    </div>
  )
}
