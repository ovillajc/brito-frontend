/**
 * @fileoverview Página de Lista de Viajes.
 */

'use client'

import { useTripsList } from '@/src/features/trips/presentation/hooks/use-trips'
import { Card, CardContent } from '@/src/core/presentation/components/ui/card'
import { Button } from '@/src/core/presentation/components/ui/button'
import { Plus } from 'lucide-react'

export default function TripsListPage() {
  const { data: trips, isLoading } = useTripsList()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-on-surface">Lista de Viajes</h2>
          <p className="text-sm text-on-surface-variant">Administra el histórico y los viajes en curso.</p>
        </div>
        <Button className="gap-2">
          <Plus className="size-4" />
          Registrar Viaje
        </Button>
      </div>

      <Card className="border-none shadow-sm shadow-black/5 ring-1 ring-black/5 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-stone-50 border-b border-stone-200">
                <tr>
                  <th className="px-6 py-4 font-semibold text-stone-600">ID Viaje</th>
                  <th className="px-6 py-4 font-semibold text-stone-600">Origen</th>
                  <th className="px-6 py-4 font-semibold text-stone-600">Destino</th>
                  <th className="px-6 py-4 font-semibold text-stone-600">Cliente</th>
                  <th className="px-6 py-4 font-semibold text-stone-600">Estado</th>
                  <th className="px-6 py-4 font-semibold text-stone-600 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-20"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-32"></div></td>
                      <td className="px-6 py-4"><div className="h-4 bg-stone-200 rounded w-24"></div></td>
                      <td className="px-6 py-4"><div className="h-6 bg-stone-200 rounded-full w-20"></div></td>
                      <td className="px-6 py-4 text-right"><div className="h-8 bg-stone-200 rounded w-8 ml-auto"></div></td>
                    </tr>
                  ))
                ) : trips?.length === 0 ? (
                  <tr>
                     <td colSpan={6} className="px-6 py-12 text-center text-stone-500">
                       No se encontraron viajes registrados.
                     </td>
                  </tr>
                ) : (
                  trips?.map((trip) => (
                    <tr key={trip.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-900">{trip.id}</td>
                      <td className="px-6 py-4 text-stone-600">{trip.origin}</td>
                      <td className="px-6 py-4 text-stone-600">{trip.destination}</td>
                      <td className="px-6 py-4 text-stone-600">{trip.clientName}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                          ${trip.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            trip.status === 'in-progress' ? 'bg-blue-100 text-blue-800' : 
                            trip.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'}`}
                        >
                          {trip.status === 'in-progress' ? 'En Curso' : 
                           trip.status === 'completed' ? 'Completado' : 
                           trip.status === 'cancelled' ? 'Cancelado' : 'Pendiente'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm">Ver Todo</Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
