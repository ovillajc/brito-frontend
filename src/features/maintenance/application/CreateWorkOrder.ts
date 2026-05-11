import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { CreateWorkOrderInput } from '../domain/schemas/create-work-order.schema'

export async function CreateWorkOrder(
  repo: IMaintenanceRepository,
  input: CreateWorkOrderInput,
  createdBy: string | null
): Promise<Either<Failure, void>> {
  try {
    return await repo.createWorkOrder(input, createdBy)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear la orden de trabajo' } }
  }
}

