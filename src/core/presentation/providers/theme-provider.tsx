'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'
import type { ThemeProviderProps } from 'next-themes'

/**
 * Thin wrapper around next-themes ThemeProvider.
 * Uses class-based dark mode to match Tailwind's `dark:` strategy.
 * 
 * NOTE: React 19 warns about the inline script injected by next-themes to prevent FOUC.
 * We suppress this specific warning as it is a known behavior of the library.
 */

if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const originalError = console.error
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' && 
      args[0].includes('Encountered a script tag while rendering React component')
    ) {
      return
    }
    originalError.apply(console, args)
  }
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
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
