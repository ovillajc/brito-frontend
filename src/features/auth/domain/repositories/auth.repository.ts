import type { Either, Failure } from '@/src/core/domain/either'
import type { AuthUserEntity } from '../entities/auth-user.entity'
import type { UserEntity } from '../entities/user.entity'
import type { LoginFormInput } from '../schemas/login.schema'

/**
 * Interfaz para el repositorio de autenticación.
 * Define el contrato para obtener el usuario autenticado y sus permisos.
 */
export type AuthProvider = 'google' | 'apple'

export interface IAuthSessionRepository {
  /**
   * Obtiene la información del usuario autenticado desde la sesión actual.
   * Incluye roles y permisos.
   */
  getAuthenticatedUser(): Promise<Either<Failure, AuthUserEntity>>
}

export interface IAuthRepository extends IAuthSessionRepository {
  loginWithEmail(credentials: LoginFormInput): Promise<Either<Failure, UserEntity>>
  loginWithProvider(provider: AuthProvider): Promise<Either<Failure, void>>
  logout(): Promise<Either<Failure, void>>
}
