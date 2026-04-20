import { Either, Failure } from '@/src/core/domain/either'
import { TrailerEntity, TrailerModelEntity } from '../../domain/entities'
import { ITrailerRepository, ITrailerModelRepository } from '../../domain/repositories/ITrailerRepository'

export async function GetTrailersUseCase(repository: ITrailerRepository): Promise<Either<Failure, TrailerEntity[]>> {
  try {
    const data = await repository.findAll()
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Error fetching trailers' } }
  }
}

export async function GetTrailerModelsUseCase(repository: ITrailerModelRepository): Promise<Either<Failure, TrailerModelEntity[]>> {
  try {
    const data = await repository.findAll()
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: error instanceof Error ? error.message : 'Error fetching trailer models' } }
  }
}

export async function CreateTrailerUseCase(repository: ITrailerRepository, input: Partial<TrailerEntity>): Promise<Either<Failure, TrailerEntity>> {
  try {
    const data = await repository.create(input)
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: { code: 'CREATE_ERROR', message: error instanceof Error ? error.message : 'Error creating trailer' } }
  }
}

export async function UpdateTrailerUseCase(repository: ITrailerRepository, input: Partial<TrailerEntity>): Promise<Either<Failure, TrailerEntity>> {
  try {
    if (!input.id) throw new Error('Missing ID')
    const data = await repository.update(input.id, input)
    return { ok: true, data }
  } catch (error) {
    return { ok: false, error: { code: 'UPDATE_ERROR', message: error instanceof Error ? error.message : 'Error updating trailer' } }
  }
}

export async function DeleteTrailerUseCase(repository: ITrailerRepository, id: string): Promise<Either<Failure, void>> {
  try {
    await repository.delete(id)
    return { ok: true, data: undefined }
  } catch (error) {
    return { ok: false, error: { code: 'DELETE_ERROR', message: error instanceof Error ? error.message : 'Error deleting trailer' } }
  }
}
