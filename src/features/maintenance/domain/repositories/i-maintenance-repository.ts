import type { Either, Failure } from '@/src/core/domain/either'
import type {
  MaintenanceProviderEntity,
  MaintenanceTypeEntity,
  MechanicalCategoryEntity,
  WorkOrderPartEntity,
  WorkshopStayKpiEntity,
  WorkshopWorkOrderEntity,
  WorkshopStayReplicaEntity,
  WorkshopWorkOrderReplicaEntity,
  WorkOrderPartReplicaEntity,
  MeasurementUnitEntity,
  InventoryItemEntity
} from '../entities/maintenance-entity'
import type { CreateWorkshopStayInput } from '../schemas/create-stay.schema'
import type { CreateWorkOrderInput } from '../schemas/create-work-order.schema'
import type { CreateWorkOrderPartInput } from '../schemas/create-part.schema'

export interface MaintenanceListFilters {
  status?: 'open' | 'closed'
  vehicleType?: 'TRUCK' | 'TRAILER'
  limit?: number
  page?: number
  pageSize?: number
  startDate?: string
  endDate?: string
}

export interface MaintenanceCatalogsEntity {
  maintenanceTypes: MaintenanceTypeEntity[]
  mechanicalCategories: MechanicalCategoryEntity[]
  providers: MaintenanceProviderEntity[]
}

export interface PaginatedResult<T> {
  data: T[]
  totalCount: number
  page: number
  pageSize: number
}

export interface IMaintenanceRepository {
  listStays(filters?: MaintenanceListFilters): Promise<Either<Failure, PaginatedResult<WorkshopStayReplicaEntity>>>
  listWorkOrders(stayId: string): Promise<Either<Failure, WorkshopWorkOrderEntity[]>>
  listWorkOrderParts(workOrderId: string): Promise<Either<Failure, WorkOrderPartEntity[]>>
  
  listAllWorkOrders(filters?: MaintenanceListFilters): Promise<Either<Failure, PaginatedResult<WorkshopWorkOrderReplicaEntity>>>
  listAllWorkOrderParts(filters?: MaintenanceListFilters): Promise<Either<Failure, PaginatedResult<WorkOrderPartReplicaEntity>>>
  
  getCatalogs(): Promise<Either<Failure, MaintenanceCatalogsEntity>>
  getMeasurementUnits(): Promise<Either<Failure, MeasurementUnitEntity[]>>
  getInventoryItems(): Promise<Either<Failure, InventoryItemEntity[]>>

  createStay(input: CreateWorkshopStayInput, createdBy: string | null): Promise<Either<Failure, void>>
  updateStay(stayId: string, input: Partial<CreateWorkshopStayInput>, updatedBy: string | null): Promise<Either<Failure, void>>
  closeStay(stayId: string): Promise<Either<Failure, void>>
  createWorkOrder(input: CreateWorkOrderInput, createdBy: string | null): Promise<Either<Failure, void>>
  updateWorkOrder(workOrderId: string, input: Partial<CreateWorkOrderInput>, updatedBy: string | null): Promise<Either<Failure, void>>
  createWorkOrderPart(input: CreateWorkOrderPartInput, createdBy: string | null): Promise<Either<Failure, void>>
  updateWorkOrderPart(partId: string, input: Partial<CreateWorkOrderPartInput>, updatedBy: string | null): Promise<Either<Failure, void>>
  deleteStay(stayId: string): Promise<Either<Failure, void>>
  deleteWorkOrder(workOrderId: string): Promise<Either<Failure, void>>
  deleteWorkOrderPart(partId: string): Promise<Either<Failure, void>>
}

