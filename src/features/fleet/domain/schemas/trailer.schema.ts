import { z } from 'zod'
import { vehicleStatusSchema } from './truck.schema'

/**
 * @fileoverview Esquemas de validación Zod para Remolques (Trailers).
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

// Zod schema for creating a trailer
export const createTrailerSchema = z.object({
  economicNumber: z.string().min(1, 'El número económico es requerido'),
  plates: z.string().optional().or(z.literal('')),
  serialNumber: z.string().optional().or(z.literal('')),
  insurancePolicy: z.string().optional().or(z.literal('')),
  companyProfileId: z.string().uuid('ID de compañía inválido').optional().or(z.literal('')),
  trailerModelId: z.string().uuid('Modelo de remolque requerido').min(1, 'Seleccione un modelo'),
  status: vehicleStatusSchema,
  sizeFt: z.number().nonnegative().optional(),
  continuousRefrigeratedYield: z.number().nonnegative().optional(),
  continuousFrozenYield: z.number().nonnegative().optional(),
  ssRefrigeratedYield: z.number().nonnegative().optional(),
  ssFrozenYield: z.number().nonnegative().optional(),
})

export type CreateTrailerInput = z.infer<typeof createTrailerSchema>

// Zod schema for updating a trailer
export const updateTrailerSchema = createTrailerSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
})

export type UpdateTrailerInput = z.infer<typeof updateTrailerSchema>
