import { z } from 'zod'

export const FUEL_LOAD_SOURCE_TYPE = {
  External: 'EXTERNAL',
  InternalTank: 'INTERNAL_TANK',
} as const

export type FuelLoadSourceType = typeof FUEL_LOAD_SOURCE_TYPE[keyof typeof FUEL_LOAD_SOURCE_TYPE]

/**
 * Esquema de validación para el registro de carga de combustible.
 */
export const fuelLoadSchema = z.object({
  tripId: z.string().min(1, 'Selecciona un viaje'),
  ticketFolio: z.string().min(1, 'El folio del ticket es obligatorio'),
  loadDate: z.string().min(1, 'La fecha de carga es obligatoria'),
  litersEngine: z.number({ error: 'Ingresa los litros' }).min(0.01, 'Los litros deben ser > 0'),
  pricePerLiter: z.number({ error: 'Ingresa el precio por litro' }).min(0.01, 'El precio debe ser > 0').optional(),
  isFullTankFill: z.boolean(),
  sourceType: z.enum([FUEL_LOAD_SOURCE_TYPE.External, FUEL_LOAD_SOURCE_TYPE.InternalTank]).default(FUEL_LOAD_SOURCE_TYPE.External),
}).superRefine((value, ctx) => {
  if (value.sourceType === FUEL_LOAD_SOURCE_TYPE.External && value.pricePerLiter == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['pricePerLiter'], message: 'El precio por litro es obligatorio' })
  }
})

/**
 * Tipo derivado del esquema de carga de combustible.
 */
export type FuelLoadValues = z.infer<typeof fuelLoadSchema>

export type FuelLoadFormValues = z.input<typeof fuelLoadSchema>
