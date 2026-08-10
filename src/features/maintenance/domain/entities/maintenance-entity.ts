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

export interface MaintenanceServiceEntity {
  id: string
  name: string
  description?: string | null
  maintenanceTypeId: string
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

export interface MeasurementUnitEntity {
  id: string
  name: string
  isActive: boolean
}

export interface InventoryItemEntity {
  id: string
  name: string
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
  specialistName: string | null
  supervisorName: string | null
  supervisorEmployeeId: string | null
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
  isInternalSupply: boolean
  createdAt: Date
}

export interface WorkshopStayReplicaEntity {
  id: string
  sequentialNumber: number
  folio: string
  enteredAt: Date
  exitedAt: Date | null
  daysInShop: number | null
  reason: string
  totalCost: number
  economicNumber: string | null
  vehicleType: VehicleType
  plates: string | null
  deliveredByEmployeeName: string | null
  deliveredByEmployeeId: string | null
  receivedByProfileName: string | null
  pickedUpByEmployeeName: string | null
  pickedUpByEmployeeId: string | null
  kmAtEntry: number | null
  kmLastService: number | null
  lastClientName: string | null
  lastDestination: string | null
  lastTripStartDate: Date | null
  lastTripId: string | null
  notes: string | null
}

export interface WorkshopWorkOrderReplicaEntity {
  id: string
  stayId: string
  stayFolio: string
  workOrderFolio: string
  stayEnteredAt: Date
  startedAt: Date
  finishedAt: Date | null
  daysInWork: number | null
  status: WorkOrderStatus
  totalCost: number
  locationType: string | null
  unitEconomicNumber: string | null
  unitPlates: string | null
  stayReason: string | null
  maintenanceTypeName: string | null
  mechanicalCategoryName: string | null
  failureLocation: string | null
  vehicleActivityAtFailure: string | null
  specialistName: string | null
  specialistEmployeeId: string | null
  supervisorName: string | null
  description: string
  details: string | null
}

export interface WorkOrderPartReplicaEntity {
  id: string
  workOrderId: string
  stayFolio: string
  stayEnteredAt: Date
  workOrderFolio: string
  unitEconomicNumber: string | null
  unitPlates: string | null
  stayReason: string | null
  maintenanceTypeName: string | null
  mechanicalCategoryName: string | null
  description: string
  providerName: string | null
  brand: string | null
  unitName: string | null
  unitPrice: number
  quantity: number
  discount: number
  taxRate: number
  totalWithTax: number
  paidBy: string | null
  notes: string | null
  isInternalSupply: boolean
  inventoryItemId: string | null
}

// ─── Predictive Maintenance ─────────────────────────────────────────────────

export interface VehicleSystemEntity {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

export interface VehicleComponentEntity {
  id: string
  vehicleSystemId: string
  vehicleSystemName: string | null
  name: string
  description: string | null
  isActive: boolean
}

export interface WorkOrderIssueEntity {
  id: string
  workOrderId: string
  vehicleComponentId: string
  componentName: string | null
  vehicleSystemName: string | null
  reportedIssue: string | null
  mechanicNotes: string | null
  createdAt: Date
}

