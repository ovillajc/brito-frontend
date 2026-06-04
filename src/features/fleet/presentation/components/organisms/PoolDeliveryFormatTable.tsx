'use client'

import React, { useRef } from 'react'
import { FileText, Printer, ArrowLeft } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { UnitAssemblyEntity, TruckEntity } from '../../../domain/entities'
import { EmployeeEntity } from '@/src/features/hr/domain/entities'
import { useQuery } from '@tanstack/react-query'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { getTrucksActions } from '../../actions/truck.actions'

interface PoolDeliveryFormatTableProps {
  poolName: string
  clientName: string
  units: UnitAssemblyEntity[]
  onBack: () => void
}

export function PoolDeliveryFormatTable({ poolName, clientName, units, onBack }: PoolDeliveryFormatTableProps) {
  const tableRef = useRef<HTMLDivElement>(null)

  const { data: operators } = useQuery({
    queryKey: ['hr', 'employees', 'operators'],
    queryFn: async () => {
      const result = await getEmployeesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as EmployeeEntity[]
    },
  })

  const { data: trucks } = useQuery({
    queryKey: ['fleet', 'tractors'],
    queryFn: async () => {
      const result = await getTrucksActions()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as TruckEntity[]
    },
  })

  const handlePrint = () => {
    window.print()
  }

  // Filtrar solo las unidades titulares para listarlas, y sus sustitutas se asocian.
  // Wait, if it's a list, the user requested all units in the pool.
  const poolUnits = units.filter(u => u.isActive)

  return (
    <div className="flex flex-col gap-6 bg-white dark:bg-zinc-900 border border-stone-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm print:shadow-none print:border-none print:p-0 animate-in fade-in zoom-in-95 duration-500">
      {/* Header / Controls */}
      <div className="flex items-center justify-between border-b border-stone-100 dark:border-zinc-800 pb-4 print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="text-stone-500 hover:text-stone-900">
            <ArrowLeft className="size-4 mr-2" />
            Volver
          </Button>
          <div className="h-6 w-px bg-stone-200 dark:bg-zinc-700" />
          <h2 className="text-lg font-bold text-stone-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="size-5 text-[#1a5c3a]" />
            Formato de Entrega
          </h2>
        </div>
        <Button onClick={handlePrint} className="bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 h-9 px-4 rounded-xl text-xs font-bold text-white shadow-md shadow-[#1a5c3a]/20">
          <Printer className="size-4 mr-2" />
          Imprimir Formato
        </Button>
      </div>

      {/* Print Header */}
      <div className="hidden print:flex flex-col items-center justify-center mb-8">
        <h1 className="text-2xl font-black uppercase tracking-widest text-black">Formato de Entrega de Unidades</h1>
        <p className="text-sm text-gray-600 mt-1 font-medium">Cliente: {clientName} | Pool: {poolName}</p>
        <p className="text-xs text-gray-400 mt-1">Generado el {new Date().toLocaleDateString('es-MX')}</p>
      </div>

      <div className="flex flex-col gap-1 print:hidden mb-2">
        <h3 className="text-xl font-black text-stone-900 dark:text-zinc-100">{poolName}</h3>
        <p className="text-sm text-stone-500 dark:text-zinc-400">Cliente: {clientName}</p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-zinc-800 print:border-black print:rounded-none" ref={tableRef}>
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-[#1a5c3a] text-white print:bg-gray-200 print:text-black">
            <tr>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider text-center">#</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider">Tracto / Torton</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider">Sustituta</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider">Thermo</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider text-center">Capacidad</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider text-center">Temperatura</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider">Operador</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider">Licencia</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider">Folio (Fastrack)</th>
              <th className="p-3 border-r border-stone-100/20 print:border-black font-bold uppercase text-[10px] tracking-wider">Estatus</th>
              <th className="p-3 font-bold uppercase text-[10px] tracking-wider">Ubicación</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-200 dark:divide-zinc-800 print:divide-black">
            {poolUnits.length === 0 ? (
              <tr>
                <td colSpan={11} className="p-8 text-center text-stone-500 font-medium">No hay unidades asignadas a este pool.</td>
              </tr>
            ) : (
              poolUnits.map((unit, index) => {
                const operator = operators?.find(o => o.id === unit.employeeId)
                const truck = trucks?.find(t => t.id === unit.truckId)
                const isTorton = truck?.vehicleType === 'TORTON'
                
                // Formateo de Sustituta
                let sustitutaText = 'N/A'
                if (unit.poolRole === 'titular') {
                  sustitutaText = '____________________' // Espacio para llenar a mano
                } else if (unit.poolRole === 'sustituta') {
                  sustitutaText = '(Unidad Sustituta)'
                }

                if (isTorton) {
                  sustitutaText = '---' // Tortons no llevan sustituta
                }

                // Formateo de Thermo / Capacidad / Temperatura
                let thermoText = '---'
                let capacityText = '---'
                let tempText = '---'

                if (isTorton) {
                  capacityText = truck?.capacityKg ? `${truck.capacityKg} kg` : (truck?.sizeFt ? `${truck.sizeFt} ft` : '---')
                  tempText = 'N/A'
                } else if (unit.trailerId) {
                  thermoText = `${unit.trailerPlates || 'S/P'} - ${unit.trailerEconomicNumber || 'S/E'}`
                  // Estos datos idealmente vienen del trailerModel, pero podemos dejar pendiente o mostrar genérico
                  capacityText = 'Por definir' 
                  tempText = 'Por definir'
                }

                // Status mapping
                const statusMap: Record<string, string> = {
                  'returning': 'Retornando',
                  'at_base': 'En Base',
                  'at_client': 'En Base Cliente',
                  'in_trip': 'En Viaje',
                  'in_workshop': 'En Taller'
                }

                return (
                  <tr key={unit.id} className="hover:bg-stone-50 dark:hover:bg-zinc-800/50 print:hover:bg-transparent">
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black text-center font-mono text-stone-500 print:text-black">
                      {index + 1}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black font-medium text-stone-900 dark:text-zinc-100 print:text-black">
                      <div className="flex flex-col">
                        <span>{truck?.plates || 'S/P'}</span>
                        <span className="text-[10px] text-stone-500 print:text-gray-600 font-mono">{truck?.economicNumber || 'S/E'} {isTorton ? '(Torton)' : ''}</span>
                      </div>
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black text-stone-600 dark:text-zinc-400 print:text-black">
                      {sustitutaText}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black text-stone-600 dark:text-zinc-400 print:text-black">
                      {thermoText}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black text-center text-stone-600 dark:text-zinc-400 print:text-black">
                      {capacityText}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black text-center text-stone-600 dark:text-zinc-400 print:text-black">
                      {tempText}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black font-medium text-stone-900 dark:text-zinc-100 print:text-black">
                      {operator?.fullName || 'Sin Asignar'}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black font-mono text-[10px] text-stone-500 print:text-black">
                      {/* Asumiendo que el operator model no trae licencia directo sino que está en driver_details, mostramos placeholder o el curp */}
                      {operator?.curp || '---'}
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black text-stone-600 dark:text-zinc-400 print:text-black font-mono text-[10px]">
                      {/* Placeholder para Folio Fastrack */}
                      ---
                    </td>
                    <td className="p-3 border-r border-stone-200 dark:border-zinc-800 print:border-black text-stone-600 dark:text-zinc-400 print:text-black text-xs">
                      {statusMap[unit.status] || unit.status}
                    </td>
                    <td className="p-3 text-stone-400 dark:text-zinc-600 print:text-black italic">
                      {/* Ubicación en blanco para rellenar post-impresión o via GPS */}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          /* Mostrar este contenedor y todos sus hijos */
          .print\\:shadow-none, .print\\:shadow-none * {
            visibility: visible;
          }
          .print\\:shadow-none {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          @page { size: landscape; margin: 1cm; }
        }
      `}} />
    </div>
  )
}
