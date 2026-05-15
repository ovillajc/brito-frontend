import { hasPermission } from '../../infrastructure/dal'
import { ReactNode } from 'react'
import { Unauthorized } from '@/src/core/presentation/components/organisms/Unauthorized'

interface ModuleGuardProps {
  permission: string
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
  children, 
  title, 
  description 
}: ModuleGuardProps) {
  const allowed = await hasPermission(permission)

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
