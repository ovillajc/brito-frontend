'use client'

import React, { useState } from 'react'
import { ApplicantEntity, AtsStage, atsStageSchema } from '../../../domain/entities'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/core/presentation/components/ui/card'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { ChevronRight, ChevronLeft } from 'lucide-react'

// Utilidades para las etapas
const stageTitles: Record<AtsStage, string> = {
  postulado: 'Postulados',
  entrevista: 'Entrevistas',
  prueba_tecnica: 'Prueba Técnica',
  oferta: 'Ofertas',
  contratado: 'Contratados',
  rechazado: 'Rechazados',
}

const stageOrder = atsStageSchema.options

interface AtsKanbanBoardProps {
  initialData: ApplicantEntity[]
}

export function AtsKanbanBoard({ initialData }: AtsKanbanBoardProps) {
  const [applicants, setApplicants] = useState<ApplicantEntity[]>(initialData)

  const handleMove = (applicantId: string, direction: 'next' | 'prev') => {
    setApplicants((prev) =>
      prev.map((app) => {
        if (app.id !== applicantId) return app
        
        const currentIndex = stageOrder.indexOf(app.stage)
        const newIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
        
        if (newIndex >= 0 && newIndex < stageOrder.length) {
          return { ...app, stage: stageOrder[newIndex] }
        }
        return app
      })
    )
  }

  // Agrupar por etapa
  const columns = stageOrder.reduce((acc, stage) => {
    acc[stage] = applicants.filter(a => a.stage === stage).sort((a, b) => a.boardOrder - b.boardOrder)
    return acc
  }, {} as Record<AtsStage, ApplicantEntity[]>)

  return (
    <div className="flex gap-4 overflow-x-auto pb-4 h-[calc(100vh-250px)]">
      {stageOrder.map((stage) => (
        <div key={stage} className="flex-shrink-0 w-[300px] flex flex-col gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
          
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h3 className="font-semibold text-sm text-stone-700 uppercase tracking-wider">{stageTitles[stage]}</h3>
            <Badge variant="secondary" className="bg-white text-stone-500">{columns[stage].length}</Badge>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto pr-1">
            {columns[stage].map((applicant) => (
              <Card key={applicant.id} className="border-stone-200 shadow-sm cursor-default hover:border-[#1a5c3a]/50 transition-colors">
                <CardHeader className="p-3 pb-2 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-bold text-stone-800">
                      {applicant.firstName} {applicant.lastName}
                    </CardTitle>
                  </div>
                  <p className="text-xs font-medium text-[#1a5c3a]">{applicant.expectedRole}</p>
                </CardHeader>
                <CardContent className="p-3 pt-0 flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-[10px] text-stone-500">
                    {applicant.isOperatorRole ? 'Operativo' : 'Admin'}
                  </Badge>
                  
                  {/* Controles simples atómicos para mover tarjetas */}
                  <div className="flex gap-1">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleMove(applicant.id, 'prev')}
                      disabled={stage === stageOrder[0]}
                    >
                      <ChevronLeft className="h-3 w-3" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="h-6 w-6" 
                      onClick={() => handleMove(applicant.id, 'next')}
                      disabled={stage === stageOrder[stageOrder.length - 1]}
                    >
                      <ChevronRight className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {columns[stage].length === 0 && (
              <div className="text-center py-6 text-xs text-stone-400 border-2 border-dashed border-stone-200 rounded-lg">
                Sin candidatos
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
