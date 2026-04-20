import { createClient } from '@/src/core/lib/supabase/server'
import { IUnitAssemblyRepository } from '../../domain/repositories/IUnitAssemblyRepository'
import { UnitAssemblyEntity, UnitAssemblyLogEntity, UnitAssemblyLogAction } from '../../domain/entities'
import { UnitAssemblyMapper } from '../mappers/UnitAssemblyMapper'

const SELECT_QUERY = '*, employees(full_name), trucks(economic_number), trailers!unit_assemblies_trailer_id_fkey(economic_number), trailer2:trailers!unit_assemblies_trailer2_id_fkey(economic_number), clients(trade_name, company_name), company_profile(legal_name)'

export class SupabaseUnitAssemblyRepository implements IUnitAssemblyRepository {
  async findAll(): Promise<UnitAssemblyEntity[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('unit_assemblies')
      .select(SELECT_QUERY)
      .order('created_at', { ascending: false })

    if (error) throw new Error(`Error al obtener unidades: ${error.message}`)
    if (!data) return []
    return data.map((r) => UnitAssemblyMapper.toDomain(r))
  }

  async findById(id: string): Promise<UnitAssemblyEntity | null> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('unit_assemblies')
      .select(SELECT_QUERY)
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Error al obtener unidad: ${error.message}`)
    }
    return data ? UnitAssemblyMapper.toDomain(data) : null
  }

  async detachTrailerFromOthers(trailerId: string, currentUnitId?: string, profileId?: string): Promise<void> {
    const supabase = await createClient()
    
    // Buscar si está asignado como trailer 1
    let query1 = supabase.from('unit_assemblies').update({ trailer_id: null }).eq('trailer_id', trailerId)
    if (currentUnitId) query1 = query1.neq('id', currentUnitId)
    await query1

    // Buscar si está asignado como trailer 2
    let query2 = supabase.from('unit_assemblies').update({ trailer2_id: null }).eq('trailer2_id', trailerId)
    if (currentUnitId) query2 = query2.neq('id', currentUnitId)
    await query2
  }

  private async logAction(
    action: UnitAssemblyLogAction,
    unitId: string,
    payload: any,
    profileId?: string
  ) {
    const supabase = await createClient()
    await supabase.from('unit_assemblies_logs').insert({
      unit_assembly_id: unitId,
      employee_id: payload.employee_id,
      truck_id: payload.truck_id,
      trailer_id: payload.trailer_id,
      trailer2_id: payload.trailer2_id,
      profile_id: profileId || null,
      action
    })
  }

  async create(input: Partial<UnitAssemblyEntity>, profileId?: string): Promise<UnitAssemblyEntity> {
    const supabase = await createClient()
    const payload = UnitAssemblyMapper.toPersistCreate(input)

    // Si tiene remolques, destrabarlos de otras unidades primero
    if (payload.trailer_id) await this.detachTrailerFromOthers(payload.trailer_id, undefined, profileId)
    if (payload.trailer2_id) await this.detachTrailerFromOthers(payload.trailer2_id, undefined, profileId)

    const { data, error } = await supabase
      .from('unit_assemblies')
      .insert(payload)
      .select(SELECT_QUERY)
      .single()

    if (error) throw new Error(`Error al crear unidad: ${error.message}`)

    // Log the creation
    await this.logAction('CREATED', data.id, payload, profileId)

    return UnitAssemblyMapper.toDomain(data)
  }

  async update(id: string, input: Partial<UnitAssemblyEntity>, profileId?: string): Promise<UnitAssemblyEntity> {
    const supabase = await createClient()
    const payload = UnitAssemblyMapper.toPersistUpdate(input)
    payload.updated_at = new Date().toISOString()

    // Si tiene remolques, destrabarlos de otras unidades primero (excluyendo a sí misma)
    if (payload.trailer_id) await this.detachTrailerFromOthers(payload.trailer_id as string, id, profileId)
    if (payload.trailer2_id) await this.detachTrailerFromOthers(payload.trailer2_id as string, id, profileId)

    const { data, error } = await supabase
      .from('unit_assemblies')
      .update(payload)
      .eq('id', id)
      .select(SELECT_QUERY)
      .single()

    if (error) throw new Error(`Error al actualizar unidad: ${error.message}`)

    // Log the update
    await this.logAction('UPDATED', data.id, payload, profileId)

    return UnitAssemblyMapper.toDomain(data)
  }

  async delete(id: string): Promise<void> {
    const supabase = await createClient()
    const { error } = await supabase.from('unit_assemblies').delete().eq('id', id)
    if (error) throw new Error(`Error al eliminar unidad: ${error.message}`)
  }

  async getLogsByUnitId(unitId: string): Promise<UnitAssemblyLogEntity[]> {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('unit_assembly_logs')
      .select('*, employees(full_name), trucks(economic_number), trailers!unit_assembly_logs_trailer_id_fkey(economic_number), trailer2:trailers!unit_assembly_logs_trailer2_id_fkey(economic_number), profiles(full_name)')
      .eq('unit_assembly_id', unitId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error(error)
      return []
    }
    if (!data) return []

    return data.map((r) => ({
      id: r.id,
      unitAssemblyId: r.unit_assembly_id,
      employeeId: r.employee_id,
      truckId: r.truck_id,
      trailerId: r.trailer_id,
      trailer2Id: r.trailer2_id,
      profileId: r.profile_id,
      action: r.action as UnitAssemblyLogAction,
      createdAt: new Date(r.created_at),
      employeeName: r.employees ? (r.employees as any).full_name : undefined,
      truckEconomicNumber: r.trucks ? (r.trucks as any).economic_number : undefined,
      trailerEconomicNumber: r.trailers ? (r.trailers as any).economic_number : undefined,
      trailer2EconomicNumber: r.trailer2 ? (r.trailer2 as any).economic_number : undefined,
      profileName: r.profiles ? (r.profiles as any).full_name : undefined,
    }))
  }
}
