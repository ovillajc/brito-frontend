/**
 * @fileoverview Implementación Mock del repositorio de Flotilla.
 * Proporciona datos simulados para desarrollo y pruebas.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { 
  TruckEntity, 
  TrailerEntity, 
  OperatorEntity, 
  UnitAssemblyEntity,
  ClientEntity,
  FleetDocument,
  vehicleStatus
} from '../../domain/entities'
import type { IFleetRepository } from '../../domain/repositories/fleet-repository'

/**
 * Datos simulados persistentes en memoria durante la sesión.
 */
const MOCK_TRUCKS: TruckEntity[] = [
  {
    id: 't1',
    economicNumber: 'ECO-001',
    brand: 'Kenworth',
    model: 'T680',
    year: 2023,
    plates: 'ABC-123',
    serialNumber: 'KW123456789',
    status: 'in_trip',
    insurancePolicy: 'POLICY-999',
    companyProfileId: 'cp1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 't2',
    economicNumber: 'ECO-002',
    brand: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    plates: 'XYZ-789',
    serialNumber: 'FL987654321',
    status: 'available',
    companyProfileId: 'cp1',
    insurancePolicy: 'POLICY-888',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const MOCK_TRAILERS: TrailerEntity[] = [
  {
    id: 'tr1',
    economicNumber: 'E-101',
    plates: 'TRL-001',
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
    trailerModelName: 'Dry Van',
  },
  {
    id: 'tr2',
    economicNumber: 'E-102',
    plates: 'TRL-002',
    status: 'available',
    createdAt: new Date(),
    updatedAt: new Date(),
    trailerModelName: 'Reefer',
  }
]

const MOCK_OPERATORS: OperatorEntity[] = [
  {
    id: 'op1',
    firstName: 'Juan',
    lastName: 'Pérez',
    licenseNumber: 'LIC-111',
    licenseType: 'B',
    licenseExpiration: new Date('2026-05-15'),
    status: 'in_trip',
    phone: '555-0101'
  },
  {
    id: 'op2',
    firstName: 'María',
    lastName: 'Rodríguez',
    licenseNumber: 'LIC-222',
    licenseType: 'BE',
    licenseExpiration: new Date('2025-09-20'),
    status: 'available',
    phone: '555-0202'
  }
]

const MOCK_CLIENTS: ClientEntity[] = [
  { id: 'c1', tradeName: 'Brito Transportes', companyName: null, taxRegime: null },
  { id: 'c2', tradeName: 'Brito Barita', companyName: null, taxRegime: null },
  { id: 'c3', tradeName: 'Cliente Externo A', companyName: null, taxRegime: null },
  { id: 'c4', tradeName: 'Cliente Externo B', companyName: null, taxRegime: null },
]

const ASSEMBLED_UNITS: UnitAssemblyEntity[] = []

export class MockFleetRepository implements IFleetRepository {
  private async sleep(ms = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getTractors(): Promise<Either<Failure, TruckEntity[]>> {
    await this.sleep()
    return { ok: true, data: MOCK_TRUCKS }
  }

  async getTractorById(id: string): Promise<Either<Failure, TruckEntity>> {
    await this.sleep()
    const truck = MOCK_TRUCKS.find(t => t.id === id)
    return truck 
      ? { ok: true, data: truck }
      : { ok: false, error: { code: 'NOT_FOUND', message: 'Tractor no encontrado' } }
  }

  async saveTractor(truck: Partial<TruckEntity>): Promise<Either<Failure, TruckEntity>> {
    const newTruck = {
      id: Math.random().toString(36).substr(2, 9),
      economicNumber: truck.economicNumber || '---',
      brand: truck.brand || 'Desconocida',
      model: truck.model || 'Desconocido',
      plates: truck.plates || '---',
      serialNumber: truck.serialNumber || '---',
      status: 'available' as vehicleStatus,
      companyProfileId: 'cp1',
      createdAt: new Date(),
      updatedAt: new Date(),
      ...truck
    } as TruckEntity
    MOCK_TRUCKS.push(newTruck)
    return { ok: true, data: newTruck }
  }

  async getTrailers(): Promise<Either<Failure, TrailerEntity[]>> {
    await this.sleep()
    return { ok: true, data: MOCK_TRAILERS }
  }

  async getTrailerById(id: string): Promise<Either<Failure, TrailerEntity>> {
    await this.sleep()
    const trailer = MOCK_TRAILERS.find(t => t.id === id)
    return trailer 
      ? { ok: true, data: trailer }
      : { ok: false, error: { code: 'NOT_FOUND', message: 'Remolque no encontrado' } }
  }

  async saveTrailer(trailer: Partial<TrailerEntity>): Promise<Either<Failure, TrailerEntity>> {
    const newTrailer = {
      id: Math.random().toString(36).substr(2, 9),
      plates: trailer.plates || '---',
      economicNumber: trailer.economicNumber || '---',
      status: 'available' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...trailer
    } as TrailerEntity
    MOCK_TRAILERS.push(newTrailer)
    return { ok: true, data: newTrailer }
  }

  async getOperators(): Promise<Either<Failure, OperatorEntity[]>> {
    await this.sleep()
    return { ok: true, data: MOCK_OPERATORS }
  }

  async getOperatorById(id: string): Promise<Either<Failure, OperatorEntity>> {
    await this.sleep()
    const op = MOCK_OPERATORS.find(o => o.id === id)
    return op 
      ? { ok: true, data: op }
      : { ok: false, error: { code: 'NOT_FOUND', message: 'Operador no encontrado' } }
  }

  async saveOperator(operator: Partial<OperatorEntity>): Promise<Either<Failure, OperatorEntity>> {
    const newOp = {
      id: Math.random().toString(36).substr(2, 9),
      firstName: operator.firstName || 'Sin nombre',
      lastName: operator.lastName || 'Sin apellido',
      licenseNumber: operator.licenseNumber || '---',
      licenseType: operator.licenseType || 'B',
      licenseExpiration: operator.licenseExpiration || new Date(),
      status: 'available' as const,
      ...operator
    } as OperatorEntity
    MOCK_OPERATORS.push(newOp)
    return { ok: true, data: newOp }
  }

  async getClients(): Promise<Either<Failure, ClientEntity[]>> {
    await this.sleep(400)
    return { ok: true, data: MOCK_CLIENTS }
  }

  async getDocumentsByEntity(entityId: string): Promise<Either<Failure, FleetDocument[]>> {
    // Simular que no hay documentos por ahora
    return { ok: true, data: [] }
  }

  async uploadDocument(entityId: string, file: File, metadata: Partial<FleetDocument>): Promise<Either<Failure, FleetDocument>> {
    const doc: FleetDocument = {
      id: Math.random().toString(36).substr(2, 9),
      title: metadata.title || file.name,
      type: metadata.type || 'otro',
      filePath: `/fake/path/${file.name}`,
      createdAt: new Date(),
      ...metadata
    } as FleetDocument
    return { ok: true, data: doc }
  }

  async getActiveAssemblies(): Promise<Either<Failure, UnitAssemblyEntity[]>> {
    await this.sleep()
    return { ok: true, data: ASSEMBLED_UNITS }
  }

  async assembleUnit(truckId: string, trailerId: string, operatorId: string, clientId?: string): Promise<Either<Failure, UnitAssemblyEntity>> {
    const truck = MOCK_TRUCKS.find(t => t.id === truckId)
    const trailer = MOCK_TRAILERS.find(t => t.id === trailerId)
    const operator = MOCK_OPERATORS.find(o => o.id === operatorId)
    const client = MOCK_CLIENTS.find(c => c.id === clientId)

    if (!truck || !trailer || !operator) {
      return { ok: false, error: { code: 'NOT_FOUND', message: 'Uno de los componentes no existe' } }
    }

    const assembly: UnitAssemblyEntity = {
      id: Math.random().toString(36).substr(2, 9),
      name: `Unidad ${truck.economicNumber}`,
      economicNumber: truck.economicNumber,
      employeeId: operator.id,
      truckId: truck.id,
      trailerId: trailer.id,
      clientId: client?.id ?? null,
      isActive: true,
      status: truck.status === 'in_trip' ? 'in_trip' : 'at_base',
      createdAt: new Date(),
      updatedAt: new Date(),
      employeeName: `${operator.firstName} ${operator.lastName}`,
      truckEconomicNumber: truck.economicNumber,
      trailerEconomicNumber: trailer.economicNumber,
      clientName: client?.tradeName ?? client?.companyName ?? undefined,
    }

    ASSEMBLED_UNITS.push(assembly)
    return { ok: true, data: assembly }
  }

  async disassembleUnit(assemblyId: string): Promise<Either<Failure, void>> {
    return { ok: true, data: undefined }
  }
}
