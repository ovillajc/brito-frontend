import 'server-only'
import { cache } from 'react'
import { redirect } from 'next/navigation'
import { SupabaseAuthRepository } from './repositories/supabase-auth.repository'
import { GetAuthenticatedUserUseCase } from '../application/GetAuthenticatedUser'

/**
 * Data Access Layer (DAL) para autenticación en el servidor.
 * Utiliza React cache() para evitar múltiples llamadas a la base de datos en el mismo render cycle.
 */

const authRepository = new SupabaseAuthRepository()

/**
 * Verifica la sesión del usuario y devuelve sus datos con roles y permisos.
 * Si no está autenticado, redirige al login por defecto (opcional).
 * 
 * @param shouldRedirect - Si debe redirigir al login en caso de fallo.
 */
export const verifySession = cache(async (shouldRedirect = true) => {
  const result = await GetAuthenticatedUserUseCase(authRepository)

  if (!result.ok) {
    if (shouldRedirect) {
      redirect('/login')
    }
    return null
  }

  return result.data
})

/**
 * Verifica si el usuario tiene un permiso específico.
 * 
 * @param permission - Nombre del permiso a verificar.
 */
export async function hasPermission(permission: string): Promise<boolean> {
  const user = await verifySession(false)
  if (!user) return false

  // Superadmin check
  if (user.permissions.includes('all_access')) return true

  // View All check
  if (user.permissions.includes('view_all') && permission.includes('view')) return true

  return user.permissions.includes(permission)
}

/**
 * Verifica si el usuario tiene al menos uno de los roles indicados.
 * 
 * @param roles - Lista de nombres de roles.
 */
export async function hasRole(roles: string[]): Promise<boolean> {
  const user = await verifySession(false)
  if (!user) return false

  return user.roles.some(r => roles.includes(r.name))
}
