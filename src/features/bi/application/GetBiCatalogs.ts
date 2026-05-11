import type { Either, Failure } from '@/src/core/domain/either'
import type { BiCatalogsEntity } from '../domain/entities/bi-entity'
import type { IBiRepository } from '../domain/repositories/i-bi-repository'

export async function GetBiCatalogs(repo: IBiRepository): Promise<Either<Failure, BiCatalogsEntity>> {
  try {
    return await repo.getCatalogs()
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener catálogos BI' } }
  }
}

