import { Either } from '@/src/core/domain/either'
import { ApplicantEntity, AttendanceEntity, EmployeeEntity } from '../domain/entities'

export type Failure = {
  code: string
  message: string
}

// ------------------------------------
// Mock Data (Static)
// ------------------------------------
const mockEmployees: EmployeeEntity[] = [
  {
    id: 'emp-1',
    fullName: 'Juan Pérez Silva',
    departmentName: 'Logística',
    isOperator: true,
    isActive: true,
    hireDate: new Date('2023-01-15T00:00:00Z'),
    contactPhone: '555-010-2020',
    contactEmail: 'juan.perez@example.com',
    bloodType: 'O+',
    documents: [],
    createdAt: new Date('2023-01-15T00:00:00Z'),
    updatedAt: new Date('2023-01-15T00:00:00Z')
  },
  {
    id: 'emp-2',
    fullName: 'María González',
    departmentName: 'Recursos Humanos',
    isOperator: false,
    isActive: true,
    hireDate: new Date('2024-02-10T00:00:00Z'),
    contactPhone: '555-030-4040',
    contactEmail: 'maria.g@example.com',
    bloodType: 'A+',
    documents: [],
    createdAt: new Date('2024-02-10T00:00:00Z'),
    updatedAt: new Date('2024-02-10T00:00:00Z')
  }
]

const mockApplicants: ApplicantEntity[] = [
  {
    id: 'app-1',
    firstName: 'Carlos',
    lastName: 'López',
    expectedRole: 'Conductor Carga Pesada',
    stage: 'entrevista',
    isOperatorRole: true,
    boardOrder: 1,
    createdAt: new Date()
  },
  {
    id: 'app-2',
    firstName: 'Ana',
    lastName: 'Martínez',
    expectedRole: 'Analista de Sistemas',
    stage: 'postulado',
    isOperatorRole: false,
    boardOrder: 0,
    createdAt: new Date()
  }
]

const mockAttendance: AttendanceEntity[] = [
  {
    id: 'att-1',
    employeeId: 'emp-1',
    employeeName: 'Juan Pérez Silva',
    incidentDate: new Date(),
    incidentType: 'asistencia',
    notes: '',
    createdAt: new Date()
  },
  {
    id: 'att-2',
    employeeId: 'emp-2',
    employeeName: 'María González',
    incidentDate: new Date(),
    incidentType: 'retardo',
    notes: 'Tráfico pesado',
    createdAt: new Date()
  }
]

// ------------------------------------
// Mocked Use Cases
// ------------------------------------

export async function getEmployeesMockUseCase(): Promise<Either<Failure, EmployeeEntity[]>> {
  // Simular latencia de red
  await new Promise(resolve => setTimeout(resolve, 800))
  return { ok: true, data: mockEmployees }
}

export async function getApplicantsMockUseCase(): Promise<Either<Failure, ApplicantEntity[]>> {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { ok: true, data: mockApplicants }
}

export async function getAttendanceMockUseCase(): Promise<Either<Failure, AttendanceEntity[]>> {
  await new Promise(resolve => setTimeout(resolve, 800))
  return { ok: true, data: mockAttendance }
}

export async function getHrKpisMockUseCase(): Promise<Either<Failure, { totalEmployees: number; operatorsActive: number; openVacancies: number; absenteeismRate: string }>> {
  await new Promise(resolve => setTimeout(resolve, 500))
  return {
    ok: true,
    data: {
      totalEmployees: 124,
      operatorsActive: 89,
      openVacancies: 5,
      absenteeismRate: '2.4%'
    }
  }
}
