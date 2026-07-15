/**
 * @fileoverview Entidad de dominio para las tiendas Walmart.
 * Define la forma pura del objeto de negocio, sin dependencias externas.
 */

export interface WalmartStoreEntity {
  id: string
  name: string
  location?: string | null
  postalCode?: string | null
  storeType?: string | null
  storeCode?: string | null
  isActive: boolean
  createdAt: Date
}
