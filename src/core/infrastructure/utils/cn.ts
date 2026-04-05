import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utilidad para combinar clases de Tailwind de forma segura,
 * resolviendo conflictos de especificidad con tailwind-merge.
 * 
 * @param inputs - Lista de clases, condicionales o arreglos de clases.
 * @returns String de clases combinado y optimizado.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
