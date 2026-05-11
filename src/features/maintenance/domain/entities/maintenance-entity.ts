export const VEHICLE_TYPE = {
  Truck: 'TRUCK',
  Trailer: 'TRAILER',
} as const

export type VehicleType = typeof VEHICLE_TYPE[keyof typeof VEHICLE_TYPE]

export const WORK_ORDER_STATUS = {
  Open: 'open',
  InProgress: 'in_progress',
  Completed: 'completed',
  OnHold: 'on_hold',
} as const

export type WorkOrderStatus = typeof WORK_ORDER_STATUS[keyof typeof WORK_ORDER_STATUS]

export const PROVIDER_TYPE = {
  Internal: 'INTERNAL',
  External: 'EXTERNAL',
} as const

export type ProviderType = typeof PROVIDER_TYPE[keyof typeof PROVIDER_TYPE]

export interface MaintenanceTypeEntity {
  id: string
  name: string
  isActive: boolean
}

export interface MechanicalCategoryEntity {
  id: string
  name: string
  isActive: boolean
}

export interface MaintenanceProviderEntity {
  id: string
  name: string
  providerType: ProviderType
  isActive: boolean
}

export interface WorkshopStayEntity {
  id: string
  folio: string
  vehicleType: VehicleType
  truckId: string | null
  trailerId: string | null
  enteredAt: Date
  exitedAt: Date | null
  reason: string
  kmAtEntry: number | null
  deliveredByEmployeeId: string | null
  pickedUpByEmployeeId: string | null
  lastTripId: string | null
  createdBy: string | null
  createdAt: Date
  updatedAt: Date
}

export interface WorkshopStayKpiEntity {
  id: string
  folio: string
  vehicleType: VehicleType
  unitLabel: string
  enteredAt: Date
  exitedAt: Date | null
  reason: string
  daysInShop: number | null
  totalCost: number
  status: 'open' | 'closed'
}

export interface WorkshopWorkOrderEntity {
  id: string
  stayId: string
  folio: string
  maintenanceTypeId: string | null
  maintenanceTypeName: string | null
  mechanicalCategoryId: string | null
  mechanicalCategoryName: string | null
  startedAt: Date
  finishedAt: Date | null
  status: WorkOrderStatus
  specialistEmployeeId: string | null
  supervisorProfileId: string | null
  description: string
  details: string | null
  totalCost: number
}

export interface WorkOrderPartEntity {
  id: string
  workOrderId: string
  providerId: string | null
  providerName: string | null
  providerType: ProviderType | null
  inventoryItemId: string | null
  inventoryItemName: string | null
  description: string
  brand: string | null
  unitId: string | null
  unitName: string | null
  quantity: number
  unitPrice: number
  discount: number
  taxRate: number
  total: number
  createdAt: Date
}

