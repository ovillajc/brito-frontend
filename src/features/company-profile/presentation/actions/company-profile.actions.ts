'use server'

import { GetCompanyProfilesUseCase } from '../../application/use-cases/GetCompanyProfilesUseCase'
import { SupabaseCompanyProfileRepository } from '../../infrastructure/repositories/SupabaseCompanyProfileRepository'

export async function getCompanyProfilesAction() {
  const repository = new SupabaseCompanyProfileRepository()
  return await GetCompanyProfilesUseCase(repository)
}
