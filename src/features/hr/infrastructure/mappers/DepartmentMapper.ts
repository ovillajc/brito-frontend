import { DepartmentEntity } from '../../domain/entities'

/**
 * Mapper para transformar datos de la base de datos a entidades de dominio.
 */
type DepartmentRow = {
  id: string
  name: string
  description: string | null
  responsible_id: string | null
  created_at: string
}

export class DepartmentMapper {
  /**
   * Mapea un payload nativo de Supabase a la entidad DepartmentEntity.
   * @param raw - Datos crudos de la tabla departments.
   */
  static toDomain(raw: DepartmentRow): DepartmentEntity {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      responsibleId: raw.responsible_id,
      createdAt: new Date(raw.created_at),
    }
  }
}
