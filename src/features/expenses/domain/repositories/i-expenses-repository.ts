import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseEntity } from '../entities/expense-entity'
import type { CreateExpenseInput } from '../schemas/create-expense.schema'

export interface IExpensesRepository {
  listAll(): Promise<Either<Failure, ExpenseEntity[]>>
  create(input: CreateExpenseInput): Promise<Either<Failure, ExpenseEntity>>
}

