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
  colorClass = 'text-[#1a5c3a]',
  isLoading = false,
}: KPICardProps) {
  const Icon = ICON_MAP[iconName] ?? Activity

  if (isLoading) {
    return (
      <div className="flex flex-col gap-3 p-4 animate-pulse">
        <div className="flex items-center gap-2">
          <div className="size-4 rounded-md bg-stone-200/50" />
          <div className="h-3 w-20 rounded bg-stone-200/50" />
        </div>
        <div className="h-8 w-16 rounded bg-stone-100" />
        <div className="h-3 w-24 rounded bg-stone-200/50" />
      </div>
    )
  }

  return (
    <div className="flex flex-col relative px-6 py-4 justify-between h-full bg-transparent">
      {/* Top row: icon + label */}
      <div className="flex items-center gap-2 mb-3">
        <Icon className="size-4 text-stone-500" />
        <span className="text-[13px] font-bold text-stone-600">
          {title}
        </span>
      </div>

      <div className="flex flex-col mt-auto gap-0.5">
        {/* Value */}
        <div className="flex items-baseline gap-1.5">
          <span className="text-[32px] font-black text-stone-900 leading-none tracking-tight">
            {value}
          </span>
          {unit && (
            <span className="text-sm font-bold text-stone-400">{unit}</span>
          )}
        </div>

        {/* Change / Description */}
        <div className="flex items-center gap-2">
          {trend && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-[11px] font-bold',
                trend.isPositive ? 'text-[#1a5c3a]' : 'text-[#e07020]',
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="size-3" />
              ) : (
                <ArrowDownRight className="size-3" />
              )}
              {trend.isPositive ? '+' : '-'}{trend.value}%
            </div>
          )}
          {description && (
            <span className="text-[11px] font-medium text-stone-500">
              {description}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
