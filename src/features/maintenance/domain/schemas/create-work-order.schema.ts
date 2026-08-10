import { z } from 'zod'
import { WORK_ORDER_STATUS } from '../entities/maintenance-entity'

export const createWorkOrderSchema = z.object({
  stayId: z.string().uuid(),
  folio: z.string().min(1, 'El folio de trabajo es requerido'),
  maintenanceTypeId: z.string().uuid().nullable().default(null),
  mechanicalCategoryId: z.string().uuid().nullable().default(null),
  startedAt: z.string().min(1, 'La fecha de inicio es requerida'),
  finishedAt: z.string().nullable().default(null),
  status: z.enum([
    WORK_ORDER_STATUS.Open,
    WORK_ORDER_STATUS.InProgress,
    WORK_ORDER_STATUS.Completed,
    WORK_ORDER_STATUS.OnHold,
  ]),
  specialistName: z.string().trim().nullable().default(null),
  specialistEmployeeId: z.string().uuid().nullable().default(null),
  supervisorName: z.string().trim().nullable().default(null),
  supervisorEmployeeId: z.string().uuid().nullable().default(null),
  description: z.string().min(1, 'La descripción es requerida'),
  details: z.string().trim().nullable().default(null),
  locationType: z.string().trim().nullable().default(null),
  failureLocation: z.string().trim().nullable().default(null),
  vehicleActivityAtFailure: z.string().trim().nullable().default(null),
})

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>

