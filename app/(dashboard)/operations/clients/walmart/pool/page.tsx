'use client'

import React, { useMemo, useState } from 'react'
import { Package, ChevronRight, Layers, Printer } from 'lucide-react'
import { useClients, useUnitAssemblies } from '@/src/features/fleet/presentation/hooks/use-fleet'
import { useClientPools } from '@/src/features/fleet/presentation/hooks/use-pools'
import { isWalmartClientName } from '@/src/features/trips/domain/rules/client-access'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { PoolDeliveryFormatTable } from '@/src/features/fleet/presentation/components/organisms/PoolDeliveryFormatTable'
import { ClientPoolEntity, UnitAssemblyEntity } from '@/src/features/fleet/domain/entities'

/** Muestra todos los pools de Walmart del mes actual con sus unidades asignadas. */
export default function WalmartPoolPage() {
  const { data: clients, isLoading: isLoadingClients } = useClients()
  const [selectedPoolForFormat, setSelectedPoolForFormat] = useState<ClientPoolEntity | null>(null)

  // Encontrar el cliente Walmart
  const walmartClient = useMemo(() => {
    if (!clients) return null
    return clients.find((c) => {
      const name = c.tradeName ?? c.companyName ?? ''
      return isWalmartClientName(name)
    }) ?? null
  }, [clients])

  const walmartClientId = walmartClient?.id
  const walmartClientLabel = walmartClient?.tradeName ?? walmartClient?.companyName ?? 'Walmart'

  const { data: pools, isLoading: isLoadingPools } = useClientPools(walmartClientId)
  const { data: allAssemblies, isLoading: isLoadingUnits } = useUnitAssemblies()

  const isLoading = isLoadingClients || isLoadingPools || isLoadingUnits

  // Unidades asignadas a cada pool
  const unitsByPool = useMemo<Record<string, UnitAssemblyEntity[]>>(() => {
    if (!pools || !allAssemblies) return {}
    return pools.reduce((acc, pool) => {
      acc[pool.id] = allAssemblies.filter((u) => u.clientPoolId === pool.id)
      return acc
    }, {} as Record<string, UnitAssemblyEntity[]>)
  }, [pools, allAssemblies])

  const currentMonth = new Date().toLocaleDateString('es-MX', { month: 'long', year: 'numeric' })

  // Vista de detalle de un pool
  if (selectedPoolForFormat) {
    return (
      <PoolDeliveryFormatTable
        poolName={selectedPoolForFormat.name}
        clientName={walmartClientLabel}
        units={unitsByPool[selectedPoolForFormat.id] ?? []}
        onBack={() => setSelectedPoolForFormat(null)}
      />
    )
  }

  // Estado de carga
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-12 w-64 animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-48 w-full animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-2xl" />
          ))}
        </div>
      </div>
    )
  }

  // Si no se encuentra el cliente Walmart
  if (!walmartClient) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
        <Package className="size-12 opacity-20" />
        <p className="text-sm font-medium">No se encontró el cliente Walmart en el sistema.</p>
        <p className="text-xs text-stone-400">Asegúrate de que el cliente esté creado con el nombre "Walmart".</p>
      </div>
    )
  }

  // Sin pools
  if (!pools || pools.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-stone-400 gap-3">
        <Layers className="size-12 opacity-20" />
        <p className="text-sm font-medium">No hay pools creados para la cuenta Walmart.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-in fade-in duration-500">
      {/* Encabezado de período */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a5c3a]">Pool del Mes</span>
          <h2 className="text-xl font-black text-stone-900 dark:text-zinc-100 capitalize">{currentMonth}</h2>
          <p className="text-sm text-stone-500 dark:text-zinc-400">
            Unidades comprometidas con la cuenta Walmart este mes.
          </p>
        </div>
        <Badge
          variant="outline"
          className="text-sm px-4 py-1.5 border-[#1a5c3a]/30 text-[#1a5c3a] font-bold"
        >
          {pools.length} {pools.length === 1 ? 'Pool' : 'Pools'}
        </Badge>
      </div>

      {/* Grid de Pools */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {pools.map((pool) => {
          const units = unitsByPool[pool.id] ?? []
          const activeUnits = units.filter((u) => u.isActive)

          return (
            <div
              key={pool.id}
              className="flex flex-col gap-4 p-5 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:border-[#1a5c3a]/30 hover:shadow-md transition-all duration-300 group"
            >
              {/* Pool Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-stone-900 dark:text-zinc-100 group-hover:text-[#1a5c3a] transition-colors">
                    {pool.name}
                  </span>
                  {pool.description && (
                    <span className="text-[11px] text-stone-500 dark:text-zinc-500 line-clamp-1">
                      {pool.description}
                    </span>
                  )}
                </div>
                <Badge
                  className="shrink-0 text-[10px] px-2 py-0.5 bg-[#1a5c3a]/10 text-[#1a5c3a] border-0 font-bold"
                >
                  {activeUnits.length} activas
                </Badge>
              </div>

              {/* Lista de unidades del pool */}
              <div className="flex flex-col gap-1.5 min-h-[80px]">
                {activeUnits.length === 0 ? (
                  <div className="flex items-center justify-center h-full py-6 border-2 border-dashed border-stone-100 dark:border-zinc-800 rounded-xl">
                    <span className="text-xs text-stone-400 dark:text-zinc-600 italic">Sin unidades asignadas</span>
                  </div>
                ) : (
                  activeUnits.slice(0, 4).map((unit) => (
                    <div
                      key={unit.id}
                      className="flex items-center justify-between px-3 py-2 bg-stone-50 dark:bg-zinc-800/50 rounded-xl"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-stone-900 dark:text-zinc-100">{unit.name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{unit.economicNumber}</span>
                      </div>
                      <span className="text-[10px] text-stone-500 dark:text-zinc-500 italic">
                        {unit.employeeName ?? 'Sin operador'}
                      </span>
                    </div>
                  ))
                )}
                {activeUnits.length > 4 && (
                  <span className="text-[10px] text-stone-400 dark:text-zinc-500 text-center font-medium">
                    +{activeUnits.length - 4} unidades más
                  </span>
                )}
              </div>

              {/* Footer: acción para ver el formato */}
              <div className="flex items-center justify-between pt-2 border-t border-stone-100 dark:border-zinc-800">
                <span className="text-[10px] text-stone-400 dark:text-zinc-600 font-medium uppercase tracking-wider">
                  {units.length} {units.length === 1 ? 'unidad total' : 'unidades totales'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPoolForFormat(pool)}
                  className="h-7 text-[11px] text-[#1a5c3a] hover:bg-[#1a5c3a]/10 px-3 gap-1 font-semibold"
                >
                  Ver Formato
                  <ChevronRight className="size-3" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
