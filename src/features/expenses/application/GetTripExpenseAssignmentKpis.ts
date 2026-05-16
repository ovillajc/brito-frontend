import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { TripExpenseAssignmentKpiEntity } from '../domain/entities/expense-assignment-entity'

export async function GetTripExpenseAssignmentKpis(
  repo: IExpenseAssignmentsRepository,
  limit: number
): Promise<Either<Failure, TripExpenseAssignmentKpiEntity[]>> {
  try {
    return await repo.listTripKpis(limit)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener KPIs de asignación' } }
  }
}

