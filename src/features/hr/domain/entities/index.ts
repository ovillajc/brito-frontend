/**
 * @fileoverview Entidades de dominio para el módulo de Recursos Humanos.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

export type EmployeeType = 'operativo' | 'administrativo'
export type EmployeeStatus = 'activo' | 'suspendido' | 'baja' | 'vacaciones'

export interface DepartmentEntity {
  id: string
  name: string
  description?: string | null
  responsibleId?: string | null
  createdAt: Date
}

export interface EmployeeEntity {
  id: string
  fullName: string
  rfc?: string | null
  nss?: string | null
  curp?: string | null
  departmentId?: string | null
  departmentName?: string | null
  isOperator: boolean
  isActive: boolean
  hireDate?: Date | null
  contactPhone?: string | null
  contactEmail?: string | null
  birthDate?: Date | null
  jobTitle?: string | null
  emergencyContactName?: string | null
  emergencyContactPhone?: string | null
  bloodType?: string | null
  medicalNotes?: string | null
  profileId?: string | null

  // Operator credentials
  licenseNumber?: string | null
  licenseType?: string | null
  licenseExpiration?: Date | null
  opaloId?: string | null
  opaloExpiration?: Date | null
  rcontrolId?: string | null
  rcontrolExpiration?: Date | null
  fasttrackId?: string | null
  fasttrackExpiration?: Date | null

  createdAt: Date
  updatedAt: Date
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
