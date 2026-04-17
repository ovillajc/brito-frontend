'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Building2, Calendar, Truck } from 'lucide-react'

const FEATURED_CLIENTS = [
  {
    name: 'Baker Hughes',
    location: 'Paraíso, Tabasco · CDMX',
    period: '2014 – Presente',
    service: 'Barita y cemento granel en tolva presurizada',
    sector: 'Servicios Petroleros',
    since: 2014,
    color: 'green' as const,
  },
  {
    name: 'Servicios Integrales GSM',
    location: 'Villahermosa, Tabasco',
    period: '2016 – Presente',
    service: 'Transporte logístico especializado',
    sector: 'Servicios de Energía',
    since: 2016,
    color: 'orange' as const,
  },
  {
    name: 'Prodexa',
    location: 'Nanchital, Veracruz',
    period: '2008 – Presente',
    service: 'Transporte de barita a granel en tolva presurizada',
    sector: 'Industria Petrolera',
    since: 2008,
    color: 'green' as const,
  },
  {
    name: 'Altopetrum',
    location: 'Comalcalco, Tabasco',
    period: '2018 – Presente',
    service: 'Movimiento de material y fluidos industriales',
    sector: 'Energía / Petróleo',
    since: 2018,
    color: 'orange' as const,
  },
  {
    name: 'Global Maya Fluidos',
    location: 'Paraíso, Tabasco',
    period: '2019 – Presente',
    service: 'Manejo terrestre de fluidos de perforación',
    sector: 'Sector Energético',
    since: 2019,
    color: 'green' as const,
  },
  {
    name: 'Solinmar Thechdrill Fluid Systems',
    location: 'Ciudad del Carmen, Camp.',
    period: '2017 – Presente',
    service: 'Traslado de sistemas de fluidos y aditivos químicos',
    sector: 'Petróleo y Gas',
    since: 2017,
    color: 'orange' as const,
  },
  {
    name: 'MIMySSA',
    location: 'Sureste Mexicano',
    period: '2015 – Presente',
    service: 'Minerales micronizados y suministro para industria minera',
    sector: 'Industria Minera',
    since: 2015,
    color: 'green' as const,
  },
  {
    name: 'Walmart',
    location: 'Villahermosa, Tab',
    period: '2024 – Presente',
    service: 'Fletes de productos perecederos',
    sector: 'Retail',
    since: 2024,
    color: 'orange' as const,
  },
]

const ALL_CLIENTS = [
  'ABK Logistika / Baramin', 'Protexa', 'Bustaher Systems México',
  'CEMEX México', 'Chemiservis', 'CEMOC Servicios', 'Dowell Schlumberger',
  'Weatherford de México', 'Integridad Mexicana del Norte', 'Mogel Fluidos',
  'Global Drilling de México', 'Azul Cerámica', 'Barisur', 'Minerales y Arcillas',
  'Holcim'
]

/**
 * Sección de clientes destacados de Transportes Brito.
 * Muestra los 6 principales y un ticker con la lista completa.
 */
export const ClientsSection = () => {
  return (
    <section id="clientes" className="py-24 bg-white">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-[#1a5c3a] tracking-widest uppercase mb-4 px-4 py-1.5 bg-[#1a5c3a]/10 rounded-full"
          >
            Referencias Comerciales
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-stone-900"
          >
            Empresas que{' '}
            <span className="text-[#1a5c3a]">confían en nosotros</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mt-4 text-stone-500 max-w-xl mx-auto"
          >
            Más de 15 años construyendo relaciones de confianza con las empresas más importantes del sector energético y logístico del Sureste de México.
          </motion.p>
        </div>

        {/* Featured clients grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-20">
          {FEATURED_CLIENTS.map((client, i) => (
            <motion.div
              key={client.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="group p-7 bg-stone-50 rounded-2xl border border-stone-200 hover:border-[#1a5c3a]/30 hover:shadow-lg transition-all duration-300 flex flex-col"
            >
              {/* Sector badge */}
              <span
                className={`self-start px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4 ${
                  client.color === 'green'
                    ? 'bg-[#1a5c3a]/10 text-[#1a5c3a]'
                    : 'bg-[#e07020]/10 text-[#e07020]'
                }`}
              >
                {client.sector}
              </span>

              {/* Company initial */}
              <div className="flex items-start gap-4 mb-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 ${
                    client.color === 'green' ? 'bg-[#1a5c3a]' : 'bg-[#e07020]'
                  }`}
                >
                  {client.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-stone-900 leading-tight text-lg max-w-[180px] line-clamp-2" title={client.name}>{client.name}</h3>
                  <p className="text-xs text-stone-500 flex items-center gap-1 mt-1">
                    <Building2 className="w-3 h-3" />
                    {client.location}
                  </p>
                </div>
              </div>

              <p className="text-sm text-stone-600 leading-relaxed mb-4 flex-1">
                <Truck className="w-3.5 h-3.5 inline mr-1.5 text-stone-400" />
                {client.service}
              </p>

              {/* Period */}
              <div className="flex items-center gap-2 pt-4 border-t border-stone-200">
                <Calendar className={`w-4 h-4 ${client.color === 'green' ? 'text-[#1a5c3a]' : 'text-[#e07020]'}`} />
                <span className="text-xs font-bold text-stone-700">{client.period}</span>
                <span className="ml-auto text-xs font-black text-stone-400">
                  {new Date().getFullYear() - client.since}+ años
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Also worked with — Ticker */}
        <div className="bg-stone-50 rounded-2xl border border-stone-200 p-8">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-widest text-center mb-6">
            También hemos colaborado con
          </p>
          <div className="overflow-hidden relative">
            {/* Fades laterales */}
            <div className="absolute left-0 top-0 bottom-0 w-16 bg-linear-to-r from-stone-50 to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 bg-linear-to-l from-stone-50 to-transparent z-10" />

            <motion.div
              animate={{ x: ['0%', '-50%'] }}
              transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
              className="flex gap-8 whitespace-nowrap"
            >
              {[...ALL_CLIENTS, ...ALL_CLIENTS].map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-stone-200 text-sm font-semibold text-stone-600 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#e07020]" />
                  {name}
                </span>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
