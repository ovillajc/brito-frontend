'use client'

/**
 * @fileoverview Hooks de presentación para catálogos de gastos.
 * Usa TanStack Query con staleTime alto ya que los catálogos cambian poco.
 */

import { useQuery } from '@tanstack/react-query'
import { SupabaseExpenseCatalogsRepository } from '../../infrastructure/repositories/SupabaseExpenseCatalogsRepository'
import { GetExpenseCatalogs } from '../../application/GetExpenseCatalogs'

const catalogsRepo = new SupabaseExpenseCatalogsRepository()

/** Carga todos los catálogos necesarios para el formulario en paralelo */
export function useExpenseCatalogs() {
  return useQuery({
    queryKey: ['expense-catalogs'],
    queryFn: async () => {
      const result = await GetExpenseCatalogs(catalogsRepo)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 min — catálogos cambian poco
  })
}

/** Carga sub-categorías dependiendo de la categoría seleccionada */
export function useExpenseSubcategories(categoryId: string | null) {
  return useQuery({
    queryKey: ['expense-subcategories', categoryId],
    queryFn: async () => {
      if (!categoryId) return []
      const result = await catalogsRepo.listSubcategories(categoryId)
      if (!result.ok) throw new Error(result.error.message)
      return result.data
    },
    enabled: !!categoryId,
    staleTime: 1000 * 60 * 10,
  })
}
