/**
 * @fileoverview Modal de Armado de Unidades.
 * Contiene el wizard para configurar una unidad operativa.
 */

'use client'

import React, { useState } from 'react'
import { 
  useTractors, 
  useTrailers, 
  useOperators, 
  useClients 
} from '@/src/features/fleet/presentation/hooks/use-fleet'
import type { 
  TractorEntity, 
  TrailerEntity, 
  OperatorEntity, 
  ClientEntity 
} from '@/src/features/fleet/domain/entities'
import { useFleetStore } from '@/src/features/fleet/presentation/store'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Button } from '@/src/core/presentation/components/ui/button'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { 
  Truck, 
  Package, 
  Users, 
  Building2, 
  CheckCircle2, 
  ChevronRight, 
  ChevronLeft,
  Search,
  AlertCircle
} from 'lucide-react'

interface UnitAssemblyModalProps {
  isOpen: boolean
  onClose: () => void
}

const STEPS = [
  { id: 1, name: 'Tracto', icon: Truck },
  { id: 2, name: 'Remolque', icon: Package },
  { id: 3, name: 'Operador', icon: Users },
  { id: 4, name: 'Cliente', icon: Building2 },
  { id: 5, name: 'Confirmar', icon: CheckCircle2 },
]

export function UnitAssemblyModal({ isOpen, onClose }: UnitAssemblyModalProps) {
  const [currentStep, setCurrentStep] = useState(1)
  
  // Store
  const { 
    selectedTractor, setSelectedTractor,
    selectedTrailer, setSelectedTrailer,
    selectedOperator, setSelectedOperator,
    selectedClient, setSelectedClient,
    resetSelection
  } = useFleetStore()

  // Queries
  const { data: tractors, isLoading: loadingTractors } = useTractors()
  const { data: trailers, isLoading: loadingTrailers } = useTrailers()
  const { data: operators, isLoading: loadingOperators } = useOperators()
  const { data: clients, isLoading: loadingClients } = useClients()

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length))
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1))

  const isStepComplete = (step: number) => {
    if (step === 1) return !!selectedTractor
    if (step === 2) return !!selectedTrailer
    if (step === 3) return !!selectedOperator
    if (step === 4) return !!selectedClient
    return true
  }

  const handleFinish = () => {
    // Aquí se llamaría al UseCase de AssembleUnit (Simulado)
    resetSelection()
    setCurrentStep(1)
    onClose()
  }

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={() => {
        resetSelection()
        setCurrentStep(1)
        onClose()
      }}
      size="xl"
      title="Armado de Unidad Operativa"
      description="Sigue los pasos para configurar una nueva unidad."
    >
      <div className="flex flex-col gap-6 p-6">
        {/* Stepper */}
        <nav className="flex justify-between items-center px-4 mb-4">
          {STEPS.map((step) => {
            const isActive = currentStep === step.id
            const isCompleted = currentStep > step.id
            return (
              <div key={step.id} className="flex flex-col items-center gap-2 relative">
                <div 
                  className={cn(
                    "size-9 rounded-full flex items-center justify-center border-2 transition-all",
                    isActive ? "border-primary bg-primary text-white shadow-md" : 
                    isCompleted ? "border-emerald-500 bg-emerald-500/10 text-emerald-500" : 
                    "border-outline-variant text-on-surface-variant"
                  )}
                >
                  {isCompleted ? <CheckCircle2 className="size-5" /> : <step.icon className="size-4" />}
                </div>
                <span className={cn(
                  "text-[9px] uppercase font-bold tracking-wider",
                  isActive ? "text-primary" : "text-on-surface-variant"
                )}>
                  {step.name}
                </span>
                
                {step.id < STEPS.length && (
                  <div className="absolute top-4.5 left-12 w-10 h-px bg-outline-variant hidden md:block" />
                )}
              </div>
            )
          })}
        </nav>

        <div className="min-h-[350px]">
          {currentStep === 1 && (
            <SelectionList 
              items={tractors?.filter(t => t.status === 'available') || []}
              renderItem={(item: TractorEntity) => (
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.brand} {item.model}</span>
                    <span className="text-[10px] text-on-surface-variant font-mono">{item.plates}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Disponible</Badge>
                </div>
              )}
              selectedId={selectedTractor?.id}
              onSelect={setSelectedTractor}
              isLoading={loadingTractors}
            />
          )}

          {currentStep === 2 && (
            <SelectionList 
              items={trailers?.filter(t => t.status === 'available') || []}
              renderItem={(item: TrailerEntity) => (
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.type} - {item.economicNumber}</span>
                    <span className="text-[10px] text-on-surface-variant">{item.brand} {item.model}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Disponible</Badge>
                </div>
              )}
              selectedId={selectedTrailer?.id}
              onSelect={setSelectedTrailer}
              isLoading={loadingTrailers}
            />
          )}

          {currentStep === 3 && (
            <SelectionList 
              items={operators?.filter(o => o.status === 'available') || []}
              renderItem={(item: OperatorEntity) => (
                <div className="flex items-center justify-between w-full">
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm">{item.firstName} {item.lastName}</span>
                    <span className="text-[10px] text-on-surface-variant">Licencia: {item.licenseNumber}</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Disponible</Badge>
                </div>
              )}
              selectedId={selectedOperator?.id}
              onSelect={setSelectedOperator}
              isLoading={loadingOperators}
            />
          )}

          {currentStep === 4 && (
            <SelectionList 
              items={clients || []}
              renderItem={(item: ClientEntity) => (
                <div className="flex items-center justify-between w-full text-sm">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-[10px] text-on-surface-variant capitalize">{item.type === 'internal' ? 'Intercompañía' : 'Externo'}</span>
                  </div>
                </div>
              )}
              selectedId={selectedClient?.id}
              onSelect={setSelectedClient}
              isLoading={loadingClients}
            />
          )}

          {currentStep === 5 && (
            <div className="flex flex-col gap-4 animate-in fade-in slide-in-from-bottom-2">
               <div className="grid grid-cols-2 gap-3">
                  <SummaryItem label="Tracto" value={`${selectedTractor?.brand} ${selectedTractor?.model}`} sub={selectedTractor?.plates} icon={Truck} />
                  <SummaryItem label="Remolque" value={`${selectedTrailer?.type}`} sub={`Eco: ${selectedTrailer?.economicNumber}`} icon={Package} />
                  <SummaryItem label="Operador" value={`${selectedOperator?.firstName} ${selectedOperator?.lastName}`} sub={`Lic: ${selectedOperator?.licenseNumber}`} icon={Users} />
                  <SummaryItem label="Cliente" value={selectedClient?.name || ''} sub={selectedClient?.type === 'internal' ? 'Interno' : 'Externo'} icon={Building2} />
               </div>
               <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-start gap-3">
                  <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
                  <p className="text-[11px] text-on-surface-variant leading-relaxed">
                    Al confirmar, se activará la unidad operativa. Este proceso asigna automáticamente el remolque y operador al tractocamión seleccionado para el cliente indicado.
                  </p>
               </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between border-t border-outline-variant/20 pt-4 mt-2">
          <Button 
            variant="ghost" 
            onClick={prevStep} 
            disabled={currentStep === 1}
            size="sm"
          >
            Anterior
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>Cancelar</Button>
            {currentStep < STEPS.length ? (
              <Button 
                disabled={!isStepComplete(currentStep)} 
                onClick={nextStep}
                size="sm"
              >
                Continuar
              </Button>
            ) : (
              <Button 
                onClick={handleFinish}
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                size="sm"
              >
                Activar Unidad
              </Button>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  )
}

function SelectionList({ items, renderItem, selectedId, onSelect, isLoading }: any) {
  return (
    <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-bottom-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-on-surface-variant" />
        <input 
          placeholder="Buscar..." 
          className="w-full pl-9 pr-4 py-2 bg-surface-container-high/40 border border-outline-variant/30 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-primary/10"
        />
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 rounded-xl bg-surface-container animate-pulse" />
          ))
        ) : (
          items.map((item: any) => (
            <button
              key={item.id}
              onClick={() => onSelect(item)}
              className={cn(
                "p-3 rounded-xl border-2 text-left transition-all",
                selectedId === item.id 
                  ? "border-primary bg-primary/5 ring-1 ring-primary/10" 
                  : "border-outline-variant/20 bg-surface-container-lowest hover:border-primary/20"
              )}
            >
              {renderItem(item)}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

function SummaryItem({ label, value, sub, icon: Icon }: any) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-container-low border border-outline-variant/10">
      <div className="size-8 rounded-lg bg-surface-container flex items-center justify-center shrink-0 border border-outline-variant/20">
        <Icon className="size-4 text-primary" />
      </div>
      <div className="flex flex-col overflow-hidden">
        <span className="text-[9px] uppercase font-bold text-on-surface-variant">{label}</span>
        <span className="text-xs font-semibold text-on-surface truncate">{value}</span>
        <span className="text-[9px] font-mono text-on-surface-variant">{sub}</span>
      </div>
    </div>
  )
}
