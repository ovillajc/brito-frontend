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
import { SupabaseFuelMetricsRepository } from '@/src/features/trips/infrastructure/repositories/SupabaseFuelMetricsRepository'
import { DeleteFuelLoad } from '@/src/features/trips/application/DeleteFuelLoad'

// #region debug-point diesel-expense-delete-reporter
const __DBG_URL = process.env.DEBUG_SERVER_URL ?? ''
const __DBG_SESSION = process.env.DEBUG_SESSION_ID ?? ''
const __DBG_RUN_ID = process.env.DEBUG_RUN_ID ?? ''

async function dbgReport(event: string, data: Record<string, unknown> = {}) {
  if (!__DBG_URL || !__DBG_SESSION) return
  try {
    await fetch(__DBG_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        ts: new Date().toISOString(),
        sessionId: __DBG_SESSION,
        runId: __DBG_RUN_ID || undefined,
        event,
        data,
      }),
      cache: 'no-store',
    })
  } catch {}
}
// #endregion debug-point diesel-expense-delete-reporter

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
  // #region debug-point expense-create-missing-start
  await dbgReport('expenses.create.start', {
    hasReceiptUrl: !!input.receiptUrl,
    categoryId: input.categoryId,
    subcategoryId: input.subcategoryId,
    amount: (input as unknown as { amount?: unknown } | null | undefined)?.amount ?? null,
    unitPrice: (input as unknown as { unitPrice?: unknown } | null | undefined)?.unitPrice ?? null,
    quantity: (input as unknown as { quantity?: unknown } | null | undefined)?.quantity ?? null,
    tripId: (input as unknown as { tripId?: unknown } | null | undefined)?.tripId ?? null,
  })
  // #endregion debug-point expense-create-missing-start

  const canManage = await hasPermission('expenses:manage')
  const canCreate = canManage || (await hasPermission('expenses:create'))
  if (!canCreate) {
    // #region debug-point expense-create-missing-forbidden
    await dbgReport('expenses.create.forbidden', {})
    // #endregion debug-point expense-create-missing-forbidden
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }

  const amountRaw = (input as unknown as Record<string, unknown>)['amount']
  const amount = typeof amountRaw === 'number' ? amountRaw : Number(amountRaw)
  if (!Number.isFinite(amount) || amount <= 0) {
    // #region debug-point expense-create-missing-invalid-amount
    await dbgReport('expenses.create.invalid_amount', { amountRaw, amount })
    // #endregion debug-point expense-create-missing-invalid-amount
    if (input.receiptUrl) {
      await deleteR2ObjectByPublicUrl(input.receiptUrl)
    }
    return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Monto total inválido. Captura precio unitario y cantidad.' } }
  }

  const profileId = await getCurrentProfileId()
  if (!profileId) {
    // #region debug-point expense-create-missing-no-profile
    await dbgReport('expenses.create.no_profile', {})
    // #endregion debug-point expense-create-missing-no-profile
    if (input.receiptUrl) {
      await deleteR2ObjectByPublicUrl(input.receiptUrl)
    }
    return { ok: false, error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 } }
  }
  const repo = new SupabaseExpensesServerRepository()
  const result = await CreateExpense(repo, input, profileId)
  if (result.ok) {
    // #region debug-point expense-create-missing-db-ok
    await dbgReport('expenses.create.db_ok', { id: result.data.id })
    // #endregion debug-point expense-create-missing-db-ok
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  } else {
    // #region debug-point expense-create-missing-db-failed
    await dbgReport('expenses.create.db_failed', {
      errorCode: result.error.code,
      errorMessage: result.error.message,
    })
    // #endregion debug-point expense-create-missing-db-failed
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
  // #region debug-point diesel-expense-delete-start
  await dbgReport('expenses.delete.start', { expenseId })
  // #endregion debug-point diesel-expense-delete-start

  const canManage = await hasPermission('expenses:manage')
  if (!canManage) {
    // #region debug-point diesel-expense-delete-forbidden
    await dbgReport('expenses.delete.forbidden', { expenseId })
    // #endregion debug-point diesel-expense-delete-forbidden
    return { ok: false, error: { code: 'FORBIDDEN', message: 'No autorizado', statusCode: 403 } }
  }
  const supabase = await createClient()

  const { data: linkedMovements, error: linkedMovementsError } = await supabase
    .from('fuel_tank_movements')
    .select('id,fuel_load_id')
    .eq('expense_id', expenseId)

  if (linkedMovementsError) {
    await dbgReport('expenses.delete.linked_movements_error', {
      expenseId,
      message: linkedMovementsError.message,
    })
    return { ok: false, error: { code: 'DB_ERROR', message: linkedMovementsError.message } }
  }

  const { data: linkedFuelLoads, error: linkedFuelLoadsError } = await supabase
    .from('fuel_loads')
    .select('id,ticket_url')
    .eq('expense_id', expenseId)

  if (linkedFuelLoadsError) {
    await dbgReport('expenses.delete.linked_fuel_loads_error', {
      expenseId,
      message: linkedFuelLoadsError.message,
    })
    return { ok: false, error: { code: 'DB_ERROR', message: linkedFuelLoadsError.message } }
  }

  const linkedFuelLoadRows =
    (linkedFuelLoads as Array<{ id: string; ticket_url: string | null }> | null) ?? []

  const linkedMovementRows =
    (linkedMovements as Array<{ id: string; fuel_load_id: string | null }> | null) ?? []

  const fuelLoadIds = new Set<string>()
  for (const row of linkedFuelLoadRows) fuelLoadIds.add(row.id)
  for (const mv of linkedMovementRows) if (mv.fuel_load_id) fuelLoadIds.add(mv.fuel_load_id)

  if (fuelLoadIds.size > 0 || linkedMovementRows.length > 0) {
    await dbgReport('expenses.delete.linked_detected', {
      expenseId,
      fuelLoads: fuelLoadIds.size,
      movements: linkedMovementRows.length,
    })

    const loadsToDelete = Array.from(fuelLoadIds)
    if (loadsToDelete.length > 0) {
      const { data: loadTickets, error: loadTicketsError } = await supabase
        .from('fuel_loads')
        .select('id,ticket_url')
        .in('id', loadsToDelete)

      if (loadTicketsError) {
        await dbgReport('expenses.delete.load_tickets_error', { expenseId, message: loadTicketsError.message })
        return { ok: false, error: { code: 'DB_ERROR', message: loadTicketsError.message } }
      }

      const ticketByLoadId = new Map<string, string | null>()
      for (const row of (loadTickets as Array<{ id: string; ticket_url: string | null }> | null) ?? []) {
        ticketByLoadId.set(row.id, row.ticket_url)
      }

      const fuelRepo = new SupabaseFuelMetricsRepository()
      for (const fuelLoadId of loadsToDelete) {
        const del = await DeleteFuelLoad(fuelRepo, fuelLoadId)
        if (!del.ok) {
          await dbgReport('expenses.delete.fuel_load_delete_failed', {
            expenseId,
            fuelLoadId,
            errorCode: del.error.code,
            errorMessage: del.error.message,
          })
          return {
            ok: false,
            error: {
              code: del.error.code,
              message: `No se pudo eliminar la carga de diésel vinculada. ${del.error.message}`,
            },
          }
        }

        const ticketUrl = ticketByLoadId.get(fuelLoadId) ?? null
        if (ticketUrl) {
          const r2 = await deleteR2ObjectByPublicUrl(ticketUrl)
          await dbgReport('expenses.delete.fuel_load_r2', {
            expenseId,
            fuelLoadId,
            ok: r2.ok,
            errorCode: r2.ok ? null : r2.error.code,
            errorMessage: r2.ok ? null : r2.error.message,
          })
        }
      }
    }

    const { error: deleteMovementsError } = await supabase
      .from('fuel_tank_movements')
      .delete()
      .eq('expense_id', expenseId)

    if (deleteMovementsError) {
      await dbgReport('expenses.delete.movements_delete_failed', {
        expenseId,
        message: deleteMovementsError.message,
      })
      return { ok: false, error: { code: 'DB_ERROR', message: deleteMovementsError.message } }
    }

    revalidatePath('/trips/fuel')
    revalidatePath('/trips/fuel/load')
  }

  const prev = await supabase.from('expenses').select('receipt_url').eq('id', expenseId).maybeSingle()
  const previousReceiptUrl =
    prev.data && typeof (prev.data as Record<string, unknown>).receipt_url === 'string'
      ? ((prev.data as Record<string, unknown>).receipt_url as string)
      : null

  // #region debug-point diesel-expense-delete-prev
  await dbgReport('expenses.delete.prev', {
    expenseId,
    hasReceiptUrl: !!previousReceiptUrl,
  })
  // #endregion debug-point diesel-expense-delete-prev

  const repo = new SupabaseExpensesServerRepository()
  const result = await DeleteExpense(repo, expenseId)
  if (result.ok) {
    // #region debug-point diesel-expense-delete-db-ok
    await dbgReport('expenses.delete.db_ok', { expenseId })
    // #endregion debug-point diesel-expense-delete-db-ok

    const check = await supabase.from('expenses').select('id').eq('id', expenseId).maybeSingle()
    const stillExists = !!check.data
    // #region debug-point diesel-expense-delete-db-exists
    await dbgReport('expenses.delete.db_check', {
      expenseId,
      stillExists,
      checkError: check.error?.message ?? null,
    })
    // #endregion debug-point diesel-expense-delete-db-exists

    if (stillExists) {
      return {
        ok: false,
        error: {
          code: 'FORBIDDEN',
          statusCode: 403,
          message: 'No se pudo eliminar el gasto. Posible restricción por permisos (RLS) o vínculos activos.',
        },
      }
    }

    if (previousReceiptUrl) {
      const r2 = await deleteR2ObjectByPublicUrl(previousReceiptUrl)
      // #region debug-point diesel-expense-delete-r2
      await dbgReport('expenses.delete.r2', {
        expenseId,
        ok: r2.ok,
        errorCode: r2.ok ? null : r2.error.code,
        errorMessage: r2.ok ? null : r2.error.message,
      })
      // #endregion debug-point diesel-expense-delete-r2
    }
    revalidatePath('/expenses')
    revalidatePath('/expenses/list')
  } else {
    // #region debug-point diesel-expense-delete-db-failed
    await dbgReport('expenses.delete.db_failed', {
      expenseId,
      errorCode: result.error.code,
      errorMessage: result.error.message,
    })
    // #endregion debug-point diesel-expense-delete-db-failed
  }
  return result
}
