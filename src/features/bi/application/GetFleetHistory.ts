import type { Either, Failure } from '@/src/core/domain/either'
import type { FleetElementType, OperativeHistoryItem } from '../domain/entities/bi-entity'
import type { IBiRepository } from '../domain/repositories/i-bi-repository'

export async function GetFleetHistory(
  repo: IBiRepository,
  type: FleetElementType,
  id: string
): Promise<Either<Failure, OperativeHistoryItem[]>> {
  try {
    return await repo.getFleetHistory(type, id)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener historial operativo' } }
  }
}

