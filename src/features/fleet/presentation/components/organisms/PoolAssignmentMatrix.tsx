'use client'

import React, { useState } from 'react'
import { Check, Info, Truck, Plus, ChevronRight } from 'lucide-react'
import { useClients, useUnitAssemblies } from '../../hooks/use-fleet'
import { useClientPools, useAvailableUnitsForClient, usePoolMutations } from '../../hooks/use-pools'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { ClientPoolWizard } from './ClientPoolWizard'
import { PoolDeliveryFormatTable } from './PoolDeliveryFormatTable'

/**
 * Interfaz de matriz para asignar unidades armadas a pools de clientes.
 */
export function PoolAssignmentMatrix() {
  const { data: clients } = useClients()
  const [selectedClientId, setSelectedClientId] = useState<string>('')
  const [isPoolWizardOpen, setIsPoolWizardOpen] = useState(false)
  const [selectedPoolForFormat, setSelectedPoolForFormat] = useState<string | null>(null)
  
  const { data: pools, isLoading: isLoadingPools } = useClientPools(selectedClientId)
  const { data: availableUnits, isLoading: isLoadingUnits } = useAvailableUnitsForClient(selectedClientId)
  const { data: allAssemblies } = useUnitAssemblies()
  const { assignUnits } = usePoolMutations()

  const [pendingAssignments, setPendingAssignments] = useState<Record<string, string>>({})

  const handleToggle = (unitId: string, poolId: string) => {
    setPendingAssignments(prev => ({
      ...prev,
      [unitId]: prev[unitId] === poolId ? '' : poolId
    }))
  }

  const handleSave = async () => {
    // Agrupar por poolId para hacer guardado masivo
    const poolsToUpdate = Object.entries(pendingAssignments).reduce((acc, [unitId, poolId]) => {
      if (!poolId) return acc
      if (!acc[poolId]) acc[poolId] = []
      acc[poolId].push(unitId)
      return acc
    }, {} as Record<string, string[]>)

    for (const [poolId, unitIds] of Object.entries(poolsToUpdate)) {
      await assignUnits.mutateAsync({ poolId, unitIds })
    }
    
    setPendingAssignments({})
  }

  const currentClient = clients?.find(c => c.id === selectedClientId)
  const currentClientLabel = currentClient?.tradeName ?? currentClient?.companyName ?? 'Cliente'

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {selectedClientId && (
        <ClientPoolWizard
          isOpen={isPoolWizardOpen}
          onClose={() => setIsPoolWizardOpen(false)}
          clientId={selectedClientId}
          clientLabel={currentClientLabel}
        />
      )}
      {/* Client Selector (hide if showing format) */}
      {!selectedPoolForFormat && (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-stone-200 dark:border-zinc-800 p-6 rounded-2xl shadow-sm">
          <label className="text-xs font-bold text-stone-500 dark:text-zinc-400 uppercase tracking-widest mb-3 block">
            Seleccionar Cliente para Gestión de Pools
          </label>
          <div className="flex flex-wrap gap-2">
            {clients?.map((client) => (
              <button
                key={client.id}
                onClick={() => {
                  setSelectedClientId(client.id)
                  setSelectedPoolForFormat(null)
                }}
                className={cn(
                  "px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2",
                  selectedClientId === client.id 
                    ? "bg-[#1a5c3a] text-white shadow-lg shadow-[#1a5c3a]/20 scale-105" 
                    : "bg-stone-100 dark:bg-zinc-800 text-stone-600 dark:text-zinc-400 hover:bg-stone-200"
                )}
              >
                {client.tradeName ?? client.companyName ?? 'Cliente'}
                {selectedClientId === client.id && <Check className="size-3" />}
              </button>
            ))}
          </div>
        </div>
      )}

      {!selectedClientId && !selectedPoolForFormat && (
        <div className="flex flex-col items-center justify-center py-20 text-stone-400">
          <Info className="size-12 mb-4 opacity-20" />
          <p className="text-sm">Selecciona un cliente para ver y gestionar su flota dedicada.</p>
        </div>
      )}

      {selectedClientId && (
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Pools Sidebar */}
          <div className="xl:col-span-1 flex flex-col gap-4">
            <div className="flex items-center justify-between px-2">
               <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100">Pools de {currentClient?.tradeName}</h3>
               <button
                 type="button"
                 onClick={() => setIsPoolWizardOpen(true)}
                 className="p-1.5 rounded-lg bg-[#1a5c3a]/10 text-[#1a5c3a] hover:bg-[#1a5c3a]/20 transition-colors"
                 aria-label="Crear pool"
               >
                 <Plus className="size-4" />
               </button>
            </div>
            <div className="flex flex-col gap-2">
              {pools?.map(pool => (
                <div 
                  key={pool.id}
                  className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 hover:border-[#1a5c3a]/30 transition-all group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">{pool.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {pool.unitsCount || 0} Unidades
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-[11px] text-stone-500 dark:text-zinc-500 line-clamp-1">{pool.description || 'Sin descripción'}</p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedPoolForFormat(pool.id)}
                      className="h-6 text-[10px] text-[#1a5c3a] hover:bg-[#1a5c3a]/10 px-2"
                    >
                      Ver Formato
                    </Button>
                  </div>
                </div>
              ))}
              {pools?.length === 0 && (
                <div className="py-10 text-center border-2 border-dashed border-stone-100 dark:border-zinc-800 rounded-2xl">
                  <p className="text-xs text-stone-400">No hay pools creados para este cliente.</p>
                </div>
              )}
            </div>
          </div>

          {/* Main Area: Matrix or Format Table */}
          {selectedPoolForFormat ? (
            <div className="xl:col-span-3">
              <PoolDeliveryFormatTable
                poolName={pools?.find(p => p.id === selectedPoolForFormat)?.name || ''}
                clientName={currentClientLabel}
                units={allAssemblies?.filter(u => u.clientPoolId === selectedPoolForFormat) || []}
                onBack={() => setSelectedPoolForFormat(null)}
              />
            </div>
          ) : (
            <div className="xl:col-span-3 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl overflow-hidden shadow-sm flex flex-col">
              <div className="p-4 border-b border-stone-100 dark:border-zinc-800 flex items-center justify-between bg-stone-50/50 dark:bg-zinc-800/30">
              <h3 className="text-sm font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="size-4 text-[#1a5c3a]" />
                Asignación de Unidades a Pools
              </h3>
              {Object.keys(pendingAssignments).length > 0 && (
                <Button 
                  onClick={handleSave}
                  disabled={assignUnits.isPending}
                  className="bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 h-9 px-4 rounded-xl text-xs font-bold"
                >
                  {assignUnits.isPending ? 'Guardando...' : `Guardar ${Object.keys(pendingAssignments).length} Cambios`}
                </Button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-stone-50/30 dark:bg-zinc-800/20 border-b border-stone-100 dark:border-zinc-800">
                    <th className="px-6 py-4 text-left text-[10px] font-bold text-stone-400 uppercase tracking-widest w-[250px]">Unidad Armada</th>
                    {pools?.map(pool => (
                      <th key={pool.id} className="px-4 py-4 text-center text-[10px] font-bold text-stone-400 uppercase tracking-widest min-w-[120px]">
                        {pool.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50 dark:divide-zinc-800/50">
                  {availableUnits?.map((unit) => (
                    <tr key={unit.id} className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-stone-900 dark:text-zinc-100">{unit.name}</span>
                          <span className="text-[10px] text-stone-400 font-mono mt-0.5">{unit.economicNumber}</span>
                        </div>
                      </td>
                      {pools?.map(pool => {
                        const isCurrentPool = unit.clientPoolId === pool.id
                        const isPendingPool = pendingAssignments[unit.id] === pool.id
                        const isActive = isPendingPool || (isCurrentPool && pendingAssignments[unit.id] === undefined)
                        
                        return (
                          <td key={pool.id} className="px-4 py-4 text-center">
                            <button
                              onClick={() => handleToggle(unit.id, pool.id)}
                              className={cn(
                                "size-8 rounded-full border-2 flex items-center justify-center mx-auto transition-all duration-300",
                                isActive 
                                  ? "bg-[#1a5c3a] border-[#1a5c3a] text-white scale-110 shadow-md shadow-[#1a5c3a]/20" 
                                  : "bg-transparent border-stone-200 dark:border-zinc-700 text-transparent hover:border-stone-300"
                              )}
                            >
                              <Check className="size-4" />
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                  {(!availableUnits || availableUnits.length === 0) && (
                    <tr>
                      <td colSpan={(pools?.length || 0) + 1} className="px-6 py-20 text-center text-stone-400">
                         No hay unidades asignadas directamente a este cliente para gestionar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          )}
        </div>
      )}
    </div>
  )
}
