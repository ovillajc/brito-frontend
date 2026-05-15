import { RoleEntity } from '@/src/features/auth/domain/entities/auth-user.entity'

/**
 * Entidad que representa una cuenta de usuario completa para administración.
 */
export interface UserAccountEntity {
  id: string
  email: string
  fullName?: string
  roles: RoleEntity[]
  createdAt: Date
  lastSignInAt?: Date
}

/**
 * DTO para la creación de un nuevo usuario.
 */
export interface CreateUserAccountInput {
  email: string
  fullName: string
  password?: string // Opcional, si no se provee se puede autogenerar
  roleIds: string[]
}

/**
 * DTO para la actualización de un usuario.
 */
export interface UpdateUserAccountInput {
  id: string
  fullName?: string
  roleIds?: string[]
}
