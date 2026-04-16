import React, { Suspense } from 'react'
import { getEmployeesMockUseCase } from '@/src/features/hr/application/mock-hr-use-cases'
import { EmployeesTable } from '@/src/features/hr/presentation/components/organisms/EmployeesTable'

export default async function EmployeesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Expediente de Empleados</h2>
      </div>
      
      <Suspense fallback={<TableSkeleton />}>
        <EmployeesContent />
      </Suspense>
    </div>
  )
}

async function EmployeesContent() {
  const result = await getEmployeesMockUseCase()

  if (!result.ok) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error al cargar empleados: {result.error.message}
      </div>
    )
  }

  return <EmployeesTable initialData={result.data} />
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16 w-full animate-pulse bg-stone-100 rounded-xl"></div>
      <div className="h-[400px] w-full animate-pulse bg-stone-100 rounded-xl"></div>
    </div>
  )
}
