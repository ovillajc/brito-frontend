/**
 * @fileoverview Hook para orquestar los datos de Flotilla.
 * Integra TanStack Query con los casos de uso.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { MockFleetRepository } from '../../infrastructure/repositories/MockFleetRepository'
import { GetFleetSummaryUseCase } from '../../application/use-cases/GetFleetSummaryUseCase'

const fleetRepo = new MockFleetRepository()

/**
 * Hook para obtener el resumen general de flotilla.
 */
export function useFleetSummary() {
  return useQuery({
    queryKey: ['fleet', 'summary'],
    queryFn: async () => {
      const result = await GetFleetSummaryUseCase(fleetRepo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook para obtener la lista de tractocamiones.
 */
export function useTractors() {
  return useQuery({
    queryKey: ['fleet', 'tractors'],
    queryFn: async () => {
      const result = await fleetRepo.getTractors()
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

/**
 * Hook para obtener la lista de remolques.
 */
export function useTrailers() {
  return useQuery({
    queryKey: ['fleet', 'trailers'],
    queryFn: async () => {
      const result = await fleetRepo.getTrailers()
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

/**
 * Hook para obtener la lista de operadores.
 */
export function useOperators() {
  return useQuery({
    queryKey: ['fleet', 'operators'],
    queryFn: async () => {
      const result = await fleetRepo.getOperators()
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

/**
 * Hook para obtener la lista de clientes.
 */
export function useClients() {
  return useQuery({
    queryKey: ['fleet', 'clients'],
    queryFn: async () => {
      const result = await fleetRepo.getClients()
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}

/**
 * Hook para obtener las unidades armadas activas.
 */
export function useActiveAssemblies() {
  return useQuery({
    queryKey: ['fleet', 'assemblies'],
    queryFn: async () => {
      const result = await fleetRepo.getActiveAssemblies()
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
  })
}
