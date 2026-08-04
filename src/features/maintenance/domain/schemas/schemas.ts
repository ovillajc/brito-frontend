import { z } from 'zod'

/**
 * Esquemas Zod para la creación y actualización de Estancias (Workshop Stays)
 */
export const createWorkshopStaySchema = z.object({
  vehicleType: z.enum(['TRUCK', 'TRAILER']),
  truckId: z.string().uuid().nullable().optional(),
  trailerId: z.string().uuid().nullable().optional(),
  enteredAt: z.date({ message: 'La fecha de ingreso es requerida' }),
  reason: z.string().min(1, 'El motivo es requerido'),
  kmAtEntry: z.coerce.number().nullable().optional(),
  kmLastService: z.coerce.number().nullable().optional(),
  lastTripStartDate: z.coerce.date().nullable().optional(),
  deliveredByEmployeeId: z.string().uuid().nullable().optional(),
  pickedUpByEmployeeId: z.string().uuid().nullable().optional(),
  lastTripId: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
}).refine(data => data.truckId || data.trailerId, {
  message: 'Debe seleccionar un camión o un remolque',
  path: ['truckId']
})

export type CreateWorkshopStayInput = z.infer<typeof createWorkshopStaySchema>

/**
 * Esquemas Zod para la creación y actualización de Órdenes de Trabajo (Work Orders)
 */
export const createWorkOrderSchema = z.object({
  stayId: z.string().uuid('ID de estancia inválido'),
  maintenanceTypeId: z.string().uuid().nullable().optional(),
  maintenanceServiceId: z.string().uuid().nullable().optional(),
  startedAt: z.date({ message: 'La fecha de inicio es requerida' }),
  specialistEmployeeId: z.string().uuid().nullable().optional(),
  supervisorProfileId: z.string().uuid().nullable().optional(),
  description: z.string().min(1, 'La descripción es requerida'),
  details: z.string().nullable().optional(),
  failureLocation: z.string().nullable().optional(),
  vehicleActivityAtFailure: z.string().nullable().optional(),
  locationType: z.enum(['BASE', 'EXTERNAL']).default('BASE'),
})

export type CreateWorkOrderInput = z.infer<typeof createWorkOrderSchema>

/**
 * Esquemas Zod para la creación y actualización de Piezas (Work Order Parts)
 */
export const createWorkOrderPartSchema = z.object({
  workOrderId: z.string().uuid('ID de orden inválido'),
  providerId: z.string().uuid().nullable().optional(),
  description: z.string().min(1, 'La descripción de la pieza es requerida'),
  brand: z.string().nullable().optional(),
  unitId: z.string().uuid().nullable().optional(),
  quantity: z.number().min(0.01, 'La cantidad debe ser mayor a 0'),
  unitPrice: z.number().min(0, 'El precio no puede ser negativo'),
  discount: z.number().min(0).default(0),
  taxRate: z.number().min(0).max(1).default(0.16),
  isInternalSupply: z.boolean().default(false),
  paidBy: z.string().uuid().nullable().optional(),
  notes: z.string().nullable().optional(),
})

export type CreateWorkOrderPartInput = z.infer<typeof createWorkOrderPartSchema>
