/**
 * @fileoverview Entidad de usuario del dominio.
 * Representa al usuario autenticado dentro de la lógica de negocio.
 */

export interface UserEntity {
  id: string
  email: string
  name?: string
  avatarUrl?: string
  createdAt: Date
  lastSignInAt?: Date
}
