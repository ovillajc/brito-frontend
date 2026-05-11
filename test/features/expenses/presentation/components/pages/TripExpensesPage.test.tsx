import React from 'react'
import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import type { TripWithRelations } from '@/src/features/trips/domain/entities/trip-entity'
import { useTripsList } from '@/src/features/trips/presentation/hooks/use-trips'
import TripExpensesPage from '@/src/features/expenses/presentation/components/pages/TripExpensesPage'

vi.mock('@/src/features/trips/presentation/hooks/use-trips', () => ({
  useTripsList: vi.fn(),
}))

vi.mock('@/src/features/expenses/presentation/components/organisms/ExpensesTable', () => ({
  ExpensesTable: ({ tripIdFilter }: { tripIdFilter?: string }) => (
    <div data-testid="expenses-table">{tripIdFilter ?? ''}</div>
  ),
}))

describe('TripExpensesPage', () => {
  it('muestra placeholder cuando no hay viaje seleccionado y renderiza tabla de gastos al seleccionar un viaje', () => {
    const trip: TripWithRelations = {
      trip: {
        id: '00000000-0000-0000-0000-000000000111',
        folio: null,
        tripNumber: 1,
        clientId: null,
        companyProfileId: null,
        unitAssemblyId: null,
        origin: 'Villahermosa',
        destination: 'Coatzacoalcos',
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
      unitEconomicNumber: null,
      operatorName: null,
      isFullAssembly: false,
      walmartData: null,
    }

    vi.mocked(useTripsList).mockReturnValue({
      data: [trip],
      isLoading: false,
    } as unknown as ReturnType<typeof useTripsList>)

    render(<TripExpensesPage />)

    expect(screen.getByText('Selecciona un viaje')).toBeInTheDocument()

    const folio = screen.getByText('VJE-000001')
    fireEvent.click(folio)

    expect(screen.getByTestId('expenses-table')).toHaveTextContent('00000000-0000-0000-0000-000000000111')
  })
})
