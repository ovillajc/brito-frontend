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
import { hasPermission } from '@/src/features/auth/infrastructure/dal'
import { deleteR2ObjectByPublicUrl } from '@/src/core/infrastructure/storage/r2-client'

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
  const canManage = await hasPermission('expenses:manage')
  const canCreate = canManage || (await hasPermission('expenses:create'))
  if (!canCreate) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const amountRaw = (input as unknown as Record<string, unknown>)['amount']
  const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) {
    if (input.receiptUrl) {
      await deleteR2ObjectByPublicUrl(input.receiptUrl)
    }
    return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Monto total inválido. Captura precio unitario y cantidad.' } }
  }

  const profileId = await getCurrentProfileId()
  if (!profileId) {
    if (input.receiptUrl) {
      await deleteR2ObjectByPublicUrl(input.receiptUrl)
    }
    return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 } }
  }
  const repo = new SupabaseExpensesServerRepository()
  const result = await CreateExpense(repo, input, profileId)
  if (result.ok) {
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  } else {
    if (input.receiptUrl) {
      await deleteR2ObjectByPublicUrl(input.receiptUrl)
    }
  }
  return result
}

export async function updateExpenseAction(
  expenseId: string,
  input: CreateExpenseInput
): Promise<Either<Failure, ExpenseEntity>> {
  const canManage = await hasPermission('expenses:manage')
  if (!canManage) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }
  const supabase = await createClient()
  const prev = await supabase.from('expenses').select('receipt_url').eq('id', expenseId).maybeSingle()
  const previousReceiptUrl =
    prev.data && typeof (prev.data as Record<string, unknown>).receipt_url === 'string'
      ? ((prev.data as Record<string, unknown>).receipt_url as string)
      : null

  const repo = new SupabaseExpensesServerRepository()
  const result = await UpdateExpense(repo, expenseId, input)
  if (result.ok) {
    const nextReceiptUrl = result.data.receiptUrl ?? null
    if (previousReceiptUrl && previousReceiptUrl !== nextReceiptUrl) {
      await deleteR2ObjectByPublicUrl(previousReceiptUrl)
    }
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  } else {
    const nextReceiptUrl = input.receiptUrl ?? null
    if (nextReceiptUrl && nextReceiptUrl !== previousReceiptUrl) {
      await deleteR2ObjectByPublicUrl(nextReceiptUrl)
    }
  }
  return result
}

/**
 * Elimina un gasto operativo por ID.
 */
export async function deleteExpenseAction(
  expenseId: string
): Promise<Either<Failure, void>> {
  const canManage = await hasPermission('expenses:manage')
  if (!canManage) {
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }
  const supabase = await createClient()
  const prev = await supabase.from('expenses').select('receipt_url').eq('id', expenseId).maybeSingle()
  const previousReceiptUrl =
    prev.data && typeof (prev.data as Record<string, unknown>).receipt_url === 'string'
      ? ((prev.data as Record<string, unknown>).receipt_url as string)
      : null

  const repo = new SupabaseExpensesServerRepository()
  const result = await DeleteExpense(repo, expenseId)
  if (result.ok) {
    if (previousReceiptUrl) {
      await deleteR2ObjectByPublicUrl(previousReceiptUrl)
    }
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  }
  return result
}
