import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PoolAssignmentMatrix } from '@/src/features/fleet/presentation/components/organisms/PoolAssignmentMatrix'

const createPoolMutateAsync = vi.fn()

vi.mock('@/src/features/fleet/presentation/hooks/use-fleet', () => ({
  useClients: () => ({
    data: [
      { id: 'client-1', tradeName: 'Walmart', companyName: null },
    ],
    isLoading: false,
  }),
}))

vi.mock('@/src/features/fleet/presentation/hooks/use-pools', () => ({
  useClientPools: () => ({ data: [], isLoading: false }),
  useAvailableUnitsForClient: () => ({ data: [], isLoading: false }),
  usePoolMutations: () => ({
    createPool: { mutateAsync: createPoolMutateAsync, isPending: false },
    assignUnits: { mutateAsync: vi.fn(), isPending: false },
  }),
}))

describe('PoolAssignmentMatrix', () => {
  beforeEach(() => {
    createPoolMutateAsync.mockReset()
    createPoolMutateAsync.mockResolvedValue({
      ok: true,
      data: {
        id: 'pool-1',
        name: 'Pool Walmart MTY',
        clientId: 'client-1',
        description: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    })
  })

  it('allows creating a pool for selected client', async () => {
    render(<PoolAssignmentMatrix />)

    fireEvent.click(screen.getByRole('button', { name: 'Walmart' }))
    fireEvent.click(screen.getByRole('button', { name: 'Crear pool' }))

    expect(screen.getByText('Crear Pool')).toBeInTheDocument()

    fireEvent.change(screen.getByLabelText('Nombre del Pool'), { target: { value: 'Pool Walmart MTY' } })
    fireEvent.click(screen.getByRole('button', { name: 'Finalizar' }))

    await waitFor(() => {
      expect(createPoolMutateAsync).toHaveBeenCalledTimes(1)
    })

    expect(createPoolMutateAsync).toHaveBeenCalledWith({
      name: 'Pool Walmart MTY',
      description: null,
      clientId: 'client-1',
    })
  })
})

