import { Either, Failure } from '@/src/core/domain/either'
import { ClientPoolEntity } from '../../domain/entities'
import { IClientPoolRepository } from '../../domain/repositories/IClientPoolRepository'

export async function GetClientPoolsUseCase(
  repository: IClientPoolRepository,
  clientId?: string
): Promise<Either<Failure, ClientPoolEntity[]>> {
  try {
    const data = clientId 
      ? await repository.findByClientId(clientId)
      : await repository.findAll()
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: e instanceof Error ? e.message : 'Error desconocido' } }
  }
}

export async function CreateClientPoolUseCase(
  repository: IClientPoolRepository,
  pool: Partial<ClientPoolEntity>
): Promise<Either<Failure, ClientPoolEntity>> {
  try {
    const data = await repository.create(pool)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: { code: 'CREATE_ERROR', message: e instanceof Error ? e.message : 'Error al crear pool' } }
  }
}

export async function UpdateClientPoolUseCase(
  repository: IClientPoolRepository,
  id: string,
  pool: Partial<ClientPoolEntity>
): Promise<Either<Failure, ClientPoolEntity>> {
  try {
    const data = await repository.update(id, pool)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: { code: 'UPDATE_ERROR', message: e instanceof Error ? e.message : 'Error al actualizar pool' } }
  }
}

export async function AssignUnitsToPoolUseCase(
  repository: IClientPoolRepository,
  poolId: string,
  unitIds: string[]
): Promise<Either<Failure, void>> {
  try {
    await repository.assignUnits(poolId, unitIds)
    return { ok: true, data: undefined }
  } catch (e) {
    return { ok: false, error: { code: 'ASSIGN_ERROR', message: e instanceof Error ? e.message : 'Error al asignar unidades' } }
  }
}
