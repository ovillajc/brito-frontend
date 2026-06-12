export interface ClientEntity {
  id: string
  tradeName?: string | null
  companyName?: string | null
  rfc?: string | null
  taxDomicile?: string | null
  taxRegime?: string | null
  companyProfileId?: string | null
  companyProfileLegalName?: string | null
  createdAt?: Date
  updatedAt?: Date
}
