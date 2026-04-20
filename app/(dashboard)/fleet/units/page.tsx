import UnitsPage from '@/src/features/fleet/presentation/components/pages/UnitsPage'

export const metadata = {
  title: 'Unidades Operativas | Sistema de Flota',
  description: 'Gestión del armado de unidades: operador, tracto y remolque',
}

export default function Page() {
  return (
    <div className="w-full">
      <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-zinc-100 mb-6">
        Unidades Operativas
      </h1>
      <UnitsPage />
    </div>
  )
}
