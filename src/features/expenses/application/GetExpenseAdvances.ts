import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpenseAssignmentsRepository } from '../domain/repositories/i-expense-assignments-repository'
import type { ExpenseAdvanceEntity } from '../domain/entities/expense-assignment-entity'

export async function GetExpenseAdvances(repo: IExpenseAssignmentsRepository): Promise<Either<Failure, ExpenseAdvanceEntity[]>> {
  try {
    return await repo.listAdvances()
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener asignaciones' } }
  }
}

