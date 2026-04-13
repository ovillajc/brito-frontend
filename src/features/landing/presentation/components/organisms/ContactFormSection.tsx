'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Mail, Phone, MapPin, Send, CheckCircle2 } from 'lucide-react'

import { Button } from '@/src/core/presentation/components/ui/button'
import { Input } from '@/src/core/presentation/components/ui/input'
import { Textarea } from '@/src/core/presentation/components/ui/textarea'
import { contactFormSchema, type ContactFormInput } from '../../../domain/schemas/contact-form.schema'
import { useSubmitLead } from '../../hooks/use-submit-lead'

const CONTACT_INFO = [
  {
    icon: Phone,
    label: 'Gerencia General',
    value: '917-128-1337',
    href: 'tel:9171281337',
    sub: 'José Aarón Brito Frías',
  },
  {
    icon: Phone,
    label: 'Logística y Tráfico',
    value: '936-110-3979',
    href: 'tel:9361103979',
    sub: 'Gilberto Focil Sánchez',
  },
  {
    icon: Mail,
    label: 'Logística',
    value: 'logistica.trafico@tbrito.com.mx',
    href: 'mailto:logistica.trafico@tbrito.com.mx',
    sub: 'Atención de lunes a sábado',
  },
  {
    icon: MapPin,
    label: 'Sede Operativa',
    value: 'Ctra. Coatzacoalcos-Cárdenas Km 113.700',
    href: 'https://maps.google.com/?q=Huimanguillo+Tabasco',
    sub: 'Arroyo Hondo, Huimanguillo, Tabasco · C.P. 86400',
  },
]

/**
 * Sección de contacto con datos reales del curriculum empresarial.
 * Integra validación Zod y envío asíncrono mediante Use Case.
 */
export const ContactFormSection = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
  })

  const { submit, isSubmitting, isSuccess, error } = useSubmitLead()

  const onSubmit = async (data: ContactFormInput) => {
    await submit(data)
    if (!error) reset()
  }

  return (
    <section id="contacto" className="py-24 bg-[#f7f5f2]">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-bold text-[#e07020] tracking-widest uppercase mb-4 px-4 py-1.5 bg-[#e07020]/10 rounded-full"
          >
            ¿Listo para comenzar?
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl lg:text-5xl font-black text-stone-900"
          >
            Contáctanos{' '}
            <span className="text-[#1a5c3a]">hoy mismo</span>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">

          {/* Info Side */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            <p className="text-stone-600 leading-relaxed">
              Estamos preparados para resolver tus desafíos logísticos y de suministro industrial. Contáctanos directamente con alguno de nuestros canales oficiales.
            </p>

            <div className="space-y-4">
              {CONTACT_INFO.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.icon === MapPin ? '_blank' : undefined}
                  rel={item.icon === MapPin ? 'noopener noreferrer' : undefined}
                  className="group flex items-start gap-4 p-5 bg-white rounded-2xl border border-stone-200 hover:border-[#1a5c3a]/30 hover:shadow-md transition-all"
                >
                  <div className="w-11 h-11 rounded-xl bg-[#1a5c3a]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a5c3a] transition-colors">
                    <item.icon className="w-5 h-5 text-[#1a5c3a] group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-stone-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-sm font-bold text-stone-900 mt-0.5 break-all">{item.value}</p>
                    {item.sub && <p className="text-xs text-stone-500 mt-0.5">{item.sub}</p>}
                  </div>
                </a>
              ))}
            </div>

            {/* RFC */}
            <div className="p-5 bg-[#1a5c3a] rounded-2xl text-white">
              <p className="text-xs font-bold text-white/60 uppercase tracking-widest mb-2">Razón Social</p>
              <p className="font-bold text-base">José Aarón Brito Frías</p>
              <p className="text-sm text-white/70 mt-0.5">RFC: BIFA 880916IP8</p>
              <p className="text-sm text-white/70 mt-0.5">Giro: Transporte de Carga en General</p>
            </div>
          </motion.div>

          {/* Form Side */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-white p-8 md:p-10 rounded-3xl border border-stone-200 shadow-sm"
          >
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-20 h-20 bg-[#1a5c3a]/10 rounded-full flex items-center justify-center text-[#1a5c3a]">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-stone-900">¡Mensaje Enviado!</h4>
                  <p className="mt-2 text-stone-500">
                    Gracias por contactar a Transportes Brito. Un asesor se comunicará contigo pronto.
                  </p>
                </div>
                <Button variant="outline" onClick={() => reset()}>
                  Enviar otro mensaje
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" id="contact-form">
                <h3 className="text-xl font-black text-stone-900 mb-6">Formulario de Cotización</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="text-sm font-bold text-stone-700">Nombre Completo</label>
                    <Input id="name" {...register('name')} placeholder="Ej. Juan Pérez" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="company" className="text-sm font-bold text-stone-700">Empresa (Opcional)</label>
                    <Input id="company" {...register('company')} placeholder="Nombre de tu empresa" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="text-sm font-bold text-stone-700">Correo Electrónico</label>
                    <Input id="email" {...register('email')} type="email" placeholder="email@empresa.com" />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="text-sm font-bold text-stone-700">Teléfono</label>
                    <Input id="phone" {...register('phone')} type="tel" placeholder="Ej. 9371234567" />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-bold text-stone-700">Mensaje o Requerimiento</label>
                  <Textarea
                    id="message"
                    {...register('message')}
                    placeholder="Describe el tipo de material, volumen, destino y cualquier detalle relevante..."
                    className="min-h-[130px]"
                  />
                  {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
                    {error}
                  </div>
                )}

                <Button
                  id="form-submit"
                  variant="green"
                  type="submit"
                  size="lg"
                  className="w-full rounded-xl gap-2 mt-2 font-bold"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    'Enviando...'
                  ) : (
                    <>
                      Enviar Solicitud
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
