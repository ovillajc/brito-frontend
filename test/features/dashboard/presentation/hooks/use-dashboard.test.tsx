import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useOperativeKPIs, useFinancialKPIs } from '@/src/features/dashboard/presentation/hooks/use-dashboard'
import { GetOperativeKPIsUseCase } from '@/src/features/dashboard/application/GetOperativeKPIsUseCase'
import { GetFinancialKPIsUseCase } from '@/src/features/dashboard/application/GetFinancialKPIsUseCase'
import React from 'react'

// Mocks de los casos de uso
vi.mock('@/src/features/dashboard/application/GetOperativeKPIsUseCase', () => ({
  GetOperativeKPIsUseCase: vi.fn(),
}))

vi.mock('@/src/features/dashboard/application/GetFinancialKPIsUseCase', () => ({
  GetFinancialKPIsUseCase: vi.fn(),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  function QueryWrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  }
  QueryWrapper.displayName = 'QueryWrapper'
  return QueryWrapper
}

describe('Dashboard Hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useOperativeKPIs', () => {
    it('debe retornar datos exitosamente', async () => {
      const mockData = [{ id: '1', title: 'Test', value: 10, category: 'operative' as const }]
      vi.mocked(GetOperativeKPIsUseCase).mockResolvedValue({
        ok: true,
        data: mockData,
      })

      const { result } = renderHook(() => useOperativeKPIs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockData)
    })

    it('debe manejar errores', async () => {
      vi.mocked(GetOperativeKPIsUseCase).mockResolvedValue({
        ok: false,
        error: { code: 'ERROR', message: 'Falla total' },
      })

      const { result } = renderHook(() => useOperativeKPIs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
      expect(result.current.error?.message).toBe('Falla total')
    })
  })

  describe('useFinancialKPIs', () => {
    it('debe retornar datos exitosamente', async () => {
      const mockData = [{ id: '2', title: 'Money', value: 1000, category: 'financial' as const }]
      vi.mocked(GetFinancialKPIsUseCase).mockResolvedValue({
        ok: true,
        data: mockData,
      })

      const { result } = renderHook(() => useFinancialKPIs(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockData)
    })
  })
})
