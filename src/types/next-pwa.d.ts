/**
 * Declaración de tipos para next-pwa.
 * Necesaria para usar el módulo en next.config.ts con TypeScript estricto.
 */
declare module 'next-pwa' {
  import type { NextConfig } from 'next'

  interface RuntimeCachingEntry {
    urlPattern: string | RegExp
    handler: 'CacheFirst' | 'CacheOnly' | 'NetworkFirst' | 'NetworkOnly' | 'StaleWhileRevalidate'
    options?: {
      cacheName?: string
      expiration?: {
        maxEntries?: number
        maxAgeSeconds?: number
      }
      networkTimeoutSeconds?: number
    }
  }

  interface PWAConfig {
    dest: string
    register?: boolean
    skipWaiting?: boolean
    disable?: boolean
    runtimeCaching?: RuntimeCachingEntry[]
    buildExcludes?: Array<string | RegExp>
    scope?: string
    sw?: string
  }

  function withPWA(config: PWAConfig): (nextConfig: NextConfig) => NextConfig
  export = withPWA
}
