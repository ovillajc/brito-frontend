import { z } from 'zod'
import { VEHICLE_TYPE } from '../entities/maintenance-entity'

export const createWorkshopStaySchema = z.object({
  folio: z.string().min(1, 'El folio es requerido'),
  vehicleType: z.enum([VEHICLE_TYPE.Truck, VEHICLE_TYPE.Trailer]),
  truckId: z.string().uuid().nullable().default(null),
  trailerId: z.string().uuid().nullable().default(null),
  enteredAt: z.string().min(1, 'La fecha de ingreso es requerida'),
  reason: z.string().min(1, 'El motivo es requerido'),
  kmAtEntry: z.coerce.number().nonnegative().nullable().default(null),
  kmLastService: z.coerce.number().nonnegative().nullable().default(null),
  lastTripStartDate: z.string().nullable().default(null),
  deliveredByEmployeeId: z.string().uuid().nullable().default(null),
  pickedUpByEmployeeId: z.string().uuid().nullable().default(null),
  lastTripId: z.string().uuid().nullable().default(null),
}).superRefine((val, ctx) => {
  if (val.vehicleType === VEHICLE_TYPE.Truck && !val.truckId) {
    ctx.addIssue({ code: 'custom', path: ['truckId'], message: 'Selecciona un tracto' })
  }
  if (val.vehicleType === VEHICLE_TYPE.Trailer && !val.trailerId) {
    ctx.addIssue({ code: 'custom', path: ['trailerId'], message: 'Selecciona un remolque' })
  }
})

export type CreateWorkshopStayInput = z.infer<typeof createWorkshopStaySchema>

