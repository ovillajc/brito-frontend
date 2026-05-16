import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'

export async function LinkExpenseAdvanceToTrip(
  repo: IExpenseAssignmentsRepository,
  advanceId: string,
  tripId: string
): Promise<Either<Failure, void>> {
  try {
    return await repo.linkAdvanceToTrip(advanceId, tripId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al vincular asignación' } }
  }
}

