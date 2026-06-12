import React from 'react'
import { Search, Filter, Plus } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'

interface DataTableToolbarProps {
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  onFiltersClick?: () => void
  filtersCount?: number
  actionLabel?: string
  onAction?: () => void
  actionIcon?: React.ReactNode
}

export function DataTableToolbar({
  searchPlaceholder = 'Buscar...',
  searchValue,
  onSearchChange,
  onFiltersClick,
  filtersCount,
  actionLabel = 'Nuevo',
  onAction,
  actionIcon = <Plus className="size-4" />,
  onExport,
}: DataTableToolbarProps & { onExport?: () => void }) {
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
        <Button variant="green" className="gap-2" onClick={onFiltersClick} disabled={!onFiltersClick}>
          <Filter className="size-4" />
          Filtros{filtersCount && filtersCount > 0 ? ` (${filtersCount})` : ''}
        </Button>
        {onExport && (
          <Button variant="outline" className="gap-2" onClick={onExport} title="Exportar a Excel">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Exportar
          </Button>
        )}
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
