'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'
import { useEffect } from 'react'

/**
 * Thin wrapper around next-themes ThemeProvider.
 * Uses class-based dark mode to match Tailwind's `dark:` strategy.
 * 
 * NOTE: React 19 warns about the inline script injected by next-themes to prevent FOUC.
 * We suppress this specific warning in development as it is a false positive for this library's use case.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return

    const originalError = console.error
    console.error = (...args: unknown[]) => {
      if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag while rendering React component')) {
        return
      }
      originalError.apply(console, args)
    }

    return () => {
      console.error = originalError
    }
  }, [])

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange={true}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
