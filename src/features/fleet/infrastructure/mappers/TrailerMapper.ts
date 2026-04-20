import { TrailerEntity, vehicleStatus } from "../../domain/entities";

export class TrailerMapper {
    static toDomain(raw: Record<string, unknown>): TrailerEntity {
        return {
            id: raw.id as string,
            economicNumber: raw.economic_number as string,
            plates: raw.plates as string | null,
            serialNumber: raw.serial_number as string | null,
            insurancePolicy: raw.insurance_policy as string | null,
            companyProfileId: raw.company_profile_id as string | null,
            trailerModelId: raw.trailer_model_id as string | null,
            status: raw.status as vehicleStatus,
            createdAt: new Date(raw.created_at as string),
            updatedAt: new Date(raw.updated_at as string),
            sizeFt: raw.size_ft as number | null,
            continuousRefrigeratedYield: raw.continuous_refrigerated_yield as number | null,
            continuousFrozenYield: raw.continuous_frozen_yield as number | null,
            ssRefrigeratedYield: raw.ss_refrigerated_yield as number | null,
            ssFrozenYield: raw.ss_frozen_yield as number | null,

            // Associated fields from inner joins
            trailerModelName: raw.trailer_models ? (raw.trailer_models as Record<string, unknown>).name as string : undefined,
            companyProfileLegalName: raw.company_profile ? (raw.company_profile as Record<string, unknown>).legal_name as string : undefined,
        }
    }

    static toPersistCreate(input: Partial<TrailerEntity>) {
        return {
            economic_number: input.economicNumber,
            plates: input.plates || null,
            serial_number: input.serialNumber || null,
            insurance_policy: input.insurancePolicy || null,
            company_profile_id: input.companyProfileId || null,
            trailer_model_id: input.trailerModelId || null,
            status: input.status,
            size_ft: input.sizeFt || null,
            continuous_refrigerated_yield: input.continuousRefrigeratedYield || null,
            continuous_frozen_yield: input.continuousFrozenYield || null,
            ss_refrigerated_yield: input.ssRefrigeratedYield || null,
            ss_frozen_yield: input.ssFrozenYield || null,
        }
    }

    static toPersistUpdate(input: Partial<TrailerEntity>) {
        const data: Record<string, unknown> = {}

        if (input.economicNumber !== undefined) data.economic_number = input.economicNumber
        if (input.plates !== undefined) data.plates = input.plates || null
        if (input.serialNumber !== undefined) data.serial_number = input.serialNumber || null
        if (input.insurancePolicy !== undefined) data.insurance_policy = input.insurancePolicy || null
        if (input.companyProfileId !== undefined) data.company_profile_id = input.companyProfileId || null
        if (input.trailerModelId !== undefined) data.trailer_model_id = input.trailerModelId || null
        if (input.status !== undefined) data.status = input.status
        if (input.sizeFt !== undefined) data.size_ft = input.sizeFt || null
        if (input.continuousRefrigeratedYield !== undefined) data.continuous_refrigerated_yield = input.continuousRefrigeratedYield || null
        if (input.continuousFrozenYield !== undefined) data.continuous_frozen_yield = input.continuousFrozenYield || null
        if (input.ssRefrigeratedYield !== undefined) data.ss_refrigerated_yield = input.ssRefrigeratedYield || null
        if (input.ssFrozenYield !== undefined) data.ss_frozen_yield = input.ssFrozenYield || null

        return data
    }
}
