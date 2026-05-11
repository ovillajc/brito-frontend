import { describe, expect, it, vi } from 'vitest'
import { GetFleetHistory } from '@/src/features/bi/application/GetFleetHistory'
import type { IBiRepository } from '@/src/features/bi/domain/repositories/i-bi-repository'

describe('GetFleetHistory', () => {
  it('retorna historial desde el repositorio', async () => {
    const repo: IBiRepository = {
      getGlobalKpis: vi.fn(),
      getCatalogs: vi.fn(),
      getFleetHistory: vi.fn(),
    }

    vi.mocked(repo.getFleetHistory).mockResolvedValue({
      ok: true,
      data: [
        {
          tripId: 't1',
          folio: 'VJE-000001',
          departureDate: '2026-05-01',
          arrivalDate: null,
          clientName: 'Walmart',
          origin: 'A',
          destination: 'B',
          status: 'completed',
          totalExpenses: 100,
          truckEconomicNumber: 'TR-1',
          trailerEconomicNumber: 'RM-1',
          operatorName: 'Operador 1',
        },
      ],
    })

    const result = await GetFleetHistory(repo, 'truck', 'truck-1')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.data).toHaveLength(1)
  })

  it('retorna UNEXPECTED si el repo lanza', async () => {
    const repo: IBiRepository = {
      getGlobalKpis: vi.fn(),
      getCatalogs: vi.fn(),
      getFleetHistory: vi.fn(),
    }

    vi.mocked(repo.getFleetHistory).mockImplementation(async () => {
      throw new Error('boom')
    })

    const result = await GetFleetHistory(repo, 'truck', 'truck-1')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.code).toBe('UNEXPECTED')
  })
})

