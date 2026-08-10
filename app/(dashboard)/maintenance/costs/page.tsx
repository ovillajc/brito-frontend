import MaintenancePartsPage from '@/src/features/maintenance/presentation/components/pages/MaintenancePartsPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default function MaintenancePartsRoute() {
  return (
    <ModuleGuard permission="maintenance:view">
      <MaintenancePartsPage />
    </ModuleGuard>
  )
}
