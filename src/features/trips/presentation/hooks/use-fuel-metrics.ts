'use client'

/**
 * @fileoverview Hook TanStack Query para métricas de combustible.
 * Conecta los componentes con las Server Actions de forma cacheada.
 *
 * Separación de responsabilidades:
 * - useFuelMetrics: lectura (GET) de métricas calculadas
 * - useSaveFuelMetrics: mutación del monitorista
 * - useRegisterFuelLoad: mutación del guardia
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import {
  getTripFuelMetricsAction,
  saveFuelMetricsAction,
  registerFuelLoadAction,
  saveWalmartTripDataAction,
  getWalmartStoresCatalogAction,
} from '../actions/fuel-metrics.actions'
import type { SaveFuelMetricsInput } from '../../application/SaveFuelMetrics'
import type { RegisterFuelLoadInput } from '../../application/RegisterFuelLoad'
import type { WalmartTripDataInput } from '../../domain/entities/walmart-trip-entity'

// ── Keys de caché ─────────────────────────────────────────────────────────────

export const FUEL_METRICS_QUERY_KEYS = {
  metrics: (tripId: string) => ['fuel-metrics', tripId] as const,
  stores: ['walmart-stores'] as const,
} as const

// ── Hooks de lectura ─────────────────────────────────────────────────────────

/**
 * Obtiene y cachea las métricas calculadas de combustible de un viaje.
 * Se usa en la vista de rendimientos (Monitorista / Admin).
 *
 * @param tripId - UUID del viaje
 * @param truckId - UUID del tracto (del unit_assembly activo)
 * @param trailerR1Id - UUID del remolque 1 (nullable)
 * @param trailerR2Id - UUID del remolque 2 (nullable)
 */
export function useFuelMetrics(
  tripId: string,
  truckId: string,
  trailerR1Id: string | null = null,
  trailerR2Id: string | null = null
) {
  return useQuery({
    queryKey: FUEL_METRICS_QUERY_KEYS.metrics(tripId),
    queryFn: async () => {
      const result = await getTripFuelMetricsAction(tripId, truckId, trailerR1Id, trailerR2Id)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    enabled: Boolean(tripId) && Boolean(truckId),
    staleTime: 1000 * 60 * 2, // 2 minutos
  })
}

/**
 * Obtiene el catálogo de tiendas Walmart activas para el selector DETTE.
 */
export function useWalmartStoresCatalog() {
  return useQuery({
    queryKey: FUEL_METRICS_QUERY_KEYS.stores,
    queryFn: async () => {
      const result = await getWalmartStoresCatalogAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (catálogo cambia poco)
  })
}

// ── Hooks de mutación ─────────────────────────────────────────────────────────

/**
 * Guarda los inputs de rendimiento del monitorista.
 * Invalida el caché de métricas del viaje al completar.
 */
export function useSaveFuelMetrics(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: SaveFuelMetricsInput) => saveFuelMetricsAction(tripId, data),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }
      toast.success('Métricas de combustible guardadas correctamente')
      queryClient.invalidateQueries({ queryKey: FUEL_METRICS_QUERY_KEYS.metrics(tripId) })
    },
    onError: () => {
      toast.error('Error inesperado al guardar las métricas')
    },
  })
}

/**
 * Registra una carga de diésel (acción del guardia).
 */
export function useRegisterFuelLoad() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RegisterFuelLoadInput) => registerFuelLoadAction(data),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }
      toast.success(`Carga registrada: ${result.data.litersEngine} L — Folio: ${result.data.ticketFolio}`)
      // Invalidar métricas del viaje relacionado
      if (result.data.tripId) {
        queryClient.invalidateQueries({ queryKey: FUEL_METRICS_QUERY_KEYS.metrics(result.data.tripId) })
      }
    },
    onError: () => {
      toast.error('Error inesperado al registrar la carga')
    },
  })
}

/**
 * Guarda los datos Walmart del coordinador para un viaje.
 */
export function useSaveWalmartTripData(tripId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: WalmartTripDataInput) => saveWalmartTripDataAction(data),
    onSuccess: (result) => {
      if (!result.ok) {
        toast.error(result.error.message)
        return
      }
      toast.success('Datos Walmart guardados correctamente')
      queryClient.invalidateQueries({ queryKey: FUEL_METRICS_QUERY_KEYS.metrics(tripId) })
    },
    onError: () => {
      toast.error('Error inesperado al guardar datos Walmart')
    },
  })
}
