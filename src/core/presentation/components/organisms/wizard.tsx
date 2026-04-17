import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { cn } from '@/src/core/infrastructure/utils/cn'
import { Check } from 'lucide-react'

export interface WizardStep {
  id: string
  title: string
  description?: string
  content: React.ReactNode
}

export interface WizardProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  steps: WizardStep[]
  activeStep: number
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export function Wizard({
  isOpen,
  onClose,
  title,
  description,
  steps,
  activeStep,
  className,
  size = 'lg'
}: WizardProps) {
  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      description={description} 
      size={size}
      className={className}
    >
      <div className="flex flex-col h-full mt-2 px-6 pb-6">
        {/* Stepper Header */}
        <div className="flex items-center px-4 mb-8">
          {steps.map((step, index) => {
            const isCompleted = index < activeStep
            const isActive = index === activeStep
            
            return (
              <React.Fragment key={step.id}>
                {/* Step Item */}
                <div className="flex flex-col items-center relative z-10">
                  <div 
                    className={cn(
                      'size-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors duration-300',
                      isCompleted ? 'bg-[#1a5c3a] text-white' : 
                      isActive ? 'bg-[#e07020] text-white ring-4 ring-[#e07020]/20' : 
                      'bg-surface-container-high text-on-surface-variant'
                    )}
                  >
                    {isCompleted ? <Check className="size-4" /> : index + 1}
                  </div>
                  <span 
                    className={cn(
                      'absolute top-10 text-xs font-semibold whitespace-nowrap',
                      isActive || isCompleted ? 'text-on-surface' : 'text-on-surface-variant'
                    )}
                  >
                    {step.title}
                  </span>
                </div>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div className="flex-1 px-2 relative -translate-y-3">
                    <div className="h-0.5 w-full bg-surface-container-high rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#1a5c3a] transition-all duration-500 ease-in-out" 
                        style={{ width: isCompleted ? '100%' : '0%' }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            )
          })}
        </div>
        
        {/* Step Content */}
        <div className="flex-1 overflow-y-auto px-4 pb-4 mt-6 min-h-[300px]">
          {steps[activeStep]?.content}
        </div>
      </div>
    </Dialog>
  )
}
