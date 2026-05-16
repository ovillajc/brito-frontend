import { create } from 'zustand'
import type { AuthUserEntity } from '../../domain/entities/auth-user.entity'

interface AuthState {
  user: AuthUserEntity | null
  isAuthenticated: boolean
  setUser: (user: AuthUserEntity | null) => void
  /**
   * Verifica si el usuario tiene un permiso específico (uso en cliente).
   */
  hasPermission: (permission: string) => boolean
}

/**
 * Store de Zustand para manejar el estado de autenticación en el cliente.
 * Sigue las reglas de selectores atómicos de AGENTS.md.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  hasPermission: (permission) => {
    const user = get().user
    if (!user) return false
    if (user.permissions.includes('all_access')) return true
    if (permission && user.permissions.includes('view_all') && permission.includes('view')) return true
    return permission ? user.permissions.includes(permission) : false
  }
}))
