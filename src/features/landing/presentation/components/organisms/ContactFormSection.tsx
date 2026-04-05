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

/**
 * Sección de contacto de la Landing Page.
 * Integra validación con Zod y envío asíncrono mediante Use Case.
 */
export const ContactFormSection = () => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema)
  })
  
  const { submit, isSubmitting, isSuccess, error } = useSubmitLead()

  const onSubmit = async (data: ContactFormInput) => {
    await submit(data)
    if (!error) reset()
  }

  return (
    <section id="contacto" className="py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Info Side */}
          <div className="space-y-12">
            <div>
              <h2 className="text-sm font-bold text-orange-600 uppercase tracking-widest mb-4">¿LISTO PARA COMENZAR?</h2>
              <h3 className="text-4xl font-bold text-zinc-900 dark:text-white mb-6">Contáctanos hoy mismo</h3>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-md leading-relaxed">
                Estamos preparados para resolver tus desafíos logísticos y de suministro industrial. Nuestro equipo de expertos te contactará en menos de 24 horas.
              </p>
            </div>

            <div className="space-y-8">
              {[
                { icon: Mail, label: 'Email', value: 'contacto@sociedadbrito.com' },
                { icon: Phone, label: 'Teléfono', value: '+52 (937) 123 4567' },
                { icon: MapPin, label: 'Ubicación', value: 'Cárdenas, Tabasco, México' }
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-green-700">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider">{item.label}</p>
                    <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form Side */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-zinc-50 dark:bg-zinc-900/40 p-8 md:p-12 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm"
          >
            {isSuccess ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6 py-12">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-700">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-2xl font-bold text-zinc-900 dark:text-white">¡Mensaje Enviado con Éxito!</h4>
                  <p className="mt-2 text-zinc-600 dark:text-zinc-400">Gracias por contactarnos. Un asesor se comunicará contigo pronto.</p>
                </div>
                <Button variant="outline" onClick={() => reset()}>Enviar otro mensaje</Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Nombre Completo</label>
                    <Input id="name" {...register('name')} placeholder="Ej. Juan Pérez" />
                    {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="company" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Empresa (Opcional)</label>
                    <Input id="company" {...register('company')} placeholder="Nombre de tu empresa" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Correo Electrónico</label>
                    <Input id="email" {...register('email')} type="email" placeholder="ejemplo@correo.com" />
                    {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Teléfono</label>
                    <Input id="phone" {...register('phone')} type="tel" placeholder="Ej. 9371234567" />
                    {errors.phone && <p className="text-xs text-red-500">{errors.phone.message}</p>}
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Mensaje o Requerimiento</label>
                  <Textarea id="message" {...register('message')} placeholder="Cuéntanos cómo podemos ayudarte..." className="min-h-[120px]" />
                  {errors.message && <p className="text-xs text-red-500">{errors.message.message}</p>}
                </div>

                {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">{error}</div>}

                <Button variant="orange" type="submit" size="lg" className="w-full rounded-xl gap-2 mt-4" disabled={isSubmitting}>
                  {isSubmitting ? 'Enviando...' : (
                    <>
                      Enviar Mensaje
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
