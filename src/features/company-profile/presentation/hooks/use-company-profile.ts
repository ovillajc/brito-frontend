'use client'

import { useQuery } from '@tanstack/react-query'
import { getCompanyProfilesAction } from '../actions/company-profile.actions'
import { CompanyProfileEntity } from '../../domain/entities'

/**
 * Hook para obtener la lista de perfiles de compañía activos.
 */
export function useCompanyProfiles() {
  return useQuery({
    queryKey: ['company-profiles', 'active'],
    queryFn: async () => {
      const result = await getCompanyProfilesAction()
      if (!result.ok) throw new Error(result.error.message)
      return result.data as CompanyProfileEntity[]
    },
    staleTime: 1000 * 60 * 30, // 30 minutos (los perfiles cambian poco)
  })
}
