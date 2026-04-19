'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Target, Eye, Star } from 'lucide-react'

const VALORES = [
  'Servicio', 'Entusiasmo', 'Compañerismo', 'Lealtad',
  'Honestidad', 'Respeto', 'Compromiso y Calidad', 'Ética Profesional', 'Apertura al Cambio',
]

const HISTORIA = [
  { year: '1998', title: 'Fundación', desc: 'César Antonio Brito Ramos funda la primera línea de transportes.' },
  { year: '2008', title: 'Consolidación', desc: 'José Aarón Brito Frías toma la dirección como "Transportes Brito".' },
  { year: '2015', title: 'Expansión', desc: 'Se funda Barichon SA de CV como segunda unidad de negocio.' },
  { year: '2025', title: 'Liderazgo', desc: 'Empresa consolidada como líder en logística industrial del sureste.' },
]

/**
 * Sección de identidad corporativa: quiénes somos, misión, visión y valores.
 * Incluye timeline histórico y foto real del equipo de Transportes Brito.
 */
export const AboutSection = () => {
  return (
    <section id="nosotros" className="py-24 bg-[#f7f5f2]">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-[#1a5c3a] tracking-widest uppercase mb-4 px-4 py-1.5 bg-[#1a5c3a]/10 rounded-full"
          >
            Quiénes Somos
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-stone-900 leading-tight"
          >
            Una empresa tabasqueña con{' '}
            <span className="text-[#e07020]">25 años</span> de experiencia
          </motion.h2>
        </div>

        {/* Grid: Misión/Visión + Imagen */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-24">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="p-7 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#1a5c3a]/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-[#1a5c3a]" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Nuestra Misión</h3>
              </div>
              <p className="text-stone-600 leading-relaxed text-sm">
                Proporcionar un servicio superior y soluciones en abastecimiento y logística de material a granel alcanzando una total satisfacción de los clientes, adaptándonos a diferentes ambientes operativos, asegurando la integridad del personal y medio ambiente, y cumpliendo con los estándares de calidad más exigentes.
              </p>
            </div>

            <div className="p-7 bg-white rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#e07020]/10 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-[#e07020]" />
                </div>
                <h3 className="text-lg font-bold text-stone-900">Nuestra Visión</h3>
              </div>
              <p className="text-stone-600 leading-relaxed text-sm">
                Consolidarnos como el aliado logístico y comercial principal y más confiable en la cadena de suministro de barita en México. Como organización transparente y eficiente, impulsamos la eficacia y seguridad de nuestros clientes a través de soluciones integradas que optimizan sus operaciones y agregan valor tangible en cada entrega.
              </p>
            </div>

            {/* Valores */}
            <div className="p-7 bg-[#1a5c3a] rounded-2xl text-white">
              <div className="flex items-center gap-3 mb-5">
                <Star className="w-5 h-5 text-[#e07020]" />
                <h3 className="text-lg font-bold">Nuestros Valores</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {VALORES.map((valor) => (
                  <span
                    key={valor}
                    className="px-3 py-1.5 bg-white/10 hover:bg-white/20 transition-colors rounded-full text-sm font-medium text-white/90 border border-white/10 cursor-default"
                  >
                    {valor}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative rounded-3xl overflow-hidden aspect-4/5 shadow-2xl">
              <Image
                src="/assets/images/landin/cta3.jpeg"
                alt="Equipo de Transportes Brito en sesión de seguridad industrial"
                fill
                className="object-cover object-center"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white">
                <p className="text-sm font-bold uppercase tracking-widest text-[#e07020] mb-1">Equipo Capacitado</p>
                <p className="text-xl font-black leading-tight">Desde Tabasco para todo el Sureste Mexicano</p>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute -top-6 -right-6 bg-white rounded-2xl shadow-xl p-5 border border-stone-100">
              <p className="text-3xl font-black text-[#1a5c3a]">1998</p>
              <p className="text-xs text-stone-500 font-medium">Año de Fundación</p>
            </div>
          </motion.div>
        </div>

        {/* Timeline */}
        <div>
          <h3 className="text-2xl font-black text-stone-900 text-center mb-12">
            Nuestra <span className="text-[#e07020]">Historia</span>
          </h3>
          <div className="relative">
            {/* Line */}
            <div className="hidden md:block absolute top-6 left-0 right-0 h-0.5 bg-stone-200 mx-[8%]" />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              {HISTORIA.map((item, i) => (
                <motion.div
                  key={item.year}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1a5c3a] text-white font-black text-sm flex items-center justify-center shadow-md ring-4 ring-white relative z-10 mb-4">
                    {i + 1}
                  </div>
                  <div className="text-2xl font-black text-[#e07020] mb-1">{item.year}</div>
                  <div className="text-sm font-bold text-stone-900 mb-2">{item.title}</div>
                  <p className="text-xs text-stone-500 leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
