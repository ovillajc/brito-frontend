import { ClientPoolEntity } from "../entities"

export interface AvailableUnitForClientEntity {
  id: string
  name: string
  economicNumber: string
  clientPoolId: string | null
}

export interface IClientPoolRepository {
  findAll(): Promise<ClientPoolEntity[]>
  findByClientId(clientId: string): Promise<ClientPoolEntity[]>
  findById(id: string): Promise<ClientPoolEntity | null>
  create(pool: Partial<ClientPoolEntity>): Promise<ClientPoolEntity>
  update(id: string, pool: Partial<ClientPoolEntity>): Promise<ClientPoolEntity>
  delete(id: string): Promise<void>
  
  /**
   * Asigna un conjunto de unidades armadas a un pool específico.
   * @param poolId ID del pool
   * @param unitIds IDs de las unidades armadas
   */
  assignUnits(poolId: string, unitIds: string[]): Promise<void>
  
  /**
   * Obtiene las unidades armadas disponibles (no asignadas a este pool o a ninguno)
   * para un cliente específico.
   */
  getAvailableUnitsForClient(clientId: string): Promise<AvailableUnitForClientEntity[]>
}
