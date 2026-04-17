import { DepartmentEntity } from '../../domain/entities'

/**
 * Mapper para transformar datos de la base de datos a entidades de dominio.
 */
export class DepartmentMapper {
  /**
   * Mapea un payload nativo de Supabase a la entidad DepartmentEntity.
   * @param raw - Datos crudos de la tabla departments.
   */
  static toDomain(raw: Record<string, any>): DepartmentEntity {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description,
      responsibleId: raw.responsible_id,
      createdAt: new Date(raw.created_at),
    }
  }
}
