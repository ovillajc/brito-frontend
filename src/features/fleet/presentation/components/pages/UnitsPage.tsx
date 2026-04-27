/**
 * @fileoverview Página de Unidades Armadas.
 * Usa CrudDataTable<UnitAssemblyEntity> con el patrón genérico CRUD.
 */

'use client'

import React, { useState } from 'react'
import { Layers } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useUnitAssemblies } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'
import { deleteUnitAssemblyAction } from '@/src/features/fleet/presentation/actions/unit-assembly.actions'
import { CrudDataTable, CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { UnitAssemblyWizard } from '@/src/features/fleet/presentation/components/organisms/UnitAssemblyWizard'
import { UnitAssemblyDetailsDialog } from '@/src/features/fleet/presentation/components/organisms/UnitAssemblyDetailsDialog'

/** Definición de columnas de la tabla de Unidades. */
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

export default function UnitsPage() {
  const { data: assemblies, isLoading } = useUnitAssemblies()
  const queryClient = useQueryClient()

  const [isWizardOpen, setIsWizardOpen] = useState(false)
  const [selectedAssembly, setSelectedAssembly] = useState<UnitAssemblyEntity | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [detailAssembly, setDetailAssembly] = useState<UnitAssemblyEntity | null>(null)

  const handleView = (assembly: UnitAssemblyEntity) => {
    setDetailAssembly(assembly)
    setIsDetailsOpen(true)
  }

  const handleEdit = (assembly: UnitAssemblyEntity) => {
    setSelectedAssembly(assembly)
    setIsWizardOpen(true)
  }

  const handleCloseWizard = () => {
    setIsWizardOpen(false)
    setSelectedAssembly(null)
  }

  const handleDelete = async (id: string) => {
    const result = await deleteUnitAssemblyAction(id)
    if (result.ok) {
      queryClient.invalidateQueries({ queryKey: ['fleet', 'assemblies'] })
    }
    return result
  }

  return (
    <div className="flex flex-col gap-6">
      <CrudDataTable<UnitAssemblyEntity>
        data={assemblies}
        isLoading={isLoading}
        columns={UNIT_COLUMNS}
        searchPlaceholder="Buscar por nombre, económico u operador..."
        searchFilter={(u, term) =>
          [u.name, u.economicNumber, u.employeeName, u.truckEconomicNumber]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Armar Unidad"
        onAction={() => setIsWizardOpen(true)}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        emptyState={{
          icon: Layers,
          title: 'No hay unidades armadas',
          description: 'Comienza vinculando un operador, tracto y remolque para crear una unidad operativa.',
        }}
      />

      <UnitAssemblyWizard
        isOpen={isWizardOpen}
        onClose={handleCloseWizard}
        assembly={selectedAssembly ?? undefined}
      />

      <UnitAssemblyDetailsDialog
        isOpen={isDetailsOpen}
        onClose={() => { setIsDetailsOpen(false); setDetailAssembly(null) }}
        assembly={detailAssembly}
      />
    </div>
  )
}
