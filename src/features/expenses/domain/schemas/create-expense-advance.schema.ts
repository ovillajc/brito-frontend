import { z } from 'zod'
import { ADVANCE_METHOD } from '../entities/expense-assignment-entity'

export const createExpenseAdvanceSchema = z.object({
  tripId: z.string().uuid().nullable().default(null),
  unitAssemblyId: z.string().uuid().nullable().default(null),
  operatorId: z.string().uuid('Debe seleccionar un operador válido'),
  truckId: z.string().uuid().nullable().default(null),
  trailerId: z.string().uuid().nullable().default(null),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  method: z.enum([ADVANCE_METHOD.Cash, ADVANCE_METHOD.Transfer]),
  assignedAt: z.string().min(1, 'La fecha es requerida'),
  notes: z.string().trim().nullable().default(null),
})

export type CreateExpenseAdvanceInput = z.infer<typeof createExpenseAdvanceSchema>

