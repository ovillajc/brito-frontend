'use client'

import React from 'react'
import { Layers } from 'lucide-react'
import { PoolAssignmentMatrix } from '../organisms/PoolAssignmentMatrix'

export default function PoolsPage() {
  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-[#1a5c3a] mb-1">
           <Layers className="size-4" />
           <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Flotilla / Pools</span>
        </div>
        <h1 className="text-3xl font-black text-stone-900 dark:text-zinc-100 tracking-tight">
          Pools por Cliente
        </h1>
        <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-2xl">
          Gestiona grupos dedicados de unidades armadas. Selecciona un cliente para configurar su pool logístico y asignar unidades operativas.
        </p>
      </div>

      {/* Main Matrix Interface */}
      <PoolAssignmentMatrix />
    </div>
  )
}
