import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TrailersPage from '@/src/features/fleet/presentation/components/pages/TrailersPage'
import { useTrailers } from '@/src/features/fleet/presentation/hooks/use-fleet'

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useTrailers: vi.fn(),
}))

describe('TrailersPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useTrailers).mockReturnValue({ data: undefined, isLoading: true } as any)
    
    const { container } = render(<TrailersPage />)
    
    expect(screen.getByPlaceholderText('Buscar por placa o número económico...')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Remolque')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders table data when loaded', () => {
    vi.mocked(useTrailers).mockReturnValue({
      data: [
        {
          id: 'trl-1',
          type: 'Caja Seca',
          brand: 'Utility',
          model: '53 pies',
          plates: '77-BB-77',
          economicNumber: 'CAJA-01',
          status: 'available'
        }
      ],
      isLoading: false
    } as any)

    render(<TrailersPage />)
    
    expect(screen.getByText('Caja Seca')).toBeInTheDocument()
    expect(screen.getByText('CAJA-01')).toBeInTheDocument()
    expect(screen.getByText('77-BB-77')).toBeInTheDocument()
  })
})
