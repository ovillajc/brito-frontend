import { Either, Failure } from '@/src/core/domain/either'
import { ClientEntity } from '../domain/entities'
import { IClientRepository } from '../domain/repositories'

export async function GetClientsUseCase(
  repo: IClientRepository
): Promise<Either<Failure, ClientEntity[]>> {
  try {
    const clients = await repo.findAll()
    return { ok: true, data: clients }
  } catch (error) {
    return {
      ok: false,
      error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Error al obtener clientes' },
    }
  }
}
