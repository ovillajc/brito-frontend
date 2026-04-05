import { z } from 'zod'

/**
 * @fileoverview Esquema de validación para el Login.
 * Implementa las reglas de validación para email y contraseña.
 */

export const loginFormSchema = z.object({
  email: z.string()
    .min(1, 'El correo electrónico es requerido')
    .email('Dirección de correo electrónico no válida'),
  
  password: z.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(100, 'La contraseña es demasiado larga'),

  rememberMe: z.boolean()
})

/**
 * Tipo inferido del esquema de validación para el formulario.
 */
export type LoginFormInput = z.infer<typeof loginFormSchema>
