/**
 * @fileoverview Átomo: fila de operación individual dentro de una categoría.
 * Navega a la ruta de la operación correspondiente.
 */

'use client'

import Link from 'next/link'
import {
  Map,
  PackageCheck,
  FileText,
  Wallet,
  UserCheck,
  Truck,
  ArrowUpRight,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'
import type { CategoryOperationEntity } from '@/src/features/operations/domain/entities/operation-category.entity'

const ICON_MAP: Record<string, LucideIcon> = {
  Map,
  PackageCheck,
  FileText,
  Wallet,
  UserCheck,
  Truck,
}

interface OperationRowProps {
  operation: CategoryOperationEntity
}

/**
 * Fila de operación navegable con ícono y descripción.
 */
export function OperationRow({ operation }: OperationRowProps) {
  const Icon = ICON_MAP[operation.icon] ?? FileText

  return (
    <Link
      href={operation.href}
      className={cn(
        'group flex items-center gap-4 px-4 py-3.5 rounded-xl',
        'hover:bg-stone-50 dark:hover:bg-zinc-800/60 transition-colors duration-150',
        'border border-transparent hover:border-stone-100 dark:hover:border-zinc-700',
      )}
    >
      <div className="flex items-center justify-center size-8 rounded-lg bg-stone-100 dark:bg-zinc-800 shrink-0 group-hover:bg-[#1a5c3a]/10 transition-colors">
        <Icon className="size-4 text-stone-500 dark:text-zinc-400 group-hover:text-[#1a5c3a] transition-colors" />
      </div>

      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <span className="text-[13px] font-semibold text-stone-800 dark:text-zinc-200 truncate">
          {operation.label}
        </span>
        <span className="text-[11px] text-stone-400 dark:text-zinc-500 truncate">
          {operation.description}
        </span>
      </div>

      {operation.badge && (
        <span className="text-[10px] font-bold text-[#1a5c3a] bg-[#1a5c3a]/8 px-2 py-0.5 rounded-full shrink-0">
          {operation.badge}
        </span>
      )}

      <ArrowUpRight className="size-3.5 text-stone-300 dark:text-zinc-600 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  )
}
