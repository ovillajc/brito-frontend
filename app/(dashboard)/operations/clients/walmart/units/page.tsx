'use client'

import React, { useState } from 'react'
import { Truck } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'

interface Unit {
  id: string
  economic: string
  plates: string
  type: string
  status: string
}

const mockUnits: Unit[] = [
  { id: '1', economic: 'T-101', plates: 'AB-123-C', type: 'Tractocamión', status: 'Operativo' },
  { id: '2', economic: 'T-102', plates: 'XY-987-Z', type: 'Tractocamión', status: 'En Taller' },
]

export default function UnitsPage() {
  const [data] = useState<Unit[]>(mockUnits)
  
  const columns: CrudColumn<Unit>[] = [
    {
      header: 'Económico',
      cell: (item) => <span className="font-medium text-stone-900 dark:text-zinc-100">{item.economic}</span>,
      accessor: (item) => item.economic
    },
    {
      header: 'Placas',
      cell: (item) => item.plates,
      accessor: (item) => item.plates
    },
    {
      header: 'Tipo',
      cell: (item) => item.type,
      accessor: (item) => item.type
    },
    {
      header: 'Estado',
      cell: (item) => (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          item.status === 'Operativo' 
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-rose-100 text-rose-800 dark:bg-rose-500/20 dark:text-rose-400'
        }`}>
          {item.status}
        </span>
      ),
      accessor: (item) => item.status
    }
  ]

  return (
    <CrudDataTable
      title={
        <div>
          <h2 className="text-lg font-semibold text-on-surface">Unidades asignadas</h2>
          <p className="text-sm text-on-surface-variant">Unidades actualmente operando para la cuenta Walmart.</p>
        </div>
      }
      data={data}
      isLoading={false}
      columns={columns}
      searchPlaceholder="Buscar unidad..."
      searchFilter={(item, term) => 
        item.economic.toLowerCase().includes(term) || 
        item.plates.toLowerCase().includes(term)
      }
      emptyState={{
        icon: Truck,
        title: 'Sin unidades',
        description: 'No hay unidades asignadas a esta cuenta.'
      }}
    />
  )
}
