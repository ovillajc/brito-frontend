import { describe, expect, it } from 'vitest'
import { EmployeeMapper } from '@/src/features/hr/infrastructure/mappers/EmployeeMapper'
import type { CreateEmployeeInput } from '@/src/features/hr/domain/schemas/employee.schema'

describe('EmployeeMapper', () => {
  it('mapea documentos de Supabase al dominio', () => {
    const mapped = EmployeeMapper.toDomain({
      id: 'emp-1',
      full_name: 'Juan Perez',
      rfc: null,
      nss: null,
      curp: null,
      department_id: null,
      departments: null,
      is_operator: false,
      is_active: true,
      hire_date: null,
      contact_phone: null,
      contact_email: null,
      birth_date: null,
      job_title: null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      blood_type: null,
      medical_notes: null,
      profile_id: null,
      driver_details: null,
      documents: [
        {
          id: 'doc-1',
          employee_id: 'emp-1',
          document_name: 'INE',
          file_url: 'https://cdn.example.com/ine.pdf',
          expiration_date: null,
          expiration_alert: true,
          created_at: '2026-06-11T10:00:00.000Z',
        },
      ],
      created_at: '2026-06-11T10:00:00.000Z',
      updated_at: '2026-06-11T10:00:00.000Z',
    })

    expect(mapped.documents).toHaveLength(1)
    expect(mapped.documents[0]).toMatchObject({
      id: 'doc-1',
      employeeId: 'emp-1',
      documentName: 'INE',
      fileUrl: 'https://cdn.example.com/ine.pdf',
      expirationAlert: true,
    })
  })

  it('genera payload de persistencia para documentos del empleado', () => {
    const input: CreateEmployeeInput = {
      fullName: 'Juan Perez',
      birthDate: '',
      contactEmail: '',
      contactPhone: '',
      rfc: '',
      curp: '',
      nss: '',
      isOperator: false,
      departmentId: '',
      jobTitle: '',
      hireDate: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      bloodType: '',
      medicalNotes: '',
      licenseNumber: '',
      licenseType: '',
      licenseExpiration: '',
      opaloId: '',
      opaloExpiration: '',
      rcontrolId: '',
      rcontrolExpiration: '',
      fasttrackId: '',
      fasttrackExpiration: '',
      documents: [
        {
          documentName: 'Contrato',
          fileUrl: 'https://cdn.example.com/contrato.pdf',
        },
      ],
    }

    const mapped = EmployeeMapper.toPersistDocuments(input, 'emp-1')

    expect(mapped).toEqual([
      {
        employee_id: 'emp-1',
        document_name: 'Contrato',
        file_url: 'https://cdn.example.com/contrato.pdf',
        expiration_date: null,
        expiration_alert: true,
      },
    ])
  })
})

