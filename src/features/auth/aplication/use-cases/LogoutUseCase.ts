import type { Either, Failure } from '@/src/core/domain/either'
import type { IAuthRepository } from '../../domain/repositories/auth.repository'

/**
 * Caso de uso para cerrar la sesión del usuario actual.
 *
 * @param repository - Implementación del repositorio de autenticación
 * @returns Either con Failure o void si fue exitoso
 */
export async function LogoutUseCase(
  repository: IAuthRepository
): Promise<Either<Failure, void>> {
  return await repository.logout()
}
