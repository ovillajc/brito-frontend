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
    <main className="p-6 lg:p-8">
      <DashboardContainer />
    </main>
  )
}

export default DashboardPage