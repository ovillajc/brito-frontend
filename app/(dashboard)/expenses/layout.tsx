/**
 * @fileoverview Layout para el módulo de Gastos Operativos.
 * Incluye navegación interna entre dashboard y listas de gastos.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { LayoutDashboard, Receipt, Route } from 'lucide-react'

const EXPENSES_NAV = [
  { name: 'Dashboard', href: '/expenses', icon: LayoutDashboard },
  { name: 'Todos los Gastos', href: '/expenses/list', icon: Receipt },
  { name: 'Gastos por Viaje', href: '/expenses/trips', icon: Route },
]

export default function ExpensesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Gastos Operativos</h1>
          <p className="text-sm text-on-surface-variant">
            Control, registro y análisis de costos logísticos y de unidades.
          </p>
        </div>

        <nav className="flex items-center gap-1 border-b border-outline-variant/30">
          {EXPENSES_NAV.map((item) => {
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
