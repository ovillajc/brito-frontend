import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '@/src/features/expenses/domain/repositories/i-expense-assignments-repository'

export async function DeleteExpenseAdvance(
  repo: IExpenseAssignmentsRepository,
  id: string
): Promise<Either<Failure, void>> {
  if (!id) {
    return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'ID de asignación no proporcionado' } }
  }
  return repo.deleteAdvance(id)
}
