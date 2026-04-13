'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Truck, Package, ShieldCheck, CheckCircle2 } from 'lucide-react'

const SERVICES = [
  {
    id: 'transporte',
    badge: 'Servicio Principal',
    title: 'Transporte a Granel',
    subtitle: 'en Tolva Presurizada',
    description:
      'Movimiento especializado de materiales a granel para la industria petrolera y construcción en todo el Sureste Mexicano. Operamos con estrictos estándares de seguridad avalados por la EMMA.',
    image: '/assets/images/landin/cta2.jpeg',
    imageAlt: 'Tolva presurizada naranja de Transportes Brito al atardecer',
    icon: Truck,
    color: 'green' as const,
    features: [
      'Barita a granel (grado API)',
      'Cemento a granel',
      'Arena sílica presurizada',
      'Fluidos en pipa de presión y vacío',
      'Rutas Golfo y Sur de México',
    ],
    certifications: ['Tolvas con pruebas hidrostáticas', 'Válvulas certificadas', 'Manómetros certificados', 'Mangueras certificadas'],
  },
  {
    id: 'barita',
    badge: 'Barita de la Chontalpa',
    title: 'Suministro de Barita',
    subtitle: 'Extracción · Molienda · Distribución',
    description:
      'Como proveedores y maquiladores de barita (sulfato de bario), contamos con concesión y contrato minero para surtir barita en breña, procesarla y vender barita molida a granel de alta calidad.',
    image: '/assets/images/landin/cta4.jpeg',
    imageAlt: 'Equipo en operación de extracción de barita de la Chontalpa',
    icon: Package,
    color: 'orange' as const,
    features: [
      'Extracción de mina propia',
      'Proceso de molienda industrial',
      'Cribado y pulverización de barita',
      'Embarque a tolvas presurizadas',
      'Entrega directa al cliente final',
    ],
    certifications: ['Concesión minera vigente', 'Barita grado API', 'Control de calidad en proceso', 'Producto 100% nacional'],
  },
]

/**
 * Sección de servicios con imágenes reales del cliente.
 * Presenta las 2 unidades de negocio: Transporte a Granel y Barita de la Chontalpa.
 */
export const ServicesGrid = () => {
  return (
    <section id="servicios" className="py-24 bg-white">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-[#e07020] tracking-widest uppercase mb-4 px-4 py-1.5 bg-[#e07020]/10 rounded-full"
          >
            Capacidades Operativas
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-stone-900"
          >
            Dos unidades, <span className="text-[#1a5c3a]">un solo propósito</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-stone-500 max-w-xl mx-auto"
          >
            Transportes Brito y Barita de la Chontalpa trabajan en conjunto para ofrecer una solución integral desde la extracción hasta la entrega final.
          </motion.p>
        </div>

        {/* Service Cards */}
        <div className="space-y-12">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.id}
              id={`service-${service.id}`}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden shadow-xl border border-stone-100 ${
                index % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''
              }`}
            >
              {/* Image side */}
              <div className="relative min-h-[320px] lg:min-h-[480px]">
                <Image
                  src={service.image}
                  alt={service.imageAlt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
                <div className="absolute top-6 left-6">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      service.color === 'green'
                        ? 'bg-[#1a5c3a] text-white'
                        : 'bg-[#e07020] text-white'
                    }`}
                  >
                    {service.badge}
                  </span>
                </div>
              </div>

              {/* Content side */}
              <div className="bg-stone-50 p-8 lg:p-12 flex flex-col justify-center">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-5 ${
                    service.color === 'green'
                      ? 'bg-[#1a5c3a]/10 text-[#1a5c3a]'
                      : 'bg-[#e07020]/10 text-[#e07020]'
                  }`}
                >
                  <service.icon className="w-6 h-6" />
                </div>

                <h3 className="text-3xl font-black text-stone-900 leading-tight mb-1">{service.title}</h3>
                <p
                  className={`text-sm font-bold uppercase tracking-wider mb-4 ${
                    service.color === 'green' ? 'text-[#1a5c3a]' : 'text-[#e07020]'
                  }`}
                >
                  {service.subtitle}
                </p>
                <p className="text-stone-600 leading-relaxed mb-6 text-sm">{service.description}</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Servicios incluidos</h4>
                    <ul className="space-y-2">
                      {service.features.map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm text-stone-700">
                          <CheckCircle2
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              service.color === 'green' ? 'text-[#1a5c3a]' : 'text-[#e07020]'
                            }`}
                          />
                          {f}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">Certificaciones</h4>
                    <ul className="space-y-2">
                      {service.certifications.map((c) => (
                        <li key={c} className="flex items-start gap-2 text-sm text-stone-700">
                          <ShieldCheck
                            className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                              service.color === 'green' ? 'text-[#1a5c3a]' : 'text-[#e07020]'
                            }`}
                          />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
