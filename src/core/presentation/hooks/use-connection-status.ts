'use client'

import { useState, useEffect } from 'react'

type ConnectionStatus = 'online' | 'offline' | 'slow'

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>('online')

  useEffect(() => {
    const updateFromNavigator = () => setStatus(navigator.onLine ? 'online' : 'offline')
    const handleOnline = () => setStatus('online')
    const handleOffline = () => setStatus('offline')

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    if (typeof navigator !== 'undefined') {
      queueMicrotask(updateFromNavigator)
    }

    // Optional: could add 'slow' detection logic here based on navigator.connection in the future
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return status
}
