import MaintenanceJobsPage from '@/src/features/maintenance/presentation/components/pages/MaintenanceJobsPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default function MaintenanceJobsRoute() {
  return (
    <ModuleGuard permissions={['maintenance:view', 'maintenance:manage']}>
      <MaintenanceJobsPage />
    </ModuleGuard>
  )
}
