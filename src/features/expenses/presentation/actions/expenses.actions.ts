/**
 * @fileoverview Server Actions para el módulo de Gastos Operativos.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseExpensesRepository } from '@/src/features/expenses/infrastructure/repositories/SupabaseExpensesRepository'
import { CreateExpense } from '@/src/features/expenses/application/CreateExpense'
import { DeleteExpense } from '@/src/features/expenses/application/DeleteExpense'
import type { CreateExpenseInput } from '@/src/features/expenses/domain/schemas/create-expense.schema'
import type { ExpenseEntity } from '@/src/features/expenses/domain/entities/expense-entity'

async function getCurrentProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

/**
 * Registra un nuevo gasto operativo.
 * Invocada desde el wizard de gastos en el cliente.
 */
export async function createExpenseAction(
  input: CreateExpenseInput
): Promise<Either<Failure, ExpenseEntity>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseExpensesRepository()
  const result = await CreateExpense(repo, input, profileId)
  if (result.ok) revalidatePath('/expenses')
  return result
}

/**
 * Elimina un gasto operativo por ID.
 */
export async function deleteExpenseAction(
  expenseId: string
): Promise<Either<Failure, void>> {
  const repo = new SupabaseExpensesRepository()
  const result = await DeleteExpense(repo, expenseId)
  if (result.ok) revalidatePath('/expenses')
  return result
}
