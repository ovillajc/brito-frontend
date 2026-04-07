import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetFinancialKPIsUseCase } from '@/src/features/dashboard/application/GetFinancialKPIsUseCase'
import { IDashboardRepository } from '@/src/features/dashboard/domain/repositories/dashboard-repository'
import type { KPIEntity } from '@/src/features/dashboard/domain/entities/kpi-entity'

describe('GetFinancialKPIsUseCase', () => {
  let mockRepo: IDashboardRepository

  beforeEach(() => {
    mockRepo = {
      getOperativeMetrics: vi.fn(),
      getFinancialMetrics: vi.fn(),
    }
  })

  it('debe retornar exitosamente cuando el repositorio devuelve datos', async () => {
    const mockData: KPIEntity[] = [
      { id: '1', title: 'Revenue', value: 1000000, category: 'financial' },
    ]
    vi.mocked(mockRepo.getFinancialMetrics).mockResolvedValue({
      ok: true,
      data: mockData,
    })

    const result = await GetFinancialKPIsUseCase(mockRepo)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(mockData)
    }
  })

  it('debe retornar falla cuando el repositorio falla', async () => {
    const mockFailure = { code: 'API_ERROR', message: 'Error de API' }
    vi.mocked(mockRepo.getFinancialMetrics).mockResolvedValue({
      ok: false,
      error: mockFailure,
    })

    const result = await GetFinancialKPIsUseCase(mockRepo)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual(mockFailure)
    }
  })

  it('debe retornar UNEXPECTED_ERROR cuando el repositorio lanza una excepción', async () => {
    vi.mocked(mockRepo.getFinancialMetrics).mockRejectedValue(new Error('Panic'))

    const result = await GetFinancialKPIsUseCase(mockRepo)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('UNEXPECTED_ERROR')
    }
  })
})
