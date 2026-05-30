import { TruckEntity, vehicleStatus } from "../../domain/entities";


export class TruckMapper {
    static toDomain(raw: Record<string, unknown>): TruckEntity {
        return {
            id: raw.id as string,
            economicNumber: raw.economic_number as string,
            brand: raw.brand as string,
            model: raw.model as string,
            year: raw.year as number,
            plates: raw.plates as string,
            serialNumber: raw.serial_number as string,
            insurancePolicy: raw.insurance_policy as string,
            companyProfileId: raw.company_profile_id as string,
            status: raw.status as vehicleStatus,
            createdAt: new Date(raw.created_at as string),
            updatedAt: new Date(raw.updated_at as string),
            engine: raw.engine as string,
            tireSize: raw.tire_size as string,
            tankCapacity: raw.tank_capacity as number,
            theoreticalYield: raw.theoretical_yield as number,
        }
    }

    static toPersistCreate(input: Partial<TruckEntity>) {
        return {
            economic_number: input.economicNumber,
            brand: input.brand,
            model: input.model,
            year: input.year,
            plates: input.plates,
            serial_number: input.serialNumber || null,
            insurance_policy: input.insurancePolicy || null,
            company_profile_id: input.companyProfileId || null,
            status: input.status,
            engine: input.engine || null,
            tire_size: input.tireSize || null,
            tank_capacity: input.tankCapacity || null,
            theoretical_yield: input.theoreticalYield || null,
        }
    }

    static toPersistUpdate(input: Partial<TruckEntity>) {
        const data: Record<string, unknown> = {}

        if (input.economicNumber !== undefined) data.economic_number = input.economicNumber
        if (input.brand !== undefined) data.brand = input.brand
        if (input.model !== undefined) data.model = input.model
        if (input.year !== undefined) data.year = input.year
        if (input.plates !== undefined) data.plates = input.plates
        if (input.serialNumber !== undefined) data.serial_number = input.serialNumber || null
        if (input.insurancePolicy !== undefined) data.insurance_policy = input.insurancePolicy || null
        if (input.companyProfileId !== undefined) data.company_profile_id = input.companyProfileId || null
        if (input.status !== undefined) data.status = input.status
        if (input.engine !== undefined) data.engine = input.engine || null
        if (input.tireSize !== undefined) data.tire_size = input.tireSize || null
        if (input.tankCapacity !== undefined) data.tank_capacity = input.tankCapacity || null
        if (input.theoreticalYield !== undefined) data.theoretical_yield = input.theoreticalYield || null

        return data
    }
}