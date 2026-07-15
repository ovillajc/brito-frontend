import React from 'react'
import Link from 'next/link'
import { ArrowLeft, Circle } from 'lucide-react'
import { ModuleNavTabs, type ModuleNavItem } from '@/src/core/presentation/components/molecules/ModuleNavTabs'

const WALMART_NAV = [
  { name: 'Operadores', href: '/operations/clients/walmart/operators', iconKey: 'Users' },
  { name: 'DETTE', href: '/operations/clients/walmart/dettes', iconKey: 'Receipt' },
  { name: 'Unidades', href: '/operations/clients/walmart/units', iconKey: 'Truck' },
  { name: 'Pool', href: '/operations/clients/walmart/pool', iconKey: 'Package' },
] satisfies ModuleNavItem[]

export default function WalmartOperationsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-6xl mx-auto w-full">
      {/* Back navigation */}
      <Link
        href="/operations"
        className="inline-flex items-center gap-2 text-[12px] font-semibold text-stone-400 dark:text-zinc-500 hover:text-stone-700 dark:hover:text-zinc-300 transition-colors w-fit"
      >
        <ArrowLeft className="size-3.5" />
        Volver a Operaciones
      </Link>

      <header className="flex flex-col gap-4">
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

        <ModuleNavTabs items={WALMART_NAV} />
      </header>

      <main className="min-h-[500px]">
        {children}
      </main>
    </div>
  )
}
