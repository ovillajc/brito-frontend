import React, { Suspense } from 'react'
import { getApplicantsMockUseCase } from '@/src/features/hr/application/mock-hr-use-cases'
import { AtsKanbanBoard } from '@/src/features/hr/presentation/components/organisms/AtsKanbanBoard'
import { Button } from '@/src/core/presentation/components/ui/button'
import { UserPlus } from 'lucide-react'

export default async function RecruitmentPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-on-surface">Reclutamiento (ATS)</h2>
        <Button className="bg-[#1a5c3a] hover:bg-[#1a5c3a]/90 text-white">
          <UserPlus className="mr-2 h-4 w-4" /> Nuevo Candidato
        </Button>
      </div>
      
      <Suspense fallback={<KanbanSkeleton />}>
        <RecruitmentContent />
      </Suspense>
    </div>
  )
}

async function RecruitmentContent() {
  const result = await getApplicantsMockUseCase()

  if (!result.ok) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error al cargar candidatos: {result.error.message}
      </div>
    )
  }

  return <AtsKanbanBoard initialData={result.data} />
}

function KanbanSkeleton() {
  return (
    <div className="flex gap-4 overflow-hidden h-[calc(100vh-250px)]">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="flex-shrink-0 w-[300px] flex flex-col gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
          <div className="h-6 w-1/2 animate-pulse bg-stone-200 rounded"></div>
          <div className="h-24 w-full animate-pulse bg-stone-200 rounded-xl"></div>
          <div className="h-24 w-full animate-pulse bg-stone-200 rounded-xl"></div>
        </div>
      ))}
    </div>
  )
}
