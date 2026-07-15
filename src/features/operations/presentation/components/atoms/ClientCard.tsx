/**
 * @fileoverview Átomo: tarjeta de cliente dentro de la categoría "Por Cliente".
 * Navega hacia la sub-ruta de operaciones de ese cliente.
 */

'use client'

import Link from 'next/link'
import { ArrowRight, Circle } from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'
import type { ClientOperationEntity } from '@/src/features/operations/domain/entities/operation-category.entity'

interface ClientCardProps {
  client: ClientOperationEntity
}

/**
 * Tarjeta de cliente navegable con animación hover.
 */
export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link
      href={client.href}
      className={cn(
        'group relative flex items-center gap-5 rounded-2xl border p-5 transition-all duration-200',
        'hover:shadow-lg hover:-translate-y-0.5 bg-white dark:bg-zinc-900',
        client.borderColor,
        'hover:border-opacity-60',
      )}
    >
      {/* Client avatar / logo placeholder */}
      <div
        className={cn(
          'flex items-center justify-center size-12 rounded-2xl font-black text-xl shrink-0 transition-transform duration-200 group-hover:scale-105',
          client.bgColor,
          client.color,
        )}
      >
        {client.name.substring(0, 2).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-stone-900 dark:text-zinc-100 truncate">
            {client.name}
          </span>
          {client.tag && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20 shrink-0">
              <Circle className="size-1.5 fill-current" />
              {client.tag}
            </span>
          )}
        </div>
        <span className="text-[12px] text-stone-500 dark:text-zinc-400 leading-snug line-clamp-2">
          {client.description}
        </span>
      </div>

      {/* Arrow */}
      <ArrowRight
        className={cn(
          'size-4 shrink-0 transition-all duration-200',
          'text-stone-300 dark:text-zinc-600',
          'group-hover:translate-x-1 group-hover:text-stone-500 dark:group-hover:text-zinc-400',
        )}
      />
    </Link>
  )
}
