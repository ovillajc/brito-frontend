import FuelMetricsPage from '@/src/features/trips/presentation/components/pages/FuelMetricsPage'
import { ModuleGuard } from '@/src/features/auth/presentation/components/ModuleGuard'
import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { redirect } from 'next/navigation'

export default async function FuelMetricsRoute() {
  const user = await verifySession()
  if (user?.roles.some(r => r.name === 'apoyo_finanzas_full' || r.name === 'controlador_gastos')) {
    redirect('/trips/fuel/load')
  }
  if (user?.roles.some(r =>
    r.name === 'jefe_logistica' ||
    r.name === 'jefe_logisitica' ||
    r.name === 'auxiliar_logistica' ||
    r.name === 'auxiliar_logisitica'
  )) {
    redirect('/trips/list')
  }

  return (
    <ModuleGuard 
      permissions={['fuel:manage', 'fuel_metrics:view']}
      title="Rendimientos Protegidos"
      description="Solo el personal administrativo con permisos de combustible puede ver las métricas de rendimiento."
    >
      <FuelMetricsPage />
    </ModuleGuard>
  )
}
