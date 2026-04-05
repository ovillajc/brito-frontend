import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { UserEntity } from '../domain/entities/user.entity'

/**
 * @fileoverview Store de Zustand para la gestión de autenticación.
 * Almacena la información del usuario y el estado de la sesión.
 * Sigue la regla de no desestructurar el store completo en los componentes.
 */

interface AuthState {
  user: UserEntity | null
  isAuthenticated: boolean
  isLoading: boolean
  setUser: (user: UserEntity | null) => void
  setLoading: (isLoading: boolean) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isAuthenticated: false,
        isLoading: false,

        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user,
          isLoading: false 
        }),

        setLoading: (isLoading) => set({ isLoading }),

        logout: () => set({ 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        }),
      }),
      {
        name: 'brito-auth-storage',
      }
    )
  )
)
