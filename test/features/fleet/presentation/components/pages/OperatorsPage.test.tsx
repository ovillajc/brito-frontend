import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import OperatorsPage from '@/src/features/fleet/presentation/components/pages/OperatorsPage'
import { useOperators } from '@/src/features/fleet/presentation/hooks/use-fleet'

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useOperators: vi.fn(),
}))

describe('OperatorsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading state correctly', () => {
    vi.mocked(useOperators).mockReturnValue({ data: undefined, isLoading: true } as any)
    
    const { container } = render(<OperatorsPage />)
    
    expect(screen.getByPlaceholderText('Buscar por nombre o licencia...')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Operador')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders table data when loaded', () => {
    vi.mocked(useOperators).mockReturnValue({
      data: [
        {
          id: 'op-123',
          firstName: 'Juan',
          lastName: 'Pérez',
          licenseNumber: 'LIC-0001',
          licenseType: 'B',
          status: 'available'
        }
      ],
      isLoading: false
    } as any)

    render(<OperatorsPage />)
    
    expect(screen.getByText('Juan Pérez')).toBeInTheDocument()
    expect(screen.getByText('LIC-0001')).toBeInTheDocument()
    expect(screen.getByText('Clase B')).toBeInTheDocument()
    expect(screen.getByText('Disponible')).toBeInTheDocument()
  })
})
