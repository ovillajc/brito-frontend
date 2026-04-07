/**
 * @fileoverview Caso de uso para obtener métricas financieras.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

import type { IDashboardRepository } from '../domain/repositories/dashboard-repository'
import type { KPIEntity } from '../domain/entities/kpi-entity'
import type { Either, Failure } from '@/src/core/domain/either'

/**
 * Obtiene las métricas financieras del sistema.
 * @param repo - Implementación del IDashboardRepository.
 * @returns Promise con Either<Failure, KPIEntity[]>
 */
export async function GetFinancialKPIsUseCase(
  repo: IDashboardRepository
): Promise<Either<Failure, KPIEntity[]>> {
  try {
    return await repo.getFinancialMetrics()
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Error inesperado al obtener métricas financieras',
      },
    }
  }
}
