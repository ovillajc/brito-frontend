'use server'

import { revalidatePath } from "next/cache";
import { CreateTruckUseCase } from "../../application/use-cases/CreateTruckUseCase";
import { GetTrucksUseCase } from "../../application/use-cases/GetTrucksUseCase";
import { CreateTruckInput, UpdateTruckInput } from "../../domain/schemas/truck.schema";
import { SupabaseTruckRepository } from "../../infrastructure/repositories/SupabaseTruckRepository";
import { UpdateTruckUseCase } from "../../application/use-cases/UpdateTruckUseCase";
import { DeleteTruckUseCase } from "../../application/use-cases/DeleteTruckUseCase";


const truckRepository = new SupabaseTruckRepository();

export async function getTrucksActions() {
    return GetTrucksUseCase(truckRepository);
}

export async function createTruckAction(input:CreateTruckInput) {
    const result = await CreateTruckUseCase(truckRepository, input);

    if (result.ok) {
        revalidatePath('/fleet/trucks');
    }

    return result;
}

export async function updateTruckAction(input:UpdateTruckInput) {
    const result = await UpdateTruckUseCase(truckRepository, input);

    if (result.ok) {
        revalidatePath('/fleet/trucks');
    }

    return result;
}

export async function deleteTruckAction(id: string) {
    const result = await DeleteTruckUseCase(truckRepository, id);


    if (result.ok) {
        revalidatePath('/fleet/trucks');
    }

    return result;
}