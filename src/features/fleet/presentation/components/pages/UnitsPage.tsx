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
  Search, 
  Truck
} from 'lucide-react'

export default function UnitsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { data: assemblies, isLoading } = useActiveAssemblies()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between pb-4 border-b border-stone-300">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-stone-900 tracking-tight">Trucks currently in warehouse</h1>
          <div className="h-4 w-px bg-stone-300" />
          <span className="text-sm font-medium text-stone-500">Unidades Operativas</span>
        </div>
        <div className="flex items-center gap-2">
           <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-stone-200 transition-colors shadow-sm">
             <Search className="size-3.5" />
             Search for truck ID
           </button>
           <button className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-[8px] text-[12px] font-medium text-stone-600 hover:bg-stone-50 hover:text-stone-900 border border-stone-200 transition-colors shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
             Filter
           </button>
           <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white px-4 py-1.5 rounded-[8px] text-[12px] font-bold transition-all shadow-sm">
             <Plus className="size-4" />
             Quick shipment
           </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
             <div key={i} className="h-48 rounded-[16px] bg-stone-100 animate-pulse border border-stone-200" />
          ))}
        </div>
      ) : assemblies?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-stone-50/50 border-2 border-dashed border-stone-200 rounded-[20px] text-center">
          <div className="size-16 rounded-full bg-stone-100 flex items-center justify-center mb-4">
            <Truck className="size-8 text-stone-300" />
          </div>
          <h3 className="text-lg font-bold text-stone-900">No hay camiones en la base</h3>
          <p className="text-sm text-stone-500 max-w-xs mx-auto mt-1 mb-6">
            Comienza armando una unidad vinculando un tracto, remolque y operador.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
