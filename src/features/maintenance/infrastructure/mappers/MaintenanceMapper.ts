import type {
  MaintenanceProviderEntity,
  MaintenanceTypeEntity,
  MaintenanceServiceEntity,
  MechanicalCategoryEntity,
  ProviderType,
  VehicleType,
  WorkshopStayEntity,
  WorkshopStayReplicaEntity,
  WorkshopWorkOrderEntity,
  WorkshopWorkOrderReplicaEntity,
  WorkOrderPartEntity,
  WorkOrderPartReplicaEntity,
  MeasurementUnitEntity,
  InventoryItemEntity,
  VehicleSystemEntity,
  VehicleComponentEntity,
  WorkOrderIssueEntity,
  WorkOrderStatus,
  WorkshopStayKpiEntity,
} from '../../domain/entities/maintenance-entity'

export type WorkshopStayKpiRow = {
  id: string
  folio: string
  vehicle_type: VehicleType
  unit_label: string
  entered_at: string
  exited_at: string | null
  reason: string
  days_in_shop: number | null
  total_cost: number | null
  status: 'open' | 'closed'
}

export type WorkOrderRow = {
  id: string
  stay_id: string
  folio: string
  maintenance_type_id: string | null
  maintenance_service_id?: string | null
  mechanical_category_id?: string | null
  started_at: string
  finished_at: string | null
  status: WorkOrderStatus
  specialist_name: string | null
  supervisor_name: string | null
  supervisor_employee_id: string | null
  description: string
  details: string | null
  maintenance_types?: { name: string } | null
  maintenance_services?: { name: string } | null
  mechanical_categories?: { name: string } | null
  work_order_parts?: Array<{ total: number | null }> | null
}

export type WorkOrderPartRow = {
  id: string
  work_order_id: string
  provider_id: string | null
  inventory_item_id: string | null
  description: string
  brand: string | null
  unit_id: string | null
  quantity: number
  unit_price: number
  discount: number
  tax_rate: number
  total: number
  paid_by: string | null
  created_at: string
  is_internal_supply: boolean | null
  maintenance_providers?: { name: string; provider_type: ProviderType } | null
  inventory_items?: { name: string } | null
  measurement_units?: { name: string } | null
}

export type MaintenanceTypeRow = { id: string; name: string; is_active: boolean }
export type MaintenanceServiceRow = { id: string; name: string; description: string | null; maintenance_type_id: string; is_active: boolean }
export type MechanicalCategoryRow = { id: string; name: string; is_active: boolean }
export type MaintenanceProviderRow = { id: string; name: string; provider_type: ProviderType; is_active: boolean }
export type MeasurementUnitRow = { id: string; name: string; is_active: boolean }
export type InventoryItemRow = { id: string; name: string }

export type VehicleSystemRow = { id: string; name: string; description: string | null; is_active: boolean }
export type VehicleComponentRow = { id: string; vehicle_system_id: string; name: string; description: string | null; is_active: boolean; vehicle_systems?: { name: string } | null }
export type WorkOrderIssueRow = { id: string; work_order_id: string; vehicle_component_id: string; reported_issue: string | null; mechanic_notes: string | null; created_at: string; vehicle_components?: { name: string; vehicle_systems?: { name: string } | null } | null }

export class MaintenanceMapper {
  static stayKpiToDomain(row: WorkshopStayKpiRow): WorkshopStayKpiEntity {
    return {
      id: row.id,
      folio: row.folio,
      vehicleType: row.vehicle_type,
      unitLabel: row.unit_label,
      enteredAt: new Date(row.entered_at),
      exitedAt: row.exited_at ? new Date(row.exited_at) : null,
      reason: row.reason,
      daysInShop: row.days_in_shop,
      totalCost: row.total_cost ?? 0,
      status: row.status,
    }
  }

  static maintenanceTypeToDomain(row: MaintenanceTypeRow): MaintenanceTypeEntity {
    return { id: row.id, name: row.name, isActive: row.is_active }
  }

  static maintenanceServiceToDomain(row: MaintenanceServiceRow): MaintenanceServiceEntity {
    return {
      id: row.id,
      name: row.name,
      description: row.description ?? null,
      maintenanceTypeId: row.maintenance_type_id,
      isActive: row.is_active,
    }
  }

  static mechanicalCategoryToDomain(row: MechanicalCategoryRow): MechanicalCategoryEntity {
    return { id: row.id, name: row.name, isActive: row.is_active }
  }

  static providerToDomain(row: MaintenanceProviderRow): MaintenanceProviderEntity {
    return { id: row.id, name: row.name, providerType: row.provider_type, isActive: row.is_active }
  }

  static measurementUnitToDomain(row: MeasurementUnitRow): MeasurementUnitEntity {
    return { id: row.id, name: row.name, isActive: row.is_active }
  }

  static inventoryItemToDomain(row: InventoryItemRow): InventoryItemEntity {
    return { id: row.id, name: row.name }
  }

  static vehicleSystemToDomain(row: VehicleSystemRow): VehicleSystemEntity {
    return { id: row.id, name: row.name, description: row.description, isActive: row.is_active }
  }

  static vehicleComponentToDomain(row: VehicleComponentRow): VehicleComponentEntity {
    return {
      id: row.id,
      vehicleSystemId: row.vehicle_system_id,
      vehicleSystemName: row.vehicle_systems?.name ?? null,
      name: row.name,
      description: row.description,
      isActive: row.is_active,
    }
  }

  static workOrderIssueToDomain(row: WorkOrderIssueRow): WorkOrderIssueEntity {
    return {
      id: row.id,
      workOrderId: row.work_order_id,
      vehicleComponentId: row.vehicle_component_id,
      componentName: row.vehicle_components?.name ?? null,
      vehicleSystemName: row.vehicle_components?.vehicle_systems?.name ?? null,
      reportedIssue: row.reported_issue,
      mechanicNotes: row.mechanic_notes,
      createdAt: new Date(row.created_at),
    }
  }

  static workOrderToDomain(row: WorkOrderRow): WorkshopWorkOrderEntity {
    const total = (row.work_order_parts ?? []).reduce((acc, p) => acc + (p.total ?? 0), 0)
    return {
      id: row.id,
      stayId: row.stay_id,
      folio: row.folio,
      maintenanceTypeId: row.maintenance_type_id,
      maintenanceTypeName: row.maintenance_types?.name ?? null,
      mechanicalCategoryId: row.maintenance_service_id ?? row.mechanical_category_id ?? null,
      mechanicalCategoryName: row.maintenance_services?.name ?? row.mechanical_categories?.name ?? null,
      startedAt: new Date(row.started_at),
      finishedAt: row.finished_at ? new Date(row.finished_at) : null,
      status: row.status,
      specialistName: row.specialist_name,
      supervisorName: row.supervisor_name,
      supervisorEmployeeId: row.supervisor_employee_id,
      description: row.description,
      details: row.details,
      totalCost: total,
    }
  }

  static workOrderPartToDomain(row: WorkOrderPartRow): WorkOrderPartEntity {
    return {
      id: row.id,
      workOrderId: row.work_order_id,
      providerId: row.provider_id,
      providerName: row.maintenance_providers?.name ?? null,
      providerType: row.maintenance_providers?.provider_type ?? null,
      inventoryItemId: row.inventory_item_id,
      inventoryItemName: row.inventory_items?.name ?? null,
      description: row.description,
      brand: row.brand,
      unitId: row.unit_id,
      unitName: row.measurement_units?.name ?? null,
      quantity: row.quantity,
      unitPrice: row.unit_price,
      discount: row.discount,
      taxRate: row.tax_rate,
      total: row.total,
      isInternalSupply: Boolean(row.is_internal_supply),
      createdAt: new Date(row.created_at),
    }
  }
  static stayReplicaToDomain(row: any): WorkshopStayReplicaEntity {
    const exitedAt = row.exited_at ? new Date(row.exited_at) : null;
    const enteredAt = new Date(row.entered_at);
    let daysInShop = null;
    if (exitedAt) {
      daysInShop = Number(((exitedAt.getTime() - enteredAt.getTime()) / (1000 * 60 * 60 * 24)).toFixed(2));
    }

    const totalCost = (row.workshop_work_orders ?? []).reduce((acc: number, wo: any) => {
      const woTotal = (wo.work_order_parts ?? []).reduce((partAcc: number, p: any) => partAcc + (Number(p.total) || 0), 0)
      return acc + woTotal
    }, 0)

    const truck = row.trucks;
    const trailer = row.trailers;
    const unitEconomicNumber = truck?.economic_number || trailer?.economic_number || null;
    const unitPlates = truck?.plates || trailer?.plates || null;
    
    return {
      id: row.id,
      sequentialNumber: row.sequential_number,
      folio: row.folio,
      enteredAt,
      exitedAt,
      daysInShop,
      reason: row.reason,
      totalCost,
      economicNumber: unitEconomicNumber,
      vehicleType: row.vehicle_type,
      plates: unitPlates,
      deliveredByEmployeeName: row.delivered_by_employee?.full_name || null,
      deliveredByEmployeeId: row.delivered_by_employee_id || null,
      receivedByProfileName: row.received_by_profile?.full_name || null,
      pickedUpByEmployeeName: row.picked_up_by_employee?.full_name || null,
      pickedUpByEmployeeId: row.picked_up_by_employee_id || null,
      kmAtEntry: row.km_at_entry,
      kmLastService: row.km_last_service || null,
      lastClientName: row.last_trip?.clients?.company_name || null,
      lastDestination: row.last_trip?.destination || null,
      lastTripStartDate: row.last_trip_start_date ? new Date(row.last_trip_start_date) : (row.last_trip?.departure_date ? new Date(row.last_trip.departure_date) : null),
      lastTripId: row.last_trip_id || null,
      notes: row.notes
    }
  }

  static workOrderReplicaToDomain(row: any): WorkshopWorkOrderReplicaEntity {
    const startedAt = new Date(row.started_at);
    const finishedAt = row.finished_at ? new Date(row.finished_at) : null;
    let daysInWork = null;
    const endCalcDate = finishedAt || (row.status !== 'completed' && row.status !== 'cancelled' ? new Date() : null);
    if (endCalcDate) {
      daysInWork = Number(((endCalcDate.getTime() - startedAt.getTime()) / (1000 * 60 * 60 * 24)).toFixed(2));
    }

    const totalCost = (row.work_order_parts ?? []).reduce((acc: number, p: any) => acc + (Number(p.total) || 0), 0);
    
    const stay = row.workshop_stays;
    const truck = stay?.trucks;
    const trailer = stay?.trailers;
    const unitEconomicNumber = truck?.economic_number || trailer?.economic_number || null;
    const unitPlates = truck?.plates || trailer?.plates || null;

    return {
      id: row.id,
      stayId: row.stay_id,
      stayFolio: stay?.folio || '',
      workOrderFolio: row.folio,
      stayEnteredAt: stay?.entered_at ? new Date(stay.entered_at) : new Date(),
      startedAt,
      finishedAt,
      daysInWork,
      status: row.status,
      totalCost,
      locationType: row.location_type,
      unitEconomicNumber,
      unitPlates,
      stayReason: stay?.reason || null,
      maintenanceTypeName: row.maintenance_types?.name || null,
      mechanicalCategoryName: row.maintenance_services?.name || row.mechanical_categories?.name || null,
      failureLocation: row.failure_location,
      vehicleActivityAtFailure: row.vehicle_activity_at_failure,
      specialistName: row.specialist_name || null,
      specialistEmployeeId: row.specialist_employee_id || null,
      supervisorName: row.supervisor_name || row.supervisor_employee?.full_name || null,
      description: row.description,
      details: row.details
    }
  }

  static partReplicaToDomain(row: any): WorkOrderPartReplicaEntity {
    const wo = row.workshop_work_orders;
    const stay = wo?.workshop_stays;
    const truck = stay?.trucks;
    const trailer = stay?.trailers;
    const unitEconomicNumber = truck?.economic_number || trailer?.economic_number || null;
    const unitPlates = truck?.plates || trailer?.plates || null;

    return {
      id: row.id,
      workOrderId: row.work_order_id,
      stayFolio: stay?.folio || '',
      stayEnteredAt: stay?.entered_at ? new Date(stay.entered_at) : new Date(),
      workOrderFolio: wo?.folio || '',
      unitEconomicNumber,
      unitPlates,
      stayReason: stay?.reason || null,
      maintenanceTypeName: wo?.maintenance_types?.name || null,
      mechanicalCategoryName: wo?.maintenance_services?.name || wo?.mechanical_categories?.name || null,
      description: row.description,
      providerName: row.maintenance_providers?.name || null,
      brand: row.brand,
      unitName: row.measurement_units?.name || null,
      unitPrice: row.unit_price,
      quantity: row.quantity,
      discount: row.discount,
      taxRate: row.tax_rate,
      totalWithTax: row.total,
      paidBy: row.paid_by,
      notes: row.notes,
      isInternalSupply: Boolean(row.is_internal_supply),
      inventoryItemId: row.inventory_item_id || null,
    }
  }
}
