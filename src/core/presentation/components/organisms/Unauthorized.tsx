/**
 * @fileoverview Organismo de UI para indicar que el usuario no tiene permisos.
 * Sigue la estética del proyecto con branding de Sociedad Brito.
 */

'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ShieldAlert, ArrowLeft, Lock, Info } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'
import { BrandLogo } from '@/src/core/presentation/components/ui/brand-logo'
import { cn } from '@/src/core/infrastructure/utils/cn'

interface UnauthorizedProps {
  title?: string
  description?: string
  showBackButton?: boolean
  className?: string
}

/**
 * Componente Unauthorized
 * 
 * Se utiliza cuando un usuario intenta acceder a una ruta para la cual
 * no tiene el rol o permiso necesario.
 */
export function Unauthorized({
  title = 'Acceso Restringido',
  description = 'Lo sentimos, no tienes los permisos necesarios para acceder a esta sección del sistema. Por favor, contacta a tu administrador si crees que esto es un error.',
  showBackButton = true,
  className,
}: UnauthorizedProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center min-h-[60vh] w-full p-8 text-center',
      className
    )}>
      {/* Fondo decorativo sutil (Rojizo para alerta) */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_50%_50%,rgba(220,38,38,0.03)_0%,transparent_50%)]" />
      
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

        {/* Iconografía con animación de escudo */}
        <div className="relative mb-8">
          <motion.div
            animate={{ 
              scale: [1, 1.05, 1],
              rotate: [0, 2, -2, 0]
            }}
            transition={{ 
              duration: 5, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="size-24 rounded-3xl bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-600 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-900/30"
          >
            <ShieldAlert className="size-12" />
          </motion.div>
          
          {/* Decoración flotante de candado */}
          <motion.div
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
            className="absolute -top-2 -right-2 size-8 rounded-full bg-stone-900 flex items-center justify-center text-white shadow-md border-2 border-white"
          >
            <Lock className="size-4" />
          </motion.div>
        </div>

        {/* Texto */}
        <h2 className="text-3xl font-bold tracking-tight text-on-surface mb-4 font-headline uppercase dark:text-red-500">
          {title}
        </h2>
        
        <div className="h-1 w-12 bg-red-600 rounded-full mb-6" />

        <p className="text-on-surface-variant text-base leading-relaxed mb-10 max-w-md">
          {description}
        </p>

        {/* Acciones */}
        {showBackButton && (
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/dashboard">
              <Button variant="green" className="gap-2 px-6">
                Ir al Dashboard
              </Button>
            </Link>
            
            <Link href="..">
              <Button variant="orange" className="gap-2 px-6">
                <ArrowLeft className="size-4" />
                Regresar
              </Button>
            </Link>
          </div>
        )}

        {/* Pie de página sutil */}
        <div className="mt-16 flex items-center gap-6 text-[10px] uppercase tracking-widest text-on-surface-variant/40 font-medium">
          <span className="flex items-center gap-1">
            <Info className="size-3" />
            Control de Acceso
          </span>
          <div className="size-1 rounded-full bg-outline-variant/50" />
          <span>Brito Seguridad v1.0</span>
        </div>
      </motion.div>
    </div>
  )
}
