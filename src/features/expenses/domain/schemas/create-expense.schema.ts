/**
 * @fileoverview Schema Zod para registrar un gasto operativo.
 * Reside en domain/ para que pueda ser reutilizado en Server Actions.
 */

import { z } from 'zod'
import { EXPENSE_FREQUENCY } from '../entities/expense-entity'

export const createExpenseSchema = z.object({
  /** FK trips.id — nulo si no es un gasto de viaje */
  tripId: z.string().uuid().nullable().default(null),
  truckId: z.string().uuid().nullable().default(null),
  trailerId: z.string().uuid().nullable().default(null),
  /** FK expense_categories.id */
  categoryId: z.string().uuid({ message: 'Selecciona una categoría' }),
  /** FK expense_subcategories.id */
  subcategoryId: z.string().uuid({ message: 'Selecciona un detalle' }),
  description: z.string().optional().nullable().default(null),
  unitPrice: z.coerce.number().positive('El precio unitario debe ser mayor a 0').nullable().default(null),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a 0').nullable().default(null),
  /** FK measurement_units.id */
  unitId: z.string().uuid().nullable().default(null),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  frequency: z
    .enum([EXPENSE_FREQUENCY.Recurrent, EXPENSE_FREQUENCY.Extraordinary])
    .nullable()
    .default(null),
  /** FK cargo_types.id */
  cargoTypeId: z.string().uuid().nullable().default(null),
  comments: z.string().trim().nullable().default(null),
  expenseDate: z.string().min(1, 'La fecha es requerida'),
  receiptUrl: z.string().nullable().default(null),
  /** FK operator_settlements.id (Opcional, para vincular directamente a un ajuste) */
  settlementId: z.string().uuid().nullable().optional(),
}).superRefine((val, ctx) => {
  if (val.unitPrice === null) {
    ctx.addIssue({ code: 'custom', path: ['unitPrice'], message: 'El precio unitario es requerido' })
  }
  if (val.quantity === null) {
    ctx.addIssue({ code: 'custom', path: ['quantity'], message: 'La cantidad es requerida' })
  }
  if (val.unitId === null) {
    ctx.addIssue({ code: 'custom', path: ['unitId'], message: 'Selecciona una unidad de medida' })
  }

  if (val.unitPrice !== null && val.quantity !== null) {
    const expected = Number((val.unitPrice * val.quantity).toFixed(2))
    const received = Number(val.amount.toFixed(2))
    if (expected !== received) {
      ctx.addIssue({ code: 'custom', path: ['amount'], message: 'El monto total debe ser unitario × cantidad' })
    }
  }
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
