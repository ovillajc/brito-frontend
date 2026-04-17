/**
 * @fileoverview Sección de actividad reciente y resumen rápido del dashboard.
 * Layout 3/5 + 2/5 con timeline y quick stats.
 */

import React from 'react'
import {
  CheckCircle2,
  AlertTriangle,
  Wrench,
  TrendingUp,
  Clock,
} from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/src/core/presentation/components/ui/card'

interface ActivityItem {
  icon: React.ComponentType<{ className?: string }>
  iconColor: string
  title: string
  description: string
  time: string
}

const RECENT_ACTIVITY: ActivityItem[] = [
  {
    icon: CheckCircle2,
    iconColor: 'text-emerald-500',
    title: 'Viaje completado exitosamente',
    description: 'Ruta Villahermosa → Cd. del Carmen — 24 pallets entregados',
    time: 'Hace 15 min',
  },
  {
    icon: AlertTriangle,
    iconColor: 'text-amber-500',
    title: 'Alerta de mantenimiento detectada',
    description: 'Unidad TRC-042 — Aceite de motor por debajo del mínimo',
    time: 'Hace 45 min',
  },
  {
    icon: Wrench,
    iconColor: 'text-blue-400',
    title: 'Mantenimiento preventivo completado',
    description: 'Unidad TRC-018 — Cambio de llantas eje trasero',
    time: 'Hace 2 horas',
  },
  {
    icon: TrendingUp,
    iconColor: 'text-[#1a5c3a]',
    title: 'Reporte de facturación generado',
    description: 'Periodo Marzo 2026 — $1,240,500 MXN facturados',
    time: 'Hace 3 horas',
  },
  {
    icon: Clock,
    iconColor: 'text-stone-400',
    title: 'Orden de servicio creada',
    description: 'Cliente Pemex — Suministro de barita API 20 toneladas',
    time: 'Hace 5 horas',
  },
]

interface QuickStat {
  label: string
  value: string
  status: 'success' | 'warning' | 'neutral'
}

const QUICK_STATS: QuickStat[] = [
  { label: 'Unidades en mantenimiento', value: '3', status: 'warning' },
  { label: 'Viajes en tránsito', value: '12', status: 'neutral' },
  { label: 'Operadores activos', value: '18', status: 'success' },
  { label: 'Entregas pendientes', value: '7', status: 'neutral' },
  { label: 'Alertas activas', value: '2', status: 'warning' },
  { label: 'Eficiencia general', value: '97.4%', status: 'success' },
]

/**
 * Sección inferior del dashboard con Actividad Reciente y Resumen Rápido.
 */
export function DashboardActivity() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
      {/* Recent Activity */}
      <Card className="lg:col-span-3 border-stone-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3 lg:pb-4 border-b border-stone-100 dark:border-zinc-800">
          <CardTitle className="text-sm font-black font-headline text-stone-900 dark:text-zinc-100">
            Actividad Reciente
          </CardTitle>
          <CardDescription className="text-xs font-medium text-stone-500 dark:text-zinc-400">
            Últimos eventos registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0 pt-2 lg:pt-3">
          {RECENT_ACTIVITY.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-start gap-3 py-3 ${
                index < RECENT_ACTIVITY.length - 1
                  ? 'border-b border-stone-100'
                  : ''
              }`}
            >
              <div className="flex items-center justify-center size-8 rounded-md bg-stone-50 dark:bg-zinc-800 border border-stone-100 dark:border-zinc-700 shrink-0 mt-0.5">
                <item.icon className={`size-4 ${item.iconColor}`} />
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">
                  {item.title}
                </span>
                <span className="text-[11px] font-medium text-stone-500 dark:text-zinc-400 truncate">
                  {item.description}
                </span>
              </div>
              <span className="text-[10px] font-medium text-stone-400 dark:text-zinc-500 shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="lg:col-span-2 border-stone-200 dark:border-zinc-800 shadow-sm bg-white dark:bg-zinc-900">
        <CardHeader className="pb-3 lg:pb-4 border-b border-stone-100 dark:border-zinc-800">
          <CardTitle className="text-sm font-black font-headline text-stone-900 dark:text-zinc-100">
            Resumen Rápido
          </CardTitle>
          <CardDescription className="text-xs font-medium text-stone-500 dark:text-zinc-400">
            Métricas clave del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0 pt-2 lg:pt-3">
          {QUICK_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex items-center justify-between py-3 ${
                index < QUICK_STATS.length - 1
                  ? 'border-b border-stone-100'
                  : ''
              }`}
            >
              <span className="text-xs font-bold text-stone-500 dark:text-zinc-400">{stat.label}</span>
              <span
                className={`text-sm font-black font-headline tabular-nums ${
                  stat.status === 'success'
                    ? 'text-[#1a5c3a] dark:text-[#2ecc71]'
                    : stat.status === 'warning'
                      ? 'text-[#e07020] dark:text-[#ffb783]'
                      : 'text-stone-900 dark:text-zinc-100'
                }`}
              >
                {stat.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
