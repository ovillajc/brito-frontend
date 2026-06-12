import { createClient } from '@/src/core/lib/supabase/server'
import { Either, Failure } from '@/src/core/domain/either'
import { EmployeeEntity } from '../../domain/entities'
import { CreateEmployeeInput, UpdateEmployeeInput } from '../../domain/schemas/employee.schema'
import { IEmployeeRepository } from '../../domain/repositories/IEmployeeRepository'
import { EmployeeMapper } from '../mappers/EmployeeMapper'
import { deleteR2ObjectByPublicUrl } from '@/src/core/infrastructure/storage/r2-client'

export class SupabaseEmployeeRepository implements IEmployeeRepository {
  async findAll(): Promise<Either<Failure, EmployeeEntity[]>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(name), driver_details(*), documents(*)')
        .order('created_at', { ascending: false })

      if (error) {
        return {
          ok: false,
          error: { code: 'FETCH_ERROR', message: error.message },
        }
      }

      return {
        ok: true,
        data: data.map(EmployeeMapper.toDomain),
      }
    } catch {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al obtener empleados' },
      }
    }
  }

  async findById(id: string): Promise<Either<Failure, EmployeeEntity>> {
    try {
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('employees')
        .select('*, departments(name), driver_details(*), documents(*)')
        .eq('id', id)
        .single()

      if (error) {
        return {
          ok: false,
          error: { code: 'FETCH_ERROR', message: error.message },
        }
      }

      return {
        ok: true,
        data: EmployeeMapper.toDomain(data),
      }
    } catch {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al obtener el empleado' },
      }
    }
  }

  async create(data: CreateEmployeeInput): Promise<Either<Failure, EmployeeEntity>> {
    try {
      const supabase = await createClient()
      const persistData = EmployeeMapper.toPersistCreate(data)
      
      const { data: created, error } = await supabase
        .from('employees')
        .insert(persistData)
        .select('*, departments(name)')
        .single()

      if (error) {
        return {
          ok: false,
          error: { code: 'CREATE_ERROR', message: error.message },
        }
      }

      // If it's an operator, save driver details
      if (data.isOperator) {
        const driverDetails = EmployeeMapper.toPersistDriverDetails(data, created.id)
        if (driverDetails) {
          const { error: ddError } = await supabase
            .from('driver_details')
            .upsert(driverDetails)
          
          if (ddError) console.error('Error saving driver_details:', ddError.message)
        }
      }

      const documents = EmployeeMapper.toPersistDocuments(data, created.id)
      if (documents.length > 0) {
        const { error: docsError } = await supabase
          .from('documents')
          .insert(documents)

        if (docsError) {
          return {
            ok: false,
            error: { code: 'CREATE_DOCUMENTS_ERROR', message: docsError.message },
          }
        }
      }

      // Refetch with driver details
      const { data: finalCreated } = await supabase
        .from('employees')
        .select('*, departments(name), driver_details(*), documents(*)')
        .eq('id', created.id)
        .single()

      return {
        ok: true,
        data: EmployeeMapper.toDomain(finalCreated || created),
      }
    } catch {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al crear el empleado' },
      }
    }
  }

  async update(data: UpdateEmployeeInput): Promise<Either<Failure, EmployeeEntity>> {
    try {
      const supabase = await createClient()
      const { id, ...rest } = data
      const persistData = EmployeeMapper.toPersistUpdate(rest)
      const { data: previousDocuments, error: previousDocumentsError } = await supabase
        .from('documents')
        .select('id, file_url')
        .eq('employee_id', id)

      if (previousDocumentsError) {
        return {
          ok: false,
          error: { code: 'FETCH_DOCUMENTS_ERROR', message: previousDocumentsError.message },
        }
      }
      
      const { data: updated, error } = await supabase
        .from('employees')
        .update(persistData)
        .eq('id', id)
        .select('*, departments(name)')
        .single()

      if (error) {
        return {
          ok: false,
          error: { code: 'UPDATE_ERROR', message: error.message },
        }
      }

      // If it's an operator, save driver details
      if (data.isOperator) {
        const driverDetails = EmployeeMapper.toPersistDriverDetails(data, id)
        if (driverDetails) {
          const { error: ddError } = await supabase
            .from('driver_details')
            .upsert(driverDetails, { onConflict: 'employee_id' })
          
          if (ddError) console.error('Error updating driver_details:', ddError.message)
        }
      } else {
        // Si ya no es operador, eliminamos los detalles por seguridad/limpieza
        await supabase.from('driver_details').delete().eq('employee_id', id)
      }

      const previousDocumentRows = (previousDocuments ?? []) as Array<{ id: string; file_url: string }>
      const nextDocuments = EmployeeMapper.toPersistDocuments(data, id)
      const nextDocumentsWithId = nextDocuments.filter((doc): doc is typeof doc & { id: string } => 'id' in doc && typeof doc.id === 'string')
      const nextDocumentsWithoutId = nextDocuments.filter((doc) => !('id' in doc))
      const nextDocumentIds = new Set(nextDocumentsWithId.map((doc) => doc.id))
      const documentsToDelete = previousDocumentRows.filter((doc) => !nextDocumentIds.has(doc.id))

      if (documentsToDelete.length > 0) {
        const { error: deleteDocsError } = await supabase
          .from('documents')
          .delete()
          .in('id', documentsToDelete.map((doc) => doc.id))

        if (deleteDocsError) {
          return {
            ok: false,
            error: { code: 'DELETE_DOCUMENTS_ERROR', message: deleteDocsError.message },
          }
        }
      }

      if (nextDocumentsWithId.length > 0) {
        const { error: upsertDocsError } = await supabase
          .from('documents')
          .upsert(nextDocumentsWithId, { onConflict: 'id' })

        if (upsertDocsError) {
          return {
            ok: false,
            error: { code: 'UPDATE_DOCUMENTS_ERROR', message: upsertDocsError.message },
          }
        }
      }

      if (nextDocumentsWithoutId.length > 0) {
        const { error: insertDocsError } = await supabase
          .from('documents')
          .insert(nextDocumentsWithoutId)

        if (insertDocsError) {
          return {
            ok: false,
            error: { code: 'UPDATE_DOCUMENTS_ERROR', message: insertDocsError.message },
          }
        }
      }

      const previousUrlById = new Map(previousDocumentRows.map((doc) => [doc.id, doc.file_url]))
      const removedUrls = documentsToDelete.map((doc) => doc.file_url)
      const replacedUrls = nextDocumentsWithId
        .map((doc) => {
          const previousUrl = previousUrlById.get(doc.id)
          return previousUrl && previousUrl !== doc.file_url ? previousUrl : null
        })
        .filter((url): url is string => typeof url === 'string')
      const urlsToDelete = Array.from(new Set([...removedUrls, ...replacedUrls]))

      if (urlsToDelete.length > 0) {
        await Promise.all(urlsToDelete.map((url) => deleteR2ObjectByPublicUrl(url)))
      }

      // Refetch with driver details
      const { data: finalUpdated } = await supabase
        .from('employees')
        .select('*, departments(name), driver_details(*), documents(*)')
        .eq('id', id)
        .single()

      return {
        ok: true,
        data: EmployeeMapper.toDomain(finalUpdated || updated),
      }
    } catch {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al actualizar el empleado' },
      }
    }
  }

  async delete(id: string): Promise<Either<Failure, void>> {
    try {
      const supabase = await createClient()
      const { data: documents } = await supabase
        .from('documents')
        .select('file_url')
        .eq('employee_id', id)

      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id)

      if (error) {
        return {
          ok: false,
          error: { code: 'DELETE_ERROR', message: error.message },
        }
      }

      const documentUrls = ((documents ?? []) as Array<{ file_url: string | null }>)
        .map((doc) => doc.file_url)
        .filter((url): url is string => typeof url === 'string' && url.length > 0)

      if (documentUrls.length > 0) {
        await Promise.all(documentUrls.map((url) => deleteR2ObjectByPublicUrl(url)))
      }

      return { ok: true, data: undefined }
    } catch {
      return {
        ok: false,
        error: { code: 'UNEXPECTED_ERROR', message: 'Error inesperado al eliminar el empleado' },
      }
    }
  }
}
