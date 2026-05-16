import type { Either, Failure } from '@/src/core/domain/either'
import type { AuthUserEntity } from '../entities/auth-user.entity'

/**
 * Interfaz para el repositorio de autenticación.
 * Define el contrato para obtener el usuario autenticado y sus permisos.
 */
export interface IAuthRepository {
  /**
   * Obtiene la información del usuario autenticado desde la sesión actual.
   * Incluye roles y permisos.
   */
  getAuthenticatedUser(): Promise<Either<Failure, AuthUserEntity>>
}
