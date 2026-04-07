/**
 * @fileoverview Caso de uso para obtener un resumen de la flotilla.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IFleetRepository } from '../../domain/repositories/fleet-repository'

export interface FleetSummary {
  tractorsCount: number
  trailersCount: number
  operatorsCount: number
  activeAssembliesCount: number
  alertsCount: number
}

/**
 * Obtiene las métricas generales del módulo de flotilla.
 * @param repo - Repositorio de flotilla.
 * @returns Resumen consolidado.
 */
export async function GetFleetSummaryUseCase(
  repo: IFleetRepository
): Promise<Either<Failure, FleetSummary>> {
  try {
    const [tractors, trailers, operators, assemblies] = await Promise.all([
      repo.getTractors(),
      repo.getTrailers(),
      repo.getOperators(),
      repo.getActiveAssemblies()
    ])

    if (!tractors.ok) return tractors
    if (!trailers.ok) return trailers
    if (!operators.ok) return operators
    if (!assemblies.ok) return assemblies

    return {
      ok: true,
      data: {
        tractorsCount: tractors.data.length,
        trailersCount: trailers.data.length,
        operatorsCount: operators.data.length,
        activeAssembliesCount: assemblies.data.length,
        alertsCount: 2 // Simulado: documentos por vencer
      }
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: error instanceof Error ? error.message : 'Error al obtener resumen de flotilla'
      }
    }
  }
}
