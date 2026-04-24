import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TractorsPage from '@/src/features/fleet/presentation/components/pages/TrucksPage'
import { useTractors } from '@/src/features/fleet/presentation/hooks/use-fleet'
import type { TruckEntity } from '@/src/features/fleet/domain/entities'

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useTractors: vi.fn(),
}))

vi.mock('@/src/features/fleet/presentation/components/organisms/TruckWizard', () => ({
  TruckWizard: () => <div data-testid="mock-truck-wizard" />,
}))

vi.mock('@/src/features/fleet/presentation/components/organisms/TruckDetailsDialog', () => ({
  TruckDetailsDialog: () => <div data-testid="mock-truck-details" />,
}))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('TractorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useTractors).mockReturnValue({ data: undefined, isLoading: true } as unknown as ReturnType<typeof useTractors>)
    
    const { container } = renderWithQueryClient(<TractorsPage />)
    
    expect(screen.getByPlaceholderText('Buscar por marca, placa o N/S...')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Tracto')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders table data when loaded', () => {
    const data: TruckEntity[] = [
      {
        id: 'tr-1',
        economicNumber: 'ECO-01',
        brand: 'Kenworth',
        model: 'T680',
        year: 2023,
        plates: '99-AA-99',
        serialNumber: '1VWxxxxxxxxx',
        insurancePolicy: '',
        companyProfileId: 'cp-1',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]

    vi.mocked(useTractors).mockReturnValue({
      data: [
        ...data,
      ],
      isLoading: false
    } as unknown as ReturnType<typeof useTractors>)

    renderWithQueryClient(<TractorsPage />)
    
    expect(screen.getByText('Kenworth T680')).toBeInTheDocument()
    expect(screen.getByText('99-AA-99')).toBeInTheDocument()
    expect(screen.getByText('1VWxxxxxxxxx')).toBeInTheDocument()
  })
})
