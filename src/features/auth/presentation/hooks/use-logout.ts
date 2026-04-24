'use client'

import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { useAuthStore } from '../store'
import { LogoutUseCase } from '../../aplication/use-cases/LogoutUseCase'
import { SupabaseAuthRepository } from '../../infraestructure/repositories/SupabaseAuthRepository'

/**
 * Hook para manejar el cierre de sesión del usuario.
 * Coordina la comunicación con el caso de uso de logout, la limpieza del store local
 * y la redirección a la página de login.
 */
export function useLogout() {
  const logoutState = useAuthStore((state) => state.logout)
  const router = useRouter()

  const handleLogout = async () => {
    const repository = new SupabaseAuthRepository()
    
    try {
      const result = await LogoutUseCase(repository)

      if (result.ok) {
        // Limpiar Cookies
        document.cookie.split(';').forEach((c) => {
          document.cookie = c
            .replace(/^ +/, '')
            .replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/')
        })

        // Limpiar Local Storage
        localStorage.clear()

        logoutState() // Limpia el estado de Zustand
        
        router.push('/login')
        toast.success('Sesión cerrada correctamente')
      } else {
        toast.error(result.error.message || 'Error al cerrar sesión')
      }
    } catch {
      toast.error('Ocurrió un error inesperado al intentar cerrar sesión')
    }
  }

  return { handleLogout }
}
