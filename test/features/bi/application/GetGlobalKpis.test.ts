import { describe, expect, it, vi } from 'vitest'
import { GetGlobalKpis } from '@/src/features/bi/application/GetGlobalKpis'
import type { IBiRepository } from '@/src/features/bi/domain/repositories/i-bi-repository'

describe('GetGlobalKpis', () => {
  it('retorna los KPIs desde el repositorio', async () => {
    const repo: IBiRepository = {
      getGlobalKpis: vi.fn(),
      getCatalogs: vi.fn(),
      getFleetHistory: vi.fn(),
    }

    vi.mocked(repo.getGlobalKpis).mockResolvedValue({
      ok: true,
      data: {
        totalTrips: 10,
        totalRevenue: 1000,
        totalExpenses: 200,
        tripsInProgress: 2,
        tripsCompleted: 7,
        totalTrucks: 5,
        totalTrailers: 4,
        totalOperators: 3,
      },
    })

    const result = await GetGlobalKpis(repo)
    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data.totalTrips).toBe(10)
      expect(result.data.totalRevenue).toBe(1000)
    }
  })

  it('retorna UNEXPECTED si el repo lanza', async () => {
    const repo: IBiRepository = {
      getGlobalKpis: vi.fn(),
      getCatalogs: vi.fn(),
      getFleetHistory: vi.fn(),
    }

    vi.mocked(repo.getGlobalKpis).mockImplementation(async () => {
      throw new Error('boom')
    })

    const result = await GetGlobalKpis(repo)
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('UNEXPECTED')
  })
})

