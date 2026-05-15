/**
 * @fileoverview Componente de Diálogo (Modal) reutilizable.
 * Proporciona una base para modales con transiciones suaves y accesibilidad básica.
 */

'use client'

import React, { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  headerClassName?: string
  titleClassName?: string
  descriptionClassName?: string
  closeButtonClassName?: string
  /** When true, suppresses the default header so custom components can render their own */
  hideDefaultHeader?: boolean
}

const SIZE_CLASSES = {
  sm: 'max-w-md max-h-[90vh]',
  md: 'max-w-lg max-h-[90vh]',
  lg: 'max-w-2xl max-h-[90vh]',
  xl: 'max-w-4xl max-h-[90vh]',
  full: 'max-w-[95vw] h-[95vh]',
}

export function Dialog({ 
  isOpen, 
  onClose, 
  title, 
  description, 
  children, 
  className,
  size = 'md',
  headerClassName,
  titleClassName,
  descriptionClassName,
  closeButtonClassName,
  hideDefaultHeader = false,
}: DialogProps) {
  
  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Prevent scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => { document.body.style.overflow = 'unset' }
  }, [isOpen])

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in transition-opacity" 
        onClick={onClose}
      />
      
      {/* Content */}
      <div 
        className={cn(
          "relative w-full bg-surface-container-lowest rounded-2xl shadow-2xl border border-outline-variant/30 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200",
          SIZE_CLASSES[size],
          className
        )}
      >
        {!hideDefaultHeader && (
          <div className={cn('flex items-center justify-between p-6 pb-2', headerClassName)}>
            <div>
              {title && <h2 className={cn('text-xl font-bold text-on-surface', titleClassName)}>{title}</h2>}
              {description && <p className={cn('text-sm font-medium mt-1 text-on-surface-variant', descriptionClassName)}>{description}</p>}
            </div>
            <button 
              onClick={onClose}
              className={cn(
                'size-8 flex items-center justify-center rounded-full hover:bg-surface-container-high transition-colors',
                closeButtonClassName
              )}
            >
              <X className="size-5" />
            </button>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto min-h-0">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
