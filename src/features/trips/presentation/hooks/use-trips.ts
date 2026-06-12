'use client'

import { useQuery } from '@tanstack/react-query'
import type { TripWithRelations } from '../../domain/entities/trip-entity'
import type { TripsListFilters } from '../../domain/repositories/i-trips-repository'
import { getTripsAction, getFuelLoadTripsRpcAction } from '../actions/trips.actions'

export const TRIPS_QUERY_KEYS = {
  list: (filters?: TripsListFilters) => ['trips', 'list', filters ?? {}] as const,
} as const

export function useTripsList(filters?: TripsListFilters, initialData?: TripWithRelations[]) {
  return useQuery({
    queryKey: TRIPS_QUERY_KEYS.list(filters),
    queryFn: async () => {
      const result = await getTripsAction(filters)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    initialData,
    staleTime: 1000 * 30,
  })
}

export const FUEL_LOAD_TRIPS_QUERY_KEYS = {
  listRpc: (from: Date, to: Date) => ['fuel-load-trips-rpc', from.toISOString(), to.toISOString()] as const,
} as const

export function useFuelLoadTripsRpc(from: Date, to: Date) {
  return useQuery({
    queryKey: FUEL_LOAD_TRIPS_QUERY_KEYS.listRpc(from, to),
    queryFn: async () => {
      const result = await getFuelLoadTripsRpcAction(from, to)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
