import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'

export async function DeleteTripSettlement(
  repo: IExpenseAssignmentsRepository,
  tripId: string
): Promise<Either<Failure, void>> {
  try {
    return await repo.deleteTripSettlement(tripId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al eliminar comprobación' } }
  }
}
