/**
 * @fileoverview Entidades de dominio para la autenticación y autorización.
 */

export interface PermissionEntity {
  id: string
  name: string
  description?: string
}

export interface RoleEntity {
  id: string
  name: string
  description?: string
  permissions: PermissionEntity[]
}

/**
 * Representa al usuario autenticado con sus roles y permisos.
 */
export interface AuthUserEntity {
  id: string
  email: string
  fullName?: string
  roles: RoleEntity[]
  /** Lista aplanada de nombres de permisos para chequeo rápido */
  permissions: string[]
}
