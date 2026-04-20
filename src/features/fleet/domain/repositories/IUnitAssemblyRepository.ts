import { UnitAssemblyEntity, UnitAssemblyLogEntity } from '../entities'

export interface IUnitAssemblyRepository {
  /** Obtiene todas las unidades armadas. */
  findAll(): Promise<UnitAssemblyEntity[]>

  /** Obtiene una unidad por ID. */
  findById(id: string): Promise<UnitAssemblyEntity | null>

  /** Crea una nueva unidad armada. */
  create(data: Partial<UnitAssemblyEntity>, profileId?: string): Promise<UnitAssemblyEntity>

  /** Actualiza una unidad existente. */
  update(id: string, data: Partial<UnitAssemblyEntity>, profileId?: string): Promise<UnitAssemblyEntity>

  /** Elimina una unidad. */
  delete(id: string): Promise<void>

  /** Libera un remolque de cualquier unidad a la que esté asignado actualmente. */
  detachTrailerFromOthers(trailerId: string, currentUnitId?: string, profileId?: string): Promise<void>

  /** Obtiene el historial de logs de una unidad. */
  getLogsByUnitId(unitId: string): Promise<UnitAssemblyLogEntity[]>
}
