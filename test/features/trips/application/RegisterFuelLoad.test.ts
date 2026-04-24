import { describe, expect, it, vi } from 'vitest'
import type { IFuelMetricsRepository } from '@/src/features/trips/domain/repositories/i-fuel-metrics-repository'
import { RegisterFuelLoad } from '@/src/features/trips/application/RegisterFuelLoad'
import type { Either, Failure } from '@/src/core/domain/either'
import type { FuelLoadEntity, FuelMetricsInputEntity, TrailerYieldData, TruckYieldData } from '@/src/features/trips/domain/entities/fuel-metrics-entity'

function buildRepo(): IFuelMetricsRepository {
  const okNull = <T,>(data: T): Either<Failure, T> => ({ ok: true, data })

  const registerFuelLoad = vi.fn(async (data: Omit<FuelLoadEntity, 'id' | 'createdAt'>) => {
    return okNull<FuelLoadEntity>({
      id: 'fuel-load-1',
      tripId: data.tripId,
      truckId: data.truckId,
      operatorId: data.operatorId,
      supervisedBy: data.supervisedBy,
      supervisorName: data.supervisorName,
      loadDate: data.loadDate,
      ticketFolio: data.ticketFolio,
      litersEngine: data.litersEngine,
      pricePerLiter: data.pricePerLiter,
      totalCost: data.totalCost,
      litersR1: data.litersR1,
      hoursR1: data.hoursR1,
      litersR2: data.litersR2,
      hoursR2: data.hoursR2,
      isFullTankFill: data.isFullTankFill,
      sourceType: data.sourceType,
      createdBy: data.createdBy,
      createdAt: new Date(),
    })
  }) as unknown as IFuelMetricsRepository['registerFuelLoad']

  return {
    getByTripId: async () => okNull<FuelMetricsInputEntity | null>(null),
    upsert: async () => okNull<FuelMetricsInputEntity>({} as unknown as FuelMetricsInputEntity),
    getFuelLoadByTripId: async () => okNull<FuelLoadEntity | null>(null),
    registerFuelLoad,
    getTruckYieldData: async () => okNull<TruckYieldData | null>(null),
    getTrailerYieldData: async () => okNull<TrailerYieldData | null>(null),
  }
}

describe('RegisterFuelLoad', () => {
  it('returns error when EXTERNAL has no pricePerLiter', async () => {
    const repo = buildRepo()
    const result = await RegisterFuelLoad(
      repo,
      {
        tripId: 'trip-1',
        truckId: 'truck-1',
        operatorId: 'op-1',
        ticketFolio: 'TK-1',
        loadDate: new Date(),
        litersEngine: 10,
        pricePerLiter: null,
        isFullTankFill: false,
        sourceType: 'EXTERNAL',
      },
      'guard-1',
      'guard-1'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('INVALID_PRICE')
    }
  })

  it('returns error when INTERNAL_TANK has no computed pricePerLiter', async () => {
    const repo = buildRepo()
    const result = await RegisterFuelLoad(
      repo,
      {
        tripId: 'trip-1',
        truckId: 'truck-1',
        operatorId: 'op-1',
        ticketFolio: 'TK-1',
        loadDate: new Date(),
        litersEngine: 10,
        pricePerLiter: null,
        isFullTankFill: false,
        sourceType: 'INTERNAL_TANK',
      },
      'guard-1',
      'guard-1'
    )

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('MISSING_TANK_COST')
    }
  })

  it('calls repo.registerFuelLoad with computed price for INTERNAL_TANK', async () => {
    const repo = buildRepo()
    const registerSpy = repo.registerFuelLoad as unknown as ReturnType<typeof vi.fn>
    const result = await RegisterFuelLoad(
      repo,
      {
        tripId: 'trip-1',
        truckId: 'truck-1',
        operatorId: 'op-1',
        ticketFolio: 'TK-1',
        loadDate: new Date('2026-01-01T00:00:00.000Z'),
        litersEngine: 10,
        pricePerLiter: 23.5,
        isFullTankFill: false,
        sourceType: 'INTERNAL_TANK',
      },
      'guard-1',
      'guard-1'
    )

    expect(result.ok).toBe(true)
    expect(registerSpy).toHaveBeenCalledTimes(1)
    const [payload] = registerSpy.mock.calls[0] as [Record<string, unknown>]
    expect(payload.sourceType).toBe('INTERNAL_TANK')
    expect(payload.pricePerLiter).toBe(23.5)
    expect(payload.totalCost).toBe(235)
  })
})
