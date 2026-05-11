import { z } from 'zod'
import { EXPENSE_CATEGORY, EXPENSE_SCOPE } from '../entities/expense-entity'

export const createExpenseSchema = z.object({
  companyId: z.string().min(1, 'La empresa es requerida'),
  scope: z.enum([EXPENSE_SCOPE.General, EXPENSE_SCOPE.Trip]),
  category: z.enum([
    EXPENSE_CATEGORY.Permits,
    EXPENSE_CATEGORY.Certifications,
    EXPENSE_CATEGORY.InventoryPurchase,
    EXPENSE_CATEGORY.SpareParts,
    EXPENSE_CATEGORY.Tools,
    EXPENSE_CATEGORY.PPE,
    EXPENSE_CATEGORY.Tolls,
    EXPENSE_CATEGORY.FuelLoad,
    EXPENSE_CATEGORY.BaseTankLoad,
    EXPENSE_CATEGORY.TripIncidents,
    EXPENSE_CATEGORY.Maintenance,
    EXPENSE_CATEGORY.Other,
  ]),
  description: z.string().min(1, 'La descripción es requerida'),
  amount: z.coerce.number().positive('El monto debe ser mayor a 0'),
  occurredAt: z.string().min(1, 'La fecha es requerida'),
  vendorName: z.string().trim().min(1).nullable(),
  reference: z.string().trim().min(1).nullable(),
  tripId: z.string().trim().min(1).nullable(),
})

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>
