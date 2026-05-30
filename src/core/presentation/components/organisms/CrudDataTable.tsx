'use client'

/**
 * @fileoverview Componente genérico de tabla CRUD reutilizable.
 * Encapsula toolbar, search, skeletons, empty state, acciones de fila y ConfirmDialog.
 * Cada feature solo provee sus columnas, datos, callbacks y componentes específicos.
 *
 * @example
 * ```tsx
 * <CrudDataTable<TruckEntity>
 *   data={trucks}
 *   isLoading={isLoading}
 *   columns={[{ header: 'Marca', cell: (t) => t.brand }]}
 *   searchPlaceholder="Buscar..."
 *   searchFilter={(t, term) => t.brand.includes(term)}
 *   actionLabel="Nuevo Tracto"
 *   onAction={() => setWizardOpen(true)}
 *   onView={setSelected}
 *   onEdit={setEditing}
 *   onDelete={handleDelete}
 *   emptyState={{ icon: Truck, title: 'Sin tractos', description: '...' }}
 * />
 * ```
 */

import React, { useState } from 'react'
import { Edit2, Trash2, Eye } from 'lucide-react'
import { toast } from 'sonner'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
  TableContainer,
} from '@/src/core/presentation/components/ui/table'
import { Button } from '@/src/core/presentation/components/ui/button'
import { DataTableToolbar } from '@/src/core/presentation/components/molecules/data-table-toolbar'
import { ConfirmDialog } from '@/src/core/presentation/components/molecules/confirm-dialog'

// ─── Types ──────────────────────────────────────────────────────────────────

/**
 * Definición de una columna para `CrudDataTable`.
 * @template T - Tipo de la entidad de dominio.
 */
export interface CrudColumn<T> {
  /** Texto del encabezado de la columna. */
  header: string
  /**
   * Función que renderiza el contenido de la celda para una fila dada.
   * @param item - Entidad de la fila actual.
   */
  cell: (item: T) => React.ReactNode
  /** Clases CSS adicionales para la celda de datos. */
  className?: string
  /** Clases CSS adicionales para la celda del encabezado. */
  headerClassName?: string
}

/** Configuración del estado vacío cuando no hay datos. */
export interface EmptyStateConfig {
  /** Componente de icono de Lucide a mostrar. */
  icon: React.ElementType
  /** Título principal del estado vacío. */
  title: string
  /** Descripción secundaria del estado vacío. */
  description: string
}

/**
 * Props del componente `CrudDataTable`.
 * @template T - Tipo de la entidad de dominio. Must include `id: string`.
 */
interface CrudDataTableProps<T extends { id: string }> {
  /** Array de registros a mostrar. */
  data: T[] | undefined
  /** Si true, muestra filas skeleton animadas. */
  isLoading: boolean
  /** Definiciones de las columnas de la tabla. */
  columns: CrudColumn<T>[]

  // Toolbar
  /** Placeholder del campo de búsqueda. */
  searchPlaceholder?: string
  /**
   * Función que define si un `item` coincide con el `term` de búsqueda.
   * Si no se provee, la búsqueda no estará disponible.
   */
  searchFilter?: (item: T, term: string) => boolean
  /** Etiqueta del botón de acción principal (ej. "Nuevo Tracto"). */
  actionLabel?: string
  /** Callback del botón de acción principal. */
  onAction?: () => void

  // Row actions
  /** Callback al hacer click en el icono "Ver" de una fila. */
  onView?: (item: T) => void
  /** Callback al hacer click en el icono "Editar" de una fila. */
  onEdit?: (item: T) => void
  /**
   * Función opcional para validar si una fila específica puede ser editada.
   * Si devuelve false, el botón de editar se ocultará para esa fila.
   */
  canEdit?: (item: T) => boolean
  /**
   * Callback de eliminación. Recibe el `id` del item a eliminar.
   * Debe devolver una promesa con `{ ok: boolean, error?: { message: string } }`.
   */
  onDelete?: (id: string) => Promise<{ ok: boolean; error?: { message: string } }>

  /** Título del diálogo de confirmación de eliminación (opcional, por fila). */
  deleteConfirmTitle?: string | ((item: T) => string)
  /** Descripción del diálogo de confirmación de eliminación (opcional, por fila). */
  deleteConfirmDescription?: string | ((item: T) => string)

  /** Configuración del estado vacío. */
  emptyState: EmptyStateConfig
  /** Número de filas skeleton a mostrar durante la carga. Por defecto: 3. */
  skeletonRows?: number

  /**
   * Si es false, deshabilita las acciones de crear, editar y eliminar.
   * Por defecto es true.
   */
  canManage?: boolean

  /** Clase CSS opcional para el contenedor raíz. */
  className?: string

  /** Número de registros por página. Por defecto: 10. Si es 0 desactiva paginación. */
  pageSize?: number
}

// ─── Component ──────────────────────────────────────────────────────────────

/**
 * Tabla CRUD genérica y reutilizable.
 * Maneja internamente: búsqueda client-side, confirm dialog de eliminación,
 * skeletons de carga, estado vacío y paginación.
 */
export function CrudDataTable<T extends { id: string }>({
  data,
  isLoading,
  columns,
  searchPlaceholder = 'Buscar...',
  searchFilter,
  actionLabel,
  onAction,
  onView,
  onEdit,
  canEdit,
  onDelete,
  deleteConfirmTitle,
  deleteConfirmDescription,
  emptyState,
  skeletonRows = 3,
  className,
  canManage = true,
  pageSize = 10,
}: CrudDataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // Reset page when search changes
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm])

  const _onAction = canManage ? onAction : undefined
  const _onEdit = canManage ? onEdit : undefined
  const _onDelete = canManage ? onDelete : undefined

  // Total de columnas + columna de acciones si aplica
  const hasRowActions = !!(onView || _onEdit || _onDelete)
  const totalCols = columns.length + (hasRowActions ? 1 : 0)

  // Filtrado client-side
  const filteredData = data
    ? searchFilter && searchTerm.trim()
      ? data.filter((item) => searchFilter(item, searchTerm.toLowerCase()))
      : data
    : []

  const isEmpty = !isLoading && filteredData.length === 0

  // Paginación
  const itemsPerPage = pageSize > 0 ? pageSize : Number.MAX_SAFE_INTEGER
  const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage))
  const safeCurrentPage = Math.min(currentPage, totalPages)
  const paginatedData = filteredData.slice((safeCurrentPage - 1) * itemsPerPage, safeCurrentPage * itemsPerPage)

  const handleDeleteRequest = (id: string) => setPendingDeleteId(id)
  const handleCancelDelete = () => setPendingDeleteId(null)
  const handleConfirmDelete = async () => {
    if (!pendingDeleteId || !_onDelete) return
    setIsDeleting(true)
    try {
      const result = await _onDelete(pendingDeleteId)
      if (result.ok) {
        toast.success('Registro eliminado correctamente')
      } else {
        toast.error(result.error?.message ?? 'Error al eliminar')
      }
    } catch {
      toast.error('Error inesperado al eliminar')
    } finally {
      setIsDeleting(false)
      setPendingDeleteId(null)
    }
  }

  const pendingDeleteItem = pendingDeleteId ? filteredData.find((d) => d.id === pendingDeleteId) : null
  const computedDeleteTitle = pendingDeleteItem && deleteConfirmTitle 
    ? (typeof deleteConfirmTitle === 'function' ? deleteConfirmTitle(pendingDeleteItem) : deleteConfirmTitle)
    : "¿Eliminar registro?"
  const computedDeleteDescription = pendingDeleteItem && deleteConfirmDescription
    ? (typeof deleteConfirmDescription === 'function' ? deleteConfirmDescription(pendingDeleteItem) : deleteConfirmDescription)
    : "Esta acción es irreversible. El registro y toda su información asociada serán eliminados permanentemente."

  const EmptyIcon = emptyState.icon

  return (
    <div className={`flex flex-col gap-4 ${className ?? ''}`}>
      {/* Toolbar */}
      <DataTableToolbar
        searchPlaceholder={searchPlaceholder}
        searchValue={searchFilter ? searchTerm : undefined}
        onSearchChange={searchFilter ? setSearchTerm : undefined}
        actionLabel={canManage ? actionLabel : undefined}
        onAction={_onAction}
      />

      {/* Empty state (when not loading and no data) */}
      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-20 bg-stone-50/50 border-2 border-dashed border-stone-200 dark:border-zinc-700 rounded-[20px] text-center">
          <div className="size-16 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
            <EmptyIcon className="size-8 text-stone-300 dark:text-zinc-600" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 dark:text-zinc-100">
            {emptyState.title}
          </h3>
          <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-xs mx-auto mt-1">
            {emptyState.description}
          </p>
        </div>
      ) : (
        <>
          <TableContainer>
            <Table>
              <TableHeader>
                <TableRow className="bg-stone-50/50 dark:bg-zinc-900/50">
                  {columns.map((col) => (
                    <TableHead
                      key={col.header}
                      className={`font-bold text-stone-900 dark:text-zinc-100 ${col.headerClassName ?? ''}`}
                    >
                      {col.header}
                    </TableHead>
                  ))}
                  {hasRowActions && (
                    <TableHead className="text-right font-bold text-stone-900 dark:text-zinc-100">
                      Acciones
                    </TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  // Skeleton rows
                  Array.from({ length: skeletonRows }).map((_, i) => (
                    <TableRow key={i} className="animate-pulse">
                      {Array.from({ length: totalCols }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-surface-container rounded w-3/4" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  paginatedData.map((item) => (
                    <TableRow
                      key={item.id}
                      className="hover:bg-stone-50/50 dark:hover:bg-zinc-800/30 transition-colors cursor-pointer group"
                      onClick={() => onView?.(item)}
                    >
                      {columns.map((col) => (
                        <TableCell
                          key={col.header}
                          className={col.className}
                        >
                          {col.cell(item)}
                        </TableCell>
                      ))}
                      {hasRowActions && (
                        <TableCell
                          className="text-right"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-end gap-1">
                            {onView && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onView(item)
                                }}
                              >
                                <Eye className="size-3.5" />
                              </Button>
                            )}
                            {_onEdit && (!canEdit || canEdit(item)) && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  _onEdit(item)
                                }}
                              >
                                <Edit2 className="size-3.5" />
                              </Button>
                            )}
                            {_onDelete && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="size-8 text-stone-400 hover:text-red-600 dark:hover:text-red-400"
                                disabled={isDeleting && pendingDeleteId === item.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleDeleteRequest(item.id)
                                }}
                              >
                                <Trash2
                                  className={`size-3.5 ${
                                    isDeleting && pendingDeleteId === item.id
                                      ? 'animate-pulse'
                                      : ''
                                  }`}
                                />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          {!isLoading && totalPages > 1 && (
            <div className="flex items-center justify-between px-2 pt-2 border-t border-stone-200 dark:border-zinc-800 mt-2">
              <p className="text-sm text-stone-500 dark:text-zinc-400">
                Mostrando {(safeCurrentPage - 1) * itemsPerPage + 1} a {Math.min(safeCurrentPage * itemsPerPage, filteredData.length)} de {filteredData.length} resultados
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safeCurrentPage === 1}
                >
                  Anterior
                </Button>
                <span className="text-sm font-medium text-stone-600 dark:text-zinc-300">
                  Página {safeCurrentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safeCurrentPage === totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      {_onDelete && (
        <ConfirmDialog
          isOpen={!!pendingDeleteId}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          isLoading={isDeleting}
          title={computedDeleteTitle}
          description={computedDeleteDescription}
          confirmLabel="Sí, eliminar"
          cancelLabel="No, cancelar"
        />
      )}
    </div>
  )
}
