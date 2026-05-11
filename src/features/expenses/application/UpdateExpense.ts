import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseEntity } from '../domain/entities/expense-entity'
import type { IExpensesRepository } from '../domain/repositories/i-expenses-repository'
import { createExpenseSchema, type CreateExpenseInput } from '../domain/schemas/create-expense.schema'

export async function UpdateExpense(
  repo: IExpensesRepository,
  expenseId: string,
  input: CreateExpenseInput
): Promise<Either<Failure, ExpenseEntity>> {
  const parsed = createExpenseSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: parsed.error.issues[0]?.message ?? 'Datos inválidos',
      },
    }
  }

  try {
    return await repo.update(expenseId, parsed.data)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al actualizar gasto' } }
  }
}

