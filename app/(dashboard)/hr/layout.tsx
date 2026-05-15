import React from 'react'
import { ModuleNavTabs, type ModuleNavItem } from '@/src/core/presentation/components/molecules/ModuleNavTabs'

const HR_NAV = [
  { name: 'Dashboard', href: '/hr', iconKey: 'LayoutDashboard' },
  { name: 'Empleados', href: '/hr/employees', iconKey: 'Users' },
  { name: 'Reclutamiento', href: '/hr/recruitment', iconKey: 'UserPlus' },
  { name: 'Asistencia', href: '/hr/attendance', iconKey: 'Clock' },
] satisfies ModuleNavItem[]

export default function HrLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Recursos Humanos</h1>
          <p className="text-sm text-on-surface-variant">
            Gestión de personal, planillas, asistencia y contrataciones.
          </p>
        </div>

        <ModuleNavTabs items={HR_NAV} />
      </header>

      <main className="min-h-[500px]">
        {children}
      </main>
    </div>
  )
}
