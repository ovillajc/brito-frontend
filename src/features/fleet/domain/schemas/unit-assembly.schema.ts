import { z } from 'zod'

/**
 * @fileoverview Esquemas Zod para validar mutaciones de Unidades Armadas.
 */

export const createUnitAssemblySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  economicNumber: z.string().min(1, 'El número económico es requerido'),
  description: z.string().optional().or(z.literal('')),
  employeeId: z.string().uuid('Selecciona un operador válido').min(1, 'El operador es requerido'),
  truckId: z.string().uuid('Selecciona un tracto válido').min(1, 'El tracto es requerido'),
  trailerId: z.union([z.string().uuid('ID de remolque inválido'), z.literal('')]).optional(),
  trailer2Id: z.union([z.string().uuid('ID del segundo remolque inválido'), z.literal('')]).optional(),
  clientId: z.union([z.string().uuid('ID de cliente inválido'), z.literal('')]).optional(),
  companyProfileId: z.union([z.string().uuid('ID de compañía inválido'), z.literal('')]).optional(),
  status: z.enum(['returning', 'at_base', 'at_client', 'in_trip', 'in_workshop']).optional(),
  isActive: z.boolean().optional(),
  theoreticalYield: z.number().nonnegative('El rendimiento no puede ser negativo').optional(),

})

export type CreateUnitAssemblyInput = z.infer<typeof createUnitAssemblySchema>

export const updateUnitAssemblySchema = createUnitAssemblySchema.partial().extend({
  id: z.string().uuid('ID inválido'),
})

export type UpdateUnitAssemblyInput = z.infer<typeof updateUnitAssemblySchema>
