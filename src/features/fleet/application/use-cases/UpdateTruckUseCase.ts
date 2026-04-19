import { Either, Failure } from "@/src/core/domain/either";
import { ITruckRepository } from "../../domain/repositories/ITruckRepository";
import { TruckEntity } from "../../domain/entities";
import { UpdateTruckInput } from "../../domain/schemas/truck.schema";

export async function UpdateTruckUseCase(
    repository: ITruckRepository,
    input: UpdateTruckInput
): Promise<Either<Failure, TruckEntity>> {
    return await repository.update(input);
}
