import { UnitAssemblyEntity } from '../../domain/entities'

export class UnitAssemblyMapper {
  static toDomain(raw: Record<string, unknown>): UnitAssemblyEntity {
    return {
      id: raw.id as string,
      name: raw.name as string,
      economicNumber: raw.economic_number as string,
      description: raw.description as string | null,
      employeeId: raw.employee_id as string,
      truckId: raw.truck_id as string,
      trailerId: raw.trailer_id as string | null,
      trailer2Id: raw.trailer2_id as string | null,
      clientId: raw.client_id as string | null,
      companyProfileId: raw.company_profile_id as string | null,
      isActive: raw.is_active as boolean,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),

      // Join fields
      employeeName: raw.employees
        ? (raw.employees as Record<string, unknown>).full_name as string
        : undefined,
      truckEconomicNumber: raw.trucks
        ? (raw.trucks as Record<string, unknown>).economic_number as string
        : undefined,
      trailerEconomicNumber: raw.trailers
        ? (raw.trailers as Record<string, unknown>).economic_number as string
        : undefined,
      trailer2EconomicNumber: raw.trailer2
        ? (raw.trailer2 as Record<string, unknown>).economic_number as string
        : undefined,
      clientName: raw.clients
        ? ((raw.clients as Record<string, unknown>).trade_name as string) ||
          ((raw.clients as Record<string, unknown>).company_name as string)
        : undefined,
      companyProfileLegalName: raw.company_profile
        ? (raw.company_profile as Record<string, unknown>).legal_name as string
        : undefined,
    }
  }

  static toPersistCreate(input: Partial<UnitAssemblyEntity>) {
    return {
      name: input.name,
      economic_number: input.economicNumber,
      description: input.description || null,
      employee_id: input.employeeId,
      truck_id: input.truckId,
      trailer_id: input.trailerId || null,
      trailer2_id: input.trailer2Id || null,
      client_id: input.clientId || null,
      company_profile_id: input.companyProfileId || null,
      is_active: input.isActive ?? true,
    }
  }

  static toPersistUpdate(input: Partial<UnitAssemblyEntity>) {
    const data: Record<string, unknown> = {}

    if (input.name !== undefined) data.name = input.name
    if (input.economicNumber !== undefined) data.economic_number = input.economicNumber
    if (input.description !== undefined) data.description = input.description || null
    if (input.employeeId !== undefined) data.employee_id = input.employeeId
    if (input.truckId !== undefined) data.truck_id = input.truckId
    if (input.trailerId !== undefined) data.trailer_id = input.trailerId || null
    if (input.trailer2Id !== undefined) data.trailer2_id = input.trailer2Id || null
    if (input.clientId !== undefined) data.client_id = input.clientId || null
    if (input.companyProfileId !== undefined) data.company_profile_id = input.companyProfileId || null
    if (input.isActive !== undefined) data.is_active = input.isActive

    return data
  }
}
