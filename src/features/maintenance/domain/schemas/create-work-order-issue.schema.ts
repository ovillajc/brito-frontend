import { z } from 'zod'

export const createWorkOrderIssueSchema = z.object({
  workOrderId: z.string().uuid('ID de orden de trabajo inválido'),
  vehicleComponentId: z.string().uuid('ID de componente inválido'),
  reportedIssue: z.string().min(1, 'La falla reportada es requerida').nullable(),
  mechanicNotes: z.string().trim().nullable(),
})

export type CreateWorkOrderIssueInput = z.infer<typeof createWorkOrderIssueSchema>
