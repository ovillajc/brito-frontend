import type { Either, Failure } from '@/src/core/domain/either'
import { createClient } from '@/src/core/lib/supabase/server'
import type {
  CreateFuelTankInput,
  CreateFuelTankMovementInput,
  IFuelTankRepository,
} from '@/src/features/fuel/domain/repositories/i-fuel-tank-repository'
import type { FuelTankEntity, FuelTankMovementEntity, FuelTankSummaryEntity } from '@/src/features/fuel/domain/entities/fuel-tank-entity'

type FuelTankRow = {
  id: string
  name: string
  capacity_liters: number
  location: string | null
  is_active: boolean
}

type FuelTankMovementRow = {
  id: string
  tank_id: string
  movement_type: 'IN' | 'OUT' | 'ADJUST'
  liters: number
  unit_cost: number | null
  total_cost: number | null
  movement_date: string
  trip_id: string | null
  truck_id: string | null
  fuel_load_id: string | null
  expense_id: string | null
}

function mapTank(row: FuelTankRow): FuelTankEntity {
  return {
    id: row.id,
    name: row.name,
    capacityLiters: row.capacity_liters,
    location: row.location,
    isActive: row.is_active,
  }
}

function mapMovement(row: FuelTankMovementRow): FuelTankMovementEntity {
  return {
    id: row.id,
    tankId: row.tank_id,
    movementType: row.movement_type,
    liters: row.liters,
    unitCost: row.unit_cost,
    totalCost: row.total_cost,
    movementDate: new Date(row.movement_date),
    tripId: row.trip_id,
    truckId: row.truck_id,
    fuelLoadId: row.fuel_load_id,
    expenseId: row.expense_id,
  }
}

export class SupabaseFuelTankRepository implements IFuelTankRepository {
  async getActiveTank(): Promise<Either<Failure, FuelTankEntity | null>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('fuel_tanks')
        .select('id,name,capacity_liters,location,is_active')
        .eq('is_active', true)
        .maybeSingle()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      if (!data) return { ok: true, data: null }
      return { ok: true, data: mapTank(data as FuelTankRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener tanque activo' } }
    }
  }

  async createTank(input: CreateFuelTankInput): Promise<Either<Failure, FuelTankEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('fuel_tanks')
        .insert({
          name: input.name,
          capacity_liters: input.capacityLiters,
          location: input.location,
          is_active: input.isActive,
        })
        .select('id,name,capacity_liters,location,is_active')
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: mapTank(data as FuelTankRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al crear tanque' } }
    }
  }

  async getSummary(tankId: string): Promise<Either<Failure, FuelTankSummaryEntity>> {
    try {
      const supabase = await createClient()
      const { data: tank, error: tankError } = await supabase
        .from('fuel_tanks')
        .select('id,name,capacity_liters,location,is_active')
        .eq('id', tankId)
        .single()

      if (tankError) return { ok: false, error: { code: 'DB_ERROR', message: tankError.message } }

      const { data: movements, error: movementsError } = await supabase
        .from('fuel_tank_movements')
        .select('movement_type,liters,total_cost')
        .eq('tank_id', tankId)

      if (movementsError) return { ok: false, error: { code: 'DB_ERROR', message: movementsError.message } }

      const agg = (movements ?? []) as Array<{ movement_type: 'IN' | 'OUT' | 'ADJUST'; liters: number; total_cost: number | null }>
      const { litersInTank, inventoryValue } = agg.reduce(
        (acc, m) => {
          const cost = m.total_cost ?? 0
          if (m.movement_type === 'IN') {
            acc.litersInTank += m.liters
            acc.inventoryValue += cost
          } else if (m.movement_type === 'OUT') {
            acc.litersInTank -= m.liters
            acc.inventoryValue -= cost
          } else {
            acc.litersInTank += m.liters
            acc.inventoryValue += cost
          }
          return acc
        },
        { litersInTank: 0, inventoryValue: 0 }
      )

      const averageCostPerLiter =
        litersInTank > 0 && inventoryValue > 0 ? inventoryValue / litersInTank : null

      return {
        ok: true,
        data: {
          tank: mapTank(tank as FuelTankRow),
          litersInTank,
          inventoryValue,
          averageCostPerLiter,
        },
      }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al calcular resumen del tanque' } }
    }
  }

  async listMovements(tankId: string, limit: number): Promise<Either<Failure, FuelTankMovementEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('fuel_tank_movements')
        .select('id,tank_id,movement_type,liters,unit_cost,total_cost,movement_date,trip_id,truck_id,fuel_load_id,expense_id')
        .eq('tank_id', tankId)
        .order('movement_date', { ascending: false })
        .limit(limit)

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: (data ?? []).map((r) => mapMovement(r as FuelTankMovementRow)) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al listar movimientos del tanque' } }
    }
  }

  async createMovement(input: CreateFuelTankMovementInput): Promise<Either<Failure, FuelTankMovementEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('fuel_tank_movements')
        .insert({
          tank_id: input.tankId,
          movement_type: input.movementType,
          liters: input.liters,
          unit_cost: input.unitCost,
          total_cost: input.totalCost,
          movement_date: input.movementDate.toISOString(),
          trip_id: input.tripId,
          truck_id: input.truckId,
          fuel_load_id: input.fuelLoadId,
          expense_id: input.expenseId,
          created_by: null,
        })
        .select('id,tank_id,movement_type,liters,unit_cost,total_cost,movement_date,trip_id,truck_id,fuel_load_id,expense_id')
        .single()

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: mapMovement(data as FuelTankMovementRow) }
    } catch {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al registrar movimiento del tanque' } }
    }
  }
}

