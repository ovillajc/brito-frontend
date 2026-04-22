'use client'

import { useQuery } from '@tanstack/react-query'
import type { TripEntity, TripsSummary } from '../../domain/entities/trip-entity'

const MOCK_TRIPS: TripEntity[] = [
  {
    id: 'TRP-001',
    origin: 'Monterrey, NL',
    destination: 'Nuevo Laredo, Tamps',
    status: 'in-progress',
    scheduledDate: new Date().toISOString(),
    clientName: 'Logística del Norte',
    unitId: 'UNIT-005',
    operatorName: 'Juan Pérez',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TRP-002',
    origin: 'Querétaro, Qro',
    destination: 'Ciudad de México, CDMX',
    status: 'pending',
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    clientName: 'Transportes Centro',
    createdAt: new Date().toISOString()
  },
  {
    id: 'TRP-003',
    origin: 'Guadalajara, Jal',
    destination: 'Silao, Gto',
    status: 'completed',
    scheduledDate: new Date(Date.now() - 86400000).toISOString(),
    clientName: 'Industrias Occidente',
    unitId: 'UNIT-012',
    operatorName: 'Carlos Ruiz',
    createdAt: new Date(Date.now() - 172800000).toISOString()
  }
];

export function useTripsList() {
  return useQuery({
    queryKey: ['trips', 'list'],
    queryFn: async (): Promise<TripEntity[]> => {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 800));
      return MOCK_TRIPS;
    }
  })
}

export function useTripsSummary() {
  return useQuery({
    queryKey: ['trips', 'summary'],
    queryFn: async (): Promise<TripsSummary> => {
      await new Promise(resolve => setTimeout(resolve, 800));
      return {
        totalTrips: 156,
        activeTrips: 12,
        completedTrips: 140,
        cancelledTrips: 4
      }
    }
  })
}
