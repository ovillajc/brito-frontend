import { createClient } from '@/src/core/lib/supabase/client'
import type { Either, Failure } from '@/src/core/domain/either'
import type { IMaintenanceRepository, MaintenanceCatalogsEntity, MaintenanceListFilters } from '../../domain/repositories/i-maintenance-repository'
import { MaintenanceMapper, type MaintenanceProviderRow, type MaintenanceTypeRow, type MechanicalCategoryRow, type WorkshopStayKpiRow, type WorkOrderPartRow, type WorkOrderRow } from '../mappers/MaintenanceMapper'
import type { WorkshopStayKpiEntity, WorkshopWorkOrderEntity, WorkOrderPartEntity } from '../../domain/entities/maintenance-entity'
import type { CreateWorkshopStayInput } from '../../domain/schemas/create-stay.schema'
import type { CreateWorkOrderInput } from '../../domain/schemas/create-work-order.schema'
import type { CreateWorkOrderPartInput } from '../../domain/schemas/create-part.schema'

const SELECT_STAYS = 'id, folio, vehicle_type, unit_label, entered_at, exited_at, reason, days_in_shop, total_cost, status'
const SELECT_WORK_ORDERS = [
  '*',
  'maintenance_types(name)',
  'mechanical_categories(name)',
  'work_order_parts(total)',
].join(', ')
const SELECT_PARTS = [
  '*',
  'maintenance_providers(name, provider_type)',
  'inventory_items(name)',
  'measurement_units(name)',
].join(', ')

export class SupabaseMaintenanceRepository implements IMaintenanceRepository {
  async listStays(filters: MaintenanceListFilters = {}): Promise<Either<Failure, WorkshopStayKpiEntity[]>> {
    try {
      const supabase = createClient()
      let query = supabase.from('workshop_stays_kpis').select(SELECT_STAYS).order('entered_at', { ascending: false })

      if (filters.status) query = query.eq('status', filters.status)
      if (filters.vehicleType) query = query.eq('vehicle_type', filters.vehicleType)
      if (filters.limit) query = query.limit(filters.limit)

      const { data, error } = await query
      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }

      return { ok: true, data: (data ?? []).map((r) => MaintenanceMapper.stayKpiToDomain(r as unknown as WorkshopStayKpiRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar estancias' } }
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

  async getCatalogs(): Promise<Either<Failure, MaintenanceCatalogsEntity>> {
    try {
      const supabase = createClient()
      const [typesRes, categoriesRes, providersRes] = await Promise.all([
        supabase.from('maintenance_types').select('id, name, is_active').eq('is_active', true).order('name'),
        supabase.from('mechanical_categories').select('id, name, is_active').eq('is_active', true).order('name'),
        supabase.from('maintenance_providers').select('id, name, provider_type, is_active').eq('is_active', true).order('name'),
      ])

      const anyError = typesRes.error || categoriesRes.error || providersRes.error
      if (anyError) return { ok: false, error: { code: 'DB_ERROR', message: anyError.message } }

      return {
        ok: true,
        data: {
          maintenanceTypes: (typesRes.data ?? []).map((r) => MaintenanceMapper.maintenanceTypeToDomain(r as unknown as MaintenanceTypeRow)),
          mechanicalCategories: (categoriesRes.data ?? []).map((r) => MaintenanceMapper.mechanicalCategoryToDomain(r as unknown as MechanicalCategoryRow)),
          providers: (providersRes.data ?? []).map((r) => MaintenanceMapper.providerToDomain(r as unknown as MaintenanceProviderRow)),
        },
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al cargar catálogos' } }
    }
  }

  async createStay(_input: CreateWorkshopStayInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async closeStay(_stayId: string): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async createWorkOrder(_input: CreateWorkOrderInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }

  async createWorkOrderPart(_input: CreateWorkOrderPartInput, _createdBy: string | null): Promise<Either<Failure, void>> {
    return { ok: false, error: { code: 'UNSUPPORTED', message: 'Operación no soportada en cliente' } }
  }
}
