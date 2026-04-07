/**
 * @fileoverview Entidades para el Dashboard.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

/**
 * Categoría del KPI para distinguir el origen.
 */
type KPICategory = 'operative' | 'financial'

/**
 * Representa un KPI individual en el dashboard.
 */
export interface KPIEntity {
  id: string
  title: string
  value: string | number
  unit?: string
  trend?: {
    value: number
    isPositive: boolean
  }
  /** Texto descriptivo del trend (e.g. "vs. mes anterior") */
  description?: string
  icon?: string
  color?: string
  /** Categoría del KPI */
  category: KPICategory
}

/**
 * Agrupación de KPIs por categoría.
 */
export interface DashboardMetrics {
  operative: KPIEntity[]
  financial: KPIEntity[]
}
