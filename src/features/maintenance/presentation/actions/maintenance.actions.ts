'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import { SupabaseMaintenanceServerRepository } from '@/src/features/maintenance/infrastructure/repositories/SupabaseMaintenanceServerRepository'
import { CreateWorkshopStay } from '@/src/features/maintenance/application/CreateWorkshopStay'
import { CreateWorkOrder } from '@/src/features/maintenance/application/CreateWorkOrder'
import { CreateWorkOrderPart } from '@/src/features/maintenance/application/CreateWorkOrderPart'
import { CloseWorkshopStay } from '@/src/features/maintenance/application/CloseWorkshopStay'
import type { CreateWorkshopStayInput } from '@/src/features/maintenance/domain/schemas/create-stay.schema'
import type { CreateWorkOrderInput } from '@/src/features/maintenance/domain/schemas/create-work-order.schema'
import type { CreateWorkOrderPartInput } from '@/src/features/maintenance/domain/schemas/create-part.schema'

async function getCurrentProfileId(): Promise<string | null> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user?.id ?? null
}

export async function createWorkshopStayAction(input: CreateWorkshopStayInput): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const result = await CreateWorkshopStay(repo, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function closeWorkshopStayAction(stayId: string): Promise<Either<Failure, void>> {
  const repo = new SupabaseMaintenanceServerRepository()
  const result = await CloseWorkshopStay(repo, stayId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function createWorkOrderAction(input: CreateWorkOrderInput): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const result = await CreateWorkOrder(repo, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function createWorkOrderPartAction(input: CreateWorkOrderPartInput): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const result = await CreateWorkOrderPart(repo, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

