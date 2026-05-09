/**
 * @fileoverview Server Actions para el módulo de Gastos Operativos.
 */

'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseExpensesServerRepository } from '@/src/features/expenses/infrastructure/repositories/SupabaseExpensesServerRepository'
import { CreateExpense } from '@/src/features/expenses/application/CreateExpense'
import { UpdateExpense } from '@/src/features/expenses/application/UpdateExpense'
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
  const repo = new SupabaseExpensesServerRepository()
  const result = await CreateExpense(repo, input, profileId)
  if (result.ok) {
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  }
  return result
}

export async function updateExpenseAction(
  expenseId: string,
  input: CreateExpenseInput
): Promise<Either<Failure, ExpenseEntity>> {
  const repo = new SupabaseExpensesServerRepository()
  const result = await UpdateExpense(repo, expenseId, input)
  if (result.ok) {
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  }
  return result
}

/**
 * Elimina un gasto operativo por ID.
 */
export async function deleteExpenseAction(
  expenseId: string
): Promise<Either<Failure, void>> {
  const repo = new SupabaseExpensesServerRepository()
  const result = await DeleteExpense(repo, expenseId)
  if (result.ok) {
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  }
  return result
}
