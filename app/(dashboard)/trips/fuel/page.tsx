import FuelMetricsPage from '@/src/features/trips/presentation/components/pages/FuelMetricsPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'

export default function FuelMetricsRoute() {
  return (
    <ModuleGuard 
      permission="fuel:manage" 
      title="Rendimientos Protegidos"
      description="Solo el personal administrativo con permisos de combustible puede ver las métricas de rendimiento."
    >
      <FuelMetricsPage />
    </ModuleGuard>
  )
}
