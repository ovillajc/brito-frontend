import type { Either, Failure } from '@/src/core/domain/either'
import type { IExpensesRepository } from '../../domain/repositories/i-expenses-repository'
import { ExpenseMapper, type ExpenseRecord } from '../mappers/ExpenseMapper'
import type { ExpenseEntity } from '../../domain/entities/expense-entity'
import { EXPENSE_CATEGORY, EXPENSE_SCOPE } from '../../domain/entities/expense-entity'
import type { CreateExpenseInput } from '../../domain/schemas/create-expense.schema'

function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `exp_${Date.now()}_${Math.random().toString(16).slice(2)}`
}

const SEED: ExpenseRecord[] = [
  {
    id: 'exp_seed_1',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.General,
    category: EXPENSE_CATEGORY.Permits,
    description: 'Renovación de permiso municipal',
    amount: 2350,
    currency: 'MXN',
    occurred_at: '2026-04-03',
    vendor_name: 'Ayuntamiento',
    reference: 'PM-2026-0043',
    trip_id: null,
    created_at: '2026-04-03T10:10:00.000Z',
  },
  {
    id: 'exp_seed_2',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.General,
    category: EXPENSE_CATEGORY.InventoryPurchase,
    description: 'Compra de refacciones para almacén',
    amount: 14890,
    currency: 'MXN',
    occurred_at: '2026-04-07',
    vendor_name: 'Refaccionaria del Sureste',
    reference: 'FAC-88231',
    trip_id: null,
    created_at: '2026-04-07T15:02:00.000Z',
  },
  {
    id: 'exp_seed_3',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.General,
    category: EXPENSE_CATEGORY.PPE,
    description: 'Equipo EPP (guantes, casco, lentes)',
    amount: 3220,
    currency: 'MXN',
    occurred_at: '2026-04-10',
    vendor_name: 'Seguridad Industrial MX',
    reference: 'FAC-90113',
    trip_id: null,
    created_at: '2026-04-10T12:40:00.000Z',
  },
  {
    id: 'exp_seed_4',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.Trip,
    category: EXPENSE_CATEGORY.Tolls,
    description: 'Casetas ruta Villahermosa → Veracruz',
    amount: 1850,
    currency: 'MXN',
    occurred_at: '2026-04-12',
    vendor_name: null,
    reference: 'TICKETS-CASETA-001',
    trip_id: 'trip_1024',
    created_at: '2026-04-12T09:15:00.000Z',
  },
  {
    id: 'exp_seed_5',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.Trip,
    category: EXPENSE_CATEGORY.FuelLoad,
    description: 'Carga de combustible en ruta',
    amount: 4200,
    currency: 'MXN',
    occurred_at: '2026-04-12',
    vendor_name: 'Gasolinera Pemex',
    reference: 'TICKET-PEMEX-77812',
    trip_id: 'trip_1024',
    created_at: '2026-04-12T10:20:00.000Z',
  },
  {
    id: 'exp_seed_6',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.Trip,
    category: EXPENSE_CATEGORY.TripIncidents,
    description: 'Incidencia: ponchadura en remolque',
    amount: 980,
    currency: 'MXN',
    occurred_at: '2026-04-13',
    vendor_name: 'Llantera Express',
    reference: null,
    trip_id: 'trip_1024',
    created_at: '2026-04-13T03:55:00.000Z',
  },
  {
    id: 'exp_seed_7',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.General,
    category: EXPENSE_CATEGORY.BaseTankLoad,
    description: 'Carga del tanque de combustible de base',
    amount: 25000,
    currency: 'MXN',
    occurred_at: '2026-04-14',
    vendor_name: 'Proveedor Diesel',
    reference: 'ORD-BASE-2026-0414',
    trip_id: null,
    created_at: '2026-04-14T18:30:00.000Z',
  },
  {
    id: 'exp_seed_8',
    company_id: 'company_brito',
    scope: EXPENSE_SCOPE.Trip,
    category: EXPENSE_CATEGORY.Maintenance,
    description: 'Mantenimiento preventivo durante viaje',
    amount: 1650,
    currency: 'MXN',
    occurred_at: '2026-04-18',
    vendor_name: 'Taller Ruta 180',
    reference: 'SERV-180-3321',
    trip_id: 'trip_1031',
    created_at: '2026-04-18T17:10:00.000Z',
  },
]

export class MockExpensesRepository implements IExpensesRepository {
  private static records: ExpenseRecord[] = [...SEED]

  async listAll(): Promise<Either<Failure, ExpenseEntity[]>> {
    const data = MockExpensesRepository.records
      .slice()
      .sort((a, b) => b.occurred_at.localeCompare(a.occurred_at))
      .map(ExpenseMapper.toDomain)

    return { ok: true, data }
  }

  async create(input: CreateExpenseInput): Promise<Either<Failure, ExpenseEntity>> {
    const nowIso = new Date().toISOString()
    const raw = ExpenseMapper.fromCreateInput(input, generateId(), nowIso)

    MockExpensesRepository.records = [raw, ...MockExpensesRepository.records]

    return { ok: true, data: ExpenseMapper.toDomain(raw) }
  }
}

