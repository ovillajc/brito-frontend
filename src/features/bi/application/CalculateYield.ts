import type { Either, Failure } from '@/src/core/domain/either'
import type { YieldCalculatorInput, YieldCalculatorResult } from '../domain/entities/bi-entity'
import type { IYieldCalculatorService } from '../domain/repositories/i-bi-repository'

export class YieldCalculatorService implements IYieldCalculatorService {
  calculate(input: YieldCalculatorInput): Either<Failure, YieldCalculatorResult> {
    const liters = input.fuelLiters
    const theoretical = input.theoreticalYieldKmL
    const dieselPriceMXN = input.dieselPriceMXN

    if (liters <= 0 || theoretical <= 0 || dieselPriceMXN < 0 || !Number.isFinite(dieselPriceMXN)) {
      return { ok: false, error: { code: 'VALIDATION_ERROR', message: 'Parámetros inválidos' } }
    }

    const km = input.distanceKm !== null && input.distanceKm > 0 ? input.distanceKm : null
    const realYieldKmL = km !== null ? km / liters : null
    const yieldDelta = realYieldKmL !== null ? realYieldKmL - theoretical : null

    const fuelCostMXN = liters * dieselPriceMXN

    let savingsOrExcessMXN: number | null = null
    if (km !== null) {
      const theoreticalLiters = km / theoretical
      savingsOrExcessMXN = (theoreticalLiters - liters) * dieselPriceMXN
    }

    const efficiencyPct = realYieldKmL !== null ? (realYieldKmL / theoretical) * 100 : null

    return {
      ok: true,
      data: {
        realYieldKmL,
        yieldDelta,
        fuelCostMXN,
        savingsOrExcessMXN,
        efficiencyPct,
      },
    }
  }
}
