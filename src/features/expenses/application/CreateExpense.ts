/**
 * @fileoverview Use Case: Registrar un gasto operativo.
 * Valida con Zod antes de persistir y retorna Either<Failure, ExpenseEntity>.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { ExpenseEntity } from '../domain/entities/expense-entity'
import type { IExpensesRepository } from '../domain/repositories/i-expenses-repository'
import { createExpenseSchema, type CreateExpenseInput } from '../domain/schemas/create-expense.schema'

/**
 * Registra un gasto operativo en la base de datos.
 *
 * @param repo - Implementación del repositorio de gastos inyectada.
 * @param input - Datos del gasto (validados por Zod).
 * @param createdByProfileId - ID del perfil autenticado que registra el gasto.
 * @returns Either con Failure o ExpenseEntity creado.
 */
export async function CreateExpense(
  repo: IExpensesRepository,
  input: CreateExpenseInput,
  createdByProfileId: string | null
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
    return await repo.create(parsed.data, createdByProfileId)
  } catch {
    return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al registrar gasto' } }
  }
}
