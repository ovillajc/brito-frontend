/**
 * @fileoverview Interfaz de repositorio para el módulo de Flotilla.
 * Define el contrato que debe seguir cualquier implementación (Mock o Supabase).
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { 
  TruckEntity, 
  TrailerEntity, 
  OperatorEntity, 
  UnitAssemblyEntity,
  ClientEntity,
  FleetDocument 
} from '../entities'

export interface IFleetRepository {
  // Tractores (Trucks)
  getTractors(): Promise<Either<Failure, TruckEntity[]>>
  getTractorById(id: string): Promise<Either<Failure, TruckEntity>>
  saveTractor(truck: Partial<TruckEntity>): Promise<Either<Failure, TruckEntity>>

  // Remolques
  getTrailers(): Promise<Either<Failure, TrailerEntity[]>>
  getTrailerById(id: string): Promise<Either<Failure, TrailerEntity>>
  saveTrailer(trailer: Partial<TrailerEntity>): Promise<Either<Failure, TrailerEntity>>

  // Operadores
  getOperators(): Promise<Either<Failure, OperatorEntity[]>>
  getOperatorById(id: string): Promise<Either<Failure, OperatorEntity>>
  saveOperator(operator: Partial<OperatorEntity>): Promise<Either<Failure, OperatorEntity>>

  // Clientes
  getClients(): Promise<Either<Failure, ClientEntity[]>>

  // Documentos
  getDocumentsByEntity(entityId: string): Promise<Either<Failure, FleetDocument[]>>
  uploadDocument(entityId: string, file: File, metadata: Partial<FleetDocument>): Promise<Either<Failure, FleetDocument>>

  // Armado de Unidades
  getActiveAssemblies(): Promise<Either<Failure, UnitAssemblyEntity[]>>
  assembleUnit(truckId: string, trailerId: string, operatorId: string, clientId?: string): Promise<Either<Failure, UnitAssemblyEntity>>
  disassembleUnit(assemblyId: string): Promise<Either<Failure, void>>
}
