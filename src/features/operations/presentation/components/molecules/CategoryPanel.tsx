/**
 * @fileoverview Molécula: panel de contenido de la categoría seleccionada.
 * Muestra los ítems correspondientes según el ID de categoría activo.
 */

'use client'

import { ClientCard } from '@/src/features/operations/presentation/components/atoms/ClientCard'
import { OperationRow } from '@/src/features/operations/presentation/components/atoms/OperationRow'
import {
  CLIENT_OPERATIONS,
  LOGISTICS_OPERATIONS,
  ADMIN_OPERATIONS,
  RESOURCES_OPERATIONS,
} from '@/src/features/operations/infrastructure/data/operations-data'
import type { OperationCategoryId } from '@/src/features/operations/domain/entities/operation-category.entity'

interface CategoryPanelProps {
  activeCategory: OperationCategoryId
}

const CATEGORY_META: Record<OperationCategoryId, { title: string; subtitle: string }> = {
  clientes: {
    title: 'Operaciones por Cliente',
    subtitle: 'Accede a las operaciones organizadas por cuenta cliente',
  },
  logistica: {
    title: 'Logística Operativa',
    subtitle: 'Gestión de rutas, cargas y despachos',
  },
  administracion: {
    title: 'Administración',
    subtitle: 'Documentación, contratos y facturación operativa',
  },
  recursos: {
    title: 'Recursos',
    subtitle: 'Personal, unidades y equipos asignados a operaciones',
  },
}

/**
 * Panel que muestra el contenido según la categoría activa.
 */
export function CategoryPanel({ activeCategory }: CategoryPanelProps) {
  const meta = CATEGORY_META[activeCategory]

  return (
    <div className="flex flex-col gap-5 min-w-0">
      {/* Panel header */}
      <div className="flex flex-col gap-0.5">
        <h2 className="text-base font-bold text-stone-900 dark:text-zinc-100">
          {meta.title}
        </h2>
        <p className="text-[12px] text-stone-400 dark:text-zinc-500">
          {meta.subtitle}
        </p>
      </div>

      {/* Content based on category */}
      {activeCategory === 'clientes' && (
        <div className="flex flex-col gap-3">
          {CLIENT_OPERATIONS.map((client) => (
            <ClientCard key={client.id} client={client} />
          ))}

          {/* Coming soon placeholder */}
          <div className="rounded-2xl border border-dashed border-stone-200 dark:border-zinc-700 p-5 flex items-center justify-center">
            <p className="text-[12px] text-stone-400 dark:text-zinc-600 font-medium">
              + Próximos clientes en camino
            </p>
          </div>
        </div>
      )}

      {activeCategory === 'logistica' && (
        <div className="flex flex-col rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-stone-100 dark:divide-zinc-800">
          {LOGISTICS_OPERATIONS.map((op) => (
            <OperationRow key={op.id} operation={op} />
          ))}
        </div>
      )}

      {activeCategory === 'administracion' && (
        <div className="flex flex-col rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-stone-100 dark:divide-zinc-800">
          {ADMIN_OPERATIONS.map((op) => (
            <OperationRow key={op.id} operation={op} />
          ))}
        </div>
      )}

      {activeCategory === 'recursos' && (
        <div className="flex flex-col rounded-2xl border border-stone-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 overflow-hidden divide-y divide-stone-100 dark:divide-zinc-800">
          {RESOURCES_OPERATIONS.map((op) => (
            <OperationRow key={op.id} operation={op} />
          ))}
        </div>
      )}
    </div>
  )
}
