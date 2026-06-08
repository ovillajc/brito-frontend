'use server'

import { SupabaseClientRepository } from '../../infrastructure/repositories/SupabaseClientRepository'
import { Either, Failure } from '@/src/core/domain/either'
import { ClientEntity } from '../../domain/entities'
import { revalidatePath } from 'next/cache'

const repo = new SupabaseClientRepository()

export async function getClientsAction(): Promise<Either<Failure, ClientEntity[]>> {
  try {
    return { ok: true, data: await repo.findAll() }
  } catch (e) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: e instanceof Error ? e.message : 'Error desconocido' } }
  }
}

export async function upsertClientAction(data: Partial<ClientEntity>): Promise<Either<Failure, string>> {
  try {
    const id = await repo.upsert(data)
    revalidatePath('/directory')
    return { ok: true, data: id }
  } catch (e) {
    return { ok: false, error: { code: 'UPSERT_ERROR', message: e instanceof Error ? e.message : 'Error desconocido' } }
  }
}

export async function deleteClientAction(id: string): Promise<Either<Failure, void>> {
  try {
    await repo.delete(id)
    revalidatePath('/directory')
    return { ok: true, data: undefined }
  } catch (e) {
    return { ok: false, error: { code: 'DELETE_ERROR', message: e instanceof Error ? e.message : 'Error desconocido' } }
  }
}
