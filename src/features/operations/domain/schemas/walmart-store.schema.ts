import { z } from 'zod'

/**
 * @fileoverview Esquemas de validación Zod para el módulo de Operaciones — Tiendas Walmart.
 * Sigue las reglas de Clean Architecture definidas en AGENTS.md.
 */

export const createWalmartStoreSchema = z.object({
  name: z.string().min(1, 'El nombre de la tienda es requerido'),
  location: z.string().optional().or(z.literal('')),
  postalCode: z.string().optional().or(z.literal('')),
  storeType: z.string().optional().or(z.literal('')),
  storeCode: z.string().optional().or(z.literal('')),
  isActive: z.boolean().default(true),
})

export type CreateWalmartStoreInput = z.infer<typeof createWalmartStoreSchema>

export const updateWalmartStoreSchema = createWalmartStoreSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
})

export type UpdateWalmartStoreInput = z.infer<typeof updateWalmartStoreSchema>
