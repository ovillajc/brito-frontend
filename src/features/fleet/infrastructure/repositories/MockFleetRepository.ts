/**
 * @fileoverview Implementación Mock del repositorio de Flotilla.
 * Proporciona datos simulados para desarrollo y pruebas.
 */

import type { Either, Failure } from '@/src/core/domain/either'
import type { 
  TractorEntity, 
  TrailerEntity, 
  OperatorEntity, 
  UnitAssemblyEntity,
  ClientEntity,
  FleetDocument 
} from '../../domain/entities'
import type { IFleetRepository } from '../../domain/repositories/fleet-repository'

/**
 * Datos simulados persistentes en memoria durante la sesión.
 */
const MOCK_TRACTORS: TractorEntity[] = [
  {
    id: 't1',
    brand: 'Kenworth',
    model: 'T680',
    year: 2023,
    plates: 'ABC-123',
    vin: 'KW123456789',
    status: 'active',
    odometer: 150000,
    insurancePolicy: 'POLICY-999',
    insuranceExpiration: new Date('2025-12-31')
  },
  {
    id: 't2',
    brand: 'Freightliner',
    model: 'Cascadia',
    year: 2022,
    plates: 'XYZ-789',
    vin: 'FL987654321',
    status: 'available',
    odometer: 210000,
  }
]

const MOCK_TRAILERS: TrailerEntity[] = [
  {
    id: 'tr1',
    type: 'Dry Van',
    brand: 'Utility',
    model: '4000D',
    plates: 'TRL-001',
    economicNumber: 'E-101',
    status: 'active'
  },
  {
    id: 'tr2',
    type: 'Reefer',
    brand: 'Great Dane',
    model: 'Everest',
    plates: 'TRL-002',
    economicNumber: 'E-102',
    status: 'available'
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
    status: 'active',
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
  { id: 'c1', name: 'Brito Transportes', type: 'internal' },
  { id: 'c2', name: 'Brito Barita', type: 'internal' },
  { id: 'c3', name: 'Cliente Externo A', type: 'external' },
  { id: 'c4', name: 'Cliente Externo B', type: 'external' },
]

const ASSEMBLED_UNITS: UnitAssemblyEntity[] = []

export class MockFleetRepository implements IFleetRepository {
  private async sleep(ms = 800): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  async getTractors(): Promise<Either<Failure, TractorEntity[]>> {
    await this.sleep()
    return { ok: true, data: MOCK_TRACTORS }
  }

  async getTractorById(id: string): Promise<Either<Failure, TractorEntity>> {
    await this.sleep()
    const tractor = MOCK_TRACTORS.find(t => t.id === id)
    return tractor 
      ? { ok: true, data: tractor }
      : { ok: false, error: { code: 'NOT_FOUND', message: 'Tractor no encontrado' } }
  }

  async saveTractor(tractor: Partial<TractorEntity>): Promise<Either<Failure, TractorEntity>> {
    const newTractor = {
      id: Math.random().toString(36).substr(2, 9),
      brand: tractor.brand || 'Desconocida',
      model: tractor.model || 'Desconocido',
      plates: tractor.plates || '---',
      vin: tractor.vin || '---',
      status: 'available' as const,
      ...tractor
    } as TractorEntity
    MOCK_TRACTORS.push(newTractor)
    return { ok: true, data: newTractor }
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
      type: trailer.type || 'Caja Seca',
      brand: trailer.brand || 'Desconocida',
      model: trailer.model || 'Desconocido',
      plates: trailer.plates || '---',
      economicNumber: trailer.economicNumber || '---',
      status: 'available' as const,
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

  async assembleUnit(tractorId: string, trailerId: string, operatorId: string, clientId?: string): Promise<Either<Failure, UnitAssemblyEntity>> {
    const tractor = MOCK_TRACTORS.find(t => t.id === tractorId)
    const trailer = MOCK_TRAILERS.find(t => t.id === trailerId)
    const operator = MOCK_OPERATORS.find(o => o.id === operatorId)
    const client = MOCK_CLIENTS.find(c => c.id === clientId)

    if (!tractor || !trailer || !operator) {
      return { ok: false, error: { code: 'NOT_FOUND', message: 'Uno de los componentes no existe' } }
    }

    const assembly: UnitAssemblyEntity = {
      id: Math.random().toString(36).substr(2, 9),
      tractor,
      trailer,
      operator,
      clientId: client?.id,
      clientName: client?.name,
      isActive: true,
      createdAt: new Date()
    }

    ASSEMBLED_UNITS.push(assembly)
    return { ok: true, data: assembly }
  }

  async disassembleUnit(assemblyId: string): Promise<Either<Failure, void>> {
    return { ok: true, data: undefined }
  }
}
