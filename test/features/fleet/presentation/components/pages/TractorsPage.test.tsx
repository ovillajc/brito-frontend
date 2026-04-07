import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import TractorsPage from '@/src/features/fleet/presentation/components/pages/TractorsPage'
import { useTractors } from '@/src/features/fleet/presentation/hooks/use-fleet'

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useTractors: vi.fn(),
}))

describe('TractorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useTractors).mockReturnValue({ data: undefined, isLoading: true } as any)
    
    const { container } = render(<TractorsPage />)
    
    expect(screen.getByPlaceholderText('Buscar por placa o VIN...')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Tracto')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders table data when loaded', () => {
    vi.mocked(useTractors).mockReturnValue({
      data: [
        {
          id: 'tr-1',
          brand: 'Kenworth',
          model: 'T680',
          year: 2023,
          plates: '99-AA-99',
          vin: '1VWxxxxxxxxx',
          status: 'available'
        }
      ],
      isLoading: false
    } as any)

    render(<TractorsPage />)
    
    expect(screen.getByText('Kenworth T680')).toBeInTheDocument()
    expect(screen.getByText('99-AA-99')).toBeInTheDocument()
    expect(screen.getByText('1VWxxxxxxxxx')).toBeInTheDocument()
  })
})
