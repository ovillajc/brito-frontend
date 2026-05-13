import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { ExpenseAdvanceEntity } from '../domain/entities/expense-assignment-entity'
import type { CreateExpenseAdvanceInput } from '../domain/schemas/create-expense-advance.schema'

export async function CreateExpenseAdvance(
  repo: IExpenseAssignmentsRepository,
  input: CreateExpenseAdvanceInput,
  assignedBy: string | null
): Promise<Either<Failure, ExpenseAdvanceEntity>> {
  try {
    return await repo.createAdvance(input, assignedBy)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear asignación' } }
  }
}

