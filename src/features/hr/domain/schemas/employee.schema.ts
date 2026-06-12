import { z } from 'zod'

/**
 * @fileoverview Esquemas de validación Zod para el módulo de Recursos Humanos.
 * Sigue las reglas de Clean Architecture de AGENTS.md.
 */

// Zod schema for creating an employee
const employeeDocumentSchema = z.object({
  id: z.string().uuid().optional(),
  documentName: z.string().min(1, 'El nombre del documento es requerido'),
  // fileUrl acepta cualquier string (token __pending_file__:*, URL real, o vacío).
  // La validación de documentos adjuntos se hace exclusivamente en validateDocumentsStep()
  // del wizard, nunca a través del resolver Zod en el submit.
  fileUrl: z.string().optional().or(z.literal('')),
})

export const createEmployeeSchema = z.object({
  fullName: z.string().min(1, 'El nombre completo es requerido'),
  birthDate: z.string().optional().or(z.literal('')),
  contactEmail: z.string().email('Debe ser un email válido').optional().or(z.literal('')),
  contactPhone: z.string().optional().or(z.literal('')),
  rfc: z.string().optional().or(z.literal('')),
  curp: z.string().optional().or(z.literal('')),
  nss: z.string().optional().or(z.literal('')),
  isOperator: z.boolean(),
  departmentId: z.string().uuid().optional().or(z.literal('')),
  jobTitle: z.string().optional().or(z.literal('')),
  hireDate: z.string().optional().or(z.literal('')),

  // Emergency info
  emergencyContactName: z.string().optional().or(z.literal('')),
  emergencyContactPhone: z.string().optional().or(z.literal('')),
  bloodType: z.string().optional().or(z.literal('')),
  medicalNotes: z.string().optional().or(z.literal('')),

  // Operator credentials
  licenseNumber: z.string().optional().or(z.literal('')),
  licenseType: z.string().optional().or(z.literal('')),
  licenseExpiration: z.string().optional().or(z.literal('')),
  opaloId: z.string().optional().or(z.literal('')),
  opaloExpiration: z.string().optional().or(z.literal('')),
  rcontrolId: z.string().optional().or(z.literal('')),
  rcontrolExpiration: z.string().optional().or(z.literal('')),
  fasttrackId: z.string().optional().or(z.literal('')),
  fasttrackExpiration: z.string().optional().or(z.literal('')),
  documents: z.array(employeeDocumentSchema).default([]),
})

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>

// Zod schema for updating an employee
export const updateEmployeeSchema = createEmployeeSchema.partial().extend({
  id: z.string().uuid('ID inválido'),
  isActive: z.boolean().optional(),
})

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>

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
