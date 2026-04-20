import { Either, Failure } from '@/src/core/domain/either'
import { UnitAssemblyEntity, UnitAssemblyLogEntity } from '../../domain/entities'
import { IUnitAssemblyRepository } from '../../domain/repositories/IUnitAssemblyRepository'

export async function GetUnitAssembliesUseCase(
  repository: IUnitAssemblyRepository
): Promise<Either<Failure, UnitAssemblyEntity[]>> {
  try {
    return { ok: true, data: await repository.findAll() }
  } catch (e) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: e instanceof Error ? e.message : 'Error desconocido' } }
  }
}

export async function CreateUnitAssemblyUseCase(
  repository: IUnitAssemblyRepository,
  input: Partial<UnitAssemblyEntity>,
  profileId?: string
): Promise<Either<Failure, UnitAssemblyEntity>> {
  try {
    return { ok: true, data: await repository.create(input, profileId) }
  } catch (e) {
    return { ok: false, error: { code: 'CREATE_ERROR', message: e instanceof Error ? e.message : 'Error al crear' } }
  }
}

export async function UpdateUnitAssemblyUseCase(
  repository: IUnitAssemblyRepository,
  input: Partial<UnitAssemblyEntity>,
  profileId?: string
): Promise<Either<Failure, UnitAssemblyEntity>> {
  try {
    if (!input.id) throw new Error('ID requerido')
    return { ok: true, data: await repository.update(input.id, input, profileId) }
  } catch (e) {
    return { ok: false, error: { code: 'UPDATE_ERROR', message: e instanceof Error ? e.message : 'Error al actualizar' } }
  }
}

export async function DeleteUnitAssemblyUseCase(
  repository: IUnitAssemblyRepository,
  id: string
): Promise<Either<Failure, void>> {
  try {
    await repository.delete(id)
    return { ok: true, data: undefined }
  } catch (e) {
    return { ok: false, error: { code: 'DELETE_ERROR', message: e instanceof Error ? e.message : 'Error al eliminar' } }
  }
}

export async function GetUnitAssemblyLogsUseCase(
  repository: IUnitAssemblyRepository,
  unitId: string
): Promise<Either<Failure, UnitAssemblyLogEntity[]>> {
  try {
    return { ok: true, data: await repository.getLogsByUnitId(unitId) }
  } catch (e) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: e instanceof Error ? e.message : 'Error al obtener logs' } }
  }
}
