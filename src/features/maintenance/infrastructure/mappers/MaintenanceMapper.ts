import type {
  MaintenanceProviderEntity,
  MaintenanceTypeEntity,
  MechanicalCategoryEntity,
  ProviderType,
  VehicleType,
  WorkOrderPartEntity,
  WorkshopStayKpiEntity,
  WorkshopWorkOrderEntity,
  WorkOrderStatus,
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
  mechanical_category_id: string | null
  started_at: string
  finished_at: string | null
  status: WorkOrderStatus
  specialist_employee_id: string | null
  supervisor_profile_id: string | null
  description: string
  details: string | null
  maintenance_types?: { name: string } | null
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
  created_at: string
  maintenance_providers?: { name: string; provider_type: ProviderType } | null
  inventory_items?: { name: string } | null
  measurement_units?: { name: string } | null
}

export type MaintenanceTypeRow = { id: string; name: string; is_active: boolean }
export type MechanicalCategoryRow = { id: string; name: string; is_active: boolean }
export type MaintenanceProviderRow = { id: string; name: string; provider_type: ProviderType; is_active: boolean }

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

  static mechanicalCategoryToDomain(row: MechanicalCategoryRow): MechanicalCategoryEntity {
    return { id: row.id, name: row.name, isActive: row.is_active }
  }

  static providerToDomain(row: MaintenanceProviderRow): MaintenanceProviderEntity {
    return { id: row.id, name: row.name, providerType: row.provider_type, isActive: row.is_active }
  }

  static workOrderToDomain(row: WorkOrderRow): WorkshopWorkOrderEntity {
    const total = (row.work_order_parts ?? []).reduce((acc, p) => acc + (p.total ?? 0), 0)
    return {
      id: row.id,
      stayId: row.stay_id,
      folio: row.folio,
      maintenanceTypeId: row.maintenance_type_id,
      maintenanceTypeName: row.maintenance_types?.name ?? null,
      mechanicalCategoryId: row.mechanical_category_id,
      mechanicalCategoryName: row.mechanical_categories?.name ?? null,
      startedAt: new Date(row.started_at),
      finishedAt: row.finished_at ? new Date(row.finished_at) : null,
      status: row.status,
      specialistEmployeeId: row.specialist_employee_id,
      supervisorProfileId: row.supervisor_profile_id,
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
      createdAt: new Date(row.created_at),
    }
  }
}

