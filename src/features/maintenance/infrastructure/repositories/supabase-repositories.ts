import type { SupabaseClient } from '@supabase/supabase-js'

import type { 
  WorkshopStayEntity, 
  WorkshopWorkOrderEntity, 
  WorkOrderPartEntity 
} from '../../domain/entities/entities'

import type {
  IWorkshopStayRepository,
  IWorkshopWorkOrderRepository,
  IWorkOrderPartRepository
} from '../../domain/repositories/repositories'

import type {
  CreateWorkshopStayInput,
  CreateWorkOrderInput,
  CreateWorkOrderPartInput
} from '../../domain/schemas/schemas'

import {
  WorkshopStayMapper,
  WorkshopWorkOrderMapper,
  WorkOrderPartMapper
} from '../mappers/mappers'

/**
 * @fileoverview Implementación de repositorios utilizando Supabase.
 */

export class SupabaseWorkshopStayRepository implements IWorkshopStayRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<WorkshopStayEntity | null> {
    const { data, error } = await this.supabase
      .from('workshop_stays')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return WorkshopStayMapper.toDomain(data)
  }

  async findAll(): Promise<WorkshopStayEntity[]> {
    const { data, error } = await this.supabase
      .from('workshop_stays')
      .select('*')
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map(WorkshopStayMapper.toDomain)
  }

  async create(input: CreateWorkshopStayInput): Promise<WorkshopStayEntity> {
    const payload = WorkshopStayMapper.toApi(input)
    
    // Necesitamos generar el sequential_number y el folio antes de insertar
    // Generalmente esto se hace con una función en DB o un trigger, pero para la implementación:
    // Hacemos una consulta para obtener el último sequential_number del año/mes actual.
    // Aquí usamos una simplificación asumiendo que el trigger o DB puede manejarlo 
    // o que se obtiene del frontend.
    // Nota: Es altamente recomendable que 'folio' y 'sequential_number' se autogeneren en DB.
    // Por ahora confiaremos en que el trigger de DB lo asigne si no lo mandamos, o si lo necesitamos
    // enviar explícitamente, este UseCase/Repositorio fallará.
    
    const { data, error } = await this.supabase
      .from('workshop_stays')
      .insert([payload])
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    return WorkshopStayMapper.toDomain(data)
  }

  async update(id: string, updates: Partial<WorkshopStayEntity>): Promise<WorkshopStayEntity> {
    // Convertir el partial entity a raw object
    const rawUpdates: Record<string, unknown> = {}
    if (updates.exitedAt) rawUpdates.exited_at = updates.exitedAt.toISOString()
    if (updates.reason) rawUpdates.reason = updates.reason
    if (updates.notes !== undefined) rawUpdates.notes = updates.notes
    if (updates.kmLastService !== undefined) rawUpdates.km_last_service = updates.kmLastService
    if (updates.lastTripStartDate !== undefined) rawUpdates.last_trip_start_date = updates.lastTripStartDate ? updates.lastTripStartDate.toISOString() : null
    // ... otros campos parciales ...
    rawUpdates.updated_at = new Date().toISOString()

    const { data, error } = await this.supabase
      .from('workshop_stays')
      .update(rawUpdates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    return WorkshopStayMapper.toDomain(data)
  }
}

export class SupabaseWorkshopWorkOrderRepository implements IWorkshopWorkOrderRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<WorkshopWorkOrderEntity | null> {
    const { data, error } = await this.supabase
      .from('workshop_work_orders')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return WorkshopWorkOrderMapper.toDomain(data)
  }

  async findByStayId(stayId: string): Promise<WorkshopWorkOrderEntity[]> {
    const { data, error } = await this.supabase
      .from('workshop_work_orders')
      .select('*')
      .eq('stay_id', stayId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map(WorkshopWorkOrderMapper.toDomain)
  }

  async create(input: CreateWorkOrderInput): Promise<WorkshopWorkOrderEntity> {
    const payload = WorkshopWorkOrderMapper.toApi(input)
    const { data, error } = await this.supabase
      .from('workshop_work_orders')
      .insert([payload])
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    return WorkshopWorkOrderMapper.toDomain(data)
  }

  async update(id: string, updates: Partial<WorkshopWorkOrderEntity>): Promise<WorkshopWorkOrderEntity> {
    const rawUpdates: Record<string, unknown> = {}
    if (updates.status) rawUpdates.status = updates.status
    if (updates.finishedAt) rawUpdates.finished_at = updates.finishedAt.toISOString()
    if (updates.details) rawUpdates.details = updates.details
    rawUpdates.updated_at = new Date().toISOString()

    const { data, error } = await this.supabase
      .from('workshop_work_orders')
      .update(rawUpdates)
      .eq('id', id)
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    return WorkshopWorkOrderMapper.toDomain(data)
  }
}

export class SupabaseWorkOrderPartRepository implements IWorkOrderPartRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<WorkOrderPartEntity | null> {
    const { data, error } = await this.supabase
      .from('work_order_parts')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null

    return WorkOrderPartMapper.toDomain(data)
  }

  async findByWorkOrderId(workOrderId: string): Promise<WorkOrderPartEntity[]> {
    const { data, error } = await this.supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false })

    if (error || !data) return []

    return data.map(WorkOrderPartMapper.toDomain)
  }

  async create(input: CreateWorkOrderPartInput): Promise<WorkOrderPartEntity> {
    const payload = WorkOrderPartMapper.toApi(input)
    const { data, error } = await this.supabase
      .from('work_order_parts')
      .insert([payload])
      .select('*')
      .single()

    if (error) throw new Error(error.message)

    return WorkOrderPartMapper.toDomain(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('work_order_parts')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
  }
}
