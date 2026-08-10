/**
 * @fileoverview Entidades de Dominio para el módulo de Mantenimiento.
 * Reflejan la estructura lógica de los datos sin detalles de base de datos.
 */

export type VehicleType = 'TRUCK' | 'TRAILER'
export type WorkOrderStatus = 'open' | 'in_progress' | 'completed' | 'on_hold'
export type LocationType = 'BASE' | 'EXTERNAL'

/**
 * Entidad que representa la estancia (ingreso) de un vehículo al taller.
 */
export interface WorkshopStayEntity {
  id: string
  folio: string
  sequentialNumber: number
  vehicleType: VehicleType
  truckId: string | null
  trailerId: string | null
  enteredAt: Date
  exitedAt: Date | null
  reason: string
  kmAtEntry: number | null
  kmLastService: number | null
  lastTripStartDate: Date | null
  deliveredByEmployeeId: string | null
  receivedByProfileId: string | null
  pickedUpByEmployeeId: string | null
  lastTripId: string | null
  notes: string | null
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Entidad que representa una Orden de Trabajo vinculada a una estancia.
 */
export interface WorkshopWorkOrderEntity {
  id: string
  stayId: string
  folio: string
  maintenanceTypeId: string | null
  maintenanceServiceId: string | null
  startedAt: Date
  finishedAt: Date | null
  status: WorkOrderStatus
  specialistName: string | null
  supervisorName: string | null
  supervisorEmployeeId: string | null
  description: string
  details: string | null
  failureLocation: string | null
  vehicleActivityAtFailure: string | null
  locationType: LocationType
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

/**
 * Entidad que representa una pieza o gasto en una orden de trabajo.
 */
export interface WorkOrderPartEntity {
  id: string
  workOrderId: string
  providerId: string | null
  description: string
  brand: string | null
  unitId: string | null
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
  createdBy: string | null
  createdAt: Date
  paidBy: string | null
  isInternalSupply: boolean
  notes: string | null
}
