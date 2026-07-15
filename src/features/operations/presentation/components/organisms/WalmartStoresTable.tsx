'use client'

import React, { useState } from 'react'
import { Store } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { CrudDataTable, type CrudColumn } from '@/src/core/presentation/components/organisms/CrudDataTable'
import { WalmartStoreEntity } from '@/src/features/operations/domain/entities/walmart-store.entity'
import { deleteWalmartStoreAction } from '@/src/features/operations/presentation/actions/walmart-store.actions'
import { WalmartStoreFormDialog } from './WalmartStoreFormDialog'

interface WalmartStoresTableProps {
  initialData: WalmartStoreEntity[]
}

const STORE_COLUMNS: CrudColumn<WalmartStoreEntity>[] = [
  {
    header: 'Nombre',
    cell: (item) => (
      <span className="font-semibold text-stone-900 dark:text-zinc-100">{item.name}</span>
    ),
    accessor: (item) => item.name,
  },
  {
    header: 'Código',
    cell: (item) => (
      <span className="font-mono text-sm text-stone-600 dark:text-zinc-400">
        {item.storeCode ?? '—'}
      </span>
    ),
    accessor: (item) => item.storeCode ?? '',
  },
  {
    header: 'Ubicación',
    cell: (item) => item.location ?? '—',
    accessor: (item) => item.location ?? '',
  },
  {
    header: 'C.P.',
    cell: (item) => item.postalCode ?? '—',
    accessor: (item) => item.postalCode ?? '',
  },
  {
    header: 'Tipo',
    cell: (item) => item.storeType ?? '—',
    accessor: (item) => item.storeType ?? '',
  },
  {
    header: 'Estatus',
    cell: (item) => (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          item.isActive
            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400'
            : 'bg-stone-100 text-stone-500 dark:bg-zinc-800 dark:text-zinc-500'
        }`}
      >
        {item.isActive ? 'Activa' : 'Inactiva'}
      </span>
    ),
    accessor: (item) => (item.isActive ? 'Activa' : 'Inactiva'),
  },
]

/**
 * Organismo de tabla CRUD para las tiendas Walmart.
 * Renderiza la tabla con datos reales y gestiona las acciones de creación, edición y eliminación.
 */
export function WalmartStoresTable({ initialData }: WalmartStoresTableProps) {
  const router = useRouter()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingStore, setEditingStore] = useState<WalmartStoreEntity | null>(null)

  const handleEdit = (store: WalmartStoreEntity) => {
    setEditingStore(store)
    setIsDialogOpen(true)
  }

  const handleCreate = () => {
    setEditingStore(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditingStore(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    const result = await deleteWalmartStoreAction(id)
    if (result.ok) {
      router.refresh()
      toast.success('Tienda eliminada correctamente')
    } else {
      toast.error(result.error?.message ?? 'Error al eliminar la tienda')
    }
    return result
  }

  return (
    <>
      <CrudDataTable<WalmartStoreEntity>
        data={initialData}
        isLoading={false}
        columns={STORE_COLUMNS}
        searchPlaceholder="Buscar tienda por nombre o código..."
        searchFilter={(store, term) =>
          [store.name, store.storeCode, store.location, store.postalCode]
            .some((val) => val?.toLowerCase().includes(term))
        }
        actionLabel="Nueva Tienda"
        onAction={handleCreate}
        onEdit={handleEdit}
        onDelete={handleDelete}
        deleteConfirmTitle={(store) => `¿Eliminar "${store.name}"?`}
        deleteConfirmDescription="Esta acción no se puede deshacer. La tienda será eliminada permanentemente."
        emptyState={{
          icon: Store,
          title: 'Sin tiendas registradas',
          description: 'Comienza agregando la primera tienda Walmart.',
        }}
      />

      <WalmartStoreFormDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        store={editingStore}
      />
    </>
  )
}
