import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'

export async function DeleteOperatorSettlement(
  repository: IExpenseAssignmentsRepository,
  id: string
): Promise<Either<Failure, void>> {
  if (!id) {
    return { ok: false, error: { code: 'INVALID_INPUT', message: 'ID de ajuste requerido' } }
  }

  return repository.deleteOperatorSettlement(id)
}
