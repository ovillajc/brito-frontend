import type { Either, Failure } from '@/src/core/domain/either'
import type { Lead } from '../entities/lead'

/**
 * Interfaz para el repositorio de Leads.
 * Define el contrato que debe seguir cualquier implementación de infraestructura.
 */
export interface ILeadRepository {
  /**
   * Registra un nuevo lead en el sistema.
   * 
   * @param lead - Los datos del lead a persistir.
   * @returns Un objeto Either con Failure o con los datos del lead registrados satisfactoriamente.
   */
  create(lead: Lead): Promise<Either<Failure, Lead>>
}
