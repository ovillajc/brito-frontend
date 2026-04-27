import { Either, Failure } from "@/src/core/domain/either";
import { TruckEntity } from "../entities";

export interface ITruckRepository {
    findAll(): Promise<Either<Failure, TruckEntity[]>>;
    findById(id: string): Promise<Either<Failure, TruckEntity>>;
    create(data: Partial<TruckEntity>): Promise<Either<Failure, TruckEntity>>;
    update(data: Partial<TruckEntity>): Promise<Either<Failure, TruckEntity>>;
    delete(id: string): Promise<Either<Failure, void>>;
}