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
    <section className="relative min-h-screen flex flex-col justify-end overflow-hidden" id="inicio">
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent" />
      </div>



      {/* Main content */}
      <div className="relative z-10 container mx-auto px-6 pb-28 lg:pb-36">
        <div className="max-w-4xl">
          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.0] tracking-tight mb-6"
          >
            Transporte Industrial
            <br />
            <span className="text-[#e07020]">de Confianza</span>
            <br />
            <span className="text-white/70 text-3xl sm:text-4xl lg:text-5xl font-bold">en el Sureste de México</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-stone-300 text-lg lg:text-xl leading-relaxed max-w-2xl mb-10"
          >
            Especialistas en transporte de carga a granel en tolva presurizada y suministro de barita para la industria petrolera. Operamos desde Huimanguillo, Tabasco hacia toda la República Mexicana.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button
              id="hero-cta-servicios"
              variant="orange"
              size="lg"
              className="rounded-full px-8 shadow-2xl shadow-[#e07020]/30 gap-2 font-bold"
              onClick={scrollToServices}
            >
              Ver Servicios
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              id="hero-cta-contacto"
              size="lg"
              className="rounded-full px-8 bg-white/10 backdrop-blur-sm text-white border border-white/30 hover:bg-white/20 font-semibold"
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
          className="mt-16 flex flex-col sm:flex-row gap-6 sm:gap-12"
        >
          {STATS.map((stat, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#e07020]/20 border border-[#e07020]/30 flex items-center justify-center flex-shrink-0">
                <stat.icon className="w-5 h-5 text-[#e07020]" />
              </div>
              <div>
                <p className="text-2xl font-black text-white leading-none">{stat.value}</p>
                <p className="text-xs text-stone-400 mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={scrollToServices}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1 text-white/50 hover:text-white/80 transition-colors"
        aria-label="Ver más"
      >
        <span className="text-xs tracking-widest uppercase font-medium">Descubrir</span>
        <ChevronDown className="w-5 h-5 animate-bounce" />
      </motion.button>
    </section>
  )
}
