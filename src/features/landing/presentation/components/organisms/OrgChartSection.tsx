'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Mail, Phone } from 'lucide-react'

interface OrgMember {
  name: string
  role: string
  email?: string
  phone?: string
}

interface OrgDepartment {
  name: string
  color: 'green' | 'orange'
  members: OrgMember[]
}

const DIRECTOR: OrgMember = {
  name: 'César Antonio Brito Ramos',
  role: 'Director General',
  email: 'cesarantonio.britoramos@tbrito.com.mx',
}

const GERENCIA: OrgMember = {
  name: 'José Aarón Brito Frías',
  role: 'Gerencia General',
  phone: '917-128-1337',
  email: 'joseaaron.britofrias@tbrito.com.mx',
}

const DEPARTMENTS: OrgDepartment[] = [
  {
    name: 'Administración',
    color: 'green',
    members: [
      {
        name: 'Abril Andrea Vidal Vergara',
        role: 'Administración',
        phone: '937-164-8799',
        email: 'transportesbrito_admon_1@hotmail.com',
      },
      {
        name: 'Keila Raquel Torres Pérez',
        role: 'Facturación',
        phone: '826-158-0828',
        email: 'facturacionbrito@hotmail.com',
      },
    ],
  },
  {
    name: 'Contabilidad',
    color: 'green',
    members: [
      {
        name: 'Ricardo Colomé Payro',
        role: 'Contador',
        phone: '993-223-1568',
        email: 'ricopa@hotmail.com',
      },
      {
        name: 'Abenamar Ramírez Torres',
        role: 'Auxiliar Contable',
        phone: '993-223-1568',
        email: 'abenamarrt@hotmail.com',
      },
    ],
  },
  {
    name: 'Logística y Tráfico',
    color: 'orange',
    members: [
      {
        name: 'Gilberto Focil Sánchez',
        role: 'Jefe de Logística',
        phone: '936-110-3979',
        email: 'logistica.trafico@tbrito.com.mx',
      },
      {
        name: 'Edgar Iván Méndez Rodríguez',
        role: 'Tráfico',
        phone: '933-329-4562',
        email: 'logistica.brito@hotmail.com',
      },
    ],
  },
]

/**
 * Organigrama ilustrado de la estructura organizacional de Transportes Brito.
 * Muestra Director General, Gerencia y los 4 departamentos con datos reales.
 */
export const OrgChartSection = () => {
  return (
    <section id="organigrama" className="py-24 bg-[#0f1419] text-white overflow-hidden relative">
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#1a5c3a]/10 rounded-full blur-[160px]" />
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
            Estructura Organizacional
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-white"
          >
            Nuestro <span className="text-[#e07020]">Equipo</span> Directivo
          </motion.h2>
          <p className="mt-4 text-stone-400 max-w-lg mx-auto">
            Una estructura sólida respaldada por profesionales con años de experiencia en la industria del transporte y logística industrial.
          </p>
        </div>

        {/* Director */}
        <div className="flex justify-center mb-0">
          <MemberCard member={DIRECTOR} level="director" delay={0} />
        </div>

        {/* Vertical connector */}
        <div className="flex justify-center">
          <div className="w-px h-10 bg-white/20" />
        </div>

        {/* Gerencia */}
        <div className="flex justify-center mb-0">
          <MemberCard member={GERENCIA} level="gerencia" delay={0.1} />
        </div>

        {/* Connector to departments */}
        <div className="flex justify-center">
          <div className="w-px h-10 bg-white/20" />
        </div>

        {/* Horizontal line */}
        <div className="relative flex justify-center mb-0">
          <div className="absolute top-0 left-[16.66%] right-[16.66%] h-px bg-white/20 hidden lg:block" />
        </div>

        {/* Vertical connectors per dept */}
        <div className="hidden lg:grid grid-cols-3 gap-6 max-w-5xl mx-auto">
          {DEPARTMENTS.map((_, i) => (
            <div key={i} className="flex justify-center">
              <div className="w-px h-10 bg-white/20" />
            </div>
          ))}
        </div>

        {/* Departments */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {DEPARTMENTS.map((dept, i) => (
            <motion.div
              key={dept.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + i * 0.08 }}
            >
              {/* Department header */}
              <div
                className={`text-center py-2 px-4 rounded-t-xl text-xs font-bold uppercase tracking-wider ${
                  dept.color === 'green'
                    ? 'bg-[#1a5c3a] text-white'
                    : 'bg-[#e07020] text-white'
                }`}
              >
                {dept.name}
              </div>

              {/* Members */}
              <div className="space-y-2 bg-white/5 border border-white/10 rounded-b-xl p-4">
                {dept.members.map((member) => (
                  <div
                    key={member.name}
                    className="bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-3"
                  >
                    <p className="text-sm font-bold text-white leading-tight mb-0.5">{member.name}</p>
                    <p className={`text-[10px] font-bold uppercase tracking-wider mb-2 ${dept.color === 'green' ? 'text-[#1a5c3a]' : 'text-[#e07020]'}`}>
                      {member.role}
                    </p>
                    {member.phone && (
                      <a
                        href={`tel:${member.phone.replace(/-/g, '')}`}
                        className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-white transition-colors mb-1"
                      >
                        <Phone className="w-3 h-3" />
                        {member.phone}
                      </a>
                    )}
                    {member.email && (
                      <a
                        href={`mailto:${member.email}`}
                        className="flex items-center gap-1 text-[10px] text-stone-400 hover:text-white transition-colors truncate"
                      >
                        <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{member.email}</span>
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

/** Tarjeta de miembro para los niveles superiores del organigrama */
const MemberCard = ({
  member,
  level,
  delay,
}: {
  member: OrgMember
  level: 'director' | 'gerencia'
  delay: number
}) => {
  const isDirector = level === 'director'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      className={`text-center w-full max-w-xs px-8 py-5 rounded-2xl border ${
        isDirector
          ? 'bg-[#1a5c3a] border-[#1a5c3a] text-white'
          : 'bg-white/10 border-white/20 text-white backdrop-blur-sm'
      }`}
    >
      <div
        className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-black mx-auto mb-3 ${
          isDirector ? 'bg-white text-[#1a5c3a]' : 'bg-[#e07020] text-white'
        }`}
      >
        {member.name.charAt(0)}
      </div>
      <p className="font-black text-base leading-tight">{member.name}</p>
      <p
        className={`text-xs font-bold uppercase tracking-wider mt-1 ${
          isDirector ? 'text-white/70' : 'text-[#e07020]'
        }`}
      >
        {member.role}
      </p>
      {member.email && (
        <a
          href={`mailto:${member.email}`}
          className="inline-flex items-center gap-1 text-[10px] mt-2 text-white/50 hover:text-white transition-colors"
        >
          <Mail className="w-3 h-3" />
          {member.email}
        </a>
      )}
    </motion.div>
  )
}
