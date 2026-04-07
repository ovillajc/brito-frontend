/**
 * @fileoverview Componente atómico para mostrar un KPI.
 * Diseño basado en el estilo petro-flow: tipografía monospace,
 * valores tabulares, trend con flechas y descripción.
 */

import React from 'react'
import {
  Truck,
  Settings,
  AlertTriangle,
  Clock,
  DollarSign,
  CreditCard,
  TrendingUp,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  type LucideIcon,
} from 'lucide-react'
import { Card, CardContent } from '@/src/core/presentation/components/ui/card'
import { cn } from '@/src/core/infrastructure/utils/cn'

/**
 * Mapa tipado de nombres de ícono a componentes de Lucide.
 * Evita el uso de `any` según AGENTS.md.
 */
const ICON_MAP: Record<string, LucideIcon> = {
  Truck,
  Settings,
  AlertTriangle,
  Clock,
  DollarSign,
  CreditCard,
  TrendingUp,
  BarChart3,
  Activity,
}

interface KPICardProps {
  title: string
  value: string | number
  unit?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  /** Texto descriptivo del trend (e.g. "vs. mes anterior") */
  description?: string
  iconName?: string
  colorClass?: string
  isLoading?: boolean
}

/**
 * Tarjeta de KPI con diseño premium estilo petro-flow.
 * Tipografía monospace para valores, arrows para trends.
 */
export function KPICard({
  title,
  value,
  unit,
  trend,
  description,
  iconName = 'Activity',
  colorClass = 'text-primary',
  isLoading = false,
}: KPICardProps) {
  const Icon = ICON_MAP[iconName] ?? Activity

  if (isLoading) {
    return (
      <Card className="border-outline-variant/20 hover:border-primary/20 transition-colors duration-200">
        <CardContent className="flex flex-col gap-3 p-4 animate-pulse">
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-md bg-surface-container-high" />
            <div className="h-3 w-20 rounded bg-surface-container-high" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <div className="h-8 w-24 rounded bg-surface-container" />
            <div className="h-3 w-8 rounded bg-surface-container-high" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-12 rounded bg-surface-container-high" />
            <div className="h-3 w-16 rounded bg-surface-container-high" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-outline-variant/20 hover:border-primary/20 transition-colors duration-200">
      <CardContent className="flex flex-col gap-3 p-4">
        {/* Top row: icon + label */}
        <div className="flex items-center gap-2">
          <div className={cn('flex items-center justify-center size-8 rounded-md bg-primary/10', colorClass.replace('text-', 'bg-').concat('/10'))}>
            <Icon className={cn('size-4', colorClass)} />
          </div>
          <span className="text-[10px] font-medium tracking-[0.15em] uppercase text-on-surface-variant">
            {title}
          </span>
        </div>

        {/* Value */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-3xl font-bold text-on-surface font-headline tabular-nums">
            {value}
          </span>
          {unit && (
            <span className="text-xs text-on-surface-variant">{unit}</span>
          )}
        </div>

        {/* Change */}
        {trend && (
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'flex items-center gap-0.5 text-[11px] font-medium',
                trend.isPositive ? 'text-emerald-500' : 'text-red-400',
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </div>
            {description && (
              <span className="text-[10px] text-on-surface-variant">
                {description}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
