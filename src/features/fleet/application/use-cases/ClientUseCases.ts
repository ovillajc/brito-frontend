import { Either, Failure } from '@/src/core/domain/either'
import { ClientEntity } from '../../domain/entities'
import { SupabaseClientRepository } from '../../infrastructure/repositories/SupabaseClientRepository'

export async function GetClientsUseCase(
  repository: SupabaseClientRepository
): Promise<Either<Failure, ClientEntity[]>> {
  try {
    const clients = await repository.findAll()
    return { ok: true, data: clients }
  } catch (e) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: e instanceof Error ? e.message : 'Error desconocido' } }
  }
}
