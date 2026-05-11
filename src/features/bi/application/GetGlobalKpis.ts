import type { Either, Failure } from '@/src/core/domain/either'
import type { GlobalKpiEntity } from '../domain/entities/bi-entity'
import type { IBiRepository } from '../domain/repositories/i-bi-repository'

export async function GetGlobalKpis(repo: IBiRepository): Promise<Either<Failure, GlobalKpiEntity>> {
  try {
    return await repo.getGlobalKpis()
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener KPIs globales' } }
  }
}

