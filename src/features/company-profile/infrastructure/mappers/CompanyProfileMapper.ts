import { CompanyProfileEntity } from '../../domain/entities'

export class CompanyProfileMapper {
  static toDomain(raw: Record<string, unknown>): CompanyProfileEntity {
    return {
      id: raw.id as string,
      legalName: raw.legal_name as string,
      rfc: raw.rfc as string,
      taxRegime: raw.tax_regime as string,
      zipCode: raw.zip_code as string,
      street: raw.street as string | null,
      exteriorNum: raw.exterior_num as string | null,
      interiorNum: raw.interior_num as string | null,
      neighborhood: raw.neighborhood as string | null,
      city: raw.city as string | null,
      state: raw.state as string | null,
      country: raw.country as string,
      logoUrl: raw.logo_url as string | null,
      isActive: raw.is_active as boolean,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    }
  }
}
