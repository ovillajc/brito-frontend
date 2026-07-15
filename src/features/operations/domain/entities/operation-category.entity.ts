/**
 * @fileoverview Entidades de dominio para las categorías de operaciones.
 */

export type OperationCategoryId =
  | 'clientes'
  | 'logistica'
  | 'administracion'
  | 'recursos'

export interface OperationCategoryEntity {
  id: OperationCategoryId
  label: string
  description: string
  icon: string
  color: string
  bgColor: string
  count?: number
}

export type ClientId = 'walmart'

export interface ClientOperationEntity {
  id: ClientId
  name: string
  logo?: string
  description: string
  href: string
  tag?: string
  color: string
  bgColor: string
  borderColor: string
}

export interface CategoryOperationEntity {
  id: string
  label: string
  description: string
  href: string
  icon: string
  badge?: string
}
