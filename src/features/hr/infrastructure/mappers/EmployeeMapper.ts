import { EmployeeDocumentEntity, EmployeeEntity } from '../../domain/entities'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/schemas/employee.schema'

export class EmployeeMapper {
  static toDocumentDomain(raw: Record<string, unknown>): EmployeeDocumentEntity {
    return {
      id: raw.id as string,
      employeeId: raw.employee_id as string,
      documentName: (raw.document_name as string | null) ?? 'Documento',
      fileUrl: raw.file_url as string,
      expirationDate: raw.expiration_date ? new Date(raw.expiration_date as string) : null,
      expirationAlert: (raw.expiration_alert as boolean | null) ?? true,
      createdAt: raw.created_at ? new Date(raw.created_at as string) : new Date(),
    }
  }

  /**
   * Mapea un payload nativo de Supabase a la entidad de dominio.
   */
  static toDomain(raw: Record<string, unknown>): EmployeeEntity {
    const departments = raw.departments as { name?: string } | null
    
    // Handle array or object from Supabase (typically array from 1:1 if not configured properly, but usually array of 1 or object)
    let driverDetails: Record<string, unknown> | null = null
    if (Array.isArray(raw.driver_details) && raw.driver_details.length > 0) {
      driverDetails = raw.driver_details[0] as Record<string, unknown>
    } else if (raw.driver_details && !Array.isArray(raw.driver_details)) {
      driverDetails = raw.driver_details as Record<string, unknown>
    }

    const rawDocuments = Array.isArray(raw.documents)
      ? raw.documents as Record<string, unknown>[]
      : []

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

      // Driver details
      licenseNumber: driverDetails?.license_number as string | null,
      licenseType: driverDetails?.license_type as string | null,
      licenseExpiration: driverDetails?.license_expiration ? new Date(driverDetails.license_expiration as string) : null,
      opaloId: driverDetails?.opalo_id as string | null,
      opaloExpiration: driverDetails?.opalo_expiration ? new Date(driverDetails.opalo_expiration as string) : null,
      rcontrolId: driverDetails?.rcontrol_id as string | null,
      rcontrolExpiration: driverDetails?.rcontrol_expiration ? new Date(driverDetails.rcontrol_expiration as string) : null,
      fasttrackId: driverDetails?.fasttrack_id as string | null,
      fasttrackExpiration: driverDetails?.fasttrack_expiration ? new Date(driverDetails.fasttrack_expiration as string) : null,
      documents: rawDocuments.map(EmployeeMapper.toDocumentDomain),

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
   * Mapea credenciales de operador para la tabla driver_details
   */
  static toPersistDriverDetails(input: CreateEmployeeInput | UpdateEmployeeInput, employeeId: string) {
    if (!input.isOperator) return null

    return {
      employee_id: employeeId,
      license_number: input.licenseNumber || null,
      license_type: input.licenseType || null,
      license_expiration: input.licenseExpiration || null,
      opalo_id: input.opaloId || null,
      opalo_expiration: input.opaloExpiration || null,
      rcontrol_id: input.rcontrolId || null,
      rcontrol_expiration: input.rcontrolExpiration || null,
      fasttrack_id: input.fasttrackId || null,
      fasttrack_expiration: input.fasttrackExpiration || null,
      updated_at: new Date().toISOString()
    }
  }

  static toPersistDocuments(input: CreateEmployeeInput | UpdateEmployeeInput, employeeId: string) {
    return (input.documents ?? [])
      .filter((doc) => !!doc.documentName?.trim() && !!doc.fileUrl)
      .map((doc) => ({
        ...(doc.id ? { id: doc.id } : {}),
        employee_id: employeeId,
        document_name: doc.documentName,
        file_url: doc.fileUrl!,
        expiration_date: null,
        expiration_alert: true,
      }))
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
