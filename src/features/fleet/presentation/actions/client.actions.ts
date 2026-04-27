'use server'

import { SupabaseClientRepository } from '../../infrastructure/repositories/SupabaseClientRepository'
import { Either, Failure } from '@/src/core/domain/either'
import { ClientEntity } from '../../domain/entities'

const repo = new SupabaseClientRepository()

export async function getClientsAction(): Promise<Either<Failure, ClientEntity[]>> {
  try {
    return { ok: true, data: await repo.findAll() }
  } catch (e) {
    return { ok: false, error: { code: 'FETCH_ERROR', message: e instanceof Error ? e.message : 'Error desconocido' } }
  }
}
