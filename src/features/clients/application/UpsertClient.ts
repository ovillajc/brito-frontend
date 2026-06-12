import { Either, Failure } from '@/src/core/domain/either'
import { ClientEntity } from '../domain/entities'
import { IClientRepository } from '../domain/repositories'

export async function UpsertClientUseCase(
  repo: IClientRepository,
  clientData: Partial<ClientEntity>
): Promise<Either<Failure, string>> {
  try {
    const id = await repo.upsert(clientData)
    return { ok: true, data: id }
  } catch (error) {
    return {
      ok: false,
      error: { code: 'UPSERT_ERROR', message: error instanceof Error ? error.message : 'Error al guardar cliente' },
    }
  }
}
