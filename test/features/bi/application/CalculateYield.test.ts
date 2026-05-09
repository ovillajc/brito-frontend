import { describe, expect, it } from 'vitest'
import { YieldCalculatorService } from '@/src/features/bi/application/CalculateYield'

describe('YieldCalculatorService', () => {
  it('calcula rendimiento real, delta, costo y eficiencia cuando hay km', () => {
    const service = new YieldCalculatorService()
    const result = service.calculate({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      distanceKm: 1000,
      fuelLiters: 500,
      dieselPriceMXN: 25,
      theoreticalYieldKmL: 2,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.realYieldKmL).toBeCloseTo(2)
    expect(result.data.yieldDelta).toBeCloseTo(0)
    expect(result.data.fuelCostMXN).toBeCloseTo(12500)
    expect(result.data.savingsOrExcessMXN).toBeCloseTo(0)
    expect(result.data.efficiencyPct).toBeCloseTo(100)
  })

  it('calcula solo costo cuando no hay km', () => {
    const service = new YieldCalculatorService()
    const result = service.calculate({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      distanceKm: null,
      fuelLiters: 500,
      dieselPriceMXN: 25,
      theoreticalYieldKmL: 2,
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.data.realYieldKmL).toBeNull()
    expect(result.data.yieldDelta).toBeNull()
    expect(result.data.savingsOrExcessMXN).toBeNull()
    expect(result.data.fuelCostMXN).toBeCloseTo(12500)
    expect(result.data.efficiencyPct).toBeNull()
  })

  it('retorna VALIDATION_ERROR con litros inválidos', () => {
    const service = new YieldCalculatorService()
    const result = service.calculate({
      startDate: '2026-05-01',
      endDate: '2026-05-31',
      distanceKm: 1000,
      fuelLiters: 0,
      dieselPriceMXN: 25,
      theoreticalYieldKmL: 2,
    })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.error.code).toBe('VALIDATION_ERROR')
  })
})

