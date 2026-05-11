/**
 * @fileoverview Use Case: Obtener gastos operativos con filtros.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseEntity } from '../domain/entities/expense-entity'
import type { IExpensesRepository, ExpensesListFilters } from '../domain/repositories/i-expenses-repository'

/**
 * Lista los gastos operativos aplicando filtros opcionales.
 *
 * @param repo - Implementación del repositorio de gastos inyectada.
 * @param filters - Filtros opcionales (tripId, categoryId, rango de fechas, límite).
 * @returns Either con Failure o arreglo de ExpenseEntity.
 */
export async function GetExpenses(
  repo: IExpensesRepository,
  filters?: ExpensesListFilters
): Promise<Either<Failure, ExpenseEntity[]>> {
  try {
    return await repo.list(filters)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener gastos' } }
  }
}
