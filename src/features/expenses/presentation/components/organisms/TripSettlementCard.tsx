'use client'

import React from 'react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Truck, User, Calendar } from 'lucide-react'
import type { ExpenseAdvanceEntity } from '../../../domain/entities/expense-assignment-entity'
import { cn } from '@/src/core/infrastructure/utils/cn'

const fmtDate = new Intl.DateTimeFormat('es-MX', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
})

const money = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
})

interface TripSettlementCardProps {
  advance: ExpenseAdvanceEntity
  canManage: boolean
  onClick: () => void
}

export function TripSettlementCard({
  advance: a,
  canManage,
  onClick,
}: TripSettlementCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-zinc-900 rounded-[20px] border border-stone-200 dark:border-zinc-800 p-5 flex flex-col shadow-sm hover:shadow-md transition-all cursor-pointer relative"
    >
      {/* Top Header: Avatar & Top Right Action */}
      <div className="flex justify-between items-start mb-3">
        <div className="h-10 w-10 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center border border-stone-200 dark:border-zinc-700">
          <Truck className="size-5 text-stone-400" />
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-2">
        <p className="text-[11px] text-stone-500 dark:text-zinc-400 mb-0.5 flex items-center gap-1">
          <Calendar className="size-3" />
          {fmtDate.format(new Date(a.assignedAt))}
          {' · '}
          {a.unitLabel ?? 'Sin unidad'}
        </p>
        <h3 className="font-bold text-base text-stone-900 dark:text-zinc-100 leading-tight">
          {a.tripFolio ?? 'Sin viaje'}
        </h3>
      </div>

      {/* Operator Info */}
      <div className="flex items-center gap-2 mb-4 mt-2">
        <User className="size-4 text-stone-400" />
        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">
          {a.operatorName ?? a.operatorId}
        </span>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <Badge 
          variant="secondary" 
          className="rounded-md text-[11px] font-medium px-2 py-0.5 bg-[#1a5c3a]/10 text-[#1a5c3a] dark:bg-primary-container/20 dark:text-primary-container"
        >
          Vinculado
        </Badge>
        <Badge variant="outline" className="rounded-md text-[11px] font-medium px-2 py-0.5 border-stone-200 dark:border-zinc-700 text-stone-600 dark:text-zinc-300">
          {a.method === 'cash' ? 'Efectivo' : 'Transferencia'}
        </Badge>
      </div>

      <div className="mt-auto border-t border-stone-100 dark:border-zinc-800 pt-3" />

      {/* Footer / Balance */}
      <div className="flex items-end justify-between mt-1">
        <div>
          <p className="text-lg font-bold leading-none text-stone-900 dark:text-zinc-100">
            {money.format(a.amount)}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">
            Adelanto
          </p>
        </div>
        <Button 
          size="sm"
          className="rounded-[10px] font-semibold text-xs px-3 h-8 bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white dark:bg-primary-container dark:hover:bg-primary-container/90 dark:text-zinc-950"
        >
          Hacer ajuste
        </Button>
      </div>
    </div>
  )
}
