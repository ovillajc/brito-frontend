'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/src/core/lib/supabase/server'
import { SupabaseUnitAssemblyRepository } from '../../infrastructure/repositories/SupabaseUnitAssemblyRepository'
import {
  GetUnitAssembliesUseCase,
  CreateUnitAssemblyUseCase,
  UpdateUnitAssemblyUseCase,
  DeleteUnitAssemblyUseCase,
  GetUnitAssemblyLogsUseCase,
} from '../../application/use-cases/UnitAssemblyUseCases'
import { CreateUnitAssemblyInput, UpdateUnitAssemblyInput } from '../../domain/schemas/unit-assembly.schema'

const repo = new SupabaseUnitAssemblyRepository()

export async function getUnitAssembliesAction() {
  return GetUnitAssembliesUseCase(repo)
}

export async function createUnitAssemblyAction(input: CreateUnitAssemblyInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const result = await CreateUnitAssemblyUseCase(repo, input, user?.id)
  if (result.ok) revalidatePath('/fleet/units')
  return result
}

export async function updateUnitAssemblyAction(input: UpdateUnitAssemblyInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const result = await UpdateUnitAssemblyUseCase(repo, input, user?.id)
  if (result.ok) revalidatePath('/fleet/units')
  return result
}

export async function deleteUnitAssemblyAction(id: string) {
  const result = await DeleteUnitAssemblyUseCase(repo, id)
  if (result.ok) revalidatePath('/fleet/units')
  return result
}

export async function getUnitAssemblyLogsAction(unitId: string) {
  return GetUnitAssemblyLogsUseCase(repo, unitId)
}
