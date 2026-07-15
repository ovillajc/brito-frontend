'use server'

import { revalidatePath } from 'next/cache'
import { SupabaseWalmartStoreRepository } from '../../infrastructure/repositories/SupabaseWalmartStoreRepository'
import { GetWalmartStoresUseCase } from '../../application/GetWalmartStoresUseCase'
import { CreateWalmartStoreUseCase } from '../../application/CreateWalmartStoreUseCase'
import { UpdateWalmartStoreUseCase } from '../../application/UpdateWalmartStoreUseCase'
import { DeleteWalmartStoreUseCase } from '../../application/DeleteWalmartStoreUseCase'
import { CreateWalmartStoreInput, UpdateWalmartStoreInput } from '../../domain/schemas/walmart-store.schema'

const repository = new SupabaseWalmartStoreRepository()

const REVALIDATE_PATH = '/operations/clients/walmart/dettes'

/**
 * Action para obtener la lista de tiendas Walmart.
 */
export async function getWalmartStoresAction() {
  return GetWalmartStoresUseCase(repository)
}

/**
 * Action para crear una nueva tienda Walmart.
 * @param input - Datos validados de la tienda a crear.
 */
export async function createWalmartStoreAction(input: CreateWalmartStoreInput) {
  const result = await CreateWalmartStoreUseCase(repository, input)
  if (result.ok) {
    revalidatePath(REVALIDATE_PATH)
  }
  return result
}

/**
 * Action para actualizar una tienda Walmart existente.
 * @param input - Datos validados con id y campos a actualizar.
 */
export async function updateWalmartStoreAction(input: UpdateWalmartStoreInput) {
  const result = await UpdateWalmartStoreUseCase(repository, input)
  if (result.ok) {
    revalidatePath(REVALIDATE_PATH)
  }
  return result
}

/**
 * Action para eliminar una tienda Walmart por ID.
 * @param id - UUID de la tienda.
 */
export async function deleteWalmartStoreAction(id: string) {
  const result = await DeleteWalmartStoreUseCase(repository, id)
  if (result.ok) {
    revalidatePath(REVALIDATE_PATH)
  }
  return result
}
