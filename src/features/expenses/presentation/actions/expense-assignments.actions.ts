'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseExpenseAssignmentsServerRepository } from '@/src/features/expenses/infrastructure/repositories/SupabaseExpenseAssignmentsServerRepository'
import { CreateExpenseAdvance } from '@/src/features/expenses/application/CreateExpenseAdvance'
import { LinkExpenseAdvanceToTrip } from '@/src/features/expenses/application/LinkExpenseAdvanceToTrip'
import { CreateTripSettlement } from '@/src/features/expenses/application/CreateTripSettlement'
import { DeleteTripSettlement } from '@/src/features/expenses/application/DeleteTripSettlement'
import { UpdateExpenseAdvance } from '@/src/features/expenses/application/UpdateExpenseAdvance'
import { DeleteExpenseAdvance } from '@/src/features/expenses/application/DeleteExpenseAdvance'
import { CreateOperatorSettlement } from '@/src/features/expenses/application/CreateOperatorSettlement'
import { CloseOperatorSettlement } from '@/src/features/expenses/application/CloseOperatorSettlement'
import { LinkExpenseToSettlement, UnlinkExpenseFromSettlement } from '@/src/features/expenses/application/LinkExpenseToSettlement'
import type { ExpenseAdvanceEntity, TripExpenseSettlementEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import type { OperatorSettlementEntity } from '@/src/features/expenses/domain/entities/operator-settlement-entity'
import type { CreateExpenseAdvanceInput } from '@/src/features/expenses/domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '@/src/features/expenses/domain/schemas/create-trip-settlement.schema'
import type {
  CreateOperatorSettlementInput,
  CloseOperatorSettlementInput,
  LinkExpenseToSettlementInput,
  ReopenOperatorSettlementInput,
} from '@/src/features/expenses/domain/schemas/operator-settlement.schema'
import { deleteR2ObjectByPublicUrl } from '@/src/core/infrastructure/storage/r2-client'

async function getCurrentProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

const repo = new SupabaseExpenseAssignmentsServerRepository()

export async function createExpenseAdvanceAction(
  input: CreateExpenseAdvanceInput
): Promise<Either<Failure, ExpenseAdvanceEntity>> {
  const profileId = await getCurrentProfileId()
  const result = await CreateExpenseAdvance(repo, input, profileId)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

export async function updateExpenseAdvanceAction(
  id: string,
  input: CreateExpenseAdvanceInput
): Promise<Either<Failure, ExpenseAdvanceEntity>> {
  const result = await UpdateExpenseAdvance(repo, id, input)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

export async function deleteExpenseAdvanceAction(
  id: string
): Promise<Either<Failure, void>> {
  const result = await DeleteExpenseAdvance(repo, id)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

export async function linkExpenseAdvanceToTripAction(
  advanceId: string,
  tripId: string
): Promise<Either<Failure, void>> {
  const result = await LinkExpenseAdvanceToTrip(repo, advanceId, tripId)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

export async function createTripSettlementAction(
  input: CreateTripSettlementInput
): Promise<Either<Failure, TripExpenseSettlementEntity>> {
  const profileId = await getCurrentProfileId()
  const result = await CreateTripSettlement(repo, input, profileId)
  if (result.ok) {
    revalidatePath('/expenses/assignments')
  } else {
    if (input.receiptUrl) {
      await deleteR2ObjectByPublicUrl(input.receiptUrl)
    }
  }
  return result
}

export async function deleteTripSettlementAction(
  tripId: string
): Promise<Either<Failure, void>> {
  const result = await DeleteTripSettlement(repo, tripId)
  if (result.ok) {
    revalidatePath('/expenses/assignments')
  }
  return result
}

export async function unlinkExpenseFromTripAction(
  expenseId: string
): Promise<Either<Failure, void>> {
  const { UnlinkExpenseFromTrip } = await import('@/src/features/expenses/application/UnlinkExpenseFromTrip')
  const result = await UnlinkExpenseFromTrip(repo, expenseId)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

// ── Nuevo flujo: Ajuste de Cuentas por Operador ───────────────────────────

export async function createOperatorSettlementAction(
  input: CreateOperatorSettlementInput
): Promise<Either<Failure, OperatorSettlementEntity>> {
  const profileId = await getCurrentProfileId()
  const result = await CreateOperatorSettlement(repo, input, profileId)
  if (result.ok) {
    revalidatePath('/expenses/assignments')
  } else {
    if (input.receiptUrl) {
      await deleteR2ObjectByPublicUrl(input.receiptUrl)
    }
  }
  return result
}

export async function closeOperatorSettlementAction(
  input: CloseOperatorSettlementInput
): Promise<Either<Failure, OperatorSettlementEntity>> {
  const supabase = await createClient()
  const prev = await supabase
    .from('operator_settlements')
    .select('receipt_url')
    .eq('id', input.settlementId)
    .maybeSingle()
  const previousReceiptUrl =
    prev.data && typeof (prev.data as Record<string, unknown>).receipt_url === 'string'
      ? ((prev.data as Record<string, unknown>).receipt_url as string)
      : null

  const profileId = await getCurrentProfileId()
  const result = await CloseOperatorSettlement(repo, input, profileId)
  if (result.ok) {
    const nextReceiptUrl = result.data.receiptUrl ?? null
    if (previousReceiptUrl && previousReceiptUrl !== nextReceiptUrl) {
      await deleteR2ObjectByPublicUrl(previousReceiptUrl)
    }
    revalidatePath('/expenses/assignments')
  } else {
    const nextReceiptUrl = input.receiptUrl ?? null
    if (nextReceiptUrl && nextReceiptUrl !== previousReceiptUrl) {
      await deleteR2ObjectByPublicUrl(nextReceiptUrl)
    }
  }
  return result
}

export async function reopenOperatorSettlementAction(
  input: ReopenOperatorSettlementInput
): Promise<Either<Failure, OperatorSettlementEntity>> {
  const { ReopenOperatorSettlement } = await import('@/src/features/expenses/application/ReopenOperatorSettlement')
  const profileId = await getCurrentProfileId()
  const result = await ReopenOperatorSettlement(repo, input, profileId)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

export async function linkExpenseToSettlementAction(
  input: LinkExpenseToSettlementInput
): Promise<Either<Failure, void>> {
  const result = await LinkExpenseToSettlement(repo, input)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

export async function unlinkExpenseFromSettlementAction(
  expenseId: string
): Promise<Either<Failure, void>> {
  const result = await UnlinkExpenseFromSettlement(repo, expenseId)
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

export async function deleteOperatorSettlementAction(
  id: string
): Promise<Either<Failure, void>> {
  const { DeleteOperatorSettlement } = await import('@/src/features/expenses/application/DeleteOperatorSettlement')
  const supabase = await createClient()
  const prev = await supabase
    .from('operator_settlements')
    .select('receipt_url')
    .eq('id', id)
    .maybeSingle()
  const previousReceiptUrl =
    prev.data && typeof (prev.data as Record<string, unknown>).receipt_url === 'string'
      ? ((prev.data as Record<string, unknown>).receipt_url as string)
      : null

  const result = await DeleteOperatorSettlement(repo, id)
  if (result.ok) {
    if (previousReceiptUrl) {
      await deleteR2ObjectByPublicUrl(previousReceiptUrl)
    }
    revalidatePath('/expenses/assignments')
  }
  return result
}
