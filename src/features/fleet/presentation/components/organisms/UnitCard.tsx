import React from 'react'
import { Truck } from 'lucide-react'

type UnitCardAssembly = {
  tractor: { status: string; plates: string }
  operator: { firstName: string }
}

export function UnitCard({ assembly }: { assembly: UnitCardAssembly }) {
  // Simulación de progreso basado en estado
  const progressValue = assembly.tractor.status === 'active' ? 75 : assembly.tractor.status === 'available' ? 100 : 0
  const colorClass = assembly.tractor.status === 'active' ? 'bg-[#e07020]' : assembly.tractor.status === 'available' ? 'bg-[#1a5c3a]' : 'bg-stone-300'

  return (
    <div className="bg-white border border-stone-200 p-5 rounded-[16px] shadow-sm hover:shadow-md hover:border-stone-300 transition-all flex flex-col group cursor-pointer">
      
      {/* Top Row: Status Dot */}
      <div className="flex items-center justify-between mb-4">
         <div className="flex items-center gap-1.5 bg-stone-50 px-2.5 py-1 rounded-md border border-stone-100">
            <span className={`size-1.5 rounded-full ${colorClass}`} />
            <span className="text-[11px] font-bold text-stone-700 capitalize">
               {assembly.tractor.status === 'available' ? 'Ready' : assembly.tractor.status === 'active' ? 'Loading' : 'Not started'}
            </span>
         </div>
      </div>

      {/* Middle: Title & Image mock */}
      <div className="flex items-center justify-between mb-5">
         <div className="flex flex-col">
            <h3 className="text-[16px] font-black text-stone-900 tracking-tight leading-none mb-1.5">
               {assembly.tractor.plates}
            </h3>
            <span className="text-[11px] font-medium text-stone-500 tracking-wide">
               30,000 kg • ({progressValue}%)
            </span>
         </div>
         <div className="opacity-80 group-hover:opacity-100 transition-opacity">
            {/* Si hubieran imágenes de camiones, irían aquí. Por ahora, un icono pulido. */}
            <Truck className="size-10 text-stone-300" strokeWidth={1} />
         </div>
      </div>

      <hr className="border-t border-dashed border-stone-200 my-4" />

      {/* Route & Operator */}
      <div className="flex items-center justify-between mb-6">
         <div className="font-bold text-stone-900 text-xs">
            VSA <span className="mx-1 text-stone-400">→</span> CDC
         </div>
         <div className="text-[11px] font-medium text-stone-500">
            {assembly.operator.firstName} • <span className="font-bold">Dock #3</span>
         </div>
      </div>

      {/* Bottom: Progress Bar */}
      <div className="flex flex-col gap-1.5 w-full mt-auto">
         <div className="flex items-center justify-between text-[11px]">
            <span className="text-stone-500 font-medium">Load progress</span>
            <span className="font-bold text-stone-900">{progressValue}%</span>
         </div>
         <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden flex">
            <div 
               className={`h-full ${colorClass}`} 
               style={{ width: `${progressValue}%` }} 
            />
            {/* The rest is implicitly gray from background */}
         </div>
      </div>

    </div>
  )
}
