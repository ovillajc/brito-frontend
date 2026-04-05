/**
 * @fileoverview Entidad Lead para la captación de contactos.
 * Sigue las reglas de Clean Architecture: Capa de Dominio.
 */

/**
 * Entidad que representa un contacto o prospecto.
 */
export interface Lead {
  id?: string
  name: string
  email: string
  company?: string
  phone?: string
  message: string
  createdAt?: string
}
