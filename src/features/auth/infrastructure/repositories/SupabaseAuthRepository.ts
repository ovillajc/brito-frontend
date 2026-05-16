import { createClient } from '@/src/core/lib/supabase/client'
import type { Either, Failure } from '@/src/core/domain/either'
import type { UserEntity } from '../../domain/entities/user.entity'
import type { IAuthRepository } from '../../domain/repositories/auth.repository'
import type { LoginFormInput } from '../../domain/schemas/login.schema'
import { AuthMapper } from '../mappers/AuthMapper'
import { AuthUserEntity } from '../../domain/entities/auth-user.entity'

/**
 * @fileoverview Implementación de IAuthRepository para Supabase.
 * Se comunica con la API de Supabase Auth.
 */

export class SupabaseAuthRepository implements IAuthRepository {
  async getAuthenticatedUser(): Promise<Either<Failure, AuthUserEntity>> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()

      if (error || !user) {
        return {
          ok: false,
          error: { code: 'UNAUTHORIZED', message: 'Usuario no autenticado', statusCode: 401 },
        }
      }

      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('id, full_name, profiles_roles(roles(id, name, description, roles_permissions(permissions(id, name, description))))')
        .eq('id', user.id)
        .maybeSingle()

      if (profileError) {
        return { ok: false, error: { code: 'DB_ERROR', message: profileError.message } }
      }

      const roles: AuthUserEntity['roles'] = []
      const permissionsSet = new Set<string>()

      const profileObj = profile && typeof profile === 'object' ? profile as Record<string, unknown> : null
      const profilesRoles = profileObj?.profiles_roles

      if (Array.isArray(profilesRoles)) {
        for (const pr of profilesRoles) {
          const prObj = pr && typeof pr === 'object' ? pr as Record<string, unknown> : null
          const roleRaw = prObj?.roles
          const roleObj = roleRaw && typeof roleRaw === 'object' ? roleRaw as Record<string, unknown> : null
          if (!roleObj) continue

          const roleId = typeof roleObj.id === 'string' ? roleObj.id : null
          const roleName = typeof roleObj.name === 'string' ? roleObj.name : null
          if (!roleId || !roleName) continue

          const roleDescription = typeof roleObj.description === 'string' ? roleObj.description : undefined
          const rolePermissions: AuthUserEntity['roles'][number]['permissions'] = []

          const rolesPermissions = roleObj.roles_permissions
          if (Array.isArray(rolesPermissions)) {
            for (const rp of rolesPermissions) {
              const rpObj = rp && typeof rp === 'object' ? rp as Record<string, unknown> : null
              const permRaw = rpObj?.permissions
              const permObj = permRaw && typeof permRaw === 'object' ? permRaw as Record<string, unknown> : null
              if (!permObj) continue

              const permId = typeof permObj.id === 'string' ? permObj.id : null
              const permName = typeof permObj.name === 'string' ? permObj.name : null
              if (!permId || !permName) continue

              const permDescription = typeof permObj.description === 'string' ? permObj.description : undefined
              rolePermissions.push({ id: permId, name: permName, description: permDescription })
              permissionsSet.add(permName)
            }
          }

          roles.push({
            id: roleId,
            name: roleName,
            description: roleDescription,
            permissions: rolePermissions,
          })
        }
      }

      const fullNameFromProfile = typeof profileObj?.full_name === 'string' ? profileObj.full_name : undefined
      const meta = (user.user_metadata && typeof user.user_metadata === 'object') ? user.user_metadata as Record<string, unknown> : null
      const fullNameFromMeta =
        typeof meta?.full_name === 'string'
          ? meta.full_name
          : (typeof meta?.name === 'string' ? meta.name : undefined)

      return {
        ok: true,
        data: {
          id: user.id,
          email: user.email ?? '',
          fullName: fullNameFromProfile ?? fullNameFromMeta,
          roles,
          permissions: Array.from(permissionsSet),
        },
      }
    } catch (err) {
      return {
        ok: false,
        error: {
          code: 'UNEXPECTED',
          message: err instanceof Error ? err.message : 'Error inesperado al obtener el usuario autenticado',
        },
      }
    }
  }
  private supabase = createClient()

  async loginWithEmail(credentials: LoginFormInput): Promise<Either<Failure, UserEntity>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      })

      if (error) {
        return {
          ok: false,
          error: {
            code: error.status?.toString() || 'AUTH_ERROR',
            message: this.mapErrorMessage(error.message)
          }
        }
      }

      if (!data.user) {
        return {
          ok: false,
          error: { code: 'NO_USER', message: 'No se pudo recuperar la información del usuario.' }
        }
      }

      return {
        ok: true,
        data: AuthMapper.toDomain(data.user)
      }
    } catch (error) {
      return {
        ok: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error de conexión con el servicio de autenticación.' }
      }
    }
  }

  async loginWithProvider(provider: 'google' | 'apple'): Promise<Either<Failure, void>> {
    try {
      const { error } = await this.supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        }
      })

      if (error) {
        return {
          ok: false,
          error: { code: 'OAUTH_ERROR', message: error.message }
        }
      }

      return { ok: true, data: undefined }
    } catch (error) {
      return {
        ok: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al iniciar sesión con el proveedor.' }
      }
    }
  }

  async logout(): Promise<Either<Failure, void>> {
    try {
      const { error } = await this.supabase.auth.signOut()
      if (error) {
        return {
          ok: false,
          error: { code: 'LOGOUT_ERROR', message: error.message }
        }
      }
      return { ok: true, data: undefined }
    } catch (error) {
      return {
        ok: false,
        error: { code: 'INTERNAL_ERROR', message: 'Error al cerrar sesión.' }
      }
    }
  }

  async getCurrentUser(): Promise<Either<Failure, UserEntity | null>> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) return { ok: true, data: null }
      if (!user) return { ok: true, data: null }

      return {
        ok: true,
        data: AuthMapper.toDomain(user)
      }
    } catch (error) {
      return { ok: false, error: { code: 'SESSION_ERROR', message: 'Error al obtener la sesión.' } }
    }
  }

  private mapErrorMessage(message: string): string {
    if (message.includes('Invalid login credentials')) return 'Credenciales de acceso incorrectas.'
    if (message.includes('Email not confirmed')) return 'Por favor, confirma tu correo electrónico.'
    return message
  }
}
