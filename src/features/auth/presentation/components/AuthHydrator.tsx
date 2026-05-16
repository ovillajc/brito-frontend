'use client'

import { useEffect } from 'react'
import { useAuthStore } from '../store/auth-store'
import type { AuthUserEntity } from '../../domain/entities/auth-user.entity'

interface AuthHydratorProps {
  user: AuthUserEntity | null
}

/**
 * Componente para hidratar el store de Auth de Zustand con datos del servidor.
 */
export function AuthHydrator({ user }: AuthHydratorProps) {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return null
}
