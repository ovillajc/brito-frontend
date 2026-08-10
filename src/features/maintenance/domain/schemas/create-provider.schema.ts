import { z } from 'zod'

/**
 * Schema Zod para crear o actualizar un proveedor de mantenimiento.
 * Corresponde a la tabla `maintenance_providers` en la base de datos.
 */
export const createProviderSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres.').max(100),
  providerType: z.enum(['INTERNAL', 'EXTERNAL'] as const),
  isActive: z.boolean(),
})

export type CreateProviderInput = z.infer<typeof createProviderSchema>
