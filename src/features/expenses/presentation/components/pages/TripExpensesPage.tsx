'use client'

/**
 * @fileoverview Página de Gastos Operativos filtrada por Viaje, refactorizada al estilo Trips.
 */

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ExpensesTable } from '../organisms/ExpensesTable'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'

export default function TripExpensesPage() {
  const router = useRouter()
  // Idealmente este tripId vendrá por ruta o props, pero simulo el filtro aquí
  const [tripFilter, setTripFilter] = useState('all')

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => router.push('/expenses')}
            aria-label="Volver a gastos"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-stone-900 dark:text-zinc-100">Gastos por Viaje</h1>
            <p className="text-sm text-stone-500 dark:text-zinc-500">
              Desglose específico de los costos asociados a las rutas.
            </p>
          </div>
        </div>
      </div>

      {/* ── Filtro temporal (si es necesario) ────────────────────── */}
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">
          Viaje de Prueba (Filtro simulado):
        </span>
        <select
          className="h-9 rounded-xl border border-stone-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 text-sm"
          value={tripFilter}
          onChange={(e) => setTripFilter(e.target.value)}
        >
          <option value="all">Ver todos los viajes</option>
          {/* Aquí puedes inyectar dinámicamente opciones de IDs si lo deseas */}
        </select>
      </div>

      {/* ── Tabla principal ─────────────────────────────────────── */}
      <ExpensesTable tripIdFilter={tripFilter} />
    </div>
  )
}
