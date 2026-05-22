'use client'

/**
 * @fileoverview Provider de conectividad global.
 *
 * Se monta en el layout raíz del dashboard y:
 * 1. Detecta eventos online/offline del navegador
 * 2. Actualiza el store de conectividad
 * 3. Dispara el SyncEngine cuando se recupera la red
 * 4. Mantiene el badge de "X pendientes" actualizado
 *
 * @organism
 */

import React, { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { useConnectivityStore } from '../stores/use-connectivity-store'
import { runSyncEngine, type ActionDispatcher, type FileUploader } from '@/src/core/infrastructure/offline/sync-engine'
import { getPendingCount } from '@/src/core/infrastructure/offline/offline-queue'
import { uploadFileToR2Action } from '@/src/core/infrastructure/storage/r2-upload.action'

// ── Dispatcher de Server Actions ──────────────────────────────────────────────

/**
 * Mapea el nombre de un Server Action a su función real.
 * Agrega aquí cada módulo que soporte escritura offline.
 */
const actionDispatcher: ActionDispatcher = async (actionName, payload) => {
  switch (actionName) {
    case 'createExpenseAction': {
      const { createExpenseAction } = await import('@/src/features/expenses/presentation/actions/expenses.actions')
      return createExpenseAction(payload as Parameters<typeof createExpenseAction>[0])
    }
    case 'createTripSettlementAction': {
      const { createTripSettlementAction } = await import('@/src/features/expenses/presentation/actions/expense-assignments.actions')
      return createTripSettlementAction(payload as Parameters<typeof createTripSettlementAction>[0])
    }
    // Agrega más módulos aquí conforme se integren:
    // case 'createMaintenanceAction': { ... }
    // case 'createTripAction': { ... }
    default:
      return { ok: false, error: { code: 'UNKNOWN_ACTION', message: `Acción desconocida: ${actionName}` } }
  }
}

// ── Uploader de archivos (para sync de files pendientes) ───────────────────────

const fileUploader: FileUploader = async (fileName, mimeType, folder, data) => {
  const file = new File([data], fileName, { type: mimeType })
  const formData = new FormData()
  formData.append('file', file)
  formData.append('folder', folder)
  const result = await uploadFileToR2Action(formData)
  if (!result.ok) throw new Error(result.error?.message ?? 'Error subiendo archivo')
  return result.data.url!
}

// ── Componente Provider ───────────────────────────────────────────────────────

interface ConnectivityProviderProps {
  children: React.ReactNode
}

/**
 * Provider de conectividad. Montar en el layout del dashboard.
 * No tiene UI propia — solo gestiona estado y efectos secundarios.
 */
export function ConnectivityProvider({ children }: ConnectivityProviderProps) {
  const setOnline = useConnectivityStore((s) => s.setOnline)
  const setOffline = useConnectivityStore((s) => s.setOffline)
  const setSyncing = useConnectivityStore((s) => s.setSyncing)
  const setSyncError = useConnectivityStore((s) => s.setSyncError)
  const setSyncDone = useConnectivityStore((s) => s.setSyncDone)
  const setPendingCount = useConnectivityStore((s) => s.setPendingCount)
  const isMountedRef = useRef(true)

  /** Ejecuta el ciclo de sincronización con callbacks de UI. */
  const triggerSync = async () => {
    await runSyncEngine(actionDispatcher, fileUploader, {
      onStart: (total) => {
        setSyncing(0, total)
        toast.info(`Sincronizando ${total} registro${total > 1 ? 's' : ''} offline...`, {
          id: 'sync-start',
          duration: Infinity,
        })
      },
      onProgress: (current, total) => {
        if (isMountedRef.current) setSyncing(current, total)
      },
      onSuccess: (label) => {
        toast.success(`✅ ${label} sincronizado`, { duration: 3000 })
      },
      onError: (label, message) => {
        toast.error(`❌ Error en "${label}": ${message}`, { duration: 5000 })
      },
      onComplete: (synced, failed) => {
        toast.dismiss('sync-start')
        if (failed === 0) {
          toast.success(`🎉 Sincronización completa — ${synced} registro${synced > 1 ? 's' : ''} subido${synced > 1 ? 's' : ''}`)
          setSyncDone()
        } else {
          toast.warning(`Sincronización parcial — ${synced} ok, ${failed} con errores`)
          setSyncError(failed)
        }
        // Actualizar contador
        getPendingCount().then(setPendingCount)
      },
    })
  }

  /** Actualiza el contador de pendientes desde IndexedDB. */
  const refreshPendingCount = async () => {
    const count = await getPendingCount()
    if (isMountedRef.current) setPendingCount(count)
  }

  useEffect(() => {
    isMountedRef.current = true

    const handleOnline = () => {
      setOnline()
      toast.dismiss('offline-banner')
      toast.info('Conexión restaurada. Iniciando sincronización...')
      triggerSync()
    }

    const handleOffline = () => {
      setOffline()
      toast.warning('Sin conexión a internet. Los datos se guardarán localmente.', {
        id: 'offline-banner',
        duration: Infinity,
      })
      refreshPendingCount()
    }

    // Estado inicial
    if (!navigator.onLine) {
      setOffline()
      refreshPendingCount()
    } else {
      // Al montar con red, sincronizamos por si había pendientes de sesión anterior
      refreshPendingCount().then((count) => {
        if (typeof count === 'number' && count > 0) triggerSync()
      })
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      isMountedRef.current = false
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>{children}</>
}
