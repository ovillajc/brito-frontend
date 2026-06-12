'use server'

import { Either, Failure } from '@/src/core/domain/either'
import { ClientEntity } from '../../domain/entities'
import { SupabaseClientRepository } from '../../infrastructure/repositories/SupabaseClientRepository'
import { GetClientsUseCase } from '../../application/GetClients'
import { UpsertClientUseCase } from '../../application/UpsertClient'
import { DeleteClientUseCase } from '../../application/DeleteClient'
import { revalidatePath } from 'next/cache'

const repo = new SupabaseClientRepository()

export async function getClientsAction(): Promise<Either<Failure, ClientEntity[]>> {
  return await GetClientsUseCase(repo)
}

export async function upsertClientAction(data: Partial<ClientEntity>): Promise<Either<Failure, string>> {
  const result = await UpsertClientUseCase(repo, data)
  if (result.ok) {
    revalidatePath('/directory')
  }
  return result
}

export async function deleteClientAction(id: string): Promise<Either<Failure, void>> {
  const result = await DeleteClientUseCase(repo, id)
  if (result.ok) {
    revalidatePath('/directory')
  }
  return result
}
