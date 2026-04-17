import React from 'react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

export interface WizardFooterProps {
  onBack?: () => void
  onNext?: () => void
  onCancel?: () => void
  isFirstStep: boolean
  isLastStep: boolean
  isNextDisabled?: boolean
  isSubmitting?: boolean
  nextLabel?: string
  backLabel?: string
  cancelLabel?: string
}

export function WizardFooter({
  onBack,
  onNext,
  onCancel,
  isFirstStep,
  isLastStep,
  isNextDisabled = false,
  isSubmitting = false,
  nextLabel = 'Siguiente',
  backLabel = 'Regresar',
  cancelLabel = 'Cancelar'
}: WizardFooterProps) {
  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-outline-variant/30">
      <div>
        {onCancel && (
          <Button variant="ghost" onClick={onCancel} disabled={isSubmitting}>
            {cancelLabel}
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {!isFirstStep && onBack && (
          <Button variant="outline" onClick={onBack} disabled={isSubmitting}>
            <ArrowLeft className="size-4 mr-2" />
            {backLabel}
          </Button>
        )}
        
        {isLastStep ? (
          <Button 
            variant="green" 
            onClick={onNext} 
            disabled={isNextDisabled || isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center size-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
            ) : (
              <Check className="size-4 mr-2" />
            )}
            Finalizar
          </Button>
        ) : (
          <Button 
            variant="orange" 
            onClick={onNext} 
            disabled={isNextDisabled || isSubmitting}
            className="min-w-[120px]"
          >
            {nextLabel}
            <ArrowRight className="size-4 ml-2" />
          </Button>
        )}
      </div>
    </div>
  )
}
