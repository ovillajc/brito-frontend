'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ShieldCheck, HeartPulse, FileCheck2, HardHat } from 'lucide-react'

const CERTIFICATIONS = [
  {
    icon: ShieldCheck,
    title: 'Tolvas Certificadas',
    description: 'Pruebas hidrostáticas y no destructivas vigentes en toda la flotilla de tolvas presurizadas.',
  },
  {
    icon: FileCheck2,
    title: 'Equipo Certificado',
    description: 'Válvulas, manómetros y mangueras certificadas con proveedores avalados por la EMMA.',
  },
  {
    icon: HardHat,
    title: 'Carga y Descarga',
    description: 'Operadores con certificado vigente en Carga y Descarga especializada de materiales a granel.',
  },
  {
    icon: HeartPulse,
    title: 'Salud Ocupacional',
    description: 'Programa de salud ocupacional activo con capacitaciones continuas para todos los operadores.',
  },
]

/**
 * Sección de Seguridad, Salud Industrial y Medio Ambiente (SSMA).
 * Destaca las certificaciones y cultura de seguridad de Transportes Brito.
 */
export const SafetySection = () => {
  return (
    <section id="seguridad" className="py-24 bg-[#f7f5f2]">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Image side */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-[4/5] shadow-2xl">
              <Image
                src="/assets/images/landin/cta1.jpeg"
                alt="Oficial de seguridad con operador de Transportes Brito"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </div>

            {/* Floating badge */}
            <div className="absolute -bottom-6 -right-6 bg-[#1a5c3a] text-white rounded-2xl p-5 shadow-xl max-w-[200px]">
              <p className="text-3xl font-black text-[#e07020]">SSPA</p>
              <p className="text-xs font-medium leading-tight mt-1 text-white/80">
                Salud, Seguridad y Protección Ambiental
              </p>
            </div>

            {/* Name card */}
            <div className="absolute top-6 -left-4 bg-white rounded-xl shadow-lg px-4 py-3 border border-stone-100">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1">Responsable SSPA</p>
              <p className="text-sm font-bold text-stone-900">Keila C. Arias de la Cruz</p>
              <p className="text-xs text-stone-500">933-156-8867</p>
            </div>
          </motion.div>

          {/* Content side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div>
              <span className="inline-block text-xs font-bold text-[#1a5c3a] tracking-widest uppercase mb-4 px-4 py-1.5 bg-[#1a5c3a]/10 rounded-full">
                Compromiso con la Seguridad
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-stone-900 leading-tight">
                Operamos con los más altos{' '}
                <span className="text-[#1a5c3a]">estándares</span> de seguridad
              </h2>
              <p className="mt-4 text-stone-600 leading-relaxed">
                Nuestro equipo cuenta con capacitaciones vigentes y constantes en seguridad industrial. Cada unidad de nuestra flota está certificada para garantizar la integridad del material y la seguridad de nuestros operadores.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {CERTIFICATIONS.map((item, i) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-5 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md hover:border-[#1a5c3a]/20 transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#1a5c3a]/10 flex items-center justify-center mb-3 group-hover:bg-[#1a5c3a] transition-colors">
                    <item.icon className="w-5 h-5 text-[#1a5c3a] group-hover:text-white transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 mb-1">{item.title}</h4>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.description}</p>
                </motion.div>
              ))}
            </div>

            <div className="p-5 bg-[#e07020]/5 border border-[#e07020]/20 rounded-xl">
              <p className="text-sm text-stone-700 leading-relaxed">
                <span className="font-bold text-[#e07020]">Avalados por la EMMA.</span>{' '}
                Todos nuestros proveedores de certificación están aprobados por la Entidad Mexicana de Metrología y Acreditación, garantizando el cumplimiento normativo en cada operación.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
