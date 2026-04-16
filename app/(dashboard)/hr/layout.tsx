'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { Briefcase, Users, UserPlus, Clock, LayoutDashboard } from 'lucide-react'

const HR_NAV = [
  { name: 'Dashboard', href: '/hr', icon: LayoutDashboard },
  { name: 'Empleados', href: '/hr/employees', icon: Users },
  { name: 'Reclutamiento', href: '/hr/recruitment', icon: UserPlus },
  { name: 'Asistencia', href: '/hr/attendance', icon: Clock },
]

export default function HrLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Recursos Humanos</h1>
          <p className="text-sm text-on-surface-variant">
            Gestión de personal, planillas, asistencia y contrataciones.
          </p>
        </div>

        <nav className="flex items-center gap-1 border-b border-outline-variant/30">
          {HR_NAV.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative',
                  isActive 
                    ? 'text-primary' 
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50 rounded-t-lg'
                )}
              >
                <item.icon className="size-4" />
                {item.name}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>
      </header>

      <main className="min-h-[500px]">
        {children}
      </main>
    </div>
  )
}
