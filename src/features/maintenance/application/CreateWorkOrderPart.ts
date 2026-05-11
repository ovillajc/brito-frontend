import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { CreateWorkOrderPartInput } from '../domain/schemas/create-part.schema'

export async function CreateWorkOrderPart(
  repo: IMaintenanceRepository,
  input: CreateWorkOrderPartInput,
  createdBy: string | null
): Promise<Either<Failure, void>> {
  try {
    return await repo.createWorkOrderPart(input, createdBy)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear la refacción' } }
  }
}

