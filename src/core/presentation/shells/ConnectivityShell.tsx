'use client'

/**
 * @fileoverview Wrapper client para montar el ConnectivityProvider y el ConnectivityBanner
 * dentro del layout del dashboard (que es un Server Component).
 *
 * Este componente actúa como "puente" entre el Server Component del layout
 * y los Client Components que necesitan detectar conectividad.
 */

import React from 'react'
import { ConnectivityProvider } from '../providers/connectivity-provider'
import { ConnectivityBanner } from '../components/organisms/ConnectivityBanner'

interface ConnectivityShellProps {
  children: React.ReactNode
}

/**
 * Shell de conectividad para el layout del dashboard.
 * Envuelve los children con el provider de conectividad y agrega el banner de estado.
 */
export function ConnectivityShell({ children }: ConnectivityShellProps) {
  return (
    <ConnectivityProvider>
      <ConnectivityBanner />
      {children}
    </ConnectivityProvider>
  )
}
