/**
 * @fileoverview Layout del módulo BI Gerencial.
 * Incluye subnavegación y encabezado de área restringida.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { LayoutDashboard, History, Calculator, ShieldCheck } from 'lucide-react'

const BI_NAV = [
  { name: 'Resumen Ejecutivo', href: '/bi', icon: LayoutDashboard },
  { name: 'Historial de Flota', href: '/bi/fleet-history', icon: History },
  { name: 'Calculadora de Rendimiento', href: '/bi/yield', icon: Calculator },
]

export default function BiLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6 p-6">
      <header className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="size-5 text-[#1a5c3a]" />
              <span className="text-xs font-bold text-[#1a5c3a] uppercase tracking-widest">
                Acceso Gerencial
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface">
              Business Intelligence
            </h1>
            <p className="text-sm text-on-surface-variant">
              Panel privado de dirección. Análisis global de la operación logística.
            </p>
          </div>
          {/* Badge de nivel de acceso */}
          <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1a5c3a]/10 border border-[#1a5c3a]/20 text-xs font-semibold text-[#1a5c3a]">
            <span className="size-2 rounded-full bg-[#1a5c3a]" />
            Nivel Directivo
          </div>
        </div>

        <nav className="flex items-center gap-1 border-b border-outline-variant/30">
          {BI_NAV.map((item) => {
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
