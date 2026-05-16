import { hasPermission } from '../../infrastructure/dal'
import { ReactNode } from 'react'
import { Unauthorized } from '@/src/core/presentation/components/organisms/Unauthorized'

interface ModuleGuardProps {
  permission?: string
  permissions?: string[]
  children: ReactNode
  title?: string
  description?: string
}

/**
 * Guard para proteger módulos completos.
 * A diferencia de PermissionGuard, este muestra una pantalla de "Acceso Denegado"
 * en lugar de simplemente no renderizar nada.
 */
export async function ModuleGuard({ 
  permission, 
  permissions,
  children, 
  title, 
  description 
}: ModuleGuardProps) {
  const permissionsToCheck = permissions ?? (permission ? [permission] : [])
  const results = await Promise.all(permissionsToCheck.map((p) => hasPermission(p)))
  const allowed = results.some(Boolean)

  if (!allowed) {
    return (
      <Unauthorized 
        title={title} 
        description={description} 
      />
    )
  }

  return <>{children}</>
}
