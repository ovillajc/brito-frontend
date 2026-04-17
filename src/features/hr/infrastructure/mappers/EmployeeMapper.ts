import { EmployeeEntity } from '../../domain/entities'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/schemas/employee.schema'

export class EmployeeMapper {
  /**
   * Mapea un payload nativo de Supabase a la entidad de dominio.
   */
  static toDomain(raw: Record<string, any>): EmployeeEntity {
    return {
      id: raw.id,
      fullName: raw.full_name,
      rfc: raw.rfc,
      nss: raw.nss,
      curp: raw.curp,
      departmentId: raw.department_id,
      departmentName: raw.departments?.name,
      isOperator: raw.is_operator ?? false,
      isActive: raw.is_active ?? true,
      hireDate: raw.hire_date ? new Date(raw.hire_date) : null,
      contactPhone: raw.contact_phone,
      contactEmail: raw.contact_email,
      birthDate: raw.birth_date ? new Date(raw.birth_date) : null,
      emergencyContactName: raw.emergency_contact_name,
      emergencyContactPhone: raw.emergency_contact_phone,
      bloodType: raw.blood_type,
      medicalNotes: raw.medical_notes,
      profileId: raw.profile_id,
      createdAt: new Date(raw.created_at),
      updatedAt: new Date(raw.updated_at),
    }
  }

  /**
   * Mapea un input de creación a la estructura que requiere Supabase.
   */
  static toPersistCreate(input: CreateEmployeeInput) {
    return {
      full_name: input.fullName,
      contact_email: input.contactEmail || null,
      contact_phone: input.contactPhone || null,
      rfc: input.rfc || null,
      curp: input.curp || null,
      nss: input.nss || null,
      is_operator: input.isOperator,
      department_id: input.departmentId || null,
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
    if (input.contactEmail !== undefined) data.contact_email = input.contactEmail || null
    if (input.contactPhone !== undefined) data.contact_phone = input.contactPhone || null
    if (input.rfc !== undefined) data.rfc = input.rfc || null
    if (input.curp !== undefined) data.curp = input.curp || null
    if (input.nss !== undefined) data.nss = input.nss || null
    if (input.isOperator !== undefined) data.is_operator = input.isOperator
    if (input.departmentId !== undefined) data.department_id = input.departmentId || null
    if (input.isActive !== undefined) data.is_active = input.isActive
    if (input.emergencyContactName !== undefined) data.emergency_contact_name = input.emergencyContactName || null
    if (input.emergencyContactPhone !== undefined) data.emergency_contact_phone = input.emergencyContactPhone || null
    if (input.bloodType !== undefined) data.blood_type = input.bloodType || null
    if (input.medicalNotes !== undefined) data.medical_notes = input.medicalNotes || null

    return data
  }
}
