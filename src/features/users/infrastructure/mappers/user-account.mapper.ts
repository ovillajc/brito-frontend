import { UserAccountEntity } from '../../domain/entities/user-account.entity'

/** DTO devuelto por la RPC get_users_with_roles */
interface UserWithRolesRaw {
  id: string
  email: string
  full_name: string | null
  created_at: string
  last_sign_in_at: string | null
  roles: Array<{ id: string; name: string; description: string | null }>
}

export class UserAccountMapper {
  /**
   * Mapea un registro de la RPC `get_users_with_roles` a la entidad de dominio.
   * Soporta el formato plano `roles: [{id, name, description}]` devuelto por la RPC.
   */
  static toDomain(raw: UserWithRolesRaw): UserAccountEntity {
    return {
      id: raw.id,
      email: raw.email || '',
      fullName: raw.full_name ?? '',
      createdAt: new Date(raw.created_at),
      lastSignInAt: raw.last_sign_in_at ? new Date(raw.last_sign_in_at) : undefined,
      roles: (raw.roles || []).map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description ?? '',
        permissions: [], // No cargamos permisos detallados aquí por performance
      })),
    }
  }
}
