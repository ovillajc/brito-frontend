import type { NextConfig } from 'next'
import withPWA from 'next-pwa'

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  experimental: {
    serverActions: {
      // Límite ampliado para soportar subida de archivos de hasta 10 MB
      // (debe ser mayor que el MAX_SIZE_BYTES definido en r2-upload.action.ts)
      bodySizeLimit: '11mb',
    },
  },
}

const pwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // Desactivar en desarrollo para no interferir con Turbopack / HMR
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // ── Fonts ─────────────────────────────────────────────────────────────
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    // ── Imágenes estáticas ─────────────────────────────────────────────────
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: { maxEntries: 60, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // ── JS / CSS compilados por Next.js ────────────────────────────────────
    {
      urlPattern: /\/_next\/static\//,
      handler: 'CacheFirst',
      options: {
        cacheName: 'next-static',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // ── Páginas HTML del dashboard (Network First: intenta red, usa cache si falla) ─
    {
      urlPattern: /^\/(dashboard|expenses|trips|maintenance|fleet|fuel|hr|fleet)\//,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'dashboard-pages',
        expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 },
        networkTimeoutSeconds: 5,
      },
    },
  ],
})

export default pwaConfig(nextConfig)
