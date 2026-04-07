/**
 * @fileoverview Interface del repositorio para el Dashboard.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

import type { DashboardMetrics } from '../entities/kpi-entity'
import type { Either, Failure } from '@/src/core/domain/either'

/**
 * Contrato del repositorio para obtener datos de métricas.
 */
export interface IDashboardRepository {
  /**
   * Obtiene las métricas operativas.
   * @returns Promise con Either<Failure, DashboardMetrics['operative']>
   */
  getOperativeMetrics(): Promise<Either<Failure, DashboardMetrics['operative']>>

  /**
   * Obtiene las métricas financieras.
   * @returns Promise con Either<Failure, DashboardMetrics['financial']>
   */
  getFinancialMetrics(): Promise<Either<Failure, DashboardMetrics['financial']>>
}
