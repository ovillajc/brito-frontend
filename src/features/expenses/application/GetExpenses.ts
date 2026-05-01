import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseEntity, ExpenseScope } from '../domain/entities/expense-entity'
import type { IExpensesRepository } from '../domain/repositories/i-expenses-repository'

export interface GetExpensesFilters {
  scope?: ExpenseScope
  tripId?: string
}

export async function GetExpenses(
  repo: IExpensesRepository,
  filters?: GetExpensesFilters
): Promise<Either<Failure, ExpenseEntity[]>> {
  try {
    const result = await repo.listAll()
    if (!result.ok) return result

    const scope = filters?.scope
    const tripId = filters?.tripId

    const data = result.data.filter((e) => {
      if (scope && e.scope !== scope) return false
      if (tripId && e.tripId !== tripId) return false
      return true
    })

    return { ok: true, data }
  } catch {
    return {
      ok: false,
      error: { code: 'UNEXPECTED', message: 'Error al obtener gastos' },
    }
  }
}

