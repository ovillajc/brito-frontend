'use client'

import { Truck, Package, TrendingUp, ShieldCheck } from 'lucide-react'
import { BrandLogo } from '@/src/core/presentation/components/ui/brand-logo'

/**
 * @fileoverview LoginLeftPanel.
 * Proporciona el ancla visual de la marca y las estadísticas clave
 * mediante un diseño alineado con la Landing Page de Transportes Brito.
 */

export function LoginLeftPanel() {
  return (
    <section 
      className="relative hidden lg:flex lg:w-[55%] xl:w-[60%] flex-col justify-between overflow-hidden" 
      aria-hidden="true"
    >
      {/* Background Image */}
      <img 
        alt="Modern logistics truck on a highway" 
        className="absolute inset-0 w-full h-full object-cover z-0" 
        src="/assets/images/landin/hero.jpeg"
      />
      
      {/* Dark overlay adapting Brito's colors for reading contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 z-0" />

      {/* Accent line */}
      <div className="absolute left-0 top-0 h-full w-1.5 bg-[#e07020] z-10" />

      {/* Top content */}
      <div className="relative z-10 p-10 flex-shrink-0">
        <BrandLogo theme="light" size="lg" />
      </div>

      {/* Center content */}
      <div className="relative z-10 flex flex-col justify-end pb-8 flex-1 px-10">
        <div className="flex flex-col gap-4">
          <p className="text-xs font-bold tracking-[0.3em] uppercase text-[#e07020]">
            Control Logístico
          </p>
          <h1 className="text-4xl md:text-5xl font-black leading-tight text-white mb-2">
            La plataforma que impulsa<br />
            tus operaciones logísticas
          </h1>
          <p className="max-w-md text-base leading-relaxed text-stone-300 font-medium">
            Monitoreo en tiempo real, análisis predictivo y gestión centralizada para optimizar cada kilómetro de tu flota.
          </p>
        </div>
      </div>

      {/* Bottom stats layout */}
      <div className="relative z-10 p-10 pt-6 flex-shrink-0">
        <div className="grid grid-cols-2 gap-4 max-w-2xl">
          {/* Stat 1 */}
          <div className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 transition-all hover:bg-white/20">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#e07020]" />
              <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">Flota Activa</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tabular-nums">1,284</span>
              <span className="text-xs text-[#e07020] font-bold">+12%</span>
            </div>
          </div>
          {/* Stat 2 */}
          <div className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 transition-all hover:bg-white/20">
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-[#1a5c3a]" />
              <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">Entregas Hoy</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tabular-nums">8,492</span>
              <span className="text-xs text-[#1a5c3a] font-bold">unid.</span>
            </div>
          </div>
          {/* Stat 3 */}
          <div className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 transition-all hover:bg-white/20">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#e07020]" />
              <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">Eficiencia</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tabular-nums">98.2</span>
              <span className="text-xs text-[#e07020] font-bold">%</span>
            </div>
          </div>
          {/* Stat 4 */}
          <div className="flex flex-col gap-2 rounded-xl border border-white/20 bg-white/10 backdrop-blur-md p-4 transition-all hover:bg-white/20">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#1a5c3a]" />
              <span className="text-[10px] text-stone-300 font-bold uppercase tracking-widest">Seguridad</span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-white tabular-nums">99.9</span>
              <span className="text-xs text-[#1a5c3a] font-bold">%</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
