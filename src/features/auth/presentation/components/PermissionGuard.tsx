import { hasPermission } from '../../infrastructure/dal'
import { ReactNode } from 'react'

interface PermissionGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
}

/**
 * Componente de servidor que protege la renderización de sus hijos
 * basándose en un permiso específico.
 */
export async function PermissionGuard({ 
  permission, 
  children, 
  fallback = null 
}: PermissionGuardProps) {
  const allowed = await hasPermission(permission)

  if (!allowed) return <>{fallback}</>

  return <>{children}</>
}
