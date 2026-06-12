import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { expect, test } from 'vitest'
import { CrudDataTable } from '@/src/core/presentation/components/organisms/CrudDataTable'

type Row = {
  id: string
  name: string
  status: 'Activo' | 'Inactivo'
  type: 'Interno' | 'Externo'
}

const EmptyIcon: React.FC<{ className?: string }> = () => null

test('CrudDataTable permite filtrar por columnas desde el botón de filtros', () => {
  const rows: Row[] = [
    { id: '1', name: 'Ana', status: 'Activo', type: 'Interno' },
    { id: '2', name: 'Pedro', status: 'Inactivo', type: 'Externo' },
  ]

  render(
    <CrudDataTable<Row>
      data={rows}
      isLoading={false}
      columns={[
        {
          id: 'name',
          header: 'Nombre',
          cell: (r) => r.name,
          accessor: (r) => r.name,
        },
        {
          id: 'status',
          header: 'Estado',
          cell: (r) => r.status,
          accessor: (r) => r.status,
          filter: {
            type: 'select',
            options: [
              { label: 'Activo', value: 'Activo' },
              { label: 'Inactivo', value: 'Inactivo' },
            ],
          },
        },
        {
          id: 'type',
          header: 'Tipo',
          cell: (r) => r.type,
          accessor: (r) => r.type,
        },
      ]}
      emptyState={{ icon: EmptyIcon, title: 'Vacío', description: 'Sin datos' }}
      pageSize={10}
    />
  )

  expect(screen.getByText('Ana')).toBeDefined()
  expect(screen.getByText('Pedro')).toBeDefined()

  fireEvent.click(screen.getByRole('button', { name: /filtros/i }))

  const statusFilter = screen.getByLabelText('Estado')
  fireEvent.change(statusFilter, { target: { value: 'Activo' } })

  expect(screen.getByText('Ana')).toBeDefined()
  expect(screen.queryByText('Pedro')).toBeNull()

  const typeFilter = screen.getByLabelText('Tipo')
  fireEvent.change(typeFilter, { target: { value: 'Interno' } })

  expect(screen.getByText('Ana')).toBeDefined()
  expect(screen.queryByText('Pedro')).toBeNull()

  fireEvent.click(screen.getByRole('button', { name: /limpiar/i }))
  expect(screen.getByText('Ana')).toBeDefined()
  expect(screen.getByText('Pedro')).toBeDefined()
})
