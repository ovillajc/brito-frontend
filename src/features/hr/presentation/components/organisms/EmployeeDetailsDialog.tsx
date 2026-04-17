'use client'

import React from 'react'
import { Dialog } from '@/src/core/presentation/components/ui/dialog'
import { EmployeeEntity } from '../../../domain/entities'
import { Badge } from '@/src/core/presentation/components/ui/badge'
import { Calendar, Mail, Phone, Hash, Shield, Briefcase, Heart, User, FileText, Download, Eye, Paperclip, X } from 'lucide-react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/src/core/presentation/components/ui/tabs'
import { Separator } from '@/src/core/presentation/components/ui/separator'
import { cn } from '@/src/core/infrastructure/utils/cn'

interface EmployeeDetailsDialogProps {
  isOpen: boolean
  onClose: () => void
  employee: EmployeeEntity | null
}

export function EmployeeDetailsDialog({ isOpen, onClose, employee }: EmployeeDetailsDialogProps) {
  if (!employee) return null

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'N/A'
    return new Intl.DateTimeFormat('es-MX', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(new Date(date))
  }

  const DetailItem = ({
    icon: Icon,
    label,
    value,
    className = '',
  }: {
    icon: React.ElementType
    label: string
    value: string | React.ReactNode
    className?: string
  }) => (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex items-center gap-1.5 text-stone-400 dark:text-zinc-500">
        <Icon className="size-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-sm font-semibold text-stone-900 dark:text-zinc-100">
        {value || <span className="text-stone-300 dark:text-zinc-600 font-normal italic text-xs">No registrado</span>}
      </div>
    </div>
  )

  const SectionTitle = ({ title, icon: Icon }: { title: string; icon: React.ElementType }) => (
    <div className="flex items-center gap-2.5 mb-5">
      <div className="size-8 rounded-lg bg-[#006d37]/8 dark:bg-[#1a5c3a]/20 flex items-center justify-center">
        <Icon className="size-4 text-[#006d37] dark:text-[#2ecc71]" />
      </div>
      <h3 className="text-xs font-bold text-stone-900 dark:text-zinc-100 uppercase tracking-widest">{title}</h3>
    </div>
  )

  const DocItem = ({ name, status }: { name: string, status: 'complete' | 'missing' | 'expired' }) => (
    <div className="flex items-center justify-between p-4 rounded-xl border border-stone-100 dark:border-zinc-800 hover:bg-stone-50 dark:hover:bg-zinc-800/50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className={cn(
          "size-10 rounded-full flex items-center justify-center",
          status === 'complete' ? "bg-green-50 dark:bg-green-950/20 text-green-600" : 
          status === 'expired' ? "bg-orange-50 dark:bg-orange-950/20 text-orange-600" :
          "bg-stone-50 dark:bg-zinc-900 text-stone-400"
        )}>
          <FileText className="size-5" />
        </div>
        <div>
          <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">{name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded",
              status === 'complete' ? "text-green-600 bg-green-50 dark:bg-green-950/20" : 
              status === 'expired' ? "text-orange-600 bg-orange-50 dark:bg-orange-950/20" :
              "text-stone-400 bg-stone-50 dark:bg-zinc-900"
            )}>
              {status === 'complete' ? 'Completo' : status === 'expired' ? 'Vencido' : 'Pendiente'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100">
          <Eye className="size-4" />
        </button>
        <button className="p-2 hover:bg-white dark:hover:bg-zinc-700 rounded-lg text-stone-400 hover:text-stone-900 dark:hover:text-zinc-100">
          <Download className="size-4" />
        </button>
      </div>
    </div>
  )

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      hideDefaultHeader
    >
      {/* ── Gradient Header with identity + tabs ── */}
      <div className="bg-gradient-to-br from-[#006d37] via-[#005027] to-[#004020]">
        {/* Top bar: name + close */}
        <div className="flex items-start justify-between px-8 pt-7 pb-4">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white/10 flex items-center justify-center">
              <User className="size-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{employee.fullName}</h2>
              <p className="text-sm text-white/70 mt-0.5">
                {employee.jobTitle || (employee.isOperator ? 'Personal Operativo' : 'Personal Administrativo')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="size-8 flex items-center justify-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors mt-1"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Tab selector bar */}
        <Tabs defaultValue="info" className="flex flex-col">
          <div className="px-8 pb-0">
            <TabsList className="bg-transparent gap-1 border-b border-white/10 w-full rounded-none pb-0">
              <TabsTrigger
                value="info"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
              >
                Información General
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="px-5 py-2.5 rounded-t-lg rounded-b-none text-white/60 font-semibold text-sm border-b-2 border-transparent data-[state=active]:text-white data-[state=active]:border-white data-[state=active]:bg-white/5 transition-all"
              >
                Expediente Digital
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ── Tab content ── */}
          <div className="bg-white dark:bg-zinc-900 max-h-[68vh] overflow-y-auto">
            <TabsContent value="info" className="p-8 space-y-8">
              {/* Generales */}
              <section>
                <SectionTitle title="Datos Generales" icon={User} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Calendar} label="Fecha de Nacimiento" value={formatDate(employee.birthDate)} />
                  <DetailItem icon={Mail} label="Correo Electrónico" value={employee.contactEmail} />
                  <DetailItem icon={Phone} label="Teléfono de Contacto" value={employee.contactPhone} />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              {/* Identificación */}
              <section>
                <SectionTitle title="Identificación Legal" icon={Shield} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Hash} label="RFC" value={employee.rfc} />
                  <DetailItem icon={Hash} label="CURP" value={employee.curp} />
                  <DetailItem icon={Hash} label="NSS" value={employee.nss} />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              {/* Laboral */}
              <section>
                <SectionTitle title="Información Laboral" icon={Briefcase} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <DetailItem icon={Calendar} label="Fecha de Contratación" value={formatDate(employee.hireDate)} />
                  <DetailItem
                    icon={Briefcase}
                    label="Departamento"
                    value={
                      <Badge variant="outline" className="text-stone-600 dark:text-zinc-400 border-stone-200 dark:border-zinc-800 bg-stone-50 dark:bg-zinc-900">
                        {employee.departmentName || 'Sin asignar'}
                      </Badge>
                    }
                  />
                  <DetailItem
                    icon={User}
                    label="Estado"
                    value={
                      employee.isActive ? (
                        <Badge className="bg-[#1a5c3a] text-white font-bold">Activo</Badge>
                      ) : (
                        <Badge variant="secondary">Inactivo</Badge>
                      )
                    }
                  />
                </div>
              </section>

              <Separator className="bg-stone-100 dark:bg-zinc-800" />

              {/* Salud / Emergencias */}
              <section>
                <SectionTitle title="Salud y Emergencias" icon={Heart} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-5">
                    <DetailItem icon={User} label="Contacto de Emergencia" value={employee.emergencyContactName} />
                    <DetailItem icon={Phone} label="Teléfono de Emergencia" value={employee.emergencyContactPhone} />
                  </div>
                  <div className="space-y-5">
                    <DetailItem
                      icon={Heart}
                      label="Tipo de Sangre"
                      value={
                        <Badge variant="outline" className="text-red-600 border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/30">
                          {employee.bloodType || 'No especificado'}
                        </Badge>
                      }
                    />
                    <DetailItem icon={Shield} label="Notas Médicas" value={employee.medicalNotes} />
                  </div>
                </div>
              </section>
            </TabsContent>

            <TabsContent value="docs" className="p-8 space-y-4">
              <div className="flex items-center justify-between mb-2">
                <SectionTitle title="Expediente Digital" icon={Paperclip} />
                <button
                  type="button"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#1a5c3a] dark:text-[#2ecc71] hover:opacity-80 transition-opacity"
                >
                  <Paperclip className="size-3.5" />
                  SUBIR ARCHIVO
                </button>
              </div>

              <div className="grid gap-2.5">
                <DocItem name="Identificación Oficial (INE/Pasaporte)" status="complete" />
                <DocItem name="CURP Actualizado" status="complete" />
                <DocItem name="RFC (Constancia de Situación Fiscal)" status="expired" />
                <DocItem name="Comprobante de Domicilio" status="complete" />
                <DocItem name="Contrato Laboral Firmado" status="missing" />
                <DocItem name="Título / Cédula Profesional" status="missing" />
                <DocItem name="Examen Médico de Ingreso" status="complete" />
              </div>

              <div className="mt-6 p-6 rounded-2xl bg-stone-50 dark:bg-zinc-800/30 border border-dashed border-stone-200 dark:border-zinc-700 flex flex-col items-center justify-center text-center">
                <div className="size-12 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center shadow-sm mb-3">
                  <FileText className="size-5 text-stone-300" />
                </div>
                <p className="text-sm font-bold text-stone-900 dark:text-zinc-100">Cargar más documentos</p>
                <p className="text-xs text-stone-500 mt-1 max-w-[240px]">Arrastra y suelta archivos aquí o haz clic para buscar en tu equipo.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </Dialog>
  )
}
