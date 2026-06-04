'use server'

import { SupabaseClientPoolRepository } from '../../infrastructure/repositories/SupabaseClientPoolRepository'
import { 
  GetClientPoolsUseCase, 
  CreateClientPoolUseCase, 
  UpdateClientPoolUseCase, 
  AssignUnitsToPoolUseCase 
} from '../../application/use-cases/ClientPoolUseCases'
import { ClientPoolEntity } from '../../domain/entities'
import type { AvailableUnitForClientEntity } from '../../domain/repositories/IClientPoolRepository'

import { Either, Failure } from '@/src/core/domain/either'

const repository = new SupabaseClientPoolRepository()

export async function getClientPoolsAction(clientId?: string): Promise<Either<Failure, ClientPoolEntity[]>> {
  return await GetClientPoolsUseCase(repository, clientId)
}

export async function createClientPoolAction(pool: Partial<ClientPoolEntity>): Promise<Either<Failure, ClientPoolEntity>> {
  return await CreateClientPoolUseCase(repository, pool)
}

export async function updateClientPoolAction(id: string, pool: Partial<ClientPoolEntity>): Promise<Either<Failure, ClientPoolEntity>> {
  return await UpdateClientPoolUseCase(repository, id, pool)
}

import { revalidatePath } from 'next/cache'

export async function assignUnitsToPoolAction(poolId: string, unitIds: string[]): Promise<Either<Failure, void>> {
  const result = await AssignUnitsToPoolUseCase(repository, poolId, unitIds)
  if (result.ok) {
    revalidatePath('/fleet/pools')
    revalidatePath('/fleet/units')
  }
  return result
}

export async function getAvailableUnitsForClientAction(clientId: string): Promise<Either<Failure, AvailableUnitForClientEntity[]>> {
  try {
    const data = await repository.getAvailableUnitsForClient(clientId)
    return { ok: true, data }
  } catch (e) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: e instanceof Error ? e.message : 'Error' } }
  }
}
