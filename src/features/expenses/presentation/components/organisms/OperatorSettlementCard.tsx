'use client'

import React from 'react'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Trash2, FolderOpen, Receipt, User, Download } from 'lucide-react'
import type { OperatorSettlementKpiEntity } from '../../../domain/entities/operator-settlement-entity'
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

interface OperatorSettlementCardProps {
  settlement: OperatorSettlementKpiEntity
  canManage: boolean
  onClick: () => void
  onDelete?: (e: React.MouseEvent) => void
  onReopen?: (e: React.MouseEvent) => void
  onExport?: (e: React.MouseEvent) => void
  isClosed?: boolean
}

export function OperatorSettlementCard({
  settlement: k,
  canManage,
  onClick,
  onDelete,
  onReopen,
  onExport,
  isClosed = false,
}: OperatorSettlementCardProps) {
  const isPositiveBalance = k.balanceAmount > 0
  const isNegativeBalance = k.balanceAmount < 0

  return (
    <div
      onClick={onClick}
      className={cn(
        "bg-white dark:bg-zinc-900 rounded-[20px] border border-stone-200 dark:border-zinc-800 p-5 flex flex-col shadow-sm hover:shadow-md transition-all cursor-pointer relative",
        isClosed && "opacity-80 hover:opacity-100"
      )}
    >
      {/* Top Header: Avatar & Top Right Action */}
      <div className="flex justify-between items-start mb-3">
        <div className="h-10 w-10 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center border border-stone-200 dark:border-zinc-700">
          <span className="text-lg font-bold text-stone-700 dark:text-zinc-300">
            {k.operatorName ? k.operatorName.charAt(0).toUpperCase() : <User className="size-5 text-stone-400" />}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {onExport && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-xl text-stone-400 hover:text-[#1a5c3a] hover:bg-[#1a5c3a]/10 dark:hover:bg-primary-container/20 border-stone-200 dark:border-zinc-700"
              onClick={onExport}
              title="Exportar a Excel"
            >
              <Download className="size-4" />
            </Button>
          )}
          {!isClosed && canManage && onDelete && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-stone-200 dark:border-zinc-700"
              onClick={onDelete}
              title="Eliminar"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
          {isClosed && canManage && (
            <>
              {onReopen && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl text-stone-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/20 border-stone-200 dark:border-zinc-700"
                  onClick={onReopen}
                  title="Reabrir cuenta"
                >
                  <FolderOpen className="size-4" />
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-xl text-stone-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 border-stone-200 dark:border-zinc-700"
                  onClick={onDelete}
                  title="Eliminar"
                >
                  <Trash2 className="size-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Title & Subtitle */}
      <div className="mb-2">
        <p className="text-[11px] text-stone-500 dark:text-zinc-400 mb-0.5">
          {isClosed ? 'Cerrado el ' : 'Apertura: '}
          {isClosed && k.closedAt ? fmtDate.format(k.closedAt) : fmtDate.format(k.openedAt!)}
          {' · '}
          {k.expenseCount} gasto{k.expenseCount !== 1 ? 's' : ''}
        </p>
        <h3 className="font-bold text-base text-stone-900 dark:text-zinc-100 leading-tight">
          {k.operatorName ?? k.operatorId}
        </h3>
      </div>

      {/* Badges */}
      <div className="flex flex-wrap items-center gap-1.5 mb-4">
        <Badge 
          variant="secondary" 
          className={cn(
            "rounded-md text-[11px] font-medium px-2 py-0.5",
            isClosed 
              ? "bg-[#1a5c3a]/10 text-[#1a5c3a] dark:bg-primary-container/20 dark:text-primary-container"
              : "bg-stone-100 text-stone-600 dark:bg-zinc-800 dark:text-zinc-300"
          )}
        >
          {isClosed ? 'Cerrado' : 'Abierto'}
        </Badge>
        {isClosed && isPositiveBalance && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-[11px] font-medium px-2 py-0.5">
            Reembolsó
          </Badge>
        )}
        {isClosed && isNegativeBalance && (
          <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md text-[11px] font-medium px-2 py-0.5">
            Se le pagó
          </Badge>
        )}
      </div>

      <div className="mt-auto border-t border-stone-100 dark:border-zinc-800 pt-3" />

      {/* Footer / Balance */}
      <div className="flex items-end justify-between mt-1">
        <div>
          <p className={cn(
            "text-lg font-bold leading-none",
            isClosed 
              ? (isPositiveBalance ? "text-amber-700 dark:text-amber-500" : isNegativeBalance ? "text-blue-600 dark:text-blue-500" : "text-stone-900 dark:text-zinc-100")
              : (isPositiveBalance ? "text-amber-600 dark:text-amber-500" : isNegativeBalance ? "text-blue-600 dark:text-blue-500" : "text-stone-900 dark:text-zinc-100")
          )}>
            {money.format(Math.abs(k.balanceAmount))}
          </p>
          <p className="text-[11px] text-stone-400 dark:text-zinc-500 mt-1">
            Comprobado: {money.format(k.spentAmount)}
          </p>
        </div>
        <Button 
          size="sm"
          className={cn(
            "rounded-[10px] font-semibold text-xs px-3 h-8",
            isClosed
              ? "bg-stone-900 hover:bg-stone-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900"
              : "bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white dark:bg-primary-container dark:hover:bg-primary-container/90 dark:text-zinc-950"
          )}
        >
          {isClosed ? 'Ver detalles' : 'Ajustar ahora'}
        </Button>
      </div>
    </div>
  )
}
