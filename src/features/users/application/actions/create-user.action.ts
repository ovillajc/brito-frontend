'use server'

import { createAdminClient } from '@/src/core/lib/supabase/admin'
import { Either, Failure } from '@/src/core/domain/either'
import { UserAccountEntity } from '../../domain/entities/user-account.entity'
import { revalidatePath } from 'next/cache'

interface CreateUserInput {
  email: string
  password?: string
  fullName: string
  roleIds: string[]
}

export async function createUserAdminAction(input: CreateUserInput): Promise<Either<Failure, UserAccountEntity>> {
  try {
    const supabaseAdmin = createAdminClient()

    // 1. Create the user using Supabase Admin API
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: input.email,
      password: input.password,
      email_confirm: true,
      user_metadata: { full_name: input.fullName },
    })

    if (authError || !authData.user) {
      return {
        ok: false,
        error: { code: 'AUTH_ERROR', message: authError?.message || 'Error al crear usuario' },
      }
    }

    const userId = authData.user.id

    // 2. Insert into public.profiles
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({ id: userId, full_name: input.fullName })

    if (profileError) {
      // Rollback might be necessary here, but Supabase Admin API doesn't support transactions across auth and public.
      return {
        ok: false,
        error: { code: 'PROFILE_ERROR', message: 'Error al crear perfil: ' + profileError.message },
      }
    }

    // 3. Assign roles
    if (input.roleIds && input.roleIds.length > 0) {
      const rolesToInsert = input.roleIds.map((roleId) => ({
        profile_id: userId,
        role_id: roleId,
      }))

      const { error: rolesError } = await supabaseAdmin
        .from('profiles_roles')
        .upsert(rolesToInsert, { onConflict: 'profile_id, role_id' })

      if (rolesError) {
        return {
          ok: false,
          error: { code: 'ROLES_ERROR', message: 'Error al asignar roles: ' + rolesError.message },
        }
      }
    }

    // Revalidate paths to update cached data if needed
    revalidatePath('/users')

    // Return the newly created user without returning sensitive data
    return {
      ok: true,
      data: {
        id: userId,
        email: input.email,
        fullName: input.fullName,
        roles: [], // In UI, we don't need immediate full role resolution for the return object usually, we just re-fetch the list
        createdAt: new Date(),
      },
    }
  } catch (error) {
    return {
      ok: false,
      error: { code: 'UNEXPECTED_ERROR', message: error instanceof Error ? error.message : 'Error inesperado' },
    }
  }
}
