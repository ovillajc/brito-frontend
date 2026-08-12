'use client'

import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/core/presentation/components/ui/card'
import { Checkbox } from '@/src/core/presentation/components/ui/checkbox'
import { Label } from '@/src/core/presentation/components/ui/label'
import { useSettingsStore } from '@/src/core/presentation/store/settings-store'

export default function SettingsPage() {
  const sidebarCollapsed = useSettingsStore(state => state.sidebarCollapsed)
  const setSidebarCollapsed = useSettingsStore(state => state.setSidebarCollapsed)
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-white">Configuración del Sistema</h1>
        <p className="text-stone-500 dark:text-zinc-400 mt-2">
          Administra tus preferencias y la apariencia de la aplicación.
        </p>
      </div>

      <div className="grid gap-6">
        <Card className="border-stone-200 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle>Navegación</CardTitle>
            <CardDescription>
              Configura el comportamiento del menú lateral y la navegación de la plataforma.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 rounded-lg border border-stone-200 dark:border-zinc-800 p-4 transition-colors hover:bg-stone-50 dark:hover:bg-zinc-800/50">
              <Checkbox 
                id="sidebar-collapsed" 
                checked={sidebarCollapsed}
                onChange={(e) => setSidebarCollapsed(e.target.checked)}
                className="mt-1"
              />
              <div className="space-y-1 leading-none">
                <Label htmlFor="sidebar-collapsed" className="font-medium text-stone-900 dark:text-zinc-100 cursor-pointer">
                  Mantener menú lateral contraído
                </Label>
                <p className="text-[13px] text-stone-500 dark:text-zinc-400">
                  Si activas esta opción, el menú principal solo mostrará los iconos por defecto para maximizar el espacio de trabajo en la pantalla.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}