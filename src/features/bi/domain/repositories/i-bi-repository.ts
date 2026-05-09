import type { Either, Failure } from '@/src/core/domain/either'
import type {
  BiCatalogsEntity,
  FleetElementType,
  GlobalKpiEntity,
  OperativeHistoryItem,
  YieldCalculatorInput,
  YieldCalculatorResult,
} from '../entities/bi-entity'

export interface IBiRepository {
  getGlobalKpis(): Promise<Either<Failure, GlobalKpiEntity>>
  getCatalogs(): Promise<Either<Failure, BiCatalogsEntity>>
  getFleetHistory(type: FleetElementType, id: string): Promise<Either<Failure, OperativeHistoryItem[]>>
}

export interface IYieldCalculatorService {
  calculate(input: YieldCalculatorInput): Either<Failure, YieldCalculatorResult>
}

