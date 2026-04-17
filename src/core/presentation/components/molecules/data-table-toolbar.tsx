import React from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'

interface DataTableToolbarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  actionLabel?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
}

export function DataTableToolbar({
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  actionLabel = 'Nuevo',
  onAction,
  actionIcon = <Plus className="size-4" />,
}: DataTableToolbarProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="relative w-72">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-on-surface-variant" />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-outline-variant/30 bg-surface-container-lowest text-on-surface dark:text-zinc-100 placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
      </div>
      
      <div className="flex items-center gap-2">
        <Button variant="green" className="gap-2">
          <Filter className="size-4" />
          Filtros
        </Button>
        {actionLabel && (
          <Button variant="orange" className="gap-2" onClick={onAction}>
            {actionIcon}
            {actionLabel}
          </Button>
        )}
      </div>
    </div>
  )
}
