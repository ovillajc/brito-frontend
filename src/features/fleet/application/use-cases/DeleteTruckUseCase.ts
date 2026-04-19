import { Either, Failure } from "@/src/core/domain/either";
import { ITruckRepository } from "../../domain/repositories/ITruckRepository";


export async function DeleteTruckUseCase(
    repository: ITruckRepository,
    id: string
): Promise<Either<Failure, void>> {
    return await repository.delete(id);
}
    