import { Either, Failure } from '@/src/core/domain/either'
import { CompanyProfileEntity } from '../../domain/entities'
import { ICompanyProfileRepository } from '../../domain/repositories/ICompanyProfileRepository'

export async function GetCompanyProfilesUseCase(
  repository: ICompanyProfileRepository
): Promise<Either<Failure, CompanyProfileEntity[]>> {
  try {
    const companies = await repository.findAllActive()
    return { ok: true, data: companies }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'COMPANIES_FETCH_ERROR',
        message: error instanceof Error ? error.message : 'Error inesperado al obtener los perfiles de compañía',
      },
    }
  }
}
