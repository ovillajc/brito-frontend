/**
 * @fileoverview Página principal del Dashboard de Viajes (Rediseño KPIs Operativos)
 */

'use client'

import React, { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/src/core/presentation/components/ui/card'
import { 
  Fuel, TrendingDown, TrendingUp, AlertCircle, 
  DollarSign, Activity, Truck, FileWarning, ShieldAlert,
  ChevronDown, Map
} from 'lucide-react'
import { cn } from '@/src/core/infrastructure/utils/cn'
import type { FuelTankSummaryEntity } from '@/src/features/fuel/domain/entities/fuel-tank-entity'

type DateRange = 'today' | 'week' | 'month'

interface TripsDashboardPageProps {
  fuelTankSummary?: FuelTankSummaryEntity | null
}

export default function TripsDashboardPage({ fuelTankSummary }: TripsDashboardPageProps) {
  const [dateRange, setDateRange] = useState<DateRange>('week')

  const capacity = fuelTankSummary?.tank.capacityLiters ?? null
  const litersInTank = fuelTankSummary?.litersInTank ?? null
  const pct = useMemo(() => {
    if (capacity == null || litersInTank == null || capacity <= 0) return null
    return Math.max(0, Math.min(100, (litersInTank / capacity) * 100))
  }, [capacity, litersInTank])

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header & Selectores de Fecha */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">Visión General Operativa</h2>
          <p className="text-sm text-stone-500">
            Monitoreo en tiempo real de finanzas, rendimiento y estatus operativo.
          </p>
        </div>
        
        {/* Date Selector Tabs */}
        <div className="flex items-center p-1 bg-stone-100 rounded-lg border border-stone-200">
          {(['today', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={cn(
                'px-4 py-1.5 text-sm font-medium rounded-md transition-all',
                dateRange === range 
                  ? 'bg-white text-stone-900 shadow-sm' 
                  : 'text-stone-500 hover:text-stone-700'
              )}
            >
              {range === 'today' ? 'Hoy' : range === 'week' ? 'Esta Semana' : 'Este Mes'}
            </button>
          ))}
        </div>
      </div>

      {/* SECCIÓN 1: KPIs de Combustible y Rendimiento */}
      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <Fuel className="size-5 text-blue-600" />
          Rendimiento y Combustible
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Rendimiento Global */}
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-500">Rendimiento Global</p>
                  <p className="text-2xl font-bold text-stone-900 mt-1">2.6 <span className="text-sm font-normal text-stone-500">km/L</span></p>
                </div>
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <Activity className="size-5" />
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="flex items-center text-red-600 font-medium bg-red-50 px-1.5 py-0.5 rounded">
                  <TrendingDown className="size-3 mr-1" />
                  0.4 km/L
                </span>
                <span className="text-stone-500">vs 3.0 Teórico</span>
              </div>
            </CardContent>
          </Card>

          {/* Ahorro vs Exceso */}
          <Card className="border-stone-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-red-500" />
            <CardContent className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-stone-500">Balance de Diésel</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    Exceso: 185 L
                  </p>
                </div>
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <TrendingUp className="size-5" />
                </div>
              </div>
              <div className="flex gap-2 text-sm text-stone-600 font-medium">
                <span className="text-red-600">-$4,255 MXN</span>
                <span className="text-stone-400 font-normal">impacto estimado</span>
              </div>
            </CardContent>
          </Card>

          {/* Top / Bottom Unidades */}
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-4 flex flex-col justify-between h-full">
              <p className="text-sm font-medium text-stone-500 mb-2">Desempeño de Unidades</p>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1.5 text-stone-800 font-medium">
                    <span className="size-2 rounded-full bg-green-500" />
                    UNIT-01 (3.2 km/L)
                  </span>
                  <span className="text-green-600 text-xs font-semibold px-2 py-0.5 bg-green-50 rounded-full">Top</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center gap-1.5 text-stone-800 font-medium">
                     <span className="size-2 rounded-full bg-red-500" />
                    UNIT-14 (1.9 km/L)
                  </span>
                  <span className="text-red-600 text-xs font-semibold px-2 py-0.5 bg-red-50 rounded-full">Bottom</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tanque Base */}
          <Card className="border-stone-200 shadow-sm">
            <CardContent className="p-5 flex gap-4 h-full">
               <div className="w-12 bg-stone-100 rounded-full overflow-hidden flex flex-col justify-end relative shadow-inner border border-stone-200/50">
                 {/* Porcentaje de Llenado */}
                 <div 
                   className={cn(
                     "w-full transition-all duration-1000",
                     pct != null && pct <= 15 ? "bg-red-500" : "bg-linear-to-t from-emerald-600 to-[#1a5c3a]"
                   )}
                   style={{ height: `${pct ?? 0}%` }} 
                 />
                 {/* Marcas */}
                 <div className="absolute inset-0 flex flex-col justify-between py-2">
                   <div className="w-full border-b border-black/10" />
                   <div className="w-full border-b border-black/10" />
                   <div className="w-full border-b border-black/10" />
                 </div>
               </div>
               <div className="flex flex-col justify-center flex-1">
                 <p className="text-sm font-medium text-stone-500">{fuelTankSummary?.tank.name || 'Tanque Base'}</p>
                 <p className="text-xl font-bold text-stone-900 mt-1">
                   {litersInTank != null ? litersInTank.toLocaleString('es-MX', { maximumFractionDigits: 0 }) : '0'} L
                 </p>
                 <p className="text-xs text-stone-500 mt-1">
                   Capacidad: {capacity != null ? (capacity / 1000).toLocaleString('es-MX') + 'k' : '—'} L
                 </p>
                 {pct != null && pct <= 15 && (
                   <span className="inline-flex mt-2 items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-red-100 text-red-700 self-start">
                     Alerta de recarga
                   </span>
                 )}
               </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECCIÓN 2: Rentabilidad y Finanzas */}
        <section className="flex flex-col gap-4">
          <h3 className="text-base font-semibold text-stone-800 flex items-center gap-2">
            <DollarSign className="size-5 text-emerald-600" />
            Salud Financiera
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-stone-200 shadow-sm">
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-stone-500">Balance Neto Op.</p>
                  <DollarSign className="size-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-emerald-600">$142,500 <span className="text-sm font-normal text-stone-500">MXN</span></p>
                  <p className="text-xs text-stone-500 mt-1">Ingresos vs Gastos Vinculados</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-stone-200 shadow-sm relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1 h-full bg-yellow-400" />
              <CardContent className="p-5 flex flex-col justify-between h-full gap-4">
                <div className="flex items-start justify-between">
                  <p className="text-sm font-medium text-stone-500">Gastos No Vinculados</p>
                  <AlertCircle className="size-4 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-stone-900">$18,200 <span className="text-sm font-normal text-stone-500">MXN</span></p>
                  <p className="text-xs text-stone-500 mt-1">Mantenimientos y refacciones imprevisibles</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* SECCIÓN 3: Estatus Operativo */}
        <section className="flex flex-col gap-4">
           <h3 className="text-base font-semibold text-stone-800 flex items-center gap-2">
            <Activity className="size-5 text-indigo-600" />
            Estatus de Operación
          </h3>

          <Card className="border-stone-200 shadow-sm h-full">
             <CardContent className="p-0 flex flex-col sm:flex-row h-full">
               <div className="p-5 flex-1 border-b sm:border-b-0 sm:border-r border-stone-100 flex flex-col justify-between">
                 <p className="text-sm font-medium text-stone-500 mb-4">Resumen Flotilla</p>
                 <div className="space-y-3 shrink-0">
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-stone-600">
                        <span className="size-2 rounded-full bg-indigo-500" /> En Ruta
                      </span>
                      <span className="font-semibold text-stone-900">12</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-stone-600">
                        <span className="size-2 rounded-full bg-emerald-500" /> Disponibles
                      </span>
                      <span className="font-semibold text-stone-900">4</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="flex items-center gap-2 text-stone-600">
                        <span className="size-2 rounded-full bg-red-500" /> Taller / Falla
                      </span>
                      <span className="font-semibold text-stone-900">2</span>
                    </div>
                 </div>
               </div>

               <div className="p-5 flex-1 flex flex-col justify-between bg-stone-50/50">
                 <p className="text-sm font-medium text-stone-500 mb-2">Desviación de Uso</p>
                 <div className="flex flex-col gap-1">
                   <p className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">KM Reales vs Pre-Factura</p>
                   <p className="text-xl font-bold text-yellow-600">+ 120 km</p>
                   <p className="text-xs text-stone-500 leading-tight mt-1">Diferencia detectada en las rutas completadas hoy. Posible desvío o falta de optimización.</p>
                 </div>
               </div>
             </CardContent>
          </Card>
        </section>
      </div>

      {/* SECCIÓN 4: Alertas de Operación (Candados) */}
      <section className="flex flex-col gap-4">
        <h3 className="text-base font-semibold text-stone-800 flex items-center gap-2">
          <ShieldAlert className="size-5 text-red-600" />
          Alertas Críticas y Candados
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Operadores Inactivos */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-red-200 bg-red-50/50">
            <div className="p-2 bg-red-100 rounded-lg shrink-0">
               <FileWarning className="size-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-red-900">Documentación Vencida (Operadores)</p>
              <p className="text-xs text-red-700/80 mt-1">
                2 operadores bloqueados para asignación. Su examen OPALO o Licencia Federal ha expirado.
              </p>
              <button className="mt-2 text-xs font-medium text-red-700 hover:text-red-800 underline">
                Ver detalle de operadores
              </button>
            </div>
          </div>

          {/* Unidades Inactivas */}
          <div className="flex items-start gap-4 p-4 rounded-xl border border-orange-200 bg-orange-50/50">
            <div className="p-2 bg-orange-100 rounded-lg shrink-0">
               <Truck className="size-5 text-orange-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-orange-900">Mantenimiento Preventivo Atrasado</p>
              <p className="text-xs text-orange-700/80 mt-1">
                Unidad UNIT-05 requiere mantenimiento tipo B. Se sugiere no asignar rutas de más de 500km.
              </p>
              <button className="mt-2 text-xs font-medium text-orange-700 hover:text-orange-800 underline">
                Programar cita en taller
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* REFERENCIA A LA TABLA (Placeholder Visual) */}
      <div className="mt-8 pt-8 border-t border-stone-200">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-stone-900">Monitor de Viajes Activos</h3>
            <p className="text-sm text-stone-500">Reflejo en vivo del panel general de despachos.</p>
          </div>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1 bg-blue-50 px-3 py-1.5 rounded-md">
            Ir a Tabla Completa <ChevronDown className="size-4 -rotate-90" />
          </button>
        </div>

        {/* Minimal Fake Table for Preview */}
        <div className="rounded-lg border border-stone-200 bg-white overflow-hidden shadow-sm">
          <div className="bg-stone-50 px-6 py-3 border-b border-stone-200 grid grid-cols-4 sm:grid-cols-5 text-xs font-semibold text-stone-500">
            <div className="col-span-1">Folio</div>
            <div className="hidden sm:block col-span-1">Cliente</div>
            <div className="col-span-2">Ruta</div>
            <div className="col-span-1 text-right">Estatus</div>
          </div>
          <div className="divide-y divide-stone-100">
             <div className="px-6 py-4 grid grid-cols-4 sm:grid-cols-5 items-center text-sm">
               <div className="font-medium text-stone-900">TRP-492</div>
               <div className="hidden sm:block text-stone-600">Logística Centro</div>
               <div className="col-span-2 text-stone-500">Mty <span className="mx-1 text-stone-300">-&gt;</span> CDMX</div>
               <div className="text-right"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-100 text-blue-700">En Ruta</span></div>
             </div>
             <div className="px-6 py-4 grid grid-cols-4 sm:grid-cols-5 items-center text-sm">
               <div className="font-medium text-stone-900">TRP-491</div>
               <div className="hidden sm:block text-stone-600">Transportes del Norte</div>
               <div className="col-span-2 text-stone-500">Laredo <span className="mx-1 text-stone-300">-&gt;</span> Qro</div>
               <div className="text-right"><span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">Descargando</span></div>
             </div>
          </div>
        </div>
      </div>
      
    </div>
  )
}
