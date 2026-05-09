/**
 * @fileoverview Página de Historial Operativo de Flota — BI Gerencial.
 * Server Component que carga catálogos y delega la interactividad al explorer.
 */

import React from 'react'
import { fetchBiCatalogsAction } from '../../../presentation/actions/bi.actions'
import { FleetHistoryExplorer } from '../organisms/FleetHistoryExplorer'

export default async function BiFleetHistoryPage() {
  const result = await fetchBiCatalogsAction()
  if (!result.ok) {
    return (
      <div className="flex flex-col gap-3 p-4 rounded-xl border border-red-200 bg-red-50/50 text-red-800">
        <p className="font-semibold">No se pudieron cargar los catálogos</p>
        <p className="text-sm">{result.error.message}</p>
      </div>
    )
  }
  const catalogs = result.data

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100">
          Historial Operativo de Flota
        </h2>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1">
          Consulta el historial completo de viajes, clientes y gastos por elemento de flota.
        </p>
      </div>

      <FleetHistoryExplorer catalogs={catalogs} />
    </div>
  )
}
