/**
 * @fileoverview Organismo de UI para indicar que una sección está en desarrollo.
 * Sigue la estética "Horizon" con branding de Sociedad Brito.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Construction, ArrowLeft, Clock, Hammer } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { BrandLogo } from '@/src/core/presentation/components/ui/brand-logo'
import { cn } from '@/src/core/infrastructure/utils/cn'

interface UnderDevelopmentProps {
  title?: string
  description?: string
  icon?: React.ReactNode
  showBackButton?: boolean
  className?: string
}

/**
 * Componente UnderDevelopment
 * 
 * Se utiliza para rellenar rutas o módulos que aún no están implementados,
 * manteniendo una apariencia profesional y coherente con el resto de la app.
 */
export function UnderDevelopment({
  title = 'Módulo en Desarrollo',
  description = 'Estamos trabajando arduamente para traerte nuevas herramientas de gestión logística. Esta sección estará disponible muy pronto.',
  icon,
  showBackButton = true,
  className,
}: UnderDevelopmentProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[60vh] w-full p-8 text-center',
      className
    )}>
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(0,109,55,0.03)_0%,transparent_50%)]" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-xl flex flex-col items-center"
      >
        {/* Branding */}
        <div className="mb-12 opacity-50 grayscale hover:grayscale-0 transition-all">
          <BrandLogo size="md" theme="dark" />
        </div>

        {/* Iconografía con animación de pulso */}
        <div className="relative mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="size-24 rounded-3xl bg-surface-container flex items-center justify-center text-primary shadow-sm border border-outline-variant/30"
          >
            {icon || <Construction className="size-12" />}
          </motion.div>
          
          {/* Decoración flotante */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 size-8 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container shadow-md border border-white"
          >
            <Clock className="size-4" />
          </motion.div>
        </div>

        {/* Texto */}
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-4 font-headline uppercase">
          {title}
        </h2>
        
        <div className="h-1 w-12 bg-secondary rounded-full mb-6" />

        <p className="text-on-surface-variant text-base leading-relaxed mb-10 max-w-md">
          {description}
        </p>

        {/* Acciones */}
        {showBackButton && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="green" className="gap-2 px-6">
                Regresar al Dashboard
              </Button>
            </Link>
            
            <Link href="..">
              <Button variant="orange" className="gap-2 px-6">
                <ArrowLeft className="size-4" />
                Volver
              </Button>
            </Link>
          </div>
        )}

        {/* Pie de página sutil */}
        <div className="mt-16 flex items-center gap-6 text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-medium">
          <span className="flex items-center gap-1">
            <Hammer className="size-3" />
            En Construcción
          </span>
          <div className="size-1 rounded-full bg-outline-variant/50" />
          <span>Brito ERP v0.1.0</span>
        </div>
      </motion.div>
    </div>
  )
}
