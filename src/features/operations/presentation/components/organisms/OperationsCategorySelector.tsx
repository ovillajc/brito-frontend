/**
 * @fileoverview Organismo: selector de categorías de operación con panel dinámico.
 * Compone la rejilla de tabs de categoría + el panel de contenido activo.
 */

'use client'

import { useState } from 'react'
import { CategoryTab } from '@/src/features/operations/presentation/components/atoms/CategoryTab'
import { CategoryPanel } from '@/src/features/operations/presentation/components/molecules/CategoryPanel'
import { OPERATION_CATEGORIES } from '@/src/features/operations/infrastructure/data/operations-data'
import type { OperationCategoryId } from '@/src/features/operations/domain/entities/operation-category.entity'

/**
 * Selector de categorías de operación con panel de contenido reactivo.
 */
export function OperationsCategorySelector() {
  const [activeCategory, setActiveCategory] = useState<OperationCategoryId>('clientes')

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6 items-start">
      {/* Left: Category tabs */}
      <div className="grid grid-cols-2 lg:grid-cols-1 gap-2.5">
        {OPERATION_CATEGORIES.map((category) => (
          <CategoryTab
            key={category.id}
            category={category}
            isActive={activeCategory === category.id}
            onClick={() => setActiveCategory(category.id)}
          />
        ))}
      </div>

      {/* Right: Content panel */}
      <div className="min-w-0">
        <CategoryPanel activeCategory={activeCategory} />
      </div>
    </div>
  )
}
