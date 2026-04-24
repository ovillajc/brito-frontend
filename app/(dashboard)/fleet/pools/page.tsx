import PoolsPage from '@/src/features/fleet/presentation/components/pages/PoolsPage'

export const metadata = {
  title: 'Pools por Cliente | Flotilla',
  description: 'Gestión de pools y asignación matricial de unidades por cliente.',
}

export default function FleetPoolsRoute() {
  return <PoolsPage />
}
