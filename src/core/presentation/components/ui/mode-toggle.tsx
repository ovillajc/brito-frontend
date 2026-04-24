'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/src/core/presentation/components/ui/button'

/**
 * Componente para alternar entre los modos claro y oscuro.
 * Sigue los principios de diseño de Sociedad Brito y utiliza next-themes.
 */
export function ModeToggle() {
  const { setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  // Evitar errores de hidratación asegurando que el componente esté montado
  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="size-8 rounded-md text-stone-500 dark:text-zinc-400 opacity-50 cursor-default">
        <Sun className="size-4" />
      </Button>
    )
  }

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      className="size-8 rounded-md text-stone-500 dark:text-zinc-400 hover:text-stone-900 dark:hover:text-zinc-100 hover:bg-stone-100 dark:hover:bg-zinc-800 transition-all duration-200"
      onClick={toggleTheme}
      title={resolvedTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Alternar tema"
    >
      {resolvedTheme === 'dark' ? (
        <Moon className="size-4 animate-in fade-in zoom-in duration-300" />
      ) : (
        <Sun className="size-4 animate-in fade-in zoom-in duration-300" />
      )}
    </Button>
  )
}
