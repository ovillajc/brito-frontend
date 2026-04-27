import { ITruckRepository } from "../../domain/repositories/ITruckRepository";

export async function GetTrucksUseCase(repository:ITruckRepository) {
    return await repository.findAll();
}

