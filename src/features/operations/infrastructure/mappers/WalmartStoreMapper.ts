import { WalmartStoreEntity } from '../../domain/entities/walmart-store.entity'
import { CreateWalmartStoreInput, UpdateWalmartStoreInput } from '../../domain/schemas/walmart-store.schema'

/** Forma cruda que devuelve Supabase para la tabla walmart_stores */
interface RawWalmartStore {
  id: string
  name: string
  location: string | null
  postal_code: string | null
  store_type: string | null
  store_code: string | null
  is_active: boolean
  created_at: string
}

/**
 * Mapper encargado de transformar datos entre la capa de infraestructura (Supabase)
 * y la capa de dominio (WalmartStoreEntity).
 */
export class WalmartStoreMapper {
  /**
   * Transforma una fila cruda de Supabase en una entidad de dominio.
   * @param raw - Objeto crudo devuelto por Supabase.
   */
  static toDomain(raw: RawWalmartStore): WalmartStoreEntity {
    return {
      id: raw.id,
      name: raw.name,
      location: raw.location,
      postalCode: raw.postal_code,
      storeType: raw.store_type,
      storeCode: raw.store_code,
      isActive: raw.is_active,
      createdAt: new Date(raw.created_at),
    }
  }

  /**
   * Transforma un input de creación al formato de persistencia de Supabase.
   * @param data - Input validado por Zod.
   */
  static toPersistCreate(data: CreateWalmartStoreInput): Omit<RawWalmartStore, 'id' | 'created_at'> {
    return {
      name: data.name,
      location: data.location || null,
      postal_code: data.postalCode || null,
      store_type: data.storeType || null,
      store_code: data.storeCode || null,
      is_active: data.isActive ?? true,
    }
  }

  /**
   * Transforma un input de actualización al formato de persistencia de Supabase.
   * @param data - Input validado por Zod (sin el id).
   */
  static toPersistUpdate(data: Omit<UpdateWalmartStoreInput, 'id'>): Partial<Omit<RawWalmartStore, 'id' | 'created_at'>> {
    return {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.location !== undefined && { location: data.location || null }),
      ...(data.postalCode !== undefined && { postal_code: data.postalCode || null }),
      ...(data.storeType !== undefined && { store_type: data.storeType || null }),
      ...(data.storeCode !== undefined && { store_code: data.storeCode || null }),
      ...(data.isActive !== undefined && { is_active: data.isActive }),
    }
  }
}
