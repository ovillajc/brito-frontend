import { z } from 'zod'

// ==========================================
// HR Domain Entities
// ==========================================

export type EmployeeType = 'operativo' | 'administrativo'
export type EmployeeStatus = 'activo' | 'suspendido' | 'baja' | 'vacaciones'

export interface EmployeeEntity {
  id: string
  fullName: string
  rfc?: string
  curp?: string
  departmentId?: string
  departmentName?: string
  isOperator: boolean
  isActive: boolean
  hireDate: Date
  contactPhone?: string
  contactEmail?: string
  birthDate?: Date
  bloodType?: string
  createdAt: Date
}

export type AtsStage = 'postulado' | 'entrevista' | 'prueba_tecnica' | 'oferta' | 'contratado' | 'rechazado'

export interface ApplicantEntity {
  id: string
  firstName: string
  lastName: string
  expectedRole: string
  stage: AtsStage
  departmentId?: string
  isOperatorRole: boolean
  phoneNumber?: string
  email?: string
  boardOrder: number
  createdAt: Date
}

export type IncidentType = 'asistencia' | 'falta' | 'retardo' | 'vacaciones' | 'incapacidad' | 'permiso_sin_sueldo'

export interface AttendanceEntity {
  id: string
  employeeId: string
  employeeName: string
  incidentDate: Date
  incidentType: IncidentType
  notes?: string
  createdAt: Date
}

// ==========================================
// Zod Schemas for Validation
// ==========================================

export const atsStageSchema = z.enum([
  'postulado',
  'entrevista',
  'prueba_tecnica',
  'oferta',
  'contratado',
  'rechazado'
])

export const incidentTypeSchema = z.enum([
  'asistencia',
  'falta',
  'retardo',
  'vacaciones',
  'incapacidad',
  'permiso_sin_sueldo'
])
