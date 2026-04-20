import { CompanyProfileEntity } from '../entities'

export interface ICompanyProfileRepository {
  /**
   * Obtiene todos los perfiles de compañía activos.
   */
  findAllActive(): Promise<CompanyProfileEntity[]>
  
  /**
   * Obtiene un perfil de compañía por su ID.
   * @param id El UUID de la compañía.
   */
  findById(id: string): Promise<CompanyProfileEntity | null>
}
