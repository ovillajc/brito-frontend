import { z } from 'zod'

/**
 * Esquema de validación para el formulario de contacto de la landing page.
 * Refleja el interés B2B de Sociedad Brito.
 */
export const contactFormSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre es demasiado largo'),
  
  email: z.string()
    .email('Dirección de correo electrónico no válida'),
  
  phone: z.string()
    .min(10, 'El teléfono debe tener al menos 10 dígitos')
    .max(15, 'El teléfono es demasiado largo')
    .optional()
    .or(z.literal('')),
  
  company: z.string()
    .min(2, 'El nombre de la empresa debe tener al menos 2 caracteres')
    .max(100, 'El nombre de la empresa es demasiado largo')
    .optional()
    .or(z.literal('')), // Permite strings vacíos si el usuario decide no ponerlo
  
  message: z.string()
    .min(10, 'El mensaje debe tener al menos 10 caracteres')
    .max(1000, 'El mensaje es demasiado largo'),
})

/**
 * Tipo inferido del esquema de validación.
 */
export type ContactFormInput = z.infer<typeof contactFormSchema>
