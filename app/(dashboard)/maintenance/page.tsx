import MaintenancePage from '@/src/features/maintenance/presentation/components/pages/MaintenancePage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export const metadata = {
  title: 'Mantenimiento | Brito',
  description: 'Bitácora de taller: estancias, órdenes de trabajo y refacciones.',
}

export default function Page() {
  return (
    <ModuleGuard permission="maintenance:view">
      <MaintenancePage />
    </ModuleGuard>
  )
}
