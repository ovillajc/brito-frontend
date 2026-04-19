import { ITruckRepository } from "../../domain/repositories/ITruckRepository";
import { TruckEntity } from "../../domain/entities";


export async function CreateTruckUseCase(repository:ITruckRepository, data:Partial<TruckEntity>) {
    return await repository.create(data);
}