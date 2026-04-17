/**
 * @fileoverview Tarjetas de módulos del sistema con links de navegación.
 * Diseño basado en petro-flow con icon, badge, stat y arrow hover.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import {
  Truck,
  Navigation,
  Users,
  FileText,
  Package,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/src/core/presentation/components/ui/card'
import { Badge } from '@/src/core/presentation/components/ui/badge'

interface SystemModule {
  title: string
  description: string
  icon: LucideIcon
  href: string
  badge: string
  badgeVariant: 'default' | 'secondary' | 'outline'
  stat: string
}

const MODULES: SystemModule[] = [
  {
    title: 'Flotilla',
    description:
      'Gestión de unidades, mantenimiento preventivo y correctivo de la flota vehicular.',
    icon: Truck,
    href: '/dashboard/fleet',
    badge: 'Próximamente',
    badgeVariant: 'secondary',
    stat: '0 unidades',
  },
  {
    title: 'Viajes',
    description:
      'Planeación, seguimiento en ruta y control de entregas de carga pesada y refrigerada.',
    icon: Navigation,
    href: '/dashboard/trips',
    badge: '24 activos',
    badgeVariant: 'default',
    stat: '98.2% a tiempo',
  },
  {
    title: 'Directorio Comercial',
    description:
      'Catálogo de clientes, proveedores, datos fiscales y direcciones de facturación.',
    icon: Users,
    href: '/dashboard/directory',
    badge: 'Activo',
    badgeVariant: 'default',
    stat: 'Clientes & Proveedores',
  },
  {
    title: 'Facturación',
    description:
      'Generación de CFDI 4.0, complemento Carta Porte y gestión de documentos fiscales.',
    icon: FileText,
    href: '/dashboard/billing',
    badge: 'Próximamente',
    badgeVariant: 'secondary',
    stat: 'CFDI 4.0',
  },
  {
    title: 'Logística',
    description:
      'Planeación de carga en tráiler (Tetris), asignación de pallets y órdenes de servicio.',
    icon: Package,
    href: '/dashboard/logistics',
    badge: 'Próximamente',
    badgeVariant: 'secondary',
    stat: 'Planner de carga',
  },
]

/**
 * Grid de tarjetas de módulos del sistema con navegación.
 */
export function DashboardModuleCards() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {MODULES.map((mod) => (
        <Link key={mod.title} href={mod.href} className="group">
          <Card className="h-full bg-white dark:bg-zinc-900 border-stone-200 dark:border-zinc-800 hover:border-[#1a5c3a]/30 dark:hover:border-[#2ecc71]/40 hover:bg-stone-50 dark:hover:bg-zinc-800 hover:shadow-md transition-all duration-300 cursor-pointer shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5">
              {/* Icon + Badge row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center size-10 rounded-lg bg-[#1a5c3a]/10 dark:bg-[#2ecc71]/10 border border-[#1a5c3a]/20 dark:border-[#2ecc71]/20 group-hover:bg-[#1a5c3a]/15 dark:group-hover:bg-[#2ecc71]/20 transition-colors">
                  <mod.icon className="size-5 text-[#1a5c3a] dark:text-[#2ecc71]" />
                </div>
                <Badge
                  variant={mod.badgeVariant}
                  className="text-[9px] tracking-wider uppercase border-stone-200 dark:border-zinc-800"
                >
                  {mod.badge}
                </Badge>
              </div>

              {/* Title + Description */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-black text-stone-900 dark:text-zinc-100 font-headline group-hover:text-[#1a5c3a] dark:group-hover:text-[#2ecc71] transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs leading-relaxed text-stone-500 dark:text-zinc-400 font-medium line-clamp-2">
                  {mod.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-stone-100 dark:border-zinc-800">
                <span className="text-[10px] font-bold text-stone-400 dark:text-zinc-500 tracking-wide uppercase">
                  {mod.stat}
                </span>
                <ArrowRight className="size-3.5 text-stone-400 dark:text-zinc-500 group-hover:text-[#e07020] dark:group-hover:text-[#ffb783] group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
