/**
 * @fileoverview Página principal del Dashboard.
 * Sigue las reglas de Next.js First (App Router) y SEO de AGENTS.md.
 */

import React from 'react'
import { Metadata } from 'next'
import { DashboardContainer } from '@/src/features/dashboard/presentation/components/organisms/DashboardContainer'

/**
 * Metadatos para SEO y redes sociales.
 */
export const metadata: Metadata = {
  title: 'Dashboard | Sociedad Brito',
  description: 'Panel de control para la gestión de flota, viajes y métricas industriales de Sociedad Brito.',
  openGraph: {
    title: 'Dashboard | Sociedad Brito',
    description: 'Sistema central de control logístico y operativo.',
  },
}

/**
 * Componente de página del Dashboard (Server Component por defecto).
 */
function DashboardPage() {
  return (
    <main className="p-6 lg:p-8 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header estilo Horizon (Flat y Limpio) */}
        <div className="flex items-center justify-between pb-4 border-b border-stone-300 dark:border-zinc-800">
          <div className="flex items-center gap-3">
             <h1 className="text-xl font-bold text-stone-900 dark:text-zinc-100 tracking-tight">
               Warehouse Operations
             </h1>
             {/* Small visual separator */}
             <div className="h-4 w-px bg-stone-300 dark:bg-zinc-700" />
             <span className="text-sm font-medium text-stone-500 dark:text-zinc-400">
               Vista general (Sociedad Brito)
             </span>
          </div>
          <div className="flex items-center gap-2">
             {/* Additional context actions could go here */}
          </div>
        </div>

        {/* Contenedor Limpio sin blurs ni glassmorphism */}
        <div className="w-full">
           <DashboardContainer />
        </div>

      </div>
    </main>
  )
}

export default DashboardPage