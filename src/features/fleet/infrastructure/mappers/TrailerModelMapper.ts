import { TrailerModelEntity } from "../../domain/entities";

export class TrailerModelMapper {
    static toDomain(raw: Record<string, unknown>): TrailerModelEntity {
        return {
            id: raw.id as string,
            name: raw.name as string,
            brand: raw.brand as string | null,
            provider: raw.provider as string | null,
            capacityKg: raw.capacity_kg as number | null,
            size: raw.size as string | null,
            cargoType: raw.cargo_type as string | null,
            acquisitionYear: raw.acquisition_year as number | null,
            categoryId: raw.category_id as string | null,
            description: raw.description as string | null,
            createdAt: new Date(raw.created_at as string),
            updatedAt: new Date(raw.updated_at as string),
        }
    }
}
