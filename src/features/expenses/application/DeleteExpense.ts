/**
 * @fileoverview Use Case: Eliminar un gasto operativo.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpensesRepository } from '../domain/repositories/i-expenses-repository'

/**
 * Elimina un gasto operativo por su ID.
 *
 * @param repo - Implementación del repositorio de gastos inyectada.
 * @param expenseId - ID del gasto a eliminar.
 * @returns Either con Failure o void.
 */
export async function DeleteExpense(
  repo: IExpensesRepository,
  expenseId: string
): Promise<Either<Failure, void>> {
  if (!expenseId) {
    return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'ID de gasto requerido' } }
  }
  try {
    return await repo.delete(expenseId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al eliminar gasto' } }
  }
}
