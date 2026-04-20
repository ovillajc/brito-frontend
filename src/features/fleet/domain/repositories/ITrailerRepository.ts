import { TrailerEntity, TrailerModelEntity } from '../entities'

export interface ITrailerRepository {
  /**
   * Obtiene todos los remolques activos/existentes.
   */
  findAll(): Promise<TrailerEntity[]>
  
  /**
   * Obtiene un remolque por su ID.
   * @param id El UUID del remolque.
   */
  findById(id: string): Promise<TrailerEntity | null>

  /**
   * Crea un nuevo remolque.
   * @param data Datos parciales para creación.
   */
  create(data: Partial<TrailerEntity>): Promise<TrailerEntity>

  /**
   * Actualiza un remolque existente.
   * @param id UUID del remolque.
   * @param data Datos a actualizar.
   */
  update(id: string, data: Partial<TrailerEntity>): Promise<TrailerEntity>

  /**
   * Elimina permanentemente un remolque.
   * @param id UUID del remolque.
   */
  delete(id: string): Promise<void>
}

export interface ITrailerModelRepository {
  /**
   * Obtiene todos los modelos de remolque registrados.
   */
  findAll(): Promise<TrailerModelEntity[]>
}
