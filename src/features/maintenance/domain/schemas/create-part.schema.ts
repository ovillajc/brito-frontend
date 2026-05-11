import { z } from 'zod'

export const createWorkOrderPartSchema = z.object({
  workOrderId: z.string().uuid(),
  providerId: z.string().uuid().nullable().default(null),
  inventoryItemId: z.string().uuid().nullable().default(null),
  description: z.string().min(1, 'La descripción de la pieza es requerida'),
  brand: z.string().trim().nullable().default(null),
  unitId: z.string().uuid().nullable().default(null),
  quantity: z.coerce.number().positive('La cantidad debe ser mayor a 0'),
  unitPrice: z.coerce.number().nonnegative('El precio unitario debe ser >= 0'),
  discount: z.coerce.number().nonnegative().default(0),
  taxRate: z.coerce.number().min(0).max(1).default(0.16),
})

export type CreateWorkOrderPartInput = z.infer<typeof createWorkOrderPartSchema>

