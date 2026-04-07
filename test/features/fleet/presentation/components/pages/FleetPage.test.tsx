import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import FleetPage from '@/src/features/fleet/presentation/components/pages/FleetPage'
import { useFleetSummary } from '@/src/features/fleet/presentation/hooks/use-fleet'

// Mock the dependencies
vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useFleetSummary: vi.fn(),
}))

describe('FleetPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeletons when isLoading is true', () => {
    vi.mocked(useFleetSummary).mockReturnValue({ data: undefined, isLoading: true } as any)
    
    const { container } = render(<FleetPage />)
    
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.getByText('Estado de la Flota')).toBeInTheDocument()
  })

  it('renders summary data when loaded', () => {
    vi.mocked(useFleetSummary).mockReturnValue({
      data: {
        tractorsCount: 15,
        trailersCount: 20,
        operatorsCount: 12,
        activeAssembliesCount: 10
      },
      isLoading: false
    } as any)

    render(<FleetPage />)

    expect(screen.getByText('15')).toBeInTheDocument()
    expect(screen.getByText('20')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('10')).toBeInTheDocument()
  })
})
