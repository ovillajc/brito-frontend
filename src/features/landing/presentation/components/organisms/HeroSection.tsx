'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Shield, Award, MapPin } from 'lucide-react'
import { Button } from '@/src/core/presentation/components/ui/button'

const STATS = [
  { value: '+25', label: 'Años de operación', icon: Award },
  { value: '100%', label: 'Tolvas certificadas', icon: Shield },
  { value: 'Sureste', label: 'México cubierto', icon: MapPin },
]

/**
 * Hero section rediseñada con imagen real de flota, overlay premium
 * y estadísticas clave de Transportes Brito.
 */
export const HeroSection = () => {
  const scrollToServices = () => {
    document.getElementById('servicios')?.scrollIntoView({ behavior: 'smooth' })
  }
  const scrollToContact = () => {
    document.getElementById('contacto')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="relative min-h-[100dvh] flex flex-col justify-center overflow-hidden" id="inicio">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/landin/hero.jpeg"
          alt="Flota de Transportes Brito — dos tractocamiones al amanecer"
          fill
          priority
          className="object-cover object-center"
          sizes="100vw"
        />
        {/* Multi-layer overlay para legibilidad */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 md:from-black/80 via-black/50 to-black/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 md:from-black/60 via-black/20 md:via-transparent to-transparent" />
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 pb-20 pt-24 sm:pt-28 md:pt-32 lg:pt-36 xl:pt-40">
        <div className="max-w-4xl xl:max-w-5xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white leading-[1.1] tracking-tight mb-4 sm:mb-6"
          >
            Transporte Industrial
            <br />
            <span className="text-[#e07020]">de Confianza</span>
            <br />
            <span className="text-white/70 text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold">en el Sureste de México</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-stone-300 text-sm sm:text-base md:text-lg lg:text-xl leading-relaxed max-w-2xl mb-8 sm:mb-10 lg:mb-12"
          >
            Especialistas en transporte de carga a granel en tolva presurizada y suministro de barita para la industria petrolera. Operamos desde Huimanguillo, Tabasco hacia toda la República Mexicana.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full sm:w-auto"
          >
            <Button
              id="hero-cta-servicios"
              variant="orange"
              size="lg"
              className="rounded-full h-12 sm:h-14 shadow-2xl shadow-[#e07020]/30 gap-2 font-bold w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8"
              onClick={scrollToServices}
            >
              Ver Servicios
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </Button>
            <Button
              id="hero-cta-contacto"
              size="lg"
              className="rounded-full h-12 sm:h-14 bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 font-semibold w-full sm:w-auto text-sm sm:text-base px-6 sm:px-8"
              onClick={scrollToContact}
            >
              Solicitar Cotización
            </Button>
          </motion.div>
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="mt-12 sm:mt-16 grid grid-cols-2 sm:flex sm:flex-row gap-x-4 gap-y-6 sm:gap-8 lg:gap-12"
        >
          {STATS.map((stat, i) => (
            <div key={i} className={`flex items-center gap-3 ${i === 2 ? 'col-span-2 sm:col-span-1' : ''}`}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-[#e07020]/20 border border-[#e07020]/30 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#e07020]" />
              </div>
              <div>
                <p className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-none">{stat.value}</p>
                <p className="text-[10px] sm:text-xs text-stone-400 mt-1 uppercase tracking-wider font-semibold">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator - Hidden on very small screens to avoid overflow */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToServices}
        className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors hidden sm:flex"
        aria-label="Ver más"
      >
        <span className="text-[10px] sm:text-xs tracking-widest uppercase font-medium">Descubrir</span>
        <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 animate-bounce" />
      </motion.button>
    </section>
  )
}
