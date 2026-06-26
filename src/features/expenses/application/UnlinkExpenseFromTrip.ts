import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'

export async function UnlinkExpenseFromTrip(
  repo: IExpenseAssignmentsRepository,
  expenseId: string
): Promise<Either<Failure, void>> {
  try {
    return await repo.unlinkExpenseFromTrip(expenseId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al desvincular gasto del viaje' } }
  }
}
