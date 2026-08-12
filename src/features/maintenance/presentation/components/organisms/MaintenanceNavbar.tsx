'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { ClipboardList, Wrench, Settings, Building2, CircleDollarSign, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '@/src/features/auth/presentation/store/auth-store'

const MAINTENANCE_NAV = [
  { name: 'Dashboard', href: '/maintenance/dashboard', icon: LayoutDashboard },
  { name: 'Estancias', href: '/maintenance/stays', icon: ClipboardList },
  { name: 'Trabajos', href: '/maintenance/jobs', icon: Wrench },
  { name: 'Gastos', href: '/maintenance/costs', icon: CircleDollarSign },
  { name: 'Proveedores', href: '/maintenance/providers', icon: Building2 },
]

interface MaintenanceNavbarProps {
  hiddenHrefs?: string[]
}

export function MaintenanceNavbar({ hiddenHrefs = [] }: MaintenanceNavbarProps) {
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)

  const effectiveHiddenHrefs = new Set(hiddenHrefs)

  return (
    <nav className="flex items-center gap-1 border-b border-outline-variant/30">
      {MAINTENANCE_NAV.filter((item) => !effectiveHiddenHrefs.has(item.href)).map((item) => {
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors relative rounded-t-lg',
              isActive
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low/50'
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
  )
}
