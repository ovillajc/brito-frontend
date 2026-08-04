import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { CreateWorkshopStayInput } from '../domain/schemas/create-stay.schema'

export async function CreateWorkshopStay(
  repo: IMaintenanceRepository,
  input: CreateWorkshopStayInput,
  createdBy: string | null
): Promise<Either<Failure, void>> {
  try {
    return await repo.createStay(input, createdBy)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error inesperado al crear la estancia'
    console.error('[CreateWorkshopStay] Unexpected error:', err)
    return { ok: false, error: { code: 'UNEXPECTED', message } }
  }
}

