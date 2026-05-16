import { createClient } from '@/src/core/lib/supabase/server'
import type { IAuthSessionRepository } from '../../domain/repositories/auth.repository'
import type { AuthUserEntity } from '../../domain/entities/auth-user.entity'
import type { Either, Failure } from '@/src/core/domain/either'
import { AuthMapper } from '../mappers/auth.mapper'

/**
 * Implementación de IAuthRepository utilizando Supabase.
 */
export class SupabaseAuthRepository implements IAuthSessionRepository {
  async getAuthenticatedUser(): Promise<Either<Failure, AuthUserEntity>> {
    try {
      const supabase = await createClient()
      
      // 1. Obtener el usuario de la sesión
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError || !user) {
        return {
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'No hay sesión activa' }
        }
      }

      // 2. Obtener el perfil con roles y permisos
      const { data: profile, error: dbError } = await supabase
        .from('profiles')
        .select(`
          id,
          full_name,
          profiles_roles (
            roles (
              id,
              name,
              description,
              roles_permissions (
                permissions (
                  id,
                  name,
                  description
                )
              )
            )
          )
        `)
        .eq('id', user.id)
        .single()

      if (dbError || !profile) {
        // Si no hay perfil, devolvemos un usuario básico sin permisos
        return {
          ok: true,
          data: {
            id: user.id,
            email: user.email!,
            roles: [],
            permissions: []
          }
        }
      }

      return {
        ok: true,
        data: AuthMapper.toDomain(profile, user.email!)
      }
    } catch (err) {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_AUTH_ERROR', message: 'Error al verificar autenticación' }
      }
    }
  }
}
