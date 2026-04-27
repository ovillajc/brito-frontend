'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { 
  getClientPoolsAction, 
  createClientPoolAction, 
  updateClientPoolAction,
  assignUnitsToPoolAction,
  getAvailableUnitsForClientAction
} from '../actions/pool.actions'
import { ClientPoolEntity } from '../../domain/entities'
import { toast } from 'sonner'

export function useClientPools(clientId?: string) {
  return useQuery({
    queryKey: ['fleet', 'pools', clientId],
    queryFn: async () => {
      const result = await getClientPoolsAction(clientId)
      if (!result.ok) {
        throw new Error(result.error?.message || 'Error al obtener pools')
      }
      return result.data
    }
  })
}

export function useAvailableUnitsForClient(clientId?: string) {
  return useQuery({
    queryKey: ['fleet', 'available-units', clientId],
    queryFn: async () => {
      if (!clientId) return []
      const result = await getAvailableUnitsForClientAction(clientId)
      if (!result.ok) {
        throw new Error(result.error?.message || 'Error al obtener unidades disponibles')
      }
      return result.data
    },
    enabled: !!clientId
  })
}

export function usePoolMutations() {
  const queryClient = useQueryClient()

  const createPool = useMutation({
    mutationFn: (pool: Partial<ClientPoolEntity>) => createClientPoolAction(pool),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['fleet', 'pools'] })
        toast.success('Pool creado correctamente')
      }
    }
  })

  const assignUnits = useMutation({
    mutationFn: ({ poolId, unitIds }: { poolId: string, unitIds: string[] }) => 
      assignUnitsToPoolAction(poolId, unitIds),
    onSuccess: (result) => {
      if (result.ok) {
        queryClient.invalidateQueries({ queryKey: ['fleet', 'pools'] })
        queryClient.invalidateQueries({ queryKey: ['fleet', 'available-units'] })
        toast.success('Unidades asignadas correctamente')
      }
    }
  })

  return { createPool, assignUnits }
}
