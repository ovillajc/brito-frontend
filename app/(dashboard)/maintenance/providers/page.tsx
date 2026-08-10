import MaintenanceProvidersPage from '@/src/features/maintenance/presentation/components/pages/MaintenanceProvidersPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default function MaintenanceProvidersRoute() {
  return (
    <ModuleGuard permissions={['maintenance:view', 'maintenance:manage']}>
      <MaintenanceProvidersPage />
    </ModuleGuard>
  )
}
