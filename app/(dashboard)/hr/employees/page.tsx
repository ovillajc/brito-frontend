import React, { Suspense } from 'react'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { EmployeesTable } from '@/src/features/hr/presentation/components/organisms/EmployeesTable'

export default async function EmployeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-on-surface dark:text-zinc-100">Expediente de Empleados</h2>
      </div>
      
      <Suspense fallback={<TableSkeleton />}>
        <EmployeesContent />
      </Suspense>
    </div>
  )
}

async function EmployeesContent() {
  const result = await getEmployeesAction()

  if (!result.ok) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
        Error al cargar empleados: {result.error.message}
      </div>
    )
  }

  return <EmployeesTable initialData={result.data} />
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16 w-full animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-xl"></div>
      <div className="h-[400px] w-full animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-xl"></div>
    </div>
  )
}
