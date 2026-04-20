/**
 * @fileoverview Hook para orquestar los datos de Flotilla.
 * Integra TanStack Query con los casos de uso.
 */

'use client'

import { useQuery } from '@tanstack/react-query'
import { MockFleetRepository } from '../../infrastructure/repositories/MockFleetRepository'
import { GetFleetSummaryUseCase } from '../../application/use-cases/GetFleetSummaryUseCase'
import { getTrucksActions } from '../actions/truck.actions'
import { TruckEntity, TrailerEntity, TrailerModelEntity, UnitAssemblyEntity, ClientEntity } from '../../domain/entities'
import { getTrailersAction, getTrailerModelsAction } from '../actions/trailer.actions'
import { getUnitAssembliesAction, getUnitAssemblyLogsAction } from '../actions/unit-assembly.actions'
import { getClientsAction } from '../actions/client.actions'

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
      const result = await getTrucksActions()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as TruckEntity[]
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
      const result = await getTrailersAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as TrailerEntity[]
    },
  })
}

/**
 * Hook para obtener la lista de modelos de remolques.
 */
export function useTrailerModels() {
  return useQuery({
    queryKey: ['fleet', 'trailer-models'],
    queryFn: async () => {
      const result = await getTrailerModelsAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as TrailerModelEntity[]
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
      const result = await getClientsAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as ClientEntity[]
    },
  })
}

/**
 * Hook para obtener las unidades armadas activas desde Supabase.
 */
export function useUnitAssemblies() {
  return useQuery({
    queryKey: ['fleet', 'assemblies'],
    queryFn: async () => {
      const result = await getUnitAssembliesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as UnitAssemblyEntity[]
    },
  })
}

export function useUnitAssemblyLogs(unitId?: string) {
  return useQuery({
    queryKey: ['unit-assembly-logs', unitId],
    queryFn: async () => {
      if (!unitId) return []
      const result = await getUnitAssemblyLogsAction(unitId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    enabled: !!unitId,
  })
}

/** @deprecated Usar useUnitAssemblies */
export const useActiveAssemblies = useUnitAssemblies
