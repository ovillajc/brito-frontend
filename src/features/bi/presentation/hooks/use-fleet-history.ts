'use client'

/**
 * @fileoverview Hook que gestiona el estado del historial operativo de flota.
 * Delega fetching a Server Actions usando useTransition.
 */

import { useState, useTransition, useCallback } from 'react'
import type { OperativeHistoryItem, FleetElementType } from '../../domain/entities/bi-entity'
import {
  fetchTruckHistoryAction,
  fetchTrailerHistoryAction,
  fetchOperatorHistoryAction,
  fetchAssemblyHistoryAction,
} from '../actions/bi.actions'

interface UseFleetHistoryReturn {
  history: OperativeHistoryItem[]
  isLoading: boolean
  selectedId: string | null
  selectedType: FleetElementType | null
  fetch: (type: FleetElementType, id: string) => void
  clear: () => void
}

/**
 * Hook para buscar y exponer el historial operativo de un elemento de flota.
 */
export function useFleetHistory(): UseFleetHistoryReturn {
  const [history, setHistory] = useState<OperativeHistoryItem[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<FleetElementType | null>(null)
  const [isPending, startTransition] = useTransition()

  const fetch = useCallback((type: FleetElementType, id: string) => {
    setSelectedId(id)
    setSelectedType(type)
    startTransition(async () => {
      let result: OperativeHistoryItem[] = []
      if (type === 'truck') result = await fetchTruckHistoryAction(id)
      else if (type === 'trailer') result = await fetchTrailerHistoryAction(id)
      else if (type === 'operator') result = await fetchOperatorHistoryAction(id)
      else if (type === 'assembly') result = await fetchAssemblyHistoryAction(id)
      setHistory(result)
    })
  }, [])

  const clear = useCallback(() => {
    setHistory([])
    setSelectedId(null)
    setSelectedType(null)
  }, [])

  return { history, isLoading: isPending, selectedId, selectedType, fetch, clear }
}
