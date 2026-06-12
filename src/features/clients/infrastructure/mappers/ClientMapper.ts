import { ClientEntity } from '../../domain/entities'

export class ClientMapper {
  static toDomain(raw: any): ClientEntity {
    return {
      id: raw.id,
      tradeName: raw.trade_name,
      companyName: raw.company_name,
      rfc: raw.rfc,
      taxDomicile: raw.tax_domicile,
      taxRegime: raw.tax_regime,
      companyProfileId: raw.company_profile_id,
      companyProfileLegalName: raw.company_profile ? (raw.company_profile as any).legal_name : undefined,
      createdAt: raw.created_at ? new Date(raw.created_at) : undefined,
      updatedAt: raw.updated_at ? new Date(raw.updated_at) : undefined,
    }
  }

  static toApi(entity: Partial<ClientEntity>): any {
    return {
      ...(entity.id ? { id: entity.id } : {}),
      trade_name: entity.tradeName,
      company_name: entity.companyName,
      rfc: entity.rfc,
      tax_domicile: entity.taxDomicile,
      tax_regime: entity.taxRegime,
      company_profile_id: entity.companyProfileId ?? null,
    }
  }
}
