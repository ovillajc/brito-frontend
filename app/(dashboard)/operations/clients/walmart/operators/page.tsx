import React, { Suspense } from 'react'
import { getEmployeesAction } from '@/src/features/hr/presentation/actions/employee.actions'
import { WalmartOperatorsTable } from '@/src/features/operations/presentation/components/organisms/WalmartOperatorsTable'

export default async function OperatorsPage() {
  return (
    <Suspense fallback={<TableSkeleton />}>
      <OperatorsContent />
    </Suspense>
  )
}

async function OperatorsContent() {
  const result = await getEmployeesAction()

  if (!result.ok) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/30">
        Error al cargar operadores: {result.error.message}
      </div>
    )
  }

  // Filtrar solo los empleados que son operadores
  const operators = result.data.filter(emp => emp.isOperator === true)

  return (
    <div className="w-full">
      <WalmartOperatorsTable initialData={operators} />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16 w-full animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-xl"></div>
      <div className="h-[400px] w-full animate-pulse bg-stone-100 dark:bg-zinc-800/50 rounded-xl"></div>
    </div>
  )
}
