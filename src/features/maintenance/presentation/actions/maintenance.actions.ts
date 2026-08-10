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
import type { CreateWorkOrderIssueInput } from '@/src/features/maintenance/domain/schemas/create-work-order-issue.schema'
import type { CreateProviderInput } from '@/src/features/maintenance/domain/schemas/create-provider.schema'

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

export async function updateWorkshopStayAction(stayId: string, input: Partial<CreateWorkshopStayInput>): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const { UpdateWorkshopStay } = await import('@/src/features/maintenance/application/UpdateWorkshopStay')
  const result = await UpdateWorkshopStay(repo, stayId, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function updateWorkOrderAction(workOrderId: string, input: Partial<CreateWorkOrderInput>): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const { UpdateWorkOrder } = await import('@/src/features/maintenance/application/UpdateWorkOrder')
  const result = await UpdateWorkOrder(repo, workOrderId, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function updateWorkOrderPartAction(partId: string, input: Partial<CreateWorkOrderPartInput>): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const { UpdateWorkOrderPart } = await import('@/src/features/maintenance/application/UpdateWorkOrderPart')
  const result = await UpdateWorkOrderPart(repo, partId, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function deleteWorkshopStayAction(stayId: string): Promise<Either<Failure, void>> {
  const repo = new SupabaseMaintenanceServerRepository()
  const { DeleteWorkshopStay } = await import('@/src/features/maintenance/application/DeleteWorkshopStay')
  const result = await DeleteWorkshopStay(repo, stayId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function deleteWorkOrderAction(workOrderId: string): Promise<Either<Failure, void>> {
  const repo = new SupabaseMaintenanceServerRepository()
  const { DeleteWorkOrder } = await import('@/src/features/maintenance/application/DeleteWorkOrder')
  const result = await DeleteWorkOrder(repo, workOrderId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function deleteWorkOrderPartAction(partId: string): Promise<Either<Failure, void>> {
  const repo = new SupabaseMaintenanceServerRepository()
  const { DeleteWorkOrderPart } = await import('@/src/features/maintenance/application/DeleteWorkOrderPart')
  const result = await DeleteWorkOrderPart(repo, partId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function createWorkOrderIssueAction(input: CreateWorkOrderIssueInput): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const { CreateWorkOrderIssue } = await import('@/src/features/maintenance/application/CreateWorkOrderIssue')
  const result = await CreateWorkOrderIssue(repo, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function deleteWorkOrderIssueAction(issueId: string): Promise<Either<Failure, void>> {
  const repo = new SupabaseMaintenanceServerRepository()
  const { DeleteWorkOrderIssue } = await import('@/src/features/maintenance/application/DeleteWorkOrderIssue')
  const result = await DeleteWorkOrderIssue(repo, issueId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function createProviderAction(input: CreateProviderInput): Promise<Either<Failure, void>> {
  const profileId = await getCurrentProfileId()
  const repo = new SupabaseMaintenanceServerRepository()
  const { CreateProvider } = await import('@/src/features/maintenance/application/CreateProvider')
  const result = await CreateProvider(repo, input, profileId)
  if (result.ok) revalidatePath('/maintenance')
  return result
}

export async function updateProviderAction(providerId: string, input: Partial<CreateProviderInput>): Promise<Either<Failure, void>> {
  const repo = new SupabaseMaintenanceServerRepository()
  const { UpdateProvider } = await import('@/src/features/maintenance/application/UpdateProvider')
  const result = await UpdateProvider(repo, providerId, input)
  if (result.ok) revalidatePath('/maintenance')
  return result
}
