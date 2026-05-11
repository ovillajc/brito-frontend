import { createClient } from '@/src/core/lib/supabase/server'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceCatalogsEntity, MaintenanceListFilters } from '../../domain/repositories/i-maintenance-repository'
import type { WorkOrderPartEntity, WorkshopStayKpiEntity, WorkshopWorkOrderEntity } from '../../domain/entities/maintenance-entity'
import type { CreateWorkshopStayInput } from '../../domain/schemas/create-stay.schema'
import type { CreateWorkOrderInput } from '../../domain/schemas/create-work-order.schema'
import type { CreateWorkOrderPartInput } from '../../domain/schemas/create-part.schema'

export class SupabaseMaintenanceServerRepository implements IMaintenanceRepository {
  async listStays(_filters?: MaintenanceListFilters): Promise<Either<Failure, WorkshopStayKpiEntity[]>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en servidor' } }
  }

  async listWorkOrders(_stayId: string): Promise<Either<Failure, WorkshopWorkOrderEntity[]>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en servidor' } }
  }

  async listWorkOrderParts(_workOrderId: string): Promise<Either<Failure, WorkOrderPartEntity[]>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en servidor' } }
  }

  async getCatalogs(): Promise<Either<Failure, MaintenanceCatalogsEntity>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en servidor' } }
  }

  async createStay(input: CreateWorkshopStayInput, createdBy: string | null): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('workshop_stays').insert({
        folio: input.folio,
        vehicle_type: input.vehicleType,
        truck_id: input.truckId,
        trailer_id: input.trailerId,
        entered_at: new Date(input.enteredAt).toISOString(),
        reason: input.reason,
        km_at_entry: input.kmAtEntry,
        delivered_by_employee_id: input.deliveredByEmployeeId,
        picked_up_by_employee_id: input.pickedUpByEmployeeId,
        last_trip_id: input.lastTripId,
        created_by: createdBy,
      })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear la estancia' } }
    }
  }

  async closeStay(stayId: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase
        .from('workshop_stays')
        .update({ exited_at: new Date().toISOString() })
        .eq('id', stayId)

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cerrar la estancia' } }
    }
  }

  async createWorkOrder(input: CreateWorkOrderInput, createdBy: string | null): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('workshop_work_orders').insert({
        stay_id: input.stayId,
        folio: input.folio,
        maintenance_type_id: input.maintenanceTypeId,
        mechanical_category_id: input.mechanicalCategoryId,
        started_at: new Date(input.startedAt).toISOString(),
        finished_at: input.finishedAt ? new Date(input.finishedAt).toISOString() : null,
        status: input.status,
        specialist_employee_id: input.specialistEmployeeId,
        supervisor_profile_id: createdBy,
        description: input.description,
        details: input.details,
        created_by: createdBy,
      })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear la orden de trabajo' } }
    }
  }

  async createWorkOrderPart(input: CreateWorkOrderPartInput, createdBy: string | null): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { error } = await supabase.from('work_order_parts').insert({
        work_order_id: input.workOrderId,
        provider_id: input.providerId,
        inventory_item_id: input.inventoryItemId,
        description: input.description,
        brand: input.brand,
        unit_id: input.unitId,
        quantity: input.quantity,
        unit_price: input.unitPrice,
        discount: input.discount,
        tax_rate: input.taxRate,
        created_by: createdBy,
      })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: undefined }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear la refacción' } }
    }
  }
}
