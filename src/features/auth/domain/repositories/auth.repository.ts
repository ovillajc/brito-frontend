import type { Either, Failure } from '@/src/core/domain/either'
import type { UserEntity } from '../entities/user.entity'
import { LoginFormInput } from '../schemas/login.schema'

/**
 * @fileoverview Interfaz del repositorio de autenticación.
 * Define las operaciones permitidas para la gestión de usuarios.
 */

export interface IAuthRepository {
  /**
   * Inicia sesión utilizando correo electrónico y contraseña.
   */
  loginWithEmail(credentials: LoginFormInput): Promise<Either<Failure, UserEntity>>

  /**
   * Inicia sesión con un proveedor externo (Google, Apple, etc.).
   */
  loginWithProvider(provider: 'google' | 'apple'): Promise<Either<Failure, void>>

  /**
   * Cierra la sesión del usuario actual.
   */
  logout(): Promise<Either<Failure, void>>

  /**
   * Obtiene el usuario autenticado actualmente.
   */
  getCurrentUser(): Promise<Either<Failure, UserEntity | null>>
}
