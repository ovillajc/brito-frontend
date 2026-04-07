import React from 'react'
import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import UnitsPage from '@/src/features/fleet/presentation/components/pages/UnitsPage'
import { useActiveAssemblies } from '@/src/features/fleet/presentation/hooks/use-fleet'

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useActiveAssemblies: vi.fn(),
}))

vi.mock('@/src/features/fleet/presentation/components/organisms/UnitAssemblyModal', () => ({
  UnitAssemblyModal: () => <div data-testid="mock-unit-modal" />
}))

describe('UnitsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders loading skeletons correctly', () => {
    vi.mocked(useActiveAssemblies).mockReturnValue({ data: undefined, isLoading: true } as any)
    
    const { container } = render(<UnitsPage />)
    
    expect(screen.getByText('Unidades Operativas')).toBeInTheDocument()
    expect(screen.getByText('Nuevo Armado')).toBeInTheDocument()
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
  })

  it('renders empty state correctly', () => {
    vi.mocked(useActiveAssemblies).mockReturnValue({ data: [], isLoading: false } as any)
    
    render(<UnitsPage />)
    
    expect(screen.getByText('No hay unidades armadas')).toBeInTheDocument()
    expect(screen.getByText('Armar Primera Unidad')).toBeInTheDocument()
  })

  it('renders unit cards when data exists', () => {
    vi.mocked(useActiveAssemblies).mockReturnValue({
      data: [
        {
          id: 'unit-1',
          tractor: { id: 't1', plates: '55-CD-55' },
          trailer: { id: 'tr1', type: 'Plataforma', economicNumber: 'PLAT-10' },
          operator: { id: 'op1', firstName: 'Carlos', lastName: 'Gómez' },
          clientName: 'Cliente Prueba',
          createdAt: new Date().toISOString()
        }
      ],
      isLoading: false
    } as any)

    render(<UnitsPage />)
    
    expect(screen.getByText('55-CD-55')).toBeInTheDocument()
    expect(screen.getByText('Plataforma')).toBeInTheDocument()
    expect(screen.getByText('Carlos Gómez')).toBeInTheDocument()
    expect(screen.getByText('Cliente Prueba')).toBeInTheDocument()
  })
})
