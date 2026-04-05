import { createClient } from '@/src/core/lib/supabase/client'
import type { Either, Failure } from '@/src/core/domain/either'
import type { UserEntity } from '../../domain/entities/user.entity'
import type { IAuthRepository } from '../../domain/repositories/auth.repository'
import type { LoginFormInput } from '../../domain/schemas/login.schema'
import { AuthMapper } from '../mappers/AuthMapper'

/**
 * @fileoverview Implementación de IAuthRepository para Supabase.
 * Se comunica con la API de Supabase Auth.
 */

export class SupabaseAuthRepository implements IAuthRepository {
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
