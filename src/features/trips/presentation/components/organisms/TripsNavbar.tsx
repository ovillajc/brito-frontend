'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { LayoutDashboard, Map, Fuel } from 'lucide-react'

const TRIPS_NAV = [
  { name: 'Dashboard', href: '/trips', icon: LayoutDashboard },
  { name: 'Viajes', href: '/trips/list', icon: Map },
  { name: 'Rendimientos', href: '/trips/fuel', icon: Fuel },
  { name: 'Carga Diésel', href: '/trips/fuel/load', icon: Fuel },
]

interface TripsNavbarProps {
  hiddenHrefs?: string[]
}

export function TripsNavbar({ hiddenHrefs = [] }: TripsNavbarProps) {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 border-b border-outline-variant/30">
      {TRIPS_NAV.filter(item => !hiddenHrefs.includes(item.href)).map((item) => {
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
  )
}
