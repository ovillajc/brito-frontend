import MaintenanceStaysPage from '@/src/features/maintenance/presentation/components/pages/MaintenanceStaysPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default function MaintenanceStaysRoute() {
  return (
    <ModuleGuard permissions={['maintenance:view', 'maintenance:manage']}>
      <MaintenanceStaysPage />
    </ModuleGuard>
  )
}
