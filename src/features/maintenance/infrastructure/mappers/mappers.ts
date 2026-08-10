import type {
  WorkshopStayEntity,
  WorkshopWorkOrderEntity,
  WorkOrderPartEntity,
  VehicleType,
  WorkOrderStatus,
  LocationType
} from '../../domain/entities/entities'

import type {
  CreateWorkshopStayInput,
  CreateWorkOrderInput,
  CreateWorkOrderPartInput
} from '../../domain/schemas/schemas'

/**
 * @fileoverview Mappers para convertir datos crudos de Supabase (snake_case)
 * a entidades de dominio (camelCase) y viceversa.
 */

export class WorkshopStayMapper {
  static toDomain(raw: Record<string, unknown>): WorkshopStayEntity {
    return {
      id: String(raw.id),
      folio: String(raw.folio),
      sequentialNumber: Number(raw.sequential_number),
      vehicleType: raw.vehicle_type as VehicleType,
      truckId: raw.truck_id ? String(raw.truck_id) : null,
      trailerId: raw.trailer_id ? String(raw.trailer_id) : null,
      enteredAt: new Date(String(raw.entered_at)),
      exitedAt: raw.exited_at ? new Date(String(raw.exited_at)) : null,
      reason: String(raw.reason),
      kmAtEntry: raw.km_at_entry ? Number(raw.km_at_entry) : null,
      kmLastService: raw.km_last_service ? Number(raw.km_last_service) : null,
      lastTripStartDate: raw.last_trip_start_date ? new Date(String(raw.last_trip_start_date)) : null,
      deliveredByEmployeeId: raw.delivered_by_employee_id ? String(raw.delivered_by_employee_id) : null,
      receivedByProfileId: raw.received_by_profile_id ? String(raw.received_by_profile_id) : null,
      pickedUpByEmployeeId: raw.picked_up_by_employee_id ? String(raw.picked_up_by_employee_id) : null,
      lastTripId: raw.last_trip_id ? String(raw.last_trip_id) : null,
      notes: raw.notes ? String(raw.notes) : null,
      createdBy: raw.created_by ? String(raw.created_by) : null,
      createdAt: new Date(String(raw.created_at)),
      updatedAt: new Date(String(raw.updated_at))
    }
  }

  static toApi(input: CreateWorkshopStayInput): Record<string, unknown> {
    return {
      vehicle_type: input.vehicleType,
      truck_id: input.truckId || null,
      trailer_id: input.trailerId || null,
      entered_at: input.enteredAt.toISOString(),
      reason: input.reason,
      km_at_entry: input.kmAtEntry || null,
      km_last_service: input.kmLastService || null,
      last_trip_start_date: input.lastTripStartDate ? input.lastTripStartDate.toISOString() : null,
      delivered_by_employee_id: input.deliveredByEmployeeId || null,
      received_by_profile_id: input.receivedByProfileId || null,
      notes: input.notes || null,
    }
  }
}

export class WorkshopWorkOrderMapper {
  static toDomain(raw: Record<string, unknown>): WorkshopWorkOrderEntity {
    return {
      id: String(raw.id),
      stayId: String(raw.stay_id),
      folio: String(raw.folio),
      maintenanceTypeId: raw.maintenance_type_id ? String(raw.maintenance_type_id) : null,
      maintenanceServiceId: raw.maintenance_service_id ? String(raw.maintenance_service_id) : null,
      startedAt: new Date(String(raw.started_at)),
      finishedAt: raw.finished_at ? new Date(String(raw.finished_at)) : null,
      status: raw.status as WorkOrderStatus,
      specialistName: raw.specialist_name ? String(raw.specialist_name) : null,
      supervisorName: raw.supervisor_name ? String(raw.supervisor_name) : null,
      supervisorEmployeeId: raw.supervisor_employee_id ? String(raw.supervisor_employee_id) : null,
      description: String(raw.description),
      details: raw.details ? String(raw.details) : null,
      failureLocation: raw.failure_location ? String(raw.failure_location) : null,
      vehicleActivityAtFailure: raw.vehicle_activity_at_failure ? String(raw.vehicle_activity_at_failure) : null,
      locationType: raw.location_type as LocationType,
      createdBy: raw.created_by ? String(raw.created_by) : null,
      createdAt: new Date(String(raw.created_at)),
      updatedAt: new Date(String(raw.updated_at))
    }
  }

  static toApi(input: CreateWorkOrderInput): Record<string, unknown> {
    return {
      stay_id: input.stayId,
      maintenance_type_id: input.maintenanceTypeId || null,
      maintenance_service_id: input.maintenanceServiceId || null,
      started_at: input.startedAt.toISOString(),
      specialist_name: input.specialistName || null,
      supervisor_name: input.supervisorName || null,
      supervisor_employee_id: input.supervisorEmployeeId || null,
      description: input.description,
      details: input.details || null,
      failure_location: input.failureLocation || null,
      vehicle_activity_at_failure: input.vehicleActivityAtFailure || null,
      location_type: input.locationType,
    }
  }
}

export class WorkOrderPartMapper {
  static toDomain(raw: Record<string, unknown>): WorkOrderPartEntity {
    return {
      id: String(raw.id),
      workOrderId: String(raw.work_order_id),
      providerId: raw.provider_id ? String(raw.provider_id) : null,
      description: String(raw.description),
      brand: raw.brand ? String(raw.brand) : null,
      unitId: raw.unit_id ? String(raw.unit_id) : null,
      quantity: Number(raw.quantity),
      unitPrice: Number(raw.unit_price),
      discount: Number(raw.discount),
      taxRate: Number(raw.tax_rate),
      total: Number(raw.total),
      createdBy: raw.created_by ? String(raw.created_by) : null,
      createdAt: new Date(String(raw.created_at)),
      paidBy: raw.paid_by ? String(raw.paid_by) : null,
      isInternalSupply: Boolean(raw.is_internal_supply),
      notes: raw.notes ? String(raw.notes) : null
    }
  }

  static toApi(input: CreateWorkOrderPartInput): Record<string, unknown> {
    // Calculamos el total antes de enviar a DB como mejor práctica
    const grossTotal = input.quantity * input.unitPrice
    const subtotal = grossTotal - input.discount
    const totalWithTax = subtotal * (1 + input.taxRate)

    return {
      work_order_id: input.workOrderId,
      provider_id: input.providerId || null,
      description: input.description,
      brand: input.brand || null,
      unit_id: input.unitId || null,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      discount: input.discount,
      tax_rate: input.taxRate,
      total: totalWithTax,
      is_internal_supply: input.isInternalSupply,
      paid_by: input.paidBy || null,
      notes: input.notes || null,
    }
  }
}
