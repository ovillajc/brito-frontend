import React, { Suspense } from 'react'
import { getHrKpisMockUseCase } from '@/src/features/hr/application/mock-hr-use-cases'
import { Card, CardHeader, CardTitle, CardContent } from '@/src/core/presentation/components/ui/card'
import { Users, Truck, Briefcase, FileWarning } from 'lucide-react'

// RSC - Root Server Component
export default async function HrDashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold tracking-tight text-on-surface">Panel Directivo</h2>
      
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

// Data Fetching Component
async function DashboardContent() {
  const result = await getHrKpisMockUseCase()

  if (!result.ok) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-lg">
        Error al cargar los KPIs: {result.error.message}
      </div>
    )
  }

  const kpis = result.data

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-stone-600 border-none pb-2">
          <CardTitle className="text-sm font-medium">Plantilla Total</CardTitle>
          <Users className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-stone-900">{kpis.totalEmployees}</div>
          <p className="text-xs text-stone-500 mt-1">Empleados activos</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-[#e07020] border-none pb-2">
          <CardTitle className="text-sm font-medium text-stone-600">Operadores</CardTitle>
          <Truck className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-[#e07020]">{kpis.operatorsActive}</div>
          <p className="text-xs text-stone-500 mt-1">Disponibles en flotilla</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-stone-600 border-none pb-2">
          <CardTitle className="text-sm font-medium">Vacantes Abiertas</CardTitle>
          <Briefcase className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-stone-900">{kpis.openVacancies}</div>
          <p className="text-xs text-stone-500 mt-1">En proceso de reclutamiento</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 text-red-600 border-none pb-2">
          <CardTitle className="text-sm font-medium text-stone-600">Tasa de Ausentismo</CardTitle>
          <FileWarning className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{kpis.absenteeismRate}</div>
          <p className="text-xs text-stone-500 mt-1">Últimos 30 días</p>
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 border-none">
            <div className="h-4 w-1/2 bg-stone-200 rounded"></div>
            <div className="h-4 w-4 bg-stone-200 rounded"></div>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-1/3 bg-stone-200 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-stone-200 rounded"></div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
