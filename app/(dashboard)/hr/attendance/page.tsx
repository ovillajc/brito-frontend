import React, { Suspense } from 'react'
import { getAttendanceMockUseCase } from '@/src/features/hr/application/mock-hr-use-cases'
import { AttendanceLog } from '@/src/features/hr/presentation/components/organisms/AttendanceLog'
import { Button } from '@/src/core/presentation/components/ui/button'
import { FileDown } from 'lucide-react'

export default async function AttendancePage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Gestión Pre-Nómina y Asistencia</h2>
        <Button variant="outline" className="border-stone-200 text-stone-700 bg-white">
          <FileDown className="mr-2 h-4 w-4" /> Exportar Reporte
        </Button>
      </div>
      
      <Suspense fallback={<TableSkeleton />}>
        <AttendanceContent />
      </Suspense>
    </div>
  )
}

async function AttendanceContent() {
  const result = await getAttendanceMockUseCase()

  if (!result.ok) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error al cargar bitácora: {result.error.message}
      </div>
    )
  }

  return <AttendanceLog initialData={result.data} />
}

function TableSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-16 w-full animate-pulse bg-stone-100 rounded-xl"></div>
      <div className="h-[400px] w-full animate-pulse bg-stone-100 rounded-xl"></div>
    </div>
  )
}
