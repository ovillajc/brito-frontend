'use client'

import { useMemo, useState } from 'react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import type { FuelTankMovementEntity } from '@/src/features/fuel/domain/entities/fuel-tank-entity'

interface FuelTankMovementsTableProps {
  movements: FuelTankMovementEntity[]
  emptyMessage?: string
  pageSize?: number
}

function formatMoney(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { style: 'currency', currency: 'MXN' })
}

function formatNumber(value: number | null) {
  if (value == null || !Number.isFinite(value)) return '—'
  return value.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatMovementDate(value: Date) {
  return value.toLocaleString('es-MX', { hour12: false })
}

type SortableColumn = 'movementDate' | 'movementType' | 'liters' | 'unitCost' | 'totalCost'
type SortDirection = 'asc' | 'desc'

function compareNullableNumbers(a: number | null, b: number | null, direction: SortDirection) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1

  return direction === 'asc' ? a - b : b - a
}

function getMovementBadgeClass(movementType: FuelTankMovementEntity['movementType']) {
  if (movementType === 'IN') {
    return 'bg-emerald-500/10 text-emerald-700 border-emerald-300'
  }

  if (movementType === 'OUT') {
    return 'bg-amber-500/10 text-amber-700 border-amber-300'
  }

  return 'bg-blue-500/10 text-blue-700 border-blue-300'
}

/**
 * Molecule de tabla para mostrar movimientos de tanque.
 */
export function FuelTankMovementsTable({
  movements,
  emptyMessage = 'Sin movimientos',
  pageSize = 8,
}: FuelTankMovementsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedType, setSelectedType] = useState<'ALL' | FuelTankMovementEntity['movementType']>('ALL')
  const [sortColumn, setSortColumn] = useState<SortableColumn>('movementDate')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  const filteredMovements = useMemo(() => {
    if (selectedType === 'ALL') return movements
    return movements.filter((movement) => movement.movementType === selectedType)
  }, [movements, selectedType])

  const sortedMovements = useMemo(() => {
    const items = [...filteredMovements]

    items.sort((a, b) => {
      switch (sortColumn) {
        case 'movementDate':
          return sortDirection === 'asc'
            ? a.movementDate.getTime() - b.movementDate.getTime()
            : b.movementDate.getTime() - a.movementDate.getTime()
        case 'movementType':
          return sortDirection === 'asc'
            ? a.movementType.localeCompare(b.movementType, 'es-MX')
            : b.movementType.localeCompare(a.movementType, 'es-MX')
        case 'liters':
          return sortDirection === 'asc' ? a.liters - b.liters : b.liters - a.liters
        case 'unitCost':
          return compareNullableNumbers(a.unitCost, b.unitCost, sortDirection)
        case 'totalCost':
          return compareNullableNumbers(a.totalCost, b.totalCost, sortDirection)
        default:
          return 0
      }
    })

    return items
  }, [filteredMovements, sortColumn, sortDirection])

  const totalPages = Math.max(1, Math.ceil(sortedMovements.length / pageSize))
  const activePage = Math.min(currentPage, totalPages)

  const paginatedMovements = useMemo(() => {
    const start = (activePage - 1) * pageSize
    return sortedMovements.slice(start, start + pageSize)
  }, [activePage, sortedMovements, pageSize])

  function handleSort(column: SortableColumn, direction: SortDirection) {
    setCurrentPage(1)
    setSortColumn(column)
    setSortDirection(direction)
  }

  function clearFilters() {
    setCurrentPage(1)
    setSelectedType('ALL')
    setSortColumn('movementDate')
    setSortDirection('desc')
  }

  function isActiveSort(column: SortableColumn, direction: SortDirection) {
    return sortColumn === column && sortDirection === direction
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-stone-500 dark:text-zinc-400">Tipo:</span>
          <select
            value={selectedType}
            onChange={(event) => {
              setCurrentPage(1)
              setSelectedType(event.target.value as 'ALL' | FuelTankMovementEntity['movementType'])
            }}
            className="h-10 rounded-lg border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 text-sm text-stone-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-[#1a5c3a]/30"
          >
            <option value="ALL">Todos</option>
            <option value="IN">IN</option>
            <option value="OUT">OUT</option>
            <option value="ADJUST">ADJUST</option>
          </select>
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            {sortedMovements.length} resultado{sortedMovements.length === 1 ? '' : 's'}
          </p>
          <Button type="button" variant="outline" size="sm" onClick={clearFilters}>
            Limpiar filtros
          </Button>
        </div>
      </div>

      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-stone-400">
            <th className="py-2 pr-4">
              <div className="flex items-center gap-2">
                <span>Fecha</span>
                <div className="flex items-center gap-1">
                  <button type="button" className={isActiveSort('movementDate', 'asc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('movementDate', 'asc')}>↑</button>
                  <button type="button" className={isActiveSort('movementDate', 'desc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('movementDate', 'desc')}>↓</button>
                </div>
              </div>
            </th>
            <th className="py-2 pr-4">
              <div className="flex items-center gap-2">
                <span>Tipo</span>
                <div className="flex items-center gap-1">
                  <button type="button" className={isActiveSort('movementType', 'asc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('movementType', 'asc')}>↑</button>
                  <button type="button" className={isActiveSort('movementType', 'desc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('movementType', 'desc')}>↓</button>
                </div>
              </div>
            </th>
            <th className="py-2 pr-4">
              <div className="flex items-center gap-2">
                <span>Litros</span>
                <div className="flex items-center gap-1">
                  <button type="button" className={isActiveSort('liters', 'asc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('liters', 'asc')}>↑</button>
                  <button type="button" className={isActiveSort('liters', 'desc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('liters', 'desc')}>↓</button>
                </div>
              </div>
            </th>
            <th className="py-2 pr-4">
              <div className="flex items-center gap-2">
                <span>Costo/L</span>
                <div className="flex items-center gap-1">
                  <button type="button" className={isActiveSort('unitCost', 'asc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('unitCost', 'asc')}>↑</button>
                  <button type="button" className={isActiveSort('unitCost', 'desc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('unitCost', 'desc')}>↓</button>
                </div>
              </div>
            </th>
            <th className="py-2 pr-4">
              <div className="flex items-center gap-2">
                <span>Total</span>
                <div className="flex items-center gap-1">
                  <button type="button" className={isActiveSort('totalCost', 'asc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('totalCost', 'asc')}>↑</button>
                  <button type="button" className={isActiveSort('totalCost', 'desc') ? 'font-semibold text-stone-700 dark:text-zinc-100' : ''} onClick={() => handleSort('totalCost', 'desc')}>↓</button>
                </div>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="text-stone-700 dark:text-zinc-200">
          {sortedMovements.length === 0 ? (
            <tr>
              <td className="py-3 text-sm text-stone-500 dark:text-zinc-400" colSpan={5}>
                {movements.length === 0 ? emptyMessage : 'No hay movimientos que coincidan con los filtros'}
              </td>
            </tr>
          ) : (
            paginatedMovements.map((movement) => (
              <tr key={movement.id} className="border-t border-stone-100 dark:border-zinc-800">
                <td className="py-2 pr-4">{formatMovementDate(movement.movementDate)}</td>
                <td className="py-2 pr-4">
                  <Badge className={getMovementBadgeClass(movement.movementType)}>
                    {movement.movementType}
                  </Badge>
                </td>
                <td className="py-2 pr-4">{formatNumber(movement.liters)}</td>
                <td className="py-2 pr-4">{movement.unitCost != null ? formatMoney(movement.unitCost) : '—'}</td>
                <td className="py-2 pr-4">{movement.totalCost != null ? formatMoney(movement.totalCost) : '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {sortedMovements.length > 0 && totalPages > 1 ? (
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-stone-500 dark:text-zinc-400">
            Pagina {activePage} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, Math.min(prev, totalPages) - 1))}
              disabled={activePage === 1}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, Math.min(prev, totalPages) + 1))}
              disabled={activePage === totalPages}
            >
              Siguiente
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
