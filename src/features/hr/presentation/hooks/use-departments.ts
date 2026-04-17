import { useQuery } from '@tanstack/react-query'
import { getDepartmentsAction } from '../actions/employee.actions'

/**
 * Hook para obtener la lista de departamentos con TanStack Query.
 * Maneja el estado de carga, error y caché automáticamente.
 */
export function useDepartments() {
  return useQuery({
    queryKey: ['departments'],
    queryFn: async () => {
      const result = await getDepartmentsAction()
      if (!result.ok) {
        throw new Error(result.error.message)
      }
      return result.data
    },
    staleTime: 1000 * 60 * 10, // 10 minutos (los departamentos no cambian seguido)
  })
}
