/**
 * @fileoverview Patrón Either para el manejo funcional de errores.
 * Sigue las reglas de AGENTS.md.
 */

/**
 * Representa un resultado que puede ser un error (L) o un éxito (R).
 */
export type Either<L, R> = Error<L> | Success<R>

/**
 * Representa un fallo en la operación.
 */
export interface Error<L> {
  ok: false
  error: L
}

/**
 * Representa un éxito en la operación.
 */
export interface Success<R> {
  ok: true
  data: R
}

/**
 * Interfaz base para todos los fallos del sistema.
 */
export interface Failure {
  code: string
  message: string
  statusCode?: number
}
