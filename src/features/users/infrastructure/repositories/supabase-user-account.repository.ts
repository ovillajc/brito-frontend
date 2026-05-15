import { createClient } from '@/src/core/lib/supabase/client'
import { Either, Failure } from '@/src/core/domain/either'
import { IUserAccountRepository } from '../../domain/repositories/user-account.repository'
import { UserAccountEntity, CreateUserAccountInput, UpdateUserAccountInput } from '../../domain/entities/user-account.entity'
import { UserAccountMapper } from '../mappers/user-account.mapper'

/**
 * Implementación de IUserAccountRepository utilizando Supabase.
 * Utiliza vistas y RPCs personalizadas para gestionar datos de Auth y Public.
 */
export class SupabaseUserAccountRepository implements IUserAccountRepository {
  private supabase = createClient()

  async findAll(): Promise<Either<Failure, UserAccountEntity[]>> {
    try {
      // Usamos la RPC get_users_with_roles que une auth.users, profiles y roles
      // vía SQL directamente (PostgREST no puede navegar FKs desde vistas)
      const { data, error } = await this.supabase.rpc('get_users_with_roles')

      if (error) {
        return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      }

      return {
        ok: true,
        data: (data || []).map(UserAccountMapper.toDomain)
      }
    } catch (err) {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error inesperado al listar usuarios' } }
    }
  }

  async create(input: CreateUserAccountInput): Promise<Either<Failure, UserAccountEntity>> {
    try {
      const { data, error } = await this.supabase.rpc('create_user_admin', {
        p_email: input.email,
        p_password: input.password || 'abc123',
        p_full_name: input.fullName,
        p_role_ids: input.roleIds
      })

      if (error) {
        return { ok: false, error: { code: 'CREATE_ERROR', message: error.message } }
      }

      // Devolver el usuario creado recargándolo
      const allUsers = await this.findAll()
      if (allUsers.ok) {
        const user = allUsers.data.find(u => u.id === data)
        if (user) return { ok: true, data: user }
      }

      return { ok: false, error: { code: 'LOAD_ERROR', message: 'Usuario creado pero no se pudo cargar' } }
    } catch (err) {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error inesperado al crear usuario' } }
    }
  }

  async update(input: UpdateUserAccountInput): Promise<Either<Failure, UserAccountEntity>> {
    try {
      // Actualizar nombre completo en el perfil
      if (input.fullName) {
        const { error: profileError } = await this.supabase
          .from('profiles')
          .update({ full_name: input.fullName })
          .eq('id', input.id)

        if (profileError) return { ok: false, error: { code: 'PROFILE_UPDATE_ERROR', message: profileError.message } }
      }

      // Actualizar roles
      if (input.roleIds) {
        // 1. Eliminar roles actuales
        await this.supabase.from('profiles_roles').delete().eq('profile_id', input.id)
        
        // 2. Insertar nuevos
        const roleInserts = input.roleIds.map(roleId => ({
          profile_id: input.id,
          role_id: roleId
        }))
        
        const { error: roleError } = await this.supabase
          .from('profiles_roles')
          .insert(roleInserts)

        if (roleError) return { ok: false, error: { code: 'ROLE_UPDATE_ERROR', message: roleError.message } }
      }

      // Devolver actualizado
      const allUsers = await this.findAll()
      if (allUsers.ok) {
        const user = allUsers.data.find(u => u.id === input.id)
        if (user) return { ok: true, data: user }
      }

      return { ok: false, error: { code: 'LOAD_ERROR', message: 'Usuario actualizado pero no se pudo cargar' } }
    } catch (err) {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error inesperado al actualizar usuario' } }
    }
  }

  async delete(id: string): Promise<Either<Failure, void>> {
    try {
      const { error } = await this.supabase.rpc('delete_user_admin', {
        p_user_id: id
      })

      if (error) {
        return { ok: false, error: { code: 'DELETE_ERROR', message: error.message } }
      }

      return { ok: true, data: undefined }
    } catch (err) {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error inesperado al eliminar usuario' } }
    }
  }

  async getRoles(): Promise<Either<Failure, any[]>> {
    try {
      const { data, error } = await this.supabase
        .from('roles')
        .select('id, name, description')

      if (error) return { ok: false, error: { code: 'DB_ERROR', message: error.message } }
      return { ok: true, data: data || [] }
    } catch (err) {
      return { ok: false, error: { code: 'UNEXPECTED', message: 'Error al obtener roles' } }
    }
  }
}
