'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Truck, Shovel, ShoppingBag, ShieldCheck, Clock, MapPin } from 'lucide-react'

const SERVICES = [
  {
    title: 'Transporte y Logística',
    description: 'Movimiento de carga pesada y refrigerada con estándares internacionales para retail e industria.',
    icon: Truck,
    color: 'green',
    features: ['Carga Refrigerada', 'Rutas Multi-destino', 'Carga Industrial'],
  },
  {
    title: 'Suministro de Barita',
    description: 'Molienda y comercialización de barita de grado API para la industria petrolera y de perforación.',
    icon: Shovel,
    color: 'orange',
    features: ['Grado API', 'Distribución Estratégica', 'Manejo Especializado'],
  },
  {
    title: 'Logística para Retail',
    description: 'Especialistas en la cadena de suministro de Walmart y grandes almacenes con alta exigencia.',
    icon: ShoppingBag,
    color: 'green',
    features: ['Just in Time', 'Monitoreo 24/7', 'Control Documental'],
  }
]

/**
 * Grilla de servicios de la empresa.
 * Expone las 3 unidades de negocio principales.
 */
export const ServicesGrid = () => {
  return (
    <section id="servicios" className="py-24 bg-zinc-50 dark:bg-zinc-900/50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mb-16">
          <h2 className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-widest mb-4">CAPACIDADES OPERATIVAS</h2>
          <h3 className="text-4xl font-bold text-zinc-900 dark:text-white leading-tight">
            Soluciones integrales para la <span className="text-orange-600">Industria y el Comercio</span>
          </h3>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Nuestra versatilidad nos permite adaptarnos a las necesidades críticas de suministro y distribución en diversos sectores económicos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {SERVICES.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="p-8 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm hover:shadow-xl transition-all duration-300 group"
            >
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${
                service.color === 'green' ? 'bg-green-100 dark:bg-green-900/30 text-green-700' : 'bg-orange-100 dark:bg-orange-900/30 text-orange-600'
              }`}>
                <service.icon className="w-8 h-8" />
              </div>
              
              <h4 className="text-xl font-bold text-zinc-900 dark:text-white mb-3">{service.title}</h4>
              <p className="text-zinc-600 dark:text-zinc-400 text-sm leading-relaxed mb-6">
                {service.description}
              </p>
              
              <ul className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-800">
                {service.features.map(feature => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                    <ShieldCheck className={`w-4 h-4 ${service.color === 'green' ? 'text-green-600' : 'text-orange-500'}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 p-10 bg-green-800 rounded-3xl relative overflow-hidden text-center md:text-left">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
            <div className="flex-1 space-y-4">
              <h4 className="text-3xl font-bold">Llegamos a todo el sureste mexicano</h4>
              <p className="text-green-100 opacity-90 max-w-xl">
                Base operativa en Cárdenas, Tabasco. Ubicación estratégica para la distribución hacia campos petroleros y centros logísticos nacionales.
              </p>
            </div>
            <div className="flex items-center gap-12 font-bold whitespace-nowrap">
              <div className="flex flex-col items-center gap-2 text-center md:text-left">
                <Clock className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Operación 24/7</span>
              </div>
              <div className="flex flex-col items-center gap-2 text-center md:text-left">
                <MapPin className="w-6 h-6 text-orange-400" />
                <span className="text-sm">Cárdenas, Tab.</span>
              </div>
            </div>
          </div>
          
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-green-700 rounded-full -mr-20 -mt-20 blur-3xl z-0" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-600/20 rounded-full -ml-20 -mb-20 blur-3xl z-0" />
        </div>
      </div>
    </section>
  )
}
