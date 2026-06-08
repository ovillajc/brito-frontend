import React from 'react'
import { redirect } from 'next/navigation'
import { verifySession } from '@/src/features/auth/infrastructure/dal'
import { getClientsAction } from '@/src/features/fleet/presentation/actions/client.actions'
import { ClientsTable } from '@/src/features/clients/presentation/components/organisms/ClientsTable'
import { Building2 } from 'lucide-react'

export const metadata = {
  title: 'Directorio | Brito',
  description: 'Gestión del directorio de clientes',
}

export default async function DirectoryPage() {
  const user = await verifySession()
  if (!user) redirect('/login')

  const isWalmartCoordinator = user.roles.some(r => r.name === 'coordinador_walmart')
  const isSuperUser = user.permissions.includes('all_access') || user.permissions.includes('view_all')

  if (isWalmartCoordinator && !isSuperUser) {
    redirect('/trips/list')
  }

  const result = await getClientsAction()
  const clients = result.ok ? result.data : []

  return (
    <div className="flex-1 overflow-y-auto min-h-screen">
      <div className="w-full max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3 text-stone-900 dark:text-zinc-100">
            <div className="size-10 rounded-xl bg-stone-100 dark:bg-zinc-800 flex items-center justify-center">
              <Building2 className="size-5 text-stone-600 dark:text-zinc-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Directorio de Clientes</h1>
          </div>
          <p className="text-sm text-stone-500 dark:text-zinc-400 max-w-2xl">
            Gestiona la información comercial y fiscal de tus clientes. Los clientes registrados aquí estarán disponibles al momento de planificar viajes y asignar unidades.
          </p>
        </div>

        <ClientsTable initialData={clients} />
      </div>
    </div>
  )
}
