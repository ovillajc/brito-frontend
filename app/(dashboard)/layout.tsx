/**
 * @fileoverview Layout del dashboard con Sidebar + Navbar + Footer.
 * Sigue el patrón de petro-flow: SidebarProvider > AppSidebar + main content.
 */

import React from 'react'
import { SidebarProvider } from '@/src/core/presentation/context/SidebarContext'
import { AppSidebar } from '@/src/core/presentation/components/organisms/AppSidebar'
import { DashboardNavbar } from '@/src/core/presentation/components/organisms/DashboardNavbar'
import { DashboardFooter } from '@/src/core/presentation/components/organisms/DashboardFooter'

import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { AuthHydrator } from '@/src/features/auth/presentation/components/AuthHydrator'

/**
 * Layout persistente para todas las rutas bajo /dashboard.
 * Server Component que envuelve los children con sidebar, navbar y footer.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await verifySession()

  return (
    <SidebarProvider>
      <AuthHydrator user={user} />
      <AppSidebar />
      <div className="relative flex w-full flex-1 flex-col min-w-0 bg-stone-50 dark:bg-zinc-950 transition-colors">
        <DashboardNavbar />
        <div className="flex-1 overflow-auto">{children}</div>
        <DashboardFooter />
      </div>
    </SidebarProvider>
  )
}
