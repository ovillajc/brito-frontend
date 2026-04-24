import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import UnitsPage from '@/src/features/fleet/presentation/components/pages/UnitsPage'
import { useUnitAssemblies } from '@/src/features/fleet/presentation/hooks/use-fleet'
import type { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useUnitAssemblies: vi.fn(),
}))

vi.mock('@/src/features/fleet/presentation/components/organisms/UnitAssemblyWizard', () => ({
  UnitAssemblyWizard: () => <div data-testid="mock-unit-wizard" />,
}))

vi.mock('@/src/features/fleet/presentation/components/organisms/UnitAssemblyDetailsDialog', () => ({
  UnitAssemblyDetailsDialog: () => <div data-testid="mock-unit-details" />,
}))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('UnitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeletons correctly', () => {
    vi.mocked(useUnitAssemblies).mockReturnValue({ data: undefined, isLoading: true } as unknown as ReturnType<typeof useUnitAssemblies>)
    
    const { container } = renderWithQueryClient(<UnitsPage />)
    
    expect(screen.getByPlaceholderText('Buscar por nombre, económico u operador...')).toBeInTheDocument()
    expect(screen.getByText('Armar Unidad')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders empty state correctly', () => {
    vi.mocked(useUnitAssemblies).mockReturnValue({ data: [], isLoading: false } as unknown as ReturnType<typeof useUnitAssemblies>)
    
    renderWithQueryClient(<UnitsPage />)
    
    expect(screen.getByText('No hay unidades armadas')).toBeInTheDocument()
  })

  it('renders unit cards when data exists', () => {
    const data: UnitAssemblyEntity[] = [
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
        employeeName: 'Carlos Gómez',
        truckEconomicNumber: 'TR-001',
        trailerEconomicNumber: 'CAJA-01',
      },
    ]

    vi.mocked(useUnitAssemblies).mockReturnValue({ data, isLoading: false } as unknown as ReturnType<typeof useUnitAssemblies>)

    renderWithQueryClient(<UnitsPage />)
    
    expect(screen.getByText('Carlos Gómez')).toBeInTheDocument()
    expect(screen.getByText('ECO-105')).toBeInTheDocument()
  })
})
