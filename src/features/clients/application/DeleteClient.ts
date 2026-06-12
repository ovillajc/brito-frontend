import { Either, Failure } from '@/src/core/domain/either'
import { IClientRepository } from '../domain/repositories'

export async function DeleteClientUseCase(
  repo: IClientRepository,
  clientId: string
): Promise<Either<Failure, void>> {
  try {
    await repo.delete(clientId)
    return { ok: true, data: undefined }
  } catch (error) {
    return {
      ok: false,
      error: { code: 'DELETE_ERROR', message: error instanceof Error ? error.message : 'Error al eliminar cliente' },
    }
  }
}
