'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseFuelTankRepository } from '@/src/features/fuel/infrastructure/repositories/SupabaseFuelTankRepository'
import type { FuelTankMovementEntity, FuelTankSummaryEntity } from '@/src/features/fuel/domain/entities/fuel-tank-entity'

type ExpenseCategoryRow = { id: string; name: string }
type ExpenseRow = { id: string }

async function ensureExpenseCategoryId(name: string): Promise<Either<Failure, string>> {
  const supabase = await createClient()
  const { data: found, error: findError } = await supabase
    .from('expense_categories')
    .select('id,name')
    .eq('name', name)
    .maybeSingle()

  if (findError) return { ok: false, error: { code: 'DB_ERROR', message: findError.message } }
  if (found) return { ok: true, data: (found as ExpenseCategoryRow).id }

  const { data: created, error: createError } = await supabase
    .from('expense_categories')
    .insert({ name })
    .select('id')
    .single()

  if (createError) return { ok: false, error: { code: 'DB_ERROR', message: createError.message } }
  return { ok: true, data: (created as ExpenseCategoryRow).id }
}

export async function getActiveFuelTankSummaryAction(): Promise<Either<Failure, FuelTankSummaryEntity | null>> {
  const repo = new SupabaseFuelTankRepository()
  const tankResult = await repo.getActiveTank()
  if (!tankResult.ok) return tankResult
  if (!tankResult.data) return { ok: true, data: null }
  return repo.getSummary(tankResult.data.id)
}

export async function getFuelTankMovementsAction(limit: number): Promise<Either<Failure, FuelTankMovementEntity[]>> {
  const repo = new SupabaseFuelTankRepository()
  const tankResult = await repo.getActiveTank()
  if (!tankResult.ok) return tankResult
  if (!tankResult.data) return { ok: true, data: [] }
  return repo.listMovements(tankResult.data.id, limit)
}

export async function createDefaultFuelTankAction(): Promise<Either<Failure, FuelTankSummaryEntity>> {
  const repo = new SupabaseFuelTankRepository()
  const existing = await repo.getActiveTank()
  if (!existing.ok) return existing
  if (existing.data) {
    const summary = await repo.getSummary(existing.data.id)
    if (!summary.ok) return summary
    return summary
  }

  const created = await repo.createTank({
    name: 'Tanque Base',
    capacityLiters: 20000,
    location: null,
    isActive: true,
  })
  if (!created.ok) return created
  return repo.getSummary(created.data.id)
}

export interface RegisterFuelTankPurchaseInput {
  liters: number
  pricePerLiter: number
  purchasedAt: Date
  description: string | null
}

export async function registerFuelTankPurchaseAction(
  input: RegisterFuelTankPurchaseInput
): Promise<Either<Failure, { summary: FuelTankSummaryEntity; movement: FuelTankMovementEntity }>> {
  const repo = new SupabaseFuelTankRepository()
  const tankResult = await repo.getActiveTank()
  if (!tankResult.ok) return tankResult
  if (!tankResult.data) {
    return { ok: false, error: { code: 'NO_TANK', message: 'No hay un tanque activo configurado' } }
  }

  if (input.liters <= 0) {
    return { ok: false, error: { code: 'INVALID_LITERS', message: 'Los litros deben ser > 0', statusCode: 400 } }
  }
  if (input.pricePerLiter <= 0) {
    return { ok: false, error: { code: 'INVALID_PRICE', message: 'El precio por litro debe ser > 0', statusCode: 400 } }
  }

  const categoryIdResult = await ensureExpenseCategoryId('Combustible')
  if (!categoryIdResult.ok) return categoryIdResult

  const supabase = await createClient()
  const amount = input.liters * input.pricePerLiter
  const { data: expense, error: expenseError } = await supabase
    .from('expenses')
    .insert({
      trip_id: null,
      truck_id: null,
      trailer_id: null,
      category_id: categoryIdResult.data,
      amount,
      expense_date: input.purchasedAt.toISOString(),
      description: input.description ?? 'Compra diésel (tanque)',
      receipt_url: null,
      is_ai_classified: false,
      created_by: null,
    })
    .select('id')
    .single()

  if (expenseError) {
    return { ok: false, error: { code: 'DB_ERROR', message: expenseError.message } }
  }

  const movementResult = await repo.createMovement({
    tankId: tankResult.data.id,
    movementType: 'IN',
    liters: input.liters,
    unitCost: input.pricePerLiter,
    totalCost: amount,
    movementDate: input.purchasedAt,
    tripId: null,
    truckId: null,
    fuelLoadId: null,
    expenseId: (expense as ExpenseRow).id,
  })

  if (!movementResult.ok) {
    await supabase.from('expenses').delete().eq('id', (expense as ExpenseRow).id)
    return movementResult
  }

  const summary = await repo.getSummary(tankResult.data.id)
  if (!summary.ok) return summary

  revalidatePath('/fuel')
  return { ok: true, data: { summary: summary.data, movement: movementResult.data } }
}

export interface AdjustFuelTankInput {
  litersDelta: number
  unitCost: number | null
  adjustedAt: Date
  description: string | null
}

export async function adjustFuelTankAction(
  input: AdjustFuelTankInput
): Promise<Either<Failure, { summary: FuelTankSummaryEntity; movement: FuelTankMovementEntity }>> {
  const repo = new SupabaseFuelTankRepository()
  const tankResult = await repo.getActiveTank()
  if (!tankResult.ok) return tankResult
  if (!tankResult.data) {
    return { ok: false, error: { code: 'NO_TANK', message: 'No hay un tanque activo configurado' } }
  }

  if (input.litersDelta === 0) {
    return { ok: false, error: { code: 'INVALID_DELTA', message: 'El ajuste no puede ser 0', statusCode: 400 } }
  }

  const summaryBefore = await repo.getSummary(tankResult.data.id)
  if (!summaryBefore.ok) return summaryBefore

  const inferredUnitCost =
    input.unitCost != null
      ? input.unitCost
      : (summaryBefore.data.averageCostPerLiter ?? null)

  if (inferredUnitCost == null || inferredUnitCost <= 0) {
    return { ok: false, error: { code: 'MISSING_COST', message: 'Se requiere costo por litro para este ajuste', statusCode: 400 } }
  }

  const totalCost = input.litersDelta * inferredUnitCost

  const movementResult = await repo.createMovement({
    tankId: tankResult.data.id,
    movementType: 'ADJUST',
    liters: input.litersDelta,
    unitCost: inferredUnitCost,
    totalCost,
    movementDate: input.adjustedAt,
    tripId: null,
    truckId: null,
    fuelLoadId: null,
    expenseId: null,
  })

  if (!movementResult.ok) return movementResult

  const summary = await repo.getSummary(tankResult.data.id)
  if (!summary.ok) return summary

  revalidatePath('/fuel')
  return { ok: true, data: { summary: summary.data, movement: movementResult.data } }
}
