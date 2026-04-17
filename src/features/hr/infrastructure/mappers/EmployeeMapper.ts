import { EmployeeEntity } from '../../domain/entities'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/schemas/employee.schema'

export class EmployeeMapper {
  /**
   * Mapea un payload nativo de Supabase a la entidad de dominio.
   */
  static toDomain(raw: Record<string, unknown>): EmployeeEntity {
    const departments = raw.departments as { name?: string } | null
    return {
      id: raw.id as string,
      fullName: raw.full_name as string,
      rfc: raw.rfc as string | null,
      nss: raw.nss as string | null,
      curp: raw.curp as string | null,
      departmentId: raw.department_id as string | null,
      departmentName: departments?.name ?? null,
      isOperator: (raw.is_operator as boolean) ?? false,
      isActive: (raw.is_active as boolean) ?? true,
      hireDate: raw.hire_date ? new Date(raw.hire_date as string) : null,
      contactPhone: raw.contact_phone as string | null,
      contactEmail: raw.contact_email as string | null,
      birthDate: raw.birth_date ? new Date(raw.birth_date as string) : null,
      jobTitle: raw.job_title as string | null,
      emergencyContactName: raw.emergency_contact_name as string | null,
      emergencyContactPhone: raw.emergency_contact_phone as string | null,
      bloodType: raw.blood_type as string | null,
      medicalNotes: raw.medical_notes as string | null,
      profileId: raw.profile_id as string | null,
      createdAt: new Date(raw.created_at as string),
      updatedAt: new Date(raw.updated_at as string),
    }
  }

  /**
   * Mapea un input de creación a la estructura que requiere Supabase.
   */
  static toPersistCreate(input: CreateEmployeeInput) {
    return {
      full_name: input.fullName,
      birth_date: input.birthDate || null,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      rfc: input.rfc || null,
      curp: input.curp || null,
      nss: input.nss || null,
      is_operator: input.isOperator,
      department_id: input.departmentId || null,
      job_title: input.jobTitle || null,
      hire_date: input.hireDate || null,
      emergency_contact_name: input.emergencyContactName || null,
      emergency_contact_phone: input.emergencyContactPhone || null,
      blood_type: input.bloodType || null,
      medical_notes: input.medicalNotes || null,
    }
  }

  /**
   * Mapea un input de actualización a la estructura que requiere Supabase.
   */
  static toPersistUpdate(input: Omit<UpdateEmployeeInput, 'id'>) {
    const data: Record<string, unknown> = {}

    if (input.fullName !== undefined) data.full_name = input.fullName
    if (input.birthDate !== undefined) data.birth_date = input.birthDate || null
    if (input.contactEmail !== undefined) data.contact_email = input.contactEmail || null
    if (input.contactPhone !== undefined) data.contact_phone = input.contactPhone || null
    if (input.rfc !== undefined) data.rfc = input.rfc || null
    if (input.curp !== undefined) data.curp = input.curp || null
    if (input.nss !== undefined) data.nss = input.nss || null
    if (input.isOperator !== undefined) data.is_operator = input.isOperator
    if (input.departmentId !== undefined) data.department_id = input.departmentId || null
    if (input.isActive !== undefined) data.is_active = input.isActive
    if (input.jobTitle !== undefined) data.job_title = input.jobTitle || null
    if (input.hireDate !== undefined) data.hire_date = input.hireDate || null
    if (input.emergencyContactName !== undefined) data.emergency_contact_name = input.emergencyContactName || null
    if (input.emergencyContactPhone !== undefined) data.emergency_contact_phone = input.emergencyContactPhone || null
    if (input.bloodType !== undefined) data.blood_type = input.bloodType || null
    if (input.medicalNotes !== undefined) data.medical_notes = input.medicalNotes || null

    return data
  }
}
