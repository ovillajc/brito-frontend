import { describe, expect, it, vi } from 'vitest'

describe('r2-client getR2KeyFromPublicUrl', () => {
  it('returns key when url matches public origin', async () => {
    vi.resetModules()
    process.env.PUBLIC_URL = 'https://cdn.example.com'

    const mod = await import('@/src/core/infrastructure/storage/r2-client')
    expect(mod.getR2KeyFromPublicUrl('https://cdn.example.com/expenses/receipts/a.pdf')).toBe(
      'expenses/receipts/a.pdf'
    )
  })

  it('returns null when origin does not match public origin', async () => {
    vi.resetModules()
    process.env.PUBLIC_URL = 'https://cdn.example.com'

    const mod = await import('@/src/core/infrastructure/storage/r2-client')
    expect(mod.getR2KeyFromPublicUrl('https://other.example.com/expenses/receipts/a.pdf')).toBe(null)
  })

  it('handles trailing slash on public url', async () => {
    vi.resetModules()
    process.env.PUBLIC_URL = 'https://cdn.example.com/'

    const mod = await import('@/src/core/infrastructure/storage/r2-client')
    expect(mod.getR2KeyFromPublicUrl('https://cdn.example.com/folder/file.png')).toBe('folder/file.png')
  })

  it('returns null for invalid url strings', async () => {
    vi.resetModules()
    process.env.PUBLIC_URL = 'https://cdn.example.com'

    const mod = await import('@/src/core/infrastructure/storage/r2-client')
    expect(mod.getR2KeyFromPublicUrl('not-a-url')).toBe(null)
  })
})

