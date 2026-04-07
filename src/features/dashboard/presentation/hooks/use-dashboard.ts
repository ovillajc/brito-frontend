/**
 * @fileoverview Hook para orquestar la obtención de datos del Dashboard.
 * Sigue las reglas de AGENTS.md (TanStack Query + Use Cases).
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { GetOperativeKPIsUseCase } from '../../application/GetOperativeKPIsUseCase'
import { GetFinancialKPIsUseCase } from '../../application/GetFinancialKPIsUseCase'
import { MockDashboardRepository } from '../../infrastructure/repositories/MockDashboardRepository'

// Repositorio Mock (en el futuro se inyectará el de Supabase)
const dashboardRepo = new MockDashboardRepository()

/**
 * Hook para obtener métricas operativas.
 */
export function useOperativeKPIs() {
  return useQuery({
    queryKey: ['dashboard', 'operative'],
    queryFn: async () => {
      const result = await GetOperativeKPIsUseCase(dashboardRepo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

/**
 * Hook para obtener métricas financieras.
 */
export function useFinancialKPIs() {
  return useQuery({
    queryKey: ['dashboard', 'financial'],
    queryFn: async () => {
      const result = await GetFinancialKPIsUseCase(dashboardRepo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
