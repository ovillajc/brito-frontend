/**
 * @fileoverview Layout para el módulo de Viajes.
 * Incluye navegación interna entre categorías.
 */

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
]

export default function TripsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Gestión de Viajes</h1>
          <p className="text-sm text-on-surface-variant">
            Control y seguimiento de rutas, asignación de unidades y operadores.
          </p>
        </div>

        <nav className="flex items-center gap-1 border-b border-outline-variant/30">
          {TRIPS_NAV.map((item) => {
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
