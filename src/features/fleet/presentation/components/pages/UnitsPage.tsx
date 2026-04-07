/**
 * @fileoverview Página de Unidades Operativas.
 * Muestra el listado de unidades armadas y permite crear nuevas.
 */

'use client'

import React, { useState } from 'react'
import { useActiveAssemblies } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { UnitAssemblyModal } from '@/src/features/fleet/presentation/components/organisms/UnitAssemblyModal'
import { UnitCard } from '@/src/features/fleet/presentation/components/organisms/UnitCard'
import { Button } from '@/src/core/presentation/components/ui/button'
import { 
  Plus, 
  Truck
} from 'lucide-react'

export default function UnitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: assemblies, isLoading } = useActiveAssemblies()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Unidades Operativas</h1>
          <p className="text-sm text-on-surface-variant">Gestión de unidades armadas y asignaciones a clientes.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} variant="orange" className="gap-2">
          <Plus className="size-4" />
          Nuevo Armado
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
             <div key={i} className="h-48 rounded-2xl bg-surface-container animate-pulse" />
          ))}
        </div>
      ) : assemblies?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-surface-container-low/30 border-2 border-dashed border-outline-variant/20 rounded-3xl text-center">
          <div className="size-16 rounded-full bg-surface-container flex items-center justify-center mb-4">
            <Truck className="size-8 text-on-surface-variant opacity-20" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">No hay unidades armadas</h3>
          <p className="text-sm text-on-surface-variant max-w-xs mx-auto mt-1 mb-6">
            Comienza armando una unidad vinculando un tracto, remolque y operador.
          </p>
          <Button variant="orange" onClick={() => setIsModalOpen(true)} className="gap-2">
            <Plus className="size-4" />
            Armar Primera Unidad
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {assemblies?.map((assembly) => (
            <UnitCard key={assembly.id} assembly={assembly} />
          ))}
        </div>
      )}

      <UnitAssemblyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
