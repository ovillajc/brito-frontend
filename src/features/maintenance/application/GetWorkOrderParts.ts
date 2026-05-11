import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { WorkOrderPartEntity } from '../domain/entities/maintenance-entity'

export async function GetWorkOrderParts(
  repo: IMaintenanceRepository,
  workOrderId: string
): Promise<Either<Failure, WorkOrderPartEntity[]>> {
  try {
    return await repo.listWorkOrderParts(workOrderId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener refacciones' } }
  }
}

