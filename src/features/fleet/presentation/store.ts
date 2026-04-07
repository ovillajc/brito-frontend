/**
 * @fileoverview Store de Zustand para el módulo de Flotilla.
 * Gestiona el estado de listados, filtros y estados de carga.
 */

import { create } from 'zustand'
import type { 
  TractorEntity, 
  TrailerEntity, 
  OperatorEntity, 
  UnitAssemblyEntity,
  ClientEntity
} from '../domain/entities'

interface FleetState {
  // Listados
  tractors: TractorEntity[]
  trailers: TrailerEntity[]
  operators: OperatorEntity[]
  clients: ClientEntity[]
  assemblies: UnitAssemblyEntity[]
  
  // Selección para Armado (Wizard)
  selectedTractor: TractorEntity | null
  selectedTrailer: TrailerEntity | null
  selectedOperator: OperatorEntity | null
  selectedClient: ClientEntity | null

  // Estados de carga
  isLoading: boolean
  error: string | null

  // Acciones
  setTractors: (tractors: TractorEntity[]) => void
  setTrailers: (trailers: TrailerEntity[]) => void
  setOperators: (operators: OperatorEntity[]) => void
  setClients: (clients: ClientEntity[]) => void
  setAssemblies: (assemblies: UnitAssemblyEntity[]) => void
  
  setSelectedTractor: (tractor: TractorEntity | null) => void
  setSelectedTrailer: (trailer: TrailerEntity | null) => void
  setSelectedOperator: (operator: OperatorEntity | null) => void
  setSelectedClient: (client: ClientEntity | null) => void
  resetSelection: () => void

  setIsLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
}

/**
 * Store global para el feature de Flotilla.
 */
export const useFleetStore = create<FleetState>((set) => ({
  tractors: [],
  trailers: [],
  operators: [],
  clients: [],
  assemblies: [],
  
  selectedTractor: null,
  selectedTrailer: null,
  selectedOperator: null,
  selectedClient: null,

  isLoading: false,
  error: null,

  setTractors: (tractors) => set({ tractors }),
  setTrailers: (trailers) => set({ trailers }),
  setOperators: (operators) => set({ operators }),
  setClients: (clients) => set({ clients }),
  setAssemblies: (assemblies) => set({ assemblies }),

  setSelectedTractor: (tractor) => set({ selectedTractor: tractor }),
  setSelectedTrailer: (trailer) => set({ selectedTrailer: trailer }),
  setSelectedOperator: (operator) => set({ selectedOperator: operator }),
  setSelectedClient: (client) => set({ selectedClient: client }),
  resetSelection: () => set({ 
    selectedTractor: null, 
    selectedTrailer: null, 
    selectedOperator: null, 
    selectedClient: null 
  }),

  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))
