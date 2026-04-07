/**
 * @fileoverview Implementación de repositorio Mock para el Dashboard.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

import type { IDashboardRepository } from '../../domain/repositories/dashboard-repository'
import type { KPIEntity } from '../../domain/entities/kpi-entity'
import type { Either, Failure } from '@/src/core/domain/either'

/**
 * Repositorio Mock para desarrollo UI.
 * No depende de Supabase en esta etapa.
 */
export class MockDashboardRepository implements IDashboardRepository {
  /**
   * Simula la obtención de métricas operativas.
   */
  async getOperativeMetrics(): Promise<Either<Failure, KPIEntity[]>> {
    // Simulamos un delay de red
    await new Promise((resolve) => setTimeout(resolve, 800))

    const metrics: KPIEntity[] = [
      {
        id: 'op-1',
        title: 'Viajes Activos',
        value: 24,
        icon: 'Truck',
        color: 'text-primary',
        trend: { value: 12, isPositive: true },
        description: 'vs. mes anterior',
        category: 'operative',
      },
      {
        id: 'op-2',
        title: 'Unidades Disponibles',
        value: 86,
        unit: '%',
        icon: 'Settings',
        color: 'text-emerald-500',
        trend: { value: 5, isPositive: true },
        description: 'vs. semana pasada',
        category: 'operative',
      },
      {
        id: 'op-3',
        title: 'Alertas Mantto.',
        value: 3,
        icon: 'AlertTriangle',
        color: 'text-amber-500',
        trend: { value: 1, isPositive: false },
        description: 'nuevas hoy',
        category: 'operative',
      },
      {
        id: 'op-4',
        title: 'Entregas a Tiempo',
        value: '98.2',
        unit: '%',
        icon: 'Clock',
        color: 'text-emerald-500',
        trend: { value: 0.5, isPositive: true },
        description: 'vs. mes anterior',
        category: 'operative',
      },
    ]

    return { ok: true, data: metrics }
  }

  /**
   * Simula la obtención de métricas financieras.
   */
  async getFinancialMetrics(): Promise<Either<Failure, KPIEntity[]>> {
    // Simulamos un delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const metrics: KPIEntity[] = [
      {
        id: 'fin-1',
        title: 'Ingresos Mensuales',
        value: '$1,240,500',
        icon: 'DollarSign',
        color: 'text-indigo-500',
        trend: { value: 8.4, isPositive: true },
        description: 'vs. mes anterior',
        category: 'financial',
      },
      {
        id: 'fin-2',
        title: 'Gastos Operativos',
        value: '$840,200',
        icon: 'CreditCard',
        color: 'text-rose-500',
        trend: { value: 2.1, isPositive: false },
        description: 'vs. mes anterior',
        category: 'financial',
      },
      {
        id: 'fin-3',
        title: 'Margen Neto',
        value: '32.5',
        unit: '%',
        icon: 'TrendingUp',
        color: 'text-cyan-500',
        trend: { value: 1.2, isPositive: true },
        description: 'vs. mes anterior',
        category: 'financial',
      },
      {
        id: 'fin-4',
        title: 'Costo por Km',
        value: '$12.45',
        icon: 'BarChart3',
        color: 'text-violet-500',
        trend: { value: 0.3, isPositive: true },
        description: 'vs. trimestre anterior',
        category: 'financial',
      },
    ]

    return { ok: true, data: metrics }
  }
}
