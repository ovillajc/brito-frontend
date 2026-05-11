import type { Either, Failure } from '@/src/core/domain/either'
import type {
  MaintenanceProviderEntity,
  MaintenanceTypeEntity,
  MechanicalCategoryEntity,
  WorkOrderPartEntity,
  WorkshopStayKpiEntity,
  WorkshopWorkOrderEntity,
} from '../entities/maintenance-entity'
import type { CreateWorkshopStayInput } from '../schemas/create-stay.schema'
import type { CreateWorkOrderInput } from '../schemas/create-work-order.schema'
import type { CreateWorkOrderPartInput } from '../schemas/create-part.schema'

export interface MaintenanceListFilters {
  status?: 'open' | 'closed'
  vehicleType?: 'TRUCK' | 'TRAILER'
  limit?: number
}

export interface MaintenanceCatalogsEntity {
  maintenanceTypes: MaintenanceTypeEntity[]
  mechanicalCategories: MechanicalCategoryEntity[]
  providers: MaintenanceProviderEntity[]
}

export interface IMaintenanceRepository {
  listStays(filters?: MaintenanceListFilters): Promise<Either<Failure, WorkshopStayKpiEntity[]>>
  listWorkOrders(stayId: string): Promise<Either<Failure, WorkshopWorkOrderEntity[]>>
  listWorkOrderParts(workOrderId: string): Promise<Either<Failure, WorkOrderPartEntity[]>>
  getCatalogs(): Promise<Either<Failure, MaintenanceCatalogsEntity>>

  createStay(input: CreateWorkshopStayInput, createdBy: string | null): Promise<Either<Failure, void>>
  closeStay(stayId: string): Promise<Either<Failure, void>>
  createWorkOrder(input: CreateWorkOrderInput, createdBy: string | null): Promise<Either<Failure, void>>
  createWorkOrderPart(input: CreateWorkOrderPartInput, createdBy: string | null): Promise<Either<Failure, void>>
}

