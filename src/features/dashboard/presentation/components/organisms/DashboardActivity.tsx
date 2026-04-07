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
    iconColor: 'text-primary',
    title: 'Reporte de facturación generado',
    description: 'Periodo Marzo 2026 — $1,240,500 MXN facturados',
    time: 'Hace 3 horas',
  },
  {
    icon: Clock,
    iconColor: 'text-on-surface-variant',
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
      <Card className="lg:col-span-3 border-outline-variant/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold font-headline text-on-surface">
            Actividad Reciente
          </CardTitle>
          <CardDescription className="text-xs text-on-surface-variant">
            Últimos eventos registrados en la plataforma
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {RECENT_ACTIVITY.map((item, index) => (
            <div
              key={item.title}
              className={`flex items-start gap-3 py-3 ${
                index < RECENT_ACTIVITY.length - 1
                  ? 'border-b border-outline-variant/20'
                  : ''
              }`}
            >
              <div className="flex items-center justify-center size-8 rounded-md bg-surface-container shrink-0 mt-0.5">
                <item.icon className={`size-4 ${item.iconColor}`} />
              </div>
              <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                <span className="text-xs font-medium text-on-surface">
                  {item.title}
                </span>
                <span className="text-[11px] text-on-surface-variant truncate">
                  {item.description}
                </span>
              </div>
              <span className="text-[10px] text-on-surface-variant shrink-0">
                {item.time}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <Card className="lg:col-span-2 border-outline-variant/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold font-headline text-on-surface">
            Resumen Rápido
          </CardTitle>
          <CardDescription className="text-xs text-on-surface-variant">
            Métricas clave del sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-0">
          {QUICK_STATS.map((stat, index) => (
            <div
              key={stat.label}
              className={`flex items-center justify-between py-3 ${
                index < QUICK_STATS.length - 1
                  ? 'border-b border-outline-variant/20'
                  : ''
              }`}
            >
              <span className="text-xs text-on-surface-variant">{stat.label}</span>
              <span
                className={`text-sm font-bold font-headline tabular-nums ${
                  stat.status === 'success'
                    ? 'text-emerald-500'
                    : stat.status === 'warning'
                      ? 'text-amber-500'
                      : 'text-on-surface'
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
