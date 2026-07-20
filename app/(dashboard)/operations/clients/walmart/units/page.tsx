'use client'

import React, { useState, useMemo } from 'react'
import { Truck } from 'lucide-react'
import { useUnitAssemblies } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { UnitAssemblyDetailsDialog } from '@/src/features/fleet/presentation/components/organisms/UnitAssemblyDetailsDialog'

const UNIT_COLUMNS: CrudColumn<UnitAssemblyEntity>[] = [
  {
    header: 'Nombre / Económico',
    cell: (u) => (
      <div className="flex flex-col">
        <span className="font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] dark:group-hover:text-primary-container transition-colors">
          {u.name}
        </span>
        <span className="text-[10px] text-stone-400 dark:text-zinc-500 uppercase tracking-wider font-semibold mt-0.5">
          {u.economicNumber}
        </span>
      </div>
    ),
  },
  {
    header: 'Operador',
    cell: (u) => (
      <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">
        {u.employeeName || <span className="text-stone-400 dark:text-zinc-600 italic text-xs">Sin asignar</span>}
      </span>
    ),
  },
  {
    header: 'Tracto',
    cell: (u) => (
      <span className="font-mono text-xs font-medium">{u.truckEconomicNumber || '---'}</span>
    ),
  },
  {
    header: 'Remolque(s)',
    cell: (u) => (
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-xs font-medium">{u.trailerEconomicNumber || '---'}</span>
        {u.trailer2EconomicNumber && (
          <span className="font-mono text-[10px] text-stone-500 dark:text-zinc-400 font-medium">
            + {u.trailer2EconomicNumber}
          </span>
        )}
      </div>
    ),
  },
  {
    header: 'Estado',
    cell: (u) =>
      u.isActive ? (
        <Badge className="bg-[#1a5c3a] text-white font-bold hover:bg-[#1a5c3a]/90">Activa</Badge>
      ) : (
        <Badge variant="secondary" className="bg-stone-200 dark:bg-zinc-800 text-stone-700 dark:text-zinc-400">Inactiva</Badge>
      ),
  },
]

export default function WalmartUnitsPage() {
  const { data: assemblies, isLoading } = useUnitAssemblies()
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailAssembly, setDetailAssembly] = useState<UnitAssemblyEntity | null>(null)

  const filteredAssemblies = useMemo(() => {
    if (!assemblies) return []
    return assemblies.filter((u) => u.clientName?.toLowerCase().includes('walmart'))
  }, [assemblies])

  const handleView = (assembly: UnitAssemblyEntity) => {
    setDetailAssembly(assembly)
    setIsDetailsOpen(true)
  }

  return (
    <div className="flex flex-col gap-6">
      <CrudDataTable<UnitAssemblyEntity>
        title={
          <div>
            <h2 className="text-lg font-semibold text-on-surface">Unidades asignadas</h2>
            <p className="text-sm text-on-surface-variant">Unidades actualmente operando para la cuenta Walmart.</p>
          </div>
        }
        data={filteredAssemblies}
        isLoading={isLoading}
        columns={UNIT_COLUMNS}
        searchPlaceholder="Buscar por nombre, económico u operador..."
        searchFilter={(u, term) =>
          [u.name, u.economicNumber, u.employeeName, u.truckEconomicNumber]
            .some((val) => val?.toLowerCase().includes(term))
        }
        onView={handleView}
        emptyState={{
          icon: Truck,
          title: 'Sin unidades',
          description: 'No hay unidades asignadas a esta cuenta.',
        }}
      />

      <UnitAssemblyDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false)
          setDetailAssembly(null)
        }}
        assembly={detailAssembly}
      />
    </div>
  )
}
