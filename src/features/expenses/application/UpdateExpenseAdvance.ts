import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '@/src/features/expenses/domain/repositories/i-expense-assignments-repository'
import type { ExpenseAdvanceEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import { createExpenseAdvanceSchema, type CreateExpenseAdvanceInput } from '@/src/features/expenses/domain/schemas/create-expense-advance.schema'

export async function UpdateExpenseAdvance(
  repo: IExpenseAssignmentsRepository,
  id: string,
  input: CreateExpenseAdvanceInput
): Promise<Either<Failure, ExpenseAdvanceEntity>> {
  const result = createExpenseAdvanceSchema.safeParse(input)
  if (!result.success) {
    return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Datos de entrada inválidos para actualizar la asignación' } }
  }
  return repo.updateAdvance(id, result.data)
}
