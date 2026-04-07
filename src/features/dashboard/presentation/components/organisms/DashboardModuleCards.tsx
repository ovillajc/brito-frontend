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
          <Card className="h-full border-outline-variant/20 hover:border-primary/30 hover:bg-surface-container-low/50 transition-all duration-300 cursor-pointer">
            <CardContent className="flex flex-col gap-4 p-5">
              {/* Icon + Badge row */}
              <div className="flex items-start justify-between">
                <div className="flex items-center justify-center size-10 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/15 transition-colors">
                  <mod.icon className="size-5 text-primary" />
                </div>
                <Badge
                  variant={mod.badgeVariant}
                  className="text-[9px] tracking-wider uppercase"
                >
                  {mod.badge}
                </Badge>
              </div>

              {/* Title + Description */}
              <div className="flex flex-col gap-1.5">
                <h3 className="text-sm font-semibold text-on-surface font-headline group-hover:text-primary transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs leading-relaxed text-on-surface-variant line-clamp-2">
                  {mod.description}
                </p>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                <span className="text-[10px] font-medium text-on-surface-variant tracking-wide">
                  {mod.stat}
                </span>
                <ArrowRight className="size-3.5 text-on-surface-variant group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
