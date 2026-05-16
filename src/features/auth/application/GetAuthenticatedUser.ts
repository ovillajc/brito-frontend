import type { Either, Failure } from '@/src/core/domain/either'
import type { AuthUserEntity } from '../domain/entities/auth-user.entity'
import type { IAuthSessionRepository } from '../domain/repositories/auth.repository'

/**
 * Caso de uso para obtener el usuario autenticado con sus capacidades.
 * 
 * @param repo - Repositorio de autenticación.
 * @returns AuthUserEntity si tiene éxito.
 */
export async function GetAuthenticatedUserUseCase(
  repo: IAuthSessionRepository
): Promise<Either<Failure, AuthUserEntity>> {
  return await repo.getAuthenticatedUser()
}
