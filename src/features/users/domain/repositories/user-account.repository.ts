import { Either, Failure } from '@/src/core/domain/either'
import { UserAccountEntity, CreateUserAccountInput, UpdateUserAccountInput } from '../entities/user-account.entity'
import type { RoleEntity } from '@/src/features/auth/domain/entities/auth-user.entity'

/**
 * Interfaz para el repositorio de administración de usuarios.
 */
export interface IUserAccountRepository {
  /**
   * Obtiene todos los usuarios del sistema con sus roles.
   */
  findAll(): Promise<Either<Failure, UserAccountEntity[]>>

  /**
   * Crea un nuevo usuario en Auth y vincula su perfil/roles.
   */
  create(input: CreateUserAccountInput): Promise<Either<Failure, UserAccountEntity>>

  /**
   * Actualiza los datos del perfil y los roles de un usuario.
   */
  update(input: UpdateUserAccountInput): Promise<Either<Failure, UserAccountEntity>>

  /**
   * Elimina un usuario (Auth y Perfil).
   */
  delete(id: string): Promise<Either<Failure, void>>

  /**
   * Obtiene la lista de roles disponibles.
   */
  getRoles(): Promise<Either<Failure, RoleEntity[]>>
}
