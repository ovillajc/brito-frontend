'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mountain, Factory, Settings2, Container, MapPin } from 'lucide-react'

const STEPS = [
  {
    number: '01',
    icon: Mountain,
    title: 'Extracción de la Mina',
    description: 'La barita en breña es extraída de nuestra concesión minera en Huimanguillo, Tabasco, con personal especializado y equipo certificado.',
  },
  {
    number: '02',
    icon: Factory,
    title: 'Traslado al Molino',
    description: 'El material en breña es transportado desde la mina hasta el molino ubicado en nuestras instalaciones del Edificio B, Arroyo Hondo.',
  },
  {
    number: '03',
    icon: Settings2,
    title: 'Molienda y Cribado',
    description: 'Proceso industrializado de molienda, cribado y pulverización que convierte la barita en breña en barita molida de grado API para la industria petrolera.',
  },
  {
    number: '04',
    icon: Container,
    title: 'Embarque a Tolvas',
    description: 'La barita molida a granel es cargada en nuestras tolvas presurizadas certificadas con pruebas hidrostáticas y no destructivas vigentes.',
  },
  {
    number: '05',
    icon: MapPin,
    title: 'Entrega al Cliente',
    description: 'Transporte hacia los distintos destinos del Golfo y Sur de México: Villahermosa, Veracruz, Cd. del Carmen, Paraíso y más.',
  },
]

/**
 * Sección del proceso de producción y embarque de barita.
 * Muestra el flujo completo de la cadena de suministro de Transportes Brito.
 */
export const ProcessSection = () => {
  return (
    <section id="proceso" className="py-24 bg-[#0f1419] text-white relative overflow-hidden">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1a5c3a]/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#e07020]/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-[#e07020] tracking-widest uppercase mb-4 px-4 py-1.5 bg-[#e07020]/10 border border-[#e07020]/20 rounded-full"
          >
            Cadena de Valor
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-white"
          >
            Proceso de{' '}
            <span className="text-[#e07020]">Producción y Embarque</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-stone-400 max-w-xl mx-auto"
          >
            De la mina al cliente final. Controlamos cada etapa del proceso para garantizar calidad, trazabilidad y puntualidad de entrega.
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Línea conectora vertical (mobile) */}
          <div className="absolute left-8 top-0 bottom-0 w-px bg-white/10 md:hidden" />

          <div className="space-y-8 md:space-y-0 md:grid md:grid-cols-5 md:gap-6">
            {STEPS.map((step, i) => (
              <div key={step.number} className="relative">
                {/* Línea conectora horizontal (desktop) */}
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-px bg-white/10 z-0" style={{ width: 'calc(100% - 40px)', left: '40px' }} />
                )}

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12 }}
                  className="relative z-10 group"
                >
                  {/* Step indicator */}
                  <div className="flex md:flex-col md:items-center gap-5 md:gap-4">
                    <div className="relative flex-shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-[#1a5c3a]/30 group-hover:border-[#1a5c3a]/50 transition-all duration-300">
                        <step.icon className="w-7 h-7 text-[#e07020]" />
                      </div>
                      <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#e07020] text-white text-[10px] font-black flex items-center justify-center">
                        {step.number}
                      </div>
                    </div>

                    <div className="md:text-center">
                      <h3 className="text-base font-bold text-white mb-2 leading-tight">{step.title}</h3>
                      <p className="text-stone-400 text-xs leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-20 p-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left"
        >
          <div>
            <p className="text-sm text-stone-400 uppercase tracking-widest font-bold mb-1">Sede de Operaciones</p>
            <p className="text-white font-bold text-lg">Carretera Coatzacoalcos-Cárdenas Km 113.700</p>
            <p className="text-stone-400">Arroyo Hondo, Huimanguillo, Tabasco · C.P. 86400</p>
          </div>
          <div className="flex gap-8 text-center">
            <div>
              <p className="text-2xl font-black text-[#e07020]">24/7</p>
              <p className="text-xs text-stone-400">Operación continua</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#e07020]">EMMA</p>
              <p className="text-xs text-stone-400">Proveedores avalados</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#e07020]">+15</p>
              <p className="text-xs text-stone-400">Clientes activos</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
