import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GetOperativeKPIsUseCase } from '@/src/features/dashboard/application/GetOperativeKPIsUseCase'
import { IDashboardRepository } from '@/src/features/dashboard/domain/repositories/dashboard-repository'
import type { KPIEntity } from '@/src/features/dashboard/domain/entities/kpi-entity'

describe('GetOperativeKPIsUseCase', () => {
  let mockRepo: IDashboardRepository

  beforeEach(() => {
    mockRepo = {
      getOperativeMetrics: vi.fn(),
      getFinancialMetrics: vi.fn(),
    }
  })

  it('debe retornar exitosamente cuando el repositorio devuelve datos', async () => {
    const mockData: KPIEntity[] = [
      { id: '1', title: 'Test KPI', value: 100, category: 'operative' },
    ]
    vi.mocked(mockRepo.getOperativeMetrics).mockResolvedValue({
      ok: true,
      data: mockData,
    })

    const result = await GetOperativeKPIsUseCase(mockRepo)

    expect(result.ok).toBe(true)
    if (result.ok) {
      expect(result.data).toEqual(mockData)
    }
  })

  it('debe retornar falla cuando el repositorio falla', async () => {
    const mockFailure = { code: 'SERVER_ERROR', message: 'Error de servidor' }
    vi.mocked(mockRepo.getOperativeMetrics).mockResolvedValue({
      ok: false,
      error: mockFailure,
    })

    const result = await GetOperativeKPIsUseCase(mockRepo)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error).toEqual(mockFailure)
    }
  })

  it('debe retornar UNEXPECTED_ERROR cuando el repositorio lanza una excepción', async () => {
    vi.mocked(mockRepo.getOperativeMetrics).mockRejectedValue(new Error('Network failure'))

    const result = await GetOperativeKPIsUseCase(mockRepo)

    expect(result.ok).toBe(false)
    if (!result.ok) {
      expect(result.error.code).toBe('UNEXPECTED_ERROR')
    }
  })
})
