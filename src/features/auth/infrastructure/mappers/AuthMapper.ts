import type { User } from '@supabase/supabase-js'
import type { UserEntity } from '../../domain/entities/user.entity'

/**
 * @fileoverview Mapper para la entidad de Autenticación.
 * Transforma los datos crudos de la infraestructura (Supabase) al dominio.
 */

export class AuthMapper {
  /**
   * Transforma un usuario de Supabase a una UserEntity del dominio.
   * 
   * @param supabaseUser - Objeto de usuario de Supabase.
   * @returns UserEntity
   */
  static toDomain(supabaseUser: User): UserEntity {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
      createdAt: new Date(supabaseUser.created_at),
      lastSignInAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : undefined
    }
  }
}
