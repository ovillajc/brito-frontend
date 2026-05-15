'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseExpenseAssignmentsServerRepository } from '@/src/features/expenses/infrastructure/repositories/SupabaseExpenseAssignmentsServerRepository'
import { CreateExpenseAdvance } from '@/src/features/expenses/application/CreateExpenseAdvance'
import { LinkExpenseAdvanceToTrip } from '@/src/features/expenses/application/LinkExpenseAdvanceToTrip'
import { CreateTripSettlement } from '@/src/features/expenses/application/CreateTripSettlement'
import type { ExpenseAdvanceEntity, TripExpenseSettlementEntity } from '@/src/features/expenses/domain/entities/expense-assignment-entity'
import type { CreateExpenseAdvanceInput } from '@/src/features/expenses/domain/schemas/create-expense-advance.schema'
import type { CreateTripSettlementInput } from '@/src/features/expenses/domain/schemas/create-trip-settlement.schema'

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
  if (result.ok) revalidatePath('/expenses/assignments')
  return result
}

