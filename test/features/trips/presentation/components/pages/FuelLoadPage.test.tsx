import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FuelLoadPage from '@/src/features/trips/presentation/components/pages/FuelLoadPage'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import type { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'

vi.mock('@/src/features/trips/presentation/hooks/use-fuel-metrics', () => ({
  useFuelLoadHistory: () => ({ data: [], isLoading: false }),
  useRegisterFuelLoad: () => ({ isPending: false, mutateAsync: vi.fn() }),
}))

describe('FuelLoadPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('opens wizard when clicking "Registrar Carga"', () => {
    const trips: TripWithRelations[] = [
      {
        trip: {
          id: 'trip-1',
          folio: null,
          tripNumber: 12,
          clientId: null,
          companyProfileId: null,
          unitAssemblyId: 'unit-1',
          origin: 'Monterrey',
          destination: 'Apodaca',
          departureDate: null,
          arrivalDateActual: null,
          status: 'scheduled',
          monitoredBy: null,
          fuelLoadDate: null,
          tripNumberClient: null,
          lastScan: null,
          observations: null,
          clientSpecificData: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        clientName: 'Walmart',
        unitEconomicNumber: 'ECO-105',
        operatorName: 'Operador 1',
        isFullAssembly: false,
        walmartData: null,
      },
    ]

    const units: UnitAssemblyEntity[] = [
      {
        id: 'unit-1',
        name: 'Unidad 1',
        economicNumber: 'ECO-105',
        employeeId: 'emp-1',
        truckId: 'truck-1',
        trailerId: null,
        trailer2Id: null,
        clientId: null,
        clientPoolId: null,
        companyProfileId: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        employeeName: 'Operador 1',
        truckEconomicNumber: 'TR-001',
        trailerEconomicNumber: undefined,
      },
    ]

    render(<FuelLoadPage trips={trips} units={units} initialHistory={[]} />)

    fireEvent.click(screen.getByRole('button', { name: 'Registrar Carga' }))

    expect(screen.getByText('Registrar Carga de Diésel')).toBeInTheDocument()
    expect(screen.getByLabelText('Viaje')).toBeInTheDocument()
  })
})
