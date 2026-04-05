'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Truck } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'

/**
 * Sección Hero de la Landing Page.
 * Presenta la propuesta de valor principal con una estética clara y profesional.
 */
export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16 overflow-hidden bg-zinc-50">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-green-100/50 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[0%] right-[-5%] w-[30%] h-[30%] bg-orange-100/50 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100 mb-6 font-bold text-xs text-green-700 tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-green-600 animate-pulse" />
              Operador Logístico Industrial
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold text-zinc-900 leading-[1.1] tracking-tight">
              Impulsando la <br /> 
              <span className="text-green-700">Excelencia</span> en el <br />
              <span className="text-orange-600">Sureste</span>
            </h1>
            
            <p className="mt-8 text-lg text-zinc-600 leading-relaxed max-w-xl">
              En Sociedad Brito combinamos transporte especializado de carga pesada con el suministro estratégico de barita para la industria petrolera. Solidez y confianza desde Cárdenas para todo México.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <Button variant="green" size="lg" className="rounded-full shadow-lg shadow-green-900/10">
                Nuestros Servicios
              </Button>
              <Button variant="outline" size="lg" className="rounded-full border-zinc-300 text-zinc-700 hover:bg-zinc-100">
                Conoce más
              </Button>
            </div>
          </motion.div>

          <div className="relative mt-12 lg:mt-0 items-center justify-center flex">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, ease: 'easeOut' }}
              className="relative z-10 w-full max-w-[500px] aspect-square bg-white rounded-3xl overflow-hidden border-8 border-white shadow-2xl flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-linear-to-tr from-green-50 to-orange-50" />
              <Truck className="w-48 h-48 text-zinc-200 relative z-10" />
              
              {/* Visual labels */}
              <div className="absolute bottom-6 left-6 p-4 bg-white/90 backdrop-blur-sm rounded-2xl border border-zinc-100 shadow-xl max-w-[180px] z-20">
                <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-1">CAPACIDAD</p>
                <p className="text-sm font-bold text-zinc-900 leading-tight">+200 Unidades Activas en Ruta</p>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
