import { Either, Failure } from '@/src/core/domain/either'
import { UserAccountEntity } from '../../domain/entities/user-account.entity'
import { IUserAccountRepository } from '../../domain/repositories/user-account.repository'

/**
 * Caso de uso para obtener la lista de usuarios administrables.
 */
export async function GetUserAccounts(
  repo: IUserAccountRepository
): Promise<Either<Failure, UserAccountEntity[]>> {
  return repo.findAll()
}
