'use client'

import { useCallback, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { FleetElementType, OperativeHistoryItem } from '../../domain/entities/bi-entity'
import { fetchFleetHistoryAction } from '../actions/bi.actions'

interface UseFleetHistoryReturn {
  history: OperativeHistoryItem[]
  isLoading: boolean
  error: Error | null
  selectedId: string | null
  selectedType: FleetElementType | null
  fetch: (type: FleetElementType, id: string) => void
  clear: () => void
}

/**
 * Hook para buscar y exponer el historial operativo de un elemento de flota.
 */
export function useFleetHistory(): UseFleetHistoryReturn {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<FleetElementType | null>(null)

  const query = useQuery({
    queryKey: ['bi', 'fleet-history', selectedType, selectedId],
    queryFn: async () => {
      if (!selectedType || !selectedId) return []
      const result = await fetchFleetHistoryAction(selectedType, selectedId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    enabled: !!selectedType && !!selectedId,
    staleTime: 1000 * 30,
  })

  const fetch = useCallback((type: FleetElementType, id: string) => {
    setSelectedId(id)
    setSelectedType(type)
  }, [])

  const clear = useCallback(() => {
    setSelectedId(null)
    setSelectedType(null)
  }, [])

  return {
    history: query.data ?? [],
    isLoading: query.isLoading,
    error: query.isError ? (query.error as Error) : null,
    selectedId,
    selectedType,
    fetch,
    clear,
  }
}
