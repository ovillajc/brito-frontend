import React, { Suspense } from 'react'
import { getWalmartStoresAction } from '@/src/features/operations/presentation/actions/walmart-store.actions'
import { WalmartStoresTable } from '@/src/features/operations/presentation/components/organisms/WalmartStoresTable'

export default async function DettesPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <DettesContent />
    </Suspense>
  )
}

async function DettesContent() {
  const result = await getWalmartStoresAction()

  if (!result.ok) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
        Error al cargar las tiendas: {result.error.message}
      </div>
    )
  }

  return <WalmartStoresTable initialData={result.data} />
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16 w-full animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-xl" />
      <div className="h-[400px] w-full animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-xl" />
    </div>
  )
}
