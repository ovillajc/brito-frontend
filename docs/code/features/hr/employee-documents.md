# HR: documentos de empleados

## Propósito

Agregar soporte real para expediente digital de empleados en HR, permitiendo capturar nombre de documento, subir archivo a Cloudflare R2 y persistir la referencia en la base de datos.

## Relaciones

- `EmployeeWizard` permite agregar, editar y eliminar filas de documentos antes de guardar el empleado.
- `FileUploadButton` se reutiliza para subir archivos a R2 y devolver la URL pública.
- `SupabaseEmployeeRepository` persiste los documentos en `public.documents` usando `employee_id`.
- `EmployeeDetailsDialog` consume `employee.documents` y presenta los archivos reales del expediente.

## Arquitectura

- `domain`
  - `EmployeeEntity` ahora incluye `documents`.
  - `createEmployeeSchema` y `updateEmployeeSchema` aceptan arreglo de documentos.
- `infrastructure`
  - `EmployeeMapper` transforma `documents(*)` desde Supabase y genera payloads para persistencia.
  - `SupabaseEmployeeRepository` lee y escribe en `public.documents`.
- `presentation`
  - `EmployeeWizard` administra los documentos con `useFieldArray`.
  - `EmployeeDetailsDialog` reemplaza datos mock por documentos reales.

## Persistencia

Los documentos no se guardan en `employees`; se usan registros en `public.documents` con:

- `employee_id`
- `document_name`
- `file_url`
- `expiration_date` en `null`
- `expiration_alert` en `true`

En actualización se elimina primero el set actual de documentos del empleado y luego se inserta el nuevo estado enviado por el formulario.

## Mantenimiento

- Si después se requiere vencimiento por documento, el modelo actual ya permite extender la UI para capturar `expiration_date`.
- Si se implementa limpieza física de archivos en R2 al reemplazar/eliminar documentos, esa lógica debe centralizarse en acciones o repositorios para no duplicarse en la UI.

