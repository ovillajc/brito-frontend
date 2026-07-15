/**
 * @fileoverview Página de operaciones del cliente Walmart.
 * Vista inicial que sirve como punto de entrada para las operaciones de esta cuenta.
 */

'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  Navigation,
  Circle,
  ExternalLink,
} from 'lucide-react'

const WALMART_QUICK_LINKS = [
  {
    label: 'Viajes Walmart',
    description: 'Ver bitácora y rutas activas para la cuenta Walmart',
    href: '/trips/list',
    color: 'text-[#0071CE]',
    bg: 'bg-[#0071CE]/8',
    border: 'border-[#0071CE]/20',
    icon: Navigation,
  },
]

export default function WalmartOperationsPage() {
  return (
    <div className="flex flex-col gap-8 p-6 max-w-4xl mx-auto w-full">
      {/* Back navigation */}
      <Link
        href="/operations"
        className="inline-flex items-center gap-2 text-[12px] font-semibold text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Volver a Operaciones
      </Link>

      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          {/* Walmart avatar */}
          <div className="flex items-center justify-center size-14 rounded-2xl bg-[#0071CE]/10 text-[#0071CE] font-black text-2xl shrink-0">
            WM
          </div>

          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black tracking-tight text-stone-900 dark:text-zinc-100">
                Walmart
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                <Circle className="size-1.5 fill-current" />
                Activo
              </span>
            </div>
            <p className="text-[13px] text-stone-400 dark:text-zinc-500">
              Operaciones de distribución y logística — Cuenta Walmart de México
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-stone-100 dark:bg-zinc-800" />
      </div>

      {/* Quick access links */}
      <div className="flex flex-col gap-3">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-stone-400 dark:text-zinc-600">
          Acceso rápido
        </h2>

        <div className="flex flex-col gap-3">
          {WALMART_QUICK_LINKS.map((link) => {
            const Icon = link.icon
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`group flex items-center gap-4 rounded-2xl border ${link.border} p-5 bg-white dark:bg-zinc-900 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className={`flex items-center justify-center size-10 rounded-xl ${link.bg} shrink-0`}>
                  <Icon className={`size-5 ${link.color}`} />
                </div>
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-[14px] font-bold text-stone-900 dark:text-zinc-100">
                    {link.label}
                  </span>
                  <span className="text-[12px] text-stone-400 dark:text-zinc-500 truncate">
                    {link.description}
                  </span>
                </div>
                <ExternalLink className="size-4 text-stone-300 dark:text-zinc-600 shrink-0 group-hover:text-stone-500 transition-colors" />
              </Link>
            )
          })}
        </div>
      </div>

      {/* Coming soon section */}
      <div className="rounded-2xl border border-dashed border-stone-200 dark:border-zinc-700 p-8 flex flex-col items-center justify-center gap-2 text-center">
        <p className="text-[13px] font-semibold text-stone-500 dark:text-zinc-400">
          Módulo en construcción
        </p>
        <p className="text-[12px] text-stone-400 dark:text-zinc-600 max-w-xs">
          Aquí se concentrarán todas las operaciones, KPIs y herramientas específicas para la cuenta Walmart.
        </p>
      </div>
    </div>
  )
}
