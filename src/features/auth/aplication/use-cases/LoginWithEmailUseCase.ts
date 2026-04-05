import type { Either, Failure } from '@/src/core/domain/either'
import type { UserEntity } from '../../domain/entities/user.entity'
import type { IAuthRepository } from '../../domain/repositories/auth.repository'
import type { LoginFormInput } from '../../domain/schemas/login.schema'

/**
 * @fileoverview Caso de uso para el inicio de sesión.
 * Orquesta la llamada al repositorio y maneja las respuestas siguiendo el patrón Either.
 */

/**
 * Caso de uso para iniciar sesión con email y contraseña.
 * 
 * @param authRepository - Implementación del repositorio de autenticación.
 * @param credentials - Datos de acceso (email, password).
 * @returns Either<Failure, UserEntity>
 */
export async function LoginWithEmailUseCase(
  authRepository: IAuthRepository,
  credentials: LoginFormInput
): Promise<Either<Failure, UserEntity>> {
  try {
    // Podríamos añadir lógica de negocio adicional aquí si fuera necesario
    // (ej. verificar si el usuario tiene una cuenta activa antes de devolver el éxito)
    
    const result = await authRepository.loginWithEmail(credentials)

    if (!result.ok) {
      return {
        ok: false,
        error: result.error
      }
    }

    return {
      ok: true,
      data: result.data
    }
  } catch (error) {
    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message: 'Ocurrió un error inesperado durante el inicio de sesión.'
      }
    }
  }
}
