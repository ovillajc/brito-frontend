import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository } from '../domain/repositories/i-maintenance-repository'
import type { WorkshopWorkOrderEntity } from '../domain/entities/maintenance-entity'

export async function GetStayWorkOrders(
  repo: IMaintenanceRepository,
  stayId: string
): Promise<Either<Failure, WorkshopWorkOrderEntity[]>> {
  try {
    return await repo.listWorkOrders(stayId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener órdenes de trabajo' } }
  }
}

