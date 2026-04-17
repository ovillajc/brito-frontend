import { Either, Failure } from '@/src/core/domain/either'
import { EmployeeEntity } from '../entities'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../schemas/employee.schema'

export interface IEmployeeRepository {
  findAll(): Promise<Either<Failure, EmployeeEntity[]>>
  findById(id: string): Promise<Either<Failure, EmployeeEntity>>
  create(data: CreateEmployeeInput): Promise<Either<Failure, EmployeeEntity>>
  update(data: UpdateEmployeeInput): Promise<Either<Failure, EmployeeEntity>>
  delete(id: string): Promise<Either<Failure, void>>
}
