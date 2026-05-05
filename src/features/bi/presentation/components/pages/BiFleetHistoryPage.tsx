/**
 * @fileoverview Página de Historial Operativo de Flota — BI Gerencial.
 * Server Component que carga catálogos y delega la interactividad al explorer.
 */

import React from 'react'
import { fetchBiCatalogsAction } from '../../../presentation/actions/bi.actions'
import { FleetHistoryExplorer } from '../organisms/FleetHistoryExplorer'

export default async function BiFleetHistoryPage() {
  const catalogs = await fetchBiCatalogsAction()

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
