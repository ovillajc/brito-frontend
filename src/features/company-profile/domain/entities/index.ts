/**
 * @fileoverview Entidades de dominio para Perfiles de Compañía.
 * Sigue Clean Architecture según AGENTS.md.
 */

export interface CompanyProfileEntity {
  id: string
  legalName: string
  rfc: string
  taxRegime: string
  zipCode: string
  street?: string | null
  exteriorNum?: string | null
  interiorNum?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  country: string
  logoUrl?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
