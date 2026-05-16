import UsersListPage from '@/src/features/users/presentation/pages/UsersListPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Usuarios | Brito ERP',
  description: 'Gestión de cuentas y roles de usuario.'
}

export default function UsersPage() {
  return (
    <ModuleGuard 
      permission="all_access" 
      title="Acceso de Administrador Requerido"
      description="Este módulo es exclusivo para el desarrollador y administradores de alto nivel."
    >
      <UsersListPage />
    </ModuleGuard>
  )
}
