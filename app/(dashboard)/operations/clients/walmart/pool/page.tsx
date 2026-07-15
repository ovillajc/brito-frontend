'use client'

import React, { useState } from 'react'
import { Package } from 'lucide-react'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'

interface PoolRecord {
  id: string
  period: string
  targetTrips: number
  actualTrips: number
  completion: string
}

const mockPoolData: PoolRecord[] = [
  { id: '1', period: 'Julio 2026', targetTrips: 150, actualTrips: 120, completion: '80%' },
  { id: '2', period: 'Junio 2026', targetTrips: 145, actualTrips: 148, completion: '102%' },
]

export default function PoolPage() {
  const [data] = useState<PoolRecord[]>(mockPoolData)
  
  const columns: CrudColumn<PoolRecord>[] = [
    {
      header: 'Periodo',
      cell: (item) => <span className="font-medium text-stone-900 dark:text-zinc-100">{item.period}</span>,
      accessor: (item) => item.period
    },
    {
      header: 'Viajes Meta',
      cell: (item) => item.targetTrips,
      accessor: (item) => item.targetTrips
    },
    {
      header: 'Viajes Realizados',
      cell: (item) => item.actualTrips,
      accessor: (item) => item.actualTrips
    },
    {
      header: 'Porcentaje de Cumplimiento',
      cell: (item) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">
          {item.completion}
        </span>
      ),
      accessor: (item) => item.completion
    }
  ]

  return (
    <CrudDataTable
      title={
        <div>
          <h2 className="text-lg font-semibold text-on-surface">Pool del mes</h2>
          <p className="text-sm text-on-surface-variant">Seguimiento de la bolsa o pool de viajes del mes.</p>
        </div>
      }
      data={data}
      isLoading={false}
      columns={columns}
      searchPlaceholder="Buscar periodo..."
      searchFilter={(item, term) => 
        item.period.toLowerCase().includes(term)
      }
      emptyState={{
        icon: Package,
        title: 'Sin datos de pool',
        description: 'No hay registros de bolsa de viajes para esta cuenta.'
      }}
    />
  )
}
