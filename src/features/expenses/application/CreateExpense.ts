import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseEntity } from '../domain/entities/expense-entity'
import type { IExpensesRepository } from '../domain/repositories/i-expenses-repository'
import type { CreateExpenseInput } from '../domain/schemas/create-expense.schema'

export async function CreateExpense(
  repo: IExpensesRepository,
  input: CreateExpenseInput
): Promise<Either<Failure, ExpenseEntity>> {
  try {
    return await repo.create(input)
  } catch {
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: 'Error al registrar gasto' },
    }
  }
}

