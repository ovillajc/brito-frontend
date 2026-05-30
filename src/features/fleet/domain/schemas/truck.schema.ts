import { z } from 'zod'

/**
 * @fileoverview Esquemas de validación Zod para el módulo de Fleet (Flotillas/Camiones).
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

export const vehicleStatusSchema = z.enum([
  'available',
  'maintenance',
  'assigned',
  'out_service',
  'in_trip',
])


// Zod schema for creating a truck
export const createTruckSchema = z.object({
  economicNumber: z.string().min(1, 'El número económico es requerido'),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  year: z.number().int().min(1900, 'Año inválido').max(new Date().getFullYear() + 1),
  plates: z.string().min(1, 'Las placas son requeridas'),
  serialNumber: z.string().optional().or(z.literal('')),
  insurancePolicy: z.string().optional().or(z.literal('')),
  companyProfileId: z.string().uuid('ID de compañía inválido').optional().or(z.literal('')),
  status: vehicleStatusSchema,
  engine: z.string().optional().or(z.literal('')),

  tireSize: z.string().optional().or(z.literal('')),
  tankCapacity: z.number().nonnegative().optional(),
})

export type CreateTruckInput = z.infer<typeof createTruckSchema>

// Zod schema for updating a truck
export const updateTruckSchema = createTruckSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
})

export type UpdateTruckInput = z.infer<typeof updateTruckSchema>
