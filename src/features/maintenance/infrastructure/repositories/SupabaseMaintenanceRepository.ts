import { createClient } from '@/src/core/lib/supabase/client'
import type { Either, Failure } from '@/src/core/domain/either'
import type {
  IMaintenanceRepository,
  MaintenanceListFilters,
  PaginatedResult,
  MaintenanceCatalogsEntity,
  MaintenanceGeneralKPIs,
  MaintenanceExpenseKPIs,
} from '../../domain/repositories/i-maintenance-repository'
import { MaintenanceMapper, type MaintenanceProviderRow, type MaintenanceTypeRow, type MechanicalCategoryRow, type MaintenanceServiceRow, type WorkshopStayKpiRow, type WorkOrderPartRow, type WorkOrderRow, type MeasurementUnitRow, type InventoryItemRow } from '../mappers/MaintenanceMapper'
import type { WorkshopWorkOrderEntity, WorkOrderPartEntity, WorkshopStayReplicaEntity, WorkshopWorkOrderReplicaEntity, WorkOrderPartReplicaEntity, MeasurementUnitEntity, InventoryItemEntity, MaintenanceTypeEntity, MaintenanceServiceEntity, VehicleSystemEntity, VehicleComponentEntity, WorkOrderIssueEntity } from '../../domain/entities/maintenance-entity'
import type { CreateWorkshopStayInput } from '../../domain/schemas/create-stay.schema'
import type { CreateWorkOrderInput } from '../../domain/schemas/create-work-order.schema'
import type { CreateWorkOrderPartInput } from '../../domain/schemas/create-part.schema'
import type { CreateWorkOrderIssueInput } from '../../domain/schemas/create-work-order-issue.schema'
import type { CreateProviderInput } from '../../domain/schemas/create-provider.schema'
import type { MaintenanceProviderEntity } from '../../domain/entities/maintenance-entity'

const SELECT_STAYS = 'id, folio, vehicle_type, unit_label, entered_at, exited_at, reason, days_in_shop, total_cost, status'
const SELECT_WORK_ORDERS = [
  '*',
  'maintenance_types(name)',
  'maintenance_services(name)',
  'work_order_parts(total)',
].join(', ')
const SELECT_PARTS = [
  '*',
  'maintenance_providers(name, provider_type)',
  'inventory_items(name)',
  'measurement_units(name)',
].join(', ')

const SELECT_STAYS_REPLICA = `
  id, sequential_number, folio, vehicle_type, entered_at, exited_at, reason, km_at_entry, km_last_service, last_trip_start_date, notes,
  delivered_by_employee_id, picked_up_by_employee_id, last_trip_id,
  trucks (economic_number, plates),
  trailers (economic_number, plates),
  delivered_by_employee:employees!workshop_stays_delivered_by_employee_id_fkey (full_name),
  picked_up_by_employee:employees!workshop_stays_picked_up_by_employee_id_fkey (full_name),
  received_by_profile:profiles!workshop_stays_created_by_fkey (full_name),
  last_trip:trips!workshop_stays_last_trip_id_fkey (destination, departure_date, clients(company_name)),
  workshop_work_orders (
    work_order_parts (total)
  )
`

const SELECT_WORK_ORDERS_REPLICA = `
  id, stay_id, folio, started_at, finished_at, status, description, details, location_type, failure_location, vehicle_activity_at_failure,
  workshop_stays (
    folio, entered_at, reason, vehicle_type,
    trucks (economic_number, plates),
    trailers (economic_number, plates)
  ),
  maintenance_types (name),
  maintenance_services (name),
  specialist_name,
  supervisor_name,
  supervisor_employee:employees!workshop_work_orders_supervisor_employee_id_fkey (full_name),
  work_order_parts (total)
`

const SELECT_PARTS_REPLICA = `
  id, work_order_id, provider_id, description, brand, unit_id, quantity, unit_price, discount, tax_rate, total, paid_by, notes,
  maintenance_providers (name),
  measurement_units (name),
  workshop_work_orders (
    folio,
    maintenance_types(name),
    maintenance_services(name),
    workshop_stays (
      folio, entered_at, reason, vehicle_type,
      trucks(economic_number, plates),
      trailers(economic_number, plates)
    )
  )
`

export class SupabaseMaintenanceRepository implements IMaintenanceRepository {
  async listStays(filters: MaintenanceListFilters = {}): Promise<Either<Failure, PaginatedResult<WorkshopStayReplicaEntity>>> {
    try {
      const supabase = createClient()
      const page = filters.page || 1
      const pageSize = filters.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase.from('workshop_stays').select(SELECT_STAYS_REPLICA, { count: 'exact' }).order('entered_at', { ascending: false })

      if (filters.status) {
        if (filters.status === 'open') query = query.is('exited_at', null)
        else query = query.not('exited_at', 'is', null)
      }
      if (filters.vehicleType) query = query.eq('vehicle_type', filters.vehicleType)
      if (filters.startDate) query = query.gte('entered_at', filters.startDate)
      if (filters.endDate) query = query.lte('entered_at', filters.endDate)

      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      if (data && data.length > 0) {
        console.log('--- SUPABASE ROW ---', data[0])
      }

      return {
        ok: true,
        data: {
          data: (data ?? []).map((r) => MaintenanceMapper.stayReplicaToDomain(r)),
          totalCount: count ?? 0,
          page,
          pageSize
        }
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar estancias (replica)' } }
    }
  }

  async listWorkOrders(stayId: string): Promise<Either<Failure, WorkshopWorkOrderEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('workshop_work_orders')
        .select(SELECT_WORK_ORDERS)
        .eq('stay_id', stayId)
        .order('started_at', { ascending: false })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.workOrderToDomain(r as unknown as WorkOrderRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar órdenes de trabajo' } }
    }
  }

  async listAllWorkOrders(filters: MaintenanceListFilters = {}): Promise<Either<Failure, PaginatedResult<WorkshopWorkOrderReplicaEntity>>> {
    try {
      const supabase = createClient()
      const page = filters.page || 1
      const pageSize = filters.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase.from('workshop_work_orders').select(SELECT_WORK_ORDERS_REPLICA, { count: 'exact' }).order('started_at', { ascending: false })

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.startDate) query = query.gte('started_at', filters.startDate)
      if (filters.endDate) query = query.lte('started_at', filters.endDate)

      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return {
        ok: true,
        data: {
          data: (data ?? []).map((r) => MaintenanceMapper.workOrderReplicaToDomain(r)),
          totalCount: count ?? 0,
          page,
          pageSize
        }
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar todas las órdenes (replica)' } }
    }
  }

  async listWorkOrderParts(workOrderId: string): Promise<Either<Failure, WorkOrderPartEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('work_order_parts')
        .select(SELECT_PARTS)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.workOrderPartToDomain(r as unknown as WorkOrderPartRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar refacciones' } }
    }
  }

  async listAllWorkOrderParts(filters: MaintenanceListFilters = {}): Promise<Either<Failure, PaginatedResult<WorkOrderPartReplicaEntity>>> {
    try {
      const supabase = createClient()
      const page = filters.page || 1
      const pageSize = filters.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase.from('work_order_parts').select(SELECT_PARTS_REPLICA, { count: 'exact' }).order('created_at', { ascending: false })

      // Para refacciones podemos usar startDate / endDate basado en created_at
      if (filters.startDate) query = query.gte('created_at', filters.startDate)
      if (filters.endDate) query = query.lte('created_at', filters.endDate)

      query = query.range(from, to)

      const { data, error, count } = await query
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return {
        ok: true,
        data: {
          data: (data ?? []).map((r) => MaintenanceMapper.partReplicaToDomain(r)),
          totalCount: count ?? 0,
          page,
          pageSize
        }
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar todas las refacciones (replica)' } }
    }
  }

  async getCatalogs(): Promise<Either<Failure, MaintenanceCatalogsEntity>> {
    try {
      const supabase = createClient()
      const [typesRes, servicesRes, providersRes] = await Promise.all([
        supabase.from('maintenance_types').select('id, name, is_active').eq('is_active', true).order('name'),
        supabase.from('maintenance_services').select('id, name, description, maintenance_type_id, is_active').eq('is_active', true).order('name'),
        supabase.from('maintenance_providers').select('id, name, provider_type, is_active').eq('is_active', true).order('name'),
      ])

      const anyError = typesRes.error || servicesRes.error || providersRes.error
      if (anyError) return { ok: false, error: { code: 'DB_ERROR', message: anyError!.message } }

      return {
        ok: true,
        data: {
          maintenanceTypes: (typesRes.data ?? []).map((r) => MaintenanceMapper.maintenanceTypeToDomain(r as unknown as MaintenanceTypeRow)),
          maintenanceServices: (servicesRes.data ?? []).map((r) => MaintenanceMapper.maintenanceServiceToDomain(r as unknown as MaintenanceServiceRow)),
          providers: (providersRes.data ?? []).map((r) => MaintenanceMapper.providerToDomain(r as unknown as MaintenanceProviderRow)),
        },
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar catálogos' } }
    }
  }

  async getMaintenanceTypes(): Promise<Either<Failure, MaintenanceTypeEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('maintenance_types')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.maintenanceTypeToDomain(r as unknown as MaintenanceTypeRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar tipos de mantenimiento' } }
    }
  }

  async getMaintenanceServices(maintenanceTypeId?: string): Promise<Either<Failure, MaintenanceServiceEntity[]>> {
    try {
      const supabase = createClient()
      let query = supabase
        .from('maintenance_services')
        .select('id, name, description, maintenance_type_id, is_active')
        .eq('is_active', true)
        .order('name')

      if (maintenanceTypeId) {
        query = query.eq('maintenance_type_id', maintenanceTypeId)
      }

      const { data, error } = await query

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.maintenanceServiceToDomain(r as unknown as MaintenanceServiceRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar servicios de mantenimiento' } }
    }
  }

  async getMeasurementUnits(): Promise<Either<Failure, MeasurementUnitEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('measurement_units')
        .select('id, name, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.measurementUnitToDomain(r as unknown as MeasurementUnitRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar unidades de medida' } }
    }
  }

  async getInventoryItems(): Promise<Either<Failure, InventoryItemEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('inventory_items')
        .select('id, name')
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.inventoryItemToDomain(r as unknown as InventoryItemRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar inventario' } }
    }
  }

  // ─── Predictive Maintenance ─────────────────────────────────────────────────

  async getVehicleSystems(): Promise<Either<Failure, VehicleSystemEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('vehicle_systems')
        .select('id, name, description, is_active')
        .eq('is_active', true)
        .order('name')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.vehicleSystemToDomain(r as any)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar sistemas del vehículo' } }
    }
  }

  async getVehicleComponents(vehicleSystemId?: string): Promise<Either<Failure, VehicleComponentEntity[]>> {
    try {
      const supabase = createClient()
      let query = supabase
        .from('vehicle_components')
        .select(`
          id, name, description, is_active, vehicle_system_id,
          vehicle_systems (name)
        `)
        .eq('is_active', true)
        .order('name')

      if (vehicleSystemId) {
        query = query.eq('vehicle_system_id', vehicleSystemId)
      }

      const { data, error } = await query

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.vehicleComponentToDomain(r as any)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar componentes del vehículo' } }
    }
  }

  async listWorkOrderIssues(workOrderId: string): Promise<Either<Failure, WorkOrderIssueEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('work_order_issues')
        .select(`
          id, work_order_id, vehicle_component_id, reported_issue, mechanic_notes, created_at,
          vehicle_components (
            name,
            vehicle_systems (name)
          )
        `)
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: false })

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.workOrderIssueToDomain(r as any)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar fallas de la orden de trabajo' } }
    }
  }

  async createWorkOrderIssue(_input: CreateWorkOrderIssueInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async deleteWorkOrderIssue(_issueId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async createStay(_input: CreateWorkshopStayInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async updateStay(_stayId: string, _input: Partial<CreateWorkshopStayInput>, _updatedBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async closeStay(stayId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async createWorkOrder(_input: CreateWorkOrderInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async updateWorkOrder(_workOrderId: string, _input: Partial<CreateWorkOrderInput>, _updatedBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async createWorkOrderPart(_input: CreateWorkOrderPartInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async updateWorkOrderPart(_partId: string, _input: Partial<CreateWorkOrderPartInput>, _updatedBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async deleteStay(_stayId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async deleteWorkOrder(_workOrderId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async deleteWorkOrderPart(_partId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async listProviders(): Promise<Either<Failure, MaintenanceProviderEntity[]>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('maintenance_providers')
        .select('id, name, provider_type, is_active')
        .order('name', { ascending: true })
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return {
        ok: true,
        data: (data ?? []).map((r) => ({
          id: r.id as string,
          name: r.name as string,
          providerType: r.provider_type as MaintenanceProviderEntity['providerType'],
          isActive: r.is_active as boolean,
        })),
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener proveedores' } }
    }
  }

  async createProvider(_input: CreateProviderInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async updateProvider(_providerId: string, _input: Partial<CreateProviderInput>): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async getGeneralKPIs(startDate?: string, endDate?: string): Promise<Either<Failure, MaintenanceGeneralKPIs>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_maintenance_general_kpis', {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      })
      if (error) throw error
      return { ok: true, data: data as MaintenanceGeneralKPIs }
    } catch (error: any) {
      console.error('Error fetching general KPIs:', error?.message, error?.details, error?.hint, error?.code)
      return { ok: false, error: { code: 'DB_ERROR', message: 'Error al obtener métricas generales' } }
    }
  }

  async getExpenseKPIs(startDate?: string, endDate?: string): Promise<Either<Failure, MaintenanceExpenseKPIs>> {
    try {
      const supabase = createClient()
      const { data, error } = await supabase.rpc('get_maintenance_expense_kpis', {
        p_start_date: startDate || null,
        p_end_date: endDate || null
      })
      if (error) throw error
      return { ok: true, data: data as MaintenanceExpenseKPIs }
    } catch (error: any) {
      console.error('Error fetching expense KPIs:', error?.message, error?.details, error?.hint, error?.code)
      return { ok: false, error: { code: 'DB_ERROR', message: 'Error al obtener métricas de gastos' } }
    }
  }
}
