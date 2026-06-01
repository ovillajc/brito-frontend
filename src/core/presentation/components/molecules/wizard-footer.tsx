import { useState } from 'react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'

type WizardFooterHandler = () => void | Promise<void>

export interface WizardFooterProps {
  onBack?: WizardFooterHandler
  onNext?: WizardFooterHandler
  onCancel?: WizardFooterHandler
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
  const [isLocalSubmitting, setIsLocalSubmitting] = useState(false)

  const isBusy = isSubmitting || isLocalSubmitting
  const isNextBlocked = isNextDisabled || isBusy

  const handleNext = async () => {
    if (!onNext) return
    if (isNextBlocked) return
    setIsLocalSubmitting(true)
    try {
      await onNext()
    } finally {
      setIsLocalSubmitting(false)
    }
  }

  const handleBack = async () => {
    if (!onBack) return
    if (isBusy) return
    setIsLocalSubmitting(true)
    try {
      await onBack()
    } finally {
      setIsLocalSubmitting(false)
    }
  }

  const handleCancel = async () => {
    if (!onCancel) return
    if (isBusy) return
    setIsLocalSubmitting(true)
    try {
      await onCancel()
    } finally {
      setIsLocalSubmitting(false)
    }
  }

  return (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-outline-variant/30">
      <div>
        {onCancel && (
          <Button variant="ghost" onClick={handleCancel} disabled={isBusy}>
            {cancelLabel}
          </Button>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {!isFirstStep && onBack && (
          <Button variant="outline" onClick={handleBack} disabled={isBusy}>
            <ArrowLeft className="size-4 mr-2" />
            {backLabel}
          </Button>
        )}
        
        {isLastStep ? (
          <Button 
            variant="green" 
            onClick={handleNext} 
            disabled={isNextBlocked}
            className="min-w-[120px]"
          >
            {isBusy ? (
              <span className="flex items-center justify-center size-4 rounded-full border-2 border-white/30 border-t-white animate-spin mr-2" />
            ) : (
              <Check className="size-4 mr-2" />
            )}
            Finalizar
          </Button>
        ) : (
          <Button 
            variant="orange" 
            onClick={handleNext} 
            disabled={isNextBlocked}
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
