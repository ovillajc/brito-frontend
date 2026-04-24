import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import TrailersPage from '@/src/features/fleet/presentation/components/pages/TrailersPage'
import { useTrailers } from '@/src/features/fleet/presentation/hooks/use-fleet'
import type { TrailerEntity } from '@/src/features/fleet/domain/entities'

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useTrailers: vi.fn(),
}))

vi.mock('@/src/features/fleet/presentation/components/organisms/TrailerWizard', () => ({
  TrailerWizard: () => <div data-testid="mock-trailer-wizard" />,
}))

vi.mock('@/src/features/fleet/presentation/components/organisms/TrailerDetailsDialog', () => ({
  TrailerDetailsDialog: () => <div data-testid="mock-trailer-details" />,
}))

function renderWithQueryClient(ui: React.ReactElement) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>)
}

describe('TrailersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useTrailers).mockReturnValue({ data: undefined, isLoading: true } as unknown as ReturnType<typeof useTrailers>)
    
    const { container } = renderWithQueryClient(<TrailersPage />)
    
    expect(screen.getByPlaceholderText('Buscar por económico, placas, VIN o modelo...')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Remolque')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders table data when loaded', () => {
    const data: TrailerEntity[] = [
      {
        id: 'trl-1',
        economicNumber: 'CAJA-01',
        status: 'available',
        createdAt: new Date(),
        updatedAt: new Date(),
        plates: '77-BB-77',
        serialNumber: 'VIN-1',
        trailerModelName: 'Caja Seca',
      },
    ]

    vi.mocked(useTrailers).mockReturnValue({
      data,
      isLoading: false
    } as unknown as ReturnType<typeof useTrailers>)

    renderWithQueryClient(<TrailersPage />)
    
    expect(screen.getByText('Caja Seca')).toBeInTheDocument()
    expect(screen.getByText('CAJA-01')).toBeInTheDocument()
    expect(screen.getByText('77-BB-77')).toBeInTheDocument()
  })
})
