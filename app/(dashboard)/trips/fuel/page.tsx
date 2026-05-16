import FuelMetricsPage from '@/src/features/trips/presentation/components/pages/FuelMetricsPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { redirect } from 'next/navigation'

export default async function FuelMetricsRoute() {
  const user = await verifySession()
  if (user?.roles.some(r => r.name === 'apoyo_finanzas_full')) {
    redirect('/trips/fuel/load')
  }

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
